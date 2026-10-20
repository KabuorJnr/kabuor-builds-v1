import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Banknote, Check, ChevronDown, Clock, Copy, Loader2, Lock, MapPin, Minus, Phone, Plus, ShoppingBag, Smartphone, Trash2, Truck, X } from 'lucide-react';
import { Link } from 'react-router';
import PayStep from './PayStep';
import ProductJar from './ProductJar';
import { AddButton, packLabel, tintFor } from './Shop';
import { EASE, Peanut, useLockBody } from './ui';
import { api } from '../lib/api';
import { byCountry } from '../lib/branches';
import { cn, money } from '../lib/format';
import { useCart, useCartCount, useCartSubtotal } from '../store/cart';

const PAY_ICONS = { mpesa: Smartphone, cod: Banknote };
const SAVED_KEY = 'anjugu-customer';
const TOWNS = ['Nairobi', 'Mombasa', 'Kisumu', 'Rodi Kopany', 'Homa Bay', 'Nakuru', 'Eldoret', 'Thika', 'Kakamega', 'Machakos'];

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY)) ?? {};
  } catch {
    return {};
  }
}

// How delivery shows up in totals: a fee, "paid to rider" (customer pays the rider/parcel service), or pickup.
function deliveryMode(config) {
  if (!config?.deliveryEnabled) return 'pickup';
  return config.deliveryFee > 0 ? 'fee' : 'rider';
}

