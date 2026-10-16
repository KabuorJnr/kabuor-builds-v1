import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BadgeInfo, BookOpen, ExternalLink, Footprints, Gift, HelpCircle, Megaphone, MessageSquareQuote, MessageSquareText, Newspaper, PanelTop, RotateCcw, ShoppingBasket,
  Sparkles, Store, Truck,
} from 'lucide-react';
import { EASE } from '../components/ui';
import { refreshStore, useSite } from '../lib/api';
import { cn } from '../lib/format';
import { useAdminApi, useAdminQuery } from '../store/admin';
import { ListEditor, MoneyInput, Section, SaveBar, SelectInput, TextArea, TextInput, Toggle } from './form';
import BranchesEditor from './BranchesEditor';
import SmsSettings from './SmsSettings';
import { ErrorNote, PageHeader } from './shared';

const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
function setPath(obj, path, value) {
  const next = structuredClone(obj);
  const keys = path.split('.');
  let cur = next;
  keys.slice(0, -1).forEach((k) => (cur = cur[k]));
  cur[keys.at(-1)] = value;
  return next;
}

const STEP_ICONS = [
  ['package', 'Package'], ['wallet', 'Wallet'], ['phone', 'Phone'], ['truck', 'Truck'], ['map', 'Map pin'], ['check', 'Tick'],
  ['heart', 'Heart'], ['leaf', 'Leaf'], ['sprout', 'Sprout'], ['sun', 'Sun'], ['flame', 'Flame'], ['award', 'Award'],
].map(([value, label]) => ({ value, label }));

// doc: which document the section edits; toggle: path of its on/off switch; anchor: where it is on the site.
const SECTIONS = [
  { id: 'brand', label: 'Brand & branches', icon: Store, doc: 'content', key: 'brand', anchor: '/' },
  { id: 'announcement', label: 'Announcement bar', icon: PanelTop, doc: 'content', key: 'announcement', toggle: 'announcement.enabled', anchor: '/' },
  { id: 'hero', label: 'Hero (top of page)', icon: Sparkles, doc: 'content', key: 'hero', anchor: '/' },
  { id: 'ticker', label: 'Scrolling ticker', icon: Footprints, doc: 'content', key: 'ticker', toggle: 'ticker.enabled', anchor: '/shop' },
  { id: 'shop', label: 'Shop section', icon: ShoppingBasket, doc: 'content', key: 'shop', anchor: '/shop' },
  { id: 'process', label: 'How to order', icon: BookOpen, doc: 'content', key: 'process', toggle: 'process.enabled', anchor: '/how-to-order' },
  { id: 'story', label: 'About us', icon: BadgeInfo, doc: 'content', key: 'story', toggle: 'story.enabled', anchor: '/about' },
  { id: 'updates', label: 'Updates section', icon: Newspaper, doc: 'content', key: 'updates', toggle: 'updates.enabled', anchor: '/updates' },
  { id: 'reviews', label: 'Reviews', icon: MessageSquareQuote, doc: 'content', key: 'reviews', toggle: 'reviews.enabled', anchor: '/about' },
  { id: 'faq', label: 'FAQ', icon: HelpCircle, doc: 'content', key: 'faq', toggle: 'faq.enabled', anchor: '/faq' },
  { id: 'newsletter', label: 'Newsletter', icon: Megaphone, doc: 'content', key: 'newsletter', toggle: 'newsletter.enabled', anchor: '/faq' },
  { id: 'footer', label: 'Footer', icon: Gift, doc: 'content', key: 'footer', anchor: '/' },
  { id: 'delivery', label: 'Delivery & payment', icon: Truck, doc: 'store' },
  { id: 'sms', label: 'SMS texts', icon: MessageSquareText, doc: 'store', key: 'sms' },
];

