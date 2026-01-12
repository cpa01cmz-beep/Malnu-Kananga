import {
  NotificationSettings,
  PushNotification,
  NotificationHistoryItem,
  NotificationBatch,
  NotificationAnalytics,
  UserRole,
  UserExtraRole,
  NotificationType,
  OCRValidationEvent,
  VoiceNotification,
  VoiceNotificationCategory
} from '../types';
import {
  NOTIFICATION_CONFIG,
  NOTIFICATION_ERROR_MESSAGES,
  NOTIFICATION_ICONS,
  STORAGE_KEYS,
  VOICE_NOTIFICATION_CONFIG
} from '../constants';
import { logger } from '../utils/logger';
import { handleNotificationError } from '../utils/serviceErrorHandlers';
import SpeechSynthesisService from './speechSynthesisService';

/* eslint-disable no-undef */
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

export interface UnifiedNotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title: string;
  body: string;
  variables: string[];
  priority: 'low' | 'normal' | 'high';
  isActive: boolean;
  targetRoles?: UserRole[];
  targetExtraRoles?: UserExtraRole[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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

export interface NotificationEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

class UnifiedNotificationManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private batches: Map<string, NotificationBatch> = new Map();
  private templates: Map<string, UnifiedNotificationTemplate> = new Map();
  private analytics: Map<string, NotificationAnalytics> = new Map();
  private eventListeners: Map<string, Set<(event: NotificationEvent) => void>> = new Map();
  private defaultTemplates: Map<NotificationType, UnifiedNotificationTemplate> = new Map();
  private voiceQueue: VoiceNotification[] = [];
  private voiceHistory: VoiceNotification[] = [];
  private isProcessingVoice: boolean = false;
  private synthesisService: SpeechSynthesisService;

  constructor() {
    this.synthesisService = new SpeechSynthesisService();
    this.initializeDefaultTemplates();
    this.setupVoiceHandlers();
    setTimeout(() => {
      this.initialize();
    }, 0);
  }

  private initializeDefaultTemplates(): void {
    // Define default templates that match the existing notificationTemplates.ts structure
    const defaults: Record<NotificationType, UnifiedNotificationTemplate> = {
      announcement: {
        id: 'default-announcement',
        name: 'Default Announcement',
        type: 'announcement',
        title: '📢 {{title}}',
        body: '{{content}}',
        variables: ['title', 'content'],
        priority: 'normal',
        isActive: true,
        targetRoles: ['admin', 'teacher', 'student', 'parent'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      grade: {
        id: 'default-grade',
        name: 'Default Grade Update',
        type: 'grade',
        title: '📊 Update Nilai: {{subject}}',
        body: 'Nilai {{assignment}} untuk {{studentName}} telah diperbarui: {{score}}/{{maxScore}}',
        variables: ['subject', 'assignment', 'studentName', 'score', 'maxScore'],
        priority: 'normal',
        isActive: true,
        targetRoles: ['student', 'parent', 'teacher'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ppdb: {
        id: 'default-ppdb',
        name: 'Default PPDB Status',
        type: 'ppdb',
        title: '🎓 Status PPDB: {{status}}',
        body: 'Pendaftaran PPDB untuk {{studentName}} sekarang berstatus: {{status}}. Silakan cek portal untuk informasi lebih lanjut.',
        variables: ['status', 'studentName'],
        priority: 'high',
        isActive: true,
        targetRoles: ['admin', 'student', 'parent'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      event: {
        id: 'default-event',
        name: 'Default Event',
        type: 'event',
        title: '🎉 Kegiatan Baru: {{title}}',
        body: '{{description}}\\nTanggal: {{date}}\\nLokasi: {{location}}',
        variables: ['title', 'description', 'date', 'location'],
        priority: 'normal',
        isActive: true,
        targetRoles: ['admin', 'teacher', 'student', 'parent'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      library: {
        id: 'default-library',
        name: 'Default Library Update',
        type: 'library',
        title: '📚 Materi Baru: {{title}}',
        body: 'Materi baru telah ditambahkan: {{description}}\\nKategori: {{category}}',
        variables: ['title', 'description', 'category'],
        priority: 'low',
        isActive: true,
        targetRoles: ['teacher', 'student'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      system: {
        id: 'default-system',
        name: 'Default System',
        type: 'system',
        title: '⚙️ {{title}}',
        body: '{{message}}',
        variables: ['title', 'message'],
        priority: 'high',
        isActive: true,
        targetRoles: ['admin', 'teacher', 'student', 'parent'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ocr: {
        id: 'default-ocr',
        name: 'Default OCR Validation',
        type: 'ocr',
        title: '📄 OCR Validation {{severity}}',
        body: 'Document "{{documentType}}" validation {{result}}. Confidence: {{confidence}}%. Issues: {{issues}}',
        variables: ['severity', 'documentType', 'result', 'confidence', 'issues'],
        priority: 'normal',
        isActive: true,
        targetRoles: ['admin', 'teacher'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ocr_validation: {
        id: 'default-ocr-validation',
        name: 'Default OCR Validation Complete',
        type: 'ocr_validation',
        title: '🔍 OCR Validation Complete',
        body: 'Document "{{documentType}}" validation {{status}}. {{message}}',
        variables: ['documentType', 'status', 'message'],
        priority: 'normal',
        isActive: true,
        targetRoles: ['parent', 'admin', 'teacher'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      missing_grades: {
        id: 'default-missing-grades',
        name: 'Default Missing Grades Alert',
        type: 'missing_grades',
        title: '⚠️ Missing Grades Alert',
        body: '{{studentName}} has potentially missing grades in {{missingCount}} subject(s): {{subjects}}',
        variables: ['studentName', 'missingCount', 'subjects'],
        priority: 'high',
        isActive: true,
        targetRoles: ['parent'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    Object.values(defaults).forEach(template => {
      this.defaultTemplates.set(template.type, template);
      this.templates.set(template.id, template);
    });
  }

  private initialize(): void {
    try {
      this.loadSubscription();
    } catch (error) {
      logger.error('Failed to load subscription during initialization:', error);
    }
    
    try {
      this.loadBatches();
    } catch (error) {
      logger.error('Failed to load batches during initialization:', error);
    }
    
    try {
      this.loadTemplates();
    } catch (error) {
      logger.error('Failed to load templates during initialization:', error);
    }
    
    try {
      this.loadAnalytics();
    } catch (error) {
      logger.error('Failed to load analytics during initialization:', error);
    }
  }

  // Voice Notification Queue Management
  private setupVoiceHandlers(): void {
    this.synthesisService.onStart(() => {
      logger.debug('Voice notification started');
    });

    this.synthesisService.onEnd(() => {
      this.isProcessingVoice = false;
      this.processVoiceQueue();
      logger.debug('Voice notification ended, processing next in queue');
    });

    this.synthesisService.onError((error) => {
      logger.error('Voice notification error:', error);
      this.isProcessingVoice = false;
      this.retryFailedVoiceNotification();
    });
  }

  private loadVoiceQueue(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VOICE_NOTIFICATIONS_QUEUE);
      if (stored) {
        this.voiceQueue = JSON.parse(stored);
        if (this.voiceQueue.length > VOICE_NOTIFICATION_CONFIG.MAX_QUEUE_SIZE) {
          this.voiceQueue = this.voiceQueue.slice(-VOICE_NOTIFICATION_CONFIG.MAX_QUEUE_SIZE);
        }
      }
    } catch (error) {
      logger.error('Failed to load voice notification queue:', error);
    }
  }

  private saveVoiceQueue(): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.VOICE_NOTIFICATIONS_QUEUE,
        JSON.stringify(this.voiceQueue)
      );
    } catch (error) {
      logger.error('Failed to save voice notification queue:', error);
    }
  }

  private loadVoiceHistory(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VOICE_NOTIFICATIONS_HISTORY);
      if (stored) {
        this.voiceHistory = JSON.parse(stored);
        if (this.voiceHistory.length > VOICE_NOTIFICATION_CONFIG.MAX_HISTORY_SIZE) {
          this.voiceHistory = this.voiceHistory.slice(-VOICE_NOTIFICATION_CONFIG.MAX_HISTORY_SIZE);
        }
      }
    } catch (error) {
      logger.error('Failed to load voice notification history:', error);
    }
  }

  private saveVoiceHistory(): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.VOICE_NOTIFICATIONS_HISTORY,
        JSON.stringify(this.voiceHistory)
      );
    } catch (error) {
      logger.error('Failed to save voice notification history:', error);
    }
  }

  private isQuietHours(): boolean {
    const settings = this.getUnifiedSettings();
    const quietHours = settings.quietHours;
    if (!settings.quietHours || !quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (quietHours.start > quietHours.end) {
      return currentTime >= quietHours.start || currentTime <= quietHours.end;
    } else {
      return currentTime >= quietHours.start && currentTime <= quietHours.end;
    }
  }

  private shouldVoiceAnnounce(notification: PushNotification): boolean {
    const settings = this.getUnifiedSettings();
    if (!settings.voice?.enabled) {
      return false;
    }

    if (this.isQuietHours()) {
      logger.debug('Voice notification suppressed during quiet hours');
      return false;
    }

    const type = notification.type as string;
    if (settings[type as keyof NotificationSettings] === false) {
      logger.debug(`Voice notification suppressed: ${type} type disabled`);
      return false;
    }

    return true;
  }

  private getVoiceNotificationCategory(notification: PushNotification): VoiceNotificationCategory {
    switch (notification.type) {
      case 'grade':
        return 'grade';
      case 'system':
        if (notification.body.toLowerCase().includes('kehadiran') ||
            notification.body.toLowerCase().includes('absen')) {
          return 'attendance';
        }
        if (notification.body.toLowerCase().includes('rapat') ||
            notification.body.toLowerCase().includes('meeting')) {
          return 'meeting';
        }
        return 'system';
      default:
        return 'system';
    }
  }

  private generateVoiceText(notification: PushNotification): string {
    const category = this.getVoiceNotificationCategory(notification);
    switch (category) {
      case 'grade':
        return `Perhatian. ${notification.title}. ${notification.body}. Nilai baru telah dipublikasikan.`;
      case 'attendance':
        return `Perhatian. ${notification.title}. ${notification.body}. Status kehadiran diperbarui.`;
      case 'meeting':
        return `Perhatian. ${notification.title}. ${notification.body}. Pengingat rapat.`;
      case 'system':
        return `Perhatian. ${notification.title}. ${notification.body}. Pesan sistem penting.`;
      default:
        return `${notification.title}. ${notification.body}.`;
    }
  }

  private createVoiceNotification(pushNotification: PushNotification): VoiceNotification {
    return {
      id: `voice-${pushNotification.id}-${Date.now()}`,
      notificationId: pushNotification.id,
      text: this.generateVoiceText(pushNotification),
      priority: pushNotification.priority,
      category: this.getVoiceNotificationCategory(pushNotification),
      timestamp: new Date().toISOString(),
      isSpeaking: false,
      wasSpoken: false,
    };
  }

  private retryFailedVoiceNotification(): void {
    if (this.voiceQueue.length > 0) {
      setTimeout(() => {
        this.processVoiceQueue();
      }, 1000);
    }
  }

  private processVoiceQueue(): void {
    if (this.isProcessingVoice || this.voiceQueue.length === 0) {
      return;
    }

    const voiceNotification = this.voiceQueue[0];

    if (voiceNotification.wasSpoken) {
      this.voiceQueue.shift();
      this.saveVoiceQueue();
      this.processVoiceQueue();
      return;
    }

    this.isProcessingVoice = true;
    voiceNotification.isSpeaking = true;
    voiceNotification.wasSpoken = true;
    this.saveVoiceQueue();

    const settings = this.getUnifiedSettings();
    if (settings.voice?.rate !== undefined) {
      this.synthesisService.setRate(settings.voice.rate);
    }
    if (settings.voice?.pitch !== undefined) {
      this.synthesisService.setPitch(settings.voice.pitch);
    }
    if (settings.voice?.volume !== undefined) {
      this.synthesisService.setVolume(settings.voice.volume);
    }

    this.synthesisService.speak(voiceNotification.text);
    logger.info('Speaking voice notification:', voiceNotification.text.substring(0, 50));
  }

  public announceNotification(notification: PushNotification): boolean {
    if (!this.shouldVoiceAnnounce(notification)) {
      return false;
    }

    const voiceNotification = this.createVoiceNotification(notification);

    if (this.voiceQueue.length >= VOICE_NOTIFICATION_CONFIG.MAX_QUEUE_SIZE) {
      logger.warn('Voice notification queue is full, dropping oldest notification');
      this.voiceQueue.shift();
    }

    this.voiceQueue.push(voiceNotification);
    this.saveVoiceQueue();

    if (!this.isProcessingVoice) {
      this.processVoiceQueue();
    }

    this.voiceHistory.push(voiceNotification);
    if (this.voiceHistory.length > VOICE_NOTIFICATION_CONFIG.MAX_HISTORY_SIZE) {
      this.voiceHistory.shift();
    }
    this.saveVoiceHistory();

    logger.info('Voice notification queued:', voiceNotification.id);
    return true;
  }

  public stopCurrentVoiceNotification(): void {
    this.synthesisService.stop();
    this.isProcessingVoice = false;
    if (this.voiceQueue.length > 0) {
      this.voiceQueue[0].isSpeaking = false;
      this.voiceQueue[0].wasSpoken = false;
      this.saveVoiceQueue();
    }
    logger.info('Voice notification stopped');
  }

  public skipCurrentVoiceNotification(): void {
    this.synthesisService.stop();
    this.isProcessingVoice = false;
    if (this.voiceQueue.length > 0) {
      const skipped = this.voiceQueue.shift();
      logger.info('Voice notification skipped:', skipped?.id);
      this.saveVoiceQueue();
    }
    this.processVoiceQueue();
  }

  public clearVoiceQueue(): void {
    this.synthesisService.stop();
    this.voiceQueue = [];
    this.isProcessingVoice = false;
    this.saveVoiceQueue();
    logger.info('Voice notification queue cleared');
  }

  public getVoiceQueue(): VoiceNotification[] {
    return [...this.voiceQueue];
  }

  public getVoiceHistory(): VoiceNotification[] {
    return [...this.voiceHistory];
  }

  public clearVoiceHistory(): void {
    this.voiceHistory = [];
    this.saveVoiceHistory();
    logger.info('Voice notification history cleared');
  }

  public isCurrentlySpeaking(): boolean {
    return this.isProcessingVoice && this.synthesisService.isSpeaking();
  }

  // Permission Management
  async requestPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        throw handleNotificationError(new Error(NOTIFICATION_ERROR_MESSAGES.NOT_SUPPORTED), 'requestPermission');
      }

      if (Notification.permission === 'granted') {
        logger.info('Notification permission already granted');
        return true;
      }

      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      if (granted) {
        logger.info('Notification permission granted');
      } else {
        logger.warn('Notification permission denied');
      }
      
      return granted;
    } catch (error) {
      logger.error('Failed to request notification permission:', error);
      return false;
    }
  }

  // Push Subscription Management
  async subscribeToPush(applicationServerKey: string): Promise<PushSubscription | null> {
    try {
      await this.requestPermission();

      if (!('serviceWorker' in navigator)) {
        throw handleNotificationError(new Error(NOTIFICATION_ERROR_MESSAGES.SERVICE_WORKER_FAILED), 'subscribe');
      }

      this.swRegistration = await navigator.serviceWorker.ready;

      if (!this.swRegistration.pushManager) {
        throw handleNotificationError(new Error('PushManager not available'), 'subscribe');
      }

      this.subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(applicationServerKey).buffer as ArrayBuffer,
      });

      this.saveSubscription(this.subscription);
      logger.info('Successfully subscribed to push notifications');
      
      return this.subscription;
    } catch (error) {
      logger.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    try {
      if (!this.subscription) {
        logger.info('No active subscription to unsubscribe');
        return true;
      }

      const unsubscribed = await this.subscription.unsubscribe();
      this.subscription = null;
      this.clearSubscription();
      logger.info('Successfully unsubscribed from push notifications');
      
      return unsubscribed;
    } catch (error) {
      logger.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  getCurrentSubscription(): PushSubscription | null {
    return this.subscription;
  }

  // Core Notification Display
  async showNotification(notification: PushNotification): Promise<void> {
    try {
      if (Notification.permission !== 'granted') {
        await this.requestPermission();
        if ((Notification.permission as string) !== 'granted') {
          throw handleNotificationError(new Error(NOTIFICATION_ERROR_MESSAGES.PERMISSION_DENIED), 'showNotification');
        }
      }

      const settings = this.getUnifiedSettings();
      
      if (!this.shouldShowNotification(notification, settings)) {
        logger.info('Notification filtered by settings or quiet hours');
        return;
      }

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

      this.addToHistory(notification);
      this.recordAnalytics(notification.id, 'delivered');
      
      // Trigger voice notification if enabled
      this.triggerVoiceNotification(notification);
      
      logger.info('Notification displayed:', notification.title);
    } catch (error) {
      logger.error('Failed to show notification:', error);
    }
  }

  // Template Management
  createTemplate(
    name: string,
    type: NotificationType,
    title: string,
    body: string,
    variables: string[] = [],
    targetRoles?: UserRole[],
    targetExtraRoles?: UserExtraRole[]
  ): UnifiedNotificationTemplate {
    const template: UnifiedNotificationTemplate = {
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      title,
      body,
      variables,
      priority: 'normal',
      isActive: true,
      targetRoles,
      targetExtraRoles,
      createdBy: this.getCurrentUser()?.id || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.templates.set(template.id, template);
    this.saveTemplates();
    logger.info('Notification template created:', template.id);
    return template;
  }

  createNotificationFromTemplate(
    templateId: string,
    variables: Record<string, string | number> = {}
  ): PushNotification | null {
    const template = this.templates.get(templateId) || this.defaultTemplates.get(templateId as NotificationType);
    if (!template || !template.isActive) {
      logger.error('Template not found or inactive:', templateId);
      return null;
    }

    let title = template.title;
    let body = template.body;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      title = title.replace(new RegExp(placeholder, 'g'), String(value));
      body = body.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: template.type,
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      priority: template.priority,
      targetRoles: template.targetRoles,
      targetExtraRoles: template.targetExtraRoles,
      data: { templateId, variables },
    };
  }

  // Event Notification Methods (unified from useEventNotifications)
  async notifyGradeUpdate(
    studentName: string, 
    subject: string, 
    previousGrade?: number, 
    newGrade?: number
  ): Promise<void> {
    this.defaultTemplates.get('grade')!;
    let body = `Nilai ${studentName} untuk ${subject}`;

    if (previousGrade && newGrade) {
      const difference = newGrade - previousGrade;
      const trend = difference > 0 ? 'naik' : difference < 0 ? 'turun' : 'tetap';
      body += ` ${trend} dari ${previousGrade} ke ${newGrade}`;
    } else if (newGrade) {
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
      targetRoles: ['student', 'parent', 'teacher'],
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
  }

  async notifyPPDBStatus(count: number): Promise<void> {
    if (count <= 0) return;

    this.defaultTemplates.get('ppdb')!;
    const notification: PushNotification = {
      id: `notif-ppdb-${Date.now()}`,
      type: 'ppdb',
      title: 'Pendaftaran Baru PPDB',
      body: `Ada ${count} pendaftaran PPDB yang menunggu persetujuan`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'high',
      targetRoles: ['admin'],
      data: {
        type: 'ppdb_update' as const,
        count,
      },
    };

    await this.showNotification(notification);
    this.emitEvent('ppdb_update', notification.data || {});
  }

  async notifyLibraryUpdate(materialTitle: string, materialType: string): Promise<void> {
    this.defaultTemplates.get('library')!;
    const notification: PushNotification = {
      id: `notif-library-${Date.now()}`,
      type: 'library',
      title: 'Materi Baru',
      body: `${materialType}: ${materialTitle} tersedia di e-library`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'low',
      targetRoles: ['teacher', 'student'],
      data: {
        type: 'library_update' as const,
        materialTitle,
        materialType,
      },
    };

    await this.showNotification(notification);
    this.emitEvent('library_update', notification.data || {});
  }

  async notifyMeetingRequest(requesterName: string, meetingType: string): Promise<void> {
    this.defaultTemplates.get('event')!;
    const notification: PushNotification = {
      id: `notif-meeting-${Date.now()}`,
      type: 'event',
      title: 'Permintaan Pertemuan',
      body: `${requesterName} meminta ${meetingType.toLowerCase()}`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal',
      targetRoles: ['admin', 'teacher'],
      data: {
        type: 'meeting_request' as const,
        requesterName,
        meetingType,
      },
    };

    await this.showNotification(notification);
    this.emitEvent('meeting_request', notification.data || {});
  }

  async notifyScheduleChange(className: string, changeType: string): Promise<void> {
    this.defaultTemplates.get('announcement')!;
    const notification: PushNotification = {
      id: `notif-schedule-${Date.now()}`,
      type: 'announcement',
      title: 'Perubahan Jadwal',
      body: `Jadwal ${className}: ${changeType}`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal',
      targetRoles: ['admin', 'teacher', 'student'],
      data: {
        type: 'schedule_change' as const,
        className,
        changeType,
      },
    };

    await this.showNotification(notification);
    this.emitEvent('schedule_change', notification.data || {});
  }

  async notifyAttendanceAlert(studentName: string, alertType: string): Promise<void> {
    this.defaultTemplates.get('system')!;
    const notification: PushNotification = {
      id: `notif-attendance-${Date.now()}`,
      type: 'system',
      title: 'Alert Kehadiran',
      body: `${studentName}: ${alertType}`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'high',
      targetRoles: ['admin', 'teacher'],
      data: {
        type: 'attendance_alert' as const,
        studentName,
        alertType,
      },
    };

    await this.showNotification(notification);
    this.emitEvent('attendance_alert', notification.data || {});
  }

  async notifyOCRValidation(event: OCRValidationEvent): Promise<void> {
    const severity = event.type === 'validation-failure' ? 'Gagal' :
                    event.type === 'validation-warning' ? 'Peringatan' : 'Berhasil';

    this.defaultTemplates.get('ocr')!;
    const notification: PushNotification = {
      id: `notif-ocr-${Date.now()}`,
      type: 'ocr',
      title: `Validasi OCR ${severity}`,
      body: `Dokumen ${event.documentType} - Confidence: ${event.confidence}%. ${event.issues.length > 0 ? `Issues: ${event.issues.join(', ')}` : 'Validasi berhasil'}`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal',
      targetRoles: ['admin', 'teacher'],
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
  }

  // Event System
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
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

    // Also dispatch as custom event for compatibility
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(type, { detail: data }));
    }
  }

  // Unified Settings Management
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
      // Separate voice settings for compatibility
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

  // History Management (unified)
  getUnifiedHistory(limit: number = 20): NotificationHistoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_HISTORY_KEY);
      if (stored) {
        const history: NotificationHistoryItem[] = JSON.parse(stored);
        return history.slice(-limit);
      }
    } catch (error) {
      logger.error('Failed to load notification history:', error);
    }
    return [];
  }

  clearUnifiedHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATION_HISTORY_KEY);
      logger.info('Unified notification history cleared');
    } catch (error) {
      logger.error('Failed to clear unified notification history:', error);
    }
  }

  // Batch Management (unchanged but consolidated)
  createBatch(name: string, notifications: PushNotification[]): NotificationBatch {
    const batch: NotificationBatch = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  // Getters
  getBatches(): NotificationBatch[] {
    return Array.from(this.batches.values());
  }

  getTemplates(): UnifiedNotificationTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.isActive);
  }

  getAnalytics(): NotificationAnalytics[] {
    try {
      if (this.analytics.size === 0) {
        const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_ANALYTICS);
        if (stored) {
          const analytics: NotificationAnalytics[] = JSON.parse(stored);
          analytics.forEach(analytic => this.analytics.set(analytic.notificationId, analytic));
        }
      }
      return Array.from(this.analytics.values());
    } catch (error) {
      logger.error('Failed to get analytics:', error);
      return [];
    }
  }

  // Analytics (unchanged)
  recordAnalytics(notificationId: string, action: 'delivered' | 'read' | 'clicked' | 'dismissed'): void {
    const existing = this.analytics.get(notificationId);
    const currentUser = this.getCurrentUser();
    
    if (existing) {
      switch (action) {
        case 'delivered':
          existing.delivered++;
          break;
        case 'read':
          existing.read++;
          break;
        case 'clicked':
          existing.clicked++;
          break;
        case 'dismissed':
          existing.dismissed++;
          break;
      }
      if (currentUser) {
        const userRole = currentUser.role as UserRole;
        existing.roleBreakdown[userRole] = (existing.roleBreakdown[userRole] || 0) + 1;
      }
    } else {
      const analytics: NotificationAnalytics = {
        id: `analytics-${notificationId}`,
        notificationId,
        delivered: action === 'delivered' ? 1 : 0,
        read: action === 'read' ? 1 : 0,
        clicked: action === 'clicked' ? 1 : 0,
        dismissed: action === 'dismissed' ? 1 : 0,
        timestamp: new Date().toISOString(),
        roleBreakdown: currentUser ? { [currentUser.role]: 1 } : {},
      };
      this.analytics.set(notificationId, analytics);
    }

    this.saveAnalytics();
  }

  // Permission helpers
  isPermissionGranted(): boolean {
    if (!('Notification' in window)) {
      return false;
    }
    return Notification.permission === 'granted';
  }

  isPermissionDenied(): boolean {
    if (!('Notification' in window)) {
      return false;
    }
    return Notification.permission === 'denied';
  }

  // Private helper methods (consolidated from existing service)
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
      const voiceSuccess = this.announceNotification(notification);
      if (voiceSuccess) {
        logger.info('Voice notification triggered for:', notification.id);
      }
    } catch (error) {
      logger.error('Failed to trigger voice notification:', error);
    }
  }

  private async showBatchedNotification(notification: PushNotification, batch: NotificationBatch): Promise<void> {
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
  }

  private addToHistory(notification: PushNotification): void {
    try {
      const history = this.getUnifiedHistory();
      const historyItem: NotificationHistoryItem = {
        id: notification.id,
        notification,
        clicked: false,
        dismissed: false,
        deliveredAt: new Date().toISOString(),
      };

      history.push(historyItem);

      if (history.length > NOTIFICATION_CONFIG.MAX_HISTORY_SIZE) {
        history.shift();
      }

      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_HISTORY_KEY,
        JSON.stringify(history)
      );
    } catch (error) {
      logger.error('Failed to add notification to history:', error);
    }
  }

  private handleNotificationClick(notification: PushNotification): void {
    try {
      const history = this.getUnifiedHistory();
      const updatedHistory = history.map((item) => {
        if (item.id === notification.id) {
          return {
            ...item,
            clicked: true,
          };
        }
        return item;
      });
      
      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );

      this.recordAnalytics(notification.id, 'clicked');

      if (notification.data && notification.data.url) {
        window.location.href = notification.data.url as string;
      }
    } catch (error) {
      logger.error('Failed to handle notification click:', error);
    }
  }

  // Storage methods (consolidated)
  private saveSubscription(subscription: PushSubscription): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PUSH_SUBSCRIPTION_KEY,
        subscription.endpoint
      );
    } catch (error) {
      logger.error('Failed to save subscription:', error);
    }
  }

  private loadSubscription(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PUSH_SUBSCRIPTION_KEY);
      if (stored) {
        logger.info('Loaded existing subscription from storage');
      }
    } catch (error) {
      logger.error('Failed to load subscription:', error);
    }
  }

  private clearSubscription(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PUSH_SUBSCRIPTION_KEY);
    } catch (error) {
      logger.error('Failed to clear subscription:', error);
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

  private saveTemplates(): void {
    try {
      const templates = Array.from(this.templates.values());
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_TEMPLATES, JSON.stringify(templates));
    } catch (error) {
      logger.error('Failed to save templates:', error);
    }
  }

  private loadTemplates(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_TEMPLATES);
      if (stored) {
        const templates: UnifiedNotificationTemplate[] = JSON.parse(stored);
        templates.forEach(template => this.templates.set(template.id, template));
      }
    } catch (error) {
      logger.error('Failed to load templates:', error);
    }
  }

  private saveAnalytics(): void {
    try {
      const analytics = Array.from(this.analytics.values());
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_ANALYTICS, JSON.stringify(analytics));
    } catch (error) {
      logger.error('Failed to save analytics:', error);
    }
  }

  private loadAnalytics(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_ANALYTICS);
      if (stored) {
        const analytics: NotificationAnalytics[] = JSON.parse(stored);
        analytics.forEach(analytic => this.analytics.set(analytic.notificationId, analytic));
      }
    } catch (error) {
      logger.error('Failed to load analytics:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  // Legacy compatibility methods
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

  markAsRead(notificationId: string): void {
    try {
      const history = this.getUnifiedHistory();
      const updatedHistory = history.map((item) => {
        if (item.id === notificationId) {
          return {
            ...item,
            notification: {
              ...item.notification,
              read: true,
            },
          };
        }
        return item;
      });
      
      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );
      this.recordAnalytics(notificationId, 'read');
      logger.info('Notification marked as read:', notificationId);
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
    }
  }

  deleteFromHistory(notificationId: string): void {
    try {
      const history = this.getUnifiedHistory();
      const filteredHistory = history.filter((item) => item.id !== notificationId);
      
      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_HISTORY_KEY,
        JSON.stringify(filteredHistory)
      );
      logger.info('Notification deleted from history:', notificationId);
    } catch (error) {
      logger.error('Failed to delete notification from history:', error);
    }
  }

  clearAnalytics(): void {
    try {
      this.analytics.clear();
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATION_ANALYTICS);
      logger.info('Notification analytics cleared');
    } catch (error) {
      logger.error('Failed to clear notification analytics:', error);
    }
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

  // Compatibility with existing API
  async showLocalNotification(notification: PushNotification): Promise<void> {
    return this.showNotification(notification);
  }

  createNotificationFromTemplateId(
    templateId: string,
    variables: Record<string, string | number> = {}
  ): PushNotification | null {
    return this.createNotificationFromTemplate(templateId, variables);
  }
}

/* eslint-enable no-undef */

export const unifiedNotificationManager = new UnifiedNotificationManager();