import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { db, tx, HttpError, toProduct } from '../db.js';
import { orderCode } from '../seed.js';
import { syncOrder } from '../erpSync.js';
import { currency, paymentMethods } from '../config.js';
import { getContent, getStore } from '../content.js';
import { callbackSecret, failureMessage, mpesaEnabled, resultOf, stkPush, stkQuery, toMsisdn } from '../mpesa.js';
import { notifyAdmins } from '../push.js';
import { receiptData } from '../receipts.js';
import { textNewOrder, textOrderConfirmed } from '../texts.js';

export const publicRouter = Router();

publicRouter.get('/config', (req, res) => {
  const store = getStore();
  res.json({
    currency: currency(),
    deliveryEnabled: store.deliveryEnabled,
    deliveryFee: store.deliveryFee,
    freeDeliveryThreshold: store.freeDeliveryThreshold,
    deliveryNote: store.deliveryNote,
    pickup: store.pickup,
    paybill: store.paybill,
    mpesaPrompt: mpesaEnabled(),
    paymentMethods: paymentMethods(store),
  });
});

publicRouter.get('/content', (req, res) => {
  res.json({ content: getContent() });
});

publicRouter.get('/products', (req, res) => {
  const rows = db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY sort, name').all();
  res.json(rows.map((r) => toProduct(r)));
});

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

