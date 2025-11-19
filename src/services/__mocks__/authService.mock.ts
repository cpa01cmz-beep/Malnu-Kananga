// Mock for authService.ts to replace import.meta usage
const mockImportMeta = {
  env: {
    DEV: false,
    VITE_WORKER_URL: 'https://malnu-api.sulhi-cmz.workers.dev',
    VITE_JWT_SECRET: 'test-secret-key',
    VITE_USE_SUPABASE: 'false',
    USE_SUPABASE: 'false'
  }
};

// Mock the module before importing
jest.mock('../authService', () => {
  const originalModule = jest.requireActual('../authService');
  return {
    ...originalModule,
    // Override any functions that use import.meta if needed
  };
});

// Setup global mock
global.import = { meta: mockImportMeta };
global.import.meta = mockImportMeta;