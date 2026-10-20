// The Kabuor Builds platform look (company site, product pages, signup, dashboard).
export const PLATFORM_LOOK = {
  // Kabuor Royal: midnight ink, royal indigo, electric sapphire, and a touch of Kabuor gold.
  '--color-cream': '#F7F7FB', '--color-beige': '#EEEFF7', '--color-sand': '#DCDDF0', '--color-latte': '#9A9CC0',
  '--color-honey': '#2357F5', '--color-amber': '#3A2BC9', '--color-caramel': '#3A2BC9', '--color-cocoa': '#585C80',
  '--color-espresso': '#0A0B1E', '--color-bark': '#05060F', '--color-white': '#FFFFFF',
  '--font-sans': '"KB Onest", ui-sans-serif, system-ui, sans-serif',
  '--font-brand': '"KB Bricolage", ui-sans-serif, system-ui, sans-serif',
  '--font-hand': '"KB Fraunces", Georgia, serif', '--font-tagline': '"KB Fraunces", Georgia, serif', '--font-script': '"KB Fraunces", Georgia, serif',
  '--r-xl': '1.75rem', '--r-lg': '1.1rem', '--r-md': '0.7rem', '--r-btn': '999px',
};

export function applyPlatformLook() {
  const root = document.documentElement;
  Object.entries(PLATFORM_LOOK).forEach(([k, v]) => root.style.setProperty(k, v));
  root.dataset.mode = 'light';
  root.dataset.radius = 'round';
  root.dataset.texture = 'dots';
}
