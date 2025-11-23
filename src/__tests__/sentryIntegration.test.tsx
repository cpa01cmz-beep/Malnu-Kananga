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