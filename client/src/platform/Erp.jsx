// Kabuor ERP's product page (/erp). The visitor is deciding "is this for a business like mine, and is it worth a
// trial or a demo?". So, in the corporate layout every Kabuor page shares (Corporate.jsx): what it is and the two ways
// in, the problems it fixes in their words, what it does today, the assistant, who it's for and what's coming (said
// plainly), the price, how it compares, questions, and a person to book a demo with.
import { useEffect } from 'react';
import { BarChart3, Boxes, Check, ChevronRight, FileText, Minus, Plus, Sparkles, Users, Wallet, X } from 'lucide-react';
import { cn } from '../lib/format';
import DemoRequest from './DemoRequest';
import { ERP_RAILWAY_URL } from './Site';
import { BrowserShot, CorporatePage, PhoneShot, SectionHead } from './Corporate';

const SIGNUP = `${ERP_RAILWAY_URL}/signup`;
const ext = { target: '_blank', rel: 'noopener noreferrer' };

const FIXES = [
  ['Matching the M-Pesa statement to invoices by hand', 'Payments match their invoices by themselves. Anything unclear is one tap: “Looks like INV-0012, paid from Wanjiku Stores’ phone.”'],
  ['Month-end panic over VAT and KRA', 'VAT is worked out on every invoice and bill. VAT on sales less VAT on purchases is ready for your return, and invoices are prepared for eTIMS.'],
  ['Finding out you’re out of stock when a customer asks', 'Every item in, out, counted or moved is recorded. Low stock shows on your home screen before it runs out.'],
  ['Software only the accountant understands', 'Plain words in English or Kiswahili, on the phone your team already has. Each person sees what their job needs.'],
];

const FEATURES = [
  { icon: FileText, title: 'Quotes and invoices', text: 'Quote, turn it into an invoice with one tap, and send it on WhatsApp with your Paybill and account number on it.' },
  { icon: Wallet, title: 'M-Pesa matching', text: 'Paybill and Till payments arrive by themselves and match the right invoice. Money that comes in early waits for its invoice.' },
  { icon: Boxes, title: 'Buying, stock and production', text: 'Suppliers and bills, several stores, and recipes that say how many batches your stock allows and what each unit really costs.' },
  { icon: Users, title: 'Payroll and leave', text: 'PAYE, SHIF, Housing Levy and NSSF worked out every month, payslips on WhatsApp, P9s and the PAYE file for iTax.' },
  { icon: Sparkles, title: 'Customers and campaigns', text: 'Leads, a pipeline, follow-ups that don’t slip, and SMS or WhatsApp offers to the right customers.' },
  { icon: BarChart3, title: 'Books that keep themselves', text: 'Proper double-entry behind every sale, payment, payslip and production run: profit, VAT and who owes you, always current.' },
];

const ROADMAP = [
  ['Available now', ['Sales, quotes, invoices and M-Pesa matching', 'Buying, suppliers and stock', 'Payroll: PAYE, SHIF, Housing Levy, NSSF', 'Leads, pipeline and follow-ups', 'Production and SMS/WhatsApp campaigns']],
  ['Coming next', ['Live KRA eTIMS signing', 'Salaries paid out by M-Pesa', 'Kabuor Shops orders straight into your books']],
  ['Later', ['WhatsApp Business messaging at scale', 'A field sales app that works offline', 'Bank feeds']],
];

const COMPARE = [
  ['M-Pesa payments match invoices by themselves', 'yes', 'add-on', 'some'],
  ['KRA VAT and eTIMS built in', 'yes', 'add-on', 'some'],
  ['English and Kiswahili', 'yes', 'no', 'no'],
  ['Sales, stock and books in one system', 'yes', 'yes', 'no'],
  ['Published price in shillings', 'yes', 'no', 'no'],
  ['Set up without a consultant', 'yes', 'no', 'some'],
];

