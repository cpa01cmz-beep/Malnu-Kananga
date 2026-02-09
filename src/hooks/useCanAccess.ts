import { useCallback, useMemo } from 'react';
import { AccessResult, UserExtraRole, UserRole } from '../types/permissions';
import { permissionService } from '../services/permissionService';
import { useAuth } from './useAuth';
import { USER_ROLES } from '../constants';

export interface UseCanAccessResult {
  canAccess: boolean;
  reason?: string;
  requiredPermission: string;
}

/**
 * Hook for standardized permission checking with automatic user detection
 * 
 * Uses reactive auth state (useAuth) to ensure permission checks
 * always use current user data, preventing stale permission states.
 */
export const useCanAccess = (context?: {
  userId?: string;
  ip?: string;
  userAgent?: string;
}) => {
  // Get current user from reactive auth state
  const { user } = useAuth();
  const userRole: UserRole = user?.role || USER_ROLES.STUDENT;
  const userExtraRole: UserExtraRole = (user?.extraRole as UserExtraRole) || null;

  /**
   * Check if user can access a specific permission
   */
  const canAccess = useCallback((permissionId: string): UseCanAccessResult => {
    const result: AccessResult = permissionService.hasPermission(
      userRole,
      userExtraRole,
      permissionId,
      {
        userId: context?.userId || user?.id,
        ip: context?.ip,
        userAgent: context?.userAgent
      }
    );

    return {
      canAccess: result.granted,
      reason: result.reason,
      requiredPermission: permissionId
    };
  }, [userRole, userExtraRole, user, context]);

  /**
   * Check if user can access any of the specified permissions
   */
  const canAccessAny = useCallback((permissionIds: string[]): UseCanAccessResult => {
    const result: AccessResult = permissionService.hasAnyPermission(
      userRole,
      userExtraRole,
      permissionIds,
      {
        userId: context?.userId || user?.id,
        ip: context?.ip,
        userAgent: context?.userAgent
      }
    );

    return {
      canAccess: result.granted,
      reason: result.reason,
      requiredPermission: permissionIds.join(' OR ')
    };
  }, [userRole, userExtraRole, user, context]);

  /**
   * Check if user can access a specific resource/action combination
   */
  const canAccessResource = useCallback((resource: string, action: string): UseCanAccessResult => {
    const permissionId = `${resource}.${action}`;
    return canAccess(permissionId);
  }, [canAccess]);

  // Get all user permissions
  const userPermissions = useMemo(() => {
    const permissions = permissionService.getUserPermissions(userRole, userExtraRole);
    return Array.isArray(permissions) ? permissions : [];
  }, [userRole, userExtraRole]);

  // Get all user permission IDs
  const userPermissionIds = useMemo(() => {
    return userPermissions.map(p => p.id);
  }, [userPermissions]);

  return {
    user,
    userRole,
    userExtraRole,
    canAccess,
    canAccessAny,
    canAccessResource,
    userPermissions,
    userPermissionIds
  };
};