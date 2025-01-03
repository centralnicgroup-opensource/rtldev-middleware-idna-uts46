// vite.config.coverage.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    root: 'coverage',
    port: 8080,
    strictPort: true,
    open: '/coverage/index.html',
  },
});
