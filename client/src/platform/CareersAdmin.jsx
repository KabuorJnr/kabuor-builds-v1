// The talent desk on the platform dashboard: who applied and what to do with them, and which roles are open on
// /careers. Applications come first because they're what needs a decision.
import { useEffect, useState } from 'react';
import { ExternalLink, Mail, MessageCircle, Search } from 'lucide-react';
import { cn } from '../lib/format';
import {
  EXPERIENCE_LEVELS,
  REVIEW_STATUSES,
  START_DATES,
  WEEKLY_COMMITMENTS,
  getStoredApplications,
  getStoredRoles,
  optionLabel,
  toggleRoleStatus,
  updateApplicationReviewStatus,
} from './careersStore';

const STATUS_TONE = {
  New: 'border-[#2357F5]/30 bg-[#E8EEFF] text-[#1D46C9]',
  Shortlisted: 'border-amber-300 bg-amber-50 text-amber-900',
  Interviewing: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  Rejected: 'border-espresso/15 bg-espresso/[0.04] text-espresso/60',
};

const isHttp = (s) => /^https?:\/\//i.test(String(s ?? '').trim());
const day = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
function ago(iso) {
  const hours = Math.floor((Date.now() - Date.parse(iso)) / 36e5);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}
const waLink = (phone, text) => `https://wa.me/254${String(phone).replace(/\D/g, '').replace(/^(254|0)/, '')}?text=${encodeURIComponent(text)}`;
const firstName = (name) => String(name ?? '').trim().split(/\s+/)[0];

function Chip({ active, onClick, children, count }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition',
        active ? 'bg-espresso text-cream ring-espresso' : 'text-espresso/75 ring-espresso/10 hover:ring-espresso/25',
      )}
    >
      {children}
      <span className={cn('tabular-nums', active ? 'text-cream/60' : 'text-espresso/45')}>{count}</span>
    </button>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="relative block w-full lg:w-80">
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-espresso/40" />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-espresso/15 bg-white py-2.5 pr-3 pl-9 text-[15px] focus:border-[#2357F5] focus:ring-2 focus:ring-[#2357F5]/20 focus:outline-none"
      />
    </label>
  );
}

function Empty({ title, children, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-espresso/20 px-6 py-10 text-center">
      <p className="text-base font-semibold text-espresso">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-espresso/60">{children}</p>
      {action}
    </div>
  );
}

