// The platform's own API (on shop.ke itself): sign up, pay by M-Pesa prompt, brand the shop, choose the
// link and go live. The signup wizard keeps a setup token in the owner's browser to continue between steps.
import express, { Router } from 'express';
import { ownerAdmin } from './ownerAdmin.js';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { hashPassword, ownerToken, setOwnerHashed } from '../auth.js';
import { HttpError } from '../db.js';
import { seed } from '../seed.js';
import { ensureStarterPosts } from '../routes/posts.js';
import { PLATFORM_DOMAIN, PLATFORM_EMAIL, PLATFORM_NAME, PLATFORM_PHONE, PLATFORM_TAGLINE, PLATFORM_FOUNDER_NAME, PLATFORM_FOUNDER_LINKEDIN, PUBLIC_URL, STORAGE_LASTS } from '../site.js';
import { runAs } from '../tenant.js';
import { billingSummary, paymentStatus, PLAN_LABELS, PRICES, settle, startPayment, testMode } from './billing.js';
import { callbackSecret, resultOf, toMsisdn } from './daraja.js';
import { accentsFrom, paletteOptions } from './palette.js';
import { clientBrand, KINDS, makeBrand, slugify, styleList, STYLES } from './presets.js';
import { forgetShop, getShop, LINK_RULE, previewToken, requestHost, RESERVED, shopDir, shopState } from './shops.js';
import { getShopRecord, now, pdb, shopByToken, updateShop } from './store.js';
import { createDemoRequest } from './demoRequests.js';
import { createApplication, roleStatuses } from './careers.js';

export const platformRouter = Router();
// Kabuor Builds' own dashboard (sign-in and numbers).
platformRouter.use('/admin', ownerAdmin);

/** "Request a demo" on the company site (rate-limited in index.js). */
platformRouter.post('/demo', (req, res) => res.json(createDemoRequest(req.body ?? {})));

/** The careers page: which roles the dashboard has opened or closed, and applications (rate-limited in index.js). */
platformRouter.get('/careers', (req, res) => res.json({ roles: roleStatuses() }));
platformRouter.post('/careers/apply', (req, res) => res.json(createApplication(req.body ?? {})));

const text = (v, max) => String(v ?? '').trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Prices, kinds and looks for the landing page and the wizard. */
platformRouter.get('/info', (req, res) => {
  const live = pdb.prepare("SELECT slug, name, kind FROM shops WHERE status = 'live' ORDER BY created_at DESC LIMIT 12").all();
  res.json({
    name: PLATFORM_NAME,
    tagline: PLATFORM_TAGLINE,
    phone: PLATFORM_PHONE,
    email: PLATFORM_EMAIL,
    founder: {
      name: PLATFORM_FOUNDER_NAME,
      title: 'Founder & CEO',
      linkedin: PLATFORM_FOUNDER_LINKEDIN,
    },
    domain: PLATFORM_DOMAIN,
    prices: PRICES,
    plans: PLAN_LABELS,
    testMode,
    signupsOpen: STORAGE_LASTS,
    kinds: Object.entries(KINDS).map(([id, k]) => ({ id, label: k.label, tagline: k.tagline, style: k.style, accent: k.accent })),
    styles: styleList(),
    shops: live,
    samples: SAMPLES,
  });
});

// Example looks for the landing page: what a sauce, candle and honey shop come out as.
const SAMPLES = [
  { kind: 'sauce', name: 'Mama Pili Sauces', brand: { style: 'warm', accent: '#D9381E', tagline: 'Heat with flavour' }, product: { name: 'Garden Chilli', size: '250g', price: 400 } },
  { kind: 'candle', name: 'Glow Candle Co', brand: { style: 'luxe', accent: '#9A5BC9', tagline: 'Calm scents for slow evenings' }, product: { name: 'Lavender Candle', size: '200g', price: 600 } },
  { kind: 'honey', name: 'Kerio Honey', brand: { style: 'natural', accent: '#E3A21A', tagline: 'From the hive to your home' }, product: { name: 'Raw Honey', size: '500g', price: 650 } },
].map((s) => ({
  name: s.name,
  product: s.product,
  look: clientBrand(makeBrand({ slug: s.kind, name: s.name, kind: s.kind, city: 'Nairobi', phone: '', email: '', brand: JSON.stringify(s.brand) })),
}));

