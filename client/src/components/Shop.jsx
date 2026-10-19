import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Flame, Plus, Star } from 'lucide-react';
import ProductJar from './ProductJar';
import { EASE, Reveal, SectionHeading } from './ui';
import { LOOK } from '../lib/brand';
import { cn, money, perHundredGrams } from '../lib/format';
import { useCart } from '../store/cart';

export function tintFor(look) {
  return {
    background: `radial-gradient(110% 80% at 50% 100%, ${look.spread ?? look.label}55 0%, transparent 62%), linear-gradient(180deg, #F8F1E6 0%, #F1E5D1 100%)`,
  };
}

export const packLabel = (look) => look?.pack || (look?.shape === 'tub' ? 'Tub' : 'Jar');

export function AddButton({ product, className }) {
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

  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      disabled={soldOut}
      aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
      className={cn(
        'relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full transition-colors duration-300 sm:h-11 sm:w-11',
        done ? 'bg-honey text-espresso' : 'bg-espresso text-cream hover:bg-amber hover:text-espresso',
        soldOut && 'opacity-40',
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={done ? 'done' : 'add'}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 90 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        >
          {done ? <Check className="h-[18px] w-[18px]" strokeWidth={2.6} /> : <Plus className="h-[18px] w-[18px]" strokeWidth={2.4} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

/** Heat as five chillies, filled up to the level (sauces only). */
export function HeatMeter({ level, className }) {
  const words = ['', 'Very mild', 'Mild', 'Medium', 'Hot', 'Very hot'];
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} aria-label={`Heat: ${words[level]}, ${level} of 5`}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Flame key={i} className={cn('h-3.5 w-3.5', i <= level ? 'fill-amber text-amber' : 'text-espresso/20')} strokeWidth={2} />
        ))}
      </span>
      <span className="text-[11px] font-semibold text-espresso/60">{words[level]}</span>
    </span>
  );
}

// The name to lead with: the short label title when it alone tells this product apart ("Garden Chilli"),
// else the full product name, e.g. when the label just says the brand or two products share a title.
const GENERIC_TITLES = /^(raw honey|whipped body butter|whipped shea butter|body scrub|gift box)$/i;
export const titleOf = (p, all = []) => {
  const t = p.look?.title?.trim().toLowerCase();
  if (!t || GENERIC_TITLES.test(t) || t === p.name.toLowerCase() || LOOK.name.toLowerCase().startsWith(t)) return p.name;
  return all.some((o) => o.id !== p.id && o.look?.title?.trim().toLowerCase() === t) ? p.name : p.look.title.trim();
};

// How a product card is drawn, set by the shop's design (LOOK.theme.cards):
//   card    white card with shadow       bare    photo and words, no box
//   framed  thin border, square corners  list    one product per row, photo beside the words
//   overlay price and add button on the photo itself
const CARD = {
  card: 'flex flex-col overflow-hidden rounded-[var(--r-xl)] bg-white shadow-[0_1px_2px_rgba(46,31,20,0.05),0_12px_30px_-18px_rgba(46,31,20,0.25)] ring-1 ring-espresso/[0.06] transition-shadow duration-500 hover:shadow-[0_30px_60px_-28px_rgba(46,31,20,0.5)]',
  bare: 'flex flex-col',
  framed: 'flex flex-col overflow-hidden border border-espresso/15 bg-white transition-colors duration-300 hover:border-espresso/40',
  list: 'grid grid-cols-[6.5rem_1fr] gap-4 rounded-[var(--r-lg)] bg-white p-3 ring-1 ring-espresso/[0.07] sm:grid-cols-[8.5rem_1fr]',
  overlay: 'flex flex-col',
};
const PHOTO = {
  card: 'aspect-[4/5]',
  bare: 'aspect-[4/5] rounded-[var(--r-lg)]',
  framed: 'aspect-square',
  list: 'aspect-square self-start rounded-[var(--r-md)]',
  overlay: 'aspect-[3/4] rounded-[var(--r-xl)]',
};
const BODY = { card: 'p-3.5 sm:p-5', bare: 'px-0.5 pt-3', framed: 'border-t border-espresso/10 p-4', list: 'py-1 pr-1', overlay: 'px-0.5 pt-3' };
export const cardKind = () => (CARD[LOOK.theme?.cards] ? LOOK.theme.cards : 'card');

