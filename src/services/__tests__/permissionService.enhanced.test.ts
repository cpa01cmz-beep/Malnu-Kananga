import { describe, test, expect, beforeEach } from 'vitest';
import { permissionService } from '../permissionService';
import { UserRole, UserExtraRole } from '../../types/permissions';

describe('PermissionService - Enhanced Validation', () => {
  beforeEach(() => {
    // Clear audit logs before each test
    permissionService.getAuditLogs = () => [];
  });

  describe('Input Validation', () => {
    test('should reject invalid user roles', () => {
      const result = permissionService.hasPermission(
        'invalid_role' as UserRole,
        null,
        'users.read'
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid role combination');
    });

    test('should reject null user roles', () => {
      const result = permissionService.hasPermission(
        null as unknown as UserRole,
        null,
        'users.read'
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid user role');
    });

    test('should reject invalid permission IDs', () => {
      const result = permissionService.hasPermission(
        'admin',
        null,
        '' // Empty permission ID
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid permission ID');
    });

    test('should reject null permission IDs', () => {
      const result = permissionService.hasPermission(
        'admin',
        null,
        null as unknown as string
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid permission ID');
    });

    test('should handle non-existent permissions gracefully', () => {
      const result = permissionService.hasPermission(
        'admin',
        null,
        'non.existent.permission'
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain("Permission 'non.existent.permission' does not exist");
    });
  });

  describe('Role Combination Validation', () => {
    test('should reject admin with extra role', () => {
      const result = permissionService.hasPermission(
        'admin',
        'staff',
        'users.read'
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid role combination');
    });

    test('should reject teacher with osis extra role', () => {
      const result = permissionService.hasPermission(
        'teacher',
        'osis',
        'users.read'
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid role combination');
    });

    test('should reject student with staff extra role', () => {
      const result = permissionService.hasPermission(
        'student',
        'staff',
        'users.read'
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid role combination');
    });

    test('should reject parent with any extra role', () => {
      const result = permissionService.hasPermission(
        'parent',
        'osis',
        'parent.monitor'
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid role combination');
    });

    test('should allow teacher with wakasek extra role', () => {
      const result = permissionService.hasPermission(
        'teacher',
        'wakasek',
        'academic.oversight'
      );

      expect(result.granted).toBe(true);
    });
  });

  describe('hasAnyPermission Validation', () => {
    test('should reject empty permissions array', () => {
      const result = permissionService.hasAnyPermission(
        'admin',
        null,
        []
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid permissions array');
    });

    test('should reject null permissions array', () => {
      const result = permissionService.hasAnyPermission(
        'admin',
        null,
        null as unknown as string[]
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid permissions array');
    });

    test('should skip invalid permission IDs in array', () => {
      const result = permissionService.hasAnyPermission(
        'admin',
        null,
        ['users.read', null as unknown as string, '', 'system.stats']
      );

      expect(result.granted).toBe(true); // Should grant on valid permissions
    });

    test('should provide detailed error message when no permissions granted', () => {
      const result = permissionService.hasAnyPermission(
        'student',
        null,
        ['users.delete', 'system.admin']
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('None of the required permissions [users.delete, system.admin]');
    });
  });

  describe('canAccessResource Validation', () => {
    test('should reject empty resource', () => {
      const result = permissionService.canAccessResource(
        'admin',
        null,
        '',
        'read'
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid resource provided');
    });

    test('should reject empty action', () => {
      const result = permissionService.canAccessResource(
        'admin',
        null,
        'users',
        ''
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid action provided');
    });

    test('should sanitize resource and action inputs', () => {
      const result = permissionService.canAccessResource(
        'admin',
        null,
        'users<script>',
        'read;malicious'
      );

 expect(result.granted).toBe(true);
      expect(result.requiredPermission).toBe('users.read');
    });

    test('should handle null resource', () => {
      const result = permissionService.canAccessResource(
        'admin',
        null,
        null as unknown as string,
        'read'
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid resource provided');
    });

    test('should handle null action', () => {
      const result = permissionService.canAccessResource(
        'admin',
        null,
        'users',
        null as unknown as string
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Invalid action provided');
    });
  });

  describe('Security Enhancements', () => {
    test('should prevent prototype pollution in getPermission', () => {
      const result = permissionService.getPermission('__proto__.polluted');
      
      expect(result).toBe(null);
    });

    test('should prevent constructor pollution in getPermission', () => {
      const result = permissionService.getPermission('constructor.polluted');
      
      expect(result).toBe(null);
    });

    test('should sanitize inputs to prevent code injection', () => {
      const maliciousInput = 'users.__proto__.toString';
      const result = permissionService.canAccessResource(
        'admin',
        null,
        maliciousInput,
        'constructor'
      );

      // Should sanitize the input and treat as normal permission check
      expect(result.granted).toBe(false);
    });
  });

  describe('Error Message Improvements', () => {
    test('should include extra role in error messages', () => {
      const result = permissionService.hasPermission(
        'admin',
        'staff', // Invalid combination
        'users.read'
      );

      expect(result.reason).toContain('admin + staff');
    });

    test('should include permission name in error messages', () => {
      const result = permissionService.hasPermission(
        'student',
        null,
        'users.delete'
      );

      expect(result.reason).toContain('Delete Users');
    });

    test('should provide clear permission existence error', () => {
      const result = permissionService.hasPermission(
        'admin',
        null,
        'custom.unknown.permission'
      );

      expect(result.reason).toContain('custom.unknown.permission');
      expect(result.reason).toContain('does not exist');
    });
  });

  describe('getUserPermissions Validation', () => {
    test('should return empty array for invalid roles', () => {
      const permissions = permissionService.getUserPermissions(
        'invalid_role' as UserRole,
        null
      );

      expect(permissions).toEqual([]);
    });

    test('should return empty array for null roles', () => {
      const permissions = permissionService.getUserPermissions(
        null as unknown as UserRole,
        null
      );

      expect(permissions).toEqual([]);
    });

    test('should handle invalid role combinations', () => {
      const permissions = permissionService.getUserPermissions(
        'student',
        'staff' // Invalid combination
      );

      expect(permissions).toEqual([]);
    });

    test('should filter out invalid permission IDs', () => {
      const permissions = permissionService.getUserPermissions(
        'parent',
        null
      );

      const validPermissions = permissions.filter(p => 
        p && typeof p.id === 'string' && p.id.length > 0
      );
  
      expect(permissions).toEqual(validPermissions);
    });
  });

  describe('Audit Logging Security', () => {
    test('should log permission checks with context', () => {
      const context = {
        userId: 'test-user-123',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test Browser'
      };

      permissionService.hasPermission(
        'admin',
        null,
        'users.read',
        context
      );

      const logs = permissionService.getAuditLogs({ userId: 'test-user-123' });
      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBe('test-user-123');
      expect(logs[0].ip).toBe('192.168.1.1');
      expect(logs[0].userAgent).toBe('Mozilla/5.0 Test Browser');
    });

    test('should handle missing context gracefully', () => {
      permissionService.hasPermission(
        'admin',
        null,
        'users.read'
      );

      const logs = permissionService.getAuditLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBe('unknown');
    });
  });
});