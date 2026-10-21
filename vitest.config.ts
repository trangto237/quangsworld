import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/*/src/**/*.test.ts', 'server/**/*.test.ts', 'apps/kid/src/lib/**/*.test.ts'],
    environment: 'node',
  },
});
