// About the founder (/about-founder, /founder): the one page with Rooney's photo, so the company page and its
// search listing stay about the company. In the corporate layout every Kabuor page shares (Corporate.jsx).
import { useEffect } from 'react';
import { Award, Building, Code, Cpu, ExternalLink, Mail, MessageCircle, Phone } from 'lucide-react';
import { tel, whatsapp } from './Site';
import { CorporatePage, FOUNDER } from './Corporate';

const LOCATION = 'Ngong Road, Nairobi, Kenya';

const ACHIEVEMENTS = [
  {
    icon: Code,
    title: 'Full-stack architecture',
    text: 'Engineered Kabuor ERP end-to-end: high-performance C# .NET API, responsive React PWA, offline-first SQLite sync, and PostgreSQL enterprise data layer.',
  },
  {
    icon: Building,
    title: 'Kenyan fiscalization and compliance',
    text: 'Designed real-time KRA eTIMS Type-C automated fiscal signature signing, QR generation, and statutory payroll processing for Kenyan tax laws.',
  },
  {
    icon: Cpu,
    title: 'M-Pesa ledger automation',
    text: 'Pioneered seamless Safaricom Daraja C2B and B2C integration, enabling instant till reconciliation, automated callbacks, and zero-leakage accounting.',
  },
  {
    icon: Award,
    title: 'Multi-tenant commerce',
    text: 'Created Kabuor Shops, empowering local retail businesses to spin up digital storefronts with automated payments and order fulfillment in minutes.',
  },
];

export default function AboutFounder() {
  useEffect(() => {
    document.title = 'About the founder · Rooney Odhiambo Kabuor · Kabuor Technologies';
    window.scrollTo(0, 0);
  }, []);

  return (
    <CorporatePage cta={{ href: whatsapp(FOUNDER.phone, "Hi Rooney, I'd like to connect regarding Kabuor Technologies."), label: 'WhatsApp Rooney' }}>
      <section className="border-b border-[var(--ms-line)] bg-[#F5F7FC]">
        <div className="container-x py-10 sm:py-12 lg:py-14">
          <p className="text-sm font-semibold text-[var(--ms-blue)]">Leadership</p>
          <h1 className="mt-3 text-[2.25rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl">About the founder</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--ms-muted)]">The engineer building enterprise software and commerce tools for East African businesses.</p>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="container-x grid items-start gap-10 lg:grid-cols-[22rem_1fr]">
          <figure className="overflow-hidden rounded-lg border border-[var(--ms-line)] bg-white">
            <img src="/brand/founder-rooney-portrait.webp" alt={`${FOUNDER.name}, ${FOUNDER.title} of Kabuor Technologies`} width="720" height="900" className="aspect-[4/5] w-full object-cover object-top" />
            <figcaption className="p-6">
              <h2 className="text-xl font-semibold">{FOUNDER.name}</h2>
              <p className="text-sm text-[var(--ms-muted)]">
                {FOUNDER.title} · {LOCATION}
              </p>
              <ul className="mt-5 space-y-2.5 border-t border-[var(--ms-line)] pt-5 text-[0.9375rem]">
                <li>
                  <a href={FOUNDER.linkedin} target="_blank" rel="noopener noreferrer" className="ms-link">
                    <ExternalLink className="h-4 w-4" /> Connect on LinkedIn
                  </a>
                </li>
                <li>
                  <a href={`mailto:${FOUNDER.email}`} className="inline-flex items-center gap-2 hover:underline">
                    <Mail className="h-4 w-4 text-[var(--ms-muted)]" /> {FOUNDER.email}
                  </a>
                </li>
                <li>
                  <a href={tel(FOUNDER.phone)} className="inline-flex items-center gap-2 hover:underline">
                    <Phone className="h-4 w-4 text-[var(--ms-muted)]" /> {FOUNDER.phone}
                  </a>
                </li>
              </ul>
              <a href={whatsapp(FOUNDER.phone, "Hi Rooney, I'd like to connect regarding Kabuor Technologies.")} target="_blank" rel="noopener noreferrer" className="ms-btn ms-btn-primary mt-6 w-full">
                <MessageCircle className="h-4 w-4" /> WhatsApp Rooney
              </a>
            </figcaption>
          </figure>

          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-tight">Engineering software for how Kenyan businesses really work</h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-[var(--ms-muted)]">
              <p>
                Rooney Odhiambo Kabuor is a software architect and technology entrepreneur based in Nairobi, Kenya. As the founder of <b className="font-semibold text-[var(--ms-ink)]">Kabuor Technologies</b>, Rooney is dedicated to solving the operating challenges faced by businesses, retailers and supply chain operators across East Africa.
              </p>
              <p>
                Conventional Western enterprise software fails to handle the realities of Kenyan business: M-Pesa payments everywhere, real-time KRA eTIMS invoicing, patchy networks and counter-speed retail. Rooney set out to build a suite for those realities from scratch.
              </p>
              <p>
                The result is <b className="font-semibold text-[var(--ms-ink)]">Kabuor ERP</b>, the business operating system, and <b className="font-semibold text-[var(--ms-ink)]">Kabuor Shops</b>, which lets Kenyan merchants sell online with their own Paybill or Till.
              </p>
            </div>

            <h3 className="mt-10 text-xl font-semibold">Focus areas</h3>
            <ul className="mt-5 grid gap-6 sm:grid-cols-2">
              {ACHIEVEMENTS.map((item) => (
                <li key={item.title} className="border-t border-[var(--ms-line)] pt-5">
                  <item.icon className="h-6 w-6 text-[var(--ms-blue)]" strokeWidth={1.75} />
                  <h4 className="mt-3 font-semibold">{item.title}</h4>
                  <p className="mt-1 text-[0.9375rem] leading-relaxed text-[var(--ms-muted)]">{item.text}</p>
                </li>
              ))}
            </ul>

            <figure className="mt-10 border-l-4 border-[var(--ms-blue)] bg-[var(--ms-soft)] p-6">
              <blockquote className="text-xl leading-snug">
                “African software must not be a second-thought translation of Silicon Valley tools. It must be engineered ground-up around our payment rails, our regulatory systems, and our fast-paced retail counters.”
              </blockquote>
              <figcaption className="mt-3 text-sm text-[var(--ms-muted)]">Rooney Odhiambo Kabuor</figcaption>
            </figure>
          </div>
        </div>
      </section>
    </CorporatePage>
  );
}
