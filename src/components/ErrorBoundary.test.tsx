import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary, { withErrorBoundary, useErrorHandler } from './ErrorBoundary';

interface ErrorInfo {
  componentStack: string;
}

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

    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({
      componentStack: expect.any(String)
    }));
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
     const onErrorMock = jest.fn();

     const { rerender } = render(
       <ErrorBoundary onError={onErrorMock}>
         <ThrowErrorComponent shouldThrow={true} />
       </ErrorBoundary>
     );

     // Verify error state is shown
     expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
     expect(onErrorMock).toHaveBeenCalledTimes(1);

     // Click "Coba Lagi" button to reset the error boundary state
     fireEvent.click(screen.getByText('Coba Lagi'));

     // After reset, the error boundary should be in initial state
     // Rerender with a non-error component to see the normal content
     rerender(
       <ErrorBoundary onError={onErrorMock}>
         <ThrowErrorComponent shouldThrow={false} />
       </ErrorBoundary>
     );

     // Check that normal component is now rendered (not the error UI)
     expect(screen.getByText('Normal Component')).toBeInTheDocument();
   });

it('seharusnya me-reload halaman ketika tombol "Muat Ulang Halaman" diklik', () => {
     // Mock window.location.reload - handle location differently to avoid redefinition
     const reloadSpy = jest.fn();
     delete (window as any).location;
     Object.defineProperty(window, 'location', {
       value: {
         reload: reloadSpy,
         href: 'http://localhost',
         origin: 'http://localhost',
         assign: jest.fn()
       },
       writable: true,
       configurable: true
     });

    render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

fireEvent.click(screen.getByText('Muat Ulang Halaman'));

     expect(reloadSpy).toHaveBeenCalledTimes(1);
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
     const WrappedComponent = withErrorBoundary(ErrorComponent, <CustomFallback />);

     render(<WrappedComponent />);

     expect(screen.getByText('HOC Custom Fallback')).toBeInTheDocument();
   });

  it('seharusnya memiliki displayName yang benar', () => {
    const Component = () => <div>Test Component</div>;
    const WrappedComponent = withErrorBoundary(Component);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(Component)');
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
         // This will throw an error that should be caught by the ErrorBoundary
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

     // Initially, the button should be visible (no error yet)
     expect(screen.getByText('Throw Error')).toBeInTheDocument();

     // Click the button to trigger the error
     fireEvent.click(screen.getByText('Throw Error'));

     // Check that error boundary caught the error and shows the error UI
     // Use queryByText with wait to allow for re-rendering
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
     expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
     expect(screen.queryByText('Parent Component')).not.toBeInTheDocument();
  });
});