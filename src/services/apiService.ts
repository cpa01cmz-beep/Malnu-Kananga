// apiService.ts - Frontend API Service
// Handles all backend API interactions

import type { User, PPDBRegistrant, InventoryItem, SchoolEvent, Subject, Class, Schedule, Grade, Attendance, ELibrary, Announcement, Student, Teacher, ParentChild, EventRegistration, EventBudget, EventPhoto, EventFeedback, ParentMeeting, ParentTeacher, ParentMessage, ParentPayment, UserRole, UserExtraRole } from '../types';
import { logger } from '../utils/logger';
import { permissionService } from './permissionService';
import { STORAGE_KEYS } from '../constants';
import { offlineActionQueueService } from './offlineActionQueueService';
import { isNetworkError } from '../utils/networkStatus';
import { 
  classifyError, 
  logError
} from '../utils/errorHandler';
import { performanceMonitor } from './performanceMonitor';

import { API_BASE_URL as CONFIG_API_BASE_URL } from '../config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || CONFIG_API_BASE_URL;

// ============================================
// TYPES
// ============================================

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthPayload {
  user_id: string;
  email: string;
  role: string;
  extra_role?: string | null;
  session_id: string;
  exp: number;
}

export interface RequestOptions extends RequestInit {
  skipQueue?: boolean; // Opt-out for real-time requirements
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get stored auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

// Set auth token
function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

// Get stored refresh token
function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

// Set refresh token
function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
}

// Clear auth tokens
function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

// Parse JWT token (without verification, for payload access only)
function parseJwtPayload(token: string): AuthPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      (typeof window !== 'undefined' ? window.atob(base64) : globalThis.Buffer.from(base64, 'base64').toString())
        .split('')
        .map((c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Check if token is expired
function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

// Check if token is about to expire (within 5 minutes)
function isTokenExpiringSoon(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;
  return (payload.exp - now) < fiveMinutes;
}

// Track ongoing refresh to prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Subscribe to token refresh
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Notify subscribers of new token
function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

// ============================================
// AUTHENTICATION API
// ============================================

export const authAPI = {
  // Login
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data: LoginResponse = await response.json();

    if (data.success && data.data?.token && data.data?.refreshToken) {
      setAuthToken(data.data.token);
      setRefreshToken(data.data.refreshToken);
    }

    return data;
  },

  // Logout
  async logout(): Promise<void> {
    const token = getAuthToken();
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (e) {
      logger.error('Logout error:', e);
    } finally {
      clearAuthToken();
    }
  },

  // Refresh access token
  async refreshToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',

        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        setAuthToken(data.data.token);
        onTokenRefreshed(data.data.token);
        return true;
      }

      return false;
    } catch (e) {
      logger.error('Refresh token error:', e);
      return false;
    }
  },

  // Get current user from token
  getCurrentUser(): User | null {
    const token = getAuthToken();
    if (!token || isTokenExpired(token)) return null;

    const payload = parseJwtPayload(token);
    if (!payload) return null;

    return {
      id: payload.user_id,
      name: '', // Not stored in JWT
      email: payload.email,
      role: payload.role as 'admin' | 'teacher' | 'student',
      status: 'active',
      extraRole: payload.extra_role as UserExtraRole || null,
    };
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    const token = getAuthToken();
    return token !== null && !isTokenExpired(token);
  },

  // Get auth token for API requests
  getAuthToken,

  // Get refresh token
  getRefreshToken,
};

// ============================================
// PERMISSION VALIDATION MIDDLEWARE
// ============================================

/**
 * Check server-side permissions before making API request
 */
