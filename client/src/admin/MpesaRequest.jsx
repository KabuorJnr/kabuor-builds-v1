// "Connect M-Pesa for me": the owner sends their Till or Paybill to Kabuor Builds, follows the request
// here, and the prompt switches on the moment the developer enters the keys on the platform dashboard.
import { useState } from 'react';
import { Check, Loader2, Send } from 'lucide-react';
import { cn } from '../lib/format';
import { useAdminApi } from '../store/admin';
import { ErrorNote } from './shared';
import { Section, TextArea, TextInput } from './form';

const STEPS = [
  ['requested', 'Request sent'],
  ['working', 'Being set up'],
  ['live', 'Prompts on'],
];
const when = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '');

function Progress({ status }) {
  const at = STEPS.findIndex(([id]) => id === status);
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Request progress">
      {STEPS.map(([id, label], i) => (
        <li key={id} className="min-w-0" aria-current={i === at ? 'step' : undefined}>
          <div className={cn('h-1.5 rounded-full', i <= at ? 'bg-espresso' : 'bg-espresso/10')} />
          <p className={cn('mt-1.5 flex items-center gap-1 text-xs font-semibold', i <= at ? 'text-espresso' : 'text-espresso/40')}>
            {i < at && <Check className="h-3.5 w-3.5 shrink-0" />} <span className="truncate">{label}</span>
          </p>
        </li>
      ))}
    </ol>
  );
}

function RequestForm({ initial, onSaved, onCancel }) {
  const call = useAdminApi();
  const [f, setF] = useState(initial);
  const [state, setState] = useState({ busy: false, error: null });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e?.target ? e.target.value : e }));
  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: null });
    try {
      const { request } = await call('/mpesa-request', { method: 'POST', body: f });
      onSaved(request);
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };
  const till = f.type === 'till';
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <p className="mb-1.5 text-sm font-semibold">Customers pay to</p>
        <div className="inline-flex rounded-full bg-beige p-1" role="radiogroup" aria-label="Customers pay to">
          {[['till', 'Till (Buy Goods)'], ['paybill', 'Paybill']].map(([id, text]) => (
            <button key={id} type="button" role="radio" aria-checked={f.type === id} onClick={() => set('type')(id)} className={cn('rounded-full px-4 py-1.5 text-sm font-semibold', f.type === id ? 'bg-espresso text-cream' : 'text-espresso/60')}>
              {text}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label={till ? 'Till number' : 'Paybill number'} inputMode="numeric" value={f.number} onChange={set('number')} required />
        {till && <TextInput label="Store number" optional inputMode="numeric" value={f.store} onChange={set('store')} hint="The HO number on your Till papers. We’ll find it if you don’t know." />}
      </div>
      <TextInput label="Phone we can call" inputMode="tel" value={f.phone} onChange={set('phone')} placeholder="0712 345 678" hint="Safaricom asks the Till owner to approve the setup, so we’ll call to finish it with you." required />
      <TextArea label="Anything we should know" optional rows={2} value={f.note} onChange={set('note')} placeholder="e.g. the Till is in my business partner’s name" />
      {state.error && <ErrorNote>{state.error}</ErrorNote>}
      <div className="flex flex-wrap gap-3">
        <button className="btn btn-primary" disabled={state.busy}>
          {state.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {onCancel ? 'Save changes' : 'Ask Kabuor Builds to connect it'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/** The request card. `request` is the latest one (or null); `keys` is the shop's prompt status. */
export default function MpesaRequest({ request, keys, defaults, onChange }) {
  const call = useAdminApi();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const open = request && (request.status === 'requested' || request.status === 'working');
  const formFrom = (r) => ({
    type: r?.type ?? defaults.type,
    number: r?.number ?? defaults.number,
    store: r?.store ?? '',
    phone: r?.phone ?? defaults.phone,
    note: r?.note ?? '',
  });

  if (!open) {
    if (keys.enabled) {
      return request?.status === 'live' ? (
        <p className="text-sm text-espresso/55">Connected by Kabuor Builds on {when(request.liveAt)}.{request.reply && ` “${request.reply}”`}</p>
      ) : null;
    }
    return (
      <Section title="Let us connect it for you" description="No Daraja account needed. Send us your Till or Paybill; we set up the Safaricom side and switch the prompt on for you.">
        <RequestForm initial={formFrom(null)} onSaved={onChange} />
      </Section>
    );
  }

  const withdraw = async () => {
    setBusy(true);
    try {
      onChange((await call('/mpesa-request', { method: 'DELETE' })).request);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section
      title={request.status === 'working' ? 'We’re setting up your M-Pesa prompt' : 'We’ve got your request'}
      description={request.status === 'working' ? 'It switches on here by itself as soon as it’s done. No need to refresh.' : `Sent ${when(request.createdAt)}. We’ll call ${request.phone} to finish Safaricom’s approval.`}
    >
      <Progress status={request.status} />
      {request.reply && (
        <p className="rounded-2xl bg-beige px-4 py-3 text-sm">
          <b className="block text-xs text-espresso/55">From Kabuor Builds</b>
          {request.reply}
        </p>
      )}
      {editing ? (
        <RequestForm initial={formFrom(request)} onSaved={(r) => (setEditing(false), onChange(r))} onCancel={() => setEditing(false)} />
      ) : (
        <>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-espresso/50">Customers pay to</dt>
              <dd className="font-semibold">
                {request.type === 'till' ? 'Till' : 'Paybill'} {request.number}
                {request.store && <span className="font-normal text-espresso/55"> · store {request.store}</span>}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-espresso/50">We’ll call</dt>
              <dd className="font-semibold">{request.phone}</dd>
            </div>
            {request.note && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-espresso/50">Your note</dt>
                <dd>{request.note}</dd>
              </div>
            )}
          </dl>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
              Change details
            </button>
            <button type="button" className="btn btn-ghost text-red-700" onClick={withdraw} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Withdraw request
            </button>
          </div>
        </>
      )}
    </Section>
  );
}
