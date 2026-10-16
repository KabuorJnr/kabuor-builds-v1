import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import { EASE } from '../components/ui';
import { api } from '../lib/api';
import { cn, money, num } from '../lib/format';
import { useAdmin, useAdminQuery } from '../store/admin';
import { ErrorNote, PageHeader, Panel, Segmented } from './shared';

const RANGES = [
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
  { id: '12m', label: '12M' },
  { id: 'all', label: 'All' },
];
const GROUPS = [
  { id: 'day', label: 'Daily' },
  { id: 'month', label: 'Monthly' },
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const periodLabel = (p) => {
  const [y, m, d] = p.split('-').map(Number);
  return d ? `${d} ${MONTHS[m - 1]} ${y}` : `${MONTHS[m - 1]} ${y}`;
};
const pct = (a, b) => (b ? `${((a / b) * 100).toFixed(1)}%` : '—');

export default function Ledger() {
  const token = useAdmin((s) => s.token);
  const [range, setRange] = useState('12m');
  const [group, setGroup] = useState('month');
  const [exporting, setExporting] = useState(null);
  const [exportError, setExportError] = useState(null);
  const { data, error, loading } = useAdminQuery(`/ledger?range=${range}&group=${group}`);

  const download = async (type) => {
    setExporting(type);
    setExportError(null);
    try {
      const res = await api(`/admin/ledger.csv?range=${range}&group=${group}&type=${type}`, { token, raw: true });
      const blob = await res.blob();
      const name = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ?? 'ledger.csv';
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: type === 'transactions' ? name.replace('ledger', 'transactions') : name });
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err.message);
    } finally {
      setExporting(null);
    }
  };

  const t = data?.totals;
  const tiles = t && [
    ['Total sales', money(t.revenue), `${num(t.orders)} orders · ${num(t.units)} jars`],
    ['Collected', money(t.collected), `${pct(t.collected, t.revenue)} of sales · payment confirmed`],
    ['Unpaid', money(t.unpaid), 'Orders still waiting for payment'],
    ['Delivery fees', money(t.delivery), t.delivery ? 'Charged online' : 'Paid to riders, not through the shop'],
  ];

  return (
    <>
      <PageHeader title="Ledger" subtitle="Sales and money collected by period. Cancelled orders are excluded.">
        <button onClick={() => download('summary')} disabled={!!exporting} className="btn btn-ghost py-2.5">
          {exporting === 'summary' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Summary CSV
        </button>
        <button onClick={() => download('transactions')} disabled={!!exporting} className="btn btn-primary py-2.5">
          {exporting === 'transactions' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Transactions CSV
        </button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Segmented id="ledger-range" options={RANGES} value={range} onChange={setRange} />
        <Segmented id="ledger-group" options={GROUPS} value={group} onChange={setGroup} />
      </div>

      {(error || exportError) && <div className="mb-4"><ErrorNote>{error || exportError}</ErrorNote></div>}

      {tiles && (
        <div className={cn('mb-5 grid grid-cols-2 gap-3 transition-opacity sm:gap-4 lg:grid-cols-4', loading && 'opacity-60')}>
          {tiles.map(([label, value, note], i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }} className="card p-4 sm:p-5">
              <div className="text-sm text-espresso/55">{label}</div>
              <div className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">{value}</div>
              <div className="mt-1 text-xs text-espresso/45">{note}</div>
            </motion.div>
          ))}
        </div>
      )}

      <Panel className={cn('overflow-hidden p-0! transition-opacity', loading && data && 'opacity-60')}>
        {!data && loading && <div className="h-80 animate-pulse bg-beige/50" />}
        {data && (
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full min-w-[680px] text-sm tabular-nums">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-espresso/[0.08] text-right text-xs font-semibold tracking-wider text-espresso/45 uppercase">
                  <th className="sticky left-0 bg-white py-3.5 pl-5 text-left sm:pl-6">Period</th>
                  <th className="py-3.5 pl-4">Orders</th>
                  <th className="py-3.5 pl-4">Jars</th>
                  <th className="py-3.5 pl-4">Sales</th>
                  <th className="py-3.5 pl-4">Delivery</th>
                  <th className="py-3.5 pl-4">Total</th>
                  <th className="py-3.5 pl-4">Collected</th>
                  <th className="py-3.5 pr-5 pl-4 sm:pr-6">Unpaid</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.period} className="border-b border-espresso/[0.05] text-right hover:bg-beige/40">
                    <td className="sticky left-0 bg-white py-3 pl-5 text-left font-semibold sm:pl-6">{periodLabel(r.period)}</td>
                    <td className="py-3 pl-4">{num(r.orders)}</td>
                    <td className="py-3 pl-4">{num(r.units)}</td>
                    <td className="py-3 pl-4">{money(r.sales)}</td>
                    <td className="py-3 pl-4 text-espresso/60">{money(r.delivery)}</td>
                    <td className="py-3 pl-4 font-semibold">{money(r.revenue)}</td>
                    <td className="py-3 pl-4 font-semibold text-emerald-800">{money(r.collected)}</td>
                    <td className={cn('py-3 pr-5 pl-4 sm:pr-6', r.unpaid ? 'text-amber-800' : 'text-espresso/40')}>{money(r.unpaid)}</td>
                  </tr>
                ))}
                {data.rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-espresso/55">No sales in this period yet.</td>
                  </tr>
                )}
              </tbody>
              {data.rows.length > 0 && (
                <tfoot className="sticky bottom-0 bg-beige">
                  <tr className="text-right font-bold">
                    <td className="sticky left-0 bg-beige py-3.5 pl-5 text-left sm:pl-6">Total</td>
                    <td className="py-3.5 pl-4">{num(t.orders)}</td>
                    <td className="py-3.5 pl-4">{num(t.units)}</td>
                    <td className="py-3.5 pl-4">{money(t.sales)}</td>
                    <td className="py-3.5 pl-4">{money(t.delivery)}</td>
                    <td className="py-3.5 pl-4">{money(t.revenue)}</td>
                    <td className="py-3.5 pl-4 text-emerald-800">{money(t.collected)}</td>
                    <td className="py-3.5 pr-5 pl-4 sm:pr-6">{money(t.unpaid)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
