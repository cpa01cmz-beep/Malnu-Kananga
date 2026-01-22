import { describe, it, expect, beforeEach } from 'vitest';
import { materialPermissionService } from '../materialPermissionService';
import { ELibrary, UserRole, UserExtraRole } from '../../types';

describe('MaterialPermissionService', () => {
  let mockMaterial: ELibrary;
  const mockUserId = 'user123';
  const mockUserRole: UserRole = 'teacher';
  const mockUserExtraRole: UserExtraRole = 'wakasek';

  beforeEach(() => {
    mockMaterial = {
      id: 'material123',
      title: 'Test Material',
      description: 'Test Description',
      category: 'Matematika',
      fileUrl: 'https://example.com/file.pdf',
      fileType: 'pdf',
      fileSize: 1024000,
      subjectId: 'subject123',
      uploadedBy: 'owner456',
      uploadedAt: new Date().toISOString(),
      downloadCount: 0,
      isShared: false,
      sharePermissions: [],
      shareSettings: {
        isPublic: false,
        allowAnonymous: false,
        requirePassword: false,
      },
    };
  });

  describe('checkAccess', () => {
    it('should grant admin access to owner', () => {
      const result = materialPermissionService.checkAccess(
        mockMaterial,
        mockMaterial.uploadedBy,
        mockUserRole,
        mockUserExtraRole
      );

      expect(result.canAccess).toBe(true);
      expect(result.permission).toBe('admin');
    });

    it('should grant view access for public materials', () => {
      mockMaterial.shareSettings = {
        isPublic: true,
        allowAnonymous: false,
        requirePassword: false,
      };

      const result = materialPermissionService.checkAccess(
        mockMaterial,
        mockUserId,
        mockUserRole,
        mockUserExtraRole
      );

      expect(result.canAccess).toBe(true);
      expect(result.permission).toBe('view');
      expect(result.reason).toBe('Public material');
    });

    it('should grant access based on user permission', () => {
      mockMaterial.sharePermissions = [
        {
          id: 'perm123',
          userId: mockUserId,
          permission: 'edit',
          grantedBy: mockMaterial.uploadedBy,
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
      ];

      const result = materialPermissionService.checkAccess(
        mockMaterial,
        mockUserId,
        mockUserRole,
        mockUserExtraRole
      );

      expect(result.canAccess).toBe(true);
      expect(result.permission).toBe('edit');
    });

    it('should grant access based on role permission', () => {
      mockMaterial.sharePermissions = [
        {
          id: 'perm123',
          role: mockUserRole,
          permission: 'view',
          grantedBy: mockMaterial.uploadedBy,
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
      ];

      const result = materialPermissionService.checkAccess(
        mockMaterial,
        mockUserId,
        mockUserRole,
        mockUserExtraRole
      );

      expect(result.canAccess).toBe(true);
      expect(result.permission).toBe('view');
    });

    it('should deny access for expired permissions', () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      mockMaterial.sharePermissions = [
        {
          id: 'perm123',
          userId: mockUserId,
          permission: 'edit',
          grantedBy: mockMaterial.uploadedBy,
          grantedAt: new Date().toISOString(),
          expiresAt: expiredDate.toISOString(),
          accessCount: 0,
        },
      ];

      const result = materialPermissionService.checkAccess(
        mockMaterial,
        mockUserId,
        mockUserRole,
        mockUserExtraRole
      );

      expect(result.canAccess).toBe(false);
      expect(result.permission).toBe('none');
      expect(result.reason).toBe('Permission expired');
    });

    it('should deny access when no permission granted', () => {
      const result = materialPermissionService.checkAccess(
        mockMaterial,
        mockUserId,
        mockUserRole,
        mockUserExtraRole
      );

      expect(result.canAccess).toBe(false);
      expect(result.permission).toBe('none');
      expect(result.reason).toBe('Not shared with you');
    });

    it('should grant access based on extra role permission', () => {
      mockMaterial.sharePermissions = [
        {
          id: 'perm123',
          extraRole: mockUserExtraRole,
          permission: 'edit',
          grantedBy: mockMaterial.uploadedBy,
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
      ];

      const result = materialPermissionService.checkAccess(
        mockMaterial,
        mockUserId,
        mockUserRole,
        mockUserExtraRole
      );

      expect(result.canAccess).toBe(true);
      expect(result.permission).toBe('edit');
    });
  });

  describe('canEdit', () => {
    it('should allow editing for admin permission', () => {
      mockMaterial.sharePermissions = [
        {
          id: 'perm123',
          userId: mockUserId,
          permission: 'admin',
          grantedBy: mockMaterial.uploadedBy,
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
      ];

      const result = materialPermissionService.canEdit(
        mockMaterial,
        mockUserId,
        mockUserRole,
        mockUserExtraRole
      );

      expect(result).toBe(true);
    });

    it('should allow editing for edit permission', () => {
      mockMaterial.sharePermissions = [
        {
          id: 'perm123',
          userId: mockUserId,
          permission: 'edit',
          grantedBy: mockMaterial.uploadedBy,
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
      ];

      const result = materialPermissionService.canEdit(
        mockMaterial,
        mockUserId,
        mockUserRole,
        mockUserExtraRole
      );

      expect(result).toBe(true);
    });

    it('should deny editing for view permission', () => {
      mockMaterial.sharePermissions = [
        {
          id: 'perm123',
          userId: mockUserId,
          permission: 'view',
          grantedBy: mockMaterial.uploadedBy,
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
      ];

      const result = materialPermissionService.canEdit(
        mockMaterial,
        mockUserId,
        mockUserRole,
        mockUserExtraRole
      );

      expect(result).toBe(false);
    });
  });

  describe('canAdmin', () => {
    it('should allow admin access for admin permission', () => {
      mockMaterial.sharePermissions = [
        {
          id: 'perm123',
          userId: mockUserId,
          permission: 'admin',
          grantedBy: mockMaterial.uploadedBy,
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
      ];

      const result = materialPermissionService.canAdmin(
        mockMaterial,
        mockUserId,
        mockUserRole,
        mockUserExtraRole
      );

      expect(result).toBe(true);
    });

    it('should deny admin access for edit permission', () => {
      mockMaterial.sharePermissions = [
        {
          id: 'perm123',
          userId: mockUserId,
          permission: 'edit',
          grantedBy: mockMaterial.uploadedBy,
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
      ];

      const result = materialPermissionService.canAdmin(
        mockMaterial,
        mockUserId,
        mockUserRole,
        mockUserExtraRole
      );

      expect(result).toBe(false);
    });
  });

  describe('canShare', () => {
    it('should allow sharing for admin permission', () => {
      mockMaterial.sharePermissions = [
        {
          id: 'perm123',
          userId: mockUserId,
          permission: 'admin',
          grantedBy: mockMaterial.uploadedBy,
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
      ];

      const result = materialPermissionService.canShare(
        mockMaterial,
        mockUserId,
        mockUserRole,
        mockUserExtraRole
      );

      expect(result).toBe(true);
    });

    it('should allow sharing for edit permission', () => {
      mockMaterial.sharePermissions = [
        {
          id: 'perm123',
          userId: mockUserId,
          permission: 'edit',
          grantedBy: mockMaterial.uploadedBy,
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
      ];

      const result = materialPermissionService.canShare(
        mockMaterial,
        mockUserId,
        mockUserRole,
        mockUserExtraRole
      );

      expect(result).toBe(true);
    });

    it('should deny sharing for view permission', () => {
      mockMaterial.sharePermissions = [
        {
          id: 'perm123',
          userId: mockUserId,
          permission: 'view',
          grantedBy: mockMaterial.uploadedBy,
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
      ];

      const result = materialPermissionService.canShare(
        mockMaterial,
        mockUserId,
        mockUserRole,
        mockUserExtraRole
      );

      expect(result).toBe(false);
    });
  });

  describe('hasExpired', () => {
    it('should return true for expired permission', () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      const permission = {
        id: 'perm123',
        userId: mockUserId,
        permission: 'view' as const,
        grantedBy: mockMaterial.uploadedBy,
        grantedAt: new Date().toISOString(),
        expiresAt: expiredDate.toISOString(),
        accessCount: 0,
      };

      const result = materialPermissionService.hasExpired(permission);

      expect(result).toBe(true);
    });

    it('should return false for active permission', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const permission = {
        id: 'perm123',
        userId: mockUserId,
        permission: 'view' as const,
        grantedBy: mockMaterial.uploadedBy,
        grantedAt: new Date().toISOString(),
        expiresAt: futureDate.toISOString(),
        accessCount: 0,
      };

      const result = materialPermissionService.hasExpired(permission);

      expect(result).toBe(false);
    });

    it('should return false for permission without expiration', () => {
      const permission = {
        id: 'perm123',
        userId: mockUserId,
        permission: 'view' as const,
        grantedBy: mockMaterial.uploadedBy,
        grantedAt: new Date().toISOString(),
        accessCount: 0,
      };

      const result = materialPermissionService.hasExpired(permission);

      expect(result).toBe(false);
    });
  });

  describe('filterExpiredPermissions', () => {
    it('should filter out expired permissions', () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const permissions = [
        {
          id: 'perm1',
          userId: 'user1',
          permission: 'view' as const,
          grantedBy: 'owner',
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
        {
          id: 'perm2',
          userId: 'user2',
          permission: 'view' as const,
          grantedBy: 'owner',
          grantedAt: new Date().toISOString(),
          expiresAt: expiredDate.toISOString(),
          accessCount: 0,
        },
        {
          id: 'perm3',
          userId: 'user3',
          permission: 'view' as const,
          grantedBy: 'owner',
          grantedAt: new Date().toISOString(),
          expiresAt: futureDate.toISOString(),
          accessCount: 0,
        },
      ];

      const result = materialPermissionService.filterExpiredPermissions(permissions);

      expect(result).toHaveLength(2);
      expect(result.some(p => p.id === 'perm1')).toBe(true);
      expect(result.some(p => p.id === 'perm3')).toBe(true);
      expect(result.some(p => p.id === 'perm2')).toBe(false);
    });
  });

  describe('getActivePermissions', () => {
    it('should return only active permissions', () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      mockMaterial.sharePermissions = [
        {
          id: 'perm1',
          userId: 'user1',
          permission: 'view',
          grantedBy: 'owner',
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
        {
          id: 'perm2',
          userId: 'user2',
          permission: 'view',
          grantedBy: 'owner',
          grantedAt: new Date().toISOString(),
          expiresAt: expiredDate.toISOString(),
          accessCount: 0,
        },
      ];

      const result = materialPermissionService.getActivePermissions(mockMaterial);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user1');
    });
  });

  describe('getPermissionSummary', () => {
    it('should return correct summary', () => {
      mockMaterial.sharePermissions = [
        {
          id: 'perm1',
          userId: 'user1',
          permission: 'view',
          grantedBy: 'owner',
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
        {
          id: 'perm2',
          userId: 'user2',
          permission: 'view',
          grantedBy: 'owner',
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
        {
          id: 'perm3',
          role: 'teacher',
          permission: 'view',
          grantedBy: 'owner',
          grantedAt: new Date().toISOString(),
          accessCount: 0,
        },
      ];

      const result = materialPermissionService.getPermissionSummary(mockMaterial);

      expect(result.userCount).toBe(2);
      expect(result.roleCount).toBe(1);
      expect(result.publicAccess).toBe(false);
      expect(result.totalPermissions).toBe(3);
    });
  });

  describe('formatPermissionName', () => {
    it('should format permission names correctly', () => {
      expect(materialPermissionService.formatPermissionName('view')).toBe('Lihat');
      expect(materialPermissionService.formatPermissionName('edit')).toBe('Edit');
      expect(materialPermissionService.formatPermissionName('admin')).toBe('Admin');
    });
  });

  describe('getPermissionDescription', () => {
    it('should return correct descriptions', () => {
      expect(materialPermissionService.getPermissionDescription('view')).toBe('Hanya dapat melihat dan mengunduh materi');
      expect(materialPermissionService.getPermissionDescription('edit')).toBe('Dapat mengedit materi dan membuat versi baru');
      expect(materialPermissionService.getPermissionDescription('admin')).toBe('Punya kontrol penuh termasuk menghapus materi dan mengatur berbagi');
    });
  });

  describe('validateShareRequest', () => {
    it('should validate request with users', () => {
      const request = {
        materialId: 'material123',
        targetUsers: ['user1', 'user2'],
        permission: 'view' as const,
      };

      const result = materialPermissionService.validateShareRequest(request);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate request with roles', () => {
      const request = {
        materialId: 'material123',
        targetRoles: ['teacher' as UserRole],
        permission: 'view' as const,
      };

      const result = materialPermissionService.validateShareRequest(request);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate request with public sharing', () => {
      const request = {
        materialId: 'material123',
        isPublic: true,
        permission: 'view' as const,
      };

      const result = materialPermissionService.validateShareRequest(request);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject request without targets', () => {
      const request = {
        materialId: 'material123',
        permission: 'view' as const,
      };

      const result = materialPermissionService.validateShareRequest(request);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Pilih setidaknya satu target untuk berbagi');
    });

    it('should reject request with expired date', () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      const request = {
        materialId: 'material123',
        targetUsers: ['user1'],
        permission: 'view' as const,
        expiresAt: expiredDate.toISOString(),
      };

      const result = materialPermissionService.validateShareRequest(request);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Tanggal kedaluwarsa harus di masa depan');
    });
  });

  describe('revokeAccess', () => {
    it('should successfully revoke access', async () => {
      const result = await materialPermissionService.revokeAccess(
        mockMaterial.id,
        'user123',
        'admin456',
        'Admin User'
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('updatePermission', () => {
    it('should successfully update permission', async () => {
      const result = await materialPermissionService.updatePermission(
        mockMaterial.id,
        mockMaterial.title,
        'user123',
        'view',
        'edit',
        'admin456',
        'Admin User'
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('logShareAudit', () => {
    it('should log audit entry', async () => {
      const audit = await materialPermissionService.logShareAudit({
        materialId: mockMaterial.id,
        materialTitle: mockMaterial.title,
        userId: mockUserId,
        userName: 'Test User',
        action: 'shared',
        details: 'Shared with user',
      });

      expect(audit.id).toBeDefined();
      expect(audit.materialId).toBe(mockMaterial.id);
      expect(audit.userId).toBe(mockUserId);
      expect(audit.timestamp).toBeDefined();
    });
  });

  describe('getShareAuditHistory', () => {
    it('should return audit history', async () => {
      const result = await materialPermissionService.getShareAuditHistory(mockMaterial.id, 10);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
    });
  });
});
