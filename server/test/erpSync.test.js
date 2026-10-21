// Paid shop orders reach the owner's Kabuor ERP: the right lines (with delivery), the M-Pesa receipt, the
// order code as the reference, and a failed send is kept with its reason and goes on the next try.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openShopDb } from '../src/db.js';
import { runAs } from '../src/tenant.js';
import { erpStatus, saveErp, syncOrder, syncWaiting } from '../src/erpSync.js';

const dir = mkdtempSync(join(tmpdir(), 'erp-sync-test-'));
const db = openShopDb(dir);
const got = [];
let answer = 500;
const erp = createServer((req, res) => {
  let body = '';
  req.on('data', (d) => (body += d));
  req.on('end', () => {
    got.push({ url: req.url, key: req.headers['x-api-key'], body: JSON.parse(body) });
    res.writeHead(answer, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(answer < 300 ? { invoice: 'INV-0042', status: 'Paid' } : { error: 'ERP is down for a moment' }));
  });
});
await new Promise((r) => erp.listen(0, r));
after(() => {
  erp.close();
  db.close?.();
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
});

const shop = (fn) => runAs({ slug: 'test', db, uploadDir: join(dir, 'uploads') }, fn);

test('a paid order becomes an ERP invoice, once, after a failed first try', () =>
  shop(async () => {
    const now = new Date().toISOString();
    const id = db.prepare(`INSERT INTO orders (code, customer_name, phone, address, city, payment_method, status, subtotal, delivery_fee, total, cost_total, items_count, created_at, updated_at)
      VALUES ('HNY-1001', 'Achieng Otieno', '0733444555', 'Kilimani', 'Nairobi', 'mpesa', 'paid', 130000, 20000, 150000, 60000, 2, ?, ?)`).run(now, now).lastInsertRowid;
    db.prepare(`INSERT INTO order_items (order_id, product_id, name, unit_price, unit_cost, qty) VALUES (?, 'HNY500', 'Honey 500g', 65000, 30000, 2)`).run(id);
    db.prepare(`INSERT INTO payments (order_id, checkout_id, phone, amount, status, receipt, created_at, updated_at) VALUES (?, 'ws_1', '254733444555', 1500, 'paid', 'TJK9XYZ001', ?, ?)`).run(id, now, now);

    assert.throws(() => saveErp({ url: `http://localhost:${erp.address().port}`, key: 'not-a-key' }), /kerp_/);
    saveErp({ url: `http://localhost:${erp.address().port}/`, key: 'kerp_test123456' });
    assert.equal(erpStatus().keyHint, 'kerp_test…');

    await syncOrder(id); // the ERP is down
    assert.equal(erpStatus().waiting, 1);
    assert.match(erpStatus().lastError, /down/);

    answer = 201;
    await syncWaiting();
    assert.equal(erpStatus().waiting, 0);
    assert.equal(db.prepare('SELECT erp_invoice FROM orders WHERE id = ?').get(id).erp_invoice, 'INV-0042');

    const sent = got.at(-1);
    assert.equal(sent.url, '/api/v1/orders');
    assert.equal(sent.key, 'kerp_test123456');
    assert.equal(sent.body.externalRef, 'HNY-1001');
    assert.equal(sent.body.mpesaReceipt, 'TJK9XYZ001');
    assert.deepEqual(sent.body.lines, [
      { sku: 'HNY500', description: 'Honey 500g', quantity: 2, unitPrice: 65000 },
      { description: 'Delivery', quantity: 1, unitPrice: 20000 },
    ]);

    const before = got.length;
    await syncOrder(id); // already in the ERP: not sent again
    assert.equal(got.length, before);
  }));
