import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Keep prompt + skipWaiting:false so clients decide when to activate.
      // Blind autoUpdate would reload without the safe-activation gate in
      // usePwaUpdate (typing, dialogs, filter UI, multi-tab coordination).
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: [
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'favicon-48x48.png',
        'apple-touch-icon.png',
        'placeholder-drama.svg',
        'icons/app-icon-96.png',
        'icons/pwa-192x192.png',
        'icons/pwa-512x512.png',
        'icons/pwa-512x512-maskable.png',
      ],
      manifest: {
        name: 'Story Hook',
        short_name: 'Story Hook',
        description: 'Discover and explore curated Asian dramas.',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        lang: 'en',
        categories: ['entertainment', 'lifestyle'],
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache app shell + hashed bundles (incl. JSON/i18n chunks).
        // Exclude prerendered detail HTML pages to keep the install lean —
        // SPA navigateFallback + bundled datasets cover offline routes.
        globPatterns: [
          'index.html',
          'assets/**/*.{js,css,png,svg,jpg,jpeg,webp,woff,woff2,ttf,otf}',
          'favicon.ico',
          'favicon-*.png',
          'apple-touch-icon.png',
          'placeholder-drama.svg',
          'icons/**/*.{png,svg}',
          'manifest.webmanifest',
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/sitemap\.xml$/,
          /^\/robots\.txt$/,
          /^\/og-default\.png$/,
          /^\/googled18cbece93857294\.html$/,
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: true,
        // Hashed build assets are immutable; prefer cache after precache.
        runtimeCaching: [
          {
            urlPattern: ({ request, sameOrigin }) =>
              request.destination === 'image' && !sameOrigin,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'external-images-bypass',
            },
          },
          {
            urlPattern: ({ url }) =>
              url.pathname === '/robots.txt' ||
              url.searchParams.has('__online_probe'),
            handler: 'NetworkOnly',
            options: {
              cacheName: 'connectivity-probe',
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
        suppressWarnings: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          i18n: [
            'i18next',
            'react-i18next',
            'i18next-browser-languagedetector',
            'i18next-resources-to-backend',
          ],
        },
      },
    },
  },
});
