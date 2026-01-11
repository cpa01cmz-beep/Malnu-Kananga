import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../utils/logger';
import Card from './Card';
import Button from './Button';
import { ArrowPathIcon, AlertTriangleIcon } from '../icons/StatusIcons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    logger.error('Error Boundary caught an error:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys } = this.props;
    const { hasError: prevHasError } = this.state;
    const { hasError } = this.state;

    if (prevHasError && hasError && resetKeys) {
      const hasResetKeyChanged = prevProps.resetKeys?.some((key, index) => key !== resetKeys[index]);

      if (hasResetKeyChanged) {
        this.reset();
      }
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return fallback;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4" role="alert" aria-live="assertive">
        <Card
          variant="default"
          padding="lg"
          shadow="float"
          className="max-w-2xl w-full"
        >
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangleIcon className="h-10 w-10 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>

            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
              Terjadi Kesalahan
            </h1>

            <p className="text-base text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
              Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah menerima laporan
              mengenai masalah ini.
            </p>

            {error && (
              <details className="mb-8 text-left">
                <summary className="cursor-pointer text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                  Lihat detail error (untuk debugging)
                </summary>
                <div className="mt-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-x-auto">
                  <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                    {error.name}: {error.message}
                  </p>
                  {error.stack && (
                    <pre className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                onClick={this.handleReload}
                icon={<ArrowPathIcon aria-hidden="true" />}
                iconPosition="left"
                size="lg"
              >
                Reload Halaman
              </Button>
              <Button
                variant="secondary"
                onClick={this.reset}
                size="lg"
              >
                Coba Lagi
              </Button>
            </div>

            <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
              Jika masalah ini berlanjut, hubungi{' '}
              <a
                href="mailto:info@ma-malnukananga.sch.id"
                className="text-primary-600 dark:text-primary-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 rounded"
              >
                info@ma-malnukananga.sch.id
              </a>
            </p>
          </div>
        </Card>
      </div>
    );
  }
}

export default ErrorBoundary;
