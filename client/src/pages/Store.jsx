import { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import CartDrawer from '../components/CartDrawer';
import Navbar, { MobileTabs, navLinks } from '../components/Navbar';
import { FlyLayer, Toast } from '../components/Overlays';
import { Footer } from '../components/Sections';
import { useStore } from '../lib/api';
import { LOOK } from '../lib/brand';
import { setCurrency } from '../lib/format';
import { useCart } from '../store/cart';

function Splash({ error }) {
  return (
    <div className="grid min-h-svh place-items-center bg-cream px-6 text-center">
      <div>
        {/* The shop's own name while it loads (never another brand's artwork). */}
        <motion.p animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} className="font-brand text-3xl text-espresso">
          {LOOK.name}
        </motion.p>
        {error && <p className="mt-6 text-espresso/60">We couldn’t load the shop right now. Please refresh in a moment.</p>}
      </div>
    </div>
  );
}

// The frame shared by every storefront page: top bar, page content, footer, cart and the tab bar on phones. Each page (Home, Shop, Updates, …) renders inside <Outlet>.
export default function Store() {
  const { products, config, content, posts, loading, error } = useStore();
  const navigate = useNavigate();
  const sync = useCart((s) => s.sync);
  const { pathname } = useLocation();

  if (config) setCurrency(config.currency);

  useEffect(() => {
    if (products.length) sync(products);
  }, [products, sync]);

  // Every page starts at the top.
  useLayoutEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Choosing a product opens its own page.
  const select = useCallback((p) => navigate(`/products/${p.id}`), [navigate]);
  const context = useMemo(() => ({ products, config, content, posts, loading, error, select }), [products, config, content, posts, loading, error, select]);

  if (!content) return <Splash error={error} />;
  const links = navLinks(content, posts.length > 0);

  return (
    <>
      <Navbar content={content} links={links} />
      <main>
        {/* No fade between pages: the next page is there the moment it's tapped. */}
        <Outlet context={context} />
      </main>
      <Footer content={content} config={config} products={products} links={links} />
      <MobileTabs content={content} hasUpdates={posts.length > 0} />
      <CartDrawer config={config} products={products} branches={content.brand.branches} />
      <FlyLayer />
      <Toast />
    </>
  );
}
