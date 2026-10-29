// The company website's privacy notice (/privacy) and terms of use (/terms), for kabuor-technologies.company itself:
// the company pages, demo requests and job applications. The products have their own (Kabuor ERP's are in the ERP
// app). Written to Kenya's Data Protection Act 2019 and its 2021 regulations, in plain words. Have a Kenyan advocate
// review both before relying on them. Facts that change (who hosts the site, the contact) are constants below:
// keep them true. How long records are kept is enforced by server/src/platform/retention.js.
import { useEffect } from 'react';
import { Link } from 'react-router';
import { tel, whatsapp } from './Site';
import { CorporatePage, FOUNDER } from './Corporate';

const UPDATED = '30 October 2026';
// Where the website and what it receives are kept. Update when the site moves (render.yaml: Render, Frankfurt).
const HOSTING = { name: 'Vercel Inc.', where: 'the United States' };
const ERP = 'https://erp.kabuor-technologies.company';

const Mail = () => (
  <a href={`mailto:${FOUNDER.email}`} className="ms-link">
    {FOUNDER.email}
  </a>
);

/** A long document: title band, the short version, a contents list that stays in view, numbered sections. */
function LegalPage({ title, summary, sections, other }) {
  useEffect(() => {
    document.title = `${title} · Kabuor Technologies`;
    window.scrollTo(0, 0);
  }, [title]);
  return (
    <CorporatePage>
      <section className="border-b border-[var(--ms-line)] bg-[#F5F7FC]">
        <div className="container-x py-10 sm:py-12">
          <p className="text-sm font-semibold text-[var(--ms-blue)]">Kabuor Technologies website</p>
          <h1 className="mt-3 text-[2.25rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-3 text-[var(--ms-muted)]">Last updated {UPDATED}</p>
        </div>
      </section>

      <div className="container-x grid gap-10 py-10 sm:py-12 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <nav aria-label="Contents" className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <p className="text-sm font-semibold">Contents</p>
          <ol className="mt-3 space-y-1.5 border-l border-[var(--ms-line)] text-[0.9375rem]">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="-ml-px block border-l-2 border-transparent py-0.5 pl-4 text-[var(--ms-muted)] hover:border-[var(--ms-ink)] hover:text-[var(--ms-ink)]">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="max-w-3xl">
          <section aria-label="The short version" className="rounded-lg border border-[var(--ms-line)] bg-[var(--ms-soft)] p-6">
            <h2 className="text-lg font-semibold">The short version</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-[var(--ms-muted)]">
              {summary.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
          {/* On a phone the short version comes first; the contents fold away under it. */}
          <details className="mt-6 rounded-lg border border-[var(--ms-line)] lg:hidden">
            <summary className="cursor-pointer px-4 py-3 font-semibold">Contents</summary>
            <ol className="space-y-1 border-t border-[var(--ms-line)] px-4 py-3">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="block py-1 text-[var(--ms-muted)] hover:underline">
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </details>
          <div className="legal-body mt-10 space-y-10 text-[1.0625rem] leading-relaxed text-[#323130]">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24">
                <h2 id={`${s.id}-h`} className="text-2xl font-semibold tracking-tight text-[var(--ms-ink)]">
                  {i + 1}. {s.title}
                </h2>
                <div className="mt-3 space-y-3 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">{s.body}</div>
              </section>
            ))}
          </div>
          <p className="mt-12 border-t border-[var(--ms-line)] pt-6 text-[var(--ms-muted)]">{other}</p>
        </article>
      </div>
    </CorporatePage>
  );
}

