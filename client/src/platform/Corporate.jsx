// The frame every Kabuor Technologies page shares (the company page, Kabuor ERP, Kabuor Shops, Careers): a plain
// corporate layout in the manner of large software companies' sites. A white header with the products as text links
// and one blue action, a grey footer of link columns, and the small pieces pages repeat. Styles live under .ms
// (platform.css); wrap a page in <CorporatePage> to get them.
import { useState } from 'react';
import { Link } from 'react-router';
import { Menu, X } from 'lucide-react';
import { ERP_RAILWAY_URL, Go, tel, whatsapp } from './Site';
import { CONTACT_EMAIL } from './contact';

export const FOUNDER = {
  name: 'Rooney Odhiambo Kabuor',
  first: 'Rooney',
  title: 'Founder & CEO',
  phone: '0705 607 954',
  email: CONTACT_EMAIL,
  linkedin: 'https://www.linkedin.com/in/rooney-odhiambo-9a26b6256',
};
export const LEGAL = 'https://erp.kabuor-technologies.company';

const NAV = [
  { to: '/erp', label: 'Kabuor ERP' },
  { to: '/shops', label: 'Kabuor Shops' },
  { href: '/#work', label: 'Customers' },
  { href: '/#about', label: 'About' },
  { to: '/careers', label: 'Careers' },
];

function NavItem({ item, className, onClick, ...rest }) {
  return item.to ? (
    <Go to={item.to} className={className} onClick={onClick} {...rest}>
      {item.label}
    </Go>
  ) : (
    <a href={item.href} className={className} onClick={onClick}>
      {item.label}
    </a>
  );
}

/** White bar: the company's logo, the products and pages as plain text links (the page you're on underlined), and
 * this page's one main action (cta: { href, label }, external links open in a new tab). */
function Header({ cta = { href: '/#demo', label: 'Request a demo' } }) {
  const [open, setOpen] = useState(false);
  const here = typeof window === 'undefined' ? '/' : window.location.pathname;
  const ext = cta.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  const close = () => setOpen(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--ms-line)] bg-white">
      <div className="container-x flex h-16 items-center gap-6">
        <Link to="/" aria-label="Kabuor Technologies home" className="shrink-0">
          <img src="/brand/kabuor-technologies-logo-blue.svg" alt="Kabuor Technologies" className="h-9 w-auto" />
        </Link>
        <nav className="hidden flex-1 items-center gap-1 text-[0.9375rem] lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <NavItem key={item.label} item={item} aria-current={item.to === here ? 'page' : undefined} className={`rounded px-3 py-2 text-[var(--ms-ink)] underline-offset-[6px] hover:underline ${item.to === here ? 'font-semibold underline decoration-2' : ''}`} />
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a href="/#contact" className="hidden px-3 py-2 text-[0.9375rem] hover:underline hover:underline-offset-4 sm:block">
            Contact us
          </a>
          <a href={cta.href} {...ext} className="ms-btn ms-btn-primary hidden py-2 sm:inline-flex">
            {cta.label}
          </a>
          <button type="button" className="grid h-10 w-10 place-items-center rounded lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="ms-menu" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="ms-menu" className="border-t border-[var(--ms-line)] bg-white lg:hidden" aria-label="Main">
          <div className="container-x grid py-2">
            {[...NAV, { href: '/#contact', label: 'Contact us' }].map((item) => (
              <NavItem key={item.label} item={item} onClick={close} className="flex items-center justify-between border-b border-[var(--ms-line)] py-3.5 text-base last:border-0">
                {item.label}
              </NavItem>
            ))}
            <a href={cta.href} {...ext} onClick={close} className="ms-btn ms-btn-primary my-3">
              {cta.label}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

