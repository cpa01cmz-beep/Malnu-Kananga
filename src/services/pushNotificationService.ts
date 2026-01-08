import { NotificationSettings, PushNotification, NotificationHistoryItem, NotificationBatch, NotificationTemplate, NotificationAnalytics } from '../types';
import { NOTIFICATION_CONFIG, NOTIFICATION_ERROR_MESSAGES, NOTIFICATION_ICONS, STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { voiceNotificationService } from './voiceNotificationService';
import type { UserRole } from '../types';

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

class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private batches: Map<string, NotificationBatch>;
  private templates: Map<string, NotificationTemplate>;
  private analytics: Map<string, NotificationAnalytics>;

  constructor() {
    // Initialize all properties first to prevent temporal dead zone issues
    this.swRegistration = null;
    this.subscription = null;
    this.batches = new Map();
    this.templates = new Map();
    this.analytics = new Map();
    
    // Defer initialization to prevent access before initialization errors
    setTimeout(() => {
      this.initialize();
    }, 0);
  }

  private initialize(): void {
    // Initialize in try-catch to prevent crashes from individual methods
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

  async requestPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        throw new Error(NOTIFICATION_ERROR_MESSAGES.NOT_SUPPORTED);
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

  async subscribeToPush(applicationServerKey: string): Promise<PushSubscription | null> {
    try {
      await this.requestPermission();

      if (!('serviceWorker' in navigator)) {
        throw new Error(NOTIFICATION_ERROR_MESSAGES.SERVICE_WORKER_FAILED);
      }

      this.swRegistration = await navigator.serviceWorker.ready;

      if (!this.swRegistration.pushManager) {
        throw new Error('PushManager not available');
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

  async showLocalNotification(notification: PushNotification): Promise<void> {
    try {
      if (Notification.permission !== 'granted') {
        await this.requestPermission();
        if ((Notification.permission as string) !== 'granted') {
          throw new Error(NOTIFICATION_ERROR_MESSAGES.PERMISSION_DENIED);
        }
      }

      const settings = this.getSettings();
      
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
      
      logger.info('Local notification displayed:', notification.title);
    } catch (error) {
      logger.error('Failed to show local notification:', error);
    }
  }

  private triggerVoiceNotification(notification: PushNotification): void {
    try {
      const voiceSuccess = voiceNotificationService.announceNotification(notification);
      if (voiceSuccess) {
        logger.info('Voice notification triggered for:', notification.id);
      }
    } catch (error) {
      logger.error('Failed to trigger voice notification:', error);
    }
  }

  getSettings(): NotificationSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      logger.error('Failed to load notification settings:', error);
    }
    return NOTIFICATION_CONFIG.DEFAULT_SETTINGS;
  }

  saveSettings(settings: NotificationSettings): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_SETTINGS_KEY,
        JSON.stringify(settings)
      );
      logger.info('Notification settings saved');
    } catch (error) {
      logger.error('Failed to save notification settings:', error);
    }
  }

  resetSettings(): void {
    this.saveSettings(NOTIFICATION_CONFIG.DEFAULT_SETTINGS);
    logger.info('Notification settings reset to default');
  }

  getHistory(limit: number = 20): NotificationHistoryItem[] {
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

  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATION_HISTORY_KEY);
      logger.info('Notification history cleared');
    } catch (error) {
      logger.error('Failed to clear notification history:', error);
    }
  }

  markAsRead(notificationId: string): void {
    try {
      const history = this.getHistory();
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
      logger.info('Notification marked as read:', notificationId);
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
    }
  }

  deleteFromHistory(notificationId: string): void {
    try {
      const history = this.getHistory();
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

  private shouldShowNotification(notification: PushNotification, settings: NotificationSettings): boolean {
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



  private addToHistory(notification: PushNotification): void {
    try {
      const history = this.getHistory();
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
      const history = this.getHistory();
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

      if (notification.data && notification.data.url) {
        window.location.href = notification.data.url as string;
      }
    } catch (error) {
      logger.error('Failed to handle notification click:', error);
    }
  }

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
        // Only log if storage key exists, don't try to access uninitialized variables
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

    const settings = this.getSettings();
    let successCount = 0;
    let failureCount = 0;

    for (const notification of batch.notifications) {
      try {
        if (settings.batchNotifications) {
          await this.showBatchedNotification(notification, batch);
        } else {
          await this.showLocalNotification(notification);
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

    await this.showLocalNotification(batchedNotification);
  }

  createTemplate(
    name: string,
    type: PushNotification['type'],
    title: string,
    body: string,
    variables: string[] = []
  ): NotificationTemplate {
    const template: NotificationTemplate = {
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      title,
      body,
      variables,
      priority: 'normal',
      isActive: true,
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
    const template = this.templates.get(templateId);
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

  getBatches(): NotificationBatch[] {
    return Array.from(this.batches.values());
  }

  getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.isActive);
  }

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
        const templates: NotificationTemplate[] = JSON.parse(stored);
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

  getAnalytics(): NotificationAnalytics[] {
    try {
      // Ensure analytics are loaded from storage first
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

  clearAnalytics(): void {
    try {
      this.analytics.clear();
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATION_ANALYTICS);
      logger.info('Notification analytics cleared');
    } catch (error) {
      logger.error('Failed to clear notification analytics:', error);
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
}

/* eslint-enable no-undef */

export const pushNotificationService = new PushNotificationService();