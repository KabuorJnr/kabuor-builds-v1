// The category templates a shop can choose (server/src/platform/presets.js, STYLES): Living for furniture,
// Tech for electronics, Botanical for wellness, Grocer for supermarkets and Fashion for clothing. Each brings its own home-page banner
// and its own product card, and runs on the shop's real products, cart and M-Pesa checkout like every design.
// Colours come from the shop's palette (amber is the accent, espresso the text, cream the page), so a shop that
// picks the template with its own colours still looks like itself. Text on the accent is literal #fff: on dark
// shops the palette's "white" is the dark card colour.
import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check, Minus, Plus, ShieldCheck, Smartphone, Truck } from 'lucide-react';
import ProductJar from './ProductJar';
import { EASE } from './ui';
import { LOOK } from '../lib/brand';
import { cn, money } from '../lib/format';
import { useCart } from '../store/cart';

/** The product's photo, or its drawn packaging when there's no photo yet. */
function Pic({ product, className, contain }) {
  if (product.look?.photo) {
    return <img src={product.look.photo} alt={product.name} loading="lazy" decoding="async" className={cn('h-full w-full transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]', contain ? 'object-contain' : 'object-cover', className)} />;
  }
  return (
    <span className={cn('block h-full w-full p-[12%]', className)}>
      <ProductJar look={product.look} size={product.size} showTag={false} className="h-full w-full" />
    </span>
  );
}

/** Add one to the cart, with a tick for a moment after. */
function useAdd(product) {
  const add = useCart((s) => s.add);
  const [done, setDone] = useState(false);
  const timer = useRef();
  const soldOut = product.stock <= 0;
  const onClick = (e) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    add(product, 1, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setDone(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 1400);
  };
  return { onClick, done, soldOut };
}

