import {
  CommunicationLogEntry,
  CommunicationLogFilter,
  CommunicationLogExportOptions,
  CommunicationLogStats,
} from '../types';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { classifyError, logError } from '../utils/errorHandler';
import { pdfExportService } from '../services/pdfExportService';
import Papa from 'papaparse';

class CommunicationLogService {
  private storageKey: string = STORAGE_KEYS.COMMUNICATION_LOG;

  private generateId(): string {
    return `comm_log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getLogsFromStorage(): CommunicationLogEntry[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      logger.error('Failed to get communication logs from storage:', error);
      return [];
    }
  }

  private trimBodyPreview(body: string): string {
    if (!body) return '';

    let plainText = body.replace(/<[^>]+>/g, '');

    if (plainText.length > 200) {
      plainText = plainText.substring(0, 200) + '...';
    }

    return plainText;
  }

  private saveLogsToStorage(logs: CommunicationLogEntry[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (error) {
      logger.error('Failed to save communication logs to storage:', error);
    }
  }

  logMessage(data: {
    messageId: string;
    parentId: string;
    parentName: string;
    teacherId: string;
    teacherName: string;
    studentId: string;
    studentName: string;
    subject: string;
    message: string;
    messageType: 'text' | 'image' | 'file' | 'audio' | 'video';
    sender: 'parent' | 'teacher' | 'student';
    timestamp: string;
    readAt?: string;
    deliveredAt?: string;
  }): CommunicationLogEntry {
    const logs = this.getLogsFromStorage();

    const logEntry: CommunicationLogEntry = {
      id: this.generateId(),
      type: 'message',
      status: 'logged',
      parentId: data.parentId,
      parentName: data.parentName,
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      studentId: data.studentId,
      studentName: data.studentName,
      subject: data.subject,
      message: data.message,
      messageType: data.messageType,
      sender: data.sender,
      timestamp: data.timestamp,
      readAt: data.readAt,
      deliveredAt: data.deliveredAt,
      createdAt: new Date().toISOString(),
      createdBy: data.sender === 'parent' ? data.parentId : data.teacherId,
      createdByName: data.sender === 'parent' ? data.parentName : data.teacherName,
    };

    logs.unshift(logEntry);
    this.saveLogsToStorage(logs);

    logger.info('Message logged to communication log:', {
      messageId: data.messageId,
      logId: logEntry.id,
      participants: `${data.parentName} <-> ${data.teacherName}`,
    });

    return logEntry;
  }

  logMeeting(data: {
    meetingId: string;
    parentId: string;
    parentName: string;
    teacherId: string;
    teacherName: string;
    studentId: string;
    studentName: string;
    meetingDate: string;
    meetingStartTime: string;
    meetingEndTime: string;
    meetingAgenda: string;
    meetingOutcome?: string;
    meetingNotes?: string;
    meetingLocation: string;
    meetingStatus: 'scheduled' | 'completed' | 'cancelled';
  }): CommunicationLogEntry {
    const logs = this.getLogsFromStorage();

    const logEntry: CommunicationLogEntry = {
      id: this.generateId(),
      type: 'meeting',
      status: 'logged',
      parentId: data.parentId,
      parentName: data.parentName,
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      studentId: data.studentId,
      studentName: data.studentName,
      meetingId: data.meetingId,
      meetingDate: data.meetingDate,
      meetingStartTime: data.meetingStartTime,
      meetingEndTime: data.meetingEndTime,
      meetingAgenda: data.meetingAgenda,
      meetingOutcome: data.meetingOutcome,
      meetingNotes: data.meetingNotes,
      meetingLocation: data.meetingLocation,
      meetingStatus: data.meetingStatus,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: data.teacherId,
      createdByName: data.teacherName,
    };

    logs.unshift(logEntry);
    this.saveLogsToStorage(logs);

    logger.info('Meeting logged to communication log:', {
      meetingId: data.meetingId,
      logId: logEntry.id,
      participants: `${data.parentName} <-> ${data.teacherName}`,
      status: data.meetingStatus,
    });

    return logEntry;
  }

  logCall(data: {
    parentId: string;
    parentName: string;
    teacherId: string;
    teacherName: string;
    studentId: string;
    studentName: string;
    callDate: string;
    callStartTime: string;
    callEndTime: string;
    callNotes?: string;
  }): CommunicationLogEntry {
    const logs = this.getLogsFromStorage();

    const logEntry: CommunicationLogEntry = {
      id: this.generateId(),
      type: 'call',
      status: 'logged',
      parentId: data.parentId,
      parentName: data.parentName,
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      studentId: data.studentId,
      studentName: data.studentName,
      meetingDate: data.callDate,
      meetingStartTime: data.callStartTime,
      meetingEndTime: data.callEndTime,
      meetingNotes: data.callNotes,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: data.teacherId,
      createdByName: data.teacherName,
    };

    logs.unshift(logEntry);
    this.saveLogsToStorage(logs);

    logger.info('Call logged to communication log:', {
      logId: logEntry.id,
      participants: `${data.parentName} <-> ${data.teacherName}`,
    });

    return logEntry;
  }

  logNote(data: {
    parentId: string;
    parentName: string;
    teacherId: string;
    teacherName: string;
    studentId: string;
    studentName: string;
    note: string;
    createdBy: string;
    createdByName: string;
  }): CommunicationLogEntry {
    const logs = this.getLogsFromStorage();

    const logEntry: CommunicationLogEntry = {
      id: this.generateId(),
      type: 'note',
      status: 'logged',
      parentId: data.parentId,
      parentName: data.parentName,
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      studentId: data.studentId,
      studentName: data.studentName,
      message: data.note,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy,
      createdByName: data.createdByName,
    };

    logs.unshift(logEntry);
    this.saveLogsToStorage(logs);

    logger.info('Note logged to communication log:', {
      logId: logEntry.id,
      participants: `${data.parentName} <-> ${data.teacherName}`,
    });

    return logEntry;
  }

  logEmail(data: {
    messageId: string;
    parentId?: string;
    parentName?: string;
    teacherId?: string;
    teacherName?: string;
    studentId?: string;
    studentName?: string;
    recipientEmail: string;
    subject: string;
    bodyPreview?: string;
    deliveryStatus?: 'queued' | 'sent' | 'delivered' | 'bounced' | 'opened';
    hasAttachment?: boolean;
    sender: 'parent' | 'teacher' | 'student' | 'system';
    timestamp?: string;
  }): CommunicationLogEntry {
    const logs = this.getLogsFromStorage();

    const trimmedBodyPreview = this.trimBodyPreview(data.bodyPreview || '');

    const logEntry: CommunicationLogEntry = {
      id: this.generateId(),
      type: 'email',
      status: 'logged',
      parentId: data.parentId,
      parentName: data.parentName,
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      studentId: data.studentId,
      studentName: data.studentName,
      emailMessageId: data.messageId,
      recipientEmail: data.recipientEmail,
      subject: data.subject,
      message: trimmedBodyPreview,
      deliveryStatus: data.deliveryStatus || 'sent',
      hasAttachment: data.hasAttachment || false,
      sender: data.sender,
      timestamp: data.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: data.sender !== 'system' ? (data.sender === 'parent' ? data.parentId : data.teacherId) : 'system',
      createdByName: data.sender !== 'system' ? (data.sender === 'parent' ? data.parentName : data.teacherName) : 'System',
    };

    logs.unshift(logEntry);
    this.saveLogsToStorage(logs);

    logger.info('Email logged to communication log:', {
      messageId: data.messageId,
      logId: logEntry.id,
      recipient: data.recipientEmail,
      subject: data.subject,
    });

    return logEntry;
  }

  getCommunicationHistory(filter?: CommunicationLogFilter): CommunicationLogEntry[] {
    let logs = this.getLogsFromStorage();

    if (!filter) {
      return logs;
    }

    if (filter.type && filter.type.length > 0) {
      logs = logs.filter(log => filter.type!.includes(log.type));
    }

    if (filter.status && filter.status.length > 0) {
      logs = logs.filter(log => filter.status!.includes(log.status));
    }

    if (filter.parentId) {
      logs = logs.filter(log => log.parentId === filter.parentId);
    }

    if (filter.teacherId) {
      logs = logs.filter(log => log.teacherId === filter.teacherId);
    }

    if (filter.studentId) {
      logs = logs.filter(log => log.studentId === filter.studentId);
    }

    if (filter.dateRange) {
      const startDate = new Date(filter.dateRange.startDate);
      const endDate = new Date(filter.dateRange.endDate);
      logs = logs.filter(log => {
        let logDate: Date;
        switch (log.type) {
          case 'meeting':
          case 'call':
            logDate = log.meetingDate ? new Date(log.meetingDate) : new Date(log.timestamp);
            break;
          default:
            logDate = new Date(log.timestamp);
            break;
        }
        return logDate >= startDate && logDate <= endDate;
      });
    }

    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      logs = logs.filter(log => {
        return (
          (log.subject && log.subject.toLowerCase().includes(keyword)) ||
          (log.message && log.message.toLowerCase().includes(keyword)) ||
          (log.meetingAgenda && log.meetingAgenda.toLowerCase().includes(keyword)) ||
          (log.meetingOutcome && log.meetingOutcome.toLowerCase().includes(keyword)) ||
          (log.meetingNotes && log.meetingNotes.toLowerCase().includes(keyword))
        );
      });
    }

    if (filter.subject) {
      logs = logs.filter(log => log.subject === filter.subject);
    }

    if (filter.meetingStatus) {
      logs = logs.filter(log => log.meetingStatus === filter.meetingStatus);
    }

    const sortBy = filter.sortBy || 'timestamp';
    const sortOrder = filter.sortOrder || 'desc';

    logs.sort((a, b) => {
      const comparison = this.compareValues(a, b, sortBy);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    if (filter.limit) {
      const offset = filter.offset || 0;
      logs = logs.slice(offset, offset + filter.limit);
    }

    return logs;
  }

  private compareValues(a: CommunicationLogEntry, b: CommunicationLogEntry, field: string): number {
    switch (field) {
      case 'timestamp':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case 'date':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case 'sender':
        return (a.sender || a.createdByName || '').localeCompare(b.sender || b.createdByName || '');
      case 'teacher':
        return (a.teacherName || '').localeCompare(b.teacherName || '');
      case 'parent':
        return (a.parentName || '').localeCompare(b.parentName || '');
      default:
        return 0;
    }
  }

  getStatistics(filter?: Omit<CommunicationLogFilter, 'limit' | 'offset' | 'sortBy' | 'sortOrder'>): CommunicationLogStats {
    const logs = this.getCommunicationHistory(filter);

    const stats: CommunicationLogStats = {
      totalMessages: logs.filter(log => log.type === 'message').length,
      totalMeetings: logs.filter(log => log.type === 'meeting').length,
      totalCalls: logs.filter(log => log.type === 'call').length,
      totalNotes: logs.filter(log => log.type === 'note').length,
      totalEmails: logs.filter(log => log.type === 'email').length,
      messageCountByParent: {},
      messageCountByTeacher: {},
      meetingCountByStatus: {},
      emailCountByParent: {},
      emailCountByTeacher: {},
      mostActiveTeachers: [],
      mostActiveParents: [],
    };

    logs.forEach(log => {
      if (log.type === 'message') {
        if (log.parentId) {
          stats.messageCountByParent[log.parentId] = (stats.messageCountByParent[log.parentId] || 0) + 1;
        }
        if (log.teacherId) {
          stats.messageCountByTeacher[log.teacherId] = (stats.messageCountByTeacher[log.teacherId] || 0) + 1;
        }
      }

      if (log.type === 'email') {
        if (log.parentId) {
          stats.emailCountByParent[log.parentId] = (stats.emailCountByParent[log.parentId] || 0) + 1;
        }
        if (log.teacherId) {
          stats.emailCountByTeacher[log.teacherId] = (stats.emailCountByTeacher[log.teacherId] || 0) + 1;
        }
      }

      if (log.type === 'meeting' && log.meetingStatus) {
        stats.meetingCountByStatus[log.meetingStatus] = (stats.meetingCountByStatus[log.meetingStatus] || 0) + 1;
      }
    });

    stats.mostActiveTeachers = Object.entries(stats.messageCountByTeacher)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([teacherId]) => teacherId);

    stats.mostActiveParents = Object.entries(stats.messageCountByParent)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([parentId]) => parentId);

    return stats;
  }

  async exportToPDF(options: CommunicationLogExportOptions): Promise<void> {
    try {
      const logs = this.getCommunicationHistory(options.filters);

      const exportData = logs.map(log => this.formatLogForExport(log));

      const tableData = exportData.map(row => [
        row.type,
        row.date,
        row.participants,
        row.subject || row.agenda || '-',
        row.details || '-',
        row.status,
      ]);

      const dateStr = options.dateRange
        ? `${new Date(options.dateRange.startDate).toLocaleDateString('id-ID')} - ${new Date(options.dateRange.endDate).toLocaleDateString('id-ID')}`
        : new Date().toLocaleDateString('id-ID');

      await pdfExportService.createReport({
        title: 'Parent-Teacher Communication Log',
        date: dateStr,
        headers: ['Type', 'Date', 'Participants', 'Subject/Agenda', 'Details', 'Status'],
        data: tableData,
        summary: {
          'Total Entries': logs.length.toString(),
          'Messages': this.getStatistics(options.filters).totalMessages.toString(),
          'Meetings': this.getStatistics(options.filters).totalMeetings.toString(),
          'Calls': this.getStatistics(options.filters).totalCalls.toString(),
        },
      });

      logger.info('Communication log exported to PDF:', {
        entryCount: logs.length,
        exportDate: dateStr,
      });
    } catch (error) {
      const classifiedError = classifyError(error, {
        operation: 'exportCommunicationLogToPDF',
        timestamp: Date.now()
      });
      logError(classifiedError);
      logger.error('Failed to export communication log to PDF:', error);
      throw new Error('Gagal membuat ekspor PDF. Silakan coba lagi.');
    }
  }

  async exportToCSV(options: CommunicationLogExportOptions): Promise<void> {
    try {
      const logs = this.getCommunicationHistory(options.filters);

      const exportData = logs.map(log => this.formatLogForExport(log));

      const csv = Papa.unparse(exportData, {
        quotes: true,
        delimiter: ',',
        header: true,
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      try {
        link.href = url;
        link.download = `communication_log_${Date.now()}.csv`;
        link.click();

        logger.info('Communication log exported to CSV:', {
          entryCount: logs.length,
          exportDate: options.dateRange
            ? `${new Date(options.dateRange.startDate).toLocaleDateString('id-ID')} - ${new Date(options.dateRange.endDate).toLocaleDateString('id-ID')}`
            : new Date().toLocaleDateString('id-ID'),
        });
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      const classifiedError = classifyError(error, {
        operation: 'exportCommunicationLogToCSV',
        timestamp: Date.now()
      });
      logError(classifiedError);
      logger.error('Failed to export communication log to CSV:', error);
      throw new Error('Gagal membuat ekspor CSV. Silakan coba lagi.');
    }
  }

  private formatLogForExport(log: CommunicationLogEntry): Record<string, string> {
    const formatDate = (date: string) => {
      return new Date(date).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const participants = `${log.parentName || '-'} <-> ${log.teacherName || '-'}`;
    const studentInfo = log.studentName ? ` (Student: ${log.studentName})` : '';

    return {
      type: log.type,
      date: formatDate(log.timestamp),
      participants: participants + studentInfo,
      subject: log.subject || log.meetingAgenda || '-',
      details: log.message || log.meetingOutcome || log.meetingNotes || '-',
      status: log.type === 'meeting' ? log.meetingStatus || '-' : log.status,
    };
  }

  archiveEntries(olderThanDays: number = 90): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const logs = this.getLogsFromStorage();
    const archivedCount = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      const shouldArchive = logDate < cutoffDate && log.status === 'logged';
      
      if (shouldArchive) {
        log.status = 'archived';
        log.archivedAt = new Date().toISOString();
      }
      
      return shouldArchive;
    }).length;

    this.saveLogsToStorage(logs);

    logger.info('Communication log entries archived:', {
      archivedCount,
      cutoffDate: cutoffDate.toISOString(),
    });

    return archivedCount;
  }

  clearArchivedEntries(): number {
    const logs = this.getLogsFromStorage();
    const beforeCount = logs.length;
    
    const filteredLogs = logs.filter(log => log.status !== 'archived');
    const deletedCount = beforeCount - filteredLogs.length;

    this.saveLogsToStorage(filteredLogs);

    logger.info('Archived communication log entries cleared:', {
      deletedCount,
    });

    return deletedCount;
  }

  deleteLogEntry(entryId: string): boolean {
    const logs = this.getLogsFromStorage();
    const filteredLogs = logs.filter(log => log.id !== entryId);
    
    if (filteredLogs.length === logs.length) {
      return false;
    }

    this.saveLogsToStorage(filteredLogs);
    logger.info('Communication log entry deleted:', { entryId });

    return true;
  }

  updateLogEntry(
    entryId: string,
    updates: Partial<CommunicationLogEntry>
  ): CommunicationLogEntry | null {
    const logs = this.getLogsFromStorage();
    const logIndex = logs.findIndex(log => log.id === entryId);
    
    if (logIndex === -1) {
      return null;
    }

    logs[logIndex] = {
      ...logs[logIndex],
      ...updates,
      modifiedAt: new Date().toISOString(),
      modifiedBy: updates.modifiedBy || logs[logIndex].modifiedBy,
    };

    this.saveLogsToStorage(logs);

    logger.info('Communication log entry updated:', {
      entryId,
      updates: Object.keys(updates),
    });

    return logs[logIndex];
  }
}

export const communicationLogService = new CommunicationLogService();
