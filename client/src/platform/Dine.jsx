// Kabuor Dine's product page (/dine). The visitor runs a restaurant, café, hotel or bar and is deciding "will this
// stop the waiting, the wrong orders and the walk-outs, and is it worth KSh 3,000 a month?". It's laid out and
// coloured like the Kabuor ERP and Kabuor Shops pages (Corporate.jsx): what it is and the way in, the facts, what
// changes on a busy night, how a table's order travels, what it does, who it's for and what you need, the price,
// how it compares, questions, and a person to book a demo with.
import { useEffect } from 'react';
import { BarChart3, BellRing, Check, ChefHat, ChevronRight, Minus, Plus, QrCode, ShieldCheck, Smartphone, Tablet, UtensilsCrossed, X } from 'lucide-react';
import DemoRequest from './DemoRequest';
import { DINE_URL } from './Site';
import { BrowserShot, CorporatePage, PhoneShot, SectionHead } from './Corporate';

// Launching Kabuor Dine opens its own site (its landing page: start, or sign in).
const SIGNUP = DINE_URL;
const ext = { target: '_blank', rel: 'noopener noreferrer' };

const FACTS = [
  ['No app for guests', 'They scan the table’s QR, order and pay in their phone’s browser.'],
  ['Paid to your own M-Pesa', 'Guests pay your Till or Paybill directly. No commission on any bill.'],
  ['Ready the same day', 'Your menu, tables and printable QR cards, set up in one sitting.'],
];

const FIXES = [
  ['Guests waving for a waiter to order, then again for the bill', 'Guests order from the QR on their table, with their choices, and pay from their phone. Waiters carry food instead of notepads.'],
  ['Orders written wrong, or lost between the table and the kitchen', 'The order arrives on the kitchen and bar screens exactly as the guest chose it: “Well done, side of mukimo, no chilli”.'],
  ['Tables that walk out, and money that doesn’t add up at closing', 'Every table has a running bill. Paid by M-Pesa prompt, cash or card, each shilling is recorded against it.'],
  ['Selling a dish you ran out of an hour ago', 'Mark it finished on any screen and it greys out on every guest’s menu at once. Stock-tracked items do it by themselves.'],
];

const STEPS = [
  { icon: QrCode, title: 'Scan', text: 'The guest scans the card on the table. The menu opens on their phone, no app, no sign-in.' },
  { icon: UtensilsCrossed, title: 'Order', text: 'They pick dishes and choices, add a note, and send. A waiter confirms the table once.' },
  { icon: ChefHat, title: 'Cook', text: 'Each station sees its own tickets, oldest first, with a timer. Done is one tap.' },
  { icon: BellRing, title: 'Serve', text: 'The floor screen says what’s ready, who’s calling and who wants the bill.' },
  { icon: Smartphone, title: 'Pay', text: 'An M-Pesa prompt on the guest’s phone, or cash and card to the waiter. A receipt either way.' },
];

const FEATURES = [
  { icon: QrCode, title: 'A QR menu on every table', text: 'Your dishes in sections, with prices, choices like spice and sides, “Guests love” picks and “goes well with” suggestions that lift the bill.' },
  { icon: ChefHat, title: 'Kitchen and bar screens', text: 'Any tablet becomes a ticket screen. Drinks go to the bar, food to the kitchen, each with its own timer and a chime for new orders.' },
  { icon: BellRing, title: 'The floor at a glance', text: 'Which tables to confirm, who is calling, what’s ready on the pass, who wants the bill and what’s still owed, sorted by what needs you first.' },
  { icon: Smartphone, title: 'M-Pesa at the table', text: 'Guests pay the bill from their own phone with an M-Pesa prompt. Prefer cash, card or a paybill code? The waiter records it in two taps.' },
  { icon: ShieldCheck, title: 'No fake orders, no walk-outs', text: 'A waiter confirms each new table, so nobody orders from a photo of the QR at home. Clearing an unpaid table needs the owner.' },
  { icon: BarChart3, title: 'Your night in numbers', text: 'Sales and money collected, the average bill, kitchen times, best sellers, busy hours and what guests said, today, this week or this month.' },
];

