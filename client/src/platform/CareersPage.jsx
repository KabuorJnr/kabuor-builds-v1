import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { SiteHeader, SiteFooter } from './Site';
import { DEFAULT_ROLES, fetchRoleStatuses, payLine, withStatus } from './careersStore';
import CareersApplicationPage from './CareersApplicationPage';

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
      className={`scroll-mt-6 overflow-hidden rounded-2xl border bg-white transition ${
        expanded ? 'border-[#2357F5] ring-1 ring-[#2357F5]' : 'border-[#E6E7F0] hover:border-[#B9BBD3]'
      }`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-[#2357F5]">
              {role.department}
              {closed && (
                <span className="rounded-full bg-espresso/[0.06] px-2.5 py-0.5 text-xs font-semibold text-espresso/70">Applications closed</span>
              )}
            </p>
            <h3 className="kb-display mt-1.5 text-2xl leading-[1.05] text-espresso">
              <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={detailsId} className="text-left hover:text-[#2357F5]">
                {role.title}
              </button>
            </h3>
            <p className="mt-2 text-sm text-espresso/65">
              {role.type} · {role.experience} · {role.location}
            </p>
          </div>
          <div className="shrink-0 sm:max-w-[19rem] sm:text-right">
            <p className="text-[15px] font-semibold text-emerald-700">{role.equity}</p>
            <p className="mt-0.5 text-sm text-espresso/60">{payLine(role)}</p>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-espresso/75">{role.summary}</p>

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Skills">
          {role.tags.map((tag) => (
            <li key={tag} className="rounded-full border border-[#E6E7F0] bg-[#F7F7FB] px-2.5 py-1 text-[13px] font-medium text-[#3B3F5C]">
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {!closed && (
            <button type="button" onClick={onApply} className="btn bg-[#2357F5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3A6BFF]">
              Apply
            </button>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className="btn border border-[#E6E7F0] bg-white px-5 py-2.5 text-sm font-semibold text-espresso hover:border-[#B9BBD3]"
          >
            {expanded ? 'Hide details' : 'Responsibilities & requirements'}
          </button>
        </div>
      </div>

      {expanded && (
        <div id={detailsId} className="grid gap-8 border-t border-[#E6E7F0] bg-[#FAF9F5] p-5 sm:p-6 md:grid-cols-2">
          <section>
            <h4 className="text-[13px] font-bold tracking-[0.12em] text-espresso/60 uppercase">What you’ll do</h4>
            <ul className="mt-3 space-y-2.5">
              {role.responsibilities.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-[#3B3F5C]">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2357F5]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h4 className="text-[13px] font-bold tracking-[0.12em] text-espresso/60 uppercase">What we’re looking for</h4>
            <ul className="mt-3 space-y-2.5">
              {role.requirements.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-[#3B3F5C]">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2357F5]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#2357F5]/20 bg-[#E8EEFF]/60 p-5 md:col-span-2">
            <h4 className="text-[13px] font-bold tracking-[0.12em] text-[#2357F5] uppercase">What you get</h4>
            <p className="mt-2 text-[15px] leading-relaxed text-[#1E1B18]">{role.benefitsNote}</p>
            <p className="mt-2 text-sm leading-relaxed text-espresso/65">{role.compensationNote}</p>
          </section>

          <div className="flex flex-wrap items-center gap-2.5 md:col-span-2">
            {closed ? (
              <p className="text-[15px] text-espresso/70">This role isn’t taking applications right now.</p>
            ) : (
              <button type="button" onClick={onApply} className="btn bg-[#2357F5] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#3A6BFF]">
                Apply for this role
              </button>
            )}
            <button type="button" onClick={copyLink} className="btn px-4 py-3 text-sm font-semibold text-[#2357F5] hover:bg-[#E8EEFF]">
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
    <div className="min-h-screen bg-[#FDFCF7] text-espresso selection:bg-[#2357F5] selection:text-white">
      <div className="kb-ink relative overflow-hidden">
        <SiteHeader info={info} cta={{ to: '/#contact', label: 'Contact Team' }} />
      </div>

      {/* Hero Header */}
      <section className="kb-ink relative overflow-hidden py-16 text-cream sm:py-24">
        <div className="container-x relative text-center">
          <p className="kb-kicker text-[#9DB6FF]">Kabuor Technologies · Ngong Road, Nairobi · 100% Fully Remote</p>

          <h1 className="kb-display mx-auto mt-4 max-w-4xl text-[2.75rem] leading-[0.95] sm:text-[4.75rem]">
            Build the Financial Operating System for <span className="text-[#F2C14E]">African Commerce.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-cream/75 sm:text-xl">
            Over 1.5 million Kenyan merchants power East Africa on M-Pesa, paper dockets, and sheer resilience. We are engineering the automated platform that handles instant KRA eTIMS, offline retail point-of-sale, and real-time cashflow reconciliation at a scale of 500,000 transactions a day.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a href="#open-roles" className="btn bg-[#2357F5] px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-[#2357F5]/25 hover:bg-[#3A6BFF]">
              See {openRoles.length} open roles
            </a>
            <a href="#young-builders" className="btn bg-emerald-500/20 px-6 py-3.5 text-[15px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30 hover:bg-emerald-500/30">
              Young Builders & Volunteers
            </a>
            <a href="#why-kabuor" className="btn bg-white/10 px-6 py-3.5 text-[15px] font-semibold text-white ring-1 ring-white/20 hover:bg-white/20">
              Why Join Us
            </a>
          </div>

          {/* Scale Proof Metrics */}
          <dl className="mt-16 grid grid-cols-2 gap-3 border-t border-white/10 pt-12 text-left sm:grid-cols-4 sm:gap-4">
            {[
              ['500,000+', 'Load-tested daily transactions', 'text-[#F2C14E]'],
              ['100%', 'Offline-first PWA resilience', 'text-emerald-400'],
              ['0 Seconds', 'eTIMS & M-Pesa auto-reconcile', 'text-[#9DB6FF]'],
              ['100% ESOP', 'Equity for all full-time hires', 'text-white'],
            ].map(([value, label, tone]) => (
              <div key={label} className="flex flex-col-reverse rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <dt className="mt-1 text-sm text-cream/65">{label}</dt>
                <dd className={`kb-display text-3xl ${tone}`}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Culture Section */}
      <section id="why-kabuor" className="scroll-mt-6 border-b border-espresso/10 bg-white py-16 sm:py-24">
        <div className="container-x">
          <div className="max-w-2xl">
            <p className="kb-kicker text-caramel">Company Culture & Principles</p>
            <h2 className="kb-display mt-3 text-3xl text-espresso sm:text-5xl">We build for the real trenches of commerce.</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-espresso/70">
              Our software doesn't run in air-conditioned ivory towers. It powers wholesale warehouses in Industrial Area, retail storefronts in Eastleigh and Gikomba, and distributor fleets across Kenya.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-2xl border border-espresso/10 bg-[#FDFCF7] p-6">
                <h3 className="kb-display text-xl text-espresso">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-espresso/75">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards / Perks */}
      <section className="scroll-mt-6 border-b border-espresso/10 bg-[#F7F7FB] py-16 sm:py-24">
        <div className="container-x">
          <div className="max-w-3xl">
            <p className="kb-kicker text-caramel">Pre-Funding Commitment & Rewards</p>
            <h2 className="kb-display mt-3 text-3xl text-espresso sm:text-5xl">Equity today, market compensation upon funding.</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-espresso/70">
              We are transparent with our team: we are currently bootstrapping and pre-funding. We offer generous founding ESOP equity for builders and volunteers joining now, with pre-agreed competitive cash salaries activating immediately upon closing our funding round.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {PERKS.map((perk) => (
              <div key={perk.title} className="rounded-2xl border border-espresso/10 bg-white p-6">
                <h3 className="kb-display text-xl text-espresso">{perk.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-espresso/70">{perk.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Young Builders & Volunteers Fellowship Callout */}
      <section id="young-builders" className="kb-ink relative scroll-mt-6 overflow-hidden py-16 text-cream sm:py-24">
        <div className="container-x relative">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-12 lg:p-16">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="kb-kicker text-[#F2C14E]">For Students, Self-Taught Hackers & Volunteers</p>
                <h2 className="kb-display mt-3 text-3xl text-white sm:text-5xl">
                  You don’t need 10 years of experience to <span className="text-[#F2C14E]">build Africa’s future.</span>
                </h2>
                <p className="mt-4 text-[17px] leading-relaxed text-cream/75 sm:text-lg">
                  We are deeply committed to mentoring the next generation of African builders. If you are a young programmer, university student, or volunteer hungry to write real production code that solves real problems for Kenyan merchants, we want to build with you.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDept('Young Builders & Volunteers');
                      document.getElementById('open-roles')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn bg-[#2357F5] px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-[#2357F5]/30 hover:bg-[#3A6BFF]"
                  >
                    See fellowship & volunteer roles
                  </button>
                  <a
                    href="mailto:careers@kabuor.com?subject=Young%20Builder%20%2F%20Volunteer%20Inquiry%20-%20Kabuor%20Technologies"
                    className="btn bg-white/10 px-6 py-3.5 text-[15px] font-semibold text-white ring-1 ring-white/15 hover:bg-white/20"
                  >
                    Email us your project
                  </a>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {BUILDER_POINTS.map((p) => (
                  <div key={p.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <h3 className="kb-display text-lg text-white">{p.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-cream/70">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Roles Directory */}
      <section id="open-roles" className="scroll-mt-6 bg-white py-16 sm:py-24">
        <div className="container-x">
          <div className="flex flex-col gap-6 border-b border-espresso/10 pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="kb-kicker text-caramel">Open Opportunities Across Company</p>
              <h2 className="kb-display mt-3 text-3xl text-espresso sm:text-5xl">Open positions</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-espresso/70">
                {openRoles.length} of {roles.length} roles are taking applications. Founding roles are paid in ESOP equity now, with pre-agreed salaries from our funding round.
              </p>
            </div>

            <label className="relative block w-full md:w-80">
              <span className="sr-only">Search roles</span>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8A8DB0]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roles, skills or teams"
                className="w-full rounded-xl border border-[#E6E7F0] bg-white py-3 pr-3 pl-10 text-[15px] focus:border-[#2357F5] focus:ring-2 focus:ring-[#2357F5]/20 focus:outline-none"
              />
            </label>
          </div>

          {/* One swipeable row on phones (eight teams would fill the screen), wrapped from sm up. */}
          <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by team">
            {['All', ...departments].map((dept) => {
              const count = dept === 'All' ? searched.length : searched.filter((r) => r.department === dept).length;
              const active = selectedDept === dept;
              return (
                <button
                  key={dept}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedDept(dept)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                    active ? 'border-[#0A0B1E] bg-[#0A0B1E] text-white' : 'border-[#E6E7F0] bg-[#F7F7FB] text-[#3B3F5C] hover:bg-white'
                  } ${!count && !active ? 'opacity-50' : ''}`}
                >
                  {dept === 'All' ? 'All teams' : dept}
                  <span className={`tabular-nums ${active ? 'text-white/60' : 'text-[#8A8DB0]'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-sm text-espresso/60" aria-live="polite">
            {filtered ? `Showing ${filteredRoles.length} of ${roles.length} roles` : `${roles.length} roles`}
            {query && <> matching “{searchQuery.trim()}”</>}
            {selectedDept !== 'All' && <> in {selectedDept}</>}
            {filtered && (
              <button type="button" onClick={clearFilters} className="ml-2 font-semibold text-[#2357F5] hover:underline">
                Clear filters
              </button>
            )}
          </p>

          <div className="mt-4 space-y-4">
            {filteredRoles.map((role) => (
              <RoleCard key={role.id} role={role} expanded={expandedRole === role.id} onToggle={() => toggle(role)} onApply={() => handleApply(role)} />
            ))}

            {!filteredRoles.length && (
              <div className="rounded-2xl border border-dashed border-espresso/20 px-6 py-12 text-center">
                <p className="kb-display text-2xl text-espresso">No roles match {query ? `“${searchQuery.trim()}”` : 'this team'}</p>
                <p className="mx-auto mt-2 max-w-md text-[15px] text-espresso/65">
                  Try a broader skill such as “React”, “sales” or “finance”, or see every team. Not seeing your fit? Tell us what you’d build.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={clearFilters} className="btn bg-[#2357F5] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3A6BFF]">
                    Show all {roles.length} roles
                  </button>
                  <a href="mailto:careers@kabuor.com?subject=Open%20application%20-%20Kabuor%20Technologies" className="btn border border-espresso/15 bg-white px-6 py-3 text-sm font-semibold text-espresso hover:border-espresso/30">
                    Email an open application
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter info={info} />
    </div>
  );
}
