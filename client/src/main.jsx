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
const site = await fetch('/api/site', { headers: { ...(previewKey() ? { 'X-Preview-Token': previewKey() } : {}), ...(PATH_SHOP ? { 'X-Shop': PATH_SHOP } : {}) } })
  .then((r) => r.json())
  .catch(() => ({ kind: 'error' }));
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
  else head({ title: `${site.name ?? 'Kabuor Builds'} · Product-first websites that sell` });
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
