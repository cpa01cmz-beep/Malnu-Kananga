import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { OfflineIndicator, OfflineQueueDetails } from '../OfflineIndicator';
import { useOfflineActionQueue } from '../../services/offlineActionQueueService';
import { useNetworkStatus } from '../../utils/networkStatus';

vi.mock('../../services/offlineActionQueueService');
vi.mock('../../utils/networkStatus');

describe('OfflineIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getPendingCount: vi.fn(() => 0),
      getFailedCount: vi.fn(() => 0),
      sync: vi.fn(),
      isSyncing: false,
      onSyncComplete: vi.fn()
    });
    vi.mocked(useNetworkStatus).mockReturnValue({
      isOnline: true,
      isSlow: false
    });
  });

  it('does not render when online with no pending actions', () => {
    render(<OfflineIndicator />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders offline status indicator when offline', () => {
    vi.mocked(useNetworkStatus).mockReturnValue({
      isOnline: false,
      isSlow: false
    });

    render(<OfflineIndicator />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('renders slow connection indicator when connection is slow', () => {
    vi.mocked(useNetworkStatus).mockReturnValue({
      isOnline: true,
      isSlow: true
    });

    render(<OfflineIndicator />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(screen.getByText('Slow Connection')).toBeInTheDocument();
  });

  it('displays pending actions count', () => {
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getPendingCount: vi.fn(() => 5),
      getFailedCount: vi.fn(() => 0),
      sync: vi.fn(),
      isSyncing: false,
      onSyncComplete: vi.fn()
    });

    render(<OfflineIndicator showQueueCount />);

    expect(screen.getByText('5 Pending')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays failed actions count', () => {
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getPendingCount: vi.fn(() => 2),
      getFailedCount: vi.fn(() => 3),
      sync: vi.fn(),
      isSyncing: false,
      onSyncComplete: vi.fn()
    });

    render(<OfflineIndicator showQueueCount />);

    expect(screen.getByText('3 Failed')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls sync function when sync button is clicked', async () => {
    const mockSync = vi.fn();
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getPendingCount: vi.fn(() => 5),
      getFailedCount: vi.fn(() => 0),
      sync: mockSync,
      isSyncing: false,
      onSyncComplete: vi.fn()
    });
    vi.mocked(useNetworkStatus).mockReturnValue({
      isOnline: false,
      isSlow: false
    });

    render(<OfflineIndicator showSyncButton />);

    const syncButton = screen.getByRole('button', { name: /sync now/i });
    await userEvent.click(syncButton);

    expect(mockSync).toHaveBeenCalledTimes(1);
  });

  it('displays loading state when syncing', () => {
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getPendingCount: vi.fn(() => 5),
      getFailedCount: vi.fn(() => 0),
      sync: vi.fn(),
      isSyncing: true,
      onSyncComplete: vi.fn()
    });
    vi.mocked(useNetworkStatus).mockReturnValue({
      isOnline: false,
      isSlow: false
    });

    render(<OfflineIndicator showSyncButton />);

    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('shows sync status popup after sync completes', () => {
    const mockOnSyncComplete = vi.fn();
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getPendingCount: vi.fn(() => 0),
      getFailedCount: vi.fn(() => 0),
      sync: vi.fn(),
      isSyncing: false,
      onSyncComplete: mockOnSyncComplete
    });

    render(<OfflineIndicator />);

    mockOnSyncComplete.mock.calls[0][0]({
      success: true,
      actionsProcessed: 5,
      actionsFailed: 0,
      conflicts: [],
      errors: []
    });

    expect(screen.getByText('Sync Complete')).toBeInTheDocument();
    expect(screen.getByText('✅ 5 actions completed')).toBeInTheDocument();
  });

  it('shows sync error popup when sync fails', () => {
    const mockOnSyncComplete = vi.fn();
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getPendingCount: vi.fn(() => 0),
      getFailedCount: vi.fn(() => 0),
      sync: vi.fn(),
      isSyncing: false,
      onSyncComplete: mockOnSyncComplete
    });

    render(<OfflineIndicator />);

    mockOnSyncComplete.mock.calls[0][0]({
      success: false,
      actionsProcessed: 0,
      actionsFailed: 2,
      conflicts: [],
      errors: ['Network error']
    });

    expect(screen.getByText('Sync Failed')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('displays failed actions alert', () => {
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getPendingCount: vi.fn(() => 2),
      getFailedCount: vi.fn(() => 3),
      sync: vi.fn(),
      isSyncing: false,
      onSyncComplete: vi.fn()
    });

    render(<OfflineIndicator />);

    expect(screen.getByText(/3 actions failed to sync/)).toBeInTheDocument();
  });

  it('renders at correct position', () => {
    vi.mocked(useNetworkStatus).mockReturnValue({
      isOnline: false,
      isSlow: false
    });

    const { container } = render(<OfflineIndicator position="top-left" />);
    const indicator = container.querySelector('.fixed.top-4.left-4');

    expect(indicator).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    vi.mocked(useNetworkStatus).mockReturnValue({
      isOnline: false,
      isSlow: false
    });

    render(<OfflineIndicator />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });
});

