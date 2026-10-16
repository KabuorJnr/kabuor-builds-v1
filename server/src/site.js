import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The platform's public https address (PUBLIC_URL), e.g. https://shop.ke. Used for M-Pesa callbacks.
export const PUBLIC_URL = (
  process.env.PUBLIC_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '')
).replace(/\/+$/, '');

// The platform's own domain. Shops live at <link>.<PLATFORM_DOMAIN>. Locally, <link>.localhost works in browsers.
export const PLATFORM_DOMAIN = (process.env.PLATFORM_DOMAIN || 'shop.ke').toLowerCase();
// Who runs the platform: shown on the landing page, the signup wizard and in every shop's footer.
export const PLATFORM_NAME = process.env.PLATFORM_NAME || 'Kabuor Builds';
export const PLATFORM_TAGLINE = process.env.PLATFORM_TAGLINE || 'Mlete deals.';
export const PLATFORM_PHONE = process.env.PLATFORM_PHONE || '0705 607 954';
export const PLATFORM_EMAIL = process.env.PLATFORM_EMAIL || 'rooneykabuor2004@gmail.com';

// Where every database and upload lives: DATA_DIR, the Railway volume, or server/data.
export const DATA_DIR =
  process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
