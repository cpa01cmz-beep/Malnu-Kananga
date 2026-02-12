// api/client.ts - Core API Client with Permission Validation

import type { UserRole, UserExtraRole } from '../../types';
import { logger } from '../../utils/logger';
import { permissionService } from '../permissionService';
import { isNetworkError } from '../../utils/networkStatus';
import { classifyError, logError } from '../../utils/errorHandler';
import { performanceMonitor } from '../performanceMonitor';
import { API_CONFIG, HTTP, ERROR_MESSAGES } from '../../constants';
import {
  getAuthToken,
  isTokenExpiringSoon,
  authAPI,
  parseJwtPayload,
} from './auth';
import { getIsRefreshing, setIsRefreshing, subscribeTokenRefresh, onTokenRefreshed } from './refreshState';
import { queueOfflineRequest } from './offline';

// Use centralized API config to avoid circular dependency and duplication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || API_CONFIG.DEFAULT_BASE_URL;

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
  try {
    const pathParts = endpoint.split('/').filter(Boolean);
    const resource = pathParts[0] || 'unknown';
    const method = options.method?.toUpperCase() || 'GET';

    const actionMap: Record<string, string> = {
      [HTTP.METHODS.GET]: 'read',
      [HTTP.METHODS.POST]: 'create',
      [HTTP.METHODS.PUT]: 'update',
      [HTTP.METHODS.PATCH]: 'update',
      [HTTP.METHODS.DELETE]: 'delete'
    };

    const action = actionMap[method] || 'read';
    const permissionId = `${resource}.${action}`;

    const result = permissionService.hasPermission(
      userRole as UserRole,
      userExtraRole as UserExtraRole,
      permissionId,
      {
        userId: API_CONFIG.REQUEST_USER_ID,
        ip: typeof window !== 'undefined' ? window.location.hostname : API_CONFIG.DEFAULT_IP_ADDRESS
      }
    );

    return {
      allowed: result.granted,
      reason: result.reason
    };
  } catch (error) {
    const classifiedError = classifyError(error, {
      operation: 'validateRequestPermissions',
      timestamp: Date.now()
    });
    logError(classifiedError);
    logger.error('Permission validation failed', { error, endpoint, userRole });
    return {
      allowed: false,
      reason: 'Permission validation error'
    };
  }
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
  
  const method = options.method?.toUpperCase() || HTTP.METHODS.GET;
  const writeMethods: string[] = [HTTP.METHODS.POST, HTTP.METHODS.PUT, HTTP.METHODS.DELETE, HTTP.METHODS.PATCH];
  const isWriteOperation = writeMethods.includes(method);
  
  if (!isOnline) {
    if (isWriteOperation && !skipQueue) {
      return queueOfflineRequest<T>(endpoint, options, token);
    }
    
    return {
      success: false,
      message: ERROR_MESSAGES.OFFLINE_ERROR,
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
            message: `${ERROR_MESSAGES.ACCESS_DENIED}: ${permissionCheck.reason || ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS}`,
            error: `${ERROR_MESSAGES.ACCESS_DENIED}: ${permissionCheck.reason || ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS}`
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
        'Content-Type': HTTP.HEADERS.CONTENT_TYPE_JSON,
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      } as HeadersInit,
    });

    const json = await response.json();

    performanceMonitor.recordResponse(endpoint, method, Date.now() - startReqTime, response.status);

    if (response.status === HTTP.STATUS_CODES.UNAUTHORIZED && !getIsRefreshing() && getAuthToken()) {
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

    if (response.status === HTTP.STATUS_CODES.FORBIDDEN) {
      const classifiedError = classifyError(new Error(ERROR_MESSAGES.FORBIDDEN_ACCESS), {
        operation: `API ${method} ${endpoint}`,
        timestamp: Date.now()
      });
      logError(classifiedError);
      throw classifiedError;
    }

    if (response.status === HTTP.STATUS_CODES.UNPROCESSABLE_ENTITY) {
      const classifiedError = classifyError(new Error(ERROR_MESSAGES.VALIDATION_ERROR), {
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
