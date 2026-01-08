// ClassManagement.offline.test.ts - Integration tests for ClassManagement offline functionality

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  createToastHandler: (fn: Function) => ({
    success: fn,
    error: fn,
  }),
}));

vi.mock('../../services/offlineActionQueueService', () => ({
  useOfflineActionQueue: () => ({
    sync: vi.fn(),
    addAction: vi.fn(() => 'mock-action-id'),
    getPendingCount: () => 0,
  }),
}));

vi.mock('../../utils/networkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: true,
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
    canAccess: () => ({ canAccess: true }),
    user: { id: 'teacher-1', name: 'Test Teacher' },
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
    const { useOfflineActionQueue } = require('../../services/offlineActionQueueService');
    const { useNetworkStatus } = require('../../utils/networkStatus');
    const { attendanceAPI } = require('../../services/apiService');
    
    // Mock offline status
    useNetworkStatus.mockReturnValue({
      isOnline: false,
      isSlow: false,
    });
    
    // Mock queue service
    const mockAddAction = vi.fn(() => 'offline-action-id');
    useOfflineActionQueue.mockReturnValue({
      sync: vi.fn(),
      addAction: mockAddAction,
      getPendingCount: () => 1,
    });

    render(
      <ClassManagement
        onBack={mockOnBack}
        onShowToast={mockOnShowToast}
      />
    );

    // Wait for students to load
    await waitFor(() => {
      expect(screen.getByText('Student 001')).toBeInTheDocument();
      expect(screen.getByText('Student 002')).toBeInTheDocument();
    });

    // Find attendance dropdown for first student
    const attendanceDropdowns = screen.getAllByRole('combobox');
    expect(attendanceDropdowns).toHaveLength(2);

    // Change attendance status for first student
    await userEvent.selectOptions(attendanceDropdowns[0], 'sakit');

    await waitFor(() => {
      expect(mockAddAction).toHaveBeenCalledWith({
        type: 'update',
        entity: 'attendance',
        entityId: 'student-1_' + new Date().toISOString().split('T')[0],
        data: expect.objectContaining({
          studentId: 'student-1',
          classId: 'X RPL 1',
          status: 'sakit',
        }),
        endpoint: '/api/attendance',
        method: 'POST',
      });
    });

    expect(screen.getByText('Status kehadiran akan diperbarui saat koneksi tersedia.')).toBeInTheDocument();
  });

  it('should update attendance normally when online', async () => {
    const { attendanceAPI } = require('../../services/apiService');
    
    // Mock successful API response
    attendanceAPI.create.mockResolvedValue({
      success: true,
      data: {id: 'attendance-1'},
    });

    render(
      <ClassManagement
        onBack={mockOnBack}
        onShowToast={mockOnShowToast}
      />
    );

    // Wait for students to load
    await waitFor(() => {
      expect(screen.getByText('Student 001')).toBeInTheDocument();
    });

    // Change attendance status
    const attendanceDropdowns = screen.getAllByRole('combobox');
    await userEvent.selectOptions(attendanceDropdowns[0], 'sakit');

    await waitFor(() => {
      expect(attendanceAPI.create).toHaveBeenCalled();
    });

    expect(mockOnShowToast).toHaveBeenCalledWith(
      'Status kehadiran diperbarui',
      'success'
    );
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