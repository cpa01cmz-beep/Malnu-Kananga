// Mock for import.meta.env
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        DEV: true,
        VITE_JWT_SECRET: 'test-jwt-secret',
        VITE_USE_SUPABASE: 'false',
        USE_SUPABASE: 'false',
        VITE_WORKER_URL: 'http://localhost:8787'
      }
    }
  },
  writable: true
});

// Mock crypto.subtle for Node.js environment
if (!global.crypto) {
  global.crypto = {
    subtle: {
      importKey: jest.fn().mockResolvedValue({}),
      sign: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
      verify: jest.fn().mockResolvedValue(true)
    },
    getRandomValues: jest.fn().mockImplementation((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    })
  };
}

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.VITE_API_KEY = 'test-api-key';
process.env.API_KEY = 'test-api-key';