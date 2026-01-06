// Type definitions for common user-related interfaces
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'staff' | 'osis';
export type UserExtraRole = UserRole | null;

export interface UserPermission {
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  extraRole?: UserExtraRole;
  name: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCheckOptions {
  userId?: string;
  ip?: string;
  userAgent?: string;
  timestamp?: Date;
}