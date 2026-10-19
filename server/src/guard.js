// Basic protection for every request: browser security headers, and limits on how often one visitor can hit
// the expensive or abusable endpoints (signups, uploads, M-Pesa prompts, sign-ins). Limits are counted per
// IP in this process; behind a load balancer with several servers, move the counters to Redis (see README).
import { PLATFORM_DOMAIN } from './site.js';

/** Security headers. Pages may only be framed by the platform itself (the owner's preview step). */
export function securityHeaders(req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Content-Security-Policy': `frame-ancestors 'self' https://${PLATFORM_DOMAIN} https://*.${PLATFORM_DOMAIN} http://localhost:* http://*.localhost:*`,
  });
  if (req.secure) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

const buckets = new Map();
// Forget old counters now and then so memory stays flat.
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
}, 60_000).unref();

/** At most `max` requests per `minutes` from one IP for this route group; then 429 with a plain message. */
export function limit(name, max, minutes, message = 'Too many tries. Please wait a few minutes and try again.') {
  return (req, res, next) => {
    const key = `${name}:${req.ip}`;
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || b.reset < now) buckets.set(key, (b = { n: 0, reset: now + minutes * 60_000 }));
    if (++b.n > max) {
      res.set('Retry-After', String(Math.ceil((b.reset - now) / 1000)));
      return res.status(429).json({ error: message });
    }
    next();
  };
}
