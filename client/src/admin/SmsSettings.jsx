import { useState } from 'react';
import { CheckCircle2, Loader2, MessageSquareText, Send, XCircle } from 'lucide-react';
import { cn } from '../lib/format';
import { useAdminApi, useAdminQuery } from '../store/admin';
import { ListEditor, TextInput, Toggle } from './form';

// Site content → SMS texts: Africa's Talking status, who gets which text, and a test message.
export default function SmsSettings({ sms, onChange }) {
  const call = useAdminApi();
  const status = useAdminQuery('/sms');
  const [test, setTest] = useState({ sending: false, results: null, error: null });
  const set = (key) => (value) => onChange({ ...sms, [key]: value });
  const numbers = sms.adminNumbers.filter((n) => n.trim());

  const sendTest = async () => {
    setTest({ sending: true, results: null, error: null });
    try {
      const { results } = await call('/sms/test', { method: 'POST', body: { numbers } });
      setTest({ sending: false, results, error: null });
    } catch (err) {
      setTest({ sending: false, results: null, error: err.message });
    }
  };

  const s = status.data;
  return (
    <>
      <div className={cn('flex items-start gap-3 rounded-2xl px-4 py-3 text-sm', s?.enabled && !s.error ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900')}>
        <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0" />
        {status.loading && !s ? (
          <span>Checking Africa’s Talking…</span>
        ) : !s?.enabled ? (
          <span>
            <b>Not connected.</b> Add <code>AT_USERNAME</code> and <code>AT_API_KEY</code> to the server’s settings (Railway → Variables), then redeploy.
          </span>
        ) : s.error ? (
          <span>
            <b>Africa’s Talking didn’t accept the login.</b> Check the username and API key. ({s.error})
          </span>
        ) : (
          <span>
            <b>Connected to Africa’s Talking</b>
            {s.environment === 'sandbox' ? ' (sandbox: test messages only)' : ''}. Balance: <b>{s.balance ?? 'unknown'}</b>
            {s.sender ? ` · Sender: ${s.sender}` : ''}. A text costs about Ksh 0.80 per 160 characters.
          </span>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Admin phone numbers</p>
        <ListEditor
          items={sms.adminNumbers}
          onChange={set('adminNumbers')}
          blank=""
          addLabel="Add number"
          max={5}
          empty="No admin numbers yet: add the phone that should get order texts."
          render={(n, update) => <TextInput label="Phone" inputMode="tel" value={n} onChange={(e) => update(() => e.target.value)} maxLength={20} placeholder="0712 345 678" />}
        />
      </div>

      <div className="space-y-4 rounded-2xl bg-white/60 p-4 ring-1 ring-espresso/[0.06]">
        <p className="text-xs font-bold tracking-wider text-espresso/45 uppercase">The two texts</p>
        <Toggle
          checked={sms.adminNewOrder}
          onChange={set('adminNewOrder')}
          label="1. New order, to you"
          description="When an order is placed: order code, customer, phone, items, branch and delivery address."
        />
        <Toggle
          checked={sms.customerConfirmed}
          onChange={set('customerConfirmed')}
          label="2. Order Confirmed, to the customer"
          description="When the order is paid (you tap Confirm payment): items, amount paid and M-Pesa code. Sent once per order."
        />
        <Toggle checked={sms.branchCopy} onChange={set('branchCopy')} label="Also send text 1 to the branch" description="Copies the new-order text to the phone of the branch the customer chose." />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" disabled={test.sending || !numbers.length || !s?.enabled} onClick={sendTest}>
          {test.sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send a test text
        </button>
        <span className="text-xs text-espresso/50">{numbers.length ? `To ${numbers.join(', ')}` : 'Add an admin number first'}</span>
      </div>
      {test.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{test.error}</p>}
      {test.results && (
        <ul className="space-y-1.5 text-sm">
          {test.results.map((r) => (
            <li key={r.phone} className={cn('flex items-center gap-2', r.status === 'sent' ? 'text-emerald-800' : 'text-red-800')}>
              {r.status === 'sent' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {r.phone}: {r.status === 'sent' ? `sent${r.cost ? ` (${r.cost})` : ''}` : r.error}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
