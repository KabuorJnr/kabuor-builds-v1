import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The standalone company site: `npm run build:company` → dist-company/ (company.html served as index.html).
// VITE_PRODUCT_ORIGIN is where the product pages and the platform API live.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'company-index',
      enforce: 'post',
      generateBundle(_, bundle) {
        if (bundle['company.html']) bundle['company.html'].fileName = 'index.html';
      },
    },
  ],
  build: { outDir: 'dist-company', emptyOutDir: true, rollupOptions: { input: 'company.html' }, assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined) },
});
