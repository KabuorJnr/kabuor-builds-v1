import { shopAdmin } from '../platform/shopAdmin.js';
import { Router } from 'express';
import { db, HttpError, tx } from '../db.js';
import { CHANNEL_LABELS, ORDER_STATUSES, PAYMENT_LABELS } from '../config.js';
import { changeCredentials, checkPassword, requireAdmin, requirePasswordChanged, signIn } from '../auth.js';
import { clearCustomerData } from '../clearCustomers.js';
import { defaultContent, defaultStore, getContent, getStore, saveContent, saveStore } from '../content.js';
import { adminPosts } from './posts.js';
import { adminProducts } from './products.js';
import { adminSales } from './sales.js';
import { adminAlerts } from './alerts.js';
import { smsForOrders } from '../sms.js';
import { erpStatus, saveErp, syncOrder, syncWaiting } from '../erpSync.js';
import { textOrderConfirmed, whatsappConfirmation } from '../texts.js';
import { receiptPath, receiptUrl } from '../receipts.js';
import { confirmationsFor, confirmationByCode, findMatches, readMessage, saveConfirmation } from '../mpesaBooks.js';

export const adminRouter = Router();

// ---------- auth ----------
adminRouter.post('/login', (req, res) => {
  res.json(signIn(req.ip, req.body?.username, req.body?.password));
});

adminRouter.use(requireAdmin);

adminRouter.get('/me', (req, res) => res.json(req.admin));
adminRouter.post('/account', (req, res) => res.json(changeCredentials(req.body ?? {})));

// Everything below needs the default password to have been replaced.
adminRouter.use(requirePasswordChanged);

adminRouter.use(adminPosts);
adminRouter.use(adminProducts);
adminRouter.use(adminSales);
adminRouter.use(adminAlerts);
adminRouter.use(shopAdmin);

// ---------- website content & shop settings ----------
adminRouter.get('/content', (req, res) => {
  res.json({ content: getContent(), store: getStore(), defaults: { content: defaultContent(), store: defaultStore() } });
});
adminRouter.put('/content', (req, res) => res.json({ content: saveContent(req.body?.content) }));
adminRouter.put('/store', (req, res) => res.json({ store: saveStore(req.body?.store) }));