function ProductCard({ product, all, index, onSelect }) {
  const { look } = product;
  const kind = cardKind();
  const per100 = perHundredGrams(product.price, product.size);
  const photo = Boolean(look.photo);
  const price = product.stock > 0 ? money(product.price) : 'Sold out';
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.25 } }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, delay: (index % 4) * 0.07, ease: EASE }}
      className={cn('group relative', CARD[kind])}
    >
      <div className={cn('relative w-full overflow-hidden', PHOTO[kind])}>
        <button onClick={() => onSelect(product)} className="absolute inset-0 block" style={photo ? undefined : tintFor(look)} aria-label={`View ${product.name}`}>
          {photo ? (
            <img src={look.photo} alt={product.name} loading="lazy" decoding="async" className="product-photo h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]" />
          ) : (
            <div className="absolute inset-x-[6%] top-[9%] bottom-[1%] transition-transform duration-700 ease-out-expo group-hover:-translate-y-2.5 group-hover:-rotate-2 group-hover:scale-[1.04]">
              <ProductJar look={look} price={product.price} size={product.size} showTag={false} className="h-full w-full" />
            </div>
          )}
        </button>
        {product.badge && kind !== 'list' && (
          <span className="paper-ink pointer-events-none absolute top-2.5 left-2.5 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-espresso uppercase shadow-sm sm:top-3 sm:left-3 sm:text-[10px]">
            {product.badge}
          </span>
        )}
        {/* overlay: the price on a solid pill and the add button sit on the photo */}
        {kind === 'overlay' && (
          <>
            <span className="paper-ink pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-espresso tabular-nums shadow-md">{price}</span>
            <span className="absolute right-3 bottom-3 z-10 rounded-full shadow-md">
              <AddButton product={product} />
            </span>
          </>
        )}
      </div>

      <div className={cn('flex min-w-0 flex-1 flex-col', BODY[kind])}>
        {product.badge && kind === 'list' && <span className="mb-1 text-[10px] font-bold tracking-[0.12em] text-caramel uppercase">{product.badge}</span>}
        <h3 className="leading-tight">
          <button onClick={() => onSelect(product)} className={cn('text-left font-bold tracking-tight hover:text-caramel', kind === 'framed' ? 'text-[15px] sm:text-base' : 'text-[15px] sm:text-lg')}>
            {titleOf(product, all)}
          </button>
        </h3>
        <p className="mt-0.5 text-[12px] text-espresso/50 sm:text-[13px]">
          {product.size} {packLabel(look)}
        </p>
        {look.heat > 0 && <HeatMeter level={look.heat} className="mt-2" />}
        {look.fact && kind !== 'overlay' && <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-espresso/70 sm:text-[13px]">{look.fact}</p>}
        {product.reviews > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-espresso/50 sm:text-xs">
            <Star className="h-3 w-3 fill-honey text-honey" />
            <span className="font-semibold text-espresso">{product.rating.toFixed(1)}</span>
            <span>({product.reviews})</span>
          </div>
        )}
        {kind !== 'overlay' && (
          <div className="mt-auto flex items-end justify-between gap-2 pt-3 sm:pt-4">
            <div className="min-w-0">
              <div className="truncate text-[17px] font-extrabold tracking-tight tabular-nums sm:text-xl">{price}</div>
              <div className="min-h-4 text-[11px] text-espresso/45 tabular-nums">{per100 && product.stock > 0 ? `${money(per100)} per 100g` : ''}</div>
            </div>
            <AddButton product={product} />
          </div>
        )}
      </div>
    </motion.article>
  );
}

function Skeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--r-xl)] bg-white ring-1 ring-espresso/[0.06] sm:rounded-[var(--r-xl)]">
      <div className="aspect-[1/1.02] animate-pulse bg-beige" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-beige" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-beige" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-beige" />
      </div>
    </div>
  );
}

