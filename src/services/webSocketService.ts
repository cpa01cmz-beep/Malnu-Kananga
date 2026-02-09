
  import {
    STORAGE_KEYS,
    RETRY_CONFIG,
    TIME_MS,
    type UserRole
  } from '../constants';
  import { getAuthToken, parseJwtPayload, type AuthPayload } from './api/auth';
  import { logger } from '../utils/logger';
  import type { Grade, Attendance, Announcement, SchoolEvent, User, ELibrary, PushNotification, DirectMessage, Conversation } from '../types';

  /* eslint-disable no-undef -- WebSocket, MessageEvent, and CloseEvent are browser globals */

// NOTE: Inline DEFAULT_API_BASE_URL definition to avoid circular dependency with config.ts
// See Issue #1323 for circular dependency fix
const DEFAULT_API_BASE_URL = 'https://malnu-kananga-worker-prod.cpa01cmz.workers.dev';
const DEFAULT_WS_BASE_URL = DEFAULT_API_BASE_URL.replace('https://', 'wss://') + '/ws';



/**
 * Real-time event types for WebSocket communication
 */
export interface RealTimeEvent {
  type: RealTimeEventType;
  entity: string;
  entityId: string;
  data: unknown;
  timestamp: string;
  userRole: UserRole;
  userId: string;
}

export type RealTimeEventType =
  | 'grade_created' | 'grade_updated' | 'grade_deleted'
  | 'attendance_marked' | 'attendance_updated'
  | 'announcement_created' | 'announcement_updated' | 'announcement_deleted'
  | 'library_material_added' | 'library_material_updated'
  | 'event_created' | 'event_updated' | 'event_deleted'
  | 'user_role_changed' | 'user_status_changed'
  | 'message_created' | 'message_updated' | 'message_deleted'
  | 'message_read'
  | 'conversation_created' | 'conversation_updated' | 'conversation_deleted'
  | 'notification_created' | 'notification_read';

export interface WebSocketConnectionState {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  lastConnected?: string;
  reconnectAttempts: number;
  subscriptions: Set<RealTimeEventType>;
}

export interface RealTimeSubscription {
  eventType: RealTimeEventType;
  callback: (event: RealTimeEvent) => void;
  filter?: (event: RealTimeEvent) => boolean;
}

/**
 * Configuration for WebSocket service
 */
export const WS_CONFIG = {
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL ||
    (import.meta.env.VITE_API_BASE_URL?.replace('https://', 'wss://') || DEFAULT_WS_BASE_URL),
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: RETRY_CONFIG.WEBSOCKET_RECONNECT_DELAY,
  CONNECTION_TIMEOUT: RETRY_CONFIG.WEBSOCKET_CONNECTION_TIMEOUT,
  PING_INTERVAL: RETRY_CONFIG.WEBSOCKET_PING_INTERVAL,
  FALLBACK_POLLING_INTERVAL: RETRY_CONFIG.WEBSOCKET_FALLBACK_POLLING_INTERVAL,
  SUBSCRIPTION_TTL: RETRY_CONFIG.WEBSOCKET_SUBSCRIPTION_TTL, // 1 hour
} as const;

/**
 * WebSocket service for real-time data synchronization
 * Integrates with existing authentication and offline systems
 */
