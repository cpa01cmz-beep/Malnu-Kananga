export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission['id'][];
}

export interface PermissionMatrix {
  [roleId: string]: Permission['id'][];
}

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';
export type UserExtraRole = 'staff' | 'osis' | 'wakasek' | 'kepsek' | null;

export interface AccessResult {
  granted: boolean;
  reason?: string;
  requiredPermission?: string;
}

export interface AuditLog {
  userId: string;
  userRole: UserRole;
  userExtraRole: UserExtraRole;
  resource: string;
  action: string;
  granted: boolean;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}