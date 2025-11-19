import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

  it('should allow user to reset the error boundary', () => {
    const onError = jest.fn();
    
    const { rerender } = render(
      <ErrorBoundary onError={onError}>
        <TestErrorComponent />
      </ErrorBoundary>
    );

    // Check that the error boundary fallback is rendered
    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    
    // Click the "Coba Lagi" button to reset
    const tryAgainButton = screen.getByText('Coba Lagi');
    fireEvent.click(tryAgainButton);
    
    // Force a re-render by updating state to trigger reset
    act(() => {
      rerender(
        <ErrorBoundary onError={onError}>
          <TestValidComponent />
        </ErrorBoundary>
      );
    });
    
    // Check that the valid component is now rendered
    expect(screen.getByText('Valid Component')).toBeInTheDocument();
  });
});