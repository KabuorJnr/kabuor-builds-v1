import { useState } from 'react';
import { Check, Eraser, Loader2 } from 'lucide-react';
import { useAdmin, useAdminApi } from '../store/admin';
import { Section, TextInput } from './form';
import { ErrorNote, PageHeader } from './shared';

const TABLE_NAMES = {
  orders: 'orders & recorded sales',
  order_items: 'order lines',
  payments: 'payment attempts',
  mpesa_confirmations: 'M-Pesa confirmations',
  sms_log: 'texts sent',
  subscribers: 'newsletter emails',
};

// Handover: delete every customer/order record. Products, website content, updates and this login stay.
function ClearCustomerData() {
  const call = useAdminApi();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [state, setState] = useState({ busy: false, error: null, done: null });
  const ready = form.password && form.confirm.trim().toUpperCase() === 'CLEAR';

  const run = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: null, done: null });
    try {
      const res = await call('/clear-customer-data', { method: 'POST', body: form });
      setForm({ password: '', confirm: '' });
      setState({ busy: false, error: null, done: res });
    } catch (err) {
      setState({ busy: false, error: err.message, done: null });
    }
  };

  return (
    <form onSubmit={run} className="mt-6 max-w-xl">
      <Section
        title="Clear customer data"
        description="For handing the shop over or starting fresh: deletes all orders, recorded sales, payment and M-Pesa records, texts sent and newsletter emails."
      >
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-red-900">
            <b>Deleted:</b> everyone who ordered or bought, and every sale in your reports and ledger.
          </p>
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-900">
            <b>Kept:</b> products and stock, the website’s text and updates, settings, and this sign-in.
          </p>
        </div>
        {state.error && <ErrorNote>{state.error}</ErrorNote>}
        {state.done && (
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <p className="flex items-center gap-2 font-semibold">
              <Check className="h-4 w-4" /> Customer data cleared.
            </p>
            <p className="mt-1">
              Removed{' '}
              {Object.entries(state.done.removed)
                .filter(([, n]) => n)
                .map(([t, n]) => `${n} ${TABLE_NAMES[t] ?? t}`)
                .join(', ') || 'nothing (it was already empty)'}
              . A backup was saved on the server as <code>{state.done.backup}</code>.
            </p>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Your password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          <TextInput label='Type "CLEAR" to confirm' autoCapitalize="characters" autoComplete="off" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} placeholder="CLEAR" />
        </div>
        <button className="btn bg-red-700 text-white hover:bg-red-800 disabled:opacity-40" disabled={!ready || state.busy}>
          {state.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eraser className="h-4 w-4" />} Clear customer data
        </button>
      </Section>
    </form>
  );
}

export default function Account() {
  const call = useAdminApi();
  const { username, login } = useAdmin();
  const [form, setForm] = useState({ username: username ?? '', currentPassword: '', newPassword: '', confirm: '' });
  const [state, setState] = useState({ saving: false, error: null, done: false });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return setState({ saving: false, error: 'The two new passwords don’t match', done: false });
    setState({ saving: true, error: null, done: false });
    try {
      const res = await call('/account', { method: 'POST', body: form });
      login(res);
      setForm({ username: res.username, currentPassword: '', newPassword: '', confirm: '' });
      setState({ saving: false, error: null, done: true });
    } catch (err) {
      setState({ saving: false, error: err.message, done: false });
    }
  };

  return (
    <>
      <PageHeader title="Account" subtitle="Change the username and password used to sign in to this portal." />
      <form onSubmit={submit} className="max-w-xl">
        <Section title="Sign-in details" description="Changing your password signs out every other device.">
          {state.error && <ErrorNote>{state.error}</ErrorNote>}
          {state.done && (
            <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              <Check className="h-4 w-4" /> Saved. Use your new details next time you sign in.
            </p>
          )}
          <TextInput label="Username" autoComplete="username" autoCapitalize="none" value={form.username} onChange={set('username')} />
          <TextInput label="Current password" type="password" autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="New password" type="password" autoComplete="new-password" hint="At least 8 characters" value={form.newPassword} onChange={set('newPassword')} />
            <TextInput label="Confirm new password" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
          </div>
          <button className="btn btn-primary" disabled={state.saving || !form.currentPassword || !form.newPassword}>
            {state.saving && <Loader2 className="h-4 w-4 animate-spin" />} Update sign-in details
          </button>
        </Section>
      </form>
      <ClearCustomerData />
    </>
  );
}
