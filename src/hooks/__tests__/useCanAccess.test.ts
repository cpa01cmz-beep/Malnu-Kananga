import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCanAccess } from '../useCanAccess';

// Mock useAuth hook
vi.mock('../useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../useAuth';
import type { User } from '../../types';

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

// Mock permissionService methods
const mockHasPermission = vi.fn();
const mockHasAnyPermission = vi.fn();
const mockGetUserPermissions = vi.fn();

vi.mock('../../services/permissionService', () => ({
  permissionService: {
    hasPermission: (...args: unknown[]) => mockHasPermission(...args),
    hasAnyPermission: (...args: unknown[]) => mockHasAnyPermission(...args),
    getUserPermissions: (...args: unknown[]) => mockGetUserPermissions(...args),
  },
}));

describe('useCanAccess Hook', () => {
  const mockUser: User = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'teacher',
    status: 'active',
    extraRole: 'wakasek',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      refreshAuth: vi.fn(),
    });
  });

  describe('Initialization', () => {
    it('should return user data from useAuth', () => {
      const { result } = renderHook(() => useCanAccess());

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.userRole).toBe('teacher');
      expect(result.current.userExtraRole).toBe('wakasek');
    });

    it('should default to student role when user is null', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        refreshAuth: vi.fn(),
      });

      const { result } = renderHook(() => useCanAccess());

      expect(result.current.user).toBeNull();
      expect(result.current.userRole).toBe('student');
      expect(result.current.userExtraRole).toBeNull();
    });
  });

  describe('canAccess Function', () => {
    it('should call permissionService.hasPermission with correct parameters', () => {
      mockHasPermission.mockReturnValue({ granted: true });

      const { result } = renderHook(() => useCanAccess());
      const permissionId = 'academic.grades.view';

      result.current.canAccess(permissionId);

      expect(mockHasPermission).toHaveBeenCalledWith(
        'teacher',
        'wakasek',
        permissionId,
        {
          userId: 'user-123',
          ip: undefined,
          userAgent: undefined,
        }
      );
    });

    it('should return granted permission', () => {
      mockHasPermission.mockReturnValue({
        granted: true,
        reason: 'Permission granted',
      });

      const { result } = renderHook(() => useCanAccess());
      const accessResult = result.current.canAccess('academic.grades.view');

      expect(accessResult.canAccess).toBe(true);
      expect(accessResult.reason).toBe('Permission granted');
      expect(accessResult.requiredPermission).toBe('academic.grades.view');
    });

    it('should return denied permission', () => {
      mockHasPermission.mockReturnValue({
        granted: false,
        reason: 'Insufficient permissions',
      });

      const { result } = renderHook(() => useCanAccess());
      const accessResult = result.current.canAccess('admin.users.delete');

      expect(accessResult.canAccess).toBe(false);
      expect(accessResult.reason).toBe('Insufficient permissions');
      expect(accessResult.requiredPermission).toBe('admin.users.delete');
    });

    it('should use custom context when provided', () => {
      mockHasPermission.mockReturnValue({ granted: true });

      const { result } = renderHook(() => useCanAccess({
        userId: 'custom-user-id',
        ip: '192.168.1.1',
        userAgent: 'TestAgent/1.0',
      }));

      result.current.canAccess('academic.grades.view');

      expect(mockHasPermission).toHaveBeenCalledWith(
        'teacher',
        'wakasek',
        'academic.grades.view',
        {
          userId: 'custom-user-id',
          ip: '192.168.1.1',
          userAgent: 'TestAgent/1.0',
        }
      );
    });
  });

  describe('canAccessAny Function', () => {
    it('should call permissionService.hasAnyPermission with correct parameters', () => {
      mockHasAnyPermission.mockReturnValue({ granted: true });

      const { result } = renderHook(() => useCanAccess());
      const permissionIds = ['academic.grades.view', 'academic.grades.edit'];

      result.current.canAccessAny(permissionIds);

      expect(mockHasAnyPermission).toHaveBeenCalledWith(
        'teacher',
        'wakasek',
        permissionIds,
        {
          userId: 'user-123',
          ip: undefined,
          userAgent: undefined,
        }
      );
    });

    it('should return granted when any permission is granted', () => {
      mockHasAnyPermission.mockReturnValue({
        granted: true,
        reason: 'At least one permission granted',
      });

      const { result } = renderHook(() => useCanAccess());
      const accessResult = result.current.canAccessAny(['admin.users.view', 'academic.grades.view']);

      expect(accessResult.canAccess).toBe(true);
      expect(accessResult.reason).toBe('At least one permission granted');
    });

    it('should return denied when no permissions are granted', () => {
      mockHasAnyPermission.mockReturnValue({
        granted: false,
        reason: 'None of the permissions are granted',
      });

      const { result } = renderHook(() => useCanAccess());
      const accessResult = result.current.canAccessAny(['admin.users.delete', 'admin.system.config']);

      expect(accessResult.canAccess).toBe(false);
      expect(accessResult.reason).toBe('None of the permissions are granted');
    });

    it('should join permission IDs in requiredPermission field', () => {
      mockHasAnyPermission.mockReturnValue({
        granted: false,
        reason: 'None of the permissions are granted',
      });

      const { result } = renderHook(() => useCanAccess());
      const permissionIds = ['perm1', 'perm2', 'perm3'];

      const accessResult = result.current.canAccessAny(permissionIds);

      expect(accessResult.requiredPermission).toBe('perm1 OR perm2 OR perm3');
    });
  });

  describe('canAccessResource Function', () => {
    it('should construct permission ID from resource and action', () => {
      mockHasPermission.mockReturnValue({ granted: true });

      const { result } = renderHook(() => useCanAccess());

      result.current.canAccessResource('academic', 'grades.view');

      expect(mockHasPermission).toHaveBeenCalledWith(
        'teacher',
        'wakasek',
        'academic.grades.view',
        {
          userId: 'user-123',
          ip: undefined,
          userAgent: undefined,
        }
      );
    });
  });

  describe('userPermissions Property', () => {
    it('should return user permissions from permissionService', () => {
      const mockPermissions = [
        { id: 'academic.grades.view', name: 'View Grades', description: 'View student grades', resource: 'academic', action: 'grades.view' },
        { id: 'academic.grades.edit', name: 'Edit Grades', description: 'Edit student grades', resource: 'academic', action: 'grades.edit' },
      ];

      mockGetUserPermissions.mockReturnValue(mockPermissions);

      const { result } = renderHook(() => useCanAccess());

      expect(result.current.userPermissions).toEqual(mockPermissions);
    });

    it('should handle empty permissions array', () => {
      mockGetUserPermissions.mockReturnValue([]);

      const { result } = renderHook(() => useCanAccess());

      expect(result.current.userPermissions).toEqual([]);
    });
  });

  describe('userPermissionIds Property', () => {
    it('should return array of permission IDs', () => {
      const mockPermissions = [
        { id: 'academic.grades.view', name: 'View Grades', description: 'View student grades', resource: 'academic', action: 'grades.view' },
        { id: 'academic.grades.edit', name: 'Edit Grades', description: 'Edit student grades', resource: 'academic', action: 'grades.edit' },
      ];

      mockGetUserPermissions.mockReturnValue(mockPermissions);

      const { result } = renderHook(() => useCanAccess());

      expect(result.current.userPermissionIds).toEqual(['academic.grades.view', 'academic.grades.edit']);
    });

    it('should return empty array when no permissions', () => {
      mockGetUserPermissions.mockReturnValue([]);

      const { result } = renderHook(() => useCanAccess());

      expect(result.current.userPermissionIds).toEqual([]);
    });
  });
});
