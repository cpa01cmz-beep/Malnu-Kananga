// Base API Service untuk MA Malnu Kananga
// Foundation untuk semua API calls dengan error handling dan retry logic

import { WORKER_URL } from '../../utils/envValidation';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
  timestamp: string;
}

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

class BaseApiService {
  private baseUrl: string;
  private defaultConfig: RequestConfig;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || `${WORKER_URL}`;
    this.defaultConfig = {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json',
      }
    };
  }

  // Generic fetch dengan retry logic
  private async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    config: RequestConfig = {}
  ): Promise<Response> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const retries = mergedConfig.retries || 3;
    const retryDelay = mergedConfig.retryDelay || 1000;

    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), mergedConfig.timeout);

        const response = await fetch(url, {
          ...options,
          headers: {
            ...mergedConfig.headers,
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response;

      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx) except 408, 429
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
            throw error;
          }
        }

        // Don't retry on abort errors
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }

        if (attempt < retries) {
          await this.delay(retryDelay * (attempt + 1));
        }
      }
    }

    throw lastError;
  }

  // Helper untuk delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generic GET request
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}${endpoint}`,
        { method: 'GET' },
        config
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('API GET request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}${endpoint}`,
        {
          method: 'POST',
          body: data ? JSON.stringify(data) : undefined,
        },
        config
      );

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.message || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: responseData,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('API POST request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}${endpoint}`,
        {
          method: 'PUT',
          body: data ? JSON.stringify(data) : undefined,
        },
        config
      );

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.message || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: responseData,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('API PUT request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Generic DELETE request
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}${endpoint}`,
        { method: 'DELETE' },
        config
      );

      if (!response.ok && response.status !== 204) {
        const data = await response.json();
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('API DELETE request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get base URL
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const baseApiService = new BaseApiService();
export default BaseApiService;