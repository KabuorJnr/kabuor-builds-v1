// The privacy notice says how long demo requests and job applications are kept; this checks the clean-up does it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.DATA_DIR = mkdtempSync(join(tmpdir(), 'kabuor-retention-'));
const { pdb } = await import('../src/platform/store.js');
const { pruneOldRecords } = await import('../src/platform/retention.js');

const now = Date.parse('2027-06-01T09:00:00Z');
const ago = (days) => new Date(now - days * 864e5).toISOString();

test('old demo requests, applications and unpaid signups are deleted; recent ones and live shops are kept', () => {
  const demo = pdb.prepare('INSERT INTO demo_requests (product, name, business, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
  demo.run('erp', 'Old Lead', 'Old Co', '0712345678', ago(400), ago(370));
  demo.run('erp', 'Recent Lead', 'New Co', '0712345679', ago(400), ago(30));
  const app = pdb.prepare('INSERT INTO career_applications (ref, role_id, role_title, name, email, phone, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  app.run('KBR-APP-1', 'eng', 'Engineer', 'Rejected Long Ago', 'a@example.com', '0712000001', 'rejected', ago(200), ago(190));
  app.run('KBR-APP-2', 'eng', 'Engineer', 'Rejected Recently', 'b@example.com', '0712000002', 'rejected', ago(60), ago(40));
  app.run('KBR-APP-3', 'eng', 'Engineer', 'Never Touched', 'c@example.com', '0712000003', 'new', ago(400), ago(380));
  app.run('KBR-APP-4', 'eng', 'Engineer', 'Shortlisted', 'd@example.com', '0712000004', 'shortlisted', ago(100), ago(90));

  const shop = pdb.prepare("INSERT INTO shops (slug, name, kind, owner_name, phone, email, password_salt, password_hash, setup_token, status, created_at, updated_at) VALUES (?, ?, 'honey', 'Owner', '0712345678', ?, 's', 'h', ?, ?, ?, ?)");
  shop.run('never-paid', 'Never Paid', 'np@example.com', 't1', 'pending', ago(60), ago(45));
  shop.run('just-started', 'Just Started', 'js@example.com', 't2', 'pending', ago(5), ago(5));
  shop.run('paid-up', 'Paid Up', 'pu@example.com', 't3', 'live', ago(400), ago(300));

  assert.deepEqual(pruneOldRecords(now), { demos: 1, applications: 2, signups: 1 });
  assert.deepEqual(pdb.prepare('SELECT slug FROM shops ORDER BY slug').all().map((r) => r.slug), ['just-started', 'paid-up']);
  assert.deepEqual(pdb.prepare('SELECT name FROM demo_requests').all().map((r) => r.name), ['Recent Lead']);
  assert.deepEqual(pdb.prepare('SELECT name FROM career_applications ORDER BY ref').all().map((r) => r.name), ['Rejected Recently', 'Shortlisted']);
});
