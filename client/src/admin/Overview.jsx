import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, BadgeCheck } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EASE } from '../components/ui';
import { cn, dateTime, getCurrency, money, moneyCompact, num } from '../lib/format';
import { useAdminQuery } from '../store/admin';
import { AlertsNudge } from './Alerts';
import { AXIS_TEXT, Delta, ErrorNote, GRID, PageHeader, Panel, RANGES, SERIES, Segmented, StatusBadge } from './shared';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function bucketLabel(key, long = false) {
  const [y, m, d] = key.split('-').map(Number);
  if (d) return long ? `${d} ${MONTHS[m - 1]} ${y}` : `${d} ${MONTHS[m - 1]}`;
  return long ? `${MONTHS[m - 1]} ${y}` : `${MONTHS[m - 1]} ’${String(y).slice(2)}`;
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl bg-espresso px-3.5 py-2.5 text-cream shadow-xl">
      <div className="flex items-center gap-2">
        <span className="h-0.5 w-3 rounded" style={{ background: '#E8A33D' }} />
        <b className="text-sm tabular-nums">{money(d.revenue)}</b>
      </div>
      <div className="mt-0.5 text-[11px] text-cream/60">
        {bucketLabel(d.key, true)} · {d.orders} orders · {d.units} jars
      </div>
    </div>
  );
}

// Axis ticks on round amounts (1, 2, 2.5 or 5 × 10ⁿ), starting at zero.
function niceTicks(max) {
  const raw = Math.max(max, 1) / 5;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw);
  return Array.from({ length: Math.ceil(Math.max(max, 1) / step) + 1 }, (_, i) => i * step);
}

function RevenueChart({ series }) {
  const ticks = niceTicks(Math.max(...series.map((d) => d.revenue)));
  return (
    <div className="-mx-2 h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={SERIES} stopOpacity={0.16} />
              <stop offset="1" stopColor={SERIES} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis
            dataKey="key"
            tickFormatter={(k) => bucketLabel(k)}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            tick={{ fill: AXIS_TEXT, fontSize: 11.5 }}
            minTickGap={28}
            tickMargin={8}
          />
          <YAxis
            ticks={ticks}
            domain={[0, ticks.at(-1)]}
            tickFormatter={(v) => moneyCompact(v).replace(`${getCurrency()} `, '')}
            tickLine={false}
            axisLine={false}
            tick={{ fill: AXIS_TEXT, fontSize: 11.5 }}
            width={44}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#2E1F14', strokeOpacity: 0.25, strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={SERIES}
            strokeWidth={2}
            strokeLinecap="round"
            fill="url(#rev-fill)"
            activeDot={{ r: 5, fill: SERIES, stroke: '#fff', strokeWidth: 2 }}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Tile({ label, value, current, previous, period, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.05 * i, ease: EASE }}
      className="card p-4 sm:p-5"
    >
      <div className="text-sm text-espresso/55">{label}</div>
      <div className="mt-1.5 text-xl font-semibold tracking-tight whitespace-nowrap sm:text-2xl xl:text-[1.7rem]">{value}</div>
      <div className="mt-2">
        <Delta current={current} previous={previous} period={period} />
      </div>
    </motion.div>
  );
}

