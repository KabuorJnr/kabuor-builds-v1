// How long the company site keeps what people send it, as the privacy notice (client/src/platform/Legal.jsx) says:
// demo requests 12 months after they were last updated; job applications 6 months after a "not this time", and
// 12 months after the last update whatever their state; and Kabuor Shops signups that never paid, with anything
// they uploaded, 30 days after their last step (the Kabuor Shops privacy notice). Runs on start and then daily. Nightly backups (backups.js)
// roll off 14 days later, so a deleted record is gone from them too within two weeks.
import { pdb } from './store.js';
import { forgetShop } from './shops.js';

const DAY = 864e5;
export const RETENTION = { demoDays: 365, rejectedDays: 182, applicationDays: 365, unpaidSignupDays: 30 };

export function pruneOldRecords(now = Date.now()) {
  const before = (days) => new Date(now - days * DAY).toISOString();
  const demos = pdb.prepare('DELETE FROM demo_requests WHERE updated_at < ?').run(before(RETENTION.demoDays)).changes;
  const applications = pdb
    .prepare("DELETE FROM career_applications WHERE (status = 'rejected' AND updated_at < ?) OR updated_at < ?")
    .run(before(RETENTION.rejectedDays), before(RETENTION.applicationDays)).changes;
  // Never paid: the shop never opened, so this is only the signup and its uploads. Their payment attempts go with them.
  const unpaid = pdb.prepare("SELECT slug FROM shops WHERE status = 'pending' AND updated_at < ?").all(before(RETENTION.unpaidSignupDays));
  for (const { slug } of unpaid) {
    forgetShop(slug);
    pdb.prepare("DELETE FROM payments WHERE slug = ?").run(slug);
    pdb.prepare("DELETE FROM shops WHERE slug = ? AND status = 'pending'").run(slug);
  }
  return { demos, applications, signups: unpaid.length };
}

export function scheduleRetention(log = console) {
  const run = () => {
    try {
      const r = pruneOldRecords();
      if (r.demos || r.applications || r.signups) log.log(`Retention: removed ${r.demos} old demo request(s), ${r.applications} old application(s) and ${r.signups} unpaid signup(s).`);
    } catch (e) {
      log.error('Retention clean-up failed', e);
    }
  };
  run();
  setInterval(run, DAY).unref();
}
