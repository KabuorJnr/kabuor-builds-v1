import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Megaphone, Pencil, Pin, PinOff, Plus, Trash2, X } from 'lucide-react';
import { EASE, useLockBody } from '../components/ui';
import { refreshStore } from '../lib/api';
import { cn } from '../lib/format';
import { useAdminApi, useAdminQuery } from '../store/admin';
import { PostCard } from '../components/UpdatesSection';
import { ImagePicker, TextArea, TextInput, Toggle } from './form';
import { ErrorNote, PageHeader } from './shared';

const TAGS = ['New branch', 'Offer', 'News', 'Prices', 'Thank you', 'Holiday'];
const BLANK = { title: '', tag: 'News', body: '', image: '', linkLabel: '', linkHref: '', pinned: false, published: true };

function Editor({ initial, onClose, onSaved }) {
  const call = useAdminApi();
  const [post, setPost] = useState(initial);
  const [announce, setAnnounce] = useState(false);
  const [state, setState] = useState({ saving: false, error: null });
  const set = (k) => (v) => setPost((p) => ({ ...p, [k]: v?.target ? v.target.value : v }));
  useLockBody(true);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const save = async () => {
    setState({ saving: true, error: null });
    try {
      const saved = post.id
        ? await call(`/posts/${post.id}`, { method: 'PATCH', body: post })
        : await call('/posts', { method: 'POST', body: post });
      if (announce) {
        const { content } = await call('/content');
        content.announcement = { enabled: true, text: saved.title, linkLabel: 'Read more', linkHref: '/updates' };
        await call('/content', { method: 'PUT', body: { content } });
      }
      refreshStore();
      onSaved(saved);
    } catch (err) {
      setState({ saving: false, error: err.message });
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] bg-espresso/45 backdrop-blur-sm" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={post.id ? 'Edit update' : 'New update'}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[94svh] flex-col overflow-hidden rounded-t-[2rem] bg-cream shadow-2xl md:inset-0 md:m-auto md:h-fit md:max-h-[90vh] md:w-[calc(100%-3rem)] md:max-w-4xl md:rounded-[2rem]"
      >
        <header className="flex items-center justify-between border-b border-espresso/[0.07] px-5 py-4 sm:px-7">
          <h2 className="text-xl font-extrabold tracking-tight">{post.id ? 'Edit update' : 'New update'}</h2>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-espresso/10" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[1fr_18rem]">
          <div className="space-y-4 p-5 sm:p-7">
            {state.error && <ErrorNote>{state.error}</ErrorNote>}
            <ImagePicker value={post.image} onChange={set('image')} />
            <TextInput label="Headline" value={post.title} onChange={set('title')} maxLength={90} placeholder="e.g. New branch in Kisumu!" />
            <div>
              <TextInput label="Tag" value={post.tag} onChange={set('tag')} maxLength={24} />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TAGS.map((t) => (
                  <button key={t} type="button" onClick={() => set('tag')(t)} className={cn('rounded-full px-3 py-1 text-xs font-semibold ring-1 transition', post.tag === t ? 'bg-espresso text-cream ring-espresso' : 'bg-white text-espresso/60 ring-espresso/10 hover:ring-espresso/30')}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <TextArea label="Message" rows={5} value={post.body} onChange={set('body')} maxLength={2000} placeholder="Tell customers what’s new…" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Button text" optional value={post.linkLabel ?? ''} onChange={set('linkLabel')} placeholder="Shop now" maxLength={24} />
              <TextInput label="Button link" optional value={post.linkHref ?? ''} onChange={set('linkHref')} placeholder="#shop, tel:0702531651 or https://…" />
            </div>
            <div className="space-y-4 rounded-2xl bg-white p-4 ring-1 ring-espresso/[0.06]">
              <Toggle checked={post.published} onChange={set('published')} label="Published" description="Turn off to keep it as a draft." />
              <Toggle checked={post.pinned} onChange={set('pinned')} label="Pin to the top" description="Pinned updates show first." />
              <Toggle checked={announce} onChange={setAnnounce} label="Also show in the announcement bar" description="Replaces the strip at the very top of the website with this headline." />
            </div>
          </div>
          <div className="border-t border-espresso/[0.07] bg-beige/50 p-5 md:border-t-0 md:border-l">
            <p className="mb-3 font-hand text-xl text-amber">Preview</p>
            <PostCard post={post} />
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-espresso/[0.07] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={save} disabled={state.saving || post.title.trim().length < 2} className="btn btn-primary">
            {state.saving && <Loader2 className="h-4 w-4 animate-spin" />} {post.published ? 'Publish' : 'Save draft'}
          </button>
        </footer>
      </motion.div>
    </>
  );
}

export default function Updates() {
  const call = useAdminApi();
  const { data, error, loading, setData } = useAdminQuery('/posts');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [actionError, setActionError] = useState(null);

  const patch = async (post, body) => {
    setActionError(null);
    try {
      const saved = await call(`/posts/${post.id}`, { method: 'PATCH', body });
      refreshStore();
      setData((list) => list.map((p) => (p.id === saved.id ? saved : p)));
    } catch (err) {
      setActionError(err.message);
    }
  };
  const remove = async (post) => {
    setActionError(null);
    try {
      await call(`/posts/${post.id}`, { method: 'DELETE' });
      refreshStore();
      setData((list) => list.filter((p) => p.id !== post.id));
    } catch (err) {
      setActionError(err.message);
    }
  };

  const sorted = (data ?? []).slice().sort((a, b) => b.pinned - a.pinned || b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <PageHeader title="Updates" subtitle="Post news, offers and announcements. Published updates appear on the website straight away.">
        <button onClick={() => setEditing({ ...BLANK })} className="btn btn-primary">
          <Plus className="h-4 w-4" /> New update
        </button>
      </PageHeader>

      {(error || actionError) && <div className="mb-4"><ErrorNote>{error || actionError}</ErrorNote></div>}
      {!data && loading && <div className="h-72 animate-pulse rounded-3xl bg-beige" />}
      {data && data.length === 0 && (
        <div className="card flex flex-col items-center p-10 text-center">
          <Megaphone className="h-10 w-10 text-amber" />
          <p className="mt-3 font-bold">No updates yet</p>
          <p className="mt-1 text-sm text-espresso/55">Share a new branch, an offer or a holiday greeting.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((post) => (
          <motion.div key={post.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={cn('flex flex-col', !post.published && 'opacity-60')}>
            <div className="relative flex-1">
              <PostCard post={post} compact />
              <div className="absolute top-3 left-3 flex gap-1.5">
                {post.pinned && <span className="rounded-full bg-espresso px-2.5 py-1 text-[10px] font-bold tracking-wider text-honey uppercase">Pinned</span>}
                {!post.published && <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold tracking-wider text-espresso/70 uppercase ring-1 ring-espresso/10">Draft</span>}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <button onClick={() => setEditing(post)} className="btn btn-ghost flex-1 py-2">
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button onClick={() => patch(post, { pinned: !post.pinned })} className="grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-espresso/10 hover:ring-espresso/30" title={post.pinned ? 'Unpin' : 'Pin to top'} aria-label={post.pinned ? 'Unpin' : 'Pin to top'}>
                {post.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </button>
              <button onClick={() => patch(post, { published: !post.published })} className="grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-espresso/10 hover:ring-espresso/30" title={post.published ? 'Unpublish' : 'Publish'} aria-label={post.published ? 'Unpublish' : 'Publish'}>
                {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {confirm === post.id ? (
                <span className="flex items-center gap-1">
                  <button onClick={() => remove(post)} className="rounded-full bg-red-700 px-3 py-2 text-xs font-bold text-white">Delete</button>
                  <button onClick={() => setConfirm(null)} className="rounded-full px-2 py-2 text-xs font-semibold text-espresso/60">Keep</button>
                </span>
              ) : (
                <button onClick={() => setConfirm(post.id)} className="grid h-10 w-10 place-items-center rounded-full bg-white text-red-700 ring-1 ring-espresso/10 hover:bg-red-50" title="Delete" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <Editor
            key={editing.id ?? 'new'}
            initial={{ ...BLANK, ...editing, linkLabel: editing.linkLabel ?? '', linkHref: editing.linkHref ?? '', image: editing.image ?? '' }}
            onClose={() => setEditing(null)}
            onSaved={(saved) => {
              setData((list) => (list.some((p) => p.id === saved.id) ? list.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...list]));
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
