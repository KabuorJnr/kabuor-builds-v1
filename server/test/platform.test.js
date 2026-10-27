// The platform server, started for real on throwaway data (no .env, so no M-Pesa keys and no real SMS):
// health, the company site's API (info, demo requests, CORS), the owner's dashboard sign-in, demo request
// follow-up, careers applications and role status, and backups (made, listed, downloadable, and no way to reach
// files outside them).
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = 4400 + Math.floor(Math.random() * 500);
const BASE = `http://localhost:${PORT}`;
const DATA = mkdtempSync(join(tmpdir(), 'kabuor-builds-test-'));
const ADMIN = { email: 'owner@kabuor.test', password: 'test-owner-password' };
let server;

const call = async (path, { method = 'GET', body, token, headers = {} } = {}) => {
  const res = await fetch(BASE + path, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}
  return { status: res.status, headers: res.headers, json, text };
};

before(async () => {
  const env = { ...process.env, PORT: String(PORT), DATA_DIR: DATA, BACKUPS: 'off', JWT_SECRET: 'test-secret-test-secret-0123456789', PLATFORM_ADMIN_PASSWORD: ADMIN.password, PLATFORM_ADMIN_EMAIL: ADMIN.email };
  for (const k of Object.keys(env)) if (/^(MPESA|PLATFORM_MPESA|AT_|AFRICASTALKING)/.test(k)) delete env[k];
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
  throw new Error(`Server didn't start:\n${log}`);
});

after(() => {
  server?.kill();
  try {
    rmSync(DATA, { recursive: true, force: true });
  } catch {}
});

describe('company site API', () => {
  test('platform info carries the contact details', async () => {
    const r = await call('/api/platform/info');
    assert.equal(r.status, 200);
    assert.equal(r.json.name, 'Kabuor Builds');
    assert.ok(r.json.phone);
  });

  test('only the company site may call it from another address', async () => {
    const ok = await call('/api/platform/info', { headers: { Origin: 'https://kabuor-builds.vercel.app' } });
    assert.equal(ok.headers.get('access-control-allow-origin'), 'https://kabuor-builds.vercel.app');
    const other = await call('/api/platform/info', { headers: { Origin: 'https://evil.example' } });
    assert.equal(other.headers.get('access-control-allow-origin'), null);
  });

  test('browser pre-checks never use up the demo form limit', async () => {
    for (let i = 0; i < 10; i++) {
      const r = await call('/api/platform/demo', { method: 'OPTIONS', headers: { Origin: 'https://kabuor-builds.vercel.app', 'Access-Control-Request-Method': 'POST' } });
      assert.equal(r.status, 204);
    }
  });

  test('demo requests are checked, saved once per phone a day, and followed up from the dashboard', async () => {
    assert.equal((await call('/api/platform/demo', { method: 'POST', body: { name: 'A', business: 'B', phone: '1' } })).status, 400);
    const req = { product: 'erp', name: 'Grace Wanjiku', business: 'Wanjiku Hardware', phone: '0712 345 678', staff: '11-50' };
    assert.equal((await call('/api/platform/demo', { method: 'POST', body: req })).status, 200);
    assert.equal((await call('/api/platform/demo', { method: 'POST', body: { ...req, note: 'Credit sales' } })).status, 200);
    // A bot filling the hidden field is told "ok" and nothing is saved.
    assert.equal((await call('/api/platform/demo', { method: 'POST', body: { ...req, phone: '0799 999 999', website: 'spam' } })).status, 200);

    assert.equal((await call('/api/platform/admin/demo-requests')).status, 401);
    const token = (await call('/api/platform/admin/login', { method: 'POST', body: ADMIN })).json.token;
    const list = (await call('/api/platform/admin/demo-requests', { token })).json;
    assert.equal(list.counts.new, 1);
    assert.equal(list.requests[0].note, 'Credit sales');
    assert.equal(list.requests[0].phone, '0712345678');
    const moved = await call(`/api/platform/admin/demo-requests/${list.requests[0].id}/status`, { method: 'POST', token, body: { status: 'booked' } });
    assert.equal(moved.json.status, 'booked');
  });
});

