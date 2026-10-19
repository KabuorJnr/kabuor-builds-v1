// The signup wizard: 1 business & link → 2 pay by M-Pesa → 3 make it yours (colours from your pictures,
// style, words) → 4 products and how customers pay → live. Progress is kept on the server; the browser
// keeps only the setup token, so a refresh or a closed tab picks up where the owner left off.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, Cookie, CupSoda, Droplets, ExternalLink, Flame, Hexagon, Leaf, Loader2, Monitor, Moon, Package, Palette, Plus, Smartphone, Sparkles, Sun, Trash2,
} from 'lucide-react';
import { cn } from '../lib/format';
import { EASE, ksh, MpesaPay, PalettePicker, papi, PictureDrop, ShopPreview, StylePicker } from './shared';
import { Wordmark } from './PlatformApp';

const KIND_ICONS = { sauce: Flame, honey: Hexagon, skincare: Droplets, candle: Sparkles, soap: Leaf, food: Cookie, drinks: CupSoda, other: Package };
const STEP_LABELS = ['Your business', 'Make it yours', 'Products', 'Preview & pay'];
const TOKEN_KEY = 'shop-signup-token';

const store = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t) => {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

const toLink = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 30);

function Progress({ step }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Signup progress">
      {STEP_LABELS.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={cn(
              'grid h-7 w-7 place-items-center rounded-full text-xs font-bold tabular-nums',
              i < step ? 'bg-[#1E8E3E] text-[#fff]' : i === step ? 'bg-espresso text-cream' : 'bg-sand text-espresso/50',
            )}
            aria-current={i === step ? 'step' : undefined}
          >
            {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
          </span>
          <span className={cn('hidden text-sm font-semibold md:inline', i === step ? 'text-espresso' : 'text-espresso/45')}>{label}</span>
          {i < STEP_LABELS.length - 1 && <span className="h-px w-4 bg-espresso/15 sm:w-8" />}
        </li>
      ))}
    </ol>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-700">{error}</span> : hint && <span className="mt-1 block text-xs text-espresso/50">{hint}</span>}
    </label>
  );
}

