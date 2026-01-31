import type { UserRole, UserExtraRole } from './common';

export type { UserRole, UserExtraRole };

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