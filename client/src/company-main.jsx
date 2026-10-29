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
import CareersPage from './platform/CareersPage';
import { applyPlatformLook } from './platform/look';
import { papi } from './platform/shared';
import { CONTACT_EMAIL } from './platform/contact';

const DEFAULT_INFO = {
  name: 'Kabuor Technologies',
  tagline: 'Software African businesses actually run on.',
  phone: '0705 607 954',
  email: CONTACT_EMAIL,
  prices: { monthly: 1500, yearly: 15000 },
  founder: {
    name: 'Rooney Odhiambo Kabuor',
    title: 'Founder & CEO',
    linkedin: 'https://www.linkedin.com/in/rooney-odhiambo-9a26b6256',
  },
};

function CompanySite() {
  const [info, setInfo] = useState(DEFAULT_INFO);
  useEffect(() => {
    applyPlatformLook();
    papi('/info')
      .then((data) => {
        if (data) {
          setInfo({ ...DEFAULT_INFO, ...data, name: 'Kabuor Technologies' });
        }
      })
      .catch(() => setInfo(DEFAULT_INFO));
  }, []);
  return (
    <div className="min-h-svh bg-cream text-espresso">
      <Routes>
        <Route path="/careers" element={<CareersPage info={info} />} />
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
