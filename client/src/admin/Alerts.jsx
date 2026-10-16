import { LOOK } from '../lib/brand';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellOff, BellRing, Check, Loader2, MonitorSmartphone, Send, Share, Smartphone, SquarePlus, Trash2, X } from 'lucide-react';
import { Link } from 'react-router';
import { EASE } from '../components/ui';
import { cn } from '../lib/format';
import { currentSubscription, deviceLabel, isIos, pushBlocker, subscribe, unsubscribe } from '../lib/push';
import { useAdminApi } from '../store/admin';
import { Section } from './form';
import { ErrorNote, PageHeader } from './shared';

const NUDGE_KEY = 'anjugu-alerts-nudge-hidden';

// Shared state: server key + devices, and whether *this* browser is subscribed.
function useAlerts() {
  const call = useAdminApi();
  const [state, setState] = useState({ loading: true, info: null, endpoint: null, error: null });

  const load = useCallback(async () => {
    try {
      const [info, sub] = await Promise.all([call('/alerts'), currentSubscription().catch(() => null)]);
      // Only "on" if the server still knows this browser's subscription.
      const endpoint = sub && info.devices.some((d) => d.endpoint === sub.endpoint) ? sub.endpoint : null;
      setState({ loading: false, info, endpoint, error: null });
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
    }
  }, [call]);

  useEffect(() => {
    load();
  }, [load]);

  const turnOn = async () => {
    const sub = await subscribe(state.info.publicKey);
    const { devices } = await call('/alerts/subscribe', { method: 'POST', body: { subscription: sub.toJSON(), label: deviceLabel() } });
    setState((s) => ({ ...s, endpoint: sub.endpoint, info: { ...s.info, devices } }));
  };

  const remove = async (endpoint) => {
    if (endpoint === state.endpoint) await unsubscribe().catch(() => null);
    const { devices } = await call('/alerts/unsubscribe', { method: 'POST', body: { endpoint } });
    setState((s) => ({ ...s, endpoint: endpoint === s.endpoint ? null : s.endpoint, info: { ...s.info, devices } }));
  };

  const test = () => call('/alerts/test', { method: 'POST' });

  return { ...state, turnOn, remove, test, reload: load };
}

const permissionMessage = (err) =>
  err.message === 'denied'
    ? 'Notifications are blocked for this site. Allow them in your browser’s site settings, then try again.'
    : err.message === 'dismissed'
      ? 'You closed the permission box. Tap “Turn on alerts” again and choose Allow.'
      : err.message;

