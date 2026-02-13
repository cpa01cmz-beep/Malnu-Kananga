import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { generateId } from '../utils/idGenerator';
import { auditAPI, type AuditLogEntry, type AuditLogFilter, type AuditLogExportOptions, type AuditLogStats } from './api';

const MAX_LOCAL_ENTRIES = 1000;

class AuditService {
  private storageKey: string = STORAGE_KEYS.AUDIT_LOG;
  private filterStorageKey: string = STORAGE_KEYS.AUDIT_LOG_FILTERS;

  private getUserInfo(): { userId: string; userName: string; userRole: string } {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          userId: user.id || 'unknown',
          userName: user.name || 'Unknown User',
          userRole: user.role || 'unknown'
        };
      }
    } catch {
      logger.warn('Failed to get user info for audit log');
    }
    return { userId: 'unknown', userName: 'Unknown User', userRole: 'unknown' };
  }

  private getLogsFromStorage(): AuditLogEntry[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      logger.error('Failed to get audit logs from storage:', error);
      return [];
    }
  }

  private saveLogsToStorage(logs: AuditLogEntry[]): void {
    try {
      const trimmed = logs.length > MAX_LOCAL_ENTRIES ? logs.slice(0, MAX_LOCAL_ENTRIES) : logs;
      localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
    } catch (error) {
      logger.error('Failed to save audit logs to storage:', error);
    }
  }

  async logWrite(params: {
    action: AuditLogEntry['action'];
    resource: AuditLogEntry['resource'];
    resourceId?: string;
    description: string;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
  }): Promise<AuditLogEntry | null> {
    const userInfo = this.getUserInfo();
    const entry: Omit<AuditLogEntry, 'id' | 'timestamp'> = {
      userId: userInfo.userId,
      userName: userInfo.userName,
      userRole: userInfo.userRole,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      description: params.description,
      oldValue: params.oldValue,
      newValue: params.newValue,
    };

    try {
      const response = await auditAPI.createLog(entry);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      logger.warn('Failed to create audit log via API, falling back to localStorage:', error);
    }

    const localEntry: AuditLogEntry = {
      ...entry,
      id: generateId({ prefix: 'audit' }),
      timestamp: new Date().toISOString(),
    };
    const logs = this.getLogsFromStorage();
    logs.unshift(localEntry);
    this.saveLogsToStorage(logs);
    return localEntry;
  }

  async logRead(filter?: AuditLogFilter): Promise<AuditLogEntry[]> {
    try {
      const response = await auditAPI.getLogs(filter);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      logger.warn('Failed to fetch audit logs via API, using localStorage:', error);
    }
    return this.getLogsFromStorage();
  }

  async logExport(options: AuditLogExportOptions, filter?: AuditLogFilter): Promise<string | null> {
    try {
      const response = await auditAPI.exportLogs(options, filter);
      if (response.success && response.data) {
        if (options.format === 'json') {
          return response.data;
        }
        if (options.format === 'csv') {
          const logs = await this.logRead(filter);
          return this.convertToCSV(logs);
        }
      }
    } catch (error) {
      logger.warn('Failed to export audit logs via API:', error);
    }
    return null;
  }

  private convertToCSV(logs: AuditLogEntry[]): string {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'Resource ID', 'Description'];
    const rows = logs.map(log => [
      log.timestamp,
      log.userName,
      log.userRole,
      log.action,
      log.resource,
      log.resourceId || '',
      `"${(log.description || '').replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  async getStats(startDate?: string, endDate?: string): Promise<AuditLogStats | null> {
    try {
      const response = await auditAPI.getStats(startDate, endDate);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      logger.warn('Failed to fetch audit stats via API:', error);
    }
    return null;
  }

  saveFilters(filter: AuditLogFilter): void {
    try {
      localStorage.setItem(this.filterStorageKey, JSON.stringify(filter));
    } catch (error) {
      logger.error('Failed to save audit log filters:', error);
    }
  }

  getSavedFilters(): AuditLogFilter | null {
    try {
      const stored = localStorage.getItem(this.filterStorageKey);
      if (stored) return JSON.parse(stored);
    } catch {
      logger.warn('Failed to get saved audit log filters');
    }
    return null;
  }

  clearLocalLogs(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.filterStorageKey);
  }
}

export const auditService = new AuditService();
