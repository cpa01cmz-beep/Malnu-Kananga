import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApiQueries } from '../useApiQueries';

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

describe('useApiQueries Hook', () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  test('fetches featured programs', async () => {
    const mockPrograms = [
      { id: '1', title: 'Program 1', description: 'Description 1' },
      { id: '2', title: 'Program 2', description: 'Description 2' },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPrograms,
    });

    const { result } = renderHook(() => useApiQueries(), { wrapper });

    await act(async () => {
      await result.current.refetchFeaturedPrograms();
    });

    expect(result.current.featuredPrograms.data).toEqual(mockPrograms);
    expect(result.current.featuredPrograms.isLoading).toBe(false);
  });

  test('fetches latest news', async () => {
    const mockNews = [
      { id: '1', title: 'News 1', content: 'Content 1', date: '2023-11-01' },
      { id: '2', title: 'News 2', content: 'Content 2', date: '2023-11-02' },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockNews,
    });

    const { result } = renderHook(() => useApiQueries(), { wrapper });

    await act(async () => {
      await result.current.refetchLatestNews();
    });

    expect(result.current.latestNews.data).toEqual(mockNews);
    expect(result.current.latestNews.isLoading).toBe(false);
  });

  test('fetches announcements', async () => {
    const mockAnnouncements = [
      { id: '1', title: 'Announcement 1', content: 'Content 1' },
      { id: '2', title: 'Announcement 2', content: 'Content 2' },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAnnouncements,
    });

    const { result } = renderHook(() => useApiQueries(), { wrapper });

    await act(async () => {
      await result.current.refetchAnnouncements();
    });

    expect(result.current.announcements.data).toEqual(mockAnnouncements);
  });

  test('handles API errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' }),
    });

    const { result } = renderHook(() => useApiQueries(), { wrapper });

    await act(async () => {
      await result.current.refetchFeaturedPrograms();
    });

    expect(result.current.featuredPrograms.error).toBeTruthy();
    expect(result.current.featuredPrograms.isLoading).toBe(false);
  });

  test('caches responses appropriately', async () => {
    const mockData = [{ id: '1', title: 'Test' }];
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });
    global.fetch = fetchMock;

    const { result, rerender } = renderHook(() => useApiQueries(), { wrapper });

    await act(async () => {
      await result.current.refetchFeaturedPrograms();
    });

    rerender();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.featuredPrograms.data).toEqual(mockData);
  });

  test('refetches all data simultaneously', async () => {
    const mockData = [{ id: '1', title: 'Test' }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useApiQueries(), { wrapper });

    await act(async () => {
      await result.current.refetchAll();
    });

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(result.current.featuredPrograms.data).toEqual(mockData);
    expect(result.current.latestNews.data).toEqual(mockData);
    expect(result.current.announcements.data).toEqual(mockData);
  });

  test('handles loading states correctly', () => {
    global.fetch = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const { result } = renderHook(() => useApiQueries(), { wrapper });

    expect(result.current.featuredPrograms.isLoading).toBe(true);
    expect(result.current.latestNews.isLoading).toBe(true);
    expect(result.current.announcements.isLoading).toBe(true);
  });

  test('supports query invalidation', async () => {
    const mockData = [{ id: '1', title: 'Test' }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useApiQueries(), { wrapper });

    await act(async () => {
      await result.current.refetchFeaturedPrograms();
    });

    act(() => {
      result.current.invalidateFeaturedPrograms();
    });

    expect(result.current.featuredPrograms.isFetching).toBe(true);
  });

  test('handles network failures', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useApiQueries(), { wrapper });

    await act(async () => {
      await result.current.refetchFeaturedPrograms();
    });

    expect(result.current.featuredPrograms.error).toBeTruthy();
  });

  test('supports custom query options', async () => {
    const mockData = [{ id: '1', title: 'Test' }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(
      () => useApiQueries({ enabled: false }),
      { wrapper }
    );

    expect(result.current.featuredPrograms.fetchStatus).toBe('idle');

    act(() => {
      result.current.refetchFeaturedPrograms();
    });

    await waitFor(() => {
      expect(result.current.featuredPrograms.data).toEqual(mockData);
    });
  });
});