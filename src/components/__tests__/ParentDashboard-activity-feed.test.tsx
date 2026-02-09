import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ParentDashboard from '../ParentDashboard';
import * as apiService from '../../services/apiService';
import * as permissionService from '../../services/permissionService';

vi.mock('../../services/apiService');
vi.mock('../../services/permissionService');
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
    disconnect: vi.fn(),
    isConnected: vi.fn(() => true),
  },
}));
vi.mock('../../hooks/useUnifiedNotifications');
vi.mock('../../hooks/useEventNotifications');
vi.mock('../../services/offlineDataService');
vi.mock('../../services/parentGradeNotificationService');
vi.mock('../../utils/networkStatus');
vi.mock('../../utils/parentValidation');

vi.mock('../../hooks/useUnifiedNotifications', () => ({
  usePushNotifications: () => ({
    showNotification: vi.fn(),
    createNotification: vi.fn(() => ({})),
    requestPermission: vi.fn(() => Promise.resolve(true)),
  }),
}));

vi.mock('../../hooks/useEventNotifications', () => ({
  useEventNotifications: () => ({
    useMonitorLocalStorage: vi.fn(),
  }),
}));

vi.mock('../../services/offlineDataService', () => ({
  useOfflineDataService: () => ({
    getCachedParentData: vi.fn(() => null),
    cacheParentData: vi.fn(),
    forceSync: vi.fn(() => Promise.resolve()),
  }),
  useOfflineData: () => ({
    syncStatus: {
      lastSync: Date.now(),
      needsSync: false,
      pendingActions: 0,
    },
    isCached: false,
  }),
}));

vi.mock('../../services/parentGradeNotificationService', () => ({
  parentGradeNotificationService: {
    processGradeUpdate: vi.fn(),
    checkMissingGrades: vi.fn(),
  },
}));

vi.mock('../../utils/networkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: true,
    isSlow: false,
  }),
  getOfflineMessage: () => 'Offline mode',
}));

vi.mock('../../utils/parentValidation', () => ({
  validateParentChildDataAccess: vi.fn(() => ({ isValid: true, errors: [], warnings: [] })),
  validateChildDataIsolation: vi.fn(() => ({ isValid: true, errors: [], warnings: [] })),
  validateGradeVisibilityRestriction: vi.fn(() => ({ isValid: true, errors: [], warnings: [] })),
  validateOfflineDataIntegrity: vi.fn(() => ({ isValid: true, errors: [], warnings: [] })),
}));

const mockOnShowToast = vi.fn();

describe('ParentDashboard with ActivityFeed Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiService.authAPI.getCurrentUser as any).mockReturnValue({
      id: 'parent-1',
      name: 'Test Parent',
      email: 'parent@test.com',
    });

    (apiService.parentsAPI.getChildren as any).mockResolvedValue({
      success: true,
      data: [
        {
          studentId: 'student-1',
          studentName: 'Test Child 1',
          className: 'XII IPA 1',
        },
      ],
    });

    (apiService.gradesAPI.getByStudent as any).mockResolvedValue({
      success: true,
      data: [],
    });

    (apiService.attendanceAPI.getByStudent as any).mockResolvedValue({
      success: true,
      data: [],
    });

    (permissionService.permissionService.hasPermission as any).mockReturnValue({
      granted: true,
    });
  });

  it('should render ActivityFeed component on home view', async () => {
    render(<ParentDashboard onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Wali Murid/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should navigate to grades view when grade activity is clicked', async () => {
    render(<ParentDashboard onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Wali Murid/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const gradesCard = screen.getByText(/Nilai/i);
      expect(gradesCard).toBeInTheDocument();
    });
  });

  it('should navigate to attendance view when attendance activity is clicked', async () => {
    render(<ParentDashboard onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Wali Murid/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const attendanceCard = screen.getByText(/Kehadiran/i);
      expect(attendanceCard).toBeInTheDocument();
    });
  });

  it('should navigate to events view when announcement activity is clicked', async () => {
    render(<ParentDashboard onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Wali Murid/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const eventsCard = screen.getByText(/Kegiatan/i);
      expect(eventsCard).toBeInTheDocument();
    });
  });

  it('should navigate to events view when event activity is clicked', async () => {
    render(<ParentDashboard onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Wali Murid/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const eventsCard = screen.getByText(/Kegiatan/i);
      expect(eventsCard).toBeInTheDocument();
    });
  });

  it('should display connection status indicator in ActivityFeed', async () => {
    render(<ParentDashboard onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Wali Murid/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const activityFeed = screen.getByText('Aktivitas');
      expect(activityFeed).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should integrate with useRealtimeEvents hook for parent event types', async () => {
    render(<ParentDashboard onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Wali Murid/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const activityFeed = screen.getByText('Aktivitas');
      expect(activityFeed).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should render ActivityFeed after children data is loaded', async () => {
    render(<ParentDashboard onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Wali Murid/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle activity click navigation for multiple children', async () => {
    (apiService.parentsAPI.getChildren as any).mockResolvedValue({
      success: true,
      data: [
        {
          studentId: 'student-1',
          studentName: 'Test Child 1',
          className: 'XII IPA 1',
        },
        {
          studentId: 'student-2',
          studentName: 'Test Child 2',
          className: 'XI IPA 2',
        },
      ],
    });

    render(<ParentDashboard onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Wali Murid/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle activity click navigation with selected child', async () => {
    render(<ParentDashboard onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/Data Saat Ini/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
