// Inside a shop's admin: its plan with the platform (pay or renew by M-Pesa prompt) and its look (colours,
// style, logo and banner photos), which the owner can change any time after going live.
import express, { Router } from 'express';
import { currentShop } from '../tenant.js';
import { billingSummary, paymentStatus, startPayment } from './billing.js';
import { applyBrand, roleOf, saveUpload, UPLOAD_TYPES } from './routes.js';
import { paletteOptions } from './palette.js';
import { KINDS, styleList } from './presets.js';
import { shopState } from './shops.js';
import { getShopRecord } from './store.js';
import { failureMessage, mpesaSettings, saveMpesaSettings, stkQuery, testPrompt } from '../mpesa.js';

export const shopAdmin = Router();
const slug = () => currentShop().slug;

shopAdmin.get('/billing', (req, res) => res.json({ ...billingSummary(slug()), state: shopState(getShopRecord(slug())) }));
shopAdmin.post('/billing/pay', async (req, res) => res.status(201).json({ id: await startPayment(slug(), { phone: req.body?.phone, plan: req.body?.plan || 'monthly' }) }));
shopAdmin.get('/billing/pay/:id', async (req, res) => res.json(await paymentStatus(slug(), req.params.id)));

// The shop's own M-Pesa prompt (Daraja keys): status, save, and a KSh 1 test prompt to the owner's phone.
shopAdmin.get('/mpesa-keys', (req, res) => res.json(mpesaSettings()));
shopAdmin.put('/mpesa-keys', (req, res) => res.json(saveMpesaSettings(req.body ?? {})));
shopAdmin.post('/mpesa-keys/test', async (req, res) => res.json(await testPrompt(req.body?.phone)));
shopAdmin.get('/mpesa-keys/test/:checkoutId', async (req, res) => {
  const r = await stkQuery(String(req.params.checkoutId)).catch((err) => ({ status: 'pending', description: err.message }));
  res.json({ ...r, message: r.status === 'failed' ? failureMessage(r.code) : r.status === 'paid' ? 'It works: the prompt was paid.' : 'Waiting for the PIN…' });
});

shopAdmin.get('/look', (req, res) => {
  const record = getShopRecord(slug());
  res.json({
    kind: record.kind,
    brand: JSON.parse(record.brand || '{}'),
    styles: styleList(),
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
