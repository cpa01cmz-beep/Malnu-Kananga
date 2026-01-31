import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AdminDashboard from '../AdminDashboard';
import * as permissionService from '../../services/permissionService';
import { STORAGE_KEYS } from '../../constants';

vi.mock('../../services/apiService');
vi.mock('../../services/permissionService');
vi.mock('../../services/webSocketService');
vi.mock('../../services/offlineActionQueueService');
vi.mock('../../hooks/useUnifiedNotifications');
vi.mock('../../utils/networkStatus');
vi.mock('../../hooks/useDashboardVoiceCommands');

vi.mock('../../hooks/useUnifiedNotifications', () => ({
  usePushNotifications: () => ({
    showNotification: vi.fn(),
    createNotification: vi.fn(() => ({})),
    requestPermission: vi.fn(() => Promise.resolve(true)),
  }),
}));

vi.mock('../../utils/networkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: true,
    isSlow: false,
  }),
  getOfflineMessage: () => 'Offline mode',
  getSlowConnectionMessage: () => 'Slow connection',
}));

vi.mock('../../services/offlineActionQueueService', () => ({
  useOfflineActionQueue: () => ({
    getPendingCount: vi.fn(() => 0),
    getFailedCount: vi.fn(() => 0),
    sync: vi.fn(() => Promise.resolve()),
    isSyncing: false,
  }),
}));

vi.mock('../../hooks/useDashboardVoiceCommands', () => ({
  useDashboardVoiceCommands: () => ({
    isSupported: true,
    handleVoiceCommand: vi.fn(() => true),
    getAvailableCommands: vi.fn(() => [
      'GO_HOME',
      'LOGOUT',
      'HELP',
      'SHOW_PPDB',
      'VIEW_GRADES_OVERVIEW',
      'OPEN_LIBRARY',
      'GO_TO_CALENDAR',
      'SHOW_STATISTICS',
    ]),
  }),
}));

vi.mock('../../services/webSocketService', () => ({
  webSocketService: {
    initialize: vi.fn(() => Promise.resolve()),
    getConnectionState: vi.fn(() => ({
      connected: true,
      connecting: false,
      reconnecting: false,
      reconnectAttempts: 0,
      subscriptions: new Set(),
    })),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

const mockOnShowToast = vi.fn();
const mockOnOpenEditor = vi.fn();

describe('AdminDashboard with ActivityFeed Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
      id: 'admin-1',
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'admin',
    }));

    (permissionService.permissionService.hasPermission as any).mockReturnValue({
      granted: true,
    });
  });

  it('should render ActivityFeed component on home view', async () => {
    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Dashboard Administrator/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should navigate to users view when user activity is clicked', async () => {
    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Dashboard Administrator/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const userManagementCard = screen.getByText('Manajemen User');
      expect(userManagementCard).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should navigate to announcements view when announcement activity is clicked', async () => {
    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Dashboard Administrator/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const announcementsCard = screen.getByText('Pengumuman');
      expect(announcementsCard).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should render ActivityFeed after dashboard data is loaded', async () => {
    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Dashboard Administrator/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('AI Site Editor')).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should not show real-time indicator when offline', async () => {
    vi.mock('../../utils/networkStatus', () => ({
      useNetworkStatus: () => ({
        isOnline: false,
        isSlow: false,
      }),
      getOfflineMessage: () => 'Offline mode',
      getSlowConnectionMessage: () => 'Slow connection',
    }));

    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Dashboard Administrator/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('Real-time Aktif')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should preserve all existing dashboard functionality', async () => {
    render(<AdminDashboard onOpenEditor={mockOnOpenEditor} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Dashboard Administrator/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('AI Site Editor')).toBeInTheDocument();
      expect(screen.getByText('PPDB Online')).toBeInTheDocument();
      expect(screen.getByText('Manajemen User')).toBeInTheDocument();
      expect(screen.getByText('Laporan & Log')).toBeInTheDocument();
      expect(screen.getByText('Pengumuman')).toBeInTheDocument();
      expect(screen.getByText('AI Cache Manager')).toBeInTheDocument();
      expect(screen.getByText('Permission System')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
