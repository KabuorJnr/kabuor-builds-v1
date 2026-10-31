// What a new shop starts with, by what it sells (kind) and the look the owner picks (style). Distilled from
// the hand-built brand shops: a sauce shop gets chillies and a speckled background, a honey shop a
// honeycomb, candles a soft glow; the style sets fonts, corners, light or dark, and the banner layout.
import { content, product, store } from './base.js';
import { buildPalette } from './palette.js';

export const KINDS = {
  sauce: {
    label: 'Sauces & condiments', motif: 'chilli', texture: 'speckle', accent: '#D9381E', style: 'warm',
    shape: 'squeeze', pack: 'Bottle', size: '250g',
    eyebrow: 'Small-batch sauces', tagline: 'Heat with flavour', shopEyebrow: 'Our sauces', shopTitle: 'Pick your heat',
    story: (n, c) => `${n} makes small-batch sauces in ${c || 'Kenya'}, with real chillies and nothing artificial.`,
  },
  honey: {
    label: 'Honey & bee products', motif: 'bee', texture: 'honeycomb', accent: '#E3A21A', style: 'natural',
    shape: 'jar', pack: 'Jar', size: '500g',
    eyebrow: 'Pure, raw honey', tagline: 'From the hive to your home', shopEyebrow: 'Our honey', shopTitle: 'Pure honey, every size',
    story: (n, c) => `${n} brings you raw, unfiltered honey from ${c || 'Kenyan'} hives, straight from the beekeepers.`,
  },
  skincare: {
    label: 'Skincare & body butter', motif: 'drop', texture: 'grain', accent: '#C27C8E', style: 'elegant',
    shape: 'tub', pack: 'Tub', size: '250g',
    eyebrow: 'Handmade body care', tagline: 'Soft skin, made simple', shopEyebrow: 'Our range', shopTitle: 'Care for every skin',
    story: (n, c) => `${n} makes body care by hand in ${c || 'Kenya'}, with shea butter and natural oils your skin will love.`,
  },
  candle: {
    label: 'Candles & home scents', motif: 'flame', texture: 'glow', accent: '#9A5BC9', style: 'luxe',
    shape: 'candle', pack: 'Candle', size: '200g',
    eyebrow: 'Hand-poured candles', tagline: 'Light up your space', shopEyebrow: 'Our candles', shopTitle: 'What’s your mood today?',
    story: (n, c) => `${n} hand-pours scented candles in ${c || 'Kenya'}, made for slowing down at the end of the day.`,
  },
  soap: {
    label: 'Soap & natural care', motif: 'leaf', texture: 'paper', accent: '#4F8A3C', style: 'natural',
    shape: 'bar', pack: 'Bar', size: '120g',
    eyebrow: 'Natural handmade soap', tagline: 'Love your skin, naturally', shopEyebrow: 'Our soaps', shopTitle: 'A bar for every skin',
    story: (n, c) => `${n} makes natural soap by hand in ${c || 'Kenya'}, with plant oils and nothing harsh.`,
  },
  food: {
    label: 'Food & snacks', motif: 'leaf', texture: 'dots', accent: '#C0702A', style: 'warm',
    shape: 'jar', pack: 'Jar', size: '400g',
    eyebrow: 'Made fresh', tagline: 'Good food, made with care', shopEyebrow: 'Our products', shopTitle: 'Something for every table',
    story: (n, c) => `${n} makes good food in ${c || 'Kenya'}, in small batches and with honest ingredients.`,
  },
  drinks: {
    label: 'Juices & drinks', motif: 'drop', texture: 'dots', accent: '#E2632A', style: 'bold',
    shape: 'squeeze', pack: 'Bottle', size: '500ml',
    eyebrow: 'Freshly made', tagline: 'Fresh in every sip', shopEyebrow: 'Our drinks', shopTitle: 'Pick your flavour',
    story: (n, c) => `${n} makes fresh drinks in ${c || 'Kenya'}, from real fruit.`,
  },
  groceries: {
    label: 'Supermarket & fresh groceries', motif: 'leaf', texture: 'dots', accent: '#107C41', style: 'fresh',
    shape: 'box', pack: 'Pack', size: '500g',
    eyebrow: 'Farm fresh & organic', tagline: 'We bring the store to your door', shopEyebrow: 'Daily fresh essentials', shopTitle: 'Fresh produce, 15-min delivery',
    story: (n, c) => ${n} delivers fresh organic produce, farm groceries and daily essentials in ${c || 'Kenya'}, direct from local growers with express delivery.,
  },
  electronics: {
    label: 'Electronics & tech gadgets', motif: 'drop', texture: 'glow', accent: '#FF5722', style: 'cyber',
    shape: 'box', pack: 'Unit', size: '1 pc',
    eyebrow: 'Smart devices & gaming', tagline: 'Power your digital lifestyle', shopEyebrow: 'Tech essentials', shopTitle: 'Latest phones, audio & gear',
    story: (n, c) => ${n} provides original smartphones, gaming gear, laptops, and smart tech accessories in ${c || 'Kenya'} with warranty and same-day delivery.,
  },
  furniture: {
    label: 'Furniture & home living', motif: 'leaf', texture: 'paper', accent: '#8C6239', style: 'scandi',
    shape: 'box', pack: 'Piece', size: '1 item',
    eyebrow: 'Architectural furniture', tagline: 'Furniture that defines your space', shopEyebrow: 'Curated living', shopTitle: 'Built to impress, made to last',
    story: (n, c) => ${n} crafts contemporary architectural furniture and interior pieces in ${c || 'Kenya'}, bringing harmony, form, and functionality to your space.,
  },
  other: {
    label: 'Something else', motif: 'leaf', texture: 'dots', accent: '#2F6F5E', style: 'natural',
    shape: 'box', pack: 'Item', size: '1 pc',
    eyebrow: 'Made in Kenya', tagline: 'Made with care', shopEyebrow: 'Our products', shopTitle: 'Shop our range',
    story: (n, c) => `${n} is a proudly Kenyan business${c ? ` in ${c}` : ''}.`,
  },
};

