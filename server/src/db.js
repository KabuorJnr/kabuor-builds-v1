// Each shop keeps its own SQLite database and uploads folder: data/shops/<slug>/shop.db and .../uploads.
// The platform opens a shop's database the first time a request for that shop arrives (see platform/shops.js);
// route code uses `db`, a live view of the current request's shop.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { currentShop, live } from './tenant.js';

export const db = live(() => currentShop().db);
export const uploadDir = () => currentShop().uploadDir;

/** Opens (creating if needed) a shop's database in dir, with every table and migration applied. */
export function openShopDb(dir) {
  mkdirSync(join(dir, 'uploads'), { recursive: true });
  const db = new DatabaseSync(join(dir, 'shop.db'));

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS products (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      category    TEXT NOT NULL,
      size        TEXT NOT NULL,
      description TEXT NOT NULL,
      notes       TEXT NOT NULL,           -- JSON array of tasting notes
      look        TEXT NOT NULL,           -- JSON: jar label colours and text
      badge       TEXT,
      price       INTEGER NOT NULL,        -- minor units
      cost        INTEGER NOT NULL,        -- minor units, for COGS / gross profit
      stock       INTEGER NOT NULL,
      rating      REAL NOT NULL DEFAULT 5,
      reviews     INTEGER NOT NULL DEFAULT 0,
      sort        INTEGER NOT NULL DEFAULT 0,
      active      INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      code           TEXT NOT NULL UNIQUE,
      customer_name  TEXT NOT NULL,
      phone          TEXT NOT NULL,
      email          TEXT,
      address        TEXT NOT NULL,
      city           TEXT NOT NULL,
      note           TEXT,
      payment_method TEXT NOT NULL,
      status         TEXT NOT NULL DEFAULT 'pending',
      subtotal       INTEGER NOT NULL,
      delivery_fee   INTEGER NOT NULL,
      total          INTEGER NOT NULL,
      cost_total     INTEGER NOT NULL,
      items_count    INTEGER NOT NULL,
      created_at     TEXT NOT NULL,
      updated_at     TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

    -- Line items snapshot name/price/cost so the books never change when the catalogue does.
    CREATE TABLE IF NOT EXISTS order_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      name       TEXT NOT NULL,
      unit_price INTEGER NOT NULL,
      unit_cost  INTEGER NOT NULL,
      qty        INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_items_order ON order_items(order_id);

    CREATE TABLE IF NOT EXISTS subscribers (
      email      TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    );

    -- Admin-editable documents: website copy ('content') and shop operations ('store').
    CREATE TABLE IF NOT EXISTS settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- News/updates the admin posts to the website.
    CREATE TABLE IF NOT EXISTS posts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT NOT NULL,
      body       TEXT NOT NULL DEFAULT '',
      tag        TEXT NOT NULL DEFAULT '',
      image      TEXT,
      link_label TEXT,
      link_href  TEXT,
      pinned     INTEGER NOT NULL DEFAULT 0,
      published  INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Migrations for databases created before a column existed.
  const orderColumns = db.prepare('PRAGMA table_info(orders)').all().map((c) => c.name);
  if (!orderColumns.includes('fulfilment')) {
    db.exec("ALTER TABLE orders ADD COLUMN fulfilment TEXT NOT NULL DEFAULT 'delivery'");
  }
  if (!orderColumns.includes('branch')) {
    db.exec('ALTER TABLE orders ADD COLUMN branch TEXT');
  }
  // 'website' for online orders; walkin/phone/whatsapp/market/wholesale/other for sales recorded by the admin.
  if (!orderColumns.includes('channel')) {
    db.exec("ALTER TABLE orders ADD COLUMN channel TEXT NOT NULL DEFAULT 'website'");
  }
  // Whether the order took stock off the shelf (so cancelling knows whether to put it back).
  if (!orderColumns.includes('stock_deducted')) {
    db.exec('ALTER TABLE orders ADD COLUMN stock_deducted INTEGER NOT NULL DEFAULT 1');
  }

  db.exec(`
    -- M-Pesa prompts (STK push) sent for website orders, one row per attempt.
    CREATE TABLE IF NOT EXISTS payments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      checkout_id TEXT UNIQUE,
      phone       TEXT NOT NULL,
      amount      INTEGER NOT NULL,                -- whole shillings, as sent to M-Pesa
      status      TEXT NOT NULL DEFAULT 'pending', -- pending | paid | failed
      result_code TEXT,
      result_desc TEXT,
      receipt     TEXT,
      checked_at  TEXT,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

    -- Every SMS sent through Africa's Talking (receipts, admin alerts), with its outcome and cost.
    CREATE TABLE IF NOT EXISTS sms_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER,
      kind       TEXT NOT NULL,
      phone      TEXT NOT NULL,
      message    TEXT NOT NULL,
      status     TEXT NOT NULL,   -- sent | failed
      cost       TEXT,
      error      TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sms_order ON sms_log(order_id);

    -- M-Pesa payments the admin confirmed by pasting the confirmation SMS. One row per transaction code.
    CREATE TABLE IF NOT EXISTS mpesa_confirmations (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      code       TEXT NOT NULL UNIQUE,
      order_id   INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      amount     INTEGER,
      payer      TEXT,
      phone      TEXT,
      account    TEXT,
      paid_at    TEXT,
      message    TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_mpesa_conf_order ON mpesa_confirmations(order_id);

    -- Admin devices that asked for order alerts (Web Push).
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint   TEXT PRIMARY KEY,
      keys       TEXT NOT NULL,
      label      TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
  `);

  // Website orders carry a secret so only the customer's browser can retry or check the M-Pesa prompt.
  if (!orderColumns.includes('pay_token')) {
    db.exec('ALTER TABLE orders ADD COLUMN pay_token TEXT');
  }
  // The customer tapped "I've paid" (Paybill): when, and the M-Pesa code they gave, for the admin to check.
  if (!orderColumns.includes('payment_claimed_at')) {
    db.exec('ALTER TABLE orders ADD COLUMN payment_claimed_at TEXT');
  }
  if (!orderColumns.includes('payment_ref')) {
    db.exec('ALTER TABLE orders ADD COLUMN payment_ref TEXT');
  }
  // When the admin last opened the "Order Confirmed" WhatsApp message for this order.
  if (!orderColumns.includes('whatsapp_confirmed_at')) {
    db.exec('ALTER TABLE orders ADD COLUMN whatsapp_confirmed_at TEXT');
  }
  // Secret part of the order's public receipt link.
  if (!orderColumns.includes('receipt_token')) {
    db.exec('ALTER TABLE orders ADD COLUMN receipt_token TEXT');
  }
  // Kabuor ERP: the invoice a paid order became there, when, or why it hasn't gone yet.
  if (!orderColumns.includes('erp_synced_at')) {
    db.exec('ALTER TABLE orders ADD COLUMN erp_invoice TEXT');
    db.exec('ALTER TABLE orders ADD COLUMN erp_synced_at TEXT');
    db.exec('ALTER TABLE orders ADD COLUMN erp_error TEXT');
  }


  return db;
}

export function tx(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function toProduct(row, { withCost = false } = {}) {
  const { cost, notes, look, active, sort, ...rest } = row;
  return {
    ...rest,
    notes: JSON.parse(notes),
    look: JSON.parse(look),
    active: Boolean(active),
    ...(withCost ? { cost } : {}),
  };
}
