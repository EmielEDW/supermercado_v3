import { createHmac } from 'node:crypto';
import { createSession, isAuthenticated, isSameOrigin, sessionCookie, verifyPassword } from './auth.mjs';
import { consumeAttempt } from './rate-limit.mjs';
import { MAX_PDF_BYTES, validatePdf } from './pdf.mjs';

const json = (body, status = 200, headers = {}) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
const errorResponse = () => json({ error: 'Tijdelijk niet beschikbaar. Probeer het straks opnieuw.' }, 503);

async function readLimited(request, max) {
  if (Number(request.headers.get('content-length')) > max) throw new Error('too large');
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks = []; let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > max) { await reader.cancel(); throw new Error('too large'); }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export function createHandlers(store, env) {
  const configured = () => Boolean(env.MENU_PASSWORD_HASH && env.MENU_SESSION_SECRET);
  return {
    async session(request) {
      if (!['GET', 'POST', 'DELETE'].includes(request.method)) return json({ error: 'Methode niet toegestaan.' }, 405, { Allow: 'GET, POST, DELETE' });
      if (!configured()) return errorResponse();
      if (request.method === 'GET') return json({ authenticated: isAuthenticated(request, env.MENU_SESSION_SECRET) });
      if (!isSameOrigin(request)) return json({ error: 'Ongeldige aanvraag.' }, 403);
      if (request.method === 'DELETE') return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', 0) });
      try {
        if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Ongeldige aanvraag.' }, 400);
        let data;
        try { data = JSON.parse((await readLimited(request, 2048)).toString()); } catch { return json({ error: 'Ongeldige aanvraag.' }, 400); }
        // Vercel overwrites this trusted proxy header; never trust a client-supplied X-Forwarded-For.
        const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() || 'unknown';
        const key = createHmac('sha256', env.MENU_SESSION_SECRET).update(ip).digest('hex');
        if (!await consumeAttempt(store, key)) return json({ error: 'Te veel inlogpogingen. Wacht 15 minuten en probeer opnieuw.' }, 429, { 'Retry-After': '900' });
        if (!await verifyPassword(data?.password, env.MENU_PASSWORD_HASH)) return json({ error: 'De toegangscode klopt niet.' }, 401);
        return json({ authenticated: true }, 200, { 'Set-Cookie': sessionCookie(createSession(env.MENU_SESSION_SECRET)) });
      } catch { return errorResponse(); }
    },

    async menu(request) {
      if (request.method === 'GET' || request.method === 'HEAD') {
        try {
          const menu = await store.getMenu();
          if (!menu) return new Response(null, { status: 307, headers: { Location: '/menu-placeholder.pdf', 'Cache-Control': 'no-store' } });
          const download = new URL(request.url).searchParams.has('download');
          return new Response(request.method === 'HEAD' ? null : menu.stream, { headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="supermercado-menu.pdf"`,
            'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
            'Content-Security-Policy': "sandbox; frame-ancestors 'self'",
            'Last-Modified': new Date(menu.uploadedAt).toUTCString(),
          } });
        } catch { return errorResponse(); }
      }
      if (request.method !== 'PUT') return json({ error: 'Methode niet toegestaan.' }, 405, { Allow: 'GET, HEAD, PUT' });
      if (!configured()) return errorResponse();
      if (!isAuthenticated(request, env.MENU_SESSION_SECRET)) return json({ error: 'Je sessie is verlopen. Log opnieuw in.' }, 401);
      if (!isSameOrigin(request)) return json({ error: 'Ongeldige aanvraag.' }, 403);
      let bytes;
      try { bytes = await readLimited(request, MAX_PDF_BYTES); } catch { return json({ error: 'Kies een pdf van maximaal 4 MB.' }, 413); }
      try { await validatePdf(bytes, request.headers.get('content-type')); } catch (error) { return json({ error: error.message }, 400); }
      try {
        await store.putMenu(bytes);
        return json({ ok: true, updatedAt: new Date().toISOString() });
      } catch { return errorResponse(); }
    },
  };
}
