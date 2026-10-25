import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { MotionConfig } from 'framer-motion';
import './index.css';
import { applyLook } from './lib/theme';
import { previewKey } from './lib/api';
import { PATH_SHOP, SHOP_BASE, setPlatformDomain } from './lib/base';

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
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 1200);

const site = isCompanyDomain && window.location.pathname === '/careers'
  ? { kind: 'platform', name: 'Kabuor Technologies' }
  : await fetch('/api/site', {
      signal: controller.signal,
      headers: { ...(previewKey() ? { 'X-Preview-Token': previewKey() } : {}), ...(PATH_SHOP ? { 'X-Shop': PATH_SHOP } : {}) },
    })
      .then((r) => r.json())
      .catch(() => ({ kind: 'platform', name: 'Kabuor Technologies' }))
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
if (site.kind === 'shop') {
  await applyLook({ ...site.brand, platform: site.platform });
  head({ title: `${site.brand.name} · ${site.brand.tagline}`, icon: site.brand.logo?.image || 'data:,' });
  const { default: App } = await import('./App');
  Root = () => <App site={site} />;
} else {
  if (site.kind === 'missing') head({ title: `${site.link}.${site.platform?.domain ?? ''} is available` });
  else head({ title: `${site.name ?? 'Kabuor Technologies'} · Software for Kenyan businesses` });
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
