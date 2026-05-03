import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/hooks/**', 'src/utils/**'],
      exclude: ['src/demo/**', 'src/hooks/internal/**'],
    },
  },
  resolve: {
    alias: {
      'use-digit-mask': path.resolve(__dirname, 'src/index.ts'),
    },
  },
});
