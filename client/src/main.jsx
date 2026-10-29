import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { MotionConfig } from 'framer-motion';
import './index.css';
import { applyLook } from './lib/theme';
import { previewKey } from './lib/api';
import { PATH_SHOP, SHOP_BASE, linkLabel, setPlatformDomain } from './lib/base';
import { BUILDS_HOST } from './platform/contact';

// One website for the platform and every shop. The server says who we are from the address:
// the platform itself, a shop (with its look), or a shop link nobody has taken yet.
// A preview link (?preview=…) from the signup wizard: remember the key for this tab and tidy the address.
const previewParam = new URLSearchParams(window.location.search).get('preview');
if (previewParam) {
  try {
    sessionStorage.setItem(`shop-preview${SHOP_BASE}`, previewParam);
  } catch {}
  window.history.replaceState(null, '', window.location.pathname);
}
const isCompanyDomain = typeof window !== 'undefined' && (/kabuor-technologies|kabuor-builds/i.test(window.location.hostname) || window.location.hostname === 'localhost');
// On the company's own addresses a slow answer can fall back to the company site after a moment. On a shop's address
// it must not: a shopper on a slow connection would be shown Kabuor's site instead of the shop. There we wait much
// longer, and if the server can't be reached at all, say so with a way to try again.
const companyPage = isCompanyDomain && !PATH_SHOP;
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), companyPage ? 1500 : 15000);

const site = companyPage && window.location.pathname === '/careers'
  ? { kind: 'platform', name: 'Kabuor Technologies' }
  : await fetch('/api/site', {
      signal: controller.signal,
      headers: { ...(previewKey() ? { 'X-Preview-Token': previewKey() } : {}), ...(PATH_SHOP ? { 'X-Shop': PATH_SHOP } : {}) },
    })
      .then((r) => r.json())
      .catch(() => (companyPage ? { kind: 'platform', name: 'Kabuor Technologies' } : { kind: 'offline' }))
      .finally(() => clearTimeout(timeoutId));

setPlatformDomain(site.domain ?? site.platform?.domain);

// The page's title, description and icon for whoever this is (the server fills these in too where it serves
// the page itself; on Vercel the static shell arrives with the platform's defaults).
function head({ title, description, icon }) {
  document.title = title;
  if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  if (icon) document.querySelector('link[rel="icon"]')?.setAttribute('href', icon);
}

let Root;
if (site.kind === 'offline') {
  head({ title: 'Couldn’t load this shop' });
  Root = () => (
    <main style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', padding: '1.5rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Couldn’t load this shop</h1>
        <p style={{ marginTop: '0.5rem', color: '#505050' }}>Check your connection and try again.</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '1.25rem', padding: '0.7rem 1.25rem', borderRadius: 4, background: '#1f4ae0', color: '#fff', fontWeight: 600 }}>
          Try again
        </button>
      </div>
    </main>
  );
} else if (site.kind === 'shop') {
  await applyLook({ ...site.brand, platform: site.platform });
  head({ title: `${site.brand.name} · ${site.brand.tagline}`, icon: site.brand.logo?.image || 'data:,' });
  const { default: App } = await import('./App');
  Root = () => <App site={site} />;
} else {
  if (site.kind === 'missing') head({ title: `${linkLabel(site.link)} is available` });
  // The company's address is Kabuor Technologies (the server's platform name is Kabuor Builds, which Google then
  // showed as the company's name); the platform's own address is the shops page.
  else head({ title: BUILDS_HOST ? 'Kabuor Shops · Online shops for Kenyan brands' : 'Kabuor Technologies · Software for Kenyan businesses' });
  const { default: PlatformApp } = await import('./platform/PlatformApp');
  Root = () => <PlatformApp site={site} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={SHOP_BASE || undefined}>
      <MotionConfig reducedMotion="user">
        <Root />
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
);
