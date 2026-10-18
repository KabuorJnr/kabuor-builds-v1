# Kabuor Builds: shop platform

Kabuor Builds' self-service shop builder for Kenyan brands ("Product-first websites that sell. Mlete deals."). An owner signs up, pays the plan by M-Pesa prompt,
brands the shop from their own logo and product photos, picks a link like `anjugu.shop.ke`, adds products
and goes live. Customers order and pay the owner's own Till or Paybill. One server runs every shop.

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
  pay (STK push) → look (colours picked from the owner's pictures, a style, tagline) → products and how
  customers pay → live. The owner lands in their admin already signed in.
- **Looks** (`server/src/platform/presets.js`, `palette.js`): what they sell sets the decoration (chillies,
  honeycomb, candle glow…); the style sets fonts, corners, light/dark and the banner layout; the palette is
  built from the strongest colour in their photo, with text contrast checked.
- **Billing** (`server/src/platform/billing.js`): each M-Pesa payment adds a month or a year. A shop whose
  plan ended more than 3 days ago is paused: customers see "taking a short break", the admin keeps working
  and shows a renew banner. Owners renew under **Plan & billing** in their admin.
- **Customers' payments never touch the platform.** Checkout shows the shop's own Till/Paybill
  instructions (and cash on delivery). Per-shop STK push needs each shop's own Daraja keys (not built yet).

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

## Deploying on Vercel (services)

`vercel.json` deploys two services as one project:

| Service | Folder | Public paths |
|---|---|---|
| `client` | `client/` (Vite, static) | everything else, with deep links falling back to `index.html` |
| `server` | `server/` (Express, `src/index.js`) | `/api/*`, `/uploads/*`, `/admin.webmanifest` |

The browser calls `/api` on the same domain, so neither service calls the other and there are no bindings.
Test locally with `vercel dev` (or `vercel dev -L` without signing in).

- **Storage:** Vercel Functions keep nothing on disk, so the server refuses to start on Vercel unless
  `DATA_DIR` is set. `DATA_DIR=/tmp/kabuor` works for a throwaway preview, but shops, orders and photos
  disappear whenever the function restarts. Real shops need a hosted database and file storage first.
- **Shop links:** add the domain and `*.shop.ke` to the project; wildcard domains need Vercel's
  nameservers. The server reads the shop from `X-Forwarded-Host`. On `*.vercel.app` preview URLs only the
  platform's own pages show.
- **Link previews:** the static page shell carries Kabuor Builds' title; a shop's own title is set in the
  browser, so WhatsApp and social previews show the platform's title rather than the shop's.

## Before real customers

- Rate-limit signups and uploads, and add email verification.
- SMS order alerts use the platform's Africa's Talking account for every shop: decide who pays for them.
- Back up `DATA_DIR` daily (every shop's database lives there).
- Register with the Office of the Data Protection Commissioner: the platform stores customers' details
  for many businesses.
