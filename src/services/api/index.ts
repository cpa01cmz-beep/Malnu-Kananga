// API Services Index untuk MA Malnu Kananga
// Centralized export untuk semua API services

export { default as BaseApiService, baseApiService } from './baseApiService';
export { default as StudentApiService, studentApiService } from './studentApiService';
export { default as ContentApiService, contentApiService } from './contentApiService';
export { FeaturedProgramsApiService as FeaturedProgramsService, FeaturedProgramsApiService as featuredProgramsService } from './featuredProgramsService';
export { NewsApiService as NewsService, NewsApiService as newsService } from './newsService';

// Re-export types untuk kemudahan penggunaan
export type {
  Student,
  Grade,
  AttendanceRecord,
  ScheduleItem,
  AcademicStats
} from './studentApiService';

export type {
  FeaturedProgram,
  NewsItem,
  RelatedLink
} from './contentApiService';

export type {
  FeaturedProgram as FeaturedProgramType
} from './featuredProgramsService';

export type {
  LatestNews as NewsItemType
} from './newsService';

// API Error types
export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
  details?: any;
}

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_WORKER_URL || 'https://malnu-api.sulhi-cmz.workers.dev',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Utility functions untuk API
export const createApiError = (message: string, statusCode?: number, code?: string): ApiError => ({
  message,
  statusCode,
  code,
});

export const isApiError = (error: any): error is ApiError => {
  return error && typeof error.message === 'string';
};

// API Health check utility
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

// API Status enum
export enum ApiStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

// Generic API hook type
export interface ApiHookState<T> {
  data: T | null;
  status: ApiStatus;
  error: ApiError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}