async function validateRequestPermissions(
  endpoint: string,
  options: RequestInit,
  userRole: string,
  userExtraRole: string | null
): Promise<{ allowed: boolean; reason?: string }> {
  // Use statically imported permissionService
  
  // Extract resource and action from endpoint
  const pathParts = endpoint.split('/').filter(Boolean);
  const resource = pathParts[0] || 'unknown';
  const method = options.method?.toUpperCase() || 'GET';
  
  // Map HTTP methods to permission actions
  const actionMap: Record<string, string> = {
    'GET': 'read',
    'POST': 'create',
    'PUT': 'update',
    'PATCH': 'update',
    'DELETE': 'delete'
  };
  
  const action = actionMap[method] || 'read';
  const permissionId = `${resource}.${action}`;
  
  // Log the permission check for audit
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
// OFFLINE QUEUE HELPER FUNCTIONS
// ============================================

/**
 * Queue a request for offline execution
 */
async function queueOfflineRequest<T>(
  endpoint: string,
  options: RequestOptions,
  _token: string | null
): Promise<ApiResponse<T>> {
  const method = options.method?.toUpperCase() || 'GET';
  const isWriteOperation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  
  if (!isWriteOperation) {
    // Don't queue read operations - fail fast
    return {
      success: false,
      message: 'Network error: Unable to complete request offline',
      error: 'Network error: Unable to complete request offline'
    };
  }

  // Extract entity and action type from endpoint
  const entity = mapEndpointToEntityType(endpoint, method);
  const actionType = mapMethodToActionType(method);

  try {
    // Parse body for the data
    let data: unknown = null;
    if (options.body && typeof options.body === 'string') {
      try {
        data = JSON.parse(options.body);
      } catch {
        data = options.body;
      }
    }

    // Add to offline queue
    const actionId = offlineActionQueueService.addAction({
      type: actionType,
      entity,
      entityId: extractEntityId(data as Record<string, unknown>, endpoint),
      data,
      endpoint: `${API_BASE_URL}${endpoint}`,
      method: method as 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    });

    logger.info('Request queued for offline sync', {
      actionId,
      endpoint,
      method,
      entity,
      actionType
    });

    return {
      success: true,
      message: 'Action queued for offline sync',
      data: { actionId, queued: true } as T,
    };
  } catch (error) {
    logger.error('Failed to queue offline request', { error, endpoint, method });
    return {
      success: false,
      message: 'Failed to queue action for offline sync',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Map API endpoint to entity type for the offline queue
 */
function mapEndpointToEntityType(endpoint: string, _method: string): 'grade' | 'attendance' | 'assignment' | 'material' | 'announcement' | 'event' | 'ppdb' | 'inventory' | 'schedule' | 'meeting' | 'user' {
  
  // Map endpoints to entity types
  if (endpoint.includes('/grades') || endpoint.includes('/grade')) return 'grade';
  if (endpoint.includes('/attendance') || endpoint.includes('/attendances')) return 'attendance';
  if (endpoint.includes('/e_library') || endpoint.includes('/material')) return 'material';
  if (endpoint.includes('/announcements') || endpoint.includes('/announcement')) return 'announcement';
  if (endpoint.includes('/school_events') || endpoint.includes('/event')) return 'event';
  if (endpoint.includes('/ppdb_registrants') || endpoint.includes('/ppdb')) return 'ppdb';
  if (endpoint.includes('/inventory') || endpoint.includes('/item')) return 'inventory';
  if (endpoint.includes('/schedules') || endpoint.includes('/schedule')) return 'schedule';
  if (endpoint.includes('/meetings') || endpoint.includes('/meeting')) return 'meeting';
  if (endpoint.includes('/users') || endpoint.includes('/students') || endpoint.includes('/teachers') || endpoint.includes('/parents')) return 'user';
  
  // Default fallback based on method
  return 'material';
}

/**
 * Map HTTP method to action type for the offline queue
 */
function mapMethodToActionType(method: string): 'create' | 'update' | 'delete' | 'publish' | 'submit' | 'approve' | 'reject' {
  switch (method) {
    case 'POST': return 'create';
    case 'PUT': 
    case 'PATCH': return 'update';
    case 'DELETE': return 'delete';
    default: return 'create';
  }
}

/**
 * Extract entity ID from data or endpoint
 */
function extractEntityId(data: Record<string, unknown> | null, endpoint: string): string {
  if (data?.id) {
    return String(data.id);
  }
  
  // Try to extract from endpoint (e.g., /api/users/123)
  const matches = endpoint.match(/\/(\d+)[/]?"?$/);
  if (matches) {
    return matches[1];
  }
  
  return 'unknown';
}

// ============================================
// GENERIC API FUNCTIONS
// ============================================

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  let token = getAuthToken();

  if (token && isTokenExpiringSoon(token)) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        await authAPI.refreshToken();
        token = getAuthToken();
      } finally {
        isRefreshing = false;
      }
    } else {
      token = await new Promise((resolve) => {
        subscribeTokenRefresh((newToken: string) => resolve(newToken));
      });
    }
  }

  // Check if we should skip offline queue (for real-time requirements)
  const skipQueue = options.skipQueue || false;
  
  // Check if we're online
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  
  // For write operations (POST, PUT, DELETE, PATCH), use offline queue unless explicitly skipped
  const method = options.method?.toUpperCase() || 'GET';
  const isWriteOperation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  
  // Handle offline scenarios
  if (!isOnline) {
    if (isWriteOperation && !skipQueue) {
      // Queue for offline execution
      return queueOfflineRequest<T>(endpoint, options, token);
    }
    
    // For non-write operations or when skipQueue is true, fail gracefully
    return {
      success: false,
      message: 'Anda sedang offline. Pastikan koneksi internet Anda aktif untuk melanjutkan.',
      error: 'OFFLINE_ERROR'
    };
  }

  // Server-side permission validation
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
        // Continue with request but log the failure
      }
    }
  }

  // Start performance monitoring
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

    // Record performance metrics
    performanceMonitor.recordResponse(endpoint, method, Date.now() - startReqTime, response.status);

    if (response.status === 401 && !isRefreshing && getRefreshToken()) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshSuccess = await authAPI.refreshToken();
          if (refreshSuccess) {
            return request(endpoint, options);
          }
        } finally {
          isRefreshing = false;
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
    // Ensure performance monitoring is ended even on error
    performanceMonitor.recordResponse(endpoint, method, Date.now() - startReqTime, 0);

    // Auto-queue on network failure for write operations
    // Auto-queue on network failure for write operations
    if (isWriteOperation && !skipQueue && isNetworkError(error)) {
      logger.warn('Network error detected, queuing request for offline sync', {
        endpoint,
        method,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return queueOfflineRequest<T>(endpoint, options, token);
    }
    
    // Use standardized error handling
    const classifiedError = classifyError(error, {
      operation: `API ${method} ${endpoint}`,
      timestamp: Date.now()
    });
    logError(classifiedError);
    throw classifiedError;
  }
}

// Type declarations for Web API
declare global {
  interface Window {
    atob: (data: string) => string;
  }
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
// USERS API
// ============================================

export const usersAPI = {
  // Get all users
  async getAll(): Promise<ApiResponse<User[]>> {
    return request<User[]>('/api/users');
  },

  // Get user by ID
  async getById(id: string): Promise<ApiResponse<User>> {
    return request<User>(`/api/users/${id}`);
  },

  // Create user
  async create(user: Partial<User>): Promise<ApiResponse<User>> {
    return request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    } as RequestInit);
  },

  // Update user
  async update(id: string, user: Partial<User>): Promise<ApiResponse<User>> {
    return request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  // Delete user
  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// STUDENTS API
// ============================================

export const studentsAPI = {
  async getAll(): Promise<ApiResponse<Student[]>> {
    return request<Student[]>('/api/students');
  },

  async getById(id: string): Promise<ApiResponse<Student>> {
    return request<Student>(`/api/students/${id}`);
  },

  async getByClass(className: string): Promise<ApiResponse<Student[]>> {
    return request<Student[]>(`/api/students?class_name=${className}`);
  },

  async getByUserId(userId: string): Promise<ApiResponse<Student>> {
    return request<Student>(`/api/students?user_id=${userId}`);
  },

  async create(student: Partial<Student>): Promise<ApiResponse<Student>> {
    return request<Student>('/api/students', {
      method: 'POST',

      body: JSON.stringify(student),
    });
  },

  async update(id: string, student: Partial<Student>): Promise<ApiResponse<Student>> {
    return request<Student>(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(student),
    });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/students/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// TEACHERS API
// ============================================

export const teachersAPI = {
  async getAll(): Promise<ApiResponse<Teacher[]>> {
    return request<Teacher[]>('/api/teachers');
  },

  async getById(id: string): Promise<ApiResponse<Teacher>> {
    return request<Teacher>(`/api/teachers/${id}`);
  },

  async create(teacher: Partial<Teacher>): Promise<ApiResponse<Teacher>> {
    return request<Teacher>('/api/teachers', {
      method: 'POST',

      body: JSON.stringify(teacher),
    });
  },

  async update(id: string, teacher: Partial<Teacher>): Promise<ApiResponse<Teacher>> {
    return request<Teacher>(`/api/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacher),
    });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/teachers/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// PPDB REGISTRANTS API
// ============================================

export const ppdbAPI = {
  // Get all registrants
  async getAll(): Promise<ApiResponse<PPDBRegistrant[]>> {
    return request<PPDBRegistrant[]>('/api/ppdb_registrants');
  },

  // Get registrant by ID
  async getById(id: string): Promise<ApiResponse<PPDBRegistrant>> {
    return request<PPDBRegistrant>(`/api/ppdb_registrants/${id}`);
  },

  // Create new registration
  async create(registrant: Partial<PPDBRegistrant>): Promise<ApiResponse<PPDBRegistrant>> {
    return request<PPDBRegistrant>('/api/ppdb_registrants', {
      method: 'POST',

      body: JSON.stringify(registrant),
    });
  },

  // Update registrant status
  async updateStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    notes?: string
  ): Promise<ApiResponse<PPDBRegistrant>> {
    return request<PPDBRegistrant>(`/api/ppdb_registrants/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...(notes && { notes }) }),
    });
  },

  // Delete registrant
  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/ppdb_registrants/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// INVENTORY API
// ============================================

export const inventoryAPI = {
  // Get all inventory items
  async getAll(): Promise<ApiResponse<InventoryItem[]>> {
    return request<InventoryItem[]>('/api/inventory');
  },

  // Get item by ID
  async getById(id: string): Promise<ApiResponse<InventoryItem>> {
    return request<InventoryItem>(`/api/inventory/${id}`);
  },

  // Create new inventory item
  async create(item: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    return request<InventoryItem>('/api/inventory', {
      method: 'POST',

      body: JSON.stringify(item),
    });
  },

  // Update inventory item
  async update(id: string, item: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    return request<InventoryItem>(`/api/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  // Delete inventory item
  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/inventory/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// SCHOOL EVENTS API
// ============================================

export const eventsAPI = {
  // Get all events
  async getAll(): Promise<ApiResponse<SchoolEvent[]>> {
    return request<SchoolEvent[]>('/api/school_events');
  },

  // Get event by ID
  async getById(id: string): Promise<ApiResponse<SchoolEvent>> {
    return request<SchoolEvent>(`/api/school_events/${id}`);
  },

  // Create new event
  async create(event: Partial<SchoolEvent>): Promise<ApiResponse<SchoolEvent>> {
    return request<SchoolEvent>('/api/school_events', {
      method: 'POST',

      body: JSON.stringify(event),
    });
  },

  // Update event
  async update(id: string, event: Partial<SchoolEvent>): Promise<ApiResponse<SchoolEvent>> {
    return request<SchoolEvent>(`/api/school_events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  },

  // Update event status
  async updateStatus(
    id: string,
    status: 'Upcoming' | 'Ongoing' | 'Completed'
  ): Promise<ApiResponse<SchoolEvent>> {
    return request<SchoolEvent>(`/api/school_events/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Delete event
  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/school_events/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// EVENT REGISTRATIONS API
// ============================================

export const eventRegistrationsAPI = {
  async getAll(): Promise<ApiResponse<EventRegistration[]>> {
    return request<EventRegistration[]>('/api/event_registrations');
  },

  async getByEventId(eventId: string): Promise<ApiResponse<EventRegistration[]>> {
    return request<EventRegistration[]>(`/api/event_registrations?event_id=${eventId}`);
  },

  async create(registration: Partial<EventRegistration>): Promise<ApiResponse<EventRegistration>> {
    return request<EventRegistration>('/api/event_registrations', {
      method: 'POST',
      body: JSON.stringify(registration),
    });
  },

  async updateAttendance(
    id: string,
    status: 'registered' | 'attended' | 'absent',
    notes?: string
  ): Promise<ApiResponse<EventRegistration>> {
    return request<EventRegistration>(`/api/event_registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ attendance_status: status, notes }),
    });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/event_registrations/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// EVENT BUDGETS API
// ============================================

export const eventBudgetsAPI = {
  async getAll(): Promise<ApiResponse<EventBudget[]>> {
    return request<EventBudget[]>('/api/event_budgets');
  },

  async getByEventId(eventId: string): Promise<ApiResponse<EventBudget[]>> {
    return request<EventBudget[]>(`/api/event_budgets?event_id=${eventId}`);
  },

  async create(budget: Partial<EventBudget>): Promise<ApiResponse<EventBudget>> {
    return request<EventBudget>('/api/event_budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    });
  },

  async update(id: string, budget: Partial<EventBudget>): Promise<ApiResponse<EventBudget>> {
    return request<EventBudget>(`/api/event_budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budget),
    });
  },

  async approve(id: string): Promise<ApiResponse<EventBudget>> {
    return request<EventBudget>(`/api/event_budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'approved' }),
    });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/event_budgets/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// EVENT PHOTOS API
// ============================================

export const eventPhotosAPI = {
  async getAll(): Promise<ApiResponse<EventPhoto[]>> {
    return request<EventPhoto[]>('/api/event_photos');
  },

  async getByEventId(eventId: string): Promise<ApiResponse<EventPhoto[]>> {
    return request<EventPhoto[]>(`/api/event_photos?event_id=${eventId}`);
  },

  async create(photo: Partial<EventPhoto>): Promise<ApiResponse<EventPhoto>> {
    return request<EventPhoto>('/api/event_photos', {
      method: 'POST',
      body: JSON.stringify(photo),
    });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/event_photos/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// EVENT FEEDBACK API
// ============================================

export const eventFeedbackAPI = {
  async getAll(): Promise<ApiResponse<EventFeedback[]>> {
    return request<EventFeedback[]>('/api/event_feedback');
  },

  async getByEventId(eventId: string): Promise<ApiResponse<EventFeedback[]>> {
    return request<EventFeedback[]>(`/api/event_feedback?event_id=${eventId}`);
  },

  async create(feedback: Partial<EventFeedback>): Promise<ApiResponse<EventFeedback>> {
    return request<EventFeedback>('/api/event_feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/event_feedback/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// CHAT / RAG API
// ============================================

export const chatAPI = {
  // Get RAG context for chat
  async getContext(message: string): Promise<{ context: string }> {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    return response.json();
  },
};

// ============================================
// SUBJECTS API
// ============================================

export const subjectsAPI = {
  async getAll(): Promise<ApiResponse<Subject[]>> {
    return request<Subject[]>('/api/subjects');
  },

  async getById(id: string): Promise<ApiResponse<Subject>> {
    return request<Subject>(`/api/subjects/${id}`);
  },

  async create(subject: Partial<Subject>): Promise<ApiResponse<Subject>> {
    return request<Subject>('/api/subjects', {
      method: 'POST',

      body: JSON.stringify(subject),
    });
  },

  async update(id: string, subject: Partial<Subject>): Promise<ApiResponse<Subject>> {
    return request<Subject>(`/api/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subject),
    });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/subjects/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// CLASSES API
// ============================================

export const classesAPI = {
  async getAll(): Promise<ApiResponse<Class[]>> {
    return request<Class[]>('/api/classes');
  },

  async getById(id: string): Promise<ApiResponse<Class>> {
    return request<Class>(`/api/classes/${id}`);
  },

  async create(classData: Partial<Class>): Promise<ApiResponse<Class>> {
    return request<Class>('/api/classes', {
      method: 'POST',

      body: JSON.stringify(classData),
    });
  },

  async update(id: string, classData: Partial<Class>): Promise<ApiResponse<Class>> {
    return request<Class>(`/api/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/classes/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// SCHEDULES API
// ============================================

export const schedulesAPI = {
  async getAll(): Promise<ApiResponse<Schedule[]>> {
    return request<Schedule[]>('/api/schedules');
  },

  async getById(id: string): Promise<ApiResponse<Schedule>> {
    return request<Schedule>(`/api/schedules/${id}`);
  },

  async create(schedule: Partial<Schedule>): Promise<ApiResponse<Schedule>> {
    return request<Schedule>('/api/schedules', {
      method: 'POST',

      body: JSON.stringify(schedule),
    });
  },

  async update(id: string, schedule: Partial<Schedule>): Promise<ApiResponse<Schedule>> {
    return request<Schedule>(`/api/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(schedule),
    });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/schedules/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// GRADES API
// ============================================

export const gradesAPI = {
  async getAll(): Promise<ApiResponse<Grade[]>> {
    return request<Grade[]>('/api/grades');
  },

  async getById(id: string): Promise<ApiResponse<Grade>> {
    return request<Grade>(`/api/grades/${id}`);
  },

  async getByStudent(studentId: string): Promise<ApiResponse<Grade[]>> {
    return request<Grade[]>(`/api/grades?student_id=${studentId}`);
  },

  async getBySubject(subjectId: string): Promise<ApiResponse<Grade[]>> {
    return request<Grade[]>(`/api/grades?subject_id=${subjectId}`);
  },

  async getByClass(classId: string): Promise<ApiResponse<Grade[]>> {
    return request<Grade[]>(`/api/grades?class_id=${classId}`);
  },

  async create(grade: Partial<Grade>): Promise<ApiResponse<Grade>> {
    return request<Grade>('/api/grades', {
      method: 'POST',

      body: JSON.stringify(grade),
    });
  },

  async update(id: string, grade: Partial<Grade>): Promise<ApiResponse<Grade>> {
    return request<Grade>(`/api/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(grade),
    });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/grades/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// ATTENDANCE API
// ============================================

export const attendanceAPI = {
  async getAll(): Promise<ApiResponse<Attendance[]>> {
    return request<Attendance[]>('/api/attendance');
  },

  async getById(id: string): Promise<ApiResponse<Attendance>> {
    return request<Attendance>(`/api/attendance/${id}`);
  },

  async getByStudent(studentId: string): Promise<ApiResponse<Attendance[]>> {
    return request<Attendance[]>(`/api/attendance?student_id=${studentId}`);
  },

  async getByClass(classId: string): Promise<ApiResponse<Attendance[]>> {
    return request<Attendance[]>(`/api/attendance?class_id=${classId}`);
  },

  async getByDate(date: string): Promise<ApiResponse<Attendance[]>> {
    return request<Attendance[]>(`/api/attendance?date=${date}`);
  },

  async create(attendance: Partial<Attendance>): Promise<ApiResponse<Attendance>> {
    return request<Attendance>('/api/attendance', {
      method: 'POST',

      body: JSON.stringify(attendance),
    });
  },

  async update(id: string, attendance: Partial<Attendance>): Promise<ApiResponse<Attendance>> {
    return request<Attendance>(`/api/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(attendance),
    });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/attendance/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// E-LIBRARY API
// ============================================

export const eLibraryAPI = {
  async getAll(): Promise<ApiResponse<ELibrary[]>> {
    return request<ELibrary[]>('/api/e_library');
  },

  async getById(id: string): Promise<ApiResponse<ELibrary>> {
    return request<ELibrary>(`/api/e_library/${id}`);
  },

  async getByCategory(category: string): Promise<ApiResponse<ELibrary[]>> {
    return request<ELibrary[]>(`/api/e_library?category=${category}`);
  },

  async getBySubject(subjectId: string): Promise<ApiResponse<ELibrary[]>> {
    return request<ELibrary[]>(`/api/e_library?subject_id=${subjectId}`);
  },

  async create(material: Partial<ELibrary>): Promise<ApiResponse<ELibrary>> {
    return request<ELibrary>('/api/e_library', {
      method: 'POST',

      body: JSON.stringify(material),
    });
  },

  async update(id: string, material: Partial<ELibrary>): Promise<ApiResponse<ELibrary>> {
    return request<ELibrary>(`/api/e_library/${id}`, {
      method: 'PUT',
      body: JSON.stringify(material),
    });
  },

  async incrementDownloadCount(id: string): Promise<ApiResponse<ELibrary>> {
    return request<ELibrary>(`/api/e_library/${id}/download`, {
      method: 'PUT',
    });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/e_library/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// FILE STORAGE API
// ============================================

export interface FileUploadResponse {
  key: string;
  url: string;
  size: number;
  type: string;
  name: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const fileStorageAPI = {
  /* eslint-disable no-undef */
  async upload(
    file: File,
    path?: string,
    options?: {
      onProgress?: (progress: UploadProgress) => void;
      abortController?: AbortController;
    }
  ): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    if (path) {
      formData.append('path', path);
    }

    const token = getAuthToken();
    const { onProgress, abortController } = options || {};

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();  

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage,
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            reject(response);
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      if (abortController) {
        abortController.signal.addEventListener('abort', () => {
          xhr.abort();
        });
      }

      xhr.open('POST', `${API_BASE_URL}/api/files/upload`);
      xhr.setRequestHeader('Authorization', token ? `Bearer ${token}` : '');
      xhr.send(formData);
    });
    /* eslint-enable no-undef */
  },

  async delete(key: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/files/delete?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  },

  async list(prefix?: string): Promise<ApiResponse<Array<{ key: string; size: number; uploaded: string }>>> {
    const urlPrefix = prefix ? `?prefix=${encodeURIComponent(prefix)}` : '';
    return request<Array<{ key: string; size: number; uploaded: string }>>(
      `/api/files/list${urlPrefix}`
    );
  },

  getDownloadUrl(key: string): string {
    return `${API_BASE_URL}/api/files/download?key=${encodeURIComponent(key)}`;
  },
};

// ============================================
// ANNOUNCEMENTS API
// ============================================

export const announcementsAPI = {
  async getAll(): Promise<ApiResponse<Announcement[]>> {
    return request<Announcement[]>('/api/announcements');
  },

  async getById(id: string): Promise<ApiResponse<Announcement>> {
    return request<Announcement>(`/api/announcements/${id}`);
  },

  async getActive(): Promise<ApiResponse<Announcement[]>> {
    return request<Announcement[]>('/api/announcements?active=true');
  },

  async getByCategory(category: string): Promise<ApiResponse<Announcement[]>> {
    return request<Announcement[]>(`/api/announcements?category=${category}`);
  },

  async create(announcement: Partial<Announcement>): Promise<ApiResponse<Announcement>> {
    return request<Announcement>('/api/announcements', {
      method: 'POST',

      body: JSON.stringify(announcement),
    });
  },

  async update(id: string, announcement: Partial<Announcement>): Promise<ApiResponse<Announcement>> {
    return request<Announcement>(`/api/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(announcement),
    });
  },

  async toggleStatus(id: string): Promise<ApiResponse<Announcement>> {
    return request<Announcement>(`/api/announcements/${id}/toggle`, {
      method: 'PUT',
    });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return request<null>(`/api/announcements/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// PARENTS API
// ============================================

export const parentsAPI = {
  async getChildren(): Promise<ApiResponse<ParentChild[]>> {
    return request<ParentChild[]>('/api/parent/children');
  },

  async getChildGrades(studentId: string): Promise<ApiResponse<Grade[]>> {
    return request<Grade[]>(`/api/parent/grades?student_id=${studentId}`);
  },

  async getChildAttendance(studentId: string): Promise<ApiResponse<Attendance[]>> {
    return request<Attendance[]>(`/api/parent/attendance?student_id=${studentId}`);
  },

  async getChildSchedule(studentId: string): Promise<ApiResponse<Schedule[]>> {
    return request<Schedule[]>(`/api/parent/schedule?student_id=${studentId}`);
  },

  async getMeetings(studentId: string): Promise<ApiResponse<ParentMeeting[]>> {
    return request<ParentMeeting[]>(`/api/parent/meetings?student_id=${studentId}`);
  },

  async getAvailableTeachersForMeetings(studentId: string): Promise<ApiResponse<ParentTeacher[]>> {
    return request<ParentTeacher[]>(`/api/parent/meetings/teachers?student_id=${studentId}`);
  },

  async scheduleMeeting(meetingData: Omit<ParentMeeting, 'id' | 'childName' | 'teacherName' | 'status'>): Promise<ApiResponse<ParentMeeting>> {
    return request<ParentMeeting>('/api/parent/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  },

  async getMessages(studentId: string): Promise<ApiResponse<ParentMessage[]>> {
    return request<ParentMessage[]>(`/api/parent/messages?student_id=${studentId}`);
  },

  async getAvailableTeachers(studentId: string): Promise<ApiResponse<ParentTeacher[]>> {
    return request<ParentTeacher[]>(`/api/parent/messages/teachers?student_id=${studentId}`);
  },

  async sendMessage(messageData: Omit<ParentMessage, 'id' | 'timestamp' | 'status'>): Promise<ApiResponse<ParentMessage>> {
    return request<ParentMessage>('/api/parent/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  async getPaymentHistory(studentId: string): Promise<ApiResponse<ParentPayment[]>> {
    return request<ParentPayment[]>(`/api/parent/payments?student_id=${studentId}`);
  },
};

// ============================================
// EXPORT ALL APIs
// ============================================

export const apiService = {
  auth: authAPI,
  users: usersAPI,
  students: studentsAPI,
  teachers: teachersAPI,
  parents: parentsAPI,
  ppdb: ppdbAPI,
  inventory: inventoryAPI,
  events: eventsAPI,
  eventRegistrations: eventRegistrationsAPI,
  eventBudgets: eventBudgetsAPI,
  eventPhotos: eventPhotosAPI,
  eventFeedback: eventFeedbackAPI,
  chat: chatAPI,
  subjects: subjectsAPI,
  classes: classesAPI,
  schedules: schedulesAPI,
  grades: gradesAPI,
  attendance: attendanceAPI,
  eLibrary: eLibraryAPI,
  announcements: announcementsAPI,
  fileStorage: fileStorageAPI,
  // Utility methods
  getAuthToken,
  parseJwtPayload,
};

// Export request function for testing
export { request };

// Export for backward compatibility
export const api = apiService;
