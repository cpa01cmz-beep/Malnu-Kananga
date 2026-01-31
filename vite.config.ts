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
          theme_color: '#10b981',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.svg',
              sizes: '192x192',
              type: 'image/svg+xml'
            },
            {
              src: 'pwa-512x512.svg',
              sizes: '512x512',
              type: 'image/svg+xml'
            },
            {
              src: 'pwa-512x512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
          runtimeCaching: [
            {
              urlPattern: /\.css$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'css-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 // <== 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
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
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
    },
    build: {
      rollupOptions: {
        external: ['fsevents'],
        output: {
          manualChunks: (id: string) => {
            // Optimize chunking to reduce bundle size and improve load times

            // Google GenAI library (very large, keep separate)
            if (id.includes('@google/genai')) {
              return 'vendor-genai';
            }

            // Tesseract.js (OCR - large library)
            if (id.includes('tesseract.js')) {
              return 'vendor-tesseract';
            }

            // PDF generation libraries (split into smaller chunks)
            if (id.includes('jspdf-autotable')) {
              return 'vendor-jpdf-autotable';
            }
            if (id.includes('html2canvas')) {
              return 'vendor-html2canvas';
            }
            if (id.includes('jspdf')) {
              return 'vendor-jpdf';
            }

            // Recharts (charts - medium size)
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }

            // Test libraries (only in test mode)
            if (id.includes('vitest') || id.includes('@vitest')) {
              return 'tests';
            }

            // Group UI component libraries
            if (id.includes('@heroicons/react')) {
              return 'vendor-icons';
            }

            // Fix circular dependency: Keep apiService.ts and services/api in same chunk
            if (id.includes('/services/api') || id.includes('/services/apiService')) {
              return 'vendor-api';
            }

            // Don't split application code
            return undefined;
          }
        }
      },
      chunkSizeWarningLimit: 500,
      target: 'esnext',
      minify: 'terser' as const,
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
        testTimeout: 10000,
        hookTimeout: 10000,
        include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}', '__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}'],
        exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', '.opencode', 'e2e'],
      }
    }
  }

  return config
})