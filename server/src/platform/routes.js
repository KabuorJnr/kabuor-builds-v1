// The platform's own API (on shop.ke itself): sign up, pay by M-Pesa prompt, brand the shop, choose the
// link and go live. The signup wizard keeps a setup token in the owner's browser to continue between steps.
import express, { Router } from 'express';
import { ownerAdmin } from './ownerAdmin.js';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { hashPassword, ownerToken, setOwnerHashed } from '../auth.js';
import { HttpError } from '../db.js';
import { seed } from '../seed.js';
import { ensureStarterPosts } from '../routes/posts.js';
import { PLATFORM_DOMAIN, PLATFORM_EMAIL, PLATFORM_NAME, PLATFORM_PHONE, PLATFORM_TAGLINE, PLATFORM_FOUNDER_NAME, PLATFORM_FOUNDER_LINKEDIN, PUBLIC_URL, STORAGE_LASTS } from '../site.js';
import { runAs } from '../tenant.js';
import { billingSummary, paymentStatus, PLAN_LABELS, PRICES, settle, startPayment, testMode } from './billing.js';
import { callbackSecret, resultOf, toMsisdn } from './daraja.js';
import { accentsFrom, paletteOptions } from './palette.js';
import { clientBrand, KINDS, makeBrand, slugify, styleList, STYLES } from './presets.js';
import { forgetShop, getShop, LINK_RULE, previewToken, requestHost, RESERVED, shopDir, shopState } from './shops.js';
import { getShopRecord, now, pdb, shopByToken, updateShop } from './store.js';
import { createDemoRequest } from './demoRequests.js';
import { createApplication, roleStatuses } from './careers.js';

export const platformRouter = Router();
// Kabuor Builds' own dashboard (sign-in and numbers).
platformRouter.use('/admin', ownerAdmin);

/** "Request a demo" on the company site (rate-limited in index.js). */
platformRouter.post('/demo', (req, res) => res.json(createDemoRequest(req.body ?? {})));

/** The careers page: which roles the dashboard has opened or closed, and applications (rate-limited in index.js). */
platformRouter.get('/careers', (req, res) => res.json({ roles: roleStatuses() }));
platformRouter.post('/careers/apply', (req, res) => res.json(createApplication(req.body ?? {})));

const text = (v, max) => String(v ?? '').trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Prices, kinds and looks for the landing page and the wizard. */
platformRouter.get('/info', (req, res) => {
  const live = pdb.prepare("SELECT slug, name, kind FROM shops WHERE status = 'live' ORDER BY created_at DESC LIMIT 12").all();
  res.json({
    name: PLATFORM_NAME,
    tagline: PLATFORM_TAGLINE,
    phone: PLATFORM_PHONE,
    email: PLATFORM_EMAIL,
    founder: {
      name: PLATFORM_FOUNDER_NAME,
      title: 'Founder & CEO',
      linkedin: PLATFORM_FOUNDER_LINKEDIN,
    },
    domain: PLATFORM_DOMAIN,
    prices: PRICES,
    plans: PLAN_LABELS,
    testMode,
    signupsOpen: STORAGE_LASTS,
    kinds: Object.entries(KINDS).map(([id, k]) => ({ id, label: k.label, tagline: k.tagline, style: k.style, accent: k.accent })),
    styles: styleList(),
    shops: live,
    samples: SAMPLES,
  });
});

// Example looks for the landing page: what a sauce, candle and honey shop come out as.
const SAMPLES = [
  { kind: 'fashion', name: 'Urban Sartorial', brand: { style: 'studio', accent: '#E8541C', tagline: 'Fashion is a trend of modern life' }, product: { name: 'Printed resort shirt', size: 'S to XXL', price: 2900 } },
  { kind: 'wellness', name: 'Zuri Organics & Wellness', brand: { style: 'natural', accent: '#C89B59', tagline: 'Your Journey to Better Health Starts Here' }, product: { name: 'Citrus & Stone Botanical Cleanser', size: '200ml', price: 5200 } },
  { kind: 'sauce', name: 'Mama Pili Sauces', brand: { style: 'warm', accent: '#D9381E', tagline: 'Heat with flavour' }, product: { name: 'Garden Chilli', size: '250g', price: 400 } },
  { kind: 'candle', name: 'Glow Candle Co', brand: { style: 'luxe', accent: '#9A5BC9', tagline: 'Calm scents for slow evenings' }, product: { name: 'Lavender Candle', size: '200g', price: 600 } },
  { kind: 'honey', name: 'Kerio Honey', brand: { style: 'natural', accent: '#E3A21A', tagline: 'From the hive to your home' }, product: { name: 'Raw Honey', size: '500g', price: 650 } },
  { kind: 'groceries', name: 'Gromuse Fresh Mart', brand: { style: 'fresh', accent: '#107C41', tagline: 'We bring the store to your door' }, product: { name: 'Organic Whole Wheat Flour', size: '1kg', price: 420 } },
  { kind: 'electronics', name: 'Nuvio Tech Megastore', brand: { style: 'cyber', accent: '#FF5722', tagline: 'Power your digital lifestyle' }, product: { name: 'iPhone 15 Pro Max Titanium', size: '256GB', price: 154999 } },
  { kind: 'furniture', name: 'Rova Living', brand: { style: 'scandi', accent: '#8C6239', tagline: 'Furniture that defines your space' }, product: { name: 'Nordic Oak Armchair', size: 'Solid Wood', price: 34500 } },
].map((s) => ({
  name: s.name,
  product: s.product,
  look: clientBrand(makeBrand({ slug: s.kind, name: s.name, kind: s.kind, city: 'Nairobi', phone: '', email: '', brand: JSON.stringify(s.brand) })),
}));

