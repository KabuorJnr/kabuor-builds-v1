import { useState, useId } from 'react';
import { ArrowLeft, Check, CheckCircle2, Copy, ExternalLink, Globe, Sparkles } from 'lucide-react';
import { SiteHeader, SiteFooter } from './Site';
import { saveApplication } from './careersStore';

export default function CareersApplicationPage({ role, onBack, info }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: 'Nairobi, Kenya',
    experienceTrack: 'Young Builder / Student',
    // Portfolio
    githubUrl: '',
    liveProjectUrl1: '',
    liveProjectUrl2: '',
    cleanestCodeUrl: '',
    portfolioUrl: '',
    // Intensive questions
    hardestProblem: '',
    whyAfricaKabuor: '',
    offlineArchitecture: '',
    // Availability & Equity
    weeklyCommitment: '40+ hours/week (Full focus)',
    earliestStartDate: 'Immediately / Within 2 weeks',
    equityAcknowledgment: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const locationId = useId();
  const trackId = useId();
  const githubId = useId();
  const live1Id = useId();
  const live2Id = useId();
  const codeId = useId();
  const portfolioId = useId();
  const hardestProbId = useId();
  const whyAfricaId = useId();
  const offlineArchId = useId();
  const commitId = useId();
  const startId = useId();
  const equityId = useId();

  const isClosed = role?.status === 'closed';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.equityAcknowledgment) {
      alert('Please confirm the pre-funding founding equity / volunteer alignment checkbox.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const result = saveApplication({
        roleId: role.id,
        roleTitle: role.title,
        department: role.department,
        ...formData,
      });
      setSubmitting(false);
      setSubmissionResult(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  const copyRef = () => {
    if (submissionResult?.trackingRef) {
      navigator.clipboard.writeText(submissionResult.trackingRef);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-espresso selection:bg-[#2357F5] selection:text-white">
      <div className="kb-ink relative overflow-hidden">
        <SiteHeader info={info} cta={{ to: '/#contact', label: 'Contact Team' }} />
      </div>

      <div className="container-x max-w-4xl py-10 sm:py-16">
        {/* Breadcrumb Navigation */}
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-espresso/60 hover:text-espresso transition mb-8"
        >
          <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
          Back to all open positions
        </button>

        {isClosed ? (
          <div className="rounded-3xl border border-red-200 bg-red-50/50 p-8 sm:p-12 text-center">
            <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 uppercase tracking-wide">
              Applications Closed
            </span>
            <h1 className="kb-display mt-4 text-3xl sm:text-4xl text-espresso">
              {role.title} is currently closed.
            </h1>
            <p className="mt-3 text-sm text-espresso/70 max-w-xl mx-auto leading-relaxed">
              We have currently filled or paused applications for this position. However, we continuously review exceptional young builders, open-source volunteers, and engineering fellows.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={onBack}
                className="btn bg-[#2357F5] text-white hover:bg-[#3A6BFF] px-6 py-3 text-sm font-semibold shadow-md"
              >
                View Available Open Roles
              </button>
              <a
                href="mailto:careers@kabuor.com?subject=Volunteer%20%2F%20Young%20Builder%20Pitch"
                className="btn bg-white text-espresso border border-espresso/15 hover:bg-beige px-6 py-3 text-sm font-semibold"
              >
                Pitch a Custom Project
              </a>
            </div>
          </div>
        ) : submissionResult ? (
          /* Submission Success View */
          <div className="rounded-3xl border border-emerald-500/20 bg-white p-8 sm:p-14 shadow-xl">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-2xl">
              ✓
            </div>
            <div className="text-center mt-6">
              <span className="rounded bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                Application Received & Logged
              </span>
              <h1 className="kb-display mt-4 text-3xl sm:text-4xl text-espresso">
                Application Submitted!
              </h1>
              <p className="mt-3 text-base text-espresso/70 max-w-lg mx-auto">
                Thank you, <b className="text-espresso">{formData.fullName}</b>. Your application and portfolio for <b className="text-espresso">{role.title}</b> have been submitted directly to our engineering founders and talent desk.
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-[#F7F7FB] border border-[#E6E7F0] p-6 max-w-xl mx-auto space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-[#E6E7F0] pb-3">
                <span className="text-espresso/60 font-medium">Tracking Reference:</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-bold text-[#2357F5] text-base">
                    {submissionResult.trackingRef}
                  </code>
                  <button
                    onClick={copyRef}
                    title="Copy tracking ref"
                    className="grid h-7 w-7 place-items-center rounded bg-white border border-[#E6E7F0] text-espresso/70 hover:text-espresso"
                  >
                    {copiedRef ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-espresso/60">Position:</span>
                <span className="font-semibold text-espresso">{role.title}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-espresso/60">Candidate Email:</span>
                <span className="font-semibold text-espresso">{formData.email}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-espresso/60">Phone / WhatsApp:</span>
                <span className="font-semibold text-espresso">{formData.phone}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-espresso/60">Review Window:</span>
                <span className="font-semibold text-emerald-700">3 – 5 Business Days</span>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-[#FFF7EC] border border-[#F2C14E]/30 p-6 max-w-xl mx-auto text-left">
              <h3 className="kb-display text-base text-[#1E1B18]">What Happens Next:</h3>
              <ul className="mt-2 text-xs sm:text-sm text-espresso/80 space-y-2 list-disc list-inside">
                <li>Our core architects review your GitHub repos, live production links, and technical answers.</li>
                <li>Shortlisted builders receive a direct WhatsApp / Email invite for a technical deep-dive pairing session.</li>
                <li>You can follow up with your tracking ref at <a href="mailto:careers@kabuor.com" className="font-semibold text-[#2357F5] underline">careers@kabuor.com</a> anytime.</li>
              </ul>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button
                onClick={onBack}
                className="btn bg-[#2357F5] text-white hover:bg-[#3A6BFF] px-8 py-3.5 text-sm font-semibold shadow-lg shadow-[#2357F5]/25"
              >
                Return to Careers Overview
              </button>
            </div>
          </div>
        ) : (
          /* Full Application Form */
          <div className="rounded-3xl border border-espresso/10 bg-white p-6 sm:p-12 shadow-sm">
            {/* Header info */}
            <div className="border-b border-espresso/10 pb-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-[#E8EEFF] px-3 py-1 text-xs font-semibold text-[#2357F5]">
                  {role.department}
                </span>
                <span className="rounded bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  Status: Open & Accepting Applications
                </span>
              </div>
              <h1 className="kb-display mt-3 text-3xl sm:text-5xl text-espresso">
                Apply for {role.title}
              </h1>
              <p className="mt-2 text-sm text-espresso/65 leading-relaxed">
                {role.location} · {role.type} · <span className="font-semibold text-espresso">{role.compensationNote}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-10">
              {/* SECTION 1: Personal & Contact Information */}
              <div>
                <p className="kb-kicker text-caramel">Step 1 of 3</p>
                <h2 className="kb-display mt-1 text-2xl text-espresso">Candidate Profile & Contact</h2>
                <p className="mt-1 text-xs text-espresso/60">We use these details for interview scheduling and technical pairing invites.</p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor={nameId} className="block text-xs font-semibold text-espresso mb-1">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={nameId}
                      required
                      type="text"
                      className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-2.5 text-sm focus:border-[#2357F5] focus:ring-2 focus:ring-[#2357F5]/20 focus:outline-none"
                      placeholder="e.g. Dennis Oduor or Faith Wanjiku"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor={emailId} className="block text-xs font-semibold text-espresso mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={emailId}
                      required
                      type="email"
                      className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-2.5 text-sm focus:border-[#2357F5] focus:ring-2 focus:ring-[#2357F5]/20 focus:outline-none"
                      placeholder="you@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor={phoneId} className="block text-xs font-semibold text-espresso mb-1">
                      Phone / WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={phoneId}
                      required
                      type="tel"
                      className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-2.5 text-sm focus:border-[#2357F5] focus:ring-2 focus:ring-[#2357F5]/20 focus:outline-none"
                      placeholder="e.g. 0712 345 678 or +254 712 345 678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor={locationId} className="block text-xs font-semibold text-espresso mb-1">
                      Current City & Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={locationId}
                      required
                      type="text"
                      className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-2.5 text-sm focus:border-[#2357F5] focus:ring-2 focus:ring-[#2357F5]/20 focus:outline-none"
                      placeholder="e.g. Nairobi, Kenya or Kisumu, Kenya"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor={trackId} className="block text-xs font-semibold text-espresso mb-1">
                      Your Builder Level / Background <span className="text-red-500">*</span>
                    </label>
                    <select
                      id={trackId}
                      className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-2.5 text-sm focus:border-[#2357F5] focus:ring-2 focus:ring-[#2357F5]/20 focus:outline-none"
                      value={formData.experienceTrack}
                      onChange={(e) => setFormData({ ...formData, experienceTrack: e.target.value })}
                    >
                      <option value="Young Builder / Student">Young Builder / University Student / Self-Taught</option>
                      <option value="Open Source Volunteer">Open-Source Contributor / Software Volunteer</option>
                      <option value="1 - 2 years">1 – 2 years (Early Career)</option>
                      <option value="3 - 5 years">3 – 5 years (Mid-Level Engineer)</option>
                      <option value="6 - 9 years">6 – 9 years (Senior / Staff)</option>
                      <option value="10+ years">10+ years (Principal / Architect / Executive)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Proof of Work & Portfolio Submissions */}
              <div className="border-t border-espresso/10 pt-8">
                <p className="kb-kicker text-caramel">Step 2 of 3</p>
                <h2 className="kb-display mt-1 text-2xl text-espresso">Portfolio & Proof of Work Submissions</h2>
                <p className="mt-1 text-xs text-espresso/60">
                  We value what you have built and deployed over university certificates. Show us real code and live applications.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label htmlFor={githubId} className="block text-xs font-semibold text-espresso mb-1">
                      GitHub or GitLab Profile URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={githubId}
                      required
                      type="url"
                      className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-2.5 text-sm focus:border-[#2357F5] focus:ring-2 focus:ring-[#2357F5]/20 focus:outline-none"
                      placeholder="https://github.com/your-username"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor={live1Id} className="block text-xs font-semibold text-espresso mb-1">
                        Live Project / Production App URL #1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={live1Id}
                        required
                        type="url"
                        className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-2.5 text-sm focus:border-[#2357F5] focus:ring-2 focus:ring-[#2357F5]/20 focus:outline-none"
                        placeholder="https://myapp.vercel.app or https://myproject.ke"
                        value={formData.liveProjectUrl1}
                        onChange={(e) => setFormData({ ...formData, liveProjectUrl1: e.target.value })}
                      />
                      <p className="mt-1 text-[11px] text-espresso/50">A live working application that anyone can open in a browser.</p>
                    </div>

                    <div>
                      <label htmlFor={live2Id} className="block text-xs font-semibold text-espresso mb-1">
                        Live Project #2, Demo Video, or Case Study URL
                      </label>
                      <input
                        id={live2Id}
                        type="url"
                        className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-2.5 text-sm focus:border-[#2357F5] focus:ring-2 focus:ring-[#2357F5]/20 focus:outline-none"
                        placeholder="https://youtube.com/... or Loom walkthrough"
                        value={formData.liveProjectUrl2}
                        onChange={(e) => setFormData({ ...formData, liveProjectUrl2: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor={codeId} className="block text-xs font-semibold text-espresso mb-1">
                        Link to Your Cleanest Codebase or PR <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={codeId}
                        required
                        type="url"
                        className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-2.5 text-sm focus:border-[#2357F5] focus:ring-2 focus:ring-[#2357F5]/20 focus:outline-none"
                        placeholder="https://github.com/username/repo or pull request link"
                        value={formData.cleanestCodeUrl}
                        onChange={(e) => setFormData({ ...formData, cleanestCodeUrl: e.target.value })}
                      />
                      <p className="mt-1 text-[11px] text-espresso/50">Point us directly to your cleanest architecture or commit history.</p>
                    </div>

                    <div>
                      <label htmlFor={portfolioId} className="block text-xs font-semibold text-espresso mb-1">
                        Portfolio / Figma / System Architecture Doc
                      </label>
                      <input
                        id={portfolioId}
                        type="url"
                        className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-2.5 text-sm focus:border-[#2357F5] focus:ring-2 focus:ring-[#2357F5]/20 focus:outline-none"
                        placeholder="https://myportfolio.com or Figma / Notion link"
                        value={formData.portfolioUrl}
                        onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Intensive Technical & Philosophy Questions */}
              <div className="border-t border-espresso/10 pt-8">
                <p className="kb-kicker text-caramel">Step 3 of 3</p>
                <h2 className="kb-display mt-1 text-2xl text-espresso">Intensive Technical & Problem-Solving Questions</h2>
                <p className="mt-1 text-xs text-espresso/60">
                  Please be thorough. We evaluate technical depth, systems thinking, and your obsession with solving real African commercial problems.
                </p>

                <div className="mt-5 space-y-6">
                  {/* Question 1 */}
                  <div>
                    <label htmlFor={hardestProbId} className="block text-xs font-semibold text-espresso mb-1">
                      1. What is the single hardest engineering, product, or performance problem you personally solved? <span className="text-red-500">*</span>
                    </label>
                    <p className="mb-2 text-[11px] text-espresso/60">
                      Walk us through the exact failure mode (e.g. memory leak, race condition, database lock, offline sync breakdown). What hypotheses did you test, what was the root cause, and how did you verify the fix?
                    </p>
                    <textarea
                      id={hardestProbId}
                      required
                      rows={5}
                      className="w-full rounded-xl border border-espresso/15 bg-white p-4 text-sm focus:border-[#2357F5] focus:ring-2 focus:ring-[#2357F5]/20 focus:outline-none leading-relaxed"
                      placeholder="Detail the technical complexity, system context, logs or profiling you ran, and the specific solution you shipped..."
                      value={formData.hardestProblem}
                      onChange={(e) => setFormData({ ...formData, hardestProblem: e.target.value })}
                    />
                  </div>

                  {/* Question 2 */}
                  <div>
                    <label htmlFor={whyAfricaId} className="block text-xs font-semibold text-espresso mb-1">
                      2. Why Kabuor Technologies & African Commerce? <span className="text-red-500">*</span>
                    </label>
                    <p className="mb-2 text-[11px] text-espresso/60">
                      Why build for Kenyan wholesalers, retailers, and distributors instead of standard generic SaaS? What commercial problems in East Africa keep you up at night?
                    </p>
                    <textarea
                      id={whyAfricaId}
                      required
                      rows={4}
                      className="w-full rounded-xl border border-espresso/15 bg-white p-4 text-sm focus:border-[#2357F5] focus:ring-2 focus:ring-[#2357F5]/20 focus:outline-none leading-relaxed"
                      placeholder="Tell us what excites you about homegrown African infrastructure, local payment rails, or building tools that empower local enterprises..."
                      value={formData.whyAfricaKabuor}
                      onChange={(e) => setFormData({ ...formData, whyAfricaKabuor: e.target.value })}
                    />
                  </div>

                  {/* Question 3 */}
                  <div>
                    <label htmlFor={offlineArchId} className="block text-xs font-semibold text-espresso mb-1">
                      3. Offline Resilience & Network Fault-Tolerance <span className="text-red-500">*</span>
                    </label>
                    <p className="mb-2 text-[11px] text-espresso/60">
                      Kenyan retail stores and wholesale warehouses frequently suffer power cuts, spotty 3G/4G, or Safaricom M-Pesa API downtime. How would you architect a point-of-sale or inventory sync system that never drops a sale during a 4-hour internet outage?
                    </p>
                    <textarea
                      id={offlineArchId}
                      required
                      rows={4}
                      className="w-full rounded-xl border border-espresso/15 bg-white p-4 text-sm focus:border-[#2357F5] focus:ring-2 focus:ring-[#2357F5]/20 focus:outline-none leading-relaxed"
                      placeholder="Describe your approach to local-first data storage (IndexedDB / SQLite), conflict resolution, idempotency keys, and offline queueing..."
                      value={formData.offlineArchitecture}
                      onChange={(e) => setFormData({ ...formData, offlineArchitecture: e.target.value })}
                    />
                  </div>

                  {/* SECTION 4: Availability & Pre-Funding Alignment */}
                  <div className="grid gap-4 sm:grid-cols-2 rounded-2xl bg-[#F7F7FB] border border-[#E6E7F0] p-5">
                    <div>
                      <label htmlFor={commitId} className="block text-xs font-semibold text-espresso mb-1">
                        Weekly Availability Commitment <span className="text-red-500">*</span>
                      </label>
                      <select
                        id={commitId}
                        className="w-full rounded-lg border border-[#E6E7F0] bg-white px-3 py-2 text-sm focus:border-[#2357F5] focus:outline-none"
                        value={formData.weeklyCommitment}
                        onChange={(e) => setFormData({ ...formData, weeklyCommitment: e.target.value })}
                      >
                        <option value="40+ hours/week (Full focus)">40+ hours/week (Full Focus & Dedication)</option>
                        <option value="20 - 30 hours/week">20 – 30 hours/week (High Part-Time)</option>
                        <option value="10 - 20 hours/week (Volunteer / Fellow)">10 – 20 hours/week (Fellowship / Volunteer)</option>
                        <option value="Flexible / Async Volunteer">Flexible / Open-Source Contributor</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor={startId} className="block text-xs font-semibold text-espresso mb-1">
                        Earliest Start Date <span className="text-red-500">*</span>
                      </label>
                      <select
                        id={startId}
                        className="w-full rounded-lg border border-[#E6E7F0] bg-white px-3 py-2 text-sm focus:border-[#2357F5] focus:outline-none"
                        value={formData.earliestStartDate}
                        onChange={(e) => setFormData({ ...formData, earliestStartDate: e.target.value })}
                      >
                        <option value="Immediately / Today">Immediately (Ready to start today)</option>
                        <option value="Within 1 - 2 weeks">Within 1 – 2 weeks</option>
                        <option value="Within 1 month">Within 1 month</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 mt-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          id={equityId}
                          type="checkbox"
                          required
                          checked={formData.equityAcknowledgment}
                          onChange={(e) => setFormData({ ...formData, equityAcknowledgment: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded border-[#E6E7F0] text-[#2357F5] focus:ring-[#2357F5]"
                        />
                        <span className="text-xs text-espresso/80 leading-relaxed">
                          <b>Pre-Funding Equity & Volunteer Alignment:</b> I understand that Kabuor Technologies Ltd is currently bootstrapping and pre-funding along Ngong Road, Nairobi. I agree to join under the founding ESOP equity / volunteer fellowship track, with pre-agreed competitive cash salaries activating immediately upon closing our funding round. <span className="text-red-500">*</span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="border-t border-espresso/10 pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn bg-[#2357F5] text-white hover:bg-[#3A6BFF] w-full py-4 text-base font-semibold shadow-xl shadow-[#2357F5]/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting Your Application & Portfolio...' : `Submit Full Application for ${role.title}`}
                </button>
                <p className="mt-3 text-center text-xs text-espresso/50">
                  By submitting, your application is logged directly with the Kabuor Technologies engineering talent desk at careers@kabuor.com.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>

      <SiteFooter info={info} />
    </div>
  );
}
