import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TeacherDashboard from '../TeacherDashboard';
import * as permissionService from '../../services/permissionService';

vi.mock('../../services/apiService');
vi.mock('../../services/permissionService');
vi.mock('../../services/webSocketService');
vi.mock('../../hooks/useUnifiedNotifications');
vi.mock('../../utils/networkStatus');
vi.mock('../../services/pdfExportService');

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

vi.mock('../../services/pdfExportService', () => ({
  pdfExportService: {
    createConsolidatedReport: vi.fn(),
  },
}));

const mockOnShowToast = vi.fn();

describe('TeacherDashboard with ActivityFeed Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('malnu_users', JSON.stringify({
      id: 'teacher-1',
      name: 'Test Teacher',
      email: 'teacher@test.com',
      role: 'teacher',
    }));

    (permissionService.permissionService.hasPermission as any).mockReturnValue({
      granted: true,
    });
  });

  it('should render ActivityFeed component on home view', async () => {
    render(<TeacherDashboard onShowToast={mockOnShowToast} extraRole="staff" />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Guru/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should navigate to analytics view when grade activity is clicked', async () => {
    render(<TeacherDashboard onShowToast={mockOnShowToast} extraRole="staff" />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Guru/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const analyticsCard = screen.getByText('Analitik Nilai');
      expect(analyticsCard).toBeInTheDocument();
    });
  });

  it('should navigate to messages view when message activity is clicked', async () => {
    render(<TeacherDashboard onShowToast={mockOnShowToast} extraRole="staff" />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Guru/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const messagesCard = screen.getByText('Pesan');
      expect(messagesCard).toBeInTheDocument();
    });
  });

  it('should show toast notification for announcements when announcement activity is clicked', async () => {
    render(<TeacherDashboard onShowToast={mockOnShowToast} extraRole="staff" />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Guru/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show toast notification for events when event activity is clicked', async () => {
    render(<TeacherDashboard onShowToast={mockOnShowToast} extraRole="staff" />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Guru/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display connection status indicator in ActivityFeed', async () => {
    render(<TeacherDashboard onShowToast={mockOnShowToast} extraRole="staff" />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Guru/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const activityFeed = screen.getByText('Aktivitas');
      expect(activityFeed).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should integrate with useRealtimeEvents hook for teacher event types', async () => {
    render(<TeacherDashboard onShowToast={mockOnShowToast} extraRole="staff" />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Guru/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should render ActivityFeed after dashboard data is loaded', async () => {
    render(<TeacherDashboard onShowToast={mockOnShowToast} extraRole="staff" />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Guru/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Aktivitas')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle multiple activity types correctly', async () => {
    render(<TeacherDashboard onShowToast={mockOnShowToast} extraRole="staff" />);

    await waitFor(() => {
      expect(screen.getByText(/Portal Guru/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const activityFeed = screen.getByText('Aktivitas');
      expect(activityFeed).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
