import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingOverlay from '../LoadingOverlay';

describe('LoadingOverlay', () => {
  it('does not render when not loading', () => {
    render(
      <LoadingOverlay isLoading={false}>
        <div>Content</div>
      </LoadingOverlay>
    );
    
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders loading state when loading', () => {
    render(<LoadingOverlay isLoading={true} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays custom message', () => {
    render(<LoadingOverlay isLoading={true} message="Custom loading message" />);
    
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  it('shows progress bar when progress is provided', () => {
    render(<LoadingOverlay isLoading={true} showProgress progress={75} />);
    
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders centered variant', () => {
    render(<LoadingOverlay isLoading={true} variant="centered" />);
    
    const overlay = screen.getByRole('status').parentElement?.parentElement;
    expect(overlay).toHaveClass('fixed', 'inset-0');
  });

  it('renders minimal variant', () => {
    render(<LoadingOverlay isLoading={true} variant="minimal" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<LoadingOverlay isLoading={true} size="lg" />);
    let loadingDiv = screen.getByRole('status').parentElement;
    expect(loadingDiv).toHaveClass('p-12');

    rerender(<LoadingOverlay isLoading={true} size="sm" />);
    loadingDiv = screen.getByRole('status').parentElement;
    expect(loadingDiv).toHaveClass('p-4');
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingOverlay isLoading={true} />);
    
    const statusElement = screen.getByRole('status');
    expect(statusElement).toHaveAttribute('aria-live', 'polite');
    expect(statusElement).toHaveAttribute('aria-busy', 'true');
  });

  it('shows backdrop when enabled', () => {
    render(<LoadingOverlay isLoading={true} showBackdrop={true} />);
    
    const backdrop = screen.getByRole('status').parentElement;
    expect(backdrop).toHaveClass('bg-black', 'backdrop-blur-sm');
  });

  it('applies custom className', () => {
    render(<LoadingOverlay isLoading={true} className="custom-class" />);
    
    const overlay = screen.getByRole('status').parentElement;
    expect(overlay).toHaveClass('custom-class');
  });
});