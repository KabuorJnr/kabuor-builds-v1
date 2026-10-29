// Kabuor Builds' own website: the company page (/), one page per product (/shops, /erp), the signup wizard
// (/start), the owner's dashboard (/admin) and the page a visitor sees on a shop link nobody has taken yet. Brand: ink #0F1115, orange #2357F5, cream #FFF7EC; "Mlete deals."
import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Eye, Mail, MessageCircle, Palette, Phone, Plus, ShoppingBag, Store, Wallet } from 'lucide-react';
import { cn } from '../lib/format';
import { family, loadFonts } from '../lib/fonts';
import './platform.css';
import { EASE, ksh, papi } from './shared';
import Wizard from './Wizard';
import Company from './Company';
import Erp from './Erp';
import CareersPage from './CareersPage';
import AboutFounder from './AboutFounder';
import { SiteFooter, SiteHeader, tel, whatsapp } from './Site';
import { platformOrigin } from '../lib/base';

// Kabuor Builds' own dashboard (only loads for the owner).
const OwnerDashboard = lazy(() => import('./OwnerDashboard'));

// Kabuor Builds' palette and type, in the names the shared styles use.
import { PLATFORM_LOOK } from './look';

/** The platform's address from a shop link: anjugu.shop.ke → shop.ke (anjugu.localhost:5173 → localhost:5173). */
export { platformOrigin };

import { Wordmark } from './Site';
export { Wordmark };

function useInfo() {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    papi('/info').then(setInfo).catch(() => setInfo(null));
  }, []);
  return info;
}


/** "[ your-business ].shop.ke" with a live availability check; continues to signup with the link filled in. */
function ClaimLink({ domain, dark = false }) {
  const [link, setLink] = useState('');
  const [check, setCheck] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (link.length < 3) return setCheck(null);
    const t = setTimeout(() => papi(`/check-link?link=${encodeURIComponent(link)}`).then(setCheck).catch(() => {}), 300);
    return () => clearTimeout(t);
  }, [link]);
  const go = (e) => {
    e.preventDefault();
    navigate(`/start${link ? `?link=${encodeURIComponent(link)}` : ''}`);
  };
  return (
    <form onSubmit={go} className="w-full max-w-xl">
      <div className={`flex items-center gap-2 rounded-full p-1.5 pl-5 ring-1 ${dark ? 'bg-white/[0.07] ring-white/15' : 'bg-white ring-espresso/10 shadow-[0_20px_40px_-24px_rgba(15,17,21,0.4)]'}`}>
        <span className="flex min-w-0 flex-1 items-baseline text-lg">
          <input
            aria-label="Your shop link"
            value={link}
            onChange={(e) => setLink(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30))}
            placeholder="yourbrand"
            className={`w-0 min-w-0 flex-1 bg-transparent font-semibold outline-none ${dark ? 'text-cream placeholder:text-cream/35' : 'placeholder:text-espresso/35'}`}
          />
          <span className={dark ? 'text-cream/50' : 'text-espresso/45'}>.{domain}</span>
        </span>
        <button className="btn shrink-0 bg-[#2357F5] px-5 py-3 text-white shadow-md shadow-[#2357F5]/30 hover:bg-[#3A6BFF]">
          Claim it <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <p className={`mt-2 h-5 pl-5 text-sm ${dark ? 'text-cream/70' : 'text-espresso/60'}`} aria-live="polite">
        {check && (check.available ? <span className={`font-semibold ${dark ? 'text-[#7EE2A0]' : 'text-[#1E8E3E]'}`}>✓ {check.link}.{domain} is free</span> : <>{check.problem} {check.suggestions[0] && <>Try <b>{check.suggestions[0]}</b>.</>}</>)}
      </p>
    </form>
  );
}

