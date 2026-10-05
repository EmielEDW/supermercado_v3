# Menukaart beheren

1. Ga naar https://www.superrrmercado.be/admin.
2. Log in met de afgesproken toegangscode.
3. Kies een pdf van maximaal 4 MB, zonder wachtwoord.
4. Klik op **Menukaart publiceren** en wacht op de groene bevestiging.
5. Klik op **Bekijk het menu** om de gepubliceerde versie te controleren.
6. Log uit wanneer je klaar bent.

Het nieuwe bestand vervangt de huidige menukaart. Bewaar zelf een kopie van eerdere menukaarten. Bezoekers vinden de pdf via MENU. De eerste versie is een lege A4-pagina.

## Technisch beheer

Vercel project: `supermercado-v3`, root directory `app`, Vite build, output `dist`.
Private Blob store contains `menu/current.pdf` and hashed-IP login counters in `auth/`.
Required server environment variables: `MENU_PASSWORD_HASH` (salted scrypt hash), `MENU_SESSION_SECRET` (random 48-byte hex secret), and the Blob variables created by connecting the store.
Never prefix these secrets with `VITE_` or commit environment files. Generate password hashes with `hashPassword` from `server/auth.mjs`; set values through Vercel environment settings and redeploy. Rotating the session secret invalidates existing sessions.

Authentication uses eight-hour HttpOnly/Secure/SameSite cookies. Login is limited to five attempts per trusted proxy IP in fifteen minutes, using Blob conditional writes. State-changing requests require a matching Origin header. PDF upload validates type, size and parseability before overwriting storage. Reads bypass Blob caches so successful uploads are visible immediately. The admin route is excluded from indexing and is intentionally absent from public navigation.

Run `npm test`, `npm run build`, and focused ESLint checks before deploying. `vercel dev` provides local API emulation; use HTTPS to exercise the production Secure cookie. A Vite-only development server does not serve the API.