describe('careers', () => {
  const application = {
    roleId: 'lead-platform-architect',
    roleTitle: 'Lead Platform Architect (.NET 10 / Cloud)',
    department: 'Engineering',
    fullName: 'Wanjiru Kamau-Ochieng',
    email: 'Wanjiru.K@Example.com',
    phone: '0722 418 903',
    location: 'Nairobi, Kenya',
    experienceTrack: '6 - 9 years',
    githubUrl: 'https://github.com/wkamau',
    liveProjectUrl1: 'javascript:alert(1)',
    hardestProblem: 'Two pods raced on the same M-Pesa receipt.\n\nA unique index fixed it.',
    whyAfricaKabuor: 'My aunt runs her shop on exercise books.',
    weeklyCommitment: '40+ hours/week (Full focus)',
    earliestStartDate: 'Within 1 month',
    equityAcknowledgment: true,
  };

  test('the company site may load role status and apply from its own address', async () => {
    const r = await call('/api/platform/careers', { headers: { Origin: 'https://kabuor-builds.vercel.app' } });
    assert.equal(r.status, 200);
    assert.deepEqual(r.json.roles, {});
    assert.equal(r.headers.get('access-control-allow-origin'), 'https://kabuor-builds.vercel.app');
  });

  test('applications are checked, saved once per role a day, reviewed from the dashboard, and refused when a role closes', async () => {
    assert.equal((await call('/api/platform/careers/apply', { method: 'POST', body: { ...application, email: 'nope' } })).status, 400);
    const first = await call('/api/platform/careers/apply', { method: 'POST', body: application });
    assert.equal(first.status, 200);
    assert.match(first.json.trackingRef, /^KBR-APP-\d{6}$/);
    // Sending again the same day (a double tap) updates the first application.
    const again = await call('/api/platform/careers/apply', { method: 'POST', body: { ...application, location: 'Kisumu, Kenya' } });
    assert.equal(again.json.trackingRef, first.json.trackingRef);
    // A bot filling the hidden field is told "ok" and nothing is saved.
    assert.equal((await call('/api/platform/careers/apply', { method: 'POST', body: { ...application, email: 'bot@spam.example', website: 'spam' } })).status, 200);

    assert.equal((await call('/api/platform/admin/careers')).status, 401);
    const token = (await call('/api/platform/admin/login', { method: 'POST', body: ADMIN })).json.token;
    const list = (await call('/api/platform/admin/careers', { token })).json;
    assert.equal(list.applications.length, 1);
    const [app] = list.applications;
    assert.equal(app.trackingRef, first.json.trackingRef);
    assert.equal(app.email, 'wanjiru.k@example.com');
    assert.equal(app.location, 'Kisumu, Kenya');
    assert.equal(app.reviewStatus, 'new');
    assert.equal(app.liveProjectUrl1, '', 'only http(s) links are kept');
    assert.match(app.hardestProblem, /receipt\.\n\nA unique/, 'paragraphs survive');

    const moved = await call(`/api/platform/admin/careers/applications/${app.trackingRef}/status`, { method: 'POST', token, body: { status: 'shortlisted' } });
    assert.equal(moved.json.reviewStatus, 'shortlisted');
    assert.equal((await call(`/api/platform/admin/careers/applications/${app.trackingRef}/status`, { method: 'POST', token, body: { status: 'hired!' } })).status, 400);

    // Closing a role closes it for every visitor, and the server refuses applications to it.
    assert.equal((await call('/api/platform/admin/careers/roles/lead-platform-architect/status', { method: 'POST', token, body: { status: 'closed' } })).status, 200);
    assert.equal((await call('/api/platform/careers')).json.roles['lead-platform-architect'], 'closed');
    assert.equal((await call('/api/platform/careers/apply', { method: 'POST', body: application })).status, 409);
    await call('/api/platform/admin/careers/roles/lead-platform-architect/status', { method: 'POST', token, body: { status: 'open' } });
    const reopened = await call('/api/platform/careers/apply', { method: 'POST', body: application });
    assert.equal(reopened.status, 200);
    assert.notEqual(reopened.json.trackingRef, first.json.trackingRef, 'a reviewed application is not overwritten');
  });
});

describe('owner dashboard', () => {
  test('a wrong password is refused', async () => {
    assert.equal((await call('/api/platform/admin/login', { method: 'POST', body: { ...ADMIN, password: 'nope' } })).status, 401);
  });

  test('backups are made, listed and downloadable, and nothing outside them can be fetched', async () => {
    const token = (await call('/api/platform/admin/login', { method: 'POST', body: ADMIN })).json.token;
    const made = await call('/api/platform/admin/backups', { method: 'POST', token });
    assert.equal(made.status, 200);
    assert.ok(made.json.files.includes('platform.db'));
    const latest = (await call('/api/platform/admin/backups/latest', { token })).json;
    assert.ok(latest.files.includes('platform.db'));
    const file = await fetch(`${BASE}/api/platform/admin/backups/latest/file?path=platform.db`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(file.status, 200);
    const bytes = Buffer.from(await file.arrayBuffer());
    assert.equal(bytes.subarray(0, 15).toString(), 'SQLite format 3');
    for (const path of ['../platform.db', '../../owner-key', '/etc/passwd']) {
      assert.equal((await call(`/api/platform/admin/backups/latest/file?path=${encodeURIComponent(path)}`, { token })).status, 404, path);
    }
  });
});

test('pages carry the security headers', async () => {
  const r = await call('/api/health');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
});
