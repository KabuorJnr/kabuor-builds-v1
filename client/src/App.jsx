import { lazy, Suspense } from 'react';
import { Link, Route, Routes } from 'react-router';
import Store from './pages/Store';
import ProductPage from './pages/ProductPage';
import { AboutPage, FaqPage, HomePage, HowToOrderPage, ShopPage, ShopPrivacyPage, UpdatesPage } from './pages/SitePages';
import { Logo } from './components/ui';

// The dashboard (and its chart library) only loads for admins.
const AdminApp = lazy(() => import('./admin/AdminApp'));
const Receipt = lazy(() => import('./pages/Receipt'));

function Loading() {
  return (
    <div className="grid min-h-svh place-items-center bg-cream">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-sand border-t-amber" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="bg-dots grid min-h-svh place-items-center px-6 text-center">
      <div>
        <Logo />
        <h1 className="mt-8 text-5xl font-extrabold tracking-tight">404</h1>
        <p className="mt-2 text-espresso/60">We couldn’t find that page.</p>
        <Link to="/" className="btn btn-primary mt-8">
          Back to the shop
        </Link>
      </div>
    </div>
  );
}

// Shown on the owner's preview of a shop that isn't live yet, so it's never mistaken for the real thing.
function PreviewBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-[70] flex h-10 items-center justify-center gap-2 overflow-hidden bg-[#0B0F19] px-4 text-center text-xs font-semibold text-[#F8FAFC] shadow-md sm:text-sm">
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]" />
      Preview: only you can see this. Customers can order once you pay and go live.
    </div>
  );
}

// On a sample shop for one of the templates (/demo/<template> on the website): what this is, and the way to get one.
function SampleBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-[70] flex h-10 items-center justify-center gap-3 overflow-hidden bg-[#0B0F19] px-4 text-center text-xs font-semibold text-[#F8FAFC] shadow-md sm:text-sm">
      <span className="truncate">Sample shop on Kabuor Shops<span className="hidden sm:inline">. Ordering is switched off.</span></span>
      <a href="/start" className="shrink-0 rounded-full bg-[#2357F5] px-3 py-1 text-[#fff] hover:bg-[#3A6BFF]">
        Start a shop like this
      </a>
    </div>
  );
}

// Customers see this while the shop is being set up, or when its plan has lapsed. The admin stays open.
function Closed({ state }) {
  return (
    <div className="bg-dots grid min-h-svh place-items-center px-6 text-center">
      <div className="max-w-md">
        <Logo />
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight">{state === 'setup' ? 'Opening soon' : 'Taking a short break'}</h1>
        <p className="mt-3 text-espresso/60">
          {state === 'setup' ? 'Our shop is almost ready. Check back in a little while.' : 'We’re not taking orders online right now. Please check back soon.'}
        </p>
        <Link to="/admin" className="mt-10 inline-block text-xs font-semibold text-espresso/40 hover:text-espresso">
          Shop owner? Sign in
        </Link>
      </div>
    </div>
  );
}

export default function App({ site }) {
  const closed = site?.state && site.state !== 'live' && site.state !== 'preview';
  const isPreviewMode = site?.state === 'preview';

  // Every shop, whatever its design, runs on the real storefront below: its own products, cart and checkout.
  // (Live shops must never be swapped for a demo page with made-up products.)
  const bar = site?.sample ? <SampleBar /> : isPreviewMode ? <PreviewBar /> : null;
  // The bar sits above the menu: tell the menu and the page how tall it is (both bars are one 40px line).
  const banner = bar && (
    <>
      <style>{':root{--banner-h:40px}'}</style>
      {bar}
    </>
  );

  return (
    <Routes>
      {/* The storefront: one page per section, sharing the top bar, footer and cart. */}
      <Route path="/" element={closed ? <Closed state={site.state} /> : banner ? <>{banner}<Store /></> : <Store />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="products/:id" element={<ProductPage />} />
        <Route path="updates" element={<UpdatesPage />} />
        <Route path="how-to-order" element={<HowToOrderPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="privacy" element={<ShopPrivacyPage />} />
      </Route>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<Loading />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route
        path="/receipt/:code"
        element={
          <Suspense fallback={<Loading />}>
            <Receipt />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
