import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Check, Loader2, Minus, Pencil, Plus, Trash2, X } from 'lucide-react';
import ProductJar from '../components/ProductJar';
import { HeatMeter, packLabel, tintFor, titleOf } from '../components/Shop';
import { EASE, useLockBody } from '../components/ui';
import { refreshStore } from '../lib/api';
import { cn, getCurrency, money, num, perHundredGrams } from '../lib/format';
import { useAdminApi, useAdminQuery } from '../store/admin';
import { Chips, IconButton, ImagePicker, MoneyInput, TextArea, TextInput, Toggle } from './form';
import { LOOK } from '../lib/brand';
import { ErrorNote, PageHeader } from './shared';

const NEW_PRODUCT = {
  name: `${LOOK.name} `,
  size: '',
  price: '',
  cost: '',
  stock: 0,
  badge: '',
  description: '',
  notes: [],
  active: true,
  look: { shape: 'jar', lid: '#2A2A2A', label: '#FFFFFF', ink: '#222222', accent: '#888888', spread: '#C68A4E', title: '', sub: '', pack: '' },
};

const CONTAINERS = [
  { id: 'jar', label: 'Jar' },
  { id: 'tub', label: 'Tub' },
  { id: 'squeeze', label: 'Squeeze bottle' },
  { id: 'pump', label: 'Pump bottle' },
  { id: 'dropper', label: 'Dropper' },
  { id: 'spray', label: 'Spray' },
  { id: 'balm', label: 'Lip balm' },
  { id: 'candle', label: 'Candle' },
  { id: 'box', label: 'Gift box' },
  { id: 'pouch', label: 'Pouch' },
  { id: 'bar', label: 'Soap bar' },
];

const SWATCHES = {
  lid: ['#E07A12', '#B23A2E', '#2E1F14', '#3F6B3A', '#C9A35A', '#F7E3CC'],
  label: ['#F7E3CC', '#FFFFFF', '#E8A33D', '#2E1F14', '#5A3A22', '#F1D27F'],
  ink: ['#4A2A16', '#2E1F14', '#FFFFFF', '#F7E3CC'],
  accent: ['#E8920F', '#B23A2E', '#3F6B3A', '#2E1F14'],
  spread: ['#C68A4E', '#D9A256', '#A8692E', '#6B4226'],
};

function ColorField({ label, value, onChange, swatches }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {swatches.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={cn('h-7 w-7 rounded-full ring-1 ring-espresso/15 transition', value.toUpperCase() === c && 'ring-2 ring-amber ring-offset-2 ring-offset-cream')}
            style={{ background: c }}
            aria-label={`${label} ${c}`}
          />
        ))}
        <label className="relative grid h-7 w-7 cursor-pointer place-items-center overflow-hidden rounded-full bg-white text-espresso/50 ring-1 ring-espresso/15" title="Custom colour">
          <Plus className="h-3.5 w-3.5" />
          <input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} className="absolute inset-0 cursor-pointer opacity-0" aria-label={`Custom ${label.toLowerCase()} colour`} />
        </label>
      </div>
    </div>
  );
}

