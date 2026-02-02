/**
 * PPDB Integration Service Tests
 * 
 * Tests for PPDB to Student Management integration
 * @module ppdbIntegrationService.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ppdbIntegrationService } from '../ppdbIntegrationService';
import { ppdbAPI, studentsAPI, usersAPI } from '../apiService';
import { unifiedNotificationManager } from '../notifications/unifiedNotificationManager';
import { emailService } from '../emailService';
import { logger } from '../../utils/logger';
import { STORAGE_KEYS } from '../../constants';
import type { PPDBRegistrant, Student, User } from '../../types';
import type { PPDBPipelineStatus } from '../ppdbIntegrationService';

// Mock API services
vi.mock('../apiService', () => ({
  ppdbAPI: {
    getById: vi.fn(),
    updateStatus: vi.fn(),
    getAll: vi.fn(),
  },
  studentsAPI: {
    create: vi.fn(),
  },
  usersAPI: {
    create: vi.fn(),
  },
}));

// Mock notification services
vi.mock('../notifications/unifiedNotificationManager', () => ({
  unifiedNotificationManager: {
    showNotification: vi.fn(),
  },
}));

vi.mock('../emailService', () => ({
  emailService: {
    sendEmail: vi.fn(),
  },
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ppdbIntegrationService', () => {
  const mockRegistrant: PPDBRegistrant = {
    id: 'reg-001',
    fullName: 'John Doe',
    nisn: '1234567890',
    originSchool: 'SMP Negeri 1 Malang',
    parentName: 'Jane Doe',
    phoneNumber: '628123456789',
    email: 'parent@example.com',
    address: 'Jl. Contoh No. 123, Malang',
    registrationDate: '2026-01-30',
    status: 'accepted',
  };

  const mockStudent: Student = {
    id: 'student-001',
    userId: 'user-001',
    nisn: '1234567890',
    nis: '202610001',
    class: '10',
    className: 'Kelas 10',
    address: 'Jl. Contoh No. 123, Malang',
    phoneNumber: '628123456789',
    parentName: 'Jane Doe',
    parentPhone: '628123456789',
    dateOfBirth: '2010-01-01',
    enrollmentDate: '2026-07-01',
  };

  const mockUser: User = {
    id: 'user-001',
    name: 'Jane Doe',
    email: 'parent@example.com',
    role: 'parent',
    extraRole: null,
    status: 'active',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('generateNIS', () => {
    it('should generate unique NIS with format YEAR+CLASS+SEQUENCE', () => {
      const _nis1 = ppdbIntegrationService.generateNIS();
      const _nis2 = ppdbIntegrationService.generateNIS();

      // Check format: YYYY + 10 + 4 digits (total 10 chars)
      expect(_nis1).toMatch(/^\d{10}$/);
      expect(_nis1).toMatch(/^202610\d{4}$/);
      expect(_nis2).toMatch(/^202610\d{4}$/);

      // Check uniqueness (incremented)
      expect(_nis1).not.toBe(_nis2);
    });

    it('should persist NIS counter in localStorage', () => {
      ppdbIntegrationService.generateNIS();
      const counter1 = localStorage.getItem(STORAGE_KEYS.PPDB_NIS_COUNTER);
      
      ppdbIntegrationService.generateNIS();
      const counter2 = localStorage.getItem(STORAGE_KEYS.PPDB_NIS_COUNTER);

      expect(counter1).toBeDefined();
      expect(counter2).toBeDefined();
      expect(parseInt(counter2!)).toBeGreaterThan(parseInt(counter1!));
    });
  });

  describe('assignToClass', () => {
    it('should assign student to default class', () => {
      const result = ppdbIntegrationService.assignToClass();

      expect(result).toHaveProperty('className');
      expect(result).toHaveProperty('class');
      expect(result.className).toBe('Kelas 10');
      expect(result.class).toBe('10');
    });
  });

  describe('createParentAccount', () => {
    it('should create parent account with random password', async () => {
      (usersAPI.create as any).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const credentials = await ppdbIntegrationService.createParentAccount(mockRegistrant);

      expect(usersAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockRegistrant.parentName,
          email: mockRegistrant.email,
          role: 'parent',
          status: 'active',
        })
      );

      expect(credentials).toHaveProperty('username');
      expect(credentials).toHaveProperty('password');
      expect(credentials).toHaveProperty('userId');
      expect(credentials).toHaveProperty('studentId');
      expect(credentials.username).toBe(mockRegistrant.email);
      expect(credentials.studentName).toBe(mockRegistrant.fullName);
      expect(credentials.password).toHaveLength(8);
    });

    it('should throw error when user creation fails', async () => {
      (usersAPI.create as any).mockResolvedValue({
        success: false,
        error: 'User creation failed',
      });

      await expect(
        ppdbIntegrationService.createParentAccount(mockRegistrant)
      ).rejects.toThrow('Gagal membuat akun orang tua');
    });
  });

  describe('convertRegistrantToStudent', () => {
    it('should convert PPDB registrant to student record', async () => {
      (studentsAPI.create as any).mockResolvedValue({
        success: true,
        data: mockStudent,
      });

      const student = await ppdbIntegrationService.convertRegistrantToStudent(
        mockRegistrant,
        'user-001'
      );

      expect(studentsAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nisn: mockRegistrant.nisn,
          address: mockRegistrant.address,
          phoneNumber: mockRegistrant.phoneNumber,
          parentName: mockRegistrant.parentName,
          enrollmentDate: expect.any(String),
        })
      );

      expect(student).toEqual(mockStudent);
    });

    it('should throw error when student creation fails', async () => {
      (studentsAPI.create as any).mockResolvedValue({
        success: false,
        error: 'Student creation failed',
      });

      await expect(
        ppdbIntegrationService.convertRegistrantToStudent(mockRegistrant, 'user-001')
      ).rejects.toThrow('Gagal membuat data siswa dari pendaftar PPDB');
    });
  });

  describe('transitionPipelineStatus', () => {
    it('should transition status and send notification', async () => {
      (ppdbAPI.getById as any).mockResolvedValue({
        success: true,
        data: { ...mockRegistrant, status: 'registered' as const },
      });

      await ppdbIntegrationService.transitionPipelineStatus(
        'reg-001',
        'document_review',
        'Dokumen sedang ditinjau'
      );

      expect(ppdbAPI.getById).toHaveBeenCalledWith('reg-001');
      expect(unifiedNotificationManager.showNotification).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();
    });

    it('should execute enrollment actions when status becomes enrolled', async () => {
      const acceptedRegistrant = { ...mockRegistrant, status: 'accepted' as const };
      
      (ppdbAPI.getById as any).mockResolvedValue({
        success: true,
        data: acceptedRegistrant,
      });

      (ppdbAPI.updateStatus as any).mockResolvedValue({
        success: true,
        data: { ...mockRegistrant, status: 'enrolled' as const },
      });

      (usersAPI.create as any).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      (studentsAPI.create as any).mockResolvedValue({
        success: true,
        data: mockStudent,
      });

      await ppdbIntegrationService.transitionPipelineStatus('reg-001', 'enrolled');

      expect(usersAPI.create).toHaveBeenCalled();
      expect(studentsAPI.create).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalled();
    });

    it('should throw error for invalid status transition', async () => {
      (ppdbAPI.getById as any).mockResolvedValue({
        success: true,
        data: { ...mockRegistrant, status: 'rejected' as const },
      });

      await expect(
        ppdbIntegrationService.transitionPipelineStatus('reg-001', 'enrolled')
      ).rejects.toThrow('Status transition invalid');
    });
  });

  describe('sendPipelineNotification', () => {
    it('should send notification with correct message for each status', async () => {
      const statuses: PPDBPipelineStatus[] = [
        'registered',
        'document_review',
        'interview_scheduled',
        'interview_completed',
        'accepted',
        'enrolled',
        'rejected',
      ];

      for (const status of statuses) {
        await ppdbIntegrationService.sendPipelineNotification(mockRegistrant, status);
        
        expect(unifiedNotificationManager.showNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'ppdb',
            icon: expect.any(String),
            timestamp: expect.any(String),
          })
        );
      }
    });
  });

  describe('getPipelineMetrics', () => {
    it('should return pipeline funnel metrics', async () => {
      const mockRegistrants: PPDBRegistrant[] = [
        { ...mockRegistrant, status: 'registered' as const },
        { ...mockRegistrant, id: 'reg-002', status: 'pending' as const },
        { ...mockRegistrant, id: 'reg-003', status: 'approved' as const },
        { ...mockRegistrant, id: 'reg-004', status: 'rejected' as const },
        { ...mockRegistrant, id: 'reg-005', status: 'enrolled' as const },
      ];

      (ppdbAPI.getAll as any).mockResolvedValue({
        success: true,
        data: mockRegistrants,
      });

      const metrics = await ppdbIntegrationService.getPipelineMetrics();

      expect(metrics.total).toBe(5);
      expect(metrics.registered).toBe(1); // Only 'registered' status
      expect(metrics.accepted).toBe(1); // 'approved' counts as 'accepted'
      expect(metrics.rejected).toBe(2); // 'rejected' + 'pending' (1 + 1)
      expect(metrics.enrolled).toBe(1);
    });

    it('should return empty metrics on API error', async () => {
      (ppdbAPI.getAll as any).mockResolvedValue({
        success: false,
        error: 'API error',
      });

      const metrics = await ppdbIntegrationService.getPipelineMetrics();

      expect(metrics.total).toBe(0);
      expect(metrics.registered).toBe(0);
      expect(metrics.enrolled).toBe(0);
    });
  });
});
