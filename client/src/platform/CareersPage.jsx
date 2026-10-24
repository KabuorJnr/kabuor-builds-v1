import { useState, useId } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  DollarSign,
  GraduationCap,
  HeartHandshake,
  Laptop,
  Lock,
  MapPin,
  Megaphone,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { SiteHeader, SiteFooter } from './Site';

export const ALL_ROLES = [
  {
    id: 'chief-of-staff',
    title: 'Chief of Staff / Head of Strategic Operations',
    department: 'Leadership',
    location: 'Ngong Road, Nairobi · Fully Remote',
    type: 'Full-Time',
    compensationNote: 'Pre-Funding: Founding Equity (Salaried Upon Funding)',
    equity: 'Generous Founding ESOP Equity Grant',
    tags: ['Executive', 'Operations', 'Strategy', 'Expansion', 'Fundraising'],
    summary:
      'Partner directly with the Founder & CEO to drive company-wide operational velocity, board reporting, cross-functional OKRs, and strategic market expansion across East Africa.',
    responsibilities: [
      'Lead strategic operational initiatives spanning commercial partnerships, recruitment sprints, and Series A investor relations.',
      'Establish rigorous operating cadence across Engineering, Growth, and Customer Success pods.',
      'Unblock executive bottlenecks and represent executive leadership in strategic trade dialogues.',
    ],
    requirements: [
      '5+ years in high-growth tech startups, top-tier management consulting, or venture capital in Africa.',
      'Uncanny ability to translate ambiguous strategic goals into crisp operational execution.',
    ],
    benefitsNote: 'Direct founder mentorship + Founding ESOP Stake + Executive Salaried Package post-funding.',
  },
  {
    id: 'vp-engineering',
    title: 'VP of Engineering & Core Architecture',
    department: 'Leadership',
    location: 'Ngong Road, Nairobi · Fully Remote',
    type: 'Full-Time',
    compensationNote: 'Pre-Funding: Founding Equity (Salaried Upon Funding)',
    equity: 'Significant Executive ESOP Stake',
    tags: ['C# .NET 10', 'Distributed Systems', 'Architecture', 'Team Leadership'],
    summary:
      'Lead our engineering organization. Set architectural direction across backend transaction processing, offline edge runtimes, security posture, and high-velocity developer ergonomics.',
    responsibilities: [
      'Lead and grow high-caliber engineering pods across platform, frontend edge, and tax compliance.',
      'Maintain 99.99% availability for 500,000+ daily financial transactions across Kenya.',
      'Drive engineering excellence, automated testing standards, and zero-allocation memory profiling.',
    ],
    requirements: [
      '8+ years building enterprise SaaS or high-throughput financial infrastructure.',
      'Proven track record leading engineering teams of 15+ engineers in fast-paced environments.',
    ],
    benefitsNote: 'Significant Executive ESOP Stake + Core Architecture Ownership + Executive Salaried Package post-funding.',
  },
  {
    id: 'lead-platform-architect',
    title: 'Lead Platform Architect (.NET 10 / Cloud)',
    department: 'Engineering',
    location: 'Ngong Road, Nairobi · Fully Remote',
    type: 'Full-Time',
    compensationNote: 'Pre-Funding: Founding Equity (Salaried Upon Funding)',
    equity: '0.50% – 1.00% ESOP',
    tags: ['.NET 10', 'C#', 'SequenceGate', 'PostgreSQL', 'High-Throughput'],
    summary:
      'Own the core distributed transaction backbone of Kabuor ERP. Scale our SequenceGate concurrency engine, real-time M-Pesa ledger pipelines, and zero-loss event streaming to handle 500k+ transactions per day.',
    responsibilities: [
      'Architect and profile low-allocation C# .NET 10 backend services powering multi-tenant ERP operations.',
      'Scale the SequenceGate transactional engine to guarantee linearizable ledger commits across thousands of checkout counters.',
      'Design fault-tolerant event streams interfacing with Safaricom Daraja M-Pesa APIs and KRA eTIMS daemons.',
    ],
    requirements: [
      '6+ years architecting high-throughput, low-latency distributed systems (C#/.NET, Go, or Rust).',
      'Deep mastery of relational databases (PostgreSQL/SQL Server), transactional isolation levels, and row locking.',
    ],
    benefitsNote: 'Core Distributed Systems Leadership + Generous ESOP Stake + Salaried Package post-funding.',
  },
  {
    id: 'senior-edge-frontend-engineer',
    title: 'Senior Edge & Frontend Systems Engineer (React 19 / Offline PWA)',
    department: 'Engineering',
    location: 'Ngong Road, Nairobi · Fully Remote',
    type: 'Full-Time',
    compensationNote: 'Pre-Funding: Founding Equity (Salaried Upon Funding)',
    equity: '0.35% – 0.75% ESOP',
    tags: ['React 19', 'TypeScript', 'Offline PWA', 'IndexedDB', 'Tailwind'],
    summary:
      'Lead our mission to make business software instant and indestructible. Build the client runtime that keeps Kenyan wholesale storefronts, supermarkets, and field vans running smoothly even when the cellular network drops completely.',
    responsibilities: [
      'Evolve our client-side offline engine using IndexedDB, Web Workers, and multi-tab synchronization.',
      'Craft lightning-fast, zero-friction POS and ERP workflows optimized for desktop browsers, touch tablets, and mobile devices.',
    ],
    requirements: [
      '4+ years building production web applications in modern React, TypeScript, and modern CSS.',
      'Hands-on expertise with Progressive Web Apps (PWA), Service Workers, CacheStorage, and offline sync.',
    ],
    benefitsNote: '100% Fully Remote + Offline PWA Runtime Ownership + ESOP Equity Grant + Salaried post-funding.',
  },
  {
    id: 'head-of-tax-compliance-etims',
    title: 'Head of Tax Compliance & eTIMS Architecture',
    department: 'Engineering',
    location: 'Ngong Road, Nairobi · Fully Remote',
    type: 'Full-Time',
    compensationNote: 'Pre-Funding: Founding Equity (Salaried Upon Funding)',
    equity: '0.40% – 0.80% ESOP',
    tags: ['KRA eTIMS', 'VSCU/OSCU', 'Tax Procedures Act', 'Cryptography', 'FinTech'],
    summary:
      'Lead the technological bridge between 1.5 million Kenyan businesses and the Kenya Revenue Authority. You will own our native eTIMS transmission infrastructure, cryptographic invoice signing, and regulatory compliance roadmap.',
    responsibilities: [
      'Own the direct technical integration with KRA eTIMS VSCU/OSCU REST endpoints and cryptographic signing pipelines.',
      'Ensure 100% compliance with the Kenyan Tax Procedures Act, VAT regulations, and withholding tax mandates.',
    ],
    requirements: [
      'Proven track record implementing or integrating eTIMS, TIMS, or fiscal device middleware in Kenya.',
      'Strong technical background in cryptography (digital signatures, RSA/ECDSA, QR code payloads, PKI).',
    ],
    benefitsNote: 'Direct regulatory architecture leadership + Generous ESOP Stake + Salaried post-funding.',
  },
  {
    id: 'head-of-growth-marketing',
    title: 'Head of Growth & Performance Marketing',
    department: 'Marketing & Growth',
    location: 'Ngong Road, Nairobi · Fully Remote',
    type: 'Full-Time',
    compensationNote: 'Pre-Funding: Founding Equity (Salaried Upon Funding)',
    equity: 'Meaningful Founding ESOP Stake',
    tags: ['Performance Marketing', 'B2B SaaS', 'Accountant Network', 'SEO/SEM', 'CAC/LTV'],
    summary:
      'Own top-of-funnel customer acquisition and merchant expansion across Kenya. Build our automated acquisition engine across digital channels, partner accountant networks, and referral loops to acquire 5,000+ paying businesses.',
    responsibilities: [
      'Scale profitable paid customer acquisition across Google Search, Meta Ads, and LinkedIn targeting Kenyan business owners.',
      'Design high-converting landing pages, interactive ROI/tax savings calculators, and customer onboarding funnels.',
    ],
    requirements: [
      '4+ years driving measurable growth at a high-velocity B2B SaaS, FinTech, or fast-growing startup in East Africa.',
      'Demonstrated track record managing 7-figure marketing budgets with strict CAC and payback constraints.',
    ],
    benefitsNote: 'Meaningful Founding ESOP Stake + Salaried post-funding + Uncapped revenue share upon funding.',
  },
  {
    id: 'field-trade-corridor-marketing-lead',
    title: 'Trade Corridor & Field Marketing Lead',
    department: 'Marketing & Growth',
    location: 'Nairobi, Kenya (Trade Corridors / Field & Remote)',
    type: 'Full-Time',
    compensationNote: 'Pre-Funding: Founding Equity (Salaried Upon Funding)',
    equity: 'Meaningful Founding ESOP Stake',
    tags: ['Field Activation', 'Merchant Corridors', 'Trade Associations', 'Gikomba', 'Eastleigh'],
    summary:
      'Take Kabuor ERP straight into Kenya’s most lucrative commercial hubs. You will lead ground activations in Gikomba, Eastleigh, Industrial Area, and River Road, driving wholesale adoption through merchant association partnerships and live demo days.',
    responsibilities: [
      'Build grassroots merchant community presence in key commercial trade hubs across Nairobi and neighboring counties.',
      'Partner with business welfare groups, SACCOs, and trade associations (KAM, KNCCI, Chamber of Commerce).',
    ],
    requirements: [
      '3+ years of field marketing, FMCG route-to-market, or merchant acquisition leadership in urban Kenyan hubs.',
    ],
    benefitsNote: 'Grassroots commercial corridor leadership + Founding ESOP Stake + Full mobility support post-funding.',
  },
  {
    id: 'content-and-brand-lead',
    title: 'Content, Social & Brand Marketing Lead',
    department: 'Marketing & Growth',
    location: 'Ngong Road, Nairobi · Fully Remote',
    type: 'Full-Time',
    compensationNote: 'Pre-Funding: Founding Equity (Salaried Upon Funding)',
    equity: 'Meaningful Founding ESOP Stake',
    tags: ['Video Storytelling', 'LinkedIn Thought Leadership', 'SME Case Studies', 'TikTok/YouTube'],
    summary:
      'Tell the story of African commerce through the lens of the ambitious business builders who run it. You will create documentary-style customer case studies, founder video content, tax masterclasses, and viral social campaigns.',
    responsibilities: [
      'Produce short-form and long-form video case studies spotlighting Kenyan manufacturers, distributors, and retailers.',
      'Ghostwrite founder thought leadership essays and breakdown threads on Kenyan economic data, eTIMS, and commerce tech.',
    ],
    requirements: [
      '3+ years creating high-engagement content for high-growth tech brands, agencies, or business media.',
    ],
    benefitsNote: 'Creative freedom & voice of the brand + Founding ESOP Stake + Production kit post-funding.',
  },
  {
    id: 'strategic-partner-accountant-lead',
    title: 'Strategic Partner & Accountant Affiliate Lead',
    department: 'Marketing & Growth',
    location: 'Ngong Road, Nairobi · Fully Remote',
    type: 'Full-Time',
    compensationNote: 'Pre-Funding: Founding Equity (Salaried Upon Funding)',
    equity: 'Meaningful Founding ESOP Stake + Future Revenue Share',
    tags: ['ICPAK Network', 'Accountants', 'Audit Firms', 'Affiliate Programs', 'B2B Sales'],
    summary:
      'Empower Kenya’s Certified Public Accountants (CPAs) and audit firms. Build our nationwide Accountant Partner Network where practicing accountants manage their SME clients on Kabuor ERP while earning recurring referral commissions.',
    responsibilities: [
      'Recruit, certify, and enable independent accountants and audit consultancies across Kenya onto the Kabuor Partner Portal.',
      'Conduct hands-on CPD-accredited training webinars on automated eTIMS filing and real-time bank reconciliation.',
    ],
    requirements: [
      '3+ years in B2B channel sales, accounting software consultancy, or corporate banking relationship management.',
    ],
    benefitsNote: 'Founding ESOP Stake + Recurring Partner Affiliate Model + Salaried post-funding.',
  },
  {
    id: 'head-of-enterprise-sales',
    title: 'Head of Direct Enterprise Sales',
    department: 'Sales & Commercial',
    location: 'Ngong Road, Nairobi · Fully Remote',
    type: 'Full-Time',
    compensationNote: 'Pre-Funding: Founding Equity (Salaried Upon Funding)',
    equity: 'Meaningful Founding ESOP Stake',
    tags: ['Enterprise Sales', 'B2B Wholesalers', 'Distributors', 'Contract Negotiation'],
    summary:
      'Drive high-value enterprise contracts with mid-market distributors, multi-branch supermarket chains, and FMCG manufacturers across Kenya.',
    responsibilities: [
      'Target, pitch, and close enterprise deals with decision-makers (Managing Directors, CFOs, Operations Directors).',
      'Manage sales pipeline from discovery demo to signed contract, achieving ambitious quarterly revenue quotas.',
    ],
    requirements: [
      '5+ years enterprise software or corporate technology sales experience in East Africa with documented quota achievement.',
    ],
    benefitsNote: 'Founding ESOP Stake + Executive commission structure & salary post-funding.',
  },
  {
    id: 'head-of-merchant-success',
    title: 'Head of Merchant Success & Enterprise Onboarding',
    department: 'Operations & Success',
    location: 'Ngong Road, Nairobi · Fully Remote',
    type: 'Full-Time',
    compensationNote: 'Pre-Funding: Founding Equity (Salaried Upon Funding)',
    equity: '0.25% – 0.50% ESOP',
    tags: ['Customer Success', 'Zero Churn', 'ERP Onboarding', 'Data Migration', 'NPS'],
    summary:
      'Guarantee that every business transitioning to Kabuor ERP experiences flawless onboarding and lifetime value. Lead our solutions engineering, historical data migration, and proactive merchant support operations.',
    responsibilities: [
      'Design white-glove onboarding programs for supermarkets, pharmacies, manufacturers, and multi-branch retailers.',
      'Supervise rapid historical data migration into Kabuor ERP.',
    ],
    requirements: [
      '4+ years leading Customer Success, Implementation, or Solutions Engineering in B2B software in Africa.',
    ],
    benefitsNote: 'Founding ESOP Stake + Direct solutions architecture leadership + Salaried post-funding.',
  },
  {
    id: 'finance-director-controller',
    title: 'Finance Director / Controller (CPA-K)',
    department: 'Finance, Legal & People',
    location: 'Ngong Road, Nairobi · Fully Remote',
    type: 'Full-Time',
    compensationNote: 'Pre-Funding: Founding Equity (Salaried Upon Funding)',
    equity: 'Meaningful Executive ESOP Stake',
    tags: ['CPA-K', 'Financial Controller', 'KRA Compliance', 'Audit', 'Treasury'],
    summary:
      'Lead our corporate financial management. Own statutory compliance, management accounts, audit readiness, and treasury management as Kabuor ERP scales its revenue.',
    responsibilities: [
      'Oversee monthly management accounts, balance sheet reconciliations, and payroll statutory filings.',
      'Manage corporate tax planning and direct liaisons with Kenya Revenue Authority (KRA).',
    ],
    requirements: [
      '6+ years in corporate financial management, with active ICPAK (CPA-K) or ACCA membership.',
    ],
    benefitsNote: 'Founding Executive ESOP Stake + Corporate governance leadership + Salaried post-funding.',
  },
  {
    id: 'young-builders-fellowship',
    title: 'Young African Builder Fellow (Engineering, Product & Design)',
    department: 'Young Builders & Volunteers',
    location: 'Ngong Road, Nairobi · Fully Remote',
    type: 'Fellowship / Early-Career',
    compensationNote: 'Pre-Funding: Volunteer / Fellow Track · Equity & Mentorship (Salaried post-funding)',
    equity: 'Fellowship Completion Grant & Full-Time Priority',
    tags: ['Young Builders', 'Students', 'Self-Taught', 'React', 'C# .NET', 'Product'],
    summary:
      'A hands-on fellowship for hungry, high-potential young Africans (students, fresh graduates, and self-taught tinkerers). Work directly alongside our core architects on real production code that powers Kenyan commerce.',
    responsibilities: [
      'Pair-program with senior engineers building C# .NET 10 microservices, React 19 offline PWAs, and merchant analytics.',
      'Ship weekly improvements to real business tools used by wholesale merchants across Kenya.',
      'Participate in architecture reviews, code profiling, and technical deep-dives.',
    ],
    requirements: [
      'No formal degree or university credentials required. We evaluate raw curiosity, coding speed, and passion.',
      'A demonstrable portfolio of side projects, GitHub repositories, or tools you built because you cared.',
    ],
    benefitsNote: '1-on-1 Founder & Architect Mentorship + Real Production Experience + Founding Equity Grant + Fast-track to Salaried Engineering post-funding.',
  },
  {
    id: 'open-source-volunteer-contributor',
    title: 'Open-Source & African Software Volunteer Contributor',
    department: 'Young Builders & Volunteers',
    location: 'Pan-Africa & Global · 100% Remote',
    type: 'Volunteer / Open Contributor',
    compensationNote: 'Volunteer Track (Flexible Hours & Contributor Equity)',
    equity: 'Public Contributor Attribution & Swag',
    tags: ['Open Source', 'Community', 'Localization', 'Docs', 'APIs', 'Volunteer'],
    summary:
      'Contribute your passion and skills on your own schedule. Help us build open-source tools, developer documentation, African language translations (Kiswahili & vernaculars), and merchant helper libraries.',
    responsibilities: [
      'Contribute to open repositories, SDKs, merchant integration guides, and developer docs.',
      'Help translate, localize, and test offline workflows for various regional dialects and merchant personas.',
      'Report edge cases, write integration tests, and collaborate in our open builder forums.',
    ],
    requirements: [
      'Passion for advancing homegrown African software and empowering local small businesses.',
      'Open to developers, technical writers, UX designers, and students of all experience levels.',
    ],
    benefitsNote: 'Official Contributor Recognition on our platform + Direct Slack/Discord access to the engineering team + Reference letters & hackathon invitations.',
  },
  {
    id: 'campus-builder-lead',
    title: 'Campus & Student Tech Community Lead',
    department: 'Young Builders & Volunteers',
    location: 'Kenyan Universities & Colleges · Remote & Campus',
    type: 'Volunteer / Community',
    compensationNote: 'Volunteer Community Track · Builder Recognition & Event Support',
    equity: 'Builder Certificate & Priority Hiring',
    tags: ['Campus', 'Youth Community', 'Hackathons', 'Student Builder'],
    summary:
      'Lead the young builder movement at your campus. Organize tech demo days, developer sessions around eTIMS, M-Pesa APIs, and offline web tech, connecting talented classmates to real-world software opportunities.',
    responsibilities: [
      'Champion homegrown African software and modern engineering practices across your campus tech club or student guild.',
      'Host hands-on demo sessions showcasing how to build offline-first apps and integrate local APIs.',
      'Identify top student talent and recommend peers for our engineering fellowships.',
    ],
    requirements: [
      'Current student at a Kenyan or East African university/college with an active role in tech communities.',
      'Strong communication, empathy, and high enthusiasm for building African technology.',
    ],
    benefitsNote: 'Campus leadership credential + Event builder support + Executive mentorship + Fast-track fellowship pipeline.',
  },
];

