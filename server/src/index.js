// One server for the platform and every shop on it. The host name decides what a request is for:
//   shop.ke (or localhost)              → the platform: landing page, signup, M-Pesa billing
//   <link>.shop.ke (or <link>.localhost) → that shop: storefront, admin, its own database and uploads
import express from 'express';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PORT } from './config.js';
import { adminRouter } from './routes/admin.js';
import { publicPosts } from './routes/posts.js';
import { publicRouter } from './routes/public.js';
import { platformRouter } from './platform/routes.js';
import { clientBrand } from './platform/presets.js';
import { getShop, isPreview, requestHost, resolveHost, shopState } from './platform/shops.js';
import { PLATFORM_DOMAIN, PLATFORM_NAME, PLATFORM_TAGLINE } from './site.js';
import { runAs } from './tenant.js';
import { limit, securityHeaders } from './guard.js';
import { scheduleBackups } from './backups.js';

const app = express();
app.disable('x-powered-by');
// Behind a proxy (Vercel, Railway, a load balancer), take the visitor's IP, host and https from X-Forwarded-*.
if (process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT_NAME || process.env.TRUST_PROXY) app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(express.json({ limit: '100kb' }));

// Limits on the endpoints worth abusing (per visitor IP).
app.use('/api/platform/signup', limit('signup', 10, 60, 'Too many signups from this connection. Try again in an hour.'));
app.use('/api/platform/check-link', limit('check', 120, 10));
// Only real submissions count (a browser's CORS preflight is an OPTIONS request before each one).
app.use('/api/platform/demo', (req, res, next) => (req.method === 'POST' ? limit('demo', 6, 60, 'Too many requests from this connection. WhatsApp us instead.')(req, res, next) : next()));
app.use('/api/platform/careers/apply', (req, res, next) => (req.method === 'POST' ? limit('apply', 6, 60, 'Too many applications from this connection. Email careers@kabuor.com instead.')(req, res, next) : next()));
// The standalone company site (e.g. on Vercel) reads the platform's info, sends demo requests and runs the careers
// page from another address. Only those endpoints answer it; COMPANY_SITE_ORIGINS lists the addresses (comma-separated).
const COMPANY_ORIGINS = (process.env.COMPANY_SITE_ORIGINS || 'https://kabuor-builds.vercel.app').split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean);
app.use(['/api/platform/info', '/api/platform/demo', '/api/platform/careers'], (req, res, next) => {
  const origin = req.get('origin');
  if (origin && (COMPANY_ORIGINS.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin))) {
    res.set({ 'Access-Control-Allow-Origin': origin, Vary: 'Origin', 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' });
    if (req.method === 'OPTIONS') return res.sendStatus(204);
  }
  next();
});
app.use(['/api/platform/upload', '/api/admin/look/upload', '/api/admin/uploads'], limit('upload', 80, 60, 'Too many uploads. Try again in a while.'));
app.use(['/api/platform/pay', '/api/admin/billing/pay', '/api/admin/mpesa-keys/test'], (req, res, next) => (req.method === 'POST' ? limit('prompt', 6, 10, 'Too many M-Pesa prompts. Wait a few minutes before trying again.')(req, res, next) : next()));
app.use(['/api/platform/admin/login', '/api/admin/login'], limit('login', 20, 15));
app.use('/api/orders', (req, res, next) => (req.method === 'POST' ? limit('order', 30, 10)(req, res, next) : next()));

const dist = join(dirname(fileURLToPath(import.meta.url)), '../../client/dist');
// The built page shell, re-read whenever a new build replaces it (its asset names change with each build).
let shell = { mtime: 0, html: null };
function indexHtml() {
  const file = join(dist, 'index.html');
  if (!existsSync(file)) return null;
  const mtime = statSync(file).mtimeMs;
  if (mtime !== shell.mtime) shell = { mtime, html: readFileSync(file, 'utf8') };
  return shell.html;
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// The page shell with the right title, description and colour for whoever is being served (for link previews;
// on Vercel the client service serves the shell and main.jsx sets these after loading).
const page = ({ title, description, color, icon = 'data:,' }) =>
  indexHtml()
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta name="theme-color" content=")[^"]*/, `$1${esc(color)}`)
    .replace(/(<link rel="icon" href=")[^"]*/, `$1${esc(icon)}`);

// For the host's health checks: the server is up.
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ---------- which site is this? ----------
// Until the wildcard domain points here, shops are also reachable on the platform's own address at
// /s/<link>/ (the prefix is stripped, so every route below works unchanged). Requests the page makes from
// there (API calls, pictures) say which shop with an X-Shop header, or failing that their Referer.
const SHOP_PATH = /^\/s\/([a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9]))(?=\/|\?|$)/;
function pathShop(req) {
  const m = req.url.match(SHOP_PATH);
  if (m) {
    req.url = req.url.slice(m[0].length).replace(/^(?=\?|$)/, '/');
    return m[1];
  }
  if (!/^\/(api\/(?!platform\/|health)|uploads\/|admin\.webmanifest)/.test(req.path)) return null;
  const sent = String(req.get('x-shop') ?? '');
  if (SHOP_PATH.test(`/s/${sent}`)) return sent;
  try {
    return new URL(req.get('referer') ?? '').pathname.match(SHOP_PATH)?.[1] ?? null;
  } catch {
    return null;
  }
}

app.use((req, res, next) => {
  let where = resolveHost(requestHost(req));
  let base = '';
  if (where.platform) {
    const slug = pathShop(req);
    if (slug) (where = { slug }), (base = `/s/${slug}`);
  }
  req.site = where.platform ? { platform: true } : { slug: where.slug, shop: getShop(where.slug), base };
  if (req.site.shop) return runAs(req.site.shop, next);
  next();
});

