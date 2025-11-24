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
            if (id.includes('tanstack') || id.includes('@tanstack')) {
              return 'query-vendor';
            }
            return 'vendor';
          }
          
          // Split larger components into separate chunks
          if (id.includes('Dashboard')) {
            return 'dashboard';
          }
          if (id.includes('Section')) {
            return 'sections';
          }
          if (id.includes('ChatWindow')) {
            return 'chat';
          }
          if (id.includes('memory')) {
            return 'memory';
          }
          if (id.includes('components')) {
            return 'components';
          }
          if (id.includes('services')) {
            return 'services';
          }
          if (id.includes('hooks')) {
            return 'hooks';
          }
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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
        passes: 2
      },
      mangle: {
        safari10: true
      }
    },

    // Chunk size warnings - increased threshold for education system
    chunkSizeWarningLimit: 250
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

  // Experimental features for better performance
  experimental: {
    renderBuiltUrl: (filename, { hostType }) => {
      if (hostType === 'js') {
        return { js: `/${filename}` };
      } else {
        return { relative: true };
      }
    }
  },

  // Asset optimization
  assetsInclude: ['**/*.webp']
}))