publicRouter.post('/orders', async (req, res) => {
  const body = req.body ?? {};
  const store = getStore();
  const delivery = store.deliveryEnabled;
  const customer = {
    name: text(body.name, 80),
    phone: text(body.phone, 20).replace(/[\s-]/g, ''),
    email: text(body.email, 120) || null,
    address: text(body.address, 200),
    city: text(body.city, 60),
    note: text(body.note, 300) || null,
    payment: text(body.paymentMethod, 20),
    branch: text(body.branch, 30) || null,
  };
  const branches = getContent().brand.branches.map((b) => b.city);

  if (customer.name.length < 2) throw new HttpError(400, 'Please enter your name');
  if (!/^\+?\d{9,15}$/.test(customer.phone)) throw new HttpError(400, 'Please enter a valid phone number');
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw new HttpError(400, 'Please enter a valid email');
  if (delivery) {
    if (customer.address.length < 4) throw new HttpError(400, 'Please enter a delivery address');
    if (customer.city.length < 2) throw new HttpError(400, 'Please enter your town or city');
  } else {
    customer.address = `${store.pickup.name}, ${store.pickup.address}`;
    customer.city = 'Pickup';
  }
  if (branches.length && !branches.includes(customer.branch)) throw new HttpError(400, 'Choose your nearest branch');
  if (!paymentMethods(store).some((m) => m.id === customer.payment)) throw new HttpError(400, 'Choose a payment method');
  const prompt = mpesaEnabled() && customer.payment === 'mpesa';
  if (prompt && !toMsisdn(customer.phone)) throw new HttpError(400, 'Enter your M-Pesa number, e.g. 0712 345 678, to get the payment prompt');

  const requested = new Map();
  for (const item of Array.isArray(body.items) ? body.items.slice(0, 30) : []) {
    const qty = Number(item?.qty);
    if (typeof item?.id !== 'string' || !Number.isInteger(qty) || qty < 1 || qty > 50) {
      throw new HttpError(400, 'Your cart has an invalid item');
    }
    requested.set(item.id, (requested.get(item.id) ?? 0) + qty);
  }
  if (requested.size === 0) throw new HttpError(400, 'Your cart is empty');

  const order = tx(() => {
    const getProduct = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1');
    const lines = [];
    for (const [id, qty] of requested) {
      const p = getProduct.get(id);
      if (!p) throw new HttpError(400, 'One of the items is no longer available');
      if (p.stock < qty) throw new HttpError(409, `Only ${p.stock} × ${p.name} left in stock`);
      lines.push({ p, qty });
    }

    // Prices always come from the database, never from the client.
    const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
    const costTotal = lines.reduce((s, l) => s + l.p.cost * l.qty, 0);
    const units = lines.reduce((s, l) => s + l.qty, 0);
    const fee = !delivery || subtotal >= store.freeDeliveryThreshold ? 0 : store.deliveryFee;
    const now = new Date().toISOString();

    const payToken = randomBytes(16).toString('hex');
    let code = orderCode();
    while (db.prepare('SELECT 1 FROM orders WHERE code = ?').get(code)) code = orderCode();

    const { lastInsertRowid } = db.prepare(`INSERT INTO orders (code, customer_name, phone, email, address, city, note, payment_method, fulfilment, branch, status, subtotal, delivery_fee, total, cost_total, items_count, pay_token, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      code, customer.name, customer.phone, customer.email, customer.address, customer.city, customer.note,
      customer.payment, delivery ? 'delivery' : 'pickup', customer.branch, subtotal, fee, subtotal + fee, costTotal, units, payToken, now, now,
    );

    const addItem = db.prepare('INSERT INTO order_items (order_id, product_id, name, unit_price, unit_cost, qty) VALUES (?, ?, ?, ?, ?, ?)');
    const takeStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
    for (const { p, qty } of lines) {
      addItem.run(lastInsertRowid, p.id, p.name, p.price, p.cost, qty);
      takeStock.run(qty, p.id);
    }

    return {
      id: Number(lastInsertRowid),
      code,
      payToken,
      subtotal,
      deliveryFee: fee,
      total: subtotal + fee,
      items: lines.map(({ p, qty }) => ({ id: p.id, name: p.name, qty, unitPrice: p.price })),
      paymentMethod: customer.payment,
      fulfilment: delivery ? 'delivery' : 'pickup',
      branch: customer.branch,
      createdAt: now,
    };
  });

  const { id, ...publicOrder } = order;
  const units = order.items.reduce((s, i) => s + i.qty, 0);
  notifyAdmins({
    title: `New order ${order.code} · ${money(order.total)}`,
    body: `${customer.name} · ${customer.branch ? `${customer.branch} branch · ` : ''}${units} item${units === 1 ? '' : 's'} · ${PAYMENT_NAMES[customer.payment] ?? customer.payment}`,
    tag: order.code,
    url: `/admin/orders?q=${order.code}`,
  });
  textNewOrder(id);

  // M-Pesa Express: send the PIN prompt now. If it fails the order still stands and the customer can retry.
  const payment = prompt ? await startPayment({ id, total: order.total, code: order.code }, customer.phone) : null;
  res.status(201).json({ ...publicOrder, payment });
});

const PAYMENT_NAMES = { mpesa: 'M-Pesa', cod: 'Cash on delivery' };
const money = (cents) => `${currency()} ${Math.round(cents / 100).toLocaleString('en-KE')}`;

// ---------- M-Pesa Express ----------
async function startPayment(order, phone) {
  const msisdn = toMsisdn(phone);
  if (!msisdn) return { status: 'failed', message: 'Enter a valid M-Pesa number, e.g. 0712 345 678' };
  const amount = Math.ceil(order.total / 100);
  const now = new Date().toISOString();
  try {
    const { checkoutId } = await stkPush({ msisdn, amount, reference: order.code, description: `Order ${order.code}` });
    db.prepare(`INSERT INTO payments (order_id, checkout_id, phone, amount, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'pending', ?, ?)`)
      .run(order.id, checkoutId, msisdn, amount, now, now);
    return { status: 'pending', phone: msisdn };
  } catch (err) {
    db.prepare(`INSERT INTO payments (order_id, phone, amount, status, result_desc, created_at, updated_at) VALUES (?, ?, ?, 'failed', ?, ?, ?)`)
      .run(order.id, msisdn, amount, err.message, now, now);
    return { status: 'failed', message: err.message };
  }
}

// Records how a prompt ended (from Safaricom's callback or a status query). Safe to call more than once.
function settlePayment(payment, { status, code, description }, receipt = null) {
  if (status === 'pending') return;
  const now = new Date().toISOString();
  const changed = db.prepare(`UPDATE payments SET status = ?, result_code = ?, result_desc = ?, receipt = ?, checked_at = ?, updated_at = ?
    WHERE id = ? AND status = 'pending'`).run(status, code, description, receipt, now, now, payment.id).changes;
  if (!changed || status !== 'paid') return;

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(payment.order_id);
  if (order?.status === 'pending') db.prepare("UPDATE orders SET status = 'paid', updated_at = ? WHERE id = ?").run(now, order.id);
  if (order) textOrderConfirmed(order.id, receipt);
  if (order) syncOrder(order.id);
  notifyAdmins({
    title: `Paid ✓ ${order?.code} · ${money(payment.amount * 100)}`,
    body: `M-Pesa${receipt ? ` ${receipt}` : ''} from ${order?.customer_name ?? payment.phone}`,
    tag: `${order?.code}-paid`,
  });
}

function paymentView(p) {
  if (!p) return null;
  return {
    status: p.status,
    phone: p.phone,
    receipt: p.receipt,
    message: p.status === 'failed' ? (p.result_code ? failureMessage(p.result_code) : p.result_desc) : null,
  };
}

function orderForCustomer(req) {
  const order = db.prepare("SELECT * FROM orders WHERE code = ? AND channel = 'website'").get(String(req.params.code));
  const token = String(req.body?.token ?? req.query.token ?? '');
  if (!order || !order.pay_token || token !== order.pay_token) throw new HttpError(404, 'Order not found');
  return order;
}

const latestPayment = (orderId) => db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1').get(orderId);

// Paybill: the customer says they've paid. The admin is alerted to check M-Pesa and confirm.
publicRouter.post('/orders/:code/paid', (req, res) => {
  const order = orderForCustomer(req);
  const ref = String(req.body?.ref ?? '').replace(/\s/g, '').toUpperCase();
  if (ref && !/^[A-Z0-9]{10}$/.test(ref)) throw new HttpError(400, 'An M-Pesa code has 10 letters and numbers, e.g. QJK1ABC2DE');
  if (order.status === 'cancelled') throw new HttpError(409, 'This order was cancelled. Please call the branch.');
  if (order.status !== 'pending') return res.json({ status: order.status, ref: order.payment_ref });

  // Alert once, and again only if they add or change the code.
  const isNew = !order.payment_claimed_at || (ref && ref !== order.payment_ref);
  const now = new Date().toISOString();
  db.prepare('UPDATE orders SET payment_claimed_at = COALESCE(payment_claimed_at, ?), payment_ref = COALESCE(?, payment_ref), updated_at = ? WHERE id = ?')
    .run(now, ref || null, now, order.id);
  if (isNew) {
    notifyAdmins({
      title: `Payment to confirm · ${order.code} · ${money(order.total)}`,
      body: `${order.customer_name} says they paid by M-Pesa${ref ? ` (code ${ref})` : ''}. Check your M-Pesa and confirm.`,
      tag: `${order.code}-claim`,
      url: `/admin/orders?q=${order.code}`,
    });
  }
  res.json({ status: 'pending', ref: ref || order.payment_ref });
});

// Customer asks for the prompt again (cancelled, timed out, or paying from another number).
publicRouter.post('/orders/:code/pay', async (req, res) => {
  if (!mpesaEnabled()) throw new HttpError(400, 'M-Pesa prompts are not available right now');
  const order = orderForCustomer(req);
  if (order.status !== 'pending') throw new HttpError(409, order.status === 'paid' ? 'This order is already paid' : 'This order can no longer be paid online');
  const last = latestPayment(order.id);
  if (last?.status === 'paid') throw new HttpError(409, 'This order is already paid');
  if (last?.status === 'pending' && Date.now() - Date.parse(last.created_at) < 30_000) {
    throw new HttpError(429, 'A prompt was just sent. Check your phone, or try again in a few seconds.');
  }
  const attempts = db.prepare('SELECT COUNT(*) AS n FROM payments WHERE order_id = ?').get(order.id).n;
  if (attempts >= 6) throw new HttpError(429, 'Too many attempts. Please pay with the Paybill details or call the branch.');
  res.json({ payment: await startPayment(order, req.body?.phone || order.phone) });
});

// The checkout screen polls this while the customer enters their PIN.
publicRouter.get('/orders/:code/payment', async (req, res) => {
  const order = orderForCustomer(req);
  let p = latestPayment(order.id);
  // If Safaricom's callback can't reach us (e.g. running locally), ask Daraja directly, at most every 5 seconds.
  const age = p ? Date.now() - Date.parse(p.created_at) : 0;
  const sinceCheck = p?.checked_at ? Date.now() - Date.parse(p.checked_at) : Infinity;
  if (p?.status === 'pending' && p.checkout_id && age > 8000 && sinceCheck > 5000) {
    db.prepare('UPDATE payments SET checked_at = ? WHERE id = ?').run(new Date().toISOString(), p.id);
    try {
      settlePayment(p, await stkQuery(p.checkout_id));
    } catch (err) {
      console.error('STK query failed:', err.message);
    }
    p = latestPayment(order.id);
  }
  res.json({ orderStatus: db.prepare('SELECT status FROM orders WHERE id = ?').get(order.id).status, payment: paymentView(p) });
});

// Safaricom posts the result of every prompt here.
publicRouter.post('/mpesa/callback/:secret', (req, res) => {
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  if (req.params.secret !== callbackSecret()) return;
  const cb = req.body?.Body?.stkCallback;
  if (!cb?.CheckoutRequestID) return;
  const payment = db.prepare('SELECT * FROM payments WHERE checkout_id = ?').get(String(cb.CheckoutRequestID));
  if (!payment) return;
  const meta = Object.fromEntries((cb.CallbackMetadata?.Item ?? []).map((i) => [i.Name, i.Value]));
  const result = resultOf(cb.ResultCode, cb.ResultDesc);
  // Never accept a "paid" for less than we asked for.
  if (result.status === 'paid' && Number(meta.Amount) < payment.amount) {
    settlePayment(payment, { status: 'failed', code: 'amount', description: `Paid ${meta.Amount}, expected ${payment.amount}` });
    return;
  }
  settlePayment(payment, result, meta.MpesaReceiptNumber ? String(meta.MpesaReceiptNumber) : null);
});

// A customer's receipt, opened from the link in their "Order Confirmed" message.
publicRouter.get('/receipts/:code', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE code = ?').get(String(req.params.code));
  if (!order || !order.receipt_token || String(req.query.t ?? '') !== order.receipt_token) throw new HttpError(404, 'Receipt not found');
  res.set('Cache-Control', 'no-store');
  res.json(receiptData(order));
});

publicRouter.post('/subscribe', (req, res) => {
  const email = text(req.body?.email, 120).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Please enter a valid email');
  db.prepare('INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, ?)').run(email, new Date().toISOString());
  res.status(201).json({ ok: true });
});
