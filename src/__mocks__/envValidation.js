// Mock for env validation that handles import.meta
const WORKER_URL = process.env.VITE_WORKER_URL || 'http://localhost:8787';

// Mock the validateEnvironment function
function validateEnvironment() {
  return {
    WORKER_URL: WORKER_URL,
    VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || 'mock-api-key-for-testing',
    VITE_USE_SUPABASE: process.env.VITE_USE_SUPABASE || 'false'
  };
}

// Mock Response object for test environment
global.Response = class MockResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map();
    if (init.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key, value);
      });
    }
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }

  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
  }
};

module.exports = {
  WORKER_URL,
  validateEnvironment
};