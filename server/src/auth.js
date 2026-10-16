// Admin sign-in. Credentials live in the database (salted scrypt hash), starting as admin/admin
// with a forced change on first sign-in. Changing the password bumps `version`, which signs out
// every existing session.
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { db, HttpError } from './db.js';
import { JWT_SECRET } from './config.js';
import { currentShop } from './tenant.js';

// Without JWT_SECRET, generate a signing key once and keep it in the database so sign-ins survive restarts.
function storedSecret() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'jwt_secret'").get();
  if (row) return row.value;
  const secret = randomBytes(48).toString('hex');
  db.prepare("INSERT INTO settings (key, value, updated_at) VALUES ('jwt_secret', ?, ?)").run(secret, new Date().toISOString());
  return secret;
}
// Each shop signs its own sessions, so a sign-in for one shop is useless on another.
const secret = () => (JWT_SECRET ? createHmac('sha256', JWT_SECRET).update(`shop:${currentShop().slug}`).digest('hex') : storedSecret());

const KEY = 'admin_auth';
export const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin';

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return { salt, hash: scryptSync(String(password), salt, 64).toString('hex') };
}

function saveAuth(auth) {
  db.prepare(`INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`).run(KEY, JSON.stringify(auth), new Date().toISOString());
  return auth;
}

export function getAuth() {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(KEY);
  if (row) return JSON.parse(row.value);
  return saveAuth({ username: DEFAULT_USERNAME, ...hashPassword(DEFAULT_PASSWORD), mustChange: true, version: 1 });
}

function passwordMatches(auth, password) {
  const candidate = scryptSync(String(password ?? ''), auth.salt, 64);
  return timingSafeEqual(candidate, Buffer.from(auth.hash, 'hex'));
}

// For dangerous admin actions: re-check the current password.
export const checkPassword = (password) => passwordMatches(getAuth(), String(password ?? ''));

export const signToken = (auth) => jwt.sign({ sub: auth.username, v: auth.version }, secret(), { expiresIn: '12h' });

// ---------- sign in (with a simple per-IP lockout) ----------
const failures = new Map();

export function signIn(ip, username, password) {
  const key = `${currentShop().slug}:${ip}`;
  const f = failures.get(key);
  if (f && f.count >= 5 && Date.now() < f.until) throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');
  const auth = getAuth();
  const ok = String(username ?? '').trim().toLowerCase() === auth.username.toLowerCase() && passwordMatches(auth, password);
  if (!ok) {
    failures.set(key, { count: (f?.count ?? 0) + 1, until: Date.now() + 5 * 60_000 });
    throw new HttpError(401, 'Incorrect username or password');
  }
  failures.delete(key);
  return { token: signToken(auth), username: auth.username, mustChange: auth.mustChange };
}

// ---------- middleware ----------
export function requireAdmin(req, res, next) {
  const header = req.get('authorization') ?? '';
  let payload;
  try {
    payload = jwt.verify(header.replace(/^Bearer /, ''), secret());
  } catch {
    throw new HttpError(401, 'Please sign in to continue.');
  }
  const auth = getAuth();
  if (payload.v !== auth.version || payload.sub !== auth.username) throw new HttpError(401, 'Your session has ended. Please sign in again.');
  req.admin = { username: auth.username, mustChange: auth.mustChange };
  next();
}

// Everything except the account screen stays locked until the default password is replaced.
export function requirePasswordChanged(req, res, next) {
  if (req.admin.mustChange) {
    const err = new HttpError(403, 'Please set a new password before continuing.');
    err.code = 'PASSWORD_CHANGE_REQUIRED';
    throw err;
  }
  next();
}

// ---------- change username / password ----------
export function changeCredentials({ currentPassword, username, newPassword }) {
  const auth = getAuth();
  if (!passwordMatches(auth, currentPassword)) throw new HttpError(400, 'Your current password is incorrect');

  const nextUser = String(username ?? auth.username).trim();
  if (!/^[\w.@-]{3,40}$/.test(nextUser)) throw new HttpError(400, 'Username must be 3–40 characters: letters, numbers, dots, dashes or @');

  const pw = String(newPassword ?? '');
  if (pw.length < 8) throw new HttpError(400, 'Use at least 8 characters for your new password');
  const lower = pw.toLowerCase();
  if (lower === DEFAULT_PASSWORD || lower === nextUser.toLowerCase() || pw === currentPassword) {
    throw new HttpError(400, 'Choose a password that isn’t “admin”, your username or your old password');
  }

  const next = saveAuth({ username: nextUser, ...hashPassword(pw), mustChange: false, version: auth.version + 1 });
  return { token: signToken(next), username: next.username, mustChange: false };
}

// ---------- platform: the owner's account, set when the shop is created ----------
export function setOwner(username, password) {
  return saveAuth({ username: String(username).trim(), ...hashPassword(password), mustChange: false, version: (getAuthRow()?.version ?? 0) + 1 });
}
/** Owner credentials already hashed by the platform at signup (never stored in plain text). */
export function setOwnerHashed(username, { salt, hash }) {
  return saveAuth({ username: String(username).trim(), salt, hash, mustChange: false, version: (getAuthRow()?.version ?? 0) + 1 });
}
function getAuthRow() {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(KEY);
  return row ? JSON.parse(row.value) : null;
}
export const ownerToken = () => signToken(getAuth());
export { hashPassword };
