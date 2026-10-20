import { useEffect } from 'react';
import { Link, Navigate, useOutletContext, useSearchParams } from 'react-router';
import { ArrowRight, BookOpen, HelpCircle, Megaphone, Phone, Smartphone, Sprout, Truck } from 'lucide-react';
import Hero from '../components/Hero';
import { Faq, JoinClub, Marquee, Process, Story, Testimonials } from '../components/Sections';
import Shop from '../components/Shop';
import UpdatesSection from '../components/UpdatesSection';
import { SectionHeading } from '../components/ui';
import { cn, money } from '../lib/format';
import { telHref } from '../lib/branches';

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

// How buying works, answered up front: how to pay, how it gets to you, and who to talk to.
function Assurance({ config, content }) {
  const branches = content.brand.branches ?? [];
  const contact = branches.find((b) => b.phone);
  const till = config?.paymentMethods?.[0]?.hint;
  const items = [
    { icon: Smartphone, title: 'Pay with M-Pesa', text: config?.mpesaPrompt ? 'The PIN prompt comes straight to your phone at checkout.' : till ? `At checkout. ${till}.` : 'At checkout, with a receipt for every order.' },
    config?.deliveryEnabled
      ? { icon: Truck, title: config.freeDeliveryThreshold > 0 ? `Free delivery over ${money(config.freeDeliveryThreshold)}` : 'Delivered to you', text: config.deliveryNote || 'By rider or parcel service.' }
      : { icon: Truck, title: 'Pick up', text: 'Collect from us. Delivery is coming soon.' },
    contact
      ? { icon: Phone, title: 'Talk to a person', text: `${contact.city ? `${contact.city}: ` : ''}${contact.phone}`, href: telHref(contact.phone) }
      : { icon: Phone, title: 'Real people', text: 'Questions before you order? Ask us.' },
  ];
  return (
    <section className="border-y border-espresso/10 bg-white/50">
      <ul className="container-x grid gap-6 py-8 sm:grid-cols-3 sm:gap-8 sm:py-10">
        {items.map(({ icon: Icon, title, text, href }) => (
          <li key={title} className="flex gap-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-beige text-caramel">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0">
              <b className="block text-[15px]">{title}</b>
              {href ? (
                <a href={href} className="text-sm text-espresso/60 hover:text-espresso hover:underline">
                  {text}
                </a>
              ) : (
                <span className="text-sm text-espresso/60">{text}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// The rest of the site, one card per page, after the products.
function Explore({ content, posts }) {
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
  if (!tiles.length) return null;

  return (
    <section id="explore" className="scroll-mt-20 py-14 sm:py-20">
      <div className="container-x">
        <SectionHeading eyebrow="Get to know us" title={`More from ${content.brand.name}`} />
        <div className={cn('mt-8 grid grid-cols-2 gap-3 sm:gap-4', tiles.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}>
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <Link key={t.to} to={t.to} className="group flex h-full min-h-[11rem] flex-col overflow-hidden rounded-[var(--r-xl)] bg-white ring-1 ring-espresso/[0.07] transition-shadow duration-500 hover:shadow-[0_24px_44px_-26px_rgba(46,31,20,0.5)]">
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
                  <p className="text-xs font-bold tracking-wider text-caramel uppercase">{t.eyebrow}</p>
                  <h3 className="mt-1.5 line-clamp-2 text-[15px] leading-snug font-extrabold tracking-tight sm:text-base">{t.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-espresso/55">{t.text}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-bold text-caramel">
                    Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const HOME_LIMIT = 8;

export function HomePage() {
  const { content, products, config, posts, loading, error } = useOutletContext();
  usePageTitle(content);
  // Every design leads with the products right after the banner: people come to a shop to see what's for sale.
  return (
    <>
      <Hero products={products} config={config} content={content} />
      {content.ticker.enabled && <Marquee items={content.ticker.items} />}
      <Shop products={products} loading={loading} error={error} shop={content.shop} limit={HOME_LIMIT} />
      {products.length > HOME_LIMIT && (
        <div className="container-x -mt-10 pb-14 text-center sm:-mt-14">
          <Link to="/shop" className="btn btn-ghost px-6">
            See all {products.length} products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
      {content.reviews?.enabled && content.reviews.items?.length > 0 && <Testimonials data={content.reviews} />}
      <Assurance config={config} content={content} />
      <Explore content={content} posts={posts} />
    </>
  );
}

export function ShopPage() {
  const { content, products, loading, error } = useOutletContext();
  const [params] = useSearchParams();
  usePageTitle(content, 'Shop');

  // Old /shop?item=<id> links (footer, updates, shared on WhatsApp) go to the product's own page.
  const item = params.get('item');
  if (item) return <Navigate to={`/products/${encodeURIComponent(item)}`} replace />;

  return (
    <Page>
      <Shop products={products} loading={loading} error={error} shop={content.shop} />
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
