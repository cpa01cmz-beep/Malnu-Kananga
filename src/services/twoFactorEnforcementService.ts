import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'staff' | 'osis' | 'wakasek' | 'kepsek';

export interface TwoFactorEnforcementConfig {
  enabled: boolean;
  requiredRoles: UserRole[];
  enforcedAt: string | null;
  lastUpdated: string;
  updatedBy: string | null;
}

const DEFAULT_ENFORCEMENT_CONFIG: TwoFactorEnforcementConfig = {
  enabled: false,
  requiredRoles: [],
  enforcedAt: null,
  lastUpdated: new Date().toISOString(),
  updatedBy: null
};

const ALL_ROLES: UserRole[] = ['admin', 'teacher', 'student', 'parent', 'staff', 'osis', 'wakasek', 'kepsek'];

export const twoFactorEnforcementService = {
  /**
   * Get all available roles that can have 2FA enforced
   */
  getAvailableRoles(): UserRole[] {
    return [...ALL_ROLES];
  },

  /**
   * Get the current 2FA enforcement configuration
   */
  getEnforcementConfig(): TwoFactorEnforcementConfig {
    try {
      const key = STORAGE_KEYS.TWO_FACTOR_ENFORCEMENT;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as TwoFactorEnforcementConfig;
      }
      return { ...DEFAULT_ENFORCEMENT_CONFIG };
    } catch (err) {
      logger.error('Failed to get 2FA enforcement config:', err);
      return { ...DEFAULT_ENFORCEMENT_CONFIG };
    }
  },

  /**
   * Save the 2FA enforcement configuration
   */
  setEnforcementConfig(config: TwoFactorEnforcementConfig): boolean {
    try {
      const key = STORAGE_KEYS.TWO_FACTOR_ENFORCEMENT;
      config.lastUpdated = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(config));
      logger.info('2FA enforcement config updated:', {
        enabled: config.enabled,
        requiredRoles: config.requiredRoles
      });
      return true;
    } catch (err) {
      logger.error('Failed to save 2FA enforcement config:', err);
      return false;
    }
  },

  /**
   * Enable 2FA enforcement for specific roles
   */
  enableEnforcement(roles: UserRole[], updatedBy: string): boolean {
    const config = this.getEnforcementConfig();
    
    const validRoles = roles.filter(r => ALL_ROLES.includes(r));
    if (validRoles.length === 0) {
      logger.warn('No valid roles provided for 2FA enforcement');
      return false;
    }

    config.enabled = true;
    config.requiredRoles = [...new Set(validRoles)];
    config.enforcedAt = new Date().toISOString();
    config.updatedBy = updatedBy;

    return this.setEnforcementConfig(config);
  },

  /**
   * Disable 2FA enforcement
   */
  disableEnforcement(updatedBy: string): boolean {
    const config = this.getEnforcementConfig();
    config.enabled = false;
    config.requiredRoles = [];
    config.enforcedAt = null;
    config.updatedBy = updatedBy;

    return this.setEnforcementConfig(config);
  },

  /**
   * Add a role to 2FA enforcement
   */
  addRoleToEnforcement(role: UserRole, _updatedBy: string): boolean {
    const config = this.getEnforcementConfig();
    
    if (!ALL_ROLES.includes(role)) {
      logger.warn('Invalid role for 2FA enforcement:', role);
      return false;
    }

    if (!config.requiredRoles.includes(role)) {
      config.requiredRoles.push(role);
      config.enabled = config.requiredRoles.length > 0;
      return this.setEnforcementConfig(config);
    }

    return true;
  },

  /**
   * Remove a role from 2FA enforcement
   */
  removeRoleFromEnforcement(role: UserRole, updatedBy: string): boolean {
    const config = this.getEnforcementConfig();
    
    config.requiredRoles = config.requiredRoles.filter(r => r !== role);
    config.enabled = config.requiredRoles.length > 0;
    config.updatedBy = updatedBy;

    return this.setEnforcementConfig(config);
  },

  /**
   * Check if a user's role requires 2FA
   */
  isRoleRequired(userRole: UserRole | null | undefined): boolean {
    if (!userRole) return false;
    
    const config = this.getEnforcementConfig();
    return config.enabled && config.requiredRoles.includes(userRole as UserRole);
  },

  /**
   * Check if 2FA is enforced for any role
   */
  isEnforcementEnabled(): boolean {
    return this.getEnforcementConfig().enabled;
  },

  /**
   * Get roles that require 2FA
   */
  getRequiredRoles(): UserRole[] {
    return this.getEnforcementConfig().requiredRoles;
  },

  /**
   * Get a human-readable list of required roles
   */
  getRequiredRolesDisplay(): string {
    const config = this.getEnforcementConfig();
    if (!config.enabled || config.requiredRoles.length === 0) {
      return 'None';
    }

    const roleLabels: Record<UserRole, string> = {
      admin: 'Administrator',
      teacher: 'Guru',
      student: 'Siswa',
      parent: 'Orang Tua',
      staff: 'Staff',
      osis: 'OSIS',
      wakasek: 'Waka Sek',
      kepsek: 'Kepsek'
    };

    return config.requiredRoles.map(r => roleLabels[r]).join(', ');
  },

  /**
   * Reset enforcement to defaults
   */
  resetEnforcement(): boolean {
    try {
      const key = STORAGE_KEYS.TWO_FACTOR_ENFORCEMENT;
      localStorage.removeItem(key);
      logger.info('2FA enforcement config reset to defaults');
      return true;
    } catch (err) {
      logger.error('Failed to reset 2FA enforcement config:', err);
      return false;
    }
  }
};
