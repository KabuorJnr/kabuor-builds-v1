// Pieces shared by the signup wizard and a shop's admin: the M-Pesa payment panel, the look pickers
// (style and colours) and a live preview of the shop in the chosen look.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ImagePlus, Loader2, Smartphone, X } from 'lucide-react';
import { cn } from '../lib/format';
import { family, loadFonts } from '../lib/fonts';
import { themeVars } from '../lib/theme';

export const ksh = (n) => `KSh ${Math.round(Number(n) || 0).toLocaleString('en-KE')}`;
export const EASE = [0.16, 1, 0.3, 1];

/** fetch for /api/platform with the signup's setup token. */
export async function papi(path, { method = 'GET', body, file, token } = {}) {
  const res = await fetch(`/api/platform${path}`, {
    method: file ? 'POST' : method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(file ? { 'Content-Type': file.type } : {}),
      ...(token ? { 'X-Setup-Token': token } : {}),
    },
    body: file ?? (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Network error, please try again'), { status: res.status });
  return data;
}

// ---------- paying by M-Pesa prompt ----------
const PLAN_NOTES = { monthly: 'Cancel any time', yearly: '2 months free' };

/**
 * Plan choice, phone number and the M-Pesa prompt, with live status. `start(phone, plan)` sends the prompt
 * and resolves to a payment id; `check(id)` returns { status, message, test }.
 */
export function MpesaPay({ prices, plans, defaultPhone = '', testMode, start, check, onPaid, cta = 'Send M-Pesa prompt' }) {
  const [plan, setPlan] = useState('monthly');
  const [phone, setPhone] = useState(defaultPhone);
  const [state, setState] = useState({ step: 'idle', error: null, message: '' });
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const poll = (id) => {
    timer.current = setTimeout(async () => {
      try {
        const s = await check(id);
        if (s.status === 'paid') {
          setState({ step: 'paid', error: null, message: s.message });
          onPaid?.(s);
        } else if (s.status === 'failed') setState({ step: 'idle', error: s.message, message: '' });
        else poll(id);
      } catch {
        poll(id);
      }
    }, 2500);
  };

  const pay = async (e) => {
    e.preventDefault();
    setState({ step: 'sending', error: null, message: '' });
    try {
      const id = await start(phone, plan);
      setState({ step: 'waiting', error: null, message: '' });
      poll(id);
    } catch (err) {
      setState({ step: 'idle', error: err.message, message: '' });
    }
  };

  if (state.step === 'paid') {
    return (
      <div className="rounded-[var(--r-xl)] bg-white p-6 text-center ring-1 ring-espresso/10">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#1E8E3E] text-[#fff]">
          <Check className="h-6 w-6" strokeWidth={3} />
        </span>
        <p className="mt-3 text-lg font-bold">{state.message}</p>
      </div>
    );
  }

  const waiting = state.step === 'waiting';
  return (
    <form onSubmit={pay} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Plan">
        {Object.keys(prices).map((id) => (
          <button
            type="button"
            key={id}
            role="radio"
            aria-checked={plan === id}
            disabled={waiting}
            onClick={() => setPlan(id)}
            className={cn(
              'rounded-[var(--r-lg)] bg-white p-4 text-left ring-1 transition',
              plan === id ? 'ring-2 ring-espresso' : 'ring-espresso/10 hover:ring-espresso/30',
            )}
          >
            <span className="flex items-center justify-between text-sm font-semibold text-espresso/60">
              {plans[id]}
              {plan === id && <Check className="h-4 w-4 text-espresso" strokeWidth={3} />}
            </span>
            <span className="mt-1 block text-xl font-extrabold tracking-tight whitespace-nowrap tabular-nums sm:text-2xl">{ksh(prices[id])}</span>
            <span className="text-xs text-espresso/55">
              {id === 'yearly' ? `${ksh(prices.yearly / 12)} a month · ` : ''}
              {PLAN_NOTES[id]}
            </span>
          </button>
        ))}
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">M-Pesa number</span>
        <input className="field" inputMode="tel" autoComplete="tel" value={phone} disabled={waiting} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" />
        <span className="mt-1 block text-xs text-espresso/50">The prompt goes to this phone. Enter your M-Pesa PIN there to pay.</span>
      </label>
      {state.error && <p className="rounded-[var(--r-md)] bg-red-50 px-3 py-2 text-sm font-medium text-red-800">{state.error}</p>}
      <AnimatePresence mode="wait" initial={false}>
        {waiting ? (
          <motion.div key="wait" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-3 rounded-[var(--r-lg)] bg-[#1E8E3E]/10 p-4 text-sm">
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[#1E8E3E]" />
            <span>
              <b className="block">Check your phone</b>
              Enter your M-Pesa PIN to pay {ksh(prices[plan])}. This page updates by itself.
              {testMode && <span className="mt-1 block text-xs text-espresso/55">Test mode: no prompt is sent; the payment completes in a few seconds.</span>}
            </span>
            <Loader2 className="ml-auto h-5 w-5 shrink-0 animate-spin text-[#1E8E3E]" />
          </motion.div>
        ) : (
          <motion.button key="pay" type="submit" disabled={state.step === 'sending'} className="btn w-full bg-[#1E8E3E] py-4 text-[#fff] hover:bg-[#176F30]">
            {state.step === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
            {cta} · {ksh(prices[plan])}
          </motion.button>
        )}
      </AnimatePresence>
      {testMode && !waiting && <p className="text-center text-xs text-espresso/50">Test mode: M-Pesa keys aren’t set on this server, so no real money moves.</p>}
    </form>
  );
}

// ---------- pictures ----------
/** A drop zone for one picture; uploads with `upload(file)` → { url, accents }. */
export function PictureDrop({ label, hint, value, onUpload, onClear, upload, srcOf = (u) => u, aspect = 'aspect-[4/3]', compact = false }) {
  const input = useRef(null);
  const [state, setState] = useState({ busy: false, error: null });
  const pick = async (file) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setState({ busy: false, error: 'Choose a JPG, PNG or WebP picture' });
    if (file.size > 8 * 1024 * 1024) return setState({ busy: false, error: 'That picture is larger than 8 MB' });
    setState({ busy: true, error: null });
    try {
      onUpload(await upload(file));
      setState({ busy: false, error: null });
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };
  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-semibold">{label}</p>}
      <div
        className={cn('relative overflow-hidden rounded-[var(--r-lg)] bg-white ring-1 ring-espresso/10', aspect)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files?.[0]);
        }}
      >
        {value ? (
          <>
            <img src={srcOf(value)} alt="" className="h-full w-full object-contain" />
            {onClear && (
              <button type="button" onClick={onClear} className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-espresso shadow" aria-label="Remove picture">
                <X className="h-4 w-4" />
              </button>
            )}
          </>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-1.5 border-2 border-dashed border-espresso/15 p-3 text-center text-sm text-espresso/55 transition hover:border-espresso/40 hover:text-espresso">
            {state.busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            {!compact && <span>{state.busy ? 'Uploading…' : 'Tap to add, or drop a picture'}</span>}
          </button>
        )}
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      {hint && !state.error && <p className="mt-1.5 text-xs text-espresso/50">{hint}</p>}
      {state.error && <p className="mt-1.5 text-xs font-medium text-red-700">{state.error}</p>}
    </div>
  );
}

// ---------- the look ----------
// A tiny drawing of the style's banner layout, in the shop's own accent colour and the style's corners.
function LayoutSketch({ hero, radius, accent, dark }) {
  const r = { round: 5, soft: 3, sharp: 0.5 }[radius] ?? 3;
  const ink = dark ? 'rgba(255,247,236,.85)' : 'rgba(15,17,21,.8)';
  const soft = dark ? 'rgba(255,247,236,.18)' : 'rgba(15,17,21,.12)';
  return (
    <svg viewBox="0 0 120 64" className="h-full w-full" aria-hidden>
      {hero === 'poster' ? (
        <>
          <rect x="30" y="8" width="60" height="7" rx="1.5" fill={ink} />
          <rect x="40" y="18" width="40" height="7" rx="1.5" fill={accent} />
          <rect x="33" y="36" width="18" height="24" rx={r} fill={soft} transform="rotate(-8 42 48)" />
          <rect x="51" y="32" width="18" height="28" rx={r} fill={accent} />
          <rect x="69" y="36" width="18" height="24" rx={r} fill={soft} transform="rotate(8 78 48)" />
        </>
      ) : hero === 'editorial' ? (
        <>
          <rect x="8" y="14" width="44" height="7" rx="1.5" fill={ink} />
          <rect x="8" y="24" width="34" height="7" rx="1.5" fill={accent} />
          <rect x="8" y="38" width="38" height="2.5" rx="1" fill={soft} />
          <rect x="8" y="43" width="30" height="2.5" rx="1" fill={soft} />
          <rect x="70" y="6" width="42" height="52" rx={r} fill={accent} opacity=".9" />
          <rect x="70" y="60" width="42" height="1" fill={soft} />
        </>
      ) : (
        <>
          <rect x="8" y="14" width="40" height="7" rx="1.5" fill={ink} />
          <rect x="8" y="24" width="30" height="7" rx="1.5" fill={accent} />
          <rect x="8" y="38" width="22" height="7" rx={r} fill={ink} />
          <rect x="68" y="6" width="40" height="44" rx={r} fill={accent} opacity=".9" transform="rotate(3 88 28)" />
          <rect x="60" y="34" width="24" height="26" rx={r} fill={soft} stroke={dark ? '#0F1115' : '#fff'} strokeWidth="2" transform="rotate(-5 72 47)" />
        </>
      )}
    </svg>
  );
}

/**
 * Style cards: a sketch of the banner layout in the shop's colour, the style's fonts, and what it feels like.
 * `suggested` marks the one that suits what they sell.
 */
export function StylePicker({ styles, value, onChange, suggested, accent = '#3B82F6' }) {
  useEffect(() => {
    styles.forEach((s) => loadFonts({ ...s.fonts, body: s.body }));
  }, [styles]);
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="Style">
      {styles.map((s) => {
        const dark = s.mode === 'dark';
        const on = value === s.id;
        return (
          <button
            type="button"
            key={s.id}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(s.id)}
            className={cn(
              'relative flex flex-col overflow-hidden rounded-[var(--r-lg)] bg-white text-left ring-1 transition',
              on ? 'ring-2 ring-espresso' : 'ring-espresso/10 hover:ring-espresso/30',
            )}
          >
            <span className={cn('relative block h-20 px-2 pt-2', dark ? 'bg-[#16140F]' : 'bg-[#F6F1E8]')}>
              <LayoutSketch hero={s.hero} radius={s.radius} accent={accent} dark={dark} />
              {suggested === s.id && <span className="absolute top-1.5 left-1.5 rounded-full bg-[#3B82F6] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">Suggested</span>}
              {on && (
                <span className="absolute top-1.5 right-1.5 grid h-5 w-5 place-items-center rounded-full bg-espresso text-cream">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </span>
            <span className="flex flex-1 flex-col p-3">
              <span className="flex items-baseline gap-2">
                <span className="text-2xl leading-none" style={{ fontFamily: `"${family(s.fonts.brand)}"` }}>
                  Aa
                </span>
                <span className="truncate text-lg leading-none text-espresso/70" style={{ fontFamily: `"${family(s.fonts.tagline)}"` }}>
                  handmade
                </span>
              </span>
              <span className="mt-2 text-sm font-semibold" style={{ fontFamily: `"${family(s.body)} Variable"` }}>
                {s.label}
              </span>
              {s.note && <span className="mt-0.5 text-xs leading-snug text-espresso/55">{s.note}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Colour choices, each shown as the swatches the shop will use. */
export function PalettePicker({ options, value, onChange }) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label="Colours">
      {options.map((o) => (
        <button
          type="button"
          key={o.accent}
          role="radio"
          aria-checked={value === o.accent}
          onClick={() => onChange(o.accent)}
          className={cn('flex w-full items-center gap-3 rounded-[var(--r-lg)] bg-white p-2.5 pr-3.5 text-left ring-1 transition', value === o.accent ? 'ring-2 ring-espresso' : 'ring-espresso/10 hover:ring-espresso/30')}
        >
          <span className="flex overflow-hidden rounded-[var(--r-md)] ring-1 ring-black/5">
            {['cream', 'sand', 'honey', 'amber', 'caramel', 'espresso'].map((k) => (
              <span key={k} className="h-9 w-7" style={{ background: o.colors[k] }} />
            ))}
          </span>
          <span className="min-w-0 flex-1 text-sm">
            <b className="block font-semibold">{o.from === 'your pictures' ? 'From your pictures' : 'Suggested'}</b>
            <span className="text-xs text-espresso/50 tabular-nums">{o.accent}</span>
          </span>
          {value === o.accent && <Check className="h-4 w-4" strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}

/** A small, real-looking view of the shop in a look, with the shop's own fonts and colours. */
export function ShopPreview({ look, name, photo, product, srcOf = (u) => u }) {
  useEffect(() => {
    if (look) loadFonts({ ...look.fonts, body: look.theme.body });
  }, [look]);
  const vars = useMemo(() => (look ? themeVars(look) : {}), [look]);
  if (!look) return <div className="aspect-[3/4] animate-pulse rounded-[var(--r-xl)] bg-sand" />;
  const radius = { round: '1.4rem', soft: '0.9rem', sharp: '4px' }[look.theme.radius] ?? '1rem';
  return (
    <div className="overflow-hidden rounded-[1.4rem] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.5)] ring-1 ring-black/10" style={{ ...vars, background: 'var(--color-cream)', color: 'var(--color-espresso)', fontFamily: 'var(--font-sans)' }}>
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: 'color-mix(in srgb, var(--color-espresso) 10%, transparent)' }}>
        {look.logo?.image ? (
          <img src={srcOf(look.logo.image)} alt="" className="h-8 w-auto max-w-24 object-contain" />
        ) : (
          <span className="grid h-8 min-w-8 place-items-center rounded-full px-1.5 text-sm" style={{ background: 'var(--color-honey)', color: 'var(--color-cream)', fontFamily: 'var(--font-brand)' }}>
            {look.logo?.mark}
          </span>
        )}
        <span className="truncate text-lg leading-none" style={{ fontFamily: 'var(--font-brand)', color: 'var(--color-cocoa)' }}>
          {name}
        </span>
        <span className="ml-auto rounded-full px-3 py-1.5 text-[11px] font-bold" style={{ background: 'var(--color-espresso)', color: 'var(--color-cream)' }}>
          Shop now
        </span>
      </div>
      <div className="grid grid-cols-[1.1fr_1fr] items-center gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xl leading-none" style={{ fontFamily: 'var(--font-tagline)', color: 'var(--color-amber)' }}>
            {look.eyebrow ?? 'Handmade'}
          </p>
          <p className="mt-2 text-[1.7rem] leading-[1] font-extrabold tracking-tight">{look.tagline}</p>
          <span className="mt-4 inline-block px-4 py-2 text-xs font-bold" style={{ background: 'var(--color-espresso)', color: 'var(--color-cream)', borderRadius: radius }}>
            Shop now →
          </span>
        </div>
        <div className="overflow-hidden" style={{ borderRadius: radius, background: 'var(--color-sand)' }}>
          {photo ? <img src={srcOf(photo)} alt="" className="aspect-[4/5] w-full object-cover" /> : <div className="aspect-[4/5]" style={{ background: 'linear-gradient(160deg, var(--color-sand), var(--color-honey))' }} />}
        </div>
      </div>
      {product && (
        <div className="mx-5 mb-5 flex items-center gap-3 p-2.5" style={{ background: 'var(--color-white)', borderRadius: radius }}>
          {product.photo ? (
            <img src={srcOf(product.photo)} alt="" className="h-14 w-12 object-cover" style={{ borderRadius: `calc(${radius} * 0.6)` }} />
          ) : (
            <span className="h-14 w-12" style={{ background: 'var(--color-beige)', borderRadius: `calc(${radius} * 0.6)` }} />
          )}
          <span className="min-w-0 flex-1">
            <b className="block truncate text-sm">{product.name}</b>
            <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--color-espresso) 55%, transparent)' }}>
              {product.size}
            </span>
          </span>
          <b className="text-sm tabular-nums">{ksh(product.price)}</b>
          <span className="grid h-8 w-8 place-items-center rounded-full text-lg leading-none" style={{ background: 'var(--color-espresso)', color: 'var(--color-cream)' }}>
            +
          </span>
        </div>
      )}
    </div>
  );
}
