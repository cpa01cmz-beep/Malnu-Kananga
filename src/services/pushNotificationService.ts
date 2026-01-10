import { NotificationSettings, PushNotification, NotificationHistoryItem, NotificationBatch, NotificationTemplate, NotificationAnalytics, UserExtraRole } from '../types';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { unifiedNotificationManager } from './unifiedNotificationManager';

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

/**
 * @deprecated This service is deprecated and will be removed in a future version.
 * Use unifiedNotificationManager directly instead.
 * This wrapper exists only for backward compatibility during migration.
 * 
 * Migration guide:
 * - Replace `import { pushNotificationService }` with `import { unifiedNotificationManager }`
 * - Replace `pushNotificationService.showLocalNotification()` with `unifiedNotificationManager.showNotification()`
 * - Replace `pushNotificationService.getHistory()` with `unifiedNotificationManager.getUnifiedHistory()`
 * - Replace `pushNotificationService.clearHistory()` with `unifiedNotificationManager.clearUnifiedHistory()`
 * - All other method names remain the same
 * 
 * See issue #990 for complete migration details.
 */
class PushNotificationService {
  private unified = unifiedNotificationManager;

  constructor() {
    logger.info('PushNotificationService initialized as legacy wrapper');
  }

  async requestPermission(): Promise<boolean> {
    return await this.unified.requestPermission();
  }

  async subscribeToPush(applicationServerKey: string): Promise<PushSubscription | null> {
    return await this.unified.subscribeToPush(applicationServerKey);
  }

  async unsubscribeFromPush(): Promise<boolean> {
    return await this.unified.unsubscribeFromPush();
  }

  getCurrentSubscription(): PushSubscription | null {
    return this.unified.getCurrentSubscription();
  }

  async showLocalNotification(notification: PushNotification): Promise<void> {
    await this.unified.showNotification(notification);
  }

  getSettings(): NotificationSettings {
    return this.unified.getSettings();
  }

  saveSettings(settings: NotificationSettings): void {
    this.unified.saveSettings(settings);
  }

  resetSettings(): void {
    this.unified.resetSettings();
  }

  getHistory(limit: number = 20): NotificationHistoryItem[] {
    return this.unified.getHistory(limit);
  }

  clearHistory(): void {
    this.unified.clearHistory();
  }

  markAsRead(notificationId: string): void {
    this.unified.markAsRead(notificationId);
  }

  deleteFromHistory(notificationId: string): void {
    this.unified.deleteFromHistory(notificationId);
  }

  isPermissionGranted(): boolean {
    return this.unified.isPermissionGranted();
  }

  isPermissionDenied(): boolean {
    return this.unified.isPermissionDenied();
  }

  createBatch(name: string, notifications: PushNotification[]): NotificationBatch {
    return this.unified.createBatch(name, notifications);
  }

  async sendBatch(batchId: string): Promise<boolean> {
    return await this.unified.sendBatch(batchId);
  }

  createTemplate(
    name: string,
    type: PushNotification['type'],
    title: string,
    body: string,
    variables: string[] = []
  ): NotificationTemplate {
    const unifiedTemplate = this.unified.createTemplate(name, type, title, body, variables);
    // Convert to legacy format
    return {
      id: unifiedTemplate.id,
      name: unifiedTemplate.name,
      type: unifiedTemplate.type,
      title: unifiedTemplate.title,
      body: unifiedTemplate.body,
      variables: unifiedTemplate.variables,
      priority: unifiedTemplate.priority,
      isActive: unifiedTemplate.isActive,
      createdBy: unifiedTemplate.createdBy,
      createdAt: unifiedTemplate.createdAt,
      updatedAt: unifiedTemplate.updatedAt,
      targetRoles: unifiedTemplate.targetRoles,
      targetExtraRoles: unifiedTemplate.targetExtraRoles as UserExtraRole[],
    };
  }

  createNotificationFromTemplate(
    templateId: string,
    variables: Record<string, string | number> = {}
  ): PushNotification | null {
    return this.unified.createNotificationFromTemplateId(templateId, variables);
  }

  getBatches(): NotificationBatch[] {
    return this.unified.getBatches();
  }

  getTemplates(): NotificationTemplate[] {
    const unifiedTemplates = this.unified.getTemplates();
    return unifiedTemplates.map(template => ({
      id: template.id,
      name: template.name,
      type: template.type,
      title: template.title,
      body: template.body,
      variables: template.variables,
      priority: template.priority,
      isActive: template.isActive,
      createdBy: template.createdBy,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      targetRoles: template.targetRoles,
      targetExtraRoles: template.targetExtraRoles as UserExtraRole[],
    }));
  }

  recordAnalytics(notificationId: string, action: 'delivered' | 'read' | 'clicked' | 'dismissed'): void {
    this.unified.recordAnalytics(notificationId, action);
  }

  getAnalytics(): NotificationAnalytics[] {
    return this.unified.getAnalytics();
  }

  clearAnalytics(): void {
    this.unified.clearAnalytics();
  }

  // Private methods for backward compatibility - delegate to unified
  private shouldShowNotification(_notification: PushNotification, _settings: NotificationSettings): boolean {
    // This is handled internally by the unified manager
    return true;
  }

  private isNotificationForCurrentUser(_notification: PushNotification): boolean {
    // This is handled internally by the unified manager
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

  private addToHistory(_notification: PushNotification): void {
    // This is handled internally by the unified manager
  }

  private handleNotificationClick(_notification: PushNotification): void {
    // This is handled internally by the unified manager
  }

  private saveSubscription(_subscription: PushSubscription): void {
    // This is handled internally by the unified manager
  }

  private loadSubscription(): void {
    // This is handled internally by the unified manager
  }

  private clearSubscription(): void {
    // This is handled internally by the unified manager
  }

  private saveBatches(): void {
    // This is handled internally by the unified manager
  }

  private loadBatches(): void {
    // This is handled internally by the unified manager
  }

  private saveTemplates(): void {
    // This is handled internally by the unified manager
  }

  private loadTemplates(): void {
    // This is handled internally by the unified manager
  }

  private saveAnalytics(): void {
    // This is handled internally by the unified manager
  }

  private loadAnalytics(): void {
    // This is handled internally by the unified manager
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