/**
 * Cloudflare Worker — Verifind Domain Proxy
 *
 * Routes all traffic from getverifind.com → verfind-production.onrender.com
 *
 * DEPLOY STEPS (same pattern as zitopy.com):
 *
 * 1 — DNS Records (Cloudflare → getverifind.com → DNS → Records)
 *   Delete any AAAA records first, then add:
 *   Type: CNAME | Name: @   | Target: verfind-production.onrender.com | Proxy: ON (orange)
 *   Type: CNAME | Name: www | Target: verfind-production.onrender.com | Proxy: ON (orange)
 *
 * 2 — Create the Worker
 *   Left sidebar → Workers & Pages → Create → Create Worker
 *   Name it: verifind-proxy → Deploy → Edit code
 *   Delete existing code, paste this file, Deploy
 *
 * 3 — Attach Worker to domain
 *   Worker page → Settings → Domains & Routes → Add → Route
 *   Route: getverifind.com/*     | Zone: getverifind.com → Save
 *   Route: www.getverifind.com/* | Zone: getverifind.com → Save
 *
 * 4 — Update Render env vars
 *   ALLOWED_ORIGINS=https://getverifind.com,https://www.getverifind.com,https://verfind-production.onrender.com
 *   FRONTEND_URL=https://getverifind.com
 */

// ─── ORIGIN ───────────────────────────────────────────────────────────────
// The backend host this Worker forwards traffic to.
// RAILWAY CUTOVER (Phase 4): change this to the Railway public domain, e.g.
//   'verfind-production.up.railway.app'
// then re-deploy the Worker. That's the only line that changes.
const ORIGIN_HOST = 'verfind-production.onrender.com';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = ORIGIN_HOST;

    const newRequest = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
      redirect: 'follow',
    });

    return fetch(newRequest);
  },
};
