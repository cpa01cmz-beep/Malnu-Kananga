// Mock for env validation that handles import.meta
const WORKER_URL = process.env.VITE_WORKER_URL || 'http://localhost:8787';

// Mock the validateEnvironment function
function validateEnvironment() {
  return {
    WORKER_URL: WORKER_URL,
    VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || 'test-api-key',
    VITE_USE_SUPABASE: process.env.VITE_USE_SUPABASE || 'false'
  };
}

module.exports = {
  WORKER_URL,
  validateEnvironment
};