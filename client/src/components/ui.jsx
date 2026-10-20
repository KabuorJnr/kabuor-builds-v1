import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';
import { BRAND, LOOK } from '../lib/brand';
import { useSite } from '../lib/api';
import { cn } from '../lib/format';

export const EASE = [0.16, 1, 0.3, 1];

// The brand's mark: its initials in a ring, drawn in the brand font (200 × 100 box, like a seal).
export const BRAND_ORANGE = 'var(--color-honey)';

export function ApbShapes({ color = 'var(--color-honey)' }) {
  const mark = LOOK.logo.mark;
  return (
    <g style={{ fill: color, stroke: color }}>
      <ellipse cx="100" cy="50" rx="95.2" ry="45" fill="none" strokeWidth="5.4" />
      <text x="100" y="52" textAnchor="middle" dominantBaseline="central" stroke="none" fontSize={mark.length > 2 ? 46 : 62} style={{ fontFamily: 'var(--font-brand)' }}>
        {mark}
      </text>
    </g>
  );
}

export function ApbMark({ className = '', color }) {
  // An uploaded logo replaces the drawn initials everywhere the mark appears.
  if (LOOK.logo?.image) return <img src={LOOK.logo.image} alt={LOOK.name} className={cn(className, 'object-contain')} />;
  return (
    <svg viewBox="0 0 200 100" className={className} role="img" aria-label={LOOK.name}>
      <ApbShapes color={color} />
    </svg>
  );
}

export function useBrand() {
  return useSite((s) => s.content?.brand) ?? BRAND;
}

// The brand's wordmark: its name in the brand font with a small line underneath.
export function Logo({ light = false, className = '' }) {
  const { name } = useBrand();
  const { top, bottom } = LOOK.logo;
  return (
    // The words shrink and trim on narrow phones so the cart and menu buttons always stay on screen.
    <span className={cn('inline-flex min-w-0 items-center gap-2 sm:gap-2.5', className)} aria-label={name}>
      <ApbMark className="h-8 w-16 shrink-0 sm:h-10 sm:w-20" />
      <span className={cn('h-8 w-px shrink-0', light ? 'bg-cream/25' : 'bg-espresso/20')} aria-hidden />
      <span className="min-w-0 leading-none whitespace-nowrap" aria-hidden>
        <span className={cn('block truncate font-brand text-[18px] sm:text-[21px]', light ? 'text-cream' : 'text-cocoa')}>{top}</span>
        <span className={cn('mt-1 block truncate text-[9px] font-semibold tracking-[0.14em] uppercase sm:text-[9.5px] sm:tracking-[0.16em]', light ? 'text-honey' : 'text-amber')}>{bottom}</span>
      </span>
    </span>
  );
}

