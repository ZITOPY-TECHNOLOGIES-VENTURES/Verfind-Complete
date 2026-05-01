/**
 * Cloudflare Worker — Verifind Domain Proxy
 *
 * Routes all traffic from getverifind.com → verfind-production.onrender.com
 *
 * DEPLOY STEPS:
 * 1. Cloudflare Dashboard → Workers & Pages → Create Worker
 * 2. Paste this file, save & deploy
 * 3. Go to Workers → your worker → Settings → Triggers → Add Custom Domain
 *    Add: getverifind.com  and  www.getverifind.com
 *
 * DNS RECORDS to add in Cloudflare (Dashboard → DNS):
 *   Type   Name   Target                               Proxy
 *   CNAME  @      verfind-production.onrender.com      Proxied (orange cloud)
 *   CNAME  www    verfind-production.onrender.com      Proxied (orange cloud)
 *
 * RENDER ENV VARS to update after domain is live:
 *   ALLOWED_ORIGINS=https://getverifind.com,https://www.getverifind.com,https://verfind-production.onrender.com
 *   FRONTEND_URL=https://getverifind.com
 */

const RENDER_ORIGIN = 'https://verfind-production.onrender.com';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Build the target URL on Render — keep path + query string unchanged
    const targetURL = new URL(url.pathname + url.search, RENDER_ORIGIN);

    // Forward all headers, tell Render the real host the visitor used
    const headers = new Headers(request.headers);
    headers.set('X-Forwarded-Host', url.hostname);
    headers.set('X-Forwarded-Proto', 'https');
    const clientIP = request.headers.get('CF-Connecting-IP');
    if (clientIP) headers.set('X-Real-IP', clientIP);

    const init = {
      method: request.method,
      headers,
      redirect: 'follow',
    };

    // Only attach a body for methods that support one
    if (!['GET', 'HEAD'].includes(request.method)) {
      init.body = request.body;
    }

    const response = await fetch(targetURL.toString(), init);

    // Pass the response straight through — Cloudflare adds TLS/CDN automatically
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  },
};
