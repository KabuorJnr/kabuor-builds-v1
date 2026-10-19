// M-Pesa prompt: customers get the PIN prompt at checkout and pay straight into the shop's Till or Paybill.
// Two ways to switch it on: ask Kabuor Builds to connect it (most owners have no Daraja account), or paste
// your own Daraja keys. Secrets are write-only: the page only shows whether each is saved.
import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, CircleDashed, Loader2, Smartphone } from 'lucide-react';
import { cn } from '../lib/format';
import { refreshStore } from '../lib/api';
import { useAdminApi, useAdminQuery } from '../store/admin';
import { ErrorNote, PageHeader } from './shared';
import { Section, TextInput } from './form';
import MpesaRequest from './MpesaRequest';

function Choice({ value, onChange, options, label }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">{label}</p>
      <div className="inline-flex rounded-full bg-beige p-1" role="radiogroup" aria-label={label}>
        {options.map(([id, text]) => (
          <button key={id} type="button" role="radio" aria-checked={value === id} onClick={() => onChange(id)} className={cn('rounded-full px-4 py-1.5 text-sm font-semibold', value === id ? 'bg-espresso text-cream' : 'text-espresso/60')}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function TestPrompt({ call }) {
  const [phone, setPhone] = useState('');
  const [state, setState] = useState({ step: 'idle', message: '' });
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const poll = (id, tries = 0) => {
    timer.current = setTimeout(async () => {
      const r = await call(`/mpesa-keys/test/${id}`).catch(() => ({ status: 'pending' }));
      if (r.status !== 'pending' || tries > 40) setState({ step: r.status === 'paid' ? 'ok' : 'failed', message: r.status === 'pending' ? 'No answer from the phone yet. Check it and try again.' : r.message });
      else poll(id, tries + 1);
    }, 3000);
  };
  const send = async (e) => {
    e.preventDefault();
    setState({ step: 'sending', message: '' });
    try {
      const { checkoutId } = await call('/mpesa-keys/test', { method: 'POST', body: { phone } });
      setState({ step: 'waiting', message: 'Prompt sent. Enter your PIN on the phone to pay KSh 1.' });
      poll(checkoutId);
    } catch (err) {
      setState({ step: 'failed', message: err.message });
    }
  };
  return (
    <form onSubmit={send} className="space-y-3">
      <TextInput label="Your phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" hint="We send a KSh 1 prompt here. It goes into your own account." />
      <button className="btn btn-primary w-full" disabled={state.step === 'sending' || state.step === 'waiting'}>
        {state.step === 'sending' || state.step === 'waiting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />} Send a test prompt
      </button>
      {state.message && (
        <p className={cn('rounded-2xl px-3 py-2 text-sm font-medium', state.step === 'ok' ? 'bg-emerald-50 text-emerald-800' : state.step === 'failed' ? 'bg-red-50 text-red-800' : 'bg-beige text-espresso')}>{state.message}</p>
      )}
    </form>
  );
}

export default function MpesaKeys() {
  const call = useAdminApi();
  const { data, error, setData, reload } = useAdminQuery('/mpesa-keys');
  const ask = useAdminQuery('/mpesa-request');
  const [f, setF] = useState(null);
  const [ownKeys, setOwnKeys] = useState(null); // whether the keys form is open (null: decide from what's saved)
  const request = ask.data?.request ?? null;
  const waiting = request && (request.status === 'requested' || request.status === 'working');

  // While Kabuor Builds is connecting it, check now and then so the page flips to "on" by itself.
  const reloadAsk = ask.reload;
  useEffect(() => {
    if (!waiting) return;
    const t = setInterval(() => {
      reload();
      reloadAsk();
    }, 20000);
    return () => clearInterval(t);
  }, [waiting, reload, reloadAsk]);
  useEffect(() => {
    if (data?.enabled) refreshStore();
  }, [data?.enabled]);
  const [state, setState] = useState({ saving: false, error: null, saved: false });

  // Refill the form whenever the saved keys change (including when Kabuor Builds connects them).
  const savedSig = data && [data.env, data.type, data.shortcode, data.till, data.enabled].join('|');
  useEffect(() => {
    if (data) setF({ env: data.env, type: data.type, shortcode: data.shortcode, till: data.till, key: '', secret: '', passkey: '' });
  }, [savedSig]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v }));

  const save = async (e) => {
    e.preventDefault();
    setState({ saving: true, error: null, saved: false });
    try {
      const next = await call('/mpesa-keys', { method: 'PUT', body: f });
      setData(() => next);
      setF((x) => ({ ...x, key: '', secret: '', passkey: '' }));
      refreshStore();
      setState({ saving: false, error: null, saved: true });
    } catch (err) {
      setState({ saving: false, error: err.message, saved: false });
    }
  };
  const savedHint = (has) => (has ? 'Saved. Leave blank to keep it.' : undefined);

  return (
    <>
      <PageHeader title="M-Pesa prompt" subtitle="Customers get the M-Pesa PIN prompt at checkout and pay straight into your account." />
      {error && <ErrorNote>{error}</ErrorNote>}
      {data && f && ask.data && (
        <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div className="min-w-0 space-y-5">
          <MpesaRequest request={request} keys={data} defaults={ask.data.defaults} onChange={(r) => (ask.setData((x) => ({ ...x, request: r })), reload())} />
          {(ownKeys ?? (data.hasKey && !waiting && request?.status !== 'live')) ? (
          <Section title={data.enabled ? 'Daraja keys' : 'Your own Daraja keys'} description="From your app on developer.safaricom.co.ke (use the Go Live keys for real payments).">
            <form onSubmit={save} className="space-y-4">
              <div className="flex flex-wrap gap-5">
                <Choice label="Mode" value={f.env} onChange={set('env')} options={[['sandbox', 'Sandbox (testing)'], ['production', 'Live']]} />
                <Choice label="Customers pay to" value={f.type} onChange={set('type')} options={[['till', 'Till (Buy Goods)'], ['paybill', 'Paybill']]} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Shortcode" inputMode="numeric" value={f.shortcode} onChange={set('shortcode')} placeholder={f.env === 'sandbox' ? '174379' : ''} hint={f.type === 'till' ? 'The Till’s store number (HO number) the keys belong to' : 'Your Paybill number'} />
                {f.type === 'till' && <TextInput label="Till number" inputMode="numeric" value={f.till} onChange={set('till')} hint="The number customers pay" />}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Consumer key" value={f.key} onChange={set('key')} autoComplete="off" placeholder={data.hasKey ? '••••••••' : ''} hint={savedHint(data.hasKey)} />
                <TextInput label="Consumer secret" type="password" value={f.secret} onChange={set('secret')} autoComplete="new-password" placeholder={data.hasSecret ? '••••••••' : ''} hint={savedHint(data.hasSecret)} />
              </div>
              <TextInput label="Passkey" type="password" value={f.passkey} onChange={set('passkey')} autoComplete="new-password" placeholder={data.hasPasskey ? '••••••••' : ''} hint={savedHint(data.hasPasskey) ?? 'Safaricom emails it after Go Live (sandbox: shown on the Daraja simulator page)'} />
              {state.error && <ErrorNote>{state.error}</ErrorNote>}
              <div className="flex flex-wrap items-center gap-3">
                <button className="btn btn-primary" disabled={state.saving}>
                  {state.saving && <Loader2 className="h-4 w-4 animate-spin" />} Save keys
                </button>
                {state.saved && <span className="text-sm font-semibold text-emerald-700">Saved</span>}
              </div>
            </form>
          </Section>
          ) : (
            <button type="button" onClick={() => setOwnKeys(true)} className="flex w-full items-center justify-between gap-3 rounded-[var(--r-xl,1.25rem)] px-5 py-4 text-left text-sm ring-1 ring-espresso/10 hover:bg-beige/60">
              <span>
                <b className="block">{data.enabled ? 'See or change the Daraja keys' : 'I have my own Daraja keys'}</b>
                <span className="text-espresso/55">{data.enabled ? 'Switch to a different Till or Paybill, or use your own Daraja app.' : 'Paste them yourself and the prompt switches on straight away.'}</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-espresso/50" />
            </button>
          )}
          </div>
          <div className="space-y-5">
            <Section>
              <div className="flex items-start gap-3">
                {data.enabled ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" /> : <CircleDashed className="mt-0.5 h-5 w-5 text-espresso/40" />}
                <div>
                  <p className="font-bold">{data.enabled ? `Prompts on (${data.environment})` : 'Prompts off'}</p>
                  <p className="text-sm text-espresso/55">
                    {data.enabled
                      ? data.environment === 'sandbox'
                        ? 'Sandbox: prompts are test payments, no real money. Switch to Live with your Go Live keys.'
                        : `Customers pay ${data.payTo} with the prompt at checkout.`
                      : waiting
                        ? 'Checkout shows your Till/Paybill number until we finish connecting it.'
                        : 'Checkout shows your Till/Paybill number for customers to pay by hand. Ask us to connect the prompt, or add your own keys.'}
                  </p>
                  {data.enabled && !data.callbacks && <p className="mt-2 text-xs text-espresso/50">Payments are confirmed by checking with Safaricom every few seconds.</p>}
                </div>
              </div>
            </Section>
            {data.enabled && (
              <Section title="Try it">
                <TestPrompt call={call} />
              </Section>
            )}
          </div>
        </div>
      )}
    </>
  );
}
