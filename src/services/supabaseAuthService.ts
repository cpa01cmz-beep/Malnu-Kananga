// Supabase Authentication Service
import { supabase } from './supabaseConfig';
import { User } from './authService';

// Supabase user type mapping
export interface SupabaseUser {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
  };
  created_at: string;
  last_sign_in_at?: string;
  role: string;
}

// Convert Supabase user to our internal User type
function convertSupabaseUser(supabaseUser: SupabaseUser): User {
  // Determine role based on email or user metadata
  let role = 'student'; // default role
  if (supabaseUser.email.includes('admin')) role = 'admin';
  else if (supabaseUser.email.includes('guru') || supabaseUser.email.includes('teacher')) role = 'teacher';
  else if (supabaseUser.email.includes('parent') || supabaseUser.email.includes('ayah') || supabaseUser.email.includes('ibu') || supabaseUser.email.includes('wali')) role = 'parent';

  return {
    id: parseInt(supabaseUser.id.replace(/[^0-9]/g, '')) || Date.now(), // Convert UUID to number for compatibility
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
    role,
    created_at: supabaseUser.created_at,
    updated_at: new Date().toISOString(),
    last_login: supabaseUser.last_sign_in_at,
    is_active: true
  };
}

export class SupabaseAuthService {
  // Request magic link login
  static async requestLoginLink(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-login` // Redirect after login
        }
      });

      if (error) {
        console.error('Supabase login error:', error);
        return {
          success: false,
          message: error.message || 'Gagal mengirim link login'
        };
      }

      return {
        success: true,
        message: 'Link login telah dikirim ke email Anda'
      };
    } catch (error) {
      console.error('Auth service error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan pada server'
      };
    }
  }

  // Verify current session
  static async verifySession(): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Session verification error:', error);
        return {
          success: false,
          message: error.message || 'Gagal memverifikasi sesi'
        };
      }

      if (!session) {
        return {
          success: false,
          message: 'Tidak ada sesi aktif'
        };
      }

      // Convert Supabase user to our internal User type
      const user = convertSupabaseUser(session.user as unknown as SupabaseUser);
      
      return {
        success: true,
        user,
        message: 'Sesi berhasil diverifikasi'
      };
    } catch (error) {
      console.error('Session verification error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat verifikasi sesi'
      };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      return convertSupabaseUser(user as unknown as SupabaseUser);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Sign out
  static async signOut(): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        return {
          success: false,
          message: error.message || 'Gagal logout'
        };
      }

      return {
        success: true,
        message: 'Logout berhasil'
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat logout'
      };
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }

  // Refresh session
  static async refreshSession(): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Session refresh error:', error);
        return {
          success: false,
          message: error.message || 'Gagal refresh sesi'
        };
      }

      if (!data.session) {
        return {
          success: false,
          message: 'Tidak ada sesi untuk di-refresh'
        };
      }

      return {
        success: true,
        message: 'Sesi berhasil di-refresh'
      };
    } catch (error) {
      console.error('Session refresh error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat refresh sesi'
      };
    }
  }
}

export default SupabaseAuthService;