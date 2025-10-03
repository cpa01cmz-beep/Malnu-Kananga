// Environment validation utility
interface EnvironmentConfig {
  VITE_API_KEY: string;
  VITE_WORKER_URL: string;
  NODE_ENV: string;
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

export function validateEnvironment(): EnvironmentConfig {
  const config = {
    VITE_API_KEY: import.meta.env.VITE_API_KEY,
    VITE_WORKER_URL: import.meta.env.VITE_WORKER_URL || 'https://malnu-api.sulhi-cmz.workers.dev',
    NODE_ENV: import.meta.env.NODE_ENV || 'development'
  };

  // Check for required environment variables
  if (!config.VITE_API_KEY) {
    throw new EnvironmentError(
      'VITE_API_KEY tidak ditemukan. Silakan konfigurasi file .env dengan API key Google Gemini AI yang valid.\n' +
      'Dapatkan API key dari: https://makersuite.google.com/app/apikey'
    );
  }

  if (config.VITE_API_KEY === 'your_google_gemini_api_key_here') {
    throw new EnvironmentError(
      'VITE_API_KEY masih menggunakan placeholder. Silakan ganti dengan API key Google Gemini AI yang sebenarnya.'
    );
  }

  return config;
}

export const env = validateEnvironment();

// Export individual variables for convenience
export const API_KEY = env.VITE_API_KEY;
export const WORKER_URL = env.VITE_WORKER_URL;
export const NODE_ENV = env.NODE_ENV;