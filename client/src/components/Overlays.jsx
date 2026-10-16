import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';

import { useCart } from '../store/cart';

function Flight({ flight, onDone }) {
  const [target] = useState(() => {
    const r = document.getElementById('cart-button')?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth - 40, y: 36 };
  });
  const peak = Math.min(flight.y, target.y) - 110;
  const d = 0.8;

  return (
    <motion.svg
      viewBox="0 0 40 64"
      className="absolute top-0 left-0 -mt-4 -ml-2.5 h-8 w-5 drop-shadow-[0_6px_10px_rgba(46,31,20,0.35)]"
      initial={{ x: flight.x, y: flight.y, scale: 0.6, rotate: 0 }}
      animate={{ x: target.x, y: [flight.y, peak, target.y], scale: [0.6, 1.2, 0.45], rotate: 180 }}
      transition={{
        x: { duration: d, ease: [0.45, 0, 0.55, 1] },
        y: { duration: d, times: [0, 0.4, 1], ease: ['easeOut', 'easeIn'] },
        scale: { duration: d, times: [0, 0.4, 1] },
        rotate: { duration: d },
      }}
      onAnimationComplete={onDone}
    >
      <circle cx="20" cy="32" r="15" style={{ fill: "var(--color-honey)", stroke: "var(--color-espresso)" }} strokeWidth="2.5" />
    </motion.svg>
  );
}

export function FlyLayer() {
  const flights = useCart((s) => s.flights);
  const land = useCart((s) => s.land);
  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden>
      {flights.map((f) => (
        <Flight key={f.id} flight={f} onDone={() => land(f.id)} />
      ))}
    </div>
  );
}

export function Toast() {
  const toast = useCart((s) => s.toast);
  const dismiss = useCart((s) => s.dismissToast);
  const setOpen = useCart((s) => s.setOpen);
  const open = useCart((s) => s.open);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismiss, 2800);
    return () => clearTimeout(t);
  }, [toast, dismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[85] flex justify-center px-4 sm:bottom-6" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && !open && (
          <motion.div
            key={toast.id}
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full bg-espresso py-2 pr-2 pl-2 text-cream shadow-[0_20px_50px_-15px_rgba(30,20,12,0.7)]"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-honey text-espresso">
              <Check className="h-4 w-4" strokeWidth={3} />
            </span>
            <span className="truncate text-sm">
              <b>{toast.qty}×</b> {toast.name} added
            </span>
            <button
              onClick={() => {
                setOpen(true);
                dismiss();
              }}
              className="shrink-0 rounded-full bg-cream/10 px-4 py-2 text-xs font-semibold transition hover:bg-cream/20"
            >
              View cart
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