// ---------- sample shops for the category templates ----------
// /demo/<template> on the website: the real storefront, running on sample products built the same way a new
// signup's shop is (makeBrand). Nothing is stored, and the storefront switches ordering off for samples.
const art = (t, f) => `/brand/templates/${t}/${f}.svg`;
const TEMPLATE_SAMPLES = {
  living: {
    kind: 'furniture', name: 'Rova Living', brand: { style: 'scandi', accent: '#8C6239', tagline: 'Furniture that defines your space' },
    products: [
      { name: 'Oak lounge chair', size: 'Solid oak, wool cushion', price: 34500, photo: art('living', 'lounge-chair'), badge: 'Bestseller', description: 'A low, deep chair in solid oak with a removable wool cushion. 72 cm wide, 78 cm deep, seat height 38 cm.' },
      { name: 'Boucle three-seater sofa', size: 'Boucle, beech legs', price: 128000, photo: art('living', 'sofa'), description: 'Rounded arms and deep seats in an oatmeal boucle. 220 cm wide. Covers come off for cleaning.' },
      { name: 'Arc floor lamp', size: 'Brass, linen shade', price: 18900, photo: art('living', 'arc-lamp'), badge: 'New', description: 'A brushed brass arc on a marble base that reaches over a sofa or reading chair. 190 cm tall.' },
      { name: 'Travertine side table', size: 'Travertine stone', price: 22500, photo: art('living', 'side-table'), description: 'A tapered column of honed travertine. Every piece has its own veining. 45 cm across, 50 cm tall.' },
      { name: 'Stoneware vase', size: 'Hand-thrown clay', price: 4800, photo: art('living', 'vase'), description: 'Thrown by hand in terracotta clay with a soft matte finish. 34 cm tall.' },
      { name: 'Walnut sideboard', size: 'Walnut veneer', price: 86000, photo: art('living', 'sideboard'), description: 'Four doors and adjustable shelves behind them, on slim walnut legs. 180 cm wide.' },
    ],
  },
  tech: {
    kind: 'electronics', name: 'Nuvio Tech', brand: { style: 'cyber', accent: '#FF5722', tagline: 'Power your digital life', mode: 'dark' },
    products: [
      { name: 'Wireless over-ear headphones', size: '40 h battery · ANC', price: 18999, photo: art('tech', 'headphones'), badge: 'Best seller', description: 'Active noise cancelling, 40 hours on a charge, and a USB-C fast charge that gives 5 hours in 10 minutes.' },
      { name: 'Smart watch', size: '1.9" AMOLED · GPS', price: 12499, photo: art('tech', 'smartwatch'), badge: 'Deal', description: 'Heart rate, sleep and GPS for runs, with a week between charges.' },
      { name: '6.7" smartphone', size: '256 GB · 5G', price: 54999, photo: art('tech', 'phone'), description: 'A 6.7-inch screen, 256 GB of storage, a 50 MP camera and a two-day battery.' },
      { name: 'True wireless earbuds', size: '30 h with case', price: 6499, photo: art('tech', 'earbuds'), description: 'Sweat-resistant earbuds with 30 hours of listening including the charging case.' },
      { name: '14" laptop', size: '16 GB RAM · 512 GB SSD', price: 89999, photo: art('tech', 'laptop'), description: 'A light 14-inch laptop with 16 GB of memory, a 512 GB SSD and a full-day battery.' },
      { name: 'Portable speaker', size: 'Waterproof · 20 W', price: 7999, photo: art('tech', 'speaker'), description: 'A 20 W waterproof speaker that runs 12 hours and pairs with a second one for stereo.' },
    ],
  },
  botanical: {
    kind: 'wellness', name: 'Zuri Organics', brand: { style: 'botanical', accent: '#C89B59', tagline: 'Your journey to better health starts here' },
    products: [
      { name: 'Citrus botanical cleanser', size: '200 ml', price: 2400, photo: art('botanical', 'cleanser'), badge: 'Bestseller', description: 'A gentle daily face wash with orange peel and chamomile. Ingredients listed on the bottle.' },
      { name: 'Vitamin C serum', size: '30 ml', price: 3200, photo: art('botanical', 'serum'), description: 'A light serum with vitamin C and aloe, for the morning before sunscreen.' },
      { name: 'Shea body balm', size: '100 g', price: 1800, photo: art('botanical', 'balm'), description: 'Whipped shea and coconut for dry skin. Made in small batches.' },
      { name: 'Green tonic powder', size: '250 g', price: 2900, photo: art('botanical', 'tonic'), badge: 'New', description: 'Moringa, spirulina and baobab to stir into water or a smoothie.' },
      { name: 'Hibiscus herbal tea', size: '20 bags', price: 950, photo: art('botanical', 'tea'), description: 'Kenyan hibiscus with lemongrass and ginger. Caffeine-free.' },
      { name: 'Body oil', size: '100 ml', price: 2100, photo: art('botanical', 'body-oil'), description: 'Baobab and jojoba oil with a light citrus scent, for after the shower.' },
    ],
  },
  fashion: {
    kind: 'fashion', name: 'Urban Sartorial', brand: { style: 'studio', accent: '#E8541C', tagline: 'Clothes made to be lived in' },
    products: [
      { name: 'Mustard trench coat', size: 'Cotton gabardine · S to XL', price: 8900, photo: art('fashion', 'trench-coat'), badge: 'New drop', description: 'A belted, double-breasted trench in water-resistant cotton gabardine. Falls just below the knee.' },
      { name: 'Orange wrap dress', size: 'Viscose crepe · S to XL', price: 5400, photo: art('fashion', 'wrap-dress'), description: 'A true wrap with a tie at the waist and short sleeves. Midi length, light enough for a hot day.' },
      { name: 'Tailored blazer', size: 'Linen blend · S to XXL', price: 7200, photo: art('fashion', 'blazer'), badge: 'Bestseller', description: 'A single-breasted, half-lined blazer in a linen blend that keeps its shape. Two flap pockets.' },
      { name: 'Printed resort shirt', size: 'Cotton · S to XXL', price: 2900, photo: art('fashion', 'printed-shirt'), description: 'A short-sleeved camp-collar shirt in soft cotton, with a hand-drawn leaf print.' },
      { name: 'Wide-leg trousers', size: 'Wool blend · 28 to 38', price: 4600, photo: art('fashion', 'trousers'), description: 'High-waisted, wide-leg trousers with front pleats and a full-length crease.' },
      { name: 'Canvas sneakers', size: 'Sizes 37 to 45', price: 3800, photo: art('fashion', 'sneakers'), description: 'Low-top canvas sneakers on a natural gum sole, with cotton laces.' },
    ],
  },
  grocer: {
    kind: 'groceries', name: 'Gromuse Fresh Mart', brand: { style: 'fresh', accent: '#107C41', tagline: 'We bring the store to your door' },
    categories: [{ id: 'fruit-veg', label: 'Fruit & veg' }, { id: 'dairy-eggs', label: 'Dairy & eggs' }, { id: 'bakery', label: 'Bakery' }, { id: 'pantry', label: 'Pantry' }],
    products: [
      { name: 'Tomatoes', size: '1 kg', price: 120, photo: art('grocer', 'tomatoes'), category: 'fruit-veg', badge: 'Fresh today' },
      { name: 'Hass avocados', size: '4 pieces', price: 160, photo: art('grocer', 'avocados'), category: 'fruit-veg' },
      { name: 'Ripe bananas', size: '1 bunch', price: 150, photo: art('grocer', 'bananas'), category: 'fruit-veg' },
      { name: 'Carrots', size: '1 kg', price: 110, photo: art('grocer', 'carrots'), category: 'fruit-veg' },
      { name: 'Fresh milk', size: '1 litre', price: 140, photo: art('grocer', 'milk'), category: 'dairy-eggs' },
      { name: 'Eggs', size: 'Tray of 30', price: 480, photo: art('grocer', 'eggs'), category: 'dairy-eggs' },
      { name: 'Brown bread', size: '400 g', price: 75, photo: art('grocer', 'bread'), category: 'bakery' },
      { name: 'Wheat flour', size: '2 kg', price: 210, photo: art('grocer', 'flour'), category: 'pantry' },
    ],
  },
};

