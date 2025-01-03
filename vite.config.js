// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    root: 'test',
    port: 8080,
    strictPort: true,
    open: '/test/index.html',
  },
});
