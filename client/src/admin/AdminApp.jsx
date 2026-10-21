import { LOOK } from '../lib/brand';
import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, BellRing, BookOpen, CreditCard, Palette, Smartphone, Eye, EyeOff, LayoutDashboard, LayoutTemplate, Loader2, LogOut, Megaphone, Menu, Package, Plus, ReceiptText,
  Store as StoreIcon, UserCog, X,
} from 'lucide-react';
import { ApbMark, EASE, Logo, useLockBody } from '../components/ui';
import { api, useSite } from '../lib/api';
import { cn, setCurrency } from '../lib/format';
import { useAdmin } from '../store/admin';
import Account from './Account';
import Alerts from './Alerts';
import Ledger from './Ledger';
import Orders from './Orders';
import Overview from './Overview';
import Products from './Products';
import RecordSale from './RecordSale';
import Updates from './Updates';
import Website from './Website';
import Look from './Look';
import Plan, { PlanBanner } from './Plan';
import MpesaKeys from './MpesaKeys';
import ErpLink from './ErpLink';
import { SHOP_BASE } from '../lib/base';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true, group: 'Analytics' },
  { to: '/admin/orders', label: 'Orders', icon: ReceiptText, group: 'Analytics' },
  { to: '/admin/ledger', label: 'Ledger', icon: BookOpen, group: 'Analytics' },
  { to: '/admin/sales/new', label: 'Record a sale', icon: Plus, group: 'Analytics' },
  { to: '/admin/updates', label: 'Updates', icon: Megaphone, group: 'Website' },
  { to: '/admin/products', label: 'Products', icon: Package, group: 'Website' },
  { to: '/admin/look', label: 'Look & colours', icon: Palette, group: 'Website' },
  { to: '/admin/website', label: 'Site content', icon: LayoutTemplate, group: 'Website' },
  { to: '/admin/alerts', label: 'Phone alerts', icon: BellRing, group: 'Settings' },
  { to: '/admin/mpesa', label: 'M-Pesa prompt', icon: Smartphone, group: 'Settings' },
  { to: '/admin/erp', label: 'Kabuor ERP', icon: BookOpen, group: 'Settings' },
  { to: '/admin/plan', label: 'Plan & billing', icon: CreditCard, group: 'Settings' },
  { to: '/admin/account', label: 'Account', icon: UserCog, group: 'Settings' },
];

// The password typed at sign-in, kept in memory only, so the forced change doesn't ask twice.
let lastPassword = '';

function AuthLayout({ children }) {
  return (
    <div className="bg-dots relative grid min-h-svh place-items-center bg-beige px-4 py-10">
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-honey/25 blur-[100px]" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="relative w-full max-w-sm">
        <div className="card p-7 sm:p-8">{children}</div>
        <Link
          to="/"
          className="group mx-auto mt-5 flex w-fit items-center gap-2 rounded-full bg-white/70 py-2 pr-4 pl-2 text-sm font-semibold text-espresso/70 ring-1 ring-espresso/10 backdrop-blur transition hover:bg-white hover:text-espresso"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-espresso text-honey transition-transform group-hover:-translate-x-0.5">
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
          Back to the shop
        </Link>
      </motion.div>
    </div>
  );
}