// Sample shops for the newer templates are listed here too (their art is in client/public/brand/templates/<id>/).
Object.assign(TEMPLATE_SAMPLES, {
  bakery: {
    kind: 'bakery', name: 'Tamu Bakehouse', brand: { style: 'patisserie', accent: '#C65D73', tagline: 'Baked fresh, made with love' },
    products: [
      { name: 'Celebration cake', size: '1 kg · serves 10', price: 2800, photo: art('bakery', 'cake'), badge: 'Bestseller', description: 'Vanilla sponge layered with strawberry jam and buttercream, finished with fresh berries. Order a day ahead and we write your message on top.' },
      { name: 'Butter croissants', size: 'Box of 4', price: 600, photo: art('bakery', 'croissant'), description: 'Rolled and folded by hand with real butter, and baked every morning.' },
      { name: 'Red velvet cupcakes', size: 'Box of 6', price: 900, photo: art('bakery', 'cupcakes'), badge: 'New', description: 'Soft red velvet with a swirl of cream cheese frosting.' },
      { name: 'Sourdough loaf', size: '800 g', price: 450, photo: art('bakery', 'sourdough'), description: 'Slow-proved for 24 hours, with a crackling crust and an open crumb.' },
      { name: 'Glazed doughnuts', size: 'Box of 6', price: 540, photo: art('bakery', 'doughnuts'), description: 'Light, fluffy rings with strawberry or chocolate glaze and sprinkles.' },
      { name: 'Chocolate chip cookies', size: 'Pack of 8', price: 400, photo: art('bakery', 'cookies'), description: 'Crisp at the edges and chewy in the middle, with dark chocolate chunks.' },
    ],
  },
  beauty: {
    kind: 'beauty', name: 'Nuru Beauty', brand: { style: 'glow', accent: '#A8566F', tagline: 'Beauty that looks like you' },
    products: [
      { name: 'Satin matte lipstick', size: 'Rosewood · 3.5 g', price: 1450, photo: art('beauty', 'lipstick'), badge: 'Bestseller', description: 'Rich colour in one stroke with a soft satin finish that lasts through lunch. Eight shades.' },
      { name: 'Glow serum', size: 'Niacinamide · 30 ml', price: 2200, photo: art('beauty', 'serum'), description: 'A light serum with niacinamide and aloe for an even, glowing skin. Use morning and night.' },
      { name: 'Eau de parfum', size: 'Peony & amber · 50 ml', price: 4800, photo: art('beauty', 'perfume'), badge: 'New', description: 'Fresh peony on top, warm amber and vanilla underneath. Lasts the whole day.' },
      { name: 'Eyeshadow palette', size: '9 shades', price: 2600, photo: art('beauty', 'palette'), description: 'Nine warm mattes and shimmers, from soft nude to deep plum, that blend easily.' },
      { name: 'Nail colour', size: 'Coral · 12 ml', price: 650, photo: art('beauty', 'nail-polish'), description: 'A glossy, chip-resistant nail colour that dries in a minute.' },
      { name: 'Whipped face cream', size: '50 ml', price: 1900, photo: art('beauty', 'face-cream'), description: 'Shea butter and hyaluronic acid in a light cream that sinks in quickly.' },
      { name: 'Volume mascara', size: 'Black · 10 ml', price: 1200, photo: art('beauty', 'mascara'), description: 'A full brush that lifts and thickens without clumping. Washes off with warm water.' },
      { name: 'Pressed powder', size: '6 shades · 9 g', price: 1650, photo: art('beauty', 'compact'), description: 'A light powder that sets makeup and takes away shine, in a compact with a mirror.' },
    ],
  },
  books: {
    kind: 'books', name: 'Kitabu Booksellers', brand: { style: 'library', accent: '#2F5D50', tagline: 'A good book for every reader' },
    categories: [{ id: 'fiction', label: 'Fiction' }, { id: 'children', label: 'Children' }, { id: 'cookery', label: 'Cookery' }, { id: 'school', label: 'School' }, { id: 'stationery', label: 'Stationery' }],
    products: [
      { name: 'The Long Rains', size: 'A. Wanjiru · Paperback', price: 1450, photo: art('books', 'long-rains'), category: 'fiction', badge: 'Staff pick', description: 'Three sisters, one farm and the season that changes everything. A warm, funny novel about family.' },
      { name: 'Little Kiboko', size: 'M. Achieng · Picture book', price: 850, photo: art('books', 'little-kiboko'), category: 'children', badge: 'New', description: 'A little hippo who is scared of water finds her courage. For ages 3 to 6.' },
      { name: 'Salt & Savanna', size: 'K. Otieno · Paperback', price: 1300, photo: art('books', 'salt-savanna'), category: 'fiction', description: 'A road trip from the coast to the Mara, told in short chapters you can read in one sitting.' },
      { name: 'Coastal Kitchen', size: 'Recipes · Hardback', price: 2900, photo: art('books', 'coastal-kitchen'), category: 'cookery', description: 'Eighty recipes from the coast: biryani, coconut fish, mahamri and more, with a photo of every dish.' },
      { name: 'Maths Practice, Grade 6', size: 'Workbook · 120 pages', price: 650, photo: art('books', 'maths'), category: 'school', description: 'Practice for every topic in the Grade 6 syllabus, with answers at the back.' },
      { name: 'Dotted notebook', size: 'A5 · 160 pages', price: 450, photo: art('books', 'notebook'), category: 'stationery', description: 'Thick dotted pages, a ribbon marker and an elastic band to keep it shut.' },
      { name: 'Bedtime Hadithi', size: 'W. Mwangi · Story collection', price: 1100, photo: art('books', 'bedtime-hadithi'), category: 'children', description: 'Twelve short stories from across East Africa, each one just right for bedtime.' },
      { name: 'Colour pencils', size: 'Box of 24', price: 550, photo: art('books', 'pencils'), category: 'stationery', description: 'Twenty-four bright, pre-sharpened colours with soft leads that don’t snap.' },
    ],
  },
  hardware: {
    kind: 'hardware', name: 'Jenga Hardware', brand: { style: 'depot', accent: '#E3A008', tagline: 'Everything you need to build' },
    categories: [{ id: 'building', label: 'Building' }, { id: 'paint', label: 'Paint' }, { id: 'tools', label: 'Tools' }],
    products: [
      { name: 'Cement', size: '50 kg bag · 42.5N', price: 780, photo: art('hardware', 'cement'), category: 'building', badge: 'Trade price', description: 'General-purpose Portland cement for foundations, blocks and plaster. Ask about prices for 50 bags or more.' },
      { name: 'Emulsion paint', size: 'Brilliant white · 20 L', price: 6500, photo: art('hardware', 'paint'), category: 'paint', description: 'A washable matt emulsion for inside walls and ceilings. About 120 m² per tin, two coats.' },
      { name: 'Cordless drill', size: '18 V · 2 batteries', price: 9800, photo: art('hardware', 'drill'), category: 'tools', badge: 'New', description: 'Drill and drive with two batteries, a charger and a carry case. Two speeds and a hammer setting.' },
      { name: 'Claw hammer', size: '16 oz · fibreglass', price: 950, photo: art('hardware', 'hammer'), category: 'tools', description: 'A forged steel head on a fibreglass handle with a rubber grip.' },
      { name: 'Steel toolbox', size: '3 trays · 50 cm', price: 3400, photo: art('hardware', 'toolbox'), category: 'tools', description: 'A lockable steel box with three fold-out trays.' },
      { name: 'Wheelbarrow', size: 'Heavy duty · 85 L', price: 5600, photo: art('hardware', 'wheelbarrow'), category: 'building', description: 'A deep steel tray on a pneumatic tyre, made for site work.' },
      { name: 'Paint roller set', size: '9" roller · tray', price: 850, photo: art('hardware', 'roller'), category: 'paint', description: 'A 9-inch roller with a medium nap for walls, and a tray to load it.' },
      { name: 'Brass padlock', size: '50 mm · 3 keys', price: 1200, photo: art('hardware', 'padlock'), category: 'tools', description: 'A solid brass padlock with a hardened steel shackle and three keys.' },
    ],
  },
});

