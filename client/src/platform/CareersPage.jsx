import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { CorporatePage, SectionHead } from './Corporate';
import { DEFAULT_ROLES, fetchRoleStatuses, payLine, withStatus } from './careersStore';
import CareersApplicationPage from './CareersApplicationPage';
import { CONTACT_EMAIL } from './contact';

export const ALL_ROLES = DEFAULT_ROLES;

// Listing order of the team filter; teams without roles are left out.
const DEPARTMENTS = ['Young Builders & Volunteers', 'Engineering', 'Leadership', 'Marketing & Growth', 'Sales & Commercial', 'Operations & Success', 'Finance, Legal & People'];

const PERKS = [
  {
    title: 'Generous Founding ESOP Ownership',
    description: 'We reward early conviction with meaningful stock option grants with formal 4-year vesting. You own real equity in the company upside from day one.',
  },
  {
    title: 'Post-Funding Salary & Medical Guarantee',
    description: 'We are currently pre-funding and bootstrapping. All founding roles have contractual market-competitive salaries and tier-1 health cover locked in upon closing our funding round.',
  },
  {
    title: '100% Fully Remote & High Autonomy',
    description: 'Headquartered along Ngong Road, Nairobi, we operate 100% remote. Work on your schedule with zero micromanagement, focused purely on shipped merchant impact.',
  },
  {
    title: 'Real Production Systems Ownership',
    description: 'No busywork or toy apps. You architect and deploy low-allocation C# .NET 10 microservices and offline React 19 PWAs moving real transactions for Kenyan businesses.',
  },
  {
    title: 'Founder & Senior Architect Mentorship',
    description: 'Direct pairing with experienced founders and engineers who have built and scaled high-throughput financial infrastructure across East Africa.',
  },
  {
    title: 'Flexible Leave & Collaborative Culture',
    description: 'High-trust environment with flexible time off, asynchronous engineering workflows, and deep commitment to work-life sustainability.',
  },
];

const PRINCIPLES = [
  {
    title: 'Zero Tolerance for Slowness',
    description: 'When a cashier in a supermarket has 15 customers queuing with groceries, every millisecond matters. We optimize down to zero-allocation memory pools in C# and client-side caching.',
  },
  {
    title: 'Massive Economic Impact',
    description: 'MSMEs contribute over 40% of Kenya’s GDP. Giving them automated financial controls and instant tax compliance fundamentally protects their business livelihoods.',
  },
  {
    title: 'Extreme Ownership & Equity',
    description: "You won't be a cog in an 8-layer approval chain. You will own complete functional domains, deploy weekly, and share directly in company ownership through our formal ESOP equity program.",
  },
];

const BUILDER_POINTS = [
  { title: 'Real Production Code', description: 'No coffee runs or toy apps. You will build high-throughput C# backends, offline React PWAs, and local payment rails from day one.' },
  { title: 'Direct Mentorship', description: 'Pair directly with core architects and founders who have scaled financial systems and high-growth African startups.' },
  { title: 'No Degree Barrier', description: 'We care about your passion, curiosity, and speed of learning. Self-taught tinkerers and student developers are warmly welcome.' },
  { title: 'Full-Time Pathway', description: 'Top-performing fellows and open contributors graduate into full-time engineering and product positions with equity ownership.' },
];

