import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
export const SESSION_SECONDS = 8 * 60 * 60;
export const COOKIE_NAME = '__Host-menu-session';
const equal = (a, b) => a.length === b.length && timingSafeEqual(a, b);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || password.length > 256 || !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(stored ?? '')) return false;
  const [salt, hash] = stored.split(':');
  return equal(await scrypt(password, salt, 64), Buffer.from(hash, 'hex'));
}

export function createSession(secret, now = Math.floor(Date.now() / 1000)) {
  const payload = Buffer.from(JSON.stringify({ exp: now + SESSION_SECONDS, nonce: randomBytes(16).toString('hex') })).toString('base64url');
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}

export function verifySession(token, secret, now = Math.floor(Date.now() / 1000)) {
  if (!token || !secret) return false;
  try {
    const [payload, signature, extra] = token.split('.');
    if (extra !== undefined || !payload || !signature) return false;
    const expected = createHmac('sha256', secret).update(payload).digest('base64url');
    if (!equal(Buffer.from(signature), Buffer.from(expected))) return false;
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return Number.isInteger(exp) && exp > now && exp <= now + SESSION_SECONDS;
  } catch { return false; }
}

export function isAuthenticated(request, secret) {
  const token = (request.headers.get('cookie') ?? '').split(';').map(s => s.trim()).find(s => s.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  return verifySession(token, secret);
}

export function sessionCookie(value, maxAge = SESSION_SECONDS) {
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export function isSameOrigin(request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}
