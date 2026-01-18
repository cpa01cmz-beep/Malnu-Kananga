import { ELibrary, MaterialSharePermission, UserRole, UserExtraRole } from '../types';
import { logger } from '../utils/logger';

export interface MaterialAccessCheck {
  canAccess: boolean;
  permission: 'view' | 'edit' | 'admin' | 'none';
  reason?: string;
}

export interface MaterialShareRequest {
  materialId: string;
  targetUsers?: string[];
  targetRoles?: UserRole[];
  targetExtraRoles?: UserExtraRole[];
  isPublic?: boolean;
  permission: 'view' | 'edit' | 'admin';
  expiresAt?: string;
}

export interface MaterialShareAudit {
  id: string;
  materialId: string;
  materialTitle: string;
  userId: string;
  userName: string;
  userRole?: UserRole;
  action: 'shared' | 'accessed' | 'downloaded' | 'revoked' | 'permission_changed' | 'link_generated';
  targetUser?: string;
  targetRole?: UserRole;
  details: string;
  timestamp: string;
}

export class MaterialPermissionService {
  private static instance: MaterialPermissionService;

  private constructor() {}

  static getInstance(): MaterialPermissionService {
    if (!MaterialPermissionService.instance) {
      MaterialPermissionService.instance = new MaterialPermissionService();
    }
    return MaterialPermissionService.instance;
  }

  checkAccess(
    material: ELibrary,
    userId: string,
    userRole: UserRole,
    userExtraRole?: UserExtraRole
  ): MaterialAccessCheck {
    const isOwner = material.uploadedBy === userId;
    if (isOwner) {
      return { canAccess: true, permission: 'admin' };
    }

    if (material.shareSettings?.isPublic) {
      return { canAccess: true, permission: 'view', reason: 'Public material' };
    }

    if (material.sharePermissions) {
      const userPermission = material.sharePermissions.find(p => {
        if (p.userId === userId) {
          return true;
        }
        if (p.role === userRole && p.userId === undefined) {
          return true;
        }
        if (p.extraRole === userExtraRole && p.userId === undefined) {
          return true;
        }
        return false;
      });

      if (userPermission) {
        if (userPermission.expiresAt && new Date(userPermission.expiresAt) < new Date()) {
          return { canAccess: false, permission: 'none', reason: 'Permission expired' };
        }
        return { canAccess: true, permission: userPermission.permission };
      }
    }

    if (!material.isShared) {
      return { canAccess: false, permission: 'none', reason: 'Not shared with you' };
    }

    if (material.sharedWith?.includes(userId)) {
      return { canAccess: true, permission: 'view' };
    }

    return { canAccess: false, permission: 'none', reason: 'No permission granted' };
  }

  canEdit(
    material: ELibrary,
    userId: string,
    userRole: UserRole,
    userExtraRole?: UserExtraRole
  ): boolean {
    const access = this.checkAccess(material, userId, userRole, userExtraRole);
    return access.canAccess && (access.permission === 'edit' || access.permission === 'admin');
  }

  canAdmin(
    material: ELibrary,
    userId: string,
    userRole: UserRole,
    userExtraRole?: UserExtraRole
  ): boolean {
    const access = this.checkAccess(material, userId, userRole, userExtraRole);
    return access.canAccess && access.permission === 'admin';
  }

  canShare(
    material: ELibrary,
    userId: string,
    userRole: UserRole,
    userExtraRole?: UserExtraRole
  ): boolean {
    const access = this.checkAccess(material, userId, userRole, userExtraRole);
    return access.canAccess && (access.permission === 'edit' || access.permission === 'admin');
  }

  hasExpired(sharePermission: MaterialSharePermission): boolean {
    if (!sharePermission.expiresAt) return false;
    return new Date(sharePermission.expiresAt) < new Date();
  }

  filterExpiredPermissions(permissions: MaterialSharePermission[]): MaterialSharePermission[] {
    return permissions.filter(p => !this.hasExpired(p));
  }

