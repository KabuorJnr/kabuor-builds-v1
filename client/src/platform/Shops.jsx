// Kabuor Shops' product page (/shops, and the home page of builds.…). The visitor is a brand owner deciding "will
// this sell my products, what does it cost, and how hard is it?". So, in the corporate layout every Kabuor page
// shares (Corporate.jsx): claim your link right away, the four steps, the styles, real work, what you get and the
// one price, questions, and a person who'll build it for you.
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Check, ChevronRight, Eye, Mail, MessageCircle, Palette, Phone, Plus, Store, Wallet } from 'lucide-react';
import { cn } from '../lib/format';
import { family, loadFonts } from '../lib/fonts';
import { linkLabel, linkParts } from '../lib/base';
import { ksh, papi } from './shared';
import { tel, whatsapp } from './Site';
import { BrowserShot, CorporatePage, PhoneShot, SectionHead } from './Corporate';

const STEPS = [
  { icon: Store, title: 'Tell us about your brand', text: 'Your name, what you sell, and the link you want.' },
  { icon: Palette, title: 'Make it yours', text: 'Upload your logo and photos and pick from 10 styles. Your shop takes their colours.' },
  { icon: Eye, title: 'See it first', text: 'Add your products and walk through your real shop, on a phone and a computer.' },
  { icon: Wallet, title: 'Pay and go live', text: 'Happy with it? Pay by M-Pesa prompt and your link is live straight away.' },
];
const SHOWCASE_SHOPS = [
  {
    id: 'purelix',
    name: 'Purelix Botanical Wellness',
    category: 'Botanical & Wellness',
    tag: '100% Vegan · Sunlit Ochre Aesthetic',
    accent: '#C89B59',
    headline: 'Plant-based supplements that enhance health',
    desc: 'Warm sunlit studio editorial aesthetics featuring stone still-life presentation, 100% vegan certification cards, cold-pressed botanical formulations, and instant M-Pesa one-touch checkout.',
    features: [
      'Architectural typography and warm sunlit studio palette',
      'Botanical formulations catalog with vegan & organic filters',
      'Interactive product detail modal with bioactive ingredients breakdown',
      'Express M-Pesa STK checkout with free delivery progress bar',
    ],
    address: 'purelix.shop.ke',
    img: '/brand/purelix/purelix_hero_full.png',
    kind: 'sauce',
    demoPath: '/demo/purelix',
  },
  {
    id: 'styleco',
    name: 'Styleco. Modern Apparel',
    category: 'Fashion & Apparel',
    tag: 'Minimalist Fashion · Dual Price & Swatches',
    accent: '#1E1E1E',
    headline: 'Clean minimalist fashion megastore',
    desc: 'Organized product listings with real-time sidebar filters (Category accordion, dual price slider $100-$2000, 12-color swatches), 3-column product grid with favorites and quick bag add, and detailed PDP with size picker.',
    features: [
      'Organized category accordion & dual price range slider ($100 - $2000)',
      '12-color swatch grid with real-time product filtering',
      'Product Details Page (PDP) with S-XXL size selector & material specs',
      'Slide-over shopping bag with instant M-Pesa phone prompt checkout',
    ],
    address: 'styleco.shop.ke',
    img: '/brand/styleco/styleco_plp_full.png',
    kind: 'fashion',
    demoPath: '/demo/styleco',
  },
  {
    id: 'groceries',
    name: 'Gromuse Fresh Mart',
    category: 'Supermarket & Groceries',
    tag: '15-min delivery · Live steppers',
    accent: '#107C41',
    headline: 'Fresh supermarket & farm groceries, online',
    desc: 'From fresh organic farm produce to pantry goods. Features interactive 1-tap quantity steppers (-) [qty] (+), express 15-minute delivery banners, category carousels, and instant M-Pesa order placement.',
    features: ['15-minute express delivery badge & promise', '1-tap quantity steppers with live cart total', 'Category carousels (Vegetables, Fruits, Dairy, Snacks)', 'Full multi-image product detail view with flash timers'],
    address: 'gromuse.shop.ke',
    video: 'https://cdn.dribbble.com/userupload/10640472/file/original-c81c56245856e105c75424cf9a958366.mp4',
    img: '/brand/work-gromuse-desk.png',
    kind: 'groceries',
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
    subImg: '/brand/work-nuvio-full.png',
    kind: 'electronics',
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
    kind: 'furniture',
  },
  {
    id: 'sauce',
    name: 'Anjugu Peanut Butter',
    category: 'Artisanal Brands',
    tag: 'Artisanal · Multi-Branch',
    accent: '#D9381E',
    headline: 'A peanut butter brand, online',
    desc: 'Pure, creamy peanut butter with no additives. Five sizes from 250g to 1kg, multi-branch pickup across Nairobi, Mombasa, Kisumu & Rodi, and instant M-Pesa checkout.',
    features: ['Real jars with live size selector', 'Multiple branches across Kenya', 'Direct M-Pesa Till integration', 'Zero sales commissions'],
    address: 'anjugu.shop.ke',
    img: '/brand/work-anjugu-desk.webp',
    phoneImg: '/brand/work-anjugu-shop-phone.webp',
    kind: 'sauce',
  },
];
const INCLUDED = ['Your colours, fonts and real photos', 'M-Pesa checkout and receipts', 'Admin: orders, stock, SMS alerts', 'Fast on every phone', 'Your own shop link to share', 'No commission on your sales'];
const FACTS = [
  ['Live the same day', 'Sign up, design, preview, pay. No developer.'],
  ['Paid with M-Pesa', 'Your plan, and your customers’ orders.'],
  ['KSh 0 commission', 'Every shilling customers pay goes to you.'],
];
const faqs = (phone) => [
  ['Do I need to buy a domain?', `No. Your shop gets its own link, like ${linkLabel('yourbrand')}, included in the plan.`],
  ['Who receives my customers’ money?', 'You do. Customers pay straight to your own M-Pesa Till or Paybill. We never hold your money and take no commission.'],
  ['Can customers pay with an M-Pesa prompt?', 'Yes. Connect your Daraja keys in your admin and customers get the PIN prompt at checkout. Until then, checkout shows your Till or Paybill number.'],
  ['I don’t have professional photos. Is that a problem?', 'No. Use clear phone photos of your products. Products without a photo show a clean drawing of their packaging until you add one.'],
  ['Can I change the look later?', 'Any time. Your admin has the same 10 styles, colours and photos, and changes go live when you save.'],
  ['What happens if I stop paying?', 'Your shop pauses three days after the plan ends. Nothing is deleted: renew from your admin and it reopens with all your products and orders.'],
  ['Can you build it for me instead?', phone ? `Yes. Call or WhatsApp ${phone} and we’ll design it around your products and set up M-Pesa for you.` : 'Yes. Get in touch and we’ll set it up for you.'],
];

