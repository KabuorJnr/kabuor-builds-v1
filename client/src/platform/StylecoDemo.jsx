import { useState, useMemo } from 'react';
import { Link } from 'react-router';
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

const PRODUCTS = [
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

export default function StylecoDemo() {
  // Navigation tabs: 'storefront' | 'catalog'
  const [activeTab, setActiveTab] = useState('storefront');

  // Filter States
  const [activeCategory, setActiveCategory] = useState('tops');
  const [priceRange, setPriceRange] = useState(2000);
  const [selectedColor, setSelectedColor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState(['shirt-1', 'shirt-3']);

  // Product Detail Page (PDP) State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedQty, setSelectedQty] = useState(1);

  // Cart Drawer State
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([
    {
      product: PRODUCTS[0],
      size: 'L',
      quantity: 1,
    },
  ]);
  const [phone, setPhone] = useState('0712345678');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // Filter logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (p.price > priceRange) return false;
      if (selectedColor && p.color !== selectedColor) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activeCategory, priceRange, selectedColor, searchQuery]);

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

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1E1E1E] font-sans">
      {/* Return to Platform Bar */}
      <aside aria-label="Demo notice" className="border-b border-[#E5E5E5] bg-[#1A1A1A] px-4 py-2 text-xs font-medium text-white/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#107C41] animate-pulse" />
            <span>Kabuor Shops Concept Showcase · <b>Styleco. Modern Apparel</b></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-white/10 rounded-full p-0.5 text-[11px]">
              <button
                onClick={() => {
                  setActiveTab('storefront');
                  setSelectedProduct(null);
                }}
                className={`px-3 py-1 rounded-full transition ${activeTab === 'storefront' ? 'bg-white text-black font-bold' : 'text-white/80 hover:text-white'}`}
              >
                Storefront View
              </button>
              <button
                onClick={() => {
                  setActiveTab('catalog');
                  setSelectedProduct(null);
                }}
                className={`px-3 py-1 rounded-full transition ${activeTab === 'catalog' ? 'bg-white text-black font-bold' : 'text-white/80 hover:text-white'}`}
              >
                Filtered Catalog (PLP)
              </button>
            </div>
            <Link
              to="/shops"
              className="inline-flex items-center gap-1 rounded bg-white/15 px-2.5 py-1 text-white hover:bg-white/25 transition"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Shops
            </Link>
          </div>
        </div>
      </aside>

      {/* Top App Download Banner matching User Design */}
      <div className="bg-[#1A1A1A] text-white text-xs py-2 px-4 border-b border-[#333]">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="font-normal text-white/90">
            Now you can shopping in Styleco. mobile app, Install now
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
      <header className="sticky top-0 z-40 border-b border-[#EAEAEA] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                setActiveTab('storefront');
                setSelectedProduct(null);
              }}
              className="text-2xl font-black tracking-tight text-[#1A1A1A] hover:opacity-80 transition cursor-pointer"
            >
              Styleco.
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
              <a href="#custom" onClick={() => setActiveTab('storefront')} className="hover:text-black transition">Project</a>
            </nav>
          </div>

          {/* Search, Contact Us, and Bag */}
          <div className="flex items-center gap-3">
            {/* Search Pill */}
            <div className="relative hidden sm:block w-48 lg:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8E8E93]" />
              <input
                type="text"
                placeholder="Search style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full bg-[#F5F5F7] py-2 pl-9 pr-4 text-xs text-[#1A1A1A] placeholder-[#8E8E93] focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Circular Search button (as in image) */}
            <button
              onClick={() => {
                setActiveTab('catalog');
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              className="flex sm:hidden h-9 w-9 items-center justify-center rounded-full bg-[#1A1A1A] text-white hover:bg-black"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Contact Us Pill button matching design */}
            <button
              onClick={() => setContactOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#1A1A1A] px-4 py-1.5 text-xs font-semibold text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition"
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
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF5350] text-[10px] font-bold text-white shadow-sm">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* VIEW 1: Full Storefront Homepage (matching the newly uploaded design) */}
      {activeTab === 'storefront' && !selectedProduct && (
        <main className="space-y-16 pb-24">
          {/* 1. "Best of the week" Hero Section */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
            <div className="flex items-baseline justify-between border-b border-[#E5E5E5] pb-4">
              <div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1A1A1A]">
                  Best of the week
                </h1>
                <p className="mt-1 text-xs text-[#737373] flex items-center gap-1 font-medium">
                  See all picture <span className="text-black">→</span>
                </p>
              </div>
              <button
                onClick={() => setActiveTab('catalog')}
                className="text-xs font-bold text-[#1A1A1A] underline hover:text-[#555] transition"
              >
                View more
              </button>
            </div>

            {/* 3 Editorial Cards Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {/* Card 1: Woman in Yellow Coat (Large Spotlight Card) */}
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
                    alt="Fashion is a trend of modern life"
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">• New Drops</p>
                  <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-[#1A1A1A]">
                    Fashion is an trend of modern life
                  </h3>
                </div>
              </div>

              {/* Card 2: Orange Dress Model */}
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
                    alt="Female Cloth Fashion"
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

              {/* Card 3: Orange Blazer Back View */}
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
                    alt="Male Cloth Tailored Blazer"
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

          {/* 2. Brand Ambassadors Section matching design */}
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

          {/* 3. "Latest collection of styleco. 2026" - 8 Shirts Grid */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between border-b border-[#E5E5E5] pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
                  Latest collection of styleco. 2026
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

            {/* 8 Products Grid matching user image */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {PRODUCTS.map((p) => {
                const isFav = wishlist.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-4 border border-[#F0F0F0] hover:border-[#D1D1D6] hover:shadow-lg transition duration-200"
                  >
                    {/* Top Wishlist Heart */}
                    <div className="flex items-center justify-between">
                      {p.badge ? (
                        <span className="rounded-full bg-[#1A1A1A] px-2 py-0.5 text-[9px] font-bold text-white uppercase">
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

                    {/* Product Image */}
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

                    {/* Product Info */}
                    <div>
                      <h3
                        onClick={() => {
                          setSelectedProduct(p);
                          setSelectedSize('M');
                          setSelectedQty(1);
                        }}
                        className="cursor-pointer text-sm font-bold text-[#1A1A1A] hover:text-[#2357F5] truncate"
                      >
                        {p.name}
                      </h3>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-black text-[#1A1A1A]">
                          {p.price}$
                        </span>
                        <button
                          onClick={() => addToCart(p, 'M', 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition shadow-xs"
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

          {/* 4. "We've finally updated our store, Order three new items" */}
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
              {/* Banner 1 */}
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

              {/* Banner 2 */}
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

              {/* Banner 3 */}
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

          {/* 5. Promo & Big Discount Cards matching design */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Black Promo Card with geometric line art */}
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
                {/* Visual backdrop */}
                <div className="absolute right-0 bottom-0 opacity-40 pointer-events-none">
                  <img src="/brand/styleco/promo_black.png" alt="Promo art" className="h-44 object-cover" />
                </div>
              </div>

              {/* Orange Promo Card with 40% OFF badge */}
              <div className="relative overflow-hidden rounded-3xl bg-[#FF6A13] p-8 sm:p-10 text-white flex flex-col justify-between min-h-[260px] shadow-xl">
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
                {/* Model preview */}
                <div className="absolute right-0 bottom-0 pointer-events-none h-full flex items-end">
                  <img src="/brand/styleco/promo_orange.png" alt="Sale 40% off" className="h-full object-contain" />
                </div>
              </div>
            </div>
          </section>

          {/* 6. "WANT TO DESIGN YOUR OWN? CALM, CAN DO IT!" */}
          <section id="custom" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-[#1A1A1A] p-8 sm:p-12 text-white text-center shadow-2xl relative">
              <span className="text-xs font-bold tracking-widest uppercase text-[#FFCA28]">Custom Bespoke Studio</span>
              <h2 className="mt-2 text-2xl sm:text-4xl font-black uppercase tracking-tight">
                WANT TO DESIGN YOUR OWN? CALM, CAN DO IT!
              </h2>
              <p className="mt-3 max-w-xl mx-auto text-xs sm:text-sm text-white/70">
                Choose fabrics, patterns, and button specifications. Our Nairobi atelier handles custom batches for weddings, uniforms, and capsule drops.
              </p>

              {/* Video Lookbook Rack */}
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
              <p className="text-xs uppercase tracking-wider font-bold text-[#8E8E93]">Apparel Catalog</p>
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
            {/* Sidebar Filters matching User Design 2 */}
            <aside className="space-y-8 pr-4">
              <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
                <h3 className="text-base font-bold text-[#1A1A1A]">Filter</h3>
                <SlidersHorizontal className="h-4 w-4 text-[#1A1A1A]" />
              </div>

              {/* Categories Accordion */}
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

              {/* Price Slider */}
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

              {/* 12 Colors Swatch Grid matching design */}
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

            {/* Products 3-Column Grid */}
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
                        {/* Wishlist toggle button */}
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

                        {/* Image stage */}
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

                        {/* Details */}
                        <div>
                          <h3
                            onClick={() => {
                              setSelectedProduct(p);
                              setSelectedSize('M');
                              setSelectedQty(1);
                            }}
                            className="cursor-pointer text-base font-bold text-[#1A1A1A] hover:text-[#2357F5] transition"
                          >
                            {p.name}
                          </h3>

                          <div className="mt-3 flex items-center justify-between">
                            <div>
                              <div className="text-lg font-black text-[#1A1A1A]">{p.price}$</div>
                              <div className="text-[11px] text-[#8E8E93]">KSh {p.priceKsh.toLocaleString()}</div>
                            </div>
                            <button
                              onClick={() => addToCart(p, 'M', 1)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition shadow-sm"
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
            {/* Left: Product Image Stage */}
            <div className="rounded-3xl bg-[#F8F9FA] p-8 border border-[#EAEAEA] flex items-center justify-center aspect-square">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="max-h-[420px] max-w-full object-contain filter drop-shadow-md"
              />
            </div>

            {/* Right: Info & Selectors */}
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#FF6A13]">
                  {selectedProduct.badge || 'New Season'}
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
                  <span className="text-[#107C41] font-semibold ml-2">● In Stock (Nairobi)</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-[#1A1A1A]">${selectedProduct.price}</span>
                <span className="text-sm font-semibold text-[#8E8E93]">
                  (KSh {selectedProduct.priceKsh.toLocaleString()})
                </span>
              </div>

              <p className="text-sm text-[#555] leading-relaxed">
                {selectedProduct.desc}
              </p>

              {/* Size Picker */}
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

              {/* Quantity Stepper & Add to Bag */}
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
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] py-3.5 text-sm font-bold text-white hover:bg-black transition shadow-lg"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Bag · ${(selectedProduct.price * selectedQty)}</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 border-t border-[#EAEAEA] pt-6 text-xs text-[#555]">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#107C41]" />
                  <span>Same-Day Nairobi Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-[#107C41]" />
                  <span>7-Day Easy Exchange</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#107C41]" />
                  <span>100% Cotton & Rayon Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-[#107C41]" />
                  <span>Direct M-Pesa PIN Prompt</span>
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
            {/* Header */}
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

              {/* Cart Items List */}
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
                        <p className="text-xs font-black text-[#1A1A1A] mt-1">${product.price * quantity}</p>
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

            {/* M-Pesa Checkout Area */}
            {cart.length > 0 && (
              <div className="border-t border-[#EAEAEA] pt-4 space-y-3">
                <div className="flex justify-between text-sm text-[#737373]">
                  <span>Subtotal</span>
                  <span>${cartTotalUSD}</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#1A1A1A]">
                  <span>Total (M-Pesa)</span>
                  <span>KSh {cartTotalKSH.toLocaleString()}</span>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    M-Pesa Phone Number:
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 h-4 w-4 text-[#737373]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0712345678"
                      className="w-full rounded-xl border border-[#D1D1D6] py-2.5 pl-10 pr-4 text-sm text-[#1A1A1A] focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCheckoutSuccess(true);
                  }}
                  className="w-full rounded-xl bg-[#107C41] py-3.5 text-sm font-bold text-white hover:bg-[#0D6535] transition shadow-md"
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
              We have dispatched your order prompt to <b>{phone}</b>. Your order will be packed and delivered same-day in Nairobi.
            </p>
            <div className="mt-6 rounded-xl bg-[#F5F5F7] p-4 text-left text-xs space-y-1">
              <p><b>Order Reference:</b> #STY-{Math.floor(100000 + Math.random() * 900000)}</p>
              <p><b>Amount:</b> KSh {cartTotalKSH.toLocaleString()} ($ {cartTotalUSD})</p>
              <p><b>Status:</b> Ready for dispatch</p>
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

      {/* Contact Us Modal */}
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
            <h3 className="text-xl font-black text-[#1A1A1A]">Talk with Styleco. Concierge</h3>
            <p className="mt-2 text-xs text-[#737373]">
              Need help with sizing, bespoke tailoring orders, or delivery status across Kenya?
            </p>
            <div className="mt-6 space-y-3">
              <a
                href="https://wa.me/254712345678"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white hover:opacity-90"
              >
                <span>Chat on WhatsApp</span>
              </a>
              <a
                href="tel:+254712345678"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#1A1A1A] py-3 text-sm font-bold text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition"
              >
                <span>Direct Phone Call</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
