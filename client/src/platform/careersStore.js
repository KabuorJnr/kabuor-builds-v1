// Store and persistent state for Kabuor Technologies Careers & Hiring Desk
// Supports toggling job status (open vs closed) from admin and persisting candidate submissions.

export const DEFAULT_ROLES = [
  {
    id: 'chief-of-staff',
    title: 'Chief of Staff / Head of Strategic Operations',
    department: 'Leadership',
    location: 'Ngong Road, Nairobi · Fully Remote',
    type: 'Full-Time',
    status: 'open',
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
    status: 'open',
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
    status: 'open',
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
    status: 'open',
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
    status: 'open',
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
    status: 'open',
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
    status: 'open',
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
    status: 'open',
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
    status: 'open',
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
    status: 'open',
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
    status: 'open',
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
    status: 'open',
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
    status: 'open',
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
    status: 'open',
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
    status: 'open',
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

const ROLES_KEY = 'kb_careers_roles_v2';
const APPS_KEY = 'kb_careers_applications_v2';

export function getStoredRoles() {
  try {
    const raw = localStorage.getItem(ROLES_KEY);
    if (!raw) return DEFAULT_ROLES;
    const parsed = JSON.parse(raw);
    // Merge with defaults while preserving stored status
    return DEFAULT_ROLES.map((d) => {
      const saved = parsed.find((p) => p.id === d.id);
      return saved ? { ...d, status: saved.status || 'open' } : d;
    });
  } catch {
    return DEFAULT_ROLES;
  }
}

export function saveRoles(roles) {
  try {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    window.dispatchEvent(new CustomEvent('kb-roles-changed', { detail: roles }));
  } catch {}
}

export function toggleRoleStatus(roleId) {
  const current = getStoredRoles();
  const updated = current.map((r) => {
    if (r.id === roleId) {
      const nextStatus = r.status === 'closed' ? 'open' : 'closed';
      return { ...r, status: nextStatus };
    }
    return r;
  });
  saveRoles(updated);
  return updated;
}

export function setRoleStatus(roleId, status) {
  const current = getStoredRoles();
  const updated = current.map((r) => (r.id === roleId ? { ...r, status } : r));
  saveRoles(updated);
  return updated;
}

export function getStoredApplications() {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveApplication(appData) {
  try {
    const trackingRef = `KBR-APP-${Math.floor(100000 + Math.random() * 900000)}`;
    const application = {
      ...appData,
      trackingRef,
      submittedAt: new Date().toISOString(),
      reviewStatus: 'New',
    };
    const current = getStoredApplications();
    const updated = [application, ...current];
    localStorage.setItem(APPS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kb-apps-changed', { detail: updated }));
    return { success: true, trackingRef, application };
  } catch (err) {
    console.error('Failed to save application', err);
    return { success: false, error: err.message };
  }
}

export function updateApplicationReviewStatus(trackingRef, reviewStatus) {
  const current = getStoredApplications();
  const updated = current.map((a) => (a.trackingRef === trackingRef ? { ...a, reviewStatus } : a));
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kb-apps-changed', { detail: updated }));
  } catch {}
  return updated;
}
