import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary, { withErrorBoundary, useErrorHandler } from './ErrorBoundary';

// Component yang akan menyebabkan error untuk testing
const ThrowErrorComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal Component</div>;
};

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    // Mock console methods untuk menghindari noise di test output
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'group').mockImplementation(() => {});
    jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
    
    // Mock error logging service
    jest.mock('../services/errorLoggingService', () => ({
      getErrorLoggingService: () => ({
        logErrorBoundary: jest.fn().mockResolvedValue(undefined),
        getSessionId: () => 'test-session-id',
        getStoredErrorLogs: () => [],
        exportErrorLogs: () => '[]',
        clearStoredErrorLogs: jest.fn(),
      }),
      logErrorBoundary: jest.fn(),
    }));

    // Mock sentry service
    jest.mock('../services/sentryService', () => ({
      captureErrorBoundary: jest.fn(),
    }));
  });

  afterEach(() => {
    consoleError.mockRestore();
    jest.restoreAllMocks();
  });

  it('seharusnya render children normal tanpa error', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal Component')).toBeInTheDocument();
  });

  it('seharusnya menangkap error dan menampilkan fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Normal Component')).not.toBeInTheDocument();
    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    expect(screen.getByText('Maaf, terjadi kesalahan yang tidak terduga. Halaman akan dimuat ulang untuk memperbaiki masalah ini.')).toBeInTheDocument();
  });

  it('seharusnya menggunakan custom fallback jika disediakan', () => {
    const customFallback = <div>Custom Error UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    expect(screen.queryByText('Terjadi Kesalahan')).not.toBeInTheDocument();
  });

  it('seharusnya memanggil custom error handler jika disediakan', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('seharusnya menampilkan detail error di development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const detailsElement = screen.getByText('Detail Error (Development)');
    expect(detailsElement).toBeInTheDocument();

    // Buka details untuk melihat konten
    fireEvent.click(detailsElement);

    expect(screen.getByText(/Test error/)).toBeInTheDocument();
    expect(screen.getByText(/Stack Trace:/)).toBeInTheDocument();
    expect(screen.getByText(/Component Stack:/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('seharusnya tidak menampilkan detail error di production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Detail Error (Development)')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('seharusnya mereset state ketika tombol "Coba Lagi" diklik', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();

    // Klik tombol "Coba Lagi"
    const retryButton = screen.getByText('Coba Lagi');
    fireEvent.click(retryButton);

    // Rerender dengan component yang tidak error
    rerender(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal Component')).toBeInTheDocument();
  });

  it('seharusnya me-reload halaman ketika tombol "Muat Ulang Halaman" diklik', () => {
    const reloadMock = jest.fn();
    Object.defineProperty(window.location, 'reload', {
      value: reloadMock,
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText('Muat Ulang Halaman');
    fireEvent.click(reloadButton);

    expect(reloadMock).toHaveBeenCalled();
  });

  it('seharusnya menangani multiple error berturut-turut', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();

    // Reset dan coba lagi dengan error lagi
    const retryButton = screen.getByText('Coba Lagi');
    fireEvent.click(retryButton);

    rerender(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
  });
});

describe('withErrorBoundary HOC', () => {
  it('seharusnya membungkus component dengan error boundary', () => {
    const Component = () => <div>Wrapped Component</div>;
    const WrappedComponent = withErrorBoundary(Component);

    render(<WrappedComponent />);

    expect(screen.getByText('Wrapped Component')).toBeInTheDocument();
  });

  it('seharusnya menangkap error di wrapped component', () => {
    const ErrorComponent = () => {
      throw new Error('HOC Error');
    };
    const WrappedComponent = withErrorBoundary(ErrorComponent);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<WrappedComponent />);

    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('seharusnya menggunakan custom fallback di HOC', () => {
    const ErrorComponent = () => {
      throw new Error('HOC Error');
    };
    const customFallback = <div>HOC Custom Fallback</div>;
    const WrappedComponent = withErrorBoundary(ErrorComponent, customFallback);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<WrappedComponent />);

    expect(screen.getByText('HOC Custom Fallback')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('seharusnya memiliki displayName yang benar', () => {
    const Component = () => <div>Test Component</div>;
    Component.displayName = 'TestComponent';
    const WrappedComponent = withErrorBoundary(Component);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });
});

describe('useErrorHandler hook', () => {
  it('seharusnya melempar error ketika dipanggil', () => {
    const ComponentWithHandler = () => {
      const handleError = useErrorHandler();
      
      const handleClick = () => {
        handleError(new Error('Manual error'));
      };

      return (
        <div>
          <button onClick={handleClick}>Throw Error</button>
        </div>
      );
    };

    render(
      <ErrorBoundary>
        <ComponentWithHandler />
      </ErrorBoundary>
    );

    const button = screen.getByText('Throw Error');
    fireEvent.click(button);

    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
  });
});

describe('ErrorBoundary Integration', () => {
  it('seharusnya bekerja dengan nested components', () => {
    const NestedComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
      if (shouldThrow) {
        throw new Error('Nested error');
      }
      return <div>Nested Component</div>;
    };

    const ParentComponent = ({ childShouldThrow = false }: { childShouldThrow?: boolean }) => {
      return (
        <div>
          <h1>Parent Component</h1>
          <NestedComponent shouldThrow={childShouldThrow} />
        </div>
      );
    };

    render(
      <ErrorBoundary>
        <ParentComponent childShouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    expect(screen.queryByText('Parent Component')).not.toBeInTheDocument();
  });
});