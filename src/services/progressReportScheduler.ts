import type { ParentChild, User } from '../types';
import { parentProgressReportService, type ProgressReportSettings, type ProgressReport } from './parentProgressReportService';
import { getEmailNotificationService } from './emailNotificationService';
import { gradesAPI, attendanceAPI } from './apiService';
import { logger } from '../utils/logger';
import { STORAGE_KEYS, TIME_MS } from '../constants';
import type { PushNotification } from '../types';

export interface ProgressReportAuditLog {
  parentId: string;
  studentId: string;
  studentName: string;
  reportId: string;
  generatedAt: string;
  emailSent: boolean;
  emailStatus?: 'queued' | 'sent' | 'failed';
  error?: string;
  method: 'auto' | 'manual';
}

class ProgressReportScheduler {
  private schedulerInterval: number | null = null;
  private readonly CHECK_INTERVAL_MINUTES = 60;

  start(): void {
    if (this.schedulerInterval !== null) {
      logger.warn('Progress report scheduler already running');
      return;
    }

    this.schedulerInterval = window.setInterval(() => {
      this.processScheduledReports();
    }, this.CHECK_INTERVAL_MINUTES * 60 * 1000);

    logger.info('Progress report scheduler started (runs every hour)');
  }

  stop(): void {
    if (this.schedulerInterval !== null) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
      logger.info('Progress report scheduler stopped');
    }
  }

  private async processScheduledReports(): Promise<void> {
    try {
      logger.debug('Processing scheduled progress reports');

      const currentUser = this.getCurrentUser();
      if (!currentUser || currentUser.role !== 'parent') {
        logger.debug('No parent user logged in, skipping report generation');
        return;
      }

      const settings = parentProgressReportService.getSettings(currentUser.id);
      if (!settings || !settings.enableNotifications) {
        return;
      }

      if (!this.shouldGenerateReportNow(settings)) {
        return;
      }

      const children = this.getChildrenForCurrentParent();
      for (const child of children) {
        try {
          await this.generateAndNotifyReport(currentUser, child, settings);
        } catch (error) {
          logger.error(`Failed to generate report for child ${child.studentId}:`, error);
        }
      }

      logger.debug('Completed processing scheduled progress reports');
    } catch (error) {
      logger.error('Error processing scheduled progress reports:', error);
    }
  }

  private getCurrentUser(): User | null {
    try {
      const authSession = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (!authSession) return null;
      const session = JSON.parse(authSession);
      return session.user || null;
    } catch (error) {
      logger.error('Failed to get current user:', error);
      return null;
    }
  }

  private getChildrenForCurrentParent(): ParentChild[] {
    try {
      const offlineParentData = localStorage.getItem(STORAGE_KEYS.OFFLINE_PARENT_DATA);
      if (!offlineParentData) return [];
      
      const parentData = JSON.parse(offlineParentData);
      return parentData.children || [];
    } catch (error) {
      logger.error('Failed to get children from offline cache:', error);
      return [];
    }
  }

  private shouldGenerateReportNow(settings: ProgressReportSettings): boolean {
    if (!settings.enableNotifications) return false;

    if (this.isQuietHours(settings)) {
      logger.debug('Quiet hours active, skipping report generation');
      return false;
    }

    return parentProgressReportService.shouldGenerateReport(settings.parentId);
  }

  private isQuietHours(settings: ProgressReportSettings): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    const { quietHoursStart, quietHoursEnd } = settings;

    if (quietHoursStart <= quietHoursEnd) {
      return currentTime >= quietHoursStart && currentTime <= quietHoursEnd;
    } else {
      return currentTime >= quietHoursStart || currentTime <= quietHoursEnd;
    }
  }

  private async generateAndNotifyReport(
    parent: User,
    child: ParentChild,
    settings: ProgressReportSettings
  ): Promise<void> {
    try {
      logger.info(`Generating progress report for student ${child.studentId} (parent: ${parent.id})`);

      const [gradesRes, attendanceRes] = await Promise.all([
        gradesAPI.getByStudent(child.studentId),
        attendanceAPI.getByStudent(child.studentId)
      ]);

      if (!gradesRes.success || !gradesRes.data || !attendanceRes.success || !attendanceRes.data) {
        throw new Error('Failed to fetch student data for report generation');
      }

      const report = await parentProgressReportService.generateProgressReport(
        child.studentId,
        child.studentName,
        parent.id,
        gradesRes.data,
        attendanceRes.data,
        true
      );

      await this.sendReportNotification(parent, child, report);

      this.updateLastReportDate(parent.id, settings);

      this.logAudit({
        parentId: parent.id,
        studentId: child.studentId,
        studentName: child.studentName,
        reportId: report.id,
        generatedAt: report.generatedAt,
        emailSent: true,
        emailStatus: 'sent',
        method: 'auto'
      });

      logger.info(`Progress report generated and notification sent for student ${child.studentId}`);
    } catch (error) {
      logger.error(`Failed to generate report for student ${child.studentId}:`, error);

      this.logAudit({
        parentId: parent.id,
        studentId: child.studentId,
        studentName: child.studentName,
        reportId: '',
        generatedAt: new Date().toISOString(),
        emailSent: false,
        emailStatus: 'failed',
        error: error instanceof Error ? error.message : String(error),
        method: 'auto'
      });

      throw error;
    }
  }

  private async sendReportNotification(
    parent: User,
    child: ParentChild,
    report: ProgressReport
  ): Promise<void> {
    try {
      const emailService = getEmailNotificationService(parent.id);

      const parentEmail = parent.email || emailService.getPreferences(parent.id)?.email || '';
      if (!parentEmail) {
        logger.warn(`No email configured for parent ${parent.id}, skipping notification`);
        return;
      }

      const notification: PushNotification = {
        id: `progress_report_${report.id}`,
        type: 'progress_report',
        title: 'Laporan Progres Belajar Baru',
        body: `Laporan progres belajar untuk ${child.studentName} telah tersedia. Rata-rata nilai: ${report.gradesData.averageScore}, Kehadiran: ${report.attendanceData.percentage}%`,
        icon: '📊',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
        targetRoles: ['parent'],
        targetUsers: [parent.id],
        data: {
          studentId: child.studentId,
          studentName: child.studentName,
          reportId: report.id,
          averageScore: report.gradesData.averageScore,
          attendancePercentage: report.attendanceData.percentage,
          reportDate: report.reportDate
        }
      };

      const result = await emailService.sendNotificationEmail(
        notification,
        parentEmail,
        parent.name || 'Parent',
        parent.id
      );

      if (result.success) {
        logger.info(`Progress report notification sent to ${parentEmail}`);
      } else {
        logger.warn(`Failed to send progress report notification: ${result.error}`);
      }
    } catch (error) {
      logger.error('Failed to send report notification:', error);
      throw error;
    }
  }

  private updateLastReportDate(parentId: string, settings: ProgressReportSettings): void {
    try {
      const updatedSettings: ProgressReportSettings = {
        ...settings,
        lastReportDate: new Date().toISOString(),
        nextReportDate: this.calculateNextReportDate(settings)
      };
      parentProgressReportService.saveSettings(updatedSettings);
      logger.info(`Updated last report date for parent ${parentId}`);
    } catch (error) {
      logger.error(`Failed to update last report date for parent ${parentId}:`, error);
    }
  }

  private calculateNextReportDate(settings: ProgressReportSettings): string {
    const now = new Date();
    const frequencyDays = {
      weekly: 7,
      'bi-weekly': 14,
      monthly: 30
    };
    const days = frequencyDays[settings.frequency];
    const nextDate = new Date(now.getTime() + days * TIME_MS.ONE_DAY);
    return nextDate.toISOString();
  }

  private logAudit(auditLog: ProgressReportAuditLog): void {
    try {
      const auditLogs = this.loadAuditLogs();
      auditLogs.push(auditLog);

      const maxLogs = 1000;
      if (auditLogs.length > maxLogs) {
        auditLogs.splice(0, auditLogs.length - maxLogs);
      }

      localStorage.setItem(STORAGE_KEYS.PROGRESS_REPORT_AUTO_GENERATION_AUDIT, JSON.stringify(auditLogs));
    } catch (error) {
      logger.error('Failed to log progress report audit:', error);
    }
  }

  private loadAuditLogs(): ProgressReportAuditLog[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS_REPORT_AUTO_GENERATION_AUDIT);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Failed to load audit logs:', error);
      return [];
    }
  }

  public getAuditLogs(): ProgressReportAuditLog[] {
    return this.loadAuditLogs();
  }

  public clearAuditLogs(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROGRESS_REPORT_AUTO_GENERATION_AUDIT);
      logger.info('Progress report audit logs cleared');
    } catch (error) {
      logger.error('Failed to clear audit logs:', error);
    }
  }

  public getAuditStats(): {
    totalGenerated: number;
    totalEmailsSent: number;
    totalEmailsFailed: number;
    byDate: Record<string, number>;
    lastGeneratedAt?: string;
  } {
    const logs = this.loadAuditLogs();
    const totalGenerated = logs.filter(l => l.method === 'auto').length;
    const totalEmailsSent = logs.filter(l => l.emailSent).length;
    const totalEmailsFailed = logs.filter(l => !l.emailSent).length;

    const byDate: Record<string, number> = {};
    let lastGeneratedAt: string | undefined;

    for (const log of logs) {
      const date = log.generatedAt.split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;

      if (log.method === 'auto') {
        if (!lastGeneratedAt || new Date(log.generatedAt) > new Date(lastGeneratedAt)) {
          lastGeneratedAt = log.generatedAt;
        }
      }
    }

    return {
      totalGenerated,
      totalEmailsSent,
      totalEmailsFailed,
      byDate,
      lastGeneratedAt
    };
  }
}

export const progressReportScheduler = new ProgressReportScheduler();