function InstallSteps() {
  const steps = [
    { icon: Share, text: <>In Safari, tap the <b>Share</b> button</> },
    { icon: SquarePlus, text: <>Choose <b>Add to Home Screen</b>, then <b>Add</b></> },
    { icon: Smartphone, text: <>Open <b>{LOOK.short} Admin</b> from your Home Screen and come back to this page</> },
  ];
  return (
    <ol className="space-y-2.5">
      {steps.map(({ icon: Icon, text }, i) => (
        <li key={i} className="flex items-center gap-3 rounded-2xl bg-beige/70 px-4 py-3 text-sm">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-espresso text-honey">
            <Icon className="h-4 w-4" />
          </span>
          <span>
            <span className="mr-1.5 font-hand text-lg text-caramel">{i + 1}.</span>
            {text}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Blocked({ reason }) {
  if (reason === 'ios-install') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-espresso/70">On iPhone, alerts only work once the admin portal is on your Home Screen (iOS 16.4 or newer).</p>
        <InstallSteps />
      </div>
    );
  }
  const text = {
    insecure: 'Alerts need the shop to be online on a secure (https) address. They’ll work once the site is deployed.',
    denied: 'Notifications are blocked for this site. Open your browser’s site settings, allow notifications, then reload this page.',
    unsupported: 'This browser can’t receive alerts. On Android use Chrome; on iPhone use Safari and add the portal to your Home Screen.',
  }[reason];
  return <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{text}</p>;
}

function Phone({ on }) {
  // A small phone with the notification sliding in: shows what an alert looks like.
  return (
    <div className="relative mx-auto h-44 w-28 shrink-0 rounded-[1.4rem] bg-espresso p-1.5 shadow-[0_20px_40px_-18px_rgba(46,31,20,0.6)]">
      <div className="relative h-full overflow-hidden rounded-[1.1rem] bg-gradient-to-b from-caramel/80 to-espresso">
        <div className="mx-auto mt-1.5 h-1.5 w-8 rounded-full bg-espresso/80" />
        <motion.div
          key={String(on)}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
          className="mx-1.5 mt-3 rounded-lg bg-cream/95 p-1.5 text-[7px] leading-tight text-espresso shadow"
        >
          <div className="flex items-center gap-1 font-bold">
            <span className="grid h-3 w-3 place-items-center rounded-[3px] bg-espresso text-[4px] text-honey">{LOOK.short}</span>
            {on ? 'New order · Ksh 950' : 'Alerts off'}
          </div>
          <div className="mt-0.5 text-espresso/60">{on ? 'Jane · Kisumu · M-Pesa' : 'Turn on to get orders here'}</div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Alerts() {
  const alerts = useAlerts();
  const [busy, setBusy] = useState(null);
  const [note, setNote] = useState(null);
  const blocker = pushBlocker();
  const on = Boolean(alerts.endpoint);

  const run = async (key, fn, success) => {
    setBusy(key);
    setNote(null);
    try {
      await fn();
      if (success) setNote({ ok: true, text: success });
    } catch (err) {
      setNote({ ok: false, text: permissionMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  const devices = alerts.info?.devices ?? [];

  return (
    <>
      <PageHeader title="Phone alerts" subtitle="Get a notification on your phone the moment a customer orders or pays." />
      <div className="grid max-w-4xl gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <Section
          title={on ? 'Alerts are on for this device' : 'Turn on alerts for this device'}
          description={on ? `${deviceLabel()} will be notified of every new order and M-Pesa payment.` : 'Do this on the phone you want the alerts on.'}
        >
          {alerts.error && <ErrorNote>{alerts.error}</ErrorNote>}
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <Phone on={on} />
            <div className="w-full min-w-0 flex-1 space-y-3">
              {alerts.loading ? (
                <div className="h-24 animate-pulse rounded-2xl bg-beige" />
              ) : blocker && !on ? (
                <Blocked reason={blocker} />
              ) : on ? (
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-primary" disabled={busy} onClick={() => run('test', alerts.test, 'Test alert sent. It should appear in a few seconds.')}>
                    {busy === 'test' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send a test alert
                  </button>
                  <button className="btn btn-ghost" disabled={busy} onClick={() => run('off', () => alerts.remove(alerts.endpoint), 'Alerts turned off for this device.')}>
                    {busy === 'off' ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />} Turn off
                  </button>
                </div>
              ) : (
                <button className="btn btn-honey w-full sm:w-auto" disabled={busy || !alerts.info} onClick={() => run('on', alerts.turnOn, 'Alerts are on. Send a test to check.')}>
                  {busy === 'on' ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />} Turn on alerts
                </button>
              )}
              <AnimatePresence>
                {note && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn('flex items-start gap-2 rounded-2xl px-4 py-3 text-sm', note.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800')}
                    role="status"
                  >
                    {note.ok && <Check className="mt-0.5 h-4 w-4 shrink-0" />}
                    {note.text}
                  </motion.p>
                )}
              </AnimatePresence>
              {!blocker && !on && !isIos() && (
                <p className="text-xs leading-relaxed text-espresso/50">
                  Tip: add the portal to your Home Screen (browser menu → <i>Install app</i> or <i>Add to Home screen</i>) so it opens like an app when you tap an alert.
                </p>
              )}
            </div>
          </div>
        </Section>

        <Section title="Devices getting alerts" description={devices.length ? 'Remove a phone you no longer use.' : 'None yet.'}>
          {devices.length > 0 && (
            <ul className="space-y-2">
              {devices.map((d) => (
                <li key={d.endpoint} className="flex items-center gap-3 rounded-2xl bg-beige/60 px-3.5 py-3">
                  <MonitorSmartphone className="h-5 w-5 shrink-0 text-caramel" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {d.label || 'Device'}
                      {d.endpoint === alerts.endpoint && <span className="ml-1.5 rounded-full bg-honey/25 px-2 py-0.5 text-[10px] font-bold text-caramel uppercase">This one</span>}
                    </span>
                    <span className="block text-xs text-espresso/45">Added {new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </span>
                  <button
                    onClick={() => run(`rm-${d.endpoint}`, () => alerts.remove(d.endpoint))}
                    disabled={busy}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-espresso/45 hover:bg-red-50 hover:text-red-700"
                    aria-label={`Remove ${d.label}`}
                  >
                    {busy === `rm-${d.endpoint}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs leading-relaxed text-espresso/50">Alerts arrive while the shop’s server is online, even when the portal is closed.</p>
        </Section>
      </div>
    </>
  );
}

// Small card on the Overview inviting the admin to turn alerts on, until they do or hide it.
export function AlertsNudge() {
  const alerts = useAlerts();
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(NUDGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const blocker = pushBlocker();

  if (hidden || alerts.loading || alerts.endpoint || !alerts.info || blocker === 'unsupported') return null;

  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem(NUDGE_KEY, '1');
    } catch {
      // Hiding is a convenience only.
    }
  };

  const turnOn = async () => {
    setBusy(true);
    setError(null);
    try {
      await alerts.turnOn();
    } catch (err) {
      setError(permissionMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="relative mb-4 overflow-hidden rounded-3xl bg-espresso p-4 pr-12 text-cream sm:mb-5 sm:p-5 sm:pr-14">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-honey text-espresso">
          <BellRing className="h-5 w-5" />
        </span>
        <div className="min-w-[12rem] flex-1">
          <p className="font-bold">Get new orders on your phone</p>
          <p className="text-sm text-cream/60">{error ?? 'A notification the moment someone checks out or pays.'}</p>
        </div>
        {blocker ? (
          <Link to="/admin/alerts" className="btn btn-honey h-10 w-full px-4 text-sm sm:w-auto">
            Set up
          </Link>
        ) : (
          <button onClick={turnOn} disabled={busy} className="btn btn-honey h-10 w-full px-4 text-sm sm:w-auto">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Turn on
          </button>
        )}
      </div>
      <button onClick={hide} className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full text-cream/50 hover:bg-cream/10 hover:text-cream" aria-label="Hide">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
