import { useRef } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Truck } from 'lucide-react';
import { isBrandTagline, LoveNutHome } from './LoveNutHome';
import ProductJar from './ProductJar';
import { Display, EASE, Stars } from './ui';
import { cn, money } from '../lib/format';
import { LOOK } from '../lib/brand';

function FloatingJar({ product, className, depth, mx, my, parallax, float = 6, delay = 0, rotate = 0, tag = false }) {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  return (
    <motion.div className={className} style={{ y: parallax }}>
      <motion.div
        initial={{ opacity: 0, y: 60, rotate: rotate - 6 }}
        animate={{ opacity: 1, y: 0, rotate }}
        transition={{ duration: 1.3, delay, ease: EASE }}
      >
        <motion.div style={{ x, y }}>
          <div className="animate-float" style={{ '--float': `${-float * 2}px`, '--float-dur': `${float}s`, '--float-delay': `${delay}s` }}>
            <ProductJar look={product.look} price={product.price} size={product.size} showTag={tag} className="group w-full" />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Renders a headline line, highlighting `highlight` (once) with the brand gradient and a hand-drawn underline.
function HeadlineLine({ text, highlight }) {
  const at = highlight ? text.indexOf(highlight) : -1;
  if (at < 0) return <Display>{text}</Display>;
  return (
    <>
      <Display>{text.slice(0, at)}</Display>
      <span className="relative inline-block">
        <span className="text-honey">{highlight}</span>
        <svg viewBox="0 0 200 20" preserveAspectRatio="none" className="absolute -bottom-[0.12em] left-0 h-[0.2em] w-full overflow-visible" aria-hidden>
          <motion.path
            d="M3 14 C 40 4, 80 4, 110 10 S 170 18, 197 6"
            fill="none"
            style={{ stroke: 'var(--color-honey)' }}
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, delay: 1, ease: EASE }}
          />
        </svg>
      </span>
      <Display>{text.slice(at + highlight.length)}</Display>
    </>
  );
}

// A real photo in a paper frame: the building block of the photo, poster and editorial banners.
function Framed({ src, alt, className, parallax, delay = 0, rotate = 0, frame = true, aspect = 'aspect-[4/5]' }) {
  return (
    <motion.div className={className} style={{ y: parallax }}>
      <motion.div
        initial={{ opacity: 0, y: 50, rotate: rotate - 4 }}
        animate={{ opacity: 1, y: 0, rotate }}
        transition={{ duration: 1.2, delay, ease: EASE }}
        className={cn(
          'overflow-hidden rounded-[var(--r-xl)] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)]',
          frame && 'paper-ink bg-white p-1.5 sm:p-2.5',
        )}
      >
        <img src={src} alt={alt} decoding="async" className={cn('w-full object-cover', aspect, frame && 'rounded-[max(0px,calc(var(--r-xl)-8px))]')} />
      </motion.div>
    </motion.div>
  );
}

// One quiet fact on the banner (delivery), level and still: a label, not a sticker.
function Chip({ icon: Icon, title, text, className, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay, ease: EASE }} className={cn('absolute z-30', className)}>
      <div className="flex items-center gap-2.5 rounded-full bg-white/95 py-2 pr-4 pl-2 shadow-[0_12px_30px_-14px_rgba(0,0,0,0.45)] ring-1 ring-espresso/[0.06]">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-beige text-caramel">
          <Icon className="h-4 w-4" />
        </span>
        <span className="leading-tight text-espresso">
          <span className="block text-[13px] font-bold">{title}</span>
          {text && <span className="block text-[11px] text-espresso/55">{text}</span>}
        </span>
      </div>
    </motion.div>
  );
}

const HEADLINE_SIZES = {
  large: 'text-[2.9rem] sm:text-6xl lg:text-[4rem] xl:text-[5rem]',
  medium: 'text-[2.5rem] sm:text-[3.4rem] lg:text-[3.5rem] xl:text-[4.4rem]',
  small: 'text-[2rem] sm:text-5xl lg:text-[2.9rem] xl:text-[3.6rem]',
  poster: 'text-[2.6rem] sm:text-7xl lg:text-[5.4rem] xl:text-[6.4rem]',
};

