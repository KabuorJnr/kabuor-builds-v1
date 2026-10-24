import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import { SiteHeader, SiteFooter } from './Site';
import { DEFAULT_ROLES, getStoredRoles } from './careersStore';
import CareersApplicationPage from './CareersApplicationPage';

export const ALL_ROLES = DEFAULT_ROLES;


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

export default function CareersPage({ info }) {
  const [roles, setRoles] = useState(getStoredRoles());
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRole, setExpandedRole] = useState(null);
  const [applyingRole, setApplyingRole] = useState(null);

  useEffect(() => {
    const handleRolesChange = () => setRoles(getStoredRoles());
    window.addEventListener('kb-roles-changed', handleRolesChange);
    return () => window.removeEventListener('kb-roles-changed', handleRolesChange);
  }, []);

  if (applyingRole) {
    return (
      <CareersApplicationPage
        role={applyingRole}
        onBack={() => {
          setApplyingRole(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        info={info}
      />
    );
  }

  const departments = ['All', 'Young Builders & Volunteers', 'Engineering', 'Leadership', 'Marketing & Growth', 'Sales & Commercial', 'Operations & Success', 'Finance, Legal & People'];

  const filteredRoles = roles.filter((role) => {
    const matchesDept = selectedDept === 'All' || role.department === selectedDept;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      role.title.toLowerCase().includes(query) ||
      role.tags.some((t) => t.toLowerCase().includes(query)) ||
      role.summary.toLowerCase().includes(query);
    return matchesDept && matchesSearch;
  });

  const handleApply = (role) => {
    setApplyingRole(role);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="min-h-screen bg-[#FDFCF7] text-espresso selection:bg-[#2357F5] selection:text-white">
      <div className="kb-ink relative overflow-hidden">
        <SiteHeader info={info} cta={{ to: '/#contact', label: 'Contact Team' }} />
      </div>

      {/* Hero Header */}
      <section className="kb-ink relative overflow-hidden py-16 sm:py-24 text-cream">
        <div className="container-x relative text-center">
          <p className="kb-kicker text-[#9DB6FF]">
            Kabuor Technologies · Ngong Road, Nairobi · 100% Fully Remote
          </p>

          <h1 className="kb-display mt-4 max-w-4xl mx-auto text-[2.75rem] sm:text-[4.75rem] leading-[0.95]">
            Build the Financial Operating System for <span className="text-[#F2C14E]">African Commerce.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-cream/75 leading-relaxed sm:text-xl">
            Over 1.5 million Kenyan merchants power East Africa on M-Pesa, paper dockets, and sheer resilience. We are engineering the automated platform that handles instant KRA eTIMS, offline retail point-of-sale, and real-time cashflow reconciliation at a scale of 500,000 transactions a day.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="#open-roles" className="btn bg-[#2357F5] text-white hover:bg-[#3A6BFF] py-3.5 px-7 text-sm font-semibold shadow-lg shadow-[#2357F5]/25">
              Explore Open Roles ({ALL_ROLES.length})
            </a>
            <a href="#young-builders" className="btn bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30 hover:bg-emerald-500/30 py-3.5 px-6 text-sm font-semibold">
              Young Builders & Volunteers
            </a>
            <a href="#why-kabuor" className="btn bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20 py-3.5 px-6 text-sm font-semibold">
              Why Join Us
            </a>
          </div>

          {/* Scale Proof Metrics */}
          <div className="mt-16 grid grid-cols-2 gap-4 border-t border-white/10 pt-12 sm:grid-cols-4 text-left">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="kb-display text-3xl text-[#F2C14E]">500,000+</p>
              <p className="mt-1 text-xs text-cream/60">Load-tested daily transactions</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="kb-display text-3xl text-emerald-400">100%</p>
              <p className="mt-1 text-xs text-cream/60">Offline-first PWA resilience</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="kb-display text-3xl text-[#9DB6FF]">0 Seconds</p>
              <p className="mt-1 text-xs text-cream/60">eTIMS & M-Pesa auto-reconcile</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="kb-display text-3xl text-white">100% ESOP</p>
              <p className="mt-1 text-xs text-cream/60">Equity for all full-time hires</p>
            </div>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section id="why-kabuor" className="scroll-mt-6 py-16 sm:py-24 border-b border-espresso/10 bg-white">
        <div className="container-x">
          <div className="max-w-2xl">
            <p className="kb-kicker text-caramel">Company Culture & Principles</p>
            <h2 className="kb-display mt-3 text-3xl sm:text-5xl text-espresso">
              We build for the real trenches of commerce.
            </h2>
            <p className="mt-3 text-base text-espresso/70 leading-relaxed">
              Our software doesn't run in air-conditioned ivory towers. It powers wholesale warehouses in Industrial Area, retail storefronts in Eastleigh and Gikomba, and distributor fleets across Kenya.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-espresso/10 bg-[#FDFCF7] p-6">
              <h3 className="kb-display text-xl text-espresso">Zero Tolerance for Slowness</h3>
              <p className="mt-2 text-sm text-espresso/75 leading-relaxed">
                When a cashier in a supermarket has 15 customers queuing with groceries, every millisecond matters. We optimize down to zero-allocation memory pools in C# and client-side caching.
              </p>
            </div>

            <div className="rounded-2xl border border-espresso/10 bg-[#FDFCF7] p-6">
              <h3 className="kb-display text-xl text-espresso">Massive Economic Impact</h3>
              <p className="mt-2 text-sm text-espresso/75 leading-relaxed">
                MSMEs contribute over 40% of Kenya’s GDP. Giving them automated financial controls and instant tax compliance fundamentally protects their business livelihoods.
              </p>
            </div>

            <div className="rounded-2xl border border-espresso/10 bg-[#FDFCF7] p-6">
              <h3 className="kb-display text-xl text-espresso">Extreme Ownership & Equity</h3>
              <p className="mt-2 text-sm text-espresso/75 leading-relaxed">
                You won't be a cog in an 8-layer approval chain. You will own complete functional domains, deploy weekly, and share directly in company ownership through our formal ESOP equity program.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards / Perks */}
      <section className="scroll-mt-6 py-16 sm:py-24 bg-[#F7F7FB] border-b border-espresso/10">
        <div className="container-x">
          <div className="max-w-3xl">
            <p className="kb-kicker text-caramel">Pre-Funding Commitment & Rewards</p>
            <h2 className="kb-display mt-3 text-3xl sm:text-5xl text-espresso">
              Equity today, market compensation upon funding.
            </h2>
            <p className="mt-3 text-base text-espresso/70 leading-relaxed">
              We are transparent with our team: we are currently bootstrapping and pre-funding. We offer generous founding ESOP equity for builders and volunteers joining now, with pre-agreed competitive cash salaries activating immediately upon closing our funding round.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map((perk) => (
              <div key={perk.title} className="rounded-2xl border border-espresso/10 bg-white p-6 flex flex-col justify-between">
                <div>
                  <h3 className="kb-display text-lg text-espresso">{perk.title}</h3>
                  <p className="mt-2 text-sm text-espresso/70 leading-relaxed">{perk.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Young Builders & Volunteers Fellowship Callout */}
      <section id="young-builders" className="scroll-mt-6 kb-ink relative overflow-hidden py-16 sm:py-24 text-cream">
        <div className="container-x relative">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:p-12 lg:p-16">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="kb-kicker text-[#F2C14E]">For Students, Self-Taught Hackers & Volunteers</p>
                <h2 className="kb-display mt-3 text-3xl sm:text-5xl text-white">
                  You don’t need 10 years of experience to <span className="text-[#F2C14E]">build Africa’s future.</span>
                </h2>
                <p className="mt-4 text-base text-cream/75 leading-relaxed sm:text-lg">
                  We are deeply committed to mentoring the next generation of African builders. If you are a young programmer, university student, or volunteer hungry to write real production code that solves real problems for Kenyan merchants, we want to build with you.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setSelectedDept('Young Builders & Volunteers');
                      document.getElementById('open-roles')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn bg-[#2357F5] text-white hover:bg-[#3A6BFF] px-6 py-3.5 text-sm font-semibold shadow-lg shadow-[#2357F5]/30"
                  >
                    View Young Builder & Volunteer Tracks
                  </button>
                  <a
                    href="mailto:careers@kabuor.com?subject=Young%20Builder%20%2F%20Volunteer%20Inquiry%20-%20Kabuor%20Technologies"
                    className="btn bg-white/10 text-white hover:bg-white/20 px-6 py-3.5 text-sm font-semibold ring-1 ring-white/15"
                  >
                    Pitch Your Project / Volunteer Directly
                  </a>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="kb-display text-lg text-white">Real Production Code</h3>
                  <p className="mt-2 text-xs text-cream/70 leading-relaxed">
                    No coffee runs or toy apps. You will build high-throughput C# backends, offline React PWAs, and local payment rails from day one.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="kb-display text-lg text-white">Direct Mentorship</h3>
                  <p className="mt-2 text-xs text-cream/70 leading-relaxed">
                    Pair directly with core architects and founders who have scaled financial systems and high-growth African startups.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="kb-display text-lg text-white">No Degree Barrier</h3>
                  <p className="mt-2 text-xs text-cream/70 leading-relaxed">
                    We care about your passion, curiosity, and speed of learning. Self-taught tinkerers and student developers are warmly welcome.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="kb-display text-lg text-white">Full-Time Pathway</h3>
                  <p className="mt-2 text-xs text-cream/70 leading-relaxed">
                    Top-performing fellows and open contributors graduate into full-time engineering and product positions with equity ownership.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Roles Directory */}
      <section id="open-roles" className="scroll-mt-6 py-16 sm:py-24 bg-white">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-espresso/10">
            <div>
              <p className="kb-kicker text-caramel">Open Opportunities Across Company</p>
              <h2 className="kb-display mt-3 text-3xl sm:text-5xl text-espresso">
                Open Positions ({filteredRoles.length})
              </h2>
              <p className="mt-1 text-sm text-espresso/70">
                Explore open roles and volunteer tracks. All founding positions include generous ESOP equity with pre-agreed market salaries upon funding.
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8A8DB0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roles or skills..."
                className="w-full rounded-md border border-[#E6E7F0] bg-white px-3 py-2 pl-9 text-sm focus:border-[#2357F5] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition border ${
                  selectedDept === dept
                    ? 'bg-[#0A0B1E] text-white border-[#0A0B1E] shadow-sm'
                    : 'bg-[#F7F7FB] text-[#3B3F5C] border-[#E6E7F0] hover:bg-white'
                }`}
              >
                {dept}
                {dept === 'All' ? ` (${ALL_ROLES.length})` : ` (${ALL_ROLES.filter((r) => r.department === dept).length})`}
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {filteredRoles.map((role) => {
              const isExpanded = expandedRole === role.id;
              return (
                <div
                  key={role.id}
                  className={`rounded-xl border transition overflow-hidden ${
                    isExpanded ? 'border-[#2357F5] ring-1 ring-[#2357F5]' : 'border-[#E6E7F0] hover:border-[#8A8DB0]'
                  }`}
                >
                  <div className="p-6 cursor-pointer bg-white" onClick={() => setExpandedRole(isExpanded ? null : role.id)}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="rounded bg-[#E8EEFF] px-2 py-0.5 text-xs font-semibold text-[#2357F5]">
                            {role.department}
                          </span>
                          <span className="rounded bg-[#F7F7FB] px-2 py-0.5 text-xs font-medium text-[#3B3F5C] border border-[#E6E7F0]">
                            {role.type}
                          </span>
                          {role.status === 'closed' ? (
                            <span className="rounded-full bg-red-100 text-red-800 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border border-red-200">
                              Applications Closed
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[11px] font-semibold border border-emerald-200">
                              Open
                            </span>
                          )}
                          <span className="text-xs text-espresso/60">
                            {role.location}
                          </span>
                        </div>
                        <h3 className="kb-display text-xl text-espresso hover:text-[#2357F5] transition">
                          {role.title}
                        </h3>
                        <p className="mt-2 text-sm text-espresso/70 line-clamp-2 leading-relaxed">
                          {role.summary}
                        </p>
                      </div>

                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E6E7F0]">
                        <div className="text-left lg:text-right">
                          <p className="text-xs font-semibold text-espresso/80">
                            Founding Equity (ESOP) · Salaried Post-Funding
                          </p>
                          <p className="mt-1 text-xs font-semibold text-emerald-600">{role.equity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {role.status === 'closed' ? (
                            <span className="rounded-lg bg-red-50 text-red-700 border border-red-200 py-1.5 px-3 text-xs font-semibold">
                              Closed
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApply(role);
                              }}
                              className="btn bg-[#2357F5] text-white hover:bg-[#3A6BFF] py-2 px-4 text-xs font-semibold"
                            >
                              Apply Now
                            </button>
                          )}
                          <button
                            type="button"
                            aria-label="Toggle details"
                            className="grid h-8 w-8 place-items-center rounded-md bg-[#F7F7FB] text-[#585C80] border border-[#E6E7F0]"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {role.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-[#F7F7FB] px-2.5 py-0.5 text-xs text-[#3B3F5C] font-medium border border-[#E6E7F0]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-[#E6E7F0] bg-[#FAF9F5] p-6 sm:p-8 space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">The Mission</h4>
                        <p className="mt-2 text-sm text-[#3B3F5C] leading-relaxed">{role.summary}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">Key Responsibilities</h4>
                        <ul className="mt-3 space-y-2">
                          {role.responsibilities.map((resp, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-[#3B3F5C] leading-relaxed">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#2357F5] shrink-0" />
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg bg-[#E8EEFF]/60 p-4 border border-[#2357F5]/20">
                        <div className="text-xs sm:text-sm text-[#1E1B18] leading-relaxed">
                          <span className="font-bold text-[#2357F5]">Pre-Funding Founding Track:</span> All positions operate on generous founding ESOP equity grants until our funding round closes, with pre-agreed market salaries activating upon funding. {role.benefitsNote}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-[#585C80]">
                          Role ID: <code className="text-[#1E1B18] font-semibold">{role.id}</code>
                        </p>
                        {role.status === 'closed' ? (
                          <span className="rounded-lg bg-red-50 text-red-700 border border-red-200 py-2 px-4 text-xs font-semibold">
                            Applications Closed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApply(role)}
                            className="btn bg-[#2357F5] text-white hover:bg-[#3A6BFF] py-2.5 px-6 text-sm font-semibold shadow-md"
                          >
                            Apply for {role.title}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <SiteFooter info={info} />
    </div>
  );
}
