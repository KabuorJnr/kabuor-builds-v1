import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import {
  ArrowRight, Award, CircleCheck, Flame, Heart, Leaf, Loader2, Mail, MapPin, Package, Phone, Plus, Quote, Smartphone, Sprout, Sun, Truck, Wallet,
} from 'lucide-react';
import ProductJar from './ProductJar';
import { packLabel, titleOf } from './Shop';
import { ApbMark, CountUp, EASE, FloatingPeanut, Logo, Peanut, Reveal, SectionHeading, Stars } from './ui';
import { Tagline } from './LoveNutHome';
import { api } from '../lib/api';
import { byCountry, telHref } from '../lib/branches';
import { cn, money } from '../lib/format';
import { LOOK } from '../lib/brand';

import { platformOrigin } from '../lib/base';

/* ---------------- ticker ---------------- */
export function Marquee({ items }) {
  if (!items.length) return null;
  return (
    <div className="overflow-hidden py-6">
      <div className="-mx-4 -rotate-[1.5deg] bg-espresso py-4 text-cream shadow-[0_20px_40px_-25px_rgba(46,31,20,0.8)] sm:py-5">
        <div className="animate-marquee flex w-max">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
              {[...items, ...items].map((w, i) => (
                <span key={i} className="flex items-center gap-6 px-5 text-lg font-bold tracking-tight whitespace-nowrap sm:gap-8 sm:px-7 sm:text-2xl">
                  {w}
                  <Peanut className="h-5 w-3 rotate-[30deg] sm:h-6 sm:w-4" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- how to order / process ---------------- */
const STEP_ICONS = { package: Package, wallet: Wallet, phone: Phone, truck: Truck, map: MapPin, check: CircleCheck, heart: Heart, leaf: Leaf, sprout: Sprout, sun: Sun, flame: Flame, award: Award };
const STEP_COLS = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6' };

export function Process({ data }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const steps = data.steps;
  const edge = `${50 / Math.max(steps.length, 1)}%`;
  if (!steps.length) return null;

  return (
    <section id="process" className="scroll-mt-16 py-16 sm:py-24">
      <div className="container-x">
        <div className="grain relative overflow-hidden rounded-[var(--r-xl)] bg-beige px-5 py-14 sm:rounded-[var(--r-xl)] sm:px-12 sm:py-20 lg:px-16">
          <div className="bg-dots absolute inset-0 opacity-60" style={{ maskImage: 'linear-gradient(to bottom, black, transparent 70%)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 70%)' }} />
          <div className="relative">
            <SectionHeading eyebrow={data.eyebrow} title={data.title} align="center">
              {data.text}
            </SectionHeading>

            <div ref={ref} className={cn('relative mt-14 grid gap-10 pl-16 lg:mt-20 lg:gap-8 lg:pl-0', STEP_COLS[steps.length])}>
              <div className="absolute top-0 bottom-0 left-7 w-0.5 rounded bg-espresso/10 lg:hidden" />
              <div className="absolute top-7 hidden h-0.5 rounded bg-espresso/10 lg:block" style={{ left: edge, right: edge }} />
              <motion.div style={{ scaleY: progress }} className="absolute top-0 bottom-0 left-7 w-0.5 origin-top rounded bg-gradient-to-b from-honey to-amber lg:hidden" />
              <motion.div style={{ scaleX: progress, left: edge, right: edge }} className="absolute top-7 hidden h-0.5 origin-left rounded bg-gradient-to-r from-honey to-amber lg:block" />

              {steps.map((s, i) => {
                const Icon = STEP_ICONS[s.icon] ?? Package;
                return (
                  <Reveal key={`${s.title}-${i}`} delay={i * 0.1} className="relative lg:text-center">
                    <div className="absolute top-0 -left-16 lg:static lg:mx-auto lg:w-fit">
                      <motion.div
                        whileInView={{ scale: [0.6, 1.1, 1], rotate: [0, -8, 0] }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.15 }}
                        className="relative grid h-14 w-14 place-items-center rounded-[var(--r-lg)] bg-espresso text-honey shadow-[0_12px_30px_-12px_rgba(46,31,20,0.7)]"
                      >
                        <Icon className="h-6 w-6" strokeWidth={1.8} />
                        <span className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-honey text-[11px] font-extrabold text-espresso ring-4 ring-beige">
                          {i + 1}
                        </span>
                      </motion.div>
                    </div>
                    <h3 className="text-xl font-extrabold tracking-tight lg:mt-6">{s.title}</h3>
                    <p className="mt-2 leading-relaxed text-espresso/60 lg:mx-auto lg:max-w-[16rem]">{s.text}</p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- about / story ---------------- */
function JarArt({ product }) {
  const nuts = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg">
      <div className="absolute inset-[2%]" style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-honey) 28%, transparent), transparent)' }} />
      <div className="animate-spin-slow absolute inset-[4%] rounded-full border border-dashed border-honey/30" />
      <div className="animate-orbit absolute inset-0">
        {nuts.map((i) => {
          const a = (i / nuts.length) * Math.PI * 2;
          return (
            <motion.div
              key={i}
              className="absolute w-[8%] -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${50 + 42 * Math.cos(a)}%`, top: `${50 + 42 * Math.sin(a)}%` }}
              initial={{ scale: 0, rotate: -120 }}
              whileInView={{ scale: 1, rotate: (i * 47) % 360 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.2 + i * 0.06 }}
            >
              <Peanut className="w-full drop-shadow-[0_8px_10px_rgba(0,0,0,0.35)]" />
            </motion.div>
          );
        })}
      </div>
      {product && (
        <motion.div
          className="absolute inset-x-[20%] top-[16%]"
          initial={{ y: 60, opacity: 0, rotate: -6 }}
          whileInView={{ y: 0, opacity: 1, rotate: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <div className="animate-float" style={{ '--float': '-12px' }}>
            <ProductJar look={product.look} price={product.price} size={product.size} className="group w-full" />
          </div>
        </motion.div>
      )}
      <FloatingPeanut className="top-[12%] right-[14%]" size="w-6" path={[[0, 0], [-30, 20], [-10, 50], [20, 20], [0, 0]]} duration={10} />
    </div>
  );
}

// The story gets the brand's own photos (making-of first) when it has them, the drawn jar otherwise.
function StoryArt({ product }) {
  const shots = LOOK.photos ?? [];
  const main = shots.find((s) => s.includes('process-1')) ?? shots.find((s) => s.includes('hero-2')) ?? product?.look?.photo;
  const inset = [product?.look?.photo, shots.find((s) => s.includes('process-2'))].find((s) => s && s !== main);
  if (!main) return <JarArt product={product} />;
  return (
    <div className="relative mx-auto w-full max-w-lg pb-[10%]">
      <div className="animate-spin-slow absolute -inset-[6%] rounded-full border border-dashed border-honey/30" />
      <motion.div
        initial={{ y: 60, opacity: 0, rotate: -6 }}
        whileInView={{ y: 0, opacity: 1, rotate: -2 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.1, ease: EASE }}
        className="paper-ink relative ml-auto w-[82%] overflow-hidden rounded-[var(--r-xl)] bg-white p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]"
      >
        <img src={main} alt={`${LOOK.name}: how it is made`} loading="lazy" className="aspect-[4/5] w-full rounded-[max(0px,calc(var(--r-xl)-8px))] object-cover" />
      </motion.div>
      {inset && (
        <motion.div
          initial={{ y: 60, opacity: 0, rotate: 2 }}
          whileInView={{ y: 0, opacity: 1, rotate: 5 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
          className="paper-ink absolute bottom-0 left-0 w-[42%] overflow-hidden rounded-[var(--r-lg)] bg-white p-1.5 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.6)]"
        >
          <img src={inset} alt={product?.name ?? LOOK.name} loading="lazy" className="aspect-[4/5] w-full rounded-[max(0px,calc(var(--r-lg)-6px))] object-cover" />
        </motion.div>
      )}
    </div>
  );
}

export function Story({ data, products = [] }) {
  return (
    <section id="story" className="relative scroll-mt-16 overflow-hidden bg-espresso py-20 text-cream sm:py-28">
      <div className="bg-dots-light absolute inset-0 opacity-50" />
      <div className="absolute -top-56 -left-56 h-[40rem] w-[40rem]" style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-amber) 22%, transparent), transparent)' }} />
      <div className="container-x relative grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading light eyebrow={data.eyebrow} title={data.title}>
            {data.text}
          </SectionHeading>
          {data.quote && (
            <Reveal delay={0.15}>
              <figure className="mt-8 rounded-[var(--r-xl)] border border-cream/10 bg-cream/[0.04] p-6 backdrop-blur-sm">
                <Quote className="h-6 w-6 text-honey" />
                <blockquote className="mt-3 text-lg leading-relaxed font-medium text-cream/90">“{data.quote}”</blockquote>
                {data.quoteBy && <figcaption className="mt-3 text-sm text-cream/50">{data.quoteBy}</figcaption>}
              </figure>
            </Reveal>
          )}
          {data.stats.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8">
              {data.stats.map((s, i) => (
                <Reveal key={`${s.label}-${i}`} delay={0.1 + i * 0.07}>
                  <div className="text-4xl font-extrabold tracking-tight text-honey sm:text-5xl">
                    <CountUp to={s.value} />
                    {s.suffix}
                  </div>
                  <div className="mt-1 text-sm text-cream/55">{s.label}</div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
        <StoryArt product={products.find((p) => p.id === data.featured) ?? products[products.length - 1]} />
      </div>
    </section>
  );
}

/* ---------------- reviews ---------------- */
function ReviewCard({ r, i }) {
  const colors = ['var(--color-honey)', 'var(--color-caramel)', 'var(--color-cocoa)', 'var(--color-latte)'];
  return (
    <figure className="w-[290px] shrink-0 rounded-[var(--r-xl)] bg-white p-6 shadow-[0_10px_30px_-20px_rgba(46,31,20,0.35)] ring-1 ring-espresso/[0.06] sm:w-[360px]">
      <Stars value={5} />
      <blockquote className="mt-4 leading-relaxed text-espresso/80">“{r.text}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-cream" style={{ background: colors[i % colors.length] }}>
          {r.name[0]}
        </span>
        <span className="text-sm leading-tight">
          <b className="block">{r.name}</b>
          <span className="text-espresso/50">{r.city}</span>
        </span>
        {r.product && <span className="ml-auto rounded-full bg-beige px-2.5 py-1 text-[11px] font-semibold text-caramel">{r.product}</span>}
      </figcaption>
    </figure>
  );
}

export function Testimonials({ data }) {
  const items = data.items;
  const rows = items.length > 4 ? [items.slice(0, Math.ceil(items.length / 2)), items.slice(Math.ceil(items.length / 2))] : [items];
  return (
    <section id="reviews" className="scroll-mt-16 overflow-hidden py-20 sm:py-28">
      <div className="container-x">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} align="center">
          {data.rating && (
            <span className="inline-flex flex-wrap items-center justify-center gap-2">
              <Stars value={5} className="h-4 w-4" /> <b className="text-espresso">{data.rating}</b> {data.ratingText}
            </span>
          )}
        </SectionHeading>
      </div>
      <div
        className="mt-12 space-y-4 sm:space-y-5"
        style={{ maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)' }}
      >
        {rows.map((row, ri) => (
          <div key={ri} className={cn('flex w-max gap-4 hover:[animation-play-state:paused] sm:gap-5', ri ? 'animate-marquee-reverse' : 'animate-marquee')}>
            {[...row, ...row, ...row, ...row].map((r, i) => (
              <ReviewCard key={i} r={r} i={i + ri} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- faq ---------------- */
export function Faq({ data, brand }) {
  const [open, setOpen] = useState(0);
  if (!data.items.length) return null;

  return (
    <section id="faq" className="scroll-mt-16 py-16 sm:py-24">
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow={data.eyebrow} title={data.title}>
            {data.text}
          </SectionHeading>
          <Reveal delay={0.15} className="mt-8 grid grid-cols-2 gap-2 text-sm sm:max-w-md">
            {byCountry(brand.branches).flatMap((g, _, all) => [
              all.length > 1 && (
                <p key={`c-${g.country}`} className="col-span-2 mt-2 font-hand text-lg text-caramel first:mt-0">
                  {g.country}
                </p>
              ),
              ...g.branches.map((b) => (
              <a key={b.city} href={telHref(b.phone)} className="group rounded-[var(--r-lg)] bg-white px-4 py-3 ring-1 ring-espresso/[0.06] transition hover:ring-amber/50">
                <span className="flex items-center justify-between font-bold">
                  {b.city}
                  {b.note && <span className="rounded-full bg-honey/20 px-2 py-0.5 text-[10px] font-bold text-caramel">{b.note}</span>}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-espresso/60 group-hover:text-caramel">
                  <Phone className="h-3.5 w-3.5" /> {b.phone}
                </span>
              </a>
              )),
            ])}
            {brand.email && (
              <a href={`mailto:${brand.email}`} className="col-span-2 flex items-center gap-2 rounded-[var(--r-lg)] bg-white px-4 py-3 font-semibold ring-1 ring-espresso/[0.06] hover:text-caramel">
                <Mail className="h-4 w-4" /> {brand.email}
              </a>
            )}
          </Reveal>
        </div>
        <div className="divide-y divide-espresso/10 border-y border-espresso/10">
          {data.items.map(({ q, a }, i) => (
            <Reveal key={`${q}-${i}`} delay={i * 0.05}>
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left sm:py-6" aria-expanded={open === i}>
                <span className="text-base font-bold sm:text-lg">{q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors', open === i ? 'bg-espresso text-honey' : 'bg-beige')}
                >
                  <Plus className="h-4 w-4" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
                    <p className="max-w-xl pb-6 leading-relaxed text-espresso/60">{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- newsletter ---------------- */
const DRIPS = [
  [60, 14, 40], [150, 22, 70], [240, 12, 30], [330, 18, 55], [430, 26, 90], [520, 14, 38],
  [610, 20, 64], [700, 12, 28], [790, 24, 82], [890, 16, 46], [980, 20, 60], [1070, 14, 34], [1150, 18, 52],
];

export function JoinClub({ data }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', error: null });

  const submit = async (e) => {
    e.preventDefault();
    setState({ status: 'loading', error: null });
    try {
      await api('/subscribe', { method: 'POST', body: { email } });
      setState({ status: 'done', error: null });
    } catch (err) {
      setState({ status: 'idle', error: err.message });
    }
  };

  return (
    <section className="py-10 sm:py-16">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[var(--r-xl)] bg-espresso px-6 pt-24 pb-14 text-center text-cream sm:rounded-[var(--r-xl)] sm:px-12 sm:pt-32 sm:pb-20">
          {/* brand colour dripping over the edge */}
          <svg viewBox="0 0 1200 140" className="absolute inset-x-0 top-0 w-full" aria-hidden>
            <defs>
              <linearGradient id="drip-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: 'var(--color-honey)' }} />
                <stop offset="1" style={{ stopColor: 'var(--color-amber)' }} />
              </linearGradient>
            </defs>
            <path d="M0 0H1200V20Q900 34 600 22T0 24Z" fill="url(#drip-g)" />
            {DRIPS.map(([x, w, h], i) => (
              <motion.rect
                key={x}
                x={x - w / 2}
                y="10"
                width={w}
                rx={w / 2}
                fill="url(#drip-g)"
                initial={{ height: h * 0.35 }}
                whileInView={{ height: h }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: EASE, delay: i * 0.08 }}
              />
            ))}
          </svg>
          <div className="bg-dots-light absolute inset-0 opacity-40" />
          <div className="relative">
            <SectionHeading light eyebrow={data.eyebrow} title={data.title} align="center">
              {data.text}
            </SectionHeading>
            <Reveal delay={0.15} className="mx-auto mt-8 max-w-md">
              <AnimatePresence mode="wait">
                {state.status === 'done' ? (
                  <motion.p key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-full bg-honey/15 px-6 py-4 font-semibold text-honey">
                    {data.success || 'Thanks for subscribing!'}
                  </motion.p>
                ) : (
                  <motion.form key="form" onSubmit={submit} exit={{ opacity: 0 }} className="flex flex-col gap-2 rounded-[var(--r-xl)] bg-cream/[0.06] p-1.5 ring-1 ring-cream/15 sm:flex-row sm:rounded-full">
                    <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                    <input
                      id="newsletter-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="min-w-0 flex-1 rounded-full bg-transparent px-5 py-3.5 text-cream outline-none placeholder:text-cream/35"
                    />
                    <button className="btn btn-honey" disabled={state.status === 'loading'}>
                      {state.status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{data.button || 'Subscribe'} <ArrowRight className="h-4 w-4" /></>}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
              {state.error && <p className="mt-3 text-sm text-red-300">{state.error}</p>}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- footer ---------------- */
export function Footer({ content, config, products = [], links = [] }) {
  const { brand, footer } = content;
  const heading = 'text-xs font-semibold tracking-[0.18em] text-cream/40 uppercase';
  return (
    <footer className="site-footer mt-10 bg-bark pt-16 pb-32 text-cream lg:pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="container-x">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div className="col-span-2 lg:col-span-1">
            <Logo light />
            {brand.tagline && (
              <p className="mt-4">
                <Tagline text={brand.tagline} className="h-8" color="var(--color-honey)" textClassName="text-2xl text-honey" />
              </p>
            )}
            {footer.blurb && <p className="mt-2 max-w-xs text-sm leading-relaxed text-cream/55">{footer.blurb}</p>}
          </div>
          <div>
            <h4 className={heading}>Products</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {products.map((p) => (
                <li key={p.id}>
                  <Link to={`/products/${p.id}`} className="flex justify-between gap-3 text-cream/70 transition hover:text-honey sm:max-w-[11rem]">
                    <span>{titleOf(p, products)}</span>
                    <span className="text-cream/45">{money(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className={heading}>Explore</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {links.map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="text-cream/70 transition hover:text-honey">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 space-y-6 lg:col-span-1">
            {byCountry(brand.branches).map((g, i, all) => (
              <div key={g.country}>
                <h4 className={heading}>{all.length > 1 ? `Branches · ${g.country}` : 'Branches'}</h4>
                <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                  {g.branches.map((b) => (
                    <li key={b.city}>
                      <a href={telHref(b.phone)} className="block text-cream/70 transition hover:text-honey">
                        <span className="font-semibold text-cream">{b.city}</span>
                        <span className="block">{b.phone}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {config?.paybill?.business && (
              <div className="flex items-start gap-3 rounded-[var(--r-lg)] bg-cream/[0.05] p-4 ring-1 ring-cream/10">
                <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-honey" />
                <p className="text-sm text-cream/70">
                  <b className="block text-cream">{config.paybill.kind === 'till' ? 'M-Pesa Buy Goods' : 'M-Pesa Paybill'}</b>
                  {config.paybill.kind === 'till' ? 'Till no.' : 'Business no.'} <b className="text-honey">{config.paybill.business}</b>
                  {config.paybill.account && (
                    <>
                      {' '}· Acc. no. <b className="text-honey">{config.paybill.account}</b>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-cream/10 pt-6 text-xs text-cream/40 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <ApbMark className="h-6 w-12" />
            <p>
              © {new Date().getFullYear()} {brand.name}. {footer.smallPrint}
            </p>
          </div>
          <span className="flex items-center gap-4">
            {/* Every shop on the platform links back to its builder. */}
            {LOOK.platform && (
              <a href={platformOrigin()} className="text-cream/40 transition hover:text-honey">
                Website by {LOOK.platform.name}
              </a>
            )}
            <Link to="/admin" className="text-cream/40 transition hover:text-honey">
              Staff login
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