export default function Hero({ products, config, content }) {
  const hero = content.hero;
  const layout = LOOK.theme?.hero ?? 'trio';
  const ref = useRef(null);
  const mx = useSpring(0, { stiffness: 50, damping: 14 });
  const my = useSpring(0, { stiffness: 50, damping: 14 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yBack = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const yFront = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const textFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Featured products from the content, falling back to the catalogue order if one was removed.
  const used = new Set();
  const choose = (id) => {
    const p = products.find((x) => x.id === id && !used.has(x.id)) ?? products.find((x) => !used.has(x.id));
    if (p) used.add(p.id);
    return p;
  };
  const front = choose(hero.featured.front);
  const left = choose(hero.featured.left);
  const right = choose(hero.featured.right);

  // Real photos for the photo-led banners: the brand's own shots first, then product photos (featured first).
  const pics = [];
  const addPic = (src, alt) => src && !pics.some((p) => p.src === src) && pics.push({ src, alt });
  LOOK.photos?.filter((s) => s.includes('hero-')).forEach((s) => addPic(s, `${LOOK.name}`));
  [front, left, right, ...products].forEach((p) => p && addPic(p.look?.photo, p.name));
  // split and cover need one photo; minimal needs none; the collage layouts need two. Otherwise: drawn jars.
  const style =
    layout === 'minimal' || ((layout === 'split' || layout === 'cover') && pics.length >= 1) ? layout : layout !== 'trio' && pics.length >= 2 ? layout : 'trio';

  const lines = hero.lines;
  const highlightLine = lines.findIndex((l) => hero.highlight && l.includes(hero.highlight));
  const longest = Math.max(...lines.map((l) => l.length));
  const size = style === 'poster' && longest <= 16 ? 'poster' : longest <= 12 ? 'large' : longest <= 16 ? 'medium' : 'small';
  const date = new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  const notice = content.announcement.enabled && content.announcement.text;
  const secondaryHref = content.process.enabled ? '/how-to-order' : content.story.enabled ? '/about' : '/shop';
  const center = style === 'poster';

  const delivery = config?.deliveryEnabled
    ? {
        title: 'Delivery countrywide',
        text: config.deliveryFee ? `free over ${money(config.freeDeliveryThreshold)}` : 'rider or parcel, at your cost',
      }
    : config && { title: 'Delivery coming soon', text: 'order now, collect in store' };

  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const text = (
    <motion.div style={{ y: textY, opacity: textFade }} className={cn('relative z-10', center && 'mx-auto max-w-5xl text-center')}>
      {(hero.eyebrow || hero.showDate) && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className={cn('flex origin-left items-center gap-2.5 font-tagline text-[1.75rem] leading-none text-amber sm:text-[2.1rem]', center && 'justify-center')}
        >
          {!center && <span className="h-px w-10 bg-amber/60" />}
          {isBrandTagline(hero.eyebrow) ? (
            <>
              <LoveNutHome className="h-7 sm:h-9" />
              {hero.showDate && <span>{date}</span>}
            </>
          ) : (
            [hero.eyebrow, hero.showDate && date].filter(Boolean).join(' · ')
          )}
        </motion.p>
      )}

      <h1 className={cn('mt-5 leading-[0.98] font-extrabold tracking-[-0.04em] text-espresso', HEADLINE_SIZES[size], center && 'uppercase')}>
        {lines.map((line, i) => (
          <span key={i} className="block overflow-hidden pt-[0.04em] pb-[0.1em] sm:whitespace-nowrap">
            <motion.span className="block" initial={{ y: '115%' }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.15 + i * 0.11, ease: EASE }}>
              <HeadlineLine text={line} highlight={i === highlightLine ? hero.highlight : ''} />
            </motion.span>
          </span>
        ))}
      </h1>

      {hero.text && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55, ease: EASE }}
          className={cn('mt-6 max-w-lg text-base leading-relaxed text-espresso/65 sm:text-lg', center && 'mx-auto')}
        >
          {hero.text}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.7, ease: EASE }}
        className={cn('mt-8 flex flex-col gap-3 sm:flex-row', center && 'sm:justify-center')}
      >
        <Link to="/shop" className="btn btn-primary group px-7 py-4">
          {hero.primaryCta || 'Shop now'}
          <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
        </Link>
        {hero.secondaryCta && (
          <Link to={secondaryHref} className="btn btn-ghost px-7 py-4">
            {hero.secondaryCta}
          </Link>
        )}
      </motion.div>

      {hero.showRating && hero.rating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.95 }}
          className={cn('mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm', center && 'justify-center')}
        >
          <Stars value={Number(hero.rating) || 5} className="h-4 w-4" />
          <span>
            <b className="font-bold">{hero.rating}</b>
            <span className="text-espresso/55"> {hero.ratingText}</span>
          </span>
        </motion.div>
      )}
    </motion.div>
  );

  const padTop = notice ? 'pt-36 sm:pt-44' : 'pt-28 sm:pt-36';

  // Split: words on one half, the photo filling the other half edge to edge.
  if (style === 'split') {
    const [main] = pics;
    return (
      <section id="top" ref={ref} className="relative grid overflow-hidden lg:min-h-[100svh] lg:grid-cols-2">
        <div className={cn('container-x relative flex items-center pb-14 lg:pr-12 lg:pb-20', padTop)}>{text}</div>
        <motion.div initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease: EASE }} className="relative min-h-[60svh] overflow-hidden lg:min-h-0">
          <img src={main.src} alt={main.alt} className="absolute inset-0 h-full w-full object-cover" />
          {front && (
            <Link to={`/products/${front.id}`} className="kraft absolute bottom-6 left-6 flex items-center gap-3 py-2.5 pr-5 pl-3 text-espresso">
              <span className="leading-tight">
                <span className="block text-sm font-bold">{front.name}</span>
                <span className="text-xs text-espresso/60">{money(front.price)}</span>
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </motion.div>
      </section>
    );
  }

  // Cover: one photo across the whole screen, the words over a dark fade at the bottom.
  if (style === 'cover') {
    const [main] = pics;
    return (
      <section id="top" ref={ref} className="relative flex min-h-[92svh] items-end overflow-hidden">
        <motion.img initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: EASE }} src={main.src} alt={main.alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
        {/* light words on the photo: the theme's ink and page colours swap inside the banner */}
        <div className="container-x relative pt-40 pb-16 sm:pb-20" style={{ '--color-espresso': '#FFFFFF', '--color-cream': '#121212' }}>
          {text}
        </div>
      </section>
    );
  }

  // Minimal: big words and nothing else, then the first products in a row.
  if (style === 'minimal') {
    const strip = products.slice(0, 4);
    return (
      <section id="top" ref={ref} className={cn('relative overflow-hidden pb-14', padTop)}>
        <div className="container-x relative">
          <div className="max-w-4xl">{text}</div>
          {strip.length > 0 && (
            <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {strip.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5 + i * 0.08, ease: EASE }}>
                  <Link to={`/products/${p.id}`} className="group block">
                    <span className="block aspect-[4/5] overflow-hidden rounded-[var(--r-lg)] bg-beige">
                      {p.look?.photo ? (
                        <img src={p.look.photo} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105" />
                      ) : (
                        <span className="block h-full w-full p-[12%]">
                          <ProductJar look={p.look} size={p.size} showTag={false} className="h-full w-full" />
                        </span>
                      )}
                    </span>
                    <span className="mt-3 flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate font-semibold">{p.name}</span>
                      <span className="shrink-0 tabular-nums text-espresso/60">{money(p.price)}</span>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  let visual;
  if (style === 'photo') {
    // Lifestyle shot framed big, a product shot pinned over its corner, notes like a mood board.
    const [main, second] = pics;
    visual = (
      <div className="relative mx-auto w-full max-w-[34rem] pb-[8%] lg:max-w-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
          className="absolute top-[6%] right-0 bottom-[2%] left-[18%] rounded-[var(--r-xl)] bg-sand"
        />
        <Framed src={main.src} alt={main.alt} className="relative ml-auto w-[80%]" parallax={yBack} delay={0.15} />
        <Framed src={second.src} alt={second.alt} className="absolute bottom-0 left-0 z-20 w-[42%]" parallax={yFront} delay={0.4} />
        {delivery && <Chip icon={Truck} title={delivery.title} text={delivery.text} className="right-[3%] bottom-[5%]" delay={0.9} />}
      </div>
    );
  } else if (style === 'editorial') {
    // Magazine spread: one tall uncropped photo with a caption, a small inset, no stickers.
    const [main, second] = pics;
    visual = (
      <div className="relative mx-auto w-full max-w-[32rem] lg:mr-0">
        <Framed src={main.src} alt={main.alt} className="relative w-full" parallax={yBack} delay={0.15} frame={false} />
        <Framed src={second.src} alt={second.alt} className="absolute bottom-[12%] -left-[10%] z-20 hidden w-[36%] sm:block" parallax={yFront} delay={0.45} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-3 flex items-baseline justify-between gap-4 border-t border-espresso/15 pt-3 text-[12px] tracking-[0.14em] text-espresso/55 uppercase"
        >
          <span>{front ? front.name : LOOK.name}</span>
          {front && <span className="font-semibold text-espresso tabular-nums">{money(front.price)}</span>}
        </motion.div>
      </div>
    );
  } else if (style === 'poster') {
    // Bold centred headline over a fan of real photos.
    const fan = pics.slice(0, 3);
    const spots = [
      { className: 'z-20 w-[38%] sm:w-[30%]', rotate: 0, delay: 0.3, parallax: yFront },
      { className: 'z-10 -mr-[4%] mt-[8%] w-[30%] sm:w-[24%]', rotate: 0, delay: 0.4, parallax: yBack },
      { className: 'z-10 -ml-[4%] mt-[8%] w-[30%] sm:w-[24%]', rotate: 0, delay: 0.45, parallax: yBack },
    ];
    const order = fan.length === 3 ? [1, 0, 2] : fan.map((_, i) => i);
    visual = (
      <div className="relative mt-12 flex items-start justify-center sm:mt-16">
        {order.map((i) => (
          <Framed key={fan[i].src} src={fan[i].src} alt={fan[i].alt} className={spots[i].className} rotate={spots[i].rotate} delay={spots[i].delay} parallax={spots[i].parallax} />
        ))}
        {delivery && <Chip icon={Truck} title={delivery.title} text={delivery.text} className="right-[2%] bottom-[-4%] sm:right-[12%]" delay={0.9} />}
      </div>
    );
  } else {
    visual = (
      <div className="relative mx-auto aspect-square w-full max-w-[34rem] lg:max-w-none">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
          className="absolute inset-[7%] rounded-full bg-gradient-to-br from-sand via-beige to-cream shadow-[inset_0_-30px_60px_rgba(201,133,34,0.15)] ring-1 ring-espresso/5"
        />
        {left && <FloatingJar product={left} className="absolute top-[27%] left-[-1%] z-10 w-[42%]" depth={-14} mx={mx} my={my} parallax={yBack} rotate={-9} delay={0.35} float={7} />}
        {right && <FloatingJar product={right} className="absolute top-[3%] right-0 z-10 w-[36%]" depth={-20} mx={mx} my={my} parallax={yBack} rotate={8} delay={0.5} float={8} />}
        {front && <FloatingJar product={front} className="absolute bottom-[1%] left-[17%] z-20 w-[66%]" depth={26} mx={mx} my={my} parallax={yFront} delay={0.2} float={5} tag />}

        {delivery && <Chip icon={Truck} title={delivery.title} text={delivery.text} className="right-[-1%] bottom-[-5%] sm:right-[-3%] sm:bottom-[3%]" delay={0.9} />}
      </div>
    );
  }

  return (
    <section
      id="top"
      ref={ref}
      onPointerMove={onMove}
      className={cn('grain relative overflow-hidden pb-14 lg:min-h-[100svh] lg:pb-20', notice ? 'pt-36 sm:pt-44' : 'pt-28 sm:pt-36')}
    >
      {style !== 'editorial' && (
        <div
          className="bg-dots absolute inset-0"
          style={{ maskImage: 'radial-gradient(ellipse at 70% 40%, black 10%, transparent 65%)', WebkitMaskImage: 'radial-gradient(ellipse at 70% 40%, black 10%, transparent 65%)' }}
        />
      )}
      {style === 'editorial' && <div className="absolute inset-y-0 right-0 hidden w-[38%] bg-sand/70 lg:block" />}
      {style === 'poster' ? (
        <div className="absolute top-[28%] left-1/2 h-[46rem] w-[60rem] -translate-x-1/2" style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-honey) 22%, transparent), transparent)' }} />
      ) : (
        style !== 'editorial' && (
          <>
            <div className="absolute -top-64 -right-56 h-[52rem] w-[52rem]" style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-honey) 26%, transparent), transparent)' }} />
            <div className="absolute -bottom-56 -left-56 h-[40rem] w-[40rem]" style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-latte) 36%, transparent), transparent)' }} />
          </>
        )
      )}

      {center ? (
        <div className="container-x relative">
          {text}
          {visual}
        </div>
      ) : (
        <div className={cn('container-x relative grid items-center gap-10 lg:gap-6', style === 'editorial' ? 'lg:grid-cols-[1.1fr_1fr] lg:gap-16' : 'lg:grid-cols-[1.05fr_1fr]')}>
          {text}
          {visual}
        </div>
      )}

      {!center && (
        <motion.a
          href="#shop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-espresso/45 uppercase lg:flex"
        >
          Scroll
          <span className="relative h-10 w-6 rounded-full border border-espresso/20">
            <span className="animate-scroll-dot absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber" />
          </span>
        </motion.a>
      )}
    </section>
  );
}
