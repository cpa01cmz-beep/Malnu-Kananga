import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    // Enable source maps for production debugging
    sourcemap: mode === 'production',

    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks untuk better caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@google/genai'],
          'utils': ['uuid']
        },

        // Optimize chunk naming untuk better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },

        // Optimize asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },

    // Performance optimizations
    target: 'esnext',
    minify: 'esbuild',

    // Chunk size warnings
    chunkSizeWarningLimit: 500
  },

  // Development server optimizations
  server: {
    port: 3000,
    open: true
  },

  // Dependency pre-bundling untuk better performance
  optimizeDeps: {
    include: ['react', 'react-dom', '@google/genai']
  }
}))