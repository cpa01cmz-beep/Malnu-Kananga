// parentGradeNotificationService.ts - Service for parent grade notifications
// Integrates with push notification service and event notifications hook

import { pushNotificationService } from './pushNotificationService';
import { logger } from '../utils/logger';
import type { PushNotification } from '../types';
import type { Grade, ParentChild } from '../types';

export interface ParentGradeNotificationSettings {
  enabled: boolean;
  gradeThreshold: number; // Notify if grade < threshold
  subjects: string[]; // Subjects to monitor (empty = all)
  frequency: 'immediate' | 'daily_digest' | 'weekly_summary';
  majorExamsOnly: boolean;
  missingGradeAlert: boolean;
  missingGradeDays: number; // Alert if missing for X days
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
}

export interface GradeNotificationData {
  studentName: string;
  subject: string;
  grade: number;
  maxScore: number;
  assignmentType: string;
  assignmentName: string;
  previousGrade?: number;
  isMajorExam: boolean;
  isBelowThreshold: boolean;
  daysMissing?: number;
}

export interface QueuedNotification {
  id: string;
  studentId: string;
  data: GradeNotificationData;
  timestamp: number;
  scheduledFor: number;
  frequency: 'immediate' | 'daily_digest' | 'weekly_summary';
  sent: boolean;
}

