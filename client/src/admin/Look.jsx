// The shop's look after it's live: logo, banner photos, colours (from those pictures), style and words.
// Changes show in the preview straight away and go live when saved.
import { useEffect, useState } from 'react';
import { Check, Loader2, Moon, Sun } from 'lucide-react';
import { LOOK } from '../lib/brand';
import { cn } from '../lib/format';
import { applyLook } from '../lib/theme';
import { refreshStore } from '../lib/api';
import { PalettePicker, PictureDrop, ShopPreview, StylePicker } from '../platform/shared';
import { useAdminApi, useAdminQuery } from '../store/admin';
import { ErrorNote, PageHeader } from './shared';
import { Section, TextArea, TextInput } from './form';

export default function Look() {
  const call = useAdminApi();
  const { data, error } = useAdminQuery('/look');
  const [look, setLook] = useState(null);
  const [accents, setAccents] = useState([]);
  const [palettes, setPalettes] = useState([]);
  const [preview, setPreview] = useState(LOOK);
  const [state, setState] = useState({ saving: false, saved: false, error: null });

  useEffect(() => {
    if (!data) return;
    const b = data.brand;
    setLook({ style: b.style, mode: b.mode ?? LOOK.theme.mode, accent: b.accent ?? data.defaultAccent, tagline: b.tagline ?? '', about: b.about ?? '', logo: b.logo ?? '', photos: b.photos ?? [] });
    if (b.accent) setAccents([b.accent]);
  }, [data]);

  const mode = look?.mode ?? 'light';
  useEffect(() => {
    if (look) call('/look/palettes', { method: 'POST', body: { accents, mode } }).then(setPalettes).catch(() => {});
  }, [accents, mode, call, look === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (patch) => {
    setState({ saving: false, saved: false, error: null });
    setLook((x) => ({ ...x, ...patch }));
  };
  const upload = (role) => (file) => call(`/look/upload?role=${role}`, { file });
  const gotColours = (found) => found?.length && setAccents((a) => [...new Set([...found, ...a])].slice(0, 5));

  const save = async () => {
    setState({ saving: true, saved: false, error: null });
    try {
      const res = await call('/look', { method: 'PUT', body: look });
      setPreview(res.preview);
      await applyLook(res.preview);
      refreshStore();
      setState({ saving: false, saved: true, error: null });
    } catch (err) {
      setState({ saving: false, saved: false, error: err.message });
    }
  };

  return (
    <>
      <PageHeader title="Look & colours" subtitle="Your logo, photos, colours and style, as customers see them.">
        <button onClick={save} disabled={!look || state.saving} className="btn btn-primary">
          {state.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : state.saved && <Check className="h-4 w-4" />}
          {state.saved ? 'Saved' : 'Save and publish'}
        </button>
      </PageHeader>
      {(error || state.error) && <div className="mb-4"><ErrorNote>{error || state.error}</ErrorNote></div>}
      {look && data && (
        <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
          <div className="space-y-5">
            <Section title="Pictures" description="Colours are picked from these.">
              <div className="grid gap-4 sm:grid-cols-3">
                <PictureDrop label="Logo" value={look.logo} upload={upload('logo')} aspect="aspect-square" onUpload={(r) => (update({ logo: r.url }), gotColours(r.accents))} onClear={() => update({ logo: '' })} />
                {[0, 1].map((i) => (
                  <PictureDrop
                    key={i}
                    label={i === 0 ? 'Banner photo' : 'Second photo'}
                    value={look.photos[i]}
                    upload={upload('photo')}
                    aspect="aspect-square"
                    onUpload={(r) => {
                      const photos = [...look.photos];
                      photos[i] = r.url;
                      update({ photos: photos.filter(Boolean) });
                      gotColours(r.accents);
                    }}
                    onClear={() => update({ photos: look.photos.filter((_, j) => j !== i) })}
                  />
                ))}
              </div>
            </Section>
            <Section
              title="Colours"
              actions={
                <div className="inline-flex rounded-full bg-beige p-1" role="radiogroup" aria-label="Light or dark">
                  {[['light', Sun, 'Light'], ['dark', Moon, 'Dark']].map(([id, Icon, label]) => (
                    <button key={id} role="radio" aria-checked={mode === id} onClick={() => update({ mode: id })} className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold', mode === id ? 'bg-espresso text-cream' : 'text-espresso/60')}>
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </button>
                  ))}
                </div>
              }
            >
              <PalettePicker options={palettes} value={look.accent} onChange={(accent) => update({ accent })} />
            </Section>
            <Section title="Style" description="Fonts, corners and feel.">
              <StylePicker styles={data.styles} value={look.style} accent={preview?.colors?.honey} onChange={(style) => update({ style, mode: data.styles.find((s) => s.id === style)?.mode })} />
            </Section>
            <Section title="Words">
              <TextInput label="Tagline" value={look.tagline} onChange={(e) => update({ tagline: e.target.value })} maxLength={60} hint="Becomes your homepage headline" />
              <TextArea label="About your business" value={look.about} onChange={(e) => update({ about: e.target.value })} maxLength={400} />
            </Section>
          </div>
          <aside className="lg:sticky lg:top-10 lg:self-start">
            <p className="mb-2 text-sm font-semibold text-espresso/55">{state.saved ? 'Live now' : 'Last saved look'}</p>
            <ShopPreview look={{ ...preview, tagline: look.tagline || preview.tagline }} name={LOOK.name} photo={look.photos[0]} />
            <p className="mt-2 text-xs text-espresso/50">Save to see your colour and style changes here and on the shop.</p>
          </aside>
        </div>
      )}
    </>
  );
}