platformRouter.get('/samples/:id', (req, res) => {
  const sample = TEMPLATE_SAMPLES[req.params.id];
  if (!sample) throw new HttpError(404, 'No sample shop by that name');
  const b = makeBrand({ slug: `sample-${req.params.id}`, name: sample.name, kind: sample.kind, city: 'Nairobi', phone: PLATFORM_PHONE, email: '', brand: JSON.stringify({ ...sample.brand, products: sample.products }) });
  const products = b.catalog.map(({ cost, estimate, active, popularity, ...p }, i) => ({
    ...p,
    category: sample.products[i].category ?? 'all',
    badge: sample.products[i].badge,
    notes: [],
    look: { photo: '', ...p.look },
  }));
  const content = { ...b.content, shop: { ...b.content.shop, categories: sample.categories ?? [] } };
  res.json({
    look: clientBrand(b),
    products,
    content,
    posts: b.posts.map((p, i) => ({ id: i + 1, ...p, image: '', pinned: Boolean(p.pinned), published: true, createdAt: new Date().toISOString() })),
    config: {
      currency: 'Ksh',
      deliveryEnabled: true,
      deliveryFee: 0,
      freeDeliveryThreshold: 0,
      deliveryNote: b.store.deliveryNote,
      pickup: b.store.pickup,
      paybill: b.store.paybill,
      mpesaPrompt: true,
      paymentMethods: [{ id: 'mpesa', label: 'M-Pesa', hint: 'This is a sample shop: no order is placed and no money is taken', prompt: true }],
    },
  });
});

