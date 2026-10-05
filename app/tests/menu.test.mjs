import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import { hashPassword, verifyPassword, createSession, verifySession, isSameOrigin } from '../server/auth.mjs';
import { validatePdf, MAX_PDF_BYTES } from '../server/pdf.mjs';
import { consumeAttempt } from '../server/rate-limit.mjs';

test('password verification rejects incorrect codes and malformed hashes', async () => {
  const hash = await hashPassword('test-only-password');
  assert.equal(await verifyPassword('test-only-password', hash), true);
  assert.equal(await verifyPassword('wrong', hash), false);
  assert.equal(await verifyPassword('anything', ''), false);
});

test('sessions reject tampering, expiry and a different signing key', () => {
  const token = createSession('test-secret', 1000);
  assert.equal(verifySession(token, 'test-secret', 1001), true);
  assert.equal(verifySession(token + 'x', 'test-secret', 1001), false);
  assert.equal(verifySession(token, 'other-secret', 1001), false);
  assert.equal(verifySession(token, 'test-secret', 1000 + 8 * 60 * 60), false);
  assert.equal(verifySession('', 'test-secret'), false);
});

test('only same-origin browser writes are accepted', () => {
  assert.equal(isSameOrigin(new Request('https://www.superrrmercado.be/api/session', { headers: { origin: 'https://www.superrrmercado.be' } })), true);
  assert.equal(isSameOrigin(new Request('https://www.superrrmercado.be/api/session', { headers: { origin: 'https://evil.example' } })), false);
  assert.equal(isSameOrigin(new Request('https://www.superrrmercado.be/api/session')), false);
});

test('PDF validation accepts blank pages but rejects fake, truncated, empty and oversized data', async () => {
  const doc = await PDFDocument.create(); doc.addPage();
  await validatePdf(Buffer.from(await doc.save()), 'application/pdf');
  await assert.rejects(validatePdf(Buffer.from('<html>fake</html>'), 'application/pdf'));
  await assert.rejects(validatePdf(Buffer.from('%PDF-1.7\nbroken'), 'application/pdf'));
  await assert.rejects(validatePdf(Buffer.alloc(0), 'application/pdf'));
  await assert.rejects(validatePdf(Buffer.alloc(MAX_PDF_BYTES + 1), 'application/pdf'));
  await assert.rejects(validatePdf(Buffer.from(await doc.save()), 'text/html'));
});

test('encrypted PDF is rejected before replacing the public menu', async () => {
  const bytes = await readFile(new URL('./fixtures/encrypted.pdf', import.meta.url));
  await assert.rejects(validatePdf(bytes, 'application/pdf'), /zonder wachtwoord/);
});

function memoryStore() {
  const values = new Map(); let version = 0;
  return {
    async read(key) { const v = values.get(key); return v ? structuredClone(v) : null; },
    async write(key, value, etag) {
      if (values.get(key)?.etag !== etag) { const e = new Error('conflict'); e.conflict = true; throw e; }
      values.set(key, { value, etag: String(++version) });
    },
  };
}

test('durable throttling caps concurrent attempts and resets after the window', async () => {
  const store = memoryStore();
  const results = await Promise.all(Array.from({length: 15}, () => consumeAttempt(store, 'ip-hash', 1000)));
  assert.equal(results.filter(Boolean).length, 5);
  assert.equal(await consumeAttempt(store, 'ip-hash', 1001), false);
  assert.equal(await consumeAttempt(store, 'ip-hash', 1000 + 15 * 60), true);
});

test('rate limiter fails closed on storage outage', async () => {
  await assert.rejects(consumeAttempt({ read: async () => { throw new Error('offline'); } }, 'ip', 1000));
});
