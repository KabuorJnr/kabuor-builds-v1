// "Updates": news posts the admin publishes to the website (new branches, offers, greetings…),
// plus image uploads for them.
import { brand } from '../tenant.js';
import express, { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { db, HttpError, uploadDir } from '../db.js';

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const toPost = (r) => ({
  id: r.id,
  title: r.title,
  body: r.body,
  tag: r.tag,
  image: r.image,
  linkLabel: r.link_label,
  linkHref: r.link_href,
  pinned: Boolean(r.pinned),
  published: Boolean(r.published),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

// Only same-site paths and ordinary web/phone/mail links; never javascript: or data: URLs.
const SAFE_LINK = /^(#|\/(?!\/)|https?:\/\/|tel:|mailto:)/i;
const SAFE_IMAGE = /^\/uploads\/[\w.-]+$/;

function readPost(body, current = {}) {
  const pick = (key, fallback) => (body?.[key] === undefined ? fallback : body[key]);
  const post = {
    title: text(pick('title', current.title), 90),
    body: text(pick('body', current.body), 2000),
    tag: text(pick('tag', current.tag), 24),
    image: text(pick('image', current.image ?? ''), 200) || null,
    linkLabel: text(pick('linkLabel', current.linkLabel ?? ''), 24) || null,
    linkHref: text(pick('linkHref', current.linkHref ?? ''), 200) || null,
    pinned: Boolean(pick('pinned', current.pinned ?? false)),
    published: Boolean(pick('published', current.published ?? true)),
  };
  if (post.title.length < 2) throw new HttpError(400, 'Give your update a title');
  if (post.image && !SAFE_IMAGE.test(post.image)) throw new HttpError(400, 'Upload the image again');
  if (post.linkHref && !SAFE_LINK.test(post.linkHref)) throw new HttpError(400, 'Links must start with https://, tel:, mailto:, / or #');
  if (post.linkHref && !post.linkLabel) post.linkLabel = 'Learn more';
  return post;
}

// ---------- public ----------
export const publicPosts = Router();
publicPosts.get('/posts', (req, res) => {
  const rows = db.prepare('SELECT * FROM posts WHERE published = 1 ORDER BY pinned DESC, created_at DESC LIMIT 12').all();
  res.json(rows.map(toPost));
});

// ---------- admin (mounted behind the auth middleware) ----------
export const adminPosts = Router();

adminPosts.get('/posts', (req, res) => {
  res.json(db.prepare('SELECT * FROM posts ORDER BY pinned DESC, created_at DESC').all().map(toPost));
});

adminPosts.post('/posts', (req, res) => {
  const p = readPost(req.body);
  const now = new Date().toISOString();
  const { lastInsertRowid } = db.prepare(`INSERT INTO posts (title, body, tag, image, link_label, link_href, pinned, published, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(p.title, p.body, p.tag, p.image, p.linkLabel, p.linkHref, p.pinned ? 1 : 0, p.published ? 1 : 0, now, now);
  res.status(201).json(toPost(db.prepare('SELECT * FROM posts WHERE id = ?').get(lastInsertRowid)));
});

adminPosts.patch('/posts/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(Number(req.params.id));
  if (!row) throw new HttpError(404, 'Update not found');
  const p = readPost(req.body, toPost(row));
  db.prepare(`UPDATE posts SET title = ?, body = ?, tag = ?, image = ?, link_label = ?, link_href = ?, pinned = ?, published = ?, updated_at = ? WHERE id = ?`)
    .run(p.title, p.body, p.tag, p.image, p.linkLabel, p.linkHref, p.pinned ? 1 : 0, p.published ? 1 : 0, new Date().toISOString(), row.id);
  res.json(toPost(db.prepare('SELECT * FROM posts WHERE id = ?').get(row.id)));
});

adminPosts.delete('/posts/:id', (req, res) => {
  const { changes } = db.prepare('DELETE FROM posts WHERE id = ?').run(Number(req.params.id));
  if (!changes) throw new HttpError(404, 'Update not found');
  res.json({ ok: true });
});

// Image upload: the raw file is the request body. The bytes must really be an image of the
// declared type, so nothing else (HTML, scripts) can be stored and served from /uploads.
const IMAGE_TYPES = {
  'image/jpeg': { ext: 'jpg', ok: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { ext: 'png', ok: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  'image/webp': { ext: 'webp', ok: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
  'image/gif': { ext: 'gif', ok: (b) => b.subarray(0, 4).toString('latin1') === 'GIF8' },
};

adminPosts.post('/uploads', express.raw({ type: Object.keys(IMAGE_TYPES), limit: '6mb' }), (req, res) => {
  const type = (req.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  const kind = IMAGE_TYPES[type];
  if (!kind || !Buffer.isBuffer(req.body) || req.body.length < 12) throw new HttpError(400, 'Choose a JPG, PNG, WebP or GIF image');
  if (!kind.ok(req.body)) throw new HttpError(400, 'That file doesn’t look like a valid image');
  const name = `${Date.now().toString(36)}-${randomBytes(5).toString('hex')}.${kind.ext}`;
  writeFileSync(join(uploadDir(), name), req.body);
  res.status(201).json({ url: `/uploads/${name}` });
});

// ---------- starter posts from the brand's own flyers ----------
const starters = () => (brand.posts ?? []).map((p) => ({ image: '', ...p }));

export function ensureStarterPosts() {
  if (db.prepare('SELECT COUNT(*) AS n FROM posts').get().n > 0) return;
  const insert = db.prepare(`INSERT INTO posts (title, body, tag, image, pinned, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)`);
  const now = Date.now();
  const list = starters();
  // Oldest first so the list reads newest-first.
  [...list].reverse().forEach((p, i) => {
    const at = new Date(now - (list.length - i) * 60_000).toISOString();
    const image = p.image && existsSync(join(uploadDir(), p.image.replace('/uploads/', ''))) ? p.image : null;
    insert.run(p.title, p.body, p.tag, image, p.pinned, at, at);
  });
}
