// Kabuor Technologies, the company (/). A visitor is deciding two things: "which of these is for me?" and "can I
// trust these people?". The page answers in that order, in a plain corporate layout (one font, flat colour, a
// white header with text links and one blue action, product tiles on a regular grid, a grey footer of link
// columns): the two products with their status and price, a guide to choosing, what both are built on, real
// work, a demo request, who we are, and a person to talk to. Styles are scoped under .ms (platform.css).
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BarChart3, ChevronRight, ExternalLink, Languages, MessageCircle, ReceiptText, Smartphone, Users, Wallet } from 'lucide-react';
import { ksh } from './shared';
import DemoRequest from './DemoRequest';
import { Go, whatsapp } from './Site';
import { BrowserShot, CorporatePage, FOUNDER, PhoneShot, SectionHead } from './Corporate';


const COMPANY_SHOWCASES = [
  {
    id: 'groceries',
    name: 'Gromuse Fresh Mart',
    category: 'Supermarket & Groceries',
    tag: '15-min delivery · Live steppers',
    accent: '#107C41',
    headline: 'Fresh farm groceries & supermarket, online',
    desc: 'From fresh organic produce to daily pantry staples. Built with 1-tap live quantity steppers, 15-minute express delivery promise, and instant M-Pesa checkout.',
    features: ['15-minute express delivery badge', '1-tap quantity steppers with live cart total', 'Category carousels for fast reordering', 'M-Pesa direct checkout'],
    address: 'gromuse.shop.ke',
    video: 'https://cdn.dribbble.com/userupload/10640472/file/original-c81c56245856e105c75424cf9a958366.mp4',
    img: '/brand/work-gromuse-desk.png',
  },
  {
    id: 'electronics',
    name: 'Nuvio Tech Megastore',
    category: 'Electronics & Gadgets',
    tag: 'Cyber Dark Mode · 50% Off Deals',
    accent: '#FF5722',
    headline: 'A cyber tech & electronics megastore',
    desc: 'Deep titanium dark mode with glowing neon accents. Live countdown flash sale banners, category counts (Smartwatches 685+, Earbuds 1,120+), specs badges, and trusted brand partners.',
    features: ['Live countdown flash deal timer', 'Titanium cyber dark mode layout', 'Category product counters and spec badges', 'Instant M-Pesa one-touch payment'],
    address: 'nuvio.shop.ke',
    img: '/brand/work-nuvio-desk.png',
  },
  {
    id: 'furniture',
    name: 'Rova Architectural Living',
    category: 'Furniture & Living',
    tag: 'Scandinavian Minimalist · Luxury',
    accent: '#8C6239',
    headline: 'Furniture that defines your space',
    desc: 'High-end architectural minimalism in warm cream and stone palettes. Sculptural modern showcases, high-fashion serif typography, and material craft guarantees.',
    features: ['Editorial magazine-grade gallery', 'Sculptural curved arch showcases', 'Premium material & sustainability tags', 'Custom deposits and M-Pesa settlement'],
    address: 'rova.shop.ke',
    img: '/brand/work-rova-desk.png',
  },
  {
    id: 'sauce',
    name: 'Anjugu Peanut Butter',
    category: 'Artisanal Brands',
    tag: 'Artisanal · Multi-Branch',
    accent: '#D9381E',
    headline: 'A peanut butter brand selling online with M-Pesa checkout',
    desc: 'A Kenyan brand with several branches, selling its own jars at its own prices, with customers paying by M-Pesa in a few taps. Designed around their real products, on a computer and a phone.',
    features: ['Real jars with live size selector', 'Multiple branches across Kenya', 'Direct M-Pesa Till integration', 'Zero sales commissions'],
    address: 'anjugu.shop.ke',
    img: '/brand/work-anjugu-desk.webp',
    phoneImg: '/brand/work-anjugu-shop-phone.webp',
  },
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

export default function Company({ info }) {
  const [activeShowcaseId, setActiveShowcaseId] = useState(COMPANY_SHOWCASES[0]?.id || 'groceries');
  const activeShowcase = COMPANY_SHOWCASES.find((s) => s.id === activeShowcaseId) || COMPANY_SHOWCASES[0];

  useEffect(() => {
    document.title = 'Kabuor Technologies · Software for Kenyan businesses'; // not the platform's name (Kabuor Builds)
  }, [info]);
  const price = info?.prices?.monthly ? `From ${ksh(info.prices.monthly)} a month` : null;

  return (
    <CorporatePage cta={{ href: '#demo', label: 'Request a demo' }}>
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
            {/* Both products, as they really look: Kabuor ERP's dashboards, and a shop made on Kabuor Shops. */}
            <div className="relative mx-auto w-full max-w-xl sm:pr-[14%] sm:pb-8">
              <BrowserShot src="/brand/erp-dashboards.webp" alt="Kabuor ERP dashboards: sales, profit, cash and who owes you, live from the books" address="erp.kabuor-technologies.company" />
              <PhoneShot src="/brand/work-anjugu-shop-phone.webp" alt="A shop made on Kabuor Shops, on a phone" className="absolute right-0 bottom-0 hidden w-[28%] sm:block" />
            </div>
          </div>
        </section>

        {/* Products */}
        <section id="products" aria-labelledby="products-title" className="scroll-mt-20 py-10 sm:py-12">
          <div className="container-x">
            <SectionHead id="products-title" title="Our products" text="Two products, one way of working: M-Pesa first, KRA-ready, priced in shillings." />
            <div className="mt-7 grid gap-6 lg:grid-cols-2">
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
                  <>
                    <img src="/brand/erp-invoices.webp" alt="" className="absolute top-8 right-[24%] bottom-0 left-8 h-[calc(100%-2rem)] w-[calc(76%-2rem)] rounded-t-md border border-b-0 border-[var(--ms-line)] object-cover object-left-top" />
                    <img src="/brand/erp-invoices-phone.webp" alt="" className="absolute right-8 bottom-0 aspect-[9/16] w-[24%] rounded-t-xl border-[4px] border-b-0 border-[#1b1b1b] bg-[#1b1b1b] object-cover object-top" />
                  </>
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
        <section id="choose" aria-labelledby="choose-title" className="scroll-mt-20 border-y border-[var(--ms-line)] bg-[var(--ms-soft)] py-10 sm:py-12">
          <div className="container-x">
            <SectionHead id="choose-title" title="Which one is right for you?" text="Start from what you want to fix." />
            <ul className="mt-7 grid gap-6 md:grid-cols-3">
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
        <section aria-labelledby="built-title" className="py-10 sm:py-12">
          <div className="container-x">
            <SectionHead id="built-title" title="Made for how business works in Kenya" />
            <ul className="mt-7 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* Customer story: Interactive Multi-Category Showcase */}
        <section id="work" aria-labelledby="work-title" className="scroll-mt-20 bg-[#F5F7FC] py-12 sm:py-16">
          <div className="container-x">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--ms-line)] pb-8">
              <div>
                <p className="text-sm font-semibold text-[var(--ms-blue)]">Our work</p>
                <h2 id="work-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Real stores built by Kabuor
                </h2>
                <p className="mt-2 max-w-xl text-lg text-[var(--ms-muted)]">
                  Explore how we design and engineer e-commerce experiences tailored to specific Kenyan industries.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {COMPANY_SHOWCASES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveShowcaseId(s.id)}
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition cursor-pointer ${activeShowcaseId === s.id ? "bg-[var(--ms-blue)] text-white shadow-sm" : "border border-[var(--ms-line)] bg-white text-[var(--ms-ink)] hover:bg-[#EAEFF8]"}`}
                  >
                    {s.category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
              <div className="relative">
                {activeShowcase.video ? (
                  <div className="overflow-hidden rounded-xl border border-[var(--ms-line)] bg-black shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]">
                    <div className="flex items-center gap-1.5 border-b border-white/10 bg-[#1A1A1A] px-3.5 py-2.5">
                      <i className="h-2.5 w-2.5 rounded-full bg-[#555]" />
                      <i className="h-2.5 w-2.5 rounded-full bg-[#555]" />
                      <i className="h-2.5 w-2.5 rounded-full bg-[#555]" />
                      <span className="ml-2 rounded bg-white/10 px-2 py-0.5 text-xs text-white/70 font-mono">{activeShowcase.address}</span>
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#107C41]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#16A34A]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" /> Live Store Preview
                      </span>
                    </div>
                    <video
                      src={activeShowcase.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="aspect-[16/10] w-full object-cover object-top"
                    />
                  </div>
                ) : (
                  <div className="relative sm:pr-[12%] sm:pb-6">
                    <BrowserShot src={activeShowcase.img} alt={activeShowcase.headline} address={activeShowcase.address} />
                    {activeShowcase.phoneImg && (
                      <PhoneShot src={activeShowcase.phoneImg} alt="Shop on phone" className="absolute right-0 bottom-0 hidden w-[26%] sm:block" />
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: activeShowcase.accent + "15", color: activeShowcase.accent }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: activeShowcase.accent }} />
                  {activeShowcase.tag}
                </div>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {activeShowcase.headline}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-[var(--ms-muted)] sm:text-lg">
                  {activeShowcase.desc}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {activeShowcase.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm sm:text-base">
                      <span className="text-[#0F7A3D] font-bold">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-4">
                  {activeShowcase.demoPath && (
                    <Go to={activeShowcase.demoPath} className="ms-btn bg-[#1A1A1A] text-white hover:bg-black shadow-md">
                      Launch Interactive Store ↗
                    </Go>
                  )}
                  <Go to="/shops" className="ms-btn ms-btn-primary">
                    Get a shop like this
                  </Go>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container-x py-10 sm:py-12">
          <DemoRequest info={info} product="erp" className="[&>div]:rounded-lg [&>div]:ring-[var(--ms-line)]" />
        </div>

        {/* Who we are */}
        <section id="about" aria-labelledby="about-title" className="scroll-mt-20 border-t border-[var(--ms-line)] py-10 sm:py-12">
          <div className="container-x grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <SectionHead id="about-title" title="About Kabuor Technologies" />
              <div className="mt-5 max-w-2xl space-y-4 text-lg leading-relaxed text-[var(--ms-muted)]">
                <p>We build the software Kenyan businesses run on, starting from how they really work: collecting payments by M-Pesa, staying right with KRA, and talking to customers on WhatsApp.</p>
                <p>We’re a fully remote team based on Ngong Road, Nairobi. Kabuor Technologies Ltd is being incorporated.</p>
              </div>
              <dl className="mt-6 grid max-w-2xl gap-6 border-t border-[var(--ms-line)] pt-6 sm:grid-cols-3">
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
              <div className="mt-7 flex flex-col items-start gap-4 rounded-lg bg-[var(--ms-soft)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                  <h3 className="text-xl font-semibold">We’re hiring</h3>
                  <p className="mt-1 text-[0.9375rem] text-[var(--ms-muted)]">Engineers, designers and young builders who want to make software for African businesses.</p>
                </div>
                <Link to="/careers" className="ms-btn ms-btn-secondary shrink-0">
                  See open roles
                </Link>
              </div>
            </div>
            {/* The founder's photo lives on /about-founder only, so this page (and its search listing) is about the company. */}
            <figure className="h-fit overflow-hidden rounded-lg border border-[var(--ms-line)] bg-white lg:max-w-sm lg:justify-self-end">
              <figcaption className="p-6">
                <p className="text-sm font-semibold text-[var(--ms-blue)]">Leadership</p>
                <p className="text-lg font-semibold">{FOUNDER.name}</p>
                <p className="text-sm text-[var(--ms-muted)]">{FOUNDER.title}</p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--ms-muted)]">Built Kabuor ERP end to end: the .NET API, the React app, the KRA eTIMS and M-Pesa integrations, and Kenyan payroll.</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--ms-line)] pt-5">
                  <Link to="/about-founder" className="ms-btn ms-btn-secondary">
                    About the founder
                  </Link>
                  <a href={FOUNDER.linkedin} target="_blank" rel="noopener noreferrer" className="ms-link">
                    LinkedIn <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* A person to talk to */}
        <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20 bg-[var(--ms-ink)] py-10 text-white sm:py-12">
          <div className="container-x flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
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
    </CorporatePage>
  );
}





