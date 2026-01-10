 
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render default spinner', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'h-8', 'w-8');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render small spinner', () => {
    render(<LoadingSpinner size="sm" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('should render large spinner', () => {
    render(<LoadingSpinner size="lg" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('should render with custom text', () => {
    render(<LoadingSpinner text="Loading data..." />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should render with custom color', () => {
    render(<LoadingSpinner color="success" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('border-green-600');
  });

  it('should render fullscreen variant', () => {
    render(<LoadingSpinner fullScreen />);
    
    const container = screen.getByRole('status').closest('.fixed');
    expect(container).toHaveClass('fixed', 'inset-0', 'z-50');
  });

  it('should render with custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('custom-class');
  });

  it('should not show text when not provided', () => {
    render(<LoadingSpinner />);
    
    // Only the sr-only text should be present
    expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<LoadingSpinner text="Processing..." />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Processing...');
  });
});