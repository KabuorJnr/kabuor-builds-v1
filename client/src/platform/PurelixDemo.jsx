import { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import {
  ShoppingBag,
  User,
  Heart,
  Check,
  X,
  Star,
  Sparkles,
  Leaf,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Truck,
  Droplet,
  Sun,
  Flame,
  Award,
  Smartphone,
  Sliders,
  Edit3,
  Palette,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

const DEFAULT_PRODUCTS = [
  {
    id: 'purelix-cleanser',
    name: 'Citrus & Stone Botanical Cleanser',
    tagline: 'Cold-pressed citrus, mineral-rich stone extracts & wild chamomile',
    category: 'skin',
    categoryLabel: 'Skin & Radiance',
    priceUSD: 40,
    priceKSH: 5200,
    rating: 4.9,
    reviews: 148,
    size: '200 ml / 6.7 fl. oz.',
    heroImage: '/brand/purelix/purelix_bottle_center.png',
    badge: '100% VEGAN',
    badgeColor: '#107C41',
    description:
      'A clarifying, gentle daily botanical wash crafted on a bed of warm mineral stones and wild mountain herbs. Formulated with organic sweet orange peel and active botanicals that gently remove impurities without stripping the natural barrier.',
    ingredients: [
      { name: 'Organic Sweet Orange Extract', benefit: 'Rich in bioflavonoids & Vitamin C' },
      { name: 'Cold-Pressed Sicilian Lemon', benefit: 'Natural brightening and antioxidant shield' },
      { name: 'Volcanic Stone Mineral Infusion', benefit: 'Balances pH and detoxifies pores' },
      { name: 'Wild Chamomile & Calendula', benefit: 'Soothes inflammation & calms redness' },
    ],
    benefits: ['100% Plant-derived', 'Sulfate & Paraben Free', 'Microbiome Balanced', 'Cruelty Free'],
    howToUse: 'Dispense 1-2 pumps onto damp palms. Gently massage in upward circular motions across face and neck. Rinse thoroughly with lukewarm water.',
    inStock: true,
  },
  {
    id: 'purelix-immunity',
    name: 'Vital Green Immunity Tonic',
    tagline: 'Raw wheatgrass, chlorella & adaptogenic ashwagandha',
    category: 'immunity',
    categoryLabel: 'Immunity & Vitality',
    priceUSD: 48,
    priceKSH: 6240,
    rating: 4.95,
    reviews: 212,
    size: '100 ml / 3.4 fl. oz.',
    heroImage: '/brand/purelix/purelix_vegan_badge.png',
    badge: 'BESTSELLER',
    badgeColor: '#E65100',
    description:
      'Deep bio-available greens combined with cold-pressed ginger and elderberry to strengthen daily immune defense and sustain clean cellular energy throughout the day.',
    ingredients: [
      { name: 'Organic Cold-Pressed Wheatgrass', benefit: 'Oxygenates cells and purifies blood' },
      { name: 'Wild Himalayan Ashwagandha', benefit: 'Cortisol regulation & stress resilience' },
      { name: 'Fermented Green Tea Polyphenols', benefit: 'Potent cellular antioxidant' },
    ],
    benefits: ['Zero Added Sugars', 'Sustainably Harvested', 'Raw Enzymatic Cold-Press'],
    howToUse: 'Take 1 full dropper directly under the tongue every morning or mix into fresh citrus water.',
    inStock: true,
  },
  {
    id: 'purelix-golden-tonic',
    name: 'Golden Turmeric & Ginger Elixir',
    tagline: 'Fermented whole-root turmeric, piperine & ginger',
    category: 'digestion',
    categoryLabel: 'Gut & Digestion',
    priceUSD: 36,
    priceKSH: 4680,
    rating: 4.88,
    reviews: 94,
    size: '250 ml / 8.5 fl. oz.',
    heroImage: '/brand/purelix/purelix_bottle_center.png',
    badge: 'ANTI-INFLAMMATORY',
    badgeColor: '#D97706',
    description:
      'An ancient Ayurvedic gold elixir formulated with 95% bioactive curcuminoids and cracked black pepper extract to support healthy gut digestion, soothe joints, and ease systemic bloating.',
    ingredients: [
      { name: 'Organic Fermented Turmeric Root', benefit: 'Superior 10x bioavailability' },
      { name: 'Cracked Bio-Perine Black Pepper', benefit: 'Enhances absorption by 2000%' },
      { name: 'Ceylon Cinnamon Bark', benefit: 'Stabilizes post-meal glucose' },
    ],
    benefits: ['Fermented for absorption', 'Gentle on empty stomach', 'Zero synthetic fillers'],
    howToUse: 'Shake well. Add 1 tablespoon to warm oat or almond milk, or drink as a morning tonic shot.',
    inStock: true,
  },
  {
    id: 'purelix-glow-serum',
    name: 'Radiance Botanical Squalane Serum',
    tagline: 'Spanish olive squalane, cold-pressed rosehip & neroli',
    category: 'skin',
    categoryLabel: 'Skin & Radiance',
    priceUSD: 55,
    priceKSH: 7150,
    rating: 4.98,
    reviews: 320,
    size: '50 ml / 1.7 fl. oz.',
    heroImage: '/brand/purelix/purelix_vegan_badge.png',
    badge: 'AWARD WINNER',
    badgeColor: '#7C3AED',
    description:
      'A featherlight, deeply penetrating facial elixir that locks in 24-hour hydration, restores bouncy elasticity, and leaves the complexion with an unmistakable sunlit golden glow.',
    ingredients: [
      { name: 'Olive Squalane (Non-GMO)', benefit: 'Identical to skin natural lipid barrier' },
      { name: 'Patagonian Rosehip Seed Oil', benefit: 'Rich in natural trans-retinoic acid' },
      { name: 'Moroccan Neroli Blossom', benefit: 'Refines skin tone & uplifts senses' },
    ],
    benefits: ['Non-comedogenic', 'Instant Glass Skin Finish', 'Fast Absorbing'],
    howToUse: 'Warm 3 drops between clean palms and press gently into face, neck, and decolletage morning and night.',
    inStock: true,
  },
  {
    id: 'purelix-sleep-elixir',
    name: 'Calm Night Magnesium & Lavender',
    tagline: 'Chelated magnesium glycinate, French lavender & tart cherry',
    category: 'sleep',
    categoryLabel: 'Calm & Sleep',
    priceUSD: 34,
    priceKSH: 4420,
    rating: 4.92,
    reviews: 178,
    size: '60 Vegan Capsules',
    heroImage: '/brand/purelix/purelix_bottle_center.png',
    badge: 'NIGHT RITUAL',
    badgeColor: '#2563EB',
    description:
      'Designed for deep, restorative REM sleep and nighttime neuromuscular recovery. Contains pure chelated magnesium that does not cause digestive upset, paired with natural tart cherry phytonutrients.',
    ingredients: [
      { name: 'Chelated Magnesium Glycinate', benefit: 'Highest biological absorption & calming' },
      { name: 'Montmorency Tart Cherry', benefit: 'Natural precursor to melatonin' },
      { name: 'Wild French Lavender Flower', benefit: 'Eases racing nighttime thoughts' },
    ],
    benefits: ['Non-habit forming', 'Wake up refreshed with zero grogginess', '100% Vegan capsules'],
    howToUse: 'Take 2 capsules with a glass of water 30-45 minutes before sleep.',
    inStock: true,
  },
  {
    id: 'purelix-gut-flora',
    name: 'Gut Flora Pre+Probiotic Drops',
    tagline: '10 Billion CFU soil-based organisms & organic acacia fibre',
    category: 'digestion',
    categoryLabel: 'Gut & Digestion',
    priceUSD: 42,
    priceKSH: 5460,
    rating: 4.87,
    reviews: 119,
    size: '50 ml / 1.7 fl. oz.',
    heroImage: '/brand/purelix/purelix_vegan_badge.png',
    badge: '10B CFU',
    badgeColor: '#059669',
    description:
      'Soil-based spore probiotic strains that naturally survive the harsh stomach acid barrier to colonize the lower intestines, eliminating bloating and boosting nutrient absorption.',
    ingredients: [
      { name: 'Spore-Forming Bacillus Strains', benefit: '99.9% stomach acid survival rate' },
      { name: 'Organic Blue Agave Inulin', benefit: 'Feeds beneficial gut bacteria' },
      { name: 'Cold-Pressed Peppermint Oil', benefit: 'Instant gastrointestinal relief' },
    ],
    benefits: ['Shelf Stable (No fridge needed)', 'Certified Dairy & Soy Free', 'Clinically Studied Strains'],
    howToUse: 'Take 10 drops directly on the tongue or in cold drinks 15 minutes before your largest meal.',
    inStock: true,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Formulations' },
  { id: 'immunity', label: 'Immunity & Vitality' },
  { id: 'skin', label: 'Skin & Radiance' },
  { id: 'digestion', label: 'Gut & Digestion' },
  { id: 'sleep', label: 'Calm & Sleep' },
];

const BOTANICAL_PALETTES = [
  { name: 'Sunlit Ochre', hex: '#C89B59' },
  { name: 'Sage Botanic', hex: '#4F8A3C' },
  { name: 'Amber Clay', hex: '#B87333' },
  { name: 'Rose Hibiscus', hex: '#A8576A' },
  { name: 'Deep Olive', hex: '#556B2F' },
];

export default function PurelixDemo() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // Modifiable Shell Configuration State
  const [shellConfig, setShellConfig] = useState({
    brandName: params.get('name') || 'PURELIX',
    heroHeading: 'Your Journey to Better Health Starts Here',
    heroSubtext: 'Discover plant-based supplements that enhance energy, immunity, digestion, and overall wellness with reliable ingredients.',
    ctaText: 'Buy Now',
    bgColor: params.get('accent') || '#C89B59',
    currency: 'USD', // 'USD' | 'KSH'
    tillNumber: '789123',
    dispatchCity: 'Nairobi',
    deliveryPromise: 'Same-day Nairobi dispatch',
    phone: '0712345678',
    shippingThresholdUSD: 60,
  });

  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([
    {
      product: DEFAULT_PRODUCTS[0],
      quantity: 1,
    },
  ]);
  const [wishlist, setWishlist] = useState(['purelix-cleanser']);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalUSD = cart.reduce((sum, item) => sum + item.product.priceUSD * item.quantity, 0);
  const cartTotalKSH = cart.reduce((sum, item) => sum + item.product.priceKSH * item.quantity, 0);

  const formatPrice = (usd, ksh) => {
    if (shellConfig.currency === 'KSH') {
      return 'KSh ' + ksh.toLocaleString();
    }
    return '$' + usd;
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!shellConfig.phone) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCheckoutSuccess(true);
    }, 1200);
  };

  const handleLaunchWithShell = () => {
    const query = new URLSearchParams({
      kind: 'wellness',
      name: shellConfig.brandName,
      accent: shellConfig.bgColor,
    }).toString();
    navigate('/start?' + query);
  };

  const handleResetShell = () => {
    setShellConfig({
      brandName: 'PURELIX',
      heroHeading: 'Your Journey to Better Health Starts Here',
      heroSubtext: 'Discover plant-based supplements that enhance energy, immunity, digestion, and overall wellness with reliable ingredients.',
      ctaText: 'Buy Now',
      bgColor: '#C89B59',
      currency: 'USD',
      tillNumber: '789123',
      dispatchCity: 'Nairobi',
      deliveryPromise: 'Same-day Nairobi dispatch',
      phone: '0712345678',
      shippingThresholdUSD: 60,
    });
    setProducts(DEFAULT_PRODUCTS);
  };

  return (
    <div
      className="min-h-screen text-white selection:bg-[#FFDE59] selection:text-black font-sans transition-colors duration-500"
      style={{ backgroundColor: shellConfig.bgColor }}
    >
      {/* Shell Controls Top Bar */}
      <aside aria-label="Shell Studio" className="border-b border-black/10 bg-black/30 backdrop-blur-md px-4 py-2 text-xs font-medium text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#FFDE59] animate-pulse" />
            <span>Kabuor Shell Engine · <b>Modifiable Botanical Wellness Shell</b></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCustomizerOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-[#FFDE59] px-3.5 py-1 text-xs font-bold text-black shadow hover:bg-[#FFE680] transition"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Customize Shell</span>
            </button>

            <Link
              to="/shops"
              className="inline-flex items-center gap-1 rounded bg-black/25 px-2.5 py-1 text-white hover:bg-black/40 transition"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
          </div>
        </div>
      </aside>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-20">
        {/* Navigation Bar */}
        <header className="flex items-center justify-between py-6">
          <Link to="#" className="text-2xl sm:text-3xl font-black tracking-widest uppercase text-white font-serif">
            {shellConfig.brandName}
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/90">
            <a href="#hero" className="border-b-2 border-white pb-0.5 text-white font-semibold">Home</a>
            <a href="#shop" className="hover:text-white transition">Shop</a>
            <a href="#shop" className="hover:text-white transition">Formulations</a>
            <a href="#benefits" className="hover:text-white transition">Benefits</a>
            <a href="#support" className="hover:text-white transition">Support</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md border border-white/25 px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition shadow-sm"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="font-semibold">{formatPrice(cartTotalUSD, cartTotalKSH)}</span>
              {cartCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFDE59] text-xs font-bold text-black">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setCustomizerOpen(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition shadow-sm"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Shell</span>
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section id="hero" className="relative mt-4 overflow-hidden rounded-3xl bg-black/10 pt-12 pb-16 px-6 sm:px-12 lg:px-16 shadow-2xl border border-white/15">
          {/* Huge Architectural Brand Backdrop Typography */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-[62%] flex justify-center overflow-hidden opacity-90 select-none z-0">
            <h1 className="text-[13vw] font-black uppercase tracking-tight text-white leading-none scale-y-110 drop-shadow-sm font-serif">
              {shellConfig.brandName}
            </h1>
          </div>

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12 min-h-[460px]">
            {/* Left Headline & CTA */}
            <div className="lg:col-span-4 space-y-6">
              <h2 className="text-3xl sm:text-5xl font-serif font-medium leading-[1.15] text-white">
                {shellConfig.heroHeading}
              </h2>
              <div>
                <a
                  href="#shop"
                  className="inline-flex items-center gap-2 rounded-full bg-[#FFDE59] px-7 py-3.5 text-base font-bold text-[#1A1A1A] hover:bg-[#FFE680] hover:scale-105 transition-all shadow-lg shadow-black/15"
                >
                  <span>{shellConfig.ctaText}</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-black inline-block ml-1" />
                </a>
              </div>
            </div>

            {/* Center Still-Life */}
            <div className="lg:col-span-5 flex justify-center items-center py-4">
              <div className="relative max-w-sm sm:max-w-md w-full">
                <img
                  src="/brand/purelix/purelix_bottle_center.png"
                  alt="Botanical Serum"
                  className="w-full object-contain filter drop-shadow-2xl transition hover:scale-105 duration-500"
                />
              </div>
            </div>

            {/* Right Card */}
            <div className="lg:col-span-3 flex justify-end">
              <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-2xl max-w-[190px] w-full text-center text-[#1E1E1E] border border-white/40 transform hover:-translate-y-1 transition duration-300">
                <div className="overflow-hidden rounded-xl bg-[#F4F6F0] p-2 aspect-[4/3] flex items-center justify-center">
                  <img
                    src="/brand/purelix/purelix_vegan_badge.png"
                    alt="100% Vegan"
                    className="h-full w-full object-contain"
                  />
                </div>
                <p className="mt-3 text-xs font-black tracking-wider uppercase text-[#1A1A1A]">
                  100% VEGAN
                </p>
                <div className="mt-2 flex justify-center text-[#107C41]">
                  <Leaf className="h-6 w-6 fill-[#107C41]" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Subtext Banner */}
          <div className="relative z-10 mt-8 border-t border-white/20 pt-6 text-center">
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-white/90 font-light leading-relaxed">
              {shellConfig.heroSubtext}
            </p>
          </div>
        </section>

        {/* Catalog Section */}
        <section id="shop" className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/20 pb-6">
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-[#FFDE59]">Pure & Potent</p>
              <h3 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-white">Botanical Formulations</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={
                    "rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition " +
                    (activeCategory === cat.id
                      ? "bg-white text-black shadow-md font-bold"
                      : "bg-white/15 text-white hover:bg-white/25 border border-white/20")
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((p) => {
              const isFav = wishlist.includes(p.id);
              return (
                <div
                  key={p.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white/10 backdrop-blur-md p-6 border border-white/20 hover:border-white/40 hover:bg-white/15 transition duration-300 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-bold text-white tracking-wide"
                      style={{ backgroundColor: p.badgeColor }}
                    >
                      {p.badge}
                    </span>
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition"
                      aria-label="Wishlist"
                    >
                      <Heart className={"h-4 w-4 " + (isFav ? "fill-red-500 text-red-500" : "")} />
                    </button>
                  </div>

                  <div
                    onClick={() => setSelectedProduct(p)}
                    className="cursor-pointer my-6 flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-b from-white/10 to-transparent p-6 group-hover:scale-105 transition duration-300"
                  >
                    <img
                      src={p.heroImage}
                      alt={p.name}
                      className="max-h-56 max-w-full object-contain filter drop-shadow-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#FFDE59]">
                      <Star className="h-3.5 w-3.5 fill-[#FFDE59]" />
                      <span className="font-bold">{p.rating}</span>
                      <span className="text-white/60">({p.reviews} reviews)</span>
                      <span className="ml-auto text-white/70">{p.size}</span>
                    </div>

                    <h4
                      onClick={() => setSelectedProduct(p)}
                      className="cursor-pointer text-lg font-bold font-serif leading-snug text-white hover:text-[#FFDE59] transition"
                    >
                      {p.name}
                    </h4>

                    <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                      {p.tagline}
                    </p>

                    <div className="pt-3 flex items-center justify-between border-t border-white/15">
                      <div>
                        <div className="text-xl font-black text-white">
                          {formatPrice(p.priceUSD, p.priceKSH)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="rounded-full bg-white/20 px-3 py-2 text-xs font-semibold text-white hover:bg-white/30 transition"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => addToCart(p, 1)}
                          className="flex items-center gap-1.5 rounded-full bg-[#FFDE59] px-4 py-2 text-xs font-bold text-black hover:bg-[#FFE680] transition shadow-md"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="mt-20 rounded-3xl bg-black/15 p-8 sm:p-12 border border-white/15">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest font-bold text-[#FFDE59]">Why Choose {shellConfig.brandName}</span>
            <h3 className="mt-2 text-3xl font-serif font-bold text-white">Botanical Science Meets Daily Wellness</h3>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-white/10 p-6 border border-white/10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFDE59] text-black mb-4">
                <Leaf className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-lg font-serif">100% Vegan & Plant-Based</h4>
              <p className="mt-2 text-xs text-white/80 leading-relaxed">
                Zero animal derivatives, gelatin, or artificial stabilizers. Formulated with authentic herbs.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 border border-white/10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFDE59] text-black mb-4">
                <Sun className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-lg font-serif">Cold-Pressed Potency</h4>
              <p className="mt-2 text-xs text-white/80 leading-relaxed">
                Gentle cold processing ensures delicate bioactive compounds remain 100% active.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 border border-white/10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFDE59] text-black mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-lg font-serif">Lab Tested Purity</h4>
              <p className="mt-2 text-xs text-white/80 leading-relaxed">
                Rigorous testing for microbiological quality and heavy metal screening in Kenya.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 border border-white/10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFDE59] text-black mb-4">
                <Truck className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-lg font-serif">{shellConfig.deliveryPromise}</h4>
              <p className="mt-2 text-xs text-white/80 leading-relaxed">
                Direct M-Pesa prompt payment with courier delivery dispatched from {shellConfig.dispatchCity}.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="support" className="mt-20 border-t border-white/20 pt-10 text-xs text-white/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 {shellConfig.brandName}. Powered by Kabuor Shell Engine.</p>
          <div className="flex gap-6">
            <a href="#hero" className="hover:text-white transition">Privacy</a>
            <a href="#hero" className="hover:text-white transition">Terms</a>
            <a href="#hero" className="hover:text-white transition">Lab Results</a>
            <a href="#hero" className="hover:text-white transition">Contact</a>
          </div>
        </footer>
      </div>

      {/* Product Details Page (PDP) Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative my-8 w-full max-w-3xl rounded-3xl bg-[#2A2116] text-white p-6 sm:p-10 shadow-2xl border border-white/30 animate-scale-up">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex aspect-square items-center justify-center rounded-2xl bg-white/10 p-8 border border-white/20">
                <img
                  src={selectedProduct.heroImage}
                  alt={selectedProduct.name}
                  className="max-h-72 object-contain filter drop-shadow-2xl"
                />
              </div>

              <div className="space-y-4">
                <div className="inline-block rounded-full px-3 py-1 text-xs font-bold bg-white text-black">
                  {selectedProduct.categoryLabel}
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {selectedProduct.name}
                </h3>

                <div className="flex items-center gap-2 text-sm text-[#FFDE59]">
                  <Star className="h-4 w-4 fill-[#FFDE59]" />
                  <span className="font-bold">{selectedProduct.rating}</span>
                  <span className="text-white/70">({selectedProduct.reviews} verified reviews)</span>
                </div>

                <div className="text-2xl font-black text-white">
                  {formatPrice(selectedProduct.priceUSD, selectedProduct.priceKSH)}
                </div>

                <p className="text-sm text-white/90 leading-relaxed">
                  {selectedProduct.description}
                </p>

                <div className="rounded-xl bg-black/30 p-4 text-xs space-y-1.5">
                  <p className="font-bold text-[#FFDE59] uppercase tracking-wider text-[10px]">Active Botanical Extract:</p>
                  {selectedProduct.ingredients.map((ing, i) => (
                    <div key={i} className="flex justify-between text-white/85">
                      <span>• {ing.name}</span>
                      <span className="text-white/60 text-right">{ing.benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct, 1);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#FFDE59] py-3 text-sm font-bold text-black hover:bg-[#FFE680] transition shadow-lg"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Bag ({formatPrice(selectedProduct.priceUSD, selectedProduct.priceKSH)})</span>
                  </button>
                  <button
                    onClick={() => toggleWishlist(selectedProduct.id)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition"
                  >
                    <Heart
                      className={"h-5 w-5 " + (wishlist.includes(selectedProduct.id) ? "fill-red-500 text-red-500" : "")}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="h-full w-full max-w-md bg-[#2B2317] text-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-white/20">
            <div>
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-[#FFDE59]" />
                  <h3 className="text-lg font-bold font-serif text-white">Your Wellness Bag</h3>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Free delivery bar */}
              <div className="mt-4 rounded-xl bg-white/10 p-3 text-xs">
                <div className="flex justify-between font-semibold">
                  <span>Free Express Delivery (over $60)</span>
                  <span className="text-[#FFDE59]">
                    {cartTotalUSD >= 60 ? 'Unlocked!' : '$' + (60 - cartTotalUSD).toFixed(0) + ' away'}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-black/30 overflow-hidden">
                  <div
                    className="h-full bg-[#FFDE59] transition-all duration-300"
                    style={{ width: Math.min(100, (cartTotalUSD / 60) * 100) + '%' }}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="mt-6 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center py-12 text-sm text-white/60">Your bag is empty.</p>
                ) : (
                  cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 rounded-2xl bg-white/5 p-3.5 border border-white/10"
                    >
                      <img
                        src={product.heroImage}
                        alt={product.name}
                        className="h-16 w-16 object-contain rounded-xl bg-white/10 p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate font-serif">{product.name}</h4>
                        <div className="text-xs text-[#FFDE59] font-semibold mt-0.5">
                          {formatPrice(product.priceUSD, product.priceKSH)}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(product.id, -1)}
                            className="h-6 w-6 rounded-md bg-white/15 flex items-center justify-center text-xs hover:bg-white/30"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, 1)}
                            className="h-6 w-6 rounded-md bg-white/15 flex items-center justify-center text-xs hover:bg-white/30"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">
                          {formatPrice(product.priceUSD * quantity, product.priceKSH * quantity)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Checkout Area */}
            {cart.length > 0 && (
              <div className="mt-6 border-t border-white/15 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-white/80">
                  <span>Subtotal</span>
                  <span>${cartTotalUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white">
                  <span>Total Due (M-Pesa Till: {shellConfig.tillNumber})</span>
                  <span className="text-[#FFDE59]">KSh {cartTotalKSH.toLocaleString()}</span>
                </div>

                <form onSubmit={handleCheckout} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      M-Pesa Phone Number:
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                      <input
                        type="tel"
                        value={shellConfig.phone}
                        onChange={(e) => setShellConfig({ ...shellConfig, phone: e.target.value })}
                        placeholder="0712345678"
                        required
                        className="w-full rounded-xl bg-white/10 border border-white/20 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:border-[#FFDE59] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-[#FFDE59] py-3.5 text-sm font-bold text-black hover:bg-[#FFE680] transition shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Sending M-Pesa Prompt...</span>
                    ) : (
                      <>
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>Pay KSh {cartTotalKSH.toLocaleString()} with M-Pesa</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Success Modal */}
      {checkoutSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-w-md rounded-3xl bg-[#2A2116] p-8 text-center shadow-2xl border border-white/30 text-white animate-scale-up">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFDE59] text-black">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <h3 className="mt-4 text-2xl font-serif font-bold text-white">Order Confirmed!</h3>
            <p className="mt-2 text-sm text-white/90">
              Prompt sent to <b>{shellConfig.phone}</b> for <b>{shellConfig.brandName}</b> Till <b>{shellConfig.tillNumber}</b>.
            </p>
            <div className="mt-6 rounded-2xl bg-black/40 p-4 text-left text-xs space-y-1">
              <p><b>Store:</b> {shellConfig.brandName}</p>
              <p><b>Order Amount:</b> KSh {cartTotalKSH.toLocaleString()} ($ {cartTotalUSD})</p>
              <p><b>Estimated Dispatch:</b> {shellConfig.deliveryPromise} from {shellConfig.dispatchCity}</p>
            </div>
            <button
              onClick={() => {
                setCheckoutSuccess(false);
                setCartOpen(false);
                setCart([]);
              }}
              className="mt-6 w-full rounded-full bg-white py-3 text-sm font-bold text-black hover:bg-white/90"
            >
              Continue Exploring {shellConfig.brandName}
            </button>
          </div>
        </div>
      )}

      {/* CLIENT SHELL STUDIO DRAWER FOR PURELIX */}
      {customizerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="h-full w-full max-w-lg bg-[#241B11] text-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-white/20">
            <div>
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFDE59] text-black">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black font-serif text-white">Botanical Shell Studio</h3>
                    <p className="text-[11px] text-white/70">Modify this wellness store shell live</p>
                  </div>
                </div>
                <button
                  onClick={() => setCustomizerOpen(false)}
                  className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-5 text-xs">
                {/* 1. Brand Identity */}
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-3">
                  <h4 className="font-bold text-sm text-[#FFDE59] flex items-center gap-1.5 font-serif">
                    <Edit3 className="h-4 w-4" /> Brand & Backdrop Typography
                  </h4>

                  <div>
                    <label className="block font-semibold text-white/80 mb-1">Brand Name (Big Backdrop):</label>
                    <input
                      type="text"
                      value={shellConfig.brandName}
                      onChange={(e) => setShellConfig({ ...shellConfig, brandName: e.target.value.toUpperCase() })}
                      placeholder="e.g. PURELIX, AURA"
                      className="w-full rounded-xl border border-white/20 bg-white/10 p-2.5 text-xs text-white uppercase tracking-wider font-bold focus:outline-none focus:border-[#FFDE59]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-white/80 mb-1">Hero Editorial Headline:</label>
                    <input
                      type="text"
                      value={shellConfig.heroHeading}
                      onChange={(e) => setShellConfig({ ...shellConfig, heroHeading: e.target.value })}
                      placeholder="e.g. Your Journey to Better Health Starts Here"
                      className="w-full rounded-xl border border-white/20 bg-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-[#FFDE59]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-white/80 mb-1">Hero Subtitle / Description:</label>
                    <textarea
                      rows={3}
                      value={shellConfig.heroSubtext}
                      onChange={(e) => setShellConfig({ ...shellConfig, heroSubtext: e.target.value })}
                      className="w-full rounded-xl border border-white/20 bg-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-[#FFDE59]"
                    />
                  </div>
                </div>

                {/* 2. Color Palette */}
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-3">
                  <h4 className="font-bold text-sm text-[#FFDE59] flex items-center gap-1.5 font-serif">
                    <Palette className="h-4 w-4" /> Earth & Botanical Palette
                  </h4>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {BOTANICAL_PALETTES.map((preset) => (
                      <button
                        key={preset.hex}
                        onClick={() => setShellConfig({ ...shellConfig, bgColor: preset.hex })}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-[11px] font-semibold transition ${
                          shellConfig.bgColor === preset.hex
                            ? 'border-white bg-white/30 shadow-sm ring-1 ring-white'
                            : 'border-transparent bg-white/10 hover:bg-white/20 text-white/90'
                        }`}
                      >
                        <span className="h-3.5 w-3.5 rounded-full border border-black/20" style={{ backgroundColor: preset.hex }} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs text-white/70">Custom Background Tone:</span>
                    <input
                      type="color"
                      value={shellConfig.bgColor}
                      onChange={(e) => setShellConfig({ ...shellConfig, bgColor: e.target.value })}
                      className="h-8 w-12 cursor-pointer rounded border border-white/20 p-0.5 bg-transparent"
                    />
                    <span className="font-mono text-xs font-bold text-[#FFDE59]">{shellConfig.bgColor}</span>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <label className="block font-semibold text-white/80 mb-1">Currency Display:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShellConfig({ ...shellConfig, currency: 'USD' })}
                        className={`py-2 rounded-xl font-bold transition ${
                          shellConfig.currency === 'USD'
                            ? 'bg-[#FFDE59] text-black'
                            : 'bg-white/10 border border-white/20 text-white'
                        }`}
                      >
                        USD ($)
                      </button>
                      <button
                        onClick={() => setShellConfig({ ...shellConfig, currency: 'KSH' })}
                        className={`py-2 rounded-xl font-bold transition ${
                          shellConfig.currency === 'KSH'
                            ? 'bg-[#FFDE59] text-black'
                            : 'bg-white/10 border border-white/20 text-white'
                        }`}
                      >
                        Kenyan Shilling (KSh)
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. M-Pesa & Shipping */}
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-3">
                  <h4 className="font-bold text-sm text-[#FFDE59] flex items-center gap-1.5 font-serif">
                    <Smartphone className="h-4 w-4" /> M-Pesa & Courier Dispatch
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-white/80 mb-1">M-Pesa Till / Paybill:</label>
                      <input
                        type="text"
                        value={shellConfig.tillNumber}
                        onChange={(e) => setShellConfig({ ...shellConfig, tillNumber: e.target.value })}
                        className="w-full rounded-xl border border-white/20 bg-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-[#FFDE59] font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-white/80 mb-1">Dispatch City:</label>
                      <input
                        type="text"
                        value={shellConfig.dispatchCity}
                        onChange={(e) => setShellConfig({ ...shellConfig, dispatchCity: e.target.value })}
                        className="w-full rounded-xl border border-white/20 bg-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-[#FFDE59]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-white/80 mb-1">Delivery Promise Tag:</label>
                    <input
                      type="text"
                      value={shellConfig.deliveryPromise}
                      onChange={(e) => setShellConfig({ ...shellConfig, deliveryPromise: e.target.value })}
                      className="w-full rounded-xl border border-white/20 bg-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-[#FFDE59]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 border-t border-white/15 pt-4 space-y-2">
              <button
                onClick={handleLaunchWithShell}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFDE59] py-3.5 text-sm font-bold text-black hover:bg-[#FFE680] transition shadow-lg"
              >
                <span>Launch My Shop With This Shell</span>
                <ExternalLink className="h-4 w-4" />
              </button>

              <button
                onClick={handleResetShell}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/20 py-2.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset Shell to Defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
