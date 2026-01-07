// GradingManagement.offline.test.ts - Integration tests for GradingManagement offline functionality

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GradingManagement from '../GradingManagement';

// Mock services
vi.mock('../../services/apiService', () => ({
  authAPI: {
    getCurrentUser: () => ({ id: 'teacher-1', name: 'Test Teacher', role: 'teacher' }),
  },
  gradesAPI: {
    getByClass: () => Promise.resolve({
      success: true,
      data: [
        { id: 'student-1', name: 'Student 1', nis: '001', assignment: 0, midExam: 0, finalExam: 0 },
        { id: 'student-2', name: 'Student 2', nis: '002', assignment: 0, midExam: 0, finalExam: 0 },
      ],
    }),
    update: vi.fn(),
    getByStudent: () => Promise.resolve({ success: true, data: [] }),
  },
  studentsAPI: {
    getByClass: () => Promise.resolve({
      success: true,
      data: [
        { id: 'student-1', name: 'Student 1', nis: '001' },
        { id: 'student-2', name: 'Student 2', nis: '002' },
      ],
    }),
  },
  subjectsAPI: {
    getAll: () => Promise.resolve({
      success: true,
      data: [
        { id: 'subject-1', name: 'Mathematics' },
        { id: 'subject-2', name: 'Science' },
      ],
    }),
    getClasses: () => Promise.resolve({
      success: true,
      data: [
        { id: 'class-1', name: 'Class A' },
        { id: 'class-2', name: 'Class B' },
      ],
    }),
  },
  attendanceAPI: {
    getByStudent: () => Promise.resolve({ success: true, data: [] }),
  },
}));

vi.mock('../../services/permissionService', () => ({
  permissionService: {
    hasPermission: () => ({ granted: true }),
  },
}));

vi.mock('../../services/pushNotificationService', () => ({
  pushNotificationService: {
    sendNotification: () => Promise.resolve(),
  },
}));

vi.mock('../../services/geminiService', () => ({
  analyzeClassPerformance: () => Promise.resolve('Analysis result'),
}));

vi.mock('../../utils/networkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: true, isSlow: false }),
  getOfflineMessage: () => 'Offline',
  getSlowConnectionMessage: () => 'Slow connection',
  NetworkError: class extends Error {},
  isNetworkError: () => false,
}));

