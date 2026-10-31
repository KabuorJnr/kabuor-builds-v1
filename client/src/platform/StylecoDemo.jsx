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
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Smartphone,
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
    colorName: 'Broom / Orange',
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
    color: 'black',
    colorName: 'Navy & Ochre Vertical Stripe',
    image: '/brand/styleco/shirt_6.png',
    rating: 4.8,
    reviews: 129,
    desc: 'Classic menswear vertical block stripes in collegiate navy and warm mustard yellow. Tailored fit.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
];

export default function StylecoDemo() {
  const [selectedCategory, setSelectedCategory] = useState('tops');
  const [priceMax, setPriceMax] = useState(300);
  const [selectedColor, setSelectedColor] = useState(null);
  const [favorites, setFavorites] = useState(['shirt-1']);
  const [cart, setCart] = useState([
    { id: 'shirt-1', size: 'M', qty: 1, ...PRODUCTS[0] },
  ]);
  const [activeProduct, setActiveProduct] = useState(null); // PDP open state
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');
  const [pdpQty, setPdpQty] = useState(1);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [phone, setPhone] = useState('0712 345 678');

  // Filter logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (p.price > priceMax) return false;
      if (selectedColor && p.color !== selectedColor) return false;
      return true;
    });
  }, [selectedCategory, priceMax, selectedColor]);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addToCart = (product, size = 'M', qty = 1, e) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const existing = prev.find((x) => x.id === product.id && x.size === size);
      if (existing) {
        return prev.map((x) =>
          x.id === product.id && x.size === size ? { ...x, qty: x.qty + qty } : x
        );
      }
      return [...prev, { ...product, size, qty }];
    });
    setCartOpen(true);
  };

  const cartTotalUSD = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartTotalKSH = cart.reduce((sum, item) => sum + item.priceKsh * item.qty, 0);

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-[#1D1D1F]">
      {/* 1. App Store Top Bar */}
      <div className="bg-[#1A1A1A] px-4 py-2.5 text-center text-xs font-medium text-white sm:text-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#107C41] animate-pulse" />
            Now you can shopping in Styleco. mobile app, Install now
          </p>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20 transition">
              <Smartphone className="h-3.5 w-3.5 text-[#107C41]" /> Google Play
            </button>
            <button className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20 transition">
              App Store
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <header className="sticky top-0 z-40 border-b border-[#E5E5E5] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div className="flex items-center gap-10">
            <Link to="/demo/styleco" className="text-2xl font-black tracking-tight text-[#1A1A1A]">
              Styleco<span className="text-[#FF5722]">.</span>
            </Link>
            <nav className="hidden items-center gap-7 md:flex">
              <button
                type="button"
                className="relative py-1 text-sm font-bold text-[#1A1A1A] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1A1A1A]"
              >
                Shop
              </button>
              <button type="button" className="text-sm font-medium text-[#737373] hover:text-[#1A1A1A] transition">
                Women
              </button>
              <button type="button" className="text-sm font-medium text-[#737373] hover:text-[#1A1A1A] transition">
                Men
              </button>
              <button type="button" className="text-sm font-medium text-[#737373] hover:text-[#1A1A1A] transition">
                Children
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Search input */}
            <div className="relative hidden w-64 md:block">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8E93]" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-full border border-[#E5E5E5] bg-[#F5F5F7] py-2 pl-10 pr-4 text-sm text-[#1A1A1A] outline-none focus:border-[#1A1A1A] focus:bg-white transition"
              />
            </div>

            {/* User profile avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#FFA000] to-[#FF5722] text-xs font-bold text-white shadow-sm">
              RK
            </div>

            {/* Shopping bag trigger */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[#1A1A1A] hover:border-[#1A1A1A] transition"
            >
              <ShoppingBag className="h-4 w-4" />
              {cart.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1A1A1A] text-[11px] font-bold text-white">
                  {cart.reduce((a, b) => a + b.qty, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        {/* Back Link to platform */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/shops"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#1A1A1A] transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Kabuor Shops
          </Link>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#107C41] border border-[#E5E5E5] shadow-xs">
            ● Live Concept Preview · Kabuor Apparel Engine
          </span>
        </div>

        {/* If PDP (Product Details Page) is open */}
        {activeProduct ? (
          <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 sm:p-10 shadow-sm animate-fade-in">
            <button
              onClick={() => setActiveProduct(null)}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#737373] hover:text-[#1A1A1A]"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Male's Clothing
            </button>

            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
              {/* Product Gallery */}
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl bg-[#F5F5F7] p-8 text-center border border-[#EBEBEB]">
                  <img
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    className="mx-auto h-[380px] w-auto object-contain transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="flex gap-3">
                  {[1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="h-20 w-20 cursor-pointer overflow-hidden rounded-xl border-2 border-[#1A1A1A] bg-[#F5F5F7] p-2"
                    >
                      <img src={activeProduct.image} alt="" className="h-full w-full object-contain" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Info & Purchase Drawer */}
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex text-[#FFB300]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[#737373]">
                    {activeProduct.rating} ({activeProduct.reviews} verified reviews)
                  </span>
                </div>

                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1A1A1A] sm:text-4xl">
                  {activeProduct.name}
                </h1>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-black text-[#1A1A1A]">${activeProduct.price}</span>
                  <span className="text-base font-semibold text-[#107C41]">
                    (KSh {activeProduct.priceKsh.toLocaleString()} with M-Pesa)
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#555] sm:text-base">
                  {activeProduct.desc}
                </p>

                {/* Color Selector */}
                <div className="mt-6 border-t border-[#F0F0F0] pt-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                    Color: <b className="text-[#1A1A1A] font-semibold">{activeProduct.colorName}</b>
                  </span>
                  <div className="mt-2.5 flex gap-2">
                    <span
                      className="h-7 w-7 rounded-full ring-2 ring-offset-2 ring-[#1A1A1A]"
                      style={{ background: COLORS.find((c) => c.id === activeProduct.color)?.hex }}
                    />
                  </div>
                </div>

                {/* Size Selector */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#737373]">Select Size</span>
                    <button className="text-xs font-semibold text-[#1A1A1A] underline">Size Guide</button>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2.5">
                    {activeProduct.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`h-11 min-w-[50px] rounded-xl px-4 text-sm font-bold transition ${
                          selectedSize === s
                            ? 'bg-[#1A1A1A] text-white shadow-sm'
                            : 'border border-[#E5E5E5] bg-white text-[#1A1A1A] hover:border-[#1A1A1A]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity and Actions */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <div className="flex h-12 items-center rounded-xl border border-[#E5E5E5] bg-white px-3">
                    <button
                      onClick={() => setPdpQty((q) => Math.max(1, q - 1))}
                      className="px-2 font-bold text-[#737373] hover:text-[#1A1A1A]"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold">{pdpQty}</span>
                    <button
                      onClick={() => setPdpQty((q) => q + 1)}
                      className="px-2 font-bold text-[#737373] hover:text-[#1A1A1A]"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => addToCart(activeProduct, selectedSize, pdpQty)}
                    className="flex-1 rounded-xl bg-[#1A1A1A] py-3.5 px-6 font-bold text-white shadow-md hover:bg-black transition"
                  >
                    Add to Bag · ${(activeProduct.price * pdpQty).toFixed(0)}
                  </button>

                  <button
                    onClick={() => {
                      addToCart(activeProduct, selectedSize, pdpQty);
                      setCartOpen(true);
                    }}
                    className="rounded-xl border-2 border-[#107C41] bg-[#107C41]/10 px-5 py-3 text-sm font-bold text-[#107C41] hover:bg-[#107C41] hover:text-white transition"
                  >
                    Buy with M-Pesa
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 grid grid-cols-3 gap-3 border-t border-[#F0F0F0] pt-6 text-center text-xs text-[#737373]">
                  <div className="flex flex-col items-center gap-1.5">
                    <Truck className="h-5 w-5 text-[#107C41]" />
                    <span className="font-semibold text-[#1A1A1A]">Same-Day Delivery</span>
                    <span>Nairobi & Countrywide</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <RotateCcw className="h-5 w-5 text-[#107C41]" />
                    <span className="font-semibold text-[#1A1A1A]">7-Day Easy Return</span>
                    <span>Free size swaps</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <ShieldCheck className="h-5 w-5 text-[#107C41]" />
                    <span className="font-semibold text-[#1A1A1A]">M-Pesa Verified</span>
                    <span>Daraja STK Prompt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 4. Product Listing Page (PLP) */
          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            {/* Left Filter Sidebar */}
            <aside className="rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-xs h-fit space-y-6">
              <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-4">
                <h2 className="flex items-center gap-2 text-base font-bold text-[#1A1A1A]">
                  <SlidersHorizontal className="h-4 w-4" /> Filter
                </h2>
                {(selectedColor || priceMax < 300) && (
                  <button
                    onClick={() => {
                      setSelectedColor(null);
                      setPriceMax(300);
                    }}
                    className="text-xs font-semibold text-[#FF5722] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex w-full items-center justify-between py-2 text-sm font-medium transition ${
                      selectedCategory === cat.id ? 'font-bold text-[#1A1A1A]' : 'text-[#737373] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <ChevronRight className="h-4 w-4 text-[#C7C7CC]" />
                  </button>
                ))}
              </div>

              {/* Price Slider */}
              <div className="border-t border-[#F0F0F0] pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1A1A1A]">Price</span>
                  <ChevronDown className="h-4 w-4 text-[#737373]" />
                </div>
                <div className="mt-4">
                  <input
                    type="range"
                    min="100"
                    max="300"
                    step="10"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full accent-[#FF5722] cursor-pointer"
                  />
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold text-[#1A1A1A]">
                    <span className="rounded-lg border border-[#E5E5E5] bg-[#F5F5F7] px-3 py-1.5">$100</span>
                    <span className="text-[#8E8E93]">—</span>
                    <span className="rounded-lg border border-[#E5E5E5] bg-[#F5F5F7] px-3 py-1.5">${priceMax}</span>
                  </div>
                </div>
              </div>

              {/* Colors Swatches Grid */}
              <div className="border-t border-[#F0F0F0] pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1A1A1A]">Colors</span>
                  <ChevronDown className="h-4 w-4 text-[#737373]" />
                </div>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {COLORS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSelectedColor(selectedColor === col.id ? null : col.id)}
                      className="group flex flex-col items-center gap-1.5 text-center cursor-pointer"
                    >
                      <span
                        className={`h-7 w-7 rounded-lg transition-transform ${
                          col.border ? 'border border-[#D1D1D6]' : ''
                        } ${
                          selectedColor === col.id
                            ? 'scale-110 ring-2 ring-offset-2 ring-[#1A1A1A]'
                            : 'group-hover:scale-105'
                        }`}
                        style={{ background: col.hex }}
                      />
                      <span className="text-[10px] font-medium text-[#737373] truncate w-full">{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <section>
              <div className="mb-6 flex items-baseline justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1A1A]">Male's Clothing</h1>
                  <p className="text-xs font-medium text-[#737373] mt-1">
                    Showing {filteredProducts.length} curated designer pieces
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#737373]">Sort by: Featured</span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((p) => {
                  const isFav = favorites.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => setActiveProduct(p)}
                      className="group relative cursor-pointer rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-xs transition hover:shadow-md hover:border-[#1A1A1A]"
                    >
                      {/* Favorite Heart Button */}
                      <button
                        onClick={(e) => toggleFavorite(p.id, e)}
                        className={`absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-xs transition ${
                          isFav ? 'text-[#FF5722]' : 'text-[#8E8E93] hover:text-[#1A1A1A]'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isFav ? 'fill-current text-[#FF5722]' : ''}`} />
                      </button>

                      {/* Shirt Image with clean background */}
                      <div className="overflow-hidden rounded-xl bg-[#F5F5F7] p-6 text-center">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="mx-auto h-48 w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Details & Bag Action */}
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#FF5722] transition">
                            {p.name}
                          </h3>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-base font-black text-[#1A1A1A]">{p.price}$</span>
                            <span className="text-xs font-semibold text-[#107C41]">
                              KSh {p.priceKsh.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Quick Add Button */}
                        <button
                          onClick={(e) => addToCart(p, 'M', 1, e)}
                          title="Quick add to bag"
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition shadow-xs"
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* 5. Slide-over Shopping Drawer & M-Pesa Checkout */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition">
          <div className="flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl animate-slide-left">
            <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#1A1A1A]" />
                <h3 className="text-lg font-extrabold text-[#1A1A1A]">Your Bag ({cart.reduce((a, b) => a + b.qty, 0)})</h3>
              </div>
              <button onClick={() => setCartOpen(false)} className="rounded-full p-1 text-[#737373] hover:text-[#1A1A1A]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#F5F5F7] py-4">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#737373]">Your shopping bag is empty.</div>
              ) : (
                cart.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4 py-4">
                    <img src={item.image} alt="" className="h-20 w-20 rounded-xl bg-[#F5F5F7] object-contain p-2" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-bold text-[#1A1A1A]">{item.name}</h4>
                        <span className="text-sm font-black text-[#1A1A1A]">${item.price * item.qty}</span>
                      </div>
                      <p className="text-xs text-[#737373] mt-0.5">Size: {item.size} · KSh {item.priceKsh.toLocaleString()}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center rounded-lg border border-[#E5E5E5] px-2 py-0.5 text-xs font-bold">
                          <button
                            onClick={() =>
                              setCart((prev) =>
                                prev
                                  .map((x) => (x.id === item.id && x.size === item.size ? { ...x, qty: x.qty - 1 } : x))
                                  .filter((x) => x.qty > 0)
                              )
                            }
                            className="px-1.5 text-[#888]"
                          >
                            -
                          </button>
                          <span className="w-6 text-center">{item.qty}</span>
                          <button
                            onClick={() =>
                              setCart((prev) =>
                                prev.map((x) => (x.id === item.id && x.size === item.size ? { ...x, qty: x.qty + 1 } : x))
                              )
                            }
                            className="px-1.5 text-[#888]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total and M-Pesa Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-[#F0F0F0] pt-4 space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-[#737373]">
                    <span>Subtotal</span>
                    <span>${cartTotalUSD.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-[#1A1A1A]">
                    <span>Total (KSh)</span>
                    <span className="text-[#107C41]">KSh {cartTotalKSH.toLocaleString()}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-[#F5FAF7] p-3 border border-[#107C41]/20">
                  <label className="block text-xs font-bold text-[#107C41]">M-Pesa Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#C5E1D4] bg-white px-3 py-2 text-sm font-semibold outline-none"
                    placeholder="0712 345 678"
                  />
                  <span className="mt-1 block text-[11px] text-[#5A8C74]">
                    PIN prompt will appear on your phone for KSh {cartTotalKSH.toLocaleString()}.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setCheckoutSuccess(true)}
                  className="w-full rounded-xl bg-[#107C41] py-4 text-center font-bold text-white shadow-md hover:bg-[#0E6C38] transition cursor-pointer"
                >
                  Pay with M-Pesa Now
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
    </div>
  );
}
