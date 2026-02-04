import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { progressReportScheduler, type ProgressReportAuditLog } from '../progressReportScheduler';
import { STORAGE_KEYS } from '../../constants';

describe('ProgressReportScheduler', () => {
  const getItemMock = vi.fn();
  const setItemMock = vi.fn();
  const removeItemMock = vi.fn();

  beforeEach(() => {
    getItemMock.mockImplementation((key: string) => {
      if (key === STORAGE_KEYS.AUTH_SESSION) {
        return JSON.stringify({
          user: {
            id: 'parent-123',
            name: 'Parent User',
            email: 'parent@example.com',
            role: 'parent'
          },
          token: 'mock-token'
        });
      }
      if (key === STORAGE_KEYS.OFFLINE_PARENT_DATA) {
        return JSON.stringify({
          children: [
            {
              relationshipId: 'rel-1',
              relationshipType: 'ayah',
              isPrimaryContact: true,
              studentId: 'student-456',
              nisn: '1234567890',
              nis: '123456',
              class: '10-A',
              className: 'Kelas 10 A',
              dateOfBirth: '2010-01-01',
              studentName: 'Test Student',
              studentEmail: 'student@example.com'
            }
          ],
          childrenData: {
            'student-456': {
              student: {
                id: 'student-456',
                userId: 'student-456',
                nisn: '',
                nis: '123456',
                class: '10-A',
                className: 'Kelas 10 A',
                address: '',
                phoneNumber: '',
                parentName: '',
                parentPhone: '',
                dateOfBirth: '',
                enrollmentDate: '',
              },
              grades: [],
              attendance: [],
              schedule: [],
              lastUpdated: Date.now(),
              expiresAt: Date.now() + 86400000
            }
          },
          lastUpdated: Date.now(),
          expiresAt: Date.now() + 86400000
        });
      }
      if (key === STORAGE_KEYS.PROGRESS_REPORT_AUTO_GENERATION_AUDIT) {
        return '[]';
      }
      return null;
    });

    vi.spyOn(localStorage, 'getItem').mockImplementation(getItemMock);
    vi.spyOn(localStorage, 'setItem').mockImplementation(setItemMock);
    vi.spyOn(localStorage, 'removeItem').mockImplementation(removeItemMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('start and stop', () => {
    it('should start scheduler and set interval', () => {
      progressReportScheduler.start();
      expect(progressReportScheduler).toBeDefined();
    });

    it('should stop scheduler and clear interval', () => {
      progressReportScheduler.stop();
      expect(progressReportScheduler).toBeDefined();
    });
  });

  describe('getChildrenForCurrentParent', () => {
    it('should return children from offline cache', () => {
      const children = (progressReportScheduler as any).getChildrenForCurrentParent();

      expect(children).toHaveLength(1);
      expect(children[0].studentId).toBe('student-456');
      expect(children[0].studentName).toBe('Test Student');
    });

    it('should return empty array when no offline data', () => {
      getItemMock.mockReturnValue(null);

      const children = (progressReportScheduler as any).getChildrenForCurrentParent();

      expect(children).toEqual([]);
    });

    it('should handle malformed offline data', () => {
      getItemMock.mockReturnValue('invalid json');

      const children = (progressReportScheduler as any).getChildrenForCurrentParent();

      expect(children).toEqual([]);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from auth session', () => {
      const user = (progressReportScheduler as any).getCurrentUser();

      expect(user).not.toBeNull();
      expect(user?.id).toBe('parent-123');
      expect(user?.role).toBe('parent');
    });

    it('should return null when no auth session', () => {
      getItemMock.mockReturnValue(null);

      const user = (progressReportScheduler as any).getCurrentUser();

      expect(user).toBeNull();
    });

    it('should return null when auth session is invalid', () => {
      getItemMock.mockReturnValue('invalid json');

      const user = (progressReportScheduler as any).getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('quiet hours', () => {
    it('should detect quiet hours when within range', () => {
      const now = new Date('2026-02-04T22:30:00');
      vi.useFakeTimers().setSystemTime(now);

      const settings = {
        parentId: 'parent-123',
        frequency: 'weekly' as const,
        enableNotifications: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00'
      };

      const result = (progressReportScheduler as any).isQuietHours(settings);

      expect(result).toBe(true);
      vi.useRealTimers();
    });

    it('should not detect quiet hours when outside range', () => {
      const now = new Date('2026-02-04T09:00:00');
      vi.useFakeTimers().setSystemTime(now);

      const settings = {
        parentId: 'parent-123',
        frequency: 'weekly' as const,
        enableNotifications: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00'
      };

      const result = (progressReportScheduler as any).isQuietHours(settings);

      expect(result).toBe(false);
      vi.useRealTimers();
    });

    it('should handle overnight quiet hours (22:00 - 07:00)', () => {
      const now = new Date('2026-02-04T23:30:00');
      vi.useFakeTimers().setSystemTime(now);

      const settings = {
        parentId: 'parent-123',
        frequency: 'weekly' as const,
        enableNotifications: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00'
      };

      const result = (progressReportScheduler as any).isQuietHours(settings);

      expect(result).toBe(true);
      vi.useRealTimers();
    });
  });

  describe('getAuditLogs', () => {
    it('should return empty array initially', () => {
      getItemMock.mockReturnValue('[]');

      const logs = progressReportScheduler.getAuditLogs();

      expect(logs).toEqual([]);
    });

    it('should return audit logs from storage', () => {
      const mockLogs: ProgressReportAuditLog[] = [
        {
          parentId: 'parent-1',
          studentId: 'student-1',
          studentName: 'Student 1',
          reportId: 'report-1',
          generatedAt: '2026-02-04T10:00:00',
          emailSent: true,
          emailStatus: 'sent',
          method: 'auto'
        }
      ];

      getItemMock.mockReturnValue(JSON.stringify(mockLogs));

      const logs = progressReportScheduler.getAuditLogs();

      expect(logs).toEqual(mockLogs);
    });

    it('should handle corrupted audit log data', () => {
      getItemMock.mockReturnValue('invalid json');

      const logs = progressReportScheduler.getAuditLogs();

      expect(logs).toEqual([]);
    });
  });

  describe('clearAuditLogs', () => {
    it('should clear audit logs from storage', () => {
      progressReportScheduler.clearAuditLogs();

      expect(removeItemMock).toHaveBeenCalledWith(STORAGE_KEYS.PROGRESS_REPORT_AUTO_GENERATION_AUDIT);
    });
  });

  describe('getAuditStats', () => {
    it('should return statistics from audit logs', () => {
      const logs: ProgressReportAuditLog[] = [
        {
          parentId: 'parent-1',
          studentId: 'student-1',
          studentName: 'Student 1',
          reportId: 'report-1',
          generatedAt: '2026-02-01T10:00:00',
          emailSent: true,
          emailStatus: 'sent',
          method: 'auto'
        },
        {
          parentId: 'parent-1',
          studentId: 'student-2',
          studentName: 'Student 2',
          reportId: 'report-2',
          generatedAt: '2026-02-02T11:00:00',
          emailSent: false,
          emailStatus: 'failed',
          error: 'Network error',
          method: 'auto'
        },
        {
          parentId: 'parent-2',
          studentId: 'student-3',
          studentName: 'Student 3',
          reportId: 'report-3',
          generatedAt: '2026-02-03T12:00:00',
          emailSent: true,
          emailStatus: 'sent',
          method: 'manual'
        }
      ];

      getItemMock.mockReturnValue(JSON.stringify(logs));

      const stats = progressReportScheduler.getAuditStats();

      expect(stats.totalGenerated).toBe(2);
      expect(stats.totalEmailsSent).toBe(2);
      expect(stats.totalEmailsFailed).toBe(1);
      expect(stats.byDate).toEqual({
        '2026-02-01': 1,
        '2026-02-02': 1,
        '2026-02-03': 1
      });
      expect(stats.lastGeneratedAt).toBe('2026-02-03T12:00:00');
    });

    it('should handle empty audit logs', () => {
      getItemMock.mockReturnValue('[]');

      const stats = progressReportScheduler.getAuditStats();

      expect(stats.totalGenerated).toBe(0);
      expect(stats.totalEmailsSent).toBe(0);
      expect(stats.totalEmailsFailed).toBe(0);
      expect(stats.byDate).toEqual({});
      expect(stats.lastGeneratedAt).toBeUndefined();
    });

    it('should exclude manual reports from auto-generated count', () => {
      const logs: ProgressReportAuditLog[] = [
        {
          parentId: 'parent-1',
          studentId: 'student-1',
          studentName: 'Student 1',
          reportId: 'report-1',
          generatedAt: '2026-02-01T10:00:00',
          emailSent: true,
          emailStatus: 'sent',
          method: 'auto'
        },
        {
          parentId: 'parent-1',
          studentId: 'student-2',
          studentName: 'Student 2',
          reportId: 'report-2',
          generatedAt: '2026-02-02T11:00:00',
          emailSent: true,
          emailStatus: 'sent',
          method: 'manual'
        }
      ];

      getItemMock.mockReturnValue(JSON.stringify(logs));

      const stats = progressReportScheduler.getAuditStats();

      expect(stats.totalGenerated).toBe(1);
      expect(stats.lastGeneratedAt).toBe('2026-02-01T10:00:00');
    });
  });
});
