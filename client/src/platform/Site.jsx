// The frame shared by the Kabuor Builds company site: the company page (/), and one page per product
// (/shops, /erp). Same header and footer everywhere, so people always know which product they're looking at
// and can switch between them.
import { Link, NavLink } from 'react-router';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { cn } from '../lib/format';

/** The Kabuor logo (brand v2): KABUOR with its cut O, drawn as one file per brand, white on dark, blue on light.
 * Which brand comes from the name, so "Kabuor Builds" (PLATFORM_NAME) and "Kabuor ERP" get their own O. */
export function Wordmark({ name = 'Kabuor Technologies', light = false, stacked = false, tagline, className = '' }) {
  const brand = /erp/i.test(name ?? '') ? 'erp' : /builds|shops/i.test(name ?? '') ? 'builds' : 'technologies';
  const src = `/brand/kabuor-${brand}-logo-${light ? 'white' : 'blue'}.svg`;
  // Technologies carries TECHNOLOGIES under it, so it's taller; the product lockups are one line.
  const size = brand === 'technologies' ? (stacked ? 'h-16 sm:h-20' : 'h-11 sm:h-13') : stacked ? 'h-9 sm:h-11' : 'h-7 sm:h-8';
  return (
    <span className={`inline-flex flex-col items-start ${className}`}>
      <img src={src} alt={name ?? 'Kabuor Technologies'} className={`${size} w-auto max-w-full shrink-0`} />
      {stacked && tagline && <span className={`kb-serif mt-3 block text-xl whitespace-normal ${light ? 'text-cream/80' : 'text-cocoa'}`}>{tagline}</span>}
    </span>
  );
}

/** Where the product pages live. Empty on the platform itself; the platform's address on the standalone company
 * site (VITE_PRODUCT_ORIGIN), so "Shops", "ERP" and "Start your shop" open the product pages there. */
export const PRODUCT_ORIGIN = (import.meta.env.VITE_PRODUCT_ORIGIN ?? '').replace(/\/+$/, '');

const resolveDeployUrl = (val, fallback) => {
  const s = (val ?? '').trim();
  if (!s || s.includes('railway')) return fallback;
  return s.replace(/\/+$/, '');
};

/** Live deployment links for the two products */
export const SHOPS_RAILWAY_URL = resolveDeployUrl(
  import.meta.env.VITE_SHOPS_URL ?? import.meta.env.VITE_SHOPS_RAILWAY_URL,
  'https://builds.kabuor-technologies.company'
);

export const ERP_RAILWAY_URL = resolveDeployUrl(
  import.meta.env.VITE_ERP_URL ?? import.meta.env.VITE_ERP_RAILWAY_URL,
  'https://erp.kabuor-technologies.company'
);

/** A link to a page: inside the app on the platform, or to the platform's product pages from the company site. */
export function Go({ to, children, ...props }) {
  if (PRODUCT_ORIGIN && to !== '/' && !to.startsWith('/#')) return <a href={PRODUCT_ORIGIN + to} {...props}>{children}</a>;
  return <Link to={to} {...props}>{children}</Link>;
}

export const tel = (phone) => `tel:${phone.replace(/\s/g, '')}`;
export const whatsapp = (phone, text) => `https://wa.me/254${phone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(text)}`;

export const PRODUCTS = [
  { to: '/shops', name: 'Kabuor Shops', short: 'Shops', line: 'Online shops for brands', launchUrl: SHOPS_RAILWAY_URL },
  { to: '/erp', name: 'Kabuor ERP', short: 'ERP', line: 'Run the whole business', launchUrl: ERP_RAILWAY_URL },
];

