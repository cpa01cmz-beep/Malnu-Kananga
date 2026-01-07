import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import LoadingState, { EmptyState, ErrorState } from '../LoadingState';

describe('LoadingState Component', () => {
  describe('Loading States', () => {
    it('should render page loading state with skeletons', () => {
      const { container } = render(
        <LoadingState
          isLoading={true}
          type="page"
          variant="card"
          count={3}
        >
          <div>Content</div>
        </LoadingState>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
    });

    it('should render table loading state', () => {
      render(
        <LoadingState
          isLoading={true}
          type="table"
          rows={5}
          cols={4}
        >
          <table><tbody><tr><td>Data</td></tr></tbody></table>
        </LoadingState>
      );

      expect(screen.getByRole('status', { busy: true })).toBeInTheDocument();
    });

    it('should render list loading state', () => {
      render(
        <LoadingState
          isLoading={true}
          type="list"
          count={3}
        >
          <ul><li>Item 1</li></ul>
        </LoadingState>
      );

      expect(screen.getByRole('status', { busy: true })).toBeInTheDocument();
    });

    it('should render section loading state with card variant', () => {
      render(
        <LoadingState
          isLoading={true}
          type="section"
          variant="card"
          count={3}
        >
          <div>Content</div>
        </LoadingState>
      );

      expect(screen.getByRole('status', { busy: true })).toBeInTheDocument();
    });

    it('should render inline loading state with spinner', () => {
      render(
        <LoadingState
          isLoading={true}
          type="inline"
          size="md"
        >
          <div>Content</div>
        </LoadingState>
      );

      expect(screen.getByRole('status', { busy: true })).toBeInTheDocument();
      expect(screen.getByText('Memuat...')).toBeInTheDocument();
    });

    it('should render inline loading state with custom size', () => {
      const { container } = render(
        <LoadingState
          isLoading={true}
          type="inline"
          size="lg"
        >
          <div>Content</div>
        </LoadingState>
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-8', 'w-8');
    });
  });

  describe('Error State', () => {
    it('should render error state with message', () => {
      render(
        <LoadingState
          isLoading={false}
          error="Failed to load data"
        >
          <div>Content</div>
        </LoadingState>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });

    it('should render error state with retry button', async () => {
      const onRetry = vi.fn();
      render(
        <LoadingState
          isLoading={false}
          error="Network error"
          onRetry={onRetry}
        >
          <div>Content</div>
        </LoadingState>
      );

      const retryButton = screen.getByRole('button', { name: 'Coba Lagi' });
      await userEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should render error state with custom size', () => {
      const { container } = render(
        <LoadingState
          isLoading={false}
          error="Error"
          size="lg"
        >
          <div>Content</div>
        </LoadingState>
      );

      const iconContainer = container.querySelector('.text-red-400');
      expect(iconContainer).toHaveClass('w-16', 'h-16');
    });

    it('should not render error state when loading', () => {
      render(
        <LoadingState
          isLoading={true}
          error="Error"
        >
          <div>Content</div>
        </LoadingState>
      );

      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state with default message', () => {
      render(
        <LoadingState
          isLoading={false}
          empty={true}
        >
          <div>Content</div>
        </LoadingState>
      );

      expect(screen.getByText('Tidak ada data')).toBeInTheDocument();
    });

    it('should render empty state with custom message', () => {
      render(
        <LoadingState
          isLoading={false}
          empty={true}
          emptyMessage="No records found"
        >
          <div>Content</div>
        </LoadingState>
      );

      expect(screen.getByText('No records found')).toBeInTheDocument();
    });

    it('should render empty state with custom icon', () => {
      const TestIcon = () => <span data-testid="test-icon">ICON</span>;
      render(
        <LoadingState
          isLoading={false}
          empty={true}
          emptyIcon={<TestIcon />}
        >
          <div>Content</div>
        </LoadingState>
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should not render empty state when loading', () => {
      render(
        <LoadingState
          isLoading={true}
          empty={true}
        >
          <div>Content</div>
        </LoadingState>
      );

      expect(screen.queryByText('Tidak ada data')).not.toBeInTheDocument();
    });
  });

  describe('Content Rendering', () => {
    it('should render children when not loading and no error', () => {
      render(
        <LoadingState
          isLoading={false}
          error={null}
        >
          <div>Test Content</div>
        </LoadingState>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.queryByRole('status', { busy: true })).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <LoadingState
          isLoading={true}
          className="custom-class"
        >
          <div>Content</div>
        </LoadingState>
      );

      const loadingState = container.querySelector('.custom-class');
      expect(loadingState).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for loading state', () => {
      const { container } = render(
        <LoadingState
          isLoading={true}
          type="inline"
        >
          <div>Content</div>
        </LoadingState>
      );

      const status = container.querySelector('[role="status"]');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(status).toHaveAttribute('aria-busy', 'true');
    });

    it('should have proper ARIA attributes for error state', () => {
      const { container } = render(
        <LoadingState
          isLoading={false}
          error="Error message"
        >
          <div>Content</div>
        </LoadingState>
      );

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('should hide skeleton elements from screen readers', () => {
      const { container } = render(
        <LoadingState
          isLoading={true}
          type="page"
          variant="card"
          count={2}
        >
          <div>Content</div>
        </LoadingState>
      );

      const skeletons = container.querySelectorAll('[aria-hidden="true"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should hide loading spinner from screen readers', () => {
      const { container } = render(
        <LoadingState
          isLoading={true}
          type="inline"
        >
          <div>Content</div>
        </LoadingState>
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('ErrorState Component', () => {
    it('should render error message', () => {
      render(<ErrorState message="Test error" />);

      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should render retry button when onRetry provided', () => {
      const onRetry = vi.fn();
      render(<ErrorState message="Error" onRetry={onRetry} />);

      const retryButton = screen.getByRole('button', { name: 'Coba Lagi' });
      expect(retryButton).toBeInTheDocument();
    });

    it('should call onRetry when retry button clicked', async () => {
      const onRetry = vi.fn();
      render(<ErrorState message="Error" onRetry={onRetry} />);

      const retryButton = screen.getByRole('button', { name: 'Coba Lagi' });
      await userEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should render with custom size', () => {
      const { container } = render(<ErrorState message="Error" size="lg" />);

      const iconContainer = container.querySelector('.text-red-400');
      expect(iconContainer).toHaveClass('w-16', 'h-16');
    });

    it('should render error icon', () => {
      const { container } = render(<ErrorState message="Error" />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('EmptyState Component', () => {
    it('should render empty message', () => {
      render(<EmptyState message="No data" />);

      expect(screen.getByText('No data')).toBeInTheDocument();
    });

    it('should render custom icon', () => {
      const TestIcon = () => <span data-testid="test-icon">ICON</span>;
      render(<EmptyState message="No data" icon={<TestIcon />} />);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should render action button when action provided', async () => {
      const onAction = vi.fn();
      render(
        <EmptyState
          message="No data"
          action={{ label: 'Add Item', onClick: onAction }}
        />
      );

      const actionButton = screen.getByRole('button', { name: 'Add Item' });
      expect(actionButton).toBeInTheDocument();

      await userEvent.click(actionButton);
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('should render with custom size', () => {
      const { container } = render(<EmptyState message="No data" size="lg" />);

      expect(container.firstChild).toHaveClass('p-12', 'text-lg');
    });
  });
});
