import { useEffect, useId, useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Copy } from 'lucide-react';
import { CorporatePage } from './Corporate';
import { EXPERIENCE_LEVELS, START_DATES, WEEKLY_COMMITMENTS, clearDraft, loadDraft, payLine, saveDraft, sendApplication } from './careersStore';
import { CONTACT_EMAIL } from './contact';

const EMPTY = {
  fullName: '',
  email: '',
  phone: '',
  location: 'Nairobi, Kenya',
  experienceTrack: '',
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
  weeklyCommitment: '',
  earliestStartDate: '',
  equityAcknowledgment: false,
};

const isUrl = (s) => {
  try {
    return /^https?:$/.test(new URL(s).protocol);
  } catch {
    return false;
  }
};
// People paste "github.com/name"; add the https:// rather than make them retype it.
const withScheme = (s) => {
  const v = s.trim();
  return v && !/^[a-z][a-z0-9+.-]*:/i.test(v) && /^[\w-]+(\.[\w-]+)+/.test(v) ? `https://${v}` : v;
};
const words = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const hasAnswers = (f) => !!f && Object.keys(EMPTY).some((k) => f[k] !== undefined && f[k] !== EMPTY[k]);

/** The links a role asks for, in form order: [field, label, required, placeholder, hint]. Technical roles show code;
 * everyone else shows a LinkedIn/CV link and work samples, so nobody is asked for a GitHub account they don't need. */
const linkFields = (technical) =>
  technical
    ? [
        ['githubUrl', 'GitHub or GitLab profile', true, 'https://github.com/your-username'],
        ['liveProjectUrl1', 'A live app you built', true, 'https://myapp.vercel.app', 'A working application anyone can open in a browser.'],
        ['cleanestCodeUrl', 'Your cleanest code or pull request', true, 'https://github.com/username/repo/pull/12', 'Point us straight at the architecture or commit history you are proudest of.'],
        ['liveProjectUrl2', 'Another project, demo video or case study', false, 'https://www.loom.com/share/…'],
        ['portfolioUrl', 'Portfolio, Figma or architecture doc', false, 'https://myportfolio.com'],
      ]
    : [
        ['portfolioUrl', 'LinkedIn, GitHub, CV or portfolio link', true, 'https://www.linkedin.com/in/your-name', 'A CV shared from Google Drive or Dropbox works too; set it so anyone with the link can view.'],
        ['liveProjectUrl1', 'Best work sample', false, 'https://…', 'A campaign, deck, case study, report or anything you’re proud of.'],
        ['liveProjectUrl2', 'Another work sample', false, 'https://…'],
      ];

// Every field that can be wrong, in the order they appear, so the first problem gets focus.
const FIELD_ORDER = ['fullName', 'email', 'phone', 'location', 'experienceTrack', 'githubUrl', 'liveProjectUrl1', 'cleanestCodeUrl', 'liveProjectUrl2', 'portfolioUrl', 'hardestProblem', 'whyAfricaKabuor', 'offlineArchitecture', 'weeklyCommitment', 'earliestStartDate', 'equityAcknowledgment'];

function validate(f, technical) {
  const e = {};
  if (!f.fullName.trim()) e.fullName = 'Enter your full name.';
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter an email address like name@example.com.';
  if (f.phone.replace(/\D/g, '').length < 9) e.phone = 'Enter a phone number we can call or WhatsApp, e.g. 0712 345 678.';
  if (!f.location.trim()) e.location = 'Enter the city and country you live in.';
  if (!f.experienceTrack) e.experienceTrack = 'Choose the option closest to your experience.';
  for (const [key, , required] of linkFields(technical)) {
    const v = f[key].trim();
    if (required && !v) e[key] = 'Add this link: it’s how we judge your work.';
    else if (v && !isUrl(v)) e[key] = 'Enter a full link starting with https://';
  }
  if (!f.hardestProblem.trim()) e.hardestProblem = 'Answer this question.';
  if (!f.whyAfricaKabuor.trim()) e.whyAfricaKabuor = 'Answer this question.';
  if (technical && !f.offlineArchitecture.trim()) e.offlineArchitecture = 'Answer this question.';
  if (!f.weeklyCommitment) e.weeklyCommitment = 'Choose how much time you can give.';
  if (!f.earliestStartDate) e.earliestStartDate = 'Choose when you could start.';
  if (!f.equityAcknowledgment) e.equityAcknowledgment = 'Tick this box to confirm you’re joining on these terms.';
  return e;
}

