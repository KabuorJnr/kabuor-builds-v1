// Kabuor Technologies, the company (/). A visitor is deciding two things: "which of these is for me?" and "can I
// trust these people?". The page answers in that order, in a plain corporate layout (one font, flat colour, a
// white header with text links and one blue action, product tiles on a regular grid, a grey footer of link
// columns): the two products with their status and price, a guide to choosing, what both are built on, real
// work, a demo request, who we are, and a person to talk to. Styles are scoped under .ms (platform.css).
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BarChart3, ChevronRight, ExternalLink, Languages, Menu, MessageCircle, ReceiptText, Smartphone, Sparkles, Users, Wallet, X } from 'lucide-react';
import { ksh } from './shared';
import DemoRequest from './DemoRequest';
import { ERP_RAILWAY_URL, Go, tel, whatsapp } from './Site';
import { CONTACT_EMAIL } from './contact';

const FOUNDER = {
  name: 'Rooney Odhiambo Kabuor',
  first: 'Rooney',
  title: 'Founder & CEO',
  phone: '0705 607 954',
  email: CONTACT_EMAIL,
  linkedin: 'https://www.linkedin.com/in/rooney-odhiambo-9a26b6256',
};
const LEGAL = 'https://erp.kabuor-technologies.company';

const NAV = [
  { to: '/erp', label: 'Kabuor ERP' },
  { to: '/shops', label: 'Kabuor Shops' },
  { href: '#work', label: 'Customers' },
  { href: '#about', label: 'About' },
  { to: '/careers', label: 'Careers' },
];

const SHARED = [
  { icon: Wallet, title: 'M-Pesa first', text: 'Prompts, Paybills and Tills built in, and payments matched to invoices by themselves.' },
  { icon: ReceiptText, title: 'KRA-ready', text: 'VAT worked out as you go, and invoices prepared for eTIMS.' },
  { icon: Languages, title: 'English and Kiswahili', text: 'Plain words your whole team understands, in either language.' },
  { icon: Smartphone, title: 'Phone-first', text: 'Fast on the phones your customers and staff already use.' },
  { icon: BarChart3, title: 'Priced in shillings', text: 'One clear price per business, not per seat and not in dollars.' },
  { icon: Users, title: 'Real people', text: 'Call or WhatsApp us. We set it up with you, in person if you like.' },
];

const CHOOSE = [
  { need: 'I want customers to find my products and order online.', product: 'Kabuor Shops', to: '/shops', text: 'Your own online shop with M-Pesa checkout, live the same day.' },
  { need: 'I invoice other businesses, buy stock, and need my books and KRA in order.', product: 'Kabuor ERP', to: '/erp', text: 'Sales, M-Pesa, stock, payroll and books in one place.' },
  { need: 'I need both.', product: 'Start with Kabuor Shops', to: '/shops', text: 'Then join the ERP early access: online orders will flow straight into your books.' },
];

function NavItem({ item, className, onClick }) {
  return item.to ? (
    <Go to={item.to} className={className} onClick={onClick}>
      {item.label}
    </Go>
  ) : (
    <a href={item.href} className={className} onClick={onClick}>
      {item.label}
    </a>
  );
}

/** White bar: the company's logo, the products and pages as plain text links, and one action. */
function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--ms-line)] bg-white">
      <div className="container-x flex h-16 items-center gap-6">
        <Link to="/" aria-label="Kabuor Technologies home" className="shrink-0">
          <img src="/brand/kabuor-technologies-logo-blue.svg" alt="Kabuor Technologies" className="h-9 w-auto" />
        </Link>
        <nav className="hidden flex-1 items-center gap-1 text-[0.9375rem] lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <NavItem key={item.label} item={item} className="rounded px-3 py-2 text-[var(--ms-ink)] hover:underline hover:underline-offset-4" />
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a href="#contact" className="hidden px-3 py-2 text-[0.9375rem] hover:underline hover:underline-offset-4 sm:block">
            Contact us
          </a>
          <a href="#demo" className="ms-btn ms-btn-primary hidden py-2 sm:inline-flex">
            Request a demo
          </a>
          <button type="button" className="grid h-10 w-10 place-items-center rounded lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="ms-menu" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="ms-menu" className="border-t border-[var(--ms-line)] bg-white lg:hidden" aria-label="Main">
          <div className="container-x grid py-2">
            {[...NAV, { href: '#contact', label: 'Contact us' }].map((item) => (
              <NavItem key={item.label} item={item} onClick={close} className="flex items-center justify-between border-b border-[var(--ms-line)] py-3.5 text-base last:border-0">
                {item.label}
              </NavItem>
            ))}
            <a href="#demo" onClick={close} className="ms-btn ms-btn-primary my-3">
              Request a demo
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

