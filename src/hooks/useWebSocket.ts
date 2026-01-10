import { useEffect, useState, useCallback, useRef } from 'react';
import { webSocketService, type RealTimeEvent, type RealTimeEventType, type WebSocketConnectionState } from '../services/webSocketService';
import { logger } from '../utils/logger';

/**
 * React hook for WebSocket real-time functionality
 * Provides subscription management and connection state monitoring
 */
export function useWebSocket() {
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>(
    webSocketService.getConnectionState()
  );
  const subscriptionsRef = useRef<Map<RealTimeEventType, Set<(event: RealTimeEvent) => void>>>(new Map());

  // Update connection state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(webSocketService.getConnectionState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Initialize WebSocket connection on mount
  useEffect(() => {
    webSocketService.initialize().catch(error => {
      logger.error('useWebSocket: Failed to initialize WebSocket', error);
    });

    return () => {
      // Cleanup on unmount if no active subscriptions
      if (subscriptionsRef.current.size === 0) {
        webSocketService.disconnect();
      }
    };
  }, []);

  // Subscribe to real-time events
  const subscribe = useCallback((
    eventType: RealTimeEventType,
    callback: (event: RealTimeEvent) => void,
    filter?: (event: RealTimeEvent) => boolean
  ) => {
    const unsubscribe = webSocketService.subscribe({
      eventType,
      callback,
      filter,
    });

    // Track subscription for cleanup
    if (!subscriptionsRef.current.has(eventType)) {
      subscriptionsRef.current.set(eventType, new Set());
    }
    subscriptionsRef.current.get(eventType)!.add(callback);

    // Return enhanced unsubscribe function
    return () => {
      unsubscribe();
      const callbacks = subscriptionsRef.current.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          subscriptionsRef.current.delete(eventType);
        }
      }
    };
  }, []);

  // Manual reconnection
  const reconnect = useCallback(async () => {
    try {
      await webSocketService.reconnect();
      setConnectionState(webSocketService.getConnectionState());
    } catch (error) {
      logger.error('useWebSocket: Reconnection failed', error);
    }
  }, []);

  // Disconnect manually
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    setConnectionState(webSocketService.getConnectionState());
  }, []);

  return {
    connectionState,
    isConnected: connectionState.connected,
    isConnecting: connectionState.connecting,
    isReconnecting: connectionState.reconnecting,
    subscribe,
    reconnect,
    disconnect,
  };
}

/**
 * Hook for specific real-time event type
 * Provides typed event handling
 */
export function useRealtimeEvent<T = unknown>(
  eventType: RealTimeEventType,
  callback: (event: RealTimeEvent & { data: T }) => void,
  filter?: (event: RealTimeEvent) => boolean
) {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe(
      eventType,
      (event: RealTimeEvent) => {
        const typedEvent = event as RealTimeEvent & { data: T };
        callback(typedEvent);
      },
      filter
    );

    return unsubscribe;
  }, [eventType, callback, filter, subscribe]);
}

/**
 * Hook for real-time grades updates
 */
export function useRealtimeGrades(studentId?: string) {
  const [grades, setGrades] = useState<any[]>([]);

  useRealtimeEvent(
    ['grade_created', 'grade_updated', 'grade_deleted'] as RealTimeEventType[],
    (event) => {
      if (studentId && !('data' in event.data && (event.data as any).studentId === studentId)) {
        return;
      }

      setGrades(prevGrades => {
        const gradeData = event.data as any;
        switch (event.type) {
          case 'grade_created':
            return [...prevGrades, gradeData];
          case 'grade_updated':
            return prevGrades.map(g => g.id === gradeData.id ? gradeData : g);
          case 'grade_deleted':
            return prevGrades.filter(g => g.id !== gradeData.id);
          default:
            return prevGrades;
        }
      });
    }
  );

  return grades;
}

/**
 * Hook for real-time attendance updates
 */
export function useRealtimeAttendance(studentId?: string, classId?: string) {
  const [attendance, setAttendance] = useState<any[]>([]);

  useRealtimeEvent(
    ['attendance_marked', 'attendance_updated'] as RealTimeEventType[],
    (event) => {
      if (studentId && !('data' in event.data && (event.data as any).studentId === studentId)) {
        return;
      }
      if (classId && !('data' in event.data && (event.data as any).classId === classId)) {
        return;
      }

      setAttendance(prevAttendance => {
        const attendanceData = event.data as any;
        const index = prevAttendance.findIndex(a => a.id === attendanceData.id);
        if (index !== -1) {
          return prevAttendance.map((a, i) => i === index ? attendanceData : a);
        } else {
          return [...prevAttendance, attendanceData];
        }
      });
    }
  );

  return attendance;
}

/**
 * Hook for real-time announcements
 */
export function useRealtimeAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useRealtimeEvent(
    ['announcement_created', 'announcement_updated', 'announcement_deleted'] as RealTimeEventType[],
    (event) => {
      setAnnouncements(prevAnnouncements => {
        const announcementData = event.data as any;
        switch (event.type) {
          case 'announcement_created':
            return [announcementData, ...prevAnnouncements];
          case 'announcement_updated':
            return prevAnnouncements.map(a => a.id === announcementData.id ? announcementData : a);
          case 'announcement_deleted':
            return prevAnnouncements.filter(a => a.id !== announcementData.id);
          default:
            return prevAnnouncements;
        }
      });
    }
  );

  return announcements;
}

/**
 * Hook for real-time library materials updates
 */
export function useRealtimeLibrary(category?: string) {
  const [materials, setMaterials] = useState<any[]>([]);

  useRealtimeEvent(
    ['library_material_added', 'library_material_updated'] as RealTimeEventType[],
    (event) => {
      if (category && !('data' in event.data && (event.data as any).category === category)) {
        return;
      }

      setMaterials(prevMaterials => {
        const materialData = event.data as any;
        const index = prevMaterials.findIndex(m => m.id === materialData.id);
        if (index !== -1) {
          return prevMaterials.map((m, i) => i === index ? materialData : m);
        } else {
          return [...prevMaterials, materialData];
        }
      });
    }
  );

  return materials;
}

/**
 * Hook for real-time messaging (for future chat features)
 */
export function useRealtimeMessages(conversationId?: string) {
  const [messages, setMessages] = useState<any[]>([]);

  useRealtimeEvent(
    ['message_created', 'message_updated'] as RealTimeEventType[],
    (event) => {
      if (conversationId && !('data' in event.data && (event.data as any).conversationId === conversationId)) {
        return;
      }

      setMessages(prevMessages => {
        const messageData = event.data as any;
        switch (event.type) {
          case 'message_created':
            return [...prevMessages, messageData];
          case 'message_updated':
            return prevMessages.map(m => m.id === messageData.id ? messageData : m);
          default:
            return prevMessages;
        }
      });
    }
  );

  return messages;
}

/**
 * Hook for real-time notifications
 */
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useRealtimeEvent(
    ['notification_created', 'notification_read'] as RealTimeEventType[],
    (event) => {
      setNotifications(prevNotifications => {
        const notificationData = event.data as any;
        switch (event.type) {
          case 'notification_created':
            return [notificationData, ...prevNotifications];
          case 'notification_read':
            return prevNotifications.map(n => 
              n.id === notificationData.id ? { ...n, read: true } : n
            );
          default:
            return prevNotifications;
        }
      });
    }
  );

  const markAsRead = useCallback((notificationId: string) => {
    // This would trigger a websocket event to mark as read
    // Implementation depends on backend WebSocket API
    logger.debug('Marking notification as read:', notificationId);
  }, []);

  return { notifications, markAsRead };
}