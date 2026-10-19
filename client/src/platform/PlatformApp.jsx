// Kabuor Builds' own website: the landing page, the signup wizard (/start) and the page a visitor sees on
// a shop link nobody has taken yet. Brand: ink #0F1115, orange #FF5B1F, cream #FFF7EC; "Mlete deals."
import { useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Eye, Mail, MessageCircle, Palette, Phone, Store, Wallet } from 'lucide-react';
import './platform.css';
import { EASE, ksh, papi, ShopPreview } from './shared';
import Wizard from './Wizard';

// Kabuor Builds' palette and type, in the names the shared styles use.
const PLATFORM_LOOK = {
  '--color-cream': '#F8FAFC', '--color-beige': '#F1F5F9', '--color-sand': '#E2E8F0', '--color-latte': '#94A3B8',
  '--color-honey': '#3B82F6', '--color-amber': '#6366F1', '--color-caramel': '#2563EB', '--color-cocoa': '#475569',
  '--color-espresso': '#0B0F19', '--color-bark': '#030712', '--color-white': '#FFFFFF',
  '--font-sans': '"KB Onest", ui-sans-serif, system-ui, sans-serif',
  '--font-brand': '"KB Bricolage", ui-sans-serif, system-ui, sans-serif',
  '--font-hand': '"KB Fraunces", Georgia, serif', '--font-tagline': '"KB Fraunces", Georgia, serif', '--font-script': '"KB Fraunces", Georgia, serif',
  '--r-xl': '1.75rem', '--r-lg': '1.1rem', '--r-md': '0.7rem', '--r-btn': '999px',
};

/** The platform's address from a shop link: anjugu.shop.ke → shop.ke (anjugu.localhost:5173 → localhost:5173). */
export const platformOrigin = () => `${window.location.protocol}//${window.location.host.split('.').slice(1).join('.')}`;

/** The Kabuor Builds lockup: the price-tag K and the name, "Builds" in sapphire indigo. */
export function Wordmark({ name = 'Kabuor Builds', light = false, stacked = false, tagline, className = '' }) {
  const [first, ...rest] = name.split(' ');
  return (
    <span className={`inline-flex items-center whitespace-nowrap ${stacked ? 'gap-4' : 'gap-2.5'} ${className}`}>
      <img src="/brand/mark.svg" alt="" className={stacked ? 'w-20' : 'w-11'} />
      <span className={stacked ? 'block' : 'inline-flex items-baseline gap-1.5'}>
        <span className={`kb-display ${stacked ? 'block text-5xl' : 'text-[1.45rem]'} ${light ? 'text-cream' : 'text-espresso'}`}>
          {first}
          {stacked ? <span className="block text-[#3B82F6]">{rest.join(' ')}</span> : <span className="text-[#3B82F6]"> {rest.join(' ')}</span>}
        </span>
        {stacked && tagline && <span className={`kb-serif mt-2 block text-xl ${light ? 'text-[#BFDBFE]' : 'text-cocoa'}`}>{tagline}</span>}
      </span>
    </span>
  );
}

function useInfo() {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    papi('/info').then(setInfo).catch(() => setInfo(null));
  }, []);
  return info;
}

const tel = (phone) => `tel:${phone.replace(/\s/g, '')}`;
const whatsapp = (phone, text) => `https://wa.me/254${phone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(text)}`;

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
        <button className="btn shrink-0 bg-blue-600 px-5 py-3 text-white shadow-md shadow-blue-500/25 hover:bg-blue-500">
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