// The brand's little decoration (40 × 64 box): a chilli, bee, droplet, flame or leaf. Keeps the old name so
// every place that scattered peanuts now scatters the brand's own motif.
export function Peanut({ className = '', fill, stroke }) {
  const f = fill ?? 'var(--color-honey)';
  const k = stroke ?? 'var(--color-caramel)';
  const shapes = {
    chilli: (
      <>
        <path d="M21 14c8 4 11 16 8 28-3 11-11 19-19 20 5-6 8-14 8-24 0-9 0-17 3-24Z" style={{ fill: f, stroke: k }} strokeWidth="1.6" />
        <path d="M21 14c-1-5 2-9 7-11M19 15c4-3 8-2 10 1" fill="none" style={{ stroke: 'var(--color-caramel)' }} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M23 22c3 3 3 9 2 14" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    bee: (
      <>
        <ellipse cx="11" cy="22" rx="8" ry="11" fill="#fff" fillOpacity=".75" style={{ stroke: k }} strokeWidth="1.2" />
        <ellipse cx="29" cy="22" rx="8" ry="11" fill="#fff" fillOpacity=".75" style={{ stroke: k }} strokeWidth="1.2" />
        <ellipse cx="20" cy="40" rx="11" ry="15" style={{ fill: f, stroke: 'var(--color-espresso)' }} strokeWidth="1.6" />
        <path d="M10 36h20M9.5 43h21M12 50h16" style={{ stroke: 'var(--color-espresso)' }} strokeWidth="3.2" />
        <circle cx="20" cy="24" r="5.5" style={{ fill: 'var(--color-espresso)' }} />
      </>
    ),
    drop: (
      <>
        <path d="M20 4C27 18 34 28 34 40a14 14 0 0 1-28 0C6 28 13 18 20 4Z" style={{ fill: f, stroke: k }} strokeWidth="1.6" />
        <path d="M13 38c0-5 3-10 5-13" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2.4" strokeLinecap="round" />
      </>
    ),
    flame: (
      <>
        <path d="M20 4c3 10 14 16 14 32a14 14 0 0 1-28 0c0-9 5-13 7-19 2 5 3 8 6 9-1-8-1-15 1-22Z" style={{ fill: f, stroke: k }} strokeWidth="1.6" />
        <path d="M20 30c4 5 7 9 7 14a7 7 0 0 1-14 0c0-4 3-8 7-14Z" fill="#FFF3C4" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 60C6 46 6 22 20 4c14 18 14 42 0 56Z" style={{ fill: f, stroke: k }} strokeWidth="1.6" />
        <path d="M20 58V12M20 26l-7-6M20 36l8-7M20 46l-8-7" fill="none" style={{ stroke: k }} strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 40 64" className={className} aria-hidden>
      {shapes[LOOK.motif] ?? shapes.drop}
    </svg>
  );
}

// A peanut drifting and tumbling along a looping path. `path` is a list of [x, y] offsets in px.
// Uses Web Animations on transform, which the GPU runs without per-frame JavaScript.
export function FloatingPeanut({ className, path, duration = 12, delay = 0, size = 'w-7', spin = 1 }) {
  const drift = useRef(null);
  const tumble = useRef(null);
  const route = JSON.stringify(path);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const points = JSON.parse(route);
    const a = drift.current?.animate(
      points.map(([x, y]) => ({ transform: `translate(${x}px, ${y}px)`, easing: 'ease-in-out' })),
      { duration: duration * 1000, delay: delay * 1000, iterations: Infinity },
    );
    const b = tumble.current?.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${360 * spin}deg)` }], {
      duration: duration * 1600,
      iterations: Infinity,
    });
    return () => {
      a?.cancel();
      b?.cancel();
    };
  }, [route, duration, delay, spin]);
  return (
    <div ref={drift} className={cn('pointer-events-none absolute z-20', className)}>
      <div ref={tumble}>
        <Peanut className={cn(size, 'drop-shadow-[0_8px_8px_rgba(46,31,20,0.25)]')} />
      </div>
    </div>
  );
}

export function Reveal({ children, delay = 0, y = 14, className, as = 'div', ...rest }) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.5, delay: Math.min(delay, 0.15), ease: EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function Stars({ value = 5, className = 'h-3.5 w-3.5' }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={cn(className, i < Math.round(value) ? 'fill-honey text-honey' : 'fill-sand text-sand')} />
      ))}
    </span>
  );
}

export function CountUp({ to, duration = 2, format = (n) => Math.round(n).toLocaleString('en-US'), className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration, ease: EASE, onUpdate: setVal });
    return () => controls.stop();
  }, [inView, to, duration]);
  return (
    <span ref={ref} className={className}>
      {format(val)}
    </span>
  );
}

// A short hand-drawn flourish that trails the hand-lettered labels.
export function Squiggle({ className = '' }) {
  return (
    <svg viewBox="0 0 40 14" className={className} aria-hidden>
      <path d="M2 9 C8 2, 14 12, 20 6 S32 3, 38 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// At display sizes the font leaves a visible gap before , and . so tuck them in.
export function Display({ children }) {
  if (typeof children !== 'string') return children;
  return children.split(/([,.])/).map((part, i) =>
    part === ',' || part === '.' ? (
      <span key={i} className="-ml-[0.12em]">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export function SectionHeading({ eyebrow, title, children, align = 'left', light = false }) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <Reveal>
        {eyebrow && (
          <span className={cn('eyebrow', light && 'text-honey')}>
            {eyebrow}
            <Squiggle className="h-3 w-9" />
          </span>
        )}
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className={cn('mt-4 text-[2rem] leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl', light ? 'text-cream' : 'text-espresso')}>
          <Display>{title}</Display>
        </h2>
      </Reveal>
      {children && (
        <Reveal delay={0.1}>
          <p className={cn('mt-4 text-base leading-relaxed text-pretty sm:text-lg', light ? 'text-cream/65' : 'text-espresso/60')}>{children}</p>
        </Reveal>
      )}
    </div>
  );
}

export function useLockBody(locked) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

export function useMediaQuery(query) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}
