# Kabuor Builds: shop platform

Kabuor Builds' self-service shop builder for Kenyan brands ("Product-first websites that sell. Mlete deals."). An owner signs up and picks a link like
`anjugu.shop.ke`, brands the shop from their own logo and product photos, adds products, walks through the
real shop in a private preview, and only then pays by M-Pesa prompt to go live. Customers order and pay the
owner's own Till or Paybill. One server runs every shop.

## Brand

The platform's own pages use the Kabuor Builds kit from `Projects/kabuor-builds/brand`: the price-tag K mark
(`client/public/brand/mark.svg`), ink #0F1115, orange #FF5B1F, cream #FFF7EC, Bricolage (condensed, heavy) for
headlines, Fraunces italic for the "Mlete deals." voice, Onest for text (`client/public/fonts`). Name, tagline,
phone and email are settings (`PLATFORM_*` in `server/.env`). Every shop's footer links back: "Website by Kabuor Builds".

## What's in this repo

- `client/`, `server/`: the platform (landing page, signup, every shop).
- `marketing/`: the Kabuor Builds brand kit and the video ad, with its render scripts (see marketing/README.md).

## How it fits together

- **One server, many shops.** The host name decides what a request is for: `shop.ke` is the platform
  (landing page, signup, billing); `<link>.shop.ke` is that shop. Each shop has its own SQLite database and
  uploads in `server/data/shops/<link>/`; the platform's own records are in `server/data/platform.db`.
- **The shop engine** (storefront, cart, checkout, receipts, admin: orders, products, ledger, SMS and
  phone alerts) is the same one the hand-built brand shops use. Route code still imports `db` and `brand`;
  `server/src/tenant.js` makes them point at the current request's shop.
