// One page per product (/products/<id>), so a product can be shared on WhatsApp or Instagram and the back
// button works. Laid out like the best storefronts: the photo big, the buying box beside it and always in
// reach, then the answers people ask before paying (what's in it, delivery, payment, who to call).
import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router';
import { Check, ChevronDown, ChevronRight, Link2, MessageCircle, Minus, Phone, Plus, ShoppingBag, Smartphone, Store as StoreIcon, Truck } from 'lucide-react';
import ProductJar from '../components/ProductJar';
import { HeatMeter, packLabel, tintFor, titleOf } from '../components/Shop';
import { Stars } from '../components/ui';
import { telHref } from '../lib/branches';
import { cn, isBundle, money, perHundredGrams } from '../lib/format';
import { useCart } from '../store/cart';

const waNumber = (phone = '') => phone.replace(/\D/g, '').replace(/^0/, '254');

function Fold({ title, children, open: startOpen = false }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <div className="border-t border-espresso/10">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-bold">
        {title}
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-espresso/50 transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <div className={cn('grid transition-[grid-template-rows] duration-300', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="pb-5 text-[15px] leading-relaxed text-espresso/70">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Photo({ product, className }) {
  const { look } = product;
  return (
    <div className={cn('relative overflow-hidden rounded-[var(--r-xl)] bg-beige', className)} style={look.photo ? undefined : tintFor(look)}>
      {look.photo ? (
        <img src={look.photo} alt={product.name} decoding="async" className="product-photo absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-[10%]">
          <ProductJar look={look} price={product.price} size={product.size} showTag={false} className="h-full w-full" />
        </div>
      )}
      {product.badge && <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-espresso uppercase shadow-sm">{product.badge}</span>}
    </div>
  );
}

function Qty({ value, set, max, disabled, className }) {
  return (
    <div className={cn('flex h-13 shrink-0 items-center rounded-full bg-white ring-1 ring-espresso/15', className)}>
      <button type="button" onClick={() => set(Math.max(1, value - 1))} disabled={disabled || value <= 1} className="grid h-full w-11 place-items-center rounded-l-full transition hover:bg-beige disabled:opacity-30" aria-label="One less">
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={() => set(Math.min(max, value + 1))} disabled={disabled || value >= max} className="grid h-full w-11 place-items-center rounded-r-full transition hover:bg-beige disabled:opacity-30" aria-label="One more">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function Share({ product }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href.split('#')[0];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-espresso/50">Share</span>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${product.name} – ${money(product.price)}\n${url}`)}`} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-[#1E8E3E] text-white" aria-label="Share on WhatsApp">
        <MessageCircle className="h-4 w-4" />
      </a>
      <button type="button" onClick={copy} className="grid h-9 w-9 place-items-center rounded-full bg-white ring-1 ring-espresso/15" aria-label="Copy link">
        {copied ? <Check className="h-4 w-4 text-emerald-700" /> : <Link2 className="h-4 w-4" />}
      </button>
      {copied && <span className="text-xs font-semibold text-emerald-700">Link copied</span>}
    </div>
  );
}

function MiniCard({ product, all }) {
  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--r-lg)] bg-beige" style={product.look.photo ? undefined : tintFor(product.look)}>
        {product.look.photo ? (
          <img src={product.look.photo} alt={product.name} loading="lazy" className="product-photo h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]" />
        ) : (
          <div className="absolute inset-[8%]">
            <ProductJar look={product.look} size={product.size} showTag={false} className="h-full w-full" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[15px] font-bold group-hover:text-caramel">{titleOf(product, all)}</span>
        <span className="shrink-0 text-sm font-semibold tabular-nums">{product.stock > 0 ? money(product.price) : 'Sold out'}</span>
      </div>
      <span className="text-xs text-espresso/50">
        {product.size} {packLabel(product.look)}
      </span>
    </Link>
  );
}

// "Get the set": this product with up to two others, added in one tap (the way good shops sell a duo or trio).
function SetBox({ product, others, all }) {
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  const [done, setDone] = useState(false);
  const set = [product, ...others.filter((p) => p.stock > 0 && !isBundle(p.name)).slice(0, 2)];
  if (set.length < 2 || product.stock <= 0 || isBundle(product.name)) return null;
  const total = set.reduce((sum, p) => sum + p.price, 0);
  // If the shop sells a ready-made bundle for less, say so: never steer people to the dearer way.
  const bundle = all.find((p) => p.id !== product.id && p.stock > 0 && isBundle(p.name) && p.price < total);
  const addAll = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    set.forEach((p) => add(p, 1, { x: r.left + r.width / 2, y: r.top + r.height / 2 }));
    setDone(true);
    setTimeout(() => setOpen(true), 300);
  };
  return (
    <div className="mt-6 rounded-[var(--r-lg)] bg-beige/70 p-4 sm:p-5">
      <p className="text-sm font-bold">{set.length === 2 ? 'Get both' : `Get all ${set.length}`}</p>
      <div className="mt-3 flex items-center gap-2">
        {set.map((p, i) => (
          <span key={p.id} className="flex items-center gap-2">
            {i > 0 && <Plus className="h-3.5 w-3.5 text-espresso/40" />}
            <span className="relative block h-14 w-14 overflow-hidden rounded-[var(--r-md)] bg-white ring-1 ring-espresso/10" style={p.look.photo ? undefined : tintFor(p.look)} title={p.name}>
              {p.look.photo ? (
                <img src={p.look.photo} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <span className="absolute inset-[8%]">
                  <ProductJar look={p.look} size={p.size} showTag={false} className="h-full w-full" />
                </span>
              )}
            </span>
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm text-espresso/65">{set.map((p) => titleOf(p, all)).join(' + ')}</p>
      <button type="button" onClick={addAll} className="btn btn-ghost mt-3 h-11 w-full bg-white text-sm">
        {done ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />} {done ? 'Added to cart' : `Add ${set.length === 2 ? 'both' : `all ${set.length}`} · ${money(total)}`}
      </button>
      {bundle && (
        <Link to={`/products/${bundle.id}`} className="mt-2 block text-center text-sm font-semibold text-caramel hover:underline">
          Or get {bundle.name} for {money(bundle.price)}, save {money(total - bundle.price)}
        </Link>
      )}
    </div>
  );
}

function Missing() {
  return (
    <div className="container-x grid min-h-[60svh] place-items-center pt-[var(--nav-h,5rem)] text-center">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">This product isn’t here any more</h1>
        <p className="mt-2 text-espresso/60">It may have sold out or been renamed.</p>
        <Link to="/shop" className="btn btn-primary mt-6">
          See everything we sell
        </Link>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="container-x grid gap-8 pt-[calc(var(--nav-h,5rem)+1.5rem)] pb-16 md:grid-cols-2 lg:gap-14">
      <div className="aspect-[4/5] animate-pulse rounded-[var(--r-xl)] bg-beige" />
      <div className="space-y-4 pt-4">
        <div className="h-4 w-24 animate-pulse rounded bg-beige" />
        <div className="h-10 w-3/4 animate-pulse rounded bg-beige" />
        <div className="h-8 w-32 animate-pulse rounded bg-beige" />
        <div className="h-14 w-full animate-pulse rounded-full bg-beige" />
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const { products, config, content, loading } = useOutletContext();
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const buyBox = useRef(null);
  const [buyBoxGone, setBuyBoxGone] = useState(false);
  const product = products.find((p) => p.id === id);

  useEffect(() => setQty(1), [id]);
  useEffect(() => {
    if (product) document.title = `${product.name} · ${content.brand.name}`;
  }, [product, content]);
  // On phones, a buy bar shows whenever the main buttons aren't fully in view above the tab bar: when the
  // page opens with them low on the screen, and once they scroll away.
  useEffect(() => {
    const el = buyBox.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBuyBoxGone(e.intersectionRatio < 1), { rootMargin: '0px 0px -100px 0px', threshold: [0, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, [product]);

  if (!product) return loading ? <Loading /> : <Missing />;

  const soldOut = product.stock <= 0;
  const max = Math.max(1, Math.min(product.stock, 50));
  const per100 = perHundredGrams(product.price, product.size, product.name);
  const category = content.shop?.categories?.find((c) => c.id === product.category);
  const others = products.filter((p) => p.id !== product.id && p.active !== false);
  const related = [...others.filter((p) => p.category === product.category), ...others.filter((p) => p.category !== product.category)].slice(0, 4);
  const branches = content.brand.branches ?? [];
  const contact = branches.find((b) => b.phone);
  const pay = config?.paymentMethods ?? [];
  const lowStock = product.stock > 0 && product.stock <= 10;

  const addToCart = (e, open = false) => {
    const r = e.currentTarget.getBoundingClientRect();
    add(product, qty, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    if (open) setTimeout(() => setOpen(true), 250);
  };

  return (
    <div className="pt-[var(--nav-h,5rem)]">
      <div className="container-x pt-5 sm:pt-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-espresso/50">
          <Link to="/shop" className="hover:text-espresso">
            Shop
          </Link>
          {category && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>{category.label}</span>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-espresso/80">{product.name}</span>
        </nav>

        <div className="mt-4 grid gap-6 pb-14 sm:mt-7 md:grid-cols-[1.1fr_1fr] md:gap-8 lg:gap-14">
          <Photo product={product} className="aspect-square md:aspect-[4/5] md:sticky md:top-[calc(var(--nav-h,5rem)+1rem)] md:self-start" />

          <div className="min-w-0">
            <h1 className="text-3xl leading-[1.05] font-extrabold tracking-tight sm:text-[2.6rem]">{titleOf(product, products)}</h1>
            <p className="mt-2 text-sm font-semibold text-espresso/55">
              {product.size} {packLabel(product.look)}
            </p>
            {product.reviews > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-espresso/60">
                <Stars value={product.rating} />
                <span className="font-semibold text-espresso">{product.rating.toFixed(1)}</span>· {product.reviews} reviews
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-extrabold tracking-tight tabular-nums">{money(product.price)}</span>
              {per100 && <span className="text-sm text-espresso/50 tabular-nums">{money(per100)} per 100g</span>}
            </div>
            <p className={cn('mt-1.5 text-sm font-semibold', soldOut ? 'text-red-700' : lowStock ? 'text-caramel' : 'text-emerald-700')}>
              {soldOut ? 'Sold out for now' : lowStock ? `Only ${product.stock} left` : 'In stock'}
            </p>

            {product.look.heat > 0 && <HeatMeter level={product.look.heat} className="mt-4" />}
            {product.look.fact && <p className="mt-4 text-[17px] font-medium text-espresso/85">{product.look.fact}</p>}

            <div ref={buyBox} className="mt-6 flex items-center gap-3">
              <Qty value={qty} set={setQty} max={max} disabled={soldOut} />
              <button type="button" onClick={(e) => addToCart(e)} disabled={soldOut} className="btn btn-primary h-13 flex-1 text-[15px]">
                {added ? <Check className="h-[18px] w-[18px]" /> : <ShoppingBag className="h-[18px] w-[18px]" />}
                {soldOut ? 'Sold out' : added ? 'Added to cart' : `Add to cart · ${money(product.price * qty)}`}
              </button>
            </div>
            {!soldOut && (
              <button type="button" onClick={(e) => addToCart(e, true)} className="btn btn-ghost mt-3 h-12 w-full text-[15px]">
                Buy now with M-Pesa
              </button>
            )}

            <SetBox product={product} others={related} all={products} />

            {/* What people ask before paying, answered before they have to ask. */}
            <ul className="mt-6 space-y-3 rounded-[var(--r-lg)] bg-white p-4 text-sm ring-1 ring-espresso/[0.07] sm:p-5">
              <li className="flex gap-3">
                <Smartphone className="mt-0.5 h-[18px] w-[18px] shrink-0 text-caramel" />
                <span>
                  <b>Pay with M-Pesa</b> at checkout
                  {config?.mpesaPrompt ? ': the PIN prompt comes to your phone.' : pay[0]?.hint ? ` (${pay[0].hint}).` : '.'}
                </span>
              </li>
              <li className="flex gap-3">
                <Truck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-caramel" />
                <span>
                  {config?.deliveryEnabled ? (
                    <>
                      <b>Delivery</b>
                      {config.deliveryFee > 0 ? ` from ${money(config.deliveryFee)}` : ''}
                      {/* The note often starts "Delivery by…": don't say "Delivery" twice. */}
                      {config.deliveryNote ? (/^delivery\b/i.test(config.deliveryNote) ? ` ${config.deliveryNote.replace(/^delivery\s*/i, '')}` : `. ${config.deliveryNote}`) : '.'}
                      {config.freeDeliveryThreshold > 0 && ` Free over ${money(config.freeDeliveryThreshold)}.`}
                    </>
                  ) : (
                    <>
                      <b>Pick up</b> from us. Delivery coming soon.
                    </>
                  )}
                </span>
              </li>
              {branches.length > 0 && (
                <li className="flex gap-3">
                  <StoreIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-caramel" />
                  <span>
                    <b>Pick up</b> in {branches.map((b) => b.city).filter(Boolean).join(', ')}
                  </span>
                </li>
              )}
            </ul>

            <div className="mt-6">
              {/* Only when the owner has written something: no filler text. */}
              {(product.description || product.look.fact || product.notes?.length > 0) && (
              <Fold title="About this product" open>
                {product.description || product.look.fact}
                {product.notes?.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {product.notes.map((n) => (
                      <li key={n} className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-espresso ring-1 ring-espresso/10">
                        {n}
                      </li>
                    ))}
                  </ul>
                )}
              </Fold>
              )}
              <Fold title="Delivery & payment">
                <p>Add what you want to the cart and check out. You pay by M-Pesa{pay[0]?.hint ? ` (${pay[0].hint})` : ''}, and get a receipt you can track your order with.</p>
                {config?.deliveryEnabled && <p className="mt-2">{config.deliveryNote}</p>}
                {config?.pickup?.address && (
                  <p className="mt-2">
                    Pick up: {config.pickup.address}
                    {config.pickup.hours && `, ${config.pickup.hours}`}
                  </p>
                )}
              </Fold>
              {contact && (
                <Fold title="Questions? Talk to us">
                  <p>Not sure it’s right for you? Ask us before you order.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={`https://wa.me/${waNumber(contact.phone)}?text=${encodeURIComponent(`Hi, I'm asking about ${product.name} (${window.location.href})`)}`} target="_blank" rel="noreferrer" className="btn h-10 bg-[#1E8E3E] px-4 text-sm text-white">
                      <MessageCircle className="h-4 w-4" /> WhatsApp us
                    </a>
                    <a href={telHref(contact.phone)} className="btn btn-ghost h-10 px-4 text-sm">
                      <Phone className="h-4 w-4" /> {contact.phone}
                    </a>
                  </div>
                </Fold>
              )}
              <div className="border-t border-espresso/10 pt-4">
                <Share product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-espresso/10 py-12 sm:py-16">
          <div className="container-x">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">You may also like</h2>
              <Link to="/shop" className="text-sm font-semibold text-caramel hover:underline">
                See all
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
              {related.map((p) => (
                <MiniCard key={p.id} product={p} all={products} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Phones: the buy bar stays in reach once the main buttons scroll away. */}
      {/* It covers the tab bar while it shows (solid, and taller than the tabs). */}
      <div className={cn('fixed inset-x-0 bottom-0 z-[60] border-t border-espresso/10 bg-cream px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-12px_30px_-18px_rgba(0,0,0,0.35)] transition-transform duration-300 lg:hidden', buyBoxGone && !soldOut ? 'translate-y-0' : 'translate-y-full')}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{titleOf(product, products)}</p>
            <p className="text-sm tabular-nums text-espresso/60">{money(product.price * qty)}</p>
          </div>
          <button type="button" onClick={(e) => addToCart(e)} className="btn btn-primary h-12 px-5 text-[15px]">
            {added ? <Check className="h-[18px] w-[18px]" /> : <ShoppingBag className="h-[18px] w-[18px]" />} {added ? 'Added' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
