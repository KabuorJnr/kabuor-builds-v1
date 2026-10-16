// Shared building blocks for the brand files: the full website content is filled in from a short spec,
// and products from a compact list. Money is in shillings here and converted to cents.

export const KES = (shillings) => Math.round(shillings * 100);

/**
 * product({ id, name, size, price, title, sub, shape, ... }) → a catalogue entry.
 * look: shape = jar | tub | squeeze | pump | dropper | spray | balm | candle | box | pouch
 *       lid (cap / glass colour), label, ink, accent, spread (what's inside), title, sub, pack (word under the size)
 */
export function product(p) {
  const { id, name, size, price, cost, stock = 60, popularity = 5, description, notes = [], badge, category = 'all', active = true, estimate = false, ...look } = p;
  return {
    id,
    name,
    size,
    price: KES(price),
    cost: KES(cost ?? price * 0.55),
    stock,
    popularity,
    description,
    notes,
    badge,
    category,
    active,
    estimate,
    rating: 0,
    reviews: 0,
    look,
  };
}

const LIST = (items) => items.filter(Boolean);

/** Full website content (the admin can edit all of it later). */
export function content(s) {
  const pay = s.payHint;
  return {
    brand: { name: s.name, short: s.short, tagline: s.tagline, email: s.email ?? '', branches: s.branches },
    announcement: { enabled: Boolean(s.announcement), text: s.announcement ?? '', linkLabel: 'Shop now', linkHref: '#shop' },
    hero: {
      eyebrow: s.hero.eyebrow,
      showDate: false,
      lines: s.hero.lines,
      highlight: s.hero.highlight,
      text: s.hero.text,
      primaryCta: s.hero.cta ?? 'Shop now',
      secondaryCta: 'How to order',
      showRating: false,
      rating: '',
      ratingText: '',
      badge: s.hero.badge,
      chipTitle: s.hero.chipTitle,
      chipText: s.hero.chipText,
      featured: s.hero.featured,
    },
    ticker: { enabled: true, items: s.ticker },
    shop: { eyebrow: s.shop.eyebrow, title: s.shop.title, text: s.shop.text, allLabel: s.shop.allLabel ?? 'Everything', categories: s.shop.categories ?? [] },
    process: {
      enabled: true,
      eyebrow: 'How to order',
      title: 'Ordering is easy',
      text: 'From your cart to your door in four simple steps.',
      steps: LIST([
        { icon: 'package', title: s.process?.pick ?? 'Pick your favourites', text: s.process?.pickText ?? 'Add what you love to your cart and check out in a minute.' },
        { icon: 'wallet', title: 'Pay with M-Pesa', text: pay ?? 'Pay the order total shown at checkout, or pay on delivery.' },
        { icon: 'phone', title: 'We confirm', text: 'We call or WhatsApp you to confirm the order and arrange delivery.' },
        { icon: 'truck', title: s.process?.deliverTitle ?? 'Delivered to you', text: s.process?.deliverText ?? 'By rider in town or by parcel service countrywide. Delivery is paid by the customer.' },
      ]),
    },
    story: {
      enabled: true,
      eyebrow: 'About us',
      title: s.story.title,
      text: s.story.text,
      quote: s.story.quote ?? '',
      quoteBy: s.story.quoteBy ?? `The ${s.name} team`,
      featured: s.story.featured,
      stats: s.story.stats,
    },
    reviews: { enabled: false, eyebrow: 'Reviews', title: 'What our customers say', rating: '', ratingText: '', items: [] },
    faq: { enabled: true, eyebrow: 'FAQ', title: 'Questions, answered', text: 'Can’t find what you’re looking for? Message us on WhatsApp.', items: s.faq },
    updates: { enabled: true, eyebrow: 'Updates', title: `What’s new at ${s.name}`, text: 'News, offers and new products.' },
    newsletter: {
      enabled: true,
      eyebrow: 'Stay in the loop',
      title: 'Be first to hear about offers.',
      text: 'New products, restocks and special offers. Leave your email and we’ll keep you posted. No spam.',
      button: 'Subscribe',
      success: s.newsletterSuccess ?? 'You’re in. Thank you!',
    },
    footer: { blurb: s.footer, smallPrint: s.smallPrint ?? 'Delivery by rider or parcel service, at the customer’s cost.' },
  };
}

/** Shop settings: how people pay and where they collect. `till` for Buy Goods, or `paybill` + `account`. */
export function store(s) {
  return {
    deliveryEnabled: true,
    deliveryFee: 0,
    freeDeliveryThreshold: 0,
    deliveryNote: s.deliveryNote ?? 'Delivery by rider or parcel service, at the customer’s cost.',
    pickup: { name: s.name, address: s.pickup ?? '', hours: s.hours ?? '' },
    paybill: s.till ? { kind: 'till', business: s.till, account: '' } : s.paybill ? { kind: 'paybill', business: s.paybill, account: s.account ?? '' } : { kind: 'till', business: '', account: '' },
    sms: { adminNumbers: s.alertNumbers ?? [], adminNewOrder: true, branchCopy: false, customerConfirmed: true },
  };
}
