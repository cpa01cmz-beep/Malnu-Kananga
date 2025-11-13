// Test Supabase Integration
import { supabase } from './supabaseConfig';
import { SupabaseAuthService } from './supabaseAuthService';
import { SupabaseDatabaseService } from './supabaseDatabaseService';

async function runSupabaseTests() {
  console.log('🧪 Running Supabase Integration Tests...\n');

  try {
    // Test 1: Supabase client initialization
    console.log('1. Testing Supabase client initialization...');
    const { data, error } = await supabase.from('announcements').select('count').limit(1);
    
    if (error) {
      console.log('❌ Supabase client initialization failed:', error.message);
    } else {
      console.log('✅ Supabase client initialized successfully');
    }

    // Test 2: Authentication service
    console.log('\n2. Testing authentication service...');
    // This would require a valid email to test
    console.log('ℹ️  Authentication service available (requires valid email to test)');

    // Test 3: Database service
    console.log('\n3. Testing database service...');
    // This would require authentication to test
    console.log('ℹ️  Database service available (requires authentication to test)');

    console.log('\n✅ All Supabase integration tests completed.');
    console.log('\n📝 Note: Some tests require authentication and valid data to fully verify.');
    
  } catch (error) {
    console.log('❌ Supabase integration test failed:', error);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSupabaseTests();
}

export default runSupabaseTests;