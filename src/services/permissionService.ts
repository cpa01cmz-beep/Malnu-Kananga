import { Permission, UserRole, UserExtraRole, AccessResult, AuditLog } from '../types/permissions';
import { PERMISSIONS, ROLE_PERMISSION_MATRIX, EXTRA_ROLE_PERMISSIONS } from '../config/permissions';

class PermissionService {
  private auditLogs: AuditLog[] = [];

  /**
   * Check if a user has permission for a specific action
   */
  hasPermission(
    userRole: UserRole,
    userExtraRole: UserExtraRole,
    permissionId: string,
    context?: {
      userId?: string;
      ip?: string;
      userAgent?: string;
    }
  ): AccessResult {
    const permission = PERMISSIONS[permissionId];
    
    if (!permission) {
      return {
        granted: false,
        reason: 'Permission does not exist',
        requiredPermission: permissionId
      };
    }

    const rolePermissions = ROLE_PERMISSION_MATRIX[userRole] || [];
    const extraPermissions = userExtraRole ? EXTRA_ROLE_PERMISSIONS[userExtraRole] || [] : [];
    const allPermissions = [...rolePermissions, ...extraPermissions];

    const granted = allPermissions.includes(permissionId);

    // Log the access attempt
    this.logAccess({
      userId: context?.userId || 'unknown',
      userRole,
      userExtraRole,
      resource: permission.resource,
      action: permission.action,
      granted,
      timestamp: new Date(),
      ip: context?.ip,
      userAgent: context?.userAgent
    });

    return {
      granted,
      reason: granted ? undefined : `Permission '${permission.name}' not granted for role '${userRole}'`,
      requiredPermission: permissionId
    };
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(
    userRole: UserRole,
    userExtraRole: UserExtraRole,
    permissionIds: string[],
    context?: {
      userId?: string;
      ip?: string;
      userAgent?: string;
    }
  ): AccessResult {
    for (const permissionId of permissionIds) {
      const result = this.hasPermission(userRole, userExtraRole, permissionId, context);
      if (result.granted) {
        return result;
      }
    }

    return {
      granted: false,
      reason: `None of the required permissions are granted for role '${userRole}'`
    };
  }

  /**
   * Get all permissions for a user role
   */
  getUserPermissions(userRole: UserRole, userExtraRole: UserExtraRole): Permission[] {
    const rolePermissionIds = ROLE_PERMISSION_MATRIX[userRole] || [];
    const extraPermissionIds = userExtraRole ? EXTRA_ROLE_PERMISSIONS[userExtraRole] || [] : [];
    const allPermissionIds = [...new Set([...rolePermissionIds, ...extraPermissionIds])];

    return allPermissionIds
      .map(id => PERMISSIONS[id])
      .filter(Boolean);
  }

  /**
   * Check if user can access a specific resource
   */
  canAccessResource(
    userRole: UserRole,
    userExtraRole: UserExtraRole,
    resource: string,
    action: string,
    context?: {
      userId?: string;
      ip?: string;
      userAgent?: string;
    }
  ): AccessResult {
    const permissionId = `${resource}.${action}`;
    return this.hasPermission(userRole, userExtraRole, permissionId, context);
  }

  /**
   * Log access attempts for audit trail
   */
  private logAccess(log: AuditLog): void {
    this.auditLogs.push(log);
    
    // Keep only last 1000 logs to prevent memory issues
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }

// In production, this would be sent to a logging service
    if (import.meta.env.DEV) {
      console.log('Permission Check:', {
        timestamp: log.timestamp.toISOString(),
        userId: log.userId,
        role: log.userRole,
        extraRole: log.userExtraRole,
        resource: log.resource,
        action: log.action,
        granted: log.granted
      });
    }
  }

  /**
   * Get audit logs for a user or time period
   */
  getAuditLogs(filters?: {
    userId?: string;
    userRole?: UserRole;
    granted?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): AuditLog[] {
    let logs = [...this.auditLogs];

    if (filters?.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }

    if (filters?.userRole) {
      logs = logs.filter(log => log.userRole === filters.userRole);
    }

    if (filters?.granted !== undefined) {
      logs = logs.filter(log => log.granted === filters.granted);
    }

    if (filters?.startDate) {
      logs = logs.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      logs = logs.filter(log => log.timestamp <= filters.endDate!);
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get all available permissions
   */
  getAllPermissions(): Permission[] {
    return Object.values(PERMISSIONS);
  }

  /**
   * Get permission by ID
   */
  getPermission(permissionId: string): Permission | null {
    return PERMISSIONS[permissionId] || null;
  }

  /**
   * Validate role and extra role combination
   */
  isValidRoleCombination(userRole: UserRole, userExtraRole: UserExtraRole): boolean {
    // Based on existing validation rules from UserManagement.tsx
    if (userRole === 'admin') return userExtraRole === null;
    if (userRole === 'teacher' && userExtraRole === 'osis') return false;
    if (userRole === 'student' && userExtraRole === 'staff') return false;
    return true;
  }
}

export const permissionService = new PermissionService();