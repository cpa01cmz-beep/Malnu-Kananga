import { useState, useEffect, useCallback, useRef } from 'react';
import { webSocketService } from '../services/webSocketService';
import type { RealTimeEvent, RealTimeEventType, RealTimeSubscription } from '../services/webSocketService';
import { logger } from '../utils/logger';

interface UseRealtimeEventsOptions {
  eventTypes: RealTimeEventType[];
  filter?: (event: RealTimeEvent) => boolean;
  onEvent?: (event: RealTimeEvent) => void;
  enabled?: boolean;
}

interface UseRealtimeEventsResult {
  isConnected: boolean;
  isConnecting: boolean;
  lastEvent: RealTimeEvent | null;
  eventCount: number;
  reconnectAttempts: number;
}

export const useRealtimeEvents = (options: UseRealtimeEventsOptions): UseRealtimeEventsResult => {
  const { eventTypes, filter, onEvent, enabled = true } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealTimeEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const unsubscribeFunctionsRef = useRef<Map<RealTimeEventType, () => void>>(new Map());
  const connectionStateRef = useRef<ReturnType<typeof webSocketService.getConnectionState> | null>(null);

  const checkConnectionState = useCallback(() => {
    const state = webSocketService.getConnectionState();
    connectionStateRef.current = state;
    setIsConnected(state.connected);
    setIsConnecting(state.connecting || state.reconnecting);
    setReconnectAttempts(state.reconnectAttempts);
  }, []);

  const handleEvent = useCallback((event: RealTimeEvent) => {
    setLastEvent(event);
    setEventCount((prev) => prev + 1);

    logger.debug('Realtime event received:', event);

    if (onEvent) {
      try {
        onEvent(event);
      } catch (error) {
        logger.error('Error in event handler:', error);
      }
    }
  }, [onEvent]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let mounted = true;

    const initializeSubscriptions = async () => {
      try {
        await webSocketService.initialize();
        checkConnectionState();

        if (mounted) {
          unsubscribeFunctionsRef.current = new Map();

          eventTypes.forEach((eventType) => {
            const subscription: RealTimeSubscription = {
              eventType,
              callback: handleEvent,
              filter,
            };

            const unsubscribe = webSocketService.subscribe(subscription);
            unsubscribeFunctionsRef.current.set(eventType, unsubscribe);
          });

          logger.debug('Subscribed to events:', eventTypes);
        }
      } catch (error) {
        logger.error('Failed to initialize realtime subscriptions:', error);
      }
    };

    initializeSubscriptions();

    const connectionCheckInterval = setInterval(() => {
      if (mounted) {
        checkConnectionState();
      }
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(connectionCheckInterval);

      unsubscribeFunctionsRef.current.forEach((unsubscribe) => {
        try {
          unsubscribe();
        } catch (error) {
          logger.error('Error unsubscribing from event:', error);
        }
      });

      unsubscribeFunctionsRef.current.clear();
      logger.debug('Unsubscribed from all events');
    };
  }, [enabled, eventTypes, filter, handleEvent, checkConnectionState]);

  return {
    isConnected,
    isConnecting,
    lastEvent,
    eventCount,
    reconnectAttempts,
  };
};
