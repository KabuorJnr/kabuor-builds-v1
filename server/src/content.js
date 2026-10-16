// Admin-editable website content and shop settings, stored as JSON documents in `settings`.
// Every save is normalised against a schema, so the storefront only ever sees well-formed,
// length-limited data no matter what the client sends.
import { db, HttpError } from './db.js';
import { brand } from './tenant.js';

// ---------- tiny schema helpers ----------
export const str = (max) => ({ t: 'str', max });
export const bool = () => ({ t: 'bool' });
export const int = (min, max) => ({ t: 'int', min, max });
export const oneOf = (values) => ({ t: 'enum', values });
export const color = () => ({ t: 'color' });
export const obj = (fields) => ({ t: 'obj', fields });
export const list = (item, max) => ({ t: 'list', item, max });

export function blank(s) {
  switch (s.t) {
    case 'str': return '';
    case 'color': return '#000000';
    case 'bool': return false;
    case 'int': return s.min;
    case 'enum': return s.values[0];
    case 'obj': return Object.fromEntries(Object.entries(s.fields).map(([k, f]) => [k, blank(f)]));
    case 'list': return [];
  }
}

// Coerce `value` into the shape `s`, using `fallback` wherever the value is missing or invalid.
export function normalize(s, value, fallback = blank(s)) {
  switch (s.t) {
    case 'str':
      return typeof value === 'string' ? value.trim().slice(0, s.max) : fallback;
    case 'bool':
      return typeof value === 'boolean' ? value : fallback;
    case 'int': {
      const n = Number(value);
      return value !== '' && value !== null && Number.isFinite(n) ? Math.min(s.max, Math.max(s.min, Math.round(n))) : fallback;
    }
    case 'enum':
      return s.values.includes(value) ? value : fallback;
    case 'color':
      return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : fallback;
    case 'obj':
      return Object.fromEntries(Object.entries(s.fields).map(([k, f]) => [k, normalize(f, value?.[k], fallback?.[k] ?? blank(f))]));
    case 'list':
      return Array.isArray(value) ? value.slice(0, s.max).map((v) => normalize(s.item, v, blank(s.item))) : fallback;
  }
}

export const slugify = (text) =>
  String(text).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').slice(0, 40);

// ---------- website content ----------
export const STEP_ICONS = ['package', 'wallet', 'phone', 'truck', 'map', 'check', 'heart', 'leaf', 'sprout', 'sun', 'flame', 'award'];

export const CONTENT_SCHEMA = obj({
  brand: obj({
    name: str(40),
    short: str(6),
    tagline: str(60),
    email: str(80),
    branches: list(obj({ city: str(30), country: str(40), phone: str(24), note: str(30) }), 30),
  }),
  announcement: obj({ enabled: bool(), text: str(140), linkLabel: str(24), linkHref: str(120) }),
  hero: obj({
    eyebrow: str(40),
    showDate: bool(),
    lines: list(str(24), 3),
    highlight: str(24),
    text: str(260),
    primaryCta: str(30),
    secondaryCta: str(30),
    showRating: bool(),
    rating: str(6),
    ratingText: str(60),
    badge: str(36),
    chipTitle: str(30),
    chipText: str(40),
    featured: obj({ front: str(60), left: str(60), right: str(60) }),
  }),
  ticker: obj({ enabled: bool(), items: list(str(40), 12) }),
  shop: obj({
    eyebrow: str(30),
    title: str(60),
    text: str(200),
    allLabel: str(24),
    categories: list(obj({ id: str(40), label: str(24) }), 8),
  }),
  process: obj({
    enabled: bool(),
    eyebrow: str(30),
    title: str(70),
    text: str(220),
    steps: list(obj({ icon: oneOf(STEP_ICONS), title: str(40), text: str(200) }), 6),
  }),
  story: obj({
    enabled: bool(),
    eyebrow: str(30),
    title: str(70),
    text: str(600),
    quote: str(200),
    quoteBy: str(50),
    featured: str(60),
    stats: list(obj({ value: int(0, 10_000_000), suffix: str(4), label: str(40) }), 4),
  }),
  reviews: obj({
    enabled: bool(),
    eyebrow: str(30),
    title: str(70),
    rating: str(20),
    ratingText: str(60),
    items: list(obj({ name: str(40), city: str(40), product: str(40), text: str(240) }), 16),
  }),
  faq: obj({ enabled: bool(), eyebrow: str(30), title: str(70), text: str(200), items: list(obj({ q: str(120), a: str(600) }), 12) }),
  updates: obj({ enabled: bool(), eyebrow: str(30), title: str(70), text: str(200) }),
  newsletter: obj({ enabled: bool(), eyebrow: str(30), title: str(70), text: str(240), button: str(24), success: str(80) }),
  footer: obj({ blurb: str(220), smallPrint: str(140) }),
});

// Branches without a country (saved before countries existed) belong to the home country.
export const HOME_COUNTRY = 'Kenya';

