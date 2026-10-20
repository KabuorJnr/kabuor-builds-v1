// Kabuor ERP's product page (/erp). The visitor is deciding "is this for a business like mine, and is it
// worth a demo?". So: the problems it fixes in their words, what works today (and what doesn't yet, said
// plainly), who it's for, how it compares, and a person to book a demo with.
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Boxes, Check, ExternalLink, FileText, Minus, Plus, Sparkles, Users, Wallet, X } from 'lucide-react';
import { cn } from '../lib/format';
import { EASE } from './shared';
import DemoRequest from './DemoRequest';
import { ERP_RAILWAY_URL, SiteFooter, SiteHeader } from './Site';

const FIXES = [
  ['Matching the M-Pesa statement to invoices by hand', 'Payments match their invoices by themselves. Anything unclear is one tap: “Looks like INV-0012, paid from Wanjiku Stores’ phone.”'],
  ['Month-end panic over VAT and KRA', 'VAT is worked out on every invoice and bill. VAT on sales less VAT on purchases is ready for your return, and invoices are prepared for eTIMS.'],
  ['Finding out you’re out of stock when a customer asks', 'Every jar in, out, counted or moved is recorded. Low stock shows on your home screen before it runs out.'],
  ['Software only the accountant understands', 'Plain words in English or Kiswahili, on the phone your team already has. Each person sees what their job needs.'],
];

const FEATURES = [
  { icon: FileText, title: 'Quotes & invoices', text: 'Quote, turn it into an invoice with one tap, send it on WhatsApp with your Paybill and account number on it.' },
  { icon: Wallet, title: 'M-Pesa matching', text: 'Paybill and Till payments arrive by themselves and match the right invoice. Money that comes in early waits for its invoice.' },
  { icon: Boxes, title: 'Buying, stock & production', text: 'Suppliers and bills, several stores, recipes that say how many batches your stock allows and what each unit really costs.' },
  { icon: Users, title: 'Payroll & leave', text: 'PAYE, SHIF, Housing Levy and NSSF worked out every month, payslips on WhatsApp, P9s and the PAYE file for iTax.' },
  { icon: Sparkles, title: 'Customers & campaigns', text: 'Leads, a pipeline, follow-ups that don’t slip, and SMS or WhatsApp offers to the right customers with the sales they brought.' },
  { icon: BarChart3, title: 'Books that keep themselves', text: 'Proper double-entry behind every sale, payment, payslip and production run: profit, VAT, who owes you, always current.' },
];

const ROADMAP = [
  ['Now', ['Sales, quotes, invoices & M-Pesa matching', 'Buying, suppliers & stock', 'Payroll: PAYE, SHIF, Housing Levy, NSSF', 'Leads, pipeline & follow-ups', 'Production & SMS/WhatsApp campaigns']],
  ['Next', ['Live KRA eTIMS signing', 'Salaries paid out by M-Pesa', 'Kabuor Shops orders straight into your books']],
  ['Later', ['WhatsApp Business messaging at scale', 'Field sales app that works offline', 'Bank feeds']],
];

const COMPARE = [
  ['M-Pesa payments match invoices by themselves', 'yes', 'add-on', 'some'],
  ['KRA VAT and eTIMS built in', 'yes', 'add-on', 'some'],
  ['English and Kiswahili', 'yes', 'no', 'no'],
  ['Sales, stock and books in one system', 'yes', 'yes', 'no'],
  ['Published price in shillings', 'yes', 'no', 'no'],
  ['Set up without a consultant', 'yes', 'no', 'some'],
];

function Mark({ v }) {
  if (v === 'yes') return <Check className="mx-auto h-5 w-5 text-[#0F7A3D]" strokeWidth={3} aria-label="Yes" />;
  if (v === 'no') return <X className="mx-auto h-5 w-5 text-espresso/30" aria-label="No" />;
  return <span className="text-xs font-semibold text-espresso/50">{v === 'add-on' ? 'Through add-ons' : 'Sometimes'}</span>;
}

