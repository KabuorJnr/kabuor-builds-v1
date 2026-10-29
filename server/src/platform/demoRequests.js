// "Request a demo" from the company site. The request is kept here and shown on the platform dashboard,
// where Kabuor Builds marks it contacted, booked or closed as the conversation moves on WhatsApp.
import { HttpError } from '../db.js';
import { toMsisdn } from '../mpesa.js';
import { now, pdb } from './store.js';
import { STORAGE_LASTS } from '../site.js';

const PRODUCTS = ['erp', 'shops', 'both'];
const STAFF = ['1', '2-10', '11-50', '50+'];
export const DEMO_STATUSES = ['new', 'contacted', 'booked', 'closed'];
const text = (v, max) => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, max);

const view = (r) => ({
  id: r.id,
  product: r.product,
  name: r.name,
  business: r.business,
  phone: r.phone,
  email: r.email,
  staff: r.staff,
  note: r.note,
  status: r.status,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export function createDemoRequest(input = {}) {
  if (text(input.website, 50)) return { ok: true, saved: true }; // a bot filled the hidden field: pretend it worked
  const product = PRODUCTS.includes(input.product) ? input.product : 'erp';
  const name = text(input.name, 80);
  const business = text(input.business, 120);
  const msisdn = toMsisdn(input.phone);
  const email = text(input.email, 120).toLowerCase();
  if (name.length < 2) throw new HttpError(400, 'Enter your name.');
  if (business.length < 2) throw new HttpError(400, 'Enter your business name.');
  if (!msisdn) throw new HttpError(400, 'Enter a phone number we can WhatsApp, e.g. 0712 345 678');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'That email doesn’t look right.');
  const phone = `0${msisdn.slice(3)}`;
  // The same phone asking again within a day updates the request instead of making a second one.
  const recent = pdb.prepare("SELECT id FROM demo_requests WHERE phone = ? AND status = 'new' AND created_at >= ? ORDER BY id DESC LIMIT 1").get(phone, new Date(Date.now() - 864e5).toISOString());
  const fields = [product, name, business, phone, email, STAFF.includes(input.staff) ? input.staff : '', text(input.note, 600)];
  if (recent) pdb.prepare('UPDATE demo_requests SET product = ?, name = ?, business = ?, phone = ?, email = ?, staff = ?, note = ?, updated_at = ? WHERE id = ?').run(...fields, now(), recent.id);
  else pdb.prepare('INSERT INTO demo_requests (product, name, business, phone, email, staff, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(...fields, now(), now());
  // saved: false tells the page to hand the request to WhatsApp too (see STORAGE_LASTS).
  return { ok: true, saved: STORAGE_LASTS };
}

export function listDemoRequests(status = 'open') {
  const where = status === 'open' ? "status IN ('new', 'contacted', 'booked')" : status === 'closed' ? "status = 'closed'" : '1 = 1';
  const rows = pdb.prepare(`SELECT * FROM demo_requests WHERE ${where} ORDER BY CASE status WHEN 'new' THEN 0 WHEN 'contacted' THEN 1 WHEN 'booked' THEN 2 ELSE 3 END, id DESC LIMIT 200`).all();
  const counts = Object.fromEntries(DEMO_STATUSES.map((s) => [s, pdb.prepare('SELECT COUNT(*) AS n FROM demo_requests WHERE status = ?').get(s).n]));
  return { counts, requests: rows.map(view) };
}

export const newDemoCount = () => pdb.prepare("SELECT COUNT(*) AS n FROM demo_requests WHERE status = 'new'").get().n;

export function setDemoStatus(id, status) {
  if (!DEMO_STATUSES.includes(status)) throw new HttpError(400, 'Unknown status.');
  const r = pdb.prepare('SELECT * FROM demo_requests WHERE id = ?').get(Number(id));
  if (!r) throw new HttpError(404, 'That request is gone.');
  pdb.prepare('UPDATE demo_requests SET status = ?, updated_at = ? WHERE id = ?').run(status, now(), r.id);
  return view({ ...r, status, updated_at: now() });
}
