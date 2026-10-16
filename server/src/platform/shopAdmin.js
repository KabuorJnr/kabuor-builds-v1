// Inside a shop's admin: its plan with the platform (pay or renew by M-Pesa prompt) and its look (colours,
// style, logo and banner photos), which the owner can change any time after going live.
import express, { Router } from 'express';
import { currentShop } from '../tenant.js';
import { billingSummary, paymentStatus, startPayment } from './billing.js';
import { applyBrand, roleOf, saveUpload, UPLOAD_TYPES } from './routes.js';
import { paletteOptions } from './palette.js';
import { KINDS, STYLES } from './presets.js';
import { shopState } from './shops.js';
import { getShopRecord } from './store.js';

export const shopAdmin = Router();
const slug = () => currentShop().slug;

shopAdmin.get('/billing', (req, res) => res.json({ ...billingSummary(slug()), state: shopState(getShopRecord(slug())) }));
shopAdmin.post('/billing/pay', async (req, res) => res.status(201).json({ id: await startPayment(slug(), { phone: req.body?.phone, plan: req.body?.plan || 'monthly' }) }));
shopAdmin.get('/billing/pay/:id', async (req, res) => res.json(await paymentStatus(slug(), req.params.id)));

shopAdmin.get('/look', (req, res) => {
  const record = getShopRecord(slug());
  res.json({
    kind: record.kind,
    brand: JSON.parse(record.brand || '{}'),
    styles: Object.entries(STYLES).map(([id, s]) => ({ id, label: s.label, mode: s.mode, fonts: s.fonts, body: s.body, radius: s.radius })),
    defaultAccent: KINDS[record.kind]?.accent,
  });
});
shopAdmin.put('/look', (req, res) => {
  const { products, till, paybill, account, ...look } = req.body ?? {}; // products and payment are managed elsewhere
  res.json(applyBrand(slug(), look));
});
shopAdmin.post('/look/upload', express.raw({ type: UPLOAD_TYPES, limit: '8mb' }), async (req, res) => {
  res.status(201).json(await saveUpload(slug(), roleOf(req.query.role), req.body));
});
shopAdmin.post('/look/palettes', (req, res) => {
  const accents = (Array.isArray(req.body?.accents) ? req.body.accents : []).filter((c) => /^#[0-9a-f]{6}$/i.test(c)).slice(0, 6);
  res.json(paletteOptions(accents, KINDS[getShopRecord(slug()).kind]?.accent ?? '#2F6F5E', req.body?.mode === 'dark' ? 'dark' : 'light'));
});
