// Mock for import.meta.env
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        DEV: process.env.NODE_ENV === 'development',
        VITE_JWT_SECRET: process.env.VITE_JWT_SECRET || 'dev-secret-key'
      }
    }
  },
  writable: true
});