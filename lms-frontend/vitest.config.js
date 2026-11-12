import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Vitest runs the component/unit suite in jsdom.
 * Kept separate from vite.config.js so the dev-server proxy config stays untouched.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    css: false,
    reporters: ['verbose'],
  },
});
