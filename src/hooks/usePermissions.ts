import { useState, useCallback, useMemo } from 'react';
import { UserRole, UserExtraRole } from '../types/permissions';
import { permissionService } from '../services/permissionService';

/**
 * Custom hook for managing permissions in React components
 */
export const usePermissions = (
  userRole: UserRole,
  userExtraRole: UserExtraRole,
  context?: {
    userId?: string;
    ip?: string;
    userAgent?: string;
  }
) => {
  const [lastCheckResult, setLastCheckResult] = useState<any>(null);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback((permissionId: string) => {
    const result = permissionService.hasPermission(userRole, userExtraRole, permissionId, context);
    setLastCheckResult(result);
    return result.granted;
  }, [userRole, userExtraRole, context]);

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback((permissionIds: string[]) => {
    const result = permissionService.hasAnyPermission(userRole, userExtraRole, permissionIds, context);
    setLastCheckResult(result);
    return result.granted;
  }, [userRole, userExtraRole, context]);

  /**
   * Check if user can access a specific resource/action combination
   */
  const canAccessResource = useCallback((resource: string, action: string) => {
    const result = permissionService.canAccessResource(userRole, userExtraRole, resource, action, context);
    setLastCheckResult(result);
    return result.granted;
  }, [userRole, userExtraRole, context]);

  /**
   * Get all permissions for the current user
   */
  const userPermissions = useMemo(() => {
    return permissionService.getUserPermissions(userRole, userExtraRole);
  }, [userRole, userExtraRole]);

  /**
   * Get all permission IDs for the current user
   */
  const userPermissionIds = useMemo(() => {
    return userPermissions.map(p => p.id);
  }, [userPermissions]);

  return {
    hasPermission,
    hasAnyPermission,
    canAccessResource,
    userPermissions,
    userPermissionIds,
    lastCheckResult
  };
};