import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, Check, Printer, Share2 } from 'lucide-react';
import { ApbMark } from '../components/ui';
import { Tagline } from '../components/LoveNutHome';
import { api } from '../lib/api';
import { cn, money, setCurrency } from '../lib/format';

const when = (iso) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' });

const STAMPS = {
  paid: { text: 'PAID', cls: 'border-amber text-amber' },
  sent: { text: 'PAID', cls: 'border-amber text-amber' },
  delivered: { text: 'PAID', cls: 'border-amber text-amber' },
  pending: { text: 'UNPAID', cls: 'border-red-600/70 text-red-600/80' },
  cancelled: { text: 'CANCELLED', cls: 'border-red-600/70 text-red-600/80' },
};

// Decorative till-style barcode drawn from the order code (it is not meant to be scanned).
function Bars({ code }) {
  const bars = [...code].flatMap((ch) => {
    const n = ch.charCodeAt(0);
    return [1 + (n % 3), 1 + ((n >> 2) % 2), 1 + ((n >> 3) % 3), 1];
  });
  return (
    <div className="flex h-12 items-stretch justify-center gap-[2px]" aria-hidden>
      {bars.map((w, i) => (
        <span key={i} className={i % 2 ? 'bg-transparent' : 'bg-espresso'} style={{ width: w * 1.6 }} />
      ))}
    </div>
  );
}

const Rule = () => <div className="my-3 border-t border-dashed border-espresso/35" />;

function Row({ label, value, strong, className }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3', strong && 'font-bold', className)}>
      <span className="text-espresso/70">{label}</span>
      <span className="text-right tabular-nums">{value}</span>
    </div>
  );
}

