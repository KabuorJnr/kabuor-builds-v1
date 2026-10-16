// The current shop's look (colours, fonts, logo, theme), filled in by main.jsx from /api/site before the app
// renders. Components read it as before; BRAND is the fallback name until the editable content loads.
export const LOOK = {};
export const BRAND = {};

export function setLook(look) {
  Object.assign(LOOK, look);
  Object.assign(BRAND, { name: look.name, short: look.short, tagline: look.tagline });
}
