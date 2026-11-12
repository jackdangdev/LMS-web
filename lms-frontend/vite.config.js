import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server proxies /api to the Express backend so the browser sees a
// same-origin API and we never fight CORS during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // bind IPv4 explicitly so Cypress (baseUrl 127.0.0.1) can always connect
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      // cover images and avatars are served by Express from its /public folder
      '/static': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
});