describe('OfflineQueueDetails', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getQueue: vi.fn(() => []),
      getPendingCount: vi.fn(() => 0),
      getFailedCount: vi.fn(() => 0),
      sync: vi.fn(),
      retryFailedActions: vi.fn(),
      clearCompletedActions: vi.fn()
    });
    vi.mocked(useNetworkStatus).mockReturnValue({
      isOnline: true,
      isSlow: false
    });
  });

  it('does not render when closed', () => {
    render(<OfflineQueueDetails isOpen={false} onClose={mockOnClose} />);

    expect(screen.queryByText('Offline Action Queue')).not.toBeInTheDocument();
  });

  it('renders queue details modal when open', () => {
    render(<OfflineQueueDetails isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Offline Action Queue')).toBeInTheDocument();
  });

  it('displays online status badge', () => {
    render(<OfflineQueueDetails isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('displays offline status badge', () => {
    vi.mocked(useNetworkStatus).mockReturnValue({
      isOnline: false,
      isSlow: false
    });

    render(<OfflineQueueDetails isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('displays pending actions', () => {
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getQueue: vi.fn(() => [
        {
          id: '1',
          type: 'create',
          entity: 'Student',
          data: {},
          endpoint: '/api/students',
          timestamp: Date.now(),
          status: 'pending',
          retryCount: 0
        }
      ]),
      getPendingCount: vi.fn(() => 1),
      getFailedCount: vi.fn(() => 0),
      sync: vi.fn(),
      retryFailedActions: vi.fn(),
      clearCompletedActions: vi.fn()
    });

    render(<OfflineQueueDetails isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Pending Actions (1)')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
  });

  it('displays failed actions', () => {
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getQueue: vi.fn(() => [
        {
          id: '1',
          type: 'update',
          entity: 'Grade',
          data: {},
          endpoint: '/api/grades',
          timestamp: Date.now(),
          status: 'failed',
          retryCount: 3,
          lastError: 'Network error'
        }
      ]),
      getPendingCount: vi.fn(() => 0),
      getFailedCount: vi.fn(() => 1),
      sync: vi.fn(),
      retryFailedActions: vi.fn(),
      clearCompletedActions: vi.fn()
    });

    render(<OfflineQueueDetails isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Failed Actions (1)')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.getByText('Grade')).toBeInTheDocument();
    expect(screen.getByText('(failed)')).toBeInTheDocument();
    expect(screen.getByText('Error: Network error')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    render(<OfflineQueueDetails isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls sync when sync button is clicked', async () => {
    const mockSync = vi.fn();
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getQueue: vi.fn(() => [
        {
          id: '1',
          type: 'create',
          entity: 'Student',
          data: {},
          endpoint: '/api/students',
          timestamp: Date.now(),
          status: 'pending',
          retryCount: 0
        }
      ]),
      getPendingCount: vi.fn(() => 1),
      getFailedCount: vi.fn(() => 0),
      sync: mockSync,
      retryFailedActions: vi.fn(),
      clearCompletedActions: vi.fn()
    });

    render(<OfflineQueueDetails isOpen={true} onClose={mockOnClose} />);

    const syncButton = screen.getByRole('button', { name: 'Sync Now' });
    await userEvent.click(syncButton);

    expect(mockSync).toHaveBeenCalledTimes(1);
  });

  it('calls retryFailedActions when retry button is clicked', async () => {
    const mockRetry = vi.fn();
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getQueue: vi.fn(() => [
        {
          id: '1',
          type: 'create',
          entity: 'Student',
          data: {},
          endpoint: '/api/students',
          timestamp: Date.now(),
          status: 'failed',
          retryCount: 3,
          lastError: 'Network error'
        }
      ]),
      getPendingCount: vi.fn(() => 0),
      getFailedCount: vi.fn(() => 1),
      sync: vi.fn(),
      retryFailedActions: mockRetry,
      clearCompletedActions: vi.fn()
    });

    render(<OfflineQueueDetails isOpen={true} onClose={mockOnClose} />);

    const retryButton = screen.getByRole('button', { name: 'Retry Failed' });
    await userEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('calls clearCompletedActions when clear button is clicked', async () => {
    const mockClear = vi.fn();
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getQueue: vi.fn(() => []),
      getPendingCount: vi.fn(() => 0),
      getFailedCount: vi.fn(() => 0),
      sync: vi.fn(),
      retryFailedActions: vi.fn(),
      clearCompletedActions: mockClear
    });

    render(<OfflineQueueDetails isOpen={true} onClose={mockOnClose} />);

    const clearButton = screen.getByRole('button', { name: 'Clear Completed' });
    await userEvent.click(clearButton);

    expect(mockClear).toHaveBeenCalledTimes(1);
  });

  it('displays empty state when queue is empty', () => {
    render(<OfflineQueueDetails isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('No queued actions')).toBeInTheDocument();
    expect(screen.getByText('All actions are synced!')).toBeInTheDocument();
  });

  it('displays retry count for failed actions', () => {
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getQueue: vi.fn(() => [
        {
          id: '1',
          type: 'create',
          entity: 'Student',
          data: {},
          endpoint: '/api/students',
          timestamp: Date.now(),
          status: 'failed',
          retryCount: 5,
          lastError: 'Timeout'
        }
      ]),
      getPendingCount: vi.fn(() => 0),
      getFailedCount: vi.fn(() => 1),
      sync: vi.fn(),
      retryFailedActions: vi.fn(),
      clearCompletedActions: vi.fn()
    });

    render(<OfflineQueueDetails isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Retries: 5')).toBeInTheDocument();
  });

  it('formats timestamp correctly', () => {
    const timestamp = new Date('2024-01-15T10:30:00').getTime();
    vi.mocked(useOfflineActionQueue).mockReturnValue({
      getQueue: vi.fn(() => [
        {
          id: '1',
          type: 'create',
          entity: 'Student',
          data: {},
          endpoint: '/api/students',
          timestamp,
          status: 'pending',
          retryCount: 0
        }
      ]),
      getPendingCount: vi.fn(() => 1),
      getFailedCount: vi.fn(() => 0),
      sync: vi.fn(),
      retryFailedActions: vi.fn(),
      clearCompletedActions: vi.fn()
    });

    render(<OfflineQueueDetails isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/15.*01.*2024/)).toBeInTheDocument();
  });
});
