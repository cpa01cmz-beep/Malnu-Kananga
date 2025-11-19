// Mock for import.meta.env to support Jest testing
// This file should be imported before any other files that use import.meta.env

export const mockImportMeta = {
  meta: {
    env: {
      DEV: true,
      VITE_JWT_SECRET: 'test-secret',
      VITE_USE_SUPABASE: 'false',
      USE_SUPABASE: 'false',
      VITE_WORKER_URL: 'http://localhost:8787'
    }
  }
};

// Set up global mock
global.import = mockImportMeta;