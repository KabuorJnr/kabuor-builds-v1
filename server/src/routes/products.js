// Admin product management: list with sales, add, edit any detail (incl. packaging art), reorder, delete.
// Past orders keep their own copy of name/price/cost, so deleting a product never changes the books.
import { Router } from 'express';
import { db, tx, HttpError, toProduct } from '../db.js';
import { brand } from '../tenant.js';
import { catalog } from '../catalog.js';

import { bool, color, int, list, normalize, obj, oneOf, slugify, str } from '../content.js';

export const adminProducts = Router();

export const SHAPES = ['jar', 'tub', 'squeeze', 'pump', 'dropper', 'spray', 'balm', 'candle', 'box', 'pouch', 'bar'];
// photo: an uploaded picture (shown instead of the drawing); fact: the one-line detail on the card; heat: 0–5 chillies;
// facet: the quick-filter group it belongs to (see the brand's facets).
const LOOK = obj({ shape: oneOf(SHAPES), lid: color(), label: color(), ink: color(), accent: color(), spread: color(), cap: color(), title: str(40), sub: str(40), pack: str(16), wicks: int(1, 3), wood: bool(), photo: str(160), fact: str(48), heat: int(0, 5), facet: str(30) });
const PRODUCT = obj({
  name: str(60),
  category: str(40),
  size: str(20),
  description: str(600),
  notes: list(str(24), 4),
  badge: str(16),
  price: int(0, 100_000_000),
  cost: int(0, 100_000_000),
  stock: int(0, 1_000_000),
  active: bool(),
  look: LOOK,
});


const newProduct = () => ({
  name: '',
  category: 'all',
  size: '',
  description: '',
  notes: [],
  badge: '',
  price: 0,
  cost: 0,
  stock: 0,
  active: true,
  look: { ...(catalog()[0]?.look ?? { shape: 'jar', lid: '#2A2A2A', label: '#FFFFFF', ink: '#222222', accent: '#888888', spread: '#C68A4E' }), photo: '', title: '', sub: '', cap: catalog()[0]?.look?.cap ?? '#000000', wicks: 1, wood: false },
});

const editable = (row) => {
  const p = toProduct(row, { withCost: true });
  return { name: p.name, category: p.category, size: p.size, description: p.description, notes: p.notes, badge: p.badge ?? '', price: p.price, cost: p.cost, stock: p.stock, active: p.active, look: { ...newProduct().look, ...p.look } };
};

function validate(p) {
  if (p.name.length < 2) throw new HttpError(400, 'Give the product a name');
  if (!p.size) throw new HttpError(400, 'Enter the size, e.g. 250g');
  if (p.price < 1) throw new HttpError(400, 'Enter a selling price');
  p.notes = p.notes.filter(Boolean);
  // A photo is only ever one of our own uploads; a filter group must be one the brand offers.
  if (p.look.photo && !/^\/uploads\/[\w.-]+$/.test(p.look.photo)) p.look.photo = '';
  if (p.look.facet && !(brand.facets?.options ?? []).some(([id]) => id === p.look.facet)) p.look.facet = '';
}

function soldMap() {
  return new Map(
    db.prepare(`SELECT oi.product_id AS id, SUM(oi.qty) AS units FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE o.status != 'cancelled' GROUP BY oi.product_id`).all().map((r) => [r.id, r.units]),
  );
}

const write = { run: (...args) => db.prepare(`UPDATE products SET name = ?, category = ?, size = ?, description = ?, notes = ?, look = ?, badge = ?, price = ?, cost = ?, stock = ?, active = ? WHERE id = ?`).run(...args) };

adminProducts.get('/products', (req, res) => {
  const sold = soldMap();
  const rows = db.prepare('SELECT * FROM products ORDER BY sort, name').all();
  res.json(rows.map((r) => ({ ...toProduct(r, { withCost: true }), sold: sold.get(r.id) ?? 0 })));
});

adminProducts.post('/products', (req, res) => {
  const p = normalize(PRODUCT, req.body, newProduct());
  validate(p);
  const base = slugify(`${p.name} ${p.size}`) || 'product';
  let id = base;
  for (let n = 2; db.prepare('SELECT 1 FROM products WHERE id = ?').get(id); n++) id = `${base}-${n}`;
  const sort = db.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS s FROM products').get().s;
  db.prepare(`INSERT INTO products (id, name, category, size, description, notes, look, badge, price, cost, stock, rating, reviews, sort, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`).run(
    id, p.name, p.category || 'all', p.size, p.description, JSON.stringify(p.notes), JSON.stringify(p.look), p.badge || null,
    p.price, p.cost, p.stock, sort, p.active ? 1 : 0,
  );
  res.status(201).json({ ...toProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(id), { withCost: true }), sold: 0 });
});

adminProducts.patch('/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) throw new HttpError(404, 'Product not found');
  const current = editable(row);
  const body = req.body ?? {};
  const p = normalize(PRODUCT, { ...current, ...body, look: { ...current.look, ...(body.look ?? {}) } }, current);
  validate(p);
  write.run(p.name, p.category || 'all', p.size, p.description, JSON.stringify(p.notes), JSON.stringify(p.look), p.badge || null, p.price, p.cost, p.stock, p.active ? 1 : 0, row.id);
  res.json({ ...toProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(row.id), { withCost: true }), sold: soldMap().get(row.id) ?? 0 });
});

adminProducts.delete('/products/:id', (req, res) => {
  const { changes } = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (!changes) throw new HttpError(404, 'Product not found');
  res.json({ ok: true });
});

adminProducts.post('/products/order', (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((x) => typeof x === 'string').slice(0, 200) : [];
  const setSort = db.prepare('UPDATE products SET sort = ? WHERE id = ?');
  tx(() => ids.forEach((id, i) => setSort.run(i, id)));
  res.json({ ok: true });
});
