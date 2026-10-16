import webpush from 'web-push';
import { db } from './db.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_DIR, PUBLIC_URL } from './site.js';

// Web Push: the admin's phone subscribes from the portal, and the server sends a notification on each new
// order or payment. Keys come from .env if set, otherwise they are generated once and kept in the database.
function vapidKeys() {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY };
  }
  // One key pair for the whole platform, generated once and kept with the platform's data.
  const file = join(DATA_DIR, 'vapid.json');
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  const keys = webpush.generateVAPIDKeys();
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(file, JSON.stringify(keys));
  return keys;
}

const keys = vapidKeys();
// Push services want a contact for the sender: a mailto: or the shop's https address.
const subject = process.env.VAPID_SUBJECT || (PUBLIC_URL.startsWith('https://') ? PUBLIC_URL : 'mailto:alerts@example.com');
webpush.setVapidDetails(subject, keys.publicKey, keys.privateKey);

export const pushPublicKey = keys.publicKey;

export function saveSubscription(sub, label) {
  const endpoint = typeof sub?.endpoint === 'string' ? sub.endpoint : '';
  const { p256dh, auth } = sub?.keys ?? {};
  if (!/^https:\/\//.test(endpoint) || endpoint.length > 1000 || typeof p256dh !== 'string' || typeof auth !== 'string') {
    return false;
  }
  db.prepare(`INSERT INTO push_subscriptions (endpoint, keys, label, created_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(endpoint) DO UPDATE SET keys = excluded.keys, label = excluded.label`).run(
    endpoint, JSON.stringify({ p256dh, auth }), String(label ?? '').slice(0, 60), new Date().toISOString(),
  );
  return true;
}

export function removeSubscription(endpoint) {
  db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(String(endpoint ?? ''));
}

export function listDevices() {
  return db.prepare('SELECT endpoint, label, created_at AS createdAt FROM push_subscriptions ORDER BY created_at').all();
}

// Sends to every subscribed device. Never throws: an alert failing must not break checkout.
export async function notifyAdmins({ title, body, url = '/admin/orders', tag }) {
  const subs = db.prepare('SELECT endpoint, keys FROM push_subscriptions').all();
  const payload = JSON.stringify({ title, body, url, tag });
  const results = await Promise.allSettled(
    subs.map((s) => webpush.sendNotification({ endpoint: s.endpoint, keys: JSON.parse(s.keys) }, payload, { TTL: 60 * 60 * 24, urgency: 'high' })),
  );
  let sent = 0;
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') return sent++;
    // 404/410: the browser dropped this subscription (app uninstalled, permission revoked).
    if ([404, 410].includes(r.reason?.statusCode)) removeSubscription(subs[i].endpoint);
    else console.error('Push failed:', r.reason?.statusCode ?? '', r.reason?.body ?? r.reason?.message);
  });
  return { sent, devices: subs.length };
}
