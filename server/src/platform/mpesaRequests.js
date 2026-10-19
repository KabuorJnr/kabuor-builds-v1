// "Connect M-Pesa for me": an owner who doesn't have (or doesn't want to handle) Daraja keys asks Kabuor
// Builds to set up the prompt. The request lands on the platform dashboard; the developer enters the keys
// there, Safaricom checks them, and the shop's checkout sends PIN prompts from the next order on.
import { HttpError } from '../db.js';
import { connectMpesa, mpesaSettings, toMsisdn } from '../mpesa.js';
import { runAs } from '../tenant.js';
import { getShop } from './shops.js';
import { now, pdb } from './store.js';

const OPEN = ['requested', 'working'];
const digits = (v, max = 10) => String(v ?? '').replace(/\D/g, '').slice(0, max);
const text = (v, max = 500) => String(v ?? '').trim().slice(0, max);

const view = (r) =>
  r && {
    id: r.id,
    status: r.status,
    type: r.pay_type,
    number: r.pay_number,
    store: r.store,
    phone: r.phone,
    note: r.note,
    reply: r.reply,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    liveAt: r.live_at,
  };

const latest = (slug) => pdb.prepare("SELECT * FROM mpesa_requests WHERE slug = ? AND status != 'cancelled' ORDER BY id DESC LIMIT 1").get(slug);
const openFor = (slug) => pdb.prepare(`SELECT * FROM mpesa_requests WHERE slug = ? AND status IN ('requested', 'working') ORDER BY id DESC LIMIT 1`).get(slug);

// ---------- the shop owner's side ----------
export const latestRequest = (slug) => view(latest(slug)) ?? null;

/** Opens a request, or updates the one already waiting. */
export function requestSetup(slug, input = {}) {
  const type = input.type === 'paybill' ? 'paybill' : 'till';
  const number = digits(input.number);
  const phone = toMsisdn(input.phone);
  if (number.length < 5) throw new HttpError(400, `Enter the ${type === 'till' ? 'Till' : 'Paybill'} number customers pay.`);
  if (!phone) throw new HttpError(400, 'Enter a Safaricom number we can call, e.g. 0712 345 678');
  const fields = { pay_type: type, pay_number: number, store: type === 'till' ? digits(input.store) : '', phone: `0${phone.slice(3)}`, note: text(input.note) };
  const open = openFor(slug);
  if (open) {
    pdb.prepare('UPDATE mpesa_requests SET pay_type = ?, pay_number = ?, store = ?, phone = ?, note = ?, updated_at = ? WHERE id = ?').run(fields.pay_type, fields.pay_number, fields.store, fields.phone, fields.note, now(), open.id);
  } else {
    pdb.prepare('INSERT INTO mpesa_requests (slug, pay_type, pay_number, store, phone, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(slug, fields.pay_type, fields.pay_number, fields.store, fields.phone, fields.note, now(), now());
  }
  return latestRequest(slug);
}

export function withdrawRequest(slug) {
  const open = openFor(slug);
  if (open) pdb.prepare("UPDATE mpesa_requests SET status = 'cancelled', updated_at = ? WHERE id = ?").run(now(), open.id);
  return latestRequest(slug);
}

// ---------- the developer's side (platform dashboard) ----------
function requestById(id) {
  const r = pdb.prepare('SELECT * FROM mpesa_requests WHERE id = ?').get(Number(id));
  if (!r) throw new HttpError(404, 'That request no longer exists.');
  return r;
}
function shopFor(r) {
  const shop = getShop(r.slug);
  if (!shop) throw new HttpError(404, 'That shop no longer exists.');
  return shop;
}

/** Requests with each shop's name, link and whether its prompt is on right now. */
export function listRequests(filter = 'open') {
  const rows = pdb.prepare('SELECT r.*, s.name, s.owner_name, s.status AS shop_status FROM mpesa_requests r JOIN shops s ON s.slug = r.slug ORDER BY r.id DESC').all();
  const group = (r) => (OPEN.includes(r.status) ? 'open' : r.status);
  const counts = rows.reduce((c, r) => ({ ...c, [group(r)]: (c[group(r)] ?? 0) + 1 }), { open: 0, live: 0, cancelled: 0 });
  const list = rows
    .filter((r) => filter === 'all' || group(r) === filter)
    .slice(0, 100)
    .map((r) => {
      let keys = null;
      try {
        const shop = getShop(r.slug);
        keys = shop && runAs(shop, () => mpesaSettings());
      } catch {}
      return { ...view(r), slug: r.slug, name: r.name, owner: r.owner_name, shopLive: r.shop_status === 'live', keys };
    });
  return { counts, requests: list };
}

export const openRequestCount = () => pdb.prepare(`SELECT COUNT(*) AS n FROM mpesa_requests WHERE status IN ('requested', 'working')`).get().n;

/** "I'm on it", with an optional message the owner sees on their M-Pesa page. */
export function markWorking(id, reply) {
  const r = requestById(id);
  if (!OPEN.includes(r.status)) throw new HttpError(400, 'This request is already closed.');
  pdb.prepare("UPDATE mpesa_requests SET status = 'working', reply = ?, updated_at = ? WHERE id = ?").run(text(reply) || r.reply, now(), r.id);
}

export function declineRequest(id, reply) {
  const r = requestById(id);
  if (!OPEN.includes(r.status)) throw new HttpError(400, 'This request is already closed.');
  pdb.prepare("UPDATE mpesa_requests SET status = 'cancelled', reply = ?, updated_at = ? WHERE id = ?").run(text(reply), now(), r.id);
}

/** Saves the shop's Daraja keys (checked with Safaricom first) and closes the request: prompts are on now. */
export async function connectForShop(id, input = {}) {
  const r = requestById(id);
  const keys = await runAs(shopFor(r), () => connectMpesa(input));
  pdb.prepare("UPDATE mpesa_requests SET status = 'live', reply = ?, live_at = ?, updated_at = ? WHERE id = ?").run(text(input.reply), now(), now(), r.id);
  return { request: view(requestById(r.id)), keys };
}
