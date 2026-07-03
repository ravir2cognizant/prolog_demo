import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['src/test/**/*.spec.ts'],
    testTimeout: 10000,
    env: {
      AUTH_DEV_BYPASS: '1',
      NODE_ENV: 'test',
      ENABLE_API_DOCS: '1',
    },
  },
});
