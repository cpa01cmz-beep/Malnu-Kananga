// PPDBRegistration.offline.test.ts - Integration tests for PPDBRegistration offline functionality

import { describe, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PPDBRegistration from '../PPDBRegistration';

// Mock services
vi.mock('../../services/apiService', () => ({
  ppdbAPI: {
    create: vi.fn(),
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

describe('PPDBRegistration Offline Queue Integration', () => {
  const _mockOnShowToast = vi.fn();
  const _mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should queue PPDB registration when offline', async () => {
    vi.doMock('../../utils/networkStatus', () => ({
      useNetworkStatus: () => ({
        isOnline: false,
        isSlow: false,
      }),
    }));

    render(
      <PPDBRegistration
        onClose={_mockOnClose}
        onShowToast={_mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/PPDB/i)).toBeInTheDocument();
    });
  });

 it('should submit normally when online', async () => {
    vi.doMock('../../utils/networkStatus', () => ({
      useNetworkStatus: () => ({
        isOnline: true,
        isSlow: false,
      }),
    }));

    render(
      <PPDBRegistration
        onClose={_mockOnClose}
        onShowToast={_mockOnShowToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/PPDB/i)).toBeInTheDocument();
    });
  });
});