const BRANCHES = [
  { city: 'Nairobi', country: HOME_COUNTRY, phone: '0701-048-495', note: '' },
  { city: 'Mombasa', country: HOME_COUNTRY, phone: '0716-058-509', note: '' },
  { city: 'Rodi', country: HOME_COUNTRY, phone: '0704-710-107', note: '' },
  { city: 'Kisumu', country: HOME_COUNTRY, phone: '0702-531-651', note: 'New branch' },
];

// Fills in the country and keeps each country's branches together, in the order countries first appear.
function tidyBranches(branches) {
  const withCountry = branches.filter((b) => b.city).map((b) => ({ ...b, country: b.country || HOME_COUNTRY }));
  const countries = [...new Set(withCountry.map((b) => b.country))];
  return countries.flatMap((c) => withCountry.filter((b) => b.country === c));
}

// The original Anjugu content, kept as a reference for the shape of a brand file.
const ANJUGU_CONTENT = {
  brand: {
    name: 'Anjugu Peanut Butter',
    short: 'APB',
    tagline: 'Love N-ut Home',
    email: '',
    branches: BRANCHES,
  },
  announcement: {
    enabled: true,
    text: 'New branch: Kisumu, Wachopo Dala! Now closer to you than ever.',
    linkLabel: 'Order now',
    linkHref: '#shop',
  },
  hero: {
    eyebrow: 'Love N-ut Home',
    showDate: false,
    lines: ['Your favourite', 'peanut', 'butter-ner.'],
    highlight: 'butter-ner',
    text: 'Pure, creamy peanut butter with no additives and no preservatives. Five sizes from Ksh 200, delivered countrywide from Nairobi, Mombasa, Rodi and Kisumu.',
    primaryCta: 'Shop now',
    secondaryCta: 'How to order',
    showRating: false,
    rating: '',
    ratingText: '',
    badge: 'NO ADDITIVES · NO PRESERVATIVES ·',
    chipTitle: 'No additives',
    chipText: 'and no preservatives',
    featured: { front: 'apb-1kg', left: 'apb-500g', right: 'apb-250g' },
  },
  ticker: {
    enabled: true,
    items: ['No additives', 'No preservatives', 'Love N-ut Home', 'Delivery countrywide', 'Nairobi · Mombasa · Rodi · Kisumu', 'M-Pesa Paybill 542542'],
  },
  shop: {
    eyebrow: 'Our sizes',
    title: 'Pick your size',
    text: 'One recipe, five sizes. Every jar and tub is pure peanut butter with no additives and no preservatives.',
    allLabel: 'All sizes',
    categories: [],
  },
  process: {
    enabled: true,
    eyebrow: 'How to order',
    title: 'Ordering is easy',
    text: 'From your cart to your door in four simple steps.',
    steps: [
      { icon: 'package', title: 'Pick your size', text: 'Choose 250g, 400g, 500g, 800g or 1kg and add it to your cart.' },
      { icon: 'wallet', title: 'Pay via M-Pesa', text: 'Paybill 542542, Account 150415. Pay the order total shown at checkout.' },
      { icon: 'phone', title: 'We confirm', text: 'Your nearest branch confirms your order and arranges dispatch.' },
      { icon: 'truck', title: 'Delivered countrywide', text: 'By rider or parcel service. The delivery cost is paid by the customer.' },
    ],
  },
  story: {
    enabled: true,
    eyebrow: 'About us',
    title: 'Your favourite peanut butter-ner for 2 years',
    text: 'For two years, Anjugu Peanut Butter has been spreading the love from our branches in Nairobi, Mombasa and Rodi, and now Kisumu, our newest home: Wachopo Dala! Every jar and tub is made with no additives and no preservatives.',
    quote: 'To our new customers: your trust means a lot to us. To our return customers: you affirm our credibility.',
    quoteBy: 'The Anjugu team',
    featured: 'apb-800g',
    stats: [
      { value: 2, suffix: '', label: 'years of spreading the love' },
      { value: 4, suffix: '', label: 'branches countrywide' },
      { value: 5, suffix: '', label: 'sizes to choose from' },
      { value: 0, suffix: '', label: 'additives or preservatives' },
    ],
  },
  reviews: {
    enabled: false,
    eyebrow: 'Reviews',
    title: 'What our customers say',
    rating: '',
    ratingText: '',
    items: [],
  },
  faq: {
    enabled: true,
    eyebrow: 'FAQ',
    title: 'Questions, answered',
    text: 'Can’t find what you’re looking for? Call your nearest branch.',
    items: [
      { q: 'How do I pay?', a: 'Pay via M-Pesa Paybill. Business number: 542542. Account number: 150415. Use the order total shown at checkout as the amount.' },
      { q: 'Do you deliver?', a: 'Yes, we deliver countrywide by rider or parcel service. The delivery cost is paid by the customer.' },
      { q: 'Where are your branches?', a: 'Nairobi (0701-048-495), Mombasa (0716-058-509), Rodi (0704-710-107) and our new branch in Kisumu (0702-531-651).' },
      { q: 'What’s in your peanut butter?', a: 'Pure peanut butter with no additives and no preservatives.' },
      { q: 'Which sizes do you sell?', a: '250g for Ksh 200, 400g for Ksh 300, 500g for Ksh 350, 800g for Ksh 450 and 1kg for Ksh 600.' },
    ],
  },
  updates: {
    enabled: true,
    eyebrow: 'Updates',
    title: 'What’s new at Anjugu',
    text: 'News, offers and announcements from our branches.',
  },
  newsletter: {
    enabled: true,
    eyebrow: 'Stay in the loop',
    title: 'Be first to hear about offers.',
    text: 'New branches, new sizes and special offers. Leave your email and we’ll keep you posted. No spam.',
    button: 'Subscribe',
    success: 'You’re in. Love N-ut Home!',
  },
  footer: {
    blurb: 'Pure peanut butter with no additives and no preservatives, delivered countrywide.',
    smallPrint: 'Delivery by rider or parcel service, at the customer’s cost.',
  },
};

