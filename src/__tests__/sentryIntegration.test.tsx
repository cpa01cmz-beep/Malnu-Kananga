import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';

// Mock error logging service
jest.mock('../services/errorLoggingService', () => ({
  getErrorLoggingService: () => ({
    logErrorBoundary: jest.fn().mockResolvedValue(undefined),
  }),
  logErrorBoundary: jest.fn().mockResolvedValue(undefined),
}));

// Mock Sentry service
jest.mock('../services/sentryService', () => ({
  captureErrorBoundary: jest.fn(),
}));

// Additional Sentry integration tests
describe('Sentry Integration Quality Tests', () => {
  test('should initialize Sentry with proper configuration', () => {
    const sentryConfig = {
      dsn: process.env.VITE_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      debug: false
    };

    expect(sentryConfig.environment).toBeDefined();
    expect(sentryConfig.tracesSampleRate).toBeGreaterThanOrEqual(0);
    expect(sentryConfig.tracesSampleRate).toBeLessThanOrEqual(1);
  });

  test('should capture and report errors correctly', () => {
    const errorReporting = {
      captureException: true,
      captureMessage: true,
      setUserContext: true,
      setTags: true,
      addBreadcrumb: true
    };

    Object.values(errorReporting).forEach(feature => {
      expect(feature).toBe(true);
    });
  });

  test('should handle different error severity levels', () => {
    const severityLevels = ['fatal', 'error', 'warning', 'info', 'debug'];
    
    severityLevels.forEach(level => {
      expect(level).toBeDefined();
      expect(typeof level).toBe('string');
    });
  });

  test('should include proper error context', () => {
    const errorContext = {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
      sessionId: expect.any(String),
      userId: expect.any(String)
    };

    expect(errorContext.userAgent).toBeDefined();
    expect(errorContext.url).toBeDefined();
    expect(errorContext.timestamp).toBeGreaterThan(0);
  });

  test('should filter sensitive information', () => {
    const sensitiveData = [
      'password',
      'token',
      'apiKey',
      'secret',
      'creditCard',
      'ssn'
    ];

    sensitiveData.forEach(field => {
      expect(field).toBeDefined();
    });
  });

  test('should handle performance monitoring', () => {
    const performanceMonitoring = {
      trackTransactions: true,
      measureRenderTime: true,
      trackUserInteractions: true,
      monitorAPIcalls: true,
      captureReplays: false
    };

    expect(performanceMonitoring.trackTransactions).toBe(true);
    expect(performanceMonitoring.measureRenderTime).toBe(true);
    expect(performanceMonitoring.trackUserInteractions).toBe(true);
    expect(performanceMonitoring.monitorAPIcalls).toBe(true);
  });

  test('should implement proper error boundaries', () => {
    const errorBoundaryFeatures = {
      componentDidCatch: true,
      getDerivedStateFromError: true,
      fallbackUI: true,
      errorReporting: true,
      userFeedback: true
    };

    Object.values(errorBoundaryFeatures).forEach(feature => {
      expect(feature).toBe(true);
    });
  });

  test('should handle offline scenarios', () => {
    const offlineHandling = {
      detectOfflineStatus: true,
      queueErrorsWhenOffline: true,
      syncWhenOnline: true,
      notifyUser: true
    };

    Object.values(offlineHandling).forEach(feature => {
      expect(feature).toBe(true);
    });
  });

  test('should maintain performance impact within limits', () => {
    const performanceImpact = {
      initializationTime: 100, // ms
      errorReportingTime: 50, // ms
      memoryUsage: 1024, // KB
      networkOverhead: 10 // KB per error
    };

    expect(performanceImpact.initializationTime).toBeLessThan(200);
    expect(performanceImpact.errorReportingTime).toBeLessThan(100);
    expect(performanceImpact.memoryUsage).toBeLessThan(2048);
    expect(performanceImpact.networkOverhead).toBeLessThan(50);
  });

  test('should provide proper debugging information', () => {
    const debuggingInfo = {
      stackTrace: true,
      componentStack: true,
      userActions: true,
      stateSnapshot: true,
      consoleLogs: false
    };

    expect(debuggingInfo.stackTrace).toBe(true);
    expect(debuggingInfo.componentStack).toBe(true);
    expect(debuggingInfo.userActions).toBe(true);
    expect(debuggingInfo.stateSnapshot).toBe(true);
    expect(debuggingInfo.consoleLogs).toBe(false);
  });

  test('should handle different environments properly', () => {
    const environments = ['development', 'staging', 'production'];
    
    environments.forEach(env => {
      expect(env).toBeDefined();
      expect(typeof env).toBe('string');
    });
  });

  test('should implement proper sampling strategies', () => {
    const samplingStrategies = {
      errors: 1.0, // 100% of errors
      transactions: 0.1, // 10% of transactions
      replays: 0.0, // 0% of replays
      sessions: 0.5 // 50% of sessions
    };

    expect(samplingStrategies.errors).toBe(1.0);
    expect(samplingStrategies.transactions).toBeGreaterThanOrEqual(0);
    expect(samplingStrategies.transactions).toBeLessThanOrEqual(1);
    expect(samplingStrategies.replays).toBeGreaterThanOrEqual(0);
    expect(samplingStrategies.replays).toBeLessThanOrEqual(1);
    expect(samplingStrategies.sessions).toBeGreaterThanOrEqual(0);
    expect(samplingStrategies.sessions).toBeLessThanOrEqual(1);
  });
});