class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private pingInterval: number | null = null;
  private connectionTimeout: number | null = null;
  private subscriptions: Map<RealTimeEventType, Set<RealTimeSubscription>> = new Map();
  private connectionState: WebSocketConnectionState = {
    connected: false,
    connecting: false,
    reconnecting: false,
    reconnectAttempts: 0,
    subscriptions: new Set(),
  };
  private fallbackPollingInterval: number | null = null;
  private reconnectTimeout: number | null = null;
  private visibilityChangeHandler: (() => void) | null = null;

  private constructor() {
    this.loadConnectionState();
    this.setupVisibilityChangeHandler();
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Initialize WebSocket connection with authentication
   */
  async initialize(): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      logger.warn('WebSocket: No auth token available');
      return;
    }

    const payload = parseJwtPayload(token);
    if (!payload || this.isTokenExpired(payload)) {
      logger.warn('WebSocket: Token expired, skipping connection');
      return;
    }

    // Check if WebSocket is enabled in environment
    if (import.meta.env.VITE_WS_ENABLED === 'false') {
      logger.info('WebSocket: Disabled by environment variable');
      this.startFallbackPolling();
      return;
    }

    try {
      await this.connect(token);
    } catch (error) {
      logger.error('WebSocket: Failed to connect, falling back to polling', error);
      this.startFallbackPolling();
    }
  }

  /**
   * Establish WebSocket connection
   */
  private async connect(token: string): Promise<void> {
    if (this.ws?.readyState === 1) {
      return;
    }

    this.connectionState.connecting = true;
    this.connectionState.reconnecting = this.connectionState.reconnectAttempts > 0;
    this.saveConnectionState();

    const wsUrl = `${WS_CONFIG.WS_BASE_URL}?token=${token}`;
    logger.info(`WebSocket: Connecting to ${WS_CONFIG.WS_BASE_URL}`);

    return new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        // Connection timeout
        this.connectionTimeout = window.setTimeout(() => {
          if (this.ws?.readyState !== 1) {
            this.ws?.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, WS_CONFIG.CONNECTION_TIMEOUT);

        this.ws.onopen = () => {
          this.clearTimeouts();
          this.connectionState.connected = true;
          this.connectionState.connecting = false;
          this.connectionState.reconnecting = false;
          this.connectionState.reconnectAttempts = 0;
          this.connectionState.lastConnected = new Date().toISOString();
          this.saveConnectionState();

          logger.info('WebSocket: Connected successfully');
          this.startPingInterval();
          this.resubscribeAll();
          resolve();
        };

        this.ws.onmessage = (event: MessageEvent) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event: CloseEvent) => {
          this.clearTimeouts();
          this.connectionState.connected = false;
          this.connectionState.connecting = false;
          this.saveConnectionState();

          if (event.wasClean) {
            logger.info('WebSocket: Connection closed cleanly');
          } else {
            logger.warn('WebSocket: Connection closed unexpectedly', event.code, event.reason);
            this.handleReconnect();
          }
        };

        this.ws.onerror = (error: Event) => {
          this.clearTimeouts();
          logger.error('WebSocket: Error occurred', error);
          reject(error);
        };

      } catch (error) {
        this.clearTimeouts();
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'pong') {
        // Ping/pong response, ignore
        return;
      }

      const realTimeEvent: RealTimeEvent = {
        type: data.type,
        entity: data.entity,
        entityId: data.entityId,
        data: data.data,
        timestamp: data.timestamp,
        userRole: data.userRole,
        userId: data.userId,
      };

      logger.debug('WebSocket: Received event', realTimeEvent);
      this.handleRealTimeUpdate(realTimeEvent);

    } catch (error) {
      logger.error('WebSocket: Failed to parse message', error);
    }
  }

  /**
   * Process real-time events and update local state
   */
  private handleRealTimeUpdate(event: RealTimeEvent): void {
    // Update local storage based on entity type
    this.updateLocalStorage(event);
    
    // Notify subscribers
    const subscriptions = this.subscriptions.get(event.type);
    if (subscriptions) {
      subscriptions.forEach(subscription => {
        try {
          if (!subscription.filter || subscription.filter(event)) {
            subscription.callback(event);
          }
        } catch (error) {
          logger.error('WebSocket: Subscription callback error', error);
        }
      });
    }

    // Emit unified notification for global listeners
    this.emitGlobalEvent(event);
  }

  /**
   * Update local storage for real-time sync
   */
  private updateLocalStorage(event: RealTimeEvent): void {
    try {
      switch (event.entity) {
        case 'grade':
          this.updateGradesData(event);
          break;
        case 'attendance':
          this.updateAttendanceData(event);
          break;
        case 'announcement':
          this.updateAnnouncementsData(event);
          break;
        case 'library_material':
          this.updateLibraryData(event);
          break;
        case 'event':
          this.updateEventsData(event);
          break;
        case 'user':
          this.updateUsersData(event);
          break;
        case 'notification':
          this.updateNotificationsData(event);
          break;
        case 'message':
        case 'conversation':
          this.updateMessagesData(event);
          break;
        default:
          logger.debug('WebSocket: No local storage update for entity', event.entity);
      }
    } catch (error) {
      logger.error('WebSocket: Failed to update local storage', error);
    }
  }

  private updateGradesData(event: RealTimeEvent): void {
    const gradesJSON = localStorage.getItem(STORAGE_KEYS.GRADES);
    const grades: Grade[] = gradesJSON ? JSON.parse(gradesJSON) : [];
    const gradeData = event.data as Grade;
    
    const index = grades.findIndex((g: Grade) => g.id === gradeData.id);
    if (event.type === 'grade_deleted') {
      if (index !== -1) grades.splice(index, 1);
    } else {
      if (index !== -1) {
        grades[index] = gradeData;
      } else if (event.type === 'grade_created') {
        grades.push(gradeData);
      }
    }
    
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
  }

  private updateAttendanceData(event: RealTimeEvent): void {
    const attendanceJSON = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const attendance: Attendance[] = attendanceJSON ? JSON.parse(attendanceJSON) : [];
    const attendanceData = event.data as Attendance;
    
    const index = attendance.findIndex((a: Attendance) => a.id === attendanceData.id);
    if (index !== -1) {
      attendance[index] = attendanceData;
    } else if (event.type === 'attendance_marked') {
      attendance.push(attendanceData);
    }
    
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }

  private updateAnnouncementsData(event: RealTimeEvent): void {
    const announcementsJSON = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    const announcements: Announcement[] = announcementsJSON ? JSON.parse(announcementsJSON) : [];
    const announcementData = event.data as Announcement;
    
    const index = announcements.findIndex((a: Announcement) => a.id === announcementData.id);
    if (event.type === 'announcement_deleted') {
      if (index !== -1) announcements.splice(index, 1);
    } else {
      if (index !== -1) {
        announcements[index] = announcementData;
      } else if (event.type === 'announcement_created') {
        announcements.push(announcementData);
      }
    }
    
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }

  private updateLibraryData(event: RealTimeEvent): void {
    const materialsJSON = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    const materials: ELibrary[] = materialsJSON ? JSON.parse(materialsJSON) : [];
    const materialData = event.data as ELibrary;
    
    const index = materials.findIndex((m: ELibrary) => m.id === materialData.id);
    if (index !== -1) {
      materials[index] = materialData;
    } else if (event.type === 'library_material_added') {
      materials.push(materialData);
    }
    
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  }

