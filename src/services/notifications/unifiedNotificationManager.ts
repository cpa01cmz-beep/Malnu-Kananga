import {
  NotificationSettings,
  PushNotification,
  NotificationHistoryItem,
  NotificationBatch,
  NotificationAnalytics,
  NotificationType,
  UserRole,
  UserExtraRole,
  OCRValidationEvent,
  VoiceNotification,
} from '../../types';
import {
  NOTIFICATION_CONFIG,
  NOTIFICATION_ICONS,
  STORAGE_KEYS,
  USER_ROLES,
} from '../../constants';
import { logger } from '../../utils/logger';
import { handleNotificationError } from '../../utils/serviceErrorHandlers';
import { VoiceNotificationHandler } from './voiceNotificationHandler';
import { PushNotificationHandler } from './pushNotificationHandler';
import { EmailNotificationHandler } from './emailNotificationHandler';
import { NotificationHistoryHandler } from './notificationHistoryHandler';
import { NotificationAnalyticsHandler } from './notificationAnalyticsHandler';
import { NotificationTemplatesHandler, UnifiedNotificationTemplate } from './notificationTemplatesHandler';
import { idGenerators } from '../../utils/idGenerator';

export type { UnifiedNotificationTemplate } from './notificationTemplatesHandler';

declare global {
  interface PushSubscription {
    readonly endpoint: string;
    readonly expirationTime: number | null;
    readonly options: PushSubscriptionOptions;
    getKey(name: 'p256dh' | 'auth'): ArrayBuffer | null;
    unsubscribe(): Promise<boolean>;
  }

  interface PushSubscriptionOptions {
    readonly userVisibleOnly: boolean;
    readonly applicationServerKey: ArrayBuffer | null;
  }
}

export interface NotificationEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface UnifiedNotificationSettings extends NotificationSettings {
  voice?: {
    enabled: boolean;
    rate: number;
    pitch: number;
    volume: number;
    language: string;
  };
  templates?: Record<string, UnifiedNotificationTemplate>;
}

class UnifiedNotificationManager {
  private pushHandler: PushNotificationHandler;
  private emailHandler: EmailNotificationHandler;
  private historyHandler: NotificationHistoryHandler;
  private analyticsHandler: NotificationAnalyticsHandler;
  private templatesHandler: NotificationTemplatesHandler;
  private voiceHandler: VoiceNotificationHandler;
  private batches: Map<string, NotificationBatch> = new Map();
  private eventListeners: Map<string, Set<(event: NotificationEvent) => void>> = new Map();

  constructor() {
    this.pushHandler = new PushNotificationHandler();
    this.emailHandler = new EmailNotificationHandler();
    this.historyHandler = new NotificationHistoryHandler();
    this.analyticsHandler = new NotificationAnalyticsHandler();
    this.templatesHandler = new NotificationTemplatesHandler();
    this.voiceHandler = new VoiceNotificationHandler();

    setTimeout(() => {
      this.initialize();
    }, 0);
  }

  private initialize(): void {
    try {
      this.loadBatches();
    } catch (error) {
      logger.error('Failed to load batches during initialization:', error);
    }
  }

