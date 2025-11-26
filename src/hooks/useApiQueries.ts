// Custom React Query hooks untuk API services
// Implementasi dengan caching, retry logic, dan request deduplication

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import {
  studentApiService,
  contentApiService,
  Student,
  Grade,
  AttendanceRecord,
  ScheduleItem,
  AcademicStats,
  FeaturedProgram,
  NewsItem,
  RelatedLink,
  ApiResponse,
  ApiError
} from '../services/api';
import { queryKeys } from '../services/queryClient';

// Types untuk API responses
type ApiData<T> = T | null;
type ApiErrorType = ApiError | null;

// Utility function untuk handle API responses
const handleApiResponse = <T>(response: ApiResponse<T>): T | null => {
  if (response.success && response.data !== undefined) {
    return response.data;
  }
  return null;
};

// ==================== STUDENT API HOOKS ====================

// Get current student profile
export const useCurrentStudent = (
  options?: Omit<UseQueryOptions<Student | null, Error, Student | null, readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Student | null>({
    queryKey: queryKeys.studentProfile(),
    queryFn: async (): Promise<Student | null> => {
      const response = await studentApiService.getCurrentStudent();
      return handleApiResponse(response);
    },
    ...options,
  });
};

// Alias for useCurrentStudent for consistency
export const useStudentProfile = useCurrentStudent;

// Get student grades dengan filtering
export const useStudentGrades = (
  studentId?: string,
  semester?: number,
  academicYear?: string,
  options?: Omit<UseQueryOptions<Grade[], Error, Grade[], readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.studentGrades(studentId, semester),
    queryFn: async () => {
      const response = await studentApiService.getStudentGrades(studentId, semester, academicYear);
      return handleApiResponse(response) || [];
    },
    enabled: !!studentId,
    ...options,
  });
};

// Get attendance records dengan filtering
export const useAttendanceRecords = (
  studentId?: string,
  month?: number,
  year?: number,
  options?: Omit<UseQueryOptions<AttendanceRecord[], Error, AttendanceRecord[], readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.studentAttendance(studentId, month, year),
    queryFn: async () => {
      const response = await studentApiService.getAttendanceRecords(studentId, month, year);
      return handleApiResponse(response) || [];
    },
    enabled: !!studentId,
    ...options,
  });
};

// Get class schedule
export const useClassSchedule = (
  studentId?: string,
  day?: string,
  options?: Omit<UseQueryOptions<ScheduleItem[], Error, ScheduleItem[], readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.studentSchedule(studentId, day),
    queryFn: async () => {
      const response = await studentApiService.getClassSchedule(studentId, day);
      return handleApiResponse(response) || [];
    },
    ...options,
  });
};

// Get academic statistics
export const useAcademicStats = (
  studentId?: string,
  semester?: number,
  options?: Omit<UseQueryOptions<AcademicStats | null, Error, AcademicStats | null, readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.studentStats(studentId, semester),
    queryFn: async () => {
      const response = await studentApiService.getAcademicStats(studentId, semester);
      return handleApiResponse(response);
    },
    enabled: !!studentId,
    ...options,
  });
};

// Get student announcements
export const useStudentAnnouncements = (
  studentId?: string,
  unreadOnly: boolean = false,
  options?: Omit<UseQueryOptions<any[], Error, any[], readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.studentAnnouncements(studentId, unreadOnly),
    queryFn: async () => {
      const response = await studentApiService.getAnnouncements(studentId, unreadOnly);
      return handleApiResponse(response) || [];
    },
    enabled: !!studentId,
    ...options,
  });
};

// Get progress report
export const useProgressReport = (
  studentId?: string,
  semester?: number,
  options?: Omit<UseQueryOptions<any | null, Error, any | null, readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.studentProgressReport(studentId, semester),
    queryFn: async () => {
      const response = await studentApiService.getProgressReport(studentId, semester);
      return handleApiResponse(response);
    },
    enabled: !!studentId,
    ...options,
  });
};

// Search students (untuk admin/teacher)
export const useSearchStudents = (
  query: string,
  classId?: string,
  options?: Omit<UseQueryOptions<Student[], Error, Student[], readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.searchStudents(query, classId),
    queryFn: async () => {
      const response = await studentApiService.searchStudents(query, classId);
      return handleApiResponse(response) || [];
    },
    enabled: query.length > 2, // Only search after 3 characters
    staleTime: 30 * 1000, // 30 seconds - search results can be stale
    ...options,
  });
};