// The same plans the app sells (Settings → Plan & billing); keep the two in step.
const PLANS = [
  { name: 'Starter', monthly: 1500, who: 'A shop or a one-person business', includes: ['Invoices, quotes and the till', 'M-Pesa matching and prompts', 'Stock, suppliers and eTIMS', '3 users'] },
  { name: 'Business', monthly: 4500, who: 'A growing team with staff on payroll', includes: ['Everything in Starter', 'Payroll, PAYE, SHA, NSSF and the staff portal (up to 50 staff)', 'CRM, campaigns, agents and Msaidizi', '15 users'], best: true },
  { name: 'Growth', monthly: 9500, who: 'Several branches or stores', includes: ['Everything in Business', 'Unlimited users and staff', 'Several branches and stores', 'Priority support on WhatsApp'] },
];

const QUESTIONS = [
  ['How much does it cost?', 'From KSh 1,500 a month for a shop, KSh 4,500 with payroll and the team tools, KSh 9,500 for several branches. You pay by M-Pesa when you open your account.'],
  ['Is my business data safe?', 'Each business’s records are kept completely apart, only people you add can sign in, each with the access their role needs, and every change is recorded with who made it and when.'],
  ['What about KRA eTIMS?', 'Every invoice is prepared with what eTIMS needs. Live signing with KRA switches on once KRA certifies our connection; until then invoices are marked as test signatures.'],
  ['Do I need an accountant to use it?', 'No. Sales staff invoice and record payments; the books keep themselves. Your accountant gets proper reports, VAT figures and a trial balance when they need them.'],
  ['Can we move from Excel or our current system?', 'Yes. We’ll help you bring in your customers, products, suppliers and opening stock, and set up your M-Pesa Paybill or Till.'],
  ['Does it work on a phone?', 'Yes. It’s built phone-first: the home screen, invoices, M-Pesa matching and stock counts all work on the phone your team already has.'],
];

function Mark({ v }) {
  if (v === 'yes') return <Check className="mx-auto h-5 w-5 text-[#0F7A3D]" strokeWidth={2.5} aria-label="Yes" />;
  if (v === 'no') return <X className="mx-auto h-5 w-5 text-[#a19f9d]" aria-label="No" />;
  return <span className="text-xs text-[var(--ms-muted)]">{v === 'add-on' ? 'Through add-ons' : 'Sometimes'}</span>;
}

