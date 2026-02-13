/// <reference types="vitest" />
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import {
  PWA_CONFIG,
  CACHE_CONFIG,
  URL_PATTERNS,
  BUILD_CONFIG,
  TEST_CONFIG,
  ANALYZER_CONFIG,
  PWA_MANIFEST,
  WORKBOX_CONFIG,
  VENDOR_CHUNKS,
  EXTERNAL_DEPS,
} from './src/config/viteConstants'

function asyncCssPlugin(): Plugin {
  return {
    name: 'async-css',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+)"\s*\/?>/g,
        (match, href) => {
          if (match.includes('preload') || match.includes('media=')) {
            return match
          }
          return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'" />\n    <noscript><link rel="stylesheet" href="${href}" /></noscript>`
        }
      )
    },
  }
}

  // https://vitejs.dev/config/
// BroCula: Enhanced chunking strategy to minimize unused JavaScript on initial load
// Key principle: Heavy libraries and dashboard components should ONLY load when needed
export default defineConfig(({ mode }) => {
  // Set NODE_ENV explicitly for production mode
  if (mode === 'production' && !process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production'
  }

  const config = {
    plugins: [
      react(),
      asyncCssPlugin(),
      VitePWA({
        registerType: WORKBOX_CONFIG.REGISTER_TYPE,
        includeAssets: [...PWA_MANIFEST.INCLUDE_ASSETS],
        manifest: {
          name: PWA_MANIFEST.NAME,
          short_name: PWA_MANIFEST.SHORT_NAME,
          description: PWA_MANIFEST.DESCRIPTION,
          theme_color: PWA_CONFIG.THEME_COLOR,
          display: PWA_CONFIG.DISPLAY_MODE,
          orientation: PWA_CONFIG.ORIENTATION,
          start_url: PWA_CONFIG.START_URL,
          icons: PWA_MANIFEST.ICONS.map(icon => ({ ...icon })),
        },
        workbox: {
          globPatterns: [...WORKBOX_CONFIG.GLOB_PATTERNS],
          runtimeCaching: [
            {
              urlPattern: URL_PATTERNS.CSS,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: CACHE_CONFIG.CSS.NAME,
                expiration: {
                  maxEntries: CACHE_CONFIG.CSS.MAX_ENTRIES,
                  maxAgeSeconds: CACHE_CONFIG.CSS.MAX_AGE_SECONDS,
                },
                cacheableResponse: {
                  statuses: [...CACHE_CONFIG.CSS.STATUSES],
                },
              },
            },
            {
              urlPattern: URL_PATTERNS.GOOGLE_FONTS_API,
              handler: 'CacheFirst',
              options: {
                cacheName: CACHE_CONFIG.GOOGLE_FONTS.NAME,
                expiration: {
                  maxEntries: CACHE_CONFIG.GOOGLE_FONTS.MAX_ENTRIES,
                  maxAgeSeconds: CACHE_CONFIG.GOOGLE_FONTS.MAX_AGE_SECONDS,
                },
                cacheableResponse: {
                  statuses: [...CACHE_CONFIG.GOOGLE_FONTS.STATUSES],
                },
              },
            },
            {
              urlPattern: URL_PATTERNS.GOOGLE_FONTS_STATIC,
              handler: 'CacheFirst',
              options: {
                cacheName: CACHE_CONFIG.GSTATIC_FONTS.NAME,
                expiration: {
                  maxEntries: CACHE_CONFIG.GSTATIC_FONTS.MAX_ENTRIES,
                  maxAgeSeconds: CACHE_CONFIG.GSTATIC_FONTS.MAX_AGE_SECONDS,
                },
                cacheableResponse: {
                  statuses: [...CACHE_CONFIG.GSTATIC_FONTS.STATUSES],
                },
              },
            },
          ],
        },
      }),
      // Bundle analyzer - generates stats.html after build
      visualizer({
        filename: ANALYZER_CONFIG.FILENAME,
        open: ANALYZER_CONFIG.OPEN,
        gzipSize: ANALYZER_CONFIG.GZIP_SIZE,
        brotliSize: ANALYZER_CONFIG.BROTLI_SIZE,
      }),
    ],
    define: {
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
    },
    build: {
      rollupOptions: {
        external: [...EXTERNAL_DEPS.ROLLUP],
        // BroCula: Enable aggressive tree-shaking to eliminate unused code
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
        output: {
          manualChunks: (id: string) => {
            // Optimize chunking to reduce bundle size and improve load times
            // BroCula: Code splitting strategy to minimize unused JavaScript

            // Google GenAI library (very large, keep separate)
            if (id.includes('@google/genai')) {
              return VENDOR_CHUNKS.GENAI;
            }

            // Tesseract.js (OCR - large library)
            if (id.includes('tesseract.js')) {
              return VENDOR_CHUNKS.TESSERACT;
            }

            // PDF generation libraries (split into smaller chunks)
            if (id.includes('jspdf-autotable')) {
              return VENDOR_CHUNKS.JSPDF_AUTOTABLE;
            }
            if (id.includes('html2canvas')) {
              return VENDOR_CHUNKS.HTML2CANVAS;
            }
            if (id.includes('jspdf')) {
              return VENDOR_CHUNKS.JSPDF;
            }

            // Split React ecosystem into parallel chunks for better loading performance
            // React core (most critical - load first)
            if (id.includes('/node_modules/react/') ||
                id.includes('/node_modules/react-dom/') ||
                id.includes('/node_modules/scheduler/')) {
              return VENDOR_CHUNKS.REACT;
            }
            // React Router (depends on React, can load in parallel)
            if (id.includes('/node_modules/react-router/') ||
                id.includes('/node_modules/@remix-run/')) {
              return VENDOR_CHUNKS.ROUTER;
            }
            // Charts library (heavy, lazy-load if possible)
            if (id.includes('recharts') || id.includes('d3')) {
              return VENDOR_CHUNKS.CHARTS;
            }

            // Test libraries (only in test mode)
            if (id.includes('vitest') || id.includes('@vitest')) {
              return VENDOR_CHUNKS.TESTS;
            }

            // Group UI component libraries
            if (id.includes('@heroicons/react')) {
              return VENDOR_CHUNKS.ICONS;
            }

            // BroCula: Split Sentry into separate chunk to prevent unused code in main bundle
            // Sentry replay and feedback modules add ~50KB+ of unused JavaScript
            if (id.includes('@sentry')) {
              return 'vendor-sentry';
            }

            // Fix circular dependency: Keep apiService.ts and services/api in same chunk
            if (id.includes('/services/api') || id.includes('/services/apiService')) {
              return VENDOR_CHUNKS.API;
            }

            // BroCula: Split large application components into separate chunks
            // Dashboard components (heavy, only needed after login)
            if (id.includes('/components/AdminDashboard')) {
              return 'dashboard-admin';
            }
            if (id.includes('/components/TeacherDashboard')) {
              return 'dashboard-teacher';
            }
            if (id.includes('/components/ParentDashboard')) {
              return 'dashboard-parent';
            }
            if (id.includes('/components/StudentPortal')) {
              return 'dashboard-student';
            }

            // Modals and dialogs (only needed when opened)
            if (id.includes('/components/LoginModal') ||
                id.includes('/components/ThemeSelector') ||
                id.includes('/components/ui/ConfirmationDialog') ||
                id.includes('/components/ui/CommandPalette')) {
              return 'ui-modals';
            }

            // Content sections (can be loaded after initial render)
            if (id.includes('/components/sections/')) {
              return 'public-sections';
            }

            // Don't split other application code - let Rollup handle it
            return undefined;
          },
        },
      },
      // Increased from 500KB to 800KB to accommodate large vendor chunks (React ecosystem, etc.)
      // Application code chunks should still aim for <500KB for optimal performance
      chunkSizeWarningLimit: BUILD_CONFIG.CHUNK_SIZE_WARNING_LIMIT,
      target: BUILD_CONFIG.TARGET,
      minify: BUILD_CONFIG.MINIFY,
      sourcemap: BUILD_CONFIG.SOURCEMAP,
      terserOptions: {
        compress: {
          drop_console: BUILD_CONFIG.TERSER_DROP_CONSOLE,
          drop_debugger: BUILD_CONFIG.TERSER_DROP_DEBUGGER,
        },
      },
      // BroCula: Enable CSS code splitting to reduce render-blocking CSS
      cssCodeSplit: true,
      // BroCula: Improve chunk loading performance
      assetsInlineLimit: 4096, // 4KB - inline small assets
      // Prevent eager loading of dashboard chunks - saves 471 KB on initial load
      modulePreload: false,
    },
    // BroCula: Optimize dependency pre-bundling for faster dev builds and better caching
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@heroicons/react/24/outline',
        '@heroicons/react/24/solid',
        // Tesseract.js v7 uses CommonJS - must be pre-bundled for browser compatibility
        'tesseract.js',
      ],
      exclude: [
        // Large libraries that should be lazy-loaded - reduces initial bundle
        'recharts',
        'jspdf',
        'html2canvas',
        '@google/genai',
        'jspdf-autotable',
      ],
      // BroCula: Force dependency optimization on build for better chunking
      force: true,
    },
    // BroCula: CSS configuration for better performance
    css: {
      // Enable CSS source maps for debugging (set to false in production for smaller builds)
      devSourcemap: mode !== 'production',
    },
  }

  // Add test config only for testing mode
  if (mode === 'test') {
    return {
      ...config,
      test: {
        globals: TEST_CONFIG.GLOBALS,
        environment: TEST_CONFIG.ENVIRONMENT,
        setupFiles: [...TEST_CONFIG.SETUP_FILES],
        // Increased timeouts for CI environment (Issue #1394)
        testTimeout: TEST_CONFIG.TIMEOUT,
        hookTimeout: TEST_CONFIG.HOOK_TIMEOUT,
        include: [...TEST_CONFIG.INCLUDE_PATTERNS],
        exclude: [...TEST_CONFIG.EXCLUDE_PATTERNS],
        // NOTE: bail: 1 disabled for full test suite runs (Issue #1382)
        // Enable bail: 1 for CI/CD PR checks to fail fast on first error
        // Use threads pool for parallel test execution (Issue #1346, #1382, #1394)
        // Significantly reduces test suite duration by utilizing multiple CPU cores
        // Vitest 4: poolOptions moved to top-level options
        pool: TEST_CONFIG.POOL_TYPE,
        minThreads: TEST_CONFIG.POOL_MIN_THREADS,
        maxThreads: TEST_CONFIG.POOL_MAX_THREADS,
      },
    }
  }

  return config
})
