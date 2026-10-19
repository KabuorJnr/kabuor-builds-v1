// Where shops live. Once the platform's domain (and its wildcard) points at the server, each shop is
// <link>.<domain>; until then (e.g. on the host's default address) it's <platform address>/s/<link>/.
// On *.localhost shop links always work locally.
const m = window.location.pathname.match(/^\/s\/([a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9]))(?=\/|$)/);

/** The path prefix this shop is served under ('' on its own subdomain or on the platform's pages). */
export const SHOP_BASE = m ? `/s/${m[1]}` : '';
/** The shop's link when it's served under a path (sent as X-Shop so the server knows which shop). */
export const PATH_SHOP = m?.[1] ?? null;

let platformDomain = '';
export const setPlatformDomain = (d) => (platformDomain = d || '');

const isLocal = (h) => h === 'localhost' || h.endsWith('.localhost');

/** The platform's own address, from a shop page. */
export function platformOrigin() {
  if (PATH_SHOP) return window.location.origin;
  return `${window.location.protocol}//${window.location.host.split('.').slice(1).join('.')}`;
}

/** A shop's address, from the platform's pages. */
export function shopAddress(slug) {
  const { protocol, host, hostname, origin } = window.location;
  if (isLocal(hostname)) return `${protocol}//${slug}.${host}`;
  if (platformDomain && (hostname === platformDomain || hostname.endsWith(`.${platformDomain}`))) return `https://${slug}.${platformDomain}`;
  return `${origin}/s/${slug}`;
}

/** How a shop link reads to people, e.g. anjugu.shop.ke */
export const linkLabel = (slug) => shopAddress(slug).replace(/^https?:\/\//, '');
/** What comes after the link in the signup box: ".shop.ke", or before it: "kabuor-builds…app/s/". */
export function linkParts() {
  const sample = linkLabel('LINK');
  const [before, after] = sample.split('LINK');
  return { before, after };
}
