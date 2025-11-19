// Supabase Configuration Service
import { createClient } from '@supabase/supabase-js';

// Import environment validation utility
import { validateEnvironment } from '../utils/envValidation';

// Extend the environment config to include Supabase variables
interface SupabaseEnvironmentConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  NODE_ENV: string;
}

// Update environment validation to include Supabase variables
export function validateSupabaseEnvironment(): SupabaseEnvironmentConfig {
  // Check if running in Jest test environment
  const isTestEnv = process.env.JEST_WORKER_ID !== undefined || process.env.NODE_ENV === 'test';

  // Use process.env directly for Jest compatibility
  const config = {
    SUPABASE_URL: isTestEnv ? 'https://test.supabase.co' : (process.env.SUPABASE_URL || ''),
    SUPABASE_ANON_KEY: isTestEnv ? 'test-anon-key' : (process.env.SUPABASE_ANON_KEY || ''),
    NODE_ENV: process.env.NODE_ENV || 'development',
  };

  // Skip security warnings and validations in test environment
  if (isTestEnv) {
    return config;
  }

  // Skip security warnings and validations in test environment
  if (isTestEnv) {
    if (!config.SUPABASE_URL || config.SUPABASE_URL.trim() === '') {
      config.SUPABASE_URL = 'https://test.supabase.co';
    }
    if (!config.SUPABASE_ANON_KEY || config.SUPABASE_ANON_KEY.trim() === '') {
      config.SUPABASE_ANON_KEY = 'test_anon_key';
    }
    return config;
  }

  // Security warnings untuk Supabase environment variables (hanya di development/production)
  if (config.NODE_ENV !== 'test') {
    console.warn('🔒 SECURITY WARNING: Pastikan file .env tidak di-commit ke version control');
    console.warn('🔒 SECURITY WARNING: Gunakan Supabase URL dan anon key yang terpisah untuk development dan production');
  }

  // Check for required Supabase environment variables
  if (!config.SUPABASE_URL || config.SUPABASE_URL.trim() === '') {
    console.error('❌ SUPABASE_URL tidak ditemukan atau kosong');
    console.error('💡 Solusi: Konfigurasi file .env dengan URL Supabase project yang valid');

    // Untuk development, gunakan placeholder jika tidak ada URL
    if (config.NODE_ENV === 'development') {
      console.warn('⚠️  Menggunakan mode development tanpa Supabase integration');
      config.SUPABASE_URL = 'https://development.supabase.co';
    } else {
      throw new Error(
        'SUPABASE_URL diperlukan untuk production. Silakan konfigurasi dengan URL Supabase project yang valid.'
      );
    }
  }

  if (!config.SUPABASE_ANON_KEY || config.SUPABASE_ANON_KEY.trim() === '') {
    console.error('❌ SUPABASE_ANON_KEY tidak ditemukan atau kosong');
    console.error('💡 Solusi: Konfigurasi file .env dengan anon key Supabase yang valid');

    // Untuk development, gunakan placeholder jika tidak ada anon key
    if (config.NODE_ENV === 'development') {
      console.warn('⚠️  Menggunakan mode development tanpa Supabase integration');
      config.SUPABASE_ANON_KEY = 'development_anon_key_placeholder';
    } else {
      throw new Error(
        'SUPABASE_ANON_KEY diperlukan untuk production. Silakan konfigurasi dengan anon key Supabase yang valid.'
      );
    }
  }

  // Validasi format Supabase URL
  if (config.SUPABASE_URL !== 'https://development.supabase.co' && !config.SUPABASE_URL.startsWith('https://') && !config.SUPABASE_URL.includes('supabase.co')) {
    console.warn('⚠️  SUPABASE_URL terlihat tidak valid');
    console.warn('💡 Pastikan menggunakan URL Supabase project yang lengkap dan valid');
  }

  // Validasi format anon key (Supabase anon keys biasanya panjang dan kompleks)
  if (config.SUPABASE_ANON_KEY !== 'development_anon_key_placeholder' && config.SUPABASE_ANON_KEY.length < 50) {
    console.warn('⚠️  SUPABASE_ANON_KEY terlihat tidak valid (terlalu pendek)');
    console.warn('💡 Pastikan menggunakan anon key Supabase yang lengkap');
  }

  return config;
}

export const supabaseEnv = validateSupabaseEnvironment();

// Create Supabase client
export const supabase = createClient(
  supabaseEnv.SUPABASE_URL,
  supabaseEnv.SUPABASE_ANON_KEY
);

// Export individual variables for convenience
export const SUPABASE_URL = supabaseEnv.SUPABASE_URL;
export const SUPABASE_ANON_KEY = supabaseEnv.SUPABASE_ANON_KEY;