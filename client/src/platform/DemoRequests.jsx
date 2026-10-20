// Demo requests from the company site, newest waiting first. The next step is always a WhatsApp message, so
// each card opens one with the person's name and product filled in, then marks where the conversation is.
import { useCallback, useEffect, useState } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { cn } from '../lib/format';

const STEPS = [
  ['new', 'New'],
  ['contacted', 'Contacted'],
  ['booked', 'Demo booked'],
  ['closed', 'Closed'],
];
const TONE = { new: 'bg-amber-100 text-amber-900', contacted: 'bg-[#E4E2FF] text-[#2A1F96]', booked: 'bg-emerald-100 text-emerald-900', closed: 'bg-espresso/10 text-espresso/55' };
const PRODUCT = { erp: 'Kabuor ERP', shops: 'Kabuor Shops', both: 'ERP + Shops' };
const STAFF = { 1: 'Just them', '2-10': '2–10 staff', '11-50': '11–50 staff', '50+': '50+ staff' };
const ago = (iso) => {
  const h = Math.floor((Date.now() - Date.parse(iso)) / 36e5);
  return h < 1 ? 'just now' : h < 24 ? `${h} h ago` : `${Math.floor(h / 24)} d ago`;
};
const wa = (phone, text) => `https://wa.me/254${String(phone).replace(/\D/g, '').replace(/^(254|0)/, '')}?text=${encodeURIComponent(text)}`;

export default function DemoRequests({ oapi, onError }) {
  const [tab, setTab] = useState('open');
  const [data, setData] = useState(null);
  const load = useCallback(() => oapi(`/demo-requests?status=${tab}`).then(setData).catch(onError), [oapi, tab, onError]);
  useEffect(() => {
    load();
  }, [load]);
  const move = (id, status) => oapi(`/demo-requests/${id}/status`, { method: 'POST', body: { status } }).then(load).catch(onError);
  const open = data ? data.counts.new + data.counts.contacted + data.counts.booked : 0;

  return (
    <section className="rounded-[var(--r-xl)] bg-white p-5 ring-1 ring-espresso/[0.07] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="kb-display text-2xl">Demo requests</h2>
          <p className="text-sm text-espresso/60">{data ? `${data.counts.new} new · ${data.counts.booked} demos booked` : 'Loading…'}</p>
        </div>
        <div className="inline-flex rounded-full bg-beige p-1" role="radiogroup" aria-label="Show">
          {[
            ['open', `Open ${open}`],
            ['closed', `Closed ${data?.counts.closed ?? ''}`],
          ].map(([id, label]) => (
            <button key={id} role="radio" aria-checked={tab === id} onClick={() => setTab(id)} className={cn('rounded-full px-3 py-1.5 text-sm font-semibold', tab === id ? 'bg-espresso text-cream' : 'text-espresso/60')}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {data && data.requests.length === 0 && <p className="mt-4 text-sm text-espresso/60">{tab === 'open' ? 'Nobody is waiting. Requests from the company site land here.' : 'None closed yet.'}</p>}
      <ul className="mt-4 divide-y divide-espresso/10">
        {data?.requests.map((r) => (
          <li key={r.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <b className="text-lg">{r.business}</b>
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', TONE[r.status])}>{STEPS.find(([id]) => id === r.status)[1]}</span>
              </div>
              <p className="text-sm text-espresso/65">
                {r.name} · {PRODUCT[r.product]}
                {r.staff && ` · ${STAFF[r.staff]}`} · {ago(r.createdAt)}
              </p>
              {r.note && <p className="mt-1.5 rounded-lg bg-beige px-3 py-2 text-sm">“{r.note}”</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                <a href={wa(r.phone, `Hi ${r.name.split(' ')[0]}, this is Kabuor Builds. Thanks for asking for a ${PRODUCT[r.product]} demo for ${r.business}. When suits you this week?`)} target="_blank" rel="noreferrer" onClick={() => r.status === 'new' && move(r.id, 'contacted')} className="btn bg-[#1E8E3E] px-4 py-2 text-sm text-[#fff] hover:bg-[#176F30]">
                  <MessageCircle className="h-4 w-4" /> WhatsApp {r.phone}
                </a>
                <a href={`tel:${r.phone}`} className="btn btn-ghost px-4 py-2 text-sm">
                  <Phone className="h-4 w-4" /> Call
                </a>
                {r.email && <a href={`mailto:${r.email}`} className="btn btn-ghost px-4 py-2 text-sm">{r.email}</a>}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:justify-end" role="group" aria-label="Where is this?">
              {STEPS.filter(([id]) => id !== 'new').map(([id, label]) => (
                <button key={id} aria-pressed={r.status === id} onClick={() => move(r.id, id)} className={cn('rounded-full px-3 py-1.5 text-xs font-semibold ring-1', r.status === id ? 'bg-espresso text-cream ring-espresso' : 'bg-white ring-espresso/15 hover:ring-espresso/30')}>
                  {label}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