// Get students by class (untuk teacher)
export const useStudentsByClass = (
  classId: string,
  options?: Omit<UseQueryOptions<Student[], Error, Student[], readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.teacherStudents(classId),
    queryFn: async () => {
      const response = await studentApiService.getStudentsByClass(classId);
      return handleApiResponse(response) || [];
    },
    enabled: !!classId,
    ...options,
  });
};

// ==================== CONTENT API HOOKS ====================

// Get featured programs
export const useFeaturedPrograms = (
  options?: Omit<UseQueryOptions<FeaturedProgram[], Error, FeaturedProgram[], readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.featuredPrograms,
    queryFn: async () => {
      const response = await contentApiService.getFeaturedPrograms();
      return handleApiResponse(response) || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - featured programs don't change often
    ...options,
  });
};

// Get latest news
export const useLatestNews = (
  options?: Omit<UseQueryOptions<NewsItem[], Error, NewsItem[], readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.latestNews,
    queryFn: async () => {
      const response = await contentApiService.getLatestNews();
      return handleApiResponse(response) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - news can be updated more frequently
    ...options,
  });
};

// Get related links
export const useRelatedLinks = (
  options?: Omit<UseQueryOptions<RelatedLink[], Error, RelatedLink[], readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.relatedLinks,
    queryFn: async () => {
      const response = await contentApiService.getRelatedLinks();
      return handleApiResponse(response) || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - links don't change often
    ...options,
  });
};

// ==================== MUTATION HOOKS ====================

// Update student profile mutation
export const useUpdateStudentProfile = (
  options?: UseMutationOptions<Student, Error, Partial<Student>, unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Student>) => {
      const response = await studentApiService.updateProfile(updates);
      return handleApiResponse(response)!;
    },
    onSuccess: (data) => {
      // Update cache dengan data terbaru
      queryClient.setQueryData(queryKeys.studentProfile(), data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
    },
    ...options,
  });
};

// Submit grades mutation (untuk teacher)
export const useSubmitGrades = (
  options?: UseMutationOptions<Grade[], Error, Omit<Grade, 'id' | 'submittedAt'>[], unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (grades: Omit<Grade, 'id' | 'submittedAt'>[]) => {
      const response = await studentApiService.submitGrades(grades);
      return handleApiResponse(response)!;
    },
    onSuccess: () => {
      // Invalidate grade-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.teacherGrades });
      queryClient.invalidateQueries({ queryKey: ['students', 'grades'] });
    },
    ...options,
  });
};

// Record attendance mutation (untuk teacher)
export const useRecordAttendance = (
  options?: UseMutationOptions<AttendanceRecord[], Error, Omit<AttendanceRecord, 'id' | 'recordedAt'>[], unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendance: Omit<AttendanceRecord, 'id' | 'recordedAt'>[]) => {
      const response = await studentApiService.recordAttendance(attendance);
      return handleApiResponse(response)!;
    },
    onSuccess: () => {
      // Invalidate attendance-related queries
      queryClient.invalidateQueries({ queryKey: ['students', 'attendance'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.teacherAttendance });
    },
    ...options,
  });
};

// Mark announcement as read mutation
export const useMarkAnnouncementAsRead = (
  options?: UseMutationOptions<void, Error, string, unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId: string) => {
      const response = await studentApiService.markAnnouncementAsRead(announcementId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to mark announcement as read');
      }
    },
    onSuccess: (_, announcementId) => {
      // Invalidate announcement queries untuk refresh status
      queryClient.invalidateQueries({ queryKey: ['students', 'announcements'] });
    },
    ...options,
  });
};

// Hook untuk student profile
export const useStudentProfile = (studentId: string) => {
  return useQuery({
    queryKey: ['students', 'profile', studentId],
    queryFn: async () => {
      const response = await studentApiService.getStudentProfile(studentId);
      return handleApiResponse(response);
    },
    enabled: !!studentId,
    ...options as UseQueryOptions<Student>,
  });
};

export default {
  // Student hooks
  useCurrentStudent,
  useStudentGrades,
  useAttendanceRecords,
  useClassSchedule,
  useAcademicStats,
  useStudentAnnouncements,
  useProgressReport,
  useSearchStudents,
  useStudentsByClass,

  // Content hooks
  useFeaturedPrograms,
  useLatestNews,
  useRelatedLinks,

  // Mutation hooks
  useUpdateStudentProfile,
  useSubmitGrades,
  useRecordAttendance,
  useMarkAnnouncementAsRead,
};