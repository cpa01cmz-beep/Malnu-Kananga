// Supabase API Service - Bridge between existing API and Supabase
import { supabase } from './supabaseConfig';
import { SupabaseDatabaseService } from './supabaseDatabaseService';
import { User } from './authService';

export class SupabaseApiService {
  // Get user profile based on role using Supabase
  static async getUserProfile(userId: string, role: string): Promise<any | null> {
    return await SupabaseDatabaseService.getUserProfile(userId, role);
  }

  // Create user profile based on role using Supabase
  static async createUserProfile(userId: string, role: string, profileData: any): Promise<any | null> {
    return await SupabaseDatabaseService.createUserProfile(userId, role, profileData);
  }

  // Get announcements from Supabase
  static async getAnnouncements(limit = 10, offset = 0): Promise<any[]> {
    const result = await SupabaseDatabaseService.getAnnouncements(limit, offset);
    return result.data;
  }

  // Create announcement in Supabase
  static async createAnnouncement(announcement: any): Promise<any | null> {
    return await SupabaseDatabaseService.createAnnouncement(announcement);
  }

  // Get assignments by class from Supabase
  static async getAssignmentsByClass(classId: string, limit = 10, offset = 0): Promise<any[]> {
    const result = await SupabaseDatabaseService.getAssignmentsByClass(classId, limit, offset);
    return result.data;
  }

  // Create assignment in Supabase
  static async createAssignment(assignment: any): Promise<any | null> {
    return await SupabaseDatabaseService.createAssignment(assignment);
  }

  // Sync user data between local storage and Supabase
  static async syncUserData(localUser: User): Promise<void> {
    try {
      // Get current user from Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No authenticated user found for sync.');
        return;
      }

      // Determine user role and sync profile accordingly
      const { data: existingProfile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile && localUser.role === 'student') {
        // Create student profile if it doesn't exist
        await supabase
          .from('student_profiles')
          .insert({
            user_id: user.id,
            name: localUser.name || localUser.email.split('@')[0],
            email: localUser.email,
            class: 'Unknown', // Default class, can be updated later
          });
      }

      // Similar logic can be implemented for teachers and parents
      if (!existingProfile && localUser.role === 'teacher') {
        await supabase
          .from('teacher_profiles')
          .insert({
            user_id: user.id,
            name: localUser.name || localUser.email.split('@')[0],
            email: localUser.email,
            subject: 'General', // Default subject, can be updated later
          });
      }

      if (!existingProfile && localUser.role === 'parent') {
        await supabase
          .from('parent_profiles')
          .insert({
            user_id: user.id,
            name: localUser.name || localUser.email.split('@')[0],
            email: localUser.email,
          });
      }

      console.log('User data synced successfully.');
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  }

  // Listen for Auth state changes and sync accordingly
  static setupAuthListener(): void {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user?.email);
        // Perform any required actions when user signs in
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        // Perform any required actions when user signs out
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
        // Perform any required actions when token is refreshed
      } else if (event === 'USER_UPDATED') {
        console.log('User updated');
        // Perform any required actions when user is updated
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery initiated');
        // Perform any required actions during password recovery
      } else if (event === 'MFA_CHALLENGE') {
        console.log('MFA challenge');
        // Perform any required actions during MFA challenge
      }
    });
  }

  // Initialize the service with necessary setup
  static initialize(): void {
    // Setup auth listener for real-time updates
    this.setupAuthListener();
  }
}

export default SupabaseApiService;