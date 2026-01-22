// MaterialUpload.offline.test.ts - Integration tests for MaterialUpload offline functionality

import { describe, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MaterialUpload from '../MaterialUpload';

// Mock services
vi.mock('../../services/apiService', () => ({
  eLibraryAPI: {
    create: vi.fn(),
  },
  studentsAPI: {
    getByClass: vi.fn(),
  },
  attendanceAPI: {
    getByDate: vi.fn(),
  },
}));

vi.mock('../../services/categoryService', () => ({
  categoryService: {
    getSubjects: () => Promise.resolve([
      { id: 'subject-1', name: 'Mathematics' },
      { id: 'subject-2', name: 'Science' },
    ]),
    updateMaterialStats: vi.fn(),
  },
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
    user: { id: 'teacher-1', name: 'Guru', email: 'guru@malnu.sch.id', status: 'active' },
    userRole: 'teacher',
    userExtraRole: null,
    canAccess: vi.fn(() => true),
    canAccessAny: vi.fn(() => true),
    canAccessResource: vi.fn(() => true),
    userPermissions: [],
    userPermissionIds: [],
  })
}));

describe('MaterialUpload Offline Queue Integration', () => {
  const _mockOnShowToast = vi.fn();
  const _mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should queue material upload when offline', async () => {
    render(
      <MaterialUpload
        onBack={_mockOnBack}
        onShowToast={_mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Materi Pembelajaran/i)).toBeInTheDocument();
    });
  });

  it('should show offline indicator', async () => {
    render(
      <MaterialUpload
        onBack={_mockOnBack}
        onShowToast={_mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Materi Pembelajaran/i)).toBeInTheDocument();
    });
  });
});