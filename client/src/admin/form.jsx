import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import { EASE } from '../components/ui';
import { cn, getCurrency } from '../lib/format';
import { useAdminApi } from '../store/admin';

export function Section({ title, description, actions, children, className }) {
  return (
    <section className={cn('card min-w-0 p-5 sm:p-6', className)}>
      {(title || actions) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-espresso/55">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Field({ label, hint, error, optional, children, className }) {
  const id = useId();
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-semibold">
          {label}
          {optional && <span className="text-xs font-normal text-espresso/40">Optional</span>}
        </label>
      )}
      {typeof children === 'function' ? children(id) : children}
      {hint && !error && <p className="mt-1 text-xs text-espresso/45">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}

export function TextInput({ label, hint, error, optional, className, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional} className={className}>
      {(id) => <input id={id} className="field" {...props} value={props.value ?? ''} />}
    </Field>
  );
}

export function TextArea({ label, hint, error, optional, className, rows = 3, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional} className={className}>
      {(id) => <textarea id={id} rows={rows} className="field resize-y leading-relaxed" {...props} value={props.value ?? ''} />}
    </Field>
  );
}

export function SelectInput({ label, hint, options, className, ...props }) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <select id={id} className="field" {...props}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

// Amounts are stored in cents; the input shows whole shillings.
export function MoneyInput({ label, hint, value, onChange, className }) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-semibold text-espresso/45">{getCurrency()}</span>
          <input
            id={id}
            className="field pl-12 tabular-nums"
            inputMode="numeric"
            value={value === '' || value == null ? '' : String(Math.round(value / 100))}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, '');
              onChange(digits === '' ? '' : Number(digits) * 100);
            }}
          />
        </div>
      )}
    </Field>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-espresso/50">{description}</span>}
      </span>
      <input type="checkbox" className="peer sr-only" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
      <span
        className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-espresso/15 transition peer-checked:bg-amber peer-focus-visible:ring-2 peer-focus-visible:ring-amber after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
        aria-hidden
      />
    </label>
  );
}

export function Chips({ options, value, onChange, label }) {
  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-semibold">{label}</p>}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              'rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition',
              value === o.id ? 'bg-espresso text-cream ring-espresso' : 'bg-white text-espresso/70 ring-espresso/10 hover:ring-espresso/30',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Editable list: each row rendered by `render(item, update)`, with reorder and remove controls.
export function ListEditor({ items, onChange, render, blank, addLabel = 'Add item', max = 20, empty }) {
  const update = (i) => (patch) => onChange(items.map((it, j) => (j === i ? (typeof patch === 'function' ? patch(it) : { ...it, ...patch }) : it)));
  const move = (i, dir) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.length === 0 && empty && <p className="rounded-2xl border border-dashed border-espresso/15 p-4 text-center text-sm text-espresso/50">{empty}</p>}
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <motion.div
            key={i}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="rounded-2xl bg-beige/50 p-3 ring-1 ring-espresso/[0.06] sm:p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-espresso/40 uppercase">#{i + 1}</span>
              <div className="flex gap-1">
                <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton label="Remove" danger onClick={() => onChange(items.filter((_, j) => j !== i))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            </div>
            {render(item, update(i))}
          </motion.div>
        ))}
      </AnimatePresence>
      {items.length < max && (
        <button type="button" onClick={() => onChange([...items, structuredClone(blank)])} className="btn btn-ghost w-full py-2.5">
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      )}
    </div>
  );
}

export function IconButton({ label, onClick, disabled, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'grid h-8 w-8 place-items-center rounded-full bg-white ring-1 ring-espresso/10 transition disabled:opacity-30',
        danger ? 'text-red-700 hover:bg-red-50' : 'text-espresso/60 hover:text-espresso',
      )}
    >
      {children}
    </button>
  );
}

export function ImagePicker({ value, onChange, label = 'Picture' }) {
  const call = useAdminApi();
  const input = useRef(null);
  const [state, setState] = useState({ uploading: false, error: null });

  const pick = async (file) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) return setState({ uploading: false, error: 'Choose a JPG, PNG, WebP or GIF image' });
    if (file.size > 6 * 1024 * 1024) return setState({ uploading: false, error: 'That image is larger than 6 MB' });
    setState({ uploading: true, error: null });
    try {
      const { url } = await call('/uploads', { file });
      onChange(url);
      setState({ uploading: false, error: null });
    } catch (err) {
      setState({ uploading: false, error: err.message });
    }
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">{label}</p>
      {value ? (
        <div className="relative overflow-hidden rounded-2xl bg-beige ring-1 ring-espresso/10">
          <img src={value} alt="" className="max-h-72 w-full object-contain" />
          <div className="absolute top-2 right-2 flex gap-2">
            <button type="button" onClick={() => input.current?.click()} className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold shadow backdrop-blur hover:bg-white">
              Replace
            </button>
            <button type="button" onClick={() => onChange('')} className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-red-700 shadow backdrop-blur hover:bg-white" aria-label="Remove picture">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pick(e.dataTransfer.files?.[0]);
          }}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-espresso/15 bg-white px-4 py-8 text-sm text-espresso/55 transition hover:border-amber hover:text-espresso"
        >
          {state.uploading ? <Loader2 className="h-6 w-6 animate-spin text-amber" /> : <ImagePlus className="h-6 w-6 text-amber" />}
          {state.uploading ? 'Uploading…' : 'Tap to add a picture, or drop one here'}
          <span className="text-xs text-espresso/40">JPG, PNG, WebP or GIF · up to 6 MB</span>
        </button>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      {state.error && <p className="mt-1.5 text-xs font-medium text-red-700">{state.error}</p>}
    </div>
  );
}

export function SaveBar({ dirty, saving, onSave, onDiscard, message }) {
  return (
    <AnimatePresence>
      {(dirty || message) && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-espresso p-2 pl-4 text-cream shadow-[0_20px_40px_-15px_rgba(30,20,12,0.7)] lg:bottom-6 lg:left-64"
        >
          <span className="min-w-0 flex-1 truncate text-sm">
            {message ?? (
              <>
                <span className="sm:hidden">Unsaved</span>
                <span className="hidden sm:inline">You have unsaved changes</span>
              </>
            )}
          </span>
          {dirty && (
            <>
              <button type="button" onClick={onDiscard} className="rounded-full px-3 py-2 text-sm font-semibold text-cream/70 hover:text-cream">
                Discard
              </button>
              <button type="button" onClick={onSave} disabled={saving} className="btn btn-honey py-2.5">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
