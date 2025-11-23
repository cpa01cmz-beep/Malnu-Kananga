import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary Integration', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('catches errors in child components', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test('logs error details', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error',
      })
    );
  });

  test('provides error recovery mechanism', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    rerender(
      <ErrorBoundary>
        <div>Recovered Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Recovered Content')).toBeInTheDocument();
  });
});