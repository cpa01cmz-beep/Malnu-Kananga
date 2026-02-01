// api/offline.ts - Offline Queue Helpers

import { logger } from '../../utils/logger';
import { offlineActionQueueService } from '../offlineActionQueueService';
import { API_BASE_URL as CONFIG_API_BASE_URL } from '../../config/constants';

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || CONFIG_API_BASE_URL;

// ============================================
// OFFLINE QUEUE HELPER FUNCTIONS
// ============================================

export async function queueOfflineRequest<T>(
  endpoint: string,
  options: RequestOptions,
  _token: string | null
): Promise<ApiResponse<T>> {
  const method = options.method?.toUpperCase() || 'GET';
  const isWriteOperation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  
  if (!isWriteOperation) {
    return {
      success: false,
      message: 'Network error: Unable to complete request offline',
      error: 'Network error: Unable to complete request offline'
    };
  }

  const entity = mapEndpointToEntityType(endpoint, method);
  const actionType = mapMethodToActionType(method);

  try {
    let data: unknown = null;
    if (options.body && typeof options.body === 'string') {
      try {
        data = JSON.parse(options.body);
      } catch {
        data = options.body;
      }
    }

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

export function mapEndpointToEntityType(endpoint: string, _method: string): 'grade' | 'attendance' | 'assignment' | 'material' | 'announcement' | 'event' | 'ppdb' | 'inventory' | 'schedule' | 'meeting' | 'user' {
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
  
  return 'material';
}

export function mapMethodToActionType(method: string): 'create' | 'update' | 'delete' | 'publish' | 'submit' | 'approve' | 'reject' {
  switch (method) {
    case 'POST': return 'create';
    case 'PUT': 
    case 'PATCH': return 'update';
    case 'DELETE': return 'delete';
    default: return 'create';
  }
}

export function extractEntityId(data: Record<string, unknown> | null, endpoint: string): string {
  if (data?.id) {
    return String(data.id);
  }
  
  const matches = endpoint.match(/\/(\d+)[/]?"?$/);
  if (matches) {
    return matches[1];
  }
  
  return 'unknown';
}
