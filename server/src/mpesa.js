import { createHash } from 'node:crypto';
import { PUBLIC_URL } from './site.js';

// M-Pesa Express (STK push) through Safaricom's Daraja API: the customer's phone shows the M-Pesa PIN prompt,
// they enter their PIN, and Safaricom tells us the result. Set these in server/.env (see .env.example).
// Each shop will plug in its own Daraja keys (its own Paybill/Till). Until a shop has them, checkout uses
// the Paybill/Till instructions instead, so customers never pay into the platform's account.
const env = {};
const cfg = {
  live: env.MPESA_ENV === 'production',
  key: env.MPESA_CONSUMER_KEY ?? '',
  secret: env.MPESA_CONSUMER_SECRET ?? '',
  shortcode: env.MPESA_SHORTCODE ?? '', // the Paybill (or Till's store number) the API keys belong to
  passkey: env.MPESA_PASSKEY ?? '',
  till: env.MPESA_TILL ?? '', // set for Buy Goods: the till number customers pay
  publicUrl: PUBLIC_URL,
};
// MPESA_API_URL is only for pointing tests at a fake Daraja.
const BASE = env.MPESA_API_URL || (cfg.live ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke');

export const mpesaEnabled = Boolean(cfg.key && cfg.secret && cfg.shortcode && cfg.passkey);
export const mpesaStatus = () => ({
  enabled: mpesaEnabled,
  environment: cfg.live ? 'live' : 'sandbox',
  payTo: cfg.till || cfg.shortcode || null,
  callbacks: Boolean(callbackUrl()),
});

// Safaricom doesn't sign callbacks, so the URL carries a secret only we know.
export const callbackSecret = createHash('sha256').update(`mpesa-callback:${process.env.JWT_SECRET ?? ''}:${cfg.passkey}`).digest('hex').slice(0, 32);
function callbackUrl() {
  return /^https:\/\//.test(cfg.publicUrl) ? `${cfg.publicUrl}/api/mpesa/callback/${callbackSecret}` : null;
}

// 0712 345 678 / +254712345678 / 712345678 → 254712345678. Returns null for anything that isn't a Kenyan mobile.
export function toMsisdn(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  const local = digits.replace(/^(254|0)/, '');
  return /^[17]\d{8}$/.test(local) ? `254${local}` : null;
}

let cachedToken = null;
async function accessToken() {
  if (cachedToken && cachedToken.expires > Date.now()) return cachedToken.value;
  const res = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${Buffer.from(`${cfg.key}:${cfg.secret}`).toString('base64')}` },
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) throw new Error('Could not connect to M-Pesa');
  cachedToken = { value: data.access_token, expires: Date.now() + (Number(data.expires_in) - 60) * 1000 };
  return cachedToken.value;
}

function stamp() {
  // Daraja wants Kenyan time as YYYYMMDDHHmmss.
  const d = new Date(Date.now() + 3 * 3600 * 1000);
  return d.toISOString().replace(/\D/g, '').slice(0, 14);
}

async function call(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function password(timestamp) {
  return Buffer.from(`${cfg.shortcode}${cfg.passkey}${timestamp}`).toString('base64');
}

// Sends the PIN prompt. Resolves to { checkoutId } or throws with a message safe to show the customer.
export async function stkPush({ msisdn, amount, reference, description }) {
  const timestamp = stamp();
  const { ok, data } = await call('/mpesa/stkpush/v1/processrequest', {
    BusinessShortCode: cfg.shortcode,
    Password: password(timestamp),
    Timestamp: timestamp,
    TransactionType: cfg.till ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: msisdn,
    PartyB: cfg.till || cfg.shortcode,
    PhoneNumber: msisdn,
    // Safaricom requires a well-formed https URL even when we can't receive callbacks (local testing);
    // in that case the payment status is fetched with stkQuery instead.
    CallBackURL: callbackUrl() ?? 'https://example.com/mpesa-callback-disabled',
    AccountReference: reference.slice(0, 12),
    TransactionDesc: description.slice(0, 13),
  });
  if (!ok || data.ResponseCode !== '0' || !data.CheckoutRequestID) {
    console.error('STK push rejected:', data.errorMessage ?? data.ResponseDescription ?? data);
    throw new Error('M-Pesa could not send the prompt right now. Please try again or pay with the Paybill below.');
  }
  return { checkoutId: data.CheckoutRequestID };
}

// Asks Safaricom how a prompt ended. Returns { status: 'pending' | 'paid' | 'failed', code, description }.
export async function stkQuery(checkoutId) {
  const timestamp = stamp();
  const { data } = await call('/mpesa/stkpushquery/v1/query', {
    BusinessShortCode: cfg.shortcode,
    Password: password(timestamp),
    Timestamp: timestamp,
    CheckoutRequestID: checkoutId,
  });
  if (data.ResultCode === undefined) return { status: 'pending' }; // "The transaction is being processed"
  return resultOf(data.ResultCode, data.ResultDesc);
}

export function resultOf(code, description) {
  const c = String(code);
  return { status: c === '0' ? 'paid' : 'failed', code: c, description: String(description ?? '') };
}

// Plain-language reasons for the common ways a prompt fails.
export function failureMessage(code) {
  return (
    {
      1: 'Not enough balance in M-Pesa to complete this payment.',
      1032: 'The M-Pesa prompt was cancelled.',
      1037: 'We couldn’t reach your phone. Make sure it’s on and has signal, then try again.',
      2001: 'The M-Pesa PIN was incorrect.',
      1025: 'M-Pesa couldn’t send the prompt. Please try again.',
      1019: 'The prompt expired before it was completed.',
    }[code] ?? 'The payment didn’t go through.'
  );
}
