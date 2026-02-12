import { STORAGE_KEYS, PUSH_NOTIFICATION_LOG_MESSAGES } from '../../constants';
import { logger } from '../../utils/logger';

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

export class PushNotificationHandler {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  constructor() {
    this.loadSubscription().catch(err => logger.error(PUSH_NOTIFICATION_LOG_MESSAGES.INIT_FAILED, err));
  }

  private saveSubscription(subscription: PushSubscription): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PUSH_SUBSCRIPTION_KEY,
        subscription.endpoint
      );
    } catch (error) {
      logger.error(PUSH_NOTIFICATION_LOG_MESSAGES.SAVE_SUBSCRIPTION_FAILED, error);
    }
  }

  private async loadSubscription(): Promise<void> {
    try {
      if (!('serviceWorker' in navigator)) {
        logger.warn(PUSH_NOTIFICATION_LOG_MESSAGES.SERVICE_WORKER_NOT_SUPPORTED);
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        this.subscription = subscription;
        logger.info(PUSH_NOTIFICATION_LOG_MESSAGES.SUBSCRIPTION_LOADED);
        this.saveSubscription(subscription);
      } else {
        logger.info(PUSH_NOTIFICATION_LOG_MESSAGES.NO_SUBSCRIPTION_FOUND);
        this.clearSubscription();
      }
    } catch (error) {
      logger.error(PUSH_NOTIFICATION_LOG_MESSAGES.LOAD_SUBSCRIPTION_FAILED, error);
    }
  }

  private clearSubscription(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PUSH_SUBSCRIPTION_KEY);
    } catch (error) {
      logger.error(PUSH_NOTIFICATION_LOG_MESSAGES.CLEAR_SUBSCRIPTION_FAILED, error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    try {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

      // Use Buffer.from for Node.js compatibility, fallback to window.atob for browser
      let rawData: string;
      if (typeof Buffer !== 'undefined') {
        rawData = Buffer.from(base64, 'base64').toString('binary');
      } else {
        rawData = window.atob(base64);
      }

      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      return outputArray;
    } catch (error) {
      logger.error('Failed to decode base64 string:', error);
      throw new Error(`Invalid base64 string: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        throw new Error(PUSH_NOTIFICATION_LOG_MESSAGES.NOTIFICATIONS_NOT_SUPPORTED);
      }

      if (Notification.permission === 'granted') {
        logger.info(PUSH_NOTIFICATION_LOG_MESSAGES.PERMISSION_ALREADY_GRANTED);
        return true;
      }

      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';

      if (granted) {
        logger.info(PUSH_NOTIFICATION_LOG_MESSAGES.PERMISSION_GRANTED);
      } else {
        logger.warn(PUSH_NOTIFICATION_LOG_MESSAGES.PERMISSION_DENIED);
      }

      return granted;
    } catch (error) {
      logger.error(PUSH_NOTIFICATION_LOG_MESSAGES.REQUEST_PERMISSION_FAILED, error);
      return false;
    }
  }

  async subscribeToPush(applicationServerKey: string): Promise<PushSubscription | null> {
    try {
      await this.requestPermission();

      if (!('serviceWorker' in navigator)) {
        throw new Error(PUSH_NOTIFICATION_LOG_MESSAGES.SERVICE_WORKER_NOT_AVAILABLE);
      }

      this.swRegistration = await navigator.serviceWorker.ready;

      if (!this.swRegistration.pushManager) {
        throw new Error(PUSH_NOTIFICATION_LOG_MESSAGES.PUSH_MANAGER_NOT_AVAILABLE);
      }

      this.subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(applicationServerKey).buffer as ArrayBuffer,
      });

      this.saveSubscription(this.subscription);
      logger.info(PUSH_NOTIFICATION_LOG_MESSAGES.SUBSCRIBE_SUCCESS);

      return this.subscription;
    } catch (error) {
      logger.error(PUSH_NOTIFICATION_LOG_MESSAGES.SUBSCRIBE_FAILED, error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    try {
      if (!this.subscription) {
        logger.info(PUSH_NOTIFICATION_LOG_MESSAGES.NO_SUBSCRIPTION_TO_UNSUBSCRIBE);
        return true;
      }

      const unsubscribed = await this.subscription.unsubscribe();
      this.subscription = null;
      this.clearSubscription();
      logger.info(PUSH_NOTIFICATION_LOG_MESSAGES.UNSUBSCRIBE_SUCCESS);

      return unsubscribed;
    } catch (error) {
      logger.error(PUSH_NOTIFICATION_LOG_MESSAGES.UNSUBSCRIBE_FAILED, error);
      return false;
    }
  }

  getCurrentSubscription(): PushSubscription | null {
    return this.subscription;
  }

  cleanup(): void {
    this.subscription = null;
    this.swRegistration = null;
    this.clearSubscription();
    logger.info(PUSH_NOTIFICATION_LOG_MESSAGES.CLEANUP_COMPLETE);
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
}
