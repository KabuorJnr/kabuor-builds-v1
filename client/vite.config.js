import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// One website for the platform and every shop: it asks the server (/api/site) who it is and loads that
// shop's colours and fonts at runtime. In development open http://localhost:5173 for the platform and
// http://<link>.localhost:5173 for a shop; the API runs on port 4000 and sees the same host name.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Fonts stay as files (not inlined into the CSS) so a shop only downloads the fonts it uses.
  build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 1200, assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined) },
  server: {
    port: 5173,
    strictPort: true,
    allowedHosts: ['.localhost'],
    proxy: { '/api': 'http://localhost:4000', '/uploads': 'http://localhost:4000', '/admin.webmanifest': 'http://localhost:4000' },
  },
});
