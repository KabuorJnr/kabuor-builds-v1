import { useState, useEffect } from 'react';
import {
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Filter,
  Mail,
  MessageCircle,
  Search,
  Sliders,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import {
  getStoredRoles,
  toggleRoleStatus,
  getStoredApplications,
  updateApplicationReviewStatus,
} from './careersStore';

export default function CareersAdmin() {
  const [roles, setRoles] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' | 'applications'
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'open' | 'closed'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAppRef, setExpandedAppRef] = useState(null);

  const loadData = () => {
    setRoles(getStoredRoles());
    setApplications(getStoredApplications());
  };

  useEffect(() => {
    loadData();

    const handleRolesChange = () => setRoles(getStoredRoles());
    const handleAppsChange = () => setApplications(getStoredApplications());

    window.addEventListener('kb-roles-changed', handleRolesChange);
    window.addEventListener('kb-apps-changed', handleAppsChange);

    return () => {
      window.removeEventListener('kb-roles-changed', handleRolesChange);
      window.removeEventListener('kb-apps-changed', handleAppsChange);
    };
  }, []);

  const handleToggle = (roleId) => {
    const updated = toggleRoleStatus(roleId);
    setRoles(updated);
  };

  const handleUpdateReviewStatus = (trackingRef, status) => {
    const updated = updateApplicationReviewStatus(trackingRef, status);
    setApplications(updated);
  };

  const openCount = roles.filter((r) => r.status === 'open').length;
  const closedCount = roles.filter((r) => r.status === 'closed').length;
  const appsCount = applications.length;

  const filteredRoles = roles.filter((r) => {
    const matchesFilter =
      roleFilter === 'all' ||
      (roleFilter === 'open' && r.status === 'open') ||
      (roleFilter === 'closed' && r.status === 'closed');
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      r.title.toLowerCase().includes(query) ||
      r.department.toLowerCase().includes(query);
    return matchesFilter && matchesQuery;
  });

  const filteredApps = applications.filter((app) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      !query ||
      app.fullName?.toLowerCase().includes(query) ||
      app.roleTitle?.toLowerCase().includes(query) ||
      app.email?.toLowerCase().includes(query) ||
      app.trackingRef?.toLowerCase().includes(query)
    );
  });

  const formatWa = (phone) => {
    const clean = String(phone).replace(/\D/g, '').replace(/^(254|0)/, '');
    return `https://wa.me/254${clean}`;
  };

  return (
    <div className="rounded-[var(--r-xl)] bg-white p-6 ring-1 ring-espresso/[0.08] shadow-sm">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-espresso/10 pb-5">
        <div>
          <p className="kb-kicker text-caramel">Kabuor Technologies Talent Desk</p>
          <h2 className="kb-display text-2xl sm:text-3xl text-espresso mt-1">
            Careers & Job Openings Management
          </h2>
          <p className="mt-1 text-xs text-espresso/60">
            Control which jobs are open or closed on <code className="font-semibold text-espresso">/careers</code> and review candidate portfolios.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {openCount} Open Roles
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-espresso/5 px-3 py-1 text-xs font-semibold text-espresso/70 ring-1 ring-espresso/10">
            {closedCount} Closed
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EEFF] px-3 py-1 text-xs font-semibold text-[#2357F5] ring-1 ring-[#2357F5]/20">
            {appsCount} Applications
          </span>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-xl bg-beige p-1">
          <button
            onClick={() => setActiveTab('roles')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'roles' ? 'bg-espresso text-cream shadow-sm' : 'text-espresso/70 hover:text-espresso'
            }`}
          >
            Job Openings ({roles.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'applications' ? 'bg-espresso text-cream shadow-sm' : 'text-espresso/70 hover:text-espresso'
            }`}
          >
            Candidate Submissions ({appsCount})
            {appsCount > 0 && (
              <span className="rounded-full bg-[#F2C14E] px-1.5 py-0.2 text-[10px] font-bold text-espresso">
                {appsCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'roles' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-espresso/50">Status:</span>
            <div className="inline-flex rounded-lg bg-beige p-0.5 text-xs">
              <button
                onClick={() => setRoleFilter('all')}
                className={`rounded px-2.5 py-1 font-medium ${roleFilter === 'all' ? 'bg-white font-bold text-espresso shadow-xs' : 'text-espresso/60'}`}
              >
                All ({roles.length})
              </button>
              <button
                onClick={() => setRoleFilter('open')}
                className={`rounded px-2.5 py-1 font-medium ${roleFilter === 'open' ? 'bg-white font-bold text-emerald-700 shadow-xs' : 'text-espresso/60'}`}
              >
                Open ({openCount})
              </button>
              <button
                onClick={() => setRoleFilter('closed')}
                className={`rounded px-2.5 py-1 font-medium ${roleFilter === 'closed' ? 'bg-white font-bold text-red-700 shadow-xs' : 'text-espresso/60'}`}
              >
                Closed ({closedCount})
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-espresso/40" />
          <input
            type="text"
            placeholder={activeTab === 'roles' ? 'Filter positions...' : 'Search candidates...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-espresso/15 bg-white py-1.5 pl-8 pr-3 text-xs focus:border-[#2357F5] focus:outline-none"
          />
        </div>
      </div>

      {/* TAB 1: Roles List & Status Toggle */}
      {activeTab === 'roles' && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-espresso/10 bg-beige/50 text-espresso/60 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Position Title</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso/[0.06]">
              {filteredRoles.map((role) => {
                const isOpen = role.status === 'open';
                return (
                  <tr key={role.id} className="hover:bg-beige/20 transition">
                    <td className="py-3.5 px-3">
                      <b className="text-sm font-semibold text-espresso block">{role.title}</b>
                      <span className="text-[11px] text-espresso/50">{role.location}</span>
                    </td>
                    <td className="py-3.5 px-3 text-espresso/80">
                      <span className="rounded bg-espresso/5 px-2 py-0.5 text-[11px] font-medium">
                        {role.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-espresso/70">{role.type}</td>
                    <td className="py-3.5 px-3">
                      {isOpen ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Open
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-red-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {isOpen ? (
                        <button
                          onClick={() => handleToggle(role.id)}
                          className="btn bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1.5 text-xs font-semibold rounded-lg transition"
                          title="Click to close this role on the public careers page"
                        >
                          Mark as Closed
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggle(role.id)}
                          className="btn bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 text-xs font-semibold rounded-lg transition"
                          title="Click to re-open this role for applications"
                        >
                          Re-open Role
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!filteredRoles.length && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-espresso/50">
                    No roles match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Candidate Applications Inbox */}
      {activeTab === 'applications' && (
        <div className="mt-4 space-y-3">
          {filteredApps.map((app) => {
            const isExpanded = expandedAppRef === app.trackingRef;
            return (
              <div
                key={app.trackingRef}
                className="rounded-2xl border border-espresso/10 bg-[#FDFCF7] p-4 sm:p-5 transition hover:border-espresso/20"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <b className="text-base text-espresso">{app.fullName}</b>
                      <span className="rounded bg-[#E8EEFF] px-2 py-0.5 text-[11px] font-semibold text-[#2357F5]">
                        {app.roleTitle}
                      </span>
                      <span className="font-mono text-xs text-espresso/50">
                        {app.trackingRef}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-espresso/60">
                      <span>{app.email}</span>
                      <span>·</span>
                      <span>{app.phone}</span>
                      <span>·</span>
                      <span>{app.location || 'Kenya'}</span>
                      <span>·</span>
                      <span>Level: <b>{app.experienceTrack}</b></span>
                      <span>·</span>
                      <span>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Review Status Select */}
                    <select
                      value={app.reviewStatus || 'New'}
                      onChange={(e) => handleUpdateReviewStatus(app.trackingRef, e.target.value)}
                      className="rounded-lg border border-espresso/20 bg-white px-2.5 py-1 text-xs font-semibold text-espresso focus:outline-none"
                    >
                      <option value="New">Status: New</option>
                      <option value="Shortlisted">Status: Shortlisted</option>
                      <option value="Interviewing">Status: Interviewing</option>
                      <option value="Rejected">Status: Rejected</option>
                    </select>

                    {/* WhatsApp Action */}
                    {app.phone && (
                      <a
                        href={formatWa(app.phone)}
                        target="_blank"
                        rel="noreferrer"
                        className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    )}

                    {/* Email Action */}
                    {app.email && (
                      <a
                        href={`mailto:${app.email}?subject=Kabuor%20Technologies%20Application%20-%20${encodeURIComponent(app.roleTitle)}`}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-espresso text-white hover:bg-espresso/90"
                        title="Send Email"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}

                    {/* Expand/Collapse Toggle */}
                    <button
                      onClick={() => setExpandedAppRef(isExpanded ? null : app.trackingRef)}
                      className="flex items-center gap-1 rounded-lg border border-espresso/15 bg-white px-2.5 py-1 text-xs font-medium text-espresso/70 hover:text-espresso"
                    >
                      {isExpanded ? (
                        <>Hide Details <ChevronUp className="h-3.5 w-3.5" /></>
                      ) : (
                        <>View Full Application <ChevronDown className="h-3.5 w-3.5" /></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-5 border-t border-espresso/10 pt-4 space-y-4 text-xs">
                    {/* Portfolios and Links */}
                    <div className="rounded-xl bg-white p-4 border border-espresso/10">
                      <h4 className="font-semibold text-espresso mb-2">Proof of Work & Portfolio Links</h4>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {app.githubUrl && (
                          <a
                            href={app.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2 rounded bg-beige/50 hover:bg-beige text-[#2357F5] font-medium"
                          >
                            <span>GitHub: <code className="text-espresso">{app.githubUrl}</code></span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {app.liveProjectUrl1 && (
                          <a
                            href={app.liveProjectUrl1}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2 rounded bg-beige/50 hover:bg-beige text-[#2357F5] font-medium"
                          >
                            <span>Live Product #1: <code className="text-espresso">{app.liveProjectUrl1}</code></span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {app.liveProjectUrl2 && (
                          <a
                            href={app.liveProjectUrl2}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2 rounded bg-beige/50 hover:bg-beige text-[#2357F5] font-medium"
                          >
                            <span>Live Project #2: <code className="text-espresso">{app.liveProjectUrl2}</code></span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {app.cleanestCodeUrl && (
                          <a
                            href={app.cleanestCodeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2 rounded bg-beige/50 hover:bg-beige text-[#2357F5] font-medium"
                          >
                            <span>Cleanest Code / PR: <code className="text-espresso">{app.cleanestCodeUrl}</code></span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Answers to Intensive Questions */}
                    <div className="space-y-3">
                      <div className="rounded-xl bg-white p-4 border border-espresso/10">
                        <h4 className="font-bold text-espresso text-[13px]">
                          1. Hardest Engineering or Operational Problem Solved:
                        </h4>
                        <p className="mt-1.5 text-espresso/80 whitespace-pre-wrap leading-relaxed">
                          {app.hardestProblem || '—'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-4 border border-espresso/10">
                        <h4 className="font-bold text-espresso text-[13px]">
                          2. Why Kabuor Technologies & African Commerce:
                        </h4>
                        <p className="mt-1.5 text-espresso/80 whitespace-pre-wrap leading-relaxed">
                          {app.whyAfricaKabuor || '—'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-4 border border-espresso/10">
                        <h4 className="font-bold text-espresso text-[13px]">
                          3. Offline Resilience & Network Fault-Tolerance:
                        </h4>
                        <p className="mt-1.5 text-espresso/80 whitespace-pre-wrap leading-relaxed">
                          {app.offlineArchitecture || '—'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#F7F7FB] p-3 border border-[#E6E7F0] flex flex-wrap gap-4 text-espresso/70">
                        <span>Weekly Commitment: <b>{app.weeklyCommitment || 'Full time'}</b></span>
                        <span>Earliest Start Date: <b>{app.earliestStartDate || 'Immediate'}</b></span>
                        <span>Equity Acknowledgment: <b>Confirmed</b></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {!filteredApps.length && (
            <div className="rounded-2xl border border-dashed border-espresso/20 p-10 text-center text-espresso/50">
              <p className="text-sm">No candidate applications submitted yet.</p>
              <p className="mt-1 text-xs text-espresso/40">
                When candidates submit applications on the full careers page, they will appear right here with full portfolio links and answers.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
