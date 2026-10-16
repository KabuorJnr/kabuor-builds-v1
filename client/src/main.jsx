import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { MotionConfig } from 'framer-motion';
import './index.css';
import { applyLook } from './lib/theme';

// One website for the platform and every shop. The server says who we are from the address:
// the platform itself, a shop (with its look), or a shop link nobody has taken yet.
const site = await fetch('/api/site')
  .then((r) => r.json())
  .catch(() => ({ kind: 'error' }));

let Root;
if (site.kind === 'shop') {
  await applyLook({ ...site.brand, platform: site.platform });
  const { default: App } = await import('./App');
  Root = () => <App site={site} />;
} else {
  const { default: PlatformApp } = await import('./platform/PlatformApp');
  Root = () => <PlatformApp site={site} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <Root />
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
);