vi.mock('../../services/offlineActionQueueService', () => ({
  useOfflineActionQueue: () => ({
    getPendingCount: () => 0,
    getFailedCount: () => 0,
    sync: () => Promise.resolve({ success: true, actionsProcessed: 0, actionsFailed: 0, conflicts: [], errors: [] }),
    retryFailedActions: () => Promise.resolve({ success: true, actionsProcessed: 0, actionsFailed: 0, conflicts: [], errors: [] }),
    clearCompletedActions: () => {},
    onSyncComplete: () => () => {},
    addAction: vi.fn((_action) => `action-id-${Date.now()}`),
    getQueue: () => [],
    resolveConflict: () => {},
    isOnline: true,
    isSlow: false,
    isSyncing: false,
  }),
  createOfflineApiCall: () => () => Promise.resolve({ success: true, data: {} }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('GradingManagement Offline Integration', () => {
  const mockOnBack = vi.fn();
  const mockOnShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render component and handle network status changes', async () => {
    render(<GradingManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('Manajemen Penilaian Akademik')).toBeInTheDocument();
    });

    // Check that offline indicator is present
    expect(screen.getByText(/Offline Indicator/i)).toBeInTheDocument();
  });

  it('should handle grade input changes and trigger auto-save', async () => {
    const user = userEvent.setup();
    
    render(<GradingManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Student 1')).toBeInTheDocument();
    });

    // Find assignment input for first student and change its value
    const assignmentInput = screen.getAllByRole('spinbutton')[0]; // First assignment score input
    await user.clear(assignmentInput);
    await user.type(assignmentInput, '85');

    // Wait for auto-save to trigger (2 second debounce in component)
    await waitFor(
      () => {
        expect(mockOnShowToast).toHaveBeenCalledWith(
          expect.stringContaining('disimpan'),
          'success'
        );
      },
      { timeout: 3000 }
    );
  });

  it('should handle offline mode and queue grade updates', async () => {
    // Mock offline state
    const mockAddAction = vi.fn().mockReturnValue('action-id-123');
    const mockGetPendingCount = vi.fn().mockReturnValue(2);
    
    vi.doMock('../../services/offlineActionQueueService', () => ({
      useOfflineActionQueue: () => ({
        getPendingCount: mockGetPendingCount,
        getFailedCount: () => 0,
        sync: () => Promise.resolve({ success: true, actionsProcessed: 0, actionsFailed: 0, conflicts: [], errors: [] }),
        retryFailedActions: () => Promise.resolve({ success: true, actionsProcessed: 0, actionsFailed: 0, conflicts: [], errors: [] }),
        clearCompletedActions: () => {},
        onSyncComplete: () => () => {},
        addAction: mockAddAction,
        getQueue: () => [],
        resolveConflict: () => {},
        isOnline: false,
        isSlow: false,
        isSyncing: false,
      }),
      createOfflineApiCall: () => () => Promise.resolve({ success: true, data: {} }),
    }));

    vi.doMock('../../utils/networkStatus', () => ({
      useNetworkStatus: () => ({ isOnline: false, isSlow: false }),
      getOfflineMessage: () => 'Offline',
      getSlowConnectionMessage: () => 'Slow connection',
      NetworkError: class extends Error {},
      isNetworkError: () => false,
    }));

    const user = userEvent.setup();
    
    render(<GradingManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Student 1')).toBeInTheDocument();
    });

    // Change grade value while offline
    const assignmentInput = screen.getAllByRole('spinbutton')[0];
    await user.clear(assignmentInput);
    await user.type(assignmentInput, '90');

    // Wait for offline queue message
    await waitFor(
      () => {
        expect(mockOnShowToast).toHaveBeenCalledWith(
          expect.stringContaining('diantarkan untuk sinkronisasi'),
          'info'
        );
      },
      { timeout: 3000 }
    );

    // Verify that actions were added to queue
    expect(mockAddAction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'update',
        entity: 'grade',
        data: expect.objectContaining({ assignment: 90 }),
        endpoint: expect.stringContaining('/api/grades/'),
        method: 'PUT',
      })
    );
  });

  it('should handle sync completion and update UI', async () => {
    const mockSyncCallback = vi.fn();
    
    vi.doMock('../../services/offlineActionQueueService', () => ({
      useOfflineActionQueue: () => ({
        getPendingCount: () => 0,
        getFailedCount: () => 0,
        sync: () => Promise.resolve({ success: true, actionsProcessed: 2, actionsFailed: 0, conflicts: [], errors: [] }),
        retryFailedActions: () => Promise.resolve({ success: true, actionsProcessed: 0, actionsFailed: 0, conflicts: [], errors: [] }),
        clearCompletedActions: () => {},
        onSyncComplete: (callback: (result: any) => void) => {
          mockSyncCallback.mockImplementation(callback);
          return () => {};
        },
        addAction: vi.fn(),
        getQueue: () => [],
        resolveConflict: () => {},
        isOnline: true,
        isSlow: false,
        isSyncing: false,
      }),
      createOfflineApiCall: () => () => Promise.resolve({ success: true, data: {} }),
    }));

    render(<GradingManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('Manajemen Penilaian Akademik')).toBeInTheDocument();
    });

    // Simulate sync completion
    const syncResult = {
      success: true,
      actionsProcessed: 2,
      actionsFailed: 0,
      conflicts: [],
      errors: [],
    };

    mockSyncCallback(syncResult);

    await waitFor(() => {
      expect(mockOnShowToast).toHaveBeenCalledWith(
        '2 nilai berhasil disinkronkan',
        'success'
      );
    });
  });

  it('should display pending action count in offline indicator', async () => {
    vi.doMock('../../services/offlineActionQueueService', () => ({
      useOfflineActionQueue: () => ({
        getPendingCount: () => 3,
        getFailedCount: () => 1,
        sync: () => Promise.resolve({ success: true, actionsProcessed: 0, actionsFailed: 0, conflicts: [], errors: [] }),
        retryFailedActions: () => Promise.resolve({ success: true, actionsProcessed: 0, actionsFailed: 0, conflicts: [], errors: [] }),
        clearCompletedActions: () => {},
        onSyncComplete: () => () => {},
        addAction: vi.fn(),
        getQueue: () => [],
        resolveConflict: () => {},
        isOnline: true,
        isSlow: false,
        isSyncing: false,
      }),
      createOfflineApiCall: () => () => Promise.resolve({ success: true, data: {} }),
    }));

    render(<GradingManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('Manajemen Penilaian Akademik')).toBeInTheDocument();
    });

    // Check for pending count badge
    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument(); // 3 pending + 1 failed
    });
  });

  it('should handle sync errors gracefully', async () => {
    vi.doMock('../../services/offlineActionQueueService', () => ({
      useOfflineActionQueue: () => ({
        getPendingCount: () => 0,
        getFailedCount: () => 2,
        sync: () => Promise.resolve({ success: true, actionsProcessed: 0, actionsFailed: 2, conflicts: [], errors: ['Network error'] }),
        retryFailedActions: () => Promise.resolve({ success: true, actionsProcessed: 0, actionsFailed: 0, conflicts: [], errors: [] }),
        clearCompletedActions: () => {},
        onSyncComplete: () => () => {},
        addAction: vi.fn(),
        getQueue: () => [],
        resolveConflict: () => {},
        isOnline: true,
        isSlow: false,
        isSyncing: false,
      }),
      createOfflineApiCall: () => () => Promise.resolve({ success: true, data: {} }),
    }));

    render(<GradingManagement onBack={mockOnBack} onShowToast={mockOnShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('Manajemen Penilaian Akademik')).toBeInTheDocument();
    });

    // The component should handle failed syncs and show appropriate toast
    expect(screen.getByText('2 Failed')).toBeInTheDocument();
  });
});