import { useState, useEffect, useCallback } from 'react';
import { NotificationSettings, PushNotification, NotificationHistoryItem, NotificationBatch, NotificationTemplate, NotificationAnalytics } from '../types';
import { NOTIFICATION_CONFIG } from '../constants';
import { pushNotificationService } from '../services/pushNotificationService';

export function usePushNotifications() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [settings, setSettingsState] = useState<NotificationSettings>(NOTIFICATION_CONFIG.DEFAULT_SETTINGS);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [batches, setBatches] = useState<NotificationBatch[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [analytics, setAnalytics] = useState<NotificationAnalytics[]>([]);

  const loadSettings = useCallback(() => {
    const loadedSettings = pushNotificationService.getSettings();
    setSettingsState(loadedSettings);
  }, []);

  const loadHistory = useCallback(() => {
    const loadedHistory = pushNotificationService.getHistory();
    setHistory(loadedHistory);
  }, []);

  const checkPermission = useCallback(() => {
    setPermissionGranted(pushNotificationService.isPermissionGranted());
    setPermissionDenied(pushNotificationService.isPermissionDenied());
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await pushNotificationService.requestPermission();
    checkPermission();
    return granted;
  }, [checkPermission]);

  const subscribeToPush = useCallback(async (applicationServerKey: string): Promise<boolean> => {
    const subscription = await pushNotificationService.subscribeToPush(applicationServerKey);
    const isSubscribed = subscription !== null;
    setSubscribed(isSubscribed);
    return isSubscribed;
  }, []);

  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    const unsubscribed = await pushNotificationService.unsubscribeFromPush();
    setSubscribed(false);
    return unsubscribed;
  }, []);

  const showNotification = useCallback(async (notification: PushNotification): Promise<void> => {
    await pushNotificationService.showLocalNotification(notification);
    loadHistory();
  }, [loadHistory]);

  const updateSettings = useCallback((newSettings: NotificationSettings) => {
    pushNotificationService.saveSettings(newSettings);
    setSettingsState(newSettings);
  }, []);

  const resetSettings = useCallback(() => {
    pushNotificationService.resetSettings();
    loadSettings();
  }, [loadSettings]);

  const clearHistory = useCallback(() => {
    pushNotificationService.clearHistory();
    setHistory([]);
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    pushNotificationService.markAsRead(notificationId);
    loadHistory();
  }, [loadHistory]);

  const deleteNotification = useCallback((notificationId: string) => {
    pushNotificationService.deleteFromHistory(notificationId);
    loadHistory();
  }, [loadHistory]);

  const createNotification = useCallback((
    type: PushNotification['type'],
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): PushNotification => {
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      priority: type === 'system' ? 'high' : 'normal',
      data,
    };
  }, []);

  const loadBatches = useCallback(() => {
    const loadedBatches = pushNotificationService.getBatches();
    setBatches(loadedBatches);
  }, []);

  const loadTemplates = useCallback(() => {
    const loadedTemplates = pushNotificationService.getTemplates();
    setTemplates(loadedTemplates);
  }, []);

  const loadAnalytics = useCallback(() => {
    const loadedAnalytics = pushNotificationService.getAnalytics();
    setAnalytics(loadedAnalytics);
  }, []);

  const createBatch = useCallback((name: string, notifications: PushNotification[]) => {
    const batch = pushNotificationService.createBatch(name, notifications);
    loadBatches();
    return batch;
  }, [loadBatches]);

  const sendBatch = useCallback(async (batchId: string): Promise<boolean> => {
    const success = await pushNotificationService.sendBatch(batchId);
    loadBatches();
    return success;
  }, [loadBatches]);

  const createTemplate = useCallback((
    name: string,
    type: PushNotification['type'],
    title: string,
    body: string,
    variables: string[] = []
  ) => {
    const template = pushNotificationService.createTemplate(name, type, title, body, variables);
    loadTemplates();
    return template;
  }, [loadTemplates]);

  const createNotificationFromTemplate = useCallback((
    templateId: string,
    variables: Record<string, string | number> = {}
  ) => {
    return pushNotificationService.createNotificationFromTemplate(templateId, variables);
  }, []);

  const recordAnalytics = useCallback((notificationId: string, action: 'delivered' | 'read' | 'clicked' | 'dismissed') => {
    pushNotificationService.recordAnalytics(notificationId, action);
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadSettings();
    loadHistory();
    loadBatches();
    loadTemplates();
    loadAnalytics();
    checkPermission();

    const interval = setInterval(() => {
      checkPermission();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadSettings, loadHistory, loadBatches, loadTemplates, loadAnalytics, checkPermission]);

  return {
    permissionGranted,
    permissionDenied,
    settings,
    history,
    subscribed,
    batches,
    templates,
    analytics,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showNotification,
    updateSettings,
    resetSettings,
    clearHistory,
    markAsRead,
    deleteNotification,
    createNotification,
    loadHistory,
    loadBatches,
    loadTemplates,
    loadAnalytics,
    createBatch,
    sendBatch,
    createTemplate,
    createNotificationFromTemplate,
    recordAnalytics,
  };
}