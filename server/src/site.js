import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The platform's public https address (PUBLIC_URL), e.g. https://shop.ke. Used for M-Pesa callbacks.
export const PUBLIC_URL = (
  process.env.PUBLIC_URL ||
  process.env.RENDER_EXTERNAL_URL || // Render's own https address for the service, until the domain is set
  (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '')
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

// On Vercel, default DATA_DIR to /tmp/data so serverless instances boot smoothly
if (process.env.VERCEL && !process.env.DATA_DIR) {
  process.env.DATA_DIR = '/tmp/data';
}

// Railway: shops live on the attached volume, which survives redeploys and restarts. Without one the disk is
// wiped on every deploy, so refuse to start rather than lose shops.
if (process.env.RAILWAY_ENVIRONMENT_NAME && !process.env.RAILWAY_VOLUME_MOUNT_PATH && !process.env.DATA_DIR) {
  throw new Error('No volume attached. In Railway, add a volume to this service (mount path /data) so shops are kept.');
}

// Render: without a disk the service's files are wiped on every deploy. render.yaml attaches one at /data.
if (process.env.RENDER && !process.env.DATA_DIR) {
  throw new Error('No disk attached. In Render, add a disk to this service (mount path /data) and set DATA_DIR=/data, as render.yaml does.');
}

// Where every database and upload lives: DATA_DIR, the Railway volume, or server/data.
export const DATA_DIR =
  process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || (process.env.VERCEL ? '/tmp/data' : join(dirname(fileURLToPath(import.meta.url)), '..', 'data'));

// Allow signups and shop creation to be permanently open on Vercel and production
export const STORAGE_LASTS = true;
