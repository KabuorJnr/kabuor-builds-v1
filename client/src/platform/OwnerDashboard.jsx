// Kabuor Builds' own dashboard: is money coming in, where do signups drop off, who needs a call today, and
// which shops are selling. Lives at /admin on the platform's address.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, ExternalLink, Loader2, LogOut, MessageCircle, Phone, Search } from 'lucide-react';
import { cn } from '../lib/format';
import { ksh } from './shared';
import { Wordmark } from './PlatformApp';
import MpesaRequests from './MpesaRequests';
import DemoRequests from './DemoRequests';
import CareersAdmin from './CareersAdmin';
import { shopAddress } from '../lib/base';

const KEY = 'kb-owner-token';
const getToken = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const setToken = (t) => {
  try {
    if (t) localStorage.setItem(KEY, t);
    else localStorage.removeItem(KEY);
  } catch {}
};

async function oapi(path, { method = 'GET', body } = {}) {
  const t = getToken();
  const res = await fetch(`/api/platform/admin${path}`, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Network error'), { status: res.status });
  return data;
}

const RANGES = [
  ['7d', '7 days'],
  ['30d', '30 days'],
  ['90d', '90 days'],
  ['365d', '12 months'],
];
const STAGES = {
  designing: { label: 'Designing', tone: 'bg-sand text-espresso/70' },
  previewing: { label: 'At preview', tone: 'bg-amber-100 text-amber-900' },
  paid: { label: 'Paid, not open', tone: 'bg-[#E4E2FF] text-[#2A1F96]' },
  live: { label: 'Live', tone: 'bg-emerald-100 text-emerald-900' },
  paused: { label: 'Paused', tone: 'bg-red-100 text-red-900' },
  abandoned: { label: 'Gave up', tone: 'bg-espresso/10 text-espresso/50' },
};
const day = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—');
const daysFrom = (iso) => Math.ceil((Date.parse(iso) - Date.now()) / 864e5);
const shopUrl = shopAddress;
const wa = (phone, text) => `https://wa.me/254${String(phone).replace(/\D/g, '').replace(/^(254|0)/, '')}?text=${encodeURIComponent(text)}`;

function Login({ onIn }) {
  const [f, setF] = useState({ email: '', password: '' });
  const [state, setState] = useState({ busy: false, error: null });
  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: null });
    try {
      const r = await oapi('/login', { method: 'POST', body: f });
      setToken(r.token);
      onIn();
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };
  return (
    <div className="grid min-h-svh place-items-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <Wordmark />
        <h1 className="kb-display pt-4 text-4xl">Dashboard</h1>
        <input className="field" type="email" autoComplete="email" placeholder="Email" value={f.email} onChange={(e) => setF((x) => ({ ...x, email: e.target.value }))} required />
        <input className="field" type="password" autoComplete="current-password" placeholder="Password" value={f.password} onChange={(e) => setF((x) => ({ ...x, password: e.target.value }))} required />
        {state.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-800">{state.error}</p>}
        <button className="btn btn-primary w-full py-3.5" disabled={state.busy}>
          {state.busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
        </button>
      </form>
    </div>
  );
}

function Delta({ now, before }) {
  if (!before) return <span className="text-xs text-espresso/45">{now ? 'nothing in the period before' : ' '}</span>;
  const pct = Math.round(((now - before) / before) * 100);
  const up = pct >= 0;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold', up ? 'text-emerald-700' : 'text-red-700')}>
      {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {Math.abs(pct)}% vs the period before
    </span>
  );
}

function Kpi({ label, value, children }) {
  return (
    <div className="rounded-[var(--r-xl)] bg-white p-5 ring-1 ring-espresso/[0.07]">
      <p className="text-sm font-semibold text-espresso/55">{label}</p>
      <p className="kb-display mt-2 text-4xl tabular-nums">{value}</p>
      <div className="mt-1 min-h-5 text-xs text-espresso/55">{children}</div>
    </div>
  );
}

function MiniBars({ data, dataKey, format, label, empty }) {
  const none = !data.some((d) => d[dataKey]);
  return (
    <div className="rounded-[var(--r-xl)] bg-white p-5 ring-1 ring-espresso/[0.07]">
      <p className="text-sm font-semibold text-espresso/55">{label}</p>
      {none ? (
        <p className="grid h-40 place-items-center text-center text-sm text-espresso/50">{empty}</p>
      ) : (
      <div className="mt-3 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" tickFormatter={(d) => day(d)} tick={{ fontSize: 11, fill: '#8a8178' }} axisLine={false} tickLine={false} minTickGap={24} />
            <YAxis allowDecimals={false} tickFormatter={format} tick={{ fontSize: 11, fill: '#8a8178' }} axisLine={false} tickLine={false} width={44} />
            <Tooltip cursor={{ fill: 'rgba(15,17,21,.05)' }} formatter={(v) => [format(v), label]} labelFormatter={(d) => day(d)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px -12px rgba(0,0,0,.3)' }} />
            <Bar dataKey={dataKey} fill="#2357F5" radius={[4, 4, 0, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}

function Funnel({ steps }) {
  const top = steps[0]?.count || 0;
  return (
    <div className="rounded-[var(--r-xl)] bg-white p-5 ring-1 ring-espresso/[0.07]">
      <p className="text-sm font-semibold text-espresso/55">From signup to live, this period</p>
      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => {
          const pct = top ? Math.round((s.count / top) * 100) : 0;
          const lost = i > 0 ? steps[i - 1].count - s.count : 0;
          return (
            <li key={s.id}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-semibold">{s.label}</span>
                <span className="tabular-nums">
                  <b>{s.count}</b> <span className="text-espresso/45">· {pct}%</span>
                </span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-espresso/[0.06]">
                <div className="h-full rounded-full bg-[#2357F5]" style={{ width: `${Math.max(pct, s.count ? 2 : 0)}%` }} />
              </div>
              {lost > 0 && <p className="mt-1 text-xs text-espresso/45">{lost} stopped before this step</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** People worth calling today: plans about to end, and signups one step from paying. */
function CallList({ expiring, stuck }) {
  const rows = [
    ...expiring.map((s) => ({ ...s, why: daysFrom(s.paidUntil) <= 0 ? 'Plan ended' : `Plan ends in ${daysFrom(s.paidUntil)} d`, msg: `Hi, your ${s.name} shop plan ends soon. Renew in your admin under Plan & billing to keep it open.` })),
    ...stuck.map((s) => ({ ...s, why: s.stage === 'paid' ? 'Paid, shop not opened' : 'At preview, not paid', msg: `Hi ${s.owner}, your ${s.name} shop is ready on Kabuor Builds. Need any help to go live?` })),
  ];
  return (
    <div className="rounded-[var(--r-xl)] bg-white p-5 ring-1 ring-espresso/[0.07]">
      <p className="text-sm font-semibold text-espresso/55">Call today</p>
      {rows.length ? (
        <ul className="mt-3 divide-y divide-espresso/[0.07]">
          {rows.map((r) => (
            <li key={`${r.slug}-${r.why}`} className="flex items-center gap-3 py-2.5">
              <span className="min-w-0 flex-1">
                <b className="block truncate text-sm">{r.name}</b>
                <span className="text-xs text-espresso/55">{r.why}</span>
              </span>
              <a href={`tel:${r.phone}`} className="grid h-9 w-9 place-items-center rounded-full bg-beige" aria-label={`Call ${r.name}`}>
                <Phone className="h-4 w-4" />
              </a>
              <a href={wa(r.phone, r.msg)} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-[#1E8E3E] text-[#fff]" aria-label={`WhatsApp ${r.name}`}>
                <MessageCircle className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-espresso/55">Nobody to chase right now.</p>
      )}
    </div>
  );
}

function ShopsTable({ data, stage, setStage, q, setQ }) {
  return (
    <div className="rounded-[var(--r-xl)] bg-white ring-1 ring-espresso/[0.07]">
      <div className="flex flex-col gap-3 border-b border-espresso/[0.07] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto" role="group" aria-label="Filter by stage">
          {[['', 'All', data.total], ...Object.entries(STAGES).map(([id, s]) => [id, s.label, data.counts[id] ?? 0])].map(([id, label, n]) => (
            <button key={id || 'all'} aria-pressed={stage === id} onClick={() => setStage(id)} className={cn('flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1', stage === id ? 'bg-espresso text-cream ring-espresso' : 'ring-espresso/10 text-espresso/70')}>
              {label} <span className={cn('text-xs tabular-nums', stage === id ? 'text-cream/60' : 'text-espresso/40')}>{n}</span>
            </button>
          ))}
        </div>
        <label className="relative block lg:w-72">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-espresso/40" />
          <input className="field pl-9! py-2! text-sm" placeholder="Search shop, link, owner or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-xs text-espresso/50">
              <th className="px-4 py-2.5 font-semibold">Shop</th>
              <th className="px-4 py-2.5 font-semibold">Stage</th>
              <th className="px-4 py-2.5 font-semibold">Plan</th>
              <th className="px-4 py-2.5 text-right font-semibold">Orders · 30 d</th>
              <th className="px-4 py-2.5 text-right font-semibold">Their sales · 30 d</th>
              <th className="px-4 py-2.5 font-semibold">Owner</th>
              <th className="px-4 py-2.5 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-espresso/[0.06]">
            {data.shops.map((s) => (
              <tr key={s.slug}>
                <td className="px-4 py-3">
                  <b className="block">{s.name}</b>
                  <a href={shopUrl(s.slug)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-caramel hover:underline">
                    {s.slug} <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', STAGES[s.stage].tone)}>{STAGES[s.stage].label}</span>
                </td>
                <td className="px-4 py-3 text-xs text-espresso/65">
                  {s.paidUntil ? (
                    <>
                      {s.plan === 'yearly' ? 'Yearly' : 'Monthly'}
                      <span className="block">to {day(s.paidUntil)}</span>
                    </>
                  ) : (
                    'Not paid'
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{s.orders}</td>
                <td className="px-4 py-3 text-right tabular-nums">{s.sales ? ksh(s.sales) : '—'}</td>
                <td className="px-4 py-3 text-xs">
                  {s.owner}
                  <a href={`tel:${s.phone}`} className="block text-espresso/55 hover:underline">
                    {s.phone}
                  </a>
                </td>
                <td className="px-4 py-3 text-xs text-espresso/55">{day(s.createdAt)}</td>
              </tr>
            ))}
            {!data.shops.length && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-espresso/50">
                  No shops match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OwnerDashboard() {
  const [signedIn, setSignedIn] = useState(Boolean(getToken()));
  const [range, setRange] = useState('30d');
  const [o, setO] = useState(null);
  const [list, setList] = useState(null);
  const [stage, setStage] = useState('');
  const [q, setQ] = useState('');
  const [error, setError] = useState(null);

  const fail = useCallback((err) => {
    if (err.status === 401) {
      setToken(null);
      setSignedIn(false);
    } else setError(err.message);
  }, []);
  useEffect(() => {
    if (signedIn) oapi(`/overview?range=${range}`).then(setO).catch(fail);
  }, [signedIn, range, fail]);
  useEffect(() => {
    if (!signedIn) return;
    const t = setTimeout(() => oapi(`/shops?stage=${stage}&q=${encodeURIComponent(q)}`).then(setList).catch(fail), 200);
    return () => clearTimeout(t);
  }, [signedIn, stage, q, fail]);
  // Shown first when owners were waiting on an M-Pesa setup at load; below the numbers when nobody was.
  // (It stays put while you work through them, so the "prompt is on" confirmation stays in view.)
  const waitingNow = o?.mpesaRequests ?? 0;
  const requests = o && <MpesaRequests oapi={oapi} onError={fail} />;
  const stuck = useMemo(() => (list?.shops ?? []).filter((s) => s.stage === 'paid' || s.stage === 'previewing').slice(0, 8), [list]);

  if (!signedIn) return <Login onIn={() => setSignedIn(true)} />;
  const rangeLabel = RANGES.find(([id]) => id === range)[1];
  const conversion = o && o.funnel[0].count ? Math.round((o.funnel[3].count / o.funnel[0].count) * 100) : 0;

  return (
    <div className="container-x pb-16">
      <header className="flex flex-wrap items-center justify-between gap-4 py-5">
        <Link to="/">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-espresso/10" role="radiogroup" aria-label="Period">
            {RANGES.map(([id, label]) => (
              <button key={id} role="radio" aria-checked={range === id} onClick={() => setRange(id)} className={cn('rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm', range === id ? 'bg-espresso text-cream' : 'text-espresso/60')}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => (setToken(null), setSignedIn(false))} className="grid h-9 w-9 place-items-center rounded-full bg-white ring-1 ring-espresso/10" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <h1 className="kb-display text-4xl sm:text-5xl">How Kabuor Builds is doing</h1>
      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</p>}
      {o?.testMode && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <b>Test mode:</b> M-Pesa keys aren’t set on this server, so payments here are simulated. They’re kept out of the money figures.
        </p>
      )}

      {!o ? (
        <div className="grid h-60 place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-espresso/40" />
        </div>
      ) : (
        <>
          {/* People asking for a demo come first while any are new: they cool off fastest. */}
          {(o.demoRequests ?? 0) > 0 && <div className="mt-6"><DemoRequests oapi={oapi} onError={fail} /></div>}
          {/* New job applicants come up here too; with none waiting, hiring sits at the bottom. */}
          {(o.careerApplications ?? 0) > 0 && <div className="mt-6"><CareersAdmin oapi={oapi} onError={fail} /></div>}
          {waitingNow > 0 && <div className="mt-6">{requests}</div>}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label={`Money in · last ${rangeLabel}`} value={ksh(o.revenue.amount)}>
              <Delta now={o.revenue.amount} before={o.revenue.previous} />
            </Kpi>
            <Kpi label="Monthly recurring" value={ksh(o.mrr)}>
              from {o.totals.live} live {o.totals.live === 1 ? 'shop' : 'shops'}
            </Kpi>
            <Kpi label="Live shops" value={o.totals.live}>
              {o.totals.paused ? <span className="font-semibold text-red-700">{o.totals.paused} paused for not renewing</span> : `${o.totals.shops} signups in total`}
            </Kpi>
            <Kpi label={`New signups · last ${rangeLabel}`} value={o.funnel[0].count}>
              {o.funnel[0].count ? `${conversion}% went live` : 'none yet'}
            </Kpi>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <MiniBars data={o.series} dataKey="revenue" format={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} label="Money in (KSh)" empty="No real M-Pesa payments in this period yet" />
            <MiniBars data={o.series} dataKey="signups" format={(v) => v} label="Signups" empty="No signups in this period yet" />
            <Funnel steps={o.funnel} />
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <CallList expiring={o.expiring} stuck={stuck} />
            <div className="rounded-[var(--r-xl)] bg-white p-5 ring-1 ring-espresso/[0.07]">
              <p className="text-sm font-semibold text-espresso/55">What your shops sold · last {rangeLabel}</p>
              <p className="kb-display mt-2 text-4xl tabular-nums">{ksh(o.gmv.amount)}</p>
              <p className="mt-1 text-xs text-espresso/55">
                {o.gmv.orders} customer orders through Kabuor Builds shops (their money, paid to their own tills)
              </p>
              {o.kinds.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-sm">
                  {o.kinds.map((k) => (
                    <li key={k.id} className="flex justify-between">
                      <span>{k.label}</span>
                      <b className="tabular-nums">{k.count}</b>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-[var(--r-xl)] bg-white p-5 ring-1 ring-espresso/[0.07]">
              <p className="text-sm font-semibold text-espresso/55">Latest payments</p>
              {o.payments.length ? (
                <ul className="mt-3 divide-y divide-espresso/[0.07] text-sm">
                  {o.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0">
                        <b className="block truncate">{p.name ?? p.slug}</b>
                        <span className="text-xs text-espresso/50">
                          {day(p.created_at)} · {p.plan === 'yearly' ? 'Yearly' : 'Monthly'}
                          {p.test && ' · test'}
                        </span>
                      </span>
                      <span className={cn('shrink-0 text-right tabular-nums', p.status === 'paid' ? 'font-bold' : 'text-espresso/45')}>
                        {ksh(p.amount)}
                        <span className="block text-[11px] font-semibold">{p.status === 'paid' ? p.receipt : p.status === 'failed' ? 'failed' : 'waiting'}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-espresso/55">No payments yet.</p>
              )}
            </div>
          </div>

          {waitingNow === 0 && <div className="mt-10">{requests}</div>}
          {(o.demoRequests ?? 0) === 0 && <div className="mt-10"><DemoRequests oapi={oapi} onError={fail} /></div>}
          <h2 className="kb-display mt-10 text-3xl">Shops</h2>
          <div className="mt-3">{list && <ShopsTable data={list} stage={stage} setStage={setStage} q={q} setQ={setQ} />}</div>
          {(o.careerApplications ?? 0) === 0 && (
            <div className="mt-12">
              <CareersAdmin oapi={oapi} onError={fail} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