/** "[ your-business ]" inside the real shape of a shop link, with a live availability check; continues to signup. */
function ClaimLink() {
  const { before, after } = linkParts();
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
      <label htmlFor="claim-link" className="mb-1.5 block text-sm font-semibold">
        Your shop link
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <span className="flex min-w-0 flex-1 items-center rounded border border-[#8a8886] bg-white px-3 focus-within:border-[var(--ms-blue)] focus-within:shadow-[0_0_0_1px_var(--ms-blue)]">
          {before && <span className="hidden shrink-0 text-[var(--ms-muted)] sm:inline">{before}</span>}
          <input
            id="claim-link"
            value={link}
            onChange={(e) => setLink(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30))}
            placeholder="yourbrand"
            className="w-0 min-w-0 flex-1 bg-transparent py-2.5 font-semibold outline-none placeholder:font-normal placeholder:text-[#a19f9d]"
          />
          {after && <span className="shrink-0 text-[var(--ms-muted)]">{after}</span>}
        </span>
        <button className="ms-btn ms-btn-primary shrink-0">Claim it</button>
      </div>
      <p className="mt-2 h-5 text-sm text-[var(--ms-muted)]" aria-live="polite">
        {check && (check.available ? <span className="font-semibold text-[#0F7A3D]">✓ {linkLabel(check.link)} is free</span> : <>{check.problem} {check.suggestions[0] && <>Try <b>{check.suggestions[0]}</b>.</>}</>)}
      </p>
    </form>
  );
}

