import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, Minus, Plus, ReceiptText, Trash2 } from 'lucide-react';
import ProductJar from '../components/ProductJar';
import { packLabel, tintFor } from '../components/Shop';
import { EASE } from '../components/ui';
import { cn, money } from '../lib/format';
import { useAdminApi, useAdminQuery } from '../store/admin';
import { Chips, MoneyInput, Section, TextArea, TextInput, Toggle } from './form';
import { MpesaSummary } from './MpesaPaste';
import { ErrorNote, PageHeader } from './shared';

const LAST_BRANCH = 'anjugu-last-branch';
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const readLastBranch = () => {
  try {
    return localStorage.getItem(LAST_BRANCH) ?? '';
  } catch {
    return '';
  }
};
const STATUS_OPTIONS = [
  { id: 'paid', label: 'Paid' },
  { id: 'delivered', label: 'Paid & handed over' },
  { id: 'pending', label: 'Not paid yet' },
];

function blankSale(branch = readLastBranch()) {
  return { channel: 'walkin', branch, date: today(), paymentMethod: 'mpesa', status: 'paid', customerName: '', phone: '', note: '', deductStock: true };
}

export default function RecordSale() {
  const call = useAdminApi();
  const meta = useAdminQuery('/sales/meta');
  const catalog = useAdminQuery('/products');
  const [sale, setSale] = useState(blankSale);
  const [lines, setLines] = useState([]); // { id, qty, unitPrice }
  const [state, setState] = useState({ saving: false, error: null, done: null });
  const set = (k) => (v) => setSale((s) => ({ ...s, [k]: v?.target ? v.target.value : v }));

  // Optional pasted M-Pesa message: fills in the customer, date and payment, and records the code.
  const location = useLocation();
  const [mpesaText, setMpesaText] = useState(() => location.state?.mpesaText ?? '');
  const [mpesa, setMpesa] = useState({ data: null, error: null });
  useEffect(() => {
    if (!mpesaText.trim()) return setMpesa({ data: null, error: null });
    const t = setTimeout(() => {
      call('/mpesa/read', { method: 'POST', body: { text: mpesaText } })
        .then((data) => {
          setMpesa({ data, error: null });
          const m = data.message;
          const fullPhone = m.phone && !m.phone.includes('*') ? m.phone : '';
          const day = m.paidAt ? new Date(m.paidAt).toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' }) : null;
          setSale((s) => ({
            ...s,
            paymentMethod: 'mpesa',
            customerName: s.customerName || (m.direction === 'sent' ? '' : m.payer ?? ''),
            phone: s.phone || fullPhone,
            date: day && day <= today() ? day : s.date,
          }));
        })
        .catch((err) => setMpesa({ data: null, error: err.message }));
    }, 350);
    return () => clearTimeout(t);
  }, [mpesaText, call]);

  const products = useMemo(() => (catalog.data ?? []).filter((p) => p.active), [catalog.data]);
  const byId = useMemo(() => new Map((catalog.data ?? []).map((p) => [p.id, p])), [catalog.data]);
  const total = lines.reduce((s, l) => s + (Number(l.unitPrice) || 0) * l.qty, 0);
  const units = lines.reduce((s, l) => s + l.qty, 0);

  const addProduct = (p) =>
    setLines((ls) => {
      const at = ls.findIndex((l) => l.id === p.id && l.unitPrice === p.price);
      if (at >= 0) return ls.map((l, i) => (i === at ? { ...l, qty: l.qty + 1 } : l));
      return [...ls, { id: p.id, qty: 1, unitPrice: p.price }];
    });
  const updateLine = (i, patch) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)).filter((l) => l.qty > 0));

  const submit = async () => {
    setState({ saving: true, error: null, done: null });
    try {
      const res = await call('/sales', {
        method: 'POST',
        body: { ...sale, mpesaText: mpesa.data ? mpesaText : undefined, items: lines.map((l) => ({ id: l.id, qty: l.qty, unitPrice: l.unitPrice === '' ? null : l.unitPrice })) },
      });
      try {
        localStorage.setItem(LAST_BRANCH, sale.branch);
      } catch {
        // Remembering the branch is a convenience only.
      }
      setState({ saving: false, error: null, done: res });
      catalog.reload();
    } catch (err) {
      setState({ saving: false, error: err.message, done: null });
    }
  };

  const again = () => {
    setLines([]);
    setSale((s) => ({ ...blankSale(s.branch), channel: s.channel, paymentMethod: s.paymentMethod }));
    setMpesaText('');
    setState({ saving: false, error: null, done: null });
  };

  if (state.done) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="mx-auto max-w-md pt-6 text-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 15 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-espresso text-honey">
          <Check className="h-9 w-9" strokeWidth={2.6} />
        </motion.span>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Sale recorded</h1>
        <p className="mt-2 text-espresso/60">
          <span className="font-mono font-bold text-caramel">{state.done.code}</span> · {state.done.units} item{state.done.units === 1 ? '' : 's'} · <b className="text-espresso">{money(state.done.total)}</b>
        </p>
        <p className="mt-1 text-sm text-espresso/50">It now shows in your analytics, orders and ledger.</p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button onClick={again} className="btn btn-primary">
            <Plus className="h-4 w-4" /> Record another sale
          </button>
          <Link to="/admin/orders" className="btn btn-ghost">
            <ReceiptText className="h-4 w-4" /> View orders
          </Link>
        </div>
      </motion.div>
    );
  }

  const m = meta.data;
  return (
    <>
      <PageHeader title="Record a sale" subtitle="For sales made outside the website: walk-ins, phone and WhatsApp orders, markets and wholesale." />
      {(meta.error || catalog.error) && <ErrorNote>{meta.error || catalog.error}</ErrorNote>}

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="min-w-0 space-y-5">
          <Section title="What was sold?" description="Tap a product to add it. Tap again to add another.">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {products.map((p) => {
                const inSale = lines.filter((l) => l.id === p.id).reduce((s, l) => s + l.qty, 0);
                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => addProduct(p)}
                    className={cn('relative flex flex-col items-center rounded-2xl p-2 pb-2.5 ring-1 transition', inSale ? 'bg-honey/15 ring-amber' : 'bg-white ring-espresso/10 hover:ring-espresso/30')}
                  >
                    <span className="relative block h-20 w-full overflow-hidden rounded-xl" style={tintFor(p.look)}>
                      <ProductJar look={p.look} size={p.size} showTag={false} className="absolute inset-0 m-auto h-[88%] w-[88%]" />
                    </span>
                    <span className="mt-1.5 text-sm font-extrabold">{p.size}</span>
                    <span className="text-[11px] text-espresso/55">{money(p.price)}</span>
                    {inSale > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-espresso px-1 text-xs font-bold text-honey ring-2 ring-cream">{inSale}</span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence initial={false}>
              {lines.map((l, i) => {
                const p = byId.get(l.id);
                if (!p) return null;
                const custom = l.unitPrice !== p.price;
                return (
                  <motion.div
                    key={`${l.id}-${i}`}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-beige/50 p-3 ring-1 ring-espresso/[0.06]">
                      <div className="min-w-0 flex-1 basis-40">
                        <p className="truncate font-bold">
                          {p.size} {packLabel(p.look)}
                        </p>
                        <p className="truncate text-xs text-espresso/50">{custom ? `Custom price (list ${money(p.price)})` : 'List price'}</p>
                      </div>
                      <div className="flex h-11 items-center rounded-full bg-white ring-1 ring-espresso/10">
                        <button type="button" onClick={() => updateLine(i, { qty: l.qty - 1 })} className="grid h-11 w-10 place-items-center rounded-l-full hover:bg-beige" aria-label="Fewer">
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          className="w-12 bg-transparent text-center font-bold tabular-nums outline-none"
                          inputMode="numeric"
                          value={l.qty}
                          onChange={(e) => updateLine(i, { qty: Math.max(0, Math.min(10000, Number(e.target.value.replace(/\D/g, '')) || 0)) })}
                          aria-label="Quantity"
                        />
                        <button type="button" onClick={() => updateLine(i, { qty: l.qty + 1 })} className="grid h-11 w-10 place-items-center rounded-r-full hover:bg-beige" aria-label="More">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <MoneyInput className="w-36" label="Price each" value={l.unitPrice} onChange={(v) => updateLine(i, { unitPrice: v })} />
                      <div className="w-24 pb-3 text-right font-extrabold tabular-nums">{money((Number(l.unitPrice) || 0) * l.qty)}</div>
                      <button type="button" onClick={() => updateLine(i, { qty: 0 })} className="mb-1.5 grid h-9 w-9 place-items-center rounded-full text-espresso/40 hover:bg-red-50 hover:text-red-700" aria-label="Remove">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Section>

          {m && (
            <Section title="Sale details">
              <Chips label="Where did the sale happen?" options={m.channels} value={sale.channel} onChange={set('channel')} />
              {m.branches.length > 0 && <Chips label="Branch" options={m.branches.map((b) => ({ id: b, label: b }))} value={sale.branch} onChange={set('branch')} />}
              <Chips label="Payment" options={m.payments} value={sale.paymentMethod} onChange={set('paymentMethod')} />
              <Chips label="Status" options={STATUS_OPTIONS} value={sale.status} onChange={set('status')} />
              <div className="grid gap-4 sm:grid-cols-3">
                <TextInput label="Date" type="date" max={today()} value={sale.date} onChange={set('date')} />
                <TextInput label="Customer name" optional value={sale.customerName} onChange={set('customerName')} placeholder="Walk-in customer" />
                <TextInput label="Phone" optional inputMode="tel" value={sale.phone} onChange={set('phone')} placeholder="0712 345 678" />
              </div>
              <TextArea
                label="M-Pesa message"
                optional
                rows={3}
                value={mpesaText}
                onChange={(e) => setMpesaText(e.target.value)}
                hint="Paste the M-Pesa confirmation SMS: the code is recorded and the customer, phone and date are filled in."
                placeholder="TJK4XYZ9PQ Confirmed. You have received Ksh350.00 from…"
              />
              {mpesa.error && <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">{mpesa.error}</p>}
              {mpesa.data && <MpesaSummary m={mpesa.data.message} />}
              {mpesa.data?.used && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">This M-Pesa code is already recorded on {mpesa.data.used.orderCode ?? 'another sale'}.</p>
              )}
              {mpesa.data && total > 0 && mpesa.data.message.amount !== total && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  The message is for {money(mpesa.data.message.amount)} but this sale adds up to {money(total)}.
                </p>
              )}
              <TextArea label="Note" optional rows={2} value={sale.note} onChange={set('note')} placeholder="Delivery details…" />
              <Toggle
                checked={sale.deductStock}
                onChange={set('deductStock')}
                label="Deduct from stock"
                description="Turn off if this stock was never counted in the system (e.g. sold from a separate batch)."
              />
            </Section>
          )}
        </div>

        <aside className="lg:sticky lg:top-8">
          <Section title="Summary">
            {lines.length === 0 ? (
              <p className="text-sm text-espresso/50">No products added yet.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {lines.map((l, i) => {
                  const p = byId.get(l.id);
                  return (
                    <li key={i} className="flex justify-between gap-3">
                      <span className="truncate text-espresso/70">
                        {l.qty} × {p?.size} {packLabel(p?.look)}
                      </span>
                      <span className="tabular-nums">{money((Number(l.unitPrice) || 0) * l.qty)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex items-baseline justify-between border-t border-espresso/10 pt-3">
              <span className="text-sm text-espresso/60">{units} item{units === 1 ? '' : 's'}</span>
              <span className="text-2xl font-extrabold tracking-tight tabular-nums">{money(total)}</span>
            </div>
            {state.error && <ErrorNote>{state.error}</ErrorNote>}
            <button onClick={submit} disabled={state.saving || lines.length === 0} className="btn btn-honey h-12 w-full">
              {state.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save sale
            </button>
          </Section>
        </aside>
      </div>
    </>
  );
}
