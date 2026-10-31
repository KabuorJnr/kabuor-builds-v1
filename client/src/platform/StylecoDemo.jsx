import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import {
  Heart,
  ShoppingBag,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  ArrowLeft,
  ArrowUpRight,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Smartphone,
  Play,
  Sparkles,
  PhoneCall,
  Sliders,
  Settings,
  Edit3,
  RefreshCw,
  Plus,
  Palette,
  ExternalLink,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'dresses', label: 'Dresses', count: 42 },
  { id: 'denim', label: 'Denim & jeans', count: 38 },
  { id: 'knitwear', label: 'Knitwear', count: 19 },
  { id: 'skirts', label: 'Skirts', count: 27 },
  { id: 'pants', label: 'Pants', count: 54 },
  { id: 'jackets', label: 'Jackets & coats', count: 31 },
  { id: 'tops', label: 'Tops & tees', count: 86, defaultActive: true },
];

const COLORS = [
  { id: 'green', name: 'Green', hex: '#4CAF50' },
  { id: 'black', name: 'Black', hex: '#1E1E1E' },
  { id: 'purple', name: 'Purple', hex: '#7E57C2' },
  { id: 'red', name: 'Red', hex: '#EF5350' },
  { id: 'blue', name: 'Blue', hex: '#2979FF' },
  { id: 'white', name: 'White', hex: '#F5F5F5', border: true },
  { id: 'brown', name: 'Broom', hex: '#D78A4A' },
  { id: 'pink', name: 'Pink', hex: '#E91E63' },
  { id: 'yellow', name: 'Yellow', hex: '#FFCA28' },
  { id: 'sky', name: 'Sky', hex: '#29B6F6' },
  { id: 'gray', name: 'Gray', hex: '#9E9E9E' },
  { id: 'crimson', name: 'Crimson', hex: '#880E4F' },
];

