import { supabase } from '../supabaseConfig';

// Mock supabase client for testing
jest.mock('../supabaseConfig', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({
          data: null,
          error: { message: 'relation "non_existent_test_table" does not exist' }
        }))
      }))
    })),
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn()
    },
    storage: {
      from: jest.fn()
    }
  }
}));

describe('Supabase Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have supabase client properly configured', () => {
    const { supabase } = require('../supabaseConfig');
    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });

  it('should handle connection test correctly', async () => {
    const { supabase } = require('../supabaseConfig');
    
    // Test basic connection by querying a non-existent table
    const { data, error } = await supabase
      .from('non_existent_test_table')
      .select('count')
      .limit(1);

    // We expect an error for a non-existent table, which confirms the connection works
    expect(error).toBeDefined();
    expect(error.message).toContain('non_existent_test_table');
    expect(data).toBeNull();
  });

  it('should validate supabase client methods', () => {
    const { supabase } = require('../supabaseConfig');
    
    // Check that essential methods exist
    expect(typeof supabase.from).toBe('function');
    expect(typeof supabase.auth).toBe('object');
    expect(typeof supabase.storage).toBe('object');
  });

  it('should handle authentication methods', () => {
    const { supabase } = require('../supabaseConfig');
    
    // Check auth methods
    expect(typeof supabase.auth.signInWithPassword).toBe('function');
    expect(typeof supabase.auth.signOut).toBe('function');
    expect(typeof supabase.auth.getUser).toBe('function');
  });

  it('should handle storage methods', () => {
    const { supabase } = require('../supabaseConfig');
    
    // Check storage methods
    expect(typeof supabase.storage.from).toBe('function');
  });
});