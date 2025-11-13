import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';
import * as sentryService from '../services/sentryService';

// Mock Sentry service
jest.mock('../services/sentryService', () => ({
  captureErrorBoundary: jest.fn(),
}));

// Mock error logging service
jest.mock('../services/errorLoggingService', () => ({
  getErrorLoggingService: () => ({
    logErrorBoundary: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Test component that throws an error
const TestErrorComponent: React.FC = () => {
  throw new Error('Test error for Sentry integration');
};

// Test component that works fine
const TestNormalComponent: React.FC = () => {
  return <div>Normal Component</div>;
};

describe('Sentry Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should capture error in Sentry when ErrorBoundary catches an error', () => {
    // Mock console.error to avoid noisy output
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText } = render(
      <ErrorBoundary>
        <TestErrorComponent />
      </ErrorBoundary>
    );

    // Check that the error boundary fallback is rendered
    expect(getByText('Terjadi Kesalahan')).toBeInTheDocument();
    
    // Check that Sentry captureErrorBoundary was called
    expect(sentryService.captureErrorBoundary).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(String)
    );
    
    // Check that the error message is correct
    expect(sentryService.captureErrorBoundary).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error for Sentry integration'
      }),
      expect.any(String)
    );
  });

  it('should not call Sentry when no error occurs', () => {
    render(
      <ErrorBoundary>
        <TestNormalComponent />
      </ErrorBoundary>
    );

    // Check that the normal component is rendered
    expect(screen.getByText('Normal Component')).toBeInTheDocument();
    
    // Check that Sentry captureErrorBoundary was not called
    expect(sentryService.captureErrorBoundary).not.toHaveBeenCalled();
  });

  it('should allow user to reset the error boundary', () => {
    // Mock console.error to avoid noisy output
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText } = render(
      <ErrorBoundary>
        <TestErrorComponent />
      </ErrorBoundary>
    );

    // Check that the error boundary fallback is rendered
    expect(getByText('Terjadi Kesalahan')).toBeInTheDocument();

    // Click the "Coba Lagi" button
    const tryAgainButton = getByText('Coba Lagi');
    fireEvent.click(tryAgainButton);

    // Check that the error boundary has been reset and shows children again
    expect(getByText('Coba Lagi')).toBeInTheDocument();
  });
});