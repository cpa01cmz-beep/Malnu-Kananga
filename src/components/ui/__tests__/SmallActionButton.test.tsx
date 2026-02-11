 
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SmallActionButton from '../SmallActionButton';

const MockIcon = () => (
  <svg data-testid="mock-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth={2} />
  </svg>
);

describe('SmallActionButton', () => {
  it('should render default button', () => {
    render(<SmallActionButton>Click me</SmallActionButton>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-50', 'dark:bg-blue-900/20', 'text-blue-600', 'dark:text-blue-400');
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm', 'font-medium');
  });

  it('should render with different variants', () => {
    const { rerender } = render(<SmallActionButton variant="neutral">Neutral</SmallActionButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-neutral-200', 'dark:bg-neutral-700');

    rerender(<SmallActionButton variant="danger">Danger</SmallActionButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-100', 'text-red-700');

    rerender(<SmallActionButton variant="success">Success</SmallActionButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-green-100', 'text-green-700');

    rerender(<SmallActionButton variant="warning">Warning</SmallActionButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-orange-100', 'text-orange-700');
  });

  it('should be disabled when isLoading is true', () => {
    render(<SmallActionButton isLoading>Loading</SmallActionButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-wait');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<SmallActionButton disabled>Disabled</SmallActionButton>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should render icon on left', () => {
    render(<SmallActionButton icon={<MockIcon />} iconPosition="left">With Icon</SmallActionButton>);
    
    const button = screen.getByRole('button', { name: 'With Icon' });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('should render icon on right', () => {
    render(<SmallActionButton icon={<MockIcon />} iconPosition="right">With Icon</SmallActionButton>);
    
    const button = screen.getByRole('button', { name: 'With Icon' });
    expect(button).toBeInTheDocument();
  });

  it('should call onClick handler', () => {
    const handleClick = vi.fn();
    render(<SmallActionButton onClick={handleClick}>Click me</SmallActionButton>);
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<SmallActionButton disabled onClick={handleClick}>Click me</SmallActionButton>);
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(<SmallActionButton isLoading onClick={handleClick}>Click me</SmallActionButton>);
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have proper focus styles', () => {
    render(<SmallActionButton>Focus me</SmallActionButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:ring-2', 'focus:ring-offset-2', 'focus:outline-none');
  });

  it('should render as fullWidth', () => {
    render(<SmallActionButton fullWidth>Full Width</SmallActionButton>);
    
    expect(screen.getByRole('button')).toHaveClass('flex-1');
  });

  describe('Accessibility', () => {
    it('should have aria-busy when loading', () => {
      render(<SmallActionButton isLoading>Loading</SmallActionButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should not have aria-busy when not loading', () => {
      render(<SmallActionButton>Not Loading</SmallActionButton>);
      
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('aria-busy');
    });

    it('should have proper focus visible states', () => {
      render(<SmallActionButton>Focus test</SmallActionButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2',
        'dark:focus:ring-offset-neutral-900'
      );
    });

    it('should maintain focus ring color based on variant', () => {
      const { rerender } = render(<SmallActionButton variant="info">Info</SmallActionButton>);
      expect(screen.getByRole('button')).toHaveClass('focus:ring-blue-500/50');

      rerender(<SmallActionButton variant="danger">Danger</SmallActionButton>);
      expect(screen.getByRole('button')).toHaveClass('focus:ring-red-500/50');
    });

    it('should have loading spinner with proper ARIA attributes', () => {
      render(<SmallActionButton isLoading>Loading</SmallActionButton>);
      
      const button = screen.getByRole('button');
      const spinner = button.querySelector('svg');
      
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('role', 'status');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should render loading text when provided', () => {
      render(<SmallActionButton isLoading loadingText="Menyimpan...">Simpan</SmallActionButton>);
      
      expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
    });

    it('should render children when loading without loadingText', () => {
      render(<SmallActionButton isLoading>Simpan</SmallActionButton>);
      
      expect(screen.getByText('Simpan')).toBeInTheDocument();
    });

    it('should show tooltip on hover', () => {
      render(<SmallActionButton tooltip="Click to save">Simpan</SmallActionButton>);
      
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Click to save')).toBeInTheDocument();
    });

    it('should hide tooltip on mouse leave', () => {
      render(<SmallActionButton tooltip="Click to save">Simpan</SmallActionButton>);

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('opacity-100', 'scale-100');

      fireEvent.mouseLeave(button);
      expect(tooltip).toHaveClass('opacity-0', 'scale-95');
    });

    it('should have aria-describedby when tooltip is provided', () => {
      render(<SmallActionButton tooltip="Helpful tip">Button</SmallActionButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby');
    });

    it('should not have aria-describedby when tooltip is not provided', () => {
      render(<SmallActionButton>No Tooltip</SmallActionButton>);
      
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('aria-describedby');
    });

    it('should show tooltip on focus', () => {
      render(<SmallActionButton tooltip="Focus tooltip">Button</SmallActionButton>);
      
      const button = screen.getByRole('button');
      fireEvent.focus(button);
      
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('should hide tooltip on blur', () => {
      render(<SmallActionButton tooltip="Focus tooltip">Button</SmallActionButton>);

      const button = screen.getByRole('button');
      fireEvent.focus(button);
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('opacity-100', 'scale-100');

      fireEvent.blur(button);
      expect(tooltip).toHaveClass('opacity-0', 'scale-95');
    });

    it('should position tooltip at different positions', () => {
      const { rerender } = render(<SmallActionButton tooltip="Top" tooltipPosition="top">Button</SmallActionButton>);
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      let tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bottom-full');
      
      rerender(<SmallActionButton tooltip="Right" tooltipPosition="right">Button</SmallActionButton>);
      fireEvent.mouseEnter(screen.getByRole('button'));
      tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('left-full');
      
      rerender(<SmallActionButton tooltip="Left" tooltipPosition="left">Button</SmallActionButton>);
      fireEvent.mouseEnter(screen.getByRole('button'));
      tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('right-full');
    });

    it('should be keyboard accessible', () => {
      const handleClick = vi.fn();
      render(<SmallActionButton onClick={handleClick}>Keyboard Test</SmallActionButton>);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
      
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should render with fullWidth and icon', () => {
      const handleClick = vi.fn();
      render(<SmallActionButton fullWidth icon={<MockIcon />} onClick={handleClick}>With Icon</SmallActionButton>);
      
      const button = screen.getByRole('button', { name: 'With Icon' });
      expect(button).toHaveClass('flex-1');
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark mode styles for info variant', () => {
      render(<SmallActionButton variant="info">Info Button</SmallActionButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'dark:bg-blue-900/20',
        'dark:text-blue-400',
        'dark:hover:bg-blue-900/30'
      );
    });

    it('should apply dark mode styles for neutral variant', () => {
      render(<SmallActionButton variant="neutral">Neutral Button</SmallActionButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'dark:bg-neutral-700',
        'dark:text-neutral-300',
        'dark:hover:bg-neutral-600'
      );
    });

    it('should apply dark mode styles for secondary variant', () => {
      render(<SmallActionButton variant="secondary">Secondary Button</SmallActionButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'dark:bg-neutral-800',
        'dark:text-neutral-300',
        'dark:border-neutral-600',
        'dark:hover:bg-neutral-700'
      );
    });
  });

  describe('Success State', () => {
    it('should render success checkmark when showSuccess is true', () => {
      render(<SmallActionButton showSuccess>Save</SmallActionButton>);

      const button = screen.getByRole('button');
      const checkmark = button.querySelector('svg');

      expect(checkmark).toBeInTheDocument();
      expect(checkmark).toHaveAttribute('viewBox', '0 0 24 24');
      expect(button).toHaveClass('cursor-default');
    });

    it('should show success tooltip when showSuccess is true', () => {
      render(<SmallActionButton showSuccess>Save</SmallActionButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Berhasil');
    });

    it('should auto-hide success state after duration', async () => {
      render(<SmallActionButton showSuccess successDuration={100}>Save</SmallActionButton>);

      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should prioritize loading over success state', () => {
      render(<SmallActionButton isLoading showSuccess>Save</SmallActionButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should not show tooltip when in success state', () => {
      render(<SmallActionButton tooltip="Click to save" showSuccess>Save</SmallActionButton>);

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      expect(screen.queryByText('Click to save')).not.toBeInTheDocument();
    });

    it('should render success state with green text styling', () => {
      render(<SmallActionButton showSuccess>Save</SmallActionButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Save');
    });

    it('should not be clickable when showing success', () => {
      const handleClick = vi.fn();
      render(<SmallActionButton showSuccess onClick={handleClick}>Save</SmallActionButton>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalled();
    });
  });
});
