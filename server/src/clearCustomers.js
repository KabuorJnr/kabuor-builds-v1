// Clears every record of the people who used the shop (orders and recorded sales, their items, payments,
// M-Pesa confirmations, texts sent, newsletter emails), e.g. before handing the shop over. Products, website
// content, updates, settings and the admin login are kept. A full backup of the database is written first.
//
// From the command line:  npm run clear-customers -w server
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { db, tx, uploadDir } from './db.js';

// Children before parents, so nothing points at a deleted row.
const TABLES = ['order_items', 'payments', 'mpesa_confirmations', 'sms_log', 'orders', 'subscribers'];

export function clearCustomerData() {
  const backupDir = join(dirname(uploadDir()), 'backups');
  mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
  const backup = join(backupDir, `before-clear-${stamp}.db`);
  // VACUUM INTO writes a consistent copy of the whole database, even while the shop is running.
  db.prepare('VACUUM INTO ?').run(backup);

  const removed = {};
  tx(() => {
    for (const table of TABLES) {
      removed[table] = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
      db.prepare(`DELETE FROM ${table}`).run();
    }
    // Start numbering afresh for the cleared tables.
    db.prepare(`DELETE FROM sqlite_sequence WHERE name IN (${TABLES.map(() => '?').join(',')})`).run(...TABLES);
  });
  return { removed, backup };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { removed, backup } = clearCustomerData();
  console.log('Cleared:', Object.entries(removed).map(([t, n]) => `${t} ${n}`).join(', '));
  console.log('Backup saved to', backup);
}