function PasswordInput({ value, onChange, autoComplete, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        className="field pr-12"
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        required
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-3 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-espresso/45 hover:text-espresso" aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Login() {
  const login = useAdmin((s) => s.login);
  const [form, setForm] = useState({ username: '', password: '' });
  const [state, setState] = useState({ loading: false, error: null });

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: null });
    try {
      const res = await api('/admin/login', { method: 'POST', body: form });
      lastPassword = form.password;
      login(res);
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={submit}>
        <ApbMark className="h-10 w-20" />
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Staff sign in</h1>
        <p className="mt-1 text-sm text-espresso/55">Sales, orders, updates and the website, in one place.</p>
        {state.error && <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">{state.error}</p>}
        <label className="mt-6 block">
          <span className="mb-1.5 block text-sm font-semibold">Username</span>
          <input className="field" autoComplete="username" autoCapitalize="none" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-semibold">Password</span>
          <PasswordInput value={form.password} onChange={(password) => setForm({ ...form, password })} autoComplete="current-password" />
        </label>
        <button className="btn btn-primary mt-6 h-12 w-full" disabled={state.loading}>
          {state.loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
        </button>
      </form>
    </AuthLayout>
  );
}

// Shown right after the first sign-in (and whenever the server says the default password is still in use).
function SetPassword() {
  const { username, login, logout } = useAdmin();
  const [form, setForm] = useState({ currentPassword: lastPassword, username: username ?? 'admin', newPassword: '', confirm: '' });
  const [state, setState] = useState({ loading: false, error: null });
  const token = useAdmin((s) => s.token);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const strength = [form.newPassword.length >= 8, /\d/.test(form.newPassword), /[A-Za-z]/.test(form.newPassword), form.newPassword.length >= 12].filter(Boolean).length;

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return setState({ loading: false, error: 'The two new passwords don’t match' });
    setState({ loading: true, error: null });
    try {
      const res = await api('/admin/account', { method: 'POST', token, body: form });
      lastPassword = '';
      login(res);
    } catch (err) {
      if (err.status === 401) logout();
      setState({ loading: false, error: err.message });
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={submit}>
        <ApbMark className="h-10 w-20" />
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Set your own password</h1>
        <p className="mt-1 text-sm text-espresso/55">
          You signed in with the default login. Choose a new password to unlock analytics, sales and the website editor.
        </p>
        {state.error && <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">{state.error}</p>}
        {!lastPassword && (
          <label className="mt-6 block">
            <span className="mb-1.5 block text-sm font-semibold">Current password</span>
            <PasswordInput value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" />
          </label>
        )}
        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-semibold">Username</span>
          <input className="field" autoComplete="username" autoCapitalize="none" required value={form.username} onChange={(e) => set('username')(e.target.value)} />
          <span className="mt-1 block text-xs text-espresso/45">Keep “admin” or choose your own.</span>
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-semibold">New password</span>
          <PasswordInput value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" placeholder="At least 8 characters" />
          <span className="mt-2 flex gap-1" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn('h-1 flex-1 rounded-full transition', i < strength ? (strength >= 3 ? 'bg-emerald-600' : 'bg-amber') : 'bg-espresso/10')} />
            ))}
          </span>
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-semibold">Confirm new password</span>
          <PasswordInput value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
        </label>
        <button className="btn btn-primary mt-6 h-12 w-full" disabled={state.loading}>
          {state.loading && <Loader2 className="h-4 w-4 animate-spin" />} Save and continue
        </button>
        <button type="button" onClick={logout} className="mt-3 w-full text-center text-sm font-semibold text-espresso/50 hover:text-espresso">
          Sign out
        </button>
      </form>
    </AuthLayout>
  );
}