function ApplicationCard({ app, technical, expanded, onToggle, onStatus }) {
  const status = app.reviewStatus || 'New';
  // In the order the form asked for them, so the link the role leans on comes first.
  const links = (
    technical
      ? [
          ['githubUrl', 'GitHub'],
          ['liveProjectUrl1', 'Live app'],
          ['cleanestCodeUrl', 'Cleanest code or PR'],
          ['liveProjectUrl2', 'Another project'],
          ['portfolioUrl', 'Portfolio'],
        ]
      : [
          ['portfolioUrl', 'LinkedIn, CV or portfolio'],
          ['liveProjectUrl1', 'Work sample'],
          ['liveProjectUrl2', 'Another work sample'],
          ['githubUrl', 'GitHub'],
          ['cleanestCodeUrl', 'Code sample'],
        ]
  ).filter(([key]) => isHttp(app[key]));
  const answers = [
    ['Hardest problem they’ve solved', app.hardestProblem],
    ['Why Kabuor and African commerce', app.whyAfricaKabuor],
    ['Keeping a shop selling through an outage', app.offlineArchitecture],
  ].filter(([, text]) => text?.trim());
  const detailsId = `app-${app.trackingRef}`;

  return (
    <article className={cn('rounded-2xl border bg-[#FDFCF7] p-4 transition sm:p-5', status === 'New' ? 'border-[#2357F5]/25' : 'border-espresso/10')}>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <h3 className="text-base font-bold text-espresso">{app.fullName}</h3>
            <span className="font-mono text-[13px] text-espresso/45">{app.trackingRef}</span>
          </div>
          <p className="mt-0.5 text-[15px] font-semibold text-[#2357F5]">{app.roleTitle}</p>
          <p className="mt-1 text-sm text-espresso/65">
            {optionLabel(EXPERIENCE_LEVELS, app.experienceTrack) || 'Experience not given'} · {app.location || 'Kenya'} · Applied {day(app.submittedAt)} ({ago(app.submittedAt)})
          </p>
          <p className="mt-0.5 text-sm break-words text-espresso/65">
            {app.email} · {app.phone}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:justify-end">
          <label className="sr-only" htmlFor={`${detailsId}-status`}>
            Review status for {app.fullName}
          </label>
          <select
            id={`${detailsId}-status`}
            value={status}
            onChange={(e) => onStatus(e.target.value)}
            className={cn('rounded-lg border py-2 pr-8 pl-3 text-sm font-semibold focus:ring-2 focus:ring-[#2357F5]/30 focus:outline-none', STATUS_TONE[status])}
          >
            {REVIEW_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {app.phone && (
            <a
              href={waLink(app.phone, `Hi ${firstName(app.fullName)}, this is Kabuor Technologies about your application for ${app.roleTitle} (${app.trackingRef}).`)}
              target="_blank"
              rel="noreferrer"
              aria-label={`WhatsApp ${app.fullName}`}
              title="WhatsApp"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#1E8E3E] text-white hover:bg-[#176F30]"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          )}
          {app.email && (
            <a
              href={`mailto:${app.email}?subject=${encodeURIComponent(`Your application for ${app.roleTitle} (${app.trackingRef})`)}`}
              aria-label={`Email ${app.fullName}`}
              title="Email"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-espresso text-cream hover:bg-cocoa"
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={detailsId} className="mt-3 text-sm font-semibold text-[#2357F5] hover:underline">
        {expanded ? 'Hide answers' : `Read answers and ${links.length} ${links.length === 1 ? 'link' : 'links'}`}
      </button>

      {expanded && (
        <div id={detailsId} className="mt-4 space-y-4 border-t border-espresso/10 pt-4">
          {links.length > 0 && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {links.map(([key, label]) => (
                <li key={key}>
                  <a href={app[key]} target="_blank" rel="noreferrer" className="flex items-start justify-between gap-3 rounded-xl border border-espresso/10 bg-white p-3 hover:border-[#2357F5]/40">
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-espresso/60">{label}</span>
                      <span className="block text-sm break-all text-[#2357F5]">{app[key]}</span>
                    </span>
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-espresso/40" />
                  </a>
                </li>
              ))}
            </ul>
          )}

          {answers.map(([question, text]) => (
            <section key={question} className="rounded-xl border border-espresso/10 bg-white p-4">
              <h4 className="text-sm font-bold text-espresso">{question}</h4>
              <p className="mt-1.5 text-[15px] leading-relaxed whitespace-pre-wrap text-espresso/80">{text}</p>
            </section>
          ))}

          <dl className="flex flex-wrap gap-x-6 gap-y-2 rounded-xl bg-[#F7F7FB] p-4 text-sm">
            <div>
              <dt className="text-espresso/55">Time each week</dt>
              <dd className="font-semibold text-espresso">{optionLabel(WEEKLY_COMMITMENTS, app.weeklyCommitment) || 'Not given'}</dd>
            </div>
            <div>
              <dt className="text-espresso/55">Can start</dt>
              <dd className="font-semibold text-espresso">{optionLabel(START_DATES, app.earliestStartDate) || 'Not given'}</dd>
            </div>
            <div>
              <dt className="text-espresso/55">Pre-funding terms</dt>
              <dd className="font-semibold text-espresso">{app.equityAcknowledgment ? 'Accepted' : 'Not accepted'}</dd>
            </div>
          </dl>
        </div>
      )}
    </article>
  );
}

export default function CareersAdmin() {
  const [roles, setRoles] = useState(getStoredRoles);
  const [applications, setApplications] = useState(getStoredApplications);
  const [activeTab, setActiveTab] = useState(() => (getStoredApplications().length ? 'applications' : 'roles'));
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'open' | 'closed'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | one of REVIEW_STATUSES
  const [appRoleFilter, setAppRoleFilter] = useState('all'); // 'all' | a role id
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAppRef, setExpandedAppRef] = useState(null);

  useEffect(() => {
    const handleRolesChange = () => setRoles(getStoredRoles());
    const handleAppsChange = () => setApplications(getStoredApplications());

    window.addEventListener('kb-roles-changed', handleRolesChange);
    window.addEventListener('kb-apps-changed', handleAppsChange);

    return () => {
      window.removeEventListener('kb-roles-changed', handleRolesChange);
      window.removeEventListener('kb-apps-changed', handleAppsChange);
    };
  }, []);

  const handleToggle = (roleId) => setRoles(toggleRoleStatus(roleId));
  const handleUpdateReviewStatus = (trackingRef, status) => setApplications(updateApplicationReviewStatus(trackingRef, status));

  const statusOf = (app) => app.reviewStatus || 'New';
  const openCount = roles.filter((r) => r.status === 'open').length;
  const closedCount = roles.length - openCount;
  const newCount = applications.filter((a) => statusOf(a) === 'New').length;
  const appsFor = (roleId) => applications.filter((a) => a.roleId === roleId);
  const technicalRoles = new Set(roles.filter((r) => r.technical).map((r) => r.id));

  const query = searchQuery.toLowerCase().trim();

  const filteredRoles = roles.filter((r) => {
    const matchesFilter = roleFilter === 'all' || r.status === roleFilter;
    const matchesQuery = !query || r.title.toLowerCase().includes(query) || r.department.toLowerCase().includes(query);
    return matchesFilter && matchesQuery;
  });

  // Search and role narrow the list first, so each status chip counts what clicking it would show.
  const searchedApps = applications.filter((app) => {
    const matchesRole = appRoleFilter === 'all' || app.roleId === appRoleFilter;
    const matchesQuery =
      !query ||
      [app.fullName, app.roleTitle, app.email, app.phone, app.trackingRef].some((v) => String(v ?? '').toLowerCase().includes(query));
    return matchesRole && matchesQuery;
  });
  const filteredApps = searchedApps.filter((app) => statusFilter === 'all' || statusOf(app) === statusFilter);
  const rolesWithApps = roles.filter((r) => appsFor(r.id).length);
  const appFiltersOn = statusFilter !== 'all' || appRoleFilter !== 'all' || !!query;

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
  };
  const showApplicantsFor = (roleId) => {
    setAppRoleFilter(roleId);
    setStatusFilter('all');
    switchTab('applications');
  };
  const clearAppFilters = () => {
    setStatusFilter('all');
    setAppRoleFilter('all');
    setSearchQuery('');
  };

  const tabClass = (tab) =>
    cn('flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition', activeTab === tab ? 'bg-espresso text-cream shadow-sm' : 'text-espresso/70 hover:text-espresso');

  return (
    <section className="rounded-[var(--r-xl)] bg-white p-4 shadow-sm ring-1 ring-espresso/[0.08] sm:p-6" aria-labelledby="hiring-title">
      <div className="border-b border-espresso/10 pb-5">
        <p className="kb-kicker text-caramel">Kabuor Technologies talent desk</p>
        <h2 id="hiring-title" className="kb-display mt-1.5 text-3xl text-espresso">
          Hiring
        </h2>
        <p className="mt-2 text-[15px] text-espresso/70">
          {newCount ? (
            <b className="text-[#1D46C9]">
              {newCount} new {newCount === 1 ? 'application' : 'applications'} to review
            </b>
          ) : (
            'No new applications to review'
          )}
          {' · '}
          {openCount} of {roles.length} roles open on <code className="font-semibold text-espresso">/careers</code>
        </p>
      </div>

      <div className="mt-5 inline-flex rounded-xl bg-beige p-1" role="tablist" aria-label="Hiring">
        <button type="button" role="tab" aria-selected={activeTab === 'applications'} onClick={() => switchTab('applications')} className={tabClass('applications')}>
          Applications
          <span className={cn('tabular-nums', activeTab === 'applications' ? 'text-cream/60' : 'text-espresso/45')}>{applications.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'roles'} onClick={() => switchTab('roles')} className={tabClass('roles')}>
          Roles
          <span className={cn('tabular-nums', activeTab === 'roles' ? 'text-cream/60' : 'text-espresso/45')}>{roles.length}</span>
        </button>
      </div>

      {activeTab === 'applications' && (
        <div className="mt-5" role="tabpanel">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar -mx-4 flex min-w-0 gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by review status">
              <Chip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} count={searchedApps.length}>
                All
              </Chip>
              {REVIEW_STATUSES.map((s) => (
                <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} count={searchedApps.filter((a) => statusOf(a) === s).length}>
                  {s}
                </Chip>
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="careers-admin-role">
                Role
              </label>
              <select
                id="careers-admin-role"
                value={appRoleFilter}
                onChange={(e) => setAppRoleFilter(e.target.value)}
                className="w-full rounded-xl border border-espresso/15 bg-white py-2.5 pr-8 pl-3 text-[15px] focus:border-[#2357F5] focus:outline-none sm:w-60"
              >
                <option value="all">All roles</option>
                {rolesWithApps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({appsFor(r.id).length})
                  </option>
                ))}
              </select>
              <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search name, email or reference" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {filteredApps.map((app) => (
              <ApplicationCard
                key={app.trackingRef}
                app={app}
                technical={technicalRoles.has(app.roleId)}
                expanded={expandedAppRef === app.trackingRef}
                onToggle={() => setExpandedAppRef(expandedAppRef === app.trackingRef ? null : app.trackingRef)}
                onStatus={(status) => handleUpdateReviewStatus(app.trackingRef, status)}
              />
            ))}

            {!applications.length && (
              <Empty title="No applications yet">
                They appear here, newest first, as soon as someone applies on /careers, with their links and answers.
              </Empty>
            )}
            {applications.length > 0 && !filteredApps.length && (
              <Empty
                title="No applications match these filters"
                action={
                  appFiltersOn && (
                    <button type="button" onClick={clearAppFilters} className="mt-4 text-sm font-semibold text-[#2357F5] hover:underline">
                      Show all {applications.length} applications
                    </button>
                  )
                }
              >
                {statusFilter !== 'all' ? `Nobody is at “${statusFilter}”` : 'Nothing matches'}
                {appRoleFilter !== 'all' ? ` for ${roles.find((r) => r.id === appRoleFilter)?.title ?? 'this role'}` : ''}
                {query ? ` with “${searchQuery.trim()}”` : ''}.
              </Empty>
            )}
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="mt-5" role="tabpanel">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
              <Chip active={roleFilter === 'all'} onClick={() => setRoleFilter('all')} count={roles.length}>
                All
              </Chip>
              <Chip active={roleFilter === 'open'} onClick={() => setRoleFilter('open')} count={openCount}>
                Open
              </Chip>
              <Chip active={roleFilter === 'closed'} onClick={() => setRoleFilter('closed')} count={closedCount}>
                Closed
              </Chip>
            </div>
            <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search roles or teams" />
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-espresso/10">
            <div className="hidden grid-cols-[minmax(0,1fr)_150px_100px_130px] gap-4 bg-beige/50 px-4 py-2.5 text-[13px] font-semibold text-espresso/60 md:grid">
              <span>Role</span>
              <span>Applicants</span>
              <span>Status</span>
              <span className="text-right">On /careers</span>
            </div>
            <ul className="divide-y divide-espresso/[0.07]">
              {filteredRoles.map((role) => {
                const isOpen = role.status === 'open';
                const apps = appsFor(role.id);
                const fresh = apps.filter((a) => statusOf(a) === 'New').length;
                return (
                  <li key={role.id} className="grid gap-x-4 gap-y-2 px-4 py-4 md:grid-cols-[minmax(0,1fr)_150px_100px_130px] md:items-center">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-espresso">{role.title}</p>
                      <p className="mt-0.5 text-sm text-espresso/60">
                        {role.department} · {role.type}
                      </p>
                    </div>
                    <div className="text-sm">
                      {apps.length ? (
                        <button type="button" onClick={() => showApplicantsFor(role.id)} className="font-semibold text-[#2357F5] hover:underline">
                          {apps.length} {apps.length === 1 ? 'applicant' : 'applicants'}
                          {fresh > 0 && <span className="font-normal text-espresso/60"> · {fresh} new</span>}
                        </button>
                      ) : (
                        <span className="text-espresso/50">No applicants yet</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 md:contents">
                      <span
                        className={cn(
                          'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-semibold ring-1',
                          isOpen ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : 'bg-espresso/[0.04] text-espresso/65 ring-espresso/10',
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', isOpen ? 'bg-emerald-500' : 'bg-espresso/35')} />
                        {isOpen ? 'Open' : 'Closed'}
                      </span>
                      <div className="md:text-right">
                        <button
                          type="button"
                          onClick={() => handleToggle(role.id)}
                          aria-label={`${isOpen ? 'Close' : 'Reopen'} ${role.title}`}
                          title={isOpen ? 'Stops new applications; the role stays listed as closed' : 'Takes applications again'}
                          className="rounded-lg border border-espresso/15 bg-white px-3.5 py-2 text-sm font-semibold text-espresso transition hover:border-espresso/35"
                        >
                          {isOpen ? 'Close role' : 'Reopen role'}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {!filteredRoles.length && (
              <p className="px-4 py-10 text-center text-[15px] text-espresso/55">
                No {roleFilter === 'all' ? '' : `${roleFilter} `}roles{query ? ` match “${searchQuery.trim()}”` : ''}.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
