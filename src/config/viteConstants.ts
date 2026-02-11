/**
 * Flexy: Vite Build Configuration Constants
 * 
 * This file centralizes all hardcoded values from vite.config.ts
 * to make the build system modular and maintainable.
 */

// PWA Theme and Branding Configuration
export const PWA_CONFIG = {
  THEME_COLOR: '#10b981', // Emerald green - matches school branding
  BACKGROUND_COLOR: '#ffffff',
  DISPLAY_MODE: 'standalone' as const,
  ORIENTATION: 'portrait' as const,
  START_URL: '/',
  SCOPE: '/',
} as const;

// Cache Configuration for Workbox
export const CACHE_CONFIG = {
  CSS: {
    NAME: 'css-cache',
    MAX_ENTRIES: 50,
    MAX_AGE_SECONDS: 60 * 60 * 24, // 24 hours
    STATUSES: [0, 200] as const,
  },
  GOOGLE_FONTS: {
    NAME: 'google-fonts-cache',
    MAX_ENTRIES: 10,
    MAX_AGE_SECONDS: 60 * 60 * 24 * 365, // 365 days (1 year)
    STATUSES: [0, 200] as const,
  },
  GSTATIC_FONTS: {
    NAME: 'gstatic-fonts-cache',
    MAX_ENTRIES: 10,
    MAX_AGE_SECONDS: 60 * 60 * 24 * 365, // 365 days (1 year)
    STATUSES: [0, 200] as const,
  },
} as const;

// URL Patterns for Runtime Caching
export const URL_PATTERNS = {
  CSS: /\.css$/,
  GOOGLE_FONTS_API: /^https:\/\/fonts\.googleapis\.com\/.*/i,
  GOOGLE_FONTS_STATIC: /^https:\/\/fonts\.gstatic\.com\/.*/i,
} as const;

// Build Performance Configuration
export const BUILD_CONFIG = {
  CHUNK_SIZE_WARNING_LIMIT: 800, // KB - increased for large vendor chunks
  TARGET: 'esnext' as const,
  MINIFY: 'terser' as const,
  TERSER_DROP_CONSOLE: true,
  TERSER_DROP_DEBUGGER: true,
  SOURCEMAP: true,
} as const;

// Test Configuration
export const TEST_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  HOOK_TIMEOUT: 10000, // 10 seconds
  POOL_MIN_THREADS: 2,
  POOL_MAX_THREADS: 8,
  ENVIRONMENT: 'jsdom' as const,
  GLOBALS: true,
  SETUP_FILES: ['./test-setup.ts'] as const,
  INCLUDE_PATTERNS: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}', '__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}'] as const,
  EXCLUDE_PATTERNS: ['node_modules', 'dist', '.idea', '.git', '.cache', '.opencode', 'e2e'] as const,
  POOL_TYPE: 'threads' as const,
} as const;

// Bundle Analyzer Configuration
export const ANALYZER_CONFIG = {
  FILENAME: 'dist/stats.html',
  OPEN: false,
  GZIP_SIZE: true,
  BROTLI_SIZE: true,
} as const;

// PWA Manifest Configuration
export const PWA_MANIFEST = {
  NAME: 'MA Malnu Kananga Smart Portal',
  SHORT_NAME: 'MA Malnu App',
  DESCRIPTION: 'Aplikasi Portal Pintar MA Malnu Kananga dengan Asisten AI',
  ICONS: [
    {
      src: 'pwa-192x192.svg',
      sizes: '192x192' as const,
      type: 'image/svg+xml' as const,
    },
    {
      src: 'pwa-512x512.svg',
      sizes: '512x512' as const,
      type: 'image/svg+xml' as const,
    },
    {
      src: 'pwa-512x512.svg',
      sizes: '512x512' as const,
      type: 'image/svg+xml' as const,
      purpose: 'any maskable' as const,
    },
  ],
  INCLUDE_ASSETS: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'] as const,
} as const;

// Workbox Configuration
export const WORKBOX_CONFIG = {
  GLOB_PATTERNS: ['**/*.{js,css,html,ico,png,svg,json}'] as const,
  REGISTER_TYPE: 'autoUpdate' as const,
} as const;

// Vendor Chunk Names
export const VENDOR_CHUNKS = {
  GENAI: 'vendor-genai',
  TESSERACT: 'vendor-tesseract',
  JSPDF_AUTOTABLE: 'vendor-jpdf-autotable',
  HTML2CANVAS: 'vendor-html2canvas',
  JSPDF: 'vendor-jpdf',
  CORE: 'vendor-core',
  TESTS: 'tests',
  ICONS: 'vendor-icons',
  API: 'vendor-api',
} as const;

// External Dependencies
export const EXTERNAL_DEPS = {
  ROLLUP: ['fsevents'] as const,
} as const;
