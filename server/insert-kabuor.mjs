import { randomBytes } from 'node:crypto';
import { pdb, getShopRecord, updateShop, now } from './src/platform/store.js';
import { hashPassword, setOwnerHashed } from './src/auth.js';
import { getShop } from './src/platform/shops.js';
import { runAs } from './src/tenant.js';
import { seed } from './src/seed.js';
import { ensureStarterPosts } from './src/routes/posts.js';
import { db } from './src/db.js';

// Run from server/: node --env-file=.env insert-kabuor.mjs
// Secrets come from server/.env (never written here): MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY,
// MPESA_STORE_NUMBER (or MPESA_SHORTCODE), MPESA_TILL_NUMBER, MPESA_ENVIRONMENT, and KABUOR_OWNER_PASSWORD.
const env = process.env;
const missing = ['MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 'MPESA_PASSKEY', 'MPESA_TILL_NUMBER', 'KABUOR_OWNER_PASSWORD'].filter((k) => !env[k]);
if (missing.length) {
  console.error(`Missing in server/.env: ${missing.join(', ')}`);
  process.exit(1);
}

const SLUGS = ['kabuor-build', 'kabuor-builds'];

for (const slug of SLUGS) {
  console.log(`Setting up shop: ${slug}...`);
  const name = 'Kabuor Builds';
  const kind = 'other';
  const city = 'Nairobi';
  const ownerName = 'Rooney Odhiambo';
  const phone = '0705607954';
  const email = 'rooneykabuor2004@gmail.com';
  const { salt, hash } = hashPassword(env.KABUOR_OWNER_PASSWORD);
  const setupToken = randomBytes(24).toString('hex');
  const at = now();

  const brandSpec = {
    style: 'bold',
    mode: 'dark',
    accent: '#3B82F6',
    second: '#0B0F19',
    tagline: 'Mlete deals.',
    about: 'Kabuor Builds is a self-service shop builder and digital brand platform for Kenyan businesses.',
    till: '1806547',
    paybill: '1336698',
    account: '1806547',
    products: [
      {
        name: 'Shop Platform Subscription',
        size: '1 month',
        price: 1500,
        description: 'Self-service shop platform for Kenyan brands with Daraja M-Pesa integration.',
      },
      {
        name: 'Kabuor Builds Annual Plan',
        size: '1 year',
        price: 15000,
        description: 'Complete annual plan with custom domain, branding, and WhatsApp alerts.',
      },
    ],
  };

  const existing = getShopRecord(slug);
  if (!existing) {
    pdb.prepare(`
      INSERT INTO shops (slug, name, kind, city, owner_name, phone, email, password_salt, password_hash, status, plan, paid_until, setup_token, brand, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'live', 'yearly', ?, ?, ?, ?, ?)
    `).run(slug, name, kind, city, ownerName, phone, email, salt, hash, '2030-01-01T00:00:00.000Z', setupToken, JSON.stringify(brandSpec), at, at);
  } else {
    updateShop(slug, {
      name,
      kind,
      city,
      owner_name: ownerName,
      phone,
      email,
      status: 'live',
      plan: 'yearly',
      paid_until: '2030-01-01T00:00:00.000Z',
      brand: JSON.stringify(brandSpec),
    });
  }

  // Now initialize the shop's own database and settings
  const shop = getShop(slug);
  runAs(shop, () => {
    seed({ reset: true });
    ensureStarterPosts();
    setOwnerHashed(email, { salt, hash });

    // Insert M-Pesa Keys into the shop's own settings table
    const mpesaKeys = {
      env: env.MPESA_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
      type: 'till',
      shortcode: env.MPESA_STORE_NUMBER || env.MPESA_SHORTCODE,
      till: env.MPESA_TILL_NUMBER,
      key: env.MPESA_CONSUMER_KEY,
      secret: env.MPESA_CONSUMER_SECRET,
      passkey: env.MPESA_PASSKEY,
      salt: randomBytes(16).toString('hex'),
    };
    db.prepare(`
      INSERT INTO settings (key, value, updated_at) VALUES ('mpesa_keys', ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).run(JSON.stringify(mpesaKeys), at);

    console.log(`Successfully configured shop ${slug} with M-Pesa keys and products.`);
  });
}

console.log('All shops inserted successfully.');
