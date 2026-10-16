import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { AlertTriangle, BadgeCheck, ClipboardPaste, Loader2, Plus, X } from 'lucide-react';
import { EASE, useLockBody } from '../components/ui';
import { cn, dateTime, money } from '../lib/format';
import { useAdminApi } from '../store/admin';
import { StatusBadge } from './shared';

// What was read from the message, shown so the admin can check it before confirming.
export function MpesaSummary({ m, className }) {
  const rows = [
    ['Code', m.code],
    ['Amount', m.amount != null ? money(m.amount) : null],
    [m.direction === 'sent' ? 'Paid to' : 'From', [m.direction === 'sent' ? m.payee : m.payer, m.phone].filter(Boolean).join(' · ') || null],
    ['When', m.paidAt ? dateTime(m.paidAt) : null],
    ['Account', m.account],
  ].filter(([, v]) => v);
  return (
    <dl className={cn('grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-2xl bg-emerald-50 px-4 py-3 text-sm ring-1 ring-emerald-200', className)}>
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-emerald-900/60">{k}</dt>
          <dd className={cn('min-w-0 truncate font-semibold text-emerald-950', k === 'Code' && 'font-mono')}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

// "Paste M-Pesa message": reads the SMS, suggests the matching order, and confirms its payment.
export default function MpesaPaste({ open, onClose, onConfirmed }) {
  const call = useAdminApi();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [read, setRead] = useState({ loading: false, data: null, error: null });
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  useLockBody(open);

  useEffect(() => {
    if (!open) {
      setText('');
      setRead({ loading: false, data: null, error: null });
      setError(null);
    }
  }, [open]);

  // Read the message shortly after typing/pasting stops.
  useEffect(() => {
    if (!text.trim()) return setRead({ loading: false, data: null, error: null });
    setRead((r) => ({ ...r, loading: true }));
    const t = setTimeout(() => {
      call('/mpesa/read', { method: 'POST', body: { text } })
        .then((data) => setRead({ loading: false, data, error: null }))
        .catch((err) => setRead({ loading: false, data: null, error: err.message }));
    }, 350);
    return () => clearTimeout(t);
  }, [text, call]);

  const confirm = async (match) => {
    setBusy(match.id);
    setError(null);
    try {
      const res = await call(`/orders/${match.id}/mpesa`, { method: 'POST', body: { text } });
      onConfirmed(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const asSale = () => navigate('/admin/sales/new', { state: { mpesaText: text } });

  const d = read.data;
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] bg-espresso/40 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Paste M-Pesa message"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.45, ease: EASE }}
            className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[92svh] flex-col rounded-t-[2rem] bg-cream md:inset-0 md:m-auto md:h-fit md:max-h-[88vh] md:w-[calc(100%-3rem)] md:max-w-xl md:rounded-[2rem]"
          >
            <header className="flex items-center gap-3 border-b border-espresso/[0.07] px-5 py-4 sm:px-6">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-espresso text-honey">
                <ClipboardPaste className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-extrabold tracking-tight">Paste M-Pesa message</h2>
              <button onClick={onClose} className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-espresso/10" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">The confirmation SMS</span>
                <textarea
                  autoFocus
                  className="field min-h-[112px] resize-none font-mono text-sm"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="TJK4XYZ9PQ Confirmed. You have received Ksh350.00 from AKINYI OTIENO 0722111222 on 11/10/26 at 2:15 PM…"
                />
                <span className="mt-1.5 block text-xs text-espresso/50">Copy the whole M-Pesa message from your phone and paste it here.</span>
              </label>

              {read.loading && (
                <p className="flex items-center gap-2 text-sm text-espresso/55">
                  <Loader2 className="h-4 w-4 animate-spin" /> Reading the message…
                </p>
              )}
              {read.error && !read.loading && <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{read.error}</p>}

              {d && !read.loading && (
                <>
                  <MpesaSummary m={d.message} />
                  {d.used && (
                    <p className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      This M-Pesa code is already recorded on {d.used.orderCode ?? 'another sale'}. It can’t be used twice.
                    </p>
                  )}
                  {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

                  {!d.used && (
                    <div>
                      <p className="mb-2 text-sm font-semibold">{d.matches.length ? 'Which order is it for?' : 'No matching order found'}</p>
                      <ul className="space-y-2">
                        {d.matches.map((mt, i) => {
                          const short = mt.total - d.message.amount;
                          return (
                            <li key={mt.id} className={cn('rounded-2xl bg-white p-3.5 ring-1', i === 0 ? 'ring-amber/60' : 'ring-espresso/[0.07]')}>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-[13px] font-semibold">{mt.code}</span>
                                <StatusBadge status={mt.status} />
                                {i === 0 && <span className="rounded-full bg-honey/25 px-2 py-0.5 text-[10px] font-bold text-caramel uppercase">Best match</span>}
                                <span className="ml-auto font-semibold tabular-nums">{money(mt.total)}</span>
                              </div>
                              <p className="mt-1 text-sm">
                                <b>{mt.customer}</b> <span className="text-espresso/55">· {mt.phone || 'no phone'} · {mt.branch ?? ''} · {dateTime(mt.createdAt)}</span>
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {mt.reasons.map((r) => (
                                  <span key={r} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                                    ✓ {r}
                                  </span>
                                ))}
                                {short > 0 && (
                                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">Paid {money(short)} less than the order</span>
                                )}
                                {short < 0 && (
                                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Paid {money(-short)} more than the order</span>
                                )}
                              </div>
                              {mt.status === 'pending' ? (
                                <button onClick={() => confirm(mt)} disabled={busy !== null} className="btn btn-honey mt-3 h-10 w-full text-sm sm:w-auto">
                                  {busy === mt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />} Confirm payment
                                </button>
                              ) : (
                                <button onClick={() => confirm(mt)} disabled={busy !== null} className="btn btn-ghost mt-3 h-10 w-full text-sm sm:w-auto">
                                  {busy === mt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />} Attach M-Pesa code
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                      <button onClick={asSale} className="btn btn-ghost mt-3 h-10 w-full text-sm">
                        <Plus className="h-4 w-4" /> Not a website order? Record it as a sale
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
