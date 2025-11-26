import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary, { withErrorBoundary, useErrorHandler } from './ErrorBoundary';

const ThrowErrorComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal Component</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
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

    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    expect(screen.getByText('Maaf, terjadi kesalahan yang tidak terduga. Halaman akan dimuat ulang untuk memperbaiki masalah ini.')).toBeInTheDocument();
  });

  it('seharusnya menggunakan custom fallback jika disediakan', () => {
    const CustomFallback = () => <div>Custom Error Message</div>;

    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error Message')).toBeInTheDocument();
  });

  it('seharusnya memanggil custom error handler jika disediakan', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(ErrorInfo));
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

    expect(screen.getAllByText(/Test error/).length).toBeGreaterThan(0);
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

    // Verify error state is shown
    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();

    // Click "Coba Lagi" button
    fireEvent.click(screen.getByText('Coba Lagi'));

    // Rerender dengan component yang tidak error
    rerender(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    // Check that normal component is rendered
    expect(screen.getByText('Normal Component')).toBeInTheDocument();
  });

  it('seharusnya me-reload halaman ketika tombol "Muat Ulang Halaman" diklik', () => {
    const reloadMock = jest.fn();
    const originalLocation = window.location;

    // Create a mock location object
    const mockLocation = {
      ...originalLocation,
      reload: reloadMock
    } as any;

    // Replace window.location
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true
    });

    render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Muat Ulang Halaman'));

    expect(reloadMock).toHaveBeenCalledTimes(1);

    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true
    });
  });

  it('seharusnya menangani multiple error berturut-turut', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();

    // Click "Coba Lagi" dan trigger error lagi
    fireEvent.click(screen.getByText('Coba Lagi'));

    rerender(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
  });
});

describe('withErrorBoundary HOC', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

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

    render(<WrappedComponent />);

    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
  });

  it('seharusnya menggunakan custom fallback di HOC', () => {
    const ErrorComponent = () => {
      throw new Error('HOC Error');
    };
    const CustomFallback = () => <div>HOC Custom Fallback</div>;
    const WrappedComponent = withErrorBoundary(ErrorComponent, {
      fallback: <CustomFallback />
    });

    render(<WrappedComponent />);

    expect(screen.getByText('HOC Custom Fallback')).toBeInTheDocument();
  });

  it('seharusnya memiliki displayName yang benar', () => {
    const Component = () => <div>Test Component</div>;
    const WrappedComponent = withErrorBoundary(Component);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });
});

describe('useErrorHandler hook', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

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

    fireEvent.click(screen.getByText('Throw Error'));

    // Check that error boundary caught the error
    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
  });
});

describe('ErrorBoundary Integration', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('seharusnya bekerja dengan nested components', () => {
    const NestedErrorComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Nested Error');
      }
      return (
        <div>
          <div>Parent Component</div>
          <ErrorBoundary>
            <ThrowErrorComponent shouldThrow={shouldThrow} />
          </ErrorBoundary>
        </div>
      );
    };

    const { rerender } = render(
      <ErrorBoundary>
        <NestedErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Parent Component')).toBeInTheDocument();
    expect(screen.getByText('Normal Component')).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <NestedErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Inner error boundary should catch the error
    expect(screen.getByText('Parent Component')).toBeInTheDocument();
    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
  });
});