const DEFAULT_PRODUCTS = [
  {
    id: 'shirt-1',
    name: 'Polyester Printed Shirt',
    price: 130,
    priceKsh: 16900,
    category: 'tops',
    color: 'brown',
    colorName: 'Broom / Orange Stripe',
    image: '/brand/styleco/shirt_1.png',
    rating: 4.9,
    reviews: 142,
    badge: 'Popular',
    desc: 'Crafted from an ultra-breathable premium polyester blend with vacation-ready camp collar and tailored silhouette.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'shirt-2',
    name: 'Half Sleeve Shirts',
    price: 245,
    priceKsh: 31850,
    category: 'tops',
    color: 'green',
    colorName: 'Tropical Floral',
    image: '/brand/styleco/shirt_2.png',
    rating: 4.8,
    reviews: 98,
    desc: 'Fresh botanical foliage pattern on lightweight textured cotton weave. Ideal for warm weekend strolls.',
    sizes: ['M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'shirt-3',
    name: 'Rayon Shirt Fabric',
    price: 150,
    priceKsh: 19500,
    category: 'tops',
    color: 'blue',
    colorName: 'Multi-Color Paint Stripe',
    image: '/brand/styleco/shirt_3.png',
    rating: 4.9,
    reviews: 115,
    desc: 'Silky soft drape rayon with hand-painted artistic vertical color lines for an effortless statement look.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'shirt-7',
    name: 'Montaine Shirts',
    price: 140,
    priceKsh: 18200,
    category: 'tops',
    color: 'green',
    colorName: 'Sage Mountain Foliage',
    image: '/brand/styleco/shirt_7.png',
    rating: 4.85,
    reviews: 73,
    badge: 'Trending',
    desc: 'Sophisticated sage botanical pattern with notched resort collar and breathable natural fiber weave.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'shirt-4',
    name: 'Hawaiian Shirts',
    price: 120,
    priceKsh: 15600,
    category: 'tops',
    color: 'sky',
    colorName: 'Doodle Comic Pop Art',
    image: '/brand/styleco/shirt_4.png',
    rating: 4.7,
    reviews: 84,
    desc: 'Playful pop-art doodle comic print on breezy structured weave. Guaranteed conversation starter.',
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'shirt-5',
    name: 'Half Sleeve Shirts',
    price: 260,
    priceKsh: 33800,
    category: 'tops',
    color: 'sky',
    colorName: 'Flamingo Palm Oasis',
    image: '/brand/styleco/shirt_5.png',
    rating: 5.0,
    reviews: 67,
    desc: 'Deep marine blue with vivid coral pink flamingos and palm fronds. Finished with Mother-of-Pearl buttons.',
    sizes: ['M', 'L', 'XL'],
  },
  {
    id: 'shirt-6',
    name: 'Printed Top Shirts',
    price: 200,
    priceKsh: 26000,
    category: 'tops',
    color: 'yellow',
    colorName: 'Mustard Navy Vertical Stripe',
    image: '/brand/styleco/shirt_6.png',
    rating: 4.9,
    reviews: 104,
    desc: 'Bold vintage vertical rugby-block stripes in rich mustard ochre and navy. Tailored slim fit with natural stretch.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'shirt-8',
    name: 'Multicolor Print Shirts',
    price: 220,
    priceKsh: 28600,
    category: 'tops',
    color: 'gray',
    colorName: 'Abstract Monochrome Floral',
    image: '/brand/styleco/shirt_8.png',
    rating: 4.92,
    reviews: 89,
    badge: 'Limited',
    desc: 'High-contrast artistic floral print with modern relaxed silhouette. Premium drapey lyocell blend.',
    sizes: ['M', 'L', 'XL'],
  },
];

const AMBASSADORS = [
  'MITRADE',
  'STARKS',
  'MERCK',
  'FRAP',
  'PHILIPS',
  'CORDOVA',
];

const ACCENT_PRESETS = [
  { name: 'Onyx Noir', hex: '#1E1E1E' },
  { name: 'Electric Orange', hex: '#FF6A13' },
  { name: 'Royal Sapphire', hex: '#2357F5' },
  { name: 'Emerald Palm', hex: '#107C41' },
  { name: 'Crimson Velvet', hex: '#880E4F' },
  { name: 'Golden Honey', hex: '#C89B59' },
];

export default function StylecoDemo() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // Client Shell Configurable State
  const [shellConfig, setShellConfig] = useState({
    storeName: params.get('name') || 'Styleco.',
    tagline: 'Fashion is a trend of modern life',
    heroTitle: 'Best of the week',
    announcement: 'Now you can shopping in our mobile app, Install now',
    accentColor: params.get('accent') || '#1E1E1E',
    currency: 'USD', // 'USD' | 'KSH'
    tillNumber: '345678',
    dispatchCity: 'Nairobi',
    deliveryPromise: 'Same-day Nairobi delivery',
    phone: '0712345678',
  });

  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('storefront');

  // Filter States
  const [activeCategory, setActiveCategory] = useState('tops');
  const [priceRange, setPriceRange] = useState(2000);
  const [selectedColor, setSelectedColor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState(['shirt-1', 'shirt-3']);

  // PDP & Cart
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedQty, setSelectedQty] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([
    {
      product: DEFAULT_PRODUCTS[0],
      size: 'L',
      quantity: 1,
    },
  ]);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // Filter logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (p.price > priceRange) return false;
      if (selectedColor && p.color !== selectedColor) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, activeCategory, priceRange, selectedColor, searchQuery]);

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addToCart = (product, size, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity += qty;
        return next;
      }
      return [...prev, { product, size, quantity: qty }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const cartTotalUSD = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartTotalKSH = cart.reduce((sum, item) => sum + item.product.priceKsh * item.quantity, 0);

  const formatPrice = (usd, ksh) => {
    if (shellConfig.currency === 'KSH') {
      return 'KSh ' + ksh.toLocaleString();
    }
    return '$' + usd;
  };

  // Launch Shop with this shell
  const handleLaunchWithShell = () => {
    const query = new URLSearchParams({
      kind: 'fashion',
      name: shellConfig.storeName,
      accent: shellConfig.accentColor,
    }).toString();
    navigate('/start?' + query);
  };

  // Reset shell to default
  const handleResetShell = () => {
    setShellConfig({
      storeName: 'Styleco.',
      tagline: 'Fashion is a trend of modern life',
      heroTitle: 'Best of the week',
      announcement: 'Now you can shopping in our mobile app, Install now',
      accentColor: '#1E1E1E',
      currency: 'USD',
      tillNumber: '345678',
      dispatchCity: 'Nairobi',
      deliveryPromise: 'Same-day Nairobi delivery',
      phone: '0712345678',
    });
    setProducts(DEFAULT_PRODUCTS);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1E1E1E] font-sans">
      {/* Platform & Shell Management Bar */}
      <aside aria-label="Shell Controls" className="sticky top-0 z-50 border-b border-white/10 bg-[#141414] px-4 py-2 text-xs font-medium text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#107C41] animate-pulse" />
            <span>Kabuor Shell Engine · <b>Modifiable Apparel Shell</b></span>
            <span className="hidden sm:inline-block rounded bg-white/15 px-2 py-0.5 text-[10px] text-white/90">
              Live Customizer Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Customize Trigger Button */}
            <button
              onClick={() => setCustomizerOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-[#FF6A13] px-3.5 py-1 text-xs font-bold text-white shadow hover:bg-[#E55A05] transition"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Customize Shell</span>
            </button>

            {/* View Switcher */}
            <div className="hidden md:flex bg-white/10 rounded-full p-0.5 text-[11px]">
              <button
                onClick={() => {
                  setActiveTab('storefront');
                  setSelectedProduct(null);
                }}
                className={`px-3 py-1 rounded-full transition ${activeTab === 'storefront' ? 'bg-white text-black font-bold' : 'text-white/80 hover:text-white'}`}
              >
                Storefront
              </button>
              <button
                onClick={() => {
                  setActiveTab('catalog');
                  setSelectedProduct(null);
                }}
                className={`px-3 py-1 rounded-full transition ${activeTab === 'catalog' ? 'bg-white text-black font-bold' : 'text-white/80 hover:text-white'}`}
              >
                Catalog & Filters
              </button>
            </div>

            <Link
              to="/shops"
              className="inline-flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 text-white hover:bg-white/20 transition"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
          </div>
        </div>
      </aside>

      {/* Top App Download / Announcement Banner */}
      <div className="bg-[#1A1A1A] text-white text-xs py-2 px-4 border-b border-[#333]">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="font-normal text-white/90 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3DDC84]" />
            {shellConfig.announcement}
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90">
              <span className="text-[#3DDC84]">▶</span> Google Play
            </span>
            <span className="flex items-center gap-1.5 rounded bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90">
              <span></span> App Store
            </span>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="border-b border-[#EAEAEA] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          {/* Brand Wordmark (Modifiable by client) */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                setActiveTab('storefront');
                setSelectedProduct(null);
              }}
              className="text-2xl sm:text-3xl font-black tracking-tight text-[#1A1A1A] hover:opacity-80 transition cursor-pointer flex items-center gap-1"
            >
              <span style={{ color: shellConfig.accentColor }}>{shellConfig.storeName}</span>
            </button>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4B4B4B]">
              <button
                onClick={() => {
                  setActiveTab('catalog');
                  setSelectedProduct(null);
                }}
                className={`transition cursor-pointer ${activeTab === 'catalog' ? 'text-black font-bold' : 'hover:text-black'}`}
              >
                Products
              </button>
              <a href="#services" onClick={() => setActiveTab('storefront')} className="hover:text-black transition">Service</a>
              <a href="#ambassadors" onClick={() => setActiveTab('storefront')} className="hover:text-black transition">About</a>
              <a href="#trends" onClick={() => setActiveTab('storefront')} className="hover:text-black transition">Overview</a>
              <a href="#custom" onClick={() => setActiveTab('storefront')} className="hover:text-black transition">Custom Studio</a>
            </nav>
          </div>

          {/* Search, Contact Us, and Bag */}
          <div className="flex items-center gap-3">
            {/* Search Pill */}
            <div className="relative hidden sm:block w-48 lg:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8E8E93]" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full bg-[#F5F5F7] py-2 pl-9 pr-4 text-xs text-[#1A1A1A] placeholder-[#8E8E93] focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Contact Us Pill */}
            <button
              onClick={() => setContactOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold hover:bg-black hover:text-white transition"
              style={{ borderColor: shellConfig.accentColor, color: shellConfig.accentColor }}
            >
              Contact Us
            </button>

            {/* Cart Bag */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F7] text-[#1A1A1A] hover:bg-[#EAEAEA] transition"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="h-4 w-4" />
              {cart.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: shellConfig.accentColor }}
                >
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* VIEW 1: Storefront Homepage */}
      {activeTab === 'storefront' && !selectedProduct && (
        <main className="space-y-16 pb-24">
          {/* "Best of the week" Hero Section */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
            <div className="flex items-baseline justify-between border-b border-[#E5E5E5] pb-4">
              <div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1A1A1A]">
                  {shellConfig.heroTitle}
                </h1>
                <p className="mt-1 text-xs text-[#737373] flex items-center gap-1 font-medium">
                  {shellConfig.tagline} <span className="text-black">→</span>
                </p>
              </div>
              <button
                onClick={() => setActiveTab('catalog')}
                className="text-xs font-bold underline hover:text-[#555] transition"
                style={{ color: shellConfig.accentColor }}
              >
                View all items
              </button>
            </div>

            {/* 3 Editorial Cards Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {/* Card 1 */}
              <div className="md:col-span-6 group relative overflow-hidden rounded-3xl bg-[#F8F9FA] p-6 border border-[#EAEAEA] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-white">
                      • Cloths
                    </span>
                    <span className="rounded-full bg-white/80 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-[#1A1A1A]">
                      NOV 04,2026
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1A1A1A] shadow-md group-hover:scale-110 transition"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="my-6 overflow-hidden rounded-2xl aspect-[4/3] flex items-center justify-center bg-[#E6C641]/15">
                  <img
                    src="/brand/styleco/card_yellow_coat.png"
                    alt="Fashion Drop"
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">• New Drops</p>
                  <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-[#1A1A1A]">
                    {shellConfig.tagline}
                  </h3>
                </div>
              </div>

              {/* Card 2 */}
              <div className="md:col-span-3 group relative overflow-hidden rounded-3xl bg-[#FFF8F0] p-6 border border-[#FFE8D1] shadow-sm flex flex-col justify-between">
                <div className="flex justify-end">
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1A1A1A] shadow-md group-hover:scale-110 transition"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="my-4 overflow-hidden rounded-2xl aspect-[3/4] flex items-center justify-center bg-[#FFA500]/10">
                  <img
                    src="/brand/styleco/card_orange_dress.png"
                    alt="Female Collection"
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#FF6B00] uppercase tracking-wider">• Female Cloth</p>
                  <h3 className="mt-1 text-base font-extrabold text-[#1A1A1A] leading-snug">
                    Fashion is always come from inside
                  </h3>
                </div>
              </div>

              {/* Card 3 */}
              <div className="md:col-span-3 group relative overflow-hidden rounded-3xl bg-[#F0F8FF] p-6 border border-[#D8ECFF] shadow-sm flex flex-col justify-between">
                <div className="flex justify-end">
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1A1A1A] shadow-md group-hover:scale-110 transition"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="my-4 overflow-hidden rounded-2xl aspect-[3/4] flex items-center justify-center bg-[#0088FF]/10">
                  <img
                    src="/brand/styleco/card_orange_blazer.png"
                    alt="Tailored Blazer"
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#0066CC] uppercase tracking-wider">• Male Cloth</p>
                  <h3 className="mt-1 text-base font-extrabold text-[#1A1A1A] leading-snug">
                    Fashion is a big art
                  </h3>
                </div>
              </div>
            </div>
          </section>

          {/* Brand Ambassadors Section */}
          <section id="ambassadors" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between pb-6">
              <div className="flex items-center gap-2">
                <span className="text-[#FFB300] font-black text-lg">\|/</span>
                <h2 className="text-2xl font-extrabold tracking-tight text-[#1A1A1A]">
                  Our modern brand ambassador
                </h2>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-pink-500 font-bold">
                <span className="text-neutral-300">〰️〰️</span>
                <span>👗</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {AMBASSADORS.map((brand) => (
                <div
                  key={brand}
                  className="flex h-20 items-center justify-center rounded-2xl border border-[#E5E5E5] bg-white p-4 text-center font-black tracking-widest text-[#737373] hover:border-black hover:text-black transition shadow-xs"
                >
                  {brand}
                </div>
              ))}
            </div>
          </section>

          {/* 8-Product Collection Grid */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between border-b border-[#E5E5E5] pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
                  Latest collection of {shellConfig.storeName}
                </h2>
                <p className="mt-1 text-xs text-[#737373]">
                  Breathable cottons, luxury silks, and summer printed fabrics.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('catalog')}
                className="flex items-center gap-1 text-xs font-bold text-[#1A1A1A] hover:underline"
              >
                <span>View all</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => {
                const isFav = wishlist.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-4 border border-[#F0F0F0] hover:border-[#D1D1D6] hover:shadow-lg transition duration-200"
                  >
                    <div className="flex items-center justify-between">
                      {p.badge ? (
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white uppercase"
                          style={{ backgroundColor: shellConfig.accentColor }}
                        >
                          {p.badge}
                        </span>
                      ) : <span />}
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-[#737373] hover:text-[#EF5350] transition shadow-xs"
                        aria-label="Wishlist"
                      >
                        <Heart className={`h-4 w-4 ${isFav ? 'fill-[#EF5350] text-[#EF5350]' : ''}`} />
                      </button>
                    </div>

                    <div
                      onClick={() => {
                        setSelectedProduct(p);
                        setSelectedSize('M');
                        setSelectedQty(1);
                      }}
                      className="cursor-pointer my-4 flex aspect-square items-center justify-center rounded-xl bg-[#F7F7F9] p-3 group-hover:scale-105 transition duration-300"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="max-h-48 max-w-full object-contain filter drop-shadow-sm"
                      />
                    </div>

                    <div>
                      <h3
                        onClick={() => {
                          setSelectedProduct(p);
                          setSelectedSize('M');
                          setSelectedQty(1);
                        }}
                        className="cursor-pointer text-sm font-bold text-[#1A1A1A] hover:underline truncate"
                      >
                        {p.name}
                      </h3>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-black text-[#1A1A1A]">
                          {formatPrice(p.price, p.priceKsh)}
                        </span>
                        <button
                          onClick={() => addToCart(p, 'M', 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[#1A1A1A] hover:bg-black hover:text-white transition shadow-xs"
                          aria-label="Add to Bag"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Trend Cards */}
          <section id="trends" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto pb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
                We've finally updated our store, Order three new items
              </h2>
              <p className="mt-2 text-xs text-[#737373]">
                Hand-curated modern silhouettes blending comfort with runway trends.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group relative overflow-hidden rounded-3xl bg-[#FFF9E6] p-6 border border-[#FFE8A3] flex flex-col justify-between min-h-[220px]">
                <div className="z-10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#B28900]">• Featured</span>
                  <h3 className="mt-1 text-lg font-black text-[#1A1A1A] leading-tight">
                    LUXURY FASHION <br />TRENDING MODELS
                  </h3>
                </div>
                <div className="mt-4 flex items-center justify-between z-10">
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="rounded-full bg-[#1A1A1A] px-4 py-2 text-xs font-bold text-white hover:bg-black transition"
                  >
                    Explore Models
                  </button>
                  <img
                    src="/brand/styleco/banner_luxury.png"
                    alt="Luxury Fashion"
                    className="h-24 object-contain group-hover:scale-105 transition"
                  />
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-3xl bg-[#FDE8E8] p-6 border border-[#F8B4B4] flex flex-col justify-between min-h-[220px]">
                <div className="z-10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#C81E1E]">• Street Vibes</span>
                  <h3 className="mt-1 text-lg font-black text-[#1A1A1A] leading-tight">
                    STREET WEAR <br />STYLE TREND
                  </h3>
                </div>
                <div className="mt-4 flex items-center justify-between z-10">
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="rounded-full bg-[#1A1A1A] px-4 py-2 text-xs font-bold text-white hover:bg-black transition"
                  >
                    Explore Trend
                  </button>
                  <img
                    src="/brand/styleco/banner_street.png"
                    alt="Streetwear Trend"
                    className="h-24 object-contain group-hover:scale-105 transition"
                  />
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-3xl bg-[#E6F4EA] p-6 border border-[#CEEAD6] flex flex-col justify-between min-h-[220px]">
                <div className="z-10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#137333]">• Premium Pick</span>
                  <h3 className="mt-1 text-lg font-black text-[#1A1A1A] leading-tight">
                    CHOICE STYLES & <br />MINIMAL ACCENTS
                  </h3>
                </div>
                <div className="mt-4 flex items-center justify-between z-10">
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="rounded-full bg-[#1A1A1A] px-4 py-2 text-xs font-bold text-white hover:bg-black transition"
                  >
                    Shop Modern
                  </button>
                  <div className="h-20 w-20 rounded-full bg-[#137333]/10 flex items-center justify-center font-bold text-[#137333]">
                    ✨ 2026
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Promo & Big Discount Cards */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative overflow-hidden rounded-3xl bg-[#0F0F0F] p-8 sm:p-10 text-white flex flex-col justify-between min-h-[260px] shadow-xl">
                <div className="relative z-10 max-w-md">
                  <span className="text-xs font-bold tracking-widest uppercase text-white/60">Limited Season Offer</span>
                  <h3 className="mt-3 text-2xl sm:text-3xl font-black leading-tight tracking-tight uppercase">
                    GET YOURSELF A SOMETHING TO WEAR IN THIS FASHION TREADS WITH BIG DISCOUNT
                  </h3>
                </div>
                <div className="mt-6 flex items-center gap-4 relative z-10">
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="rounded-full bg-white px-6 py-3 text-xs font-bold text-black hover:bg-[#EEE] transition"
                  >
                    Claim Discount
                  </button>
                  <span className="text-xs text-white/70">Promo code: <b>STYLE40</b></span>
                </div>
                <div className="absolute right-0 bottom-0 opacity-40 pointer-events-none">
                  <img src="/brand/styleco/promo_black.png" alt="Promo art" className="h-44 object-cover" />
                </div>
              </div>

              <div
                className="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between min-h-[260px] shadow-xl"
                style={{ backgroundColor: shellConfig.accentColor === '#1E1E1E' ? '#FF6A13' : shellConfig.accentColor }}
              >
                <div className="relative z-10 max-w-sm">
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white mb-2">
                    Flash Clearance
                  </span>
                  <div className="text-4xl sm:text-5xl font-black italic tracking-tighter drop-shadow-md">
                    SALE UP <br />40% OFF
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-4 relative z-10">
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="rounded-full bg-black px-6 py-3 text-xs font-bold text-white hover:bg-[#222] transition shadow-md"
                  >
                    SHOP NOW
                  </button>
                </div>
                <div className="absolute right-0 bottom-0 pointer-events-none h-full flex items-end">
                  <img src="/brand/styleco/promo_orange.png" alt="Sale 40% off" className="h-full object-contain" />
                </div>
              </div>
            </div>
          </section>

          {/* Atelier Studio */}
          <section id="custom" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-[#1A1A1A] p-8 sm:p-12 text-white text-center shadow-2xl relative">
              <span className="text-xs font-bold tracking-widest uppercase text-[#FFCA28]">Custom Bespoke Studio</span>
              <h2 className="mt-2 text-2xl sm:text-4xl font-black uppercase tracking-tight">
                WANT TO DESIGN YOUR OWN? CALM, CAN DO IT!
              </h2>
              <p className="mt-3 max-w-xl mx-auto text-xs sm:text-sm text-white/70">
                Choose fabrics, patterns, and button specifications. Our {shellConfig.dispatchCity} atelier handles custom batches for weddings, uniforms, and capsule drops.
              </p>

              <div className="mt-8 relative overflow-hidden rounded-2xl max-w-4xl mx-auto border border-white/20 aspect-[16/6] bg-black flex items-center justify-center group">
                <img
                  src="/brand/styleco/banner_rack.png"
                  alt="Clothing Rack Atelier"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
                />
                <button
                  onClick={() => setContactOpen(true)}
                  className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black shadow-2xl hover:scale-110 transition group-hover:bg-white"
                >
                  <Play className="h-6 w-6 ml-1 fill-black" />
                </button>
              </div>

              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() => setContactOpen(true)}
                  className="rounded-full bg-[#FFCA28] px-6 py-3 text-xs font-bold text-black hover:bg-[#FFE082] transition shadow-md"
                >
                  Start Custom Order on WhatsApp
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* VIEW 2: Product Listing Page (PLP) with Sidebar Filters */}
      {activeTab === 'catalog' && !selectedProduct && (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between pb-6 border-b border-[#EAEAEA]">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-[#8E8E93]">{shellConfig.storeName} Catalog</p>
              <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold text-[#1A1A1A]">Male's Clothing</h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#737373]">
              <span>Showing <b>{filteredProducts.length}</b> products</span>
              <button
                onClick={() => {
                  setSelectedColor(null);
                  setActiveCategory(null);
                  setPriceRange(2000);
                  setSearchQuery('');
                }}
                className="underline hover:text-black font-semibold"
              >
                Reset filters
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="space-y-8 pr-4">
              <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
                <h3 className="text-base font-bold text-[#1A1A1A]">Filter</h3>
                <SlidersHorizontal className="h-4 w-4 text-[#1A1A1A]" />
              </div>

              <div>
                <ul className="space-y-2.5 text-sm">
                  {CATEGORIES.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() =>
                          setActiveCategory(activeCategory === cat.id ? null : cat.id)
                        }
                        className={`flex w-full items-center justify-between py-1 transition text-left ${
                          activeCategory === cat.id
                            ? 'font-bold text-[#1A1A1A]'
                            : 'text-[#737373] hover:text-[#1A1A1A]'
                        }`}
                      >
                        <span>{cat.label}</span>
                        <ChevronRight className="h-4 w-4 text-[#A0A0A0]" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[#EAEAEA] pt-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#1A1A1A]">Price</h4>
                  <ChevronDown className="h-4 w-4 text-[#1A1A1A]" />
                </div>
                <div className="mt-4">
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="10"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-[#FF6A13]"
                  />
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                    <span className="rounded-lg border border-[#E5E5E5] px-3 py-1.5 font-bold text-[#1A1A1A]">
                      $100
                    </span>
                    <span className="text-[#A0A0A0]">to</span>
                    <span className="rounded-lg border border-[#E5E5E5] px-3 py-1.5 font-bold text-[#1A1A1A]">
                      ${priceRange}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#EAEAEA] pt-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#1A1A1A]">Colors</h4>
                  <ChevronDown className="h-4 w-4 text-[#1A1A1A]" />
                </div>
                <div className="mt-4 grid grid-cols-4 gap-3 text-center">
                  {COLORS.map((c) => {
                    const isSelected = selectedColor === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedColor(isSelected ? null : c.id)}
                        className="group flex flex-col items-center gap-1.5 focus:outline-none"
                      >
                        <div
                          className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition duration-150 ${
                            isSelected ? 'ring-2 ring-black ring-offset-2 scale-110' : 'hover:scale-105'
                          } ${c.border ? 'border border-[#D1D1D6]' : ''}`}
                          style={{ backgroundColor: c.hex }}
                        >
                          {isSelected && (
                            <Check
                              className={`h-4 w-4 stroke-[3] ${
                                c.id === 'white' || c.id === 'yellow'
                                  ? 'text-black'
                                  : 'text-white'
                              }`}
                            />
                          )}
                        </div>
                        <span className="text-[11px] text-[#737373] group-hover:text-black">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <div className="lg:col-span-3">
              {filteredProducts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#D1D1D6] p-12 text-center">
                  <p className="text-sm text-[#737373]">No products match the selected filters.</p>
                  <button
                    onClick={() => {
                      setSelectedColor(null);
                      setPriceRange(2000);
                      setActiveCategory(null);
                    }}
                    className="mt-4 rounded-full bg-[#1A1A1A] px-5 py-2 text-xs font-bold text-white"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((p) => {
                    const isFav = wishlist.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white p-5 border border-[#F0F0F0] hover:border-[#D1D1D6] hover:shadow-xl transition duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#8E8E93]">{p.colorName}</span>
                          <button
                            onClick={() => toggleWishlist(p.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#737373] hover:text-[#EF5350] transition shadow-xs"
                            aria-label="Wishlist"
                          >
                            <Heart className={`h-4 w-4 ${isFav ? 'fill-[#EF5350] text-[#EF5350]' : ''}`} />
                          </button>
                        </div>

                        <div
                          onClick={() => {
                            setSelectedProduct(p);
                            setSelectedSize('M');
                            setSelectedQty(1);
                          }}
                          className="cursor-pointer my-4 flex aspect-square items-center justify-center rounded-2xl bg-[#F8F9FA] p-4 group-hover:scale-105 transition duration-300"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="max-h-56 max-w-full object-contain filter drop-shadow-sm"
                          />
                        </div>

                        <div>
                          <h3
                            onClick={() => {
                              setSelectedProduct(p);
                              setSelectedSize('M');
                              setSelectedQty(1);
                            }}
                            className="cursor-pointer text-base font-bold text-[#1A1A1A] hover:underline"
                          >
                            {p.name}
                          </h3>

                          <div className="mt-3 flex items-center justify-between">
                            <div>
                              <div className="text-lg font-black text-[#1A1A1A]">
                                {formatPrice(p.price, p.priceKsh)}
                              </div>
                            </div>
                            <button
                              onClick={() => addToCart(p, 'M', 1)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[#1A1A1A] hover:bg-black hover:text-white transition shadow-sm"
                              aria-label="Add to Bag"
                            >
                              <ShoppingBag className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* VIEW 3: Product Details Page (PDP) */}
      {selectedProduct && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <button
            onClick={() => setSelectedProduct(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#737373] hover:text-black mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to listings
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="rounded-3xl bg-[#F8F9FA] p-8 border border-[#EAEAEA] flex items-center justify-center aspect-square">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="max-h-[420px] max-w-full object-contain filter drop-shadow-md"
              />
            </div>

            <div className="space-y-6">
              <div>
                <span
                  className="text-xs uppercase tracking-wider font-bold"
                  style={{ color: shellConfig.accentColor }}
                >
                  {selectedProduct.badge || 'New Season Drop'}
                </span>
                <h1 className="mt-1 text-3xl sm:text-4xl font-black text-[#1A1A1A]">
                  {selectedProduct.name}
                </h1>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <div className="flex items-center text-[#FFB300]">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 font-bold text-black">{selectedProduct.rating}</span>
                  </div>
                  <span className="text-[#8E8E93]">({selectedProduct.reviews} customer reviews)</span>
                  <span className="text-[#107C41] font-semibold ml-2">● In Stock ({shellConfig.dispatchCity})</span>
                </div>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-[#1A1A1A]">
                  {formatPrice(selectedProduct.price, selectedProduct.priceKsh)}
                </span>
              </div>

              <p className="text-sm text-[#555] leading-relaxed">
                {selectedProduct.desc}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Select Size:</span>
                  <button className="underline text-[#737373] hover:text-black">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`h-11 w-12 rounded-xl text-xs font-bold transition ${
                        selectedSize === sz
                          ? 'bg-[#1A1A1A] text-white'
                          : 'border border-[#E5E5E5] text-[#1A1A1A] hover:border-black'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <div className="flex items-center rounded-xl border border-[#E5E5E5] px-3 py-2">
                  <button
                    onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                    className="px-2 text-sm font-bold text-[#737373] hover:text-black"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-bold">{selectedQty}</span>
                  <button
                    onClick={() => setSelectedQty((q) => q + 1)}
                    className="px-2 text-sm font-bold text-[#737373] hover:text-black"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => addToCart(selectedProduct, selectedSize, selectedQty)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition shadow-lg"
                  style={{ backgroundColor: shellConfig.accentColor }}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Bag · {formatPrice(selectedProduct.price * selectedQty, selectedProduct.priceKsh * selectedQty)}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#EAEAEA] pt-6 text-xs text-[#555]">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#107C41]" />
                  <span>{shellConfig.deliveryPromise}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-[#107C41]" />
                  <span>7-Day Easy Exchange</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#107C41]" />
                  <span>100% Quality Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-[#107C41]" />
                  <span>M-Pesa Till {shellConfig.tillNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide-over Cart & Checkout Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="h-full w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-[#1A1A1A]" />
                  <h3 className="text-lg font-bold text-[#1A1A1A]">Your Bag ({cart.length})</h3>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="rounded-full p-2 text-[#737373] hover:bg-[#F5F5F7] hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center py-12 text-sm text-[#737373]">Your bag is empty.</p>
                ) : (
                  cart.map(({ product, size, quantity }, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 rounded-2xl bg-[#F9F9FB] p-3 border border-[#EAEAEA]"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-16 w-16 object-contain rounded-xl bg-white p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#1A1A1A] truncate">{product.name}</h4>
                        <p className="text-[11px] text-[#737373]">Size: <b>{size}</b> · Qty: <b>{quantity}</b></p>
                        <p className="text-xs font-black text-[#1A1A1A] mt-1">
                          {formatPrice(product.price * quantity, product.priceKsh * quantity)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-xs text-[#EF5350] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="border-t border-[#EAEAEA] pt-4 space-y-3">
                <div className="flex justify-between text-sm text-[#737373]">
                  <span>Subtotal</span>
                  <span>${cartTotalUSD}</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#1A1A1A]">
                  <span>Total Due</span>
                  <span>KSh {cartTotalKSH.toLocaleString()}</span>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    M-Pesa Phone for PIN Prompt (Till: {shellConfig.tillNumber}):
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 h-4 w-4 text-[#737373]" />
                    <input
                      type="tel"
                      value={shellConfig.phone}
                      onChange={(e) => setShellConfig({ ...shellConfig, phone: e.target.value })}
                      placeholder="0712345678"
                      className="w-full rounded-xl border border-[#D1D1D6] py-2.5 pl-10 pr-4 text-sm text-[#1A1A1A] focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutSuccess(true)}
                  className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition shadow-md"
                  style={{ backgroundColor: shellConfig.accentColor }}
                >
                  Pay KSh {cartTotalKSH.toLocaleString()} with M-Pesa
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Success Modal */}
      {checkoutSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl animate-scale-up">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#107C41]/10 text-[#107C41]">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <h3 className="mt-4 text-2xl font-extrabold text-[#1A1A1A]">Order Confirmed!</h3>
            <p className="mt-2 text-sm text-[#737373]">
              Dispatched M-Pesa prompt to <b>{shellConfig.phone}</b> for Till <b>{shellConfig.tillNumber}</b>.
            </p>
            <div className="mt-6 rounded-xl bg-[#F5F5F7] p-4 text-left text-xs space-y-1">
              <p><b>Store:</b> {shellConfig.storeName}</p>
              <p><b>Order Reference:</b> #ORD-{Math.floor(100000 + Math.random() * 900000)}</p>
              <p><b>Amount:</b> KSh {cartTotalKSH.toLocaleString()} ($ {cartTotalUSD})</p>
              <p><b>Dispatch:</b> {shellConfig.deliveryPromise}</p>
            </div>
            <button
              onClick={() => {
                setCheckoutSuccess(false);
                setCartOpen(false);
                setCart([]);
              }}
              className="mt-6 w-full rounded-xl bg-[#1A1A1A] py-3 text-sm font-bold text-white hover:bg-black"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Concierge Modal */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-w-md w-full rounded-3xl bg-white p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setContactOpen(false)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-[#F5F5F7] flex items-center justify-center text-black"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="h-12 w-12 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center mb-4">
              <PhoneCall className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black text-[#1A1A1A]">Talk with {shellConfig.storeName} Concierge</h3>
            <p className="mt-2 text-xs text-[#737373]">
              Need help with sizing, bespoke tailoring orders, or delivery in {shellConfig.dispatchCity}?
            </p>
            <div className="mt-6 space-y-3">
              <a
                href={`https://wa.me/254${shellConfig.phone.replace(/^0/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white hover:opacity-90"
              >
                <span>Chat on WhatsApp</span>
              </a>
              <a
                href={`tel:${shellConfig.phone}`}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#1A1A1A] py-3 text-sm font-bold text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition"
              >
                <span>Direct Phone Call ({shellConfig.phone})</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT SHELL STUDIO DRAWER (The interactive customizer) */}
      {customizerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="h-full w-full max-w-lg bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6A13] text-white">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#1A1A1A]">Client Shell Studio</h3>
                    <p className="text-[11px] text-[#737373]">Customize this apparel store shell live</p>
                  </div>
                </div>
                <button
                  onClick={() => setCustomizerOpen(false)}
                  className="rounded-full p-2 text-[#737373] hover:bg-[#F5F5F7] hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Controls */}
              <div className="mt-6 space-y-5 text-xs">
                {/* 1. Brand Identity */}
                <div className="rounded-2xl bg-[#F8F9FA] p-4 border border-[#EAEAEA] space-y-3">
                  <h4 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-1.5">
                    <Edit3 className="h-4 w-4 text-[#FF6A13]" /> Brand Identity
                  </h4>

                  <div>
                    <label className="block font-semibold text-[#555] mb-1">Business / Brand Name:</label>
                    <input
                      type="text"
                      value={shellConfig.storeName}
                      onChange={(e) => setShellConfig({ ...shellConfig, storeName: e.target.value })}
                      placeholder="e.g. Nairobi Drip, Styleco."
                      className="w-full rounded-xl border border-[#D1D1D6] bg-white p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-black font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#555] mb-1">Brand Tagline / Hero Subtext:</label>
                    <input
                      type="text"
                      value={shellConfig.tagline}
                      onChange={(e) => setShellConfig({ ...shellConfig, tagline: e.target.value })}
                      placeholder="e.g. Modern streetwear for urban creators"
                      className="w-full rounded-xl border border-[#D1D1D6] bg-white p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#555] mb-1">Top Announcement Bar:</label>
                    <input
                      type="text"
                      value={shellConfig.announcement}
                      onChange={(e) => setShellConfig({ ...shellConfig, announcement: e.target.value })}
                      placeholder="e.g. Free same-day delivery over KSh 3,000"
                      className="w-full rounded-xl border border-[#D1D1D6] bg-white p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* 2. Color Palette & Look */}
                <div className="rounded-2xl bg-[#F8F9FA] p-4 border border-[#EAEAEA] space-y-3">
                  <h4 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-1.5">
                    <Palette className="h-4 w-4 text-[#FF6A13]" /> Brand Accent Color
                  </h4>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {ACCENT_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        onClick={() => setShellConfig({ ...shellConfig, accentColor: preset.hex })}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-[11px] font-semibold transition ${
                          shellConfig.accentColor === preset.hex
                            ? 'border-black bg-white shadow-sm ring-1 ring-black'
                            : 'border-transparent bg-white/70 hover:bg-white'
                        }`}
                      >
                        <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: preset.hex }} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs text-[#737373]">Custom Hex:</span>
                    <input
                      type="color"
                      value={shellConfig.accentColor}
                      onChange={(e) => setShellConfig({ ...shellConfig, accentColor: e.target.value })}
                      className="h-8 w-12 cursor-pointer rounded border border-gray-300 p-0.5"
                    />
                    <span className="font-mono text-xs font-bold">{shellConfig.accentColor}</span>
                  </div>

                  <div className="pt-2 border-t border-[#EAEAEA]">
                    <label className="block font-semibold text-[#555] mb-1">Primary Currency Display:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShellConfig({ ...shellConfig, currency: 'USD' })}
                        className={`py-2 rounded-xl font-bold transition ${
                          shellConfig.currency === 'USD'
                            ? 'bg-[#1A1A1A] text-white'
                            : 'bg-white border border-[#D1D1D6] text-[#555]'
                        }`}
                      >
                        USD ($)
                      </button>
                      <button
                        onClick={() => setShellConfig({ ...shellConfig, currency: 'KSH' })}
                        className={`py-2 rounded-xl font-bold transition ${
                          shellConfig.currency === 'KSH'
                            ? 'bg-[#1A1A1A] text-white'
                            : 'bg-white border border-[#D1D1D6] text-[#555]'
                        }`}
                      >
                        Kenyan Shilling (KSh)
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. M-Pesa & Dispatch Settings */}
                <div className="rounded-2xl bg-[#F8F9FA] p-4 border border-[#EAEAEA] space-y-3">
                  <h4 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4 text-[#107C41]" /> M-Pesa & Delivery
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#555] mb-1">M-Pesa Till / Paybill:</label>
                      <input
                        type="text"
                        value={shellConfig.tillNumber}
                        onChange={(e) => setShellConfig({ ...shellConfig, tillNumber: e.target.value })}
                        className="w-full rounded-xl border border-[#D1D1D6] bg-white p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-black font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#555] mb-1">Base Dispatch City:</label>
                      <input
                        type="text"
                        value={shellConfig.dispatchCity}
                        onChange={(e) => setShellConfig({ ...shellConfig, dispatchCity: e.target.value })}
                        className="w-full rounded-xl border border-[#D1D1D6] bg-white p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#555] mb-1">Customer Delivery Promise:</label>
                    <input
                      type="text"
                      value={shellConfig.deliveryPromise}
                      onChange={(e) => setShellConfig({ ...shellConfig, deliveryPromise: e.target.value })}
                      className="w-full rounded-xl border border-[#D1D1D6] bg-white p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 border-t border-[#EAEAEA] pt-4 space-y-2">
              <button
                onClick={handleLaunchWithShell}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2357F5] py-3.5 text-sm font-bold text-white hover:bg-[#1A45C8] transition shadow-lg"
              >
                <span>Launch My Shop With This Shell</span>
                <ExternalLink className="h-4 w-4" />
              </button>

              <button
                onClick={handleResetShell}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[#E5E5E5] py-2.5 text-xs font-semibold text-[#737373] hover:text-black hover:bg-[#F5F5F7] transition"
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