function Landing({ info }) {
  const domain = info?.domain ?? 'shop.ke';
  const name = info?.name ?? 'Kabuor Builds';
  const phone = info?.phone;
  return (
    <>
      {/* hero, on ink like the ad */}
      <div className="kb-ink relative overflow-hidden">
        <header className="container-x relative flex items-center justify-between gap-4 py-5">
          <Wordmark name={name} light />
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <a href="#work" className="hidden rounded-full px-3 py-2 text-cream/70 hover:text-cream sm:block">
              Sample work
            </a>
            <a href="#pricing" className="hidden rounded-full px-3 py-2 text-cream/70 hover:text-cream sm:block">
              Pricing
            </a>
            <Link to="/start" className="btn bg-cream px-5 py-2.5 whitespace-nowrap text-espresso hover:bg-white">
              Start<span className="hidden sm:inline"> your shop</span>
            </Link>
          </nav>
        </header>

        <section className="container-x relative grid items-center gap-12 pt-10 pb-20 sm:pt-14 lg:grid-cols-[1.15fr_1fr] lg:pb-28">
          <div>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="kb-kicker text-blue-400">
              Websites for brands
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.05, ease: EASE }} className="kb-display mt-4 text-[3.3rem] sm:text-[5.6rem]">
              Product-first websites <span className="text-[#3B82F6]">that sell.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: EASE }} className="mt-6 max-w-lg text-lg leading-relaxed text-cream/75">
              Your product, your colours, your prices. Customers pick, pay with M-Pesa, done. Get a link like <b className="text-cream">anjugu.{domain}</b> and see your shop before you pay a shilling.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25, ease: EASE }} className="mt-8">
              <ClaimLink domain={domain} dark />
              {info && (
                <p className="mt-1 pl-5 text-sm text-cream/55">
                  From {ksh(info.prices.monthly)} a month · <span className="kb-serif text-base text-blue-200">{info.tagline}</span>
                </p>
              )}
            </motion.div>
          </div>
          {/* three real shop looks, made by the same builder from a colour and a style */}
          {info?.samples && (
            <div className="relative mx-auto h-[30rem] w-full max-w-md sm:h-[34rem]" aria-label="Example shops">
              {info.samples.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, y: 40, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: [-6, 4, -2][i] }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: EASE }}
                  className="absolute w-[82%]"
                  style={{ left: ['0%', '18%', '6%'][i], top: ['0%', '22%', '46%'][i], zIndex: i }}
                >
                  <ShopPreview look={{ ...s.look, eyebrow: { sauce: 'Small-batch sauces', candle: 'Hand-poured candles', honey: 'Pure, raw honey' }[s.look.kind] }} name={s.name} product={s.product} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="bg-white py-16 sm:py-24">
        <div className="container-x">
          <p className="kb-kicker text-caramel">How it works</p>
          <h2 className="kb-display mt-3 text-4xl sm:text-5xl">Live in four steps</h2>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-[var(--r-xl)] bg-cream p-6">
                <span className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold text-espresso/40 tabular-nums">0{i + 1}</span>
                </span>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-espresso/60">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* sample work */}
      <section id="work" className="container-x scroll-mt-6 py-16 sm:py-24">
        <p className="kb-kicker text-caramel">Sample work</p>
        <div className="mt-3 grid items-center gap-10 lg:grid-cols-[1fr_1.25fr]">
          <div>
            <h2 className="kb-display text-4xl sm:text-5xl">Anjugu Peanut Butter</h2>
            <p className="kb-serif mt-2 text-2xl text-cocoa">Love N-ut Home.</p>
            <ul className="mt-6 space-y-2.5">
              {['Real jars, real prices', 'M-Pesa checkout', 'All branches, one shop'].map((x) => (
                <li key={x} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" strokeWidth={3} /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative pb-10">
            <div className="overflow-hidden rounded-[var(--r-lg)] bg-white shadow-[0_40px_80px_-40px_rgba(15,17,21,0.6)] ring-1 ring-espresso/10">
              <div className="flex items-center gap-2 bg-[#EDE7DE] px-4 py-2.5">
                <i className="h-3 w-3 rounded-full bg-[#CFC7BB]" />
                <i className="h-3 w-3 rounded-full bg-[#CFC7BB]" />
                <i className="h-3 w-3 rounded-full bg-[#CFC7BB]" />
                <span className="ml-3 flex-1 rounded-full bg-white px-3 py-0.5 text-xs text-espresso/55">anjugu.co.ke</span>
              </div>
              <img src="/brand/work-anjugu-desk.webp" alt="The Anjugu Peanut Butter website" loading="lazy" className="aspect-[16/10] w-full object-cover object-top" />
            </div>
            <div className="absolute -bottom-6 -left-3 w-[26%] sm:-left-14 overflow-hidden rounded-[1.6rem] border-[6px] border-[#050608] bg-[#050608] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] sm:-left-8">
              <img src="/brand/work-anjugu-shop-phone.webp" alt="The Anjugu shop on a phone" loading="lazy" className="aspect-[9/19] w-full rounded-[1.1rem] object-cover object-top" />
            </div>
          </div>
        </div>
      </section>

      {/* what you get + price */}
      <section id="pricing" className="scroll-mt-6 bg-white py-16 sm:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_26rem] lg:items-center">
          <div>
            <p className="kb-kicker text-caramel">What you get</p>
            <h2 className="kb-display mt-3 text-4xl sm:text-5xl">Built around your product.</h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {INCLUDED.map((x) => (
                <li key={x} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" strokeWidth={3} />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
          {info && (
            <div className="kb-ink relative overflow-hidden rounded-[var(--r-xl)] p-7">
              <p className="relative text-sm font-semibold text-cream/60">Do it yourself, one plan</p>
              <p className="kb-display relative mt-3 text-6xl tabular-nums">
                {ksh(info.prices.monthly)}
                <span className="text-lg font-semibold tracking-normal text-cream/50"> / month</span>
              </p>
              <p className="relative mt-2 text-sm text-cream/60">or {ksh(info.prices.yearly)} a year: two months free</p>
              <ul className="relative mt-6 space-y-2 text-sm text-cream/80">
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-400" strokeWidth={3} /> Pay by M-Pesa prompt, no card needed</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-400" strokeWidth={3} /> Customers pay your own Till or Paybill</li>
              </ul>
              <Link to="/start" className="btn relative mt-7 w-full bg-blue-600 py-3.5 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500">
                Start your shop <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* done for you */}
      {phone && (
        <section className="container-x py-16 sm:py-24">
          <div className="grid gap-8 rounded-[var(--r-xl)] bg-beige p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="kb-kicker text-caramel">Rather we build it?</p>
              <h2 className="kb-display mt-3 text-4xl sm:text-5xl">Want a site like Anjugu’s?</h2>
              <p className="mt-3 max-w-lg text-espresso/65">We design it around your real products and photos, set up M-Pesa and hand you the keys. Talk to us.</p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col">
              <a href={whatsapp(phone, `Hi ${name}, I want a website for my brand.`)} target="_blank" rel="noreferrer" className="btn bg-espresso px-6 py-3.5 text-cream">
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

      <footer className="kb-ink relative overflow-hidden py-14">
        <div className="container-x relative flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div>
            <Wordmark name={name} light stacked tagline={info?.tagline ?? 'Mlete deals.'} />
            {phone && (
              <p className="mt-6 text-sm text-cream/60">
                <a href={tel(phone)} className="font-semibold text-blue-400 hover:underline">{phone}</a> · {info.email}
              </p>
            )}
          </div>
          <ClaimLink domain={domain} dark />
        </div>
      </footer>
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
          {site.link}.{domain} <span className="text-blue-400">is free</span>
        </h1>
        <p className="mt-4 text-cream/65">There’s no shop here yet. If this is your brand’s name, it can be yours in a few minutes.</p>
        <a href={`${platformOrigin()}/start?link=${encodeURIComponent(site.link ?? '')}`} className="btn mt-8 bg-blue-600 px-6 py-3.5 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500">
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
        <Route path="*" element={<Landing info={info} />} />
      </Routes>
    </div>
  );
}