// Looks the owner can choose from. Each pairs a display font and an accent font with a text font, and sets
// light or dark, the banner layout (photo collage, poster, or magazine spread) and the corners. A style may
// also bring its own background texture; otherwise the texture comes from what they sell.
// Ten website designs. Beyond fonts and colours, each sets the page structure:
//   hero   photo (collage) | poster (centred, photos fanned) | editorial (magazine) | trio (floating packs)
//          | split (half-screen photo) | cover (full-screen photo) | minimal (big words, then products)
//   nav    pill (floating rounded) | bar (full-width strip) | centered (logo in the middle) | minimal (menu button)
//   cards  card | bare | framed | list | overlay      cols  products across on a computer (2, 3 or 4)
//   home   hub (banner, then links to each page) | shop-first (banner, then the products)
export const STYLES = {
  warm: { label: 'Warm & friendly', note: 'Photo collage, floating menu, rounded cards', mode: 'light', hero: 'photo', nav: 'pill', cards: 'card', cols: 4, home: 'hub', radius: 'round', body: 'bricolage-grotesque', fonts: { brand: 'shrikhand', tagline: 'caveat-brush' } },
  bold: { label: 'Bold & loud', note: 'Giant headline, prices on the photos, shop first', mode: 'dark', hero: 'poster', nav: 'bar', cards: 'overlay', cols: 3, home: 'shop-first', radius: 'sharp', body: 'archivo', fonts: { brand: 'rammetto-one', tagline: 'kalam' } },
  natural: { label: 'Natural & earthy', note: 'Magazine layout, airy photos with no boxes', mode: 'light', hero: 'editorial', nav: 'centered', cards: 'bare', cols: 3, home: 'hub', radius: 'soft', body: 'familjen-grotesk', fonts: { brand: 'titan-one', tagline: 'patrick-hand' } },
  elegant: { label: 'Soft & elegant', note: 'Half-screen photo, centred logo, framed products', mode: 'light', hero: 'split', nav: 'centered', cards: 'framed', cols: 3, home: 'hub', radius: 'soft', body: 'instrument-sans', fonts: { brand: 'gilda-display', tagline: 'parisienne' } },
  luxe: { label: 'Dark & luxurious', note: 'Full-screen photo, menu tucked away, dark', mode: 'dark', hero: 'cover', nav: 'minimal', cards: 'bare', cols: 3, home: 'hub', radius: 'sharp', body: 'albert-sans', fonts: { brand: 'marcellus', tagline: 'parisienne' } },
  playful: { label: 'Playful & sweet', note: 'Floating products, bubbly cards, shop first', mode: 'light', hero: 'trio', nav: 'pill', cards: 'card', cols: 4, home: 'shop-first', radius: 'round', body: 'onest', texture: 'dots', fonts: { brand: 'cherry-bomb-one', tagline: 'gochi-hand' } },
  classic: { label: 'Classic & trusted', note: 'Catalogue list with full details, solid menu bar', mode: 'light', hero: 'editorial', nav: 'bar', cards: 'list', cols: 2, home: 'hub', radius: 'soft', body: 'commissioner', texture: 'paper', fonts: { brand: 'young-serif', tagline: 'caveat' } },
  market: { label: 'Fresh market', note: 'Half-screen photo, then products, four across', mode: 'light', hero: 'split', nav: 'bar', cards: 'card', cols: 4, home: 'shop-first', radius: 'round', body: 'golos-text', fonts: { brand: 'titan-one', tagline: 'caveat-brush' } },
  street: { label: 'Street & urban', note: 'Full-screen photo, big products two across', mode: 'dark', hero: 'cover', nav: 'minimal', cards: 'overlay', cols: 2, home: 'shop-first', radius: 'sharp', body: 'schibsted-grotesk', texture: 'speckle', fonts: { brand: 'shrikhand', tagline: 'kalam' } },
  fresh: { label: 'Fresh supermarket', note: 'Lush green, 15-min delivery badge, quantity steppers', mode: 'light', hero: 'split', nav: 'bar', cards: 'card', cols: 4, home: 'shop-first', radius: 'round', body: 'golos-text', fonts: { brand: 'titan-one', tagline: 'caveat-brush' } },
  cyber: { label: 'Cyber tech & dark', note: 'Titanium dark mode, glowing neon orange, countdown deals', mode: 'dark', hero: 'poster', nav: 'bar', cards: 'overlay', cols: 3, home: 'shop-first', radius: 'sharp', body: 'archivo', texture: 'glow', fonts: { brand: 'rammetto-one', tagline: 'kalam' } },
  scandi: { label: 'Architectural living', note: 'Sand and stone, airy editorial layout, sculptural forms', mode: 'light', hero: 'editorial', nav: 'centered', cards: 'framed', cols: 3, home: 'hub', radius: 'soft', body: 'instrument-sans', texture: 'paper', fonts: { brand: 'young-serif', tagline: 'parisienne' } },
  boutique: { label: 'Boutique', note: 'Words first, a row of products, framed cards', mode: 'light', hero: 'minimal', nav: 'centered', cards: 'framed', cols: 3, home: 'hub', radius: 'soft', texture: 'grain', body: 'jost', fonts: { brand: 'gilda-display', tagline: 'sacramento' } },
};

