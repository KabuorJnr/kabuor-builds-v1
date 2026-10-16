// Fonts a shop can use, loaded only when its look asks for them (each becomes its own small CSS file).
// Keys: the Fontsource name, with v: for the variable text fonts.
const LOADERS = {
  "v:albert-sans": () => import('@fontsource-variable/albert-sans'),
  "v:archivo": () => import('@fontsource-variable/archivo'),
  "v:bricolage-grotesque": () => import('@fontsource-variable/bricolage-grotesque'),
  "v:commissioner": () => import('@fontsource-variable/commissioner'),
  "v:familjen-grotesk": () => import('@fontsource-variable/familjen-grotesk'),
  "v:golos-text": () => import('@fontsource-variable/golos-text'),
  "v:hanken-grotesk": () => import('@fontsource-variable/hanken-grotesk'),
  "v:instrument-sans": () => import('@fontsource-variable/instrument-sans'),
  "v:jost": () => import('@fontsource-variable/jost'),
  "v:onest": () => import('@fontsource-variable/onest'),
  "v:plus-jakarta-sans": () => import('@fontsource-variable/plus-jakarta-sans'),
  "v:red-hat-text": () => import('@fontsource-variable/red-hat-text'),
  "v:schibsted-grotesk": () => import('@fontsource-variable/schibsted-grotesk'),
  "caveat": () => import('@fontsource/caveat'),
  "caveat-brush": () => import('@fontsource/caveat-brush'),
  "cherry-bomb-one": () => import('@fontsource/cherry-bomb-one'),
  "gilda-display": () => import('@fontsource/gilda-display'),
  "gochi-hand": () => import('@fontsource/gochi-hand'),
  "kalam": () => import('@fontsource/kalam'),
  "marcellus": () => import('@fontsource/marcellus'),
  "parisienne": () => import('@fontsource/parisienne'),
  "patrick-hand": () => import('@fontsource/patrick-hand'),
  "rammetto-one": () => import('@fontsource/rammetto-one'),
  "sacramento": () => import('@fontsource/sacramento'),
  "shrikhand": () => import('@fontsource/shrikhand'),
  "titan-one": () => import('@fontsource/titan-one'),
  "young-serif": () => import('@fontsource/young-serif'),
};


// "caveat-brush" → "Caveat Brush", the family name Fontsource registers.
export const family = (slug) => slug.replace(/(^|-)(\w)/g, (_, dash, c) => (dash ? ' ' : '') + c.toUpperCase());

/** Loads the brand, accent and text fonts; resolves when their CSS is in (missing ones are skipped). */
export function loadFonts({ brand, tagline, body }) {
  const jobs = [LOADERS[brand], LOADERS[tagline], LOADERS[`v:${body}`]].filter(Boolean).map((load) => load().catch(() => {}));
  return Promise.all(jobs);
}