// ---------- the platform ----------
const platformOnly = (router) => (req, res, next) => (req.site.platform ? router(req, res, next) : next());
app.use('/api/platform', platformOnly(platformRouter));

app.get('/api/site', (req, res) => {
  if (req.site.platform) return res.json({ kind: 'platform', name: PLATFORM_NAME, tagline: PLATFORM_TAGLINE, domain: PLATFORM_DOMAIN });
  const { shop, slug } = req.site;
  if (!shop) return res.status(404).json({ kind: 'missing', link: slug, platform: { name: PLATFORM_NAME, domain: PLATFORM_DOMAIN } });
  const state = shopState(shop.record) !== 'live' && isPreview(req, shop.record) ? 'preview' : shopState(shop.record);
  res.json({ kind: 'shop', state, brand: clientBrand(shop.brand), platform: { name: PLATFORM_NAME, domain: PLATFORM_DOMAIN } });
});

// ---------- a shop ----------
const shopOnly = (fn) => (req, res, next) => (req.site.shop ? fn(req, res, next) : next());

// Pictures uploaded by the shop. nosniff stops browsers treating them as anything but images.
// Sent by hand rather than express.static, which Vercel's Express support ignores.
app.get(
  '/uploads/:file',
  shopOnly((req, res, next) => {
    if (!/^[\w.-]+$/.test(req.params.file)) return next();
    res.set({ 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=2592000' });
    res.sendFile(join(req.site.shop.uploadDir, req.params.file), (err) => err && !res.headersSent && res.status(404).end());
  }),
);

app.use('/api/admin', shopOnly(adminRouter));
// Customers can't order while the shop is being set up or its plan has lapsed; the admin keeps working.
app.use(
  '/api',
  shopOnly((req, res, next) => {
    if (shopState(req.site.shop.record) === 'live') return next();
    // The owner's preview: they can look around, but nothing can be ordered until they've paid and gone live.
    if (isPreview(req, req.site.shop.record)) {
      if (req.method === 'GET') return next();
      return res.status(403).json({ error: 'This is a preview. Orders open once the shop is live.', code: 'PREVIEW' });
    }
    return res.status(503).json({ error: 'This shop is not taking orders right now.', code: 'SHOP_CLOSED' });
  }),
);
app.use('/api', shopOnly(publicRouter));
app.use('/api', shopOnly(publicPosts));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// The admin's install manifest, named after the shop.
app.get(
  '/admin.webmanifest',
  shopOnly((req, res) => {
    const b = req.site.shop.brand;
    res.type('application/manifest+json').json({
      name: `${b.content.brand.name} Admin`,
      short_name: `${b.content.brand.short} Admin`,
      description: `Orders, sales and alerts for ${b.content.brand.name}`,
      id: `${req.site.base}/admin`,
      start_url: `${req.site.base}/admin`,
      scope: `${req.site.base}/admin`,
      display: 'standalone',
      background_color: b.colors.cream,
      theme_color: b.colors.espresso,
    });
  }),
);

// ---------- the website (one build for the platform and every shop) ----------
if (existsSync(dist)) {
  app.use(express.static(dist, { index: false, maxAge: '7d' }));
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    const { platform, shop, slug } = req.site;
    if (platform) {
      // Each page of the company site gets its own title and description (link previews on WhatsApp, Google).
      const pages = {
        '/shops': [`Kabuor Shops · Product-first websites that sell`, `Your product, your colours, your prices. Customers pick, pay with M-Pesa, done. ${PLATFORM_TAGLINE}`],
        '/erp': ['Kabuor ERP · Run the whole business from one place', 'Sales, M-Pesa matching, KRA-ready VAT, stock and books, with an assistant you can ask in Kiswahili. Built in Kenya.'],
        '/start': [`Start your shop · ${PLATFORM_NAME}`, 'Design your shop, see it, then pay by M-Pesa and go live.'],
      };
      const [title, description] = pages[req.path.replace(/\/$/, '')] ?? [`${PLATFORM_NAME} · Software for Kenyan businesses`, 'Kabuor Shops for selling online and Kabuor ERP for running the whole business. M-Pesa first, KRA-ready, in English and Kiswahili.'];
      return res.send(page({ title, description, color: '#0A0B1E', icon: '/brand/icon-64.png' }));
    }
    if (!shop) return res.status(404).send(page({ title: `${slug}.${PLATFORM_DOMAIN} is available`, description: `Open your shop on ${PLATFORM_NAME}.`, color: '#F6F3EC' }));
    const c = shop.brand.content;
    res.send(page({ title: `${c.brand.name} · ${c.brand.tagline}`, description: c.hero.text, color: shop.brand.colors.cream, icon: shop.brand.logo.image || 'data:,' }));
  });
}

app.use((err, req, res, next) => {
  const status = err.status ?? (err.type === 'entity.parse.failed' ? 400 : 500);
  if (status >= 500) console.error(err);
  const message = status === 413 ? 'That file is too large (max 8 MB)' : status >= 500 ? 'Something went wrong on our side' : err.message;
  res.status(status).json({ error: message, ...(err.code && typeof err.code === 'string' && status < 500 ? { code: err.code } : {}) });
});

// On Vercel the exported app runs as a function; everywhere else it is a normal server.
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`${PLATFORM_NAME} ready on http://localhost:${PORT} (shops at http://<link>.localhost:${PORT})`));
  if (process.env.BACKUPS !== 'off') scheduleBackups();
}

export default app;
