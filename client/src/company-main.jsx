// The standalone Kabuor Builds company site (deployed on its own, e.g. Vercel). Just the company page; the
// product tabs and buttons open the product pages on the platform (VITE_PRODUCT_ORIGIN), and the demo form
// posts to the platform's API there.
import { Component, StrictMode, useEffect, useState } from 'react';
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


class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Page error caught by ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111', background: '#F8FAFC' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>Something went wrong</h2>
          <p style={{ color: '#64748B', marginBottom: '20px', maxWidth: '400px', textAlign: 'center' }}>
            We encountered a temporary display issue. Please reload the page to refresh your session.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', background: '#2357F5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
        <ErrorBoundary><CompanySite /></ErrorBoundary>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
);