export function Privacy() {
  const sections = [
    {
      id: 'who',
      title: 'Who we are',
      body: (
        <>
          <p>
            Kabuor Technologies makes business software in Kenya, from Ngong Road, Nairobi. Kabuor Technologies Ltd is being incorporated in Kenya; until that is complete, our founder, {FOUNDER.name}, is responsible for the personal data described here.
          </p>
          <p>
            This notice covers this website, kabuor-technologies.company: its pages, the demo request form and job applications. Our products have their own notices, because they handle different data: see the{' '}
            <a href={`${ERP}/privacy`} className="ms-link">
              Kabuor ERP privacy notice
            </a>
            . Kabuor Shops shows its notice when you sign up.
          </p>
          <p>
            Questions, or a request about your data: <Mail /> or {FOUNDER.phone}.
          </p>
        </>
      ),
    },
    {
      id: 'collect',
      title: 'What we collect',
      body: (
        <>
          <p><b className="font-semibold">When you request a demo:</b> the product you’re interested in, your name, your business’s name, your WhatsApp number, your email if you give it, roughly how many people work there, and anything you write in the note.</p>
          <p><b className="font-semibold">When you apply for a role:</b> your name, email, phone number, location and experience, the links to your work you share, your written answers, your availability, and your confirmation of the role’s terms.</p>
          <p><b className="font-semibold">When you contact us</b> by WhatsApp, phone or email: what you send us and your contact details.</p>
          <p><b className="font-semibold">Technical records:</b> like every website, the servers that run ours record each request (the time, the address it came from, the page asked for and the browser). These are used to keep the site working and secure.</p>
          <p>
            <b className="font-semibold">What we don’t do:</b> this website uses no advertising, no analytics or tracking tools, and no cookies. If you start a job application, your answers are saved in your own browser so you don’t lose them; they stay on your device, and are removed when you send the application.
          </p>
        </>
      ),
    },
    {
      id: 'why',
      title: 'Why we use it',
      body: (
        <>
          <ul>
            <li>To contact you and arrange the demo you asked for. This is a step you asked us to take before any agreement.</li>
            <li>To consider your job application and get back to you. Again, a step before a possible agreement, at your request.</li>
            <li>To answer messages you send us.</li>
            <li>To keep the website secure and working, which is in our legitimate interest and yours.</li>
            <li>To meet our legal obligations.</li>
          </ul>
          <p>We don’t add you to marketing lists, we don’t sell or rent personal data, and no decision about you is made by a computer alone.</p>
        </>
      ),
    },
    {
      id: 'share',
      title: 'Who sees it',
      body: (
        <>
          <ul>
            <li>The people at Kabuor Technologies who arrange demos or review applications, and only what that work needs.</li>
            <li>
              {HOSTING.name}, which hosts this website in {HOSTING.where}, and keeps the records described above on our behalf.
            </li>
            <li>WhatsApp (Meta) and our email provider, when you choose to reach us that way. Their own privacy terms apply to those conversations.</li>
            <li>Authorities, when the law requires it, for example under a court order.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'abroad',
      title: 'Data kept outside Kenya',
      body: (
        <p>
          Our hosting provider keeps the website and what it receives outside Kenya. We send personal data abroad only as sections 48 and 49 of the Data Protection Act allow: to providers bound by written terms to protect it, whose security we have considered, and only what the service needs.
        </p>
      ),
    },
    {
      id: 'keep',
      title: 'How long we keep it',
      body: (
        <>
          <ul>
            <li><b className="font-semibold">Demo requests:</b> deleted 12 months after we last worked on them, unless you become a customer (then the product’s notice applies).</li>
            <li><b className="font-semibold">Job applications:</b> deleted 6 months after we tell you we’re not going ahead, and in any case 12 months after the last update. If you join us, your application becomes part of your work records.</li>
            <li><b className="font-semibold">Backups:</b> nightly copies are kept for 14 days, so a deleted record also leaves the backups within two weeks.</li>
            <li><b className="font-semibold">Messages</b> on WhatsApp or by email: deleted once they’re no longer needed, and within 12 months.</li>
          </ul>
          <p>The website deletes demo requests and applications by itself on this schedule.</p>
        </>
      ),
    },
    {
      id: 'security',
      title: 'How we protect it',
      body: (
        <>
          <p>The website is served only over encrypted connections (HTTPS). The forms are protected against automated abuse. Only the people who need demo requests or applications can see them, behind a password.</p>
          <p>
            No system is perfectly secure. If a breach puts your personal data at real risk, we will tell the Office of the Data Protection Commissioner within 72 hours and tell you without delay, as section 43 of the Act requires.
          </p>
        </>
      ),
    },
    {
      id: 'rights',
      title: 'Your rights',
      body: (
        <>
          <p>Under the Data Protection Act you can ask us to tell you what we hold about you and send you a copy, correct it, delete it, stop using it, or move it to someone else. Where you gave consent, you can withdraw it at any time.</p>
          <p>
            Write to <Mail /> or WhatsApp{' '}
            <a href={whatsapp(FOUNDER.phone, 'Hi Kabuor Technologies, a request about my personal data: ')} target="_blank" rel="noreferrer" className="ms-link">
              {FOUNDER.phone}
            </a>
            . We answer within the times the 2021 regulations set: a copy of your data within 7 days, a correction or deletion within 14 days.
          </p>
          <p>
            If you’re not happy with our answer, you can complain to the Office of the Data Protection Commissioner at{' '}
            <a href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer" className="ms-link">
              odpc.go.ke
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: 'children',
      title: 'Children',
      body: <p>This website is for businesses and for job seekers aged 18 or over. If you’re under 18 and interested in our young builders programme, ask a parent or guardian to contact us first.</p>,
    },
    {
      id: 'changes',
      title: 'Changes to this notice',
      body: <p>If we change this notice, we’ll update the date at the top. If a change matters for data we already hold about you, we’ll tell you before it takes effect.</p>,
    },
  ];
  return (
    <LegalPage
      title="Privacy notice"
      summary={[
        'We collect only what you send us: a demo request, a job application or a message.',
        'We use it to reply, arrange your demo or consider your application. Nothing else.',
        'No advertising, no tracking tools and no cookies on this website.',
        'We never sell your data. Demo requests are deleted after 12 months; applications after 6 to 12 months.',
        `You can see, correct or delete what we hold: write to ${FOUNDER.email}.`,
      ]}
      sections={sections}
      other={
        <>
          See also our{' '}
          <Link to="/terms" className="ms-link">
            terms of use
          </Link>{' '}
          and the{' '}
          <a href={`${ERP}/privacy`} className="ms-link">
            Kabuor ERP privacy notice
          </a>
          .
        </>
      }
    />
  );
}

export function Terms() {
  const sections = [
    {
      id: 'about',
      title: 'About these terms',
      body: (
        <>
          <p>These terms cover your use of this website, kabuor-technologies.company. By using it, you agree to them.</p>
          <p>
            Our products have their own terms, which you accept when you sign up: the{' '}
            <a href={`${ERP}/terms`} className="ms-link">
              Kabuor ERP terms of service
            </a>
            , and the Kabuor Shops terms shown at signup. If those and these differ, the product’s terms apply to the product.
          </p>
        </>
      ),
    },
    {
      id: 'who',
      title: 'Who we are',
      body: (
        <p>
          Kabuor Technologies, Ngong Road, Nairobi, Kenya. Kabuor Technologies Ltd is being incorporated in Kenya. Contact: <Mail />, <a href={tel(FOUNDER.phone)} className="ms-link">{FOUNDER.phone}</a>.
        </p>
      ),
    },
    {
      id: 'use',
      title: 'Using the website',
      body: (
        <>
          <p>You may use this website to learn about our products and company, request a demo, apply for a role and contact us. Please don’t:</p>
          <ul>
            <li>break the law, or help anyone else do so, through the website;</li>
            <li>try to get into parts of the website or our systems you aren’t meant to reach, or test their security without our written permission;</li>
            <li>overload the website, or copy its content in bulk with automated tools;</li>
            <li>send forms with someone else’s details, false details, or spam.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'information',
      title: 'Information on the website',
      body: (
        <>
          <p>We keep what the website says about our products accurate, and mark what is coming rather than available. Features and prices can change. The price that applies to you is the one shown when you sign up, or in a written quote from us.</p>
          <p>What the website says about tax, KRA, M-Pesa or the law is general information, not professional advice. For advice about your own business, speak to an accountant or advocate.</p>
        </>
      ),
    },
    {
      id: 'demos',
      title: 'Demo requests',
      body: <p>A demo is free and puts you under no obligation. We try to reply within one working day, but we may decline a request, for example if our products don’t fit what you need.</p>,
    },
    {
      id: 'careers',
      title: 'Job applications',
      body: (
        <>
          <p>Roles listed on the careers page can open or close at any time. Applying doesn’t create a working relationship.</p>
          <p>Nothing on this website is an offer of employment, payment or equity. Those exist only in a written agreement signed by you and Kabuor Technologies. Equity is granted only under the terms of a written share option plan.</p>
        </>
      ),
    },
    {
      id: 'ip',
      title: 'Our content and names',
      body: (
        <>
          <p>The names Kabuor, Kabuor Technologies, Kabuor ERP, Kabuor Shops and Kabuor Builds, our logos, and the website’s text, designs and pictures belong to Kabuor Technologies. You’re welcome to link to the website and share its pages. Please don’t copy its content or use our names or logos in a way that suggests we endorse something, without our written permission.</p>
          <p>Screenshots of work we have built for customers show their designs and brands, which remain theirs.</p>
        </>
      ),
    },
    {
      id: 'links',
      title: 'Other websites',
      body: <p>The website links to services we don’t run, such as WhatsApp and LinkedIn. Their own terms and privacy notices apply there, and we aren’t responsible for their content.</p>,
    },
    {
      id: 'availability',
      title: 'Availability',
      body: <p>We work to keep the website available and secure, but we can’t promise it will always be uninterrupted or free of errors. We may change or pause parts of it at any time.</p>,
    },
    {
      id: 'liability',
      title: 'Our responsibility',
      body: (
        <>
          <p>The website is free to use and provided as it is. As far as Kenyan law allows, we aren’t responsible for indirect losses, such as lost profits or business, that come from using it or relying on it.</p>
          <p>Nothing in these terms takes away rights you have under the Consumer Protection Act, 2012, or limits any responsibility the law doesn’t allow us to limit.</p>
        </>
      ),
    },
    {
      id: 'law',
      title: 'Law and disputes',
      body: <p>These terms are governed by the laws of Kenya. If something goes wrong, please talk to us first; most things can be put right quickly. Any dispute we can’t settle together will be decided by the courts of Kenya.</p>,
    },
    {
      id: 'changes',
      title: 'Changes to these terms',
      body: <p>We may update these terms. The date at the top shows when they last changed; the version on this page is the one that applies.</p>,
    },
  ];
  return (
    <LegalPage
      title="Terms of use"
      summary={[
        'These terms cover using this website. Each product has its own terms, which you accept when you sign up.',
        'Use the website for what it’s for: learning about us, requesting a demo, applying for a role, contacting us.',
        'Prices and features can change; the price that applies is the one shown at signup or in a written quote.',
        'Nothing here is an offer of a job or equity; only a signed agreement is.',
        'Kenyan law applies. If something goes wrong, talk to us first.',
      ]}
      sections={sections}
      other={
        <>
          See also our{' '}
          <Link to="/privacy" className="ms-link">
            privacy notice
          </Link>{' '}
          and the{' '}
          <a href={`${ERP}/terms`} className="ms-link">
            Kabuor ERP terms of service
          </a>
          .
        </>
      }
    />
  );
}