function ProductEditor({ initial, all, hasHeat, onClose, onSaved, onDeleted }) {
  const call = useAdminApi();
  const [p, setP] = useState(initial);
  const [state, setState] = useState({ saving: false, error: null, confirmDelete: false });
  const set = (k) => (v) => setP((x) => ({ ...x, [k]: v?.target ? v.target.value : v }));
  const setLook = (k) => (v) => setP((x) => ({ ...x, look: { ...x.look, [k]: v } }));
  const isNew = !initial.id;
  useLockBody(true);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const save = async () => {
    setState((s) => ({ ...s, saving: true, error: null }));
    try {
      const body = { ...p, price: Number(p.price) || 0, cost: Number(p.cost) || 0, stock: Number(p.stock) || 0, notes: p.notes.filter(Boolean) };
      const saved = isNew ? await call('/products', { method: 'POST', body }) : await call(`/products/${initial.id}`, { method: 'PATCH', body });
      refreshStore();
      onSaved(saved, isNew);
    } catch (err) {
      setState((s) => ({ ...s, saving: false, error: err.message }));
    }
  };

  const remove = async () => {
    setState((s) => ({ ...s, saving: true, error: null }));
    try {
      await call(`/products/${initial.id}`, { method: 'DELETE' });
      refreshStore();
      onDeleted(initial.id);
    } catch (err) {
      setState((s) => ({ ...s, saving: false, error: err.message }));
    }
  };

  const per100 = perHundredGrams(Number(p.price) || 0, p.size);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] bg-espresso/45 backdrop-blur-sm" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'Add product' : `Edit ${initial.name}`}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[94svh] flex-col overflow-hidden rounded-t-[2rem] bg-cream shadow-2xl md:inset-0 md:m-auto md:h-fit md:max-h-[92vh] md:w-[calc(100%-3rem)] md:max-w-5xl md:rounded-[2rem]"
      >
        <header className="flex items-center justify-between border-b border-espresso/[0.07] px-5 py-4 sm:px-7">
          <h2 className="text-xl font-extrabold tracking-tight">{isNew ? 'Add a product' : 'Edit product'}</h2>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-espresso/10" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[1fr_20rem]">
          <div className="space-y-5 p-5 sm:p-7">
            {state.error && <ErrorNote>{state.error}</ErrorNote>}
            <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
              <TextInput label="Product name" value={p.name} onChange={set('name')} maxLength={60} hint="Shown in the cart, orders and receipts" />
              <TextInput label="Size" value={p.size} onChange={set('size')} maxLength={20} placeholder="500g" hint="e.g. 250g, 1kg" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <MoneyInput label="Selling price" value={p.price} onChange={set('price')} hint={per100 ? `${money(per100)} per 100g` : undefined} />
              <TextInput label="In stock" inputMode="numeric" value={String(p.stock)} onChange={(e) => set('stock')(Number(e.target.value.replace(/\D/g, '')) || 0)} />
            </div>
            <TextArea label="Description" rows={3} value={p.description} onChange={set('description')} maxLength={600} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-sm font-semibold">Highlights</p>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      className="field px-3! py-2.5! text-sm"
                      maxLength={24}
                      value={p.notes[i] ?? ''}
                      placeholder={i < 2 ? 'Highlight' : 'Optional'}
                      onChange={(e) => setP((x) => {
                        const notes = [...x.notes];
                        notes[i] = e.target.value;
                        return { ...x, notes };
                      })}
                    />
                  ))}
                </div>
              </div>
              <TextInput label="Badge" optional value={p.badge} onChange={set('badge')} maxLength={16} placeholder="Best value" hint="Small label on the product card" />
            </div>

            <div className="rounded-2xl bg-white p-4 ring-1 ring-espresso/[0.06] sm:p-5">
              <p className="mb-4 font-hand text-xl text-amber">On the product card</p>
              <div className="space-y-4">
                <ImagePicker label="Photo" value={p.look.photo ?? ''} onChange={setLook('photo')} />
                <p className="-mt-2 text-xs text-espresso/50">A real photo sells best: the product on a plain background, upright, filling the frame. Without one, the drawing below is shown.</p>
                <TextInput label="Key detail" optional value={p.look.fact ?? ''} onChange={(e) => setLook('fact')(e.target.value)} maxLength={48} placeholder="Mild · great with pilau" hint="One line under the name: what makes people pick this one" />
                {LOOK.facets && (
                  <Chips label={`${LOOK.facets.label} (shop filter)`} options={[{ id: '', label: 'None' }, ...LOOK.facets.options.map(([id, label]) => ({ id, label }))]} value={p.look.facet ?? ''} onChange={setLook('facet')} />
                )}
                {hasHeat && (
                  <Chips label="Heat" options={['None', 'Very mild', 'Mild', 'Medium', 'Hot', 'Very hot'].map((label, id) => ({ id, label }))} value={p.look.heat ?? 0} onChange={setLook('heat')} />
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 ring-1 ring-espresso/[0.06] sm:p-5">
              <p className="mb-4 font-hand text-xl text-amber">Packaging drawing</p>
              <div className="space-y-4">
                <Chips label="Container" options={CONTAINERS} value={p.look.shape} onChange={setLook('shape')} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextInput label="Label title" value={p.look.title ?? ''} onChange={(e) => setLook('title')(e.target.value)} maxLength={40} placeholder="Garden Chilli" />
                  <TextInput label="Label line" optional value={p.look.sub ?? ''} onChange={(e) => setLook('sub')(e.target.value)} maxLength={40} placeholder="Sauce" />
                  <TextInput label="Pack word" optional value={p.look.pack ?? ''} onChange={(e) => setLook('pack')(e.target.value)} maxLength={16} placeholder="Jar" hint="Shown after the size" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField label="Lid / cap / glass" value={p.look.lid} onChange={setLook('lid')} swatches={SWATCHES.lid} />
                  <ColorField label="Label" value={p.look.label} onChange={setLook('label')} swatches={SWATCHES.label} />
                  <ColorField label="Label text" value={p.look.ink} onChange={setLook('ink')} swatches={SWATCHES.ink} />
                  <ColorField label="Logo & bands" value={p.look.accent} onChange={setLook('accent')} swatches={SWATCHES.accent} />
                  <ColorField label="Contents" value={p.look.spread} onChange={setLook('spread')} swatches={SWATCHES.spread} />
                </div>
              </div>
            </div>

            <Toggle checked={p.active} onChange={set('active')} label="Show in the shop" description="Turn off to hide it from customers without deleting it." />
          </div>

          <aside className="border-t border-espresso/[0.07] bg-beige/50 p-5 md:border-t-0 md:border-l">
            <p className="mb-3 font-hand text-xl text-amber">Preview</p>
            <div className="overflow-hidden rounded-[1.6rem] bg-white ring-1 ring-espresso/[0.06]">
              <div className="relative aspect-[4/5]" style={p.look.photo ? undefined : tintFor(p.look)}>
                {p.badge && <span className="absolute top-3 left-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-espresso uppercase shadow-sm">{p.badge}</span>}
                {p.look.photo ? (
                  <img src={p.look.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-x-[6%] top-[9%] bottom-[1%]">
                    <ProductJar look={p.look} price={Number(p.price) || 0} size={p.size || '—'} showTag={false} className="group h-full w-full" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="leading-tight font-bold">{p.name ? titleOf(p, all) : 'Product name'}</p>
                <p className="mt-0.5 text-xs text-espresso/50">
                  {p.size || '—'} {packLabel(p.look)}
                </p>
                {p.look.heat > 0 && <HeatMeter level={p.look.heat} className="mt-2" />}
                {p.look.fact && <p className="mt-1.5 text-xs text-espresso/70">{p.look.fact}</p>}
                <p className="mt-3 text-lg font-extrabold">{p.price ? money(p.price) : `${getCurrency()} —`}</p>
              </div>
            </div>
          </aside>
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-espresso/[0.07] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
          {!isNew &&
            (state.confirmDelete ? (
              <span className="flex items-center gap-2 text-sm">
                Delete this product?
                <button onClick={remove} disabled={state.saving} className="rounded-full bg-red-700 px-3.5 py-2 text-xs font-bold text-white">Delete</button>
                <button onClick={() => setState((s) => ({ ...s, confirmDelete: false }))} className="px-2 text-xs font-semibold text-espresso/60">Keep</button>
              </span>
            ) : (
              <button onClick={() => setState((s) => ({ ...s, confirmDelete: true }))} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            ))}
          <span className="flex-1" />
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={save} disabled={state.saving} className="btn btn-primary">
            {state.saving && <Loader2 className="h-4 w-4 animate-spin" />} {isNew ? 'Add product' : 'Save changes'}
          </button>
        </footer>
      </motion.div>
    </>
  );
}

function ProductRow({ p, all, i, count, onSaved, onEdit, onMove }) {
  const call = useAdminApi();
  const initial = { price: p.price, stock: String(p.stock), active: p.active };
  const [draft, setDraft] = useState(initial);
  const [state, setState] = useState({ saving: false, saved: false, error: null });

  const stock = Number(draft.stock);
  const valid = Number(draft.price) > 0 && Number.isInteger(stock) && stock >= 0;
  const dirty = draft.price !== p.price || stock !== p.stock || draft.active !== p.active;

  const save = async () => {
    setState({ saving: true, saved: false, error: null });
    try {
      const updated = await call(`/products/${p.id}`, { method: 'PATCH', body: { price: Number(draft.price), stock, active: draft.active } });
      refreshStore();
      onSaved(updated);
      setState({ saving: false, saved: true, error: null });
      setTimeout(() => setState((s) => ({ ...s, saved: false })), 1800);
    } catch (err) {
      setState({ saving: false, saved: false, error: err.message });
    }
  };

  return (
    <motion.li layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className={cn('card flex flex-col gap-4 p-4 sm:p-5', !draft.active && 'opacity-70')}>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl" style={p.look.photo ? undefined : tintFor(p.look)}>
          {p.look.photo ? (
            <img src={p.look.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <ProductJar look={p.look} size={p.size} showTag={false} className="absolute inset-0 m-auto h-[86%] w-[86%]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold">{titleOf(p, all)}</h3>
          <p className="truncate text-xs text-espresso/50">
            {p.size} {packLabel(p.look)} · {num(p.sold)} sold
          </p>
          <p className={cn('mt-1 text-xs font-semibold', stock < 10 ? 'text-red-700' : stock < 30 ? 'text-amber-700' : 'text-emerald-700')}>
            {stock < 10 ? 'Critically low' : stock < 30 ? 'Running low' : 'In stock'}
          </p>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row">
          <IconButton label="Move up" disabled={i === 0} onClick={() => onMove(i, -1)}>
            <ArrowUp className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label="Move down" disabled={i === count - 1} onClick={() => onMove(i, 1)}>
            <ArrowDown className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <MoneyInput label="Price" value={draft.price} onChange={(v) => setDraft((d) => ({ ...d, price: v }))} />
        <div>
          <span className="mb-1.5 block text-sm font-semibold">Stock</span>
          <div className="flex items-center rounded-2xl border border-espresso/10 bg-white">
            <button type="button" onClick={() => setDraft((d) => ({ ...d, stock: String(Math.max(0, Number(d.stock) - 1)) }))} className="grid h-11 w-8 shrink-0 place-items-center text-espresso/60 hover:text-espresso" aria-label="Decrease stock">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input className="w-full min-w-0 bg-transparent py-2.5 text-center text-[15px] tabular-nums outline-none" inputMode="numeric" value={draft.stock} onChange={(e) => setDraft((d) => ({ ...d, stock: e.target.value.replace(/\D/g, '') }))} aria-label="Stock" />
            <button type="button" onClick={() => setDraft((d) => ({ ...d, stock: String(Number(d.stock) + 1) }))} className="grid h-11 w-8 shrink-0 place-items-center text-espresso/60 hover:text-espresso" aria-label="Increase stock">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-espresso/[0.06] pt-3 text-sm">
        <span className="text-espresso/55">
          Stock worth <b className="text-espresso tabular-nums">{valid ? money(Number(draft.price) * stock) : '—'}</b>
        </span>
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-espresso/60">
            {draft.active ? 'Listed' : 'Hidden'}
            <input type="checkbox" className="peer sr-only" checked={draft.active} onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))} />
            <span className="relative h-6 w-11 rounded-full bg-espresso/15 transition peer-checked:bg-amber after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" aria-hidden />
          </label>
          <AnimatePresence mode="wait">
            {state.saved ? (
              <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <Check className="h-4 w-4" /> Saved
              </motion.span>
            ) : dirty ? (
              <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
                <button onClick={() => setDraft(initial)} className="btn btn-ghost px-4 py-2">Reset</button>
                <button onClick={save} disabled={!valid || state.saving} className="btn btn-primary px-4 py-2">
                  {state.saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
                </button>
              </motion.div>
            ) : (
              <motion.button key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onEdit} className="btn btn-ghost px-4 py-2">
                <Pencil className="h-4 w-4" /> Edit details
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
      {state.error && <p className="text-sm font-medium text-red-700">{state.error}</p>}
    </motion.li>
  );
}

export default function Products() {
  const call = useAdminApi();
  const { data, error, loading, setData } = useAdminQuery('/products');
  const [editing, setEditing] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const stockValue = data?.reduce((s, p) => s + p.stock * p.price, 0) ?? 0;
  const units = data?.reduce((s, p) => s + p.stock, 0) ?? 0;

  const move = async (i, dir) => {
    const next = [...data];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setData(() => next);
    try {
      setOrderError(null);
      await call('/products/order', { method: 'POST', body: { ids: next.map((p) => p.id) } });
    } catch (err) {
      setOrderError(err.message);
    }
  };

  return (
    <>
      <PageHeader title="Products" subtitle={data ? `${num(units)} items on the shelf · worth ${money(stockValue)} at selling prices` : 'Prices, stock and packaging'}>
        <button onClick={() => setEditing({ ...NEW_PRODUCT, look: { ...NEW_PRODUCT.look }, notes: [...NEW_PRODUCT.notes] })} className="btn btn-primary">
          <Plus className="h-4 w-4" /> Add product
        </button>
      </PageHeader>
      {(error || orderError) && <div className="mb-4"><ErrorNote>{error || orderError}</ErrorNote></div>}
      {!data && loading && <div className="h-96 animate-pulse rounded-3xl bg-beige" />}
      {data && (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {data.map((p, i) => (
            <ProductRow
              key={`${p.id}-${p.rev ?? 0}`}
              p={p}
              all={data}
              i={i}
              count={data.length}
              onMove={move}
              onEdit={() => setEditing({ ...p, badge: p.badge ?? '', look: { ...NEW_PRODUCT.look, ...p.look } })}
              onSaved={(u) => setData((list) => list.map((x) => (x.id === u.id ? { ...x, ...u } : x)))}
            />
          ))}
        </ul>
      )}
      <AnimatePresence>
        {editing && (
          <ProductEditor
            key={editing.id ?? 'new'}
            initial={editing}
            all={data}
            hasHeat={data?.some((x) => x.look?.heat > 0)}
            onClose={() => setEditing(null)}
            onSaved={(saved, isNew) => {
              setData((list) => (isNew ? [...list, saved] : list.map((x) => (x.id === saved.id ? { ...x, ...saved, rev: (x.rev ?? 0) + 1 } : x))));
              setEditing(null);
            }}
            onDeleted={(id) => {
              setData((list) => list.filter((x) => x.id !== id));
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
