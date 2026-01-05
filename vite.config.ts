/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Set NODE_ENV explicitly for production mode
  if (mode === 'production' && !process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production'
  }

  const config = {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'MA Malnu Kananga Smart Portal',
          short_name: 'MA Malnu App',
          description: 'Aplikasi Portal Pintar MA Malnu Kananga dengan Asisten AI',
          theme_color: '#16a34a',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
    },
    build: {
      rollupOptions: {
        external: ['fsevents'],
        output: {
          manualChunks: (id) => {
            // Core React libraries
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            // AI library
            if (id.includes('@google/genai')) {
              return 'genai';
            }
            // Test libraries (only in test mode)
            if (id.includes('vitest') || id.includes('@vitest')) {
              return 'tests';
            }
            // Dashboard components
            if (id.includes('AdminDashboard') || id.includes('StudentPortal') || id.includes('TeacherDashboard')) {
              return 'dashboards';
            }
            // Modal components (lazy loaded)
            if (id.includes('DocumentationPage') || id.includes('SiteEditor') || id.includes('PPDBRegistration')) {
              return 'modals';
            }
            // Section components
            if (id.includes('sections/')) {
              return 'sections';
            }
            // Individual components
            if (id.includes('components/') && !id.includes('icons/')) {
              return 'ui-components';
            }
          }
        }
      },
      chunkSizeWarningLimit: 300,
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    }
  }

  // Add test config only for testing mode
  if (mode === 'test') {
    return {
      ...config,
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./test-setup.ts'],
      }
    }
  }

  return config
})