/** A drawing of the real Today screen, so people see what they'd open each morning. */
function TodayScreen() {
  const jobs = [
    ['2 invoices overdue', 'KSh 30,100', 'Follow up', 'bg-[#FDECEA] text-[#B42318]'],
    ['1 payment to match', 'KSh 1,250', 'Match', 'bg-[#FFF4E0] text-[#A15C00]'],
    ['Hot Pepper 500g running low', '18 left', 'Order', 'bg-[#FFF4E0] text-[#A15C00]'],
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: EASE }} className="relative mx-auto w-full max-w-xl" aria-label="The Kabuor ERP Today screen">
      <div className="absolute inset-6 rounded-full bg-[#2357F5]/30 blur-3xl" />
      <div className="relative overflow-hidden rounded-[1.4rem] bg-[#F7F7FB] text-[#0A0B1E] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
        <div className="flex items-center gap-2 bg-white px-4 py-2.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#DCDDF0]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#DCDDF0]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#DCDDF0]" />
          <span className="ml-2 text-xs font-semibold text-[#585C80]">Kabuor ERP · Mama Pili Sauces</span>
        </div>
        <div className="p-5">
          <p className="text-xs text-[#585C80]">Tuesday 20 October</p>
          <p className="kb-display text-2xl">Good morning, Akinyi</p>
          <div className="mt-4 rounded-xl bg-white p-3 ring-1 ring-[#E6E7F0]">
            <p className="text-xs font-semibold text-[#585C80]">Needs you today</p>
            {jobs.map(([t, m, a, tone]) => (
              <div key={t} className="mt-2 flex items-center gap-3">
                <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold', tone)}>!</span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[13px]">{t}</b>
                  <span className="text-[11px] text-[#585C80]">{m}</span>
                </span>
                <span className="text-[12px] font-semibold text-[#2357F5]">{a} →</span>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ['Money in, 7 days', 'KSh 28,750', '▲ 71%'],
              ['Customers owe you', 'KSh 95,500', '5 invoices'],
            ].map(([l, v, c]) => (
              <div key={l} className="rounded-xl bg-white p-3 ring-1 ring-[#E6E7F0]">
                <p className="text-[11px] text-[#585C80]">{l}</p>
                <p className="kb-display text-lg">{v}</p>
                <p className="text-[11px] text-[#0F7A3D]">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.9, ease: EASE }} className="absolute -right-2 -bottom-6 w-[62%] rounded-2xl bg-white p-3.5 text-[#0A0B1E] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] sm:-right-8">
        <p className="text-[11px] font-bold tracking-wide text-[#1E8E3E] uppercase">M-Pesa · matched</p>
        <p className="mt-1 text-[13px] leading-snug">
          <b>KSh 16,800</b> from JAVA HOUSE paid <b>INV-0002</b>
        </p>
        <p className="mt-0.5 text-[11px] text-[#585C80]">Account number was the invoice number</p>
      </motion.div>
    </motion.div>
  );
}

function AssistantDemo() {
  return (
    <div className="rounded-[var(--r-xl)] bg-[#F7F7FB] p-5 text-[#0A0B1E] ring-1 ring-white/10 sm:p-6">
      <div className="ml-auto max-w-[80%] rounded-2xl bg-[#2357F5] px-4 py-2.5 text-[15px] text-white">Nani hajalipa mwezi huu?</div>
      <div className="mt-3 max-w-[90%] rounded-2xl bg-white px-4 py-3 text-[15px] ring-1 ring-[#E6E7F0]">
        Wateja wawili wamechelewa: <b>Naivas Westlands</b> anadaiwa KSh 21,100 (siku 26) na <b>Wanjiku Stores</b> KSh 6,000 (siku 5). Nimekuandalia ujumbe wa kuwakumbusha kwenye WhatsApp.
      </div>
      <div className="mt-3 rounded-xl bg-white p-3 ring-1 ring-[#E6E7F0]">
        <p className="text-xs font-semibold text-[#585C80]">Waiting for your OK</p>
        <p className="mt-1 text-sm font-medium">Remind Naivas Westlands about INV-0001 (KSh 21,100) on WhatsApp</p>
        <div className="mt-2 flex gap-2">
          <span className="rounded-md px-3 py-1.5 text-xs font-semibold ring-1 ring-[#E6E7F0]">No</span>
          <span className="rounded-md bg-[#1E8E3E] px-3 py-1.5 text-xs font-semibold text-white">Approve & open WhatsApp</span>
        </div>
      </div>
    </div>
  );
}