// ---------- the link ----------
function linkProblem(link) {
  if (!LINK_RULE.test(link)) return 'Use 3–30 letters, numbers or dashes (no dash at the start or end).';
  if (RESERVED.has(link)) return 'That link is reserved. Try another.';
  const taken = getShopRecord(link);
  // A link held by a signup that never paid is released after three days.
  if (taken && !(taken.status === 'pending' && Date.now() - Date.parse(taken.updated_at) > 3 * 864e5)) return 'That link is taken.';
  return null;
}
function suggestions(base) {
  const out = [];
  for (const s of [base, `${base}-ke`, `${base}-shop`, `${base}-store`, `${base}${new Date().getFullYear() % 100}`]) {
    if (out.length < 3 && !linkProblem(s)) out.push(s);
  }
  return out;
}

platformRouter.get('/check-link', (req, res) => {
  const link = text(req.query.link, 40).toLowerCase();
  const problem = linkProblem(link);
  res.json({ link, available: !problem, problem, suggestions: problem ? suggestions(slugify(link).replace(/[^a-z0-9-]/g, '') || 'shop') : [] });
});

// ---------- step 1: the business and the owner's account ----------
platformRouter.post('/signup', (req, res) => {
  if (!STORAGE_LASTS) throw Object.assign(new HttpError(409, `New shops open soon. WhatsApp ${PLATFORM_PHONE} and we'll set yours up the day we do.`), { code: 'SIGNUPS_PAUSED' });
  const b = req.body ?? {};
  const name = text(b.name, 60);
  const link = text(b.link, 40).toLowerCase();
  const email = text(b.email, 120).toLowerCase();
  const password = String(b.password ?? '');
  if (name.length < 2) throw new HttpError(400, 'Enter your business name');
  if (!KINDS[b.kind]) throw new HttpError(400, 'Choose what you sell');
  if (text(b.ownerName, 60).length < 2) throw new HttpError(400, 'Enter your name');
  if (!toMsisdn(b.phone)) throw new HttpError(400, 'Enter a Safaricom number, e.g. 0712 345 678');
  if (!EMAIL.test(email)) throw new HttpError(400, 'Enter a valid email address');
  if (password.length < 8) throw new HttpError(400, 'Use at least 8 characters for your password');
  const problem = linkProblem(link);
  if (problem) throw new HttpError(409, problem);

  const { salt, hash } = hashPassword(password);
  const token = randomBytes(24).toString('hex');
  const at = now();
  // An expired, unpaid hold on this link: clear it and anything that signup uploaded.
  if (pdb.prepare('DELETE FROM shops WHERE slug = ?').run(link).changes) forgetShop(link);
  pdb
    .prepare(`INSERT INTO shops (slug, name, kind, city, owner_name, phone, email, password_salt, password_hash, setup_token, brand, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(link, name, b.kind, text(b.city, 40), text(b.ownerName, 60), text(b.phone, 20), email, salt, hash, token, JSON.stringify({ style: KINDS[b.kind].style }), at, at);
  res.status(201).json({ token, link });
});

// Everything after signup carries the setup token.
function signup(req) {
  const shop = shopByToken(req.get('x-setup-token') ?? req.query.token);
  if (!shop) throw new HttpError(401, 'Your signup has expired. Please start again.');
  return shop;
}
const view = (shop) => {
  const spec = JSON.parse(shop.brand || '{}');
  return {
    link: shop.slug,
    name: shop.name,
    kind: shop.kind,
    city: shop.city,
    phone: shop.phone,
    status: shop.status,
    paidUntil: shop.paid_until,
    url: shopUrl(shop.slug),
    brand: spec,
  };
};

platformRouter.get('/signup', (req, res) => res.json(view(signup(req))));

// ---------- step 2: pay ----------
platformRouter.post('/pay', async (req, res) => {
  const shop = signup(req);
  const id = await startPayment(shop.slug, { phone: req.body?.phone || shop.phone, plan: req.body?.plan || 'monthly' });
  res.status(201).json({ id, testMode });
});
platformRouter.get('/pay/:id', async (req, res) => res.json(await paymentStatus(signup(req).slug, req.params.id)));

// Safaricom's result for a prompt. The URL carries a secret only we and Safaricom know.
platformRouter.post(`/mpesa/callback/:secret`, (req, res) => {
  const a = Buffer.from(String(req.params.secret));
  const b = Buffer.from(callbackSecret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return res.status(404).end();
  const cb = req.body?.Body?.stkCallback;
  if (cb?.CheckoutRequestID) {
    const receipt = cb.CallbackMetadata?.Item?.find((i) => i.Name === 'MpesaReceiptNumber')?.Value ?? null;
    settle(cb.CheckoutRequestID, resultOf(cb.ResultCode, cb.ResultDesc), receipt);
  }
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// ---------- step 3: brand ----------
export const UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const roleOf = (r) => (['logo', 'photo', 'product'].includes(r) ? r : 'photo');

platformRouter.post('/upload', express.raw({ type: UPLOAD_TYPES, limit: '8mb' }), async (req, res) => {
  const shop = signup(req);
  res.status(201).json(await saveUpload(shop.slug, roleOf(req.query.role), req.body));
});

/** Saves a picture for a shop (resized, as WebP) and finds its accent colours. */
export async function saveUpload(slug, role, body) {
  if (!Buffer.isBuffer(body) || body.length < 100) throw new HttpError(400, 'Choose a JPG, PNG or WebP picture');
  let img = sharp(body, { failOn: 'error' }).rotate();
  const meta = await img.metadata().catch(() => null);
  if (!meta?.width) throw new HttpError(400, 'That file doesn’t look like a picture');
  // Banner photos keep their shape; product photos are cropped to the card's 4:5; logos keep transparency.
  img =
    role === 'logo'
      ? img.resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      : role === 'product'
        ? img.resize(960, 1200, { fit: 'cover', position: sharp.strategy.attention })
        : img.resize(1600, 1600, { fit: 'inside', withoutEnlargement: true });
  const name = `${role === 'photo' ? 'hero' : role}-${Date.now().toString(36)}${randomBytes(3).toString('hex')}.webp`;
  const dir = join(shopDir(slug), 'uploads');
  mkdirSync(dir, { recursive: true });
  const out = await img.webp({ quality: 84 }).toBuffer();
  writeFileSync(join(dir, name), out);
  const accents = role === 'product' ? [] : await accentsFrom(out).catch(() => []);
  return { url: `/uploads/${name}`, accents };
}

// Uploaded pictures are shown in the wizard before the shop exists, from the platform's own address.
platformRouter.get('/uploads/:slug/:file', (req, res) => {
  if (!/^[a-z0-9-]+$/.test(req.params.slug) || !/^[\w.-]+\.webp$/.test(req.params.file)) return res.status(404).end();
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.sendFile(join(shopDir(req.params.slug), 'uploads', req.params.file), (err) => err && res.status(404).end());
});

/** Palette choices from accent colours found in the owner's pictures. */
platformRouter.post('/palettes', (req, res) => {
  const shop = signup(req);
  const accents = (Array.isArray(req.body?.accents) ? req.body.accents : []).filter((c) => /^#[0-9a-f]{6}$/i.test(c)).slice(0, 6);
  const mode = req.body?.mode === 'dark' ? 'dark' : 'light';
  res.json(paletteOptions(accents, KINDS[shop.kind].accent, mode));
});

const UPLOAD_URL = /^\/uploads\/[\w.-]+\.webp$/;
platformRouter.put('/brand', (req, res) => res.json(applyBrand(signup(req).slug, req.body)));

/** Updates a shop's look and starter details, from the wizard or the shop admin's Look page. */
export function applyBrand(slug, b = {}) {
  const shop = getShopRecord(slug);
  const prev = JSON.parse(shop.brand || '{}');
  const color = (c) => (/^#[0-9a-f]{6}$/i.test(c ?? '') ? c.toUpperCase() : undefined);
  const products = (Array.isArray(b.products) ? b.products : prev.products ?? [])
    .slice(0, 12)
    .map((p) => ({ name: text(p.name, 60), size: text(p.size, 20), price: Math.max(0, Math.round(Number(p.price) || 0)), photo: UPLOAD_URL.test(p.photo ?? '') ? p.photo : '', description: text(p.description, 300) }))
    .filter((p) => p.name && p.price > 0);
  const next = {
    ...prev,
    style: STYLES[b.style] ? b.style : prev.style,
    mode: ['light', 'dark'].includes(b.mode) ? b.mode : prev.mode,
    accent: color(b.accent) ?? prev.accent,
    // Colours found in the owner's pictures, so the choices are still there when they come back.
    accents: Array.isArray(b.accents) ? b.accents.map(color).filter(Boolean).slice(0, 5) : prev.accents,
    second: color(b.second) ?? prev.second,
    tagline: b.tagline !== undefined ? text(b.tagline, 60) : prev.tagline,
    about: b.about !== undefined ? text(b.about, 400) : prev.about,
    logo: b.logo !== undefined ? (UPLOAD_URL.test(b.logo) ? b.logo : '') : prev.logo,
    photos: Array.isArray(b.photos) ? b.photos.filter((u) => UPLOAD_URL.test(u) && u.includes('/hero-')).slice(0, 4) : prev.photos,
    products,
    till: b.till !== undefined ? text(b.till, 12).replace(/\D/g, '') : prev.till,
    paybill: b.paybill !== undefined ? text(b.paybill, 12).replace(/\D/g, '') : prev.paybill,
    account: b.account !== undefined ? text(b.account, 20) : prev.account,
  };
  updateShop(slug, { brand: JSON.stringify(next) });
  const fresh = getShopRecord(slug);
  return { ...view(fresh), preview: clientBrand(makeBrand(fresh)) };
}

// ---------- step 4: go live ----------
// A shop's address: <link>.localhost locally, <link>.<domain> once the platform is served on its own domain,
// and <platform address>/s/<link> before that (e.g. on the host's default address, with no wildcard DNS).
const shopUrl = (slug, req) => {
  const host = (req ? requestHost(req) ?? '' : '').toLowerCase();
  const bare = host.replace(/:\d+$/, '');
  if (bare === 'localhost' || bare.endsWith('.localhost')) return `${req.protocol}://${slug}.localhost:${host.split(':')[1] ?? ''}`.replace(/:$/, '');
  if (PLATFORM_DOMAIN && (!req || bare === PLATFORM_DOMAIN || bare.endsWith(`.${PLATFORM_DOMAIN}`))) return `https://${slug}.${PLATFORM_DOMAIN}`;
  if (!req) return `${PUBLIC_URL}/s/${slug}`;
  return `${req.protocol}://${host}/s/${slug}`;
};

// The shop's contents as the owner set them in the wizard: products (replacing any earlier preview) and the
// welcome post. Only for shops that aren't live yet: nobody has ordered from them.
function stockShop(slug) {
  const record = getShopRecord(slug);
  if (record.status === 'live') return getShop(slug);
  const shop = getShop(slug);
  runAs(shop, () => {
    seed({ reset: true });
    ensureStarterPosts();
  });
  return shop;
}
function readyProblem(spec) {
  if (!spec.products?.length) return 'Add at least one product so customers have something to buy.';
  if (!spec.till && !spec.paybill) return 'Add the M-Pesa Till or Paybill your customers pay to.';
  return null;
}

/** Builds the real shop from the wizard and returns its private preview address. */
platformRouter.post('/preview', (req, res) => {
  const record = signup(req);
  const problem = readyProblem(JSON.parse(record.brand || '{}'));
  if (problem) throw new HttpError(400, problem);
  stockShop(record.slug);
  res.json({ url: `${shopUrl(record.slug, req)}/?preview=${previewToken(getShopRecord(record.slug))}` });
});

platformRouter.post('/launch', (req, res) => {
  const record = signup(req);
  if (record.status === 'pending') throw new HttpError(402, 'Pay for your plan first, then you can open your shop.');
  const problem = readyProblem(JSON.parse(record.brand || '{}'));
  if (problem) throw new HttpError(400, problem);
  // Create the shop: catalogue, welcome post, and the owner's account (the password they chose at signup).
  const shop = stockShop(record.slug);
  const handoff = runAs(shop, () => {
    setOwnerHashed(record.email, { salt: record.password_salt, hash: record.password_hash });
    return ownerToken();
  });
  // The setup token is used up: from now on the owner signs in to their shop's admin.
  updateShop(record.slug, { status: 'live', setup_token: randomBytes(24).toString('hex') });
  res.json({ url: shopUrl(record.slug, req), admin: `${shopUrl(record.slug, req)}/admin#handoff=${encodeURIComponent(handoff)}&u=${encodeURIComponent(record.email)}`, state: shopState(getShopRecord(record.slug)) });
});

export { billingSummary, shopUrl };
