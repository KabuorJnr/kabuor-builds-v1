// Owners who asked Kabuor Builds to connect their M-Pesa prompt. The developer drops in the Daraja
// credentials file (or pastes it, or types the keys), Safaricom checks the consumer key and secret, and the
// shop's checkout sends PIN prompts from the next order on.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ExternalLink, FileUp, Loader2, MessageCircle, Phone, Zap } from 'lucide-react';
import { cn } from '../lib/format';
import { shopAddress } from '../lib/base';

const TABS = [
  ['open', 'Waiting'],
  ['live', 'Connected'],
  ['cancelled', 'Declined'],
];
const STATUS = {
  requested: { label: 'New', tone: 'bg-amber-100 text-amber-900' },
  working: { label: 'In progress', tone: 'bg-[#E4E2FF] text-[#2A1F96]' },
  live: { label: 'Connected', tone: 'bg-emerald-100 text-emerald-900' },
  cancelled: { label: 'Declined', tone: 'bg-espresso/10 text-espresso/55' },
};
const ago = (iso) => {
  const h = Math.floor((Date.now() - Date.parse(iso)) / 36e5);
  return h < 1 ? 'just now' : h < 24 ? `${h} h ago` : `${Math.floor(h / 24)} d ago`;
};
const shopUrl = shopAddress;
const wa = (phone, text) => `https://wa.me/254${String(phone).replace(/\D/g, '').replace(/^(254|0)/, '')}?text=${encodeURIComponent(text)}`;

// ---------- reading a credentials file ----------
// Accepts .env lines (MPESA_CONSUMER_KEY=…), "Consumer Key: …" text, or JSON, with any prefix.
const NAMES = [
  ['passkey', /pass.?key|lipa.?na.?m.?pesa|lnm/],
  ['secret', /consumer.?secret|client.?secret|(^|_)secret$/],
  ['key', /consumer.?key|client.?id|(^|_)key$/],
  ['shortcode', /short.?code|store.?number|business.?short|head.?office|(^|_)ho$/],
  ['till', /till|party.?b/],
  ['env', /env|environment|mode/],
];
function pairsOf(text) {
  try {
    const out = [];
    const walk = (o, prefix = '') => Object.entries(o ?? {}).forEach(([k, v]) => (v && typeof v === 'object' ? walk(v, `${prefix}${k}_`) : out.push([`${prefix}${k}`, String(v)])));
    walk(JSON.parse(text));
    return out;
  } catch {
    return text
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*(?:export\s+)?([A-Za-z][\w .-]*?)\s*[=:]\s*(.+?)\s*$/))
      .filter(Boolean)
      .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, '')]);
  }
}
export function readCredentials(text) {
  const found = {};
  for (const [rawName, value] of pairsOf(text)) {
    const name = rawName.toLowerCase().replace(/[\s.-]+/g, '_');
    const hit = NAMES.find(([, re]) => re.test(name));
    if (!hit || !value || found[hit[0]]) continue;
    const [field] = hit;
    if (field === 'env') found.env = /prod|live/i.test(value) ? 'production' : /sand|test/i.test(value) ? 'sandbox' : undefined;
    else if (field === 'shortcode' || field === 'till') found[field] = value.replace(/\D/g, '');
    else found[field] = value.trim();
  }
  return Object.fromEntries(Object.entries(found).filter(([, v]) => v));
}

