import Papa from 'papaparse';
import { STORAGE_KEYS, FILE_SIZE_LIMITS } from '../constants';
import { logger } from '../utils/logger';
import { generateId } from '../utils/idGenerator';

export type ExportFormat = 'json' | 'csv';
export type ImportFormat = 'json' | 'csv' | 'excel';
export type DataEntityType =
  | 'users'
  | 'grades'
  | 'assignments'
  | 'classes'
  | 'subjects'
  | 'attendance'
  | 'materials'
  | 'ppdb_registrants'
  | 'communications'
  | 'audit_logs'
  | 'all';

export interface ExportOptions {
  entityType: DataEntityType;
  format: ExportFormat;
  dateRange?: { start: string; end: string };
  filters?: Record<string, unknown>;
}

export interface ImportOptions {
  entityType: DataEntityType;
  format: ImportFormat;
  validation?: { requiredFields?: string[]; maxRows?: number; dryRun?: boolean };
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  warnings: string[];
}

export interface BackupSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  entities: DataEntityType[];
  lastRun?: string;
  nextRun?: string;
}

export interface BackupMetadata {
  id: string;
  timestamp: string;
  entities: DataEntityType[];
  size: number;
  format: ExportFormat;
  checksum: string;
}

export const DATA_EXPORT_IMPORT_KEYS = {
  BACKUP_SCHEDULE: 'malnu_backup_schedule',
  BACKUP_HISTORY: 'malnu_backup_history',
  EXPORT_CACHE: 'malnu_export_cache',
  IMPORT_QUEUE: 'malnu_import_queue',
} as const;

export const IMPORT_LIMITS = {
  MAX_ROWS: 10000,
  MAX_FILE_SIZE: FILE_SIZE_LIMITS.MATERIAL_DEFAULT, // Flexy: Using centralized constant!
} as const;

const ENTITY_STORAGE_MAP: Record<DataEntityType, string | null> = {
  users: STORAGE_KEYS.USERS,
  grades: STORAGE_KEYS.GRADES,
  assignments: STORAGE_KEYS.ASSIGNMENTS,
  classes: STORAGE_KEYS.CLASS_DATA,
  subjects: STORAGE_KEYS.SUBJECTS_CACHE,
  attendance: STORAGE_KEYS.ATTENDANCE_CACHE,
  materials: STORAGE_KEYS.MATERIALS,
  ppdb_registrants: STORAGE_KEYS.PPDB_REGISTRANTS,
  communications: null,
  audit_logs: STORAGE_KEYS.AUDIT_LOG,
  all: null,
};

class DataExportImportService {
  private getStorageKey(entityType: DataEntityType): string | null {
    return ENTITY_STORAGE_MAP[entityType] || null;
  }

  async exportData(options: ExportOptions): Promise<string | null> {
    const { entityType, format, dateRange, filters } = options;

    try {
      logger.info('Starting data export:', { entityType, format, dateRange });

      let data: unknown[];

      if (entityType === 'all') {
        data = await this.exportAllEntities(dateRange, filters);
      } else {
        data = await this.exportEntity(entityType, dateRange, filters);
      }

      if (!data || data.length === 0) {
        logger.warn('No data to export for entity:', entityType);
        return null;
      }

      const result = format === 'json'
        ? JSON.stringify(data, null, 2)
        : this.convertToCSV(data as Record<string, unknown>[]);

      this.cacheExport(entityType, result, format);

      logger.info('Data export completed:', { entityType, format, rowCount: data.length });

      return result;
    } catch (error) {
      logger.error('Data export failed:', error);
      return null;
    }
  }

  private async exportEntity(
    entityType: DataEntityType,
    dateRange?: { start: string; end: string },
    _filters?: Record<string, unknown>
  ): Promise<unknown[]> {
    const storageKey = this.getStorageKey(entityType);

    if (!storageKey) {
      logger.warn('No storage key for entity:', entityType);
      return [];
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return [];

      let data = JSON.parse(stored);
      if (!Array.isArray(data)) {
        data = [data];
      }

      if (dateRange) {
        data = this.filterByDateRange(data, dateRange);
      }

      return data;
    } catch (error) {
      logger.error('Failed to export entity:', error);
      return [];
    }
  }

  private async exportAllEntities(
    dateRange?: { start: string; end: string },
    _filters?: Record<string, unknown>
  ): Promise<unknown[]> {
    const entities: Record<string, unknown[]> = {};

    for (const entityType of Object.keys(ENTITY_STORAGE_MAP) as DataEntityType[]) {
      if (entityType === 'all') continue;

      const data = await this.exportEntity(entityType, dateRange);
      if (data.length > 0) {
        entities[entityType] = data;
      }
    }

    return [entities];
  }

