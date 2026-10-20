// Nightly copies of every database (the platform's and each shop's), kept 14 days in DATA_DIR/backups/<date>/.
// VACUUM INTO writes a clean, consistent copy while the shop keeps trading. These copies live on the same volume:
// they undo a bad change or a deleted shop, not a lost volume. The platform owner can download the latest set
// from the dashboard (/api/platform/admin/backups/latest) for an off-site copy.
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { DATA_DIR } from './site.js';

export const BACKUP_DIR = join(DATA_DIR, 'backups');
const KEEP_DAYS = 14;

function databases() {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (full === BACKUP_DIR) continue;
      const s = statSync(full);
      if (s.isDirectory()) walk(full);
      else if (name.endsWith('.db')) files.push(full);
    }
  };
  if (existsSync(DATA_DIR)) walk(DATA_DIR);
  return files;
}

export function backupNow(day = new Date().toISOString().slice(0, 10)) {
  const target = join(BACKUP_DIR, day);
  mkdirSync(target, { recursive: true });
  const done = [];
  for (const file of databases()) {
    const out = join(target, relative(DATA_DIR, file));
    mkdirSync(join(out, '..'), { recursive: true });
    rmSync(out, { force: true });
    const db = new DatabaseSync(file);
    try {
      db.exec(`VACUUM INTO '${out.replace(/'/g, "''")}'`);
      done.push(relative(DATA_DIR, file));
    } finally {
      db.close();
    }
  }
  // Keep the last KEEP_DAYS days.
  const days = readdirSync(BACKUP_DIR).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  for (const old of days.slice(0, Math.max(0, days.length - KEEP_DAYS))) rmSync(join(BACKUP_DIR, old), { recursive: true, force: true });
  return { day, files: done };
}

export function latestBackup() {
  if (!existsSync(BACKUP_DIR)) return null;
  const days = readdirSync(BACKUP_DIR).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  return days.length ? join(BACKUP_DIR, days.at(-1)) : null;
}

/** Once on start (if today's is missing), then every 24 hours. */
export function scheduleBackups(log = console) {
  const run = () => {
    try {
      const r = backupNow();
      log.info?.(`Backup ${r.day}: ${r.files.length} database(s)`);
    } catch (e) {
      log.error?.('Backup failed', e);
    }
  };
  if (!existsSync(join(BACKUP_DIR, new Date().toISOString().slice(0, 10)))) setTimeout(run, 60_000).unref();
  setInterval(run, 24 * 3600_000).unref();
}