const inputClass = (bad) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-espresso placeholder:text-espresso/40 focus:ring-2 focus:outline-none ${
    bad ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-espresso/15 focus:border-[#2357F5] focus:ring-[#2357F5]/20'
  }`;

function Field({ id, label, optional, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-espresso">
        {label} {optional && <span className="font-normal text-espresso/55">(optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 text-[13px] leading-relaxed text-espresso/60">
          {hint}
        </p>
      )}
      <div className="mt-1.5">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** A small set of answers, all visible at once (radio buttons drawn as chips). */
function Choice({ id, legend, options, value, onChange, error }) {
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="block text-sm font-semibold text-espresso">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map(([v, label], i) => (
          <label key={v} className="cursor-pointer">
            <input id={i === 0 ? id : undefined} type="radio" name={id} value={v} checked={value === v} onChange={() => onChange(v)} className="peer sr-only" />
            <span
              className={`block rounded-full border px-4 py-2 text-sm font-semibold transition peer-checked:border-[#2357F5] peer-checked:bg-[#2357F5] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#2357F5]/40 ${
                error ? 'border-red-300 bg-white text-espresso/80' : 'border-espresso/15 bg-white text-espresso/80 hover:border-espresso/35'
              }`}
            >
              {label}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] font-medium text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function SectionHeading({ step, title, children }) {
  return (
    <div>
      <p className="kb-kicker text-caramel">Part {step} of 4</p>
      <h2 className="kb-display mt-1.5 text-2xl text-espresso sm:text-[1.75rem]">{title}</h2>
      {children && <p className="mt-1.5 text-[15px] leading-relaxed text-espresso/65">{children}</p>}
    </div>
  );
}

export default function CareersApplicationPage({ role, onBack, info }) {
  const technical = !!role?.technical;
  const [savedDraft] = useState(() => {
    const draft = role ? loadDraft(role.id) : null;
    return hasAnswers(draft) ? draft : null;
  });
  const [formData, setFormData] = useState(() => ({ ...EMPTY, ...savedDraft }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [trap, setTrap] = useState(''); // the hidden "website" field: only bots fill it in
  const uid = useId();
  const id = (name) => `${uid}-${name}`;

  // Keep unfinished answers on this device, so leaving the page doesn't lose an hour of writing.
  useEffect(() => {
    if (!role || submissionResult) return;
    if (hasAnswers(formData)) saveDraft(role.id, formData);
    else clearDraft(role.id);
  }, [role, formData, submissionResult]);

  const set = (key, value) => {
    setFormData((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };

  const startOver = () => {
    clearDraft(role.id);
    setFormData(EMPTY);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const data = { ...formData };
    for (const [key] of linkFields(technical)) data[key] = withScheme(data[key]);
    setFormData(data);
    const found = validate(data, technical);
    setErrors(found);
    const first = FIELD_ORDER.find((k) => found[k]);
    if (first) {
      document.getElementById(id(first))?.focus();
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await sendApplication({ roleId: role.id, roleTitle: role.title, department: role.department, ...data, website: trap });
      clearDraft(role.id);
      setSubmissionResult(result);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      // A role closed while they wrote says so itself; anything else (no connection, a check the server makes)
      // keeps the answers here and gives a way out.
      const reason = err.status ? err.message.replace(/\.?$/, '.') : 'We couldn’t reach our server.';
      setSubmitError(err.status === 409 ? err.message : `${reason} Your answers are still here: try again, or email them to ${CONTACT_EMAIL}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(submissionResult.trackingRef);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch {}
  };

  const field = (key) => ({
    id: id(key),
    value: formData[key],
    onChange: (e) => set(key, e.target.value),
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': [errors[key] && `${id(key)}-error`].filter(Boolean).join(' ') || undefined,
    className: inputClass(errors[key]),
  });

  const errorCount = Object.keys(errors).length;

  const textQuestion = (key, label, hint, placeholder, rows) => (
    <Field id={id(key)} label={label} hint={hint} error={errors[key]}>
      <textarea {...field(key)} rows={rows} placeholder={placeholder} className={`${inputClass(errors[key])} leading-relaxed`} />
      <p className="mt-1 text-right text-[13px] text-espresso/50 tabular-nums">{words(formData[key])} words</p>
    </Field>
  );

  let body;
  if (!role) {
    body = (
      <div className="rounded-lg border border-espresso/10 bg-white p-8 text-center sm:p-12">
        <h1 className="kb-display text-3xl text-espresso sm:text-4xl">This role isn’t listed any more</h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-espresso/70">
          The link you followed points to a role we’ve taken down. Have a look at what’s open now.
        </p>
        <button type="button" onClick={onBack} className="btn mt-8 bg-[#2357F5] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3A6BFF]">
          See open roles
        </button>
      </div>
    );
  } else if (role.status === 'closed') {
    body = (
      <div className="rounded-lg border border-espresso/10 bg-white p-8 text-center sm:p-12">
        <span className="inline-block rounded-full bg-espresso/[0.06] px-3 py-1 text-sm font-semibold text-espresso/70">Applications closed</span>
        <h1 className="kb-display mt-4 text-3xl text-espresso sm:text-4xl">{role.title} isn’t taking applications right now</h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-espresso/70">
          We have filled or paused this position. We keep reviewing exceptional young builders, open-source volunteers and engineering fellows all year.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onBack} className="btn bg-[#2357F5] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#3A6BFF]">
            See open roles
          </button>
          <a href={`mailto:${CONTACT_EMAIL}?subject=Volunteer%20%2F%20Young%20Builder%20Pitch`} className="btn border border-espresso/15 bg-white px-6 py-3 text-sm font-semibold text-espresso hover:border-espresso/30">
            Email us your project
          </a>
        </div>
      </div>
    );
  } else if (submissionResult) {
    body = (
      <div className="rounded-lg border border-emerald-600/20 bg-white p-6 shadow-sm sm:p-12">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" strokeWidth={1.75} />
          <h1 className="kb-display mt-4 text-3xl text-espresso sm:text-4xl">Application sent</h1>
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-espresso/70">
            Thank you, <b className="text-espresso">{formData.fullName.trim().split(/\s+/)[0]}</b>. We’ve received your application for <b className="text-espresso">{role.title}</b>.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-xl rounded-lg border border-[#E6E7F0] bg-[#F7F7FB] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E7F0] pb-4">
            <div>
              <p className="text-sm text-espresso/60">Your reference</p>
              <code className="font-mono text-lg font-bold text-[#2357F5]">{submissionResult.trackingRef}</code>
            </div>
            <button type="button" onClick={copyRef} className="btn border border-[#E6E7F0] bg-white px-4 py-2 text-sm font-semibold text-espresso hover:border-espresso/25">
              {copiedRef ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copiedRef ? 'Copied' : 'Copy'}
            </button>
          </div>
          <dl className="mt-4 grid gap-x-4 gap-y-2 text-[15px] sm:grid-cols-[auto_1fr]">
            <dt className="text-espresso/60">Role</dt>
            <dd className="font-semibold text-espresso">{role.title}</dd>
            <dt className="text-espresso/60">We’ll reply to</dt>
            <dd className="font-semibold break-words text-espresso">
              {formData.email} · {formData.phone}
            </dd>
            <dt className="text-espresso/60">Expect to hear back</dt>
            <dd className="font-semibold text-emerald-700">Within 3–5 business days</dd>
          </dl>
        </div>

        <div className="mx-auto mt-6 max-w-xl rounded-lg border border-[#F2C14E]/40 bg-[#FFF7EC] p-5 sm:p-6">
          <h2 className="kb-display text-xl text-[#1E1B18]">What happens next</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-espresso/80">
            <li>{technical ? 'Our core architects review your code, live links and answers.' : 'The founders review your links and answers.'}</li>
            <li>
              If you’re shortlisted, we invite you by WhatsApp or email to {technical ? 'a technical pairing session' : 'a conversation with the founders'}.
            </li>
            <li>
              Questions in the meantime? Email{' '}
              <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(submissionResult.trackingRef)}`} className="font-semibold text-[#2357F5] underline">
                {CONTACT_EMAIL}
              </a>{' '}
              with your reference.
            </li>
          </ol>
        </div>

        <div className="mt-10 flex justify-center">
          <button type="button" onClick={onBack} className="btn bg-[#2357F5] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2357F5]/25 hover:bg-[#3A6BFF]">
            Back to all roles
          </button>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="rounded-lg border border-espresso/10 bg-white p-5 shadow-sm sm:p-10">
        <div className="border-b border-espresso/10 pb-8">
          <p className="text-sm font-semibold text-[#2357F5]">{role.department}</p>
          <h1 className="kb-display mt-2 text-3xl leading-[1.02] text-espresso sm:text-5xl">Apply for {role.title}</h1>
          <p className="mt-3 text-[15px] text-espresso/65">
            {role.type} · {role.experience} · {role.location}
          </p>

          <div className="mt-6 grid gap-5 rounded-lg bg-[#F7F7FB] p-5 sm:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="text-[13px] font-bold text-espresso/60">What we’re looking for</h2>
              <ul className="mt-2 space-y-1.5">
                {role.requirements.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[15px] leading-relaxed text-[#3B3F5C]">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2357F5]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-espresso/60">Pay & equity</h2>
              <p className="mt-2 text-[15px] font-semibold text-emerald-700">{role.equity}</p>
              <p className="text-[15px] text-espresso/65">{payLine(role)}</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-espresso/60">
            Takes about 20 minutes. Every field is required unless it says optional. Your answers are kept on this device as you type, so you can leave and come back.
          </p>
          {savedDraft && (
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-[#E8EEFF]/70 px-4 py-2.5 text-sm text-[#1E1B18]">
              We restored the answers you started earlier.
              <button type="button" onClick={startOver} className="font-semibold text-[#2357F5] hover:underline">
                Clear them and start over
              </button>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-12">
          <section className="space-y-5">
            <SectionHeading step={1} title="About you">
              We use these details to arrange interviews.
            </SectionHeading>
            <Field id={id('fullName')} label="Full name" error={errors.fullName}>
              <input {...field('fullName')} type="text" autoComplete="name" placeholder="e.g. Faith Wanjiku Oduor" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id={id('email')} label="Email" error={errors.email}>
                <input {...field('email')} type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" />
              </Field>
              <Field id={id('phone')} label="Phone or WhatsApp" error={errors.phone}>
                <input {...field('phone')} type="tel" autoComplete="tel" placeholder="0712 345 678" />
              </Field>
            </div>
            <Field id={id('location')} label="City and country" error={errors.location}>
              <input {...field('location')} type="text" autoComplete="address-level2" placeholder="e.g. Kisumu, Kenya" />
            </Field>
            <Choice id={id('experienceTrack')} legend="Your experience" options={EXPERIENCE_LEVELS} value={formData.experienceTrack} onChange={(v) => set('experienceTrack', v)} error={errors.experienceTrack} />
          </section>

          <section className="space-y-5 border-t border-espresso/10 pt-10">
            <SectionHeading step={2} title="Your work">
              {technical
                ? 'We value what you have built and shipped over certificates. Show us real code and live applications.'
                : 'Show us where you’ve done this kind of work before. Links only; we don’t need a cover letter.'}
            </SectionHeading>
            {linkFields(technical).map(([key, label, required, placeholder, hint]) => (
              <Field key={key} id={id(key)} label={label} optional={!required} hint={hint} error={errors[key]}>
                <input {...field(key)} type="url" inputMode="url" placeholder={placeholder} onBlur={(e) => e.target.value !== withScheme(e.target.value) && set(key, withScheme(e.target.value))} />
              </Field>
            ))}
          </section>

          <section className="space-y-6 border-t border-espresso/10 pt-10">
            <SectionHeading step={3} title="Questions">
              Be specific. We read every answer; 150 to 300 words each is plenty.
            </SectionHeading>
            {textQuestion(
              'hardestProblem',
              technical ? 'What is the hardest engineering, product or performance problem you have personally solved?' : 'What is the hardest problem you have personally solved at work?',
              technical
                ? 'Walk us through the failure (a memory leak, race condition, database lock, offline sync breakdown…), the hypotheses you tested, the root cause, and how you verified the fix.'
                : 'What was at stake, what you tried, what worked, and how you knew it had worked.',
              technical ? 'The system, what went wrong, what you measured, and what you shipped…' : 'The situation, what you did, and the result…',
              6,
            )}
            {textQuestion(
              'whyAfricaKabuor',
              'Why Kabuor Technologies, and why African commerce?',
              'Why build for Kenyan wholesalers, retailers and distributors rather than generic SaaS? Which problems in East African business do you most want to fix?',
              'What draws you to this work…',
              5,
            )}
            {technical &&
              textQuestion(
                'offlineArchitecture',
                'How would you keep a shop selling through a 4-hour internet outage?',
                'Kenyan shops and warehouses face power cuts, patchy 3G/4G and M-Pesa API downtime. How would you design a point-of-sale or inventory sync that never drops a sale?',
                'Local-first storage, conflict resolution, idempotency, offline queueing…',
                5,
              )}
          </section>

          <section className="space-y-6 border-t border-espresso/10 pt-10">
            <SectionHeading step={4} title="Availability and terms" />
            <Choice id={id('weeklyCommitment')} legend="Time you can give each week" options={WEEKLY_COMMITMENTS} value={formData.weeklyCommitment} onChange={(v) => set('weeklyCommitment', v)} error={errors.weeklyCommitment} />
            <Choice id={id('earliestStartDate')} legend="When you could start" options={START_DATES} value={formData.earliestStartDate} onChange={(v) => set('earliestStartDate', v)} error={errors.earliestStartDate} />
            <div className={`rounded-lg border p-5 ${errors.equityAcknowledgment ? 'border-red-300 bg-red-50/40' : 'border-[#E6E7F0] bg-[#F7F7FB]'}`}>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  id={id('equityAcknowledgment')}
                  type="checkbox"
                  checked={formData.equityAcknowledgment}
                  onChange={(e) => set('equityAcknowledgment', e.target.checked)}
                  aria-describedby={errors.equityAcknowledgment ? `${id('equityAcknowledgment')}-error` : undefined}
                  className="mt-1 h-5 w-5 shrink-0 rounded border-espresso/30 accent-[#2357F5]"
                />
                <span className="text-[15px] leading-relaxed text-espresso/80">
                  <b className="text-espresso">I understand the pre-funding terms.</b> Kabuor Technologies Ltd is bootstrapping and pre-funding. I’m joining on the founding ESOP equity / volunteer fellowship track, with pre-agreed competitive salaries starting when the funding round closes.
                </span>
              </label>
              {errors.equityAcknowledgment && (
                <p id={`${id('equityAcknowledgment')}-error`} className="mt-2 pl-8 text-[13px] font-medium text-red-700">
                  {errors.equityAcknowledgment}
                </p>
              )}
            </div>
          </section>

          <div className="border-t border-espresso/10 pt-8">
            {/* Hidden from people; bots fill it in. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} className="hidden" aria-hidden="true" />
            {errorCount > 0 && (
              <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-[15px] font-medium text-red-800">
                {errorCount === 1 ? 'One answer needs fixing' : `${errorCount} answers need fixing`} before you can send this. They’re marked in red above.
              </p>
            )}
            {submitError && (
              <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-[15px] font-medium text-red-800">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn w-full bg-[#2357F5] py-4 text-base font-semibold text-white shadow-xl shadow-[#2357F5]/30 hover:bg-[#3A6BFF] disabled:opacity-60"
            >
              {submitting ? 'Sending your application…' : 'Send application'}
            </button>
            <p className="mt-3 text-center text-sm text-espresso/60">We reply to every applicant within 3–5 business days.</p>
          </div>
        </form>
      </div>
    );
  }

  return (
    <CorporatePage cta={{ href: '/careers#open-roles', label: 'All open roles' }}>
      <div className="bg-[#FAFAFA]">
        <div className="container-x max-w-3xl py-8 sm:py-14">
          <button type="button" onClick={onBack} className="ms-link mb-6">
            <ArrowLeft className="h-4 w-4" />
            All open roles
          </button>
          {body}
        </div>
      </div>
    </CorporatePage>
  );
}
