 
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../Button';

const MockIcon = () => (
  <svg data-testid="mock-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth={2} />
  </svg>
);

describe('Button', () => {
  it('should render default button', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary-600', 'text-white');
  });

  it('should render with different variants', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-white', 'dark:bg-neutral-800');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-700', 'text-white', 'dark:bg-red-600', 'dark:text-white');

    rerender(<Button variant="success">Success</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-green-700', 'text-white', 'dark:bg-green-600', 'dark:text-white');

    rerender(<Button variant="info">Info</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-700', 'text-white', 'dark:bg-blue-600', 'dark:text-white');

    rerender(<Button variant="warning">Warning</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-orange-600', 'text-white', 'dark:bg-orange-500', 'dark:text-white');

    rerender(<Button variant="indigo">Indigo</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-indigo-700', 'text-white', 'dark:bg-indigo-600', 'dark:text-white');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-2', 'text-sm');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3');
  });

  it('should be disabled when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-wait');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should render icon on the left', () => {
    render(<Button icon={<MockIcon />} iconPosition="left">With Icon</Button>);
    
    const button = screen.getByRole('button', { name: 'With Icon' });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('should render icon on the right', () => {
    render(<Button icon={<MockIcon />} iconPosition="right">With Icon</Button>);
    
    const button = screen.getByRole('button', { name: 'With Icon' });
    expect(button).toBeInTheDocument();
  });

  it('should render as fullWidth', () => {
    render(<Button fullWidth>Full Width</Button>);
    
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('should call onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(<Button isLoading onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have proper focus styles', () => {
    render(<Button>Focus me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:ring-2', 'focus:ring-offset-2', 'focus:outline-none');
  });

  describe('Accessibility', () => {
    it('should have aria-label for icon-only button when provided', () => {
      render(<Button iconOnly icon={<MockIcon />} ariaLabel="Open menu" />);
      
      const button = screen.getByRole('button', { name: 'Open menu' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Open menu');
    });

    it('should have empty aria-label for icon-only button when not provided', () => {
      render(<Button iconOnly icon={<MockIcon />} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', '');
    });

    it('should have aria-busy when loading', () => {
      render(<Button isLoading>Loading</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should not have aria-busy when not loading', () => {
      render(<Button>Not Loading</Button>);
      
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('aria-busy');
    });

    it('should not have aria-label for regular button with icon', () => {
      render(<Button icon={<MockIcon />}>Button with Icon</Button>);
      
      const button = screen.getByRole('button', { name: 'Button with Icon' });
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveAttribute('aria-label');
    });

    it('should have proper focus visible states', () => {
      render(<Button>Focus test</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2',
        'dark:focus:ring-offset-neutral-900'
      );
    });

    it('should maintain focus ring color based on variant', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('focus:ring-primary-500/50');

      rerender(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button')).toHaveClass('focus:ring-red-500/50');
    });

    it('should have loading spinner with proper ARIA attributes', () => {
      render(<Button isLoading>Loading</Button>);
      
      const button = screen.getByRole('button');
      const spinner = button.querySelector('svg');
      
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('role', 'status');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should be keyboard accessible', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Keyboard Test</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
      
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
