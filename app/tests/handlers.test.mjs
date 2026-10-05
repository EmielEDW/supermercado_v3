import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { hashPassword } from '../server/auth.mjs';
import { createHandlers } from '../server/handlers.mjs';

const origin = 'https://www.superrrmercado.be';
const env = { MENU_PASSWORD_HASH: await hashPassword('test-password'), MENU_SESSION_SECRET: 'test-secret' };
async function setup() {
  const doc = await PDFDocument.create(); doc.addPage();
  const pdf = Buffer.from(await doc.save());
  let current = pdf;
  const rates = new Map();
  const store = {
    async read(key) { return rates.get(key) ?? null; },
    async write(key, value) { rates.set(key, { value, etag: '1' }); },
    async getMenu() { return { stream: current, uploadedAt: new Date() }; },
    async putMenu(bytes) { current = bytes; },
  };
  const handlers = createHandlers(store, env);
  const login = await handlers.session(new Request(origin + '/api/session', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'test-password' }) }));
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  return { handlers, store, pdf, cookie, login };
}

test('login issues HttpOnly secure session; invalid code rejected; logout clears cookie', async () => {
  const {handlers, cookie, login} = await setup();
  assert.match(login.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Strict/);
  const session = await handlers.session(new Request(origin + '/api/session', {headers: {cookie}}));
  assert.equal((await session.json()).authenticated, true);
  const invalid = await handlers.session(new Request(origin + '/api/session', {method:'POST',headers: { origin, 'Content-Type': 'application/json' },body: JSON.stringify({password:'wrong'})}));
  assert.equal(invalid.status, 401);
  const logout = await handlers.session(new Request(origin + '/api/session', {method:'DELETE',headers:{origin,cookie}}));
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
});

test('unauthenticated and cross-site uploads cannot replace the menu', async () => {
  const {handlers, cookie, pdf} = await setup();
  for (const [headers, status] of [[{origin},401],[{origin:'https://evil.example',cookie},403]]) {
    const response = await handlers.menu(new Request(origin + '/api/menu',{method:'PUT',headers:{...headers,'Content-Type':'application/pdf'},body:pdf}));
    assert.equal(response.status,status);
  }
  const result = await handlers.menu(new Request(origin + '/api/menu'));
  assert.deepEqual(Buffer.from(await result.arrayBuffer()),pdf);
});

test('valid upload is immediately retrieved; invalid upload preserves it; download is attachment', async () => {
  const {handlers,cookie} = await setup();
  const doc = await PDFDocument.create(); doc.addPage(); doc.addPage();
  const next = Buffer.from(await doc.save());
  const upload = body => handlers.menu(new Request(origin + '/api/menu',{method:'PUT',headers:{origin,cookie,'Content-Type':'application/pdf'},body}));
  assert.equal((await upload(next)).status,200);
  assert.equal((await upload(Buffer.from('fake'))).status,400);
  const result = await handlers.menu(new Request(origin + '/api/menu?download=1'));
  assert.match(result.headers.get('content-disposition'),/attachment/);
  assert.equal(result.headers.get('cache-control'),'no-store');
  assert.deepEqual(Buffer.from(await result.arrayBuffer()),next);
});

test('storage failure is not reported as successful upload or blank menu', async () => {
  const {handlers,store,cookie,pdf} = await setup();
  store.putMenu = async () => {throw new Error('outage');};
  const result = await handlers.menu(new Request(origin + '/api/menu',{method:'PUT',headers:{origin,cookie,'Content-Type':'application/pdf'},body:pdf}));
  assert.equal(result.status,503);
  store.getMenu = async () => {throw new Error('outage');};
  assert.equal((await handlers.menu(new Request(origin + '/api/menu'))).status,503);
});

test('missing menu serves placeholder; oversized upload is rejected; absent config fails closed', async () => {
  const {handlers,store,cookie} = await setup();
  store.getMenu = async () => null;
  const response = await handlers.menu(new Request(origin + '/api/menu'));
  assert.equal(response.headers.get('location'),'/menu-placeholder.pdf');
  const oversized = await handlers.menu(new Request(origin + '/api/menu',{method:'PUT',headers:{origin,cookie,'Content-Type':'application/pdf','Content-Length':'4000001'},body:'x'}));
  assert.equal(oversized.status,413);
  assert.equal((await createHandlers(store,{}).session(new Request(origin + '/api/session'))).status,503);
});
