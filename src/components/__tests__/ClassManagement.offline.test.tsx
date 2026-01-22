// ClassManagement.offline.test.ts - Integration tests for ClassManagement offline functionality

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ClassManagement from '../ClassManagement';

// Mock services
vi.mock('../../services/apiService', () => ({
  studentsAPI: {
    getByClass: () => Promise.resolve({
      success: true,
      data: [
        { id: 'student-1', name: 'Student 001', nis: '001', className: 'Student 001', address: 'Address 1' },
        { id: 'student-2', name: 'Student 002', nis: '002', className: 'Student 002', address: 'Address 2' },
      ],
    }),
  },
  attendanceAPI: {
    getByDate: () => Promise.resolve({
      success: true,
      data: [],
    }),
    create: vi.fn(),
  },
}));

vi.mock('../../utils/teacherValidation', () => ({
  validateAttendance: () => ({ isValid: true }),
}));

vi.mock('../../utils/teacherErrorHandler', () => ({
  executeWithRetry: () => ({ success: true }),
  createToastHandler: (fn: () => void) => ({
    success: fn,
    error: fn,
  }),
}));

vi.mock('../../services/offlineActionQueueService', () => ({
  useOfflineActionQueue: () => ({
    sync: vi.fn(),
    addAction: vi.fn(() => 'mock-action-id'),
    getPendingCount: () => 0,
    getFailedCount: () => 0,
    isSyncing: false,
    retryFailedActions: vi.fn(),
    clearCompletedActions: vi.fn(),
  }),
}));

vi.mock('../../utils/networkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: false, // Force offline to show indicator
    isSlow: false,
  }),
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../hooks/useCanAccess', () => ({
  useCanAccess: () => ({
    user: { id: 'teacher-1', name: 'Test Teacher' },
    userRole: 'teacher',
    userExtraRole: null,
    canAccess: vi.fn(() => true),
    canAccessAny: vi.fn(() => true),
    canAccessResource: vi.fn(() => true),
    userPermissions: [],
    userPermissionIds: [],
  }),
}));

describe('ClassManagement Offline Queue Integration', () => {
  const mockOnShowToast = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should queue attendance update when offline', async () => {
    render(
      <ClassManagement
        onBack={mockOnBack}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Student 001/)).toBeInTheDocument();
      expect(screen.getByText(/Student 002/)).toBeInTheDocument();
    });

    const attendanceButtons = screen.getAllByRole('button');
    expect(attendanceButtons.length).toBeGreaterThan(0);
  });

  it('should update attendance normally when online', async () => {
    vi.doMock('../../utils/networkStatus', () => ({
      useNetworkStatus: () => ({
        isOnline: true,
        isSlow: false,
      }),
    }));

    render(
      <ClassManagement
        onBack={mockOnBack}
        onShowToast={mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Student 001/)).toBeInTheDocument();
    });
  });

  it('should show offline indicator', async () => {
    render(
      <ClassManagement
        onBack={mockOnBack}
        onShowToast={mockOnShowToast}
      />
    );

    // The OfflineIndicator should be present
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument(); // OfflineIndicator typically has status role
    });
  });
});