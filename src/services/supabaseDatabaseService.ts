// Supabase Database Service
import { supabase } from './supabaseConfig';
import { User } from './authService';

// Define database table types
export interface StudentProfile {
  id: number;
  user_id: string;
  name: string;
  nis: string;
  class: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherProfile {
  id: number;
  user_id: string;
  name: string;
  nip: string;
  subject: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ParentProfile {
  id: number;
  user_id: string;
  name: string;
  email: string;
  student_id: number;
  relationship: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  published: boolean;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  subject: string;
  due_date: string;
  created_by: string;
  class: string;
  created_at: string;
  updated_at: string;
}

// Main Supabase database service
export class SupabaseDatabaseService {
  // Student profiles operations
  static async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting student profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting student profile:', error);
      return null;
    }
  }

  static async createStudentProfile(profile: Omit<StudentProfile, 'id' | 'created_at' | 'updated_at'>): Promise<StudentProfile | null> {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .insert([profile])
        .select()
        .single();

      if (error) {
        console.error('Error creating student profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating student profile:', error);
      return null;
    }
  }

  static async updateStudentProfile(profile: Partial<StudentProfile>, userId: string): Promise<StudentProfile | null> {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .update(profile)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating student profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating student profile:', error);
      return null;
    }
  }

  // Teacher profiles operations
  static async getTeacherProfile(userId: string): Promise<TeacherProfile | null> {
    try {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting teacher profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting teacher profile:', error);
      return null;
    }
  }

  static async createTeacherProfile(profile: Omit<TeacherProfile, 'id' | 'created_at' | 'updated_at'>): Promise<TeacherProfile | null> {
    try {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .insert([profile])
        .select()
        .single();

      if (error) {
        console.error('Error creating teacher profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating teacher profile:', error);
      return null;
    }
  }

  static async updateTeacherProfile(profile: Partial<TeacherProfile>, userId: string): Promise<TeacherProfile | null> {
    try {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .update(profile)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating teacher profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating teacher profile:', error);
      return null;
    }
  }

  // Parent profiles operations
  static async getParentProfile(userId: string): Promise<ParentProfile | null> {
    try {
      const { data, error } = await supabase
        .from('parent_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting parent profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting parent profile:', error);
      return null;
    }
  }

  static async createParentProfile(profile: Omit<ParentProfile, 'id' | 'created_at' | 'updated_at'>): Promise<ParentProfile | null> {
    try {
      const { data, error } = await supabase
        .from('parent_profiles')
        .insert([profile])
        .select()
        .single();

      if (error) {
        console.error('Error creating parent profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating parent profile:', error);
      return null;
    }
  }

  // Announcements operations
  static async getAnnouncements(limit = 10, offset = 0): Promise<{ data: Announcement[]; count: number | null }> {
    try {
      const { data, count, error } = await supabase
        .from('announcements')
        .select('*', { count: 'exact' })
        .eq('published', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error getting announcements:', error);
        return { data: [], count: 0 };
      }

      return { data: data || [], count: count };
    } catch (error) {
      console.error('Error getting announcements:', error);
      return { data: [], count: 0 };
    }
  }

  static async createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<Announcement | null> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert([announcement])
        .select()
        .single();

      if (error) {
        console.error('Error creating announcement:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating announcement:', error);
      return null;
    }
  }

  // Assignments operations
  static async getAssignmentsByClass(classId: string, limit = 10, offset = 0): Promise<{ data: Assignment[]; count: number | null }> {
    try {
      const { data, count, error } = await supabase
        .from('assignments')
        .select('*', { count: 'exact' })
        .eq('class', classId)
        .order('due_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error getting assignments:', error);
        return { data: [], count: 0 };
      }

      return { data: data || [], count: count };
    } catch (error) {
      console.error('Error getting assignments:', error);
      return { data: [], count: 0 };
    }
  }

  static async createAssignment(assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>): Promise<Assignment | null> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert([assignment])
        .select()
        .single();

      if (error) {
        console.error('Error creating assignment:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating assignment:', error);
      return null;
    }
  }

  // Generic user profile operations based on role
  static async getUserProfile(userId: string, role: string): Promise<any | null> {
    switch (role) {
      case 'student':
        return await this.getStudentProfile(userId);
      case 'teacher':
        return await this.getTeacherProfile(userId);
      case 'parent':
        return await this.getParentProfile(userId);
      default:
        return null;
    }
  }

  static async createUserProfile(userId: string, role: string, profileData: any): Promise<any | null> {
    switch (role) {
      case 'student':
        return await this.createStudentProfile({
          ...profileData,
          user_id: userId
        });
      case 'teacher':
        return await this.createTeacherProfile({
          ...profileData,
          user_id: userId
        });
      case 'parent':
        return await this.createParentProfile({
          ...profileData,
          user_id: userId
        });
      default:
        return null;
    }
  }

  static async updateUserProfile(userId: string, role: string, profileData: any): Promise<any | null> {
    switch (role) {
      case 'student':
        return await this.updateStudentProfile(profileData, userId);
      case 'teacher':
        return await this.updateTeacherProfile(profileData, userId);
      case 'parent':
        // Parent profile doesn't need an update method in this implementation
        return null;
      default:
        return null;
    }
  }
}

export default SupabaseDatabaseService;