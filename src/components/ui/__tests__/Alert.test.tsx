import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Alert from '../Alert';
import React from 'react';

vi.mock('../../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}));

describe('Alert', () => {
  const defaultProps = {
    children: 'Test alert message',
    title: 'Test Title',
  };

  it('renders with title and message', () => {
    render(<Alert {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test alert message')).toBeInTheDocument();
  });

  it('does not show close button by default', () => {
    render(<Alert {...defaultProps} />);
    const closeButton = screen.queryByLabelText(/Tutup/);
    expect(closeButton).not.toBeInTheDocument();
  });

  it('shows close button when showCloseButton is true and onClose is provided', () => {
    render(<Alert {...defaultProps} showCloseButton onClose={vi.fn()} />);
    const closeButton = screen.getByLabelText(/Tutup notifikasi/);
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Alert {...defaultProps} showCloseButton onClose={onClose} />);

    const closeButton = screen.getByLabelText(/Tutup notifikasi/);
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes alert when Escape key is pressed and alert is focused', () => {
    const onClose = vi.fn();
    render(<Alert {...defaultProps} showCloseButton onClose={onClose} />);

    const alert = screen.getByRole('alert');
    alert.focus();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes alert when Escape is pressed and close button is focused', () => {
    const onClose = vi.fn();
    render(<Alert {...defaultProps} showCloseButton onClose={onClose} />);

    const closeButton = screen.getByLabelText(/Tutup notifikasi/);
    closeButton.focus();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close alert when Escape is pressed and alert is not focused', () => {
    const onClose = vi.fn();
    render(
      <>
        <button>Outside button</button>
        <Alert {...defaultProps} showCloseButton onClose={onClose} />
      </>
    );

    const outsideButton = screen.getByText('Outside button');
    outsideButton.focus();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close alert when Escape is pressed and showCloseButton is false', () => {
    const onClose = vi.fn();
    render(<Alert {...defaultProps} showCloseButton={false} onClose={onClose} />);

    const alert = screen.getByRole('alert');
    alert.focus();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows escape hint tooltip on mouse enter after delay', async () => {
    render(<Alert {...defaultProps} showCloseButton onClose={vi.fn()} />);

    const alert = screen.getByRole('alert');
    fireEvent.mouseEnter(alert);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Esc');
      expect(tooltip).toHaveTextContent('tutup');
    }, { timeout: 500 });
  });

  it('shows escape hint tooltip on close button focus after delay', async () => {
    render(<Alert {...defaultProps} showCloseButton onClose={vi.fn()} />);

    const closeButton = screen.getByLabelText(/Tutup notifikasi/);
    fireEvent.focus(closeButton);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Esc');
    }, { timeout: 500 });
  });

  it('hides tooltip on mouse leave', async () => {
    render(<Alert {...defaultProps} showCloseButton onClose={vi.fn()} />);

    const alert = screen.getByRole('alert');
    fireEvent.mouseEnter(alert);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    }, { timeout: 500 });

    fireEvent.mouseLeave(alert);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('hides tooltip on close button blur', async () => {
    render(<Alert {...defaultProps} showCloseButton onClose={vi.fn()} />);

    const closeButton = screen.getByLabelText(/Tutup notifikasi/);
    fireEvent.focus(closeButton);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    }, { timeout: 500 });

    fireEvent.blur(closeButton);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('has aria-label mentioning Escape shortcut', () => {
    render(<Alert {...defaultProps} showCloseButton onClose={vi.fn()} />);

    const closeButton = screen.getByLabelText(/Tutup notifikasi \(Tekan Escape\)/);
    expect(closeButton).toBeInTheDocument();
  });

  it('renders with correct variant classes', () => {
    const { container } = render(<Alert {...defaultProps} variant="success" />);
    const alert = container.firstChild as HTMLElement;

    expect(alert).toHaveClass('bg-green-50');
    expect(alert).toHaveClass('dark:bg-green-900/20');
  });

  it('renders with correct size classes', () => {
    const { container } = render(<Alert {...defaultProps} size="sm" />);
    const alert = container.firstChild as HTMLElement;

    expect(alert).toHaveClass('p-3');
  });

  it('applies custom className', () => {
    const { container } = render(<Alert {...defaultProps} className="custom-class" />);
    const alert = container.firstChild as HTMLElement;

    expect(alert).toHaveClass('custom-class');
  });

  it('calls onClose after auto-dismiss duration', async () => {
    const onClose = vi.fn();
    render(<Alert {...defaultProps} showCloseButton onClose={onClose} autoDismiss={100} />);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    }, { timeout: 200 });
  });
});
