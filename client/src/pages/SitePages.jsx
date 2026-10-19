import { useEffect } from 'react';
import { Link, Navigate, useOutletContext, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, HelpCircle, Megaphone, Phone, Sprout } from 'lucide-react';
import Hero from '../components/Hero';
import ProductJar from '../components/ProductJar';
import { Faq, JoinClub, Marquee, Process, Story, Testimonials } from '../components/Sections';
import Shop from '../components/Shop';
import UpdatesSection from '../components/UpdatesSection';
import { EASE, SectionHeading } from '../components/ui';
import { cn, money } from '../lib/format';
import { LOOK } from '../lib/brand';

function usePageTitle(content, title) {
  useEffect(() => {
    const brand = [content.brand.name, content.brand.tagline].filter(Boolean).join(' · ');
    document.title = title ? `${title} · ${content.brand.name}` : brand;
  }, [content, title]);
}

// Pages other than Home: room for the fixed top bar, and a tighter top on the first section.
function Page({ children }) {
  return <div className="pt-[var(--nav-h,5rem)] [&>section:first-child]:pt-8 sm:[&>section:first-child]:pt-14">{children}</div>;
}

// Big tappable cards on the home page, one per page, so customers jump straight to what they want.
function Explore({ content, products, posts }) {
  const prices = products.filter((p) => p.stock > 0).map((p) => p.price);
  const from = prices.length ? Math.min(...prices) : null;
  const latest = posts[0];
  const branches = content.brand.branches;
  const tiles = [
    content.process.enabled && {
      to: '/how-to-order',
      icon: BookOpen,
      eyebrow: content.process.eyebrow || 'How to order',
      title: `Order in ${content.process.steps.length || 3} easy steps`,
      text: 'Choose, pay by M-Pesa, and we deliver.',
    },
    content.updates?.enabled && latest && {
      to: '/updates',
      icon: Megaphone,
      eyebrow: content.updates.eyebrow || 'Updates',
      title: latest.title,
      text: 'News, offers and new products.',
      image: latest.image,
    },
    content.story.enabled && {
      to: '/about',
      icon: Sprout,
      eyebrow: content.story.eyebrow || 'About us',
      title: content.story.title,
      text: 'Our story, and how we make it.',
    },
    content.faq.enabled && {
      to: '/faq',
      icon: HelpCircle,
      eyebrow: 'Questions & branches',
      title: `${branches.length} branch${branches.length === 1 ? '' : 'es'} near you`,
      text: branches.map((b) => b.city).join(' · '),
    },
  ].filter(Boolean);
  const showcase = products.slice(0, 3);
  // Real photos on the shop tile: product shots first, topped up with the brand's banner photos.
  const shots = [
    ...products.filter((p) => p.look?.photo).map((p) => ({ key: p.id, src: p.look.photo, alt: p.name })),
    ...(LOOK.photos ?? []).filter((src) => src.includes('hero-')).map((src) => ({ key: src, src, alt: LOOK.name })),
  ].slice(0, 3);

  return (
    <section id="explore" className="scroll-mt-20 py-12 sm:py-20">
      <div className="container-x">
        <SectionHeading eyebrow="Explore" title="Where would you like to go?" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* Shop: the main tile */}
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }} className="col-span-2 lg:row-span-2">
            <Link to="/shop" className="group relative flex h-full min-h-[15rem] flex-col justify-between overflow-hidden rounded-[var(--r-xl)] bg-espresso p-5 text-cream sm:p-7">
              <div className="bg-dots-light absolute inset-0 opacity-40" />
              <div className="relative">
                <p className="font-script text-3xl leading-none text-honey">Shop</p>
                <h3 className="mt-2 text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">
                  {products.length} {products.length === 1 ? 'product' : 'products'}{from ? `, from ${money(from)}` : ''}
                </h3>
                <p className="mt-1 text-sm text-cream/60">Everything we make, in one place.</p>
              </div>
              <div className="relative mt-4 flex items-end justify-between gap-3">
                {shots.length > 0 ? (
                  <div className="flex -space-x-6 sm:-space-x-8">
                    {shots.map((s, i) => (
                      <div
                        key={s.key}
                        className={cn(
                          'paper-ink w-24 overflow-hidden rounded-[var(--r-lg)] bg-white p-1 shadow-[0_18px_30px_-16px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out-expo sm:w-36 sm:p-1.5',
                          i === 1 ? 'z-10 group-hover:-translate-y-2' : 'translate-y-3',
                          i === 0 && '-rotate-6',
                          i === 2 && 'rotate-6',
                        )}
                      >
                        <img src={s.src} alt={s.alt} loading="lazy" className="aspect-[4/5] w-full rounded-[max(0px,calc(var(--r-lg)-4px))] object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="flex -space-x-5">
                  {showcase.map((p, i) => (
                    <div key={p.id} className={cn('w-16 transition-transform duration-500 ease-out-expo sm:w-24', i === 1 && 'z-10 group-hover:-translate-y-2', i !== 1 && 'translate-y-2')}>
                      <ProductJar look={p.look} size={p.size} showTag={false} className="w-full" />
                    </div>
                  ))}
                </div>
                )}
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-honey text-espresso transition-transform duration-500 ease-out-expo group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
            </Link>
          </motion.div>

          {tiles.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div key={t.to} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.06 * (i + 1), ease: EASE }}>
                <Link to={t.to} className="group flex h-full min-h-[11rem] flex-col overflow-hidden rounded-[var(--r-xl)] bg-white ring-1 ring-espresso/[0.07] transition-shadow duration-500 hover:shadow-[0_24px_44px_-26px_rgba(46,31,20,0.5)]">
                  {t.image ? (
                    <div className="relative h-20 overflow-hidden bg-beige sm:h-24">
                      <img src={t.image} alt="" className="h-full w-full object-cover object-top transition-transform duration-700 ease-out-expo group-hover:scale-105" loading="lazy" />
                    </div>
                  ) : (
                    <span className="mx-4 mt-4 grid h-10 w-10 place-items-center rounded-[var(--r-lg)] bg-beige text-caramel sm:mx-5 sm:mt-5">
                      <Icon className="h-5 w-5" />
                    </span>
                  )}
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <p className="font-script text-2xl leading-none text-amber">{t.eyebrow}</p>
                    <h3 className="mt-1.5 line-clamp-2 text-[15px] leading-snug font-extrabold tracking-tight sm:text-base">{t.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-espresso/55">{t.text}</p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-bold text-caramel">
                      Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {branches[0]?.phone && (
          <a href={`tel:${branches[0].phone.replace(/[^\d+]/g, '')}`} className="mt-4 flex items-center justify-center gap-2 rounded-[var(--r-lg)] bg-beige px-4 py-3 text-sm font-semibold text-espresso/70 sm:hidden">
            <Phone className="h-4 w-4 text-amber" /> Prefer to call? {branches[0].city} {branches[0].phone}
          </a>
        )}
      </div>
    </section>
  );
}

export function HomePage() {
  const { content, products, config, posts, loading, error, select } = useOutletContext();
  usePageTitle(content);
  // Some designs lead with the products right after the banner; the rest send people on from a hub.
  const shopFirst = LOOK.theme?.home === 'shop-first';
  return (
    <>
      <Hero products={products} config={config} content={content} />
      {content.ticker.enabled && <Marquee items={content.ticker.items} />}
      {shopFirst && <Shop products={products} loading={loading} error={error} onSelect={select} shop={content.shop} />}
      <Explore content={content} products={products} posts={posts} />
    </>
  );
}

export function ShopPage() {
  const { content, products, loading, error, select } = useOutletContext();
  const [params, setParams] = useSearchParams();
  usePageTitle(content, 'Shop');

  // /shop?item=<id> opens that product (links from the footer, updates or WhatsApp).
  const item = params.get('item');
  useEffect(() => {
    if (!item || !products.length) return;
    const p = products.find((x) => x.id === item);
    if (p) select(p);
    setParams({}, { replace: true });
  }, [item, products, select, setParams]);

  return (
    <Page>
      <Shop products={products} loading={loading} error={error} onSelect={select} shop={content.shop} />
    </Page>
  );
}

export function UpdatesPage() {
  const { content, posts } = useOutletContext();
  usePageTitle(content, content.updates?.eyebrow || 'Updates');
  if (!content.updates?.enabled || !posts.length) return <Navigate to="/" replace />;
  return (
    <Page>
      <UpdatesSection data={content.updates} posts={posts} />
    </Page>
  );
}

export function HowToOrderPage() {
  const { content } = useOutletContext();
  usePageTitle(content, content.process.eyebrow || 'How to order');
  if (!content.process.enabled) return <Navigate to="/" replace />;
  return (
    <Page>
      <Process data={content.process} />
      <ShopNudge />
    </Page>
  );
}

export function AboutPage() {
  const { content, products } = useOutletContext();
  usePageTitle(content, content.story.eyebrow || 'About us');
  if (!content.story.enabled) return <Navigate to="/" replace />;
  return (
    <Page>
      <div className="h-6 sm:h-10" />
      <Story data={content.story} products={products} />
      {content.reviews.enabled && content.reviews.items.length > 0 && <Testimonials data={content.reviews} />}
      <ShopNudge />
    </Page>
  );
}

export function FaqPage() {
  const { content } = useOutletContext();
  usePageTitle(content, 'Questions & branches');
  if (!content.faq.enabled && !content.newsletter.enabled) return <Navigate to="/" replace />;
  return (
    <Page>
      {content.faq.enabled && <Faq data={content.faq} brand={content.brand} />}
      {content.newsletter.enabled && <JoinClub data={content.newsletter} />}
    </Page>
  );
}

// End-of-page prompt so a page never dead-ends.
function ShopNudge() {
  return (
    <div className="container-x pb-6">
      <Link to="/shop" className="group flex items-center justify-between gap-4 rounded-[var(--r-xl)] bg-beige px-5 py-4 font-bold text-espresso ring-1 ring-espresso/[0.07] transition-colors hover:bg-sand sm:px-7 sm:py-5">
        <span>
          <span className="block font-script text-2xl leading-none font-normal text-caramel">Ready?</span>
          See all products and prices
        </span>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-espresso text-honey transition-transform group-hover:translate-x-1">
          <ArrowRight className="h-5 w-5" />
        </span>
      </Link>
    </div>
  );
}
