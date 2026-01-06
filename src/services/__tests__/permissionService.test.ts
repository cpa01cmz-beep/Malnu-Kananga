import { describe, it, expect, beforeEach } from 'vitest';
import { permissionService } from '../permissionService';

describe('PermissionService', () => {
  beforeEach(() => {
    // Clear audit logs before each test by getting all logs and forcing a clear
    // Since we can't directly modify the internal logs array, we'll use a timestamp filter
  });

  describe('hasPermission', () => {
    it('should grant admin full system access', () => {
      const result = permissionService.hasPermission('admin', null, 'system.admin');
      expect(result.granted).toBe(true);
    });

    it('should deny students admin access', () => {
      const result = permissionService.hasPermission('student', null, 'system.admin');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('not granted for role');
    });

    it('should handle non-existent permissions', () => {
      const result = permissionService.hasPermission('admin', null, 'nonexistent.permission');
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('does not exist');
    });

    it('should grant teachers academic grading permissions', () => {
      const result = permissionService.hasPermission('teacher', null, 'academic.grades');
      expect(result.granted).toBe(true);
    });

    it('should grant students library access', () => {
      const result = permissionService.hasPermission('student', null, 'student.library');
      expect(result.granted).toBe(true);
    });

    it('should grant parents monitoring permissions', () => {
      const result = permissionService.hasPermission('parent', null, 'parent.monitor');
      expect(result.granted).toBe(true);
    });
  });

  describe('Extra Role Permissions', () => {
    it('should grant staff inventory access to teachers', () => {
      const result = permissionService.hasPermission('teacher', 'staff', 'inventory.manage');
      expect(result.granted).toBe(true);
    });

    it('should deny inventory access to teachers without staff role', () => {
      const result = permissionService.hasPermission('teacher', null, 'inventory.manage');
      expect(result.granted).toBe(false);
    });

    it('should grant OSIS events access to students', () => {
      const result = permissionService.hasPermission('student', 'osis', 'osis.events');
      expect(result.granted).toBe(true);
    });

    it('should deny OSIS access to students without OSIS role', () => {
      const result = permissionService.hasPermission('student', null, 'osis.events');
      expect(result.granted).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should grant access if user has any of the specified permissions', () => {
      const result = permissionService.hasAnyPermission(
        'teacher', 
        null, 
        ['users.create', 'content.create', 'academic.grades']
      );
      expect(result.granted).toBe(true);
    });

    it('should deny access if user has none of the specified permissions', () => {
      const result = permissionService.hasAnyPermission(
        'student', 
        null, 
        ['users.create', 'system.admin', 'ppdb.manage']
      );
      expect(result.granted).toBe(false);
    });
  });

  describe('canAccessResource', () => {
    it('should check resource-based access correctly', () => {
      const result = permissionService.canAccessResource('teacher', null, 'content', 'read');
      expect(result.granted).toBe(true);
    });

    it('should deny resource access for unauthorized roles', () => {
      const result = permissionService.canAccessResource('student', null, 'users', 'create');
      expect(result.granted).toBe(false);
    });
  });

  describe('getUserPermissions', () => {
    it('should return all permissions for admin role', () => {
      const permissions = permissionService.getUserPermissions('admin', null);
      expect(permissions.length).toBeGreaterThan(20); // Admin has many permissions
    });

    it('should return limited permissions for student role', () => {
      const permissions = permissionService.getUserPermissions('student', null);
      expect(permissions.length).toBeLessThan(10);
      expect(permissions.some(p => p.id === 'student.library')).toBe(true);
    });

    it('should include extra role permissions', () => {
      const basePermissions = permissionService.getUserPermissions('teacher', null);
      const staffPermissions = permissionService.getUserPermissions('teacher', 'staff');
      
      expect(staffPermissions.length).toBeGreaterThan(basePermissions.length);
      expect(staffPermissions.some(p => p.id === 'inventory.manage')).toBe(true);
    });
  });

  describe('isValidRoleCombination', () => {
    it('should validate admin role with null extra role', () => {
      expect(permissionService.isValidRoleCombination('admin', null)).toBe(true);
    });

    it('should reject admin role with extra role', () => {
      expect(permissionService.isValidRoleCombination('admin', 'staff')).toBe(false);
    });

    it('should reject teacher role with OSIS extra role', () => {
      expect(permissionService.isValidRoleCombination('teacher', 'osis')).toBe(false);
    });

    it('should reject student role with staff extra role', () => {
      expect(permissionService.isValidRoleCombination('student', 'staff')).toBe(false);
    });

    it('should allow teacher role with staff extra role', () => {
      expect(permissionService.isValidRoleCombination('teacher', 'staff')).toBe(true);
    });

    it('should allow student role with OSIS extra role', () => {
      expect(permissionService.isValidRoleCombination('student', 'osis')).toBe(true);
    });

    it('should allow parent role with null extra role', () => {
      expect(permissionService.isValidRoleCombination('parent', null)).toBe(true);
    });
  });

  describe('Audit Logging', () => {
    it('should log permission checks', () => {
      const beforeCount = permissionService.getAuditLogs().length;
      
      permissionService.hasPermission('teacher', null, 'academic.grades', {
        userId: 'test-user',
        ip: '127.0.0.1'
      });

      const logs = permissionService.getAuditLogs();
      expect(logs.length).toBeGreaterThan(beforeCount);
      
      const lastLog = logs[0];
      expect(lastLog.userRole).toBe('teacher');
      expect(lastLog.resource).toBe('academic');
      expect(lastLog.action).toBe('grade'); // Note: singular 'grade' from permission.action
      expect(lastLog.granted).toBe(true);
    });

    it('should filter audit logs by user role', () => {
      const beforeAdminLogs = permissionService.getAuditLogs({ userRole: 'admin' }).length;
      
      permissionService.hasPermission('admin', null, 'system.admin');
      permissionService.hasPermission('student', null, 'student.library');

      const adminLogs = permissionService.getAuditLogs({ userRole: 'admin' });
      expect(adminLogs.length).toBe(beforeAdminLogs + 1);
      expect(adminLogs[0].userRole).toBe('admin');
    });

    it('should filter audit logs by granted status', () => {
      const beforeDeniedLogs = permissionService.getAuditLogs({ granted: false }).length;
      
      permissionService.hasPermission('student', null, 'system.admin');
      permissionService.hasPermission('student', null, 'student.library');

      const deniedLogs = permissionService.getAuditLogs({ granted: false });
      expect(deniedLogs.length).toBeGreaterThan(beforeDeniedLogs);
      expect(deniedLogs.some(log => log.granted === false)).toBe(true);
    });
  });

  describe('Permission Management', () => {
    it('should return all available permissions', () => {
      const permissions = permissionService.getAllPermissions();
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions.some(p => p.id === 'system.admin')).toBe(true);
    });

    it('should return specific permission by ID', () => {
      const permission = permissionService.getPermission('content.create');
      expect(permission).toBeTruthy();
      expect(permission?.name).toBe('Create Content');
    });

    it('should return null for non-existent permission', () => {
      const permission = permissionService.getPermission('nonexistent.permission');
      expect(permission).toBeNull();
    });
  });
});