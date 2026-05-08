import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { copyFileSync, mkdirSync } from 'node:fs';

const root = __dirname;

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      closeBundle() {
        mkdirSync(resolve(root, 'dist'), { recursive: true });
        copyFileSync(resolve(root, 'manifest.json'), resolve(root, 'dist/manifest.json'));
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    minify: false,
    rollupOptions: {
      input: {
        panel: resolve(root, 'panel.html'),
        devtools: resolve(root, 'devtools.html'),
        background: resolve(root, 'src/background.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