/** The styles as the website shows them (no private settings). */
export const styleList = () => Object.entries(STYLES).map(([id, s]) => ({ id, label: s.label, note: s.note, mode: s.mode, hero: s.hero, nav: s.nav, cards: s.cards, cols: s.cols, fonts: s.fonts, body: s.body, radius: s.radius }));

export const slugify = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);

const initials = (name) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || name.slice(0, 2).toUpperCase();

// "Heat with flavour" → ["Heat with", "flavour."]: short headline lines that fit the banner.
function headline(tagline) {
  const words = tagline.replace(/[.!]+$/, '').split(/\s+/);
  const lines = [];
  for (const w of words) {
    const last = lines[lines.length - 1];
    if (last && (last + ' ' + w).length <= 14) lines[lines.length - 1] = `${last} ${w}`;
    else lines.push(w);
  }
  if (lines.length > 3) return { lines: [tagline], highlight: '' };
  lines[lines.length - 1] += '.';
  const highlight = [...words].sort((a, b) => b.length - a.length)[0].replace(/[.,!]/g, '');
  return { lines, highlight };
}

/**
 * The full brand the shop engine runs on, from the platform's record of a shop:
 * spec = { style, accent, second, mode, tagline, about, logo, photos[], products[], till, paybill, account }.
 */
