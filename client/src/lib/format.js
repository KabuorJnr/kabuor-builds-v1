let currency = 'Ksh';
export const setCurrency = (c) => (currency = c || currency);
export const getCurrency = () => currency;

const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

// Amounts arrive in minor units (cents).
export const amount = (minor) => whole.format(Math.round((minor ?? 0) / 100));
export const money = (minor) => `${currency} ${amount(minor)}`;
export const moneyCompact = (minor) => `${currency} ${compact.format((minor ?? 0) / 100)}`;
export const num = (n) => whole.format(n ?? 0);

// "500g" → 500, "1kg" → 1000; null when the size isn't a plain weight.
export function gramsOf(size) {
  const m = /^\s*([\d.]+)\s*(kg|g)\s*$/i.exec(size ?? '');
  return m ? parseFloat(m[1]) * (m[2].toLowerCase() === 'kg' ? 1000 : 1) : null;
}
// Price per 100g, for comparing jars of different sizes. Not for bundles ("The Trio", "Gift box"), whose
// size is usually one item's, so the figure would mislead.
const BUNDLE = /\b(trio|duo|set|pack|bundle|box|combo|kit|hamper|collection)\b/i;
export const isBundle = (name = '') => BUNDLE.test(name);
export const perHundredGrams = (price, size, name = '') => {
  const g = gramsOf(size);
  return g && !isBundle(name) ? Math.round((price * 100) / g) : null;
};

export const dateTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const cn = (...parts) => parts.filter(Boolean).join(' ');