export default function Erp({ info }) {
  useEffect(() => {
    document.title = 'Kabuor ERP · Run the whole business from one place';
  }, []);

  return (
    <CorporatePage cta={{ href: SIGNUP, label: 'Open your account' }}>
      {/* Hero */}
      <section className="border-b border-[var(--ms-line)] bg-[#F5F7FC]">
        <div className="container-x grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:py-20">
          <div>
            <p className="text-sm font-semibold text-[var(--ms-blue)]">Kabuor ERP · Early access</p>
            <h1 className="mt-3 text-[2.25rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl">Run the whole business from one place</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--ms-muted)]">
              Sales, M-Pesa, stock, production, payroll, customers and your books, kept right as you work, with an assistant you can ask in Kiswahili. Built in Kenya, for the way Kenyan businesses get paid.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={SIGNUP} {...ext} className="ms-btn ms-btn-primary">
                Open your account
              </a>
              <a href="#demo" className="ms-btn ms-btn-secondary">
                Request a demo
              </a>
            </div>
            <p className="mt-4 text-sm text-[var(--ms-muted)]">
              Already using it?{' '}
              <a href={ERP_RAILWAY_URL} {...ext} className="ms-link">
                Sign in <ChevronRight className="h-4 w-4" />
              </a>
            </p>
          </div>
          {/* The real thing: the dashboards on a computer, invoices on a phone. */}
          <div className="relative mx-auto w-full max-w-xl sm:pr-[14%] sm:pb-8">
            <BrowserShot src="/brand/erp-dashboards.webp" alt="Kabuor ERP dashboards: sales, profit, cash and who owes you, live from the books" address="erp.kabuor-technologies.company" />
            <PhoneShot src="/brand/erp-invoices-phone.webp" alt="Kabuor ERP invoices on a phone" className="absolute right-0 bottom-0 hidden w-[28%] sm:block" />
          </div>
        </div>
      </section>

      {/* What it fixes */}
      <section aria-labelledby="fixes" className="py-10 sm:py-12">
        <div className="container-x">
          <SectionHead id="fixes" title="The hours that go into keeping track" text="What changes on the first day." />
          <ul className="mt-7 grid gap-6 lg:grid-cols-2">
            {FIXES.map(([before, after]) => (
              <li key={before} className="rounded-lg border border-[var(--ms-line)] p-6">
                <p className="flex items-start gap-2.5 text-[var(--ms-muted)] line-through decoration-[#a19f9d]">
                  <Minus className="mt-1 h-4 w-4 shrink-0" /> {before}
                </p>
                <p className="mt-3 flex items-start gap-2.5 text-[17px]">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-[#0F7A3D]" strokeWidth={2.5} /> {after}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What it does */}
      <section id="features" aria-labelledby="features-title" className="scroll-mt-20 border-y border-[var(--ms-line)] bg-[var(--ms-soft)] py-10 sm:py-12">
        <div className="container-x">
          <SectionHead id="features-title" title="Everything behind the sale" text="What Kabuor ERP does today." />
          <BrowserShot src="/brand/erp-invoices.webp" alt="Kabuor ERP invoices: who owes what, which are paid, part paid or late" address="erp.kabuor-technologies.company/invoices" className="mt-7" />
          <ul className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="rounded-lg bg-white p-6">
                <f.icon className="h-6 w-6 text-[var(--ms-blue)]" strokeWidth={1.75} />
                <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-[0.9375rem] leading-relaxed text-[var(--ms-muted)]">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The assistant */}
      <section aria-labelledby="msaidizi" className="py-10 sm:py-12">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-[var(--ms-blue)]">Msaidizi</p>
            <h2 id="msaidizi" className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-tight">
              An assistant that does the work, with your OK
            </h2>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-[var(--ms-muted)]">Ask in English, Kiswahili or Sheng. It answers from your own numbers, then offers to do the job: match a payment, remind a customer. Nothing changes until you approve it, and it only sees what your role allows.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--ms-muted)]">Things people ask it</p>
            <ul className="mt-3 divide-y divide-[var(--ms-line)] border-y border-[var(--ms-line)]">
              {['“How much came in this week?”', '“Nani hajalipa mwezi huu?”', '“Match my unmatched M-Pesa payments”', '“Mkumbushe mteja aliyechelewa zaidi”', '“What’s running low in the Kisumu store?”'].map((q) => (
                <li key={q} className="flex gap-2 py-3 text-lg">
                  <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[var(--ms-blue)]" /> {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Who it's for, and what's coming */}
      <section aria-labelledby="who" className="border-t border-[var(--ms-line)] py-10 sm:py-12">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionHead id="who" title="Businesses that sell on credit and get paid by M-Pesa" text="Usually 5 to 200 people, VAT-registered, running today on Excel, an accounting package and the M-Pesa statement." />
            <ul className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {['Distributors and wholesalers', 'Manufacturers and agro-processors', 'Shops with a few branches', 'Service firms that invoice'].map((x) => (
                <li key={x} className="flex gap-2 border-b border-[var(--ms-line)] py-2.5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ms-blue)]" strokeWidth={2.5} /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold">What’s ready, what’s coming</h3>
            <ol className="mt-5 grid gap-4 sm:grid-cols-3">
              {ROADMAP.map(([when, items], i) => (
                <li key={when} className={cn('rounded-lg border p-5', i === 0 ? 'border-[var(--ms-blue)] bg-[#F5F7FC]' : 'border-[var(--ms-line)]')}>
                  <p className={cn('text-sm font-semibold', i === 0 ? 'text-[var(--ms-blue)]' : 'text-[var(--ms-muted)]')}>{when}</p>
                  <ul className="mt-3 space-y-2 text-[0.9375rem]">
                    {items.map((x) => (
                      <li key={x} className={i === 0 ? '' : 'text-[var(--ms-muted)]'}>
                        {x}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 border-y border-[var(--ms-line)] bg-[var(--ms-soft)] py-10 sm:py-12">
        <div className="container-x">
          <SectionHead id="pricing-title" title="Priced per business, in shillings" text="Choose a plan and pay by M-Pesa to open your account, monthly or yearly; a year costs ten months. Everything is switched on from the first day." />
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.name} className={cn('relative flex flex-col rounded-lg bg-white p-6 sm:p-8', p.best ? 'border-2 border-[var(--ms-blue)]' : 'border border-[var(--ms-line)]')}>
                {p.best && <span className="absolute -top-3 left-6 rounded bg-[var(--ms-blue)] px-2.5 py-0.5 text-xs font-semibold text-white">Most businesses</span>}
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-[var(--ms-muted)]">{p.who}</p>
                <p className="mt-5">
                  <span className="text-3xl font-semibold">KSh {p.monthly.toLocaleString('en-KE')}</span> <span className="text-[var(--ms-muted)]">a month</span>
                </p>
                <p className="mt-1 text-sm text-[var(--ms-muted)]">or KSh {(p.monthly * 10).toLocaleString('en-KE')} a year</p>
                <ul className="mt-5 flex-1 space-y-2 border-t border-[var(--ms-line)] pt-5 text-[0.9375rem]">
                  {p.includes.map((x) => (
                    <li key={x} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0F7A3D]" strokeWidth={2.5} />
                      {x}
                    </li>
                  ))}
                </ul>
                <a href={SIGNUP} {...ext} className={cn('ms-btn mt-6', p.best ? 'ms-btn-primary' : 'ms-btn-secondary')}>
                  Open your account
                </a>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-[var(--ms-muted)]">Bringing your customers, suppliers and stock in from Excel, QuickBooks or Sage is included in every plan.</p>
        </div>
      </section>

      {/* How it compares */}
      <section aria-labelledby="compare" className="py-10 sm:py-12">
        <div className="container-x">
          <SectionHead id="compare" title="Local where it matters" text="How Kabuor ERP compares with the alternatives Kenyan businesses use." />
          <div className="mt-8 overflow-x-auto rounded-lg border border-[var(--ms-line)]">
            <table className="w-full min-w-[40rem] text-[0.9375rem]">
              <thead>
                <tr className="border-b border-[var(--ms-line)] bg-[#FAFAFA] text-sm">
                  <th className="px-5 py-4 text-left font-semibold">
                    <span className="sr-only">Feature</span>
                  </th>
                  <th className="px-5 py-4 font-semibold text-[var(--ms-blue)]">Kabuor ERP</th>
                  <th className="px-5 py-4 font-semibold">Imported ERPs</th>
                  <th className="px-5 py-4 font-semibold">Separate local systems</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ms-line)]">
                {COMPARE.map(([row, a, b, c]) => (
                  <tr key={row}>
                    <td className="px-5 py-3.5">{row}</td>
                    <td className="bg-[#F5F7FC] px-5 py-3.5 text-center">
                      <Mark v={a} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Mark v={b} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Mark v={c} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section aria-labelledby="faq" className="border-t border-[var(--ms-line)] py-10 sm:py-12">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <SectionHead id="faq" title="Frequently asked questions" />
          <div className="divide-y divide-[var(--ms-line)] border-y border-[var(--ms-line)]">
            {QUESTIONS.map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <Plus className="h-5 w-5 shrink-0 text-[var(--ms-muted)] transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-2 max-w-2xl leading-relaxed text-[var(--ms-muted)]">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className="container-x pb-10 sm:pb-12">
        <DemoRequest info={info} product="erp" className="[&>div]:rounded-lg [&>div]:ring-[var(--ms-line)]" />
      </div>
    </CorporatePage>
  );
}
