// Mock import.meta.env for all tests
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        DEV: false,
        VITE_WORKER_URL: 'https://malnu-api.sulhi-cmz.workers.dev',
        VITE_JWT_SECRET: 'test-secret-key',
        VITE_USE_SUPABASE: 'false',
        USE_SUPABASE: 'false'
      },
      url: 'file://test'
    }
  },
  writable: true
});

// Mock import.meta directly
Object.defineProperty(global, 'import.meta', {
  value: {
    env: {
      DEV: false,
      VITE_WORKER_URL: 'https://malnu-api.sulhi-cmz.workers.dev',
      VITE_JWT_SECRET: 'test-secret-key',
      VITE_USE_SUPABASE: 'false',
      USE_SUPABASE: 'false'
    },
    url: 'file://test'
  },
  writable: true
});

// Mock Vite environment variables
process.env.VITE_WORKER_URL = 'https://malnu-api.sulhi-cmz.workers.dev';
process.env.VITE_JWT_SECRET = 'test-secret-key';
process.env.VITE_USE_SUPABASE = 'false';