function RoleCard({ role, expanded, onToggle, onApply }) {
  const [copied, setCopied] = useState(false);
  const closed = role.status === 'closed';
  const detailsId = `role-details-${role.id}`;

  const copyLink = async () => {
    const url = new URL(window.location.href);
    url.search = `?role=${role.id}`;
    url.hash = '';
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The address bar already shows this role's link (opening a role puts it there).
    }
  };

  return (
    <article
      id={`role-${role.id}`}
      className={`scroll-mt-20 overflow-hidden rounded-lg border bg-white ${expanded ? 'border-[var(--ms-blue)] shadow-[0_0_0_1px_var(--ms-blue)]' : 'border-[var(--ms-line)] hover:border-[#a19f9d]'}`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-[var(--ms-blue)]">
              {role.department}
              {closed && (
                <span className="rounded bg-[var(--ms-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--ms-muted)]">Applications closed</span>
              )}
            </p>
            <h3 className="mt-1 text-xl font-semibold sm:text-2xl">
              <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={detailsId} className="text-left hover:underline hover:underline-offset-4">
                {role.title}
              </button>
            </h3>
            <p className="mt-2 text-sm text-[var(--ms-muted)]">
              {role.type} · {role.experience} · {role.location}
            </p>
          </div>
          <div className="shrink-0 sm:max-w-[19rem] sm:text-right">
            <p className="text-[15px] font-semibold text-[#0F7A3D]">{role.equity}</p>
            <p className="mt-0.5 text-sm text-[var(--ms-muted)]">{payLine(role)}</p>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-[var(--ms-muted)]">{role.summary}</p>

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Skills">
          {role.tags.map((tag) => (
            <li key={tag} className="rounded bg-[var(--ms-soft)] px-2.5 py-1 text-[13px]">
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {!closed && (
            <button type="button" onClick={onApply} className="ms-btn ms-btn-primary py-2">
              Apply
            </button>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className="ms-btn ms-btn-secondary py-2"
          >
            {expanded ? 'Hide details' : 'Responsibilities & requirements'}
          </button>
        </div>
      </div>

      {expanded && (
        <div id={detailsId} className="grid gap-8 border-t border-[var(--ms-line)] bg-[#FAFAFA] p-5 sm:p-6 md:grid-cols-2">
          <section>
            <h4 className="font-semibold">What you’ll do</h4>
            <ul className="mt-3 space-y-2.5">
              {role.responsibilities.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-[var(--ms-muted)]">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ms-ink)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h4 className="font-semibold">What we’re looking for</h4>
            <ul className="mt-3 space-y-2.5">
              {role.requirements.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-[var(--ms-muted)]">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ms-ink)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-[var(--ms-line)] bg-white p-5 md:col-span-2">
            <h4 className="font-semibold">What you get</h4>
            <p className="mt-2 text-[15px] leading-relaxed">{role.benefitsNote}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ms-muted)]">{role.compensationNote}</p>
          </section>

          <div className="flex flex-wrap items-center gap-2.5 md:col-span-2">
            {closed ? (
              <p className="text-[15px] text-[var(--ms-muted)]">This role isn’t taking applications right now.</p>
            ) : (
              <button type="button" onClick={onApply} className="ms-btn ms-btn-primary">
                Apply for this role
              </button>
            )}
            <button type="button" onClick={copyLink} className="ms-link px-2 py-2">
              {copied ? 'Link copied' : 'Copy link to this role'}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default function CareersPage({ info }) {
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  // The open role and the application form live in the address (?role=…, ?apply=…), so links can be shared and
  // the browser's Back button returns to the list.
  const [params, setParams] = useSearchParams();
  const expandedRole = params.get('role');
  const applyingRole = roles.find((r) => r.id === params.get('apply'));

  useEffect(() => {
    document.title = 'Careers · Kabuor Technologies';
  }, []);

  // Which roles the hiring desk has closed. If the platform can't be reached the roles show as written; it still
  // refuses applications to a closed role, and the form says so.
  useEffect(() => {
    fetchRoleStatuses()
      .then((statuses) => setRoles(withStatus(statuses)))
      .catch(() => {});
  }, []);

  // Arriving from a shared role link: bring that role into view, again once the web fonts have loaded and
  // reflowed the page above it.
  useEffect(() => {
    if (!expandedRole) return;
    const show = () => document.getElementById(`role-${expandedRole}`)?.scrollIntoView({ block: 'start', behavior: 'instant' });
    show();
    document.fonts?.ready.then(show);
  }, []);

  if (params.get('apply')) {
    return (
      <CareersApplicationPage
        role={applyingRole}
        onBack={() => {
          setParams(applyingRole ? { role: applyingRole.id } : {}, { replace: true });
          requestAnimationFrame(() => document.getElementById(applyingRole ? `role-${applyingRole.id}` : 'open-roles')?.scrollIntoView({ block: 'start', behavior: 'instant' }));
        }}
        info={info}
      />
    );
  }

  const openRoles = roles.filter((r) => r.status !== 'closed');
  const query = searchQuery.toLowerCase().trim();
  const matchesSearch = (role) =>
    !query ||
    role.title.toLowerCase().includes(query) ||
    role.department.toLowerCase().includes(query) ||
    role.tags.some((t) => t.toLowerCase().includes(query)) ||
    role.summary.toLowerCase().includes(query);
  const searched = roles.filter(matchesSearch);
  const departments = DEPARTMENTS.filter((d) => roles.some((r) => r.department === d));
  // Open roles first; closed ones stay listed (people arrive from old links) but sink to the bottom.
  const filteredRoles = searched
    .filter((role) => selectedDept === 'All' || role.department === selectedDept)
    .sort((a, b) => (a.status === 'closed') - (b.status === 'closed'));

  const handleApply = (role) => {
    setParams({ apply: role.id });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const toggle = (role) => setParams(expandedRole === role.id ? {} : { role: role.id }, { replace: true });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
  };

  const filtered = query || selectedDept !== 'All';

  return (
    <CorporatePage cta={{ href: '#open-roles', label: `See ${openRoles.length} open roles` }}>
      {/* Hero */}
      <section className="border-b border-[var(--ms-line)] bg-[#F5F7FC]">
        <div className="container-x py-12 sm:py-16 lg:py-20">
          <p className="text-sm font-semibold text-[var(--ms-blue)]">Careers at Kabuor Technologies</p>
          <h1 className="mt-3 max-w-3xl text-[2.25rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl">Build the software Kenyan businesses run on</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--ms-muted)]">
            Kenyan merchants run on M-Pesa, paper dockets and resilience. We build the systems that take that work off their hands: invoicing and M-Pesa matching, KRA eTIMS, stock, payroll and online shops. We’re a fully remote team based on Ngong Road, Nairobi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#open-roles" className="ms-btn ms-btn-primary">
              See {openRoles.length} open roles
            </a>
            <a href="#young-builders" className="ms-btn ms-btn-secondary">
              Young builders and volunteers
            </a>
          </div>
        </div>
      </section>

      {/* Open roles first: it's what most people came for. */}
      <section id="open-roles" aria-labelledby="roles-title" className="scroll-mt-20 py-14 sm:py-20">
        <div className="container-x">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHead
              id="roles-title"
              title="Open positions"
              text={`${openRoles.length} of ${roles.length} roles are taking applications. Founding roles are paid in equity now, with salaries agreed in advance from our funding round.`}
            />
            <label className="relative block w-full md:w-80">
              <span className="sr-only">Search roles</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--ms-muted)]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roles, skills or teams"
                className="w-full rounded border border-[#8a8886] bg-white py-2.5 pr-3 pl-9 text-[15px] focus:border-[var(--ms-blue)] focus:shadow-[0_0_0_1px_var(--ms-blue)] focus:outline-none"
              />
            </label>
          </div>

          {/* One swipeable row on phones, wrapped from sm up. */}
          <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto border-b border-[var(--ms-line)] px-4 pb-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by team">
            {['All', ...departments].map((dept) => {
              const count = dept === 'All' ? searched.length : searched.filter((r) => r.department === dept).length;
              const active = selectedDept === dept;
              return (
                <button
                  key={dept}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedDept(dept)}
                  className={`flex shrink-0 items-center gap-1.5 rounded border px-3.5 py-1.5 text-sm whitespace-nowrap ${
                    active ? 'border-[var(--ms-ink)] bg-[var(--ms-ink)] font-semibold text-white' : 'border-[var(--ms-line)] bg-white hover:border-[#a19f9d]'
                  } ${!count && !active ? 'opacity-50' : ''}`}
                >
                  {dept === 'All' ? 'All teams' : dept}
                  <span className={`tabular-nums ${active ? 'text-white/70' : 'text-[var(--ms-muted)]'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-sm text-[var(--ms-muted)]" aria-live="polite">
            {filtered ? `Showing ${filteredRoles.length} of ${roles.length} roles` : `${roles.length} roles`}
            {query && <> matching “{searchQuery.trim()}”</>}
            {selectedDept !== 'All' && <> in {selectedDept}</>}
            {filtered && (
              <button type="button" onClick={clearFilters} className="ms-link ml-2">
                Clear filters
              </button>
            )}
          </p>

          <div className="mt-4 space-y-4">
            {filteredRoles.map((role) => (
              <RoleCard key={role.id} role={role} expanded={expandedRole === role.id} onToggle={() => toggle(role)} onApply={() => handleApply(role)} />
            ))}

            {!filteredRoles.length && (
              <div className="rounded-lg border border-dashed border-[#a19f9d] px-6 py-12 text-center">
                <p className="text-xl font-semibold">No roles match {query ? `“${searchQuery.trim()}”` : 'this team'}</p>
                <p className="mx-auto mt-2 max-w-md text-[15px] text-[var(--ms-muted)]">Try a broader skill such as “React”, “sales” or “finance”, or see every team. Not seeing your fit? Tell us what you’d build.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={clearFilters} className="ms-btn ms-btn-primary">
                    Show all {roles.length} roles
                  </button>
                  <a href={`mailto:${CONTACT_EMAIL}?subject=Open%20application%20-%20Kabuor%20Technologies`} className="ms-btn ms-btn-secondary">
                    Email an open application
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How we work */}
      <section id="why-kabuor" aria-labelledby="why-title" className="scroll-mt-20 border-y border-[var(--ms-line)] bg-[var(--ms-soft)] py-14 sm:py-20">
        <div className="container-x">
          <SectionHead id="why-title" title="How we work" text="Our software runs in wholesale warehouses in Industrial Area, shops in Eastleigh and Gikomba, and distributors’ fleets across Kenya." />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <li key={p.title} className="rounded-lg bg-white p-6">
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--ms-muted)]">{p.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What you get */}
      <section aria-labelledby="perks-title" className="py-14 sm:py-20">
        <div className="container-x">
          <SectionHead
            id="perks-title"
            title="Equity now, salaries from our funding round"
            text="We’re open about where we are: bootstrapping, before funding. People who join now get founding equity, with competitive salaries agreed in advance that start when the round closes."
          />
          <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map((perk) => (
              <li key={perk.title} className="border-t border-[var(--ms-line)] pt-6">
                <h3 className="text-lg font-semibold">{perk.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--ms-muted)]">{perk.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Young builders */}
      <section id="young-builders" aria-labelledby="builders-title" className="scroll-mt-20 border-t border-[var(--ms-line)] bg-[#F5F7FC] py-14 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-sm font-semibold text-[var(--ms-blue)]">For students, self-taught developers and volunteers</p>
            <h2 id="builders-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-tight">
              You don’t need ten years of experience to build with us
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[var(--ms-muted)]">If you’re a young programmer, a university student or a volunteer who wants to write real production code for Kenyan merchants, we want to build with you.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDept('Young Builders & Volunteers');
                  document.getElementById('open-roles')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="ms-btn ms-btn-primary"
              >
                See fellowship and volunteer roles
              </button>
              <a href={`mailto:${CONTACT_EMAIL}?subject=Young%20Builder%20%2F%20Volunteer%20Inquiry%20-%20Kabuor%20Technologies`} className="ms-btn ms-btn-secondary">
                Email us your project
              </a>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {BUILDER_POINTS.map((p) => (
              <li key={p.title} className="rounded-lg border border-[var(--ms-line)] bg-white p-6">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--ms-muted)]">{p.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </CorporatePage>
  );
}
