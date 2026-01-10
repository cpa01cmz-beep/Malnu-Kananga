 
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
});