  getActivePermissions(material: ELibrary): MaterialSharePermission[] {
    if (!material.sharePermissions) return [];
    return this.filterExpiredPermissions(material.sharePermissions);
  }

  getPermissionSummary(material: ELibrary): {
    userCount: number;
    roleCount: number;
    publicAccess: boolean;
    totalPermissions: number;
  } {
    const activePermissions = this.getActivePermissions(material);
    const userPermissions = activePermissions.filter(p => p.userId);
    const rolePermissions = activePermissions.filter(p => p.role);

    return {
      userCount: new Set(userPermissions.map(p => p.userId)).size,
      roleCount: new Set(rolePermissions.map(p => p.role)).size,
      publicAccess: material.shareSettings?.isPublic ?? false,
      totalPermissions: activePermissions.length,
    };
  }

  formatPermissionName(permission: 'view' | 'edit' | 'admin'): string {
    const names = {
      view: 'Lihat',
      edit: 'Edit',
      admin: 'Admin',
    };
    return names[permission];
  }

  getPermissionDescription(permission: 'view' | 'edit' | 'admin'): string {
    const descriptions = {
      view: 'Hanya dapat melihat dan mengunduh materi',
      edit: 'Dapat mengedit materi dan membuat versi baru',
      admin: 'Punya kontrol penuh termasuk menghapus materi dan mengatur berbagi',
    };
    return descriptions[permission];
  }

  validateShareRequest(request: MaterialShareRequest): { valid: boolean; error?: string } {
    if (!request.targetUsers?.length &&
        !request.targetRoles?.length &&
        !request.targetExtraRoles?.length &&
        !request.isPublic) {
      return { valid: false, error: 'Pilih setidaknya satu target untuk berbagi' };
    }

    if (request.expiresAt && new Date(request.expiresAt) <= new Date()) {
      return { valid: false, error: 'Tanggal kedaluwarsa harus di masa depan' };
    }

    return { valid: true };
  }

  async logShareAudit(audit: Omit<MaterialShareAudit, 'id' | 'timestamp'>): Promise<MaterialShareAudit> {
    const auditLog: MaterialShareAudit = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...audit,
    };

    logger.info('Material share audit logged', auditLog);
    return auditLog;
  }

  async getShareAuditHistory(
    materialId: string,
    limit?: number
  ): Promise<MaterialShareAudit[]> {
    logger.info('Fetching share audit history', { materialId, limit });

    return [];
  }

  async revokeAccess(
    materialId: string,
    targetUserId: string | string[],
    revokeBy: string,
    revokeByName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const auditLog = await this.logShareAudit({
        materialId,
        materialTitle: materialId,
        userId: revokeBy,
        userName: revokeByName,
        action: 'revoked',
        targetUser: Array.isArray(targetUserId) ? targetUserId.join(', ') : targetUserId,
        details: `Akses dicabut dari ${Array.isArray(targetUserId) ? targetUserId.length : 1} pengguna`,
      });

      logger.info('Material access revoked', { materialId, targetUserId, auditId: auditLog.id });
      return { success: true };
    } catch (error) {
      logger.error('Error revoking material access', error);
      return { success: false, error: 'Gagal mencabut akses materi' };
    }
  }

  async updatePermission(
    materialId: string,
    materialTitle: string,
    targetUserId: string,
    oldPermission: 'view' | 'edit' | 'admin',
    newPermission: 'view' | 'edit' | 'admin',
    updatedBy: string,
    updatedByName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const auditLog = await this.logShareAudit({
        materialId,
        materialTitle,
        userId: updatedBy,
        userName: updatedByName,
        targetUser: targetUserId,
        action: 'permission_changed',
        details: `Izin diubah dari ${oldPermission} ke ${newPermission}`,
      });

      logger.info('Material permission updated', {
        materialId,
        targetUserId,
        oldPermission,
        newPermission,
        auditId: auditLog.id,
      });

      return { success: true };
    } catch (error) {
      logger.error('Error updating material permission', error);
      return { success: false, error: 'Gagal mengubah izin materi' };
    }
  }
}

export const materialPermissionService = MaterialPermissionService.getInstance();
