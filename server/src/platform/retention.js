// How long the company site keeps what people send it, as the privacy notice (client/src/platform/Legal.jsx) says:
// demo requests 12 months after they were last updated; job applications 6 months after a "not this time", and
// 12 months after the last update whatever their state. Runs on start and then daily. Nightly backups (backups.js)
// roll off 14 days later, so a deleted record is gone from them too within two weeks.
import { pdb } from './store.js';

const DAY = 864e5;
export const RETENTION = { demoDays: 365, rejectedDays: 182, applicationDays: 365 };

export function pruneOldRecords(now = Date.now()) {
  const before = (days) => new Date(now - days * DAY).toISOString();
  const demos = pdb.prepare('DELETE FROM demo_requests WHERE updated_at < ?').run(before(RETENTION.demoDays)).changes;
  const applications = pdb
    .prepare("DELETE FROM career_applications WHERE (status = 'rejected' AND updated_at < ?) OR updated_at < ?")
    .run(before(RETENTION.rejectedDays), before(RETENTION.applicationDays)).changes;
  return { demos, applications };
}

export function scheduleRetention(log = console) {
  const run = () => {
    try {
      const r = pruneOldRecords();
      if (r.demos || r.applications) log.log(`Retention: removed ${r.demos} old demo request(s) and ${r.applications} old application(s).`);
    } catch (e) {
      log.error('Retention clean-up failed', e);
    }
  };
  run();
  setInterval(run, DAY).unref();
}