function BarList({ rows, valueOf, labelOf, detailOf, total }) {
  const max = Math.max(...rows.map(valueOf), 1);
  return (
    <ul className="space-y-4">
      {rows.map((r, i) => {
        const v = valueOf(r);
        return (
          <li key={labelOf(r)} className="group">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-semibold">{labelOf(r)}</span>
              <span className="shrink-0 font-semibold tabular-nums">{moneyCompact(v)}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="h-2.5 flex-1">
                <motion.div
                  className="h-full rounded-r-[4px] transition-[filter] group-hover:brightness-110"
                  style={{ background: SERIES }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(v / max) * 100}%` }}
                  transition={{ duration: 0.9, delay: i * 0.05, ease: EASE }}
                />
              </div>
              <span className="w-28 shrink-0 text-right text-xs text-espresso/50 tabular-nums">
                {detailOf(r)} · {total ? Math.round((v / total) * 100) : 0}%
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function Overview() {
  const [range, setRange] = useState('30d');
  const { data, error, loading } = useAdminQuery(`/summary?range=${range}`);
  const period = RANGES.find((r) => r.id === range);
  const periodWord = { '7d': '7 days', '30d': '30 days', '90d': '90 days', '12m': '12 months' }[range];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <PageHeader title={greeting} subtitle={`Here’s how the shop is doing over the ${period.long}.`}>
        <Segmented id="range" options={RANGES} value={range} onChange={setRange} />
      </PageHeader>

      {data?.toConfirm > 0 && (
        <Link
          to="/admin/orders?status=toconfirm"
          className="mb-4 flex items-center gap-3 rounded-3xl bg-honey px-4 py-3.5 font-semibold text-espresso shadow-[0_14px_30px_-18px_rgba(236,148,18,0.9)] transition hover:bg-amber sm:mb-5 sm:px-5"
        >
          <BadgeCheck className="h-5 w-5 shrink-0" />
          <span className="flex-1">
            {data.toConfirm} payment{data.toConfirm === 1 ? '' : 's'} to confirm
            <span className="block text-sm font-normal text-espresso/70">Customers tapped “I’ve paid”. Check M-Pesa, then confirm.</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      )}
      <AlertsNudge />
      {error && <ErrorNote>{error}</ErrorNote>}
      {!data && loading && <div className="h-96 animate-pulse rounded-3xl bg-beige" />}

      {data && (
        <div className={cn('space-y-4 transition-opacity duration-300 sm:space-y-5', loading && 'opacity-60')}>
          <Panel>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-sm text-espresso/55">Revenue · {period.long}</div>
                <div className="mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">{money(data.current.revenue)}</div>
                <div className="mt-2">
                  <Delta current={data.current.revenue} previous={data.previous?.revenue} period={periodWord} />
                </div>
              </div>
              <div className="text-xs text-espresso/45 sm:text-right">
                Excludes cancelled orders
                <br className="hidden sm:block" />
                <span className="sm:hidden"> · </span>
                {data.granularity === 'day' ? 'Daily' : 'Monthly'} totals, incl. delivery
              </div>
            </div>
            <div className="mt-6">
              <RevenueChart series={data.series} />
            </div>
          </Panel>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Tile i={0} label="Orders" value={num(data.current.orders)} current={data.current.orders} previous={data.previous?.orders} period={periodWord} />
            <Tile i={1} label="Jars sold" value={num(data.current.units)} current={data.current.units} previous={data.previous?.units} period={periodWord} />
            <Tile i={2} label="Avg. order value" value={money(data.current.aov)} current={data.current.aov} previous={data.previous?.aov} period={periodWord} />
            <Tile i={3} label="Collected" value={money(data.current.collected)} current={data.current.collected} previous={data.previous?.collected} period={periodWord} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[1.6fr_1fr]">
            <Panel title="Sales by product" subtitle={`Revenue and units sold, ${period.long}`}>
              <BarList
                rows={data.byProduct}
                valueOf={(r) => r.revenue}
                labelOf={(r) => r.name}
                detailOf={(r) => `${num(r.units)} sold`}
                total={data.byProduct.reduce((s, r) => s + r.revenue, 0)}
              />
            </Panel>
            <div className="space-y-4 sm:space-y-5">
              <Panel title="Sales by branch" subtitle={`Revenue, ${period.long}`}>
                <BarList
                  rows={data.byBranch}
                  valueOf={(r) => r.revenue}
                  labelOf={(r) => r.label}
                  detailOf={(r) => `${num(r.orders)} orders`}
                  total={data.byBranch.reduce((s, r) => s + r.revenue, 0)}
                />
              </Panel>
              <Panel
                title="Website vs recorded sales"
                subtitle={`By channel, ${period.long}`}
                action={
                  <Link to="/admin/sales/new" className="inline-flex items-center gap-1 text-sm font-semibold text-caramel hover:underline">
                    Record a sale <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                }
              >
                <BarList
                  rows={data.byChannel}
                  valueOf={(r) => r.revenue}
                  labelOf={(r) => r.label}
                  detailOf={(r) => `${num(r.orders)} orders`}
                  total={data.byChannel.reduce((s, r) => s + r.revenue, 0)}
                />
              </Panel>
              <Panel title="Books at a glance">
                <dl className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-espresso/55">Collected (payment confirmed)</dt>
                    <dd className="font-semibold text-emerald-800 tabular-nums">{money(data.current.collected)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-espresso/55">Unpaid (pending orders)</dt>
                    <dd className="font-semibold tabular-nums">{money(data.current.outstanding)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-espresso/55">Newsletter subscribers</dt>
                    <dd className="font-semibold tabular-nums">{num(data.subscribers)}</dd>
                  </div>
                </dl>
                <Link to="/admin/ledger" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-caramel hover:underline">
                  Open ledger <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Panel>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[1.6fr_1fr]">
            <Panel
              title="Recent orders"
              action={
                <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-caramel hover:underline">
                  All orders <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            >
              <ul className="-mx-2 divide-y divide-espresso/[0.06]">
                {data.recent.map((o) => (
                  <li key={o.id} className="flex items-center gap-3 rounded-xl px-2 py-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-beige text-sm font-bold text-caramel">{o.customer_name[0]}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{o.customer_name}</div>
                      <div className="truncate text-xs text-espresso/50">
                        {o.code} · {o.city} · {dateTime(o.created_at)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold tabular-nums">{money(o.total)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Running low" subtitle="Products under 30 jars">
              {data.lowStock.length === 0 ? (
                <p className="text-sm text-espresso/55">All products are well stocked.</p>
              ) : (
                <ul className="space-y-3">
                  {data.lowStock.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 text-sm">
                      <AlertTriangle className={cn('h-4 w-4 shrink-0', p.stock < 10 ? 'text-red-700' : 'text-amber-600')} />
                      <span className="flex-1 truncate font-semibold">{p.name}</span>
                      <span className="tabular-nums text-espresso/60">{p.stock} left</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/admin/inventory" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-caramel hover:underline">
                Manage inventory <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
