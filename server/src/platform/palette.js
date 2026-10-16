// Colours from the owner's own pictures: the strongest colours in a logo or product photo become the shop's
// accents, and a full light or dark palette is built around them with readable text everywhere.
import sharp from 'sharp';

// ---------- colour maths ----------
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

export function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const rgbToHex = (r, g, b) => `#${[r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

export function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s);
  l = clamp(l);
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}
export const hexToHsl = (hex) => rgbToHsl(...hexToRgb(hex));

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Moves a colour's lightness until it reaches `ratio` against `bg` (darker on light pages, lighter on dark). */
function readableOn(hex, bg, ratio) {
  let [h, s, l] = hexToHsl(hex);
  const darken = luminance(bg) > 0.4;
  for (let i = 0; i < 40 && contrast(hsl(h, s, l), bg) < ratio; i++) l += darken ? -0.02 : 0.02;
  return hsl(h, s, l);
}

// ---------- reading colours from an image ----------
/**
 * The image's accent colours, strongest first: saturated, not near-white or near-black (so a white studio
 * background or a black lid doesn't win). Returns up to 3 hex colours, possibly none for a grey image.
 */
export async function accentsFrom(input) {
  const { data, info } = await sharp(input).resize(64, 64, { fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const bins = Array.from({ length: 24 }, () => ({ w: 0, r: 0, g: 0, b: 0 }));
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const [h, s, l] = rgbToHsl(r, g, b);
    if (s < 0.22 || l < 0.12 || l > 0.9) continue;
    const w = s * (1 - Math.abs(l - 0.5));
    const bin = bins[Math.floor(h / 15) % 24];
    bin.w += w;
    bin.r += r * w;
    bin.g += g * w;
    bin.b += b * w;
  }
  const total = bins.reduce((t, b) => t + b.w, 0);
  if (!total) return [];
  const ranked = bins
    .map((b, i) => ({ ...b, i }))
    .filter((b) => b.w / total > 0.04)
    .sort((a, b) => b.w - a.w);
  const picked = [];
  for (const b of ranked) {
    // Skip hues within 45° of one already picked, so the options really differ.
    if (picked.some((p) => Math.min(Math.abs(p.i - b.i), 24 - Math.abs(p.i - b.i)) < 3)) continue;
    picked.push(b);
    if (picked.length === 3) break;
  }
  return picked.map((b) => rgbToHex(b.r / b.w, b.g / b.w, b.b / b.w));
}

// ---------- building a palette ----------
/**
 * The shop's full palette from one accent colour (and an optional second one), in the names the shop
 * design uses: cream = page, beige/sand = soft panels, honey = main accent, amber = deeper accent,
 * caramel = accent for small text and links, cocoa/espresso = text, bark = footer, white = cards.
 */
export function buildPalette(accent, mode = 'light', second) {
  const [h, s0] = hexToHsl(accent);
  const s = Math.max(s0, 0.45);
  const h2 = second ? hexToHsl(second)[0] : h;
  if (mode === 'dark') {
    const cream = hsl(h, 0.14, 0.07);
    return {
      cream,
      beige: hsl(h, 0.13, 0.1),
      sand: hsl(h, 0.12, 0.15),
      latte: hsl(h, 0.1, 0.45),
      honey: readableOn(hsl(h, s, 0.58), cream, 4.5),
      amber: readableOn(hsl(h2, s, 0.55), cream, 3),
      caramel: readableOn(hsl(h2, Math.min(s, 0.7), 0.66), cream, 4.5),
      cocoa: hsl(h, 0.12, 0.84),
      espresso: hsl(h, 0.3, 0.96),
      bark: hsl(h, 0.12, 0.04),
      white: hsl(h, 0.12, 0.1),
    };
  }
  const cream = hsl(h, 0.35, 0.97);
  return {
    cream,
    beige: hsl(h, 0.3, 0.93),
    sand: hsl(h, 0.25, 0.85),
    latte: hsl(h, 0.18, 0.62),
    honey: readableOn(hsl(h, s, 0.52), cream, 2.6),
    amber: readableOn(hsl(h, s, 0.42), cream, 3.5),
    caramel: readableOn(hsl(h2, Math.min(s, 0.75), 0.36), cream, 4.5),
    cocoa: hsl(h, 0.18, 0.22),
    espresso: hsl(h, 0.2, 0.1),
    bark: hsl(h, 0.18, 0.06),
    white: '#FFFFFF',
  };
}

/** Palette choices to show the owner: one per accent found in their pictures, plus the kind's default. */
export function paletteOptions(accents, fallback, mode) {
  const seen = new Set();
  const out = [];
  for (const [i, a] of [...accents, fallback].entries()) {
    const key = a.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const second = accents.find((x) => x !== a);
    out.push({ id: `p${i}`, accent: key, from: i < accents.length ? 'your pictures' : 'suggested', colors: buildPalette(a, mode, second) });
  }
  return out.slice(0, 4);
}
