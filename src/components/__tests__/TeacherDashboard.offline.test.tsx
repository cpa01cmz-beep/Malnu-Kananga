import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import TeacherDashboard from '../TeacherDashboard';

// Mock hooks
vi.mock('../../hooks/usePushNotifications', () => ({
  usePushNotifications: () => ({
    showNotification: vi.fn(),
    createNotification: vi.fn(),
    requestPermission: vi.fn().mockResolvedValue(true)
  })
}));

vi.mock('../../utils/networkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: false,
    isSlow: false
  }),
  getOfflineMessage: () => 'Anda sedang offline.',
  getSlowConnectionMessage: () => 'Koneksi lambat.'
}));

describe('TeacherDashboard Offline Support', () => {
  const mockShowToast = vi.fn();
  const defaultProps = {
    onShowToast: mockShowToast,
    extraRole: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
    
    // Mock data from localStorage
    localStorage.setItem(
      'malnu_teacher_dashboard_cache',
      JSON.stringify({ lastSync: '2026-01-07T10:00:00.000Z' })
    );
  });

  it('should show offline indicator when network is offline', async () => {
    render(<TeacherDashboard {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('(Offline)')).toBeInTheDocument();
    });
  });

  it('should display cached dashboard data when offline', async () => {
    render(<TeacherDashboard {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/terakhir diperbarui:/i)).toBeInTheDocument();
    });
  });

  it('should show offline message in error state', async () => {
    localStorage.removeItem('malnu_teacher_dashboard_cache');
    
    render(<TeacherDashboard {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Anda sedang offline.')).toBeInTheDocument();
    });
  });

  it('should disable cards when offline', async () => {
    render(<TeacherDashboard {...defaultProps} />);
    
    await waitFor(() => {
      // Check that cards have disabled state indicators
      const offlineIndicators = screen.getAllByText('Offline');
      expect(offlineIndicators.length).toBeGreaterThan(0);
    });
  });
});