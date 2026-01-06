import React from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useEventNotifications } from '../hooks/useEventNotifications';
import { logger } from '../utils/logger';
import { STORAGE_KEYS } from '../constants';
import { NotificationContext } from './NotificationContext.types';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const pushNotificationHelpers = usePushNotifications();
  const eventNotificationHelpers = useEventNotifications();

  // Monitor PPDB registrations for admin notifications
  eventNotificationHelpers.useMonitorLocalStorage(
    STORAGE_KEYS.PPDB_REGISTRANTS,
    (newValue: unknown, oldValue: unknown) => {
      if (Array.isArray(newValue)) {
        const pendingCount = newValue.filter((r) => r.status === 'pending').length;
        const oldPendingCount = Array.isArray(oldValue) 
          ? oldValue.filter((r) => r.status === 'pending').length 
          : 0;
        
        if (pendingCount > 0 && pendingCount !== oldPendingCount) {
          eventNotificationHelpers.notifyPPDBStatus(pendingCount - oldPendingCount);
        }
      }
    }
  );

  // Monitor grade updates for student/parent notifications
  eventNotificationHelpers.useMonitorLocalStorage(
    'malnu_grades',
    (newValue: unknown, oldValue: unknown) => {
      // This would be triggered when grades are updated
      // Implementation depends on the grade data structure
      if (newValue && oldValue && newValue !== oldValue) {
        logger.info('Grade data updated, triggering notifications');
      }
    }
  );

  // Monitor library materials
  eventNotificationHelpers.useMonitorLocalStorage(
    STORAGE_KEYS.MATERIALS,
    (newValue: unknown, oldValue: unknown) => {
      if (Array.isArray(newValue) && Array.isArray(oldValue)) {
        if (newValue.length > oldValue.length) {
          // New material added
          const newMaterial = newValue[newValue.length - 1] as Record<string, unknown>;
          eventNotificationHelpers.notifyLibraryUpdate(
            (newMaterial.title as string) || 'Materi Baru',
            (newMaterial.type as string) || 'Dokumen'
          );
        }
      }
    }
  );

  const value = {
    pushNotificationHelpers,
    eventNotificationHelpers,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

