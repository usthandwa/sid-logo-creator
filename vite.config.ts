import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * `base` is configurable so the same build can be served from a domain root
 * (e.g. logo.sidadventist.org) or from a GitHub Pages project path
 * (e.g. /sid-logo-creator/). Set VITE_BASE at build time.
 */
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // opentype.js is only needed once a download is requested.
          typography: ['opentype.js'],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', 'fonts/*.otf'],
      workbox: {
        // The brand font is ~270 KB; raise the precache ceiling so the app is
        // fully usable offline, font included.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,svg,png,otf,woff2}'],
        cleanupOutdatedCaches: true,
      },
      manifest: {
        id: 'org.sidadventist.logo-creator',
        name: 'SID Adventist Logo Creator',
        short_name: 'SID Logo',
        description:
          'Create official Seventh-day Adventist logo lockups for entities of the Southern Africa-Indian Ocean Division.',
        lang: 'en',
        dir: 'ltr',
        start_url: base,
        scope: base,
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'browser'],
        orientation: 'any',
        background_color: '#ffffff',
        theme_color: '#255760',
        categories: ['productivity', 'utilities', 'graphics'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
} as Parameters<typeof defineConfig>[0]);