/** A real screenshot in a plain browser window (screenshots of the running systems, in /brand). */
export function BrowserShot({ src, alt, address, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-lg border border-[var(--ms-line)] bg-white shadow-[0_16px_40px_-20px_rgba(0,0,0,0.3)] ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-[var(--ms-line)] bg-[#FAFAFA] px-3 py-2">
        <i className="h-2.5 w-2.5 rounded-full bg-[#d6d6d6]" />
        <i className="h-2.5 w-2.5 rounded-full bg-[#d6d6d6]" />
        <i className="h-2.5 w-2.5 rounded-full bg-[#d6d6d6]" />
        {address && <span className="ml-2 min-w-0 flex-1 truncate rounded bg-white px-2 py-0.5 text-[11px] text-[var(--ms-muted)]">{address}</span>}
      </div>
      <img src={src} alt={alt} width="1600" height="1000" loading="lazy" className="aspect-[16/10] w-full object-cover object-top" />
    </div>
  );
}

/** A real phone screenshot in a plain phone frame. */
export function PhoneShot({ src, alt, className = '' }) {
  return (
    <div className={`rounded-[1.6rem] bg-[#1b1b1b] p-1.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.45)] ${className}`}>
      <img src={src} alt={alt} width="540" height="1169" loading="lazy" className="aspect-[9/17] w-full rounded-[1.25rem] object-cover object-top" />
    </div>
  );
}

export const SectionHead = ({ title, text, id }) => (
  <div className="max-w-3xl">
    <h2 id={id} className="text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-tight">
      {title}
    </h2>
    {text && <p className="mt-3 text-lg leading-relaxed text-[var(--ms-muted)]">{text}</p>}
  </div>
);

export function Footer() {
  const cols = [
    ['Products', [
      { to: '/erp', label: 'Kabuor ERP' },
      { to: '/shops', label: 'Kabuor Shops' },
      { to: '/start', label: 'Start a shop' },
      { href: ERP_RAILWAY_URL, label: 'Sign in to Kabuor ERP' },
    ]],
    ['For business', [
      { href: '/#demo', label: 'Request a demo' },
      { href: '/#choose', label: 'Which product fits' },
      { href: '/#work', label: 'Customer stories' },
    ]],
    ['Company', [
      { href: '/#about', label: 'About Kabuor Technologies' },
      { to: '/careers', label: 'Careers' },
      { href: FOUNDER.linkedin, label: 'Founder on LinkedIn' },
    ]],
    ['Contact', [
      { href: whatsapp(FOUNDER.phone, 'Hi Kabuor Technologies, '), label: 'WhatsApp us' },
      { href: tel(FOUNDER.phone), label: FOUNDER.phone },
      { href: `mailto:${FOUNDER.email}`, label: 'Email us' },
    ]],
  ];
  return (
    <footer className="bg-[var(--ms-soft)] text-[0.8125rem] text-[#616161]">
      <div className="container-x grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
        {cols.map(([title, links]) => (
          <nav key={title} aria-label={title}>
            <p className="mb-3 text-[0.9375rem] font-semibold text-[var(--ms-ink)]">{title}</p>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Go to={l.to} className="hover:text-[var(--ms-ink)] hover:underline">
                      {l.label}
                    </Go>
                  ) : (
                    <a href={l.href} {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="hover:text-[var(--ms-ink)] hover:underline">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="container-x flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#d6d6d6] py-5">
        <span>Nairobi, Kenya</span>
        <a href={`${LEGAL}/privacy`} className="hover:underline">
          Privacy
        </a>
        <a href={`${LEGAL}/terms`} className="hover:underline">
          Terms of use
        </a>
        <span className="sm:ml-auto">© {new Date().getFullYear()} Kabuor Technologies</span>
      </div>
    </footer>
  );
}


/** A page in the corporate look: skip link, header (with this page's main action) and footer around it. */
export function CorporatePage({ cta, children }) {
  return (
    <div className="ms min-h-svh">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-white focus:p-3">
        Skip to content
      </a>
      <Header cta={cta} />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}