class ParentGradeNotificationService {
  private notificationQueue: QueuedNotification[] = [];
  private lastGradeCheck: Map<string, number> = new Map();
  private digestTimers: Map<string, ReturnType<typeof setInterval>> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      this.loadSettings();
      this.loadNotificationQueue();
      this.setupDigestTimers();
      this.processScheduledNotifications(); // Process any existing deferred notifications
      this.setupScheduledNotificationCheck(); // Process scheduled notifications periodically
      logger.info('Parent grade notification service initialized');
    } catch (error) {
      logger.error('Failed to initialize parent grade notification service:', error);
    }
  }

  // Get parent-specific notification settings
  getSettings(): ParentGradeNotificationSettings {
    try {
      const stored = localStorage.getItem('malnu_parent_notification_settings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      logger.error('Failed to load parent notification settings:', error);
    }

    // Default settings
    return {
      enabled: true,
      gradeThreshold: 70,
      subjects: [],
      frequency: 'immediate',
      majorExamsOnly: false,
      missingGradeAlert: true,
      missingGradeDays: 7,
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:00'
      }
    };
  }

  // Save parent-specific notification settings
  saveSettings(settings: ParentGradeNotificationSettings): void {
    try {
      localStorage.setItem(
        'malnu_parent_notification_settings',
        JSON.stringify(settings)
      );
      logger.info('Parent notification settings saved');
    } catch (error) {
      logger.error('Failed to save parent notification settings:', error);
    }
  }

  // Load settings from storage
  private loadSettings(): void {
    this.getSettings(); // Called to initialize if not present
  }

  // Load queued notifications from storage
  private loadNotificationQueue(): void {
    try {
      const stored = localStorage.getItem('malnu_parent_notification_queue');
      if (stored) {
        this.notificationQueue = JSON.parse(stored);
      }
    } catch (error) {
      logger.error('Failed to load notification queue:', error);
    }
  }

  // Save queued notifications to storage
  private saveNotificationQueue(): void {
    try {
      localStorage.setItem(
        'malnu_parent_notification_queue',
        JSON.stringify(this.notificationQueue)
      );
    } catch (error) {
      logger.error('Failed to save notification queue:', error);
    }
  }

  // Main method to process grade updates and trigger notifications
  async processGradeUpdate(
    child: ParentChild,
    grade: Grade,
    previousGrade?: Grade
  ): Promise<void> {
    try {
      const settings = this.getSettings();
      if (!settings.enabled) {
        logger.info('Parent grade notifications disabled');
        return;
      }

      // Check if we should notify for this subject
      if (settings.subjects.length > 0 && !settings.subjects.includes(grade.subjectId)) {
        logger.info(`Subject ${grade.subjectId} not in notification filter`);
        return;
      }

      const gradeData: GradeNotificationData = {
        studentName: child.studentName,
        subject: grade.subjectName || grade.subjectId,
        grade: grade.score,
        maxScore: grade.maxScore,
        assignmentType: grade.assignmentType,
        assignmentName: grade.assignmentName,
        previousGrade: previousGrade?.score,
        isMajorExam: this.isMajorExam(grade.assignmentType),
        isBelowThreshold: grade.score < (grade.maxScore * settings.gradeThreshold / 100),
      };

      // Check if notification is warranted
      if (!this.shouldNotify(settings, gradeData, previousGrade)) {
        return;
      }

      // Check quiet hours
      if (this.isQuietHours(settings.quietHours) && settings.frequency === 'immediate') {
        logger.info('Quiet hours active, deferring notification');
        // Schedule for after quiet hours end
        const quietEnd = new Date();
        const [endHour, endMin] = settings.quietHours.end.split(':').map(Number);
        quietEnd.setHours(endHour, endMin, 0, 0);
        if (quietEnd <= new Date()) {
          quietEnd.setDate(quietEnd.getDate() + 1);
        }
        this.queueScheduledNotification(child.studentId, gradeData, quietEnd.getTime());
        return;
      }

      // Process based on frequency
      switch (settings.frequency) {
        case 'immediate':
          await this.sendImmediateNotification(gradeData);
          break;
        case 'daily_digest':
          this.queueDigestNotification('daily', child.studentId, gradeData);
          break;
        case 'weekly_summary':
          this.queueDigestNotification('weekly', child.studentId, gradeData);
          break;
      }

      // Update last grade check timestamp
      this.lastGradeCheck.set(`${child.studentId}_${grade.subjectId}`, Date.now());

    } catch (error) {
      logger.error('Failed to process grade update:', error);
    }
  }

  // Check if notification should be sent
  private shouldNotify(
    settings: ParentGradeNotificationSettings,
    gradeData: GradeNotificationData,
    previousGrade?: Grade
  ): boolean {
    // New grade notification
    if (!previousGrade) {
      return true;
    }

    // Grade changed notification
    if (previousGrade && previousGrade.score !== gradeData.grade) {
      return true;
    }

    // Below threshold
    if (gradeData.isBelowThreshold) {
      return true;
    }

    // Major exams only setting
    if (settings.majorExamsOnly && !gradeData.isMajorExam) {
      return false;
    }

    return true;
  }

  // Check if assignment is a major exam
  private isMajorExam(assignmentType: string): boolean {
    const majorExamTypes = ['mid_exam', 'final_exam', 'uts', 'uas', 'final_test'];
    return majorExamTypes.some(type => 
      assignmentType.toLowerCase().includes(type)
    );
  }

  // Check if current time is within quiet hours
  private isQuietHours(quietHours: ParentGradeNotificationSettings['quietHours']): boolean {
    if (!quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = quietHours.start.split(':').map(Number);
    const [endHour, endMin] = quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    }
    
    return currentTime >= startTime && currentTime < endTime;
  }

  // Send immediate notification
  private async sendImmediateNotification(gradeData: GradeNotificationData): Promise<void> {
    try {
      const notification = this.createGradeNotification(gradeData);
      await pushNotificationService.showLocalNotification(notification);
      
      logger.info('Grade notification sent:', gradeData.studentName, gradeData.subject);
    } catch (error) {
      logger.error('Failed to send grade notification:', error);
    }
  }

  // Create push notification object
  private createGradeNotification(gradeData: GradeNotificationData): PushNotification {
    const data = gradeData;
    
    let title = `Grade Update: ${data.subject}`;
    let body = `${data.studentName}: ${data.grade}/${data.maxScore} - ${data.assignmentName}`;

    // Customize message based on situation
    if (data.previousGrade && data.previousGrade !== data.grade) {
      const difference = data.grade - data.previousGrade;
      const trend = difference > 0 ? 'improved' : difference < 0 ? 'decreased' : 'unchanged';
      body += ` (${trend})`;
    }

    if (data.isBelowThreshold) {
      title = `⚠️ Low Grade Alert`;
      body = `${data.studentName} scored ${data.grade}/${data.maxScore} in ${data.subject}`;
    }

    if (data.isMajorExam) {
      title = `📊 ${data.assignmentType} Results`;
      body = `${data.studentName}: ${data.grade}/${data.maxScore} in ${data.subject}`;
    }

    return {
      id: `grade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'grade',
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      priority: data.isBelowThreshold ? 'high' : 'normal',
      targetRoles: ['parent'],
      data: {
        type: 'grade_notification',
        studentName: data.studentName,
        subject: data.subject,
        grade: data.grade,
        maxScore: data.maxScore,
        assignmentType: data.assignmentType,
        assignmentName: data.assignmentName,
        url: `/parent/grades?student=${data.studentName}`
      }
    };
  }

  // Queue scheduled notification (for quiet hours)
  private queueScheduledNotification(
    studentId: string,
    gradeData: GradeNotificationData,
    scheduledFor: number
  ): void {
    const id = `deferred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const notification: QueuedNotification = {
      id,
      studentId,
      data: gradeData,
      timestamp: now,
      scheduledFor,
      frequency: 'immediate',
      sent: false
    };

    this.notificationQueue.push(notification);
    this.saveNotificationQueue();
    logger.info('Notification deferred until after quiet hours');
  }

  // Queue digest notification
  private queueDigestNotification(
    frequency: 'daily' | 'weekly',
    studentId: string,
    gradeData: GradeNotificationData
  ): void {
    const id = `digest-${frequency}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const scheduledFor = frequency === 'daily' 
      ? now + (24 * 60 * 60 * 1000) // 24 hours
      : now + (7 * 24 * 60 * 60 * 1000); // 7 days

    const notification: QueuedNotification = {
      id,
      studentId,
      data: gradeData,
      timestamp: now,
      scheduledFor,
      frequency: `${frequency}_digest` as 'immediate' | 'daily_digest' | 'weekly_summary',
      sent: false
    };

    this.notificationQueue.push(notification);
    this.saveNotificationQueue();
  }

  // Setup digest timers
  private setupDigestTimers(): void {
    // Setup daily digest timer
    const dailyTimer = setInterval(() => {
      this.processDigestNotifications('daily');
    }, 24 * 60 * 60 * 1000); // Daily

    // Setup weekly digest timer  
    const weeklyTimer = setInterval(() => {
      this.processDigestNotifications('weekly');
    }, 7 * 24 * 60 * 60 * 1000); // Weekly

    this.digestTimers.set('daily', dailyTimer);
    this.digestTimers.set('weekly', weeklyTimer);
  }

  // Setup scheduled notification check
  private setupScheduledNotificationCheck(): void {
    // Check every minute for scheduled notifications that are ready
    setInterval(() => {
      this.processScheduledNotifications();
    }, 60 * 1000); // Every minute
  }

  // Process notifications that are scheduled to be sent now
  private async processScheduledNotifications(): Promise<void> {
    try {
      const now = Date.now();
      const readyNotifications = this.notificationQueue.filter(n => 
        !n.sent && 
        n.scheduledFor <= now &&
        n.frequency === 'immediate'
      );

      if (readyNotifications.length === 0) return;

      for (const notification of readyNotifications) {
        await this.sendImmediateNotification(notification.data);
        notification.sent = true;
      }

      this.saveNotificationQueue();
      logger.info(`Processed ${readyNotifications.length} scheduled notifications`);

    } catch (error) {
      logger.error('Failed to process scheduled notifications:', error);
    }
  }

  // Process digest notifications
  private async processDigestNotifications(frequency: 'daily' | 'weekly'): Promise<void> {
    try {
      const now = Date.now();
      const notifications = this.notificationQueue.filter(n => 
        !n.sent && 
        n.frequency === `${frequency}_digest` && 
        n.scheduledFor <= now
      );

      if (notifications.length === 0) return;

      // Group by student
      const byStudent = new Map<string, QueuedNotification[]>();
      notifications.forEach(n => {
        if (!byStudent.has(n.studentId)) {
          byStudent.set(n.studentId, []);
        }
        byStudent.get(n.studentId)!.push(n);
      });

      // Send digest for each student
      for (const [studentId, studentNotifications] of byStudent) {
        await this.sendDigestNotification(frequency, studentId, studentNotifications);
      }

      // Mark as sent
      notifications.forEach(n => n.sent = true);
      this.saveNotificationQueue();

    } catch (error) {
      logger.error('Failed to process digest notifications:', error);
    }
  }

  // Send digest notification
  private async sendDigestNotification(
    frequency: 'daily' | 'weekly',
    studentId: string,
    notifications: QueuedNotification[]
  ): Promise<void> {
    try {
      const studentName = notifications[0].data.studentName;
      const subjects = [...new Set(notifications.map(n => n.data.subject))];
      const belowThresholdCount = notifications.filter(n => n.data.isBelowThreshold).length;
      const majorExamCount = notifications.filter(n => n.data.isMajorExam).length;

      const title = `${frequency === 'daily' ? 'Daily' : 'Weekly'} Grade Summary - ${studentName}`;
      let body = `${notifications.length} grade updates in ${subjects.join(', ')}`;

      if (belowThresholdCount > 0) {
        body += `. ${belowThresholdCount} below threshold`;
      }

      if (majorExamCount > 0) {
        body += `. ${majorExamCount} major exams`;
      }

      const notification: PushNotification = {
        id: `digest-${frequency}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'grade',
        title,
        body,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
        targetRoles: ['parent'],
        data: {
          type: 'grade_digest',
          frequency,
          studentName,
          updatesCount: notifications.length,
          subjects,
          belowThresholdCount,
          majorExamCount,
          url: `/parent/grades?student=${studentId}`
        }
      };

      await pushNotificationService.showLocalNotification(notification);
      logger.info(`${frequency} digest sent for ${studentName}`);

    } catch (error) {
      logger.error('Failed to send digest notification:', error);
    }
  }

  // Check for missing grades and send alerts
  async checkMissingGrades(children: ParentChild[]): Promise<void> {
    try {
      const settings = this.getSettings();
      if (!settings.enabled || !settings.missingGradeAlert) {
        return;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - settings.missingGradeDays);

      for (const child of children) {
        // In a real implementation, this would check with the API
        // For now, we'll log the intended behavior
        logger.info(`Checking for missing grades for ${child.studentName} since ${cutoffDate.toISOString()}`);
        
        // TODO: Implement actual missing grade check
        // This would involve:
        // 1. Fetching expected assignments for the period
        // 2. Checking which ones don't have grades
        // 3. Sending appropriate notifications
      }
    } catch (error) {
      logger.error('Failed to check missing grades:', error);
    }
  }

  // Get notification history for a specific student
  getNotificationHistory(_studentId: string): PushNotification[] {
    try {
      const history = pushNotificationService.getHistory();
      return history.filter(item => 
        item.notification.type === 'grade' &&
        item.notification.data?.studentName &&
        item.notification.data?.type === 'grade_notification'
      ).map(item => item.notification);
    } catch (error) {
      logger.error('Failed to get notification history:', error);
      return [];
    }
  }

  // Clear notification queue
  clearQueue(): void {
    this.notificationQueue = [];
    this.saveNotificationQueue();
    logger.info('Grade notification queue cleared');
  }

  // Get queue statistics
  getQueueStats(): { pending: number; scheduled: number; sent: number } {
    const now = Date.now();
    const pending = this.notificationQueue.filter(n => !n.sent && n.scheduledFor <= now).length;
    const scheduled = this.notificationQueue.filter(n => !n.sent && n.scheduledFor > now).length;
    const sent = this.notificationQueue.filter(n => n.sent).length;

    return { pending, scheduled, sent };
  }
}

export const parentGradeNotificationService = new ParentGradeNotificationService();