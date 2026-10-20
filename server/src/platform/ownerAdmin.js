// Kabuor Builds' own dashboard (shop.ke/admin): how the platform is doing. Shops by stage, signups turning
// into paying shops, subscription money in, plans about to run out, and how much each shop is selling.
// Signs in with PLATFORM_ADMIN_EMAIL / PLATFORM_ADMIN_PASSWORD from server/.env (separate from shop logins).
import { Router } from 'express';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, relative, resolve, sep } from 'node:path';
import jwt from 'jsonwebtoken';
import { HttpError } from '../db.js';
import { DATA_DIR, PLATFORM_EMAIL } from '../site.js';
import { PRICES, testMode } from './billing.js';
import { KINDS } from './presets.js';
import { connectForShop, declineRequest, listRequests, markWorking, openRequestCount } from './mpesaRequests.js';
import { listDemoRequests, newDemoCount, setDemoStatus } from './demoRequests.js';
import { backupNow, latestBackup } from '../backups.js';
import { getShop, shopState } from './shops.js';
import { pdb } from './store.js';

export const ownerAdmin = Router();

// ---------- sign in ----------
function signingKey() {
  if (process.env.JWT_SECRET) return createHmac('sha256', process.env.JWT_SECRET).update('platform-owner').digest('hex');
  const file = join(DATA_DIR, 'owner-key');
  if (!existsSync(file)) writeFileSync(file, randomBytes(48).toString('hex'));
  return readFileSync(file, 'utf8');
}
const ADMIN_EMAIL = () => (process.env.PLATFORM_ADMIN_EMAIL || PLATFORM_EMAIL).toLowerCase();
const same = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};
const failures = new Map();

ownerAdmin.post('/login', (req, res) => {
  const password = process.env.PLATFORM_ADMIN_PASSWORD;
  if (!password) throw new HttpError(503, 'Set PLATFORM_ADMIN_PASSWORD in server/.env to use the dashboard.');
  const f = failures.get(req.ip);
  if (f && f.count >= 5 && Date.now() < f.until) throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');
  const ok = same(String(req.body?.email ?? '').trim().toLowerCase(), ADMIN_EMAIL()) && same(req.body?.password ?? '', password);
  if (!ok) {
    failures.set(req.ip, { count: (f?.count ?? 0) + 1, until: Date.now() + 5 * 60_000 });
    throw new HttpError(401, 'Incorrect email or password');
  }
  failures.delete(req.ip);
  res.json({ token: jwt.sign({ scope: 'platform-owner' }, signingKey(), { expiresIn: '12h' }), email: ADMIN_EMAIL() });
});

ownerAdmin.use((req, res, next) => {
  try {
    const p = jwt.verify((req.get('authorization') ?? '').replace(/^Bearer /, ''), signingKey());
    if (p.scope !== 'platform-owner') throw new Error();
  } catch {
    throw new HttpError(401, 'Please sign in to continue.');
  }
  next();
});

// ---------- the numbers ----------
const DAY = 864e5;
const RANGES = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };
const ksh = (n) => Math.round(Number(n) || 0);

/** A shop's stage, in the order a signup moves through them. */
function stage(r) {
  const spec = JSON.parse(r.brand || '{}');
  if (r.status === 'live') return shopState(r) === 'paused' ? 'paused' : 'live';
  if (r.status === 'setup') return 'paid'; // paid, not opened yet
  if (Date.now() - Date.parse(r.updated_at) > 3 * DAY) return 'abandoned';
  return spec.products?.length && (spec.till || spec.paybill) ? 'previewing' : 'designing';
}

/** Orders and sales through a shop's own website (its customers' money, not ours). */
function shopSales(slug, since) {
  try {
    const db = getShop(slug)?.db;
    if (!db) return { orders: 0, sales: 0, lastOrder: null };
    const r = db
      .prepare("SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS sales, MAX(created_at) AS lastOrder FROM orders WHERE status != 'cancelled' AND created_at >= ?")
      .get(since);
    return { orders: r.orders, sales: Math.round(r.sales / 100), lastOrder: r.lastOrder };
  } catch {
    return { orders: 0, sales: 0, lastOrder: null };
  }
}

