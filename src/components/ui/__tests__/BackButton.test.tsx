import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BackButton from '../BackButton';

// Mock the hooks
vi.mock('../../hooks/useAccessibility', () => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock('../../utils/hapticFeedback', () => ({
  useHapticFeedback: vi.fn(() => ({ onTap: vi.fn() })),
}));

describe('BackButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders with default label and variant', () => {
    render(<BackButton onClick={mockOnClick} />);
    
    expect(screen.getByRole('button', { name: /navigasi kembali ke kembali/i })).toBeInTheDocument();
    expect(screen.getByText('Kembali')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<BackButton onClick={mockOnClick} label="Back to Home" />);
    
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /navigasi kembali ke back to home/i })).toBeInTheDocument();
  });

  it('renders with primary variant', () => {
    render(<BackButton onClick={mockOnClick} variant="primary" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-primary-600', 'dark:text-primary-400');
  });

  it('renders with green variant', () => {
    render(<BackButton onClick={mockOnClick} variant="green" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-green-600', 'dark:text-green-400');
  });

  it('renders with custom variant', () => {
    render(<BackButton onClick={mockOnClick} variant="custom" />);
    
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('text-primary-600', 'dark:text-primary-400', 'text-green-600', 'dark:text-green-400');
  });

  it('renders with custom className', () => {
    render(<BackButton onClick={mockOnClick} className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    render(<BackButton onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('has proper aria-label', () => {
    render(<BackButton onClick={mockOnClick} label="Dashboard" ariaLabel="Go to Dashboard" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Go to Dashboard');
  });

  it('renders chevron icon', () => {
    render(<BackButton onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    const svgContainer = button.querySelector('span[aria-hidden="true"]');
    expect(svgContainer).toBeInTheDocument();
    expect(svgContainer).toHaveClass('w-5', 'h-5');
    
    const svg = svgContainer?.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('w-full', 'h-full');
  });

  it('has focus ring for keyboard navigation', () => {
    render(<BackButton onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus-visible:ring-2');
  });

  it('has hover effects', () => {
    render(<BackButton onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:translate-x-[-6px]');
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<BackButton onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  describe('Loading state', () => {
    it('renders loading spinner when isLoading is true', () => {
      render(<BackButton onClick={mockOnClick} isLoading />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveClass('cursor-wait', 'opacity-70');
    });

    it('updates aria-label during loading', () => {
      render(<BackButton onClick={mockOnClick} isLoading label="Dashboard" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Navigasi kembali ke Dashboard - Memuat');
    });

    it('disables click when loading', async () => {
      const user = userEvent.setup();
      render(<BackButton onClick={mockOnClick} isLoading />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
    });
  });

  describe('Success state', () => {
    it('shows success state when showSuccess is true', () => {
      render(<BackButton onClick={mockOnClick} showSuccess />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('Berhasil'));
    });

    it('displays success tooltip when showSuccess is true', async () => {
      render(<BackButton onClick={mockOnClick} showSuccess />);
      
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveTextContent('Berhasil!');
      });
    });

    it('auto-hides success state after duration', async () => {
      render(<BackButton onClick={mockOnClick} showSuccess successDuration={1000} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('Berhasil'));
      
      vi.advanceTimersByTime(1100);
      
      await waitFor(() => {
        expect(button).not.toHaveAttribute('aria-label', expect.stringContaining('Berhasil'));
      });
    });
  });

  describe('Disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<BackButton onClick={mockOnClick} disabled />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('cursor-not-allowed', 'opacity-50');
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      render(<BackButton onClick={mockOnClick} disabled />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Tooltip', () => {
    it('renders with custom tooltip', async () => {
      const user = userEvent.setup();
      render(<BackButton onClick={mockOnClick} tooltip="Go back to previous page" />);
      
      const button = screen.getByRole('button');
      await user.hover(button);
      
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveTextContent('Go back to previous page');
      });
    });

    it('tooltip is positioned correctly', async () => {
      const user = userEvent.setup();
      render(
        <BackButton 
          onClick={mockOnClick} 
          tooltip="Go back" 
          tooltipPosition="top" 
        />
      );
      
      const button = screen.getByRole('button');
      await user.hover(button);
      
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('bottom-full');
      });
    });

    it('does not show tooltip when loading', async () => {
      const user = userEvent.setup();
      render(<BackButton onClick={mockOnClick} tooltip="Go back" isLoading />);
      
      const button = screen.getByRole('button');
      await user.hover(button);
      
      await waitFor(() => {
        const tooltips = screen.queryAllByRole('tooltip');
        expect(tooltips).toHaveLength(0);
      });
    });
  });

  describe('Size variants', () => {
    it('renders small size', () => {
      render(<BackButton onClick={mockOnClick} size="sm" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('gap-1.5');
    });

    it('renders medium size (default)', () => {
      render(<BackButton onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('gap-2');
    });

    it('renders large size', () => {
      render(<BackButton onClick={mockOnClick} size="lg" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('gap-2.5');
    });
  });

  describe('Async onClick', () => {
    it('handles async onClick', async () => {
      const asyncOnClick = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      
      render(<BackButton onClick={asyncOnClick} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(asyncOnClick).toHaveBeenCalledTimes(1);
    });

    it('handles async onClick errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorOnClick = vi.fn().mockRejectedValue(new Error('Test error'));
      const user = userEvent.setup();
      
      render(<BackButton onClick={errorOnClick} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('BackButton click error:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });
});