// ---------- helpers ----------
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const localStamp = (iso) => {
  const d = new Date(iso);
  return `${dayKey(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// range: 7d | 30d | 90d | 12m | all
function resolveRange(range = '30d') {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  if (range === '12m') {
    return { start: new Date(y, m - 11, 1), prevStart: new Date(y, m - 23, 1), end: now, granularity: 'month' };
  }
  if (range === 'all') {
    const first = db.prepare('SELECT MIN(created_at) AS t FROM orders').get().t;
    const start = first ? new Date(first) : new Date(y, m, 1);
    return { start: new Date(start.getFullYear(), start.getMonth(), 1), prevStart: null, end: now, granularity: 'month' };
  }
  const days = { '7d': 7, '30d': 30, '90d': 90 }[range] ?? 30;
  return { start: new Date(y, m, d - (days - 1)), prevStart: new Date(y, m, d - (2 * days - 1)), end: now, granularity: 'day' };
}

function buckets(start, end, granularity) {
  const keys = [];
  const cur = new Date(start);
  while (cur <= end) {
    keys.push(granularity === 'day' ? dayKey(cur) : monthKey(cur));
    granularity === 'day' ? cur.setDate(cur.getDate() + 1) : cur.setMonth(cur.getMonth() + 1);
  }
  return keys;
}

const bucketSql = (g) => (g === 'day' ? "date(created_at, 'localtime')" : "strftime('%Y-%m', created_at, 'localtime')");

const KPI_SQL = `SELECT COUNT(*) AS orders,
    COALESCE(SUM(total), 0) AS revenue,
    COALESCE(SUM(subtotal), 0) AS sales,
    COALESCE(SUM(items_count), 0) AS units,
    -- Collected: money actually received (payment confirmed). Outstanding: orders still waiting for payment.
    COALESCE(SUM(CASE WHEN status IN ('paid', 'sent', 'delivered') THEN total END), 0) AS collected,
    COALESCE(SUM(CASE WHEN status = 'pending' THEN total END), 0) AS outstanding
  FROM orders WHERE status != 'cancelled' AND created_at >= ? AND created_at < ?`;

function kpis(from, to) {
  const k = db.prepare(KPI_SQL).get(from.toISOString(), to.toISOString());
  return { ...k, aov: k.orders ? Math.round(k.revenue / k.orders) : 0 };
}

// GROUP BY 1 (the first column) because an alias like `id` would collide with orders.id.
const grouped = (column, from, to) =>
  db.prepare(`SELECT ${column} AS id, COUNT(*) AS orders, SUM(total) AS revenue
    FROM orders WHERE status != 'cancelled' AND created_at >= ? AND created_at < ?
    GROUP BY 1 ORDER BY revenue DESC`).all(from, to);

// ---------- analytics ----------
adminRouter.get('/summary', (req, res) => {
  const { start, prevStart, end, granularity } = resolveRange(req.query.range);
  const from = start.toISOString();
  const to = new Date(end.getTime() + 1000).toISOString();

  const rows = db.prepare(`SELECT ${bucketSql(granularity)} AS bucket, SUM(total) AS revenue, COUNT(*) AS orders, SUM(items_count) AS units
    FROM orders WHERE status != 'cancelled' AND created_at >= ? AND created_at < ? GROUP BY bucket`).all(from, to);
  const byBucket = new Map(rows.map((r) => [r.bucket, r]));
  const series = buckets(start, end, granularity).map((key) => ({
    key,
    revenue: byBucket.get(key)?.revenue ?? 0,
    orders: byBucket.get(key)?.orders ?? 0,
    units: byBucket.get(key)?.units ?? 0,
  }));

  const byProduct = db.prepare(`SELECT oi.product_id AS id, oi.name, SUM(oi.qty) AS units, SUM(oi.qty * oi.unit_price) AS revenue
    FROM order_items oi JOIN orders o ON o.id = oi.order_id
    WHERE o.status != 'cancelled' AND o.created_at >= ? AND o.created_at < ?
    GROUP BY oi.product_id ORDER BY revenue DESC`).all(from, to);

  const byPayment = grouped('payment_method', from, to).map((r) => ({ ...r, label: PAYMENT_LABELS[r.id] ?? r.id }));
  const byBranch = grouped("COALESCE(branch, 'Unassigned')", from, to).map((r) => ({ ...r, label: r.id }));
  const byChannel = grouped('channel', from, to).map((r) => ({ ...r, label: CHANNEL_LABELS[r.id] ?? r.id }));
  const byStatus = db.prepare(`SELECT status, COUNT(*) AS orders FROM orders WHERE created_at >= ? AND created_at < ? GROUP BY status`).all(from, to);

  const recent = db.prepare(`SELECT id, code, customer_name, city, branch, channel, total, status, items_count, created_at
    FROM orders ORDER BY created_at DESC LIMIT 6`).all();

  const lowStock = db.prepare('SELECT id, name, stock FROM products WHERE active = 1 AND stock < 30 ORDER BY stock').all();
  const subscribers = db.prepare('SELECT COUNT(*) AS n FROM subscribers').get().n;
  const toConfirm = db.prepare("SELECT COUNT(*) AS n FROM orders WHERE status = 'pending' AND payment_claimed_at IS NOT NULL").get().n;

  res.json({
    range: req.query.range ?? '30d',
    granularity,
    current: kpis(start, new Date(to)),
    previous: prevStart ? kpis(prevStart, start) : null,
    series,
    byProduct,
    byPayment,
    byBranch,
    byChannel,
    byStatus,
    recent,
    lowStock,
    subscribers,
    toConfirm,
  });
});

// ---------- orders ----------
adminRouter.get('/orders', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const where = [];
  const params = [];
  // Customers who tapped "I've paid" and are waiting for the admin to confirm.
  if (req.query.status === 'toconfirm') where.push("status = 'pending' AND payment_claimed_at IS NOT NULL");
  else if (ORDER_STATUSES.includes(req.query.status)) {
    where.push('status = ?');
    params.push(req.query.status);
  }
  if (req.query.channel === 'website') where.push("channel = 'website'");
  if (req.query.channel === 'offline') where.push("channel != 'website'");
  const q = String(req.query.q ?? '').trim();
  if (q) {
    where.push('(code LIKE ? OR customer_name LIKE ? OR phone LIKE ? OR city LIKE ? OR branch LIKE ?)');
    params.push(...Array(5).fill(`%${q}%`));
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = db.prepare(`SELECT COUNT(*) AS n FROM orders ${clause}`).get(...params).n;
  const orders = db.prepare(`SELECT * FROM orders ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);

  const items = orders.length
    ? db.prepare(`SELECT * FROM order_items WHERE order_id IN (${orders.map(() => '?').join(',')})`).all(...orders.map((o) => o.id))
    : [];
  // The M-Pesa receipt of each order paid through the checkout prompt.
  const receipts = orders.length
    ? db.prepare("SELECT order_id, receipt FROM payments WHERE status = 'paid' AND order_id IN (" + orders.map(() => '?').join(',') + ")").all(...orders.map((o) => o.id))
    : [];
  const texts = smsForOrders(orders.map((o) => o.id));
  const mpesa = confirmationsFor(orders.map((o) => o.id));
  res.json({
    total,
    orders: orders.map((o) => ({
      ...o,
      pay_token: undefined,
      channelLabel: CHANNEL_LABELS[o.channel] ?? o.channel,
      paymentLabel: PAYMENT_LABELS[o.payment_method] ?? o.payment_method,
      items: items.filter((i) => i.order_id === o.id),
      mpesaReceipt: receipts.find((r) => r.order_id === o.id)?.receipt ?? null,
      texts: texts.filter((t) => t.order_id === o.id),
      receipt_token: undefined,
      mpesa: mpesa.find((m) => m.order_id === o.id) ?? null,
      receiptPath: receiptPath(o),
      whatsapp: whatsappConfirmation(o, items.filter((i) => i.order_id === o.id), receipts.find((r) => r.order_id === o.id)?.receipt, receiptUrl(o, req)),
    })),
  });
});