function NavItem({ to, label, icon: Icon, end, onClick }) {
  return (
    <NavLink to={to} end={end} onClick={onClick} className="relative block">
      {({ isActive }) => (
        <span className={cn('relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors', isActive ? 'text-espresso' : 'text-cream/65 hover:bg-cream/5 hover:text-cream')}>
          {isActive && <motion.span layoutId="side-pill" className="absolute inset-0 rounded-xl bg-honey" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
          <Icon className="relative h-[18px] w-[18px]" />
          <span className="relative">{label}</span>
        </span>
      )}
    </NavLink>
  );
}

function Shell({ children }) {
  const username = useAdmin((s) => s.username);
  const logout = useAdmin((s) => s.logout);
  const [more, setMore] = useState(false);
  const location = useLocation();
  useLockBody(more);
  useEffect(() => setMore(false), [location.pathname]);
  const groups = [...new Set(NAV.map((n) => n.group))];

  const TabLink = ({ to, label, icon: Icon, end }) => (
    <NavLink to={to} end={end} className="relative">
      {({ isActive }) => (
        <span className={cn('relative flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[10.5px] font-semibold transition-colors', isActive ? 'text-espresso' : 'text-cream/60')}>
          {isActive && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-2xl bg-honey" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
          <Icon className="relative h-5 w-5" />
          <span className="relative">{label}</span>
        </span>
      )}
    </NavLink>
  );

  return (
    <div className="min-h-svh bg-cream">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto bg-espresso px-4 py-6 text-cream lg:flex">
        <div className="bg-dots-light pointer-events-none absolute inset-0 opacity-50" />
        <Link to="/admin" className="relative px-3">
          <Logo light />
        </Link>
        <nav className="relative mt-8 space-y-6">
          {groups.map((g) => (
            <div key={g}>
              <p className="px-3 font-hand text-lg text-honey/80">{g}</p>
              <div className="mt-1 space-y-1">
                {NAV.filter((n) => n.group === g).map((n) => (
                  <NavItem key={n.to} {...n} />
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="relative mt-auto space-y-1 border-t border-cream/10 pt-4">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/65 hover:bg-cream/5 hover:text-cream">
            <StoreIcon className="h-[18px] w-[18px]" /> View shop
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/65 hover:bg-cream/5 hover:text-cream">
            <LogOut className="h-[18px] w-[18px]" /> Sign out
          </button>
          <p className="truncate px-3 pt-2 text-xs text-cream/35">Signed in as {username}</p>
        </div>
      </aside>

      {/* mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-espresso/[0.07] bg-cream/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link to="/admin">
          <Logo />
        </Link>
        <Link to="/" className="grid h-10 w-10 place-items-center rounded-full hover:bg-beige" aria-label="View shop">
          <StoreIcon className="h-5 w-5" />
        </Link>
      </header>

      <main className="px-4 pt-6 pb-32 sm:px-6 lg:ml-64 lg:px-10 lg:pt-10 lg:pb-12">
        <div className="mx-auto max-w-6xl">
          <PlanBanner />
          {children}
        </div>
      </main>

      {/* mobile tab bar: the four most used places, a big "record sale" button and "more" */}
      <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 grid grid-cols-5 items-center rounded-[1.4rem] bg-espresso p-1.5 shadow-[0_20px_40px_-15px_rgba(30,20,12,0.6)] lg:hidden">
        <TabLink {...NAV[0]} label="Home" />
        <TabLink {...NAV[1]} />
        <NavLink to="/admin/sales/new" className="mx-auto -mt-7 grid h-14 w-14 place-items-center rounded-full bg-honey text-espresso shadow-[0_10px_25px_-8px_rgba(236,148,18,0.9)] ring-4 ring-cream" aria-label="Record a sale">
          <Plus className="h-6 w-6" strokeWidth={2.6} />
        </NavLink>
        <TabLink {...NAV[4]} />
        <button onClick={() => setMore(true)} className="flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[10.5px] font-semibold text-cream/60">
          <Menu className="h-5 w-5" />
          More
        </button>
      </nav>

      <AnimatePresence>
        {more && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMore(false)} className="fixed inset-0 z-40 bg-espresso/40 backdrop-blur-sm lg:hidden" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.45, ease: EASE }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[2rem] bg-espresso p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-cream lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-hand text-2xl text-honey">More</p>
                <button onClick={() => setMore(false)} className="grid h-9 w-9 place-items-center rounded-full bg-cream/10" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {NAV.filter((n) => ![0, 1, 3, 4].includes(NAV.indexOf(n))).map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className="flex items-center gap-3 rounded-2xl bg-cream/[0.06] px-4 py-3.5 text-sm font-semibold ring-1 ring-cream/10">
                    <Icon className="h-5 w-5 text-honey" /> {label}
                  </NavLink>
                ))}
                <button onClick={logout} className="flex items-center gap-3 rounded-2xl bg-cream/[0.06] px-4 py-3.5 text-left text-sm font-semibold ring-1 ring-cream/10">
                  <LogOut className="h-5 w-5 text-honey" /> Sign out
                </button>
              </div>
              <p className="mt-4 text-center text-xs text-cream/40">Signed in as {username}</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Lets the admin portal be added to a phone's Home Screen as its own app (needed for alerts on iPhone).
function useInstallableAdmin() {
  useEffect(() => {
    const tags = [
      ['link', { rel: 'manifest', href: '/admin.webmanifest' }],
      ['link', { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' }],
      ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
      ['meta', { name: 'apple-mobile-web-app-title', content: `${LOOK.short} Admin` }],
      ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }],
    ].map(([tag, attrs]) => {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      document.head.appendChild(el);
      return el;
    });
    // Registering early means a tapped alert can open the portal even before alerts are set up on this device.
    if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register(`${SHOP_BASE}/sw.js`, { scope: `${SHOP_BASE}/` }).catch(() => {});
    return () => tags.forEach((el) => el.remove());
  }, []);
}

// After signup the platform sends the owner here already signed in: #handoff=<token>&u=<email>.
function useHandoff() {
  const login = useAdmin((s) => s.login);
  const [done] = useState(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get('handoff');
    if (!token) return true;
    login({ token, username: hash.get('u') ?? '', mustChange: false });
    window.history.replaceState(null, '', window.location.pathname);
    return true;
  });
  return done;
}

export default function AdminApp() {
  useHandoff();
  const token = useAdmin((s) => s.token);
  const mustChange = useAdmin((s) => s.mustChange);
  const location = useLocation();
  const [, setReady] = useState(false);

  // Currency and brand come from the shop config/content so the portal matches the storefront.
  useEffect(() => {
    Promise.all([api('/config'), api('/content')])
      .then(([c, { content }]) => {
        setCurrency(c.currency);
        useSite.setState({ content });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useInstallableAdmin();

  if (!token) return <Login />;
  if (mustChange) return <SetPassword />;

  return (
    <Shell>
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }}>
          <Routes location={location}>
            <Route index element={<Overview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="sales/new" element={<RecordSale />} />
            <Route path="ledger" element={<Ledger />} />
            <Route path="updates" element={<Updates />} />
            <Route path="products" element={<Products />} />
            <Route path="inventory" element={<Navigate to="/admin/products" replace />} />
            <Route path="website" element={<Website />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="account" element={<Account />} />
            <Route path="look" element={<Look />} />
            <Route path="plan" element={<Plan />} />
            <Route path="mpesa" element={<MpesaKeys />} />
            <Route path="erp" element={<ErpLink />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
}