const PERKS = [
  {
    icon: Rocket,
    title: 'Generous Founding ESOP Ownership',
    description: 'We reward early conviction with meaningful stock option grants with formal 4-year vesting. You own real equity in the company upside from day one.',
  },
  {
    icon: ShieldCheck,
    title: 'Post-Funding Salary & Medical Guarantee',
    description: 'We are currently pre-funding and bootstrapping. All founding roles have contractual market-competitive salaries and tier-1 health cover locked in upon closing our funding round.',
  },
  {
    icon: Laptop,
    title: '100% Fully Remote & High Autonomy',
    description: 'Headquartered along Ngong Road, Nairobi, we operate 100% remote. Work on your schedule with zero micromanagement, focused purely on shipped merchant impact.',
  },
  {
    icon: Zap,
    title: 'Real Production Systems Ownership',
    description: 'No busywork or toy apps. You architect and deploy low-allocation C# .NET 10 microservices and offline React 19 PWAs moving real transactions for Kenyan businesses.',
  },
  {
    icon: GraduationCap,
    title: 'Founder & Senior Architect Mentorship',
    description: 'Direct pairing with experienced founders and engineers who have built and scaled high-throughput financial infrastructure across East Africa.',
  },
  {
    icon: HeartHandshake,
    title: 'Flexible Leave & Collaborative Culture',
    description: 'High-trust environment with flexible time off, asynchronous engineering workflows, and deep commitment to work-life sustainability.',
  },
];

