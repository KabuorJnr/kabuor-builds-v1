// A live server (NODE_ENV=production) has no shared logins and no way to take over someone else's shop: a signup
// "restored" from a browser can't replace a shop that exists, and a shop that was never handed to its owner opens
// only with SHOP_ADMIN_PASSWORD, never admin/admin. Started for real on throwaway data with no M-Pesa or SMS keys.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = 4950 + Math.floor(Math.random() * 40);
const BASE = `http://localhost:${PORT}`;
const DATA = mkdtempSync(join(tmpdir(), 'kabuor-builds-hardening-'));
const SHOP_ADMIN_PASSWORD = 'kabuor-staff-only-password';
let server;

const call = async (path, { method = 'GET', body, headers = {} } = {}) => {
  const res = await fetch(BASE + path, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  return { status: res.status, json, text };
};

before(async () => {
  const env = { ...process.env, NODE_ENV: 'production', PORT: String(PORT), DATA_DIR: DATA, BACKUPS: 'off', JWT_SECRET: 'test-secret-test-secret-0123456789', SHOP_ADMIN_PASSWORD };
  for (const k of Object.keys(env)) if (/^(MPESA|PLATFORM_MPESA|AT_|AFRICASTALKING|VERCEL|RAILWAY|RENDER)/.test(k)) delete env[k];
  server = spawn(process.execPath, ['src/index.js'], { cwd: join(import.meta.dirname, '..'), env, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  server.stdout.on('data', (d) => (log += d));
  server.stderr.on('data', (d) => (log += d));
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`${BASE}/api/health`)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`server didn't start:\n${log}`);
});

after(() => {
  server?.kill();
  try { rmSync(DATA, { recursive: true, force: true }); } catch {}
});

const owner = (link) => ({ name: 'Duka Halisi', link, kind: Object.keys({ fashion: 1 })[0], ownerName: 'Real Owner', city: 'Nairobi', phone: '0712345678', email: `${link}@owner.test`, password: 'the-real-owner-password' });

describe('on a live server', () => {
  test('a restored signup cannot replace a shop that exists', async () => {
    const signup = await call('/api/platform/signup', { method: 'POST', body: owner('duka-halisi') });
    assert.equal(signup.status, 201, signup.text);
    const token = signup.json.token;

    // Someone else "restores" a signup for the same link, with their own email and password.
    const attack = await call('/api/platform/preview', {
      method: 'POST',
      headers: { 'x-setup-token': 'f'.repeat(48) },
      body: { backupSignup: { ...owner('duka-halisi'), email: 'attacker@evil.test', password: 'attacker-password', token: 'f'.repeat(48), brand: { products: [{ name: 'x', price: 1 }], till: '123456' } } },
    });
    assert.equal(attack.status, 401, attack.text);

    // The real owner's signup is untouched.
    const mine = await call('/api/platform/signup', { headers: { 'x-setup-token': token } });
    assert.equal(mine.status, 200, mine.text);
    assert.equal(mine.json.link, 'duka-halisi');
    assert.equal(mine.json.name, 'Duka Halisi');
  });

  test('a restored signup needs the owner’s real details', async () => {
    // No password (the old code filled in "password123"), no email: not restored.
    const res = await call('/api/platform/preview', { method: 'POST', headers: { 'x-setup-token': 'a'.repeat(48) }, body: { backupSignup: { link: 'no-password-shop', name: 'No Password', kind: 'fashion', token: 'a'.repeat(48) } } });
    assert.equal(res.status, 401, res.text);
    assert.equal((await call('/api/platform/check-link?link=no-password-shop')).json?.available, true);
  });

  test('a shop never handed to its owner opens only with SHOP_ADMIN_PASSWORD, never admin/admin', async () => {
    const signup = await call('/api/platform/signup', { method: 'POST', body: owner('preview-shop') });
    assert.equal(signup.status, 201, signup.text);
    const headers = { 'x-setup-token': signup.json.token };
    const brand = await call('/api/platform/brand', { method: 'PUT', headers, body: { products: [{ name: 'Kikoi wrap', price: 1500, size: 'One size' }], till: '123456' } });
    assert.equal(brand.status, 200, brand.text);
    const preview = await call('/api/platform/preview', { method: 'POST', headers });
    assert.equal(preview.status, 200, preview.text);

    const login = (username, password) => call('/s/preview-shop/api/admin/login', { method: 'POST', body: { username, password } });
    assert.equal((await login('admin', 'admin')).status, 401);
    assert.equal((await login('admin', SHOP_ADMIN_PASSWORD)).status, 200);
  });
});