// ---------- shop operations ----------
export const STORE_SCHEMA = obj({
  deliveryEnabled: bool(),
  deliveryFee: int(0, 100_000_00),
  freeDeliveryThreshold: int(0, 10_000_000_00),
  deliveryNote: str(120),
  pickup: obj({ name: str(60), address: str(100), hours: str(60) }),
  // M-Pesa: kind 'till' (Buy Goods) or 'paybill' (business no. + account).
  paybill: obj({ kind: oneOf(['till', 'paybill']), business: str(12), account: str(20) }),
  // SMS (Africa's Talking): who gets which text.
  sms: obj({
    adminNumbers: list(str(20), 5),
    adminNewOrder: bool(),
    branchCopy: bool(),
    customerConfirmed: bool(),
  }),
});

const ANJUGU_STORE = {
  deliveryEnabled: true,
  deliveryFee: 0, // 0 = not charged online; the customer pays the rider or parcel service
  freeDeliveryThreshold: 0,
  deliveryNote: 'Delivery by rider or parcel service, at the customer’s cost.',
  pickup: { name: 'Anjugu Peanut Butter', address: 'Your nearest branch', hours: '' },
  paybill: { business: '542542', account: '150415' },
  sms: {
    adminNumbers: ['0716058509'],
    adminNewOrder: true,
    branchCopy: false,
    customerConfirmed: true,
  },
};

// The current shop's starting content and settings (from its signup), as plain objects.
export const defaultContent = () => brand.content;
export const defaultStore = () => brand.store;
void ANJUGU_CONTENT;
void ANJUGU_STORE;

// ---------- persistence ----------
function read(key, schema, defaults) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  // Normalising against the defaults fills in any field added since the document was saved.
  return row ? normalize(schema, JSON.parse(row.value), defaults) : structuredClone(defaults);
}

function write(key, value) {
  db.prepare(`INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`).run(key, JSON.stringify(value), new Date().toISOString());
  return value;
}

export function getContent() {
  const content = read('content', CONTENT_SCHEMA, defaultContent());
  content.brand.branches = tidyBranches(content.brand.branches);
  return content;
}
export const getStore = () => read('store', STORE_SCHEMA, defaultStore());

export function saveContent(input) {
  const next = normalize(CONTENT_SCHEMA, input, getContent());
  // Lists drop empty rows; categories get stable, unique ids from their labels.
  const seen = new Set();
  next.shop.categories = next.shop.categories
    .filter((c) => c.label)
    .map((c) => {
      let id = c.id || slugify(c.label) || 'category';
      while (seen.has(id)) id = `${id}-2`;
      seen.add(id);
      return { id, label: c.label };
    });
  next.hero.lines = next.hero.lines.filter(Boolean);
  if (!next.hero.lines.length) next.hero.lines = defaultContent().hero.lines;
  next.brand.branches = tidyBranches(next.brand.branches);
  // Orders and sales refer to a branch by its town, so two branches can't share one.
  const towns = new Set();
  for (const b of next.brand.branches) {
    const key = b.city.toLowerCase();
    if (towns.has(key)) throw new HttpError(400, `Two branches are called "${b.city}". Give each branch a different name, e.g. "${b.city} CBD".`);
    towns.add(key);
  }
  next.ticker.items = next.ticker.items.filter(Boolean);
  next.process.steps = next.process.steps.filter((s) => s.title);
  next.story.stats = next.story.stats.filter((s) => s.label);
  next.reviews.items = next.reviews.items.filter((r) => r.text && r.name);
  next.faq.items = next.faq.items.filter((f) => f.q && f.a);
  if (!next.brand.name) next.brand.name = defaultContent().brand.name;
  return write('content', next);
}

export function saveStore(input) {
  return write('store', normalize(STORE_SCHEMA, input, getStore()));
}
