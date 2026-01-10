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
} from '../services/unifiedNotificationManager';
import { unifiedNotificationManager } from '../services/unifiedNotificationManager';
import { logger } from '../utils/logger';
import { OCRValidationEvent } from '../types';

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

  // Initialize the notification system
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
    return unifiedNotificationManager.createTemplate(name, type, title, body, variables, targetRoles, targetExtraRoles);
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
    return unifiedNotificationManager.createBatch(name, notifications);
  }, []);

  const sendBatch = useCallback(async (batchId: string): Promise<boolean> => {
    return await unifiedNotificationManager.sendBatch(batchId);
  }, []);

  // History Management
  const getHistory = useCallback((limit?: number): NotificationHistoryItem[] => {
    return unifiedNotificationManager.getHistory(limit);
  }, []);

  const clearHistory = useCallback((): void => {
    unifiedNotificationManager.clearHistory();
  }, []);

  const markAsRead = useCallback((notificationId: string): void => {
    unifiedNotificationManager.markAsRead(notificationId);
  }, []);

  const deleteFromHistory = useCallback((notificationId: string): void => {
    unifiedNotificationManager.deleteFromHistory(notificationId);
  }, []);

  // Settings Management
  const getSettings = useCallback((): UnifiedNotificationSettings => {
    return unifiedNotificationManager.getUnifiedSettings();
  }, []);

  const saveSettings = useCallback((settings: UnifiedNotificationSettings): void => {
    unifiedNotificationManager.saveUnifiedSettings(settings);
  }, []);

  const resetSettings = useCallback((): void => {
    unifiedNotificationManager.resetSettings();
  }, []);

  // Analytics
  const getAnalytics = useCallback((): NotificationAnalytics[] => {
    return unifiedNotificationManager.getAnalytics();
  }, []);

  const clearAnalytics = useCallback((): void => {
    unifiedNotificationManager.clearAnalytics();
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
            if (Date.now() - lastChecked > 5000) { // Avoid too frequent checks
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
      const interval = setInterval(checkNow, 30000); // Check every 30 seconds

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

    // Analytics
    getAnalytics,
    clearAnalytics,

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
    notifyMeetingRequest: unified.notifyMeetingRequest,
    notifyScheduleChange: unified.notifyScheduleChange,
    notifyAttendanceAlert: unified.notifyAttendanceAlert,
    notifyOCRValidation: unified.notifyOCRValidation,
    useMonitorLocalStorage: unified.useMonitorLocalStorage,
    useOCRValidationMonitor: unified.useOCRValidationMonitor,
  };
};