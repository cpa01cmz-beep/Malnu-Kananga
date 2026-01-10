 
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pagination from '../Pagination';

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    itemsPerPage: 10,
    onPageChange: vi.fn(),
  };

  it('renders pagination controls', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByText('Showing 1 to 10 of 50 results')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Show')).toBeInTheDocument();
  });

  it('handles page changes', async () => {
    render(<Pagination {...defaultProps} />);
    
    const nextPageButton = screen.getByLabelText('Next page');
    fireEvent.click(nextPageButton);
    
    await waitFor(() => {
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    });
  });

  it('handles direct page selection', async () => {
    render(<Pagination {...defaultProps} />);
    
    const page3Button = screen.getByText('3');
    fireEvent.click(page3Button);
    
    await waitFor(() => {
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
    });
  });

  it('disables previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    
    const prevButton = screen.getByLabelText('Previous page');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    
    const nextButton = screen.getByLabelText('Next page');
    expect(nextButton).toBeDisabled();
  });

  it('shows correct current page styling', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    
    const currentPageButton = screen.getByText('3');
    expect(currentPageButton).toHaveClass('bg-primary-600');
  });

  it('handles items per page change', async () => {
    const mockOnItemsPerPageChange = vi.fn();
    render(<Pagination {...defaultProps} onItemsPerPageChange={mockOnItemsPerPageChange} />);
    
    const select = screen.getByLabelText('Items per page');
    fireEvent.change(select, { target: { value: '25' } });
    
    await waitFor(() => {
      expect(mockOnItemsPerPageChange).toHaveBeenCalledWith(25);
    });
  });

  it('renders compact variant', () => {
    render(<Pagination {...defaultProps} variant="compact" />);
    
    expect(screen.getByText('Showing 1 to 10 of 50 results')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
  });

  it('renders minimal variant', () => {
    render(<Pagination {...defaultProps} variant="minimal" />);
    
    expect(screen.queryByText('Showing 1 to 10 of 50 results')).not.toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
  });

  it('shows ellipsis for many pages', () => {
    render(<Pagination {...defaultProps} totalPages={20} currentPage={10} maxVisiblePages={5} />);
    
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('handles edge cases with page numbers', () => {
    render(<Pagination {...defaultProps} totalPages={3} currentPage={2} maxVisiblePages={5} />);
    
    // Should show all pages without ellipsis
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Pagination {...defaultProps} size="lg" />);
    expect(screen.getByText('Showing 1 to 10 of 50 results')).toHaveClass('text-base');

    rerender(<Pagination {...defaultProps} size="sm" />);
    expect(screen.getByText('Showing 1 to 10 of 50 results')).toHaveClass('text-xs');
  });

  it('hides items per page selector when disabled', () => {
    render(<Pagination {...defaultProps} showItemsPerPageSelector={false} />);
    
    expect(screen.queryByText('Show')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Items per page')).not.toBeInTheDocument();
  });

  it('hides total count when disabled', () => {
    render(<Pagination {...defaultProps} showTotalCount={false} />);
    
    expect(screen.queryByText('Showing 1 to 10 of 50 results')).not.toBeInTheDocument();
  });

  it('does not render when totalPages is 1', () => {
    render(<Pagination {...defaultProps} totalPages={1} />);
    
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<Pagination {...defaultProps} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Pagination navigation');
  });

  it('highlights current page with aria-current', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    
    const currentPageButton = screen.getByText('3');
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });
});