export function makeBrand(record) {
  const spec = JSON.parse(record.brand || '{}');
  const kind = KINDS[record.kind] ?? KINDS.other;
  const style = STYLES[spec.style] ?? STYLES[kind.style];
  const mode = spec.mode === 'dark' || spec.mode === 'light' ? spec.mode : style.mode;
  const colors = buildPalette(spec.accent || kind.accent, mode, spec.second);
  const name = record.name;
  const city = record.city || '';
  const tagline = (spec.tagline || kind.tagline).trim();

  const catalog = (spec.products ?? []).map((p, i) =>
    product({
      id: p.id || `${slugify(p.name) || 'product'}-${i + 1}`,
      name: p.name,
      size: p.size || kind.size,
      price: Number(p.price) || 0,
      popularity: 10 - i,
      description: p.description || '',
      notes: [],
      badge: i === 0 ? 'Bestseller' : undefined,
      shape: kind.shape,
      pack: kind.pack,
      title: p.name,
      lid: colors.amber,
      label: '#FFFFFF',
      ink: buildPalette(spec.accent || kind.accent, 'light').amber,
      accent: colors.honey,
      spread: colors.honey,
      photo: p.photo || '',
    }),
  );
  const ids = catalog.map((p) => p.id);
  const { lines, highlight } = headline(tagline);
  const about = (spec.about || kind.story(name, city)).trim();
  const phone = record.phone;

  return {
    id: record.slug,
    kind: record.kind,
    orderPrefix: initials(name).slice(0, 3) || 'ORD',
    currency: 'Ksh',
    logo: { top: name, bottom: tagline.slice(0, 40), mark: initials(name), image: spec.logo || '' },
    motif: kind.motif,
    colors,
    fonts: style.fonts,
    theme: { mode, hero: style.hero, nav: style.nav, cards: style.cards, cols: style.cols, home: style.home, texture: style.texture ?? kind.texture, radius: style.radius, body: style.body },
    facets: null,
    photos: spec.photos ?? [],
    catalog,
    content: content({
      name,
      short: initials(name),
      tagline,
      email: record.email,
      branches: [{ city: city || 'Nairobi', country: 'Kenya', phone, note: '' }],
      announcement: `Order online and pay with M-Pesa${city ? `. Delivery from ${city}` : ''}.`,
      payHint: spec.till ? `Pay to our M-Pesa Till ${spec.till}, or on delivery.` : undefined,
      hero: {
        eyebrow: kind.eyebrow,
        lines,
        highlight,
        text: about,
        badge: `${kind.eyebrow.toUpperCase()} · ${(city || 'KENYA').toUpperCase()} ·`,
        chipTitle: 'Pay with M-Pesa',
        chipText: 'quick and safe',
        featured: { front: ids[0] ?? '', left: ids[1] ?? '', right: ids[2] ?? '' },
      },
      ticker: [...catalog.slice(0, 4).map((p) => p.name), 'Pay with M-Pesa', city ? `Delivery from ${city}` : 'Delivery countrywide'],
      shop: { eyebrow: kind.shopEyebrow, title: kind.shopTitle, text: tagline + '.' },
      story: {
        title: `About ${name}`,
        text: about,
        featured: ids[ids.length - 1] ?? '',
        stats: catalog.length ? [{ value: catalog.length, suffix: '', label: catalog.length === 1 ? 'product' : 'products to choose from' }] : [],
      },
      faq: [
        { q: 'How do I pay?', a: spec.till ? `By M-Pesa to Till ${spec.till}, or cash on delivery.` : spec.paybill ? `By M-Pesa Paybill ${spec.paybill}${spec.account ? `, account ${spec.account}` : ''}, or cash on delivery.` : 'By M-Pesa or cash on delivery.' },
        { q: 'Do you deliver?', a: `Yes${city ? `, from ${city}` : ''}. Delivery is paid by the customer and we confirm the cost when we call you.` },
        { q: 'How do I order?', a: 'Add what you like to your cart and check out. We call or WhatsApp you to confirm.' },
      ],
      footer: `${tagline}.${city ? ` ${city}, Kenya.` : ''}`,
    }),
    store: store({ name, till: spec.till || undefined, paybill: spec.paybill || undefined, account: spec.account, alertNumbers: [phone] }),
    posts: [{ title: `Welcome to ${name}`, tag: 'News', body: `Our shop is now online. Order here and pay with M-Pesa.`, pinned: 1 }],
  };
}

/** What the website needs: the look, never prices or private settings (same shape the brand shops used). */
export const clientBrand = (b) => ({
  id: b.id,
  name: b.content.brand.name,
  short: b.content.brand.short,
  tagline: b.content.brand.tagline,
  logo: b.logo,
  motif: b.motif,
  colors: b.colors,
  fonts: b.fonts,
  kind: b.kind,
  theme: b.theme,
  facets: b.facets,
  photos: b.photos,
});

