import { NotificationSettings, PushNotification, NotificationHistoryItem } from '../types';
import { NOTIFICATION_CONFIG, NOTIFICATION_ERROR_MESSAGES, NOTIFICATION_ICONS, STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

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
    userVisibleOnly: boolean;
    applicationServerKey: Uint8Array | null;
  }
}

class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  constructor() {
    this.loadSubscription();
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
        applicationServerKey: this.urlBase64ToUint8Array(applicationServerKey),
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
        if (Notification.permission !== 'granted') {
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
        timestamp: new Date(notification.timestamp).getTime(),
        requireInteraction: notification.priority === 'high',
        vibrate: NOTIFICATION_CONFIG.VIBRATION_PATTERN,
        data: notification.data as Record<string, unknown>,
      });
      
      notif.onclick = () => {
        this.handleNotificationClick(notification);
        notif.close();
      };

      this.addToHistory(notification);
      logger.info('Local notification displayed:', notification.title);
    } catch (error) {
      logger.error('Failed to show local notification:', error);
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
      default:
        return true;
    }
  }

  private isInQuietHours(settings: NotificationSettings): boolean {
    if (!settings.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHours, startMinutes] = settings.quietHours.start.split(':').map(Number);
    const [endHours, endMinutes] = settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHours * 60 + startMinutes;
    const endTime = endHours * 60 + endMinutes;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      return currentTime >= startTime || currentTime < endTime;
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