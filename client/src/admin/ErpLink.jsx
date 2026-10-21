// Settings → Kabuor ERP: paid orders become paid invoices in the owner's ERP, so the books, stock and VAT
// include online sales. The owner is deciding "are my online sales reaching my books?", so the page leads
// with that answer (connected, how many waiting, the last problem) before the two fields that set it up.
import { useState } from 'react';
import { CheckCircle2, CircleDashed, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../lib/format';
import { useAdminApi, useAdminQuery } from '../store/admin';
import { ErrorNote, PageHeader } from './shared';
import { Section, TextInput } from './form';

export default function ErpLink() {
  const call = useAdminApi();
  const status = useAdminQuery('/erp');
  const [f, setF] = useState(null);
  const [state, setState] = useState({ busy: '', error: '', saved: false });
  const s = status.data;
  const v = f ?? { url: s?.url ?? '', key: '' };

  const run = async (busy, fn) => {
    setState({ busy, error: '', saved: false });
    try {
      await fn();
      setState({ busy: '', error: '', saved: busy === 'save' });
      status.reload?.();
    } catch (err) {
      setState({ busy: '', error: err.message, saved: false });
    }
  };

  return (
    <>
      <PageHeader title="Kabuor ERP" subtitle="Paid orders go into your Kabuor ERP as paid invoices: your books, stock and VAT include online sales without typing them in again." />
      <div className="max-w-2xl space-y-5">
        {s && (
          <div className={cn('flex items-start gap-3 rounded-2xl px-4 py-3 text-sm', s.connected && !s.lastError ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900')}>
            {s.connected ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <CircleDashed className="mt-0.5 h-4 w-4 shrink-0" />}
            <span className="flex-1">
              {!s.connected ? (
                <><b>Not connected.</b> Paid orders stay in the shop only.</>
              ) : s.waiting === 0 ? (
                <><b>Connected.</b> Every paid order is in Kabuor ERP.</>
              ) : (
                <><b>{s.waiting} paid order{s.waiting === 1 ? '' : 's'} not in Kabuor ERP yet.</b>{s.lastError && <> Last problem: {s.lastError}</>}</>
              )}
            </span>
            {s.connected && s.waiting > 0 && (
              <button className="btn btn-ghost shrink-0 px-3 py-1.5 text-sm" disabled={state.busy === 'sync'} onClick={() => run('sync', () => call('/erp/sync', { method: 'POST' }))}>
                {state.busy === 'sync' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Send now
              </button>
            )}
          </div>
        )}
        <Section title="Connect" description="In Kabuor ERP, open Settings → Connections, make a key called “Online shop”, and paste it here with your ERP address.">
          <div className="space-y-4">
            <TextInput label="Kabuor ERP address" type="url" placeholder="https://your-erp-address" value={v.url} onChange={(e) => setF({ ...v, url: e.target.value })} />
            <TextInput label="API key" hint={s?.keyHint ? `Saved (${s.keyHint}). Leave blank to keep it.` : 'Starts with kerp_'} type="password" autoComplete="off" value={v.key} onChange={(e) => setF({ ...v, key: e.target.value })} />
            {state.error && <ErrorNote>{state.error}</ErrorNote>}
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary" disabled={!f || state.busy === 'save'} onClick={() => run('save', async () => { await call('/erp', { method: 'PUT', body: v }); setF(null); })}>
                {state.busy === 'save' && <Loader2 className="h-4 w-4 animate-spin" />} {state.saved && !f ? 'Saved' : 'Save'}
              </button>
              {s?.connected && (
                <button className="btn btn-ghost" onClick={() => confirm('Stop sending paid orders to Kabuor ERP?') && run('off', () => call('/erp', { method: 'PUT', body: { url: '' } }))}>Disconnect</button>
              )}
            </div>
          </div>
        </Section>
        <p className="text-sm text-espresso/60">Each order is sent with its order code, so it is only ever recorded once in the ERP. Products are matched by their code here and in the ERP; anything not matched comes in as a line with its name and price. Cancelling an order here doesn’t cancel the ERP invoice: void it there.</p>
      </div>
    </>
  );
}
