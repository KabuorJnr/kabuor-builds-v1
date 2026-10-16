import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import CartDrawer from '../components/CartDrawer';
import Navbar, { MobileTabs, navLinks } from '../components/Navbar';
import { FlyLayer, Toast } from '../components/Overlays';
import ProductModal from '../components/ProductModal';
import { Footer } from '../components/Sections';
import { ApbMark, EASE } from '../components/ui';
import { LoveNutHome } from '../components/LoveNutHome';
import { useStore } from '../lib/api';
import { setCurrency } from '../lib/format';
import { useCart } from '../store/cart';

function Splash({ error }) {
  return (
    <div className="grid min-h-svh place-items-center bg-cream px-6 text-center">
      <div>
        <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
          <ApbMark className="mx-auto h-16 w-32" />
        </motion.div>
        <LoveNutHome className="mx-auto mt-4 h-7" />
        {error && <p className="mt-6 text-espresso/60">We couldn’t load the shop right now. Please refresh in a moment.</p>}
      </div>
    </div>
  );
}

// The frame shared by every storefront page: top bar, page content, footer, cart, product pop-up and the
// tab bar on phones. Each page (Home, Shop, Updates, …) renders inside <Outlet>.
export default function Store() {
  const { products, config, content, posts, loading, error } = useStore();
  const [selected, setSelected] = useState(null);
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

  const close = useCallback(() => setSelected(null), []);
  const context = useMemo(() => ({ products, config, content, posts, loading, error, select: setSelected }), [products, config, content, posts, loading, error]);

  if (!content) return <Splash error={error} />;
  const links = navLinks(content, posts.length > 0);

  return (
    <>
      <Navbar content={content} links={links} />
      <main>
        <motion.div key={pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
          <Outlet context={context} />
        </motion.div>
      </main>
      <Footer content={content} config={config} products={products} links={links} />
      <MobileTabs content={content} hasUpdates={posts.length > 0} />
      <ProductModal product={selected} products={products} onClose={close} config={config} />
      <CartDrawer config={config} products={products} branches={content.brand.branches} />
      <FlyLayer />
      <Toast />
    </>
  );
}