export default function CartDrawer({ config, products, branches = [] }) {
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const items = useCart((s) => s.items);
  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const [step, setStep] = useState('cart');
  const [order, setOrder] = useState(null);
  useLockBody(open);

  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setStep('cart');
      setOrder(null);
    }, 400);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const mode = deliveryMode(config);
  const threshold = mode === 'fee' && config.freeDeliveryThreshold > 0 ? config.freeDeliveryThreshold : Infinity;
  const fee = mode !== 'fee' || subtotal === 0 || subtotal >= threshold ? 0 : config.deliveryFee;
  const total = subtotal + fee;

  const titles = { cart: `Your cart${count ? ` (${count})` : ''}`, checkout: 'Checkout', pay: 'Pay with M-Pesa', done: 'Order placed' };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[80] bg-espresso/40 backdrop-blur-sm"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={titles[step]}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="fixed inset-y-0 right-0 z-[81] flex w-full flex-col bg-cream shadow-2xl sm:max-w-[460px] sm:rounded-l-[var(--r-xl)]"
          >
            <header className="flex items-center gap-3 border-b border-espresso/[0.07] px-5 py-4 sm:px-7 sm:py-5">
              {step === 'checkout' && (
                <button onClick={() => setStep('cart')} className="-ml-2 grid h-10 w-10 place-items-center rounded-full hover:bg-beige" aria-label="Back to cart">
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <h2 className="text-xl font-extrabold tracking-tight">{titles[step]}</h2>
              <button onClick={() => setOpen(false)} className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-espresso/10 transition hover:rotate-90" aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </header>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="flex min-h-0 flex-1 flex-col"
              >
                {step === 'cart' &&
                  (items.length ? (
                    <CartStep items={items} products={products} subtotal={subtotal} fee={fee} total={total} threshold={threshold} mode={mode} config={config} onCheckout={() => setStep('checkout')} />
                  ) : (
                    <EmptyCart onBrowse={() => setOpen(false)} />
                  ))}
                {step === 'checkout' && (
                  <CheckoutStep
                    items={items}
                    config={config}
                    branches={branches}
                    subtotal={subtotal}
                    fee={fee}
                    total={total}
                    mode={mode}
                    onPlaced={(o) => {
                      setOrder(o);
                      setStep(o.payment ? 'pay' : 'done');
                    }}
                  />
                )}
                {step === 'pay' && order && (
                  <PayStep
                    order={order}
                    paybillBox={<PaybillBox paybill={config?.paybill} total={order.total} />}
                    onFinish={(payment) => {
                      setOrder((o) => ({ ...o, payment }));
                      setStep('done');
                    }}
                  />
                )}
                {step === 'done' && order && <DoneStep order={order} config={config} branches={branches} onClose={() => setOpen(false)} />}
              </motion.div>
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyCart({ onBrowse }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="animate-float relative" style={{ '--float': '-10px', '--float-dur': '3s' }}>
        <div className="grid h-28 w-28 place-items-center rounded-full bg-beige">
          <ShoppingBag className="h-10 w-10 text-latte" strokeWidth={1.5} />
        </div>
        <Peanut className="absolute -top-4 -right-4 w-8 rotate-[24deg]" />
      </div>
      <h3 className="mt-6 text-xl font-bold">Your cart is empty</h3>
      <p className="mt-2 text-espresso/55">Add something you love and it’ll show up here.</p>
      <Link to="/shop" onClick={onBrowse} className="btn btn-primary mt-7">
        Shop now
      </Link>
    </div>
  );
}

function Totals({ subtotal, fee, total, mode, paid = false }) {
  return (
    <dl className="space-y-1.5 text-sm">
      <div className="flex justify-between text-espresso/60">
        <dt>Subtotal</dt>
        <dd className="tabular-nums">{money(subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-4 text-espresso/60">
        <dt>{mode === 'pickup' ? 'Pickup' : 'Delivery'}</dt>
        <dd className="text-right tabular-nums">
          {mode === 'rider' ? (
            <span className="font-semibold text-caramel">Paid to rider on delivery</span>
          ) : fee ? (
            money(fee)
          ) : (
            <span className="font-semibold text-caramel">Free</span>
          )}
        </dd>
      </div>
      <div className="flex justify-between pt-1.5 text-base font-extrabold">
        <dt>{paid ? 'Total paid' : mode === 'rider' ? 'Total to pay now' : 'Total'}</dt>
        <dd className="tabular-nums">{money(total)}</dd>
      </div>
    </dl>
  );
}

function DeliveryNotice({ config, mode }) {
  if (!config) return null;
  const text =
    mode === 'pickup'
      ? `Delivery is coming soon. For now, collect from ${config.pickup.name}, ${config.pickup.address}.`
      : config.deliveryNote || 'We deliver countrywide.';
  return (
    <div className="flex gap-3 rounded-[var(--r-lg)] bg-espresso p-4 text-cream">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--r-md)] bg-honey text-espresso">
        <Truck className="h-5 w-5" />
      </span>
      <p className="text-sm leading-snug">
        <b className="block">{mode === 'pickup' ? 'Delivery coming soon' : 'Delivery countrywide'}</b>
        <span className="text-cream/65">{text}</span>
      </p>
    </div>
  );
}

function CartStep({ items, products, subtotal, fee, total, threshold, mode, config, onCheckout }) {
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const progress = Number.isFinite(threshold) ? Math.min(1, subtotal / threshold) : 0;
  const inCart = new Set(items.map((i) => i.id));
  const suggestions = products.filter((p) => !inCart.has(p.id) && p.stock > 0).slice(0, 4);

  return (
    <>
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
        {Number.isFinite(threshold) ? (
          <div className="rounded-[var(--r-lg)] bg-white p-4 ring-1 ring-espresso/[0.06]">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Truck className="h-4 w-4 text-amber" />
              {progress >= 1 ? (
                <span>
                  You’ve unlocked <b>free delivery</b>
                </span>
              ) : (
                <span>
                  You’re <b>{money(threshold - subtotal)}</b> away from free delivery
                </span>
              )}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-beige">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-honey to-amber" initial={false} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.8, ease: EASE }} />
            </div>
          </div>
        ) : (
          <DeliveryNotice config={config} mode={mode} />
        )}

        <ul className="mt-4 space-y-3">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 80, transition: { duration: 0.25 } }}
                className="flex gap-3.5 rounded-[var(--r-lg)] bg-white p-3 ring-1 ring-espresso/[0.06]"
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[var(--r-md)]" style={tintFor(item.look)}>
                  <ProductJar look={item.look} size={item.size} showTag={false} className="absolute inset-0 m-auto h-[86%] w-[86%]" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold">{item.name}</h3>
                      <p className="truncate text-xs text-espresso/50">
                        {item.size} {packLabel(item.look)} · {money(item.price)}
                      </p>
                    </div>
                    <button onClick={() => remove(item.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-espresso/40 transition hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${item.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex h-9 items-center rounded-full bg-beige">
                      <button onClick={() => setQty(item.id, item.qty - 1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label="Decrease quantity">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <motion.span key={item.qty} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-6 text-center text-sm font-bold tabular-nums">
                        {item.qty}
                      </motion.span>
                      <button onClick={() => setQty(item.id, item.qty + 1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label="Increase quantity">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-extrabold tabular-nums">{money(item.price * item.qty)}</span>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {suggestions.length > 0 && (
          <div className="mt-8">
            <h4 className="text-xs font-semibold tracking-wider text-espresso/45 uppercase">You might also like</h4>
            {/* A grid, not a sideways scroller: every size stays fully visible in the drawer. */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              {suggestions.map((p) => (
                <div key={p.id} className="flex min-w-0 flex-col rounded-[var(--r-lg)] bg-white p-2.5 ring-1 ring-espresso/[0.06]">
                  <div className="relative h-24 overflow-hidden rounded-[var(--r-md)]" style={tintFor(p.look)}>
                    <ProductJar look={p.look} size={p.size} showTag={false} className="absolute inset-0 m-auto h-[86%] w-full" />
                  </div>
                  <div className="mt-2 truncate text-sm font-bold">{p.name}</div>
                  <div className="truncate text-xs text-espresso/50">
                    {p.size} {packLabel(p.look)}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-espresso/60">{money(p.price)}</span>
                    <AddButton product={p} className="h-8! w-8!" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-espresso/[0.07] bg-cream px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 sm:pb-6">
        <Totals subtotal={subtotal} fee={fee} total={total} mode={mode} />
        <button onClick={onCheckout} className="btn btn-primary mt-4 h-14 w-full text-[15px]">
          Checkout · {money(total)}
        </button>
      </footer>
    </>
  );
}

function Field({ label, error, optional, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-sm font-semibold">
        {label}
        {optional && <span className="text-xs font-normal text-espresso/40">Optional</span>}
      </span>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1 block text-xs font-medium text-red-700">
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

function CopyValue({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (permissions, insecure context); the value is still on screen.
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--r-md)] bg-cream/[0.07] px-3 py-2">
      <span className="text-xs text-cream/60">{label}</span>
      <span className="flex items-center gap-2">
        <b className="text-lg tracking-wide text-honey tabular-nums">{value}</b>
        <button type="button" onClick={copy} className="grid h-7 w-7 place-items-center rounded-full bg-cream/10 transition hover:bg-cream/20" aria-label={`Copy ${label}`}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </span>
    </div>
  );
}

export function PaybillBox({ paybill, total }) {
  if (!paybill?.business) return null;
  return (
    <div className="rounded-[var(--r-lg)] bg-espresso p-4 text-cream">
      <p className="flex items-center gap-2 text-sm font-bold">
        <Smartphone className="h-4 w-4 text-honey" /> Pay with M-Pesa
      </p>
      <p className="mt-1 text-xs text-cream/60">Lipa na M-Pesa → {paybill.kind === 'till' ? 'Buy Goods and Services' : 'Paybill'}, then enter:</p>
      <div className="mt-3 space-y-1.5">
        <CopyValue label={paybill.kind === 'till' ? 'Till no.' : 'Business no.'} value={paybill.business} />
        {paybill.account && <CopyValue label="Account no." value={paybill.account} />}
        <div className="flex items-center justify-between gap-3 rounded-[var(--r-md)] bg-cream/[0.07] px-3 py-2">
          <span className="text-xs text-cream/60">Amount</span>
          <b className="text-lg text-honey tabular-nums">{money(total)}</b>
        </div>
      </div>
    </div>
  );
}

function CheckoutStep({ items, config, branches, subtotal, fee, total, mode, onPlaced }) {
  const clear = useCart((s) => s.clear);
  const delivery = mode !== 'pickup';
  const methods = config?.paymentMethods ?? [];
  const [form, setForm] = useState(() => {
    const saved = readSaved();
    return {
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      note: '',
      ...saved,
      branch: branches.some((b) => b.city === saved.branch) ? saved.branch : '',
      paymentMethod: methods.some((m) => m.id === saved.paymentMethod) ? saved.paymentMethod : methods[0]?.id,
    };
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, error: null });
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(({ [k]: _, ...rest }) => rest);
  };

  const prompt = Boolean(methods.find((m) => m.id === form.paymentMethod)?.prompt);

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your name';
    if (!/^\+?\d{9,15}$/.test(form.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter a valid phone number, e.g. 0712 345 678';
    else if (prompt && !/^(?:\+?254|0)?[17]\d{8}$/.test(form.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter your M-Pesa number, e.g. 0712 345 678';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'That email doesn’t look right';
    if (branches.length && !form.branch) e.branch = 'Choose the branch nearest to you';
    if (delivery && form.address.trim().length < 4) e.address = 'Where should we deliver?';
    if (delivery && form.city.trim().length < 2) e.city = 'Enter your town or city';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus({ loading: true, error: null });
    try {
      const order = await api('/orders', { method: 'POST', body: { ...form, items: items.map((i) => ({ id: i.id, qty: i.qty })) } });
      try {
        const { name, phone, email, address, city, branch, paymentMethod } = form;
        localStorage.setItem(SAVED_KEY, JSON.stringify({ name, phone, email, address, city, branch, paymentMethod }));
      } catch {
        // Saving details is a convenience only.
      }
      clear();
      onPlaced(order);
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
        <AnimatePresence>
          {status.error && (
            <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[var(--r-lg)] bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">
              {status.error}
            </motion.p>
          )}
        </AnimatePresence>

        <Field label="Full name" error={errors.name}>
          <input className="field" value={form.name} onChange={set('name')} autoComplete="name" placeholder="Wanjiku Kamau" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" error={errors.phone}>
            <input className="field" value={form.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel" placeholder="0712 345 678" />
          </Field>
          <Field label="Email" error={errors.email} optional>
            <input className="field" value={form.email} onChange={set('email')} autoComplete="email" inputMode="email" placeholder="you@email.com" />
          </Field>
        </div>

        {branches.length > 0 && (
          <Field label="Nearest branch" error={errors.branch}>
            <span className="relative block">
            <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-espresso/45" />
            <select className="field appearance-none pr-10" value={form.branch} onChange={set('branch')}>
              <option value="" disabled>
                Choose a branch
              </option>
              {byCountry(branches).map((g, _, all) => {
                const options = g.branches.map((b) => (
                  <option key={b.city} value={b.city}>
                    {b.city}
                    {b.phone ? ` · ${b.phone}` : ''}
                    {b.note ? ` (${b.note})` : ''}
                  </option>
                ));
                return all.length > 1 ? (
                  <optgroup key={g.country} label={g.country}>
                    {options}
                  </optgroup>
                ) : (
                  options
                );
              })}
            </select>
            </span>
          </Field>
        )}

        {delivery ? (
          <>
            <Field label="Delivery address" error={errors.address}>
              <input className="field" value={form.address} onChange={set('address')} autoComplete="street-address" placeholder="Building, street, estate" />
            </Field>
            <Field label="Town / City" error={errors.city}>
              <input className="field" value={form.city} onChange={set('city')} autoComplete="address-level2" placeholder="Nairobi" list="towns" />
              <datalist id="towns">
                {TOWNS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            {config?.deliveryNote && (
              <p className="flex items-start gap-2 rounded-[var(--r-lg)] bg-honey/10 px-4 py-3 text-sm text-espresso/75">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                {config.deliveryNote}
              </p>
            )}
          </>
        ) : (
          config?.pickup && (
            <div className="rounded-[var(--r-lg)] border border-amber/40 bg-honey/10 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold">Collect your order</span>
                <span className="rounded-full bg-espresso px-2.5 py-1 text-[10px] font-bold tracking-wider text-honey uppercase">Delivery coming soon</span>
              </div>
              <p className="mt-3 flex items-start gap-2 text-sm text-espresso/75">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                <span>
                  <b className="text-espresso">{config.pickup.name}</b>
                  <br />
                  {config.pickup.address}
                </span>
              </p>
              {config.pickup.hours && (
                <p className="mt-2 flex items-center gap-2 text-sm text-espresso/75">
                  <Clock className="h-4 w-4 shrink-0 text-amber" />
                  {config.pickup.hours}
                </p>
              )}
            </div>
          )
        )}

        <Field label="Note" optional>
          <textarea className="field min-h-[72px] resize-none" value={form.note} onChange={set('note')} placeholder={delivery ? 'Landmark, gate code, best time to call…' : 'When you plan to collect…'} />
        </Field>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Payment</legend>
          <div className="space-y-2">
            {methods.map((m) => {
              const Icon = PAY_ICONS[m.id] ?? Banknote;
              const active = form.paymentMethod === m.id;
              return (
                <label
                  key={m.id}
                  className={cn(
                    'relative flex cursor-pointer items-center gap-3 rounded-[var(--r-lg)] border bg-white p-3.5 transition',
                    active ? 'border-amber ring-4 ring-honey/15' : 'border-espresso/10 hover:border-espresso/25',
                  )}
                >
                  <input type="radio" name="payment" value={m.id} checked={active} onChange={set('paymentMethod')} className="sr-only" />
                  <span className={cn('grid h-10 w-10 place-items-center rounded-[var(--r-md)] transition', active ? 'bg-espresso text-honey' : 'bg-beige text-espresso/60')}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{m.label}</span>
                    <span className="block text-xs text-espresso/50">{m.hint}</span>
                  </span>
                  <span className={cn('grid h-5 w-5 place-items-center rounded-full border-2 transition', active ? 'border-amber' : 'border-espresso/20')}>
                    {active && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }} className="h-2.5 w-2.5 rounded-full bg-amber" />}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {form.paymentMethod === 'mpesa' && !prompt && <PaybillBox paybill={config?.paybill} total={total} />}
        {prompt && (
          <p className="flex items-start gap-2.5 rounded-[var(--r-lg)] bg-espresso px-4 py-3 text-sm text-cream/80">
            <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-honey" />
            <span>
              After you tap <b className="text-cream">Pay</b>, an M-Pesa prompt pops up on <b className="text-cream">{form.phone || 'your phone'}</b>. Enter your PIN and this page confirms your payment automatically.
            </span>
          </p>
        )}

        <div className="rounded-[var(--r-lg)] bg-white p-4 ring-1 ring-espresso/[0.06]">
          <ul className="mb-3 space-y-1.5 border-b border-dashed border-espresso/15 pb-3 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="truncate text-espresso/70">
                  {i.qty} × {i.name}
                </span>
                <span className="tabular-nums">{money(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <Totals subtotal={subtotal} fee={fee} total={total} mode={mode} />
        </div>
      </div>

      <footer className="border-t border-espresso/[0.07] bg-cream px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 sm:pb-6">
        <button type="submit" disabled={status.loading} className="btn btn-honey h-14 w-full text-[15px]">
          {status.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
          {status.loading ? (prompt ? 'Sending M-Pesa prompt…' : 'Placing order…') : prompt ? `Pay ${money(total)} with M-Pesa` : `Place order · ${money(total)}`}
        </button>
        <p className="mt-2.5 text-center text-xs text-espresso/45">Your nearest branch will confirm your order by phone.</p>
      </footer>
    </form>
  );
}

function Step({ n, title, children }) {
  return (
    <div className="rounded-[var(--r-lg)] bg-white p-4 text-left ring-1 ring-espresso/[0.06]">
      <p className="mb-3 flex items-center gap-2.5 text-sm font-bold">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-espresso text-xs text-honey">{n}</span>
        {title}
      </p>
      {children}
    </div>
  );
}

// Paybill orders: the customer pays, then taps "I've paid" so the branch is alerted to check M-Pesa.
function PaybillClaim({ order, config, branch, onClaimed }) {
  const [ref, setRef] = useState('');
  const [state, setState] = useState({ sending: false, error: null });

  const submit = async (e) => {
    e.preventDefault();
    const code = ref.replace(/\s/g, '').toUpperCase();
    if (code && !/^[A-Z0-9]{10}$/.test(code)) return setState({ sending: false, error: 'An M-Pesa code has 10 letters and numbers, e.g. QJK1ABC2DE' });
    setState({ sending: true, error: null });
    try {
      const res = await api(`/orders/${order.code}/paid`, { method: 'POST', body: { token: order.payToken, ref: code } });
      onClaimed(res.ref ?? code);
    } catch (err) {
      setState({ sending: false, error: err.message });
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <Step n="1" title="Pay with M-Pesa">
        <PaybillBox paybill={config?.paybill} total={order.total} />
      </Step>
      <Step n="2" title="Tell us you’ve paid">
        <form onSubmit={submit} noValidate className="space-y-3">
          <label className="block">
            <span className="mb-1.5 flex items-baseline justify-between text-sm font-semibold">
              M-Pesa code <span className="text-xs font-normal text-espresso/45">Optional</span>
            </span>
            <input
              className="field font-mono uppercase placeholder:font-sans placeholder:normal-case"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="e.g. QJK1ABC2DE"
              autoCapitalize="characters"
              autoComplete="off"
              maxLength={14}
            />
            <span className="mt-1.5 block text-xs text-espresso/50">From your M-Pesa confirmation SMS. It helps {branch ? `our ${branch.city} branch` : 'us'} confirm faster.</span>
          </label>
          {state.error && (
            <p className="rounded-[var(--r-md)] bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {state.error}
            </p>
          )}
          <button className="btn btn-honey h-13 w-full" disabled={state.sending}>
            {state.sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} I’ve paid
          </button>
        </form>
      </Step>
    </div>
  );
}

function DoneStep({ order, config, branches, onClose }) {
  const branch = branches.find((b) => b.city === order.branch);
  // Paybill (no M-Pesa prompt): still waiting for the customer to pay and tap "I've paid".
  const [claimedRef, setClaimedRef] = useState(null);
  const needsPay = order.paymentMethod === 'mpesa' && !order.payment && claimedRef === null;
  const drops = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);
  const mode = order.fulfilment === 'pickup' ? 'pickup' : order.deliveryFee ? 'fee' : 'rider';

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-10 text-center sm:px-8">
      <div className="relative mx-auto h-28 w-28">
        {drops.map((a, i) => (
          <motion.span
            key={i}
            className="absolute top-1/2 left-1/2 h-3 w-3 rounded-full bg-honey"
            initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 1 }}
            animate={{ x: `calc(-50% + ${Math.cos(a) * 80}px)`, y: `calc(-50% + ${Math.sin(a) * 80}px)`, scale: [0, 1.2, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 1.1, delay: 0.35, ease: 'easeOut' }}
          />
        ))}
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }} className="relative grid h-28 w-28 place-items-center rounded-full bg-espresso">
          <svg viewBox="0 0 52 52" className="h-14 w-14">
            <motion.path
              d="M14 27 l8 8 l16 -18"
              fill="none"
              style={{ stroke: 'var(--color-honey)' }}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
            />
          </svg>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7, ease: EASE }}>
        <h3 className="mt-8 text-2xl font-extrabold tracking-tight">{needsPay ? 'Order received!' : 'Thank you for shopping with us!'}</h3>
        {needsPay && <p className="mt-1 text-espresso/60">Pay with M-Pesa to complete it.</p>}
        <p className="mt-2 text-espresso/60">
          Order <span className="rounded-md bg-honey/20 px-1.5 py-0.5 font-mono text-sm font-bold text-caramel">{order.code}</span>
        </p>

        {order.payment?.status === 'paid' ? (
          <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
            <Check className="h-4 w-4" /> Paid with M-Pesa{order.payment.receipt ? ` · ${order.payment.receipt}` : ''}
          </p>
        ) : order.payment?.status === 'pending' ? (
          <p className="mx-auto mt-5 max-w-xs text-sm text-espresso/60">We’re waiting for M-Pesa to confirm your payment. The branch will confirm it when they call.</p>
        ) : needsPay ? (
          <PaybillClaim order={order} config={config} branch={branch} onClaimed={(ref) => setClaimedRef(ref || '')} />
        ) : (
          claimedRef !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto mt-5 max-w-sm rounded-[var(--r-lg)] bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
            >
              <p className="flex items-center justify-center gap-2 font-semibold">
                <Check className="h-4 w-4" /> Payment noted{claimedRef ? ` · ${claimedRef}` : ''}
              </p>
              <p className="mt-1 text-emerald-900/75">
                We’ve let {branch ? `our ${branch.city} branch` : 'the branch'} know. They’ll confirm your payment, then send your order.
              </p>
            </motion.div>
          )
        )}

        <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-espresso/60">
          {branch ? (
            <>
              Our <b className="text-espresso">{branch.city}</b> branch will call to confirm your order.
              {branch.phone && (
                <>
                  {' '}
                  Questions?{' '}
                  <a href={`tel:${branch.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1 font-semibold text-caramel">
                    <Phone className="h-3.5 w-3.5" /> {branch.phone}
                  </a>
                </>
              )}
            </>
          ) : (
            'We’ll call to confirm your order.'
          )}
        </p>
        {mode === 'rider' && config?.deliveryNote && <p className="mx-auto mt-2 max-w-xs text-xs text-espresso/45">{config.deliveryNote}</p>}

        <div className="mt-8 rounded-[var(--r-lg)] bg-white p-4 text-left ring-1 ring-espresso/[0.06]">
          <ul className="mb-3 space-y-1.5 border-b border-dashed border-espresso/15 pb-3 text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="truncate text-espresso/70">
                  {i.qty} × {i.name}
                </span>
                <span className="tabular-nums">{money(i.unitPrice * i.qty)}</span>
              </li>
            ))}
          </ul>
          <Totals subtotal={order.subtotal} fee={order.deliveryFee} total={order.total} mode={mode} paid={order.payment?.status === 'paid'} />
        </div>
        <button onClick={onClose} className="btn btn-primary mt-8 w-full">
          Keep browsing
        </button>
      </motion.div>
    </div>
  );
}
