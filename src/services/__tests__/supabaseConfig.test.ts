// Test file for Supabase configuration
import { supabase } from '../supabaseConfig';

describe('Supabase Config', () => {
  it('should export supabase client', () => {
    expect(supabase).toBeDefined();
  });

  it('should have correct client structure', () => {
    expect(typeof supabase.from).toBe('function');
    expect(typeof supabase.auth).toBe('object');
  });

  // Note: Actual connection tests are handled by the separate test runner
  // This file ensures Jest has at least one test to run
});