// ---------- the link ----------
function linkProblem(link) {
  if (!LINK_RULE.test(link)) return 'Shop link must be 3–30 letters, numbers or dashes (no dash at the start or end).';
  if (RESERVED.has(link)) return 'That link is reserved. Try another.';
  const taken = getShopRecord(link);
  // A link held by a signup that never paid is released after three days.
  if (taken && !(taken.status === 'pending' && Date.now() - Date.parse(taken.updated_at) > 3 * 864e5)) return 'That link is taken.';
  return null;
}
function suggestions(base) {
  const out = [];
  for (const s of [base, `${base}-ke`, `${base}-shop`, `${base}-store`, `${base}${new Date().getFullYear() % 100}`]) {
    if (out.length < 3 && !linkProblem(s)) out.push(s);
  }
  return out;
}

platformRouter.get('/check-link', (req, res) => {
  const link = text(req.query.link, 40).toLowerCase();
  const problem = linkProblem(link);
  res.json({ link, available: !problem, problem, suggestions: problem ? suggestions(slugify(link).replace(/[^a-z0-9-]/g, '') || 'shop') : [] });
});

// ---------- step 1: the business and the owner's account ----------
platformRouter.post('/signup', (req, res) => {
  if (!STORAGE_LASTS) throw Object.assign(new HttpError(409, `New shops open soon. WhatsApp ${PLATFORM_PHONE} and we'll set yours up the day we do.`), { code: 'SIGNUPS_PAUSED' });
  const b = req.body ?? {};
  const name = text(b.name, 60);
  const link = text(b.link, 40).toLowerCase().replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
  const email = text(b.email, 120).toLowerCase();
  const ownerName = text(b.ownerName, 60);
  const city = text(b.city, 40);
  const phone = text(b.phone, 20);
  const password = String(b.password ?? '').trim();
  if (name.length < 2) throw new HttpError(400, 'Enter your business name');
  if (!KINDS[b.kind]) throw new HttpError(400, 'Choose what you sell');
  if (ownerName.length < 2) throw new HttpError(400, 'Enter your name');
  if (!toMsisdn(phone)) throw new HttpError(400, 'Enter a Safaricom number, e.g. 0712 345 678');
  if (!EMAIL.test(email)) throw new HttpError(400, 'Enter a valid email address');
  if (password.length < 8) throw new HttpError(400, 'Use at least 8 characters for your password');
  const problem = linkProblem(link);
  if (problem) throw new HttpError(409, problem);

  const { salt, hash } = hashPassword(password);
  const token = randomBytes(24).toString('hex');
  const at = now();
  // An expired, unpaid hold on this link: clear it and anything that signup uploaded.
  if (pdb.prepare('DELETE FROM shops WHERE slug = ?').run(link).changes) forgetShop(link);
  pdb
    .prepare(`INSERT INTO shops (slug, name, kind, city, owner_name, phone, email, password_salt, password_hash, setup_token, brand, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(link, name, b.kind, city, ownerName, phone, email, salt, hash, token, JSON.stringify({ style: KINDS[b.kind].style }), at, at);
  res.status(201).json({ token, link });
});

// Everything after signup carries the setup token.
function signup(req) {
  const token = req.get('x-setup-token') ?? req.query.token;
  let shop = shopByToken(token);
  // A serverless copy that lost its signups (its storage is temporary) can take the signup back from the browser's
  // own copy, but only for a link nobody holds, with the owner's real password and email, through the same checks
  // as a new signup. It never replaces a shop that exists: that would hand someone else's shop to whoever asked.
  if (!shop && req.body?.backupSignup) {
    const b = req.body.backupSignup;
    const link = text(b.link, 40).toLowerCase().replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
    const email = text(b.email, 120).toLowerCase();
    const password = String(b.password ?? '').trim();
    const setupToken = String(token || b.token || '');
    if (link && text(b.name, 60).length >= 2 && KINDS[b.kind] && EMAIL.test(email) && password.length >= 8 && /^[a-f0-9]{48}$/.test(setupToken) && !linkProblem(link)) {
      if (pdb.prepare("DELETE FROM shops WHERE slug = ? AND status = 'pending'").run(link).changes) forgetShop(link); // an expired hold, as at signup
      const { salt, hash } = hashPassword(password);
      const at = now();
      try {
        pdb.prepare('INSERT INTO shops (slug, name, kind, city, owner_name, phone, email, password_salt, password_hash, setup_token, brand, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run(link, text(b.name, 60), b.kind, text(b.city, 40), text(b.ownerName, 60) || text(b.name, 60), text(b.phone, 20), email, salt, hash, setupToken, JSON.stringify(b.brand && typeof b.brand === 'object' ? b.brand : {}), at, at);
        shop = shopByToken(setupToken);
      } catch (err) {
        console.error('Could not restore a signup from the browser:', err.message);
      }
    }
  }
  if (!shop) throw new HttpError(401, 'Your signup has expired. Please start again.');
  return shop;
}
const view = (shop) => {
  const spec = JSON.parse(shop.brand || '{}');
  return {
    link: shop.slug,
    name: shop.name,
    kind: shop.kind,
    city: shop.city,
    phone: shop.phone,
    status: shop.status,
    paidUntil: shop.paid_until,
    url: shopUrl(shop.slug),
    brand: spec,
  };
};

platformRouter.get('/signup', (req, res) => res.json(view(signup(req))));

// ---------- step 2: pay ----------
platformRouter.post('/pay', async (req, res) => {
  const shop = signup(req);
  const id = await startPayment(shop.slug, { phone: req.body?.phone || shop.phone, plan: req.body?.plan || 'monthly' });
  res.status(201).json({ id, testMode });
});
platformRouter.get('/pay/:id', async (req, res) => res.json(await paymentStatus(signup(req).slug, req.params.id)));

// Safaricom's result for a prompt. The URL carries a secret only we and Safaricom know.
platformRouter.post(`/mpesa/callback/:secret`, (req, res) => {
  const a = Buffer.from(String(req.params.secret));
  const b = Buffer.from(callbackSecret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return res.status(404).end();
  const cb = req.body?.Body?.stkCallback;
  if (cb?.CheckoutRequestID) {
    const receipt = cb.CallbackMetadata?.Item?.find((i) => i.Name === 'MpesaReceiptNumber')?.Value ?? null;
    settle(cb.CheckoutRequestID, resultOf(cb.ResultCode, cb.ResultDesc), receipt);
  }
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// ---------- step 3: brand ----------
export const UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const roleOf = (r) => (['logo', 'photo', 'product'].includes(r) ? r : 'photo');

platformRouter.post('/upload', express.raw({ type: UPLOAD_TYPES, limit: '8mb' }), async (req, res) => {
  const shop = signup(req);
  res.status(201).json(await saveUpload(shop.slug, roleOf(req.query.role), req.body));
});

/** Saves a picture for a shop (resized, as WebP) and finds its accent colours. */
export async function saveUpload(slug, role, body) {
  if (!Buffer.isBuffer(body) || body.length < 100) throw new HttpError(400, 'Choose a JPG, PNG or WebP picture');
  let img = sharp(body, { failOn: 'error' }).rotate();
  const meta = await img.metadata().catch(() => null);
  if (!meta?.width) throw new HttpError(400, 'That file doesn’t look like a picture');
  // Banner photos keep their shape; product photos are cropped to the card's 4:5; logos keep transparency.
  img =
    role === 'logo'
      ? img.resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      : role === 'product'
        ? img.resize(960, 1200, { fit: 'cover', position: sharp.strategy.attention })
        : img.resize(1600, 1600, { fit: 'inside', withoutEnlargement: true });
  const name = `${role === 'photo' ? 'hero' : role}-${Date.now().toString(36)}${randomBytes(3).toString('hex')}.webp`;
  const dir = join(shopDir(slug), 'uploads');
  mkdirSync(dir, { recursive: true });
  const out = await img.webp({ quality: 84 }).toBuffer();
  writeFileSync(join(dir, name), out);
  const accents = role === 'product' ? [] : await accentsFrom(out).catch(() => []);
  return { url: `/uploads/${name}`, accents };
}

// Uploaded pictures are shown in the wizard before the shop exists, from the platform's own address.
platformRouter.get('/uploads/:slug/:file', (req, res) => {
  if (!/^[a-z0-9-]+$/.test(req.params.slug) || !/^[\w.-]+\.webp$/.test(req.params.file)) return res.status(404).end();
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.sendFile(join(shopDir(req.params.slug), 'uploads', req.params.file), (err) => err && res.status(404).end());
});

/** Palette choices from accent colours found in the owner's pictures. */
platformRouter.post('/palettes', (req, res) => {
  const shop = signup(req);
  const accents = (Array.isArray(req.body?.accents) ? req.body.accents : []).filter((c) => /^#[0-9a-f]{6}$/i.test(c)).slice(0, 6);
  const mode = req.body?.mode === 'dark' ? 'dark' : 'light';
  res.json(paletteOptions(accents, KINDS[shop.kind].accent, mode));
});

const UPLOAD_URL = /^\/uploads\/[\w.-]+\.webp$/;
platformRouter.put('/brand', (req, res) => res.json(applyBrand(signup(req).slug, req.body)));

/** Updates a shop's look and starter details, from the wizard or the shop admin's Look page. */
export function applyBrand(slug, b = {}) {
  const shop = getShopRecord(slug);
  const prev = JSON.parse(shop.brand || '{}');
  const color = (c) => (/^#[0-9a-f]{6}$/i.test(c ?? '') ? c.toUpperCase() : undefined);
  const products = (Array.isArray(b.products) ? b.products : prev.products ?? [])
    .slice(0, 12)
    .map((p) => ({ name: text(p.name, 60), size: text(p.size, 20), price: Math.max(0, Math.round(Number(p.price) || 0)), photo: UPLOAD_URL.test(p.photo ?? '') ? p.photo : '', description: text(p.description, 300) }))
    .filter((p) => p.name && p.price > 0);
  const next = {
    ...prev,
    style: STYLES[b.style] ? b.style : prev.style,
    mode: ['light', 'dark'].includes(b.mode) ? b.mode : prev.mode,
    accent: color(b.accent) ?? prev.accent,
    // Colours found in the owner's pictures, so the choices are still there when they come back.
    accents: Array.isArray(b.accents) ? b.accents.map(color).filter(Boolean).slice(0, 5) : prev.accents,
    second: color(b.second) ?? prev.second,
    tagline: b.tagline !== undefined ? text(b.tagline, 60) : prev.tagline,
    about: b.about !== undefined ? text(b.about, 400) : prev.about,
    logo: b.logo !== undefined ? (UPLOAD_URL.test(b.logo) ? b.logo : '') : prev.logo,
    photos: Array.isArray(b.photos) ? b.photos.filter((u) => UPLOAD_URL.test(u) && u.includes('/hero-')).slice(0, 4) : prev.photos,
    products,
    till: b.till !== undefined ? text(b.till, 12).replace(/\D/g, '') : prev.till,
    paybill: b.paybill !== undefined ? text(b.paybill, 12).replace(/\D/g, '') : prev.paybill,
    account: b.account !== undefined ? text(b.account, 20) : prev.account,
  };
  updateShop(slug, { brand: JSON.stringify(next) });
  const fresh = getShopRecord(slug);
  return { ...view(fresh), preview: clientBrand(makeBrand(fresh)) };
}

// ---------- step 4: go live ----------
// A shop's address: <link>.localhost locally, <link>.<domain> once the platform is served on its own domain,
// and <platform address>/s/<link> before that (e.g. on the host's default address, with no wildcard DNS).
const shopUrl = (slug, req) => {
  const host = (req ? requestHost(req) ?? '' : '').toLowerCase();
  const bare = host.replace(/:\d+$/, '');
  if (bare === 'localhost' || bare.endsWith('.localhost')) return `${req.protocol}://${slug}.localhost:${host.split(':')[1] ?? ''}`.replace(/:$/, '');
  if (PLATFORM_DOMAIN && (!req || bare === PLATFORM_DOMAIN || bare.endsWith(`.${PLATFORM_DOMAIN}`))) return `https://${slug}.${PLATFORM_DOMAIN}`;
  if (!req) return `${PUBLIC_URL}/s/${slug}`;
  return `${req.protocol}://${host}/s/${slug}`;
};

// The shop's contents as the owner set them in the wizard: products (replacing any earlier preview) and the
// welcome post. Only for shops that aren't live yet: nobody has ordered from them.
function stockShop(slug) {
  const record = getShopRecord(slug);
  if (record.status === 'live') return getShop(slug);
  const shop = getShop(slug);
  runAs(shop, () => {
    seed({ reset: true });
    ensureStarterPosts();
  });
  return shop;
}
function readyProblem(spec) {
  if (!spec.products?.length) return 'Add at least one product so customers have something to buy.';
  if (!spec.till && !spec.paybill) return 'Add the M-Pesa Till or Paybill your customers pay to.';
  return null;
}

/** Builds the real shop from the wizard and returns its private preview address. */
platformRouter.post('/preview', (req, res) => {
  const record = signup(req);
  if (req.body?.backupSignup?.brand) {
    try { updateShop(record.slug, { brand: JSON.stringify(req.body.backupSignup.brand) }); } catch {}
  }
  // Checked against the brand as saved now (the browser may just have sent its copy).
  const problem = readyProblem(JSON.parse(getShopRecord(record.slug)?.brand || '{}'));
  if (problem) throw new HttpError(400, problem);
  stockShop(record.slug);
  res.json({ url: `${shopUrl(record.slug, req)}/?preview=${previewToken(getShopRecord(record.slug))}` });
});

platformRouter.post('/launch', (req, res) => {
  const record = signup(req);
  if (record.status === 'pending') throw new HttpError(402, 'Pay for your plan first, then you can open your shop.');
  const problem = readyProblem(JSON.parse(record.brand || '{}'));
  if (problem) throw new HttpError(400, problem);
  // Create the shop: catalogue, welcome post, and the owner's account (the password they chose at signup).
  const shop = stockShop(record.slug);
  const handoff = runAs(shop, () => {
    setOwnerHashed(record.email, { salt: record.password_salt, hash: record.password_hash });
    return ownerToken();
  });
  // The setup token is used up: from now on the owner signs in to their shop's admin.
  updateShop(record.slug, { status: 'live', setup_token: randomBytes(24).toString('hex') });
  res.json({ url: shopUrl(record.slug, req), admin: `${shopUrl(record.slug, req)}/admin#handoff=${encodeURIComponent(handoff)}&u=${encodeURIComponent(record.email)}`, state: shopState(getShopRecord(record.slug)) });
});

export { billingSummary, shopUrl };