const STEPS = [
  { icon: Store, title: 'Tell us about your brand', text: 'Your name, what you sell, and the link you want.' },
  { icon: Palette, title: 'Make it yours', text: 'Upload your logo and photos, pick from 10 styles. Your site takes their colours.' },
  { icon: Eye, title: 'See it first', text: 'Add your products and walk through your real shop, on phone and computer.' },
  { icon: Wallet, title: 'Pay & go live', text: 'Happy with it? Pay by M-Pesa prompt and your link is live straight away.' },
];
const INCLUDED = ['Your colours, fonts & real photos', 'M-Pesa checkout & receipts', 'Admin: orders, stock, SMS alerts', 'Fast on every phone', 'Your own link, like anjugu.shop.ke', 'No commission on your sales'];
const FACTS = [
  ['Live the same day', 'Sign up, design, preview, pay. No developer.'],
  ['Paid with M-Pesa', 'Your plan, and your customers’ orders.'],
  ['KSh 0 commission', 'Every shilling customers pay goes to you.'],
];
const faqs = (domain, phone) => [
  ['Do I need to buy a domain?', `No. Your shop gets its own link, like yourbrand.${domain}, included in the plan.`],
  ['Who receives my customers’ money?', 'You do. Customers pay straight to your own M-Pesa Till or Paybill. We never hold your money and take no commission.'],
  ['Can customers pay with an M-Pesa prompt?', 'Yes. Connect your Daraja keys in your admin and customers get the PIN prompt at checkout. Until then, checkout shows your Till or Paybill number.'],
  ['I don’t have professional photos. Is that a problem?', 'No. Use clear phone photos of your products. Products without a photo show a clean drawing of their packaging until you add one.'],
  ['Can I change the look later?', 'Any time. Your admin has the same 10 styles, colours and photos, and changes go live when you save.'],
  ['What happens if I stop paying?', 'Your shop pauses three days after the plan ends. Nothing is deleted: renew from your admin and it reopens with all your products and orders.'],
  ['Can you build it for me instead?', phone ? `Yes. Call or WhatsApp ${phone} and we’ll design it around your products and set up M-Pesa for you.` : 'Yes. Get in touch and we’ll set it up for you.'],
];

/** The hero's picture: a real shop on a phone, with the M-Pesa prompt and a new-order alert beside it. */
function HeroPhone({ domain }) {
  return (
    <div className="relative mx-auto h-[29rem] w-full max-w-[26rem] sm:h-[34rem]" aria-label="A Kabuor Builds shop on a phone">
      <div className="absolute inset-x-[18%] top-[6%] bottom-[2%] rounded-full bg-[#2357F5]/25 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.15, ease: EASE }}
        className="absolute top-0 left-1/2 w-[64%] -translate-x-1/2 rounded-[2.4rem] bg-[#050608] p-2.5 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
      >
        <div className="overflow-hidden rounded-[1.9rem] bg-white">
          <div className="flex items-center justify-center bg-[#F4EFE7] py-1.5 text-[10px] font-semibold text-black/55">anjugu.{domain}</div>
          <img src="/brand/work-anjugu-shop-phone.webp" alt="The Anjugu Peanut Butter shop" className="aspect-[9/17] w-full object-cover object-top" />
        </div>
      </motion.div>
      {/* the M-Pesa prompt, as the customer sees it */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
        className="absolute top-[38%] -left-2 w-[58%] rounded-2xl bg-white p-4 text-[#0A0B1E] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] sm:-left-8"
      >
        <p className="text-[11px] font-bold tracking-wide text-[#1E8E3E] uppercase">M-Pesa</p>
        <p className="mt-1 text-[13px] leading-snug">
          Pay <b>KSh 650</b> to <b>ANJUGU PEANUT BUTTER</b>? Enter M-PESA PIN
        </p>
        <div className="mt-3 flex gap-1.5" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-[#0A0B1E]" />
          ))}
        </div>
      </motion.div>
      {/* the owner's phone, a moment later */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.1, ease: EASE }}
        className="absolute right-0 bottom-[8%] flex w-[62%] items-center gap-3 rounded-2xl bg-[#0A0B1E]/90 p-3 text-cream shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/10 backdrop-blur sm:-right-6"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#2357F5]">
          <ShoppingBag className="h-4 w-4 text-white" />
        </span>
        <span className="min-w-0 text-[12px] leading-snug">
          <b className="block text-[13px]">New order · KSh 1,300</b>
          <span className="text-cream/60">Achieng, Nairobi · paid by M-Pesa</span>
        </span>
      </motion.div>
    </div>
  );
}

