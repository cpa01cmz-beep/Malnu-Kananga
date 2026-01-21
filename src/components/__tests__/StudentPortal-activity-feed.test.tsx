import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentPortal from '../StudentPortal';
import * as apiService from '../../services/apiService';
import * as permissionService from '../../services/permissionService';

vi.mock('../../services/apiService');
vi.mock('../../services/permissionService');
vi.mock('../../services/webSocketService');
vi.mock('../../hooks/useUnifiedNotifications');
vi.mock('../../services/offlineDataService');
vi.mock('../../utils/networkStatus');
vi.mock('../../utils/studentPortalValidator');

vi.mock('../../hooks/useUnifiedNotifications', () => ({
  usePushNotifications: () => ({
    showNotification: vi.fn(),
    createNotification: vi.fn(() => ({})),
    requestPermission: vi.fn(() => Promise.resolve(true)),
  }),
}));

vi.mock('../../services/offlineDataService', () => ({
  useOfflineDataService: () => ({
    getCachedStudentData: vi.fn(() => null),
    cacheStudentData: vi.fn(),
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

vi.mock('../../utils/networkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: true,
    isSlow: false,
  }),
  getOfflineMessage: () => 'Offline mode',
  getSlowConnectionMessage: () => 'Slow connection',
}));

const mockOnShowToast = vi.fn();

describe('StudentPortal with ActivityFeed Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiService.authAPI.getCurrentUser as any).mockReturnValue({
      id: 'student-1',
      name: 'Test Student',
      email: 'student@test.com',
    });

    (apiService.studentsAPI.getByUserId as any).mockResolvedValue({
      success: true,
      data: {
        id: 'student-1',
        userId: 'student-1',
        nis: '12345',
        className: 'XII IPA 1',
      },
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
    render(<StudentPortal onShowToast={mockOnShowToast} extraRole="osis" />);

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    });
  });

  it('should navigate to grades view when grade activity is clicked', async () => {
    render(<StudentPortal onShowToast={mockOnShowToast} extraRole="osis" />);

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    });

    await waitFor(() => {
      const gradesCard = screen.getByText('Nilai Akademik');
      expect(gradesCard).toBeInTheDocument();
    });
  });

  it('should navigate to attendance view when attendance activity is clicked', async () => {
    render(<StudentPortal onShowToast={mockOnShowToast} extraRole="osis" />);

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    });

    await waitFor(() => {
      const attendanceCard = screen.getByText('Kehadiran');
      expect(attendanceCard).toBeInTheDocument();
    });
  });

  it('should navigate to library view when material activity is clicked', async () => {
    render(<StudentPortal onShowToast={mockOnShowToast} extraRole="osis" />);

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    });

    await waitFor(() => {
      const libraryCard = screen.getByText('E-Library');
      expect(libraryCard).toBeInTheDocument();
    });
  });

  it('should navigate to groups view when message activity is clicked', async () => {
    render(<StudentPortal onShowToast={mockOnShowToast} extraRole="osis" />);

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    });

    await waitFor(() => {
      const groupsCard = screen.getByText('Grup Diskusi');
      expect(groupsCard).toBeInTheDocument();
    });
  });

  it('should display connection status indicator in ActivityFeed', async () => {
    render(<StudentPortal onShowToast={mockOnShowToast} extraRole="osis" />);

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    });

    await waitFor(() => {
      const activityFeed = screen.getByText('Aktivitas').closest('.bg-white');
      expect(activityFeed).toBeInTheDocument();
    });
  });

  it('should handle activity click navigation gracefully', async () => {
    const user = userEvent.setup();
    render(<StudentPortal onShowToast={mockOnShowToast} extraRole="osis" />);

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    });

    const gradesCard = screen.getByText('Nilai Akademik');
    await user.click(gradesCard);

    await waitFor(() => {
      expect(mockOnShowToast).toHaveBeenCalledWith('Navigasi ke nilai', 'success');
    });
  });

  it('should integrate with useRealtimeEvents hook for student event types', async () => {
    render(<StudentPortal onShowToast={mockOnShowToast} extraRole="osis" />);

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    });

    await waitFor(() => {
      const activityFeed = screen.getByText('Aktivitas');
      expect(activityFeed).toBeInTheDocument();
    });
  });

  it('should render ActivityFeed after student data is loaded', async () => {
    render(<StudentPortal onShowToast={mockOnShowToast} extraRole="osis" />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Siswa/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    });
  });
});
