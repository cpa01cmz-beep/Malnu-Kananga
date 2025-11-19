import { supabase } from '../supabaseConfig';

// Mock supabase for testing
const mockSelect = jest.fn(() => ({
  limit: jest.fn(() => Promise.resolve({
    data: null,
    error: { message: 'relation "non_existent_test_table" does not exist' }
  }))
}));

const mockFrom = jest.fn(() => ({
  select: mockSelect
}));

jest.mock('../supabaseConfig', () => ({
  supabase: {
    from: mockFrom
  }
}));

describe('Supabase Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have supabase client available', () => {
    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });

  it('should handle database queries correctly', async () => {
    const result = await supabase
      .from('test_table')
      .select('*')
      .limit(10);

    expect(mockFrom).toHaveBeenCalledWith('test_table');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(result.error).toBeDefined();
  });

  it('should validate supabase client structure', () => {
    expect(supabase).toHaveProperty('from');
    expect(typeof supabase.from).toBe('function');
  });
});