ownerAdmin.get('/overview', (req, res) => {
  const days = RANGES[req.query.range] ?? 30;
  const end = Date.now();
  const start = end - days * DAY;
  const prevStart = start - days * DAY;
  const iso = (t) => new Date(t).toISOString();

  const shops = pdb.prepare('SELECT * FROM shops ORDER BY created_at DESC').all();
  const byStage = { designing: 0, previewing: 0, paid: 0, live: 0, paused: 0, abandoned: 0 };
  for (const s of shops) byStage[stage(s)]++;

  // Subscription money (test payments kept apart so they never inflate revenue).
  const paidIn = (a, b) =>
    pdb.prepare("SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM payments WHERE status = 'paid' AND test = 0 AND created_at >= ? AND created_at < ?").get(iso(a), iso(b));
  const now = paidIn(start, end);
  const before = paidIn(prevStart, start);
  const testPaid = pdb.prepare("SELECT COUNT(*) AS n FROM payments WHERE status = 'paid' AND test = 1 AND created_at >= ?").get(iso(start)).n;
  const failed = pdb.prepare("SELECT COUNT(*) AS n FROM payments WHERE status = 'failed' AND created_at >= ?").get(iso(start)).n;

  // What the live shops bring in each month, from their current plans.
  const active = shops.filter((s) => s.status === 'live' && shopState(s) === 'live');
  const mrr = active.reduce((sum, s) => sum + (s.plan === 'yearly' ? PRICES.yearly / 12 : PRICES.monthly), 0);

  // Signups in the period, and how far they got.
  const recent = shops.filter((s) => Date.parse(s.created_at) >= start);
  const reached = (stages) => recent.filter((s) => stages.includes(stage(s))).length;
  const funnel = [
    { id: 'signed', label: 'Signed up', count: recent.length },
    { id: 'previewed', label: 'Reached preview', count: reached(['previewing', 'paid', 'live', 'paused']) },
    { id: 'paid', label: 'Paid', count: reached(['paid', 'live', 'paused']) },
    { id: 'live', label: 'Live', count: reached(['live', 'paused']) },
  ];

  // Daily signups and money in, for the chart.
  const bucket = days > 90 ? 7 : 1;
  const series = [];
  for (let t = start; t < end; t += bucket * DAY) {
    const a = iso(t);
    const b = iso(Math.min(t + bucket * DAY, end));
    series.push({
      date: a.slice(0, 10),
      signups: shops.filter((s) => s.created_at >= a && s.created_at < b).length,
      revenue: pdb.prepare("SELECT COALESCE(SUM(amount), 0) AS t FROM payments WHERE status = 'paid' AND test = 0 AND created_at >= ? AND created_at < ?").get(a, b).t,
    });
  }

  const expiring = active
    .filter((s) => Date.parse(s.paid_until) - end < 7 * DAY)
    .map((s) => ({ slug: s.slug, name: s.name, phone: s.phone, plan: s.plan, paidUntil: s.paid_until }))
    .sort((a, b) => a.paidUntil.localeCompare(b.paidUntil));

  const kinds = Object.entries(KINDS)
    .map(([id, k]) => ({ id, label: k.label, count: shops.filter((s) => s.kind === id && s.status === 'live').length }))
    .filter((k) => k.count)
    .sort((a, b) => b.count - a.count);

  const payments = pdb
    .prepare('SELECT p.id, p.slug, s.name, p.amount, p.plan, p.status, p.receipt, p.test, p.result_desc, p.created_at FROM payments p LEFT JOIN shops s ON s.slug = p.slug ORDER BY p.id DESC LIMIT 12')
    .all()
    .map((p) => ({ ...p, test: Boolean(p.test) }));

  // Customers' orders across every live shop in the period: what the platform helps sell.
  let gmv = 0;
  let orders = 0;
  for (const s of shops.filter((x) => x.status === 'live')) {
    const r = shopSales(s.slug, iso(start));
    gmv += r.sales;
    orders += r.orders;
  }

  res.json({
    range: { days, start: iso(start), end: iso(end) },
    testMode,
    prices: PRICES,
    totals: { shops: shops.length, ...byStage },
    revenue: { amount: ksh(now.total), payments: now.n, previous: ksh(before.total), testPayments: testPaid, failed },
    mrr: ksh(mrr),
    funnel,
    series,
    expiring,
    kinds,
    payments,
    gmv: { amount: gmv, orders },
    mpesaRequests: openRequestCount(),
    demoRequests: newDemoCount(),
  });
});

