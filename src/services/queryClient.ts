// QueryClient Configuration untuk MA Malnu Kananga
// Implementasi React Query dengan exponential backoff dan jitter

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Exponential backoff dengan jitter untuk retry mechanism
const exponentialBackoffWithJitter = (attemptIndex: number): number => {
  // Base delay: 1000ms (1 detik)
  const baseDelay = 1000;

  // Exponential backoff: 2^attemptIndex
  const exponentialDelay = baseDelay * Math.pow(2, attemptIndex);

  // Jitter: tambahkan random factor antara 0.5x sampai 1.5x
  const jitterFactor = 0.5 + Math.random();

  // Max delay: 30 detik
  const maxDelay = 30000;

  return Math.min(exponentialDelay * jitterFactor, maxDelay);
};

// Default query options dengan optimasi caching
const queryDefaults: DefaultOptions = {
  queries: {
    // Cache time: data tetap di cache selama 5 menit
    gcTime: 5 * 60 * 1000, // 5 menit (sebelumnya cacheTime)

    // Stale time: data dianggap fresh selama 2 menit
    staleTime: 2 * 60 * 1000, // 2 menit

    // Retry configuration dengan exponential backoff
    retry: (failureCount, error: any) => {
      // Jangan retry untuk error 4xx (kecuali 408, 429)
      if (error?.status >= 400 && error?.status < 500) {
        if (error.status === 408 || error.status === 429) {
          return failureCount < 3;
        }
        return false;
      }

      // Retry untuk error 5xx dan network errors (maksimal 3 kali)
      return failureCount < 3;
    },

    // Retry delay dengan exponential backoff dan jitter
    retryDelay: exponentialBackoffWithJitter,

    // Request deduplication: mencegah duplicate concurrent requests
    // React Query secara otomatis melakukan ini, tapi kita bisa customize

    // Refetch configuration
    refetchOnWindowFocus: false, // Jangan refetch saat window focus untuk performa
    refetchOnReconnect: true,    // Refetch saat reconnect network
    refetchOnMount: true,        // Selalu refetch saat component mount jika stale

    // Network mode
    networkMode: 'online', // Hanya jalankan queries saat online
  },

  mutations: {
    // Retry untuk mutations (hanya untuk network errors)
    retry: (failureCount, error: any) => {
      // Hanya retry untuk network errors, bukan untuk error response
      if (error?.status >= 400) {
        return false;
      }
      return failureCount < 2;
    },

    retryDelay: exponentialBackoffWithJitter,
    networkMode: 'online',
  },
};

// Create QueryClient dengan konfigurasi optimal
export const queryClient = new QueryClient({
  defaultOptions: {
    ...queryDefaults,
    queries: {
      ...queryDefaults.queries,
      // Placeholder data untuk better UX
      placeholderData: (previousData: any) => previousData,
    },
  },
});

// Query keys factory untuk konsistensi
export const queryKeys = {
  // Student queries
  students: ['students'] as const,
  studentProfile: (id?: string) => ['students', 'profile', id] as const,
  studentGrades: (studentId?: string, semester?: number) =>
    ['students', 'grades', studentId, semester] as const,
  studentAttendance: (studentId?: string, month?: number, year?: number) =>
    ['students', 'attendance', studentId, month, year] as const,
  studentSchedule: (studentId?: string, day?: string) =>
    ['students', 'schedule', studentId, day] as const,
  studentStats: (studentId?: string, semester?: number) =>
    ['students', 'stats', studentId, semester] as const,
  studentAnnouncements: (studentId?: string, unreadOnly?: boolean) =>
    ['students', 'announcements', studentId, unreadOnly] as const,
  studentProgressReport: (studentId?: string, semester?: number) =>
    ['students', 'progress-report', studentId, semester] as const,

  // Teacher/Admin queries
  teacherStudents: (classId: string) => ['teacher', 'students', classId] as const,
  teacherGrades: ['teacher', 'grades'] as const,
  teacherAttendance: ['teacher', 'attendance'] as const,

  // Content queries
  featuredPrograms: ['content', 'featured-programs'] as const,
  latestNews: ['content', 'latest-news'] as const,
  relatedLinks: ['content', 'related-links'] as const,

  // Search queries
  searchStudents: (query: string, classId?: string) =>
    ['search', 'students', query, classId] as const,

  // Health check
  apiHealth: ['api', 'health'] as const,
} as const;

// Utility functions untuk cache management
export const cacheUtils = {
  // Invalidate specific query
  invalidateQuery: (queryKey: readonly unknown[]) => {
    queryClient.invalidateQueries({ queryKey });
  },

  // Invalidate all queries dengan prefix tertentu
  invalidateQueries: (queryKey: readonly unknown[]) => {
    queryClient.invalidateQueries({ queryKey });
  },

  // Set data di cache
  setQueryData: <T>(queryKey: readonly unknown[], data: T) => {
    queryClient.setQueryData(queryKey, data);
  },

  // Get data dari cache
  getQueryData: <T>(queryKey: readonly unknown[]): T | undefined => {
    return queryClient.getQueryData(queryKey);
  },

  // Remove query dari cache
  removeQuery: (queryKey: readonly unknown[]) => {
    queryClient.removeQueries({ queryKey });
  },

  // Clear semua cache
  clearCache: () => {
    queryClient.clear();
  },

  // Prefetch query
  prefetchQuery: (options: any) => {
    return queryClient.prefetchQuery(options);
  },
};

export default queryClient;