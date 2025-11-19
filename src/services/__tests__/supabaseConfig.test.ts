import { validateSupabaseEnvironment } from '../supabaseConfig';

// Mock environment variables for testing
const originalEnv = process.env;

describe('Supabase Configuration', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      JEST_WORKER_ID: '1'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateSupabaseEnvironment', () => {
    it('should return default config in test environment', () => {
      const config = validateSupabaseEnvironment();
      
      expect(config).toHaveProperty('SUPABASE_URL');
      expect(config).toHaveProperty('SUPABASE_ANON_KEY');
      expect(config).toHaveProperty('NODE_ENV');
      expect(config.NODE_ENV).toBe('test');
    });

    it('should use provided environment variables when available', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-anon-key';
      
      // Re-import to get fresh instance with new env vars
      const { validateSupabaseEnvironment: validate } = require('../supabaseConfig');
      const config = validate();
      
      expect(config.SUPABASE_URL).toBe('https://test.supabase.co');
      expect(config.SUPABASE_ANON_KEY).toBe('test-anon-key');
    });

    it('should handle missing environment variables gracefully', () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_ANON_KEY;
      
      // Re-import to get fresh instance
      const { validateSupabaseEnvironment: validate } = require('../supabaseConfig');
      const config = validate();
      
      expect(config.SUPABASE_URL).toBeDefined();
      expect(config.SUPABASE_ANON_KEY).toBeDefined();
    });

    it('should validate URL format', () => {
      process.env.SUPABASE_URL = 'invalid-url';
      
      // Re-import to get fresh instance - this should throw an error
      expect(() => {
        const { validateSupabaseEnvironment: validate } = require('../supabaseConfig');
        validate();
      }).toThrow();
    });

    it('should handle production environment differently', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_ANON_KEY;
      
      // Re-import to get fresh instance
      const { validateSupabaseEnvironment: validate } = require('../supabaseConfig');
      
      // Should not throw error in test environment even with NODE_ENV=production
      expect(() => {
        const config = validate();
        expect(config).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Supabase client creation', () => {
    it('should create Supabase client without errors', () => {
      // Re-import to get fresh instance
      const { supabase } = require('../supabaseConfig');
      
      expect(supabase).toBeDefined();
      expect(typeof supabase.from).toBe('function');
      expect(typeof supabase.auth).toBe('object');
    });

    it('should have correct client configuration', () => {
      // Re-import to get fresh instance
      const { supabase } = require('../supabaseConfig');
      
      // Test that client is properly configured
      expect(supabase).toHaveProperty('supabaseUrl');
      expect(supabase).toHaveProperty('supabaseKey');
    });
  });
});