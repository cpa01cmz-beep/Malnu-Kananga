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

// Helper function to safely access environment variables
const getEnvVar = (key: string, defaultValue?: string): string => {
  // Use process.env for Jest compatibility
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  return defaultValue || '';
};

export function validateEnvironment(): EnvironmentConfig {
  // Check if running in Jest test environment
  const isTestEnv = process.env.JEST_WORKER_ID !== undefined || process.env.NODE_ENV === 'test';

  // Use process.env directly for Jest compatibility
  const config = {
    VITE_API_KEY: process.env.VITE_API_KEY || process.env.API_KEY || '',
    VITE_WORKER_URL: process.env.VITE_WORKER_URL || 'https://malnu-api.sulhi-cmz.workers.dev',
    NODE_ENV: process.env.NODE_ENV || 'development'
  };

  // Skip security warnings and validations in test environment
  if (isTestEnv) {
    if (!config.VITE_API_KEY || config.VITE_API_KEY.trim() === '') {
      config.VITE_API_KEY = 'test_api_key_placeholder';
    }
    return config;
  }

  // Security warnings untuk environment variables (hanya di development/production)
  console.warn('🔒 SECURITY WARNING: Pastikan file .env tidak di-commit ke version control');
  console.warn('🔒 SECURITY WARNING: Gunakan API key yang terpisah untuk development dan production');

  // Check for required environment variables dengan handling yang lebih aman
  if (!config.VITE_API_KEY || config.VITE_API_KEY.trim() === '') {
    console.error('❌ VITE_API_KEY tidak ditemukan atau kosong');
    console.error('💡 Solusi: Konfigurasi file .env dengan API key Google Gemini AI yang valid');
    console.error('🔗 Dapatkan API key dari: https://makersuite.google.com/app/apikey');

    // Untuk development, gunakan placeholder jika tidak ada API key
    if (config.NODE_ENV === 'development') {
      console.warn('⚠️  Menggunakan mode development tanpa AI features');
      config.VITE_API_KEY = 'development_placeholder_key';
    } else {
      throw new EnvironmentError(
        'VITE_API_KEY diperlukan untuk production. Silakan konfigurasi dengan API key Google Gemini AI yang valid.\n' +
        'Dapatkan API key dari: https://makersuite.google.com/app/apikey'
      );
    }
  }

  if (config.VITE_API_KEY === 'your_google_gemini_api_key_here') {
    console.warn('⚠️  VITE_API_KEY masih menggunakan placeholder');
    console.warn('💡 Ganti dengan API key Google Gemini AI yang sebenarnya di file .env');

    if (config.NODE_ENV === 'development') {
      console.warn('🔧 Menggunakan placeholder untuk development mode');
    } else {
      throw new EnvironmentError(
        'VITE_API_KEY masih menggunakan placeholder. Silakan ganti dengan API key Google Gemini AI yang sebenarnya.'
      );
    }
  }

  // Validasi format API key (Google Gemini API keys biasanya panjang dan kompleks)
  if (config.VITE_API_KEY !== 'development_placeholder_key' && config.VITE_API_KEY.length < 20) {
    console.warn('⚠️  VITE_API_KEY terlihat tidak valid (terlalu pendek)');
    console.warn('💡 Pastikan menggunakan API key Google Gemini AI yang lengkap');
  }

  return config;
}

export const env = validateEnvironment();

// Export individual variables for convenience
export const API_KEY = env.VITE_API_KEY;
export const WORKER_URL = env.VITE_WORKER_URL;
export const NODE_ENV = env.NODE_ENV;