// A one-product brand gets the product as a spread (photo beside the full story), not a lone card in an empty grid.
function FeatureProduct({ product, onSelect }) {
  const { look } = product;
  const per100 = perHundredGrams(product.price, product.size);
  return (
    <Reveal className="mt-10">
      <article className="grid overflow-hidden rounded-[var(--r-xl)] bg-white shadow-[0_1px_2px_rgba(46,31,20,0.05),0_30px_60px_-30px_rgba(46,31,20,0.35)] ring-1 ring-espresso/[0.06] md:grid-cols-2">
        <button onClick={() => onSelect(product)} className="group relative block aspect-[4/5] overflow-hidden md:aspect-auto md:min-h-[34rem]" style={look.photo ? undefined : tintFor(look)} aria-label={`View ${product.name}`}>
          {look.photo ? (
            <img src={look.photo} alt={product.name} decoding="async" className="product-photo absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]" />
          ) : (
            <div className="absolute inset-[10%]">
              <ProductJar look={look} price={product.price} size={product.size} showTag={false} className="h-full w-full" />
            </div>
          )}
          {product.badge && (
            <span className="paper-ink absolute top-4 left-4 z-10 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-espresso uppercase shadow-sm">{product.badge}</span>
          )}
        </button>
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
          <h3 className="text-3xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl">{titleOf(product)}</h3>
          <p className="mt-2 text-sm font-semibold text-espresso/55">
            {product.size} {packLabel(look)}
          </p>
          {look.heat > 0 && <HeatMeter level={look.heat} className="mt-4" />}
          {look.fact && <p className="mt-4 text-lg font-medium text-espresso/85">{look.fact}</p>}
          {product.description && <p className="mt-3 max-w-md leading-relaxed text-espresso/65">{product.description}</p>}
          {product.notes?.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {product.notes.map((n) => (
                <li key={n} className="rounded-full border border-espresso/15 px-3.5 py-1.5 text-sm font-medium">
                  {n}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8 flex items-end justify-between gap-4 border-t border-espresso/10 pt-6">
            <div>
              <div className="text-3xl font-extrabold tracking-tight tabular-nums">{product.stock > 0 ? money(product.price) : 'Sold out'}</div>
              {per100 && product.stock > 0 && <div className="mt-0.5 text-xs text-espresso/45 tabular-nums">{money(per100)} per 100g</div>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => onSelect(product)} className="btn btn-ghost px-5 py-3 text-sm">
                Details
              </button>
              <AddButton product={product} className="sm:h-12 sm:w-12" />
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

// Products across: the design sets 2, 3 or 4 on a computer (lists run one or two wide).
function gridCols(count) {
  if (cardKind() === 'list') return 'grid-cols-1 md:grid-cols-2';
  const cols = LOOK.theme?.cols ?? 4;
  if (cols === 2) return 'grid-cols-2 lg:gap-8';
  if (cols === 3 || count < 4) return 'grid-cols-2 md:grid-cols-3';
  return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
}

const SORTS = [
  ['popular', 'Popular'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
];

export default function Shop({ products, loading, error, onSelect, shop }) {
  const [pick, setPick] = useState('all');
  const [sort, setSort] = useState('popular');
  // Quick filters: the brand's own facets (heat, skin need, mood…), else the shop categories. Each shows its count.
  const facet = LOOK.facets;
  const groups = facet ? facet.options.map(([id, label]) => ({ id, label })) : (shop.categories ?? []);
  const groupOf = (p) => (facet ? p.look?.facet : p.category);
  const counted = groups.map((g) => ({ ...g, count: products.filter((p) => groupOf(p) === g.id).length })).filter((g) => g.count > 0);
  const filters = counted.length > 1 ? [{ id: 'all', label: shop.allLabel || 'All', count: products.length }, ...counted] : [];
  const picked = pick === 'all' ? products : products.filter((p) => groupOf(p) === pick);
  const list = sort === 'popular' ? picked : [...picked].sort((x, y) => (sort === 'price-asc' ? x.price - y.price : y.price - x.price));

  return (
    <section id="shop" className="relative scroll-mt-16 py-20 sm:py-28">
      <div className="container-x">
        <SectionHeading eyebrow={shop.eyebrow} title={shop.title}>
          {shop.text}
        </SectionHeading>

        {!loading && products.length > 1 && (
          <Reveal delay={0.1} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {filters.length > 0 ? (
              <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <div className="flex w-max items-center gap-2" role="group" aria-label={facet ? `Filter by ${facet.label.toLowerCase()}` : 'Filter products'}>
                  {facet && <span className="mr-1 text-xs font-semibold tracking-wider text-espresso/45 uppercase">{facet.label}</span>}
                  {filters.map((c) => (
                    <button
                      key={c.id}
                      aria-pressed={pick === c.id}
                      onClick={() => setPick(c.id)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors duration-300',
                        pick === c.id ? 'border-espresso bg-espresso text-cream' : 'border-espresso/15 text-espresso/70 hover:border-espresso/40 hover:text-espresso',
                      )}
                    >
                      {c.label}
                      <span className={cn('text-xs tabular-nums', pick === c.id ? 'text-cream/70' : 'text-espresso/40')}>{c.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-espresso/50 tabular-nums">{list.length === products.length ? `${products.length} products` : `${list.length} of ${products.length}`}</span>
              <label className="sr-only" htmlFor="shop-sort">
                Sort
              </label>
              <select id="shop-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-[var(--r-md)] border border-espresso/15 bg-transparent px-3 py-2 text-sm font-semibold text-espresso">
                {SORTS.map(([id, label]) => (
                  <option key={id} value={id} className="bg-cream text-espresso">
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </Reveal>
        )}

        {error && <p className="mt-10 rounded-[var(--r-lg)] bg-white p-6 text-center text-espresso/70">We couldn’t load the shop right now. {error}</p>}

        {!loading && products.length === 1 ? (
          <FeatureProduct product={products[0]} onSelect={onSelect} />
        ) : (
        <motion.div layout className={cn('mt-8 grid gap-3 sm:gap-5', gridCols(list.length))}>
          {loading
            ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} />)
            : (
              <AnimatePresence mode="popLayout">
                {list.map((p, i) => (
                  <ProductCard key={p.id} product={p} all={products} index={i} onSelect={onSelect} />
                ))}
              </AnimatePresence>
            )}
        </motion.div>
        )}
      </div>
    </section>
  );
}