const NEEDS = [
  [QrCode, 'QR cards for your tables', 'Made for you, ready to print or download, one per table.'],
  [Tablet, 'A tablet or old phone per station', 'For the kitchen, the bar or the grill. No special terminals.'],
  [Smartphone, 'Your waiters’ phones', 'To see the floor, confirm tables and take orders by hand.'],
];

const COMPARE = [
  ['Guests order and pay from their own phone', 'yes', 'no', 'some'],
  ['Orders reach the kitchen exactly as the guest chose', 'yes', 'no', 'some'],
  ['M-Pesa prompt at the table', 'yes', 'no', 'some'],
  ['Sales, stock and books behind every bill', 'yes', 'no', 'add-on'],
  ['Nothing special to buy or install', 'yes', 'yes', 'no'],
  ['Published price in shillings', 'yes', 'yes', 'no'],
];

const QUESTIONS = [
  ['How much does it cost?', 'KSh 3,000 a month per branch, or KSh 30,000 for a year. That includes the QR menu, kitchen screens, up to 10 staff logins and the books behind every sale. You pay Kabuor by M-Pesa; your guests pay you directly, with no commission.'],
  ['Do guests need to download an app?', 'No. The QR opens the menu in their phone’s browser. It works on any smartphone, and guests without one can still order through the waiter, who takes it on their phone.'],
  ['Do we have to let guests pay before eating?', 'No, you choose. Sit-down restaurants run a tab and guests pay at the end. Cafés and counters can switch to pay-first, so the kitchen only cooks what’s paid for.'],
  ['What stops someone ordering from home with a photo of the QR?', 'A waiter confirms each new table before its first order reaches the kitchen. If a card goes missing, one tap gives that table a new code and the old one stops working.'],
  ['What hardware do we need?', 'Printed QR cards (we generate them, ready to print), and any tablet or old phone for each kitchen screen. No special printers or terminals.'],
  ['Is KRA eTIMS included?', 'Yes. Every bill is a proper invoice in your books, prepared for eTIMS, with the KRA details on the guest’s receipt once your eTIMS connection is live.'],
  ['Can it grow with us?', 'Kabuor Dine runs on Kabuor ERP. When you want payroll, purchasing, several branches or full accounts, you move up without moving your data.'],
];

function Mark({ v }) {
  if (v === 'yes') return <Check className="mx-auto h-5 w-5 text-[#0F7A3D]" strokeWidth={2.5} aria-label="Yes" />;
  if (v === 'no') return <X className="mx-auto h-5 w-5 text-[#a19f9d]" aria-label="No" />;
  return <span className="text-xs text-[var(--ms-muted)]">{v === 'add-on' ? 'Through add-ons' : 'Sometimes'}</span>;
}