  private filterByDateRange(
    data: unknown[],
    dateRange: { start: string; end: string }
  ): unknown[] {
    return data.filter((item) => {
      const record = item as Record<string, unknown>;
      const dateField = record.timestamp || record.createdAt || record.updatedAt;
      if (!dateField) return true;

      const date = new Date(dateField as string);
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);

      return date >= start && date <= end;
    });
  }

  private convertToCSV(data: Record<string, unknown>[]): string {
    if (data.length === 0) return '';

    const allKeys = new Set<string>();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => allKeys.add(key));
    });

    const headers = Array.from(allKeys);

    const rows = data.map((item) => {
      return headers.map((header) => {
        const value = item[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        return `"${String(value).replace(/"/g, '""')}"`;
      });
    });

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  async importData(data: string, options: ImportOptions): Promise<ImportResult> {
    const { entityType, format, validation } = options;

    try {
      logger.info('Starting data import:', { entityType, format });

      let parsedData: unknown[];

      if (format === 'json') {
        parsedData = JSON.parse(data);
        if (!Array.isArray(parsedData)) {
          parsedData = [parsedData];
        }
      } else if (format === 'csv' || format === 'excel') {
        const result = Papa.parse(data, { header: true, skipEmptyLines: true });
        if (result.errors.length > 0) {
          logger.warn('CSV parsing warnings:', result.errors);
        }
        parsedData = result.data;
      } else {
        return { success: false, imported: 0, skipped: 0, errors: ['Unsupported format'], warnings: [] };
      }

      const validationResult = this.validateImportData(parsedData, validation);
      if (!validationResult.isValid) {
        return {
          success: false,
          imported: 0,
          skipped: parsedData.length,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
        };
      }

      if (validation?.dryRun) {
        return {
          success: true,
          imported: 0,
          skipped: parsedData.length - validationResult.validCount,
          errors: [],
          warnings: validationResult.warnings,
        };
      }

      const importResult = await this.storeImportedData(entityType, validationResult.validData);

      logger.info('Data import completed:', { entityType, imported: importResult.imported, skipped: importResult.skipped });

      return { success: true, imported: importResult.imported, skipped: importResult.skipped, errors: [], warnings: validationResult.warnings };
    } catch (error) {
      logger.error('Data import failed:', error);
      return { success: false, imported: 0, skipped: 0, errors: [(error as Error).message], warnings: [] };
    }
  }

  private validateImportData(
    data: unknown[],
    validation?: ImportOptions['validation']
  ): { isValid: boolean; validData: unknown[]; validCount: number; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validData: unknown[] = [];

    if (validation?.maxRows && data.length > validation.maxRows) {
      errors.push(`Too many rows: ${data.length}. Max: ${validation.maxRows}`);
    }

    for (let i = 0; i < data.length; i++) {
      const item = data[i] as Record<string, unknown>;

      if (validation?.requiredFields) {
        const missingFields = validation.requiredFields.filter(
          (field) => !(field in item) || item[field] === null || item[field] === undefined
        );

        if (missingFields.length > 0) {
          warnings.push(`Row ${i + 1}: Missing fields: ${missingFields.join(', ')}`);
          continue;
        }
      }

      validData.push(item);
    }

    return { isValid: errors.length === 0, validData, validCount: validData.length, errors, warnings };
  }

  private async storeImportedData(entityType: DataEntityType, data: unknown[]): Promise<{ imported: number; skipped: number }> {
    const storageKey = this.getStorageKey(entityType);

    if (!storageKey) {
      logger.warn('No storage key for entity:', entityType);
      return { imported: 0, skipped: data.length };
    }

    try {
      const existing = localStorage.getItem(storageKey);
      let existingData: unknown[] = [];

      if (existing) {
        existingData = JSON.parse(existing);
        if (!Array.isArray(existingData)) {
          existingData = [existingData];
        }
      }

      const merged = this.mergeData(existingData, data);
      localStorage.setItem(storageKey, JSON.stringify(merged));

      return { imported: data.length, skipped: 0 };
    } catch (error) {
      logger.error('Failed to store imported data:', error);
      return { imported: 0, skipped: data.length };
    }
  }

  private mergeData(existing: unknown[], imported: unknown[]): unknown[] {
    const merged = [...existing];

    for (const item of imported) {
      const record = item as Record<string, unknown>;
      const id = record.id;

      if (!id) {
        merged.push(item);
        continue;
      }

      const existingIndex = merged.findIndex((e) => (e as Record<string, unknown>).id === id);

      if (existingIndex >= 0) {
        const existingItem = merged[existingIndex] as Record<string, unknown>;
        const existingTimestamp = existingItem.timestamp || existingItem.updatedAt || '0';
        const newTimestamp = record.timestamp || record.updatedAt || '1';

        if (newTimestamp > existingTimestamp) {
          merged[existingIndex] = item;
        }
      } else {
        merged.push(item);
      }
    }

    return merged;
  }

  private cacheExport(entityType: DataEntityType, data: string, format: ExportFormat): void {
    try {
      const cacheKey = `${DATA_EXPORT_IMPORT_KEYS.EXPORT_CACHE}_${entityType}`;
      const cacheData = { data, format, timestamp: new Date().toISOString() };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      logger.warn('Failed to cache export:', error);
    }
  }

  getBackupSchedule(): BackupSchedule | null {
    try {
      const stored = localStorage.getItem(DATA_EXPORT_IMPORT_KEYS.BACKUP_SCHEDULE);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  setBackupSchedule(schedule: BackupSchedule): void {
    try {
      const nextRun = this.calculateNextRun(schedule.frequency, schedule.time);
      const updatedSchedule = { ...schedule, nextRun };
      localStorage.setItem(DATA_EXPORT_IMPORT_KEYS.BACKUP_SCHEDULE, JSON.stringify(updatedSchedule));
      logger.info('Backup schedule updated:', updatedSchedule);
    } catch (error) {
      logger.error('Failed to set backup schedule:', error);
    }
  }

  private calculateNextRun(frequency: BackupSchedule['frequency'], time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    if (next <= now) {
      switch (frequency) {
        case 'daily': next.setDate(next.getDate() + 1); break;
        case 'weekly': next.setDate(next.getDate() + 7); break;
        case 'monthly': next.setMonth(next.getMonth() + 1); break;
      }
    }

    return next.toISOString();
  }

  async executeScheduledBackup(): Promise<BackupMetadata | null> {
    const schedule = this.getBackupSchedule();
    if (!schedule || !schedule.enabled) return null;

    try {
      const exportResult = await this.exportData({ entityType: 'all', format: 'json' });
      if (!exportResult) {
        logger.warn('Scheduled backup failed: no data to export');
        return null;
      }

      const checksum = await this.calculateChecksum(exportResult);
      const metadata: BackupMetadata = {
        id: generateId({ prefix: 'backup' }),
        timestamp: new Date().toISOString(),
        entities: schedule.entities,
        size: exportResult.length,
        format: 'json',
        checksum,
      };

      this.storeBackup(metadata, exportResult);

      schedule.lastRun = metadata.timestamp;
      schedule.nextRun = this.calculateNextRun(schedule.frequency, schedule.time);
      this.setBackupSchedule(schedule);

      logger.info('Scheduled backup completed:', metadata);
      return metadata;
    } catch (error) {
      logger.error('Scheduled backup failed:', error);
      return null;
    }
  }

  private async calculateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  private storeBackup(metadata: BackupMetadata, data: string): void {
    try {
      const historyKey = DATA_EXPORT_IMPORT_KEYS.BACKUP_HISTORY;
      const existing = localStorage.getItem(historyKey);
      let history: BackupMetadata[] = existing ? JSON.parse(existing) : [];
      history = [metadata, ...history].slice(0, 10);
      localStorage.setItem(historyKey, JSON.stringify(history));
      localStorage.setItem(`${historyKey}_${metadata.id}`, data);
    } catch (error) {
      logger.error('Failed to store backup:', error);
    }
  }

  getBackupHistory(): BackupMetadata[] {
    try {
      const stored = localStorage.getItem(DATA_EXPORT_IMPORT_KEYS.BACKUP_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async restoreFromBackup(backupId: string): Promise<ImportResult> {
    try {
      const data = localStorage.getItem(`${DATA_EXPORT_IMPORT_KEYS.BACKUP_HISTORY}_${backupId}`);
      if (!data) {
        return { success: false, imported: 0, skipped: 0, errors: ['Backup not found'], warnings: [] };
      }

      return this.importData(data, { entityType: 'all', format: 'json' });
    } catch (error) {
      logger.error('Failed to restore from backup:', error);
      return { success: false, imported: 0, skipped: 0, errors: [(error as Error).message], warnings: [] };
    }
  }

  deleteBackup(backupId: string): void {
    try {
      const historyKey = DATA_EXPORT_IMPORT_KEYS.BACKUP_HISTORY;
      const existing = localStorage.getItem(historyKey);
      let history: BackupMetadata[] = existing ? JSON.parse(existing) : [];
      history = history.filter((b) => b.id !== backupId);
      localStorage.setItem(historyKey, JSON.stringify(history));
      localStorage.removeItem(`${historyKey}_${backupId}`);
      logger.info('Backup deleted:', backupId);
    } catch (error) {
      logger.error('Failed to delete backup:', error);
    }
  }

  downloadExport(data: string, filename: string, format: ExportFormat): void {
    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    logger.info('Export downloaded:', filename);
  }

  async readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

export const dataExportImportService = new DataExportImportService();