adminRouter.patch('/orders/:id', (req, res) => {
  const { status } = req.body ?? {};
  if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, 'Unknown status');
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(Number(req.params.id));
  if (!order) throw new HttpError(404, 'Order not found');

  // Cancelling returns stock to the shelf; un-cancelling takes it back (only if the order took stock).
  if (order.stock_deducted) {
    const items = db.prepare('SELECT product_id, qty FROM order_items WHERE order_id = ?').all(order.id);
    const restock = db.prepare('UPDATE products SET stock = MAX(stock + ?, 0) WHERE id = ?');
    if (status === 'cancelled' && order.status !== 'cancelled') items.forEach((i) => restock.run(i.qty, i.product_id));
    if (status !== 'cancelled' && order.status === 'cancelled') items.forEach((i) => restock.run(-i.qty, i.product_id));
  }

  db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').run(status, new Date().toISOString(), order.id);
  // The customer's "Order Confirmed" text goes out when payment is confirmed (once per order).
  if (status === 'paid' && order.status !== 'paid') textOrderConfirmed(order.id);
  if (['paid', 'sent', 'delivered'].includes(status)) syncOrder(order.id);
  res.json({ ...order, status, pay_token: undefined });
});

// ---------- Kabuor ERP: paid orders become invoices there ----------
adminRouter.get('/erp', (req, res) => res.json(erpStatus()));
adminRouter.put('/erp', (req, res) => res.json(saveErp(req.body ?? {})));
adminRouter.post('/erp/sync', async (req, res) => {
  await syncWaiting();
  res.json(erpStatus());
});

// ---------- handover: clear customer data ----------
// Deletes every customer/order record (products, content and the admin login stay). Needs the password and "CLEAR".
adminRouter.post('/clear-customer-data', (req, res) => {
  if (String(req.body?.confirm ?? '').trim().toUpperCase() !== 'CLEAR') throw new HttpError(400, 'Type CLEAR to confirm');
  if (!checkPassword(req.body?.password)) throw new HttpError(403, 'That password is not right');
  const { removed, backup } = clearCustomerData();
  res.json({ removed, backup: backup.split(/[\\/]/).pop() });
});

// ---------- pasted M-Pesa messages ----------
// Read a pasted confirmation SMS and suggest the orders it may pay for.
adminRouter.post('/mpesa/read', (req, res) => {
  const p = readMessage(req.body?.text);
  const used = confirmationByCode(p.code);
  const { text, ...message } = p;
  res.json({ message, used: used ? { orderId: used.order_id, orderCode: used.order_code } : null, matches: findMatches(p) });
});

