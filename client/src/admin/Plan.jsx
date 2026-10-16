// The shop's plan with the platform: when it's paid until, renew by M-Pesa prompt, and past payments.
import { Link } from 'react-router';
import { AlertTriangle, CalendarClock } from 'lucide-react';
import { MpesaPay, ksh } from '../platform/shared';
import { useAdminApi, useAdminQuery } from '../store/admin';
import { ErrorNote, PageHeader } from './shared';
import { Section } from './form';

const day = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const daysLeft = (iso) => (iso ? Math.ceil((Date.parse(iso) - Date.now()) / 864e5) : -1);

/** A strip at the top of every admin page when the plan has run out or is about to. */
export function PlanBanner() {
  const { data } = useAdminQuery('/billing');
  if (!data) return null;
  const left = daysLeft(data.paidUntil);
  if (data.state === 'live' && left > 5) return null;
  const paused = data.state === 'paused';
  return (
    <Link to="/admin/plan" className={`mb-5 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${paused ? 'bg-red-50 text-red-800' : 'bg-amber/15 text-espresso'}`}>
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="flex-1">
        {paused ? 'Your shop is paused: customers can’t order until the plan is renewed.' : left >= 0 ? `Your plan ends in ${left} ${left === 1 ? 'day' : 'days'}.` : 'Your plan has ended. Renew to keep the shop open.'}
      </span>
      <span className="underline underline-offset-2">Renew</span>
    </Link>
  );
}

export default function Plan() {
  const call = useAdminApi();
  const { data, error, reload } = useAdminQuery('/billing');
  const left = data ? daysLeft(data.paidUntil) : 0;

  return (
    <>
      <PageHeader title="Plan & billing" subtitle="Your subscription, paid by M-Pesa prompt." />
      {error && <ErrorNote>{error}</ErrorNote>}
      {data && (
        <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
          <Section title="Renew or extend" description="The time you pay for is added to the end of your current plan.">
            <MpesaPay
              prices={data.prices}
              plans={{ monthly: '1 month', yearly: '12 months' }}
              testMode={data.testMode}
              defaultPhone={data.phone}
              cta="Pay with M-Pesa"
              start={async (phone, plan) => (await call('/billing/pay', { method: 'POST', body: { phone, plan } })).id}
              check={(id) => call(`/billing/pay/${id}`)}
              onPaid={() => setTimeout(reload, 800)}
            />
          </Section>
          <div className="space-y-5">
            <Section>
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 h-5 w-5 text-amber" />
                <div>
                  <p className="text-sm text-espresso/55">{data.state === 'paused' ? 'Paused since' : 'Paid until'}</p>
                  <p className="text-2xl font-extrabold tracking-tight">{data.paidUntil ? day(data.paidUntil) : 'Not paid yet'}</p>
                  {data.state === 'live' && left >= 0 && <p className="text-sm text-espresso/55">{left} days left</p>}
                </div>
              </div>
            </Section>
            <Section title="Payments">
              {data.history.length ? (
                <ul className="divide-y divide-espresso/[0.07] text-sm">
                  {data.history.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span>
                        <b className="block">{p.plan === 'yearly' ? '12 months' : '1 month'}</b>
                        <span className="text-xs text-espresso/50">
                          {day(p.created_at)} · {p.receipt}
                          {p.test && ' · test'}
                        </span>
                      </span>
                      <b className="tabular-nums">{ksh(p.amount)}</b>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-espresso/55">No payments yet.</p>
              )}
            </Section>
          </div>
        </div>
      )}
    </>
  );
}