- **Signup** (`server/src/platform/routes.js`, `client/src/platform/Wizard.jsx`): business and link →
  look (colours picked from the owner's pictures, one of 10 styles, tagline) → products and how customers
  pay → **preview** → pay (STK push) → live. The owner lands in their admin already signed in. Unpaid
  signups hold their link for 3 days.
- **Preview before paying:** `/api/platform/preview` builds the real shop from the wizard and returns a
  private link (`?preview=<key>`). The key comes from the signup's setup token, so it can view but not edit;
  the shop shows a "Preview" bar, refuses orders, and stays "opening soon" for everyone else.
- **Looks** (`server/src/platform/presets.js`, `palette.js`): what they sell sets the decoration (chillies,
  honeycomb, candle glow…); the style (10 to pick from) sets fonts, corners, light/dark, the banner layout
  and sometimes the texture; the palette is built from the strongest colour in their photo, with text
  contrast checked.
- **Billing** (`server/src/platform/billing.js`): each M-Pesa payment adds a month or a year. A shop whose
  plan ended more than 3 days ago is paused: customers see "taking a short break", the admin keeps working
  and shows a renew banner. Owners renew under **Plan & billing** in their admin.
- **M-Pesa (STK push)** — one Daraja client (`server/src/daraja.js`), two sets of keys:
  - **The platform's** (`PLATFORM_MPESA_*` in `server/.env`): owners pay their plan to Kabuor Builds. Without
    keys this runs in test mode (no prompt; payments complete by themselves, marked "test").
  - **Each shop's own** (admin → **M-Pesa prompt**): the owner pastes their Daraja app's keys, sends
    themselves a KSh 1 test prompt, and from then on customers get the PIN prompt at checkout and pay
    straight into the shop's Till/Paybill. Secrets are stored in the shop's database and never sent back to
    the browser. Without keys, checkout shows the Till/Paybill instructions instead.
  - **Or "connect it for me"** (`server/src/platform/mpesaRequests.js`): an owner without a Daraja account
    sends their Till/Paybill and phone from the same page. The request shows at the top of the platform
    dashboard (`shop.ke/admin`); the developer drops in the credentials file (or pastes/types the keys),
    Safaricom checks the consumer key and secret, and the shop's checkout sends PIN prompts from the next
    order on. Rejected keys change nothing. The owner's page follows the request and flips to "on" by itself.
  - Results arrive by Safaricom's callback once `PUBLIC_URL` is https; until then (and as a backup) the app
    asks Daraja for the status every few seconds, so prompts work locally too.
- **Customers' payments never touch the platform:** each shop's prompt pays its own Till/Paybill.

## Run it

```bash
npm install
npm run build        # builds the website
npm start            # http://localhost:4000 (platform) and http://<link>.localhost:4000 (shops)
```

While developing: `npm run dev`, then open http://localhost:5173 and http://<link>.localhost:5173.
Browsers send `*.localhost` to your own computer, so shop links work locally with no setup.

Without M-Pesa keys the platform runs in **test mode**: no prompt is sent, payments complete by themselves
after a few seconds, and they're marked "test" everywhere. Copy `server/.env.example` to `server/.env`
for the real settings.

## Going live on a .ke domain

1. Buy the domain (e.g. `shop.ke` if it's free, or similar) from a KENIC-accredited registrar.
2. DNS: an `A` record for `shop.ke` **and** a wildcard `A` record for `*.shop.ke`, both to the server.
3. HTTPS: a wildcard certificate for `*.shop.ke` plus `shop.ke`. Let's Encrypt issues wildcards through
   the DNS challenge (Caddy or certbot with your DNS provider's plugin); Cloudflare in front also works.
4. `server/.env`: `PLATFORM_DOMAIN=shop.ke`, `PUBLIC_URL=https://shop.ke`, a long random `JWT_SECRET`,
   `TRUST_PROXY=1` behind a proxy, and `DATA_DIR` on a disk that is backed up.
5. M-Pesa: apply on https://developer.safaricom.co.ke for the platform's own Paybill or Till, "Go Live",
   then set the `PLATFORM_MPESA_*` keys. Callbacks arrive at `https://shop.ke/api/platform/mpesa/callback/…`.

## The company site on Vercel

The shops platform runs on Railway. Vercel (project `kabuor-builds`, https://kabuor-builds.vercel.app) serves only
the Kabuor Builds company page: `vercel.json` runs `npm run build:company` (entry `client/company.html` →
`client/dist-company`). `VITE_PRODUCT_ORIGIN` (set in the Vercel project) is the Railway address: the Shops and
ERP tabs and the "Start your shop" buttons open the product pages there, and the demo form and platform info
call its API. The server allows that origin on `/api/platform/info` and `/api/platform/demo` only
(`COMPANY_SITE_ORIGINS`, default `https://kabuor-builds.vercel.app`).

## Traffic, latency and security

**Today:** one Node process; one SQLite file per shop plus `platform.db`. Shops never share a database, so
one busy shop can't lock another, and a single small server comfortably handles many shops' everyday traffic.

**Already in place** (`server/src/guard.js`): security headers (no sniffing, pages can only be framed by the
platform, HSTS on https), per-IP limits on signups, uploads, link checks, M-Pesa prompts, sign-ins and orders;
signed per-shop sessions (one shop's login is useless on another); hashed passwords; M-Pesa secrets kept
server-side only; uploads re-encoded so only real images are stored.

**As traffic grows, in this order:**
1. **CDN in front** (Cloudflare or Vercel): the website files and product photos are served from Nairobi /
   Mombasa edge servers, not your server. Most page weight never reaches you. Biggest win for latency.
2. **A bigger server + backups:** SQLite on a fast SSD handles thousands of orders a minute. Back up
   `DATA_DIR` every hour (Litestream streams SQLite to S3/R2 continuously).
3. **More servers behind a load balancer, split by shop:** route each shop link to one server (consistent
   hashing on the host name). Each server owns its shops' SQLite files, so there's no shared database to
   bottleneck. Move the rate-limit counters and sessions to Redis so limits hold across servers.
4. **Hosted databases when you outgrow that:** Turso/libSQL (SQLite-compatible, replicas near customers) or
   Postgres with read replicas. The code already talks to the database through one place (`db.js`).
5. **Photos to object storage** (Cloudflare R2 / S3) behind the CDN, so servers stay stateless.

**Security checklist before launch:** https everywhere (`PUBLIC_URL`), a long `JWT_SECRET`, firewall so only
the load balancer reaches the server, `server/.env` never committed (it isn't), daily off-site backups,
Cloudflare/Vercel firewall rules against floods, and ODPC registration.

## Before real customers

- Rate-limit signups and uploads, and add email verification.
- SMS order alerts use the platform's Africa's Talking account for every shop: decide who pays for them.
- Back up `DATA_DIR` daily (every shop's database lives there).
- Register with the Office of the Data Protection Commissioner: the platform stores customers' details
  for many businesses.
