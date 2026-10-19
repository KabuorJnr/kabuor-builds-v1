// Browser side of admin phone alerts (Web Push).
import { SHOP_BASE } from './base';

const ua = () => navigator.userAgent;
export const isIos = () => /iPhone|iPad|iPod/.test(ua()) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const isStandalone = () => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;

// Why alerts can't be turned on here, or null when they can.
export function pushBlocker() {
  if (!window.isSecureContext) return 'insecure';
  // iPhones only allow alerts for sites added to the Home Screen (iOS 16.4+).
  if (isIos() && !isStandalone()) return 'ios-install';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  return null;
}

export function deviceLabel() {
  const s = ua();
  const device = /iPhone/.test(s) ? 'iPhone' : /iPad/.test(s) || isIos() ? 'iPad' : /Android/.test(s) ? 'Android phone' : /Windows/.test(s) ? 'Windows PC' : /Mac/.test(s) ? 'Mac' : 'This device';
  const browser = /Edg\//.test(s) ? 'Edge' : /SamsungBrowser/.test(s) ? 'Samsung Internet' : /Firefox|FxiOS/.test(s) ? 'Firefox' : /Chrome|CriOS/.test(s) ? 'Chrome' : /Safari/.test(s) ? 'Safari' : '';
  return browser ? `${device} · ${browser}` : device;
}

function keyBytes(base64url) {
  const pad = '='.repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function registration() {
  return (await navigator.serviceWorker.getRegistration(`${SHOP_BASE}/`)) ?? navigator.serviceWorker.register(`${SHOP_BASE}/sw.js`, { scope: `${SHOP_BASE}/` });
}

export async function currentSubscription() {
  if (pushBlocker()) return null;
  const reg = await navigator.serviceWorker.getRegistration(`${SHOP_BASE}/`);
  return reg ? reg.pushManager.getSubscription() : null;
}

// Asks for permission (must run from a tap) and returns the subscription to send to the server.
export async function subscribe(publicKey) {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error(permission === 'denied' ? 'denied' : 'dismissed');
  const reg = await registration();
  await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  // A subscription made with an old server key can't receive our pushes; replace it.
  if (existing) {
    const key = existing.options?.applicationServerKey;
    const same = key && btoa(String.fromCharCode(...new Uint8Array(key))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') === publicKey;
    if (same) return existing;
    await existing.unsubscribe();
  }
  return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) });
}

export async function unsubscribe() {
  const sub = await currentSubscription();
  if (!sub) return null;
  const { endpoint } = sub;
  await sub.unsubscribe();
  return endpoint;
}
