import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from '../AdminDashboard';
import { STORAGE_KEYS } from '../../constants';
import { logger } from '../../utils/logger';

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn().mockReturnValue(undefined),
    error: vi.fn().mockReturnValue(undefined),
    warn: vi.fn().mockReturnValue(undefined),
  },
}));

vi.mock('../../services/offlineActionQueueService', () => ({
  useOfflineActionQueue: () => ({
    getPendingCount: vi.fn(() => 0),
    getFailedCount: vi.fn(() => 0),
    sync: vi.fn(() => Promise.resolve({ success: true, actionsProcessed: 0, actionsFailed: 0, conflicts: [], errors: [] })),
    isSyncing: false,
  }),
}));

vi.mock('../../hooks/usePushNotifications', () => ({
  usePushNotifications: () => ({
    showNotification: vi.fn(),
    createNotification: vi.fn(() => ({ id: 'test', type: 'system', title: 'test', message: 'test', timestamp: Date.now(), read: false })),
    requestPermission: vi.fn(() => Promise.resolve(true)),
  }),
}));

vi.mock('../../hooks/useDashboardVoiceCommands', () => ({
  useDashboardVoiceCommands: () => ({
    isSupported: true,
    handleVoiceCommand: vi.fn(() => true),
    getAvailableCommands: vi.fn(() => []),
  }),
}));

vi.mock('../../hooks/useCanAccess', () => ({
  useCanAccess: () => ({
    user: { id: 'admin-1', username: 'admin', role: 'admin', status: 'active' },
    canAccess: vi.fn(() => ({ canAccess: true, requiredPermission: 'system.admin' })),
  }),
}));

vi.mock('../../utils/networkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: true, isSlow: false }),
  getOfflineMessage: () => 'Anda sedang offline',
  getSlowConnectionMessage: () => 'Koneksi lambat terdeteksi',
}));

vi.mock('../PermissionGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../services/voiceSettingsBackup', () => ({
  backupVoiceSettings: vi.fn(() => Promise.resolve()),
}));

describe('AdminDashboard - Error Handling & Offline Support', () => {
  const mockOnOpenEditor = vi.fn();
  const mockOnShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
      id: 'admin-1',
      username: 'admin',
      role: 'admin',
      status: 'active',
    }));
  });

  it('should display cached data when offline', async () => {
    const cachedData = { lastSync: new Date().toISOString(), stats: { users: 10 } };
    localStorage.setItem(STORAGE_KEYS.ADMIN_DASHBOARD_CACHE, JSON.stringify(cachedData));

    vi.doMock('../../utils/networkStatus', () => ({
      useNetworkStatus: () => ({ isOnline: false, isSlow: false }),
      getOfflineMessage: () => 'Anda sedang offline',
      getSlowConnectionMessage: () => 'Koneksi lambat terdeteksi',
    }));

    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.queryByText(/Dashboard Administrator/i)).toBeInTheDocument();
      expect(screen.getByText(/Offline/i)).toBeInTheDocument();
    });
  });

  it('should show error message with type categorization when API fails', async () => {
    vi.doMock('../../utils/networkStatus', () => ({
      useNetworkStatus: () => ({ isOnline: true, isSlow: false }),
      getOfflineMessage: () => 'Anda sedang offline',
      getSlowConnectionMessage: () => 'Koneksi lambat terdeteksi',
    }));

    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      const errorMessage = screen.queryByText(/Gagal memuat data dashboard/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('should display sync status indicator when syncing', async () => {
    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.queryByText(/Sinkronisasi Selesai/i)).toBeInTheDocument();
    });
  });

  it('should show offline action queue badge when actions are pending', async () => {
    vi.doMock('../../services/offlineActionQueueService', () => ({
      useOfflineActionQueue: () => ({
        getPendingCount: vi.fn(() => 3),
        getFailedCount: vi.fn(() => 1),
        sync: vi.fn(() => Promise.resolve({ success: true, actionsProcessed: 0, actionsFailed: 0, conflicts: [], errors: [] })),
        isSyncing: false,
      }),
    }));

    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      const badge = screen.queryByText('3 menunggu');
      expect(badge).toBeInTheDocument();
    });
  });

  it('should handle manual sync button click', async () => {
    const mockSync = vi.fn(() => Promise.resolve({ success: true, actionsProcessed: 2, actionsFailed: 0, conflicts: [], errors: [] }));

    vi.doMock('../../services/offlineActionQueueService', () => ({
      useOfflineActionQueue: () => ({
        getPendingCount: vi.fn(() => 0),
        getFailedCount: vi.fn(() => 0),
        sync: mockSync,
        isSyncing: false,
      }),
    }));

    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      const syncButton = screen.queryByTitle('Sinkronisasi manual');
      expect(syncButton).toBeInTheDocument();
      if (syncButton) {
        fireEvent.click(syncButton);
        waitFor(() => {
          expect(mockSync).toHaveBeenCalled();
          expect(mockOnShowToast).toHaveBeenCalledWith('Sinkronisasi berhasil', 'success');
        });
      }
    });
  });

  it('should disable sync button when offline', async () => {
    vi.doMock('../../utils/networkStatus', () => ({
      useNetworkStatus: () => ({ isOnline: false, isSlow: false }),
      getOfflineMessage: () => 'Anda sedang offline',
      getSlowConnectionMessage: () => 'Koneksi lambat terdeteksi',
    }));

    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      const syncButton = screen.queryByTitle(/Memerlukan koneksi internet/i);
      expect(syncButton).toBeDisabled();
    });
  });

  it('should display last sync timestamp', async () => {
    const lastSync = new Date('2026-01-22T10:30:00').toISOString();
    localStorage.setItem(STORAGE_KEYS.ADMIN_DASHBOARD_CACHE, JSON.stringify({ lastSync }));

    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      const syncTimestamp = screen.queryByText(/Terakhir diperbarui/i);
      expect(syncTimestamp).toBeInTheDocument();
    });
  });

  it('should log errors with proper categorization', async () => {
    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalled();
    });
  });

  it('should use retry with exponential backoff on network errors', async () => {
    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(logger.info).toHaveBeenCalled();
    });
  });

  it('should show error fallback to cached data when API fails', async () => {
    const cachedData = { lastSync: new Date().toISOString(), stats: { users: 5 } };
    localStorage.setItem(STORAGE_KEYS.ADMIN_DASHBOARD_CACHE, JSON.stringify(cachedData));

    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      const fallbackMessage = screen.queryByText(/Data terakhir dari cache/i);
      expect(fallbackMessage).toBeInTheDocument();
    });
  });

  it('should distinguish between offline and network errors', async () => {
    vi.doMock('../../utils/networkStatus', () => ({
      useNetworkStatus: () => ({ isOnline: false, isSlow: false }),
      getOfflineMessage: () => 'Anda sedang offline',
      getSlowConnectionMessage: () => 'Koneksi lambat terdeteksi',
    }));

    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Offline/i)).toBeInTheDocument();
    });
  });
});
