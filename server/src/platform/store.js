// The platform's own database (data/platform.db): every shop's signup, status and subscription, and the
// M-Pesa payments owners made to the platform. Each shop's orders and products live in its own database.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_DIR } from '../site.js';

mkdirSync(DATA_DIR, { recursive: true });
export const pdb = new DatabaseSync(join(DATA_DIR, 'platform.db'));

pdb.exec(`
  PRAGMA journal_mode = WAL;

  -- status: pending (waiting for the first payment) → setup (paid, being branded) → live; paused when unpaid.
  CREATE TABLE IF NOT EXISTS shops (
    slug          TEXT PRIMARY KEY,           -- the link: <slug>.<platform domain>
    name          TEXT NOT NULL,
    kind          TEXT NOT NULL,              -- what they sell (see presets.js)
    city          TEXT NOT NULL DEFAULT '',
    owner_name    TEXT NOT NULL,
    phone         TEXT NOT NULL,
    email         TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'pending',
    plan          TEXT NOT NULL DEFAULT 'monthly',
    paid_until    TEXT,
    setup_token   TEXT NOT NULL,              -- lets the signup wizard continue (kept in the owner's browser)
    brand         TEXT NOT NULL DEFAULT '{}', -- JSON: colours, look, tagline, logo, photos, first products
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_shops_email ON shops(email);

  -- Subscription payments by M-Pesa prompt, one row per attempt.
  CREATE TABLE IF NOT EXISTS payments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT NOT NULL REFERENCES shops(slug) ON DELETE CASCADE,
    checkout_id TEXT UNIQUE,
    phone       TEXT NOT NULL,
    amount      INTEGER NOT NULL,              -- whole shillings
    plan        TEXT NOT NULL,                 -- monthly | yearly
    status      TEXT NOT NULL DEFAULT 'pending', -- pending | paid | failed
    result_code TEXT,
    result_desc TEXT,
    receipt     TEXT,
    test        INTEGER NOT NULL DEFAULT 0,    -- 1 = simulated (no M-Pesa keys configured)
    checked_at  TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_payments_slug ON payments(slug);

  -- Owners asking Kabuor Builds to connect the M-Pesa prompt for them. The developer enters the shop's
  -- Daraja keys from the platform dashboard; saving them switches prompts on at once.
  CREATE TABLE IF NOT EXISTS mpesa_requests (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    slug       TEXT NOT NULL REFERENCES shops(slug) ON DELETE CASCADE,
    status     TEXT NOT NULL DEFAULT 'requested', -- requested | working | live | cancelled
    pay_type   TEXT NOT NULL,                     -- till | paybill
    pay_number TEXT NOT NULL,                     -- the Till or Paybill customers pay
    store      TEXT NOT NULL DEFAULT '',          -- a Till's store (HO) number, if they know it
    phone      TEXT NOT NULL,                     -- who to call about it
    note       TEXT NOT NULL DEFAULT '',          -- from the owner
    reply      TEXT NOT NULL DEFAULT '',          -- from Kabuor Builds, shown to the owner
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    live_at    TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_mpesa_requests_slug ON mpesa_requests(slug);
`);

export const now = () => new Date().toISOString();
export const getShopRecord = (slug) => pdb.prepare('SELECT * FROM shops WHERE slug = ?').get(slug) ?? null;
export const shopByToken = (token) => (token ? pdb.prepare('SELECT * FROM shops WHERE setup_token = ?').get(String(token)) ?? null : null);
export function updateShop(slug, fields) {
  const keys = Object.keys(fields);
  pdb.prepare(`UPDATE shops SET ${keys.map((k) => `${k} = ?`).join(', ')}, updated_at = ? WHERE slug = ?`).run(...keys.map((k) => fields[k]), now(), slug);
}