export default function Receipt() {
  const { code } = useParams();
  const [params] = useSearchParams();
  const [state, setState] = useState({ data: null, error: null });
  const [shared, setShared] = useState(false);

  // The receipt sits on the beige "counter"; match the page behind it so no other colour shows.
  useEffect(() => {
    const previous = document.body.style.background;
    document.body.style.background = 'var(--color-beige)';
    return () => {
      document.body.style.background = previous;
    };
  }, []);

  useEffect(() => {
    api(`/receipts/${encodeURIComponent(code)}?t=${encodeURIComponent(params.get('t') ?? '')}`)
      .then((data) => {
        setCurrency(data.currency);
        setState({ data, error: null });
        document.title = `Receipt ${data.code} · ${data.brand.name}`;
      })
      .catch((err) => setState({ data: null, error: err.status === 404 ? 'This receipt link isn’t valid.' : err.message }));
  }, [code, params]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `Receipt ${code}`, url });
      else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1800);
      }
    } catch {
      // Sharing was cancelled; nothing to do.
    }
  };

  const r = state.data;
  const stamp = r && STAMPS[r.status];
  const paid = r && ['paid', 'sent', 'delivered'].includes(r.status);

  return (
    <div className="receipt-page bg-dots min-h-svh bg-beige px-4 py-8 sm:py-12">
      <div className="no-print mx-auto mb-6 flex max-w-[380px] items-center justify-between gap-2">
        <Link to="/" className="btn btn-ghost h-10 px-4 text-sm">
          <ArrowLeft className="h-4 w-4" /> Shop
        </Link>
        {r && (
          <div className="flex gap-2">
            <button onClick={share} className="btn btn-ghost h-10 px-4 text-sm">
              {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />} {shared ? 'Link copied' : 'Share'}
            </button>
            <button onClick={() => window.print()} className="btn btn-primary h-10 px-4 text-sm">
              <Printer className="h-4 w-4" /> Print / PDF
            </button>
          </div>
        )}
      </div>

      {state.error && <p className="mx-auto max-w-[380px] rounded-[var(--r-lg)] bg-white p-6 text-center text-espresso/70">{state.error}</p>}
      {!r && !state.error && <div className="mx-auto h-[640px] max-w-[380px] animate-pulse rounded-[var(--r-md)] bg-white/70" />}

      {r && (
        <div className="receipt-shadow mx-auto max-w-[380px]">
          <article className="receipt-paper relative bg-[#fffdf8] px-6 pt-10 pb-12 font-mono text-[13px] leading-relaxed text-espresso">
            {/* header */}
            <header className="text-center font-sans">
              <ApbMark className="mx-auto h-12 w-24" />
              <h1 className="mt-2 leading-none">
                <span className="block font-brand text-2xl text-cocoa">{r.brand.name}</span>
              </h1>
              {r.brand.tagline && (
                <p className="mt-1.5 flex justify-center">
                  <Tagline text={r.brand.tagline} className="h-6" textClassName="text-xl leading-none text-amber" />
                </p>
              )}
              {r.branch && (
                <p className="mt-1 text-xs text-espresso/70">
                  {r.branch.city} branch{r.branch.country && r.branch.country !== 'Kenya' ? `, ${r.branch.country}` : ''} · {r.branch.phone}
                </p>
              )}
            </header>

            <Rule />
            <p className="text-center font-bold tracking-[0.3em]">SALES RECEIPT</p>
            <Rule />

            <div className="space-y-0.5">
              <Row label="Receipt no." value={r.code} strong />
              <Row label="Date" value={when(r.createdAt)} />
              <Row label="Sold via" value={r.channel} />
              <Row label="Customer" value={r.customer.name} />
              {r.customer.phone && <Row label="Phone" value={r.customer.phone} />}
              {r.deliverTo && <Row label="Deliver to" value={r.deliverTo} />}
            </div>

            <Rule />
            <div className="flex justify-between text-[11px] font-bold tracking-wider text-espresso/55">
              <span>ITEM</span>
              <span>AMOUNT</span>
            </div>
            <ul className="mt-1.5 space-y-2">
              {r.items.map((i, k) => (
                <li key={k}>
                  <div className="flex justify-between gap-3">
                    <span>
                      {i.qty} x {i.label}
                    </span>
                    <span className="tabular-nums">{money(i.unitPrice * i.qty)}</span>
                  </div>
                  {i.qty > 1 && <div className="text-[11px] text-espresso/50">@ {money(i.unitPrice)} each</div>}
                </li>
              ))}
            </ul>

            <Rule />
            <div className="relative space-y-0.5">
              <Row label="Subtotal" value={money(r.subtotal)} />
              <Row
                label="Delivery"
                value={r.deliveryFee ? money(r.deliveryFee) : r.fulfilment === 'pickup' ? 'Pickup' : r.deliverTo ? 'Paid to rider' : '-'}
              />
              <div className="mt-2 flex items-baseline justify-between border-y-2 border-espresso py-2 font-sans">
                <span className="text-sm font-extrabold tracking-[0.2em]">TOTAL</span>
                <span className="text-2xl font-extrabold tabular-nums">{money(r.total)}</span>
              </div>
              {stamp && (
                <span
                  className={cn(
                    'pointer-events-none absolute top-[-0.4rem] left-[38%] -rotate-[14deg] rounded-md border-[3px] border-double px-3 py-0.5 font-sans text-2xl font-black tracking-[0.2em] opacity-80 mix-blend-multiply',
                    stamp.cls,
                  )}
                >
                  {stamp.text}
                </span>
              )}
            </div>

            <div className="mt-3 space-y-0.5">
              <Row label="Payment" value={r.payment.method} />
              {r.payment.ref && <Row label="M-Pesa ref" value={r.payment.ref} strong />}
              {!paid && r.status !== 'cancelled' && r.payment.paybill?.business && (
                <p className="mt-2 rounded-md bg-honey/10 px-2.5 py-2 text-[12px]">
                  Pay via M-Pesa {r.payment.paybill.kind === 'till' ? 'Buy Goods, Till' : 'Paybill'} <b>{r.payment.paybill.business}</b>
                  {r.payment.paybill.account && (
                    <>
                      , Account <b>{r.payment.paybill.account}</b>
                    </>
                  )}
                  .
                </p>
              )}
            </div>

            <Rule />
            <footer className="text-center">
              <p className="font-sans font-bold">Thank you for shopping with us!</p>
              {r.deliverTo && r.deliveryNote && <p className="mt-1 text-[11px] text-espresso/55">{r.deliveryNote}</p>}
              <div className="mt-4">
                <Bars code={r.code} />
                <p className="mt-1 text-[11px] tracking-[0.35em]">{r.code}</p>
              </div>
              <p className="mt-4 flex justify-center">
                <Tagline text={r.brand.tagline || r.brand.name} className="h-7" textClassName="text-2xl leading-none text-amber" />
              </p>
              <p className="mt-2 text-[10px] text-espresso/45">Keep this receipt for your records.</p>
            </footer>
          </article>
        </div>
      )}
    </div>
  );
}
