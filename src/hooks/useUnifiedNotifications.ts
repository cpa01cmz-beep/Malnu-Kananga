import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PushNotification,
  NotificationHistoryItem,
  NotificationBatch,
  NotificationAnalytics
} from '../types';
import {
  UnifiedNotificationTemplate,
  UnifiedNotificationSettings
} from '../services/notifications/unifiedNotificationManager';
import { unifiedNotificationManager } from '../services/notifications/unifiedNotificationManager';
import { logger } from '../utils/logger';
import { OCRValidationEvent } from '../types';
import { SCHEDULER_INTERVALS, UI_DELAYS } from '../constants';

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

interface StorageEvent extends Event {
  readonly key: string | null;
  readonly oldValue: string | null;
  readonly newValue: string | null;
  readonly url: string;
  storageArea: unknown;
}

/**
 * Unified hook for all notification functionality
 * Replaces both usePushNotifications and useEventNotifications
 */
export function useUnifiedNotifications() {
  const [isInitialized, setIsInitialized] = useState(false);
  const lastCheckedRef = useRef<{ [key: string]: number }>({});

  // State for legacy compatibility
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [settings, setSettingsState] = useState(unifiedNotificationManager.getUnifiedSettings());
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [batches, setBatches] = useState<NotificationBatch[]>([]);
  const [templates, setTemplates] = useState<UnifiedNotificationTemplate[]>([]);
  const [analytics, setAnalytics] = useState<NotificationAnalytics[]>([]);

  // Initialize notification system
  useEffect(() => {
    const initialize = async () => {
      try {
        // Load any existing data
        unifiedNotificationManager.getAnalytics();
        setIsInitialized(true);
        logger.info('Unified notifications initialized');
      } catch (error) {
        logger.error('Failed to initialize unified notifications:', error);
      }
    };

    initialize();
  }, []);

  // Load state on mount
  useEffect(() => {
    setHistory(unifiedNotificationManager.getUnifiedHistory());
    setBatches(unifiedNotificationManager.getBatches());
    setTemplates(unifiedNotificationManager.getTemplates());
    setAnalytics(unifiedNotificationManager.getAnalytics());
    setPermissionGranted(unifiedNotificationManager.isPermissionGranted());
    setPermissionDenied(unifiedNotificationManager.isPermissionDenied());
    setSettingsState(unifiedNotificationManager.getUnifiedSettings());
  }, [isInitialized]);

  // Permission Management
  const requestPermission = useCallback(async (): Promise<boolean> => {
    return await unifiedNotificationManager.requestPermission();
  }, []);

  const subscribeToPush = useCallback(async (applicationServerKey: string): Promise<PushSubscription | null> => {
    return await unifiedNotificationManager.subscribeToPush(applicationServerKey);
  }, []);

  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    return await unifiedNotificationManager.unsubscribeFromPush();
  }, []);

  // Core Notification Methods
  const showNotification = useCallback(async (notification: PushNotification): Promise<void> => {
    await unifiedNotificationManager.showNotification(notification);
    setHistory(unifiedNotificationManager.getUnifiedHistory());
  }, []);

  const createNotification = useCallback((
    type: PushNotification['type'],
    title: string, 
    body: string, 
    data?: Record<string, unknown>,
    priority?: PushNotification['priority'],
    targetRoles?: PushNotification['targetRoles'],
    targetExtraRoles?: PushNotification['targetExtraRoles']
  ): PushNotification => {
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      body,
      data,
      timestamp: new Date().toISOString(),
      read: false,
      priority: priority || 'normal',
      targetRoles,
      targetExtraRoles,
    };
  }, []);

  // Template Management
  const createTemplate = useCallback((
    name: string,
    type: PushNotification['type'],
    title: string,
    body: string,
    variables: string[] = [],
    targetRoles?: PushNotification['targetRoles'],
    targetExtraRoles?: PushNotification['targetExtraRoles']
  ): UnifiedNotificationTemplate => {
    const template = unifiedNotificationManager.createTemplate(name, type, title, body, variables, targetRoles, targetExtraRoles);
    setTemplates(unifiedNotificationManager.getTemplates());
    return template;
  }, []);

  const createNotificationFromTemplate = useCallback((
    templateId: string,
    variables: Record<string, string | number> = {}
  ): PushNotification | null => {
    return unifiedNotificationManager.createNotificationFromTemplate(templateId, variables);
  }, []);

  // Event Notification Methods (from useEventNotifications)
  const notifyGradeUpdate = useCallback(async (
    studentName: string, 
    subject: string, 
    previousGrade?: number, 
    newGrade?: number
  ): Promise<void> => {
    await unifiedNotificationManager.notifyGradeUpdate(studentName, subject, previousGrade, newGrade);
  }, []);

  const notifyPPDBStatus = useCallback(async (count: number): Promise<void> => {
    await unifiedNotificationManager.notifyPPDBStatus(count);
  }, []);

  const notifyLibraryUpdate = useCallback(async (materialTitle: string, materialType: string): Promise<void> => {
    await unifiedNotificationManager.notifyLibraryUpdate(materialTitle, materialType);
  }, []);

  const notifyAssignmentCreate = useCallback(async (assignmentId: string, title: string): Promise<void> => {
    await unifiedNotificationManager.showNotification({
      id: `assignment-create-${assignmentId}`,
      type: 'grade',
      title: 'Tugas Baru Dibuat',
      body: `${title} berhasil dibuat`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal'
    });
  }, []);

  const notifyAssignmentSubmit = useCallback(async (assignmentId: string, submissionId: string, title: string): Promise<void> => {
    await unifiedNotificationManager.showNotification({
      id: `assignment-submit-${submissionId}`,
      type: 'grade',
      title: 'Tugas Berhasil Dikirim',
      body: `${title} berhasil dikirim`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal'
    });
  }, []);

  const notifyMeetingRequest = useCallback(async (requesterName: string, meetingType: string): Promise<void> => {
    await unifiedNotificationManager.notifyMeetingRequest(requesterName, meetingType);
  }, []);

  const notifyScheduleChange = useCallback(async (className: string, changeType: string): Promise<void> => {
    await unifiedNotificationManager.notifyScheduleChange(className, changeType);
  }, []);

  const notifyAttendanceAlert = useCallback(async (studentName: string, alertType: string): Promise<void> => {
    await unifiedNotificationManager.notifyAttendanceAlert(studentName, alertType);
  }, []);

  const notifyOCRValidation = useCallback(async (event: OCRValidationEvent): Promise<void> => {
    await unifiedNotificationManager.notifyOCRValidation(event);
  }, []);

  // Batch Management
  const createBatch = useCallback((name: string, notifications: PushNotification[]): NotificationBatch => {
    const batch = unifiedNotificationManager.createBatch(name, notifications);
    setBatches(unifiedNotificationManager.getBatches());
    return batch;
  }, []);

  const sendBatch = useCallback(async (batchId: string): Promise<boolean> => {
    const success = await unifiedNotificationManager.sendBatch(batchId);
    setBatches(unifiedNotificationManager.getBatches());
    return success;
  }, []);

  // History Management
  const getHistory = useCallback((limit?: number): NotificationHistoryItem[] => {
    return unifiedNotificationManager.getUnifiedHistory(limit);
  }, []);

  const clearHistory = useCallback((): void => {
    unifiedNotificationManager.clearUnifiedHistory();
    setHistory([]);
  }, []);

  const markAsRead = useCallback((notificationId: string): void => {
    unifiedNotificationManager.markAsRead(notificationId);
    setHistory(unifiedNotificationManager.getUnifiedHistory());
  }, []);

  const deleteFromHistory = useCallback((notificationId: string): void => {
    unifiedNotificationManager.deleteFromHistory(notificationId);
    setHistory(unifiedNotificationManager.getUnifiedHistory());
  }, []);

  // Settings Management
  const getSettings = useCallback((): UnifiedNotificationSettings => {
    return unifiedNotificationManager.getUnifiedSettings();
  }, []);

  const saveSettings = useCallback((newSettings: UnifiedNotificationSettings): void => {
    unifiedNotificationManager.saveUnifiedSettings(newSettings);
    setSettingsState(newSettings);
  }, []);

  const resetSettings = useCallback((): void => {
    unifiedNotificationManager.resetSettings();
    setSettingsState(unifiedNotificationManager.getUnifiedSettings());
  }, []);

  const updateSettings = useCallback((newSettings: UnifiedNotificationSettings): void => {
    unifiedNotificationManager.saveUnifiedSettings(newSettings);
    setSettingsState(newSettings);
  }, []);

  const deleteNotification = useCallback((notificationId: string): void => {
    unifiedNotificationManager.deleteFromHistory(notificationId);
    setHistory(unifiedNotificationManager.getUnifiedHistory());
  }, []);

  // Analytics
  const getAnalytics = useCallback((): NotificationAnalytics[] => {
    return unifiedNotificationManager.getAnalytics();
  }, []);

  const clearAnalytics = useCallback((): void => {
    unifiedNotificationManager.clearAnalytics();
    setAnalytics([]);
  }, []);

  // Event System
  const addEventListener = useCallback((eventType: string, listener: (event: NotificationEvent) => void): void => {
    unifiedNotificationManager.addEventListener(eventType, listener);
  }, []);

  const removeEventListener = useCallback((eventType: string, listener: (event: NotificationEvent) => void): void => {
    unifiedNotificationManager.removeEventListener(eventType, listener);
  }, []);

  // Local Storage Monitoring (from useEventNotifications)
  const useMonitorLocalStorage = (key: string, onChange: (newValue: unknown, oldValue: unknown) => void) => {
    useEffect(() => {
      const handleStorageChange = (e: Event) => {
        const storageEvent = e as StorageEvent;
        if (storageEvent.key === key && storageEvent.newValue) {
          try {
            const newValue = JSON.parse(storageEvent.newValue);
            const oldValue = JSON.parse(storageEvent.oldValue || '{}');
            onChange(newValue, oldValue);
          } catch (error) {
            logger.error(`Error parsing localStorage change for ${key}:`, error);
          }
        }
      };

      const checkNow = () => {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const newValue = JSON.parse(stored);
            const lastChecked = lastCheckedRef.current[key] || 0;
            if (Date.now() - lastChecked > UI_DELAYS.DEBOUNCE_SHORT) { // Avoid too frequent checks
              onChange(newValue, {});
              lastCheckedRef.current[key] = Date.now();
            }
          } catch (error) {
            logger.error(`Error parsing localStorage for ${key}:`, error);
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);
      checkNow();
      const interval = setInterval(checkNow, SCHEDULER_INTERVALS.OFFLINE_SYNC_CHECK); // Check every 30 seconds

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }, [key, onChange]);
  };

  // OCR Validation Monitor (from useEventNotifications)
  const useOCRValidationMonitor = () => {
    useEffect(() => {
      const handleOCRValidation = (event: Event) => {
        const customEvent = event as CustomEvent;
        const ocrEvent = customEvent.detail as OCRValidationEvent;
        notifyOCRValidation(ocrEvent);
      };

      window.addEventListener('ocrValidation', handleOCRValidation);
      return () => {
        window.removeEventListener('ocrValidation', handleOCRValidation);
      };
    });
  };

  // Template Getters
  const getTemplates = useCallback((): UnifiedNotificationTemplate[] => {
    return unifiedNotificationManager.getTemplates();
  }, []);

  const getBatches = useCallback((): NotificationBatch[] => {
    return unifiedNotificationManager.getBatches();
  }, []);

  // Permission helpers
  const isPermissionGranted = useCallback((): boolean => {
    return unifiedNotificationManager.isPermissionGranted();
  }, []);

  const isPermissionDenied = useCallback((): boolean => {
    return unifiedNotificationManager.isPermissionDenied();
  }, []);

  const getCurrentSubscription = useCallback((): PushSubscription | null => {
    return unifiedNotificationManager.getCurrentSubscription();
  }, []);

  return {
    // State
    isInitialized,
    permissionGranted,
    permissionDenied,
    settings,
    history,
    batches,
    templates,
    analytics,

    // Core methods
    showNotification,
    createNotification,

    // Permission management
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    isPermissionGranted,
    isPermissionDenied,
    getCurrentSubscription,

    // Template management
    createTemplate,
    createNotificationFromTemplate,
    getTemplates,

    // Event notifications
    notifyGradeUpdate,
    notifyPPDBStatus,
    notifyLibraryUpdate,
    notifyAssignmentCreate,
    notifyAssignmentSubmit,
    notifyMeetingRequest,
    notifyScheduleChange,
    notifyAttendanceAlert,
    notifyOCRValidation,

    // Batch management
    createBatch,
    sendBatch,
    getBatches,

    // History management
    getHistory,
    clearHistory,
    markAsRead,
    deleteFromHistory,

    // Settings management
    getSettings,
    saveSettings,
    resetSettings,
    updateSettings,

    // Analytics
    getAnalytics,
    clearAnalytics,
    deleteNotification,

    // Event system
    addEventListener,
    removeEventListener,

    // Monitoring utilities
    useMonitorLocalStorage,
    useOCRValidationMonitor,
  };
}

interface NotificationEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

// Legacy exports for backward compatibility
export const usePushNotifications = useUnifiedNotifications;
export const useEventNotifications = () => {
  const unified = useUnifiedNotifications();
  
  return {
    notifyGradeUpdate: unified.notifyGradeUpdate,
    notifyPPDBStatus: unified.notifyPPDBStatus,
    notifyLibraryUpdate: unified.notifyLibraryUpdate,
    notifyAssignmentCreate: unified.notifyAssignmentCreate,
    notifyAssignmentSubmit: unified.notifyAssignmentSubmit,
    notifyMeetingRequest: unified.notifyMeetingRequest,
    notifyScheduleChange: unified.notifyScheduleChange,
    notifyAttendanceAlert: unified.notifyAttendanceAlert,
    notifyOCRValidation: unified.notifyOCRValidation,
    useMonitorLocalStorage: unified.useMonitorLocalStorage,
    useOCRValidationMonitor: unified.useOCRValidationMonitor,
  };
};