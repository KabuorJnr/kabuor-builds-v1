// On a throwaway disk (Vercel's /tmp) nothing written lasts: the platform must not open shops there, and the company
// site's demo requests must say they weren't kept so the page hands them to WhatsApp. And no address may default to
// shop.ke, which isn't ours.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { join } from 'node:path';

const PORT = 4950 + Math.floor(Math.random() * 40);
const BASE = `http://localhost:${PORT}`;
const DATA = `/tmp/kabuor-builds-storage-test-${process.pid}`;
let server;

const call = async (path, body) => {
  const res = await fetch(BASE + path, { method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, headers: res.headers, json: await res.json().catch(() => null) };
};

before(async () => {
  // As on Vercel: the module exports the app instead of listening, so this test listens itself.
  Object.assign(process.env, { DATA_DIR: DATA, VERCEL: '1', BACKUPS: 'off', JWT_SECRET: 'test-secret-test-secret-0123456789' });
  for (const k of Object.keys(process.env)) if (/^(MPESA|PLATFORM_MPESA|PLATFORM_DOMAIN|AT_|AFRICASTALKING)/.test(k)) delete process.env[k];
  const { default: app } = await import('../src/index.js');
  await new Promise((r) => (server = app.listen(PORT, r)));
});

after(() => {
  server?.close();
  try {
    rmSync(DATA, { recursive: true, force: true });
  } catch {} // Windows keeps the open database locked until the process ends
});

test('a throwaway disk opens no shops and says demo requests were not kept', async () => {
  const info = await call('/api/platform/info');
  assert.equal(info.json.signupsOpen, false);
  assert.equal(info.json.domain, ''); // shop links are <address>/s/<link>, never <link>.shop.ke

  const signup = await call('/api/platform/signup', { name: 'Amani Honey', kind: 'honey', link: 'amani-honey', ownerName: 'Amani', phone: '0712345678', email: 'amani@example.com', password: 'a-long-password' });
  assert.equal(signup.status, 409);
  assert.equal(signup.json.code, 'SIGNUPS_PAUSED');
  assert.match(signup.json.error, /WhatsApp/);

  const demo = await call('/api/platform/demo', { product: 'erp', name: 'Amani Otieno', business: 'Amani Honey', phone: '0712345678' });
  assert.equal(demo.status, 200);
  assert.equal(demo.json.saved, false);

  const site = await call('/api/site');
  assert.ok(!/shop\.ke/.test(site.headers.get('content-security-policy') ?? ''));
});