function AddIcon({ product, className }) {
  const { onClick, done, soldOut } = useAdd(product);
  return (
    <button type="button" onClick={onClick} disabled={soldOut} aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`} className={cn('grid shrink-0 place-items-center transition-colors disabled:opacity-40', className)}>
      {done ? <Check className="h-[18px] w-[18px]" strokeWidth={2.6} /> : <Plus className="h-[18px] w-[18px]" strokeWidth={2.4} />}
    </button>
  );
}

const padTopFor = (content) => (content.announcement.enabled && content.announcement.text ? 'pt-36 sm:pt-44' : 'pt-28 sm:pt-32');
const deliveryLine = (config) => (config?.deliveryEnabled ? (config.freeDeliveryThreshold > 0 ? `Free delivery over ${money(config.freeDeliveryThreshold)}` : 'Delivered to your door') : 'Order online, collect in store');
const rise = (delay = 0) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay, ease: EASE } });

// ---------------------------------------------------------------------------------------------- Living
// Architectural furniture: sand and stone, serif type, pieces in tall arched frames, plenty of air.

function Arch({ product, className, delay }) {
  return (
    <motion.div {...rise(delay)} className={className}>
      <Link to={`/products/${product.id}`} className="group block">
        <span className="block aspect-[3/4] overflow-hidden rounded-t-[999px] bg-sand">
          <Pic product={product} />
        </span>
        <span className="mt-3 flex items-baseline justify-between gap-3 border-t border-espresso/15 pt-2.5 text-[12px] tracking-[0.12em] text-espresso/60 uppercase">
          <span className="truncate">{product.name}</span>
          <span className="shrink-0 font-semibold text-espresso tabular-nums">{money(product.price)}</span>
        </span>
      </Link>
    </motion.div>
  );
}

function LivingHero({ products, config, content }) {
  const hero = content.hero;
  const [a, b, c] = products;
  return (
    <section id="top" className={cn('relative overflow-hidden pb-16 sm:pb-24', padTopFor(content))}>
      <div className="absolute inset-y-0 right-0 hidden w-[44%] bg-sand/60 lg:block" />
      <div className="container-x relative grid grid-cols-1 items-end gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="lg:pb-10">
          <motion.p {...rise(0)} className="flex items-center gap-3 text-[12px] font-semibold tracking-[0.22em] text-caramel uppercase">
            <span className="h-px w-10 bg-caramel/60" />
            {hero.eyebrow}
          </motion.p>
          <motion.h1 {...rise(0.08)} className="mt-6 font-brand text-[2.75rem] leading-[1.04] tracking-[-0.02em] text-espresso sm:text-6xl lg:text-[4.4rem]">
            {hero.lines.join(' ')}
          </motion.h1>
          {hero.text && (
            <motion.p {...rise(0.16)} className="mt-6 max-w-md text-base leading-relaxed text-espresso/65 sm:text-lg">
              {hero.text}
            </motion.p>
          )}
          <motion.div {...rise(0.24)} className="mt-9 flex flex-wrap items-center gap-6">
            <Link to="/shop" className="btn btn-primary group px-7 py-4">
              Explore the collection <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            {content.story.enabled && (
              <Link to="/about" className="text-sm font-semibold underline decoration-espresso/30 underline-offset-4 hover:decoration-espresso">
                Our story
              </Link>
            )}
          </motion.div>
          <motion.dl {...rise(0.32)} className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-espresso/15 pt-6 sm:gap-6">
            {[
              ['Pieces', products.length],
              ['Pay', 'M-Pesa'],
              ['Delivery', config?.deliveryEnabled ? 'To you' : 'Collect'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] tracking-[0.16em] text-espresso/50 uppercase">{k}</dt>
                <dd className="mt-1 font-brand text-xl text-espresso">{v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
        {a && (
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-end gap-4 sm:gap-6">
            <Arch product={a} delay={0.15} />
            <div className="grid gap-4 sm:gap-6">
              {b && <Arch product={b} delay={0.25} />}
              {c && <Arch product={c} delay={0.35} />}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function LivingCard({ product, title, href, price }) {
  return (
    <div className="flex h-full flex-col">
      <Link to={href} className="relative block aspect-[4/5] overflow-hidden rounded-t-[999px] bg-sand" aria-label={`View ${product.name}`}>
        <Pic product={product} />
        {product.badge && <span className="absolute top-[18%] left-1/2 -translate-x-1/2 rounded-full bg-cream/95 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-espresso uppercase">{product.badge}</span>}
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-brand text-lg leading-tight sm:text-xl">
            <Link to={href} className="hover:text-caramel">
              {title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-espresso/55">{product.size}</p>
        </div>
        <span className="shrink-0 pt-0.5 font-semibold tabular-nums">{price}</span>
      </div>
      <div className="min-h-3 flex-1" />
      <div className="flex items-center justify-between border-t border-espresso/15 pt-3">
        <Link to={href} className="inline-flex items-center gap-1 text-sm font-semibold text-espresso/70 hover:text-espresso">
          View piece <ArrowUpRight className="h-4 w-4" />
        </Link>
        <AddIcon product={product} className="h-9 w-9 rounded-full border border-espresso/20 text-espresso hover:bg-espresso hover:text-cream" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------- Tech
// Electronics: dark, one glowing accent, a deal tile beside the best seller, specs on every card.

function TechHero({ products, config, content }) {
  const [a, b, ...rest] = products;
  if (!a) return null;
  const strip = [b, ...rest].filter(Boolean).slice(0, 4);
  return (
    <section id="top" className={cn('relative pb-8 sm:pb-12', padTopFor(content))}>
      <div className="container-x">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.3fr)]">
          {b && (
            <motion.div {...rise(0.1)} className="order-2 lg:order-1">
              <Link to={`/products/${b.id}`} className="group relative flex h-full min-h-[20rem] flex-col overflow-hidden rounded-[var(--r-xl)] bg-amber p-6 text-[#fff]">
                <span className="w-fit rounded-full bg-[#fff]/20 px-3 py-1 text-[11px] font-bold tracking-[0.14em] uppercase">{b.badge || 'Deal'}</span>
                <h2 className="mt-4 text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">{b.name}</h2>
                <p className="mt-1 text-sm text-[#fff]/80">{b.size}</p>
                <p className="mt-3 text-2xl font-extrabold tabular-nums">{money(b.price)}</p>
                <span className="relative mt-auto -mr-6 -mb-6 ml-auto block aspect-square w-[70%] overflow-hidden rounded-tl-[var(--r-xl)]">
                  <Pic product={b} />
                </span>
              </Link>
            </motion.div>
          )}
          <motion.div {...rise(0)} className="relative order-1 grid min-h-[24rem] grid-cols-1 items-center gap-6 overflow-hidden rounded-[var(--r-xl)] bg-espresso/[0.05] p-7 ring-1 ring-espresso/10 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:p-12 lg:order-2">
            <div className="pointer-events-none absolute -right-32 -bottom-40 h-[34rem] w-[34rem] rounded-full" style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-amber) 34%, transparent), transparent)' }} />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-espresso/10 px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-espresso/80 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-amber" /> {a.badge || 'Best seller'}
              </span>
              <h1 className="mt-5 text-[2.5rem] leading-[1] font-extrabold tracking-[-0.03em] text-espresso sm:text-6xl">{a.name}</h1>
              <p className="mt-4 max-w-sm text-base text-espresso/60">{a.description || content.hero.text}</p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link to={`/products/${a.id}`} className="btn btn-primary px-7 py-3.5">
                  Shop now <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-2xl font-extrabold text-amber tabular-nums">{money(a.price)}</span>
              </div>
            </div>
            <span className="relative mx-auto block aspect-square w-full max-w-[22rem] overflow-hidden rounded-[var(--r-xl)]">
              <Pic product={a} />
            </span>
          </motion.div>
        </div>
        {strip.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {strip.map((p, i) => (
              <motion.div key={p.id} {...rise(0.2 + i * 0.05)}>
                <Link to={`/products/${p.id}`} className="group flex items-center gap-3 rounded-[var(--r-lg)] bg-espresso/[0.04] p-2.5 ring-1 ring-espresso/10 transition hover:ring-amber/60">
                  <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-[var(--r-md)]">
                    <Pic product={p} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-espresso">{p.name}</span>
                    <span className="text-sm font-bold text-amber tabular-nums">{money(p.price)}</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        <div className="mt-4 grid gap-3 text-sm text-espresso/70 sm:grid-cols-3">
          {[
            [Smartphone, config?.mpesaPrompt ? 'M-Pesa prompt at checkout' : 'Pay with M-Pesa'],
            [Truck, deliveryLine(config)],
            [ShieldCheck, 'Full specs on every product'],
          ].map(([Icon, t]) => (
            <p key={t} className="flex items-center gap-2.5 rounded-[var(--r-lg)] px-1 py-1">
              <Icon className="h-4 w-4 text-amber" /> {t}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechCard({ product, title, href, price }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--r-xl)] bg-espresso/[0.04] ring-1 ring-espresso/10 transition hover:ring-amber/60">
      <Link to={href} className="relative block aspect-square overflow-hidden" aria-label={`View ${product.name}`}>
        <Pic product={product} />
        {product.badge && <span className="absolute top-3 left-3 rounded-full bg-amber px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-[#fff] uppercase">{product.badge}</span>}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[15px] leading-snug font-bold">
          <Link to={href} className="hover:text-amber">
            {title}
          </Link>
        </h3>
        <p className="mt-1 font-mono text-[11px] tracking-wider text-espresso/50 uppercase">{product.size}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="text-lg font-extrabold text-amber tabular-nums">{price}</span>
          <AddIcon product={product} className="h-10 w-10 rounded-[var(--r-md)] bg-amber text-[#fff] hover:brightness-110" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------- Botanical
// Wellness: a warm sunlit panel with the shop's name in giant letters behind the product, soft cards.

function BotanicalHero({ products, content }) {
  const hero = content.hero;
  const [a, b] = products;
  const word = (LOOK.name || '').split(/\s+/)[0].toUpperCase();
  return (
    <section id="top" className={cn('relative', padTopFor(content))}>
      <div className="container-x">
        <div className="relative min-h-[36rem] overflow-hidden rounded-[var(--r-xl)] sm:min-h-[40rem]" style={{ background: 'linear-gradient(165deg, color-mix(in srgb, var(--color-honey) 55%, white) 0%, var(--color-honey) 100%)' }}>
          <motion.p
            aria-hidden
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="pointer-events-none absolute inset-x-0 top-[6%] text-center leading-none font-semibold tracking-[-0.05em] text-[#fff]/90 select-none"
            style={{ fontSize: `min(15rem, ${Math.round(150 / Math.max(word.length, 4))}vw)` }}
          >
            {word}
          </motion.p>
          {a && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.2, ease: EASE }} className="absolute bottom-0 left-1/2 w-[58%] max-w-[22rem] -translate-x-1/2 sm:w-[34%]">
              <Link to={`/products/${a.id}`} className="group block aspect-[4/5] overflow-hidden rounded-t-[var(--r-xl)] shadow-[0_-20px_60px_-30px_rgba(60,40,10,0.5)]">
                <Pic product={a} />
              </Link>
            </motion.div>
          )}
          <div className="relative flex min-h-[36rem] flex-col justify-end p-6 sm:min-h-[40rem] sm:p-10">
            <div className="max-w-[16rem] pb-[62%] sm:max-w-xs sm:pb-0">
              <motion.h1 {...rise(0.3)} className="font-brand text-3xl leading-[1.08] text-espresso sm:text-4xl">
                {hero.lines.join(' ')}
              </motion.h1>
              <motion.div {...rise(0.4)}>
                <Link to="/shop" className="mt-5 inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-sm font-semibold text-cream hover:bg-espresso/85">
                  Shop now <span className="h-1.5 w-1.5 rounded-full bg-honey" />
                </Link>
              </motion.div>
            </div>
          </div>
          {b && (
            <motion.div {...rise(0.5)} className="absolute right-6 bottom-6 hidden w-36 sm:block">
              <Link to={`/products/${b.id}`} className="group block overflow-hidden rounded-[var(--r-lg)] bg-white/90 p-2 shadow-lg">
                <span className="block aspect-square overflow-hidden rounded-[var(--r-md)]">
                  <Pic product={b} />
                </span>
                <span className="mt-2 block truncate px-1 text-xs font-semibold">{b.name}</span>
                <span className="block px-1 pb-1 text-xs text-espresso/60 tabular-nums">{money(b.price)}</span>
              </Link>
            </motion.div>
          )}
        </div>
        {hero.text && <p className="mx-auto mt-8 max-w-2xl text-center text-base leading-relaxed text-espresso/65 sm:text-lg">{hero.text}</p>}
      </div>
    </section>
  );
}

function BotanicalCard({ product, title, href, price }) {
  return (
    <div className="flex h-full flex-col">
      <Link to={href} className="relative block aspect-[4/5] overflow-hidden rounded-[var(--r-xl)] bg-beige" aria-label={`View ${product.name}`}>
        <Pic product={product} />
        {product.badge && <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-espresso uppercase">{product.badge}</span>}
      </Link>
      <div className="flex flex-1 items-end justify-between gap-3 pt-4">
        <div className="min-w-0">
          <h3 className="font-brand text-lg leading-tight sm:text-xl">
            <Link to={href} className="hover:text-caramel">
              {title}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-espresso/55">{product.size}</p>
          <p className="mt-2 font-semibold tabular-nums">{price}</p>
        </div>
        <AddIcon product={product} className="h-11 w-11 rounded-full bg-espresso text-cream hover:bg-amber" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------- Grocer
// Supermarket: a bright banner, aisles to jump between, and plus/minus buttons on every product.

function Stepper({ product }) {
  const qty = useCart((s) => s.items.find((i) => i.id === product.id)?.qty ?? 0);
  const setQty = useCart((s) => s.setQty);
  const { onClick, soldOut } = useAdd(product);
  if (soldOut) return <span className="text-xs font-semibold text-espresso/45">Sold out</span>;
  if (!qty) {
    return (
      <button type="button" onClick={onClick} aria-label={`Add ${product.name} to cart`} className="inline-flex h-9 items-center gap-1 rounded-full border border-amber px-3.5 text-sm font-bold text-amber transition hover:bg-amber hover:text-[#fff]">
        <Plus className="h-4 w-4" strokeWidth={2.6} /> Add
      </button>
    );
  }
  return (
    <span className="inline-flex h-9 items-center rounded-full bg-amber text-[#fff]" role="group" aria-label={`${product.name} in cart`}>
      <button type="button" onClick={() => setQty(product.id, qty - 1)} className="grid h-9 w-9 place-items-center" aria-label="One less">
        <Minus className="h-4 w-4" strokeWidth={2.6} />
      </button>
      <span className="min-w-5 text-center text-sm font-bold tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button type="button" onClick={() => setQty(product.id, qty + 1)} className="grid h-9 w-9 place-items-center" aria-label="One more">
        <Plus className="h-4 w-4" strokeWidth={2.6} />
      </button>
    </span>
  );
}

function GrocerHero({ products, config, content }) {
  const hero = content.hero;
  const tiles = products.slice(0, 4);
  const aisles = (content.shop.categories ?? []).map((c) => ({ ...c, count: products.filter((p) => p.category === c.id).length })).filter((c) => c.count > 0);
  return (
    <section id="top" className={cn('relative pb-6', padTopFor(content))}>
      <div className="container-x">
        <motion.div {...rise(0)} className="grid grid-cols-1 overflow-hidden rounded-[var(--r-xl)] bg-amber text-[#fff] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="p-7 sm:p-12 lg:p-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#fff]/15 px-3 py-1 text-sm font-semibold">
              <Truck className="h-4 w-4" /> {deliveryLine(config)}
            </span>
            <h1 className="mt-5 text-[2.5rem] leading-[1.02] font-extrabold tracking-[-0.03em] sm:text-5xl lg:text-6xl">{hero.lines.join(' ')}</h1>
            {hero.text && <p className="mt-4 max-w-md text-base text-[#fff]/80">{hero.text}</p>}
            <Link to="/shop" className="btn mt-8 bg-white px-7 py-3.5 text-amber hover:bg-white/90">
              Start shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {tiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3 p-5 pt-0 sm:p-10 lg:pl-0">
              {tiles.map((p) => (
                <Link key={p.id} to={`/products/${p.id}`} className="group relative overflow-hidden rounded-[var(--r-lg)] bg-white">
                  <span className="block aspect-square">
                    <Pic product={p} contain />
                  </span>
                  <span className="absolute right-2 bottom-2 rounded-full bg-amber px-2.5 py-1 text-xs font-bold text-[#fff] tabular-nums">{money(p.price)}</span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
        {aisles.length > 1 && (
          <div className="no-scrollbar -mx-4 mt-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ul className="flex w-max gap-2.5">
              {aisles.map((c) => (
                <li key={c.id}>
                  <a href="#shop" className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-espresso/10 hover:ring-amber">
                    {c.label} <span className="text-xs text-espresso/45 tabular-nums">{c.count}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function GrocerCard({ product, title, href, price }) {
  return (
    <div className="flex h-full flex-col rounded-[var(--r-xl)] bg-white p-3 ring-1 ring-espresso/[0.07] transition hover:shadow-[0_18px_40px_-24px_rgba(20,60,30,0.45)] sm:p-4">
      <Link to={href} className="relative block aspect-square overflow-hidden rounded-[var(--r-lg)] bg-[#F5F8F3]" aria-label={`View ${product.name}`}>
        <Pic product={product} contain />
        {product.badge && <span className="absolute top-2 left-2 rounded-full bg-amber px-2 py-0.5 text-[10px] font-bold text-[#fff]">{product.badge}</span>}
      </Link>
      <h3 className="mt-3 line-clamp-2 text-sm leading-snug font-semibold sm:text-[15px]">
        <Link to={href} className="hover:text-amber">
          {title}
        </Link>
      </h3>
      <p className="mt-0.5 text-xs text-espresso/50">{product.size}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <span className="text-base font-extrabold tabular-nums">{price}</span>
        <Stepper product={product} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------- Fashion
// Clothing: a big plain headline, the newest pieces as tall rounded photos with an arrow to open each, small tags.

function FashionHero({ products, content }) {
  const hero = content.hero;
  const picks = products.slice(0, 3);
  return (
    <section id="top" className={cn('relative pb-10 sm:pb-16', padTopFor(content))}>
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <motion.h1 {...rise(0)} className="max-w-3xl font-brand text-[2.6rem] leading-[1.02] font-bold tracking-[-0.035em] text-espresso sm:text-6xl lg:text-7xl">
            {hero.lines.join(' ')}
          </motion.h1>
          <motion.div {...rise(0.1)}>
            <Link to="/shop" className="group inline-flex items-center gap-2 pb-2 text-sm font-semibold text-espresso/75 hover:text-espresso">
              See every piece <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
        {hero.text && (
          <motion.p {...rise(0.15)} className="mt-4 max-w-xl text-base leading-relaxed text-espresso/60 sm:text-lg">
            {hero.text}
          </motion.p>
        )}
        {picks.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-5">
            {picks.map((p, i) => (
              <motion.div key={p.id} {...rise(0.15 + i * 0.08)} className={i === 0 ? 'col-span-2 sm:col-span-1' : ''}>
                <Link to={`/products/${p.id}`} className="group block">
                  <span className={cn('relative block overflow-hidden rounded-[var(--r-xl)] bg-espresso/[0.06] sm:aspect-auto sm:h-[26rem] lg:h-[30rem]', i === 0 ? 'aspect-[4/5]' : 'aspect-[3/4]')}>
                    <Pic product={p} />
                    <span className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-[#fff] text-[#111] shadow-sm transition-transform group-hover:rotate-45 sm:top-4 sm:right-4">
                      <ArrowUpRight className="h-[18px] w-[18px]" />
                    </span>
                    <span className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 sm:bottom-4 sm:left-4">
                      {p.badge && <span className="rounded-full bg-[#fff] px-3 py-1 text-[11px] font-semibold text-[#111]">{p.badge}</span>}
                      <span className="rounded-full bg-[#000]/40 px-3 py-1 text-[11px] font-semibold text-[#fff] backdrop-blur-sm">{money(p.price)}</span>
                    </span>
                  </span>
                  <span className="mt-3 flex items-center gap-2 text-xs text-espresso/55">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber" /> {p.size}
                  </span>
                  <span className="mt-1 block text-base leading-snug font-semibold text-espresso sm:text-lg">{p.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FashionCard({ product, title, href, price }) {
  return (
    <div className="flex h-full flex-col">
      <div className="relative">
        <Link to={href} className="block aspect-[4/5] overflow-hidden rounded-[var(--r-xl)] bg-espresso/[0.05]" aria-label={`View ${product.name}`}>
          <Pic product={product} />
        </Link>
        {product.badge && <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-[#111] px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-[#fff] uppercase">{product.badge}</span>}
        <AddIcon product={product} className="absolute top-3 right-3 h-9 w-9 rounded-full bg-[#fff] text-[#111] shadow-sm hover:bg-amber hover:text-[#fff]" />
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-espresso/55">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
        <span className="truncate">{product.size}</span>
      </p>
      <h3 className="mt-1 line-clamp-2 text-[15px] leading-snug font-semibold sm:text-base">
        <Link to={href} className="hover:text-amber">
          {title}
        </Link>
      </h3>
      <p className="mt-auto pt-2 font-bold tabular-nums">{price}</p>
    </div>
  );
}

export const TEMPLATE_HEROES = { living: LivingHero, tech: TechHero, botanical: BotanicalHero, grocer: GrocerHero, fashion: FashionHero };
export const TEMPLATE_CARDS = { living: LivingCard, tech: TechCard, botanical: BotanicalCard, grocer: GrocerCard, fashion: FashionCard };
