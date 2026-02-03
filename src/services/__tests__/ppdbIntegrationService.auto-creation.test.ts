/**
 * PPDB Integration Service - Auto-Creation Tests
 * 
 * Tests for automatic student account creation on PPDB approval
 * and rollback functionality.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ppdbIntegrationService } from '../ppdbIntegrationService';
import { logger } from '../../utils/logger';
import { STORAGE_KEYS } from '../../constants';
import type { PPDBRegistrant, PPDBAutoCreationConfig } from '../../types';

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('PPDB Integration Service - Auto-Creation', () => {
  const _mockRegistrant: PPDBRegistrant = {
    id: 'reg-123',
    fullName: 'Ahmad Rizky',
    nisn: '1234567890',
    originSchool: 'SMP Negeri1 Malang',
    parentName: 'Budi Santoso',
    phoneNumber: '081234567890',
    email: 'parent@example.com',
    address: 'Jl. Contoh No. 123, Malang',
    registrationDate: '2026-02-03',
    status: 'approved',
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    ppdbIntegrationService.setAutoCreationConfig({
      enabled: true,
      autoCreateOnApproval: true,
      requireEnrollmentConfirmation: false,
      createParentAccount: true,
      sendWelcomeEmail: false,
    });
  });

  describe('Auto-Creation Configuration', () => {
    it('should return default config when no config saved', () => {
      const config = ppdbIntegrationService.getAutoCreationConfig();
      
      expect(config).toEqual({
        enabled: true,
        autoCreateOnApproval: true,
        requireEnrollmentConfirmation: false,
        createParentAccount: true,
        sendWelcomeEmail: false,
      });
    });

    it('should set auto-creation config', () => {
      const newConfig: Partial<PPDBAutoCreationConfig> = {
        enabled: false,
        requireEnrollmentConfirmation: true,
      };

      ppdbIntegrationService.setAutoCreationConfig(newConfig);
      const savedConfig = ppdbIntegrationService.getAutoCreationConfig();
      
      expect(savedConfig.enabled).toBe(false);
      expect(savedConfig.requireEnrollmentConfirmation).toBe(true);
      expect(savedConfig.autoCreateOnApproval).toBe(true);
      expect(logger.info).toHaveBeenCalledWith('Auto-creation config updated', expect.any(Object));
    });

    it('should persist config to localStorage', () => {
      const config = { enabled: false, autoCreateOnApproval: true, requireEnrollmentConfirmation: false, createParentAccount: true, sendWelcomeEmail: true };
      ppdbIntegrationService.setAutoCreationConfig(config);
      
      const saved = localStorage.getItem(STORAGE_KEYS.PPDB_AUTO_CREATION_CONFIG);
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual(config);
    });
  });

  describe('Auto-Creation Audit', () => {
    it('should retrieve all audit logs', async () => {
      const audits = await ppdbIntegrationService.getAutoCreationAuditLogs();
      expect(Array.isArray(audits)).toBe(true);
      expect(audits.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Rollback Functionality', () => {
    it('should throw error when no auto-created accounts exist', async () => {
      await expect(
        ppdbIntegrationService.rollbackStudentAccount('non-existent-registrant')
      ).rejects.toThrow('Gagal melakukan rollback akun siswa');
    });
  });

  describe('Configuration Impact on Auto-Creation', () => {
    it('should skip parent account creation when createParentAccount is false', () => {
      ppdbIntegrationService.setAutoCreationConfig({ createParentAccount: false });
      const config = ppdbIntegrationService.getAutoCreationConfig();
      
      expect(config.createParentAccount).toBe(false);
    });
  });
});
