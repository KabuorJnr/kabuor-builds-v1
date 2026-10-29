// A shop's own M-Pesa Express keys (Daraja), so its customers get the PIN prompt at checkout and the money
// goes straight to the shop's Paybill/Till. The owner enters them in the admin (M-Pesa prompt page); they're
// kept in the shop's database and the secrets are never sent back to the browser. Without keys, checkout
// shows the Till/Paybill instructions instead.
import { randomBytes } from 'node:crypto';
import { daraja, toMsisdn } from './daraja.js';
import { db, HttpError } from './db.js';
import { PLATFORM_DOMAIN, PUBLIC_URL } from './site.js';
import { currentShop } from './tenant.js';

export { failureMessage, resultOf, toMsisdn } from './daraja.js';

const KEY = 'mpesa_keys';
const EMPTY = { env: 'sandbox', type: 'till', shortcode: '', till: '', key: '', secret: '', passkey: '', salt: '' };

function stored() {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(KEY);
  return row ? { ...EMPTY, ...JSON.parse(row.value) } : { ...EMPTY };
}

// One client per shop, rebuilt when its keys change.
const clients = new Map();
function client() {
  const { slug } = currentShop();
  const k = stored();
  const sig = JSON.stringify(k);
  const cached = clients.get(slug);
  if (cached?.sig === sig) return cached.client;
  const live = /^https:\/\//.test(PUBLIC_URL);
  const c = daraja(
    {
      env: k.env,
      key: k.key,
      secret: k.secret,
      shortcode: k.shortcode,
      passkey: k.passkey,
      till: k.type === 'till' ? k.till : '',
      // Results come back to the shop's own address once the platform runs on https.
      callbackBase: live ? (PLATFORM_DOMAIN ? `https://${slug}.${PLATFORM_DOMAIN}` : `${PUBLIC_URL}/s/${slug}`) : '',
      apiUrl: process.env.MPESA_API_URL,
    },
    { callbackPath: '/api/mpesa/callback', secretSalt: `shop-mpesa:${slug}:${k.salt}` },
  );
  clients.set(slug, { sig, client: c });
  return c;
}

export const mpesaEnabled = () => client().ready;
export const mpesaStatus = () => client().status();
export const callbackSecret = () => client().callbackSecret;
export const stkPush = (args) => client().stkPush(args);
export const stkQuery = (id) => client().stkQuery(id);
/** Throws a plain message when Safaricom rejects the saved consumer key or secret. */
export const checkKeys = () => client().checkKeys();

/** The keys for the admin: which are set, never the secrets themselves. */
export function mpesaSettings() {
  const k = stored();
  return {
    env: k.env,
    type: k.type,
    shortcode: k.shortcode,
    till: k.till,
    hasKey: Boolean(k.key),
    hasSecret: Boolean(k.secret),
    hasPasskey: Boolean(k.passkey),
    ...mpesaStatus(),
  };
}

/** Saves the owner's keys. Blank secret fields keep the saved ones; `clear` removes everything. */
export function saveMpesaSettings(input = {}) {
  if (input.clear) {
    db.prepare('DELETE FROM settings WHERE key = ?').run(KEY);
    return mpesaSettings();
  }
  const prev = stored();
  const digits = (v, max) => String(v ?? '').replace(/\D/g, '').slice(0, max);
  const text = (v) => String(v ?? '').trim().slice(0, 200);
  const next = {
    env: input.env === 'production' ? 'production' : 'sandbox',
    type: input.type === 'paybill' ? 'paybill' : 'till',
    shortcode: digits(input.shortcode, 10),
    till: input.type === 'paybill' ? '' : digits(input.till, 10),
    key: text(input.key) || prev.key,
    secret: text(input.secret) || prev.secret,
    passkey: text(input.passkey) || prev.passkey,
    salt: prev.salt || randomBytes(16).toString('hex'),
  };
  if (!next.shortcode) throw new HttpError(400, 'Enter the shortcode your Daraja app belongs to (the Paybill, or the Till’s store number).');
  if (next.type === 'till' && !next.till) throw new HttpError(400, 'Enter the Till number customers pay.');
  if (!next.key || !next.secret || !next.passkey) throw new HttpError(400, 'Enter the consumer key, consumer secret and passkey from your Daraja app.');
  db.prepare(`INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`).run(KEY, JSON.stringify(next), new Date().toISOString());
  return mpesaSettings();
}

/**
 * Saves keys and proves the consumer key and secret with Safaricom before keeping them. If Safaricom
 * rejects them, the shop goes back to the keys it had (or none), so a typo never breaks a working checkout.
 */
export async function connectMpesa(input = {}) {
  const before = db.prepare('SELECT value FROM settings WHERE key = ?').get(KEY)?.value ?? null;
  const saved = saveMpesaSettings(input);
  try {
    await checkKeys();
    return saved;
  } catch (err) {
    if (before === null) db.prepare('DELETE FROM settings WHERE key = ?').run(KEY);
    else db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(before, KEY);
    throw new HttpError(400, `${err.message} Nothing was changed on the shop.`);
  }
}

/** Sends a KSh 1 prompt to the owner's phone to prove the keys work. */
export async function testPrompt(phone) {
  const msisdn = toMsisdn(phone);
  if (!msisdn) throw new HttpError(400, 'Enter a Safaricom number, e.g. 0712 345 678');
  if (!mpesaEnabled()) throw new HttpError(400, 'Save your Daraja keys first.');
  try {
    return await stkPush({ msisdn, amount: 1, reference: 'TEST', description: 'Prompt test' });
  } catch (err) {
    throw new HttpError(400, err.message); // shown to the owner as is
  }
}
