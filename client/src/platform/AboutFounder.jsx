// About the founder (/about-founder, /founder). A visitor here is deciding "who is behind this, and do I trust them
// with my business?". So: the person and one line on what he is doing, then why each product exists in his own
// account (Kabuor Dine from a summit in Mombasa, Kabuor ERP from wanting Kenyan software built here), what the
// company is for, and one way to reach him. In the corporate layout every Kabuor page shares (Corporate.jsx).
import { useEffect } from 'react';
import { ChevronRight, ExternalLink, Mail, Phone } from 'lucide-react';
import { Go, tel, whatsapp } from './Site';
import { CorporatePage, FOUNDER } from './Corporate';
import WhatsAppIcon from './WhatsAppIcon';

const LOCATION = 'Nairobi, Kenya';

/** The four questions the hoteliers in Mombasa left him with: what Kabuor Dine sets out to answer. */
export const DINE_QUESTIONS = [
  'What creates waste?',
  'How do we use what we need, and no more?',
  'How can a hotel run on data that informs every decision?',
  'How do we stop wasting time and leave guests happier, in one smooth process?',
];

/** What the company is for, beyond the software. */
export const PURPOSE = [
  ['Skills', 'A brand for the Kenyan child with a dream: to make home better by being sharper and better at their skills in tech.'],
  ['Work', 'Creating employment for the people who build, sell and support what we make.'],
  ['Change you can touch', 'Real change, delivered in real time, to families and the wider community.'],
];

export const FOUNDER_QUOTE = 'If a cause is as good as its inspiration, we should chase it.';

