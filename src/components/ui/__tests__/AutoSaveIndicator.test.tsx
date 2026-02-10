import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { AutoSaveIndicator } from '../AutoSaveIndicator';
import { useAutoSave } from '../../../hooks/useAutoSaveIndicator';

describe('AutoSaveIndicator', () => {
  it('renders null when status is idle', () => {
    const { container } = render(<AutoSaveIndicator status="idle" />);
    expect(container.firstChild).toBeNull();
  });

  it('displays saving state with spinner', () => {
    render(<AutoSaveIndicator status="saving" />);
    expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('displays saved state with checkmark', async () => {
    render(<AutoSaveIndicator status="saved" lastSaved={new Date()} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Tersimpan/)).toBeInTheDocument();
    });
  });

  it('displays error state with message', () => {
    render(<AutoSaveIndicator status="error" errorMessage="Network error" />);
    expect(screen.getByText('Gagal menyimpan')).toBeInTheDocument();
  });

  it('formats timestamp correctly for recent saves', () => {
    const now = new Date();
    render(<AutoSaveIndicator status="saved" lastSaved={now} showTimestamp />);
    
    expect(screen.getByText(/baru saja/)).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<AutoSaveIndicator status="saving" size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('text-xs');
    
    rerender(<AutoSaveIndicator status="saving" size="md" />);
    expect(screen.getByRole('status')).toHaveClass('text-sm');
  });
});

describe('useAutoSave hook', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with idle status', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    
    function TestComponent() {
      const { status } = useAutoSave({ onSave });
      return <div data-testid="status">{status}</div>;
    }
    
    render(<TestComponent />);
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
  });

  it('transitions to saving then saved on successful save', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    
    function TestComponent() {
      const { status, triggerSave } = useAutoSave({ onSave, debounceMs: 100 });
      return (
        <div>
          <div data-testid="status">{status}</div>
          <button onClick={() => triggerSave('test value')}>Save</button>
        </div>
      );
    }
    
    render(<TestComponent />);
    
    // Trigger save - should immediately go to saving
    screen.getByText('Save').click();
    
    // Status should be saving immediately
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('saving');
    });
    
    // Advance past debounce
    vi.advanceTimersByTime(150);
    
    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('saved');
    });
    
    expect(onSave).toHaveBeenCalledWith('test value');
  });

  it('transitions to error on failed save', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Save failed'));
    
    function TestComponent() {
      const { status, errorMessage, triggerSave } = useAutoSave({ onSave, debounceMs: 50 });
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{errorMessage || 'no error'}</div>
          <button onClick={() => triggerSave('test')}>Save</button>
        </div>
      );
    }
    
    render(<TestComponent />);
    
    screen.getByText('Save').click();
    
    // Wait for debounce and save
    vi.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error');
    });
    
    expect(screen.getByTestId('error')).toHaveTextContent('Save failed');
  });

  it('does not save when disabled', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    
    function TestComponent() {
      const { status, triggerSave } = useAutoSave({ onSave, enabled: false });
      return (
        <div>
          <div data-testid="status">{status}</div>
          <button onClick={() => triggerSave('test')}>Save</button>
        </div>
      );
    }
    
    render(<TestComponent />);
    
    screen.getByText('Save').click();
    
    vi.advanceTimersByTime(1000);
    
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
  });

  it('resets state correctly', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    
    function TestComponent() {
      const { status, triggerSave, reset } = useAutoSave({ onSave, debounceMs: 500 });
      return (
        <div>
          <div data-testid="status">{status}</div>
          <button onClick={() => triggerSave('test')}>Save</button>
          <button onClick={reset}>Reset</button>
        </div>
      );
    }
    
    render(<TestComponent />);
    
    screen.getByText('Save').click();
    
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('saving');
    });
    
    screen.getByText('Reset').click();
    
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('idle');
    });
  });
});
