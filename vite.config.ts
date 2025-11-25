import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    // Enable source maps for production debugging (security consideration)
    sourcemap: mode === 'development',

    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks untuk better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@google/genai')) {
              return 'ai-vendor';
            }
            if (id.includes('uuid')) {
              return 'utils-vendor';
            }
             if (id.includes('@supabase/supabase-js')) {
               return 'db-vendor';
             }
             if (id.includes('@tanstack/react-query')) {
               return 'query-vendor';
             }
            return 'vendor';
          }
          
           // Application chunks
           if (id.includes('/src/components/')) {
             return 'components';
           }
           if (id.includes('/src/services/')) {
             return 'services';
           }
           if (id.includes('/src/hooks/')) {
             return 'hooks';
           }
           if (id.includes('/src/memory/')) {
             return 'memory';
           }
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

     // Chunk size warnings
     chunkSizeWarningLimit: 300,
   },

  // Development server optimizations
  server: {
    port: 3000,
    open: true
  },

  // Dependency pre-bundling untuk better performance
  optimizeDeps: {
    include: ['react', 'react-dom', '@google/genai'],
    exclude: ['@tanstack/react-query']
  },



  // Asset optimization
  assetsInclude: ['**/*.webp']
}))