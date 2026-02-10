 
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IconButton from '../IconButton';

describe('IconButton', () => {
  const mockIcon = <svg data-testid="test-icon"><circle cx="12" cy="12" r="10" /></svg>;

  describe('Rendering', () => {
    it('renders correctly with required props', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test button" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Test button');
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders with default variant', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-neutral-600');
    });

    it('renders with custom variant', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" variant="primary" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary-600');
    });

    it('renders with custom size', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" size="lg" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-2.5');
    });

    it('renders with accessible tooltip', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" tooltip="Tooltip text" />);
      const button = screen.getByRole('button');
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Tooltip text');
      expect(button).toHaveAttribute('aria-describedby', tooltip.id);
    });

    it('applies custom className', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('passes through additional props', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" data-custom="value" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-custom', 'value');
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" variant="default" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('text-neutral-600', 'dark:text-neutral-400');
    });

    it('renders primary variant', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" variant="primary" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-primary-600', 'text-white');
    });

    it('renders secondary variant', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" variant="secondary" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-white', 'dark:bg-neutral-800', 'border-2');
    });

    it('renders danger variant', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" variant="danger" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-red-100', 'dark:bg-red-900/30', 'text-red-700');
    });

    it('renders success variant', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" variant="success" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-green-100', 'dark:bg-green-900/30', 'text-green-700');
    });

    it('renders info variant', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" variant="info" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-blue-100', 'dark:bg-blue-900/30', 'text-blue-700');
    });

    it('renders warning variant', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" variant="warning" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-orange-100', 'dark:bg-orange-900/30', 'text-orange-700');
    });

    it('renders ghost variant', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" variant="ghost" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-transparent', 'text-neutral-600');
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" size="sm" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('p-1');
    });

    it('renders medium size', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" size="md" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('p-2');
    });

    it('renders large size', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" size="lg" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('p-2.5');
    });

    it('adjusts icon size based on button size', () => {
      const { container: smContainer } = render(<IconButton icon={mockIcon} ariaLabel="Test" size="sm" />);
      const { container: lgContainer } = render(<IconButton icon={mockIcon} ariaLabel="Test" size="lg" />);
      
      const smIcon = smContainer.querySelector('span[aria-hidden="true"]');
      const lgIcon = lgContainer.querySelector('span[aria-hidden="true"]');
      
      expect(smIcon).toHaveClass('w-4', 'h-4');
      expect(lgIcon).toHaveClass('w-6', 'h-6');
    });
  });

  describe('Interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<IconButton icon={mockIcon} ariaLabel="Test" onClick={handleClick} />);
      const button = screen.getByRole('button');
      
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<IconButton icon={mockIcon} ariaLabel="Test" onClick={handleClick} disabled />);
      const button = screen.getByRole('button');
      
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('can be focused', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" />);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label attribute', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Close modal" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Close modal');
    });

    it('has aria-hidden on icon span', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" />);
      const iconSpan = container.querySelector('span[aria-hidden="true"]');
      expect(iconSpan).toBeInTheDocument();
    });

    it('has focus ring styles', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('has keyboard focus styles', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" />);
      const button = container.querySelector('button');
      if (button) {
        button.focus();
        expect(button).toHaveFocus();
      }
    });

    it('has proper disabled accessibility', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('tooltip is accessible with aria-describedby', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" tooltip="Helpful tooltip" />);
      const button = screen.getByRole('button');
      const tooltip = screen.getByRole('tooltip');
      expect(button).toHaveAttribute('aria-describedby', tooltip.id);
    });

    it('does not have aria-describedby when no tooltip', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" />);
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('aria-describedby');
    });

    it('shows tooltip on mouse enter', async () => {
      const user = userEvent.setup();
      render(<IconButton icon={mockIcon} ariaLabel="Test" tooltip="Hover tooltip" />);
      const button = screen.getByRole('button');
      const tooltip = screen.getByRole('tooltip');

      expect(tooltip).toHaveClass('opacity-0');
      await user.hover(button);
      expect(tooltip).toHaveClass('opacity-100');
    });

    it('hides tooltip on mouse leave', async () => {
      const user = userEvent.setup();
      render(<IconButton icon={mockIcon} ariaLabel="Test" tooltip="Hover tooltip" />);
      const button = screen.getByRole('button');
      const tooltip = screen.getByRole('tooltip');

      await user.hover(button);
      expect(tooltip).toHaveClass('opacity-100');
      await user.unhover(button);
      expect(tooltip).toHaveClass('opacity-0');
    });

    it('shows tooltip on focus', async () => {
      const user = userEvent.setup();
      render(<IconButton icon={mockIcon} ariaLabel="Test" tooltip="Focus tooltip" />);
      const button = screen.getByRole('button');
      const tooltip = screen.getByRole('tooltip');

      expect(tooltip).toHaveClass('opacity-0');
      await user.click(button);
      expect(tooltip).toHaveClass('opacity-100');
    });

    it('hides tooltip on blur', async () => {
      const user = userEvent.setup();
      render(<IconButton icon={mockIcon} ariaLabel="Test" tooltip="Focus tooltip" />);
      const button = screen.getByRole('button');
      const tooltip = screen.getByRole('tooltip');

      await user.click(button);
      expect(tooltip).toHaveClass('opacity-100');
      await user.tab();
      expect(tooltip).toHaveClass('opacity-0');
    });
  });

  describe('Tooltip Positioning', () => {
    it('renders tooltip at bottom by default', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" tooltip="Test" />);
      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toHaveClass('top-full');
    });

    it('renders tooltip at top', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" tooltip="Test" tooltipPosition="top" />);
      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toHaveClass('bottom-full');
    });

    it('renders tooltip at left', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" tooltip="Test" tooltipPosition="left" />);
      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toHaveClass('right-full');
    });

    it('renders tooltip at right', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" tooltip="Test" tooltipPosition="right" />);
      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toHaveClass('left-full');
    });

    it('has tooltip arrow', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" tooltip="Test" />);
      const arrow = container.querySelector('[role="tooltip"] > span[aria-hidden="true"]');
      expect(arrow).toBeInTheDocument();
      expect(arrow).toHaveClass('rotate-45');
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode classes', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" variant="default" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('dark:text-neutral-400', 'dark:hover:bg-neutral-700');
    });

    it('applies dark mode focus ring offset', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('dark:focus:ring-offset-neutral-900');
    });

    it('applies dark mode classes for colored variants', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" variant="primary" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('dark:focus:ring-offset-neutral-900');
    });
  });

  describe('Animations', () => {
    it('has transition classes', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('transition-all', 'duration-200', 'ease-out');
    });

    it('has hover scale animation', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('hover:scale-110');
    });

    it('has active scale animation', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('active:scale-95');
    });
  });

  describe('Loading State', () => {
    it('renders loading spinner when isLoading is true', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" isLoading />);
      const button = screen.getByRole('button');
      
      // Check aria-busy attribute
      expect(button).toHaveAttribute('aria-busy', 'true');
      
      // Check aria-label includes loading text
      expect(button).toHaveAttribute('aria-label', 'Test - Memuat');
      
      // Check for spinner SVG (animate-spin class on parent)
      const spinnerSvg = document.querySelector('.animate-spin');
      expect(spinnerSvg).toBeInTheDocument();
      
      // Original icon should be hidden during loading
      const hiddenIcon = document.querySelector('.opacity-0.scale-50');
      expect(hiddenIcon).toBeInTheDocument();
    });

    it('applies loading cursor and opacity classes', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" isLoading />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('cursor-wait', 'opacity-80');
    });

    it('does not show tooltip when loading', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" tooltip="Help" isLoading />);
      
      // Tooltip should not be rendered when loading
      const tooltip = screen.queryByRole('tooltip');
      expect(tooltip).not.toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('renders success checkmark when showSuccess is true', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" showSuccess />);
      const button = screen.getByRole('button');
      
      // Check aria-label includes success text
      expect(button).toHaveAttribute('aria-label', 'Test - Berhasil');
      
      // Check for success styling
      expect(button).toHaveClass('text-green-600', 'dark:text-green-400');
      expect(button).toHaveClass('bg-green-100', 'dark:bg-green-900/30');
      
      // Original icon should be hidden during success
      const hiddenIcon = document.querySelector('.opacity-0.scale-50');
      expect(hiddenIcon).toBeInTheDocument();
    });

    it('auto-hides success state after duration', async () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" showSuccess successDuration={100} />);
      
      // Initially shows success
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Test - Berhasil');
      
      // Wait for auto-reset
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should revert to normal state
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Test');
    });

    it('prioritizes loading over success state', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" isLoading showSuccess />);
      const button = screen.getByRole('button');
      
      // Loading state takes precedence
      expect(button).toHaveAttribute('aria-label', 'Test - Memuat');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('does not show tooltip when in success state', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" tooltip="Help" showSuccess />);
      
      // Tooltip should not be rendered when showing success
      const tooltip = screen.queryByRole('tooltip');
      expect(tooltip).not.toBeInTheDocument();
    });
  });

  describe('Accessibility with Loading and Success', () => {
    it('has aria-live polite for screen reader announcements', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-live', 'polite');
    });

    it('updates aria-label dynamically based on state', () => {
      const { rerender } = render(<IconButton icon={mockIcon} ariaLabel="Save" />);
      const button = screen.getByRole('button');
      
      // Normal state
      expect(button).toHaveAttribute('aria-label', 'Save');
      
      // Loading state
      rerender(<IconButton icon={mockIcon} ariaLabel="Save" isLoading />);
      expect(button).toHaveAttribute('aria-label', 'Save - Memuat');
      
      // Success state
      rerender(<IconButton icon={mockIcon} ariaLabel="Save" showSuccess />);
      expect(button).toHaveAttribute('aria-label', 'Save - Berhasil');
    });
  });
});
