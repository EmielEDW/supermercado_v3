# Menu and owner upload implementation plan

Goal: add MENU to the existing navigation, display a PDF, and let the owner replace it after signing in at /admin. Publish on the existing Vercel project.

Architecture: keep React/Vite and the current visual style. Add Vercel Node functions for authentication and PDF retrieval/upload. Use a private Vercel Blob store for the current PDF and durable login throttling. Use a server-only salted password hash and a signed, secure, HttpOnly session cookie. Initially serve a blank one-page PDF.

Authorization: user explicitly requested a plan followed by full implementation and production publication. Proceed inline without an additional design approval round. Work on feat/menu-admin in the existing checkout; preserve existing unrelated dist/image changes.

## Tasks
- [x] Backend: write failing Node tests for password/session validation, expiry/tampering, same-origin writes, upload authentication, malformed/oversized/encrypted PDFs, durable throttling and storage failure. Implement server modules and functions. Run tests.
- [x] UI: Navigation.tsx adds MENU; main.tsx routes /menu and /admin independently of homepage scroll handlers. MenuPage displays PDF with open/download fallback. AdminPage supports login, existing menu, upload status, retry and logout. Add responsive shared styling.
- [x] Artifact/config: create blank A4 PDF using PDF tooling, render and verify. Add Vercel route rewrites and security headers. Add setup and owner instructions, without secrets.
- [x] Verify: production build, focused lint, full tests; desktop/mobile browser inspection; independent final code review. Repair failures.
- [x] Deploy: restore Vercel authentication, identify exact existing project, create/connect private Blob storage, configure server secrets, deploy. Check live menu, admin login, upload/replace, unauthorized access and unchanged homepage on the real domain.

## Review focus
- A renamed HTML file is rejected; the existing menu survives.
- Concurrent login requests cannot bypass the durable attempt counter.
- Refreshing /admin or /menu works, including trailing slashes.
- Mobile PDF viewing has a direct open/download alternative.
- Storage/config failures are visible rather than reported as successful publication.

## Progress
- Initial inspection: React 19/Vite 7; Vercel confirmed by live response headers. Repository HEAD matches origin. Existing node_modules incomplete; restoring dependencies. Vercel CLI credentials expired; user sign-in requested while implementation continues.

- Completed: 12 Node tests, focused frontend ESLint, production build and independent review. Production dependency audit: zero known vulnerabilities.
- Live verified: correct-code login, browser file chooser/upload/success, logout, unauthenticated PUT rejected, /admin noindex, PDF bytes equal blank source, download disposition. Real Blob concurrent limit: five allowed and three blocked; generic Blob conditional-conflict response now retried.
- PDF.js renderer added after native PDF rendering was unavailable in the test browser. Verified blank PDF and a local-only two-page text fixture at desktop and 375px mobile widths. Fonts/CMaps/WASM copied during prebuild; worker and viewer lazy-loaded.
- Production project remains supermercado-v3 with existing domain www.superrrmercado.be. Secrets configured only in server environment; no plaintext password committed.
- User explicitly approved synchronizing the tested changes to GitHub main in the follow-up. Push only committed feature changes; preserve pre-existing uncommitted dist image changes.