function Seg({ label, value, onChange, options }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-espresso/60">{label}</p>
      <div className="inline-flex rounded-full bg-beige p-1" role="radiogroup" aria-label={label}>
        {options.map(([id, text]) => (
          <button key={id} type="button" role="radio" aria-checked={value === id} onClick={() => onChange(id)} className={cn('rounded-full px-3 py-1 text-sm font-semibold', value === id ? 'bg-espresso text-cream' : 'text-espresso/60')}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function Input({ label, hint, ...props }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-semibold text-espresso/60">{label}</span>
      <input className="field py-2! text-sm" autoComplete="off" spellCheck={false} {...props} />
      {hint && <span className="mt-1 block text-[11px] text-espresso/45">{hint}</span>}
    </label>
  );
}

function ConnectPanel({ r, oapi, onDone }) {
  const till = r.type === 'till';
  const [f, setF] = useState({
    env: 'production',
    type: r.type,
    shortcode: till ? r.store : r.number,
    till: till ? r.number : '',
    key: '',
    secret: '',
    passkey: '',
    reply: 'Your M-Pesa prompt is on. Customers now get the PIN prompt at checkout and pay straight into your account.',
  });
  const [found, setFound] = useState([]);
  const [drag, setDrag] = useState(false);
  const [state, setState] = useState({ busy: false, error: null });
  const fileRef = useRef();
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v }));

  const fill = (text) => {
    const got = readCredentials(text);
    setF((x) => ({ ...x, ...got }));
    setFound(Object.keys(got));
    if (!Object.keys(got).length) setState({ busy: false, error: 'Couldn’t find any keys in that. Type them in below.' });
    else setState({ busy: false, error: null });
  };
  const readFile = async (file) => {
    if (!file) return;
    if (file.size > 64 * 1024) return setState({ busy: false, error: 'That file is too big to be a credentials file.' });
    fill(await file.text());
  };

  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: null });
    try {
      await oapi(`/mpesa-requests/${r.id}/keys`, { method: 'PUT', body: f });
      onDone(`${r.name}: M-Pesa prompt is on.`);
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };

  const LABELS = { key: 'consumer key', secret: 'consumer secret', passkey: 'passkey', shortcode: 'shortcode', till: 'till', env: 'mode' };
  return (
    <form onSubmit={submit} className="mt-4 space-y-4 rounded-2xl bg-beige/40 p-4 ring-1 ring-espresso/[0.07]">
      <div
        onDragOver={(e) => (e.preventDefault(), setDrag(true))}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => (e.preventDefault(), setDrag(false), readFile(e.dataTransfer.files?.[0]))}
        className={cn('rounded-xl border-2 border-dashed p-3 transition-colors', drag ? 'border-[#2357F5] bg-[#2357F5]/5' : 'border-espresso/15')}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm">
            <b>Drop the Daraja credentials file</b> <span className="text-espresso/55">(.env, .txt or .json), or paste it below</span>
          </p>
          <button type="button" className="btn btn-ghost py-1.5! text-sm" onClick={() => fileRef.current?.click()}>
            <FileUp className="h-4 w-4" /> Choose file
          </button>
          <input ref={fileRef} type="file" accept=".env,.txt,.json,text/plain,application/json" className="hidden" onChange={(e) => readFile(e.target.files?.[0])} />
        </div>
        <textarea rows={2} className="field mt-2 font-mono text-xs" placeholder={'MPESA_CONSUMER_KEY=…\nMPESA_CONSUMER_SECRET=…\nMPESA_PASSKEY=…'} onChange={(e) => e.target.value.trim() && fill(e.target.value)} spellCheck={false} />
        {found.length > 0 && (
          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-emerald-800">
            <Check className="h-3.5 w-3.5" /> Filled in: {found.map((k) => LABELS[k]).join(', ')}. Check them below.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <Seg label="Mode" value={f.env} onChange={set('env')} options={[['production', 'Live'], ['sandbox', 'Sandbox']]} />
        <Seg label="Customers pay to" value={f.type} onChange={set('type')} options={[['till', 'Till'], ['paybill', 'Paybill']]} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Shortcode" inputMode="numeric" value={f.shortcode} onChange={set('shortcode')} hint={f.type === 'till' ? 'The store (HO) number the keys belong to' : 'The Paybill number'} required />
        {f.type === 'till' && <Input label="Till number" inputMode="numeric" value={f.till} onChange={set('till')} hint="The number customers pay" required />}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input label="Consumer key" value={f.key} onChange={set('key')} required />
        <Input label="Consumer secret" type="password" value={f.secret} onChange={set('secret')} autoComplete="new-password" required />
        <Input label="Passkey" type="password" value={f.passkey} onChange={set('passkey')} autoComplete="new-password" required />
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-espresso/60">Message the owner sees</span>
        <textarea rows={2} className="field text-sm" value={f.reply} onChange={set('reply')} />
      </label>
      {state.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-800">{state.error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" disabled={state.busy}>
          {state.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} Check with Safaricom &amp; switch on
        </button>
        <span className="text-xs text-espresso/50">Goes live on {r.slug} at once. If Safaricom rejects the keys, nothing changes.</span>
      </div>
    </form>
  );
}

function ReplyAction({ r, oapi, kind, onDone }) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState(kind === 'working' ? 'We’re on it. We’ll call you to approve the Safaricom setup.' : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  if (!open)
    return (
      <button type="button" className={cn('btn btn-ghost py-1.5! text-sm', kind === 'decline' && 'text-red-700')} onClick={() => setOpen(true)}>
        {kind === 'working' ? 'Mark in progress' : 'Decline'}
      </button>
    );
  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      await oapi(`/mpesa-requests/${r.id}/${kind}`, { method: 'POST', body: { reply } });
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };
  return (
    <div className="mt-3 w-full space-y-2">
      <textarea rows={2} className="field text-sm" value={reply} onChange={(e) => setReply(e.target.value)} placeholder={kind === 'decline' ? 'Why, so the owner knows what to do next' : ''} aria-label="Message the owner sees" />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button type="button" className={cn('btn py-1.5! text-sm', kind === 'decline' ? 'bg-red-700 text-white' : 'btn-primary')} onClick={send} disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} {kind === 'working' ? 'Tell the owner' : 'Decline request'}
        </button>
        <button type="button" className="btn btn-ghost py-1.5! text-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function RequestCard({ r, oapi, onChanged }) {
  const [connecting, setConnecting] = useState(false);
  const open = r.status === 'requested' || r.status === 'working';
  const pay = `${r.type === 'till' ? 'Till' : 'Paybill'} ${r.number}${r.store ? ` · store ${r.store}` : ''}`;
  return (
    <li className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <b className="text-base">{r.name}</b>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', STATUS[r.status].tone)}>{STATUS[r.status].label}</span>
            {!r.shopLive && <span className="rounded-full bg-espresso/5 px-2 py-0.5 text-xs text-espresso/55">shop not open yet</span>}
          </div>
          <p className="mt-0.5 text-sm">
            <span className="font-semibold">{pay}</span>
            <span className="text-espresso/50"> · {r.owner} · {open ? `asked ${ago(r.createdAt)}` : r.liveAt ? `connected ${ago(r.liveAt)}` : `closed ${ago(r.updatedAt)}`}</span>
          </p>
          <a href={shopUrl(r.slug)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-caramel hover:underline">
            {r.slug} <ExternalLink className="h-3 w-3" />
          </a>
          {r.note && <p className="mt-2 rounded-xl bg-beige px-3 py-2 text-sm">“{r.note}”</p>}
          {r.keys?.enabled && (
            <p className="mt-2 text-xs font-semibold text-emerald-800">
              Prompt on ({r.keys.environment}) · pays {r.keys.payTo}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a href={`tel:${r.phone}`} className="grid h-9 w-9 place-items-center rounded-full bg-beige" aria-label={`Call ${r.owner}`}>
            <Phone className="h-4 w-4" />
          </a>
          <a href={wa(r.phone, `Hi ${r.owner}, it's Kabuor Builds about connecting the M-Pesa prompt on ${r.name}.`)} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-[#1E8E3E] text-[#fff]" aria-label={`WhatsApp ${r.owner}`}>
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      </div>
      {open && (
        <div className="mt-3 flex flex-wrap items-start gap-2">
          {!connecting && (
            <button type="button" className="btn btn-primary py-1.5! text-sm" onClick={() => setConnecting(true)}>
              <Zap className="h-4 w-4" /> Add keys &amp; switch on
            </button>
          )}
          {r.status === 'requested' && !connecting && <ReplyAction r={r} oapi={oapi} kind="working" onDone={() => onChanged()} />}
          {!connecting && <ReplyAction r={r} oapi={oapi} kind="decline" onDone={() => onChanged()} />}
        </div>
      )}
      {connecting && (
        <>
          <ConnectPanel r={r} oapi={oapi} onDone={onChanged} />
          <button type="button" className="mt-2 text-sm font-semibold text-espresso/55 hover:underline" onClick={() => setConnecting(false)}>
            Cancel
          </button>
        </>
      )}
    </li>
  );
}

export default function MpesaRequests({ oapi, onError, onCount }) {
  const [tab, setTab] = useState('open');
  const [data, setData] = useState(null);
  const [notice, setNotice] = useState(null);
  const load = useCallback(() => oapi(`/mpesa-requests?status=${tab}`).then((d) => (setData(d), onCount?.(d.counts.open))).catch(onError), [oapi, tab, onError, onCount]);
  useEffect(() => {
    load();
  }, [load]);
  const changed = (message) => {
    if (typeof message === 'string') setNotice(message);
    load();
  };

  return (
    <section className="rounded-[var(--r-xl)] bg-white ring-1 ring-espresso/[0.07]" aria-labelledby="mpesa-requests">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-espresso/[0.07] p-4 sm:px-5">
        <div>
          <h2 id="mpesa-requests" className="font-bold">M-Pesa setup requests</h2>
          <p className="text-xs text-espresso/55">Owners who asked you to connect the PIN prompt to their Till or Paybill</p>
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Filter requests">
          {TABS.map(([id, label]) => (
            <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)} className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1', tab === id ? 'bg-espresso text-cream ring-espresso' : 'text-espresso/70 ring-espresso/10')}>
              {label} <span className={cn('text-xs tabular-nums', tab === id ? 'text-cream/60' : 'text-espresso/40')}>{data?.counts[id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>
      {notice && (
        <p className="mx-4 mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 sm:mx-5">
          <Check className="h-4 w-4" /> {notice}
        </p>
      )}
      {!data ? (
        <div className="grid h-24 place-items-center">
          <Loader2 className="h-5 w-5 animate-spin text-espresso/40" />
        </div>
      ) : data.requests.length ? (
        <ul className="divide-y divide-espresso/[0.07]">
          {data.requests.map((r) => (
            <RequestCard key={r.id} r={r} oapi={oapi} onChanged={changed} />
          ))}
        </ul>
      ) : (
        <p className="p-5 text-sm text-espresso/55">{tab === 'open' ? 'No one is waiting. Requests appear here when an owner asks from their M-Pesa prompt page.' : 'Nothing here yet.'}</p>
      )}
    </section>
  );
}
