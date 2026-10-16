import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '../lib/format';

// Single-series chart colour (validated: >= 3:1 against white) and its quiet neighbours.
export const SERIES = '#B8761E';
export const GRID = '#EFE6D8';
export const AXIS_TEXT = '#8C7A68';

export const RANGES = [
  { id: '7d', label: '7D', long: 'last 7 days' },
  { id: '30d', label: '30D', long: 'last 30 days' },
  { id: '90d', label: '90D', long: 'last 90 days' },
  { id: '12m', label: '12M', long: 'last 12 months' },
];

export function Segmented({ options, value, onChange, id, className }) {
  return (
    <div className={cn('inline-flex rounded-full bg-white p-1 ring-1 ring-espresso/10', className)} role="radiogroup">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn('relative rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors sm:px-4', value === o.id ? 'text-cream' : 'text-espresso/55 hover:text-espresso')}
        >
          {value === o.id && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-espresso" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Delta({ current, previous, period }) {
  if (previous == null) return null;
  if (!previous) return <span className="text-xs text-espresso/45">No data for the previous {period}</span>;
  const pct = ((current - previous) / previous) * 100;
  const flat = Math.abs(pct) < 0.5;
  const up = pct > 0;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 text-xs">
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold',
          flat ? 'bg-beige text-espresso/60' : up ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800',
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {flat ? '0%' : `${up ? '+' : ''}${pct.toFixed(1)}%`}
      </span>
      <span className="text-espresso/45">vs previous {period}</span>
    </span>
  );
}

const STATUS = {
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500' },
  paid: { label: 'Paid', cls: 'bg-sky-50 text-sky-800 ring-sky-200', dot: 'bg-sky-500' },
  sent: { label: 'Sent', cls: 'bg-violet-50 text-violet-800 ring-violet-200', dot: 'bg-violet-500' },
  delivered: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-800 ring-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-800 ring-red-200', dot: 'bg-red-500' },
};
export const STATUSES = Object.keys(STATUS);

export function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.pending;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1', s.cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
}

export function StatusSelect({ status, onChange, disabled }) {
  const s = STATUS[status] ?? STATUS.pending;
  return (
    <label className={cn('relative inline-flex items-center gap-1.5 rounded-full py-1 pr-7 pl-2.5 text-xs font-semibold ring-1', s.cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
      <svg viewBox="0 0 12 12" className="pointer-events-none absolute right-2.5 h-2.5 w-2.5 opacity-60" aria-hidden>
        <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
      <select
        value={status}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Order status"
      >
        {STATUSES.map((k) => (
          <option key={k} value={k}>
            {STATUS[k].label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Panel({ title, subtitle, action, children, className }) {
  return (
    <section className={cn('card min-w-0 p-5 sm:p-6', className)}>
      {(title || action) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-espresso/50">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-espresso/55">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function ErrorNote({ children }) {
  return <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{children}</p>;
}
