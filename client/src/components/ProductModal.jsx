import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { Leaf, Minus, Plus, ShieldCheck, ShoppingBag, Truck, X } from 'lucide-react';
import ProductJar from './ProductJar';
import { HeatMeter, packLabel, tintFor, titleOf } from './Shop';
import { EASE, FloatingPeanut, Stars, useBrand, useLockBody, useMediaQuery } from './ui';
import { money, perHundredGrams } from '../lib/format';
import { useCart } from '../store/cart';

export default function ProductModal({ product, products = [], onClose, config }) {
  const desktop = useMediaQuery('(min-width: 768px)');
  const drag = useDragControls();
  useLockBody(Boolean(product));

  useEffect(() => {
    if (!product) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-espresso/45 backdrop-blur-sm"
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            initial={desktop ? { opacity: 0, scale: 0.94, y: 24 } : { y: '100%' }}
            animate={desktop ? { opacity: 1, scale: 1, y: 0 } : { y: 0 }}
            exit={desktop ? { opacity: 0, scale: 0.96, y: 16 } : { y: '100%' }}
            transition={{ duration: 0.55, ease: EASE }}
            drag={desktop ? false : 'y'}
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => (info.offset.y > 110 || info.velocity.y > 500) && onClose()}
            className="fixed inset-x-0 bottom-0 z-[71] max-h-[92svh] overflow-hidden rounded-t-[var(--r-xl)] bg-cream shadow-2xl md:inset-0 md:m-auto md:h-fit md:max-h-[88vh] md:w-[calc(100%-3rem)] md:max-w-4xl md:rounded-[var(--r-xl)]"
          >
            <div className="max-h-[92svh] overflow-y-auto overscroll-contain md:max-h-[88vh]">
              <div onPointerDown={(e) => drag.start(e)} className="sticky top-0 z-20 flex touch-none justify-center pt-3 pb-1 md:hidden">
                <span className="h-1.5 w-12 rounded-full bg-espresso/20" />
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-30 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-espresso shadow-sm backdrop-blur transition hover:rotate-90 hover:bg-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid md:grid-cols-2">
                {product.look.photo ? (
                  <div className="relative -mt-7 overflow-hidden md:mt-0">
                    <motion.img
                      initial={{ scale: 1.08, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1, ease: EASE }}
                      src={product.look.photo}
                      alt={product.name}
                      className="aspect-[4/5] h-full w-full object-cover md:aspect-auto md:min-h-[34rem]"
                    />
                  </div>
                ) : (
                <div className="relative -mt-7 overflow-hidden md:mt-0" style={tintFor(product.look)}>
                  <div className="bg-dots absolute inset-0 opacity-60" />
                  <motion.div
                    initial={{ y: 60, rotate: -8, opacity: 0 }}
                    animate={{ y: 0, rotate: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.1, ease: EASE }}
                    className="relative mx-auto w-[78%] max-w-sm pt-12 pb-6 md:w-[86%] md:pt-16"
                  >
                    <div className="animate-float" style={{ '--float': '-10px', '--float-dur': '5s' }}>
                      <ProductJar look={product.look} price={product.price} size={product.size} className="group w-full" />
                    </div>
                  </motion.div>
                  <FloatingPeanut className="top-[18%] left-[12%]" size="w-6" path={[[0, 0], [40, -20], [80, 15], [25, 35], [0, 0]]} duration={9} />
                </div>
                )}

                <ProductDetails product={product} products={products} config={config} onAdded={onClose} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ProductDetails({ product, products, config, onAdded }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const max = Math.min(product.stock, 50);
  const soldOut = product.stock <= 0;
  const brand = useBrand();
  const per100 = perHundredGrams(product.price, product.size);

  const item = (i) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: 0.15 + i * 0.05, ease: EASE },
  });

  const onAdd = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    add(product, qty, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setTimeout(onAdded, 150);
  };

  return (
    <div className="flex flex-col p-6 sm:p-8 md:p-10">
      {/* Brand lockup: the name in the brand font. */}
      <motion.span {...item(0)} className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-none">
        <span className="font-brand text-xl text-cocoa">{brand.name}</span>
        {product.badge && <span className="rounded-full bg-honey/25 px-2.5 py-1 text-[10px] font-bold tracking-wider text-caramel uppercase">{product.badge}</span>}
      </motion.span>
      <motion.h2 {...item(1)} className="mt-3 text-3xl leading-[1.05] font-extrabold tracking-tight sm:text-4xl">
        {titleOf(product, products)}
      </motion.h2>
      <motion.p {...item(1)} className="mt-2 text-sm font-semibold text-espresso/55">
        {product.size} {packLabel(product.look)}
      </motion.p>
      {product.look.heat > 0 && (
        <motion.div {...item(2)}>
          <HeatMeter level={product.look.heat} className="mt-3" />
        </motion.div>
      )}
      {product.look.fact && <motion.p {...item(2)} className="mt-3 text-[15px] font-medium text-espresso/80">{product.look.fact}</motion.p>}
      {product.reviews > 0 && (
        <motion.div {...item(2)} className="mt-3 flex items-center gap-2 text-sm text-espresso/60">
          <Stars value={product.rating} />
          <span className="font-semibold text-espresso">{product.rating.toFixed(1)}</span>· {product.reviews} reviews
        </motion.div>
      )}
      <motion.div {...item(3)} className="mt-5 flex items-baseline gap-3">
        <span className="text-3xl font-extrabold tracking-tight">{money(product.price)}</span>
        {per100 && <span className="text-sm text-espresso/50">{money(per100)} per 100g</span>}
      </motion.div>
      <motion.p {...item(4)} className="mt-5 leading-relaxed text-espresso/70">
        {product.description}
      </motion.p>

      <motion.div {...item(5)} className="mt-5">
        <div className="text-xs font-semibold tracking-wider text-espresso/45 uppercase">Highlights</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.notes.map((n) => (
            <span key={n} className="rounded-full border border-espresso/10 bg-white px-3.5 py-1.5 text-sm font-medium">
              {n}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div {...item(6)} className="sticky bottom-0 z-10 -mx-6 mt-7 flex items-center gap-3 border-t border-espresso/[0.07] bg-cream/95 px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-8 sm:px-8 md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="flex h-14 items-center rounded-full bg-white ring-1 ring-espresso/10">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-14 w-12 place-items-center rounded-l-full transition hover:bg-beige" aria-label="Decrease quantity" disabled={soldOut}>
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-7 text-center font-bold tabular-nums" aria-live="polite">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(max, q + 1))} className="grid h-14 w-12 place-items-center rounded-r-full transition hover:bg-beige" aria-label="Increase quantity" disabled={soldOut}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button onClick={onAdd} disabled={soldOut} className="btn btn-primary h-14 flex-1 text-[15px]">
          <ShoppingBag className="h-[18px] w-[18px]" />
          {soldOut ? 'Sold out' : <>Add · {money(product.price * qty)}</>}
        </button>
      </motion.div>
      {product.stock > 0 && product.stock < 30 && (
        <motion.p {...item(7)} className="mt-3 text-sm font-semibold text-caramel">
          Only {product.stock} left in stock
        </motion.p>
      )}

      <motion.ul {...item(8)} className="mt-7 grid grid-cols-3 gap-2 border-t border-espresso/10 pt-6 text-center text-[11px] font-medium text-espresso/60 sm:text-xs">
        <li className="flex flex-col items-center gap-1.5">
          <Leaf className="h-5 w-5 text-amber" /> Small batch
        </li>
        <li className="flex flex-col items-center gap-1.5">
          <ShieldCheck className="h-5 w-5 text-amber" /> Made in-house
        </li>
        <li className="flex flex-col items-center gap-1.5">
          <Truck className="h-5 w-5 text-amber" /> {config?.deliveryEnabled ? 'Delivery countrywide' : 'Delivery coming soon'}
        </li>
      </motion.ul>
    </div>
  );
}
