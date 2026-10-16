import { db } from './db.js';

// SMS through Africa's Talking. Set AT_USERNAME and AT_API_KEY (and optionally AT_SENDER_ID) in the
// environment; without them no texts are sent and everything else works as before.
const env = process.env;
const cfg = {
  username: env.AT_USERNAME ?? '',
  apiKey: env.AT_API_KEY ?? '',
  from: env.AT_SENDER_ID ?? '',
};
const sandbox = cfg.username.toLowerCase() === 'sandbox';
// AT_API_URL is only for pointing tests at a fake Africa's Talking.
const BASE = `${env.AT_API_URL || (sandbox ? 'https://api.sandbox.africastalking.com' : 'https://api.africastalking.com')}/version1`;

export const smsEnabled = Boolean(cfg.username && cfg.apiKey);
export const smsStatus = () => ({ enabled: smsEnabled, environment: sandbox ? 'sandbox' : 'live', sender: cfg.from || null });

// 0712 345 678 → +254712345678. Numbers already in international form (+256…, 256…) are kept.
export function toIntl(phone) {
  let d = String(phone ?? '').trim();
  const plus = d.startsWith('+');
  d = d.replace(/\D/g, '');
  if (plus) return d.length >= 9 ? `+${d}` : null;
  if (/^0[17]\d{8}$/.test(d)) return `+254${d.slice(1)}`;
  if (/^[17]\d{8}$/.test(d)) return `+254${d}`;
  if (/^2\d{10,12}$/.test(d)) return `+${d}`;
  return null;
}

// Keep messages in the basic SMS alphabet: one fancy character (’, ·, –) makes every page hold 70
// characters instead of 160, which doubles or triples the cost.
export function plain(text) {
  return String(text)
    .replace(/[‘’`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—·•]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\S\n]+/g, ' ')
    .trim();
}

const log = { run: (...args) => db.prepare(`INSERT INTO sms_log (order_id, kind, phone, message, status, cost, error, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(...args) };

// Has this order already had this text (e.g. its receipt)? Used to avoid sending twice.
export const alreadySent = (orderId, kind) =>
  Boolean(db.prepare("SELECT 1 FROM sms_log WHERE order_id = ? AND kind = ? AND status = 'sent'").get(orderId, kind));

export const smsForOrders = (ids) =>
  ids.length
    ? db.prepare(`SELECT order_id, kind, phone, status, error, created_at FROM sms_log WHERE order_id IN (${ids.map(() => '?').join(',')}) ORDER BY id`).all(...ids)
    : [];

// Account balance, e.g. "KES 120.0000". Also proves the username and key work.
export async function smsBalance() {
  if (!smsEnabled) return null;
  const res = await fetch(`${BASE}/user?username=${encodeURIComponent(cfg.username)}`, {
    headers: { apiKey: cfg.apiKey, Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw.slice(0, 200) || `HTTP ${res.status}`);
  return JSON.parse(raw)?.UserData?.balance ?? null;
}

// Sends one message to one or more numbers. Never throws: a failed text must not break an order.
// Resolves to [{ phone, status: 'sent' | 'failed', cost, error }].
export async function sendSms(numbers, message, { kind = 'other', orderId = null } = {}) {
  const now = new Date().toISOString();
  const to = [...new Set(numbers.map(toIntl).filter(Boolean))];
  const text = plain(message);
  if (!smsEnabled || !to.length) return [];

  let results;
  try {
    const res = await fetch(`${BASE}/messaging`, {
      method: 'POST',
      headers: { apiKey: cfg.apiKey, Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: cfg.username, to: to.join(','), message: text, ...(cfg.from ? { from: cfg.from } : {}) }),
      signal: AbortSignal.timeout(15000),
    });
    const raw = await res.text();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch {
      // Africa's Talking answers some errors (e.g. a wrong API key) in plain text.
    }
    const recipients = data?.SMSMessageData?.Recipients;
    if (!res.ok || !Array.isArray(recipients)) {
      const error = (data?.SMSMessageData?.Message || raw || `HTTP ${res.status}`).slice(0, 200);
      results = to.map((phone) => ({ phone, status: 'failed', cost: null, error }));
    } else {
      results = to.map((phone) => {
        const r = recipients.find((x) => x.number === phone);
        // 100 processed, 101 sent, 102 queued; anything else failed (e.g. 403 invalid number, 405 no balance).
        const ok = r && [100, 101, 102].includes(Number(r.statusCode));
        return { phone, status: ok ? 'sent' : 'failed', cost: r?.cost ?? null, error: ok ? null : r?.status ?? 'No response for this number' };
      });
    }
  } catch (err) {
    results = to.map((phone) => ({ phone, status: 'failed', cost: null, error: err.message }));
  }

  for (const r of results) {
    log.run(orderId, kind, r.phone, text, r.status, r.cost, r.error, now);
    if (r.status === 'failed') console.error(`SMS to ${r.phone} failed: ${r.error}`);
  }
  return results;
}
