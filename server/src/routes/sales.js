// Sales the admin records by hand: walk-ins, phone and WhatsApp orders, markets, wholesale…
// They are stored as orders (channel ≠ 'website') so every report and the ledger include them.
import { Router } from 'express';
import { db, tx, HttpError } from '../db.js';
import { readMessage, saveConfirmation } from '../mpesaBooks.js';
import { orderCode } from '../seed.js';
import { PAYMENT_LABELS, SALE_CHANNELS } from '../config.js';
import { getContent } from '../content.js';

export const adminSales = Router();

const OFFLINE_PAYMENTS = ['mpesa', 'cash', 'bank', 'other'];
const STATUSES = ['paid', 'delivered', 'pending'];
const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

adminSales.get('/sales/meta', (req, res) => {
  res.json({
    channels: Object.entries(SALE_CHANNELS).map(([id, label]) => ({ id, label })),
    payments: OFFLINE_PAYMENTS.map((id) => ({ id, label: PAYMENT_LABELS[id] })),
    statuses: STATUSES,
    branches: getContent().brand.branches.map((b) => b.city),
  });
});

// A plain date ("2026-10-08") is recorded at the current time of day for today, or midday for past days.
function saleTime(input) {
  const now = new Date();
  if (!input) return now;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(input));
  let at;
  if (m) {
    at = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const today = at.toDateString() === now.toDateString();
    today ? at.setHours(now.getHours(), now.getMinutes(), now.getSeconds()) : at.setHours(12, 0, 0);
  } else {
    at = new Date(String(input));
  }
  if (Number.isNaN(at.getTime())) throw new HttpError(400, 'Enter a valid date');
  if (at > new Date(now.getTime() + 60_000)) throw new HttpError(400, 'The sale date can’t be in the future');
  if (now - at > 5 * 365 * 86_400_000) throw new HttpError(400, 'That date is too far in the past');
  return at;
}

adminSales.post('/sales', (req, res) => {
  const b = req.body ?? {};
  const channel = text(b.channel, 20);
  const payment = text(b.paymentMethod, 20);
  const status = text(b.status, 20) || 'paid';
  const branch = text(b.branch, 30) || null;
  const branches = getContent().brand.branches.map((x) => x.city);
  const deductStock = b.deductStock !== false;

  if (!SALE_CHANNELS[channel]) throw new HttpError(400, 'Choose where the sale happened');
  if (!OFFLINE_PAYMENTS.includes(payment)) throw new HttpError(400, 'Choose how the customer paid');
  if (!STATUSES.includes(status)) throw new HttpError(400, 'Choose a status');
  if (branches.length && !branches.includes(branch)) throw new HttpError(400, 'Choose the branch that made the sale');
  const phone = text(b.phone, 20).replace(/[\s-]/g, '');
  if (phone && !/^\+?\d{9,15}$/.test(phone)) throw new HttpError(400, 'Enter a valid phone number or leave it empty');
  const at = saleTime(b.date);
  const mpesa = b.mpesaText ? readMessage(b.mpesaText) : null;
  if (mpesa && payment !== 'mpesa') throw new HttpError(400, 'An M-Pesa message is attached, so choose M-Pesa as the payment');

  const lines = [];
  for (const item of Array.isArray(b.items) ? b.items.slice(0, 30) : []) {
    const qty = Number(item?.qty);
    if (typeof item?.id !== 'string' || !Number.isInteger(qty) || qty < 1 || qty > 10_000) throw new HttpError(400, 'Check the quantities');
    const unitPrice = item.unitPrice === undefined || item.unitPrice === null || item.unitPrice === '' ? null : Number(item.unitPrice);
    if (unitPrice !== null && (!Number.isInteger(unitPrice) || unitPrice < 0 || unitPrice > 1_000_000_00)) throw new HttpError(400, 'Check the prices');
    lines.push({ id: item.id, qty, unitPrice });
  }
  if (!lines.length) throw new HttpError(400, 'Add at least one product');

  const order = tx(() => {
    const getProduct = db.prepare('SELECT * FROM products WHERE id = ?');
    const merged = new Map();
    for (const l of lines) {
      const p = getProduct.get(l.id);
      if (!p) throw new HttpError(400, 'One of the products no longer exists');
      const price = l.unitPrice ?? p.price;
      const key = `${p.id}:${price}`;
      const prev = merged.get(key);
      merged.set(key, { p, price, qty: (prev?.qty ?? 0) + l.qty });
    }
    if (deductStock) {
      const need = new Map();
      for (const { p, qty } of merged.values()) need.set(p.id, { p, qty: (need.get(p.id)?.qty ?? 0) + qty });
      for (const { p, qty } of need.values()) {
        if (p.stock < qty) throw new HttpError(409, `Only ${p.stock} × ${p.name} in stock. Untick “Deduct from stock” to record it anyway.`);
      }
    }

    const items = [...merged.values()];
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const cost = items.reduce((s, i) => s + i.p.cost * i.qty, 0);
    const units = items.reduce((s, i) => s + i.qty, 0);
    let code = orderCode();
    while (db.prepare('SELECT 1 FROM orders WHERE code = ?').get(code)) code = orderCode();
    const iso = at.toISOString();

    const { lastInsertRowid } = db.prepare(`INSERT INTO orders (code, customer_name, phone, email, address, city, note, payment_method, fulfilment, branch, channel, stock_deducted, status, subtotal, delivery_fee, total, cost_total, items_count, created_at, updated_at)
      VALUES (?, ?, ?, NULL, ?, ?, ?, ?, 'offline', ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`).run(
      code, text(b.customerName, 80) || `${SALE_CHANNELS[channel]} customer`, phone, `${SALE_CHANNELS[channel]} sale`, branch ?? '',
      text(b.note, 300) || null, payment, branch, channel, deductStock ? 1 : 0, status, subtotal, subtotal, cost, units, iso, iso,
    );
    const addItem = db.prepare('INSERT INTO order_items (order_id, product_id, name, unit_price, unit_cost, qty) VALUES (?, ?, ?, ?, ?, ?)');
    const takeStock = db.prepare('UPDATE products SET stock = MAX(stock - ?, 0) WHERE id = ?');
    for (const { p, price, qty } of items) {
      addItem.run(lastInsertRowid, p.id, p.name, price, p.cost, qty);
      if (deductStock) takeStock.run(qty, p.id);
    }
    if (mpesa) {
      saveConfirmation(Number(lastInsertRowid), mpesa);
      db.prepare('UPDATE orders SET payment_ref = ? WHERE id = ?').run(mpesa.code, lastInsertRowid);
    }
    return { id: Number(lastInsertRowid), code, total: subtotal, units, createdAt: iso };
  });

  res.status(201).json(order);
});
