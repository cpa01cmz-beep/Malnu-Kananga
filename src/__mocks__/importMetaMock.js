// Mock for import.meta.env
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        DEV: true,
        VITE_WORKER_URL: 'http://localhost:8787',
        VITE_JWT_SECRET: 'test-secret-key',
        VITE_USE_SUPABASE: 'false',
        USE_SUPABASE: 'false'
      }
    }
  },
  writable: true
});

// Mock process.env for Node.js compatibility
process.env.NODE_ENV = 'test';