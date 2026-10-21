// Paid shop orders go into the shop owner's Kabuor ERP as paid invoices, so the books, stock and VAT include
// online sales without anyone typing them in again. The owner pastes their ERP address and an API key
// (ERP: Settings → Connections) into the shop admin. Each order is sent with its code as the reference, and
// the ERP keeps an order once however many times it arrives, so failed sends are simply tried again later.
import { db, HttpError } from './db.js';

const KEY = 'erp';

export function getErp() {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(KEY);
  try {
    return row ? JSON.parse(row.value) : null;
  } catch {
    return null;
  }
}

/** What the admin sees: never the key itself. */
export function erpStatus() {
  const erp = getErp();
  const waiting = db.prepare("SELECT COUNT(*) AS n FROM orders WHERE status IN ('paid','sent','delivered') AND erp_synced_at IS NULL").get().n;
  const failing = db.prepare("SELECT erp_error FROM orders WHERE erp_error IS NOT NULL AND erp_synced_at IS NULL ORDER BY id DESC LIMIT 1").get();
  return { connected: Boolean(erp?.url && erp?.key), url: erp?.url ?? '', keyHint: erp?.key ? `${erp.key.slice(0, 9)}…` : '', waiting, lastError: failing?.erp_error ?? null };
}

export function saveErp({ url, key }) {
  const clean = String(url ?? '').trim().replace(/\/+$/, '');
  if (!clean) {
    db.prepare('DELETE FROM settings WHERE key = ?').run(KEY);
    return erpStatus();
  }
  let parsed;
  try {
    parsed = new URL(clean);
  } catch {
    throw new HttpError(400, 'Enter your Kabuor ERP address, starting with https://');
  }
  if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') throw new HttpError(400, 'The ERP address must start with https://');
  const current = getErp();
  const nextKey = String(key ?? '').trim() || current?.key;
  if (!nextKey?.startsWith('kerp_')) throw new HttpError(400, 'Paste the API key from Kabuor ERP (Settings → Connections); it starts with kerp_.');
  db.prepare('INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
    .run(KEY, JSON.stringify({ url: parsed.origin, key: nextKey }), new Date().toISOString());
  return erpStatus();
}

function payload(order) {
  const items = db.prepare('SELECT product_id, name, unit_price, qty FROM order_items WHERE order_id = ?').all(order.id);
  const lines = items.map((i) => ({ sku: i.product_id, description: i.name, quantity: i.qty, unitPrice: i.unit_price }));
  if (order.delivery_fee > 0) lines.push({ description: 'Delivery', quantity: 1, unitPrice: order.delivery_fee });
  const paid = db.prepare("SELECT receipt FROM payments WHERE order_id = ? AND status = 'paid' AND receipt IS NOT NULL ORDER BY id DESC LIMIT 1").get(order.id);
  return {
    externalRef: order.code,
    customerName: order.customer_name,
    customerPhone: order.phone,
    customerEmail: order.email ?? undefined,
    lines,
    mpesaReceipt: paid?.receipt ?? order.payment_ref ?? undefined,
    amountPaid: order.total,
    notes: `Online order ${order.code}${order.payment_method === 'cod' ? ' (cash on delivery)' : ''}`,
  };
}

/** Sends one order. Never throws: the result is written on the order for the admin to see. */
export async function syncOrder(orderId) {
  const erp = getErp();
  if (!erp?.url || !erp?.key) return;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order || order.erp_synced_at || !['paid', 'sent', 'delivered'].includes(order.status)) return;
  const now = new Date().toISOString();
  try {
    const res = await fetch(`${erp.url}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': erp.key },
      body: JSON.stringify(payload(order)),
      signal: AbortSignal.timeout(15000),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error ?? `Kabuor ERP answered ${res.status}`);
    db.prepare('UPDATE orders SET erp_invoice = ?, erp_synced_at = ?, erp_error = NULL WHERE id = ?').run(body.invoice ?? null, now, order.id);
  } catch (err) {
    db.prepare('UPDATE orders SET erp_error = ? WHERE id = ?').run(String(err.message ?? err).slice(0, 300), order.id);
  }
}

/** Tries again for paid orders that haven't reached the ERP (last 30 days). */
export async function syncWaiting() {
  if (!getErp()?.key) return { sent: 0 };
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const ids = db.prepare("SELECT id FROM orders WHERE status IN ('paid','sent','delivered') AND erp_synced_at IS NULL AND created_at >= ? ORDER BY id LIMIT 50").all(since).map((r) => r.id);
  for (const id of ids) await syncOrder(id);
  return { sent: ids.length - erpStatus().waiting };
}
