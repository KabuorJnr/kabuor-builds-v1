// Business settings. All money is stored in minor units (cents) to avoid float drift.
// Hosts like Railway assign the port through PORT; API_PORT is the local setting in .env.
import { brand } from './tenant.js';

export const PORT = Number(process.env.PORT || process.env.API_PORT) || 4000;
// The current shop's currency label (Ksh, TSh…).
export const currency = () => brand.currency || 'Ksh';

import { mpesaEnabled } from './mpesa.js';

// Payment options offered at checkout, derived from the shop settings (see content.js → store).
export function paymentMethods(store) {
  const methods = [];
  if (mpesaEnabled) {
    // M-Pesa Express: the customer gets the PIN prompt on their phone.
    methods.push({ id: 'mpesa', label: 'M-Pesa', hint: 'You’ll get a prompt on your phone to enter your M-Pesa PIN', prompt: true });
  } else if (store.paybill?.business) {
    methods.push({
      id: 'mpesa',
      label: store.paybill.kind === 'till' ? 'M-Pesa Buy Goods' : 'M-Pesa Paybill',
      hint: store.paybill.kind === 'till' ? `Till no. ${store.paybill.business}` : `Business no. ${store.paybill.business} · Account no. ${store.paybill.account}`,
    });
  }
  if (!store.deliveryEnabled || !methods.length) {
    methods.push({ id: 'cod', label: store.deliveryEnabled ? 'Cash on delivery' : 'Cash at pickup', hint: 'Pay when you receive your order' });
  }
  return methods;
}

// pending → paid (payment confirmed) → sent (out for delivery) → delivered (completed); or cancelled.
export const ORDER_STATUSES = ['pending', 'paid', 'sent', 'delivered', 'cancelled'];

// Sales recorded by the admin that didn't come through the website.
export const SALE_CHANNELS = {
  walkin: 'Walk-in',
  phone: 'Phone order',
  whatsapp: 'WhatsApp',
  market: 'Market / event',
  wholesale: 'Wholesale',
  other: 'Other',
};
export const CHANNEL_LABELS = { website: 'Website', ...SALE_CHANNELS };

// Labels for every payment method an order can carry (online or recorded by hand).
export const PAYMENT_LABELS = {
  mpesa: 'M-Pesa',
  cash: 'Cash',
  cod: 'Cash on delivery',
  card: 'Card',
  bank: 'Bank transfer',
  other: 'Other',
};

// Admin credentials live in the database (see auth.js); only the token signing key comes from .env.
export const JWT_SECRET = process.env.JWT_SECRET || '';
