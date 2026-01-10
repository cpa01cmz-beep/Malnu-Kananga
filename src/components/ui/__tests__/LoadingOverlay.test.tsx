 
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
    
    const loadingTexts = screen.getAllByText('Loading...');
    expect(loadingTexts.length).toBeGreaterThan(0);
    // Get the outer status container, not the inner spinner one
    const statusElements = screen.getAllByRole('status');
    expect(statusElements.length).toBeGreaterThan(0);
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
    
    // Get the outer status container (the one with the fixed positioning)
    const statusElements = screen.getAllByRole('status');
    const outerStatus = statusElements.find(el => el.classList.contains('fixed'));
    expect(outerStatus).toHaveClass('fixed', 'inset-0');
  });

  it('renders minimal variant', () => {
    render(<LoadingOverlay isLoading={true} variant="minimal" />);
    
    const statusElements = screen.getAllByRole('status');
    expect(statusElements.length).toBeGreaterThan(0);
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<LoadingOverlay isLoading={true} size="lg" />);
    // Get the inner content div with padding classes
    const contentDiv = document.querySelector('.p-12');
    expect(contentDiv).toBeInTheDocument();

    rerender(<LoadingOverlay isLoading={true} size="sm" />);
    const contentDivSmall = document.querySelector('.p-4');
    expect(contentDivSmall).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingOverlay isLoading={true} />);
    
    // Check the outer status container has proper accessibility attributes
    const statusElements = screen.getAllByRole('status');
    const outerStatus = statusElements.find(el => el.hasAttribute('aria-busy'));
    expect(outerStatus).toHaveAttribute('aria-live', 'polite');
    expect(outerStatus).toHaveAttribute('aria-busy', 'true');
  });

  it('shows backdrop when enabled', () => {
    render(<LoadingOverlay isLoading={true} showBackdrop={true} />);
    
    // Check for backdrop classes on the outer container
    const statusElements = screen.getAllByRole('status');
    const outerStatus = statusElements.find(el => el.classList.contains('bg-black'));
    if (outerStatus) {
      expect(outerStatus).toHaveClass('bg-black/50', 'backdrop-blur-sm');
    } else {
      // Fallback: check if backdrop classes exist anywhere
      expect(document.querySelector('.bg-black\\/50')).toBeInTheDocument();
    }
  });

  it('applies custom className', () => {
    render(<LoadingOverlay isLoading={true} className="custom-class" />);
    
    // Check if the custom class is applied to any of the status elements
    const statusElements = screen.getAllByRole('status');
    const elementWithCustomClass = statusElements.find(el => el.classList.contains('custom-class'));
    expect(elementWithCustomClass).toBeInTheDocument();
  });
});