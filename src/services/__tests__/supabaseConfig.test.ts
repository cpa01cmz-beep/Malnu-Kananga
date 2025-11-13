// Simple test runner for Supabase integration
import { supabase } from './supabaseConfig';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection by querying a non-existent table
    // This will verify that the client is properly configured
    const { data, error } = await supabase
      .from('non_existent_test_table')
      .select('count')
      .limit(1);

    // We expect an error for a non-existent table, which confirms the connection works
    if (error && error.message.includes('non_existent_test_table')) {
      console.log('✅ Supabase client is properly configured');
      console.log('✅ Connection to Supabase successful');
      return true;
    } else if (error) {
      console.log('❌ Unexpected error:', error.message);
      return false;
    } else {
      // This shouldn't happen, but if it does, the connection is working
      console.log('✅ Supabase client is properly configured');
      console.log('✅ Connection to Supabase successful');
      return true;
    }
  } catch (error) {
    console.log('❌ Supabase connection test failed:', error);
    return false;
  }
}

// Run the test
testSupabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Supabase integration is ready to use!');
      console.log('\nTo enable Supabase integration:');
      console.log('1. Set VITE_USE_SUPABASE=true in your .env file');
      console.log('2. Add your Supabase URL and anon key to the environment variables');
      console.log('3. Run the database migrations');
    } else {
      console.log('\n❌ Supabase integration test failed.');
      console.log('Please check your configuration and try again.');
    }
  });