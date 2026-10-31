// Kabuor Technologies' own website: the company page (/), one page per product (/shops in Shops.jsx, /erp), Careers,
// the signup wizard (/start), the owner's dashboard (/admin) and the page a visitor sees on a shop link nobody has
// taken yet.
import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import { ArrowRight } from 'lucide-react';
import './platform.css';
import { papi } from './shared';
import Wizard from './Wizard';
import Company from './Company';
import Shops from './Shops';
import Erp from './Erp';
import CareersPage from './CareersPage';
import AboutFounder from './AboutFounder';
import StylecoDemo from './StylecoDemo';
import PurelixDemo from './PurelixDemo';

import { Privacy, ShopsPrivacy, ShopsTerms, Terms } from './Legal';
import { linkLabel, platformOrigin } from '../lib/base';
import { BUILDS_HOST } from './contact';

// Kabuor Builds' own dashboard (only loads for the owner).
const OwnerDashboard = lazy(() => import('./OwnerDashboard'));

// Kabuor Builds' palette and type, in the names the shared styles use.
import { PLATFORM_LOOK } from './look';

/** The platform's address from a shop link: anjugu.shop.ke → shop.ke (anjugu.localhost:5173 → localhost:5173). */
export { platformOrigin };

import { Wordmark } from './Site';
export { Wordmark };

function useInfo() {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    papi('/info').then(setInfo).catch(() => setInfo(null));
  }, []);
  return info;
}


/** A visitor on a shop link nobody has taken. */
function Unclaimed({ site }) {
  return (
    <div className="kb-ink relative grid min-h-svh place-items-center px-5 text-center">
      <div className="relative max-w-md">
        <Wordmark name={site.platform?.name} light />
        <h1 className="kb-display mt-10 text-5xl">
          {linkLabel(site.link)} <span className="text-[#9DB6FF]">is free</span>
        </h1>
        <p className="mt-4 text-cream/65">There’s no shop here yet. If this is your brand’s name, it can be yours in a few minutes.</p>
        <a href={`${platformOrigin()}/start?link=${encodeURIComponent(site.link ?? '')}`} className="btn mt-8 bg-[#2357F5] px-6 py-3.5 text-white shadow-lg shadow-[#2357F5]/30 hover:bg-[#3A6BFF]">
          Open this shop <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export default function PlatformApp({ site }) {
  const info = useInfo();
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(PLATFORM_LOOK).forEach(([k, v]) => root.style.setProperty(k, v));
    root.dataset.mode = 'light';
    root.dataset.radius = 'round';
    root.dataset.texture = 'dots';
  }, []);
  if (site.kind === 'missing') return <Unclaimed site={site} />;
  return (
    <div className="min-h-svh bg-cream text-espresso">
      <Routes>
        <Route path="/start" element={<Wizard info={info} />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={null}>
              <OwnerDashboard />
            </Suspense>
          }
        />
                <Route path="/demo/styleco" element={<StylecoDemo />} />
        <Route path="/demo/purelix" element={<PurelixDemo />} />
        <Route path="/shops" element={<Shops info={info} />} />
        <Route path="/erp" element={<Erp info={info} />} />
        <Route path="/careers" element={<CareersPage info={info} />} />
        <Route path="/about-founder" element={<AboutFounder info={info} />} />
        <Route path="/founder" element={<AboutFounder info={info} />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/shops/privacy" element={<ShopsPrivacy />} />
        <Route path="/shops/terms" element={<ShopsTerms />} />
        {/* "Launch Shop" opens the platform's own address: there the home page is the shops page. */}
        <Route path="/" element={BUILDS_HOST ? <Shops info={info} /> : <Company info={info} />} />
        <Route path="*" element={<Company info={info} />} />
      </Routes>
    </div>
  );
}
