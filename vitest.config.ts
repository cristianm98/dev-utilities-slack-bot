import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    alias: {
      'cloudflare:workers': path.resolve(__dirname, './test/mocks/cloudflare-workers.js'),
      '@hono-rate-limiter/cloudflare': path.resolve(__dirname, './test/mocks/hono-rate-limiter-cloudflare.js'),
    },
  },
});
