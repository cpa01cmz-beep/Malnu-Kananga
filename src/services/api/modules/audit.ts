import { request } from '../client';
import { API_ENDPOINTS } from '../../../constants';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'login' | 'logout';
  resource: 'grade' | 'user' | 'settings' | 'attendance' | 'assignment' | 'class' | 'subject' | 'other';
  resourceId?: string;
  description: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
}

export interface AuditLogFilter {
  startDate?: string;
  endDate?: string;
  userId?: string;
  userRole?: string;
  action?: AuditLogEntry['action'];
  resource?: AuditLogEntry['resource'];
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includeDetails?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface AuditLogStats {
  totalEntries: number;
  entriesByAction: Record<string, number>;
  entriesByResource: Record<string, number>;
  entriesByUser: Array<{ userName: string; count: number }>;
}

export const auditAPI = {
  async getLogs(filter?: AuditLogFilter): Promise<{ success: boolean; message: string; data?: AuditLogEntry[]; error?: string }> {
    const params = new URLSearchParams();
    if (filter) {
      if (filter.startDate) params.append('start_date', filter.startDate);
      if (filter.endDate) params.append('end_date', filter.endDate);
      if (filter.userId) params.append('user_id', filter.userId);
      if (filter.userRole) params.append('user_role', filter.userRole);
      if (filter.action) params.append('action', filter.action);
      if (filter.resource) params.append('resource', filter.resource);
      if (filter.searchQuery) params.append('q', filter.searchQuery);
      if (filter.page) params.append('page', String(filter.page));
      if (filter.limit) params.append('limit', String(filter.limit));
    }
    const queryString = params.toString();
    return request<AuditLogEntry[]>(queryString ? `${API_ENDPOINTS.AUDIT.LOGS}?${queryString}` : API_ENDPOINTS.AUDIT.LOGS);
  },

  async getLogById(id: string): Promise<{ success: boolean; message: string; data?: AuditLogEntry; error?: string }> {
    return request<AuditLogEntry>(API_ENDPOINTS.AUDIT.LOG_BY_ID(id));
  },

  async createLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<{ success: boolean; message: string; data?: AuditLogEntry; error?: string }> {
    return request<AuditLogEntry>(API_ENDPOINTS.AUDIT.LOGS, {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },

  async exportLogs(options: AuditLogExportOptions, filter?: AuditLogFilter): Promise<{ success: boolean; message: string; data?: string; error?: string }> {
    const params = new URLSearchParams({ format: options.format });
    if (options.includeDetails !== undefined) params.append('include_details', String(options.includeDetails));
    if (options.dateRange) {
      params.append('start_date', options.dateRange.start);
      params.append('end_date', options.dateRange.end);
    }
    if (filter) {
      if (filter.userId) params.append('user_id', filter.userId);
      if (filter.action) params.append('action', filter.action);
      if (filter.resource) params.append('resource', filter.resource);
    }
    return request<string>(`${API_ENDPOINTS.AUDIT.EXPORT}?${params}`);
  },

  async getStats(startDate?: string, endDate?: string): Promise<{ success: boolean; message: string; data?: AuditLogStats; error?: string }> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const queryString = params.toString();
    return request<AuditLogStats>(queryString ? `${API_ENDPOINTS.AUDIT.BASE}/stats?${queryString}` : `${API_ENDPOINTS.AUDIT.BASE}/stats`);
  },
};
