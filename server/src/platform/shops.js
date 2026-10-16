// Finding the shop for a request and opening it. A shop's link is its subdomain (anjugu.shop.ke, or
// anjugu.localhost while developing); its data lives in DATA_DIR/shops/<slug>/.
import { join } from 'node:path';
import { openShopDb } from '../db.js';
import { DATA_DIR, PLATFORM_DOMAIN } from '../site.js';
import { getShopRecord } from './store.js';
import { makeBrand } from './presets.js';

export const SHOPS_DIR = join(DATA_DIR, 'shops');
export const shopDir = (slug) => join(SHOPS_DIR, slug);

// Links nobody can take: they're used by the platform or would confuse customers.
export const RESERVED = new Set(
  'www admin api app apps mail email smtp ftp blog help support status shop shops store stores dashboard login signin signup register account billing pay payments mpesa docs static assets cdn media uploads test dev staging demo platform root'.split(' '),
);
export const LINK_RULE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;

/**
 * What a host name points at: { platform: true } for the platform's own site, { slug } for a shop link.
 * Ports are ignored, so anjugu.localhost:4000 works locally.
 */
export function resolveHost(rawHost) {
  const host = String(rawHost ?? '').toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
  if (!host || host === PLATFORM_DOMAIN || host === `www.${PLATFORM_DOMAIN}` || host === 'localhost' || /^[\d.]+$/.test(host)) {
    return { platform: true };
  }
  for (const base of [PLATFORM_DOMAIN, 'localhost']) {
    if (host.endsWith(`.${base}`)) {
      const sub = host.slice(0, -(base.length + 1));
      if (sub === 'www') return { platform: true };
      return { slug: sub };
    }
  }
  return { platform: true, unknownHost: host };
}

// Open shops, kept in memory: the brand built from the record, and its database.
const open = new Map();

/** The running shop for a slug, or null when there's no such shop. Rebuilt after the owner rebrands. */
export function getShop(slug) {
  const record = getShopRecord(slug);
  if (!record) return null;
  const cached = open.get(slug);
  if (cached && cached.record.updated_at === record.updated_at) return cached;
  const dir = shopDir(slug);
  const shop = {
    slug,
    record,
    brand: makeBrand(record),
    db: cached?.db ?? openShopDb(dir),
    uploadDir: join(dir, 'uploads'),
  };
  open.set(slug, shop);
  return shop;
}

/** Whether customers can shop now: live and paid up (with three days' grace after the paid period ends). */
export function shopState(record) {
  if (record.status === 'pending' || record.status === 'setup') return 'setup';
  const until = record.paid_until ? Date.parse(record.paid_until) : 0;
  if (until + 3 * 864e5 < Date.now()) return 'paused';
  return 'live';
}
