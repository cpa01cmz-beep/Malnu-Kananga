// Custom hook untuk API state management
// Menggantikan mock data dengan real API calls

import { useState, useEffect, useCallback } from 'react';
import { studentApiService, contentApiService, ApiResponse, ApiError, ApiStatus, ApiHookState } from '../services/api';

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = [],
  autoFetch: boolean = true
): ApiHookState<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<ApiStatus>(ApiStatus.IDLE);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    setStatus(ApiStatus.LOADING);
    setError(null);

    try {
      const response = await apiCall();

      if (response.success && response.data) {
        setData(response.data);
        setStatus(ApiStatus.SUCCESS);
      } else {
        setError({
          message: response.error || 'Unknown error occurred',
          statusCode: response.statusCode,
        });
        setStatus(ApiStatus.ERROR);
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Network error occurred',
      });
      setStatus(ApiStatus.ERROR);
    }
  }, [apiCall]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, dependencies);

  return {
    data,
    status,
    error,
    isLoading: status === ApiStatus.LOADING,
    isError: status === ApiStatus.ERROR,
    isSuccess: status === ApiStatus.SUCCESS,
  };
}

// Specific hooks untuk different data types
export function useStudentProfile() {
  return useApi(
    () => studentApiService.getCurrentStudent(),
    [],
    true
  );
}

export function useStudentGrades(studentId?: string, semester?: number) {
  return useApi(
    () => studentApiService.getStudentGrades(studentId, semester),
    [studentId, semester],
    true
  );
}

export function useAttendanceRecords(studentId?: string, month?: number, year?: number) {
  return useApi(
    () => studentApiService.getAttendanceRecords(studentId, month, year),
    [studentId, month, year],
    true
  );
}

export function useClassSchedule(studentId?: string, day?: string) {
  return useApi(
    () => studentApiService.getClassSchedule(studentId, day),
    [studentId, day],
    true
  );
}

export function useAcademicStats(studentId?: string, semester?: number) {
  return useApi(
    () => studentApiService.getAcademicStats(studentId, semester),
    [studentId, semester],
    true
  );
}

export function useFeaturedPrograms(category?: string) {
  return useApi(
    () => contentApiService.getFeaturedPrograms(category),
    [category],
    true
  );
}

export function useLatestNews(limit: number = 6, category?: string) {
  return useApi(
    () => contentApiService.getLatestNews(limit, category),
    [limit, category],
    true
  );
}

export function useRelatedLinks(category?: string) {
  return useApi(
    () => contentApiService.getRelatedLinks(category),
    [category],
    true
  );
}

// Hook untuk API mutations (POST, PUT, DELETE)
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  onSuccess?: (data: TData) => void,
  onError?: (error: ApiError) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await mutationFn(variables);

      if (response.success && response.data) {
        setData(response.data);
        onSuccess?.(response.data);
        return response.data;
      } else {
        const apiError: ApiError = {
          message: response.error || 'Mutation failed',
          statusCode: response.statusCode,
        };
        setError(apiError);
        onError?.(apiError);
        throw apiError;
      }
    } catch (err) {
      const apiError: ApiError = {
        message: err instanceof Error ? err.message : 'Network error occurred',
      };
      setError(apiError);
      onError?.(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, onSuccess, onError]);

  return {
    mutate,
    isLoading,
    error,
    data,
  };
}

// Hook untuk form submissions dengan API
export function useFormSubmission<TData, TFormData>(
  submitFn: (data: TFormData) => Promise<ApiResponse<TData>>,
  onSuccess?: (data: TData) => void,
  onError?: (error: ApiError) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [submitData, setSubmitData] = useState<TData | null>(null);

  const handleSubmit = useCallback(async (formData: TFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await submitFn(formData);

      if (response.success && response.data) {
        setSubmitData(response.data);
        onSuccess?.(response.data);
        return response.data;
      } else {
        const apiError: ApiError = {
          message: response.error || 'Form submission failed',
          statusCode: response.statusCode,
        };
        setSubmitError(apiError);
        onError?.(apiError);
        throw apiError;
      }
    } catch (err) {
      const apiError: ApiError = {
        message: err instanceof Error ? err.message : 'Network error occurred',
      };
      setSubmitError(apiError);
      onError?.(apiError);
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, [submitFn, onSuccess, onError]);

  return {
    handleSubmit,
    isSubmitting,
    error: submitError,
    data: submitData,
  };
}