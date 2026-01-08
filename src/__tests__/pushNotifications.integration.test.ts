import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pushNotificationService } from '../services/pushNotificationService';

// Mock logger
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Notification API with proper typing
interface MockNotification {
  close: ReturnType<typeof vi.fn>;
  onclick: ((this: MockNotification, ev: globalThis.MouseEvent) => unknown) | null;
  title: string;
  [key: string]: unknown;
}

const mockNotification: MockNotification = {
  close: vi.fn(),
  onclick: null,
  title: '',
};

// Type assertion needed for browser API mocking
(global.Notification as any) = {
  requestPermission: vi.fn(),
  permission: 'granted',
};

// Type assertion needed for browser API mocking
(global.navigator as any) = {
  serviceWorker: {
    ready: Promise.resolve({
      pushManager: {
        subscribe: vi.fn(),
      },
    }),
  },
};

describe('Push Notification Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
    
    // Clear notification service history, analytics and settings
    pushNotificationService.clearHistory();
    pushNotificationService.clearAnalytics();
    pushNotificationService.resetSettings();
    
    // Mock Notification constructor (using necessary type bypass for browser API)
    const mockNotificationConstructor = vi.fn().mockImplementation(function(title: string, options?: Record<string, unknown>) {
      return {
        ...mockNotification,
        title,
        ...options,
        close: vi.fn(),
      };
    });
    // Type assertion needed for browser API mocking
    (mockNotificationConstructor as any).permission = 'granted';
    (mockNotificationConstructor as any).requestPermission = vi.fn().mockResolvedValue('granted');
    (global.Notification as any) = mockNotificationConstructor;
  });

  describe('PPDB Status Change Notifications', () => {
    it('should send notification when PPDB applicant is approved', async () => {
      const notification = {
        id: 'ppdb-status-123-1234567890',
        type: 'ppdb' as const,
        title: 'Selamat! Anda Diterima',
        body: 'Selamat John Doe, Anda telah diterima di MA Malnu Kananga!',
        icon: '✅',
        timestamp: '2024-01-01T00:00:00.000Z',
        read: false,
        priority: 'high' as const,
        targetUsers: ['user123'],
        data: {
          action: 'view_ppdb_status',
          registrantId: '123',
          status: 'approved',
        },
      };

      await pushNotificationService.showLocalNotification(notification);

      expect(global.Notification).toHaveBeenCalledWith(
        'Selamat! Anda Diterima',
        expect.objectContaining({
          body: 'Selamat John Doe, Anda telah diterima di MA Malnu Kananga!',
          icon: '✅',
          tag: 'ppdb-status-123-1234567890',
          requireInteraction: true,
        })
      );
    });

    it('should send notification when PPDB applicant is rejected', async () => {
      const notification = {
        id: 'ppdb-status-124-1234567890',
        type: 'ppdb' as const,
        title: 'Hasil Seleksi PPDB',
        body: 'Terima kasih Jane Doe telah mendaftar. Mohon maaf, Anda belum dapat diterima pada tahun ajaran ini.',
        icon: '❌',
        timestamp: '2024-01-01T00:00:00.000Z',
        read: false,
        priority: 'high' as const,
        targetUsers: ['user124'],
        data: {
          action: 'view_ppdb_status',
          registrantId: '124',
          status: 'rejected',
        },
      };

      await pushNotificationService.showLocalNotification(notification);

      expect(global.Notification).toHaveBeenCalledWith(
        'Hasil Seleksi PPDB',
        expect.objectContaining({
          body: 'Terima kasih Jane Doe telah mendaftar. Mohon maaf, Anda belum dapat diterima pada tahun ajaran ini.',
          icon: '❌',
          tag: 'ppdb-status-124-1234567890',
          requireInteraction: true,
        })
      );
    });
  });

  describe('Grade Publication Notifications', () => {
    it('should send notification to students when grades are published', async () => {
      const notification = {
        id: 'grade-student123-math-1234567890',
        type: 'grade' as const,
        title: 'Nilai Baru Tersedia',
        body: 'Nilai Matematika Wajib Anda telah dipublikasikan: 85.0 (B)',
        icon: '📊',
        timestamp: '2024-01-01T00:00:00.000Z',
        read: false,
        priority: 'normal' as const,
        targetUsers: ['student123'],
        data: {
          action: 'view_grades',
          subjectId: 'math',
          className: 'XII IPA 1',
        },
      };

      await pushNotificationService.showLocalNotification(notification);

      expect(global.Notification).toHaveBeenCalledWith(
        'Nilai Baru Tersedia',
        expect.objectContaining({
          body: 'Nilai Matematika Wajib Anda telah dipublikasikan: 85.0 (B)',
          icon: '📊',
          tag: 'grade-student123-math-1234567890',
          requireInteraction: false,
        })
      );
    });
  });

  describe('User Role Change Notifications', () => {
    it('should send notification when user role is changed', async () => {
      const notification = {
        id: 'role-change-456-1234567890',
        type: 'system' as const,
        title: 'Perubahan Hak Akses',
        body: 'Peran Anda telah diubah menjadi teacher (wakasek)',
        icon: '🔐',
        timestamp: '2024-01-01T00:00:00.000Z',
        read: false,
        priority: 'high' as const,
        targetUsers: ['user456'],
        data: {
          action: 'login_required',
          oldRole: 'teacher',
          newRole: 'teacher',
          newExtraRole: 'wakasek',
        },
      };

      await pushNotificationService.showLocalNotification(notification);

      expect(global.Notification).toHaveBeenCalledWith(
        'Perubahan Hak Akses',
        expect.objectContaining({
          body: 'Peran Anda telah diubah menjadi teacher (wakasek)',
          icon: '🔐',
          tag: 'role-change-456-1234567890',
          requireInteraction: true,
        })
      );
    });

    it('should send welcome notification to new user', async () => {
      const notification = {
        id: 'welcome-789-1234567890',
        type: 'system' as const,
        title: 'Selamat Datang!',
        body: 'Akun Anda telah dibuat. Selamat menggunakan sistem MA Malnu Kananga.',
        icon: '👋',
        timestamp: '2024-01-01T00:00:00.000Z',
        read: false,
        priority: 'normal' as const,
        targetUsers: ['user789'],
        data: {
          action: 'welcome',
          role: 'student',
          extraRole: null,
        },
      };

      await pushNotificationService.showLocalNotification(notification);

      expect(global.Notification).toHaveBeenCalledWith(
        'Selamat Datang!',
        expect.objectContaining({
          body: 'Akun Anda telah dibuat. Selamat menggunakan sistem MA Malnu Kananga.',
          icon: '👋',
          tag: 'welcome-789-1234567890',
          requireInteraction: false,
        })
      );
    });
  });

  describe('Notification History and Analytics', () => {
    it('should record notifications in history', async () => {
      const notification = {
        id: 'test-notification-1234567890',
        type: 'grade' as const,
        title: 'Test Notification',
        body: 'Test body',
        timestamp: '2024-01-01T00:00:00.000Z',
        read: false,
        priority: 'normal' as const,
      };

      await pushNotificationService.showLocalNotification(notification);

      const history = pushNotificationService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].notification.id).toBe('test-notification-1234567890');
      expect(history[0].notification.title).toBe('Test Notification');
    });

    it('should record analytics for delivered notifications', async () => {
      const notification = {
        id: 'analytics-test-1234567890',
        type: 'grade' as const,
        title: 'Analytics Test',
        body: 'Test body',
        timestamp: '2024-01-01T00:00:00.000Z',
        read: false,
        priority: 'normal' as const,
      };

      await pushNotificationService.showLocalNotification(notification);

      const analytics = pushNotificationService.getAnalytics();
      expect(analytics).toHaveLength(1);
      expect(analytics[0].notificationId).toBe('analytics-test-1234567890');
      expect(analytics[0].delivered).toBe(1);
    });
  });

  describe('Notification Filtering', () => {
    it('should respect user notification preferences', () => {
      // Mock disabled notifications
const settings = {
        enabled: true,
        announcements: true,
        grades: false,
        ppdbStatus: true,
        events: true,
        library: true,
        system: true,
        ocr: false,
        roleBasedFiltering: false,
        batchNotifications: false,
        quietHours: { enabled: false, start: '22:00', end: '07:00' },
      };
      
      pushNotificationService.saveSettings(settings);

      const notification = {
        id: 'filtered-notification-1234567890',
        type: 'grade' as const,
        title: 'Should Not Show',
        body: 'This should be filtered',
        timestamp: '2024-01-01T00:00:00.000Z',
        read: false,
        priority: 'normal' as const,
      };

      // This should not show the notification due to settings
      pushNotificationService.showLocalNotification(notification);

      expect(global.Notification).not.toHaveBeenCalled();
    });
  });
});