// The platform's own M-Pesa Express: shop owners pay their subscription to Kabuor Builds' Paybill/Till.
// Keys: PLATFORM_MPESA_* in server/.env. Without them the platform runs in test mode (see billing.js).
import { daraja } from '../daraja.js';
import { PUBLIC_URL } from '../site.js';

export { failureMessage, resultOf, toMsisdn } from '../daraja.js';

const env = process.env;
const client = daraja(
  {
    env: (env.PLATFORM_MPESA_ENV || env.MPESA_ENVIRONMENT) === 'production' ? 'production' : 'sandbox',
    key: env.PLATFORM_MPESA_CONSUMER_KEY || env.MPESA_CONSUMER_KEY || '',
    secret: env.PLATFORM_MPESA_CONSUMER_SECRET || env.MPESA_CONSUMER_SECRET || '',
    shortcode: env.PLATFORM_MPESA_SHORTCODE || env.MPESA_STORE_NUMBER || env.MPESA_SHORTCODE || '',
    passkey: env.PLATFORM_MPESA_PASSKEY || env.MPESA_PASSKEY || '',
    till: env.PLATFORM_MPESA_TILL || env.MPESA_TILL_NUMBER || '',
    callbackBase: PUBLIC_URL,
    apiUrl: env.PLATFORM_MPESA_API_URL || env.MPESA_API_URL,
  },
  { callbackPath: '/api/platform/mpesa/callback', secretSalt: `platform-mpesa-callback:${env.JWT_SECRET ?? ''}` },
);

export const platformMpesaReady = client.ready;
export const platformMpesaStatus = client.status;
export const callbackSecret = client.callbackSecret;
export const stkPush = client.stkPush;
export const stkQuery = client.stkQuery;
