import { Router } from 'express';
import { brand } from '../tenant.js';
import { HttpError } from '../db.js';
import { smsBalance, smsStatus, sendSms, toIntl } from '../sms.js';
import { mpesaStatus } from '../mpesa.js';
import { listDevices, notifyAdmins, pushPublicKey, removeSubscription, saveSubscription } from '../push.js';

// Phone alerts for the admin (mounted behind admin auth).
export const adminAlerts = Router();

adminAlerts.get('/alerts', (req, res) => {
  res.json({ publicKey: pushPublicKey, devices: listDevices(), mpesa: mpesaStatus() });
});

adminAlerts.post('/alerts/subscribe', (req, res) => {
  if (!saveSubscription(req.body?.subscription, req.body?.label)) throw new HttpError(400, 'This browser sent an invalid subscription');
  res.status(201).json({ devices: listDevices() });
});

adminAlerts.post('/alerts/unsubscribe', (req, res) => {
  removeSubscription(req.body?.endpoint);
  res.json({ devices: listDevices() });
});

// SMS (Africa's Talking): connection status with the account balance, and a test text.
adminAlerts.get('/sms', async (req, res) => {
  const status = smsStatus();
  if (!status.enabled) return res.json(status);
  try {
    res.json({ ...status, balance: await smsBalance() });
  } catch (err) {
    res.json({ ...status, error: `Africa's Talking rejected the login: ${err.message}` });
  }
});

adminAlerts.post('/sms/test', async (req, res) => {
  const numbers = (Array.isArray(req.body?.numbers) ? req.body.numbers : []).slice(0, 5).map(String);
  if (!smsStatus().enabled) throw new HttpError(400, "SMS isn't set up yet: add AT_USERNAME and AT_API_KEY to the server settings");
  if (!numbers.length || numbers.some((n) => !toIntl(n))) throw new HttpError(400, 'Add a valid phone number, e.g. 0712 345 678');
  const results = await sendSms(numbers, `${brand.content.brand.name}: SMS is working. You will get a text like this for every new order.`, { kind: 'test' });
  res.json({ results });
});

adminAlerts.post('/alerts/test', async (req, res) => {
  const result = await notifyAdmins({ title: 'Alerts are working ✓', body: 'You’ll get a notification like this for every new order.', tag: 'test' });
  if (!result.devices) throw new HttpError(400, 'No devices have alerts turned on yet');
  res.json(result);
});
