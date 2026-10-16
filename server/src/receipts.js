import { randomBytes } from 'node:crypto';
import { db } from './db.js';
import { CHANNEL_LABELS, currency, PAYMENT_LABELS } from './config.js';
import { getContent, getStore } from './content.js';

// Every order gets an unguessable receipt link (/receipt/<code>?t=<token>) the customer can open,
// print or save. The token is created the first time it's needed.
export function receiptToken(order) {
  if (order.receipt_token) return order.receipt_token;
  const token = randomBytes(12).toString('hex');
  db.prepare('UPDATE orders SET receipt_token = ? WHERE id = ? AND receipt_token IS NULL').run(token, order.id);
  return db.prepare('SELECT receipt_token FROM orders WHERE id = ?').get(order.id).receipt_token;
}

export const receiptPath = (order) => `/receipt/${order.code}?t=${receiptToken(order)}`;

// Absolute link for messages: the configured public address, else the address the request came in on.
export const receiptUrl = (order, req) => `${req.protocol}://${req.get('host')}${receiptPath(order)}`;

const packOf = (look) => {
  try {
    const l = JSON.parse(look);
    return l.pack || (l.shape === 'tub' ? 'Tub' : 'Jar');
  } catch {
    return '';
  }
};

// 0712345678 → 0712 *** 678: the receipt can be forwarded, so the full number isn't shown.
const maskPhone = (phone = '') => {
  const d = phone.replace(/\D/g, '').replace(/^254/, '0');
  return d.length >= 9 ? `${d.slice(0, 4)} *** ${d.slice(-3)}` : '';
};

export function receiptData(order) {
  const content = getContent();
  const store = getStore();
  const items = db
    .prepare('SELECT oi.qty, oi.unit_price, oi.name, p.size, p.look FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?')
    .all(order.id);
  const branch = content.brand.branches.find((b) => b.city === order.branch) ?? null;
  const mpesa = db.prepare("SELECT receipt FROM payments WHERE order_id = ? AND status = 'paid' ORDER BY id DESC LIMIT 1").get(order.id);
  return {
    currency: currency(),
    brand: { name: content.brand.name, short: content.brand.short, tagline: content.brand.tagline },
    branch: branch && { city: branch.city, country: branch.country, phone: branch.phone },
    code: order.code,
    status: order.status,
    channel: CHANNEL_LABELS[order.channel] ?? order.channel,
    createdAt: order.created_at,
    customer: { name: order.customer_name, phone: maskPhone(order.phone) },
    fulfilment: order.fulfilment,
    deliverTo: order.channel === 'website' && order.fulfilment !== 'pickup' ? order.city : null,
    items: items.map((i) => ({ qty: i.qty, unitPrice: i.unit_price, label: i.size ? `${i.size} ${packOf(i.look)}`.trim() : i.name })),
    subtotal: order.subtotal,
    deliveryFee: order.delivery_fee,
    total: order.total,
    payment: {
      method: PAYMENT_LABELS[order.payment_method] ?? order.payment_method,
      ref: mpesa?.receipt || order.payment_ref || null,
      paybill: order.payment_method === 'mpesa' ? store.paybill : null,
    },
    deliveryNote: store.deliveryNote,
  };
}
