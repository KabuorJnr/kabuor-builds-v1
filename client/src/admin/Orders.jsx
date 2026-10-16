import { Fragment, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router';
import { BadgeCheck, ChevronDown, ChevronLeft, ChevronRight, Loader2, PackageCheck, ClipboardPaste, Plus, ReceiptText, Search, Truck, X } from 'lucide-react';
import { EASE } from '../components/ui';
import { cn, dateTime, money, num } from '../lib/format';
import { useAdminApi, useAdminQuery } from '../store/admin';
import MpesaPaste from './MpesaPaste';
import { ErrorNote, PageHeader, Segmented, StatusSelect } from './shared';

const PAGE = 20;
const CHANNELS = [
  { id: '', label: 'All orders' },
  { id: 'website', label: 'Website' },
  { id: 'offline', label: 'Recorded sales' },
];

function ChannelTag({ o }) {
  const web = o.channel === 'website';
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase', web ? 'bg-sky-50 text-sky-800' : 'bg-honey/20 text-caramel')}>
      {o.channelLabel ?? (web ? 'Website' : 'Recorded')}
    </span>
  );
}
const FILTERS = [
  { id: '', label: 'All' },
  { id: 'toconfirm', label: 'To confirm' },
  { id: 'pending', label: 'Pending' },
  { id: 'paid', label: 'Paid' },
  { id: 'sent', label: 'Sent' },
  { id: 'delivered', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];


const TEXT_KINDS = {
  'admin-order': 'New-order text to admin',
  'customer-confirmed': 'Order Confirmed text to customer',
};

const claimed = (o) => o.status === 'pending' && Boolean(o.payment_claimed_at);

// "Customer says paid": they tapped "I've paid" and are waiting for you to check M-Pesa.
function ClaimTag({ o }) {
  if (!claimed(o)) return null;
  return <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-900 uppercase">Says paid</span>;
}

// The one obvious next step for an order: confirm payment → send → complete.
function nextStep(o) {
  if (claimed(o)) return { to: 'paid', label: 'Confirm payment', icon: BadgeCheck, strong: true };
  if (o.status !== 'paid') return o.status === 'sent' ? { to: 'delivered', label: 'Mark delivered', icon: PackageCheck } : null;
  if (o.channel === 'website' && o.fulfilment !== 'pickup') return { to: 'sent', label: 'Mark as sent', icon: Truck };
  return { to: 'delivered', label: 'Mark completed', icon: PackageCheck };
}

function NextAction({ o, busy, onChange, className }) {
  const step = nextStep(o);
  if (!step) return null;
  const Icon = step.icon;
  return (
    <button
      type="button"
      disabled={busy}
      onClick={(e) => {
        e.stopPropagation();
        onChange(o, step.to);
      }}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-bold whitespace-nowrap transition disabled:opacity-50',
        step.strong ? 'bg-honey text-espresso hover:bg-amber' : 'bg-espresso/[0.06] text-espresso hover:bg-espresso/10',
        className,
      )}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {step.label}
    </button>
  );
}

// WhatsApp's mark, drawn inline (icon sets don't ship brand logos).
function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3Z" />
    </svg>
  );
}

// Opens WhatsApp with the customer's number and the "Order Confirmed" message filled in; you tap Send there.
function WhatsAppConfirm({ o, onOpened, className, children }) {
  return (
    <a
      href={o.whatsapp.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation();
        onOpened(o);
      }}
      className={cn('inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-bold text-[#0b3d1f] transition hover:bg-[#1ebe5a]', className)}
    >
      <WhatsAppIcon className="h-4 w-4" />
      {children ?? (o.whatsapp_confirmed_at ? 'Send again on WhatsApp' : 'Send “Order Confirmed” on WhatsApp')}
    </a>
  );
}