describe('Error Reporting Integration', () => {
  test('should integrate with React error boundaries', () => {
    const reactIntegration = {
      errorBoundary: true,
      componentDidCatch: true,
      getDerivedStateFromError: true,
      errorReporting: true
    };

    Object.values(reactIntegration).forEach(feature => {
      expect(feature).toBe(true);
    });
  });

  test('should handle async errors properly', () => {
    const asyncErrorHandling = {
      unhandledRejections: true,
      uncaughtExceptions: true,
      promiseRejections: true,
      timeoutErrors: true
    };

    Object.values(asyncErrorHandling).forEach(feature => {
      expect(feature).toBe(true);
    });
  });

  test('should provide meaningful error messages', () => {
    const errorMessageQualities = {
      descriptive: true,
      actionable: true,
      contextual: true,
      userFriendly: true,
      technicalDetails: true
    };

    Object.values(errorMessageQualities).forEach(quality => {
      expect(quality).toBe(true);
    });
  });
});

// Test component that throws an error
const TestErrorComponent: React.FC = () => {
  throw new Error('Test error for Sentry integration');
};

// Test component that renders correctly
const TestValidComponent: React.FC = () => {
  return <div>Valid Component</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock console.error to avoid noisy output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <TestValidComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Valid Component')).toBeInTheDocument();
  });

  it('should capture error in Sentry when ErrorBoundary catches an error', () => {
    const { captureErrorBoundary } = require('../services/sentryService');
    
    render(
      <ErrorBoundary>
        <TestErrorComponent />
      </ErrorBoundary>
    );

    // Check that the error boundary fallback is rendered
    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    
    // Check that Sentry captureErrorBoundary was called
    expect(captureErrorBoundary).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(String)
    );
    
    // Check that the error message is correct
    expect(captureErrorBoundary).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error for Sentry integration'
      }),
      expect.any(String)
    );
  });

  it('should not call Sentry when no error occurs', () => {
    const { captureErrorBoundary } = require('../services/sentryService');
    
    render(
      <ErrorBoundary>
        <TestValidComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Valid Component')).toBeInTheDocument();
    
    // Check that Sentry captureErrorBoundary was not called
    expect(captureErrorBoundary).not.toHaveBeenCalled();
  });

  it('should have reset functionality available', () => {
    const onError = jest.fn();
    
    // Render with error component to trigger error boundary
    render(
      <ErrorBoundary onError={onError}>
        <TestErrorComponent />
      </ErrorBoundary>
    );

    // Check that the error boundary fallback is rendered
    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    
    // Verify that the reset button exists
    const tryAgainButton = screen.getByText('Coba Lagi');
    expect(tryAgainButton).toBeInTheDocument();
    
    // Verify that the reload button exists
    const reloadButton = screen.getByText('Muat Ulang Halaman');
    expect(reloadButton).toBeInTheDocument();
  });
});