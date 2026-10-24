// Kabuor Builds, the company (/). A visitor here is deciding two things: "which of these is for me?" and
// "can I trust these people?". So: the two products side by side with what each costs and does, a plain
// "which one do I need" guide, what both are built on, real work, who we are, and a person to talk to.
import { useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ExternalLink,
  Languages,
  Lock,
  MapPin,
  MessageCircle,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import { EASE, ksh } from './shared';
import DemoRequest from './DemoRequest';
import { ContactButtons, ERP_RAILWAY_URL, Go, SHOPS_RAILWAY_URL, SiteFooter, SiteHeader } from './Site';

const FEATURED_ROLES = [
  {
    id: 'lead-platform-architect',
    title: 'Lead Platform Architect (.NET 10 / High-Throughput)',
    dept: 'Engineering',
    location: 'Nairobi (Hybrid · Kilimani HQ)',
    compensation: 'Undisclosed · Top 10% Benchmark in Kenya',
    equity: '0.50% – 1.00% ESOP Stake',
    summary: 'Architect the core transactional backbone of Kabuor ERP, scaling SequenceGate and real-time M-Pesa reconciliation to 500k+ transactions/day.',
  },
  {
    id: 'senior-edge-frontend-engineer',
    title: 'Senior Edge & Frontend Systems Engineer (React 19 / PWA)',
    dept: 'Engineering',
    location: 'Nairobi (Hybrid · Kilimani HQ)',
    compensation: 'Undisclosed · Top 10% Benchmark in Kenya',
    equity: '0.35% – 0.75% ESOP Stake',
    summary: 'Build ultra-responsive, offline-first POS tills and role-centric Business Central style command shells for enterprise retail operations.',
  },
  {
    id: 'vp-engineering',
    title: 'VP of Engineering & Core Architecture',
    dept: 'Leadership',
    location: 'Nairobi (Hybrid · Kilimani HQ)',
    compensation: 'Undisclosed · Top 10% Benchmark in Kenya',
    equity: 'Executive ESOP Allocation',
    summary: 'Lead engineering pods across tax compliance, distributed databases, edge runtimes, and maintain 99.99% availability across East Africa.',
  },
  {
    id: 'head-growth-partnerships',
    title: 'Head of Growth & Commercial Partnerships',
    dept: 'Growth & Sales',
    location: 'Nairobi, Kenya',
    compensation: 'Undisclosed · Top 10% Benchmark + Performance Bonus',
    equity: 'Executive ESOP Stake',
    summary: 'Lead commercial expansion across Kenya, enterprise ERP migrations, merchant shop adoption, and strategic bank/Sacco integrations.',
  },
  {
    id: 'lead-product-designer',
    title: 'Lead Product Designer (Design Systems & Web Studio)',
    dept: 'Product & Design',
    location: 'Nairobi, Kenya',
    compensation: 'Undisclosed · Top 10% Benchmark in Kenya',
    equity: 'Competitive ESOP Grant',
    summary: 'Craft world-class typography, African brand aesthetics, and ergonomic administrative interfaces across Kabuor Builds and Kabuor ERP.',
  },
  {
    id: 'erp-implementation-specialist',
    title: 'ERP Implementation & Customer Success Specialist',
    dept: 'Customer Operations',
    location: 'Nairobi, Kenya',
    compensation: 'Undisclosed · Top 10% Benchmark in Kenya',
    equity: 'Competitive ESOP Grant',
    summary: 'Guide manufacturers, wholesalers, and retail chains from QuickBooks/SAP/legacy systems to Kabuor ERP with zero business downtime.',
  },
];

const SHARED = [
  { icon: Wallet, title: 'M-Pesa first', text: 'Prompts, Paybills and Tills built in, not bolted on.' },
  { icon: ReceiptText, title: 'KRA-ready', text: 'VAT done right; invoices prepared for eTIMS.' },
  { icon: Languages, title: 'English & Kiswahili', text: 'Plain words your whole team understands.' },
  { icon: Smartphone, title: 'Phone-first', text: 'Fast on the phones your customers and staff use.' },
  { icon: BarChart3, title: 'Priced in shillings', text: 'Clear prices per business, not per seat in dollars.' },
  { icon: MessageCircle, title: 'Real people', text: 'Call or WhatsApp us. We’ll set it up with you.' },
];

function ProductCard({ tag, name, line, text, points, meta, launch, primary, secondary, visual, delay }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className="flex flex-col overflow-hidden rounded-[var(--r-xl)] bg-white text-espresso shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]"
    >
      <div className="relative h-44 overflow-hidden bg-[#EEF0FB] sm:h-52">{visual}</div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold tracking-[0.14em] text-[#3A2BC9] uppercase">{tag}</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live on Render
          </span>
        </div>
        <h3 className="kb-display mt-2 text-3xl sm:text-4xl">{name}</h3>
        <p className="mt-1 text-lg font-semibold">{line}</p>
        <p className="mt-2 text-espresso/65">{text}</p>
        <ul className="mt-5 space-y-2 text-[15px]">
          {points.map((p) => (
            <li key={p} className="flex gap-2.5">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#3A2BC9]" strokeWidth={3} /> {p}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm font-semibold text-espresso/55">{meta}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2.5 pt-1">
          {launch}
          {primary}
          {secondary}
        </div>
      </div>
    </motion.article>
  );
}

/** A small, honest picture of each product (drawn, not a stock photo). */
function ShopsVisual() {
  return (
    <div className="absolute inset-0 flex items-end justify-center gap-4 px-6 pt-6">
      <img src="/brand/work-anjugu-desk.webp" alt="" className="hidden h-[88%] rounded-t-xl object-cover object-top shadow-xl ring-1 ring-black/5 sm:block sm:w-[62%]" />
      <img src="/brand/work-anjugu-shop-phone.webp" alt="" className="h-[95%] w-[40%] rounded-t-[1.2rem] sm:w-[24%] border-[5px] border-b-0 border-[#0A0B1E] object-cover object-top shadow-xl" />
    </div>
  );
}

function ErpVisual() {
  return (
    <div className="absolute inset-x-6 top-6 bottom-0 overflow-hidden rounded-t-xl bg-white p-4 shadow-xl ring-1 ring-black/5 sm:inset-x-10">
      <p className="text-[11px] font-semibold text-espresso/50">Needs you today</p>
      {[
        ['2 invoices overdue', 'KSh 30,100', '#B42318', '#FDECEA'],
        ['3 M-Pesa payments', 'matched', '#0F7A3D', '#E6F6EC'],
        ['Hot Pepper 500g running low', '18 left', '#A15C00', '#FFF4E0'],
      ].map(([t, m, c, bg]) => (
        <div key={t} className="mt-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2" style={{ background: bg }}>
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c }} />
          <span className="flex-1 truncate text-[12px] font-semibold">{t}</span>
          <span className="text-[11px] font-semibold" style={{ color: c }}>
            {m}
          </span>
        </div>
      ))}
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#0A0B1E] px-3 py-2 text-[11px] text-white">
        <Sparkles className="h-3.5 w-3.5 text-[#F2C14E]" /> “Nani hajalipa mwezi huu?”
      </div>
    </div>
  );
}

export default function Company({ info }) {
  useEffect(() => {
    document.title = `${info?.name ?? 'Kabuor Technologies'} · Software for Kenyan businesses`;
  }, [info]);
  const phone = info?.phone;
  const talk = { href: '#demo', label: 'Request a demo' };

  return (
    <>
      <div className="kb-ink relative overflow-hidden">
        <SiteHeader info={info} cta={talk} />
        <section className="container-x relative pt-8 pb-16 sm:pt-14 sm:pb-20">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="kb-kicker text-[#9DB6FF]">
            Kabuor Technologies · Made in Kenya
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.05, ease: EASE }} className="kb-display mt-4 max-w-4xl text-[2.9rem] sm:text-[5rem]">
            Software Kenyan businesses <span className="text-[#F2C14E]">actually run on.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: EASE }} className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/75">
            Two enterprise-grade systems by Kabuor Technologies built around M-Pesa, KRA eTIMS, and African commerce: Kabuor Builds for online shops & websites, and Kabuor ERP for commercial operating systems.
          </motion.p>

          <div id="products" className="mt-12 grid scroll-mt-6 gap-5 lg:grid-cols-2">
            <ProductCard
              delay={0.25}
              tag="Websites & Online Stores"
              name="Kabuor Builds"
              line="Your brand’s own online shop & digital web presence."
              text="Your products, your colours, M-Pesa checkout. See it before you pay, and go live the same day."
              points={['10 designs that take their colours from your photos', 'Customers pay your own Till or Paybill, no commission', 'Your link, like yourbrand.shop.ke']}
              meta={info ? `From ${ksh(info.prices.monthly)} a month · Available now` : 'Available now'}
              visual={<ShopsVisual />}
              launch={
                <a
                  href={SHOPS_RAILWAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-[#2357F5] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#3A6BFF] inline-flex items-center gap-2"
                >
                  Launch Shop <ExternalLink className="h-4 w-4" />
                </a>
              }
              primary={
                <Go to="/start" className="btn border border-espresso/15 bg-white px-4 py-3 font-medium text-espresso hover:bg-espresso/5">
                  Start your shop <ArrowRight className="h-4 w-4" />
                </Go>
              }
              secondary={
                <Go to="/shops" className="btn btn-ghost px-4 py-3">
                  How it works
                </Go>
              }
            />
            <ProductCard
              delay={0.35}
              tag="Commercial Operating System"
              name="Kabuor ERP"
              line="Sales, M-Pesa ledger, stock, eTIMS and books in one place."
              text="Invoices that M-Pesa pays and matches by itself, eTIMS-ready, stock and suppliers, and Msaidizi, an assistant you can ask in Kiswahili."
              points={['M-Pesa payments match your invoices by themselves', 'VAT, stock and profit worked out as you go', 'Built for the phone, for your whole team']}
              meta="Early access · Priced in shillings per business"
              visual={<ErpVisual />}
              launch={
                <a
                  href={ERP_RAILWAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-[#2357F5] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#3A6BFF] inline-flex items-center gap-2"
                >
                  Launch ERP <ExternalLink className="h-4 w-4" />
                </a>
              }
              primary={
                <Go to="/erp" className="btn border border-espresso/15 bg-white px-4 py-3 font-medium text-espresso hover:bg-espresso/5">
                  See Kabuor ERP <ArrowRight className="h-4 w-4" />
                </Go>
              }
              secondary={
                <a href="#demo" className="btn btn-ghost px-4 py-3">
                  Request a demo
                </a>
              }
            />
          </div>
        </section>
      </div>

      {/* which one do I need */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-x">
          <p className="kb-kicker text-caramel">Which one do I need?</p>
          <h2 className="kb-display mt-3 text-4xl sm:text-5xl">Start from what you want to fix.</h2>
          <ul className="mt-10 divide-y divide-espresso/10 border-y border-espresso/10">
            {[
              ['“I want customers to find my products and order online.”', 'Kabuor Shops', '/shops', ShoppingBag, SHOPS_RAILWAY_URL, 'Launch Shop'],
              ['“I invoice other businesses, buy stock, and need my books and KRA in order.”', 'Kabuor ERP', '/erp', BarChart3, ERP_RAILWAY_URL, 'Launch ERP'],
              ['“Both.”', 'Start with Shops today and join the ERP early access. We’re connecting them so online orders flow straight into your books.', '/erp', Sparkles, null, null],
            ].map(([need, answer, to, Icon, launchHref, launchText]) => (
              <li key={need} className="py-6">
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:gap-8">
                  <span className="text-lg font-semibold">{need}</span>
                  <span className="flex items-start gap-3 text-espresso/70">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ECEBFF] text-[#3A2BC9]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="pt-1.5">{answer}</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    {launchHref && (
                      <a
                        href={launchHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn bg-[#2357F5] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3A6BFF] inline-flex items-center gap-1.5"
                      >
                        {launchText} <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <Go to={to} className="group flex items-center text-sm font-semibold text-[#2357F5] hover:underline">
                      Details <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
                    </Go>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* what both are built on */}
      <section className="py-16 sm:py-24">
        <div className="container-x">
          <p className="kb-kicker text-caramel">What both are built on</p>
          <h2 className="kb-display mt-3 max-w-3xl text-4xl sm:text-5xl">Made for how business works here.</h2>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SHARED.map((s) => (
              <li key={s.title} className="flex gap-4 rounded-[var(--r-xl)] bg-white p-5 ring-1 ring-espresso/[0.07]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#ECEBFF] text-[#3A2BC9]">
                  <s.icon className="h-5 w-5" />
                </span>
                <span>
                  <b className="block text-lg">{s.title}</b>
                  <span className="text-espresso/60">{s.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* real work */}
      <section id="work" className="scroll-mt-6 bg-white py-16 sm:py-24">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="kb-kicker text-caramel">Our work</p>
            <h2 className="kb-display mt-3 text-4xl sm:text-5xl">Anjugu Peanut Butter</h2>
            <p className="mt-3 max-w-md text-espresso/65">A Kenyan brand with several branches, selling online with M-Pesa checkout, their own jars and their own prices.</p>
            <Go to="/shops" className="btn btn-ghost mt-6 px-5 py-3">
              Get a shop like this <ArrowRight className="h-4 w-4" />
            </Go>
          </div>
          <div className="relative pb-10 sm:pr-10">
            <div className="overflow-hidden rounded-[var(--r-lg)] bg-white shadow-[0_40px_80px_-40px_rgba(15,17,21,0.6)] ring-1 ring-espresso/10">
              <div className="flex items-center gap-2 bg-[#EEF1F6] px-4 py-2.5">
                <i className="h-3 w-3 rounded-full bg-[#CBD2DD]" />
                <i className="h-3 w-3 rounded-full bg-[#CBD2DD]" />
                <i className="h-3 w-3 rounded-full bg-[#CBD2DD]" />
                <span className="ml-3 flex-1 rounded-full bg-white px-3 py-0.5 text-xs text-espresso/55">anjugu.co.ke</span>
              </div>
              <img src="/brand/work-anjugu-desk.webp" alt="The Anjugu Peanut Butter website" loading="lazy" className="aspect-[16/10] w-full object-cover object-top" />
            </div>
            <div className="absolute -right-1 -bottom-4 w-[25%] overflow-hidden rounded-[1.5rem] border-[6px] border-[#050608] bg-[#050608] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)]">
              <img src="/brand/work-anjugu-shop-phone.webp" alt="The Anjugu shop on a phone" loading="lazy" className="aspect-[9/19] w-full rounded-[1rem] object-cover object-top" />
            </div>
          </div>
        </div>
      </section>

      <div className="container-x py-16 sm:py-24">
        <DemoRequest info={info} product="erp" />
      </div>

      {/* Careers & Recruitment Section */}
      <section id="careers" className="scroll-mt-6 bg-[#0A0B1E] py-16 text-cream sm:py-24">
        <div className="container-x">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#2357F5]/20 px-3 py-1 text-xs font-semibold text-[#9DB6FF] ring-1 ring-[#2357F5]/40">
                <Briefcase className="h-3.5 w-3.5" /> Kabuor Technologies Careers · We're Hiring
              </div>
              <h2 className="kb-display mt-4 text-4xl sm:text-5xl">
                Build the core infrastructure <br className="hidden sm:inline" />
                <span className="text-[#F2C14E]">powering East African commerce.</span>
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-cream/70 sm:text-lg">
                We are scaling our engineering, product, and commercial operations across Nairobi. Join our founding team with high autonomy, generous ESOP equity ownership, and mission-driven colleagues.
              </p>
            </div>
            <Link
              to="/careers"
              className="btn bg-[#2357F5] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#3A6BFF] inline-flex items-center gap-2 shrink-0"
            >
              View All 22 Open Roles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Confidential compensation & direct vetting notice banner */}
          <div className="mt-8 grid gap-4 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#2357F5]/20 text-[#9DB6FF]">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Undisclosed, Top-Tier Compensation</h4>
                <p className="mt-1 text-xs leading-relaxed text-cream/60">
                  Per executive hiring policy, compensation for all positions remains undisclosed publicly and is benchmarked to the top 10% of tech packages in Kenya + generous ESOP equity.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Direct Executive Vetting & Fast Interviews</h4>
                <p className="mt-1 text-xs leading-relaxed text-cream/60">
                  Applications route directly to the executive admin recruitment portal in Kabuor ERP. Shortlisted candidates are contacted within 48 hours to schedule video/in-person interviews.
                </p>
              </div>
            </div>
          </div>

          {/* Featured Roles Grid */}
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURED_ROLES.map((role) => (
              <div
                key={role.id}
                className="flex flex-col justify-between rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/10 transition hover:bg-white/[0.06] hover:ring-white/20"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-[#2357F5]/20 px-2.5 py-1 text-xs font-semibold text-[#9DB6FF]">
                      {role.dept}
                    </span>
                    <span className="text-[11px] font-medium text-cream/50 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {role.location}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-white">{role.title}</h3>
                  <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-300 ring-1 ring-emerald-500/20">
                      {role.compensation}
                    </span>
                    <span className="rounded bg-[#F2C14E]/10 px-2 py-0.5 font-medium text-[#F2C14E] ring-1 ring-[#F2C14E]/20">
                      {role.equity}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-cream/65">{role.summary}</p>
                </div>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <Link
                    to="/careers"
                    className="btn w-full bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-[#2357F5] transition inline-flex items-center justify-center gap-1.5"
                  >
                    Apply for this role <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Callout banner */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#172048] to-[#0D1228] p-6 ring-1 ring-white/15 sm:flex-row sm:p-8">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#2357F5] text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Don’t see your exact role?</h3>
                <p className="text-sm text-cream/70">
                  We have 22 open requisitions spanning Security, Compliance, UI/UX, Sales Engineers, and Technical Writers.
                </p>
              </div>
            </div>
            <Link
              to="/careers"
              className="btn bg-white px-5 py-3 text-xs font-bold text-espresso hover:bg-cream transition shrink-0 inline-flex items-center gap-1.5"
            >
              Explore All 22 Roles on Careers Portal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* who we are */}
      <section id="about" className="scroll-mt-6 py-16 sm:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="kb-kicker text-caramel">About us</p>
            <h2 className="kb-display mt-3 text-4xl sm:text-5xl">Kabuor Technologies Ltd.</h2>
            <p className="mt-2 text-sm font-semibold text-espresso/50">Parent holding & software engineering company</p>
          </div>
          <div className="space-y-4 text-lg leading-relaxed text-espresso/75">
            <p>
              <b className="text-espresso">Kabuor Technologies</b> (incorporation in progress as Kabuor Technologies Ltd) is built to power modern African business. Too much enterprise software is designed overseas—priced in dollars, alienated from M-Pesa, and too cumbersome for real counter operations.
            </p>
            <p>
              We engineer mission-critical systems ground-up for East Africa: starting from how Kenyan enterprises collect payments, comply with KRA eTIMS, and communicate with customers on WhatsApp and mobile phones.
            </p>
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-espresso/10">
              <h4 className="font-bold text-espresso">Our 3-Tier Brand Architecture:</h4>
              <ul className="mt-3 space-y-2.5 text-sm text-espresso/80">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#2357F5] shrink-0" />
                  <span><b className="text-espresso">Kabuor Technologies</b>: The parent technology company, corporate holding entity, and engineering core.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#3A2BC9] shrink-0" />
                  <span><b className="text-espresso">Kabuor Builds</b>: Web engineering studio, digital storefronts, and brand website platform (kabuor-builds.vercel.app).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#0F7A3D] shrink-0" />
                  <span><b className="text-espresso">Kabuor ERP</b>: Flagship multi-tenant commercial operating system, KRA eTIMS fiscalization, M-Pesa automated ledger, and POS till.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {phone && (
        <section className="container-x pb-16 sm:pb-24">
          <div className="grid gap-8 rounded-[var(--r-xl)] bg-beige p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="kb-kicker text-caramel">Talk to us</p>
              <h2 className="kb-display mt-3 text-4xl sm:text-5xl">Not sure where to start?</h2>
              <p className="mt-3 max-w-lg text-espresso/65">Tell us about your business. We’ll tell you honestly which product fits, or build it for you.</p>
            </div>
            <ContactButtons info={info} message={`Hi ${info.name}, I'd like to talk about my business.`} className="lg:flex-col" />
          </div>
        </section>
      )}

      <SiteFooter info={info} />
    </>
  );
}
