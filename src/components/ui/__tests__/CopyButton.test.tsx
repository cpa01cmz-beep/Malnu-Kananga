import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CopyButton from '../CopyButton';

// Mock navigator.clipboard
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock document.execCommand
const mockExecCommand = vi.fn();
Object.defineProperty(document, 'execCommand', {
  value: mockExecCommand,
  writable: true,
});

describe('CopyButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
    mockExecCommand.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<CopyButton text="Test text to copy" />);
    
    const button = screen.getByRole('button', { name: /copy to clipboard/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('has correct aria-label', () => {
    render(<CopyButton text="Test text" ariaLabel="Custom copy label" />);
    
    const button = screen.getByRole('button', { name: /custom copy label/i });
    expect(button).toBeInTheDocument();
  });

  it('has aria-live attribute for status announcements', () => {
    render(<CopyButton text="Test text" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-live', 'polite');
  });

  it('has aria-describedby when tooltip is enabled', () => {
    render(<CopyButton text="Test text" showTooltip={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-describedby');
    
    const describedBy = button.getAttribute('aria-describedby');
    const tooltip = document.getElementById(describedBy || '');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute('role', 'tooltip');
  });

  it('does not have aria-describedby when tooltip is disabled', () => {
    render(<CopyButton text="Test text" showTooltip={false} />);
    
    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('aria-describedby');
  });

  it('calls clipboard API when clicked', async () => {
    render(<CopyButton text="Test text to copy" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('Test text to copy');
    });
  });

  it('shows success state after copying', async () => {
    render(<CopyButton text="Test text" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Copy to clipboard - Copied!');
    });
  });

  it('calls onCopied callback with true on success', async () => {
    const onCopied = vi.fn();
    render(<CopyButton text="Test text" onCopied={onCopied} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(onCopied).toHaveBeenCalledWith(true);
    });
  });

  it('calls onCopied callback with false on failure', async () => {
    mockWriteText.mockRejectedValue(new Error('Clipboard failed'));
    mockExecCommand.mockReturnValue(false);
    
    const onCopied = vi.fn();
    render(<CopyButton text="Test text" onCopied={onCopied} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(onCopied).toHaveBeenCalledWith(false);
    });
  });

  it('falls back to execCommand when clipboard API fails', async () => {
    mockWriteText.mockRejectedValue(new Error('Clipboard API not available'));
    mockExecCommand.mockReturnValue(true);
    
    render(<CopyButton text="Test text" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockExecCommand).toHaveBeenCalledWith('copy');
    });
  });

  it('shows custom success message', async () => {
    render(<CopyButton text="Test text" successMessage="Berhasil disalin!" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Copy to clipboard - Berhasil disalin!');
    });
  });

  it('is disabled when disabled prop is true', () => {
    render(<CopyButton text="Test text" disabled />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('does not copy when disabled', () => {
    render(<CopyButton text="Test text" disabled />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockWriteText).not.toHaveBeenCalled();
  });

  it('does not copy when already in copied state', async () => {
    render(<CopyButton text="Test text" resetDelay={5000} />);
    
    const button = screen.getByRole('button');
    
    // First click
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledTimes(1);
    });
    
    // Second click while in copied state
    fireEvent.click(button);
    expect(mockWriteText).toHaveBeenCalledTimes(1);
  });

  it('shows tooltip on hover', () => {
    render(<CopyButton text="Test text" showTooltip={true} />);
    
    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Copy');
  });

  it('hides tooltip on mouse leave', () => {
    render(<CopyButton text="Test text" showTooltip={true} />);
    
    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('opacity-0');
  });

  it('shows copied tooltip after successful copy', async () => {
    render(<CopyButton text="Test text" showTooltip={true} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('Copied!');
    });
  });

  it('tooltip changes color in success state', async () => {
    render(<CopyButton text="Test text" showTooltip={true} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bg-green-600');
    });
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<CopyButton text="Test" size="sm" />);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('p-1');

    rerender(<CopyButton text="Test" size="md" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('p-2');

    rerender(<CopyButton text="Test" size="lg" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('p-2.5');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<CopyButton text="Test" variant="default" />);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('text-neutral-600');

    rerender(<CopyButton text="Test" variant="primary" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary-600');

    rerender(<CopyButton text="Test" variant="secondary" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-white');

    rerender(<CopyButton text="Test" variant="ghost" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-transparent');
  });

  it('applies custom className', () => {
    render(<CopyButton text="Test" className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('supports different tooltip positions', () => {
    const { rerender } = render(<CopyButton text="Test" tooltipPosition="top" />);
    let tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('bottom-full');

    rerender(<CopyButton text="Test" tooltipPosition="bottom" />);
    tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('top-full');

    rerender(<CopyButton text="Test" tooltipPosition="left" />);
    tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('right-full');

    rerender(<CopyButton text="Test" tooltipPosition="right" />);
    tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('left-full');
  });

  it('shows icon with correct aria-hidden', () => {
    const { container } = render(<CopyButton text="Test" />);
    
    // Icons should be hidden from screen readers - check the outer span that wraps icons
    const iconWrapper = container.querySelector('span[aria-hidden="true"]');
    expect(iconWrapper).toBeInTheDocument();
  });

  it('has focus ring for keyboard navigation', () => {
    render(<CopyButton text="Test" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:ring-2');
    expect(button).toHaveClass('focus:outline-none');
  });

  it('cleans up timeout on unmount', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { unmount } = render(<CopyButton text="Test" resetDelay={5000} />);
    
    // Trigger a copy to create the timeout
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled();
    });
    
    unmount();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  describe('Keyboard shortcut hint', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows keyboard shortcut hint on hover after delay', async () => {
      render(<CopyButton text="Test text" showTooltip={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      
      let shortcutTooltip = screen.queryAllByRole('tooltip').find(el => el.textContent?.includes('salin'));
      expect(shortcutTooltip).toBeUndefined();
      
      await act(async () => {
        vi.advanceTimersByTime(400);
      });
      
      shortcutTooltip = screen.queryAllByRole('tooltip').find(el => el.textContent?.includes('salin'));
      expect(shortcutTooltip).toBeInTheDocument();
      expect(shortcutTooltip).toHaveTextContent(/salin/);
    });

    it('hides keyboard shortcut hint on mouse leave', async () => {
      render(<CopyButton text="Test text" showTooltip={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      await act(async () => {
        vi.advanceTimersByTime(400);
      });
      
      let shortcutTooltip = screen.queryAllByRole('tooltip').find(el => el.textContent?.includes('salin'));
      expect(shortcutTooltip).toBeInTheDocument();
      
      fireEvent.mouseLeave(button);
      
      shortcutTooltip = screen.queryAllByRole('tooltip').find(el => el.textContent?.includes('salin'));
      expect(shortcutTooltip).toBeUndefined();
    });

    it('shows correct keyboard shortcut based on platform', async () => {
      const originalPlatform = navigator.platform;
      
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        configurable: true,
      });
      
      const { rerender } = render(<CopyButton text="Test" showTooltip={true} />);
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      await act(async () => {
        vi.advanceTimersByTime(400);
      });
      
      let shortcutTooltip = screen.queryAllByRole('tooltip').find(el => el.textContent?.includes('Ctrl'));
      expect(shortcutTooltip).toBeInTheDocument();
      
      fireEvent.mouseLeave(button);
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });
      
      rerender(<CopyButton text="Test" showTooltip={true} />);
      fireEvent.mouseEnter(screen.getByRole('button'));
      await act(async () => {
        vi.advanceTimersByTime(400);
      });
      
      shortcutTooltip = screen.queryAllByRole('tooltip').find(el => el.textContent?.includes('⌘'));
      expect(shortcutTooltip).toBeInTheDocument();
      
      Object.defineProperty(navigator, 'platform', {
        value: originalPlatform,
        configurable: true,
      });
    });

    it('does not show keyboard shortcut hint when button is in copied state', async () => {
      render(<CopyButton text="Test" showTooltip={true} />);
      
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      await act(async () => {
        vi.advanceTimersByTime(400);
      });
      
      let shortcutTooltip = screen.queryAllByRole('tooltip').find(el => el.textContent?.includes('salin'));
      expect(shortcutTooltip).toBeInTheDocument();
      
      await act(async () => {
        fireEvent.click(button);
      });
      
      shortcutTooltip = screen.queryAllByRole('tooltip').find(el => el.textContent?.includes('salin'));
      expect(shortcutTooltip).toBeUndefined();
    });

    it('shows keyboard shortcut hint on focus', async () => {
      render(<CopyButton text="Test" showTooltip={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.focus(button);
      await act(async () => {
        vi.advanceTimersByTime(400);
      });
      
      const shortcutTooltip = screen.queryAllByRole('tooltip').find(el => el.textContent?.includes('salin'));
      expect(shortcutTooltip).toBeInTheDocument();
    });

    it('hides keyboard shortcut hint on blur', async () => {
      render(<CopyButton text="Test" showTooltip={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.focus(button);
      await act(async () => {
        vi.advanceTimersByTime(400);
      });
      
      let shortcutTooltip = screen.queryAllByRole('tooltip').find(el => el.textContent?.includes('salin'));
      expect(shortcutTooltip).toBeInTheDocument();
      
      fireEvent.blur(button);
      
      shortcutTooltip = screen.queryAllByRole('tooltip').find(el => el.textContent?.includes('salin'));
      expect(shortcutTooltip).toBeUndefined();
    });
  });
});
