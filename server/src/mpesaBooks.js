// Bookkeeping from pasted M-Pesa messages: read the message, suggest which order it pays for, and record the
// confirmation. A transaction code can be recorded once only, so the same payment is never counted twice.
import { db, HttpError } from './db.js';
import { parseMpesaMessage, phoneMatches } from './mpesaMessage.js';

export function readMessage(text) {
  const p = parseMpesaMessage(text);
  if (!p?.code) throw new HttpError(400, 'Couldn’t find an M-Pesa transaction code in that message. Paste the whole SMS.');
  if (!p.amount) throw new HttpError(400, 'Couldn’t find the amount in that message. Paste the whole SMS.');
  return p;
}

export const confirmationByCode = (code) =>
  db.prepare('SELECT c.*, o.code AS order_code FROM mpesa_confirmations c LEFT JOIN orders o ON o.id = c.order_id WHERE c.code = ?').get(code);

export function saveConfirmation(orderId, p) {
  const used = confirmationByCode(p.code);
  if (used && used.order_id !== orderId) throw new HttpError(409, `M-Pesa ${p.code} is already recorded on ${used.order_code ?? 'another sale'}.`);
  if (used) return;
  db.prepare(`INSERT INTO mpesa_confirmations (code, order_id, amount, payer, phone, account, paid_at, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(p.code, orderId, p.amount, p.payer, p.phone, p.account, p.paidAt, p.text, new Date().toISOString());
}

export const confirmationsFor = (ids) =>
  ids.length
    ? db.prepare(`SELECT order_id, code, amount, payer, phone, paid_at FROM mpesa_confirmations WHERE order_id IN (${ids.map(() => '?').join(',')})`).all(...ids)
    : [];

// Orders this payment most likely belongs to, best first, each with the reasons it matched.
export function findMatches(p) {
  const recent = new Date(Date.now() - 45 * 86400_000).toISOString();
  const orders = db.prepare("SELECT * FROM orders WHERE status != 'cancelled' AND created_at >= ? ORDER BY created_at DESC LIMIT 500").all(recent);
  const scored = [];
  for (const o of orders) {
    const reasons = [];
    let score = 0;
    if (o.payment_ref && o.payment_ref === p.code) {
      score += 100;
      reasons.push('Customer gave this M-Pesa code');
    }
    if (p.account && p.account.includes(o.code)) {
      score += 90;
      reasons.push('Order number used as the account');
    }
    // Other clues only count for orders still waiting for payment.
    if (score === 0 && o.status !== 'pending') continue;
    if (p.amount === o.total) {
      score += 50;
      reasons.push('Same amount');
    }
    if (phoneMatches(o.phone, p.phone)) {
      score += 35;
      reasons.push('Same phone');
    }
    if (o.payment_claimed_at && o.status === 'pending') {
      score += 10;
      reasons.push('Customer tapped “I’ve paid”');
    }
    if (score >= 35) scored.push({ o, score, reasons });
  }
  return scored
    .sort((a, b) => b.score - a.score || b.o.created_at.localeCompare(a.o.created_at))
    .slice(0, 5)
    .map(({ o, score, reasons }) => ({
      id: o.id,
      code: o.code,
      customer: o.customer_name,
      phone: o.phone,
      branch: o.branch,
      channel: o.channel,
      total: o.total,
      status: o.status,
      createdAt: o.created_at,
      score,
      reasons,
    }));
}
