import { validateSupabaseEnvironment } from '../supabaseConfig';

describe('Supabase Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process.env to clean state
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_ANON_KEY;
    delete process.env.VITE_USE_SUPABASE;
    process.env.NODE_ENV = 'test';
  });

  it('should validate Supabase environment in test mode', () => {
    process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'test_anon_key';
    
    const config = validateSupabaseEnvironment();
    
    expect(config).toBeDefined();
    expect(config.SUPABASE_URL).toBe('https://test.supabase.co');
    expect(config.SUPABASE_ANON_KEY).toBe('test_anon_key');
    expect(config.NODE_ENV).toBe('test');
  });

  it('should provide default values in test mode when environment variables are missing', () => {
    // Don't set any environment variables
    
    const config = validateSupabaseEnvironment();
    
    expect(config).toBeDefined();
    expect(config.SUPABASE_URL).toBe('https://test.supabase.co');
    expect(config.SUPABASE_ANON_KEY).toBe('test_anon_key');
    expect(config.NODE_ENV).toBe('test');
  });

  it('should use provided environment variables when available', () => {
    process.env.VITE_SUPABASE_URL = 'https://custom.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'custom_anon_key';
    
    const config = validateSupabaseEnvironment();
    
    expect(config).toBeDefined();
    expect(config.SUPABASE_URL).toBe('https://custom.supabase.co');
    expect(config.SUPABASE_ANON_KEY).toBe('custom_anon_key');
  });

  it('should handle empty environment variables by providing defaults', () => {
    process.env.VITE_SUPABASE_URL = '';
    process.env.VITE_SUPABASE_ANON_KEY = '';
    
    const config = validateSupabaseEnvironment();
    
    expect(config).toBeDefined();
    expect(config.SUPABASE_URL).toBe('https://test.supabase.co');
    expect(config.SUPABASE_ANON_KEY).toBe('test_anon_key');
  });

  it('should preserve NODE_ENV from process.env', () => {
    process.env.NODE_ENV = 'development';
    
    const config = validateSupabaseEnvironment();
    
    expect(config).toBeDefined();
    expect(config.NODE_ENV).toBe('development');
  });
});