/** The 10 styles as small specimens, each in its own fonts and light or dark. */
function StyleStrip({ styles }) {
  useEffect(() => {
    styles.forEach((s) => loadFonts({ ...s.fonts, body: s.body }));
  }, [styles]);
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
      {styles.map((s) => (
        <div key={s.id} className={cn('w-40 shrink-0 snap-start rounded-[var(--r-lg)] p-4 ring-1 sm:w-auto', s.mode === 'dark' ? 'bg-[#0A0B1E] text-cream ring-white/10' : 'bg-white ring-espresso/[0.07]')}>
          <span className="block text-3xl leading-none" style={{ fontFamily: `"${family(s.fonts.brand)}"` }}>
            Aa
          </span>
          <span className={cn('mt-1 block text-lg leading-none', s.mode === 'dark' ? 'text-cream/70' : 'text-espresso/60')} style={{ fontFamily: `"${family(s.fonts.tagline)}"` }}>
            handmade
          </span>
          <span className="mt-3 block text-sm font-semibold">{s.label}</span>
          <span className={cn('mt-0.5 block text-xs leading-snug', s.mode === 'dark' ? 'text-cream/55' : 'text-espresso/55')}>{s.note}</span>
        </div>
      ))}
    </div>
  );
}

function Landing({ info }) {
  useEffect(() => {
    document.title = 'Kabuor Shops · Product-first websites that sell';
  }, []);
  const domain = info?.domain ?? 'shop.ke';
  const name = info?.name ?? 'Kabuor Builds';
  const phone = info?.phone;
  const nav = [
    ['#how', 'How it works'],
    ['#work', 'Sample work'],
    ['#pricing', 'Pricing'],
    ['#faq', 'Questions'],
  ];
  return (
    <>
      {/* hero, on ink like the ad */}
      <div className="kb-ink relative overflow-hidden">
        <SiteHeader info={info} cta={{ to: '/start', label: 'Start your shop' }} />
        {/* this product's own sections */}
        <nav className="container-x relative -mt-1 hidden gap-1 text-sm font-semibold lg:flex" aria-label="Kabuor Shops">
          <span className="py-2 pr-2 text-cream/45">Kabuor Shops:</span>
          {nav.map(([href, label]) => (
            <a key={href} href={href} className="rounded-full px-3 py-2 text-cream/70 hover:text-cream">
              {label}
            </a>
          ))}
        </nav>

        <section className="container-x relative grid items-center gap-10 pt-4 pb-10 sm:pt-6 lg:grid-cols-[1.1fr_1fr] lg:pb-14">
          <div>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="kb-kicker text-[#9DB6FF]">
              Websites for brands
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.05, ease: EASE }} className="kb-display mt-4 text-[3.1rem] sm:text-[5.4rem]">
              Product-first websites <span className="text-[#F2C14E]">that sell.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: EASE }} className="mt-6 max-w-lg text-lg leading-relaxed text-cream/75">
              Your product, your colours, your prices. Customers pick, pay with M-Pesa, done. Get a link like <b className="text-cream">anjugu.{domain}</b> and see your shop before you pay a shilling.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25, ease: EASE }} className="mt-8">
              <ClaimLink domain={domain} dark />
              {info && (
                <p className="mt-1 pl-5 text-sm text-cream/55">
                  From {ksh(info.prices.monthly)} a month · <span className="kb-serif text-base text-[#F2C14E]">{info.tagline}</span>
                </p>
              )}
            </motion.div>
          </div>
          <HeroPhone domain={domain} />
        </section>

        <div className="relative border-t border-white/10">
          <ul className="container-x grid gap-4 py-6 sm:grid-cols-3">
            {FACTS.map(([title, text]) => (
              <li key={title} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#9DB6FF]" strokeWidth={3} />
                <span>
                  <b className="block text-cream">{title}</b>
                  <span className="text-sm text-cream/60">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section id="how" className="scroll-mt-6 bg-white py-10 sm:py-14">
        <div className="container-x">
          <p className="kb-kicker text-caramel">How it works</p>
          <h2 className="kb-display mt-3 text-4xl sm:text-5xl">Live in four steps</h2>
          <ol className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4 rounded-[var(--r-xl)] bg-cream p-5 sm:block sm:p-6">
                <span className="flex shrink-0 items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#ECEBFF] text-[#3A2BC9]">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="hidden text-sm font-bold text-espresso/40 tabular-nums sm:inline">0{i + 1}</span>
                </span>
                <span className="block">
                  <h3 className="text-lg font-bold sm:mt-5">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-espresso/60">{s.text}</p>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {info?.styles?.length > 0 && (
        <section className="py-10 sm:py-14">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="kb-kicker text-caramel">Make it yours</p>
                <h2 className="kb-display mt-3 text-4xl sm:text-5xl">{info.styles.length} styles, your colours</h2>
                <p className="mt-3 max-w-xl text-espresso/60">Pick a style; the colours come from your own logo and product photos. Switch any time, even after you go live.</p>
              </div>
              <Link to="/start" className="btn btn-ghost px-5 py-3">
                Try them on your brand <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8">
              <StyleStrip styles={info.styles} />
            </div>
          </div>
        </section>
      )}

      {/* sample work */}
      <section id="work" className="scroll-mt-6 bg-white py-10 sm:py-14">
        <div className="container-x">
          <p className="kb-kicker text-caramel">Sample work</p>
          <div className="mt-3 grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <h2 className="kb-display text-4xl sm:text-5xl">Anjugu Peanut Butter</h2>
              <p className="kb-serif mt-2 text-2xl text-cocoa">Love N-ut Home.</p>
              <ul className="mt-6 space-y-2.5">
                {['Real jars, real prices', 'M-Pesa checkout', 'All branches, one shop'].map((x) => (
                  <li key={x} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#3A2BC9]" strokeWidth={3} /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative pb-10 sm:pr-10">
              <div className="overflow-hidden rounded-[var(--r-lg)] bg-white shadow-[0_40px_80px_-40px_rgba(15,17,21,0.6)] ring-1 ring-espresso/10">
                <div className="flex items-center gap-2 bg-[#EEF1F6] px-4 py-2.5">
                  <i className="h-3 w-3 rounded-full bg-[#CBD2DD]" />
                  <i className="h-3 w-3 rounded-full bg-[#CBD2DD]" />
                  <i className="h-3 w-3 rounded-full bg-[#CBD2DD]" />
                  <span className="ml-3 flex-1 rounded-full bg-white px-3 py-0.5 text-xs text-espresso/55">anjugu.co.ke</span>
                </div>
                <img src="/brand/work-anjugu-desk.webp" alt="The Anjugu Peanut Butter website" loading="lazy" className="aspect-[16/10] w-full object-cover object-top" />
              </div>
              {/* the phone sits over the right edge, clear of the site's headline */}
              <div className="absolute -right-1 -bottom-4 w-[25%] overflow-hidden rounded-[1.5rem] border-[6px] border-[#050608] bg-[#050608] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)]">
                <img src="/brand/work-anjugu-shop-phone.webp" alt="The Anjugu shop on a phone" loading="lazy" className="aspect-[9/19] w-full rounded-[1rem] object-cover object-top" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* what you get + price */}
      <section id="pricing" className="scroll-mt-6 py-10 sm:py-14">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_26rem] lg:items-center">
          <div>
            <p className="kb-kicker text-caramel">What you get</p>
            <h2 className="kb-display mt-3 text-4xl sm:text-5xl">Built around your product.</h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {INCLUDED.map((x) => (
                <li key={x} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#3A2BC9]" strokeWidth={3} />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
          {info && (
            <div className="kb-ink relative overflow-hidden rounded-[var(--r-xl)] p-7">
              <p className="relative text-sm font-semibold text-cream/60">Do it yourself, one plan</p>
              <p className="relative mt-3 flex flex-wrap items-baseline gap-x-2">
                <span className="kb-display text-5xl whitespace-nowrap tabular-nums sm:text-6xl">{ksh(info.prices.monthly)}</span>
                <span className="text-lg font-semibold whitespace-nowrap text-cream/50">a month</span>
              </p>
              <p className="relative mt-2 text-sm text-cream/60">or {ksh(info.prices.yearly)} a year: two months free</p>
              <ul className="relative mt-6 space-y-2 text-sm text-cream/80">
                {['See your shop before you pay', 'Pay by M-Pesa prompt, no card needed', 'Customers pay your own Till or Paybill'].map((x) => (
                  <li key={x} className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#9DB6FF]" strokeWidth={3} /> {x}
                  </li>
                ))}
              </ul>
              <Link to="/start" className="btn relative mt-7 w-full bg-[#2357F5] py-3.5 text-white shadow-lg shadow-[#2357F5]/30 hover:bg-[#3A6BFF]">
                Start your shop <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* questions people ask before buying */}
      <section id="faq" className="scroll-mt-6 bg-white py-10 sm:py-14">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="kb-kicker text-caramel">Questions</p>
            <h2 className="kb-display mt-3 text-4xl sm:text-5xl">Before you start</h2>
            <p className="mt-3 text-espresso/60">Anything else? WhatsApp us{phone ? ` on ${phone}` : ''}.</p>
          </div>
          <div className="divide-y divide-espresso/10 border-y border-espresso/10">
            {faqs(domain, phone).map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <Plus className="h-4 w-4 shrink-0 text-espresso/45 transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-2 max-w-2xl text-espresso/65">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* done for you */}
      {phone && (
        <section className="container-x py-10 sm:py-14">
          <div className="grid gap-8 rounded-[var(--r-xl)] bg-beige p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="kb-kicker text-caramel">Rather we build it?</p>
              <h2 className="kb-display mt-3 text-4xl sm:text-5xl">Want a site like Anjugu’s?</h2>
              <p className="mt-3 max-w-lg text-espresso/65">We design it around your real products and photos, set up M-Pesa and hand you the keys. Talk to us.</p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col">
              <a href={whatsapp(phone, `Hi ${name}, I want a website for my brand.`)} target="_blank" rel="noreferrer" className="btn bg-[#1E8E3E] px-6 py-3.5 text-[#fff] hover:bg-[#176F30]">
                <MessageCircle className="h-4 w-4" /> WhatsApp {phone}
              </a>
              <a href={tel(phone)} className="btn btn-ghost px-6 py-3.5">
                <Phone className="h-4 w-4" /> Call
              </a>
              <a href={`mailto:${info.email}`} className="btn btn-ghost px-6 py-3.5">
                <Mail className="h-4 w-4" /> Email
              </a>
            </div>
          </div>
        </section>
      )}

      <SiteFooter info={info}>
        <p className="mb-3 text-sm font-semibold text-cream/50">Claim your link</p>
        <ClaimLink domain={domain} dark />
      </SiteFooter>
    </>
  );
}

/** A visitor on a shop link nobody has taken. */
function Unclaimed({ site }) {
  const domain = site.platform?.domain ?? 'shop.ke';
  return (
    <div className="kb-ink relative grid min-h-svh place-items-center px-5 text-center">
      <div className="relative max-w-md">
        <Wordmark name={site.platform?.name} light />
        <h1 className="kb-display mt-10 text-5xl">
          {site.link}.{domain} <span className="text-[#9DB6FF]">is free</span>
        </h1>
        <p className="mt-4 text-cream/65">There’s no shop here yet. If this is your brand’s name, it can be yours in a few minutes.</p>
        <a href={`${platformOrigin()}/start?link=${encodeURIComponent(site.link ?? '')}`} className="btn mt-8 bg-[#2357F5] px-6 py-3.5 text-white shadow-lg shadow-[#2357F5]/30 hover:bg-[#3A6BFF]">
          Open this shop <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export default function PlatformApp({ site }) {
  const info = useInfo();
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(PLATFORM_LOOK).forEach(([k, v]) => root.style.setProperty(k, v));
    root.dataset.mode = 'light';
    root.dataset.radius = 'round';
    root.dataset.texture = 'dots';
  }, []);
  if (site.kind === 'missing') return <Unclaimed site={site} />;
  return (
    <div className="min-h-svh bg-cream text-espresso">
      <Routes>
        <Route path="/start" element={<Wizard info={info} />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={null}>
              <OwnerDashboard />
            </Suspense>
          }
        />
        <Route path="/shops" element={<Landing info={info} />} />
        <Route path="/erp" element={<Erp info={info} />} />
        <Route path="/careers" element={<CareersPage info={info} />} />
        <Route path="/about-founder" element={<AboutFounder info={info} />} />
        <Route path="/founder" element={<AboutFounder info={info} />} />
        <Route path="*" element={<Company info={info} />} />
      </Routes>
    </div>
  );
}
