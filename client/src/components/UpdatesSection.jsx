import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { EASE, Reveal, SectionHeading, useLockBody } from './ui';
import { cn } from '../lib/format';
import SmartLink from './SmartLink';

const postDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// One update as a card. Used on the website and as the live preview in the admin editor.
export function PostCard({ post, compact = false, onOpen }) {
  const Wrapper = onOpen ? 'button' : 'div';
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--r-xl)] bg-white text-left shadow-[0_12px_30px_-18px_rgba(46,31,20,0.3)] ring-1 ring-espresso/[0.06] transition-shadow duration-500 hover:shadow-[0_26px_50px_-26px_rgba(46,31,20,0.45)]">
      <Wrapper {...(onOpen ? { type: 'button', onClick: onOpen, 'aria-label': `Read: ${post.title}` } : {})} className="flex flex-1 flex-col text-left">
        {post.image && (
          // Flyers carry text, so show the whole image (contain) over a blurred copy of itself.
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-beige">
            <img src={post.image} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover opacity-50 blur-2xl" loading="lazy" />
            <img src={post.image} alt="" className="relative h-full w-full object-contain p-3 drop-shadow-[0_10px_18px_rgba(46,31,20,0.25)] transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]" loading="lazy" />
          </div>
        )}
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2 text-xs">
            {post.tag && <span className="kraft px-2.5 py-1 font-hand text-[15px] leading-none text-espresso">{post.tag}</span>}
            <span className="text-espresso/45">{post.createdAt ? postDate(post.createdAt) : 'Today'}</span>
          </div>
          <h3 className="mt-3 text-lg leading-snug font-extrabold tracking-tight">{post.title || 'Your headline'}</h3>
          {post.body && <p className={cn('mt-2 text-sm leading-relaxed whitespace-pre-line text-espresso/65', compact && 'line-clamp-3')}>{post.body}</p>}
          {(onOpen || post.linkHref) && (
            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-caramel">
              {onOpen ? 'Read more' : post.linkLabel || 'Learn more'} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </div>
      </Wrapper>
    </article>
  );
}

function PostReader({ post, onClose }) {
  useLockBody(Boolean(post));
  useEffect(() => {
    if (!post) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [post, onClose]);

  return (
    <AnimatePresence>
      {post && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[70] bg-espresso/50 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={post.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-x-0 bottom-0 z-[71] max-h-[92svh] overflow-y-auto rounded-t-[var(--r-xl)] bg-cream md:inset-0 md:m-auto md:h-fit md:max-h-[88vh] md:w-[calc(100%-3rem)] md:max-w-3xl md:rounded-[var(--r-xl)]"
          >
            <button onClick={onClose} className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <div className="grid md:grid-cols-2">
              {post.image && (
                <div className="bg-beige">
                  <img src={post.image} alt="" className="h-full max-h-[60svh] w-full object-contain md:max-h-[88vh]" />
                </div>
              )}
              <div className={cn('p-6 sm:p-8', !post.image && 'md:col-span-2')}>
                <div className="flex items-center gap-2 text-xs">
                  {post.tag && <span className="kraft px-2.5 py-1 font-hand text-[15px] leading-none">{post.tag}</span>}
                  <span className="text-espresso/45">{postDate(post.createdAt)}</span>
                </div>
                <h3 className="mt-4 text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">{post.title}</h3>
                {post.body && <p className="mt-4 leading-relaxed whitespace-pre-line text-espresso/70">{post.body}</p>}
                {post.linkHref && (
                  <SmartLink href={post.linkHref} onClick={onClose} className="btn btn-primary mt-6">
                    {post.linkLabel || 'Learn more'} <ArrowRight className="h-4 w-4" />
                  </SmartLink>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function UpdatesSection({ data, posts }) {
  const [open, setOpen] = useState(null);
  if (!posts.length) return null;
  return (
    <section id="updates" className="scroll-mt-16 py-16 sm:py-24">
      <div className="container-x">
        <SectionHeading eyebrow={data.eyebrow} title={data.title}>
          {data.text}
        </SectionHeading>
        <div className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={(i % 3) * 0.08} className="w-[82%] shrink-0 snap-start sm:w-auto">
              <PostCard post={post} compact onOpen={() => setOpen(post)} />
            </Reveal>
          ))}
        </div>
      </div>
      <PostReader post={open} onClose={() => setOpen(null)} />
    </section>
  );
}
