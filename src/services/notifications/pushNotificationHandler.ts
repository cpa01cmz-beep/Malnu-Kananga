import { STORAGE_KEYS } from '../../constants';
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
    this.loadSubscription().catch(err => logger.error('Failed to initialize push subscription', err));
  }

  private saveSubscription(subscription: PushSubscription): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PUSH_SUBSCRIPTION_KEY,
        subscription.endpoint
      );
    } catch (error) {
      logger.error('Failed to save push subscription:', error);
    }
  }

  private async loadSubscription(): Promise<void> {
    try {
      if (!('serviceWorker' in navigator)) {
        logger.warn('Service Worker not supported, cannot load push subscription.');
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        this.subscription = subscription;
        logger.info('Loaded existing push subscription from browser.');
        this.saveSubscription(subscription);
      } else {
        logger.info('No active push subscription found.');
        this.clearSubscription();
      }
    } catch (error) {
      logger.error('Failed to load push subscription:', error);
    }
  }

  private clearSubscription(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PUSH_SUBSCRIPTION_KEY);
    } catch (error) {
      logger.error('Failed to clear push subscription:', error);
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

  async requestPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported');
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
        throw new Error('Service worker not available');
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

  cleanup(): void {
    this.subscription = null;
    this.swRegistration = null;
    this.clearSubscription();
    logger.info('Push notification handler cleaned up');
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
