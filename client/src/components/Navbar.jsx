import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { BookOpen, HelpCircle, House, Megaphone, Phone, ShoppingBag, ShoppingBasket, Sprout } from 'lucide-react';
import { useCart, useCartCount } from '../store/cart';
import { byCountry, telHref } from '../lib/branches';
import { cn } from '../lib/format';
import SmartLink from './SmartLink';
import { EASE, Logo, useLockBody } from './ui';
import { LOOK } from '../lib/brand';

// One page per section the admin has switched on; labels come from each section's eyebrow.
export function navLinks(content, hasUpdates = false) {
  return [
    ['Shop', '/shop'],
    content.updates?.enabled && hasUpdates && [content.updates.eyebrow || 'Updates', '/updates'],
    content.process.enabled && [content.process.eyebrow || 'How to order', '/how-to-order'],
    content.story.enabled && [content.story.eyebrow || 'About us', '/about'],
    (content.faq.enabled || content.newsletter.enabled) && ['FAQ & branches', '/faq'],
  ].filter(Boolean);
}

export default function Navbar({ content, links }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const count = useCartCount();
  const bump = useCart((s) => s.bump);
  const setOpen = useCart((s) => s.setOpen);
  const { pathname } = useLocation();
  const header = useRef(null);
  useLockBody(menu);

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24));
  useEffect(() => setMenu(false), [pathname]);

  // Pages pad their top by the bar's real height (it grows when the announcement shows).
  useLayoutEffect(() => {
    const el = header.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty('--nav-h', `${el.offsetHeight + 12}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The design's menu: pill (floating rounded bar), bar (full-width strip), centered (logo in the middle),
  // or minimal (logo and a menu button only, on every screen size).
  const kind = LOOK.theme?.nav ?? 'pill';
  const solid = scrolled || menu || pathname !== '/';
  const notice = content.announcement;
  const showNotice = notice.enabled && notice.text && !scrolled && !menu;

  return (
    <>
      <motion.header
        ref={header}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <AnimatePresence initial={false}>
          {showNotice && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="overflow-hidden bg-espresso text-cream"
            >
              <p className="container-x flex items-center justify-center gap-2 py-2 text-center text-xs leading-snug sm:text-[13px]">
                <Megaphone className="hidden h-3.5 w-3.5 shrink-0 text-honey sm:block" />
                <span>{notice.text}</span>
                {notice.linkLabel && notice.linkHref && (
                  <SmartLink href={notice.linkHref} className="shrink-0 font-semibold text-honey underline underline-offset-2 hover:text-cream">
                    {notice.linkLabel}
                  </SmartLink>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={kind === 'bar' ? '' : 'px-3 pt-3 sm:px-5'}>
          <nav
            className={cn(
              'mx-auto flex h-14 items-center justify-between gap-2 transition-all duration-500 ease-out-expo sm:h-16',
              kind === 'bar' ? 'h-16! border-b border-espresso/[0.08] bg-cream px-4 sm:h-[4.5rem]! sm:px-8' : 'max-w-7xl rounded-full pr-2 pl-3 sm:pl-5',
              kind === 'centered' && 'lg:grid lg:grid-cols-[1fr_auto_1fr]',
              kind !== 'bar' &&
                (solid
                  ? 'border border-espresso/[0.07] bg-cream/95 shadow-[0_10px_40px_-20px_rgba(46,31,20,0.45)] md:bg-cream/85 md:backdrop-blur-md'
                  : 'border border-transparent'),
            )}
          >
            <Link to="/" aria-label={`${content.brand.name} home`} className={cn('min-w-0', kind === 'centered' && 'lg:order-2 lg:justify-self-center')}>
              <Logo />
            </Link>

            <ul className={cn('hidden items-center gap-1', kind !== 'minimal' && 'lg:flex', kind === 'centered' && 'lg:order-1 lg:justify-self-start')}>
              {links.map(([label, to]) => (
                <li key={to}>
                  <NavLink to={to} className="group relative block rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap xl:px-4 text-espresso/70 transition hover:text-espresso aria-[current=page]:text-espresso">
                    {({ isActive }) => (
                      <>
                        {label}
                        <span className={cn('absolute inset-x-4 bottom-1 h-px origin-left bg-amber transition-transform duration-500 ease-out-expo group-hover:scale-x-100', isActive ? 'scale-x-100' : 'scale-x-0')} />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className={cn('flex shrink-0 items-center gap-1.5', kind === 'centered' && 'lg:order-3 lg:justify-self-end')}>
              <span className={cn('hidden', kind !== 'minimal' && kind !== 'centered' && 'md:block')}>
                <Link to="/shop" className="btn btn-primary py-2.5!">
                  Shop now
                </Link>
              </span>
              <button
                id="cart-button"
                onClick={() => setOpen(true)}
                className="relative grid h-11 w-11 place-items-center rounded-full bg-white/70 text-espresso shadow-sm ring-1 ring-espresso/[0.07] transition hover:bg-white"
                aria-label={`Open cart, ${count} items`}
              >
                <motion.span
                  key={bump}
                  initial={bump ? { rotate: -22, scale: 1.3 } : false}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 9 }}
                >
                  <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
                </motion.span>
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                      className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-honey px-1 text-[11px] font-bold text-espresso ring-2 ring-cream"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <button
                onClick={() => setMenu((m) => !m)}
                className={cn('grid h-11 w-11 place-items-center rounded-full', kind !== 'minimal' && 'lg:hidden')}
                aria-label={menu ? 'Close menu' : 'Open menu'}
                aria-expanded={menu}
              >
                <span className="relative block h-3 w-5">
                  <motion.span animate={menu ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }} className="absolute top-0 left-0 h-0.5 w-5 rounded bg-espresso" />
                  <motion.span animate={menu ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }} className="absolute bottom-0 left-0 h-0.5 w-5 rounded bg-espresso" />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 44px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
            transition={{ duration: 0.7, ease: EASE }}
            className={cn('bg-dots fixed inset-0 z-40 flex flex-col overflow-y-auto bg-beige px-6 pt-28 pb-10', kind !== 'minimal' && 'lg:hidden')}
          >
            <ul className="space-y-1">
              {[['Home', '/'], ...links].map(([label, to], i) => (
                <motion.li key={to} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: EASE }}>
                  <NavLink to={to} end className="flex items-baseline gap-3 py-2 text-4xl font-extrabold tracking-tight text-espresso aria-[current=page]:text-caramel">
                    <span className="text-xs font-semibold text-caramel">0{i + 1}</span>
                    {label}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-auto space-y-5 pt-10">
              {byCountry(content.brand.branches).map((g, _, all) => (
                <div key={g.country}>
                  {all.length > 1 && <p className="mb-1.5 font-hand text-lg text-caramel">{g.country}</p>}
                  <ul className="grid grid-cols-2 gap-2 text-sm">
                    {g.branches.map((b) => (
                      <li key={b.city}>
                        <a href={telHref(b.phone)} className="flex flex-col rounded-[var(--r-lg)] bg-white/70 px-3 py-2.5 ring-1 ring-espresso/[0.06]">
                          <span className="font-bold">{b.city}</span>
                          <span className="flex items-center gap-1 text-espresso/60">
                            <Phone className="h-3 w-3" /> {b.phone}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Link to="/shop" className="btn btn-primary w-full">
                Shop now
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Phone tab bar: the main pages one tap away, like an app.
export function MobileTabs({ content, hasUpdates }) {
  const tabs = [
    ['Home', '/', House],
    ['Shop', '/shop', ShoppingBasket],
    content.process.enabled && ['Order', '/how-to-order', BookOpen],
    content.updates?.enabled && hasUpdates && ['Updates', '/updates', Megaphone],
    (content.faq.enabled || content.newsletter.enabled) && ['Help', '/faq', HelpCircle],
    content.story.enabled && ['About', '/about', Sprout],
  ]
    .filter(Boolean)
    .slice(0, 5);
  return (
    <nav
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 grid items-center rounded-[var(--r-xl)] bg-espresso p-1.5 shadow-[0_20px_40px_-15px_rgba(30,20,12,0.6)] lg:hidden"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      aria-label="Pages"
    >
      {tabs.map(([label, to, Icon]) => (
        <NavLink key={to} to={to} end className="relative">
          {({ isActive }) => (
            <span className={cn('relative flex flex-col items-center gap-0.5 rounded-[var(--r-lg)] py-2 text-[10.5px] font-semibold transition-colors', isActive ? 'text-espresso' : 'text-cream/60')}>
              {isActive && <motion.span layoutId="site-tab" className="absolute inset-0 rounded-[var(--r-lg)] bg-honey" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <Icon className="relative h-5 w-5" />
              <span className="relative">{label}</span>
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