export default function AboutFounder() {
  useEffect(() => {
    document.title = `${FOUNDER.name} · Founder of Kabuor Technologies`;
    window.scrollTo(0, 0);
  }, []);
  const hello = whatsapp(FOUNDER.phone, "Hi Rooney, I'd like to connect regarding Kabuor Technologies.");

  return (
    <CorporatePage cta={{ href: hello, label: 'WhatsApp Rooney' }}>
      {/* Who he is, with one way to reach him. */}
      <section className="border-b border-[var(--ms-line)] bg-[#F5F7FC]">
        <div className="container-x grid items-center gap-10 py-10 sm:py-12 lg:grid-cols-[1fr_22rem] lg:py-14">
          <div>
            <p className="text-sm font-semibold text-[var(--ms-blue)]">Founder and CEO, Kabuor Technologies</p>
            <h1 className="mt-3 text-[2.25rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl">{FOUNDER.name}</h1>
            <p className="mt-4 max-w-2xl text-xl leading-relaxed text-[var(--ms-muted)]">
              Building Kenyan software from the ground up: our own products, for our own problems, for our own people.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href={hello} target="_blank" rel="noopener noreferrer" className="ms-btn ms-btn-primary">
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp Rooney
              </a>
              <a href={FOUNDER.linkedin} target="_blank" rel="noopener noreferrer" className="ms-link">
                LinkedIn <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <img src="/brand/founder-rooney-portrait.webp" alt={`${FOUNDER.name}, founder of Kabuor Technologies`} width="720" height="900" className="aspect-[4/5] w-full max-w-sm rounded-lg border border-[var(--ms-line)] object-cover object-top lg:max-w-none" />
        </div>
      </section>

      <div className="container-x grid gap-x-14 gap-y-10 py-10 sm:py-14 lg:grid-cols-[1fr_20rem]">
        <div className="max-w-2xl">
          {/* Kabuor Dine */}
          <section aria-labelledby="dine-story">
            <p className="text-sm font-semibold text-[var(--ms-blue)]">Kabuor Dine</p>
            <h2 id="dine-story" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">It started with a conversation in Mombasa</h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-[var(--ms-muted)]">
              <p>
                At an African MICE summit in Mombasa, Rooney sat with hoteliers who have spent their lives in the trade. They told him how their businesses really run, and where they lose. He left with four questions.
              </p>
            </div>
            <ol className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {DINE_QUESTIONS.map((q, i) => (
                <li key={q} className="border-t border-[var(--ms-line)] pt-4">
                  <span className="text-sm font-semibold text-[var(--ms-blue)]">{i + 1}</span>
                  <p className="mt-1 text-lg font-semibold leading-snug">{q}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-lg leading-relaxed text-[var(--ms-muted)]">
              Kabuor Dine is the answer he built: guests order from the table, the kitchen sees every order at once, waiters are called the moment food is ready, and the owner sees where every shilling went.
            </p>
            <Go to="/dine" className="ms-link mt-4">
              See Kabuor Dine <ChevronRight className="h-4 w-4" />
            </Go>
          </section>

          {/* Kabuor ERP */}
          <section aria-labelledby="erp-story" className="mt-12 border-t border-[var(--ms-line)] pt-12">
            <p className="text-sm font-semibold text-[var(--ms-blue)]">Kabuor ERP</p>
            <h2 id="erp-story" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Built here, from the ground up</h2>
            <figure className="mt-6 border-l-4 border-[var(--ms-blue)] pl-5">
              <blockquote className="text-xl leading-snug">
                “For the longest time I watched Silicon Valley software dominate Kenyan industry. I asked myself: what if we built from the ground up, our own products, to solve our own problems, for our own people?”
              </blockquote>
            </figure>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-[var(--ms-muted)]">
              <p>
                Kabuor ERP is that answer. It took months of planning before a single line was written, and its technology was chosen by benchmarking the systems that lead this sector.
              </p>
              <p>It runs the whole business in one place: sales, M-Pesa, stock, payroll and the books, ready for KRA.</p>
            </div>
            <Go to="/erp" className="ms-link mt-4">
              See Kabuor ERP <ChevronRight className="h-4 w-4" />
            </Go>
          </section>

          {/* What it is for */}
          <section aria-labelledby="purpose" className="mt-12 border-t border-[var(--ms-line)] pt-12">
            <p className="text-sm font-semibold text-[var(--ms-blue)]">What Kabuor Technologies is after</p>
            <h2 id="purpose" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Systems should change a community, not only a company</h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--ms-muted)]">
              Rooney has grown in tech, and holds one belief about it: a system has to have a communal impact to drive change you can touch. That is what Kabuor Technologies is for.
            </p>
            <dl className="mt-6 space-y-5">
              {PURPOSE.map(([t, d]) => (
                <div key={t} className="border-t border-[var(--ms-line)] pt-4 sm:grid sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <dt className="font-semibold">{t}</dt>
                  <dd className="mt-1 text-[1.0625rem] leading-relaxed text-[var(--ms-muted)] sm:mt-0">{d}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-lg leading-relaxed text-[var(--ms-muted)]">We look forward to touching more lives as we branch out.</p>
          </section>

          <figure className="mt-12 rounded-lg bg-[var(--ms-ink)] p-8 text-white sm:p-10">
            <blockquote className="text-2xl font-semibold leading-snug sm:text-3xl">“{FOUNDER_QUOTE}”</blockquote>
            <figcaption className="mt-4 text-sm text-white/75">
              {FOUNDER.name}, {FOUNDER.title}
            </figcaption>
          </figure>
        </div>

        {/* Reach him */}
        <aside aria-label={`Contact ${FOUNDER.first}`} className="h-fit rounded-lg border border-[var(--ms-line)] bg-white p-6 lg:sticky lg:top-24">
          <div className="flex items-center gap-4">
            <img src="/brand/founder-rooney-headshot.webp" alt="" width="64" height="64" className="h-16 w-16 rounded-full object-cover" />
            <div>
              <p className="font-semibold">{FOUNDER.name}</p>
              <p className="text-sm text-[var(--ms-muted)]">
                {FOUNDER.title} · {LOCATION}
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-3 border-t border-[var(--ms-line)] pt-5 text-[0.9375rem]">
            <li>
              <a href={tel(FOUNDER.phone)} className="inline-flex items-center gap-2 hover:underline">
                <Phone className="h-4 w-4 text-[var(--ms-muted)]" /> {FOUNDER.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${FOUNDER.email}`} className="inline-flex items-center gap-2 break-all hover:underline">
                <Mail className="h-4 w-4 shrink-0 text-[var(--ms-muted)]" /> {FOUNDER.email}
              </a>
            </li>
            <li>
              <a href={FOUNDER.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline">
                <ExternalLink className="h-4 w-4 text-[var(--ms-muted)]" /> LinkedIn
              </a>
            </li>
          </ul>
          <a href="/brand/kabuor-technologies-company-profile.pdf" className="ms-btn ms-btn-secondary mt-6 w-full" download>
            Company profile (PDF)
          </a>
        </aside>
      </div>
    </CorporatePage>
  );
}
