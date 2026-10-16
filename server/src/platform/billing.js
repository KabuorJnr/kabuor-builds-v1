// Subscriptions: the owner pays the platform by M-Pesa prompt (STK push) on their phone. Each payment adds a
// month (or a year) to the shop's paid period. Without the platform's Daraja keys this runs in test mode:
// no prompt is sent and the payment completes by itself after a few seconds, clearly marked as a test.
import { HttpError } from '../db.js';
import { failureMessage, platformMpesaReady, resultOf, stkPush, stkQuery, toMsisdn } from './daraja.js';
import { getShopRecord, now, pdb, updateShop } from './store.js';

export const PRICES = {
  monthly: Number(process.env.PLATFORM_PRICE_MONTHLY) || 1500,
  yearly: Number(process.env.PLATFORM_PRICE_YEARLY) || 15000,
};
export const PLAN_LABELS = { monthly: '1 month', yearly: '12 months' };
export const testMode = !platformMpesaReady;

const addPeriod = (from, plan) => {
  const d = new Date(Math.max(Date.now(), from ? Date.parse(from) : 0));
  d.setMonth(d.getMonth() + (plan === 'yearly' ? 12 : 1));
  return d.toISOString();
};

/** Sends the M-Pesa prompt for a shop's subscription. Returns the payment row's id. */
export async function startPayment(slug, { phone, plan }) {
  const shop = getShopRecord(slug);
  if (!shop) throw new HttpError(404, 'Shop not found');
  if (!PRICES[plan]) throw new HttpError(400, 'Choose monthly or yearly');
  const msisdn = toMsisdn(phone);
  if (!msisdn) throw new HttpError(400, 'Enter the Safaricom number to send the M-Pesa prompt to, e.g. 0712 345 678');
  const amount = PRICES[plan];

  let checkoutId;
  if (testMode) {
    checkoutId = `TEST-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  } else {
    ({ checkoutId } = await stkPush({ msisdn, amount, reference: slug, description: 'Shop plan' }).catch((err) => {
      throw new HttpError(502, err.message);
    }));
  }
  const at = now();
  const { lastInsertRowid } = pdb
    .prepare('INSERT INTO payments (slug, checkout_id, phone, amount, plan, test, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(slug, checkoutId, msisdn, amount, plan, testMode ? 1 : 0, at, at);
  // Test mode: "the customer enters their PIN" five seconds later.
  if (testMode) setTimeout(() => settle(checkoutId, resultOf(0, 'Test payment'), `TEST${String(lastInsertRowid).padStart(6, '0')}`), 5000).unref();
  return Number(lastInsertRowid);
}

/** Records how a prompt ended (from Safaricom's callback, a status query, or test mode). */
export function settle(checkoutId, result, receipt = null) {
  const p = pdb.prepare('SELECT * FROM payments WHERE checkout_id = ?').get(checkoutId);
  if (!p || p.status !== 'pending') return p;
  pdb.prepare('UPDATE payments SET status = ?, result_code = ?, result_desc = ?, receipt = ?, updated_at = ? WHERE id = ?').run(
    result.status, result.code, result.description, receipt, now(), p.id,
  );
  if (result.status === 'paid') {
    const shop = getShopRecord(p.slug);
    updateShop(p.slug, {
      paid_until: addPeriod(shop.paid_until, p.plan),
      plan: p.plan,
      status: shop.status === 'pending' ? 'setup' : shop.status === 'paused' ? 'live' : shop.status,
    });
  }
  return pdb.prepare('SELECT * FROM payments WHERE id = ?').get(p.id);
}

/** A payment's status for the owner's screen; asks Safaricom when the callback hasn't arrived yet. */
export async function paymentStatus(slug, id) {
  let p = pdb.prepare('SELECT * FROM payments WHERE id = ? AND slug = ?').get(Number(id), slug);
  if (!p) throw new HttpError(404, 'Payment not found');
  const age = Date.now() - Date.parse(p.created_at);
  const lastCheck = p.checked_at ? Date.now() - Date.parse(p.checked_at) : Infinity;
  if (p.status === 'pending' && !p.test && age > 10_000 && lastCheck > 8_000) {
    pdb.prepare('UPDATE payments SET checked_at = ? WHERE id = ?').run(now(), p.id);
    const r = await stkQuery(p.checkout_id).catch(() => ({ status: 'pending' }));
    if (r.status !== 'pending') p = settle(p.checkout_id, r);
  }
  // Nobody answered the prompt in two minutes: treat it as failed so they can try again.
  if (p.status === 'pending' && age > 120_000) p = settle(p.checkout_id, resultOf(1019, 'Expired'));
  const shop = getShopRecord(slug);
  return {
    id: p.id,
    status: p.status,
    message: p.status === 'failed' ? failureMessage(p.result_code) : p.status === 'paid' ? 'Payment received. Thank you!' : 'Waiting for you to enter your M-Pesa PIN…',
    receipt: p.receipt,
    amount: p.amount,
    test: Boolean(p.test),
    paidUntil: shop.paid_until,
  };
}

export function billingSummary(slug) {
  const shop = getShopRecord(slug);
  const history = pdb
    .prepare("SELECT id, amount, plan, receipt, test, created_at FROM payments WHERE slug = ? AND status = 'paid' ORDER BY id DESC LIMIT 24")
    .all(slug)
    .map((p) => ({ ...p, test: Boolean(p.test) }));
  return { plan: shop.plan, paidUntil: shop.paid_until, prices: PRICES, testMode, phone: shop.phone, history };
}
