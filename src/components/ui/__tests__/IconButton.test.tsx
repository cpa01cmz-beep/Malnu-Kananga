 
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

    it('renders with tooltip', () => {
      render(<IconButton icon={mockIcon} ariaLabel="Test" tooltip="Tooltip text" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Tooltip text');
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
      expect(button).toHaveClass('focus:outline-none', 'focus-visible:ring-2');
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
      expect(button).toHaveClass('dark:focus-visible:ring-offset-neutral-900');
    });

    it('applies dark mode classes for colored variants', () => {
      const { container } = render(<IconButton icon={mockIcon} ariaLabel="Test" variant="primary" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('dark:focus-visible:ring-offset-neutral-900');
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
});
