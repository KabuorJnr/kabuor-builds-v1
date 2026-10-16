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
import { getShop, resolveHost, shopState } from './platform/shops.js';
import { PLATFORM_DOMAIN, PLATFORM_NAME, PLATFORM_TAGLINE } from './site.js';
import { runAs } from './tenant.js';

const app = express();
app.disable('x-powered-by');
// Behind a proxy (Railway, a load balancer), take the visitor's IP and https from X-Forwarded-*.
if (process.env.RAILWAY_ENVIRONMENT_NAME || process.env.TRUST_PROXY) app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));

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
// The page shell with the right title, description and colour for whoever is being served.
const page = ({ title, description, color, icon = 'data:,' }) =>
  indexHtml()
    .replace('%BRAND_TITLE%', esc(title))
    .replace('%BRAND_DESCRIPTION%', esc(description))
    .replace('content="#FBF6EE"', `content="${esc(color)}"`)
    .replace('href="data:,"', `href="${esc(icon)}"`);

// ---------- which site is this? ----------
app.use((req, res, next) => {
  const where = resolveHost(req.get('host'));
  req.site = where.platform ? { platform: true } : { slug: where.slug, shop: getShop(where.slug) };
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
  res.json({ kind: 'shop', state: shopState(shop.record), brand: clientBrand(shop.brand), platform: { name: PLATFORM_NAME, domain: PLATFORM_DOMAIN } });
});

// ---------- a shop ----------
const shopOnly = (fn) => (req, res, next) => (req.site.shop ? fn(req, res, next) : next());

// Pictures uploaded by the shop. nosniff stops browsers treating them as anything but images.
app.use(
  '/uploads',
  shopOnly((req, res, next) =>
    express.static(req.site.shop.uploadDir, { maxAge: '30d', setHeaders: (r) => r.setHeader('X-Content-Type-Options', 'nosniff') })(req, res, next),
  ),
);

app.use('/api/admin', shopOnly(adminRouter));
// Customers can't order while the shop is being set up or its plan has lapsed; the admin keeps working.
app.use(
  '/api',
  shopOnly((req, res, next) => {
    if (shopState(req.site.shop.record) !== 'live') return res.status(503).json({ error: 'This shop is not taking orders right now.', code: 'SHOP_CLOSED' });
    next();
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
      id: '/admin',
      start_url: '/admin',
      scope: '/admin',
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
      return res.send(page({ title: `${PLATFORM_NAME} · Product-first websites that sell`, description: `Your product, your colours, your prices. Customers pick, pay with M-Pesa, done. ${PLATFORM_TAGLINE}`, color: '#FFF7EC', icon: '/brand/icon-64.png' }));
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

app.listen(PORT, () => console.log(`${PLATFORM_NAME} ready on http://localhost:${PORT} (shops at http://<link>.localhost:${PORT})`));

export default app;