// Confirm an order's payment from the pasted message: records the code and marks the order paid.
adminRouter.post('/orders/:id/mpesa', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(Number(req.params.id));
  if (!order) throw new HttpError(404, 'Order not found');
  if (order.status === 'cancelled') throw new HttpError(409, 'This order is cancelled. Change its status first.');
  const p = readMessage(req.body?.text);
  const now = new Date().toISOString();
  tx(() => {
    saveConfirmation(order.id, p);
    db.prepare("UPDATE orders SET payment_ref = ?, status = CASE WHEN status = 'pending' THEN 'paid' ELSE status END, updated_at = ? WHERE id = ?").run(p.code, now, order.id);
  });
  if (order.status === 'pending') textOrderConfirmed(order.id);
  res.json({
    id: order.id,
    code: order.code,
    status: order.status === 'pending' ? 'paid' : order.status,
    ref: p.code,
    short: p.amount < order.total ? order.total - p.amount : 0,
  });
});

// The admin opened the "Order Confirmed" WhatsApp message for this order (recorded so the list shows it).
adminRouter.post('/orders/:id/whatsapp', (req, res) => {
  const now = new Date().toISOString();
  const { changes } = db.prepare('UPDATE orders SET whatsapp_confirmed_at = ? WHERE id = ?').run(now, Number(req.params.id));
  if (!changes) throw new HttpError(404, 'Order not found');
  res.json({ whatsapp_confirmed_at: now });
});

// ---------- bookkeeping ledger ----------
function ledgerRows(range, group) {
  const { start, end } = resolveRange(range);
  const g = group === 'day' ? 'day' : 'month';
  const rows = db.prepare(`SELECT ${bucketSql(g)} AS period,
      COUNT(*) AS orders, SUM(items_count) AS units, SUM(subtotal) AS sales, SUM(delivery_fee) AS delivery,
      SUM(total) AS revenue,
      COALESCE(SUM(CASE WHEN status IN ('paid', 'sent', 'delivered') THEN total END), 0) AS collected,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN total END), 0) AS unpaid
    FROM orders WHERE status != 'cancelled' AND created_at >= ? AND created_at < ?
    GROUP BY period ORDER BY period DESC`).all(start.toISOString(), new Date(end.getTime() + 1000).toISOString());
  const totals = rows.reduce(
    (t, r) => {
      for (const k of ['orders', 'units', 'sales', 'delivery', 'revenue', 'collected', 'unpaid']) t[k] += r[k];
      return t;
    },
    { orders: 0, units: 0, sales: 0, delivery: 0, revenue: 0, collected: 0, unpaid: 0 },
  );
  return { rows, totals, from: start.toISOString(), to: end.toISOString() };
}

adminRouter.get('/ledger', (req, res) => {
  res.json(ledgerRows(req.query.range ?? '12m', req.query.group));
});

const money = (minor) => (minor / 100).toFixed(2);
const csvCell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? ''));
const toCsv = (rows) => rows.map((r) => r.map(csvCell).join(',')).join('\r\n');

adminRouter.get('/ledger.csv', (req, res) => {
  const range = req.query.range ?? '12m';
  let csv;
  if (req.query.type === 'transactions') {
    const { start, end } = resolveRange(range);
    const orders = db.prepare(`SELECT * FROM orders WHERE created_at >= ? AND created_at < ? ORDER BY created_at`)
      .all(start.toISOString(), new Date(end.getTime() + 1000).toISOString());
    csv = toCsv([
      ['Date', 'Order', 'Channel', 'Customer', 'Branch', 'Town', 'Payment', 'M-Pesa code', 'Status', 'Units', 'Sales', 'Delivery', 'Total', 'Collected'],
      ...orders.map((o) => [
        localStamp(o.created_at), o.code, CHANNEL_LABELS[o.channel] ?? o.channel, o.customer_name, o.branch ?? '', o.city,
        PAYMENT_LABELS[o.payment_method] ?? o.payment_method, o.payment_ref ?? '', o.status, o.items_count,
        money(o.subtotal), money(o.delivery_fee), money(o.total), money(['paid', 'sent', 'delivered'].includes(o.status) ? o.total : 0),
      ]),
    ]);
  } else {
    const { rows, totals } = ledgerRows(range, req.query.group);
    const line = (label, r) => [label, r.orders, r.units, money(r.sales), money(r.delivery), money(r.revenue), money(r.collected), money(r.unpaid)];
    csv = toCsv([
      ['Period', 'Orders', 'Units', 'Sales', 'Delivery', 'Total', 'Collected', 'Unpaid'],
      ...rows.map((r) => line(r.period, r)),
      line('TOTAL', totals),
    ]);
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="ledger-${range}-${dayKey(new Date())}.csv"`);
  res.send('﻿' + csv);
});
