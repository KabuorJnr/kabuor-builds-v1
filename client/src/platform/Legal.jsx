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
function LegalPage({ title, summary, sections, other, product = 'Kabuor Technologies website' }) {
  useEffect(() => {
    document.title = `${title} · ${product.replace(/ website$/, '')}`;
    window.scrollTo(0, 0);
  }, [title]);
  return (
    <CorporatePage>
      <section className="border-b border-[var(--ms-line)] bg-[#F5F7FC]">
        <div className="container-x py-10 sm:py-12">
          <p className="text-sm font-semibold text-[var(--ms-blue)]">{product}</p>
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
            {' '}and the{' '}
            <Link to="/shops/privacy" className="ms-link">
              Kabuor Shops privacy notice
            </Link>
            .
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
            {' '}and the{' '}
            <Link to="/shops/terms" className="ms-link">
              Kabuor Shops terms
            </Link>
            . If those and these differ, the product’s terms apply to the product.
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

// ---------------------------------------------------------------- Kabuor Shops ----------------------------------------
// For shop owners (/shops/privacy, /shops/terms). Each shop also has its own short notice for the people who buy from
// it (ShopPrivacyPage in pages/SitePages.jsx). Unpaid signups are deleted by server/src/platform/retention.js.

export function ShopsPrivacy() {
  const sections = [
    {
      id: 'roles',
      title: 'Who we are, and our two roles',
      body: (
        <>
          <p>Kabuor Shops is run by Kabuor Technologies, Ngong Road, Nairobi (Kabuor Technologies Ltd is being incorporated in Kenya; until then our founder, {FOUNDER.name}, is responsible for it).</p>
          <ul>
            <li><b className="font-semibold">Your account</b> (your business, you and the staff you add, your plan payments): we decide how this is used, so we are the <b className="font-semibold">data controller</b>.</li>
            <li><b className="font-semibold">Your customers’ details</b> (the orders people place in your shop): your business decides what to do with them, so you are the <b className="font-semibold">controller</b> and we are your <b className="font-semibold">data processor</b>, under the processing terms in our <Link to="/shops/terms" className="ms-link">Kabuor Shops terms</Link>.</li>
          </ul>
          <p>Questions, or a request about your data: <Mail /> or {FOUNDER.phone}.</p>
        </>
      ),
    },
    {
      id: 'collect',
      title: 'What we collect',
      body: (
        <>
          <p><b className="font-semibold">From you, the shop owner:</b></p>
          <ul>
            <li>Signup details: your business’s name, what you sell, your shop link, your town, your name, phone number and email, and a scrambled (hashed) password.</li>
            <li>Your shop: logo, photos, products and prices, the words on your site, and the M-Pesa Till or Paybill your customers pay.</li>
            <li>Plan payments: the phone number that paid, the amount and the M-Pesa receipt.</li>
            <li>If you connect M-Pesa prompts: your Daraja keys, kept on our servers and never shown again in full.</li>
            <li>Staff you add, and the devices you allow to show new-order alerts.</li>
            <li>Technical records: the time, address and page of each request, to keep the service working and secure.</li>
          </ul>
          <p><b className="font-semibold">For you, about your customers:</b> each order’s name, phone number, email if given, delivery address and town, note, items, total, payment method and M-Pesa receipt; the texts sent about it; emails of people who join your newsletter; and sales you record by hand.</p>
          <p>The service uses no advertising and no tracking tools, and we never use your customers’ details for our own marketing.</p>
        </>
      ),
    },
    {
      id: 'why',
      title: 'Why we use it',
      body: (
        <>
          <ul>
            <li>To build, host and run your shop, take orders and send the alerts you ask for (our contract with you).</li>
            <li>To take your plan payments and keep business records (contract and legal obligation).</li>
            <li>To keep accounts secure and prevent fraud (legitimate interest).</li>
          </ul>
          <p>We don’t sell personal data, and no decision about anyone is made by a computer alone.</p>
        </>
      ),
    },
    {
      id: 'share',
      title: 'Who sees it',
      body: (
        <ul>
          <li>You, and the staff you give a login to your shop’s admin.</li>
          <li>
            {HOSTING.name}, which hosts the service in {HOSTING.where}.
          </li>
          <li>Safaricom (Kenya), for M-Pesa: your plan payments, and your customers’ payments when you connect prompts (the money goes straight to your Till or Paybill; we never hold it).</li>
          <li>Africa’s Talking (Kenya), which sends the order texts.</li>
          <li>The push services of your phone or browser (such as Google, Apple or Mozilla), which deliver new-order alerts to the devices you allow.</li>
          <li>WhatsApp, when you or your customers choose to talk there.</li>
          <li>Authorities, when the law requires it.</li>
        </ul>
      ),
    },
    {
      id: 'abroad',
      title: 'Data kept outside Kenya',
      body: <p>Our hosting provider keeps the service and its data outside Kenya. We send personal data abroad only as sections 48 and 49 of the Data Protection Act allow: to providers bound by written terms to protect it, whose security we have considered, and only what the service needs.</p>,
    },
    {
      id: 'keep',
      title: 'How long we keep it',
      body: (
        <ul>
          <li><b className="font-semibold">A signup that never paid:</b> deleted with anything it uploaded 30 days after its last step.</li>
          <li><b className="font-semibold">Your shop and its orders:</b> while your shop exists, live or paused, so you can come back to it. Business records may need to be kept longer for tax, so download what you need.</li>
          <li><b className="font-semibold">When you close your shop:</b> you have 30 days to download your orders; we then delete the shop and everything in it, at the latest 90 days after closing.</li>
          <li><b className="font-semibold">Backups:</b> nightly copies are kept for 14 days, so deleted data leaves them within two weeks.</li>
        </ul>
      ),
    },
    {
      id: 'security',
      title: 'How we protect it',
      body: (
        <>
          <ul>
            <li>Encrypted connections (HTTPS) and scrambled passwords.</li>
            <li>Every shop has its own database and its own sign-in keys: one shop can never see another’s orders.</li>
            <li>M-Pesa secrets stay on our servers and are never sent back to a browser; uploads are re-encoded so only real pictures are kept.</li>
            <li>Limits on signups, uploads, sign-ins and orders against abuse.</li>
          </ul>
          <p>If a breach puts personal data at real risk, we tell the Office of the Data Protection Commissioner within 72 hours and the people affected without delay (section 43). For your customers’ data, we tell you within 48 hours so you can do the same.</p>
        </>
      ),
    },
    {
      id: 'rights',
      title: 'Your rights',
      body: (
        <>
          <p>
            You can ask us to tell you what we hold about you and send you a copy, correct it, delete it, stop using it, or move it to someone else. Write to <Mail />. We answer within the times the 2021 regulations set: a copy within 7 days, a correction or deletion within 14 days.
          </p>
          <p>If you bought from a shop, ask that shop first: it decides what happens to your order details, and we help it answer.</p>
          <p>
            You can also complain to the Office of the Data Protection Commissioner at{' '}
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
      body: <p>You must be 18 or over to open a shop.</p>,
    },
    {
      id: 'changes',
      title: 'Changes to this notice',
      body: <p>If we change this notice in a way that matters, we’ll tell shop owners in their admin before it takes effect.</p>,
    },
  ];
  return (
    <LegalPage
      product="Kabuor Shops"
      title="Privacy notice"
      summary={[
        'Your shop’s orders are yours. For your customers’ details we are your processor and act only on your instructions.',
        'We use data only to run your shop and take your plan payments. No advertising, no tracking, never sold.',
        'Customers’ money goes straight to your Till or Paybill; we never hold it.',
        'A signup that never pays is deleted after 30 days. A closed shop is deleted within 90 days, after 30 days to download.',
        `You can see, correct or delete what we hold: write to ${FOUNDER.email}.`,
      ]}
      sections={sections}
      other={
        <>
          See also the{' '}
          <Link to="/shops/terms" className="ms-link">
            Kabuor Shops terms
          </Link>{' '}
          and the{' '}
          <Link to="/privacy" className="ms-link">
            Kabuor Technologies website privacy notice
          </Link>
          .
        </>
      }
    />
  );
}

export function ShopsTerms() {
  const sections = [
    {
      id: 'agreement',
      title: 'This agreement',
      body: <p>These terms are an agreement between your business and Kabuor Technologies, Ngong Road, Nairobi (Kabuor Technologies Ltd is being incorporated in Kenya), for the use of Kabuor Shops. By opening a shop you agree to them on behalf of your business, and confirm you’re 18 or over and allowed to.</p>,
    },
    {
      id: 'service',
      title: 'The service',
      body: <p>Kabuor Shops gives your brand an online shop: its design, your link, hosting, the checkout, an admin for orders, stock and sales, and order alerts by text and on your phone. We aim to keep it available at all times but can’t promise it will never be interrupted.</p>,
    },
    {
      id: 'paying',
      title: 'Your plan',
      body: (
        <ul>
          <li>You can build and preview your shop for free. It goes live when you pay for your plan by M-Pesa.</li>
          <li>Plans are paid in Kenyan shillings, in advance: each payment adds a month or a year. Prices are shown at signup and in your admin; we give 30 days’ notice of any change.</li>
          <li>Three days after your plan ends, your shop pauses: customers see that it’s taking a short break, and your admin keeps working. Nothing is deleted; renewing reopens it.</li>
          <li>Paid time isn’t refunded if you stop early, except where the law requires.</li>
        </ul>
      ),
    },
    {
      id: 'selling',
      title: 'Selling in your shop',
      body: (
        <>
          <p>You are the seller. Your customers buy from you, not from us, and pay your own Till or Paybill. We take no commission and never hold your money.</p>
          <ul>
            <li>You’re responsible for your products, prices, descriptions, delivery, returns and refunds, and for treating customers as the Consumer Protection Act, 2012 requires.</li>
            <li>You’re responsible for your taxes, receipts and any KRA obligations (such as VAT and eTIMS) that apply to your sales.</li>
            <li>Sell only what’s legal to sell in Kenya: no counterfeit goods, nothing you don’t have the right to sell, and nothing prohibited or that needs a licence you don’t hold.</li>
            <li>If you connect M-Pesa prompts, the Daraja account and its keys are yours to keep in good standing with Safaricom.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'content',
      title: 'Your content and your link',
      body: (
        <>
          <p>Your logo, photos, products and words stay yours. You give us permission to host and show them as your shop, and confirm you have the right to use them. We may show your shop’s design as an example of our work; tell us if you’d rather we didn’t.</p>
          <p>Shop links are given on a first-come basis. We may change a link that misleads people or uses a name the shop has no right to.</p>
        </>
      ),
    },
    {
      id: 'processing',
      title: 'Processing your customers’ data',
      body: (
        <>
          <p>For your customers’ details, your business is the data controller and Kabuor Technologies is your data processor. These terms are the written contract that section 42 of the Data Protection Act and regulation 24 require:</p>
          <ul>
            <li><b className="font-semibold">What, how long and why</b>: customers’ names, phone numbers, emails, delivery addresses, orders, payments and the texts sent to them, and newsletter emails, for as long as your shop exists, only to run your shop.</li>
            <li><b className="font-semibold">Your instructions</b>: we act only on your instructions, given through your admin and these terms, and tell you if we think one breaks the law.</li>
            <li>
              <b className="font-semibold">Confidentiality and security</b>: everyone who works on the service keeps your data confidential, under the measures in the{' '}
              <Link to="/shops/privacy" className="ms-link">
                privacy notice
              </Link>
              .
            </li>
            <li><b className="font-semibold">Sub-processors</b>: you authorise the providers listed in the privacy notice. We give you 30 days’ notice before adding or replacing one, and stay responsible for them (regulation 25).</li>
            <li><b className="font-semibold">Helping you</b>: we help you answer your customers’ requests and handle breaches, which we report to you within 48 hours.</li>
            <li><b className="font-semibold">At the end</b>: you can download your orders; we delete your shop’s data at the latest 90 days after it closes, except where the law requires us to keep it.</li>
          </ul>
          <p>You must tell your customers how you use their details. Every shop has a short privacy page for them, linked from its footer, that says you’re responsible for their orders and we run the site for you.</p>
        </>
      ),
    },
    {
      id: 'suspension',
      title: 'Suspending a shop',
      body: <p>We may pause or remove a shop that breaks these terms or the law, or that puts customers or other shops at risk. Where we can, we tell you first and give you the chance to put it right.</p>,
    },
    {
      id: 'liability',
      title: 'Liability',
      body: <p>We run the service with reasonable care and skill. We aren’t liable for indirect losses (such as lost sales or profit), for what you sell or say in your shop, or for losses caused by Safaricom, SMS or other services being unavailable, or by events outside our control. Our total liability in any year is limited to what you paid us in the 12 months before the claim. Nothing here limits rights you have under the Consumer Protection Act, 2012, or other law that can’t be excluded.</p>,
    },
    {
      id: 'ending',
      title: 'Closing your shop',
      body: (
        <p>
          You can close your shop at any time: ask us at <Mail />. You then have 30 days to download your orders before the shop and its data are deleted, as the privacy notice describes.
        </p>
      ),
    },
    {
      id: 'law',
      title: 'Law and disputes',
      body: <p>These terms are governed by the laws of Kenya. We’ll first try to settle any dispute by talking; if that fails, the courts of Kenya decide.</p>,
    },
    {
      id: 'changes',
      title: 'Changes to these terms',
      body: <p>We tell shop owners in their admin at least 30 days before a change that matters takes effect.</p>,
    },
  ];
  return (
    <LegalPage
      product="Kabuor Shops"
      title="Terms of service"
      summary={[
        'Build and preview your shop free; it goes live when you pay your plan by M-Pesa, monthly or yearly.',
        'You are the seller: customers pay your own Till or Paybill, and we take no commission.',
        'Your products, prices, delivery, refunds and taxes are your responsibility; sell only what’s legal.',
        'If your plan ends, your shop pauses after 3 days; nothing is deleted, and renewing reopens it.',
        'Close any time by asking us; you get 30 days to download your orders. Kenyan law applies.',
      ]}
      sections={sections}
      other={
        <>
          See also the{' '}
          <Link to="/shops/privacy" className="ms-link">
            Kabuor Shops privacy notice
          </Link>{' '}
          and the{' '}
          <Link to="/terms" className="ms-link">
            Kabuor Technologies website terms of use
          </Link>
          .
        </>
      }
    />
  );
}
