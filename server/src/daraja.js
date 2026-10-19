// M-Pesa Express (STK push) through Safaricom's Daraja API: the payer's phone shows the M-Pesa PIN prompt,
// they enter their PIN, and Safaricom tells us the result (by callback, or when we ask with a status query).
// One client per set of keys: the platform's own (subscriptions) and each shop's (its customers' orders).
import { createHash } from 'node:crypto';

const SANDBOX = 'https://sandbox.safaricom.co.ke';
const LIVE = 'https://api.safaricom.co.ke';

// 0712 345 678 / +254712345678 / 712345678 → 254712345678. Returns null for anything that isn't a Kenyan mobile.
export function toMsisdn(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  const local = digits.replace(/^(254|0)/, '');
  return /^[17]\d{8}$/.test(local) ? `254${local}` : null;
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
      1037: 'We couldn’t reach the phone. Make sure it’s on and has signal, then try again.',
      2001: 'The M-Pesa PIN was incorrect.',
      1025: 'M-Pesa couldn’t send the prompt. Please try again.',
      1019: 'The prompt expired before it was completed.',
    }[code] ?? 'The payment didn’t go through.'
  );
}

// Daraja wants Kenyan time as YYYYMMDDHHmmss.
const stamp = () => new Date(Date.now() + 3 * 3600 * 1000).toISOString().replace(/\D/g, '').slice(0, 14);

const tokens = new Map(); // access tokens, per set of keys

/**
 * A Daraja client for one set of keys:
 *   { env: 'sandbox' | 'production', key, secret, shortcode, passkey, till, callbackBase, apiUrl }
 * shortcode is the Paybill (or a Till's store number) the keys belong to; till is the number customers pay
 * for Buy Goods. callbackBase is the https address Safaricom should post results to (without it, results
 * are fetched with status queries). apiUrl is only for pointing tests at a fake Daraja.
 */
export function daraja(cfg, { callbackPath, secretSalt }) {
  const base = cfg.apiUrl || (cfg.env === 'production' ? LIVE : SANDBOX);
  const ready = Boolean(cfg.key && cfg.secret && cfg.shortcode && cfg.passkey);
  // Safaricom doesn't sign callbacks, so the URL carries a secret only we know.
  const callbackSecret = createHash('sha256').update(`${secretSalt}:${cfg.passkey}`).digest('hex').slice(0, 32);
  const callbackUrl = /^https:\/\//.test(cfg.callbackBase ?? '') ? `${cfg.callbackBase}${callbackPath}/${callbackSecret}` : null;
  const cacheKey = createHash('sha256').update(`${base}|${cfg.key}|${cfg.secret}`).digest('hex');

  async function accessToken() {
    const cached = tokens.get(cacheKey);
    if (cached && cached.expires > Date.now()) return cached.value;
    const res = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${Buffer.from(`${cfg.key}:${cfg.secret}`).toString('base64')}` },
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) {
      throw new Error(res.status === 400 || res.status === 401 ? 'M-Pesa rejected the consumer key or secret.' : 'Could not connect to M-Pesa.');
    }
    tokens.set(cacheKey, { value: data.access_token, expires: Date.now() + (Number(data.expires_in) - 60) * 1000 });
    return data.access_token;
  }

  async function call(path, body) {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    return { ok: res.ok, data: await res.json().catch(() => ({})) };
  }
  const password = (timestamp) => Buffer.from(`${cfg.shortcode}${cfg.passkey}${timestamp}`).toString('base64');

  return {
    ready,
    callbackSecret,
    /** Signs in to Daraja with the consumer key and secret (sends nothing to anyone's phone). */
    checkKeys: () => accessToken().then(() => true),
    status: () => ({ enabled: ready, environment: cfg.env === 'production' ? 'live' : 'sandbox', payTo: cfg.till || cfg.shortcode || null, callbacks: Boolean(callbackUrl) }),

    /** Sends the PIN prompt. Resolves to { checkoutId } or throws with a message safe to show the payer. */
    async stkPush({ msisdn, amount, reference, description }) {
      const timestamp = stamp();
      const { ok, data } = await call('/mpesa/stkpush/v1/processrequest', {
        BusinessShortCode: cfg.shortcode,
        Password: password(timestamp),
        Timestamp: timestamp,
        TransactionType: cfg.till ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline',
        Amount: Math.max(1, Math.round(amount)),
        PartyA: msisdn,
        PartyB: cfg.till || cfg.shortcode,
        PhoneNumber: msisdn,
        // Safaricom requires a well-formed https URL even when it can't reach us (local testing);
        // the result is then fetched with stkQuery instead.
        CallBackURL: callbackUrl ?? 'https://example.com/mpesa-callback-disabled',
        AccountReference: String(reference).slice(0, 12),
        TransactionDesc: String(description).slice(0, 13),
      });
      if (!ok || String(data.ResponseCode) !== '0' || !data.CheckoutRequestID) {
        console.error('STK push rejected:', data.errorMessage ?? data.ResponseDescription ?? data);
        throw new Error('M-Pesa could not send the prompt right now. Please try again.');
      }
      return { checkoutId: data.CheckoutRequestID };
    },

    /** How a prompt ended: { status: 'pending' | 'paid' | 'failed', code, description }. */
    async stkQuery(checkoutId) {
      const timestamp = stamp();
      const { data } = await call('/mpesa/stkpushquery/v1/query', {
        BusinessShortCode: cfg.shortcode,
        Password: password(timestamp),
        Timestamp: timestamp,
        CheckoutRequestID: checkoutId,
      });
      if (data.ResultCode === undefined) return { status: 'pending' }; // "The transaction is being processed"
      return resultOf(data.ResultCode, data.ResultDesc);
    },
  };
}
