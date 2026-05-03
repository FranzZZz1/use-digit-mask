import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'src/demo'),
  base: '/use-digit-mask/',
  plugins: [react(), svgr()],
  css: {
    modules: {
      generateScopedName: '[name]__[local]__[hash:base64:5]',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/demo'),
      'use-digit-mask': path.resolve(__dirname, 'src/index.ts'),
      styles: path.resolve(__dirname, 'src/demo/app/styles'),
    },
  },
  server: {
    host: true,
  },
  build: {
    outDir: path.resolve(__dirname, 'dist-demo'),
    emptyOutDir: true,
  },
});