  private loadBatches(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_BATCHES);
      if (stored) {
        const batches: NotificationBatch[] = JSON.parse(stored);
        batches.forEach(batch => this.batches.set(batch.id, batch));
      }
    } catch (error) {
      logger.error('Failed to load batches:', error);
    }
  }

  private saveBatches(): void {
    try {
      const batches = Array.from(this.batches.values());
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_BATCHES, JSON.stringify(batches));
    } catch (error) {
      logger.error('Failed to save batches:', error);
    }
  }

  private shouldShowNotification(notification: PushNotification, settings: UnifiedNotificationSettings): boolean {
    if (!settings.enabled) {
      return false;
    }

    if (settings.roleBasedFiltering && !this.isNotificationForCurrentUser(notification)) {
      return false;
    }

    switch (notification.type) {
      case 'announcement':
        return settings.announcements;
      case 'grade':
        return settings.grades;
      case 'ppdb':
        return settings.ppdbStatus;
      case 'event':
        return settings.events;
      case 'library':
        return settings.library;
      case 'system':
        return settings.system;
      case 'ocr':
        return settings.ocr;
      default:
        return true;
    }
  }

  private isNotificationForCurrentUser(notification: PushNotification): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return true;

    if (notification.targetUsers && notification.targetUsers.length > 0) {
      return notification.targetUsers.includes(currentUser.id);
    }

    if (notification.targetRoles && !notification.targetRoles.includes(currentUser.role)) {
      return false;
    }

    if (notification.targetExtraRoles && notification.targetExtraRoles.length > 0) {
      return currentUser.extraRole && notification.targetExtraRoles.includes(currentUser.extraRole);
    }

    return true;
  }

  private getCurrentUser() {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  private triggerVoiceNotification(notification: PushNotification): void {
    try {
      const voiceSuccess = this.voiceHandler.announceNotification(notification);
      if (voiceSuccess) {
        logger.info('Voice notification triggered for:', notification.id);
      }
    } catch (error) {
      logger.error('Failed to trigger voice notification:', error);
    }
  }

  private handleNotificationClick(notification: PushNotification): void {
    try {
      this.historyHandler.markAsRead(notification.id);

      this.analyticsHandler.recordAnalytics(notification.id, 'clicked', this.getCurrentUser());

      if (notification.data && notification.data.url) {
        window.location.href = notification.data.url as string;
      }
    } catch (error) {
      logger.error('Failed to handle notification click:', error);
    }
  }

  private async showBatchedNotification(notification: PushNotification, batch: NotificationBatch): Promise<void> {
    try {
      const batchedNotification = {
        ...notification,
        data: {
          ...notification.data,
          batchId: batch.id,
          batchSize: batch.notifications.length,
          isBatched: true,
        },
        title: notification.title.includes(`[${batch.notifications.length}]`)
          ? notification.title
          : `[${batch.notifications.length}] ${notification.title}`,
      };

      await this.showNotification(batchedNotification);
    } catch (error) {
      logger.error('Error in showBatchedNotification:', error);
    }
  }

  async showNotification(notification: PushNotification): Promise<void> {
    try {
      if (!this.pushHandler.isPermissionGranted()) {
        const granted = await this.pushHandler.requestPermission();
        if (!granted) {
          throw handleNotificationError(new Error('Permission denied'), 'showNotification');
        }
      }

      const settings = this.getUnifiedSettings();

      if (!this.shouldShowNotification(notification, settings)) {
        logger.info('Notification filtered by settings or quiet hours');
        return;
      }

      // eslint-disable-next-line no-undef
      const notif = new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || NOTIFICATION_ICONS.DEFAULT,
        badge: NOTIFICATION_ICONS.DEFAULT,
        tag: notification.id,
        requireInteraction: notification.priority === 'high',
        vibrate: [...NOTIFICATION_CONFIG.VIBRATION_PATTERN],
        data: notification.data as Record<string, unknown>,
      });

      notif.onclick = () => {
        this.handleNotificationClick(notification);
        notif.close();
      };

      this.historyHandler.addToHistory(notification);
      this.analyticsHandler.recordAnalytics(notification.id, 'delivered', this.getCurrentUser());

      this.triggerVoiceNotification(notification);

      await this.emailHandler.sendEmailNotification(notification);

      logger.info('Notification displayed:', notification.title);
    } catch (error) {
      logger.error('Failed to show notification:', error);
    }
  }

  async showLocalNotification(notification: PushNotification): Promise<void> {
    return this.showNotification(notification);
  }

  async notifyGradeUpdate(
    studentName: string,
    subject: string,
    previousGrade?: number,
    newGrade?: number
  ): Promise<void> {
    try {
      let body = `Nilai ${studentName} untuk ${subject}`;

      if (previousGrade !== undefined && newGrade !== undefined) {
        const difference = newGrade - previousGrade;
        const trend = difference > 0 ? 'naik' : difference < 0 ? 'turun' : 'tetap';
        body += ` ${trend} dari ${previousGrade} ke ${newGrade}`;
      } else if (newGrade !== undefined) {
        body += `: ${newGrade}`;
      }

      const notification: PushNotification = {
        id: `notif-grade-${Date.now()}`,
        type: 'grade',
        title: `Nilai Update: ${subject}`,
        body,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
        targetRoles: [USER_ROLES.STUDENT, USER_ROLES.PARENT, USER_ROLES.TEACHER],
        data: {
          type: 'grade_update' as const,
          studentName,
          subject,
          previousGrade,
          newGrade,
        },
      };

      await this.showNotification(notification);
      this.emitEvent('grade_update', notification.data || {});
    } catch (error) {
      logger.error('Error in notifyGradeUpdate:', error);
    }
  }

  async notifyPPDBStatus(count: number): Promise<void> {
    try {
      if (count <= 0) return;

      const notification: PushNotification = {
        id: `notif-ppdb-${Date.now()}`,
        type: 'ppdb',
        title: 'Pendaftaran Baru PPDB',
        body: `Ada ${count} pendaftaran PPDB yang menunggu persetujuan`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high',
        targetRoles: [USER_ROLES.ADMIN],
        data: {
          type: 'ppdb_update' as const,
          count,
        },
      };

      await this.showNotification(notification);
      this.emitEvent('ppdb_update', notification.data || {});
    } catch (error) {
      logger.error('Error in notifyPPDBStatus:', error);
    }
  }

  async notifyLibraryUpdate(materialTitle: string, materialType: string): Promise<void> {
    try {
      const notification: PushNotification = {
        id: `notif-library-${Date.now()}`,
        type: 'library',
        title: 'Materi Baru',
        body: `${materialType}: ${materialTitle} tersedia di e-library`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'low',
        targetRoles: [USER_ROLES.TEACHER, USER_ROLES.STUDENT],
        data: {
          type: 'library_update' as const,
          materialTitle,
          materialType,
        },
      };

      await this.showNotification(notification);
      this.emitEvent('library_update', notification.data || {});
    } catch (error) {
      logger.error('Error in notifyLibraryUpdate:', error);
    }
  }

  async notifyMeetingRequest(requesterName: string, meetingType: string): Promise<void> {
    try {
      const notification: PushNotification = {
        id: `notif-meeting-${Date.now()}`,
        type: 'event',
        title: 'Permintaan Pertemuan',
        body: `${requesterName} meminta ${meetingType.toLowerCase()}`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
        targetRoles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER],
        data: {
          type: 'meeting_request' as const,
          requesterName,
          meetingType,
        },
      };

      await this.showNotification(notification);
      this.emitEvent('meeting_request', notification.data || {});
    } catch (error) {
      logger.error('Error in notifyMeetingRequest:', error);
    }
  }

  async notifyScheduleChange(className: string, changeType: string): Promise<void> {
    try {
      const notification: PushNotification = {
        id: `notif-schedule-${Date.now()}`,
        type: 'announcement',
        title: 'Perubahan Jadwal',
        body: `Jadwal ${className}: ${changeType}`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
        targetRoles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT],
        data: {
          type: 'schedule_change' as const,
          className,
          changeType,
        },
      };

      await this.showNotification(notification);
      this.emitEvent('schedule_change', notification.data || {});
    } catch (error) {
      logger.error('Error in notifyScheduleChange:', error);
    }
  }

  async notifyAttendanceAlert(studentName: string, alertType: string): Promise<void> {
    try {
      const notification: PushNotification = {
        id: `notif-attendance-${Date.now()}`,
        type: 'system',
        title: 'Alert Kehadiran',
        body: `${studentName}: ${alertType}`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high',
        targetRoles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER],
        data: {
          type: 'attendance_alert' as const,
          studentName,
          alertType,
        },
      };

      await this.showNotification(notification);
      this.emitEvent('attendance_alert', notification.data || {});
    } catch (error) {
      logger.error('Error in notifyAttendanceAlert:', error);
    }
  }

  async notifyOCRValidation(event: OCRValidationEvent): Promise<void> {
    try {
      const severity = event.type === 'validation-failure' ? 'Gagal' :
                      event.type === 'validation-warning' ? 'Peringatan' : 'Berhasil';

      const notification: PushNotification = {
        id: `notif-ocr-${Date.now()}`,
        type: 'ocr',
        title: `Validasi OCR ${severity}`,
        body: `Dokumen ${event.documentType} - Confidence: ${event.confidence}%. ${event.issues.length > 0 ? `Issues: ${event.issues.join(', ')}` : 'Validasi berhasil'}`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
        targetRoles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER],
        data: {
          type: 'ocr_validation' as const,
          documentId: event.documentId,
          documentType: event.documentType,
          confidence: event.confidence,
          severity: event.type,
          issues: event.issues,
          userId: event.userId,
          userRole: event.userRole,
          actionUrl: event.actionUrl,
          requiresReview: event.type === 'validation-failure',
        },
      };

      await this.showNotification(notification);
      this.emitEvent('ocr_validation', notification.data || {});
    } catch (error) {
      logger.error('Error in notifyOCRValidation:', error);
    }
  }

  async registerEventListener(eventType: string, listener: (event: NotificationEvent) => void): Promise<void> {
    this.addEventListener(eventType, listener);
  }

  addEventListener(eventType: string, listener: (event: NotificationEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  removeEventListener(eventType: string, listener: (event: NotificationEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventType);
      }
    }
  }

  private emitEvent(type: string, data: Record<string, unknown>): void {
    const event: NotificationEvent = {
      id: idGenerators.event(),
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          logger.error(`Error in event listener for ${type}:`, error);
        }
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(type, { detail: data }));
    }
  }

  getUnifiedSettings(): UnifiedNotificationSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      logger.error('Failed to load unified notification settings:', error);
    }

    const defaultSettings: UnifiedNotificationSettings = {
      ...NOTIFICATION_CONFIG.DEFAULT_SETTINGS,
      voice: {
        enabled: true,
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8,
        language: 'id-ID',
      },
    };

    return defaultSettings;
  }

  saveUnifiedSettings(settings: UnifiedNotificationSettings): void {
    try {
      if (settings.voice) {
        localStorage.setItem(STORAGE_KEYS.VOICE_STORAGE_KEY, JSON.stringify(settings.voice));
      }

      const settingsWithoutVoice = { ...settings };
      delete settingsWithoutVoice.voice;

      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_SETTINGS_KEY,
        JSON.stringify(settingsWithoutVoice)
      );
      logger.info('Unified notification settings saved');
    } catch (error) {
      logger.error('Failed to save unified notification settings:', error);
    }
  }

  createBatch(name: string, notifications: PushNotification[]): NotificationBatch {
    const batch: NotificationBatch = {
      id: idGenerators.batch(),
      name,
      notifications,
      scheduledFor: new Date().toISOString(),
      deliveryMethod: 'manual',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.batches.set(batch.id, batch);
    this.saveBatches();
    logger.info('Notification batch created:', batch.id);
    return batch;
  }

  async sendBatch(batchId: string): Promise<boolean> {
    const batch = this.batches.get(batchId);
    if (!batch) {
      logger.error('Batch not found:', batchId);
      return false;
    }

    batch.status = 'processing';
    this.saveBatches();

    const settings = this.getUnifiedSettings();
    let successCount = 0;
    let failureCount = 0;

    for (const notification of batch.notifications) {
      try {
        if (settings.batchNotifications) {
          await this.showBatchedNotification(notification, batch);
        } else {
          await this.showNotification(notification);
        }
        successCount++;
      } catch (error) {
        logger.error('Failed to send notification in batch:', error);
        failureCount++;
      }
    }

    batch.status = failureCount === 0 ? 'completed' : 'failed';
    batch.sentAt = new Date().toISOString();
    if (failureCount > 0) {
      batch.failureReason = `${failureCount} notifications failed`;
    }

    this.saveBatches();
    logger.info(`Batch ${batchId} completed: ${successCount} success, ${failureCount} failures`);
    return failureCount === 0;
  }

  getBatches(): NotificationBatch[] {
    return Array.from(this.batches.values());
  }

  getTemplates(): UnifiedNotificationTemplate[] {
    return this.templatesHandler.getTemplates();
  }

  createTemplate(
    name: string,
    type: NotificationType,
    title: string,
    body: string,
    variables: string[] = [],
    targetRoles?: UserRole[],
    targetExtraRoles?: UserExtraRole[]
  ): UnifiedNotificationTemplate {
    return this.templatesHandler.createTemplate(
      name,
      type,
      title,
      body,
      this.getCurrentUser(),
      variables,
      targetRoles,
      targetExtraRoles
    );
  }

  createNotificationFromTemplate(
    templateId: string,
    variables: Record<string, string | number> = {}
  ): PushNotification | null {
    return this.templatesHandler.createNotificationFromTemplate(templateId, variables);
  }

  getAnalytics(): NotificationAnalytics[] {
    return this.analyticsHandler.getAnalytics();
  }

  recordAnalytics(notificationId: string, action: 'delivered' | 'read' | 'clicked' | 'dismissed'): void {
    this.analyticsHandler.recordAnalytics(notificationId, action, this.getCurrentUser());
  }

  clearAnalytics(): void {
    this.analyticsHandler.clearAnalytics();
  }

  isPermissionGranted(): boolean {
    // eslint-disable-next-line no-undef
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  }

  isPermissionDenied(): boolean {
    // eslint-disable-next-line no-undef
    return typeof Notification !== 'undefined' && Notification.permission === 'denied';
  }

  async requestPermission(): Promise<boolean> {
    return this.pushHandler.requestPermission();
  }

  /* eslint-disable no-undef */
  async subscribeToPush(applicationServerKey: string): Promise<PushSubscription | null> {
    return this.pushHandler.subscribeToPush(applicationServerKey);
  }

  async unsubscribeFromPush(): Promise<boolean> {
    return this.pushHandler.unsubscribeFromPush();
  }

  getCurrentSubscription(): PushSubscription | null {
    return this.pushHandler.getCurrentSubscription();
  }
  /* eslint-enable no-undef */

  getUnifiedHistory(limit: number = 20): NotificationHistoryItem[] {
    return this.historyHandler.getUnifiedHistory(limit);
  }

  clearUnifiedHistory(): void {
    this.historyHandler.clearUnifiedHistory();
  }

  markAsRead(notificationId: string): void {
    this.historyHandler.markAsRead(notificationId);
  }

  deleteFromHistory(notificationId: string): void {
    this.historyHandler.deleteFromHistory(notificationId);
  }

  getSettings(): NotificationSettings {
    const unified = this.getUnifiedSettings();
    const { voice: _voice, ...legacy } = unified;
    return legacy;
  }

  saveSettings(settings: NotificationSettings): void {
    this.saveUnifiedSettings(settings as UnifiedNotificationSettings);
  }

  getHistory(limit?: number): NotificationHistoryItem[] {
    return this.getUnifiedHistory(limit);
  }

  clearHistory(): void {
    this.clearUnifiedHistory();
  }

  resetSettings(): void {
    this.saveUnifiedSettings({
      ...NOTIFICATION_CONFIG.DEFAULT_SETTINGS,
      voice: {
        enabled: true,
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8,
        language: 'id-ID',
      },
    });
    logger.info('Unified notification settings reset to default');
  }

  createNotificationFromTemplateId(
    templateId: string,
    variables: Record<string, string | number> = {}
  ): PushNotification | null {
    return this.createNotificationFromTemplate(templateId, variables);
  }

  stopCurrentVoiceNotification(): void {
    this.voiceHandler.stopCurrentVoiceNotification();
  }

  skipCurrentVoiceNotification(): void {
    this.voiceHandler.skipCurrentVoiceNotification();
  }

  clearVoiceQueue(): void {
    this.voiceHandler.clearVoiceQueue();
  }

  getVoiceQueue(): VoiceNotification[] {
    return this.voiceHandler.getVoiceQueue();
  }

  getVoiceHistory(): VoiceNotification[] {
    return this.voiceHandler.getVoiceHistory();
  }

  clearVoiceHistory(): void {
    this.voiceHandler.clearVoiceHistory();
  }

  isCurrentlySpeaking(): boolean {
    return this.voiceHandler.isCurrentlySpeaking();
  }

  async cleanup(): Promise<void> {
    this.batches.clear();
    this.eventListeners.clear();
    this.pushHandler.cleanup();
    this.emailHandler.cleanup();
    this.historyHandler.cleanup();
    this.analyticsHandler.cleanup();
    this.templatesHandler.cleanup();
    this.voiceHandler.cleanup();
    logger.info('Unified notification manager cleaned up');
  }
}

export const unifiedNotificationManager = new UnifiedNotificationManager();