/** The ERP's home screen, drawn small and honestly (no stock photo). */
function ErpPicture() {
  return (
    <div className="rounded-lg border border-[var(--ms-line)] bg-white p-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]">
      <p className="text-xs font-semibold text-[var(--ms-muted)]">Needs you today</p>
      {[
        ['2 invoices overdue', 'KSh 30,100', '#B42318', '#FDECEA'],
        ['3 M-Pesa payments', 'matched', '#0F7A3D', '#E6F6EC'],
        ['Hot Pepper 500g running low', '18 left', '#A15C00', '#FFF4E0'],
      ].map(([t, m, c, bg]) => (
        <div key={t} className="mt-2 flex items-center gap-2.5 rounded px-2.5 py-2" style={{ background: bg }}>
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c }} />
          <span className="flex-1 truncate text-[13px] font-semibold">{t}</span>
          <span className="text-xs font-semibold" style={{ color: c }}>
            {m}
          </span>
        </div>
      ))}
      <div className="mt-3 flex items-center gap-2 rounded bg-[var(--ms-ink)] px-3 py-2 text-xs text-white">
        <Sparkles className="h-3.5 w-3.5" /> “Nani hajalipa mwezi huu?”
      </div>
    </div>
  );
}

/** One product: picture on top, then status and price, name, what it does, and the two ways in. */
function ProductTile({ picture, status, name, text, points, primary, more }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-[var(--ms-line)] bg-white">
      <div className="relative aspect-[16/9] overflow-hidden bg-[#EEF2FC]">{picture}</div>
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <p className="text-sm text-[var(--ms-muted)]">{status}</p>
        <h3 className="mt-1 text-2xl font-semibold sm:text-[1.75rem]">{name}</h3>
        <p className="mt-2 text-base leading-relaxed text-[var(--ms-muted)]">{text}</p>
        <ul className="mt-4 space-y-1.5 text-[0.9375rem]">
          {points.map((p) => (
            <li key={p} className="flex gap-2">
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ms-blue)]" /> {p}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-6">
          {primary}
          {more}
        </div>
      </div>
    </article>
  );
}

const SectionHead = ({ title, text, id }) => (
  <div className="max-w-3xl">
    <h2 id={id} className="text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-tight">
      {title}
    </h2>
    {text && <p className="mt-3 text-lg leading-relaxed text-[var(--ms-muted)]">{text}</p>}
  </div>
);

