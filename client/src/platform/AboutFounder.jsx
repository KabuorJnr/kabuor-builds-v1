import { useEffect } from 'react';
import { ExternalLink, Mail, MessageCircle, Phone, Award, Code, Building, Cpu } from 'lucide-react';
import { SiteHeader, SiteFooter, tel, whatsapp } from './Site';

const FOUNDER = {
  name: 'Rooney Odhiambo Kabuor',
  first: 'Rooney',
  title: 'Founder & CEO',
  phone: '0705 607 954',
  email: 'rooneykabuor2004@gmail.com',
  linkedin: 'https://www.linkedin.com/in/rooney-odhiambo-9a26b6256',
  location: 'Nairobi, Kenya · Ngong Road',
};

const ACHIEVEMENTS = [
  {
    icon: Code,
    title: 'Full-Stack Architecture',
    text: 'Engineered Kabuor ERP end-to-end: high-performance C# .NET API, responsive React PWA, offline-first SQLite sync, and PostgreSQL enterprise data layer.',
  },
  {
    icon: Building,
    title: 'Kenyan Fiscalization & Compliance',
    text: 'Designed real-time KRA eTIMS Type-C automated fiscal signature signing, QR generation, and statutory payroll processing for Kenyan tax laws.',
  },
  {
    icon: Cpu,
    title: 'M-Pesa Ledger Automation',
    text: 'Pioneered seamless Safaricom Daraja C2B and B2C integration, enabling instant till reconciliation, automated callbacks, and zero-leakage accounting.',
  },
  {
    icon: Award,
    title: 'Multi-Tenant Commerce',
    text: 'Created Kabuor Shops, empowering local retail businesses to spin up digital storefronts with automated payments and order fulfillment in minutes.',
  },
];

export default function AboutFounder({ info }) {
  useEffect(() => {
    document.title = 'About Founder · Rooney Odhiambo Kabuor · Kabuor Technologies';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-svh bg-cream text-espresso">
      {/* Dark hero */}
      <section className="kb-ink relative overflow-hidden pt-4 pb-12 sm:pt-6 sm:pb-16 border-b border-white/10">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[#2357F5]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-[#3A2BC9]/20 blur-3xl pointer-events-none" />
        <SiteHeader info={{ ...info, name: 'Kabuor Technologies' }} />

        <div className="container-x relative mt-8 sm:mt-12">
          <p className="kb-kicker text-[#9DB6FF]">Leadership & Engineering</p>
          <h1 className="kb-display mt-3 text-4xl sm:text-6xl text-white">
            About the Founder
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-cream/70">
            Meet the engineer and visionary building modern enterprise infrastructure and commerce software for East African businesses.
          </p>
        </div>
      </section>

      {/* Main profile section */}
      <main className="container-x py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[380px_1fr] items-start">
          {/* Photo & quick card */}
          <div className="space-y-6">
            <figure className="overflow-hidden rounded-[var(--r-xl)] bg-white shadow-md ring-1 ring-espresso/10">
              <img
                src="/brand/founder-rooney-portrait.webp"
                alt={`${FOUNDER.name}, ${FOUNDER.title} of Kabuor Technologies`}
                width="720"
                height="900"
                className="aspect-[4/5] w-full object-cover object-top"
              />
              <figcaption className="p-6">
                <h2 className="kb-display text-2xl text-espresso">{FOUNDER.name}</h2>
                <p className="mt-1 text-sm font-semibold text-[#2357F5]">{FOUNDER.title}</p>
                <p className="mt-1 text-xs text-espresso/50 font-medium">{FOUNDER.location}</p>

                <div className="mt-6 pt-5 border-t border-espresso/10 space-y-3 text-sm">
                  <a
                    href={FOUNDER.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-semibold text-[#2357F5] hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> Connect on LinkedIn
                  </a>
                  <a
                    href={`mailto:${FOUNDER.email}`}
                    className="flex items-center gap-2 text-espresso/70 hover:text-espresso"
                  >
                    <Mail className="h-4 w-4" /> {FOUNDER.email}
                  </a>
                  <a
                    href={tel(FOUNDER.phone)}
                    className="flex items-center gap-2 text-espresso/70 hover:text-espresso"
                  >
                    <Phone className="h-4 w-4" /> {FOUNDER.phone}
                  </a>
                </div>

                <div className="mt-6">
                  <a
                    href={whatsapp(FOUNDER.phone, "Hi Rooney, I'd like to connect regarding Kabuor Technologies.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn w-full bg-[#1E8E3E] text-white py-3 hover:bg-[#176F30] flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp Rooney
                  </a>
                </div>
              </figcaption>
            </figure>
          </div>

          {/* Detailed Biography & Vision */}
          <div className="space-y-8">
            <div>
              <p className="kb-kicker text-caramel">Vision & Background</p>
              <h2 className="kb-display mt-2 text-3xl sm:text-4xl text-espresso">
                Engineering Software for African Counter Realities
              </h2>
              <div className="mt-6 space-y-4 text-base sm:text-lg leading-relaxed text-espresso/80">
                <p>
                  Rooney Odhiambo Kabuor is a software architect and technology entrepreneur based in Nairobi, Kenya. As the founder of <b className="text-espresso">Kabuor Technologies Ltd</b>, Rooney is dedicated to solving the structural operating challenges faced by commercial enterprises, retailers, and supply chain operators across East Africa.
                </p>
                <p>
                  Observing that conventional Western enterprise software fails to handle the realities of Kenyan business—such as ubiquitous mobile money payments via M-Pesa, stringent real-time KRA eTIMS invoice fiscalization, intermittent network conditions, and counter-speed retail requirements—Rooney set out to engineer a purpose-built operating suite from scratch.
                </p>
                <p>
                  The result is the Kabuor platform ecosystem: <b className="text-espresso">Kabuor ERP</b>, the comprehensive multi-tenant business operating system, and <b className="text-espresso">Kabuor Shops</b>, empowering Kenyan merchants to sell online with direct Paybill and Till automation.
                </p>
              </div>
            </div>

            {/* Engineering Highlights */}
            <div className="pt-6 border-t border-espresso/10">
              <h3 className="kb-display text-2xl text-espresso">Core Architecture & Focus</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {ACHIEVEMENTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-espresso/10 space-y-2.5"
                    >
                      <div className="inline-flex p-2 rounded-xl bg-[#EEF2FF] text-[#2357F5]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h4 className="font-bold text-espresso text-base">{item.title}</h4>
                      <p className="text-sm leading-relaxed text-espresso/70">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quote / Philosophy */}
            <div className="rounded-2xl bg-[#0A0B1E] p-7 text-white shadow-md">
              <p className="text-xs font-bold uppercase tracking-wider text-[#9DB6FF]">Philosophy</p>
              <blockquote className="mt-3 text-lg sm:text-xl font-medium leading-snug italic text-cream">
                “African software must not be a second-thought translation of Silicon Valley tools. It must be engineered ground-up around our payment rails, our regulatory systems, and our fast-paced retail counters.”
              </blockquote>
              <p className="mt-4 text-sm font-semibold text-cream/70">— Rooney Odhiambo Kabuor</p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter info={{ ...info, name: 'Kabuor Technologies' }} />
    </div>
  );
}