private updateEventsData(event: RealTimeEvent): void {
    const eventsJSON = localStorage.getItem(STORAGE_KEYS.EVENTS);
    const eventDataList: SchoolEvent[] = eventsJSON ? JSON.parse(eventsJSON) : [];
    const eventData = event.data as SchoolEvent;
    
    const index = eventDataList.findIndex((e: SchoolEvent) => e.id === eventData.id);
    if (event.type === 'event_deleted') {
      if (index !== -1) eventDataList.splice(index, 1);
    } else {
      if (index !== -1) {
        eventDataList[index] = eventData;
      } else if (event.type === 'event_created') {
        eventDataList.push(eventData);
      }
    }
    
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(eventDataList));
  }

  private updateUsersData(event: RealTimeEvent): void {
    const usersJSON = localStorage.getItem(STORAGE_KEYS.USERS);
    const users: User[] = usersJSON ? JSON.parse(usersJSON) : [];
    const userData = event.data as User;
    
    const index = users.findIndex((u: User) => u.id === userData.id);
    if (index !== -1) {
      users[index] = userData;
    }
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  private updateNotificationsData(event: RealTimeEvent): void {
    const notificationsJSON = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications: PushNotification[] = notificationsJSON ? JSON.parse(notificationsJSON) : [];
    const notificationData = event.data as PushNotification;

    const index = notifications.findIndex((n: PushNotification) => n.id === notificationData.id);
    if (index !== -1) {
      notifications[index] = notificationData;
    } else if (event.type === 'notification_created') {
      notifications.push(notificationData);
    }

    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }

  private updateMessagesData(event: RealTimeEvent): void {
    if (event.entity === 'message') {
      const messagesJSON = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      const messages: DirectMessage[] = messagesJSON ? JSON.parse(messagesJSON) : [];
      const messageData = event.data as DirectMessage;

      const index = messages.findIndex((m: DirectMessage) => m.id === messageData.id);
      if (event.type === 'message_deleted') {
        if (index !== -1) messages.splice(index, 1);
      } else {
        if (index !== -1) {
          messages[index] = messageData;
        } else if (event.type === 'message_created') {
          messages.push(messageData);
        }
      }

      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } else if (event.entity === 'conversation') {
      const conversationsJSON = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      const conversations: Conversation[] = conversationsJSON ? JSON.parse(conversationsJSON) : [];
      const conversationData = event.data as Conversation;

      const index = conversations.findIndex((c: Conversation) => c.id === conversationData.id);
      if (event.type === 'conversation_deleted') {
        if (index !== -1) conversations.splice(index, 1);
      } else {
        if (index !== -1) {
          conversations[index] = conversationData;
        } else if (event.type === 'conversation_created') {
          conversations.push(conversationData);
        }
      }

      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    }
  }

  /**
   * Emit global event for unified notification system
   */
  private emitGlobalEvent(event: RealTimeEvent): void {
    const globalEvent = new CustomEvent('realtime-update', {
      detail: {
        type: event.type,
        entity: event.entity,
        entityId: event.entityId,
        data: event.data,
        timestamp: event.timestamp,
        userRole: event.userRole,
        userId: event.userId,
      }
    });
    
    window.dispatchEvent(globalEvent);
  }

  /**
   * Subscribe to specific real-time events
   */
  subscribe(subscription: RealTimeSubscription): () => void {
    if (!this.subscriptions.has(subscription.eventType)) {
      this.subscriptions.set(subscription.eventType, new Set());
    }
    
    this.subscriptions.get(subscription.eventType)!.add(subscription);
    this.connectionState.subscriptions.add(subscription.eventType);
    this.saveConnectionState();

    // Send subscription to server if connected
    if (this.ws?.readyState === 1) {
      this.sendSubscription(subscription.eventType);
    }

    logger.debug('WebSocket: Subscribed to', subscription.eventType);

    // Return unsubscribe function
    return () => {
      this.subscriptions.get(subscription.eventType)?.delete(subscription);
      if (this.subscriptions.get(subscription.eventType)?.size === 0) {
        this.subscriptions.delete(subscription.eventType);
        this.connectionState.subscriptions.delete(subscription.eventType);
      }
      this.saveConnectionState();

      if (this.ws?.readyState === 1) {
        this.sendUnsubscription(subscription.eventType);
      }

      logger.debug('WebSocket: Unsubscribed from', subscription.eventType);
    };
  }

  /**
   * Send subscription message to server
   */
  private sendSubscription(eventType: RealTimeEventType): void {
    if (this.ws?.readyState === 1) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        eventType,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  /**
   * Send unsubscription message to server
   */
  private sendUnsubscription(eventType: RealTimeEventType): void {
    if (this.ws?.readyState === 1) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        eventType,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  /**
   * Resubscribe to all events after reconnection
   */
  private resubscribeAll(): void {
    const eventTypes = Array.from(this.connectionState.subscriptions);
    eventTypes.forEach(eventType => {
      this.sendSubscription(eventType);
    });
    logger.debug('WebSocket: Resubscribed to', eventTypes.length, 'event types');
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.connectionState.reconnectAttempts >= WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      logger.error('WebSocket: Max reconnection attempts reached, falling back to polling');
      this.startFallbackPolling();
      return;
    }

    this.connectionState.reconnectAttempts++;
    this.connectionState.reconnecting = true;
    this.saveConnectionState();

    const delay = WS_CONFIG.RECONNECT_DELAY * Math.pow(2, this.connectionState.reconnectAttempts - 1);
    logger.info(`WebSocket: Reconnecting in ${delay}ms (attempt ${this.connectionState.reconnectAttempts})`);

    this.reconnectTimeout = window.setTimeout(() => {
      this.initialize().catch(error => {
        logger.error('WebSocket: Reconnection failed', error);
        this.handleReconnect();
      });
    }, delay);
  }

  /**
   * Start fallback polling for offline/unsupported scenarios
   */
  private startFallbackPolling(): void {
    if (this.fallbackPollingInterval) {
      return;
    }

    logger.info('WebSocket: Starting fallback polling');
    this.fallbackPollingInterval = window.setInterval(() => {
      this.pollForUpdates().catch(error => {
        logger.error('WebSocket: Fallback polling error', error);
      });
    }, WS_CONFIG.FALLBACK_POLLING_INTERVAL);
  }

  /**
   * Poll for updates when WebSocket is unavailable
   */
  private async pollForUpdates(): Promise<void> {
    const token = getAuthToken();
    if (!token) return;

    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || new Date(0).toISOString();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL}/api/updates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'If-Modified-Since': lastSync,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data.updates)) {
          data.data.updates.forEach((update: RealTimeEvent) => {
            this.handleRealTimeUpdate(update);
          });
        
          localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, new Date().toISOString());
        }
      }
    } catch (error) {
      logger.debug('WebSocket: No updates available or polling failed', error);
    }
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    this.clearPingInterval();
    this.pingInterval = window.setInterval(() => {
      if (this.ws?.readyState === 1) {
        this.ws.send(JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString(),
        }));
      }
    }, WS_CONFIG.PING_INTERVAL);
  }

  /**
   * Clear all timeouts and intervals
   */
  private clearTimeouts(): void {
    if (this.connectionTimeout) {
      window.clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.clearPingInterval();
  }

  private clearPingInterval(): void {
    if (this.pingInterval) {
      window.clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Handle page visibility changes
   */
  private setupVisibilityChangeHandler(): void {
    this.visibilityChangeHandler = () => {
      if (document.hidden) {
        this.clearPingInterval();
      } else {
        if (this.connectionState.connected) {
          this.startPingInterval();
          const lastConnected = this.connectionState.lastConnected;
          if (lastConnected) {
            const timeAway = Date.now() - new Date(lastConnected).getTime();
            if (timeAway > TIME_MS.ONE_MINUTE) {
              this.pollForUpdates().catch(() => {});
            }
          }
        } else if (!this.fallbackPollingInterval) {
          this.initialize().catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  /**
   * Check if JWT token is expired
   */
  private isTokenExpired(payload: AuthPayload): boolean {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  /**
   * Save connection state to localStorage
   */
  private saveConnectionState(): void {
    localStorage.setItem(STORAGE_KEYS.WS_CONNECTION, JSON.stringify(this.connectionState));
  }

  /**
   * Load connection state from localStorage
   */
  private loadConnectionState(): void {
    const stored = localStorage.getItem(STORAGE_KEYS.WS_CONNECTION);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.connectionState = {
          ...this.connectionState,
          ...parsed,
          subscriptions: new Set(parsed.subscriptions || []),
        };
      } catch (error) {
        logger.error('WebSocket: Failed to load connection state', error);
      }
    }
  }

  /**
   * Disconnect WebSocket gracefully
   */
  disconnect(): void {
    this.clearTimeouts();
    
    if (this.fallbackPollingInterval) {
      window.clearInterval(this.fallbackPollingInterval);
      this.fallbackPollingInterval = null;
    }

    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }

    if (this.ws?.readyState === 1) {
      this.ws.send(JSON.stringify({
        type: 'disconnect',
        timestamp: new Date().toISOString(),
      }));
      this.ws.close(1000, 'Client disconnect');
    }
    
    this.ws = null;
    this.connectionState.connected = false;
    this.connectionState.connecting = false;
    this.connectionState.reconnecting = false;
    this.connectionState.reconnectAttempts = 0;
    this.saveConnectionState();
    
    logger.info('WebSocket: Disconnected');
  }

  /**
   * Get current connection state
   */
  getConnectionState(): WebSocketConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.connectionState.connected && this.ws?.readyState === 1;
  }

  /**
   * Force reconnection
   */
  async reconnect(): Promise<void> {
    try {
      this.disconnect();
      await this.initialize();
    } catch (error) {
      logger.error('Error in reconnect:', error);
      this.connectionState.reconnecting = false;
      this.connectionState.connected = false;
    }
  }
}

// Export singleton instance
export const webSocketService = WebSocketService.getInstance();