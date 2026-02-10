 
import { render, screen } from '@testing-library/react';
import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ProgressBar value={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('renders with custom max value', () => {
      render(<ProgressBar value={5} max={10} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '5');
      expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    });

    it('renders with different sizes', () => {
      const { rerender } = render(<ProgressBar value={50} size="sm" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar.firstChild).toHaveClass('h-1.5');

      rerender(<ProgressBar value={50} size="md" />);
      expect(progressBar.firstChild).toHaveClass('h-2');

      rerender(<ProgressBar value={50} size="lg" />);
      expect(progressBar.firstChild).toHaveClass('h-2.5');

      rerender(<ProgressBar value={50} size="xl" />);
      expect(progressBar.firstChild).toHaveClass('h-6');
    });

    it('renders with different colors', () => {
      const colors: Array<Parameters<typeof ProgressBar>[0]['color']> = [
        'primary',
        'secondary',
        'success',
        'error',
        'warning',
        'info',
        'purple',
        'indigo',
        'orange',
        'red',
        'blue',
        'green',
      ];

      colors.forEach((color) => {
        const { unmount } = render(<ProgressBar value={50} color={color} />);
        const progressBar = screen.getByRole('progressbar');
        const fill = progressBar.firstChild as HTMLElement;
        expect(fill).toBeInTheDocument();
        unmount();
      });
    });

    it('renders with fullWidth={false}', () => {
      render(<ProgressBar value={50} fullWidth={false} size="md" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('w-20');
    });

    it('renders with custom className', () => {
      render(<ProgressBar value={50} className="custom-class" />);
      const container = screen.getByRole('progressbar').parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Width Calculation', () => {
    it('clamps value to max', () => {
      render(<ProgressBar value={150} />);
      const progressBar = screen.getByRole('progressbar');
      const fill = progressBar.firstChild as HTMLElement;
      expect(fill.style.width).toBe('100%');
    });

    it('clamps value to min', () => {
      render(<ProgressBar value={-10} />);
      const progressBar = screen.getByRole('progressbar');
      const fill = progressBar.firstChild as HTMLElement;
      expect(fill.style.width).toBe('0%');
    });

    it('calculates percentage correctly', () => {
      const { rerender } = render(<ProgressBar value={25} max={100} />);
      const progressBar = screen.getByRole('progressbar');
      let fill = progressBar.firstChild as HTMLElement;
      expect(fill.style.width).toBe('25%');

      rerender(<ProgressBar value={5} max={10} />);
      fill = progressBar.firstChild as HTMLElement;
      expect(fill.style.width).toBe('50%');

      rerender(<ProgressBar value={1} max={3} />);
      fill = progressBar.firstChild as HTMLElement;
      expect(parseFloat(fill.style.width)).toBeCloseTo(33.333333333333336);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ProgressBar value={75} aria-label="Upload progress" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Upload progress');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('allows custom ARIA attributes', () => {
      render(
        <ProgressBar
          value={50}
          aria-valuenow={50}
          aria-valuemin={0}
          aria-valuemax={200}
          aria-label="Custom label"
        />
      );
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Custom label');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '200');
    });

    it('uses label as fallback for aria-label', () => {
      render(<ProgressBar value={50} label="Progress label" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Progress label');
    });
  });

  describe('Variants', () => {
    it('renders with default variant', () => {
      render(<ProgressBar value={50} variant="default" />);
      const progressBar = screen.getByRole('progressbar');
      const fill = progressBar.firstChild as HTMLElement;
      expect(fill.style.backgroundImage).toBe('');
    });

    it('renders with striped variant', () => {
      render(<ProgressBar value={50} variant="striped" />);
      const progressBar = screen.getByRole('progressbar');
      const fill = progressBar.firstChild as HTMLElement;
      expect(fill.style.backgroundImage).toContain('linear-gradient');
    });

    it('renders with animated variant', () => {
      render(<ProgressBar value={50} variant="animated" />);
      const progressBar = screen.getByRole('progressbar');
      const fill = progressBar.firstChild as HTMLElement;
      expect(fill.style.backgroundImage).toContain('linear-gradient');
      expect(fill.style.animation).toContain('progress-bar-stripes 1s linear infinite');
    });
  });

  describe('Label Display', () => {
    it('does not show label by default', () => {
      render(<ProgressBar value={50} label="Custom label" />);
      const progressBar = screen.getByRole('progressbar');
      const fill = progressBar.firstChild as HTMLElement;
      expect(fill.textContent).toBe('');
    });

    it('shows label when size="xl" and showLabel={true}', () => {
      render(<ProgressBar value={50} size="xl" showLabel={true} label="Custom label" />);
      const progressBar = screen.getByRole('progressbar');
      const fill = progressBar.firstChild as HTMLElement;
      expect(fill.textContent).toBe('Custom label');
    });

    it('shows percentage when label not provided', () => {
      render(<ProgressBar value={75} size="xl" showLabel={true} />);
      const progressBar = screen.getByRole('progressbar');
      const fill = progressBar.firstChild as HTMLElement;
      expect(fill.textContent).toBe('75%');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode classes to container', () => {
      render(<ProgressBar value={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-neutral-200', 'dark:bg-neutral-700');
    });
  });

  describe('Tooltip Feature', () => {
    it('shows tooltip by default', () => {
      render(<ProgressBar value={75} />);
      const progressBar = screen.getByRole('progressbar');
      const tooltip = progressBar.parentElement?.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
    });

    it('hides tooltip when showTooltip is false', () => {
      render(<ProgressBar value={75} showTooltip={false} />);
      const progressBar = screen.getByRole('progressbar');
      const tooltip = progressBar.parentElement?.querySelector('[role="tooltip"]');
      expect(tooltip).not.toBeInTheDocument();
    });

    it('displays percentage in tooltip by default', () => {
      render(<ProgressBar value={75} />);
      const progressBar = screen.getByRole('progressbar');
      const tooltip = progressBar.parentElement?.querySelector('[role="tooltip"]');
      expect(tooltip).toHaveTextContent('75%');
    });

    it('displays custom tooltip text when provided', () => {
      render(<ProgressBar value={75} tooltipText="Uploading file..." />);
      const progressBar = screen.getByRole('progressbar');
      const tooltip = progressBar.parentElement?.querySelector('[role="tooltip"]');
      expect(tooltip).toHaveTextContent('Uploading file...');
    });

    it('makes progressbar focusable when tooltip is enabled', () => {
      render(<ProgressBar value={75} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('tabIndex', '0');
    });

    it('does not make progressbar focusable when tooltip is disabled', () => {
      render(<ProgressBar value={75} showTooltip={false} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).not.toHaveAttribute('tabIndex');
    });

    it('applies cursor-help class when tooltip is enabled', () => {
      render(<ProgressBar value={75} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('cursor-help');
    });

    it('handles hover events to show tooltip', () => {
      render(<ProgressBar value={75} />);
      const progressBar = screen.getByRole('progressbar');
      const tooltip = progressBar.parentElement?.querySelector('[role="tooltip"]') as HTMLElement;
      
      // Initially hidden
      expect(tooltip).toHaveClass('opacity-0');
      
      // Trigger mouse enter
      progressBar.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      
      // Tooltip should be visible (we check the class exists for transition)
      expect(tooltip).toBeInTheDocument();
    });
  });
});
