// Seeds the starter catalogue. With --demo it also adds two years of fake orders for trying the dashboard.
// `npm run seed` resets the catalogue (and wipes orders). Never use --demo on a live shop.
import { pathToFileURL } from 'node:url';
import { db, tx } from './db.js';
import { catalog } from './catalog.js';
import { brand } from './tenant.js';

const FIRST = ['Wanjiku', 'Kamau', 'Achieng', 'Otieno', 'Njeri', 'Mwangi', 'Akinyi', 'Kiprop', 'Wambui', 'Mutua', 'Chebet', 'Omondi', 'Nyambura', 'Kariuki', 'Atieno', 'Kimani', 'Moraa', 'Wekesa', 'Zawadi', 'Baraka', 'Amani', 'Imani', 'Ciku', 'Juma'];
const LAST = ['Ndungu', 'Odhiambo', 'Kiprotich', 'Wairimu', 'Mutiso', 'Owino', 'Gitau', 'Kibet', 'Nyaga', 'Ouma', 'Maina', 'Langat', 'Wanyama', 'Njoroge', 'Onyango', 'Macharia'];
// Each branch dispatches to its surrounding towns. Kisumu is the new branch, so it only appears recently.
const BRANCHES = [
  { city: 'Nairobi', weight: 42, towns: ['Nairobi', 'Thika', 'Kiambu', 'Machakos'] },
  { city: 'Mombasa', weight: 26, towns: ['Mombasa', 'Kilifi', 'Malindi'] },
  { city: 'Rodi', weight: 16, towns: ['Rodi Kopany', 'Homa Bay', 'Mbita'] },
  { city: 'Kisumu', weight: 22, towns: ['Kisumu', 'Kakamega', 'Siaya'], sinceDaysAgo: 75 },
];
const STREETS = ['Kenyatta Ave', 'Moi Rd', 'Ngong Rd', 'Oginga Odinga St', 'Nyerere Rd', 'Kimathi St'];
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function orderCode(rand = Math.random) {
  let s = '';
  for (let i = 0; i < 6; i++) s += CODE_CHARS[Math.floor(rand() * CODE_CHARS.length)];
  return `${brand.orderPrefix}-${s}`;
}

function insertCatalog() {
  const stmt = db.prepare(`INSERT INTO products (id, name, category, size, description, notes, look, badge, price, cost, stock, rating, reviews, sort)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  catalog().forEach((p, i) =>
    stmt.run(p.id, p.name, p.category, p.size, p.description, JSON.stringify(p.notes), JSON.stringify(p.look), p.badge ?? null, p.price, p.cost, p.stock, p.rating, p.reviews, i),
  );
}

function insertHistory(days = 730) {
  const rand = mulberry32(20261010);
  const pick = (weighted) => {
    const total = weighted.reduce((s, [, w]) => s + w, 0);
    let r = rand() * total;
    for (const [v, w] of weighted) if ((r -= w) <= 0) return v;
    return weighted[0][0];
  };
  const products = catalog().map((p) => [p, p.popularity]);
  const insertOrder = db.prepare(`INSERT INTO orders (code, customer_name, phone, email, address, city, payment_method, fulfilment, branch, status, subtotal, delivery_fee, total, cost_total, items_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'mpesa', 'delivery', ?, ?, ?, 0, ?, ?, ?, ?, ?)`);
  const insertItem = db.prepare(`INSERT INTO order_items (order_id, product_id, name, unit_price, unit_cost, qty) VALUES (?, ?, ?, ?, ?, ?)`);

  const now = new Date();
  for (let d = days - 1; d >= 0; d--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
    const growth = 3 + 6 * ((days - d) / days);
    const weekend = [0, 6].includes(day.getDay()) ? 1.35 : 1;
    const festive = day.getMonth() === 11 ? 1.5 : 1;
    const count = Math.max(0, Math.round(growth * weekend * festive * (0.55 + rand() * 0.9)));
    const open = BRANCHES.filter((b) => !b.sinceDaysAgo || d <= b.sinceDaysAgo).map((b) => [b, b.weight]);

    for (let n = 0; n < count; n++) {
      const at = new Date(day);
      at.setHours(7 + Math.floor(rand() * 15), Math.floor(rand() * 60), Math.floor(rand() * 60));
      if (at > now) continue;

      const lines = new Map();
      const lineCount = rand() < 0.6 ? 1 : rand() < 0.8 ? 2 : 3;
      for (let i = 0; i < lineCount; i++) {
        const p = pick(products);
        lines.set(p, (lines.get(p) ?? 0) + (rand() < 0.7 ? 1 : rand() < 0.75 ? 2 : 3));
      }
      let subtotal = 0, cost = 0, units = 0;
      for (const [p, q] of lines) {
        subtotal += p.price * q;
        cost += p.cost * q;
        units += q;
      }

      const age = (now - at) / 86_400_000;
      const r = rand();
      const status = age > 5
        ? r < 0.05 ? 'cancelled' : r < 0.06 ? 'paid' : 'delivered'
        : age > 2
          ? r < 0.5 ? 'delivered' : r < 0.9 ? 'paid' : 'pending'
          : r < 0.5 ? 'pending' : 'paid';

      const first = FIRST[Math.floor(rand() * FIRST.length)];
      const last = LAST[Math.floor(rand() * LAST.length)];
      const branch = pick(open);
      const town = branch.towns[Math.floor(rand() * branch.towns.length)];
      const iso = at.toISOString();
      const { lastInsertRowid } = insertOrder.run(
        orderCode(rand), `${first} ${last}`, `+2547${String(Math.floor(rand() * 1e8)).padStart(8, '0')}`,
        rand() < 0.5 ? `${first}.${last}@example.com`.toLowerCase() : null,
        `${10 + Math.floor(rand() * 400)} ${STREETS[Math.floor(rand() * STREETS.length)]}`,
        town, branch.city, status, subtotal, subtotal, cost, units, iso, iso,
      );
      for (const [p, q] of lines) insertItem.run(lastInsertRowid, p.id, p.name, p.price, p.cost, q);
    }
  }
}

// Real shops start with just the catalogue. Pass { demo: true } (npm run seed -- --demo) for fake history.
export function seed({ reset = false, demo = false } = {}) {
  tx(() => {
    if (reset) db.exec('DELETE FROM order_items; DELETE FROM orders; DELETE FROM products; DELETE FROM subscribers;');
    insertCatalog();
    if (demo) insertHistory();
  });
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM orders').get();
  console.log(`Seeded ${catalog().length} products and ${n} demo orders.`);
}

export function ensureSeeded() {
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM products').get();
  if (n === 0) seed();
}

// Run directly (npm run seed). argv[1] is missing when imported by a host such as Vercel.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seed({ reset: process.argv.includes('--reset'), demo: process.argv.includes('--demo') });
}
