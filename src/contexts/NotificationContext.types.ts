import { createContext } from 'react';

export const NotificationContext = createContext<NotificationContextType | null>(null);

export type NotificationContextType = {
  pushNotificationHelpers: ReturnType<typeof import('../hooks/usePushNotifications').usePushNotifications>;
  eventNotificationHelpers: ReturnType<typeof import('../hooks/useEventNotifications').useEventNotifications>;
};
