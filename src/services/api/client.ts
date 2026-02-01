// api/client.ts - Core API Client with Permission Validation

import type { UserRole, UserExtraRole } from '../../types';
import { logger } from '../../utils/logger';
import { permissionService } from '../permissionService';
import { isNetworkError } from '../../utils/networkStatus';
import { classifyError, logError } from '../../utils/errorHandler';
import { performanceMonitor } from '../performanceMonitor';
import { API_BASE_URL as CONFIG_API_BASE_URL } from '../../config/constants';
import {
  getAuthToken,
  isTokenExpiringSoon,
  authAPI,
  parseJwtPayload,
} from './auth';
import { getIsRefreshing, setIsRefreshing, subscribeTokenRefresh, onTokenRefreshed } from './refreshState';
import { queueOfflineRequest } from './offline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || CONFIG_API_BASE_URL;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface RequestOptions extends RequestInit {
  skipQueue?: boolean;
}

interface RequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string | FormData;
}

interface HeadersInit {
  [key: string]: string;
}

// ============================================
// PERMISSION VALIDATION
// ============================================

async function validateRequestPermissions(
  endpoint: string,
  options: RequestInit,
  userRole: string,
  userExtraRole: string | null
): Promise<{ allowed: boolean; reason?: string }> {
  const pathParts = endpoint.split('/').filter(Boolean);
  const resource = pathParts[0] || 'unknown';
  const method = options.method?.toUpperCase() || 'GET';
  
  const actionMap: Record<string, string> = {
    'GET': 'read',
    'POST': 'create',
    'PUT': 'update',
    'PATCH': 'update',
    'DELETE': 'delete'
  };
  
  const action = actionMap[method] || 'read';
  const permissionId = `${resource}.${action}`;
  
  const result = permissionService.hasPermission(
    userRole as UserRole,
    userExtraRole as UserExtraRole,
    permissionId,
    {
      userId: 'api-request',
      ip: typeof window !== 'undefined' ? window.location.hostname : 'server'
    }
  );
  
  return {
    allowed: result.granted,
    reason: result.reason
  };
}

// ============================================
// CORE REQUEST FUNCTION
// ============================================

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  let token = getAuthToken();

  if (token && isTokenExpiringSoon(token)) {
    if (!getIsRefreshing()) {
      setIsRefreshing(true);
      try {
        await authAPI.refreshToken();
        token = getAuthToken();
        onTokenRefreshed(token);
      } finally {
        setIsRefreshing(false);
      }
    } else {
      token = await new Promise((resolve) => {
        subscribeTokenRefresh((newToken: string) => resolve(newToken));
      });
    }
  }

  const skipQueue = options.skipQueue || false;
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  
  const method = options.method?.toUpperCase() || 'GET';
  const isWriteOperation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  
  if (!isOnline) {
    if (isWriteOperation && !skipQueue) {
      return queueOfflineRequest<T>(endpoint, options, token);
    }
    
    return {
      success: false,
      message: 'Anda sedang offline. Pastikan koneksi internet Anda aktif untuk melanjutkan.',
      error: 'OFFLINE_ERROR'
    };
  }

  if (token) {
    const payload = parseJwtPayload(token);
    if (payload) {
      try {
        const permissionCheck = await validateRequestPermissions(
          endpoint,
          options,
          payload.role,
          payload.extra_role || null
        );
        
        if (!permissionCheck.allowed) {
          return {
            success: false,
            message: 'Access denied: ' + (permissionCheck.reason || 'Insufficient permissions'),
            error: 'Access denied: ' + (permissionCheck.reason || 'Insufficient permissions')
          };
        }
      } catch (error) {
        logger.warn('Permission validation failed:', { error, endpoint, userRole: payload.role });
      }
    }
  }

  const startReqTime = typeof window !== 'undefined' && window.performance ? window.performance.now() : Date.now();

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      } as HeadersInit,
    });

    const json = await response.json();

    performanceMonitor.recordResponse(endpoint, method, Date.now() - startReqTime, response.status);

    if (response.status === 401 && !getIsRefreshing() && getAuthToken()) {
      if (!getIsRefreshing()) {
        setIsRefreshing(true);
        try {
          const refreshSuccess = await authAPI.refreshToken();
          if (refreshSuccess) {
            return request(endpoint, options);
          }
        } finally {
          setIsRefreshing(false);
        }
      }
    }

    if (response.status === 403) {
      const classifiedError = classifyError(new Error('Forbidden access'), {
        operation: `API ${method} ${endpoint}`,
        timestamp: Date.now()
      });
      logError(classifiedError);
      throw classifiedError;
    }

    if (response.status === 422) {
      const classifiedError = classifyError(new Error('Validation error'), {
        operation: `API ${method} ${endpoint}`,
        timestamp: Date.now()
      });
      logError(classifiedError);
      throw classifiedError;
    }

    return json;
  } catch (error) {
    performanceMonitor.recordResponse(endpoint, method, Date.now() - startReqTime, 0);

    if (isWriteOperation && !skipQueue && isNetworkError(error)) {
      logger.warn('Network error detected, queuing request for offline sync', {
        endpoint,
        method,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return queueOfflineRequest<T>(endpoint, options, token);
    }
    
    const classifiedError = classifyError(error, {
      operation: `API ${method} ${endpoint}`,
      timestamp: Date.now()
    });
    logError(classifiedError);
    throw classifiedError;
  }
}

declare global {
  interface Window {
    atob: (data: string) => string;
  }
}
