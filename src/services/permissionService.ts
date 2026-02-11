import { Permission, UserRole, UserExtraRole, AccessResult, AuditLog } from '../types/permissions';
import { PERMISSIONS, ROLE_PERMISSION_MATRIX, EXTRA_ROLE_PERMISSIONS } from '../config/permissions';
import { logger } from '../utils/logger';
import { PERMISSION_CONFIG, USER_ROLES, USER_EXTRA_ROLES } from '../constants';

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
    // Input validation
    if (!userRole || typeof userRole !== 'string') {
      return {
        granted: false,
        reason: 'Invalid user role provided',
        requiredPermission: permissionId
      };
    }

    if (!permissionId || typeof permissionId !== 'string') {
      return {
        granted: false,
        reason: 'Invalid permission ID provided',
        requiredPermission: permissionId
      };
    }

    const permission = PERMISSIONS[permissionId];
    
    if (!permission) {
      return {
        granted: false,
        reason: `Permission '${permissionId}' does not exist`,
        requiredPermission: permissionId
      };
    }

    // Validate role combination first
    if (!this.isValidRoleCombination(userRole, userExtraRole)) {
      return {
        granted: false,
        reason: `Invalid role combination: ${userRole} + ${userExtraRole}`,
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
      reason: granted ? undefined : `Permission '${permission.name}' not granted for role '${userRole}'${userExtraRole ? ` with extra role '${userExtraRole}'` : ''}`,
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
    // Input validation
    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      return {
        granted: false,
        reason: 'Invalid permissions array provided'
      };
    }

    for (const permissionId of permissionIds) {
      if (!permissionId || typeof permissionId !== 'string') {
        continue; // Skip invalid permission IDs
      }
      const result = this.hasPermission(userRole, userExtraRole, permissionId, context);
      if (result.granted) {
        return result;
      }
    }

    return {
      granted: false,
      reason: `None of the required permissions [${permissionIds.join(', ')}] are granted for role '${userRole}'${userExtraRole ? ` with extra role '${userExtraRole}'` : ''}`
    };
  }

  /**
   * Get all permissions for a user role
   */
  getUserPermissions(userRole: UserRole, userExtraRole: UserExtraRole): Permission[] {
    // Input validation
    if (!userRole || typeof userRole !== 'string') {
      return [];
    }

    if (!this.isValidRoleCombination(userRole, userExtraRole)) {
      return [];
    }

    const rolePermissionIds = ROLE_PERMISSION_MATRIX[userRole] || [];
    const extraPermissionIds = userExtraRole ? EXTRA_ROLE_PERMISSIONS[userExtraRole] || [] : [];
    const allPermissionIds = rolePermissionIds.concat(extraPermissionIds).filter((id, index, arr) => arr.indexOf(id) === index);

    return allPermissionIds
      .filter(id => id && typeof id === 'string') // Filter out invalid permission IDs
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
    // Input validation
    if (!resource || typeof resource !== 'string') {
      return {
        granted: false,
        reason: 'Invalid resource provided'
      };
    }

    if (!action || typeof action !== 'string') {
      return {
        granted: false,
        reason: 'Invalid action provided'
      };
    }

    // Sanitize inputs to prevent injection
    // Remove HTML tags, then split on special characters and take the first meaningful part
    const sanitizedResource = resource.replace(/<[^>]*>/g, '').split(/[^a-zA-Z0-9_]/)[0] || '';
    const sanitizedAction = action.replace(/<[^>]*>/g, '').split(/[^a-zA-Z0-9_]/)[0] || '';
    
    const permissionId = `${sanitizedResource}.${sanitizedAction}`;
    return this.hasPermission(userRole, userExtraRole, permissionId, context);
  }

  /**
   * Log access attempts for audit trail
   */
  private logAccess(log: AuditLog): void {
    this.auditLogs.push(log);
    
    // Keep only last MAX_AUDIT_LOGS logs to prevent memory issues
    if (this.auditLogs.length > PERMISSION_CONFIG.MAX_AUDIT_LOGS) {
      this.auditLogs = this.auditLogs.slice(-PERMISSION_CONFIG.MAX_AUDIT_LOGS);
    }

// In production, this would be sent to a logging service
    logger.info('Permission Check:', {
      timestamp: log.timestamp.toISOString(),
      userId: log.userId,
      role: log.userRole,
      extraRole: log.userExtraRole,
      resource: log.resource,
      action: log.action,
      granted: log.granted
    });
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
   * Clear all audit logs (for testing purposes)
   */
  clearAuditLogs(): void {
    this.auditLogs = [];
  }

  /**
   * Get all available permissions
   */
  getAllPermissions(): Permission[] {
    const permissions: Permission[] = [];
    for (const key in PERMISSIONS) {
      if (Object.prototype.hasOwnProperty.call(PERMISSIONS, key)) {
        permissions.push(PERMISSIONS[key]);
      }
    }
    return permissions;
  }

  /**
   * Get permission by ID
   */
  getPermission(permissionId: string): Permission | null {
    // Input validation
    if (!permissionId || typeof permissionId !== 'string') {
      return null;
    }

    // Prevent prototype pollution
    if (permissionId.indexOf('__proto__') !== -1 || permissionId.indexOf('constructor') !== -1 || permissionId.indexOf('prototype') !== -1) {
      logger.warn('Potential prototype pollution attempt in getPermission', { permissionId });
      return null;
    }

    return PERMISSIONS[permissionId] || null;
  }

  /**
   * Validate role and extra role combination
   */
  isValidRoleCombination(userRole: UserRole, userExtraRole: UserExtraRole): boolean {
    // Input validation
    if (!userRole || typeof userRole !== 'string') {
      return false;
    }

    const validRoles: UserRole[] = [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT, USER_ROLES.PARENT];
    if (validRoles.indexOf(userRole) === -1) {
      return false;
    }

    const validExtraRoles: UserExtraRole[] = [USER_EXTRA_ROLES.STAFF, USER_EXTRA_ROLES.OSIS, USER_EXTRA_ROLES.WAKASEK, USER_EXTRA_ROLES.KEPSEK, null];
    if (validExtraRoles.indexOf(userExtraRole) === -1) {
      return false;
    }

    // Based on existing validation rules from UserManagement.tsx
    if (userRole === USER_ROLES.ADMIN) return userExtraRole === null;
    if (userRole === USER_ROLES.TEACHER && userExtraRole === USER_EXTRA_ROLES.OSIS) return false;
    if (userRole === USER_ROLES.STUDENT && userExtraRole === USER_EXTRA_ROLES.STAFF) return false;
    if (userRole === USER_ROLES.PARENT && userExtraRole !== null) return false;
    
    // Academic leadership roles - only teachers can have these extra roles
    if ((userExtraRole === USER_EXTRA_ROLES.WAKASEK || userExtraRole === USER_EXTRA_ROLES.KEPSEK) && userRole !== USER_ROLES.TEACHER) {
      return false;
    }

    // Only one academic leadership role allowed
    if (userExtraRole === USER_EXTRA_ROLES.WAKASEK || userExtraRole === USER_EXTRA_ROLES.KEPSEK) {
      return true; // valid for teachers
    }
    
    return true;
  }
}

export const permissionService = new PermissionService();