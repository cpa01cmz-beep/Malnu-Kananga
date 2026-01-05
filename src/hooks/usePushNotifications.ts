import { useState, useEffect, useCallback } from 'react';
import { NotificationSettings, PushNotification, NotificationHistoryItem } from '../types';
import { NOTIFICATION_CONFIG } from '../constants';
import { pushNotificationService } from '../services/pushNotificationService';

export function usePushNotifications() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [settings, setSettingsState] = useState<NotificationSettings>(NOTIFICATION_CONFIG.DEFAULT_SETTINGS);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [subscribed, setSubscribed] = useState(false);

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

  useEffect(() => {
    loadSettings();
    loadHistory();
    checkPermission();

    const interval = setInterval(() => {
      checkPermission();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadSettings, loadHistory, checkPermission]);

  return {
    permissionGranted,
    permissionDenied,
    settings,
    history,
    subscribed,
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
  };
}