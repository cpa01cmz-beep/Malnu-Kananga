import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '../useErrorHandler';

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleError', () => {
    it('should handle network errors and return AppError', () => {
      const { result } = renderHook(() => useErrorHandler());

      let appError;
      act(() => {
        appError = result.current.handleError(
          new Error('Network request failed'),
          { operation: 'fetchData', component: 'TestComponent' }
        );
      });

      expect(appError).toBeDefined();
      expect(appError!.type).toBe('NETWORK_ERROR');
      expect(result.current.errorState.hasError).toBe(true);
      expect(result.current.errorState.feedback?.message).toBe('Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.');
    });

    it('should handle timeout errors', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(
          new Error('Request timed out'),
          { operation: 'fetchData', component: 'TestComponent' }
        );
      });

      expect(result.current.errorState.feedback?.message).toBe('Waktu habis saat memproses permintaan. Silakan coba lagi.');
    });

    it('should handle rate limit errors', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(
          new Error('429 Rate limit exceeded'),
          { operation: 'fetchData', component: 'TestComponent' }
        );
      });

      expect(result.current.errorState.feedback?.message).toBe('Terlalu banyak permintaan. Silakan tunggu sebentar sebelum mencoba lagi.');
    });

    it('should handle authentication errors', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(
          new Error('401 Unauthorized'),
          { operation: 'fetchData', component: 'TestComponent' }
        );
      });

      expect(result.current.errorState.feedback?.message).toBe('Konfigurasi API tidak valid. Hubungi administrator.');
    });

    it('should use fallback message when provided', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(
          new Error('Unknown error'),
          {
            operation: 'fetchData',
            component: 'TestComponent',
            fallbackMessage: 'Custom fallback message'
          }
        );
      });

      expect(result.current.errorState.feedback?.message).toBe('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.');
    });

    it('should use default message for unknown errors', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(
          new Error('Something went wrong'),
          { operation: 'fetchData', component: 'TestComponent' }
        );
      });

      expect(result.current.errorState.feedback?.message).toBe('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.');
    });

    it('should handle non-Error objects', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(
          'String error',
          { operation: 'fetchData', component: 'TestComponent' }
        );
      });

      expect(result.current.errorState.feedback?.message).toBe('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.');
    });
  });

  describe('handleAsyncError', () => {
    it('should return data when API call succeeds', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const mockData = { id: 1, name: 'Test' };

      const apiCall = vi.fn().mockResolvedValue(mockData);

      let response;
      await act(async () => {
        response = await result.current.handleAsyncError(
          apiCall,
          { operation: 'fetchData', component: 'TestComponent' }
        );
      });

      expect(response).toEqual(mockData);
      expect(result.current.errorState.hasError).toBe(false);
    });

    it('should handle API errors and return null', async () => {
      const { result } = renderHook(() => useErrorHandler());

      const apiCall = vi.fn().mockRejectedValue(new Error('Network failed'));

      let response;
      await act(async () => {
        response = await result.current.handleAsyncError(
          apiCall,
          { operation: 'fetchData', component: 'TestComponent' }
        );
      });

      expect(response).toBe(null);
      expect(result.current.errorState.hasError).toBe(true);
      expect(result.current.errorState.feedback?.message).toBe('Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.');
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(
          new Error('Test error'),
          { operation: 'test', component: 'Test' }
        );
      });

      expect(result.current.errorState.hasError).toBe(true);

      act(() => {
        result.current.clearError();
      });

      expect(result.current.errorState.hasError).toBe(false);
      expect(result.current.errorState.feedback).toBe(null);
    });
  });

  describe('retryWithAction', () => {
    it('should clear error and execute action', () => {
      const { result } = renderHook(() => useErrorHandler());
      const mockAction = vi.fn();

      act(() => {
        result.current.handleError(
          new Error('Test error'),
          { operation: 'test', component: 'Test' }
        );
      });

      expect(result.current.errorState.hasError).toBe(true);

      act(() => {
        result.current.retryWithAction(mockAction);
      });

      expect(result.current.errorState.hasError).toBe(false);
      expect(mockAction).toHaveBeenCalled();
    });
  });
});