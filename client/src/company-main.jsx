// The standalone Kabuor Builds company site (deployed on its own, e.g. Vercel). Just the company page; the
// product tabs and buttons open the product pages on the platform (VITE_PRODUCT_ORIGIN), and the demo form
// posts to the platform's API there.
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { MotionConfig } from 'framer-motion';
import './index.css';
import './platform/platform.css';
import Company from './platform/Company';
import { applyPlatformLook } from './platform/look';
import { papi } from './platform/shared';

function CompanySite() {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    applyPlatformLook();
    papi('/info').then(setInfo).catch(() => setInfo(null));
  }, []);
  return (
    <div className="min-h-svh bg-cream text-espresso">
      <Routes>
        <Route path="*" element={<Company info={info} />} />
      </Routes>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <CompanySite />
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
);