export default function CareersPage({ info }) {
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRole, setExpandedRole] = useState(null);
  const [applyingRole, setApplyingRole] = useState(null);

  const [applicant, setApplicant] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedIn: '',
    portfolio: '',
    experienceYears: '3-5 years',
    coverNote: '',
  });
  const [submittedRef, setSubmittedRef] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const departments = ['All', 'Young Builders & Volunteers', 'Engineering', 'Leadership', 'Marketing & Growth', 'Sales & Commercial', 'Operations & Success', 'Finance, Legal & People'];

  const filteredRoles = ALL_ROLES.filter((role) => {
    const matchesDept = selectedDept === 'All' || role.department === selectedDept;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      role.title.toLowerCase().includes(query) ||
      role.tags.some((t) => t.toLowerCase().includes(query)) ||
      role.summary.toLowerCase().includes(query);
    return matchesDept && matchesSearch;
  });

  const handleApply = (role) => {
    setApplyingRole(role);
    setSubmittedRef(null);
  };

  const submitApplication = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedRef(`KBR-APP-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 500);
  };

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const linkedInId = useId();
  const portfolioId = useId();
  const expId = useId();
  const noteId = useId();

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-[#1E1B18] font-sans selection:bg-[#2357F5] selection:text-white">
      <div className="bg-[#0A0B1E]">
        <SiteHeader info={info} cta={{ to: '/#contact', label: 'Contact Team' }} />
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#0A0B1E] py-20 text-white lg:py-28">
        <div className="pointer-events-none absolute -top-40 -right-40 h-[36rem] w-[36rem] rounded-full bg-[#2357F5]/25 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-[#3A2BC9]/35 blur-[120px]" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>KABUOR TECHNOLOGIES · NGONG ROAD, NAIROBI · 100% FULLY REMOTE</span>
          </div>

          <h1 className="mt-8 font-serif text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.08]">
            Build the Financial Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2C14E] via-white to-[#9DB6FF]">African Commerce.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-white/80 leading-relaxed sm:text-xl">
            Over 1.5 million Kenyan merchants power East Africa on M-Pesa, paper dockets, and sheer resilience. We are engineering the automated platform that handles instant KRA eTIMS, offline retail point-of-sale, and real-time cashflow reconciliation at a scale of 500,000 transactions a day.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="#open-roles" className="btn bg-[#2357F5] text-white hover:bg-[#3A6BFF] py-3.5 px-7 text-base shadow-lg shadow-[#2357F5]/25">
              Explore Open Roles ({ALL_ROLES.length}) <Briefcase className="h-5 w-5 ml-2" />
            </a>
            <a href="#young-builders" className="btn bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30 hover:bg-emerald-500/30 py-3.5 px-6 text-base">
              Young Builders & Volunteers <Sparkles className="h-4 w-4 ml-2" />
            </a>
            <a href="#why-kabuor" className="btn bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20 py-3.5 px-6 text-base">
              Why Join Us <ChevronDown className="h-4 w-4 ml-1" />
            </a>
          </div>

          {/* Scale Proof Metrics */}
          <div className="mt-16 grid grid-cols-2 gap-4 border-t border-white/10 pt-12 sm:grid-cols-4 text-left">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-3xl font-bold text-[#F2C14E]">500,000+</p>
              <p className="mt-1 text-xs text-white/60">Load-tested daily transactions</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-3xl font-bold text-emerald-400">100%</p>
              <p className="mt-1 text-xs text-white/60">Offline-first PWA resilience</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-3xl font-bold text-[#9DB6FF]">0 Seconds</p>
              <p className="mt-1 text-xs text-white/60">eTIMS & M-Pesa auto-reconcile</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-3xl font-bold text-white">100% ESOP</p>
              <p className="mt-1 text-xs text-white/60">Equity for all full-time hires</p>
            </div>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section id="why-kabuor" className="py-20 border-b border-[#E6E7F0] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-xs font-bold tracking-wider text-[#2357F5] uppercase">Company Culture & Principles</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#1E1B18]">
              We build for the real trenches of commerce.
            </p>
            <p className="mt-3 text-base text-[#585C80] leading-relaxed">
              Our software doesn't run in air-conditioned ivory towers. It powers wholesale warehouses in Industrial Area, retail storefronts in Eastleigh and Gikomba, and distributor fleets across Kenya.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#E6E7F0] bg-[#FDFCF7] p-6 hover:shadow-md transition">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#E8EEFF] text-[#2357F5]">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#1E1B18]">Zero Tolerance for Slowness</h3>
              <p className="mt-2 text-sm text-[#585C80] leading-relaxed">
                When a cashier in a supermarket has 15 customers queuing with groceries, every millisecond matters. We optimize down to zero-allocation memory pools in C# and client-side caching.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E6E7F0] bg-[#FDFCF7] p-6 hover:shadow-md transition">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#1E1B18]">Massive Economic Impact</h3>
              <p className="mt-2 text-sm text-[#585C80] leading-relaxed">
                MSMEs contribute over 40% of Kenya’s GDP. Giving them automated financial controls and instant tax compliance fundamentally protects their business livelihoods.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E6E7F0] bg-[#FDFCF7] p-6 hover:shadow-md transition">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#FFF4E0] text-[#A15C00]">
                <Rocket className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#1E1B18]">Extreme Ownership & Equity</h3>
              <p className="mt-2 text-sm text-[#585C80] leading-relaxed">
                You won't be a cog in an 8-layer approval chain. You will own complete functional domains, deploy weekly, and share directly in company ownership through our formal ESOP equity program.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-20 bg-[#F7F7FB] border-b border-[#E6E7F0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold tracking-wider text-[#2357F5] uppercase">Pre-Funding Commitment & Rewards</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#1E1B18]">
              Equity today, market compensation upon funding.
            </p>
            <p className="mt-3 text-base text-[#585C80]">
              We are transparent with our team: we are currently bootstrapping and pre-funding. We offer generous founding ESOP equity for builders and volunteers joining now, with pre-agreed competitive cash salaries activating immediately upon closing our funding round.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map((perk) => (
              <div key={perk.title} className="rounded-xl border border-[#E6E7F0] bg-white p-6 flex flex-col justify-between">
                <div>
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#E8EEFF] text-[#2357F5] mb-4">
                    <perk.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#1E1B18]">{perk.title}</h3>
                  <p className="mt-2 text-sm text-[#585C80] leading-relaxed">{perk.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Young Builders & Volunteers Fellowship Callout */}
      <section id="young-builders" className="py-16 bg-gradient-to-b from-[#0A0B1E] to-[#121432] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:p-12 lg:p-16 backdrop-blur-sm">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                  <Sparkles className="h-3.5 w-3.5" /> For Students, Self-Taught Hackers & Volunteers
                </div>
                <h2 className="mt-4 font-serif text-3xl font-extrabold sm:text-4xl lg:text-5xl leading-tight">
                  You don’t need 10 years of experience to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2C14E] to-[#9DB6FF]">build Africa’s future.</span>
                </h2>
                <p className="mt-4 text-base text-white/80 leading-relaxed sm:text-lg">
                  We are deeply committed to mentoring the next generation of African builders. If you are a young programmer, university student, or volunteer hungry to write real production code that solves real problems for Kenyan merchants, we want to build with you.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setSelectedDept('Young Builders & Volunteers');
                      document.getElementById('open-roles')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn bg-[#2357F5] text-white hover:bg-[#3A6BFF] px-6 py-3.5 text-sm font-semibold shadow-lg shadow-[#2357F5]/30 inline-flex items-center gap-2"
                  >
                    View Young Builder & Volunteer Tracks <ArrowRight className="h-4 w-4" />
                  </button>
                  <a
                    href="mailto:careers@kabuor.com?subject=Young%20Builder%20%2F%20Volunteer%20Inquiry%20-%20Kabuor%20Technologies"
                    className="btn bg-white/10 text-white hover:bg-white/20 px-6 py-3.5 text-sm font-semibold ring-1 ring-white/15"
                  >
                    Pitch Your Project / Volunteer Directly
                  </a>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2357F5]/20 text-[#9DB6FF]">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">Real Production Code</h3>
                  <p className="mt-2 text-xs text-white/70 leading-relaxed">
                    No coffee runs or toy apps. You will build high-throughput C# backends, offline React PWAs, and local payment rails from day one.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">Direct Mentorship</h3>
                  <p className="mt-2 text-xs text-white/70 leading-relaxed">
                    Pair directly with core architects and founders who have scaled financial systems and high-growth African startups.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F2C14E]/20 text-[#F2C14E]">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">No Degree Barrier</h3>
                  <p className="mt-2 text-xs text-white/70 leading-relaxed">
                    We care about your passion, curiosity, and speed of learning. Self-taught tinkerers and student developers are warmly welcome.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/20 text-purple-300">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">Full-Time Pathway</h3>
                  <p className="mt-2 text-xs text-white/70 leading-relaxed">
                    Top-performing fellows and open contributors graduate into full-time engineering and product positions with equity ownership.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Roles Directory */}
      <section id="open-roles" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-[#E6E7F0]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#2357F5] uppercase">
                <Briefcase className="h-4 w-4" /> Open Opportunities Across Company
              </div>
              <h2 className="mt-2 text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#1E1B18]">
                Open Positions ({filteredRoles.length})
              </h2>
              <p className="mt-1 text-sm text-[#585C80]">
                Explore open roles and volunteer tracks. All founding positions include generous ESOP equity with pre-agreed market salaries upon funding.
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8A8DB0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roles or skills..."
                className="w-full rounded-md border border-[#E6E7F0] bg-white px-3 py-2 pl-9 text-sm focus:border-[#2357F5] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition border ${
                  selectedDept === dept
                    ? 'bg-[#0A0B1E] text-white border-[#0A0B1E] shadow-sm'
                    : 'bg-[#F7F7FB] text-[#3B3F5C] border-[#E6E7F0] hover:bg-white'
                }`}
              >
                {dept}
                {dept === 'All' ? ` (${ALL_ROLES.length})` : ` (${ALL_ROLES.filter((r) => r.department === dept).length})`}
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {filteredRoles.map((role) => {
              const isExpanded = expandedRole === role.id;
              return (
                <div
                  key={role.id}
                  className={`rounded-xl border transition overflow-hidden ${
                    isExpanded ? 'border-[#2357F5] ring-1 ring-[#2357F5]' : 'border-[#E6E7F0] hover:border-[#8A8DB0]'
                  }`}
                >
                  <div className="p-6 cursor-pointer bg-white" onClick={() => setExpandedRole(isExpanded ? null : role.id)}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="rounded bg-[#E8EEFF] px-2 py-0.5 text-xs font-semibold text-[#2357F5]">
                            {role.department}
                          </span>
                          <span className="rounded bg-[#F7F7FB] px-2 py-0.5 text-xs font-medium text-[#3B3F5C] border border-[#E6E7F0]">
                            {role.type}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-[#585C80]">
                            <MapPin className="h-3.5 w-3.5 text-[#8A8DB0]" /> {role.location}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-[#1E1B18] hover:text-[#2357F5] transition">
                          {role.title}
                        </h3>
                        <p className="mt-2 text-sm text-[#585C80] line-clamp-2 leading-relaxed">
                          {role.summary}
                        </p>
                      </div>

                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E6E7F0]">
                        <div className="text-left lg:text-right">
                          <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E1B18] bg-[#F7F7FB] px-2.5 py-1 rounded-full border border-[#E6E7F0]">
                            <Lock className="h-3 w-3 text-[#8A8DB0]" />
                            <span>Founding Equity (ESOP) · Salaried Post-Funding</span>
                          </p>
                          <p className="mt-1 text-xs font-semibold text-emerald-600">{role.equity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(role);
                            }}
                            className="btn bg-[#2357F5] text-white hover:bg-[#3A6BFF] py-2 px-4 text-xs font-semibold"
                          >
                            Apply Now
                          </button>
                          <button
                            type="button"
                            aria-label="Toggle details"
                            className="grid h-8 w-8 place-items-center rounded-md bg-[#F7F7FB] text-[#585C80] border border-[#E6E7F0]"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {role.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-[#F7F7FB] px-2.5 py-0.5 text-xs text-[#3B3F5C] font-medium border border-[#E6E7F0]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-[#E6E7F0] bg-[#FAF9F5] p-6 sm:p-8 space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">The Mission</h4>
                        <p className="mt-2 text-sm text-[#3B3F5C] leading-relaxed">{role.summary}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">Key Responsibilities</h4>
                        <ul className="mt-3 space-y-2">
                          {role.responsibilities.map((resp, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-[#3B3F5C] leading-relaxed">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2357F5]" />
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg bg-[#E8EEFF]/60 p-4 border border-[#2357F5]/20 flex items-start gap-3">
                        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#2357F5]" />
                        <div className="text-xs sm:text-sm text-[#1E1B18] leading-relaxed">
                          <span className="font-bold text-[#2357F5]">Pre-Funding Founding Track:</span> All positions operate on generous founding ESOP equity grants until our funding round closes, with pre-agreed market salaries activating upon funding. {role.benefitsNote}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-[#585C80]">
                          Role ID: <code className="text-[#1E1B18] font-semibold">{role.id}</code>
                        </p>
                        <button
                          type="button"
                          onClick={() => handleApply(role)}
                          className="btn bg-[#2357F5] text-white hover:bg-[#3A6BFF] py-2.5 px-6 text-sm font-semibold"
                        >
                          Apply for {role.title} <ArrowRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Application Modal */}
      {applyingRole && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-[#E6E7F0] my-8">
            <button
              onClick={() => setApplyingRole(null)}
              className="absolute top-5 right-5 grid h-8 w-8 place-items-center rounded-full text-[#585C80] hover:bg-[#F7F7FB]"
            >
              <X className="h-5 w-5" />
            </button>

            {submittedRef ? (
              <div className="text-center py-6">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-[#1E1B18]">Application Received!</h3>
                <p className="mt-2 text-sm text-[#585C80]">
                  Thank you, <b className="text-[#1E1B18]">{applicant.fullName}</b>. Your application for <b className="text-[#1E1B18]">{applyingRole.title}</b> is logged with the Kabuor Technologies talent desk.
                </p>
                <div className="mt-6 rounded-lg bg-[#F7F7FB] p-4 text-xs text-[#585C80] text-left border border-[#E6E7F0] space-y-1">
                  <p><b>Candidate:</b> {applicant.fullName}</p>
                  <p><b>Role:</b> {applyingRole.title}</p>
                  <p><b>Tracking Ref:</b> <code className="font-bold text-[#1E1B18]">{submittedRef}</code></p>
                  <p><b>Company:</b> Kabuor Technologies Ltd</p>
                  <p><b>Talent Desk:</b> careers@kabuor.com</p>
                </div>

                <button
                  type="button"
                  onClick={() => setApplyingRole(null)}
                  className="btn bg-[#2357F5] text-white hover:bg-[#3A6BFF] mt-6 w-full py-3 text-sm font-semibold"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <span className="rounded bg-[#E8EEFF] px-2.5 py-1 text-xs font-semibold text-[#2357F5]">
                    {applyingRole.department}
                  </span>
                  <h3 className="mt-2 text-2xl font-bold text-[#1E1B18]">
                    Apply for {applyingRole.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#585C80]">
                    {applyingRole.location} · Compensation: Pre-Funding ESOP Equity (Salaried Upon Funding)
                  </p>
                </div>

                <form onSubmit={submitApplication} className="space-y-4">
                  <div>
                    <label htmlFor={nameId} className="block text-xs font-semibold text-[#3B3F5C] mb-1">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={nameId}
                      required
                      type="text"
                      className="w-full rounded-md border border-[#E6E7F0] px-3 py-2 text-sm focus:border-[#2357F5] focus:outline-none"
                      placeholder="e.g. Achieng Ochieng"
                      value={applicant.fullName}
                      onChange={(e) => setApplicant({ ...applicant, fullName: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor={emailId} className="block text-xs font-semibold text-[#3B3F5C] mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={emailId}
                        required
                        type="email"
                        className="w-full rounded-md border border-[#E6E7F0] px-3 py-2 text-sm focus:border-[#2357F5] focus:outline-none"
                        placeholder="you@domain.com"
                        value={applicant.email}
                        onChange={(e) => setApplicant({ ...applicant, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor={phoneId} className="block text-xs font-semibold text-[#3B3F5C] mb-1">
                        Phone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={phoneId}
                        required
                        type="tel"
                        className="w-full rounded-md border border-[#E6E7F0] px-3 py-2 text-sm focus:border-[#2357F5] focus:outline-none"
                        placeholder="0712 345 678"
                        value={applicant.phone}
                        onChange={(e) => setApplicant({ ...applicant, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor={linkedInId} className="block text-xs font-semibold text-[#3B3F5C] mb-1">
                        LinkedIn Profile URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={linkedInId}
                        required
                        type="url"
                        className="w-full rounded-md border border-[#E6E7F0] px-3 py-2 text-sm focus:border-[#2357F5] focus:outline-none"
                        placeholder="https://linkedin.com/in/username"
                        value={applicant.linkedIn}
                        onChange={(e) => setApplicant({ ...applicant, linkedIn: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor={portfolioId} className="block text-xs font-semibold text-[#3B3F5C] mb-1">
                        GitHub / Portfolio / Website
                      </label>
                      <input
                        id={portfolioId}
                        type="url"
                        className="w-full rounded-md border border-[#E6E7F0] px-3 py-2 text-sm focus:border-[#2357F5] focus:outline-none"
                        placeholder="https://github.com/..."
                        value={applicant.portfolio}
                        onChange={(e) => setApplicant({ ...applicant, portfolio: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={expId} className="block text-xs font-semibold text-[#3B3F5C] mb-1">
                      Relevant Years of Experience
                    </label>
                    <select
                      id={expId}
                      className="w-full rounded-md border border-[#E6E7F0] px-3 py-2 text-sm focus:border-[#2357F5] focus:outline-none"
                      value={applicant.experienceYears}
                      onChange={(e) => setApplicant({ ...applicant, experienceYears: e.target.value })}
                    >
                      <option value="Young Builder / Student">Young Builder / Student / Self-Taught</option>
                      <option value="Volunteer / Contributor">Open Source Contributor / Volunteer</option>
                      <option value="1-2 years">1 – 2 years (Early Career)</option>
                      <option value="3-5 years">3 – 5 years (Mid-Level)</option>
                      <option value="6-9 years">6 – 9 years (Senior)</option>
                      <option value="10+ years">10+ years (Lead / Principal / Executive)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor={noteId} className="block text-xs font-semibold text-[#3B3F5C] mb-1">
                      Why Kabuor Technologies? (Brief note on your best work & impact) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={noteId}
                      required
                      rows={3}
                      className="w-full rounded-md border border-[#E6E7F0] px-3 py-2 text-sm focus:border-[#2357F5] focus:outline-none"
                      placeholder="Tell us about what you have built, why you're passionate about African software, or what open-source/volunteer track you'd like to work on..."
                      value={applicant.coverNote}
                      onChange={(e) => setApplicant({ ...applicant, coverNote: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn bg-[#2357F5] text-white hover:bg-[#3A6BFF] w-full py-3 text-sm font-semibold"
                  >
                    {submitting ? 'Submitting Application...' : `Submit Application for ${applyingRole.title}`}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <SiteFooter info={info} />
    </div>
  );
}