// Shown right after a payment is confirmed: the next step is telling the customer.
function ConfirmedBar({ o, onOpened, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 flex flex-col gap-3 rounded-2xl bg-emerald-50 p-3.5 ring-1 ring-emerald-200 sm:flex-row sm:items-center"
    >
      <p className="min-w-0 flex-1 text-sm text-emerald-950">
        <b>Payment confirmed.</b> Send {o.customer_name.split(' ')[0]} their “Order Confirmed” message.
      </p>
      <div className="flex items-center gap-2">
        <WhatsAppConfirm o={o} onOpened={onOpened} className="flex-1 sm:flex-none">
          Send on WhatsApp
        </WhatsAppConfirm>
        <button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-emerald-900/60 hover:bg-emerald-100" aria-label="Not now">
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

const CONFIRMABLE = ['paid', 'sent', 'delivered'];

function Details({ o, onWhatsApp }) {
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
      <div className="grid gap-4 rounded-2xl bg-beige/60 p-4 text-sm sm:grid-cols-2">
        <div>
          <div className="text-xs font-semibold tracking-wider text-espresso/45 uppercase">Items</div>
          <ul className="mt-2 space-y-1">
            {o.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span>{i.qty} × {i.name}</span>
                <span className="tabular-nums">{money(i.unit_price * i.qty)}</span>
              </li>
            ))}
            <li className="flex justify-between gap-3 text-espresso/55">
              <span>Delivery</span>
              <span className="tabular-nums">{o.delivery_fee ? money(o.delivery_fee) : 'Free'}</span>
            </li>
            <li className="flex justify-between gap-3 border-t border-espresso/10 pt-1 font-bold">
              <span>Total</span>
              <span className="tabular-nums">{money(o.total)}</span>
            </li>
          </ul>
        </div>
        <div className="space-y-1 text-espresso/70">
          <div className="text-xs font-semibold tracking-wider text-espresso/45 uppercase">{o.channel !== 'website' ? `${o.channelLabel} sale` : o.fulfilment === 'pickup' ? 'Pickup order' : 'Deliver to'}</div>
          <p className="mt-2 font-semibold text-espresso">{o.customer_name}</p>
          {o.branch && <p>Handled by the <b className="text-espresso">{o.branch}</b> branch</p>}
          {o.channel === 'website' && <p>{o.fulfilment === 'pickup' ? `Collect at ${o.address}` : `${o.address}, ${o.city}`}</p>}
          {(o.phone || o.email) && <p>{[o.phone, o.email].filter(Boolean).join(' · ')}</p>}
          {o.mpesa && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-950">
              <b>M-Pesa {o.mpesa.code}</b> · {money(o.mpesa.amount)}
              {o.mpesa.payer || o.mpesa.phone ? ` from ${[o.mpesa.payer, o.mpesa.phone].filter(Boolean).join(' ')}` : ''}
              {o.mpesa.paid_at ? ` · ${dateTime(o.mpesa.paid_at)}` : ''}
              {o.mpesa.amount < o.total && <span className="block text-xs text-red-700">Paid {money(o.total - o.mpesa.amount)} less than the order total.</span>}
            </p>
          )}
          {o.payment_claimed_at && !o.mpesa && (
            <p className={cn('rounded-xl px-3 py-2', claimed(o) ? 'bg-amber-100/70 text-amber-950' : 'bg-white/60')}>
              Customer tapped “I’ve paid” {dateTime(o.payment_claimed_at)}.{' '}
              {o.payment_ref ? (
                <>
                  M-Pesa code <b className="font-mono">{o.payment_ref}</b>
                </>
              ) : (
                'No M-Pesa code given.'
              )}
              {claimed(o) && <span className="block text-xs opacity-75">Check your M-Pesa statement, then confirm the payment.</span>}
            </p>
          )}
          <p>
            {o.status === 'pending' ? 'Paying by' : 'Paid by'} {o.paymentLabel}
            {o.mpesaReceipt && (
              <>
                {' · '}
                <b className="font-mono text-espresso">{o.mpesaReceipt}</b>
              </>
            )}
          </p>
          {o.note && <p className="italic">“{o.note}”</p>}
          {o.receiptPath && (
            <a
              href={o.receiptPath}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-caramel hover:underline"
            >
              <ReceiptText className="h-4 w-4" /> View / print receipt
            </a>
          )}
          {o.whatsapp && CONFIRMABLE.includes(o.status) && (
            <div className="space-y-1.5 pt-2">
              <WhatsAppConfirm o={o} onOpened={onWhatsApp} className="w-full sm:w-auto" />
              <p className="text-xs">
                {o.whatsapp_confirmed_at ? `Opened in WhatsApp ${dateTime(o.whatsapp_confirmed_at)}.` : 'Not sent yet.'} Opens WhatsApp with the message ready; tap Send there.
              </p>
            </div>
          )}
          {o.texts?.length > 0 && (
            <div className="pt-1">
              <div className="text-xs font-semibold tracking-wider text-espresso/45 uppercase">Texts (SMS)</div>
              <ul className="mt-1 space-y-0.5 text-xs">
                {o.texts.map((t, i) => (
                  <li key={i} className={t.status === 'sent' ? 'text-emerald-800' : 'text-red-700'}>
                    {t.status === 'sent' ? '✓' : '✗'} {TEXT_KINDS[t.kind] ?? t.kind} · {t.phone}
                    {t.status !== 'sent' && t.error ? ` · ${t.error}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Orders() {
  const call = useAdminApi();
  // Alerts link here with ?q=<order code>; the Overview links with ?status=toconfirm.
  const [params0] = useSearchParams();
  const [status, setStatus] = useState(() => (FILTERS.some((f) => f.id === params0.get('status')) ? params0.get('status') : ''));
  const [channel, setChannel] = useState('');
  const [q, setQ] = useState(() => params0.get('q') ?? '');
  const [query, setQuery] = useState(() => (params0.get('q') ?? '').trim());
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(null);
  const [saving, setSaving] = useState(null);
  const [justConfirmed, setJustConfirmed] = useState(null);
  const [pasting, setPasting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(q.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const params = new URLSearchParams({ limit: PAGE, offset: page * PAGE, ...(status && { status }), ...(channel && { channel }), ...(query && { q: query }) });
  const { data, error, loading, setData, reload } = useAdminQuery(`/orders?${params}`);
  const [actionError, setActionError] = useState(null);

  const changeStatus = async (o, next) => {
    setSaving(o.id);
    setActionError(null);
    try {
      await call(`/orders/${o.id}`, { method: 'PATCH', body: { status: next } });
      setData((d) => ({ ...d, orders: d.orders.map((x) => (x.id === o.id ? { ...x, status: next } : x)) }));
      if (next === 'paid' && o.status === 'pending' && o.whatsapp) setJustConfirmed(o.id);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(null);
    }
  };

  // A payment confirmed from a pasted M-Pesa message: show that order, then offer the WhatsApp message.
  const mpesaConfirmed = (res) => {
    setPasting(false);
    setStatus('');
    setChannel('');
    setPage(0);
    setQ(res.code);
    setQuery(res.code);
    setOpen(null);
    if (res.status === 'paid') setJustConfirmed(res.id);
    reload();
  };

  // Record that the WhatsApp message was opened (the link itself opens WhatsApp straight away).
  const whatsappOpened = (o) => {
    setJustConfirmed((id) => (id === o.id ? null : id));
    call(`/orders/${o.id}/whatsapp`, { method: 'POST' })
      .then(({ whatsapp_confirmed_at }) => setData((d) => ({ ...d, orders: d.orders.map((x) => (x.id === o.id ? { ...x, whatsapp_confirmed_at } : x)) })))
      .catch(() => {});
  };

  const total = data?.total ?? 0;
  const from = total ? page * PAGE + 1 : 0;
  const to = Math.min(total, (page + 1) * PAGE);

  return (
    <>
      <PageHeader title="Orders" subtitle="Website orders and sales you recorded by hand. Cancelling an order puts its stock back on the shelf.">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setPasting(true)} className="btn btn-honey">
            <ClipboardPaste className="h-4 w-4" /> Paste M-Pesa message
          </button>
          <Link to="/admin/sales/new" className="btn btn-primary">
            <Plus className="h-4 w-4" /> Record a sale
          </Link>
        </div>
      </PageHeader>
      <MpesaPaste open={pasting} onClose={() => setPasting(false)} onConfirmed={mpesaConfirmed} />

      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="relative md:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-espresso/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search code, name, phone, branch" className="field rounded-full! pl-11" />
        </label>
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <Segmented
            id="channel"
            options={CHANNELS}
            value={channel}
            onChange={(c) => {
              setChannel(c);
              setPage(0);
            }}
            className="w-max"
          />
        </div>
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <Segmented
            id="status"
            options={FILTERS}
            value={status}
            onChange={(s) => {
              setStatus(s);
              setPage(0);
            }}
            className="w-max"
          />
        </div>
      </div>

      {(error || actionError) && <div className="mb-4"><ErrorNote>{error || actionError}</ErrorNote></div>}

      <div className={cn('card overflow-hidden transition-opacity', loading && data && 'opacity-60')}>
        {/* desktop table */}
        <table className="hidden w-full text-sm md:table">
          <thead>
            <tr className="border-b border-espresso/[0.07] text-left text-xs font-semibold tracking-wider text-espresso/45 uppercase">
              <th className="py-3.5 pl-6">Order</th>
              <th className="py-3.5">Customer</th>
              <th className="py-3.5">Payment</th>
              <th className="py-3.5 text-right">Jars</th>
              <th className="py-3.5 text-right">Total</th>
              <th className="py-3.5 pl-6">Status</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {data?.orders.map((o) => (
              <Fragment key={o.id}>
                <tr onClick={() => setOpen(open === o.id ? null : o.id)} className="cursor-pointer border-b border-espresso/[0.05] transition hover:bg-beige/40">
                  <td className="py-3.5 pl-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] font-semibold">{o.code}</span>
                      <ChannelTag o={o} />
                      <ClaimTag o={o} />
                    </div>
                    <div className="text-xs text-espresso/50">{dateTime(o.created_at)}</div>
                  </td>
                  <td className="py-3.5">
                    <div className="font-semibold">{o.customer_name}</div>
                    <div className="text-xs text-espresso/50">{o.branch ? `${o.branch} branch` : o.city}{o.channel === 'website' && o.branch && o.city ? ` · ${o.city}` : ''}</div>
                  </td>
                  <td className="py-3.5 text-espresso/70">{o.paymentLabel}</td>
                  <td className="py-3.5 text-right tabular-nums">{o.items_count}</td>
                  <td className="py-3.5 text-right font-semibold tabular-nums">{money(o.total)}</td>
                  <td className="py-3.5 pl-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusSelect status={o.status} disabled={saving === o.id} onChange={(s) => changeStatus(o, s)} />
                      <NextAction o={o} busy={saving === o.id} onChange={changeStatus} />
                    </div>
                  </td>
                  <td className="pr-4">
                    <ChevronDown className={cn('h-4 w-4 text-espresso/40 transition-transform', open === o.id && 'rotate-180')} />
                  </td>
                </tr>
                <tr>
                  <td colSpan={7} className="px-6">
                    <AnimatePresence>
                      {justConfirmed === o.id && <ConfirmedBar key="bar" o={o} onOpened={whatsappOpened} onClose={() => setJustConfirmed(null)} />}
                    </AnimatePresence>
                    <AnimatePresence>{open === o.id && <div className="py-3"><Details o={o} onWhatsApp={whatsappOpened} /></div>}</AnimatePresence>
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>

        {/* mobile cards */}
        <ul className="divide-y divide-espresso/[0.06] md:hidden">
          {data?.orders.map((o) => (
            <li key={o.id} className="p-4">
              <button onClick={() => setOpen(open === o.id ? null : o.id)} className="flex w-full items-start gap-3 text-left">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[13px] font-semibold">{o.code}</span>
                    <ChannelTag o={o} />
                    <ClaimTag o={o} />
                  </div>
                  <div className="mt-0.5 truncate font-semibold">{o.customer_name}</div>
                  <div className="text-xs text-espresso/50">
                    {dateTime(o.created_at)} · {o.branch ?? o.city} · {o.items_count} items
                  </div>
                </div>
                <span className="font-semibold tabular-nums">{money(o.total)}</span>
              </button>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusSelect status={o.status} disabled={saving === o.id} onChange={(s) => changeStatus(o, s)} />
                <NextAction o={o} busy={saving === o.id} onChange={changeStatus} />
                <button onClick={() => setOpen(open === o.id ? null : o.id)} className="ml-auto text-xs font-semibold text-caramel">
                  {open === o.id ? 'Hide details' : 'Details'}
                </button>
              </div>
              <AnimatePresence>
                {justConfirmed === o.id && <ConfirmedBar key="bar" o={o} onOpened={whatsappOpened} onClose={() => setJustConfirmed(null)} />}
              </AnimatePresence>
              <AnimatePresence>{open === o.id && <div className="pt-3"><Details o={o} onWhatsApp={whatsappOpened} /></div>}</AnimatePresence>
            </li>
          ))}
        </ul>

        {data && data.orders.length === 0 && <p className="p-10 text-center text-espresso/55">No orders match your filters.</p>}
        {!data && loading && <div className="h-80 animate-pulse bg-beige/50" />}

        {data && total > 0 && (
          <div className="flex items-center justify-between border-t border-espresso/[0.07] px-4 py-3 text-sm sm:px-6">
            <span className="text-espresso/55">
              {num(from)}–{num(to)} of {num(total)}
            </span>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-espresso/10 transition hover:bg-beige disabled:opacity-30" aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button disabled={to >= total} onClick={() => setPage((p) => p + 1)} className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-espresso/10 transition hover:bg-beige disabled:opacity-30" aria-label="Next page">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