ownerAdmin.get('/shops', (req, res) => {
  const q = String(req.query.q ?? '').trim().toLowerCase();
  const want = String(req.query.stage ?? '');
  const since = new Date(Date.now() - 30 * DAY).toISOString();
  const rows = pdb
    .prepare('SELECT * FROM shops ORDER BY created_at DESC')
    .all()
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      kind: KINDS[s.kind]?.label ?? s.kind,
      city: s.city,
      owner: s.owner_name,
      phone: s.phone,
      email: s.email,
      stage: stage(s),
      plan: s.plan,
      paidUntil: s.paid_until,
      createdAt: s.created_at,
      ...(s.status === 'live' ? shopSales(s.slug, since) : { orders: 0, sales: 0, lastOrder: null }),
    }));
  const counts = rows.reduce((c, r) => ({ ...c, [r.stage]: (c[r.stage] ?? 0) + 1 }), {});
  const list = rows.filter((r) => (!want || r.stage === want) && (!q || `${r.name} ${r.slug} ${r.owner} ${r.phone} ${r.city}`.toLowerCase().includes(q)));
  res.json({ total: rows.length, counts, shops: list });
});

// ---------- backups (nightly copies on the volume; download them for an off-site copy) ----------
const backupFiles = (dir) => {
  const out = [];
  const walk = (d) => readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(join(d, e.name)) : out.push(relative(dir, join(d, e.name)).split(sep).join('/'))));
  walk(dir);
  return out;
};
ownerAdmin.get('/backups/latest', (req, res) => {
  const dir = latestBackup();
  res.json(dir ? { day: basename(dir), files: backupFiles(dir) } : { day: null, files: [] });
});
ownerAdmin.post('/backups', (req, res) => res.json(backupNow()));
ownerAdmin.get('/backups/latest/file', (req, res) => {
  const dir = latestBackup();
  const file = dir && resolve(dir, String(req.query.path ?? ''));
  if (!file || !file.startsWith(resolve(dir) + sep) || !existsSync(file)) throw new HttpError(404, 'No such backup file.');
  res.download(file, String(req.query.path).split(/[/\\]/).join('__'));
});

// ---------- demo requests from the company site ----------
ownerAdmin.get('/demo-requests', (req, res) => res.json(listDemoRequests(['open', 'closed', 'all'].includes(req.query.status) ? req.query.status : 'open')));
ownerAdmin.post('/demo-requests/:id/status', (req, res) => res.json(setDemoStatus(req.params.id, req.body?.status)));

// ---------- M-Pesa setup requests from shop owners ----------
ownerAdmin.get('/mpesa-requests', (req, res) => res.json(listRequests(['open', 'live', 'cancelled', 'all'].includes(req.query.status) ? req.query.status : 'open')));
ownerAdmin.post('/mpesa-requests/:id/working', (req, res) => {
  markWorking(req.params.id, req.body?.reply);
  res.json({ ok: true });
});
ownerAdmin.post('/mpesa-requests/:id/decline', (req, res) => {
  declineRequest(req.params.id, req.body?.reply);
  res.json({ ok: true });
});
ownerAdmin.put('/mpesa-requests/:id/keys', async (req, res) => res.json(await connectForShop(req.params.id, req.body ?? {})));
