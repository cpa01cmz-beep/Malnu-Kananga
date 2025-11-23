import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApi } from '../useApi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useApi Hook', () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  test('handles successful API calls', async () => {
    const mockData = { id: 1, name: 'Test Data' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useApi('/test'), { wrapper });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('handles API errors gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' }),
    });

    const { result } = renderHook(() => useApi('/test'), { wrapper });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });

  test('shows loading state during API calls', async () => {
    global.fetch = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const { result } = renderHook(() => useApi('/test'), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(result.current.isLoading).toBe(false);
  });

  test('caches API responses', async () => {
    const mockData = { id: 1, name: 'Test Data' };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });
    global.fetch = fetchMock;

    const { result, rerender } = renderHook(() => useApi('/test'), { wrapper });

    await act(async () => {
      await result.current.refetch();
    });

    rerender();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockData);
  });

  test('handles network errors', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useApi('/test'), { wrapper });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });

  test('supports custom query options', async () => {
    const mockData = { id: 1, name: 'Test Data' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(
      () => useApi('/test', { enabled: false }),
      { wrapper }
    );

    expect(result.current.fetchStatus).toBe('idle');

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
  });
});