export default function Erp({ info }) {
  useEffect(() => {
    document.title = 'Kabuor ERP · Run the whole business from one place';
  }, []);

  return (
    <>
      <div className="kb-ink relative overflow-hidden">
        <SiteHeader info={info} cta={{ href: '#demo', label: 'Request a demo' }} />
        <section className="container-x relative grid items-center gap-12 pt-8 pb-20 sm:pt-14 lg:grid-cols-[1fr_1.05fr] lg:pb-24">
          <div>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="kb-kicker text-[#9DB6FF]">
              Kabuor ERP · Early access
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.05, ease: EASE }} className="kb-display mt-4 text-[2.9rem] sm:text-[4.6rem]">
              Run the whole business <span className="text-[#F2C14E]">from one place.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: EASE }} className="mt-6 max-w-xl text-lg leading-relaxed text-cream/75">
              Sales, M-Pesa, stock, production, payroll, customers and your books, kept right as you work, with an assistant you can ask in Kiswahili. Built in Kenya, for the way Kenyan businesses get paid.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25, ease: EASE }} className="mt-8 flex flex-wrap gap-3">
              <a
                href={ERP_RAILWAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-[#2357F5] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#2357F5]/30 transition hover:bg-[#3A6BFF] inline-flex items-center gap-2"
              >
                Launch Kabuor ERP <ExternalLink className="h-4 w-4" />
              </a>
              <a href="#demo" className="btn border border-white/20 bg-white/10 px-6 py-3.5 text-cream hover:bg-white/15">
                Request a demo
              </a>
              <a href="#features" className="btn btn-ghost px-5 py-3.5 text-cream/80 hover:text-cream">
                See what it does
              </a>
            </motion.div>
          </div>
          <TodayScreen />
        </section>
      </div>

      {/* problems, in the owner's words */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-x">
          <p className="kb-kicker text-caramel">What it fixes</p>
          <h2 className="kb-display mt-3 max-w-3xl text-4xl sm:text-5xl">The hours that go into keeping track.</h2>
          <ul className="mt-10 grid gap-4 lg:grid-cols-2">
            {FIXES.map(([before, after]) => (
              <li key={before} className="rounded-[var(--r-xl)] bg-cream p-5 sm:p-6">
                <p className="flex items-start gap-2.5 text-espresso/55 line-through decoration-espresso/25">
                  <Minus className="mt-1 h-4 w-4 shrink-0" /> {before}
                </p>
                <p className="mt-3 flex items-start gap-2.5 text-[17px] font-medium">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-[#0F7A3D]" strokeWidth={3} /> {after}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* what works today */}
      <section id="features" className="scroll-mt-6 py-16 sm:py-24">
        <div className="container-x">
          <p className="kb-kicker text-caramel">What it does today</p>
          <h2 className="kb-display mt-3 text-4xl sm:text-5xl">Everything behind the sale.</h2>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="rounded-[var(--r-xl)] bg-white p-6 ring-1 ring-espresso/[0.07]">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#ECEBFF] text-[#3A2BC9]">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-1 text-espresso/60">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* the assistant */}
      <section className="kb-ink relative overflow-hidden py-16 sm:py-24">
        <div className="container-x relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="kb-kicker text-[#9DB6FF]">Msaidizi</p>
            <h2 className="kb-display mt-3 text-4xl sm:text-5xl">An assistant that does the work, with your OK.</h2>
            <p className="mt-4 max-w-lg text-lg text-cream/75">Ask in English, Kiswahili or Sheng. It answers from your own numbers, then offers to do the job: match a payment, remind a customer. Nothing changes until you approve it, and it only sees what your role allows.</p>
            <ul className="mt-6 space-y-2 text-cream/80">
              {['“How much came in this week?”', '“Match my unmatched M-Pesa payments”', '“Mkumbushe mteja aliyechelewa zaidi”'].map((q) => (
                <li key={q} className="flex gap-2.5">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#F2C14E]" /> {q}
                </li>
              ))}
            </ul>
          </div>
          <AssistantDemo />
        </div>
      </section>

      {/* who it's for + roadmap */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="kb-kicker text-caramel">Who it’s for</p>
            <h2 className="kb-display mt-3 text-4xl sm:text-5xl">Businesses that sell on credit and get paid by M-Pesa.</h2>
            <p className="mt-4 text-espresso/65">Usually 5 to 200 people, VAT-registered, running today on Excel, an accounting package and the M-Pesa statement.</p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {['Distributors & wholesalers', 'Manufacturers & agro-processors', 'Shops with a few branches', 'Service firms that invoice'].map((x) => (
                <li key={x} className="flex gap-2.5 rounded-[var(--r-md)] bg-cream px-3.5 py-2.5 font-medium">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#3A2BC9]" strokeWidth={3} /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="kb-kicker text-caramel">What’s ready, what’s coming</p>
            <ol className="mt-5 grid gap-3 sm:grid-cols-3">
              {ROADMAP.map(([when, items], i) => (
                <li key={when} className={cn('rounded-[var(--r-xl)] p-5', i === 0 ? 'bg-[#0A0B1E] text-cream' : 'bg-cream')}>
                  <p className={cn('text-sm font-bold', i === 0 ? 'text-[#F2C14E]' : 'text-[#3A2BC9]')}>{when}</p>
                  <ul className="mt-3 space-y-2 text-[15px]">
                    {items.map((x) => (
                      <li key={x} className={i === 0 ? 'text-cream/85' : 'text-espresso/70'}>
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

      {/* how it compares */}
      <section className="py-16 sm:py-24">
        <div className="container-x">
          <p className="kb-kicker text-caramel">How it compares</p>
          <h2 className="kb-display mt-3 text-4xl sm:text-5xl">Local where it matters.</h2>
          <div className="mt-8 overflow-x-auto rounded-[var(--r-xl)] bg-white ring-1 ring-espresso/[0.07]">
            <table className="w-full min-w-[40rem] text-[15px]">
              <thead>
                <tr className="border-b border-espresso/10 text-sm">
                  <th className="px-5 py-4 text-left font-semibold text-espresso/55" />
                  <th className="bg-[#ECEBFF] px-5 py-4 font-bold text-[#3A2BC9]">Kabuor ERP</th>
                  <th className="px-5 py-4 font-semibold text-espresso/60">Imported ERPs</th>
                  <th className="px-5 py-4 font-semibold text-espresso/60">Separate local systems</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/[0.06]">
                {COMPARE.map(([row, a, b, c]) => (
                  <tr key={row}>
                    <td className="px-5 py-3.5 font-medium">{row}</td>
                    <td className="bg-[#ECEBFF]/40 px-5 py-3.5 text-center">
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

      {/* questions */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="kb-kicker text-caramel">Questions</p>
            <h2 className="kb-display mt-3 text-4xl sm:text-5xl">Before a demo</h2>
          </div>
          <div className="divide-y divide-espresso/10 border-y border-espresso/10">
            {[
              ['How much does it cost?', 'It’s priced per business in shillings, not per seat in dollars. Early-access businesses get launch pricing; tell us about your business and we’ll quote you straight away.'],
              ['Is my business data safe?', 'Each business’s records are kept completely apart, only people you add can sign in, each with the access their role needs, and every change is recorded with who made it and when.'],
              ['What about KRA eTIMS?', 'Every invoice is prepared with what eTIMS needs. Live signing with KRA switches on once KRA certifies our connection; until then invoices are marked as test signatures.'],
              ['Do I need an accountant to use it?', 'No. Sales staff invoice and record payments; the books keep themselves. Your accountant gets proper reports, VAT figures and a trial balance when they need them.'],
              ['Can we move from Excel or our current system?', 'Yes. We’ll help you bring in your customers, products, suppliers and opening stock, and set up your M-Pesa Paybill or Till.'],
              ['Does it work on a phone?', 'Yes. It’s built phone-first: the home screen, invoices, M-Pesa matching and stock counts all work on the phone your team already has.'],
            ].map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <Plus className="h-4 w-4 shrink-0 text-espresso/45 transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-2 max-w-2xl text-espresso/65">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className="container-x py-16 sm:py-24">
        <DemoRequest info={info} product="erp" />
      </div>

      <SiteFooter info={info} />
    </>
  );
}
