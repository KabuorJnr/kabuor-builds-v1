// Applies a shop's look to the page: colours as CSS variables, fonts, and the art-direction switches
// (light/dark, banner layout, texture, corners) that index.css keys on.
import { family, loadFonts } from './fonts';
import { setLook } from './brand';

export function themeVars(look) {
  const vars = {};
  for (const [name, value] of Object.entries(look.colors)) vars[`--color-${name}`] = value;
  const tagline = `"${family(look.fonts.tagline)}", cursive`;
  vars['--font-brand'] = `"${family(look.fonts.brand)}", ui-rounded, system-ui, sans-serif`;
  vars['--font-tagline'] = tagline;
  vars['--font-hand'] = tagline;
  vars['--font-script'] = tagline;
  vars['--font-sans'] = `"${family(look.theme.body)} Variable", ui-sans-serif, system-ui, sans-serif`;
  return vars;
}

export async function applyLook(look) {
  setLook(look);
  const root = document.documentElement;
  for (const [k, v] of Object.entries(themeVars(look))) root.style.setProperty(k, v);
  root.dataset.mode = look.theme.mode;
  root.dataset.hero = look.theme.hero;
  root.dataset.texture = look.theme.texture;
  root.dataset.radius = look.theme.radius;
  root.style.colorScheme = look.theme.mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', look.colors.cream);
  await loadFonts({ ...look.fonts, body: look.theme.body });
}
