import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState, NoDataEmptyState, NoSearchResultsEmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('should render with title', () => {
    render(<EmptyState title="No data available" />);
    
    expect(screen.getByRole('heading', { name: 'No data available' })).toBeInTheDocument();
  });

  it('should render with description', () => {
    render(
      <EmptyState 
        title="No data available" 
        description="There is no data to display at the moment."
      />
    );
    
    expect(screen.getByText('There is no data to display at the moment.')).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    render(<EmptyState title="No data" description="Description here" />);
    
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
  });

  it('should render with assertive aria-live when specified', () => {
    render(<EmptyState title="Error" ariaLive="assertive" />);
    
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'assertive');
  });

  it('should have screen reader announcement', () => {
    render(<EmptyState title="No data" description="Please check back later" />);
    
    const srOnly = screen.getByText('No data. Please check back later');
    expect(srOnly).toHaveClass('sr-only');
  });

  it('should render with custom ID', () => {
    render(<EmptyState title="No data" id="custom-empty-state" />);
    
    const container = document.getElementById('custom-empty-state');
    expect(container).toBeInTheDocument();
  });

  it('should render with icon', () => {
    const TestIcon = () => <svg data-testid="test-icon">Icon</svg>;
    render(
      <EmptyState 
        title="No data" 
        icon={<TestIcon />}
      />
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should render with primary action button', () => {
    const handleClick = vi.fn();
    render(
      <EmptyState 
        title="No data" 
        primaryAction={{
          label: 'Create New',
          onClick: handleClick,
        }}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Create New' });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render with secondary action button', () => {
    const handleClick = vi.fn();
    render(
      <EmptyState 
        title="No data" 
        secondaryAction={{
          label: 'Learn More',
          onClick: handleClick,
        }}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Learn More' });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render with both action buttons', () => {
    render(
      <EmptyState 
        title="No data" 
        primaryAction={{
          label: 'Primary',
          onClick: vi.fn(),
        }}
        secondaryAction={{
          label: 'Secondary',
          onClick: vi.fn(),
        }}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<EmptyState title="No data" size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('max-w-sm');

    rerender(<EmptyState title="No data" size="md" />);
    expect(screen.getByRole('status')).toHaveClass('max-w-md');

    rerender(<EmptyState title="No data" size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('max-w-lg');

    rerender(<EmptyState title="No data" size="xl" />);
    expect(screen.getByRole('status')).toHaveClass('max-w-xl');
  });

  it('should apply custom className', () => {
    render(<EmptyState title="No data" className="custom-class" />);
    
    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });

  it('should render without animation when animate is false', () => {
    render(<EmptyState title="No data" animate={false} />);
    
    const status = screen.getByRole('status');
    expect(status).not.toHaveClass('opacity-0');
  });
});

describe('NoDataEmptyState', () => {
  it('should render with default title and description', () => {
    render(<NoDataEmptyState />);
    
    expect(screen.getByRole('heading', { name: 'No data available' })).toBeInTheDocument();
    // Description appears in both visible paragraph and sr-only span
    const descriptions = screen.getAllByText(/There's no data to display at the moment/);
    expect(descriptions.length).toBeGreaterThanOrEqual(1);
  });

  it('should render with refresh button when onRefresh is provided', () => {
    const handleRefresh = vi.fn();
    render(<NoDataEmptyState onRefresh={handleRefresh} />);
    
    const button = screen.getByRole('button', { name: 'Refresh' });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('should have proper ARIA attributes', () => {
    render(<NoDataEmptyState />);
    
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
  });
});

describe('NoSearchResultsEmptyState', () => {
  it('should render with default title and description', () => {
    render(<NoSearchResultsEmptyState />);
    
    expect(screen.getByRole('heading', { name: 'No results found' })).toBeInTheDocument();
    // Description appears in both visible paragraph and sr-only span
    const descriptions = screen.getAllByText(/We couldn't find anything matching your search/);
    expect(descriptions.length).toBeGreaterThanOrEqual(1);
  });

  it('should render with clear search button when onClearSearch is provided', () => {
    const handleClear = vi.fn();
    render(<NoSearchResultsEmptyState onClearSearch={handleClear} />);
    
    const button = screen.getByRole('button', { name: 'Clear search' });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('should have proper ARIA attributes for search feedback', () => {
    render(<NoSearchResultsEmptyState />);
    
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
  });
});
