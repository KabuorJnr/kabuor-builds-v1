// "Request a demo": the person is deciding whether asking is worth their time. So the form asks only what we
// need to prepare a useful demo (which product, who, how to reach them, how big), says exactly what happens
// next, and offers WhatsApp as the instant alternative, before and after sending.
import { useState } from 'react';
import { ArrowRight, Check, Loader2, MessageCircle } from 'lucide-react';
import { cn } from '../lib/format';
import { papi } from './shared';
import { whatsapp } from './Site';

const PRODUCTS = [
  ['erp', 'Kabuor ERP', 'Sales, M-Pesa, stock, books, payroll'],
  ['shops', 'Kabuor Shops', 'Your own online shop'],
  ['both', 'Both', 'Shop orders flowing into the books'],
];
const STAFF = [
  ['1', 'Just me'],
  ['2-10', '2–10'],
  ['11-50', '11–50'],
  ['50+', '50+'],
];
const NAMES = { erp: 'Kabuor ERP', shops: 'Kabuor Shops', both: 'Kabuor ERP and Kabuor Shops' };

export default function DemoRequest({ info, product: initial = 'erp', id = 'demo', className }) {
  const [f, setF] = useState({ product: initial, name: '', business: '', phone: '', email: '', staff: '', note: '', website: '' });
  const [state, setState] = useState({ busy: false, error: '', sent: false });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const message = `Hi ${info?.name ?? 'Kabuor Builds'}, I'm ${f.name || '…'} from ${f.business || '…'}. I'd like a demo of ${NAMES[f.product]}.`;

  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: '', sent: false });
    try {
      await papi('/demo', { method: 'POST', body: f });
      setState({ busy: false, error: '', sent: true });
    } catch (err) {
      setState({ busy: false, error: err.message, sent: false });
    }
  };

  return (
    <section id={id} className={cn('scroll-mt-6', className)}>
      <div className="grid gap-10 rounded-[var(--r-xl)] bg-white p-6 ring-1 ring-espresso/[0.08] sm:p-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="kb-kicker text-caramel">Request a demo</p>
          <h2 className="kb-display mt-3 text-4xl sm:text-5xl">See it with your own business.</h2>
          <p className="mt-4 max-w-md text-espresso/65">30 minutes on WhatsApp video or at your shop. We set it up with your products and a few real invoices, so you see what your day would look like.</p>
          <ol className="mt-6 space-y-3 text-espresso/75">
            {['You send this form (a minute).', 'We WhatsApp you within one working day to pick a time.', 'You see it working with your own numbers. No payment, no commitment.'].map((x, i) => (
              <li key={x} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#ECEBFF] text-sm font-bold text-[#3A2BC9]">{i + 1}</span>
                <span className="pt-0.5">{x}</span>
              </li>
            ))}
          </ol>
          {info?.phone && (
            <p className="mt-6 text-sm text-espresso/60">
              In a hurry?{' '}
              <a href={whatsapp(info.phone, message)} target="_blank" rel="noreferrer" className="font-semibold text-[#1E8E3E] hover:underline">
                WhatsApp {info.phone}
              </a>
            </p>
          )}
        </div>

        {state.sent ? (
          <div className="grid place-items-center rounded-[var(--r-lg)] bg-beige p-8 text-center" role="status">
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-7 w-7" />
              </span>
              <h3 className="kb-display mt-4 text-3xl">Thanks, {f.name.split(' ')[0]}.</h3>
              <p className="mx-auto mt-2 max-w-sm text-espresso/65">We’ll WhatsApp you on {f.phone} within one working day to pick a time for your {NAMES[f.product]} demo.</p>
              {info?.phone && (
                <a href={whatsapp(info.phone, message)} target="_blank" rel="noreferrer" className="btn mt-6 bg-[#1E8E3E] px-6 py-3.5 text-[#fff] hover:bg-[#176F30]">
                  <MessageCircle className="h-4 w-4" /> Want it sooner? WhatsApp us now
                </a>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">What would you like to see?</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {PRODUCTS.map(([id, name, line]) => (
                  <label key={id} className={cn('cursor-pointer rounded-[var(--r-md)] p-3 ring-1 transition', f.product === id ? 'bg-[#ECEBFF] ring-2 ring-[#2357F5]' : 'bg-white ring-espresso/15 hover:ring-espresso/30')}>
                    <input type="radio" name="product" value={id} checked={f.product === id} onChange={set('product')} className="sr-only" />
                    <b className="block">{name}</b>
                    <span className="text-sm text-espresso/60">{line}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Your name</span>
                <input className="field" required autoComplete="name" value={f.name} onChange={set('name')} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Business name</span>
                <input className="field" required autoComplete="organization" value={f.business} onChange={set('business')} placeholder="e.g. Mama Pili Sauces" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">WhatsApp number</span>
                <input className="field" required inputMode="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} placeholder="0712 345 678" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">
                  Email <span className="font-normal text-espresso/50">(optional)</span>
                </span>
                <input className="field" type="email" autoComplete="email" value={f.email} onChange={set('email')} />
              </label>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">How many people work there?</legend>
              <div className="flex flex-wrap gap-2">
                {STAFF.map(([id, label]) => (
                  <label key={id} className={cn('cursor-pointer rounded-full px-4 py-2 text-sm font-semibold ring-1', f.staff === id ? 'bg-espresso text-cream ring-espresso' : 'bg-white ring-espresso/15 hover:ring-espresso/30')}>
                    <input type="radio" name="staff" value={id} checked={f.staff === id} onChange={set('staff')} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">
                What should we show you? <span className="font-normal text-espresso/50">(optional)</span>
              </span>
              <textarea className="field min-h-24" value={f.note} onChange={set('note')} placeholder="e.g. we sell to supermarkets on credit and lose track of who has paid" />
            </label>
            {/* Hidden from people; bots fill it in. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} className="hidden" aria-hidden="true" />
            {state.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">{state.error}</p>}
            <button className="btn w-full bg-[#2357F5] px-6 py-4 text-base text-white hover:bg-[#3A6BFF] sm:w-auto" disabled={state.busy}>
              {state.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Request my demo <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
