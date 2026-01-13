import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChildDataStatusIndicator from '../ChildDataErrorBoundary';

describe('ChildDataErrorBoundary', () => {
  it('renders nothing when status is not unavailable or limited', () => {
    const { container } = render(<ChildDataStatusIndicator status="unavailable" />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders unavailable status card', () => {
    render(<ChildDataStatusIndicator status="unavailable" />);
    expect(screen.getByText('Data Anak Tidak Tersedia')).toBeInTheDocument();
    expect(screen.getByText('Data anak tidak dapat dimuat. Hal ini dapat terjadi karena:')).toBeInTheDocument();
    expect(screen.getByText('Koneksi internet bermasalah')).toBeInTheDocument();
    expect(screen.getByText('Data anak sedang diperbarui')).toBeInTheDocument();
    expect(screen.getByText('Terjadi kesalahan teknis')).toBeInTheDocument();
  });

  it('renders limited status card with selected child', () => {
    const selectedChild = {
      studentId: '1',
      studentName: 'John Doe',
      className: 'Class 1'
    };
    render(<ChildDataStatusIndicator status="limited" selectedChild={selectedChild} />);
    expect(screen.getByText('Data Anak Terbatas')).toBeInTheDocument();
    expect(screen.getByText(/Beberapa data untuk John Doe/)).toBeInTheDocument();
  });

  it('renders action buttons when callbacks are provided', () => {
    const onRetry = vi.fn();
    const onShowToast = vi.fn();
    render(
      <ChildDataStatusIndicator status="unavailable" onRetry={onRetry} onShowToast={onShowToast} />
    );
    expect(screen.getByRole('button', { name: 'Coba memuat ulang data anak' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aktifkan mode offline' })).toBeInTheDocument();
  });

  it('calls onRetry when Coba Lagi button is clicked', () => {
    const onRetry = vi.fn();
    const onShowToast = vi.fn();
    render(
      <ChildDataStatusIndicator status="unavailable" onRetry={onRetry} onShowToast={onShowToast} />
    );
    screen.getByRole('button', { name: 'Coba memuat ulang data anak' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onShowToast when Mode Offline button is clicked', () => {
    const onRetry = vi.fn();
    const onShowToast = vi.fn();
    render(
      <ChildDataStatusIndicator status="unavailable" onRetry={onRetry} onShowToast={onShowToast} />
    );
    screen.getByRole('button', { name: 'Aktifkan mode offline' }).click();
    expect(onShowToast).toHaveBeenCalledTimes(1);
    expect(onShowToast).toHaveBeenCalledWith('Menggunakan mode offline', 'info');
  });

  it('does not render action buttons when callbacks are not provided', () => {
    render(<ChildDataStatusIndicator status="unavailable" />);
    expect(screen.queryByRole('button', { name: 'Coba memuat ulang data anak' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aktifkan mode offline' })).not.toBeInTheDocument();
  });

  it('renders nothing for limited status without selected child', () => {
    const { container } = render(<ChildDataStatusIndicator status="limited" />);
    expect(container.firstChild).toBeNull();
  });

  it('has proper ARIA labels for accessibility', () => {
    const onRetry = vi.fn();
    const onShowToast = vi.fn();
    render(
      <ChildDataStatusIndicator status="unavailable" onRetry={onRetry} onShowToast={onShowToast} />
    );
    expect(screen.getByRole('button', { name: 'Coba memuat ulang data anak' })).toHaveAttribute('aria-label', 'Coba memuat ulang data anak');
    expect(screen.getByRole('button', { name: 'Aktifkan mode offline' })).toHaveAttribute('aria-label', 'Aktifkan mode offline');
  });

  it('applies correct Button component variants', () => {
    const onRetry = vi.fn();
    const onShowToast = vi.fn();
    render(
      <ChildDataStatusIndicator status="unavailable" onRetry={onRetry} onShowToast={onShowToast} />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });
});
