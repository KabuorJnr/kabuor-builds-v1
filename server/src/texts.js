// Order texts (SMS). Exactly two: the admin hears about each new order, and the customer gets
// "Order Confirmed" once the order is paid. Both can be switched off under Site content → SMS texts.
import { db } from './db.js';
import { currency } from './config.js';
import { getContent, getStore } from './content.js';
import { alreadySent, sendSms, toIntl } from './sms.js';

const money = (cents) => `${currency()} ${Math.round(cents / 100).toLocaleString('en-KE')}`;

function load(orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) return null;
  const items = db
    .prepare('SELECT oi.qty, oi.name, p.size FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?')
    .all(orderId);
  const content = getContent();
  return { order, items, brand: content.brand.name, branch: content.brand.branches.find((b) => b.city === order.branch), settings: getStore().sms };
}

const itemLine = (items) => items.map((i) => `${i.qty}x ${i.size ?? i.name}`).join(', ');

// Fire-and-forget: texts never hold up or break the order flow.
const run = (fn) => (orderId, ...args) => {
  Promise.resolve()
    .then(() => fn(orderId, ...args))
    .catch((err) => console.error('SMS step failed:', err.message));
};

// 1. To the admin (and optionally the branch), when an order is placed.
export const textNewOrder = run(async (orderId) => {
  const x = load(orderId);
  if (!x || !x.settings.adminNewOrder) return;
  const { order, items, branch, settings } = x;
  const to = [...settings.adminNumbers, ...(settings.branchCopy && branch?.phone ? [branch.phone] : [])];
  if (!to.length) return;
  const where = order.fulfilment === 'pickup' ? 'Pickup' : `Deliver: ${order.address}, ${order.city}`;
  await sendSms(
    to,
    [
      `New order ${order.code} - ${money(order.total)}`,
      `${order.customer_name} ${order.phone}`,
      itemLine(items),
      `${order.branch ? `${order.branch} branch. ` : ''}${where}`,
      order.note ? `Note: ${order.note.slice(0, 80)}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    { kind: 'admin-order', orderId },
  );
});

// WhatsApp "Order Confirmed": a click-to-chat link the admin opens after confirming payment. WhatsApp shows the
// message ready to send from the shop's own number, so no SMS account or sender ID is needed.
const packOf = (look) => {
  try {
    const l = JSON.parse(look);
    return l.pack || (l.shape === 'tub' ? 'Tub' : 'Jar');
  } catch {
    return '';
  }
};

export function whatsappConfirmation(order, items, mpesaReceipt = null, receiptLink = '') {
  const phone = toIntl(order.phone);
  if (!phone || order.channel !== 'website') return null;
  const content = getContent();
  const branch = content.brand.branches.find((b) => b.city === order.branch);
  const products = new Map(db.prepare('SELECT id, size, look FROM products').all().map((p) => [p.id, p]));
  const ref = mpesaReceipt || order.payment_ref;
  const firstName = order.customer_name.trim().split(/\s+/)[0];
  const message = [
    '*Order Confirmed* ✅',
    content.brand.name,
    '',
    `Order: *${order.code}*`,
    ...items.map((i) => {
      const p = products.get(i.product_id);
      return `${i.qty} × ${p ? `${p.size} ${packOf(p.look)}`.trim() : i.name}`;
    }),
    `Paid: *${money(order.total)}*${ref ? ` (M-Pesa ${ref})` : ''}`,
    '',
    `Thank you, ${firstName}! ${order.fulfilment === 'pickup' ? 'Your order is ready for collection.' : `We'll deliver to ${order.address}, ${order.city} soon.`}`,
    branch?.phone ? `Questions? ${branch.city} branch: ${branch.phone}` : '',
    receiptLink ? `\nYour receipt: ${receiptLink}` : '',
  ]
    .join('\n')
    .trim();
  return { phone, message, url: `https://wa.me/${phone.slice(1)}?text=${encodeURIComponent(message)}` };
}

// 2. To the customer, once per order, when it's paid (the admin confirms payment, or M-Pesa does when prompts are on).
export const textOrderConfirmed = run(async (orderId, mpesaReceipt = null) => {
  const x = load(orderId);
  if (!x || !x.settings.customerConfirmed || x.order.channel !== 'website' || alreadySent(orderId, 'customer-confirmed')) return;
  const { order, items, brand, branch } = x;
  const ref = mpesaReceipt || order.payment_ref;
  await sendSms(
    [order.phone],
    [
      `Order Confirmed - ${brand}`,
      `${order.code}: ${itemLine(items)}`,
      `Paid ${money(order.total)}${ref ? ` (M-Pesa ${ref})` : ''}`,
      `Thank you! ${order.fulfilment === 'pickup' ? 'Ready for collection.' : "We'll deliver soon."}${branch?.phone ? ` Call ${branch.city} ${branch.phone}` : ''}`,
    ].join('\n'),
    { kind: 'customer-confirmed', orderId },
  );
});
