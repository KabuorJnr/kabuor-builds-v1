import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The platform's public https address (PUBLIC_URL), e.g. https://shop.ke. Used for M-Pesa callbacks.
export const PUBLIC_URL = (
  process.env.PUBLIC_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '')
).replace(/\/+$/, '');

// The platform's own domain, once it and its wildcard (*.domain) point here: shops then live at <link>.<domain>.
// Unset, shops live at <platform address>/s/<link>. It used to default to shop.ke, which belongs to someone else:
// links, previews and M-Pesa callbacks would have pointed at their servers. Locally, <link>.localhost always works.
export const PLATFORM_DOMAIN = (process.env.PLATFORM_DOMAIN || '').toLowerCase();
// Who runs the platform: shown on the landing page, the signup wizard and in every shop's footer.
export const PLATFORM_NAME = process.env.PLATFORM_NAME || 'Kabuor Builds';
export const PLATFORM_TAGLINE = process.env.PLATFORM_TAGLINE || 'Mlete deals.';
export const PLATFORM_PHONE = process.env.PLATFORM_PHONE || '0705 607 954';
export const PLATFORM_EMAIL = process.env.PLATFORM_EMAIL || 'rooneykabuor2004@gmail.com';
export const PLATFORM_FOUNDER_NAME = process.env.PLATFORM_FOUNDER_NAME || 'Rooney Odhiambo Kabuor';
export const PLATFORM_FOUNDER_LINKEDIN = process.env.PLATFORM_FOUNDER_LINKEDIN || 'https://www.linkedin.com/in/rooney-odhiambo-9a26b6256';

// Vercel Functions have no lasting disk: only /tmp is writable, it is wiped when an instance stops, and each
// instance has its own. Every shop, order and photo would vanish, so refuse to start unless DATA_DIR is set
// on purpose (e.g. DATA_DIR=/tmp/kabuor for a throwaway preview) until a hosted database is connected.
if (process.env.VERCEL && !process.env.DATA_DIR) {
  throw new Error('No persistent storage on Vercel. Set DATA_DIR=/tmp/kabuor only for a throwaway preview; real shops need a hosted database (see README).');
}

// Railway: shops live on the attached volume, which survives redeploys and restarts. Without one the disk is
// wiped on every deploy, so refuse to start rather than lose shops.
if (process.env.RAILWAY_ENVIRONMENT_NAME && !process.env.RAILWAY_VOLUME_MOUNT_PATH && !process.env.DATA_DIR) {
  throw new Error('No volume attached. In Railway, add a volume to this service (mount path /data) so shops are kept.');
}

// Where every database and upload lives: DATA_DIR, the Railway volume, or server/data.
export const DATA_DIR =
  process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || join(dirname(fileURLToPath(import.meta.url)), '..', 'data');

// False on a throwaway disk (Vercel's /tmp): whatever is written is gone when the instance stops. Then nobody can
// open a shop (they'd lose it, and their payment), and the company site's demo requests and job applications are
// handed to WhatsApp or email by the page instead of being kept only here.
export const STORAGE_LASTS = !(process.env.VERCEL && /^\/tmp(\/|$)/.test(DATA_DIR));
