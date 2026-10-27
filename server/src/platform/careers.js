// The careers page (/careers): applications, and which roles are taking them. The roles themselves (titles, what
// the job is) are written in the client's careersStore.js; the server keeps who applied and which roles the
// dashboard has closed, so both reach everyone instead of staying in the browser that set them.
import { randomInt } from 'node:crypto';
import { HttpError } from '../db.js';
import { now, pdb } from './store.js';

export const REVIEW_STATUSES = ['new', 'shortlisted', 'interviewing', 'rejected'];
const ROLE_STATUSES = ['open', 'closed'];
const ROLE_ID = /^[a-z0-9][a-z0-9-]{1,79}$/;
const LINKS = ['githubUrl', 'liveProjectUrl1', 'cleanestCodeUrl', 'liveProjectUrl2', 'portfolioUrl'];
const WRITTEN = ['hardestProblem', 'whyAfricaKabuor', 'offlineArchitecture'];
const CHOICES = ['weeklyCommitment', 'earliestStartDate'];

const text = (v, max) => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
// Written answers keep their paragraphs.
const prose = (v, max) => String(v ?? '').replace(/\r\n?/g, '\n').trim().slice(0, max);
const link = (v) => {
  const s = String(v ?? '').trim().slice(0, 500);
  return /^https?:\/\/[^\s]+$/i.test(s) ? s : '';
};

const view = (r) => ({
  trackingRef: r.ref,
  roleId: r.role_id,
  roleTitle: r.role_title,
  department: r.department,
  fullName: r.name,
  email: r.email,
  phone: r.phone,
  location: r.location,
  experienceTrack: r.experience,
  ...JSON.parse(r.answers),
  reviewStatus: r.status,
  submittedAt: r.created_at,
  updatedAt: r.updated_at,
});

/** Every role the dashboard has opened or closed: { [roleId]: 'open' | 'closed' }. */
export const roleStatuses = () => Object.fromEntries(pdb.prepare('SELECT role_id, status FROM career_roles').all().map((r) => [r.role_id, r.status]));

function newRef() {
  for (;;) {
    const ref = `KBR-APP-${randomInt(100000, 1000000)}`;
    if (!pdb.prepare('SELECT 1 FROM career_applications WHERE ref = ?').get(ref)) return ref;
  }
}

export function createApplication(input = {}) {
  if (text(input.website, 50)) return { ok: true, trackingRef: `KBR-APP-${randomInt(100000, 1000000)}` }; // a bot filled the hidden field: pretend it worked
  const roleId = String(input.roleId ?? '');
  const roleTitle = text(input.roleTitle, 160);
  if (!ROLE_ID.test(roleId) || !roleTitle) throw new HttpError(400, 'Choose a role to apply for.');
  if (roleStatuses()[roleId] === 'closed') throw new HttpError(409, 'This role stopped taking applications while you were writing. Your answers are still saved on this device.');

  const name = text(input.fullName, 100);
  const email = text(input.email, 160).toLowerCase();
  const phone = text(input.phone, 30);
  if (name.length < 2) throw new HttpError(400, 'Enter your full name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new HttpError(400, 'Enter an email address like name@example.com.');
  // Applicants aren't all in Kenya (volunteers apply from across Africa), so any 9 to 15 digit number will do.
  const digits = phone.replace(/\D/g, '').length;
  if (digits < 9 || digits > 15) throw new HttpError(400, 'Enter a phone number we can call or WhatsApp, e.g. 0712 345 678.');

  const answers = {
    ...Object.fromEntries(LINKS.map((k) => [k, link(input[k])])),
    ...Object.fromEntries(WRITTEN.map((k) => [k, prose(input[k], 6000)])),
    ...Object.fromEntries(CHOICES.map((k) => [k, text(input[k], 60)])),
    equityAcknowledgment: input.equityAcknowledgment === true,
  };
  if (!LINKS.some((k) => answers[k])) throw new HttpError(400, 'Add at least one link to your work.');
  if (!answers.hardestProblem || !answers.whyAfricaKabuor) throw new HttpError(400, 'Answer the questions before sending.');
  if (!answers.equityAcknowledgment) throw new HttpError(400, 'Confirm the pre-funding terms to apply.');

  const fields = [roleTitle, text(input.department, 80), name, email, phone, text(input.location, 120), text(input.experienceTrack, 60), JSON.stringify(answers)];
  // Sending again for the same role within a day (a double tap, or a fix after sending) updates the first one.
  const recent = pdb
    .prepare("SELECT ref FROM career_applications WHERE email = ? AND role_id = ? AND status = 'new' AND created_at >= ? ORDER BY id DESC LIMIT 1")
    .get(email, roleId, new Date(Date.now() - 864e5).toISOString());
  if (recent) {
    pdb.prepare('UPDATE career_applications SET role_title = ?, department = ?, name = ?, email = ?, phone = ?, location = ?, experience = ?, answers = ?, updated_at = ? WHERE ref = ?').run(...fields, now(), recent.ref);
    return { ok: true, trackingRef: recent.ref };
  }
  const ref = newRef();
  pdb
    .prepare('INSERT INTO career_applications (ref, role_id, role_title, department, name, email, phone, location, experience, answers, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(ref, roleId, ...fields, now(), now());
  return { ok: true, trackingRef: ref };
}

/** For the dashboard: every application, newest first, and which roles it has opened or closed. */
export function listApplications() {
  const rows = pdb.prepare('SELECT * FROM career_applications ORDER BY id DESC LIMIT 1000').all();
  return { applications: rows.map(view), roles: roleStatuses() };
}

export const newApplicationCount = () => pdb.prepare("SELECT COUNT(*) AS n FROM career_applications WHERE status = 'new'").get().n;

export function setApplicationStatus(ref, status) {
  if (!REVIEW_STATUSES.includes(status)) throw new HttpError(400, 'Unknown status.');
  const r = pdb.prepare('SELECT * FROM career_applications WHERE ref = ?').get(String(ref));
  if (!r) throw new HttpError(404, 'That application is gone.');
  pdb.prepare('UPDATE career_applications SET status = ?, updated_at = ? WHERE id = ?').run(status, now(), r.id);
  return view({ ...r, status, updated_at: now() });
}

export function setRoleStatus(roleId, status) {
  if (!ROLE_ID.test(String(roleId))) throw new HttpError(400, 'Unknown role.');
  if (!ROLE_STATUSES.includes(status)) throw new HttpError(400, 'A role is either open or closed.');
  pdb
    .prepare('INSERT INTO career_roles (role_id, status, updated_at) VALUES (?, ?, ?) ON CONFLICT(role_id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at')
    .run(roleId, status, now());
  return { roleId, status };
}