export default function Dine({ info }) {
  useEffect(() => {
    document.title = 'Kabuor Dine · QR ordering and payments for restaurants';
  }, []);

  return (
    <CorporatePage cta={{ href: SIGNUP, label: 'Launch Kabuor Dine' }}>
      {/* Hero */}
      <section className="border-b border-[var(--ms-line)] bg-[#F5F7FC]">
        <div className="container-x grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:py-20">
          <div>
            <p className="text-sm font-semibold text-[var(--ms-blue)]">Kabuor Dine · New</p>
            <h1 className="mt-3 text-[2.25rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl">Guests order from the table. The kitchen sees it at once.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--ms-muted)]">
              A QR menu on every table, kitchen and bar screens, and the bill paid by M-Pesa from the guest’s own phone. Every sale lands in your books, with stock and KRA eTIMS taken care of.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={SIGNUP} {...ext} className="ms-btn ms-btn-primary">
                Launch Kabuor Dine
              </a>
              <a href="#demo" className="ms-btn ms-btn-secondary">
                Request a demo
              </a>
            </div>
            <p className="mt-4 text-sm text-[var(--ms-muted)]">
              KSh 3,000 a month per branch · Already using it?{' '}
              <a href={`${DINE_URL}/signin`} {...ext} className="ms-link">
                Sign in <ChevronRight className="h-4 w-4" />
              </a>
            </p>
          </div>
          {/* The real thing: the floor on a laptop, the guest's menu on a phone. */}
          <div className="relative mx-auto w-full max-w-xl sm:pr-[14%] sm:pb-8">
            <BrowserShot src="/brand/dine-floor.webp" alt="Kabuor Dine floor screen: every table, and which need a waiter now" address="dine.kabuor-technologies.company/dine" />
            <PhoneShot src="/brand/dine-guest-phone.webp" alt="A guest's QR menu on a phone" className="absolute right-0 bottom-0 hidden w-[28%] sm:block" />
          </div>
        </div>
        <div className="border-t border-[var(--ms-line)] bg-white">
          <ul className="container-x grid gap-4 py-6 sm:grid-cols-3">
            {FACTS.map(([title, text]) => (
              <li key={title} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ms-blue)]" strokeWidth={2.5} />
                <span>
                  <b className="block font-semibold">{title}</b>
                  <span className="text-sm text-[var(--ms-muted)]">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What changes */}
      <section aria-labelledby="fixes" className="py-10 sm:py-12">
        <div className="container-x">
          <SectionHead id="fixes" title="What changes on a busy night" text="From the first service." />
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

      {/* How an order travels */}
      <section id="how" aria-labelledby="how-title" className="scroll-mt-20 border-y border-[var(--ms-line)] bg-[var(--ms-soft)] py-10 sm:py-12">
        <div className="container-x">
          <SectionHead id="how-title" title="From the table to the kitchen to the till" text="How one order travels." />
          <ol className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t-2 border-[var(--ms-ink)] pt-5">
                <p className="text-sm font-semibold text-[var(--ms-muted)]">Step {i + 1}</p>
                <s.icon className="mt-3 h-6 w-6 text-[var(--ms-blue)]" strokeWidth={1.75} />
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-[0.9375rem] leading-relaxed text-[var(--ms-muted)]">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 grid items-end gap-6 lg:grid-cols-[1fr_auto]">
            <BrowserShot src="/brand/dine-kitchen.webp" alt="Kabuor Dine kitchen screen: a ticket with the guest's choices and a note for the cook" address="dine.kabuor-technologies.company/dine/kitchen" />
            <PhoneShot src="/brand/dine-guest-table.webp" alt="The guest follows their order and pays from their phone" className="mx-auto hidden w-48 lg:block" />
          </div>
        </div>
      </section>

      {/* What it does */}
      <section id="features" aria-labelledby="features-title" className="scroll-mt-20 py-10 sm:py-12">
        <div className="container-x">
          <SectionHead id="features-title" title="Everything a service needs" text="What Kabuor Dine does today." />
          <ul className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="rounded-lg border border-[var(--ms-line)] p-6">
                <f.icon className="h-6 w-6 text-[var(--ms-blue)]" strokeWidth={1.75} />
                <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-[0.9375rem] leading-relaxed text-[var(--ms-muted)]">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who it's for, and what you need */}
      <section aria-labelledby="who" className="border-t border-[var(--ms-line)] py-10 sm:py-12">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionHead id="who" title="Made for places that serve at tables" text="Usually 5 to 60 tables, paid by M-Pesa and cash, running today on paper orders and a waiter’s memory." />
            <ul className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {['Sit-down restaurants', 'Cafés and coffee shops', 'Hotel restaurants and room service', 'Bars, lounges and food courts'].map((x) => (
                <li key={x} className="flex gap-2 border-b border-[var(--ms-line)] py-2.5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ms-blue)]" strokeWidth={2.5} /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold">What you need</h3>
            <ol className="mt-5 grid gap-4 sm:grid-cols-3">
              {NEEDS.map(([Icon, title, text], i) => (
                <li key={title} className={i === 0 ? 'rounded-lg border border-[var(--ms-blue)] bg-[#F5F7FC] p-5' : 'rounded-lg border border-[var(--ms-line)] p-5'}>
                  <Icon className="h-6 w-6 text-[var(--ms-blue)]" strokeWidth={1.75} />
                  <p className="mt-3 font-semibold">{title}</p>
                  <p className="mt-1 text-[0.9375rem] text-[var(--ms-muted)]">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 border-y border-[var(--ms-line)] bg-[var(--ms-soft)] py-10 sm:py-12">
        <div className="container-x grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionHead id="pricing-title" title="Priced per branch, in shillings" text="Pay by M-Pesa to open your account, monthly or yearly; a year costs ten months. Everything is switched on from the first day." />
            <ul className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {['Tab or pay-first, your choice', 'As many kitchen and bar screens as you need', 'Waiters can still take orders by hand', 'Works on the phones guests already have', 'Your M-Pesa till or paybill, no commission', 'Moves up to Kabuor ERP when you grow'].map((x) => (
                <li key={x} className="flex gap-2 border-b border-[var(--ms-line)] py-2.5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ms-blue)]" strokeWidth={2.5} /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative flex flex-col rounded-lg border-2 border-[var(--ms-blue)] bg-white p-6 sm:p-8">
            <span className="absolute -top-3 left-6 rounded bg-[var(--ms-blue)] px-2.5 py-0.5 text-xs font-semibold text-white">Everything included</span>
            <h3 className="text-xl font-semibold">Kabuor Dine</h3>
            <p className="mt-1 text-sm text-[var(--ms-muted)]">One branch: the menu, the kitchen, the floor and the books</p>
            <p className="mt-5">
              <span className="text-3xl font-semibold">KSh 3,000</span> <span className="text-[var(--ms-muted)]">a month</span>
            </p>
            <p className="mt-1 text-sm text-[var(--ms-muted)]">or KSh 30,000 a year</p>
            <ul className="mt-5 flex-1 space-y-2 border-t border-[var(--ms-line)] pt-5 text-[0.9375rem]">
              {['QR menu and printable table cards', 'Kitchen and bar screens', 'Floor screen and waiter ordering', 'M-Pesa prompts at the table, eTIMS receipts', 'Sales, stock and books behind every bill', '10 staff logins'].map((x) => (
                <li key={x} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0F7A3D]" strokeWidth={2.5} />
                  {x}
                </li>
              ))}
            </ul>
            <a href={SIGNUP} {...ext} className="ms-btn ms-btn-primary mt-6">
              Launch Kabuor Dine
            </a>
          </div>
        </div>
      </section>

      {/* How it compares */}
      <section aria-labelledby="compare" className="py-10 sm:py-12">
        <div className="container-x">
          <SectionHead id="compare" title="Built for how Kenyan restaurants run" text="How Kabuor Dine compares with the way most places take orders today." />
          <div className="mt-8 overflow-x-auto rounded-lg border border-[var(--ms-line)]">
            <table className="w-full min-w-[40rem] text-[0.9375rem]">
              <thead>
                <tr className="border-b border-[var(--ms-line)] bg-[#FAFAFA] text-sm">
                  <th className="px-5 py-4 text-left font-semibold">
                    <span className="sr-only">Feature</span>
                  </th>
                  <th className="px-5 py-4 font-semibold text-[var(--ms-blue)]">Kabuor Dine</th>
                  <th className="px-5 py-4 font-semibold">Paper and a waiter</th>
                  <th className="px-5 py-4 font-semibold">Restaurant POS systems</th>
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
        <DemoRequest info={info} product="dine" className="[&>div]:rounded-lg [&>div]:ring-[var(--ms-line)]" />
      </div>
    </CorporatePage>
  );
}
