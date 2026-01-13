import { render, screen, fireEvent } from '@testing-library/react';
import OfflineBanner from '../ui/OfflineBanner';

describe('OfflineBanner', () => {
  const mockOnRetry = vi.fn();
  const mockOnSync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when show is false', () => {
    render(<OfflineBanner mode="offline" show={false} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders offline banner with correct content', () => {
    render(<OfflineBanner mode="offline" show={true} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByText(/Anda sedang offline/)).toBeInTheDocument();
  });

  it('renders slow connection banner with correct content', () => {
    render(<OfflineBanner mode="slow" show={true} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Koneksi Lambat')).toBeInTheDocument();
    expect(screen.getByText(/Koneksi internet Anda lambat/)).toBeInTheDocument();
  });

  it('renders both mode banner with correct content', () => {
    render(<OfflineBanner mode="both" show={true} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByText(/offline dengan koneksi lambat/)).toBeInTheDocument();
  });

  it('shows retry button when not offline and onRetry is provided', () => {
    render(
      <OfflineBanner 
        mode="slow" 
        show={true} 
        onRetry={mockOnRetry}
      />
    );

    const retryButton = screen.getByText('Coba Lagi');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('does not show retry button when offline', () => {
    render(
      <OfflineBanner 
        mode="offline" 
        show={true} 
        onRetry={mockOnRetry}
      />
    );

    expect(screen.queryByText('Coba Lagi')).not.toBeInTheDocument();
  });

  it('shows sync status when needsSync is true', () => {
    render(
      <OfflineBanner
        mode="offline"
        show={true}
        syncStatus={{
          needsSync: true,
          pendingActions: 5,
          lastSync: new Date('2024-01-13T10:30:00Z').getTime(),
        }}
      />
    );

    expect(screen.getByText(/5 aksi pending perlu disinkronkan/)).toBeInTheDocument();
    expect(screen.getByText(/Terakhir diperbarui:/)).toBeInTheDocument();
  });

  it('shows needs sync message when pendingActions is 0', () => {
    render(
      <OfflineBanner
        mode="offline"
        show={true}
        syncStatus={{
          needsSync: true,
          pendingActions: 0,
        }}
      />
    );

    expect(screen.getByText(/Data perlu diperbarui/)).toBeInTheDocument();
  });

  it('calls onSync when sync button is clicked', async () => {
    render(
      <OfflineBanner
        mode="offline"
        show={true}
        syncStatus={{
          needsSync: true,
          pendingActions: 3,
        }}
        onSync={mockOnSync}
      />
    );

    const syncButton = screen.getByText('Sinkronkan');
    expect(syncButton).toBeInTheDocument();

    fireEvent.click(syncButton);
    expect(mockOnSync).toHaveBeenCalledTimes(1);
  });

  it('shows cached data info when provided', () => {
    render(
      <OfflineBanner
        mode="offline"
        show={true}
        cachedDataAvailable={true}
        cachedDataInfo="Data Offline Tersedia"
      />
    );

    expect(screen.getByText(/Data Offline Tersedia/)).toBeInTheDocument();
  });

  it('shows loading state on retry button', () => {
    render(
      <OfflineBanner
        mode="slow"
        show={true}
        onRetry={mockOnRetry}
        isRetryLoading={true}
      />
    );

    const retryButton = screen.getByRole('button', { name: /Coba Lagi/ });
    expect(retryButton).toBeDisabled();
  });

  it('shows loading state on sync button', () => {
    render(
      <OfflineBanner
        mode="offline"
        show={true}
        syncStatus={{
          needsSync: true,
          pendingActions: 2,
        }}
        onSync={mockOnSync}
        isSyncLoading={true}
      />
    );

    const syncButton = screen.getByRole('button', { name: /Sinkronkan/ });
    expect(syncButton).toBeDisabled();
  });

  it('does not show sync status when needsSync is false', () => {
    render(
      <OfflineBanner
        mode="offline"
        show={true}
        syncStatus={{
          needsSync: false,
          pendingActions: 0,
        }}
      />
    );

    expect(screen.queryByText(/Sinkronkan/)).not.toBeInTheDocument();
    expect(screen.queryByText(/aksi pending/)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <OfflineBanner mode="offline" show={true} className="custom-class" />
    );

    const banner = container.querySelector('.custom-class');
    expect(banner).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(<OfflineBanner mode="offline" show={true} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('uses correct color scheme for error (offline)', () => {
    render(<OfflineBanner mode="offline" show={true} />);

    const banner = screen.getByRole('alert');
    expect(banner).toHaveClass('bg-red-50', 'dark:bg-red-900/20');
  });

  it('uses correct color scheme for warning (slow)', () => {
    render(<OfflineBanner mode="slow" show={true} />);

    const banner = screen.getByRole('alert');
    expect(banner).toHaveClass('bg-yellow-50', 'dark:bg-yellow-900/20');
  });

  it('renders with both modes showing offline indicator', () => {
    render(<OfflineBanner mode="both" show={true} />);

    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50', 'dark:bg-red-900/20');
  });
});