/** On ink (light text) over the dark heroes. `cta` is this page's main action: { to | href, label }. */
export function SiteHeader({ info, cta }) {
  const isCompany = typeof window !== 'undefined' && (/kabuor-technologies/i.test(window.location.hostname) || window.location.pathname === '/' || window.location.pathname === '/careers' || !info?.name || /technologies/i.test(info?.name));
  const name = isCompany ? 'Kabuor Technologies' : (info?.name ?? 'Kabuor Technologies');
  const link = ({ isActive }) => cn('rounded-full px-2.5 py-2 transition sm:px-3', isActive ? 'bg-white/10 text-cream' : 'text-cream/70 hover:text-cream');
  return (
    <header className="container-x relative flex items-center justify-between gap-3 py-5">
      <Link to="/" aria-label={`${name} home`} className="min-w-0">
        <Wordmark name={name} light />
      </Link>
      <nav className="flex shrink-0 items-center gap-0.5 text-sm font-semibold" aria-label="Main">
        {PRODUCTS.map((p) =>
          PRODUCT_ORIGIN ? (
            <a key={p.to} href={PRODUCT_ORIGIN + p.to} className={link({ isActive: false })}>
              <span className="sm:hidden">{p.short}</span>
              <span className="hidden sm:inline">{p.name.replace('Kabuor ', '')}</span>
            </a>
          ) : (
            <NavLink key={p.to} to={p.to} className={link}>
              <span className="sm:hidden">{p.short}</span>
              <span className="hidden sm:inline">{p.name.replace('Kabuor ', '')}</span>
            </NavLink>
          ),
        )}
        <a href="/#about" className="hidden rounded-full px-3 py-2 text-cream/70 hover:text-cream lg:block">
          About
        </a>
        <NavLink to="/careers" className={({ isActive }) => cn(link({ isActive }), 'hidden lg:block')}>
          Careers <span className="rounded bg-[#2357F5]/60 px-1.5 py-0.5 text-xs font-bold tracking-wider text-white uppercase">Hiring</span>
        </NavLink>
        <a href="#contact" className="hidden rounded-full px-3 py-2 text-cream/70 hover:text-cream lg:block">
          Contact
        </a>
        {cta &&
          (cta.to ? (
            <Go to={cta.to} className="btn ml-1.5 hidden bg-cream px-5 py-2.5 whitespace-nowrap text-espresso hover:bg-white sm:inline-flex">
              {cta.label}
            </Go>
          ) : (
            <a href={cta.href} target={cta.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="btn ml-1.5 hidden bg-cream px-5 py-2.5 whitespace-nowrap text-espresso hover:bg-white sm:inline-flex">
              {cta.label}
            </a>
          ))}
      </nav>
    </header>
  );
}

/** Ways to reach a person: WhatsApp first (it's how Kenyan businesses talk), then call, then email. */
export function ContactButtons({ info, message, className }) {
  if (!info?.phone) return null;
  return (
    <div className={cn('flex flex-col gap-2.5 sm:flex-row', className)}>
      <a href={whatsapp(info.phone, message)} target="_blank" rel="noreferrer" className="btn bg-[#1E8E3E] px-6 py-3.5 text-[#fff] hover:bg-[#176F30]">
        <MessageCircle className="h-4 w-4" /> WhatsApp {info.phone}
      </a>
      <a href={tel(info.phone)} className="btn btn-ghost px-6 py-3.5">
        <Phone className="h-4 w-4" /> Call
      </a>
      {info.email && (
        <a href={`mailto:${info.email}`} className="btn btn-ghost px-6 py-3.5">
          <Mail className="h-4 w-4" /> Email
        </a>
      )}
    </div>
  );
}

export function SiteFooter({ info, children }) {
  const name = info?.name ?? 'Kabuor Technologies';
  return (
    <footer id="contact" className="kb-ink relative scroll-mt-6 overflow-hidden pt-14 pb-8">
      <div className="container-x relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr]">
        <div>
          <Wordmark name={name} light stacked tagline={info?.tagline ?? 'Mlete deals.'} />
          <p className="mt-5 max-w-xs text-sm text-cream/60">Software for Kenyan businesses, built in Kenya: M-Pesa first, KRA-ready, in English and Kiswahili.</p>
        </div>
        <nav className="grid content-start gap-2 text-sm" aria-label="Products">
          <p className="mb-1 font-semibold text-cream/50">Products</p>
          {PRODUCTS.map((p) => (
            <Go key={p.to} to={p.to} className="text-cream/80 hover:text-cream">
              {p.name}
              <span className="block text-xs text-cream/45">{p.line}</span>
            </Go>
          ))}
        </nav>
        <nav className="grid content-start gap-2 text-sm" aria-label="Company">
          <p className="mb-1 font-semibold text-cream/50">Company</p>
          <a href="/#about" className="text-cream/80 hover:text-cream">
            About us
          </a>
          <a href="/#work" className="text-cream/80 hover:text-cream">
            Our work
          </a>
          <Go to="/start" className="text-cream/80 hover:text-cream">
            Start a shop
          </Go>
          <Link to="/careers" className="text-cream/80 hover:text-cream flex items-center gap-1.5">
            Careers <span className="rounded bg-[#2357F5]/30 px-1.5 py-0.5 text-xs font-bold text-white">We're hiring</span>
          </Link>
          <a
            href="https://www.linkedin.com/in/rooney-odhiambo-9a26b6256"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream/80 hover:text-cream flex items-center gap-1.5"
          >
            Founder on LinkedIn
          </a>
        </nav>
        <div>
          {children ?? (
            <>
              <p className="mb-3 text-sm font-semibold text-cream/50">Talk to us</p>
              {info?.phone && (
                <p className="text-sm text-cream/70">
                  <a href={tel(info.phone)} className="text-lg font-semibold text-[#9DB6FF] hover:underline">
                    {info.phone}
                  </a>
                  <a href={`mailto:${info.email}`} className="block hover:text-cream">
                    {info.email}
                  </a>
                </p>
              )}
              {info?.phone && (
                <a href={whatsapp(info.phone, `Hi ${name}, `)} target="_blank" rel="noreferrer" className="btn mt-4 bg-[#1E8E3E] px-5 py-3 text-[#fff] hover:bg-[#176F30]">
                  <MessageCircle className="h-4 w-4" /> WhatsApp us
                </a>
              )}
            </>
          )}
        </div>
      </div>
      <p className="container-x relative mt-10 border-t border-white/10 pt-6 text-xs text-cream/45">
        © {new Date().getFullYear()} {name} · Ngong Road, Nairobi · Fully Remote
      </p>
    </footer>
  );
}