function Footer() {
  const cols = [
    ['Products', [
      { to: '/erp', label: 'Kabuor ERP' },
      { to: '/shops', label: 'Kabuor Shops' },
      { to: '/start', label: 'Start a shop' },
      { href: ERP_RAILWAY_URL, label: 'Sign in to Kabuor ERP' },
    ]],
    ['For business', [
      { href: '#demo', label: 'Request a demo' },
      { href: '#choose', label: 'Which product fits' },
      { href: '#work', label: 'Customer stories' },
    ]],
    ['Company', [
      { href: '#about', label: 'About Kabuor Technologies' },
      { to: '/careers', label: 'Careers' },
      { href: FOUNDER.linkedin, label: 'Founder on LinkedIn' },
    ]],
    ['Contact', [
      { href: whatsapp(FOUNDER.phone, 'Hi Kabuor Technologies, '), label: 'WhatsApp us' },
      { href: tel(FOUNDER.phone), label: FOUNDER.phone },
      { href: `mailto:${FOUNDER.email}`, label: 'Email us' },
    ]],
  ];
  return (
    <footer className="bg-[var(--ms-soft)] text-[0.8125rem] text-[#616161]">
      <div className="container-x grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
        {cols.map(([title, links]) => (
          <nav key={title} aria-label={title}>
            <p className="mb-3 text-[0.9375rem] font-semibold text-[var(--ms-ink)]">{title}</p>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Go to={l.to} className="hover:text-[var(--ms-ink)] hover:underline">
                      {l.label}
                    </Go>
                  ) : (
                    <a href={l.href} {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="hover:text-[var(--ms-ink)] hover:underline">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="container-x flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#d6d6d6] py-5">
        <span>Nairobi, Kenya</span>
        <a href={`${LEGAL}/privacy`} className="hover:underline">
          Privacy
        </a>
        <a href={`${LEGAL}/terms`} className="hover:underline">
          Terms of use
        </a>
        <span className="sm:ml-auto">© {new Date().getFullYear()} Kabuor Technologies</span>
      </div>
    </footer>
  );
}

export default function Company({ info }) {
  useEffect(() => {
    document.title = 'Kabuor Technologies · ERP and online shops for Kenyan businesses'; // not the platform's name (Kabuor Builds)
  }, [info]);
  const price = info?.prices?.monthly ? `From ${ksh(info.prices.monthly)} a month` : null;

  return (
    <div className="ms min-h-svh">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-white focus:p-3">
        Skip to content
      </a>
      <Header />

      <main id="main">
        {/* Hero: who we are in one line, and the two things a visitor can do next. */}
        <section className="border-b border-[var(--ms-line)] bg-[#F5F7FC]">
          <div className="container-x grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:py-20">
            <div>
              <p className="text-sm font-semibold text-[var(--ms-blue)]">Kabuor Technologies</p>
              <h1 className="mt-3 text-[2.25rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl">Software Kenyan businesses run on</h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--ms-muted)]">
                Kabuor ERP runs the whole business: sales, M-Pesa, stock, payroll and books. Kabuor Shops puts your products online with M-Pesa checkout. Both are built for KRA and for the way business works here.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#demo" className="ms-btn ms-btn-primary">
                  Request a demo
                </a>
                <a href="#products" className="ms-btn ms-btn-secondary">
                  Explore products
                </a>
              </div>
            </div>
            {/* Both products at a glance: the ERP's home screen and a shop on a phone. */}
            <div className="relative mx-auto w-full max-w-lg py-2 sm:py-6 sm:pr-[30%]">
              <ErpPicture />
              <img src="/brand/work-anjugu-shop-phone.webp" alt="A Kabuor Shops online shop on a phone" className="absolute top-1/2 right-0 hidden aspect-[9/18] sm:block w-[30%] -translate-y-1/2 rounded-[1.4rem] border-[5px] border-[#1b1b1b] bg-[#1b1b1b] object-cover object-top shadow-[0_16px_40px_-16px_rgba(0,0,0,0.45)]" />
            </div>
          </div>
        </section>

        {/* Products */}
        <section id="products" aria-labelledby="products-title" className="scroll-mt-20 py-14 sm:py-20">
          <div className="container-x">
            <SectionHead id="products-title" title="Our products" text="Two products, one way of working: M-Pesa first, KRA-ready, priced in shillings." />
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <ProductTile
                picture={
                  <>
                    <img src="/brand/work-anjugu-desk.webp" alt="" className="absolute top-8 right-[24%] bottom-0 left-8 h-[calc(100%-2rem)] w-[calc(76%-2rem)] rounded-t-md border border-b-0 border-[var(--ms-line)] object-cover object-top" />
                    <img src="/brand/work-anjugu-shop-phone.webp" alt="" className="absolute right-8 bottom-0 aspect-[9/16] w-[24%] rounded-t-xl border-[4px] border-b-0 border-[#1b1b1b] bg-[#1b1b1b] object-cover object-top" />
                  </>
                }
                status={['Available now', price].filter(Boolean).join(' · ')}
                name="Kabuor Shops"
                text="Your brand’s own online shop. Your products, your colours, M-Pesa checkout. See it before you pay, and go live the same day."
                points={['10 designs that take their colours from your photos', 'Customers pay your own Till or Paybill, with no commission', 'Your own shop link, ready to share on WhatsApp']}
                primary={
                  <Go to="/start" className="ms-btn ms-btn-primary">
                    Start your shop
                  </Go>
                }
                more={
                  <Go to="/shops" className="ms-link">
                    Learn more <ChevronRight className="h-4 w-4" />
                  </Go>
                }
              />
              <ProductTile
                picture={
                  <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10">
                    <div className="w-full max-w-sm">
                      <ErpPicture />
                    </div>
                  </div>
                }
                status="Early access · Priced per business, in shillings"
                name="Kabuor ERP"
                text="Sales, M-Pesa, stock, payroll and books in one place, with Msaidizi, an assistant you can ask in Kiswahili."
                points={['M-Pesa payments match your invoices by themselves', 'VAT, stock and profit worked out as you go', 'Built for the phone, for your whole team']}
                primary={
                  <a href="#demo" className="ms-btn ms-btn-primary">
                    Request a demo
                  </a>
                }
                more={
                  <Go to="/erp" className="ms-link">
                    Learn more <ChevronRight className="h-4 w-4" />
                  </Go>
                }
              />
            </div>
          </div>
        </section>

        {/* Choosing */}
        <section id="choose" aria-labelledby="choose-title" className="scroll-mt-20 border-y border-[var(--ms-line)] bg-[var(--ms-soft)] py-14 sm:py-20">
          <div className="container-x">
            <SectionHead id="choose-title" title="Which one is right for you?" text="Start from what you want to fix." />
            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {CHOOSE.map((c) => (
                <li key={c.need} className="flex flex-col rounded-lg bg-white p-6 sm:p-8">
                  <p className="text-lg font-semibold leading-snug">“{c.need}”</p>
                  <p className="mt-4 text-sm font-semibold text-[var(--ms-blue)]">{c.product}</p>
                  <p className="mt-1 text-[0.9375rem] text-[var(--ms-muted)]">{c.text}</p>
                  <Go to={c.to} className="ms-link mt-auto pt-5">
                    See {c.product.replace('Start with ', '')} <ChevronRight className="h-4 w-4" />
                  </Go>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* What both are built on */}
        <section aria-labelledby="built-title" className="py-14 sm:py-20">
          <div className="container-x">
            <SectionHead id="built-title" title="Made for how business works in Kenya" />
            <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {SHARED.map((s) => (
                <li key={s.title} className="border-t border-[var(--ms-line)] pt-6">
                  <s.icon className="h-6 w-6 text-[var(--ms-blue)]" strokeWidth={1.75} />
                  <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-[0.9375rem] leading-relaxed text-[var(--ms-muted)]">{s.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Customer story */}
        <section id="work" aria-labelledby="work-title" className="scroll-mt-20 bg-[#F5F7FC] py-14 sm:py-20">
          <div className="container-x grid items-center gap-10 lg:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-[var(--ms-line)] bg-white">
              <img src="/brand/work-anjugu-desk.webp" alt="The Anjugu Peanut Butter website" loading="lazy" className="aspect-[16/10] w-full object-cover object-top" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--ms-blue)]">Customer story</p>
              <h2 id="work-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-tight">
                Anjugu Peanut Butter sells online with M-Pesa checkout
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[var(--ms-muted)]">A Kenyan brand with several branches, selling its own jars at its own prices, with customers paying by M-Pesa in a few taps.</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Go to="/shops" className="ms-btn ms-btn-primary">
                  Get a shop like this
                </Go>
                <a href="https://anjugu.co.ke" target="_blank" rel="noopener noreferrer" className="ms-link">
                  Visit anjugu.co.ke <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="container-x py-14 sm:py-20">
          <DemoRequest info={info} product="erp" className="[&>div]:rounded-lg [&>div]:ring-[var(--ms-line)]" />
        </div>

        {/* Who we are */}
        <section id="about" aria-labelledby="about-title" className="scroll-mt-20 border-t border-[var(--ms-line)] py-14 sm:py-20">
          <div className="container-x grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <SectionHead id="about-title" title="About Kabuor Technologies" />
              <div className="mt-5 max-w-2xl space-y-4 text-lg leading-relaxed text-[var(--ms-muted)]">
                <p>We build the software Kenyan businesses run on, starting from how they really work: collecting payments by M-Pesa, staying right with KRA, and talking to customers on WhatsApp.</p>
                <p>We’re a fully remote team based on Ngong Road, Nairobi. Kabuor Technologies Ltd is being incorporated.</p>
              </div>
              <dl className="mt-8 grid max-w-2xl gap-6 border-t border-[var(--ms-line)] pt-6 sm:grid-cols-3">
                {[
                  ['Kabuor ERP', 'The whole business in one place'],
                  ['Kabuor Shops', 'Online shops for Kenyan brands'],
                  ['Kabuor Builds', 'Websites we design and build for you'],
                ].map(([t, d]) => (
                  <div key={t}>
                    <dt className="font-semibold">{t}</dt>
                    <dd className="mt-1 text-[0.9375rem] text-[var(--ms-muted)]">{d}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-10 flex flex-col items-start gap-4 rounded-lg bg-[var(--ms-soft)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                  <h3 className="text-xl font-semibold">We’re hiring</h3>
                  <p className="mt-1 text-[0.9375rem] text-[var(--ms-muted)]">Engineers, designers and young builders who want to make software for African businesses.</p>
                </div>
                <Link to="/careers" className="ms-btn ms-btn-secondary shrink-0">
                  See open roles
                </Link>
              </div>
            </div>
            <figure className="h-fit overflow-hidden rounded-lg border border-[var(--ms-line)] bg-white lg:max-w-sm lg:justify-self-end">
              <img src="/brand/founder-rooney-portrait.webp" alt={`${FOUNDER.name}, ${FOUNDER.title} of Kabuor Technologies`} width="720" height="900" loading="lazy" className="aspect-[4/5] w-full object-cover object-top" />
              <figcaption className="p-6">
                <p className="text-lg font-semibold">{FOUNDER.name}</p>
                <p className="text-sm text-[var(--ms-muted)]">{FOUNDER.title}</p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--ms-muted)]">Built Kabuor ERP end to end: the .NET API, the React app, the KRA eTIMS and M-Pesa integrations, and Kenyan payroll.</p>
                <a href={FOUNDER.linkedin} target="_blank" rel="noopener noreferrer" className="ms-link mt-3">
                  {FOUNDER.first} on LinkedIn <ExternalLink className="h-4 w-4" />
                </a>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* A person to talk to */}
        <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20 bg-[var(--ms-ink)] py-14 text-white sm:py-16">
          <div className="container-x flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <img src="/brand/founder-rooney-headshot.webp" alt="" width="320" height="320" loading="lazy" className="h-20 w-20 shrink-0 rounded-full object-cover" />
              <div>
                <h2 id="contact-title" className="text-2xl font-semibold sm:text-3xl">
                  Not sure where to start?
                </h2>
                <p className="mt-1 text-white/75">Tell us about your business. You’ll reach {FOUNDER.first}, our founder, directly.</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <a href={whatsapp(FOUNDER.phone, `Hi ${FOUNDER.first}, I'd like to talk about my business.`)} target="_blank" rel="noreferrer" className="ms-btn bg-white text-[var(--ms-ink)] hover:bg-[#e6e6e6]">
                <MessageCircle className="h-4 w-4" /> WhatsApp {FOUNDER.phone}
              </a>
              <a href={`mailto:${FOUNDER.email}`} className="ms-btn border border-white/60 text-white hover:bg-white/10">
                Email us <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

