import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../ErrorBoundary';

const ThrowErrorComponent = () => {
  throw new Error('Test error');
};

const FallbackComponent = ({ error, resetErrorBoundary }: any) => (
  <div>
    <h1>Custom Error</h1>
    <p>{error.message}</p>
    <button onClick={resetErrorBoundary}>Try Again</button>
  </div>
);

describe('ErrorBoundary Component', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Normal Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal Content')).toBeInTheDocument();
  });

  test('catches and displays error when child component throws', async () => {
    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  test('renders custom fallback when provided', async () => {
    render(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText('Custom Error')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  test('calls onError prop when error occurs', async () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  test('resets error boundary when reset button is clicked', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    const resetButton = screen.getByText(/try again/i);
    fireEvent.click(resetButton);

    rerender(
      <ErrorBoundary>
        <div>Recovered Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Recovered Content')).toBeInTheDocument();
  });

  test('logs error details to console', async () => {
    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
        })
      );
    });
  });

  test('handles different error types', async () => {
    const TypeErrorComponent = () => {
      throw new TypeError('Type error occurred');
    };

    render(
      <ErrorBoundary>
        <TypeErrorComponent />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  test('provides error context information', async () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  test('handles async errors in useEffect', async () => {
    const AsyncErrorComponent = () => {
      React.useEffect(() => {
        throw new Error('Async error');
      }, []);
      return <div>Async Component</div>;
    };

    render(
      <ErrorBoundary>
        <AsyncErrorComponent />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});