/** The 10 styles as small specimens, each in its own fonts, light or dark. */
function StyleStrip({ styles }) {
  useEffect(() => {
    styles.forEach((s) => loadFonts({ ...s.fonts, body: s.body }));
  }, [styles]);
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
      {styles.map((s) => (
        <div key={s.id} className={cn('w-40 shrink-0 snap-start rounded-lg border p-4 sm:w-auto', s.mode === 'dark' ? 'border-[#1b1b1b] bg-[#1b1b1b] text-white' : 'border-[var(--ms-line)] bg-white')}>
          <span className="block text-3xl leading-none" style={{ fontFamily: `"${family(s.fonts.brand)}"` }}>
            Aa
          </span>
          <span className={cn('mt-1 block text-lg leading-none', s.mode === 'dark' ? 'text-white/70' : 'text-[var(--ms-muted)]')} style={{ fontFamily: `"${family(s.fonts.tagline)}"` }}>
            handmade
          </span>
          <span className="mt-3 block text-sm font-semibold">{s.label}</span>
          <span className={cn('mt-0.5 block text-xs leading-snug', s.mode === 'dark' ? 'text-white/60' : 'text-[var(--ms-muted)]')}>{s.note}</span>
        </div>
      ))}
    </div>
  );
}

export default function Shops({ info }) {
  const [activeShopId, setActiveShopId] = useState('groceries');
  const activeShop = SHOWCASE_SHOPS.find((s) => s.id === activeShopId) ?? SHOWCASE_SHOPS[0];
  useEffect(() => {
    document.title = 'Kabuor Shops · Online shops for Kenyan brands';
  }, []);
  const phone = info?.phone;

  return (
    <CorporatePage cta={{ href: '/start', label: 'Start your shop' }}>
      {/* Hero: claim a link right here, which is the first step anyway. */}
      <section className="border-b border-[var(--ms-line)] bg-[#F5F7FC]">
        <div className="container-x grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div>
            <p className="text-sm font-semibold text-[var(--ms-blue)]">Kabuor Shops · Available now</p>
            <h1 className="mt-3 text-[2.25rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl">Your own online shop, paid by M-Pesa</h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-[var(--ms-muted)]">Your products, your colours, your prices. Customers pick, pay with M-Pesa, done. See your shop before you pay a shilling.</p>
            <div className="mt-8">
              <ClaimLink />
              {info && <p className="text-sm text-[var(--ms-muted)]">From {ksh(info.prices.monthly)} a month. No commission on your sales.</p>}
            </div>
          </div>
          {/* A real shop made on Kabuor Shops, on a computer and a phone. */}
          <div className="relative mx-auto w-full max-w-xl sm:pr-[14%] sm:pb-8">
            <BrowserShot src="/brand/work-anjugu-desk.webp" alt="A peanut butter shop built with Kabuor" address="A shop we built" />
            <PhoneShot src="/brand/work-anjugu-shop-phone.webp" alt="The same shop on a phone" className="absolute right-0 bottom-0 hidden w-[28%] sm:block" />
          </div>
        </div>
        <div className="border-t border-[var(--ms-line)] bg-white">
          <ul className="container-x grid gap-4 py-6 sm:grid-cols-3">
            {FACTS.map(([title, text]) => (
              <li key={title} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ms-blue)]" strokeWidth={2.5} />
                <span>
                  <b className="block font-semibold">{title}</b>
                  <span className="text-sm text-[var(--ms-muted)]">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="how" aria-labelledby="how-title" className="scroll-mt-20 py-10 sm:py-12">
        <div className="container-x">
          <SectionHead id="how-title" title="Live in four steps" text="From your brand’s name to taking orders, in one sitting." />
          <ol className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t-2 border-[var(--ms-ink)] pt-5">
                <p className="text-sm font-semibold text-[var(--ms-muted)]">Step {i + 1}</p>
                <s.icon className="mt-3 h-6 w-6 text-[var(--ms-blue)]" strokeWidth={1.75} />
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-[0.9375rem] leading-relaxed text-[var(--ms-muted)]">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {info?.styles?.length > 0 && (
        <section aria-labelledby="styles-title" className="border-y border-[var(--ms-line)] bg-[var(--ms-soft)] py-10 sm:py-12">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHead id="styles-title" title={`${info.styles.length} styles, your colours`} text="Pick a style; the colours come from your own logo and product photos. Switch any time, even after you go live." />
              <Link to="/start" className="ms-link">
                Try them on your brand <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8">
              <StyleStrip styles={info.styles} />
            </div>
          </div>
        </section>
      )}

      {/* Real work: Multi-Category Showcase */}
      <section id="work" aria-labelledby="work-title" className="scroll-mt-20 py-12 sm:py-16">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--ms-line)] pb-8">
            <div>
              <p className="text-sm font-semibold text-[var(--ms-blue)]">What we build</p>
              <h2 id="work-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Shops built for what you sell
              </h2>
              <p className="mt-2 max-w-xl text-lg text-[var(--ms-muted)]">
                Whether you sell farm produce, electronics, designer furniture or handmade jars — your shop is designed specifically for how your customers buy.
              </p>
            </div>
            {/* Store category pills */}
            <div className="flex flex-wrap gap-2">
              {SHOWCASE_SHOPS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveShopId(s.id)}
                  type="button"
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition cursor-pointer',
                    activeShopId === s.id
                      ? 'bg-[var(--ms-blue)] text-white shadow-sm'
                      : 'border border-[var(--ms-line)] bg-white text-[var(--ms-ink)] hover:bg-[#F5F7FC]'
                  )}
                >
                  {s.category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div className="relative">
              {activeShop.video ? (
                <div className="overflow-hidden rounded-xl border border-[var(--ms-line)] bg-black shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center gap-1.5 border-b border-white/10 bg-[#1A1A1A] px-3.5 py-2.5">
                    <i className="h-2.5 w-2.5 rounded-full bg-[#555]" />
                    <i className="h-2.5 w-2.5 rounded-full bg-[#555]" />
                    <i className="h-2.5 w-2.5 rounded-full bg-[#555]" />
                    <span className="ml-2 rounded bg-white/10 px-2 py-0.5 text-xs text-white/70 font-mono">{activeShop.address}</span>
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#107C41]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#16A34A]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" /> Live Store Preview
                    </span>
                  </div>
                  <video
                    src={activeShop.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="aspect-[16/10] w-full object-cover object-top"
                  />
                </div>
              ) : (
                <div className="relative sm:pr-[12%] sm:pb-6">
                  <BrowserShot src={activeShop.img} alt={activeShop.headline} address={activeShop.address} />
                  {activeShop.phoneImg && (
                    <PhoneShot src={activeShop.phoneImg} alt="Shop on phone" className="absolute right-0 bottom-0 hidden w-[26%] sm:block" />
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: activeShop.accent + "15", color: activeShop.accent }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: activeShop.accent }} />
                {activeShop.tag}
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                {activeShop.headline}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--ms-muted)] sm:text-lg">
                {activeShop.desc}
              </p>
              <ul className="mt-6 space-y-2.5">
                {activeShop.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm sm:text-base">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0F7A3D]" strokeWidth={2.5} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-4">
                {activeShop.demoPath && (
                  <Link to={activeShop.demoPath} className="ms-btn bg-[#1A1A1A] text-white hover:bg-black shadow-md">
                    Launch Interactive Store ↗
                  </Link>
                )}
                <Link to={`/start?kind=${activeShop.kind}`} className="ms-btn ms-btn-primary">
                  Build a {activeShop.category.split(' ')[0]} shop
                </Link>
                <a href="#how" className="ms-link flex items-center gap-1 text-sm">
                  See how it works <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you get and the price */}
      <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 border-y border-[var(--ms-line)] bg-[var(--ms-soft)] py-10 sm:py-12">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_26rem] lg:items-center">
          <div>
            <SectionHead id="pricing-title" title="Everything a shop needs, one price" />
            <ul className="mt-6 grid gap-x-6 sm:grid-cols-2">
              {INCLUDED.map((x) => (
                <li key={x} className="flex gap-2 border-b border-[#d6d6d6] py-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ms-blue)]" strokeWidth={2.5} />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          {info && (
            <div className="rounded-lg border-2 border-[var(--ms-blue)] bg-white p-7">
              <p className="text-sm font-semibold text-[var(--ms-muted)]">Do it yourself, one plan</p>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
                <span className="text-4xl font-semibold whitespace-nowrap tabular-nums">{ksh(info.prices.monthly)}</span>
                <span className="text-[var(--ms-muted)]">a month</span>
              </p>
              <p className="mt-1 text-sm text-[var(--ms-muted)]">or {ksh(info.prices.yearly)} a year: two months free</p>
              <ul className="mt-5 space-y-2 border-t border-[var(--ms-line)] pt-5 text-[0.9375rem]">
                {['See your shop before you pay', 'Pay by M-Pesa prompt, no card needed', 'Customers pay your own Till or Paybill'].map((x) => (
                  <li key={x} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0F7A3D]" strokeWidth={2.5} /> {x}
                  </li>
                ))}
              </ul>
              <Link to="/start" className="ms-btn ms-btn-primary mt-6 w-full">
                Start your shop
              </Link>
              <p className="mt-3 text-center text-sm text-[var(--ms-muted)]">
                <Link to="/shops/terms" className="hover:underline">Terms</Link> · <Link to="/shops/privacy" className="hover:underline">Privacy</Link>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Questions */}
      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 py-10 sm:py-12">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <SectionHead id="faq-title" title="Frequently asked questions" text={`Anything else? WhatsApp us${phone ? ` on ${phone}` : ''}.`} />
          <div className="divide-y divide-[var(--ms-line)] border-y border-[var(--ms-line)]">
            {faqs(phone).map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <Plus className="h-5 w-5 shrink-0 text-[var(--ms-muted)] transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-2 max-w-2xl leading-relaxed text-[var(--ms-muted)]">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Done for you */}
      {phone && (
        <section aria-labelledby="built-for-you" className="bg-[var(--ms-ink)] py-10 text-white sm:py-12">
          <div className="container-x flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 id="built-for-you" className="text-2xl font-semibold sm:text-3xl">
                Rather we build it for you?
              </h2>
              <p className="mt-2 max-w-lg text-white/75">We design it around your real products and photos, set up M-Pesa and hand you the keys.</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <a href={whatsapp(phone, 'Hi Kabuor Technologies, I want an online shop for my brand.')} target="_blank" rel="noreferrer" className="ms-btn bg-white text-[var(--ms-ink)] hover:bg-[#e6e6e6]">
                <MessageCircle className="h-4 w-4" /> WhatsApp {phone}
              </a>
              <a href={tel(phone)} className="ms-btn border border-white/60 text-white hover:bg-white/10">
                <Phone className="h-4 w-4" /> Call
              </a>
              {info?.email && (
                <a href={`mailto:${info.email}`} className="ms-btn border border-white/60 text-white hover:bg-white/10">
                  <Mail className="h-4 w-4" /> Email
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </CorporatePage>
  );
}



