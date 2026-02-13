import { useState, useEffect, useCallback, useRef } from 'react';
import { webSocketService, type PresenceData, type PresenceEvent } from '../services/webSocketService';
import { logger } from '../utils/logger';

interface UsePresenceOptions {
  enabled?: boolean;
  trackCurrentPage?: boolean;
}

interface UsePresenceResult {
  onlineUsers: PresenceData[];
  currentPageUsers: PresenceData[];
  userCount: number;
  isTracking: boolean;
  updatePresence: (page?: string) => void;
}

export const usePresence = (options: UsePresenceOptions = {}): UsePresenceResult => {
  const { enabled = true, trackCurrentPage = false } = options;

  const [onlineUsers, setOnlineUsers] = useState<PresenceData[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const usersRef = useRef<Map<string, PresenceData>>(new Map());
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handlePresenceEvent = useCallback((event: PresenceEvent) => {
    const { userId, userName, userRole, data, type } = event;

    if (type === 'user_online' || type === 'presence_update') {
      const existingUser = usersRef.current.get(userId);
      const presenceData: PresenceData = data || {
        userId,
        userName,
        userRole,
        lastSeen: event.timestamp,
        status: 'online',
      };

      usersRef.current.set(userId, {
        ...existingUser,
        ...presenceData,
        lastSeen: event.timestamp,
        status: 'online',
      });
    } else if (type === 'user_offline') {
      const existingUser = usersRef.current.get(userId);
      if (existingUser) {
        usersRef.current.set(userId, {
          ...existingUser,
          status: 'offline',
          lastSeen: event.timestamp,
        });
      }
    } else if (type === 'user_heartbeat') {
      const existingUser = usersRef.current.get(userId);
      if (existingUser) {
        usersRef.current.set(userId, {
          ...existingUser,
          lastSeen: event.timestamp,
          status: 'online',
        });
      }
    }

    setOnlineUsers(Array.from(usersRef.current.values()).filter(u => u.status !== 'offline'));
  }, []);

  const updatePresence = useCallback((page?: string) => {
    if (!enabled) return;

    const currentUser = usersRef.current.get('current_user');
    if (currentUser) {
      const updated: PresenceData = {
        ...currentUser,
        currentPage: page || currentUser.currentPage,
        lastSeen: new Date().toISOString(),
        status: 'online',
      };
      usersRef.current.set('current_user', updated);
      setOnlineUsers(Array.from(usersRef.current.values()).filter(u => u.status !== 'offline'));

      logger.debug('Presence updated:', updated);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setIsTracking(false);
      return;
    }

    let mounted = true;

    const initializePresence = async () => {
      try {
        await webSocketService.initialize();

        if (mounted) {
          webSocketService.subscribe({
            eventType: 'user_online',
            callback: (event) => handlePresenceEvent(event as unknown as PresenceEvent),
          });

          webSocketService.subscribe({
            eventType: 'user_offline',
            callback: (event) => handlePresenceEvent(event as unknown as PresenceEvent),
          });

          webSocketService.subscribe({
            eventType: 'user_heartbeat',
            callback: (event) => handlePresenceEvent(event as unknown as PresenceEvent),
          });

          webSocketService.subscribe({
            eventType: 'presence_update',
            callback: (event) => handlePresenceEvent(event as unknown as PresenceEvent),
          });

          setIsTracking(true);
          logger.debug('Presence tracking initialized');
        }
      } catch (error) {
        logger.error('Failed to initialize presence tracking:', error);
      }
    };

    initializePresence();

    return () => {
      mounted = false;
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      setIsTracking(false);
    };
  }, [enabled, handlePresenceEvent]);

  const currentPageUsers = trackCurrentPage
    ? onlineUsers.filter(u => u.currentPage && u.currentPage !== '')
    : [];

  return {
    onlineUsers,
    currentPageUsers,
    userCount: onlineUsers.length,
    isTracking,
    updatePresence,
  };
};
