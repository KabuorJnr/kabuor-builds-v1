import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ChevronDown, Loader2, RefreshCw, Smartphone } from 'lucide-react';
import { EASE } from './ui';
import { api } from '../lib/api';
import { cn, money } from '../lib/format';

const POLL_MS = 3000;
const SLOW_AFTER_MS = 45_000; // show "didn't get it?" help
const GIVE_UP_AFTER_MS = 150_000; // M-Pesa prompts expire after about two minutes

// 254712345678 → 0712 345 678
export const localPhone = (msisdn) => {
  const d = String(msisdn ?? '').replace(/\D/g, '').replace(/^254/, '0');
  return d.length === 10 ? `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : msisdn;
};

function PhonePulse({ state }) {
  const failed = state === 'failed';
  return (
    <div className="relative mx-auto grid h-36 w-36 place-items-center">
      {!failed &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border-2 border-honey"
            initial={{ scale: 0.55, opacity: 0.7 }}
            animate={{ scale: 1.15, opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
          />
        ))}
      <motion.div
        animate={failed ? { rotate: [0, -8, 8, -5, 5, 0] } : { rotate: [0, -6, 6, -6, 6, 0, 0, 0, 0] }}
        transition={failed ? { duration: 0.5 } : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className={cn('relative grid h-24 w-16 place-items-center rounded-[1.1rem] shadow-[0_18px_30px_-14px_rgba(46,31,20,0.7)]', failed ? 'bg-espresso/80' : 'bg-espresso')}
      >
        <div className="absolute top-1.5 h-1 w-5 rounded-full bg-cream/25" />
        <div className={cn('grid h-12 w-11 place-items-center rounded-md text-[9px] leading-tight font-bold', failed ? 'bg-cream/15 text-cream/70' : 'bg-honey text-espresso')}>
          {failed ? <AlertCircle className="h-5 w-5" /> : <span className="text-center">M-PESA<br />PIN</span>}
        </div>
      </motion.div>
    </div>
  );
}

export default function PayStep({ order, paybillBox, onFinish }) {
  const [payment, setPayment] = useState(order.payment);
  const [phone, setPhone] = useState(() => localPhone(order.payment?.phone ?? ''));
  const [sentAt, setSentAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [manual, setManual] = useState(false);
  const finished = useRef(false);

  const status = payment?.status === 'pending' && now - sentAt > GIVE_UP_AFTER_MS ? 'expired' : payment?.status;
  const waiting = status === 'pending';

  const check = useCallback(async () => {
    try {
      const res = await api(`/orders/${order.code}/payment?token=${order.payToken}`);
      if (res.payment) setPayment(res.payment);
      if (res.payment?.status === 'paid' && !finished.current) {
        finished.current = true;
        setTimeout(() => onFinish(res.payment), 700);
      }
    } catch {
      // A missed poll is fine; the next one will catch up.
    }
  }, [order.code, order.payToken, onFinish]);

  // Poll while waiting, and check straight away when the customer comes back from the M-Pesa prompt.
  useEffect(() => {
    if (!waiting) return;
    const t = setInterval(() => {
      setNow(Date.now());
      if (document.visibilityState === 'visible') check();
    }, POLL_MS);
    const onBack = () => document.visibilityState === 'visible' && check();
    document.addEventListener('visibilitychange', onBack);
    window.addEventListener('focus', onBack);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onBack);
      window.removeEventListener('focus', onBack);
    };
  }, [waiting, check]);

  const resend = async (e) => {
    e?.preventDefault();
    setResending(true);
    setError(null);
    try {
      const res = await api(`/orders/${order.code}/pay`, { method: 'POST', body: { token: order.payToken, phone: phone.replace(/\s/g, '') } });
      setPayment(res.payment);
      setSentAt(Date.now());
      setNow(Date.now());
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const paid = status === 'paid';
  const slow = waiting && now - sentAt > SLOW_AFTER_MS;
  const canRetry = status === 'failed' || status === 'expired' || slow;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-8 text-center sm:px-8">
        <p className="text-xs font-semibold tracking-wider text-espresso/45 uppercase">
          Order <span className="font-mono text-caramel">{order.code}</span>
        </p>
        <div className="mt-6">
          <PhonePulse state={status === 'failed' || status === 'expired' ? 'failed' : 'waiting'} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={status} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: EASE }}>
            {paid ? (
              <>
                <h3 className="mt-6 text-2xl font-extrabold tracking-tight">Payment received</h3>
                <p className="mt-2 text-espresso/60">Thank you! Finishing up…</p>
              </>
            ) : waiting ? (
              <>
                <h3 className="mt-6 text-2xl font-extrabold tracking-tight">Check your phone</h3>
                <p className="mx-auto mt-2 max-w-xs leading-relaxed text-espresso/65">
                  We sent an M-Pesa prompt to <b className="whitespace-nowrap text-espresso">{localPhone(payment.phone)}</b>. Enter your PIN to pay{' '}
                  <b className="whitespace-nowrap text-espresso">{money(order.total)}</b>.
                </p>
                <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-honey/15 px-4 py-2 text-sm font-semibold text-caramel">
                  <Loader2 className="h-4 w-4 animate-spin" /> Waiting for M-Pesa
                </p>
                <p className="mx-auto mt-3 max-w-xs text-xs text-espresso/45">Keep this page open. It updates by itself once you’ve paid.</p>
              </>
            ) : (
              <>
                <h3 className="mt-6 text-2xl font-extrabold tracking-tight">{status === 'expired' ? 'The prompt timed out' : 'Payment not completed'}</h3>
                <p className="mx-auto mt-2 max-w-xs leading-relaxed text-espresso/65">
                  {status === 'expired' ? 'We didn’t hear back from M-Pesa.' : payment?.message || 'The payment didn’t go through.'} Your order is saved, so you can try again.
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {canRetry && !paid && (
          <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={resend} className="mx-auto mt-6 max-w-sm space-y-3 text-left">
            {slow && <p className="text-center text-sm font-semibold text-espresso/70">Didn’t get the prompt?</p>}
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">M-Pesa number</span>
              <input className="field" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="0712 345 678" />
            </label>
            {error && <p className="rounded-[var(--r-md)] bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{error}</p>}
            <button className="btn btn-honey h-12 w-full" disabled={resending}>
              {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Send the prompt again
            </button>
          </motion.form>
        )}

        {!paid && paybillBox && (
          <div className="mx-auto mt-6 max-w-sm text-left">
            <button type="button" onClick={() => setManual((m) => !m)} className="flex w-full items-center justify-between rounded-[var(--r-lg)] bg-white px-4 py-3 text-sm font-semibold ring-1 ring-espresso/[0.07]">
              <span className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-amber" /> Pay manually instead
              </span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', manual && 'rotate-180')} />
            </button>
            <AnimatePresence initial={false}>
              {manual && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-2">{paybillBox}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {!paid && (
        <footer className="border-t border-espresso/[0.07] bg-cream px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center sm:px-7 sm:pb-6">
          <button type="button" onClick={() => onFinish(payment)} className="text-sm font-semibold text-espresso/55 underline decoration-espresso/20 underline-offset-4 hover:text-espresso">
            {waiting ? 'I’ve paid, continue' : 'Finish without paying now'}
          </button>
        </footer>
      )}
    </div>
  );
}