export default function Website() {
  const call = useAdminApi();
  const { data, error, loading, setData } = useAdminQuery('/content');
  const products = useAdminQuery('/products');
  const [draft, setDraft] = useState(null);
  const [active, setActive] = useState('brand');
  const [state, setState] = useState({ saving: false, error: null, message: null });

  useEffect(() => {
    if (data && !draft) setDraft({ content: data.content, store: data.store });
  }, [data, draft]);

  // Keep the selected section's chip visible in the horizontal list on phones.
  useEffect(() => {
    document.querySelector(`[data-section="${active}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [active]);

  const dirty = useMemo(
    () => Boolean(data && draft) && (JSON.stringify(draft.content) !== JSON.stringify(data.content) || JSON.stringify(draft.store) !== JSON.stringify(data.store)),
    [data, draft],
  );

  if (!draft) {
    return (
      <>
        <PageHeader title="Site content" subtitle="Edit the words on your website and choose which sections to show." />
        {error ? <ErrorNote>{error}</ErrorNote> : loading && <div className="h-96 animate-pulse rounded-3xl bg-beige" />}
      </>
    );
  }

  const c = (path) => ({
    value: get(draft.content, path),
    onChange: (v) => setDraft((d) => ({ ...d, content: setPath(d.content, path, v?.target ? v.target.value : v) })),
  });
  const s = (path) => ({
    value: get(draft.store, path),
    onChange: (v) => setDraft((d) => ({ ...d, store: setPath(d.store, path, v?.target ? v.target.value : v) })),
  });
  const text = (path, props = {}) => <TextInput {...c(path)} {...props} />;
  const area = (path, props = {}) => <TextArea {...c(path)} {...props} />;
  const productOptions = (products.data ?? []).map((p) => ({ value: p.id, label: `${p.size} · ${p.name}` }));

  const section = SECTIONS.find((x) => x.id === active);
  const shown = (sec) => (sec.toggle ? get(draft.content, sec.toggle) : true);

  const resetSection = () => {
    if (section.doc === 'store' && section.key) setDraft((d) => ({ ...d, store: { ...d.store, [section.key]: structuredClone(data.defaults.store[section.key]) } }));
    else if (section.doc === 'store') setDraft((d) => ({ ...d, store: { ...structuredClone(data.defaults.store), sms: d.store.sms } }));
    else setDraft((d) => ({ ...d, content: { ...d.content, [section.key]: structuredClone(data.defaults.content[section.key]) } }));
  };

  const save = async () => {
    setState({ saving: true, error: null, message: null });
    try {
      let next = { content: data.content, store: data.store };
      if (JSON.stringify(draft.content) !== JSON.stringify(data.content)) {
        const { content } = await call('/content', { method: 'PUT', body: { content: draft.content } });
        next = { ...next, content };
        useSite.setState({ content });
      }
      if (JSON.stringify(draft.store) !== JSON.stringify(data.store)) {
        const { store } = await call('/store', { method: 'PUT', body: { store: draft.store } });
        next = { ...next, store };
      }
      refreshStore();
      setData((d) => ({ ...d, ...next }));
      setDraft(structuredClone(next));
      setState({ saving: false, error: null, message: 'Saved. Your website is updated.' });
      setTimeout(() => setState((st) => ({ ...st, message: null })), 2500);
    } catch (err) {
      setState({ saving: false, error: err.message, message: null });
    }
  };

  const editors = {
    brand: (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          {text('brand.name', { label: 'Business name', maxLength: 40, hint: 'Shown in the logo, page title and labels' })}
          {text('brand.tagline', { label: 'Tagline', maxLength: 60 })}
        </div>
        {text('brand.email', { label: 'Email', optional: true, type: 'email', maxLength: 80 })}
        <div>
          <p className="text-sm font-semibold">Branches & countries</p>
          <p className="mb-3 text-xs text-espresso/55">Shown in the menu, the FAQ, the footer and at checkout, grouped by country.</p>
          <BranchesEditor branches={draft.content.brand.branches} onChange={c('brand.branches').onChange} />
        </div>
      </>
    ),
    announcement: (
      <>
        {area('announcement.text', { label: 'Message', rows: 2, maxLength: 140 })}
        <div className="grid gap-4 sm:grid-cols-2">
          {text('announcement.linkLabel', { label: 'Link text', optional: true, maxLength: 24 })}
          {text('announcement.linkHref', { label: 'Link', optional: true, maxLength: 120, hint: '/shop, /updates, /how-to-order, tel:… or https://…' })}
        </div>
      </>
    ),
    hero: (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          {text('hero.eyebrow', { label: 'Small heading', maxLength: 40 })}
          <div className="pt-7">
            <Toggle {...c('hero.showDate')} checked={draft.content.hero.showDate} label="Add this month’s date" />
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-semibold">Headline (up to 3 lines)</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                className="field"
                maxLength={24}
                value={draft.content.hero.lines[i] ?? ''}
                placeholder={`Line ${i + 1}`}
                onChange={(e) => {
                  const lines = [...draft.content.hero.lines];
                  lines[i] = e.target.value;
                  c('hero.lines').onChange(lines);
                }}
              />
            ))}
          </div>
        </div>
        {text('hero.highlight', { label: 'Highlighted words', maxLength: 24, hint: 'Must appear in the headline; shown in orange with an underline' })}
        {area('hero.text', { label: 'Intro text', rows: 3, maxLength: 260 })}
        <div className="grid gap-4 sm:grid-cols-2">
          {text('hero.primaryCta', { label: 'Main button', maxLength: 30 })}
          {text('hero.secondaryCta', { label: 'Second button', optional: true, maxLength: 30 })}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {text('hero.badge', { label: 'Sticker text', maxLength: 36, hint: 'Separate lines with ·' })}
          {text('hero.chipTitle', { label: 'Label title', maxLength: 30 })}
          {text('hero.chipText', { label: 'Label text', maxLength: 40 })}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectInput label="Front product" options={productOptions} {...c('hero.featured.front')} />
          <SelectInput label="Back left" options={productOptions} {...c('hero.featured.left')} />
          <SelectInput label="Back right" options={productOptions} {...c('hero.featured.right')} />
        </div>
        <Toggle {...c('hero.showRating')} checked={draft.content.hero.showRating} label="Show a star rating" description="Only use real ratings from your customers." />
        {draft.content.hero.showRating && (
          <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
            {text('hero.rating', { label: 'Rating', maxLength: 6, placeholder: '4.9' })}
            {text('hero.ratingText', { label: 'Rating text', maxLength: 60, placeholder: 'from 120 customers' })}
          </div>
        )}
      </>
    ),
    ticker: (
      <ListEditor
        items={draft.content.ticker.items.map((t) => ({ t }))}
        onChange={(items) => c('ticker.items').onChange(items.map((i) => i.t))}
        blank={{ t: '' }}
        addLabel="Add phrase"
        max={12}
        render={(item, update) => <TextInput value={item.t} onChange={(e) => update({ t: e.target.value })} maxLength={40} />}
      />
    ),
    shop: (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          {text('shop.eyebrow', { label: 'Small heading', maxLength: 30 })}
          {text('shop.title', { label: 'Title', maxLength: 60 })}
        </div>
        {area('shop.text', { label: 'Intro text', rows: 2, maxLength: 200 })}
        <p className="text-xs text-espresso/50">Products themselves (prices, stock, packaging) are edited under Products.</p>
      </>
    ),
    process: (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          {text('process.eyebrow', { label: 'Small heading', maxLength: 30 })}
          {text('process.title', { label: 'Title', maxLength: 70 })}
        </div>
        {area('process.text', { label: 'Intro text', rows: 2, maxLength: 220 })}
        <ListEditor
          items={draft.content.process.steps}
          onChange={c('process.steps').onChange}
          blank={{ icon: 'check', title: '', text: '' }}
          addLabel="Add step"
          max={6}
          render={(st, update) => (
            <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
              <SelectInput label="Icon" options={STEP_ICONS} value={st.icon} onChange={(e) => update({ icon: e.target.value })} />
              <TextInput label="Step title" value={st.title} onChange={(e) => update({ title: e.target.value })} maxLength={40} />
              <TextArea className="sm:col-span-2" label="Description" rows={2} value={st.text} onChange={(e) => update({ text: e.target.value })} maxLength={200} />
            </div>
          )}
        />
      </>
    ),
    story: (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          {text('story.eyebrow', { label: 'Small heading', maxLength: 30 })}
          {text('story.title', { label: 'Title', maxLength: 70 })}
        </div>
        {area('story.text', { label: 'Story', rows: 4, maxLength: 600 })}
        <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
          {area('story.quote', { label: 'Quote', optional: true, rows: 2, maxLength: 200 })}
          {text('story.quoteBy', { label: 'Quote by', optional: true, maxLength: 50 })}
        </div>
        <SelectInput label="Product shown" options={productOptions} {...c('story.featured')} />
        <div>
          <p className="mb-2 text-sm font-semibold">Numbers</p>
          <ListEditor
            items={draft.content.story.stats}
            onChange={c('story.stats').onChange}
            blank={{ value: 0, suffix: '', label: '' }}
            addLabel="Add number"
            max={4}
            render={(st, update) => (
              <div className="grid grid-cols-[6rem_4rem_1fr] gap-3">
                <TextInput label="Number" inputMode="numeric" value={String(st.value)} onChange={(e) => update({ value: Number(e.target.value.replace(/\D/g, '')) || 0 })} />
                <TextInput label="After" value={st.suffix} onChange={(e) => update({ suffix: e.target.value })} maxLength={4} placeholder="+" />
                <TextInput label="Label" value={st.label} onChange={(e) => update({ label: e.target.value })} maxLength={40} />
              </div>
            )}
          />
        </div>
      </>
    ),
    updates: (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          {text('updates.eyebrow', { label: 'Small heading', maxLength: 30 })}
          {text('updates.title', { label: 'Title', maxLength: 70 })}
        </div>
        {area('updates.text', { label: 'Intro text', rows: 2, maxLength: 200 })}
        <p className="text-xs text-espresso/50">The posts themselves are written under Updates.</p>
      </>
    ),
    reviews: (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          {text('reviews.eyebrow', { label: 'Small heading', maxLength: 30 })}
          {text('reviews.title', { label: 'Title', maxLength: 70 })}
          {text('reviews.rating', { label: 'Overall rating', optional: true, maxLength: 20, placeholder: '4.9 out of 5' })}
          {text('reviews.ratingText', { label: 'Rating text', optional: true, maxLength: 60 })}
        </div>
        <ListEditor
          items={draft.content.reviews.items}
          onChange={c('reviews.items').onChange}
          blank={{ name: '', city: '', product: '', text: '' }}
          addLabel="Add review"
          max={16}
          empty="Add real reviews from your customers. The section stays hidden until there is at least one."
          render={(r, update) => (
            <div className="grid gap-3 sm:grid-cols-3">
              <TextInput label="Name" value={r.name} onChange={(e) => update({ name: e.target.value })} maxLength={40} />
              <TextInput label="Town" value={r.city} onChange={(e) => update({ city: e.target.value })} maxLength={40} />
              <TextInput label="Product" optional value={r.product} onChange={(e) => update({ product: e.target.value })} maxLength={40} />
              <TextArea className="sm:col-span-3" label="What they said" rows={2} value={r.text} onChange={(e) => update({ text: e.target.value })} maxLength={240} />
            </div>
          )}
        />
      </>
    ),
    faq: (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          {text('faq.eyebrow', { label: 'Small heading', maxLength: 30 })}
          {text('faq.title', { label: 'Title', maxLength: 70 })}
        </div>
        {area('faq.text', { label: 'Intro text', rows: 2, maxLength: 200 })}
        <ListEditor
          items={draft.content.faq.items}
          onChange={c('faq.items').onChange}
          blank={{ q: '', a: '' }}
          addLabel="Add question"
          max={12}
          render={(f, update) => (
            <div className="space-y-3">
              <TextInput label="Question" value={f.q} onChange={(e) => update({ q: e.target.value })} maxLength={120} />
              <TextArea label="Answer" rows={3} value={f.a} onChange={(e) => update({ a: e.target.value })} maxLength={600} />
            </div>
          )}
        />
      </>
    ),
    newsletter: (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          {text('newsletter.eyebrow', { label: 'Small heading', maxLength: 30 })}
          {text('newsletter.title', { label: 'Title', maxLength: 70 })}
        </div>
        {area('newsletter.text', { label: 'Text', rows: 2, maxLength: 240 })}
        <div className="grid gap-4 sm:grid-cols-2">
          {text('newsletter.button', { label: 'Button', maxLength: 24 })}
          {text('newsletter.success', { label: 'Thank-you message', maxLength: 80 })}
        </div>
      </>
    ),
    footer: (
      <>
        {area('footer.blurb', { label: 'About line', rows: 2, maxLength: 220 })}
        {text('footer.smallPrint', { label: 'Small print', maxLength: 140 })}
      </>
    ),
    sms: <SmsSettings sms={draft.store.sms} onChange={(v) => s('sms').onChange(v)} />,
    delivery: (
      <>
        <Toggle {...s('deliveryEnabled')} checked={draft.store.deliveryEnabled} label="We deliver" description="Turn off to show “Delivery coming soon” and take pickup orders only." />
        {draft.store.deliveryEnabled ? (
          <>
            <TextArea label="Delivery note" rows={2} maxLength={120} {...s('deliveryNote')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <MoneyInput label="Delivery fee charged online" hint="Leave at 0 if the customer pays the rider" {...s('deliveryFee')} onChange={(v) => s('deliveryFee').onChange(v === '' ? 0 : v)} />
              <MoneyInput label="Free delivery over" hint="0 = no free-delivery offer" {...s('freeDeliveryThreshold')} onChange={(v) => s('freeDeliveryThreshold').onChange(v === '' ? 0 : v)} />
            </div>
          </>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput label="Pickup place" maxLength={60} {...s('pickup.name')} />
            <TextInput label="Address" maxLength={100} {...s('pickup.address')} />
            <TextInput label="Opening hours" maxLength={60} {...s('pickup.hours')} />
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectInput label="M-Pesa type" options={[{ value: 'till', label: 'Buy Goods (Till)' }, { value: 'paybill', label: 'Paybill' }]} {...s('paybill.kind')} />
          <TextInput label={get(draft.store, 'paybill.kind') === 'till' ? 'Till number' : 'Paybill business no.'} inputMode="numeric" maxLength={12} {...s('paybill.business')} />
          {get(draft.store, 'paybill.kind') !== 'till' && <TextInput label="Account no." maxLength={20} {...s('paybill.account')} />}
        </div>
      </>
    ),
  };

  return (
    <>
      <PageHeader title="Site content" subtitle="Edit the words on your website and choose which sections to show. Changes go live when you save.">
        <a href={section.anchor ?? '/'} target="_blank" rel="noreferrer" className="btn btn-ghost py-2.5">
          <ExternalLink className="h-4 w-4" /> View website
        </a>
      </PageHeader>
      {state.error && <div className="mb-4"><ErrorNote>{state.error}</ErrorNote></div>}

      <div className="grid gap-5 lg:grid-cols-[15rem_1fr] lg:items-start">
        <nav className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:sticky lg:top-8 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0" aria-label="Website sections">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              data-section={sec.id}
              onClick={() => setActive(sec.id)}
              className={cn(
                'relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors',
                active === sec.id ? 'text-cream' : 'text-espresso/65 hover:bg-beige hover:text-espresso',
              )}
            >
              {active === sec.id && <motion.span layoutId="site-sec" className="absolute inset-0 rounded-xl bg-espresso" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <sec.icon className={cn('relative h-4 w-4 shrink-0', active === sec.id ? 'text-honey' : 'text-amber')} />
              <span className="relative whitespace-nowrap">{sec.label}</span>
              {!shown(sec) && <span className="relative ml-auto rounded-full bg-espresso/10 px-1.5 py-0.5 text-[10px] font-bold text-espresso/50">Hidden</span>}
            </button>
          ))}
        </nav>

        <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="min-w-0">
          <Section
            title={section.label}
            actions={
              <button onClick={resetSection} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-espresso/55 ring-1 ring-espresso/10 hover:text-espresso">
                <RotateCcw className="h-3.5 w-3.5" /> Reset to default
              </button>
            }
          >
            {section.toggle && (
              <div className="rounded-2xl bg-beige/60 p-4">
                <Toggle {...c(section.toggle)} checked={get(draft.content, section.toggle)} label="Show this section on the website" />
              </div>
            )}
            {editors[active]}
          </Section>
        </motion.div>
      </div>

      <SaveBar dirty={dirty} saving={state.saving} onSave={save} onDiscard={() => setDraft({ content: data.content, store: data.store })} message={state.message} />
    </>
  );
}
