import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterPill from '../FilterPill';
import React from 'react';

describe('FilterPill', () => {
  const defaultProps = {
    label: 'kategori',
    value: 'Matematika',
    onClear: vi.fn(),
  };

  it('renders with correct value', () => {
    render(<FilterPill {...defaultProps} />);
    expect(screen.getByText('Matematika')).toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<FilterPill {...defaultProps} onClear={onClear} />);

    const clearButton = screen.getByLabelText(/Hapus filter kategori/);
    await user.click(clearButton);

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('calls onClear when Delete key is pressed', () => {
    const onClear = vi.fn();
    render(<FilterPill {...defaultProps} onClear={onClear} />);

    const clearButton = screen.getByLabelText(/Hapus filter kategori/);
    fireEvent.keyDown(clearButton, { key: 'Delete' });

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('calls onClear when Backspace key is pressed', () => {
    const onClear = vi.fn();
    render(<FilterPill {...defaultProps} onClear={onClear} />);

    const clearButton = screen.getByLabelText(/Hapus filter kategori/);
    fireEvent.keyDown(clearButton, { key: 'Backspace' });

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('shows tooltip on hover after delay', async () => {
    render(<FilterPill {...defaultProps} />);

    const clearButton = screen.getByLabelText(/Hapus filter kategori/);
    fireEvent.mouseEnter(clearButton);

    // Tooltip container should be in the document immediately after mouseEnter
    const tooltip = await waitFor(() => screen.getByRole('tooltip'));
    expect(tooltip).toBeInTheDocument();
    
    // But it should be hidden initially (opacity-0)
    expect(tooltip).toHaveClass('opacity-0');

    // Wait for the delay (400ms in UI_DELAYS.SHORTCUT_HINT_DELAY)
    await waitFor(() => {
      expect(tooltip).toHaveClass('opacity-100');
    }, { timeout: 500 });
  });

  it('shows tooltip on focus', async () => {
    render(<FilterPill {...defaultProps} />);

    const clearButton = screen.getByLabelText(/Hapus filter kategori/);
    fireEvent.focus(clearButton);

    // Wait for the delay
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('hides tooltip on mouse leave', async () => {
    render(<FilterPill {...defaultProps} />);

    const clearButton = screen.getByLabelText(/Hapus filter kategori/);
    fireEvent.mouseEnter(clearButton);

    // Wait for tooltip to appear
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    }, { timeout: 500 });

    // Mouse leave should hide tooltip
    fireEvent.mouseLeave(clearButton);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('displays correct shortcut in tooltip', async () => {
    render(<FilterPill {...defaultProps} shortcut="Delete" />);

    const clearButton = screen.getByLabelText(/Hapus filter kategori/);
    fireEvent.mouseEnter(clearButton);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('Delete');
    }, { timeout: 500 });
  });

  it('allows custom shortcut', async () => {
    render(<FilterPill {...defaultProps} shortcut="Esc" />);

    const clearButton = screen.getByLabelText(/Hapus filter kategori/);
    fireEvent.mouseEnter(clearButton);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('Esc');
    }, { timeout: 500 });
  });

  it('has correct aria-label with shortcut', () => {
    render(<FilterPill {...defaultProps} />);

    const clearButton = screen.getByLabelText(/Hapus filter kategori \(Tekan Delete\)/);
    expect(clearButton).toBeInTheDocument();
  });

  it('has aria-describedby pointing to tooltip', () => {
    render(<FilterPill {...defaultProps} id="test-pill" />);

    const clearButton = screen.getByLabelText(/Hapus filter kategori/);
    expect(clearButton).toHaveAttribute('aria-describedby', 'test-pill-tooltip');
  });

  it('renders with correct variant classes', () => {
    const { container } = render(<FilterPill {...defaultProps} variant="green" />);
    const pill = container.firstChild as HTMLElement;

    expect(pill).toHaveClass('bg-green-100');
    expect(pill).toHaveClass('text-green-700');
  });

  it('applies custom className', () => {
    const { container } = render(<FilterPill {...defaultProps} className="custom-class" />);
    const pill = container.firstChild as HTMLElement;

    expect(pill).toHaveClass('custom-class');
  });

  it('truncates long values', () => {
    const longValue = 'A'.repeat(150);
    render(<FilterPill {...defaultProps} value={longValue} />);

    const valueElement = screen.getByText(/A+/);
    expect(valueElement).toHaveClass('truncate');
    expect(valueElement).toHaveClass('max-w-[120px]');
  });

  it('is keyboard focusable', () => {
    render(<FilterPill {...defaultProps} />);

    const clearButton = screen.getByLabelText(/Hapus filter kategori/);
    expect(clearButton).toHaveAttribute('tabIndex', '0');
  });

  it('uses custom aria-label when provided', () => {
    render(<FilterPill {...defaultProps} aria-label="Custom label" />);

    expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
  });
});