// ---------- 1. business ----------
function BusinessStep({ info, onDone }) {
  const [params] = useSearchParams();
  const [f, setF] = useState({ name: '', kind: '', link: params.get('link') ?? '', city: '', ownerName: '', phone: '', email: '', password: '' });
  const [linkEdited, setLinkEdited] = useState(Boolean(params.get('link')));
  const [check, setCheck] = useState(null);
  const [state, setState] = useState({ busy: false, error: null });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target ? e.target.value : e }));
  const domain = info?.domain ?? 'shop.ke';

  // The link follows the business name until the owner types their own.
  useEffect(() => {
    if (!linkEdited) setF((x) => ({ ...x, link: toLink(x.name) }));
  }, [f.name, linkEdited]);
  useEffect(() => {
    if (f.link.length < 3) return setCheck(null);
    const t = setTimeout(() => papi(`/check-link?link=${encodeURIComponent(f.link)}`).then(setCheck).catch(() => {}), 300);
    return () => clearTimeout(t);
  }, [f.link]);

  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: null });
    try {
      const { token } = await papi('/signup', { method: 'POST', body: f });
      onDone(token);
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-semibold">What do you sell?</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="What you sell">
          {(info?.kinds ?? []).map((k) => {
            const Icon = KIND_ICONS[k.id] ?? Package;
            return (
              <button
                type="button"
                key={k.id}
                role="radio"
                aria-checked={f.kind === k.id}
                onClick={() => setF((x) => ({ ...x, kind: k.id }))}
                className={cn('flex flex-col items-start gap-2 rounded-[var(--r-lg)] bg-white p-3 text-left text-sm font-semibold ring-1 transition', f.kind === k.id ? 'ring-2 ring-espresso' : 'ring-espresso/10 hover:ring-espresso/30')}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: `${k.accent}22`, color: k.accent }}>
                  <Icon className="h-4 w-4" />
                </span>
                {k.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business name">
          <input className="field" value={f.name} onChange={set('name')} placeholder="Anjugu Peanut Butter" maxLength={60} required />
        </Field>
        <Field label="Town" hint="Where you deliver from">
          <input className="field" value={f.city} onChange={set('city')} placeholder="Nairobi" maxLength={40} />
        </Field>
      </div>

      <Field label="Your shop link" error={check && !check.available ? check.problem : null}>
        <span className="field flex items-center gap-0 px-0! py-0! focus-within:ring-2">
          <input
            className="min-w-0 flex-1 bg-transparent px-4 py-3 font-semibold outline-none"
            value={f.link}
            onChange={(e) => {
              setLinkEdited(true);
              setF((x) => ({ ...x, link: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30) }));
            }}
            placeholder="anjugu"
            aria-describedby="link-status"
            required
          />
          <span className="pr-4 text-espresso/45">.{domain}</span>
        </span>
        <span id="link-status" className="mt-1 flex flex-wrap items-center gap-1.5 text-xs" aria-live="polite">
          {check?.available && <span className="font-semibold text-[#1E8E3E]">✓ Available</span>}
          {check && !check.available &&
            check.suggestions.map((s) => (
              <button type="button" key={s} onClick={() => (setLinkEdited(true), setF((x) => ({ ...x, link: s })))} className="rounded-full bg-white px-2.5 py-1 font-semibold ring-1 ring-espresso/15 hover:ring-espresso/40">
                {s}
              </button>
            ))}
        </span>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <input className="field" value={f.ownerName} onChange={set('ownerName')} autoComplete="name" maxLength={60} required />
        </Field>
        <Field label="M-Pesa phone number" hint="For paying your plan and getting order alerts">
          <input className="field" value={f.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="0712 345 678" required />
        </Field>
        <Field label="Email" hint="You sign in to your shop with this">
          <input className="field" type="email" value={f.email} onChange={set('email')} autoComplete="email" required />
        </Field>
        <Field label="Password" hint="At least 8 characters">
          <input className="field" type="password" value={f.password} onChange={set('password')} autoComplete="new-password" minLength={8} required />
        </Field>
      </div>

      {state.error && <p className="rounded-[var(--r-md)] bg-red-50 px-3 py-2 text-sm font-medium text-red-800">{state.error}</p>}
      <button className="btn btn-primary w-full py-4 sm:w-auto sm:px-8" disabled={state.busy || !f.kind || (check && !check.available)}>
        {state.busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Next: design your shop <ArrowRight className="h-4 w-4" />
      </button>
      <p className="text-xs text-espresso/50">
        {f.kind ? <>Nothing to pay yet: you see your finished shop first{info && <>, then pay {ksh(info.prices.monthly)} a month to go live</>}.</> : 'Choose what you sell to continue: it sets up your shop’s style.'}
      </p>
    </form>
  );
}

// ---------- 3. look ----------
function LookStep({ token, signup, info, onSaved, onNext }) {
  const brand = signup.brand ?? {};
  const [look, setLook] = useState({
    style: brand.style,
    mode: brand.mode,
    accent: brand.accent,
    tagline: brand.tagline ?? '',
    about: brand.about ?? '',
    logo: brand.logo ?? '',
    photos: brand.photos ?? [],
  });
  const [accents, setAccents] = useState(brand.accents ?? []);
  const [palettes, setPalettes] = useState([]);
  const [preview, setPreview] = useState(null);
  const srcOf = (u) => (u?.startsWith('/uploads/') ? `/api/platform/uploads/${signup.link}/${u.slice(9)}` : u);
  const kind = info?.kinds.find((k) => k.id === signup.kind);
  const mode = look.mode ?? info?.styles.find((s) => s.id === (look.style ?? kind?.style))?.mode ?? 'light';

  const save = useRef();
  const persist = useCallback(
    (next) => {
      clearTimeout(save.current);
      save.current = setTimeout(async () => {
        const res = await papi('/brand', { method: 'PUT', body: next, token }).catch(() => null);
        if (res) {
          setPreview(res.preview);
          onSaved(res);
        }
      }, 350);
    },
    [token, onSaved],
  );
  const update = (patch) =>
    setLook((x) => {
      const next = { ...x, ...patch };
      persist(next);
      return next;
    });
  useEffect(() => persist(look), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Colour choices: from the accents found in the uploaded pictures, for the current light/dark mode.
  useEffect(() => {
    papi('/palettes', { method: 'POST', body: { accents, mode }, token }).then(setPalettes).catch(() => {});
  }, [accents, mode, token]);
  // The first time pictures give colours, use the strongest one.
  const addAccents = (found) => {
    if (!found?.length) return;
    const merged = [...new Set([...found, ...accents])].slice(0, 5);
    setAccents(merged);
    // The first colours from their pictures replace the suggested one; later ones are added as choices.
    update({ accents: merged, ...(accents.length ? {} : { accent: found[0] }) });
  };

  const upload = (role) => (file) => papi(`/upload?role=${role}`, { file, token });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_25rem]">
      <div className="space-y-7">
        <section>
          <h3 className="text-lg font-bold">Your pictures</h3>
          <p className="text-sm text-espresso/55">Your shop’s colours come from these. Real product photos sell best.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <PictureDrop label="Logo" hint="PNG with a clear background is best" value={look.logo} srcOf={srcOf} upload={upload('logo')} aspect="aspect-square" onUpload={(r) => (update({ logo: r.url }), addAccents(r.accents))} onClear={() => update({ logo: '' })} />
            {[0, 1].map((i) => (
              <PictureDrop
                key={i}
                label={i === 0 ? 'Banner photo' : 'Second photo'}
                hint={i === 0 ? 'Your product, up close' : 'Optional'}
                value={look.photos[i]}
                srcOf={srcOf}
                upload={upload('photo')}
                aspect="aspect-square"
                onUpload={(r) => {
                  const photos = [...look.photos];
                  photos[i] = r.url;
                  update({ photos: photos.filter(Boolean) });
                  addAccents(r.accents);
                }}
                onClear={() => update({ photos: look.photos.filter((_, j) => j !== i) })}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Colours</h3>
              <p className="text-sm text-espresso/55">{accents.length ? 'Picked from your pictures.' : 'Add a logo or photo to get colours from it.'}</p>
            </div>
            <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-espresso/10" role="radiogroup" aria-label="Light or dark">
              {[['light', Sun, 'Light'], ['dark', Moon, 'Dark']].map(([id, Icon, label]) => (
                <button type="button" key={id} role="radio" aria-checked={mode === id} onClick={() => update({ mode: id })} className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold', mode === id ? 'bg-espresso text-cream' : 'text-espresso/60')}>
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <PalettePicker options={palettes} value={look.accent ?? palettes[0]?.accent} onChange={(accent) => update({ accent })} />
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold">Style</h3>
          <p className="text-sm text-espresso/55">{info?.styles?.length ?? 10} looks: fonts, layout and feel. You can change it any time, even after you go live.</p>
          <div className="mt-3">
            <StylePicker styles={info?.styles ?? []} value={look.style ?? kind?.style} suggested={kind?.style} accent={preview?.colors?.honey ?? kind?.accent} onChange={(style) => update({ style, mode: undefined })} />
          </div>
        </section>

        <section className="grid gap-4">
          <Field label="Tagline" hint="A short promise: it becomes your shop’s headline">
            <input className="field" value={look.tagline} onChange={(e) => update({ tagline: e.target.value })} placeholder={kind?.tagline} maxLength={60} />
          </Field>
          <Field label="About your business" hint="Two or three sentences for your About section">
            <textarea className="field min-h-24" value={look.about} onChange={(e) => update({ about: e.target.value })} maxLength={400} />
          </Field>
        </section>

        <button type="button" onClick={onNext} className="btn btn-primary w-full py-4 sm:w-auto sm:px-8">
          Next: your products <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-sm font-semibold text-espresso/55">Preview</p>
        <ShopPreview look={preview && { ...preview, tagline: look.tagline || kind?.tagline, eyebrow: kind?.label }} name={signup.name} photo={look.photos[0]} product={brand.products?.[0] ?? { name: 'Your product', size: '250g', price: 500 }} srcOf={srcOf} />
      </aside>
    </div>
  );
}

// ---------- 4. products & payment ----------
const blank = () => ({ name: '', size: '', price: '', photo: '' });

function ProductsStep({ token, signup, onNext, onBack }) {
  const brand = signup.brand ?? {};
  const [rows, setRows] = useState(brand.products?.length ? brand.products : [blank(), blank()]);
  const [pay, setPay] = useState({ kind: brand.paybill ? 'paybill' : 'till', till: brand.till ?? '', paybill: brand.paybill ?? '', account: brand.account ?? '' });
  const [state, setState] = useState({ busy: false, error: null });
  const srcOf = (u) => (u?.startsWith('/uploads/') ? `/api/platform/uploads/${signup.link}/${u.slice(9)}` : u);
  const setRow = (i, patch) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const ready = rows.filter((r) => r.name.trim() && Number(r.price) > 0);

  const save = async () => {
    setState({ busy: true, error: null });
    try {
      const res = await papi('/brand', {
        method: 'PUT',
        token,
        body: { products: ready, till: pay.kind === 'till' ? pay.till : '', paybill: pay.kind === 'paybill' ? pay.paybill : '', account: pay.kind === 'paybill' ? pay.account : '' },
      });
      onNext(res);
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-bold">Your first products</h3>
        <p className="text-sm text-espresso/55">Add a few now; you can add more, with stock and descriptions, in your admin.</p>
        <ul className="mt-4 space-y-3">
          {rows.map((r, i) => (
            <li key={i} className="grid grid-cols-[4.5rem_1fr] gap-3 rounded-[var(--r-lg)] bg-white p-3 ring-1 ring-espresso/10 sm:grid-cols-[4.5rem_1fr_7rem_8rem_auto] sm:items-end">
              <PictureDrop compact aspect="aspect-[4/5]" value={r.photo} srcOf={srcOf} upload={(file) => papi('/upload?role=product', { file, token })} onUpload={(res) => setRow(i, { photo: res.url })} onClear={() => setRow(i, { photo: '' })} />
              <div className="grid gap-2 sm:contents">
                <Field label="Name">
                  <input className="field" value={r.name} onChange={(e) => setRow(i, { name: e.target.value })} placeholder="Crunchy peanut butter" maxLength={60} />
                </Field>
                <Field label="Size">
                  <input className="field" value={r.size} onChange={(e) => setRow(i, { size: e.target.value })} placeholder="400g" maxLength={20} />
                </Field>
                <Field label="Price (KSh)">
                  <input className="field tabular-nums" inputMode="numeric" value={r.price} onChange={(e) => setRow(i, { price: e.target.value.replace(/\D/g, '') })} placeholder="650" />
                </Field>
              </div>
              <button type="button" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} className="col-start-2 justify-self-end rounded-full p-2 text-espresso/45 hover:bg-red-50 hover:text-red-700 sm:col-start-auto" aria-label="Remove product">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        {rows.length < 12 && (
          <button type="button" onClick={() => setRows((r) => [...r, blank()])} className="btn btn-ghost mt-3 px-4 py-2.5 text-sm">
            <Plus className="h-4 w-4" /> Add product
          </button>
        )}
      </section>

      <section>
        <h3 className="text-lg font-bold">How customers pay you</h3>
        <p className="text-sm text-espresso/55">Customers pay straight to your M-Pesa: the money never goes through us.</p>
        <div className="mt-3 inline-flex rounded-full bg-white p-1 ring-1 ring-espresso/10" role="radiogroup" aria-label="M-Pesa type">
          {[['till', 'Buy Goods (Till)'], ['paybill', 'Paybill']].map(([id, label]) => (
            <button type="button" key={id} role="radio" aria-checked={pay.kind === id} onClick={() => setPay((p) => ({ ...p, kind: id }))} className={cn('rounded-full px-4 py-1.5 text-sm font-semibold', pay.kind === id ? 'bg-espresso text-cream' : 'text-espresso/60')}>
              {label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid max-w-md gap-3 sm:grid-cols-2">
          {pay.kind === 'till' ? (
            <Field label="Till number">
              <input className="field tabular-nums" inputMode="numeric" value={pay.till} onChange={(e) => setPay((p) => ({ ...p, till: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="1806547" />
            </Field>
          ) : (
            <>
              <Field label="Paybill number">
                <input className="field tabular-nums" inputMode="numeric" value={pay.paybill} onChange={(e) => setPay((p) => ({ ...p, paybill: e.target.value.replace(/\D/g, '').slice(0, 10) }))} />
              </Field>
              <Field label="Account number">
                <input className="field" value={pay.account} onChange={(e) => setPay((p) => ({ ...p, account: e.target.value.slice(0, 20) }))} />
              </Field>
            </>
          )}
        </div>
      </section>

      {state.error && <p className="rounded-[var(--r-md)] bg-red-50 px-3 py-2 text-sm font-medium text-red-800">{state.error}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <button type="button" onClick={onBack} className="btn btn-ghost px-5 py-3.5">
          <ArrowLeft className="h-4 w-4" /> Back to the look
        </button>
        <button type="button" onClick={save} disabled={state.busy || !ready.length || !(pay.kind === 'till' ? pay.till : pay.paybill)} className="btn btn-primary py-4 sm:px-8">
          {state.busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Preview my shop with {ready.length} {ready.length === 1 ? 'product' : 'products'} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---------- 4. preview, then pay ----------
const DESKTOP_W = 1280;

/** The real shop, in a phone or a scaled-down desktop window. */
function ShopFrame({ url, device }) {
  const box = useRef(null);
  const [scale, setScale] = useState(0.6);
  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / DESKTOP_W)));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, [device]);
  if (device === 'phone') {
    return (
      <div className="mx-auto w-[390px] max-w-full rounded-[2.6rem] bg-[#0F1115] p-3 shadow-[0_40px_80px_-30px_rgba(15,17,21,0.6)]">
        <iframe title="Your shop on a phone" src={url} className="h-[720px] w-full rounded-[2rem] bg-white" />
      </div>
    );
  }
  return (
    <div ref={box} className="overflow-hidden rounded-[var(--r-lg)] bg-white shadow-[0_40px_80px_-40px_rgba(15,17,21,0.6)] ring-1 ring-espresso/10" style={{ height: 820 * scale + 36 }}>
      <div className="flex h-9 items-center gap-2 bg-[#EDE7DE] px-4">
        <i className="h-3 w-3 rounded-full bg-[#CFC7BB]" />
        <i className="h-3 w-3 rounded-full bg-[#CFC7BB]" />
        <i className="h-3 w-3 rounded-full bg-[#CFC7BB]" />
        <span className="ml-3 flex-1 truncate rounded-full bg-white px-3 py-0.5 text-xs text-espresso/55">{url.split('/?')[0].replace(/^https?:\/\//, '')}</span>
      </div>
      <iframe title="Your shop on a computer" src={url} className="origin-top-left bg-white" style={{ width: DESKTOP_W, height: 820, transform: `scale(${scale})` }} />
    </div>
  );
}

function PreviewPayStep({ token, signup, info, onEditLook, onEditProducts, onLive }) {
  const [url, setUrl] = useState(null);
  const [device, setDevice] = useState('phone');
  const [state, setState] = useState({ error: null, launching: false });
  const paid = Boolean(signup.paidUntil);

  // Build the shop from everything entered so far and get its private preview address.
  useEffect(() => {
    papi('/preview', { method: 'POST', token })
      .then((r) => setUrl(r.url))
      .catch((err) => setState((s) => ({ ...s, error: err.message })));
  }, [token]);

  const goLive = async () => {
    setState({ error: null, launching: true });
    try {
      onLive(await papi('/launch', { method: 'POST', token }));
    } catch (err) {
      setState({ error: err.message, launching: false });
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-espresso/10" role="radiogroup" aria-label="Preview size">
            {[['phone', Smartphone, 'Phone'], ['desktop', Monitor, 'Computer']].map(([id, Icon, label]) => (
              <button type="button" key={id} role="radio" aria-checked={device === id} onClick={() => setDevice(id)} className={cn('flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold', device === id ? 'bg-espresso text-cream' : 'text-espresso/60')}>
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
          {url && (
            <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-caramel hover:underline">
              Open in a new tab <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        {url ? (
          <ShopFrame url={url} device={device} />
        ) : (
          <div className="grid h-[600px] place-items-center rounded-[var(--r-xl)] bg-sand/50">
            {state.error ? <p className="max-w-sm text-center text-sm text-red-800">{state.error}</p> : <Loader2 className="h-6 w-6 animate-spin text-espresso/40" />}
          </div>
        )}
        <p className="mt-3 text-center text-sm text-espresso/55">This is your real shop. Tap around: products, cart and pages all work. Orders open once you’re live.</p>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-6">
        <div className="rounded-[var(--r-xl)] bg-white p-5 ring-1 ring-espresso/10">
          <p className="text-sm font-semibold text-espresso/55">Not quite right?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={onEditLook} className="btn btn-ghost px-4 py-2 text-sm">
              <Palette className="h-4 w-4" /> Change the look
            </button>
            <button type="button" onClick={onEditProducts} className="btn btn-ghost px-4 py-2 text-sm">
              <Package className="h-4 w-4" /> Edit products
            </button>
          </div>
        </div>
        <div className="rounded-[var(--r-xl)] bg-white p-5 ring-1 ring-espresso/10">
          <p className="text-sm font-semibold text-espresso/55">Happy with it?</p>
          <p className="mt-1 text-lg font-bold">
            Go live at {signup.link}.{info?.domain}
          </p>
          {state.error && url && <p className="mt-3 rounded-[var(--r-md)] bg-red-50 px-3 py-2 text-sm font-medium text-red-800">{state.error}</p>}
          <div className="mt-4">
            {paid ? (
              <button type="button" onClick={goLive} disabled={state.launching} className="btn btn-primary w-full py-4">
                {state.launching && <Loader2 className="h-4 w-4 animate-spin" />} Paid · open my shop now <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              info && (
                <MpesaPay
                  prices={info.prices}
                  plans={info.plans}
                  testMode={info.testMode}
                  defaultPhone={signup.phone}
                  cta="Pay & go live"
                  start={async (phone, plan) => (await papi('/pay', { method: 'POST', body: { phone, plan }, token })).id}
                  check={(id) => papi(`/pay/${id}`, { token })}
                  onPaid={() => setTimeout(goLive, 800)}
                />
              )
            )}
          </div>
          <p className="mt-4 border-t border-espresso/10 pt-3 text-xs leading-relaxed text-espresso/55">
            Your shop opens the moment the payment goes through. Your admin reminds you before the plan ends, and you renew there with the same M-Pesa prompt.
          </p>
        </div>
      </aside>
    </div>
  );
}

// ---------- done ----------
function Live({ result, signup }) {
  const pretty = result.url.replace(/^https?:\/\//, '');
  const share = `https://wa.me/?text=${encodeURIComponent(`Our shop is now online! Order from ${signup.name} here: ${result.url}`)}`;
  return (
    <div className="mx-auto max-w-lg py-10 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#1E8E3E] text-[#fff]">
        <Check className="h-7 w-7" strokeWidth={3} />
      </span>
      <h2 className="kb-display mt-5 text-5xl">{signup.name} is live</h2>
      <a href={result.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-lg font-semibold text-caramel underline-offset-4 hover:underline">
        {pretty} <ExternalLink className="h-4 w-4" />
      </a>
      <div className="mt-8 grid gap-3">
        <a href={result.admin} className="btn btn-primary py-4">
          Go to my shop’s admin <ArrowRight className="h-4 w-4" />
        </a>
        <a href={share} target="_blank" rel="noreferrer" className="btn btn-ghost py-3.5">
          Share the link on WhatsApp
        </a>
      </div>
      <p className="mt-6 text-sm text-espresso/55">In the admin you can add stock, descriptions and more products, and see orders as they come in.</p>
    </div>
  );
}

export default function Wizard({ info }) {
  const [token, setToken] = useState(store.get);
  const [signup, setSignup] = useState(null);
  const [step, setStep] = useState(token ? null : 0);
  const [live, setLive] = useState(null);

  // Resume: the server knows how far the signup got.
  useEffect(() => {
    if (!token) return;
    papi('/signup', { token })
      .then((s) => {
        setSignup(s);
        // Back where they left off: straight to the preview once products and payment details are in.
        setStep((cur) => cur ?? (s.brand?.products?.length && (s.brand.till || s.brand.paybill) ? 3 : 1));
      })
      .catch(() => {
        store.set(null);
        setToken(null);
        setStep(0);
      });
  }, [token]);

  const restart = () => {
    store.set(null);
    setToken(null);
    setSignup(null);
    setStep(0);
  };
  const onSaved = useCallback((s) => setSignup((cur) => ({ ...cur, ...s })), []);

  return (
    <div className="container-x pb-20">
      <header className="flex flex-wrap items-center justify-between gap-4 py-5">
        <Link to="/">
          <Wordmark name={info?.name} />
        </Link>
        {!live && step !== null && <Progress step={step} />}
      </header>

      <AnimatePresence mode="wait">
        <motion.div key={live ? 'live' : step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }} className="mt-6">
          {live ? (
            <Live result={live} signup={signup} />
          ) : step === null ? (
            <div className="grid h-60 place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-espresso/40" />
            </div>
          ) : (
            <>
              <h1 className="kb-display text-4xl sm:text-5xl">
                {['Start your shop', 'Make it yours', 'Add your products', 'Preview, then pay'][step]}
              </h1>
              {signup && step > 0 && (
                <p className="mt-1 text-espresso/60">
                  {signup.name} · <b className="text-espresso">{signup.link}.{info?.domain}</b>
                  {step === 1 && (
                    <button onClick={restart} className="ml-2 text-sm font-semibold text-caramel underline-offset-2 hover:underline">
                      Start over
                    </button>
                  )}
                </p>
              )}
              <div className="mt-8">
                {step === 0 && (
                  <BusinessStep
                    info={info}
                    onDone={(t) => {
                      store.set(t);
                      setToken(t);
                      setStep(1);
                    }}
                  />
                )}
                {step === 1 && signup && <LookStep token={token} signup={signup} info={info} onSaved={onSaved} onNext={() => setStep(2)} />}
                {step === 2 && signup && (
                  <ProductsStep
                    token={token}
                    signup={signup}
                    onBack={() => setStep(1)}
                    onNext={(saved) => {
                      onSaved(saved);
                      setStep(3);
                    }}
                  />
                )}
                {step === 3 && signup && (
                  <PreviewPayStep
                    token={token}
                    signup={signup}
                    info={info}
                    onEditLook={() => setStep(1)}
                    onEditProducts={() => setStep(2)}
                    onLive={(r) => {
                      store.set(null);
                      setLive(r);
                    }}
                  />
                )}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
