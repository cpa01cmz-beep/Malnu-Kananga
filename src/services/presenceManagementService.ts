/**
 * Presence Management Service
 * Handles real-time presence tracking across all users
 * Milestone 3.0 - Real-Time Collaboration
 */

import { PresenceUpdateEvent } from '../types/realtime.types';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

/**
 * Presence Management Service
 * Manages user presence across the application
 */
class PresenceManagementService {
  private presence: Map<string, PresenceUpdateEvent> = new Map();
  private subscribers: Map<string, Set<(event: PresenceUpdateEvent) => void>> = new Map();
  private lastActivity: Map<string, number> = new Map();

  // Configuration
  private readonly config = {
    presenceUpdateInterval: 30000, // 30 seconds
    offlineThreshold: 60 * 1000, // 1 minute
    awayThreshold: 5 * 60 * 1000, // 5 minutes
    activityRetention: 24 * 60 * 60 * 1000, // 24 hours
  };

  private activityTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private presenceUpdateTimer?: ReturnType<typeof setInterval>;

  constructor() {
    this.startPeriodicUpdates();
    this.loadPresenceFromStorage();
  }

  /**
   * Update user presence
   */
  async updatePresence(
    userId: string,
    presence: PresenceUpdateEvent['presence'],
    status?: string
  ): Promise<void> {
    const event: PresenceUpdateEvent = {
      userId,
      presence,
      status,
      lastActivity: Date.now(),
    };

    this.presence.set(userId, event);
    this.lastActivity.set(userId, Date.now());

    // Persist to localStorage
    await this.persistPresence(userId);

    // Notify all subscribers
    this.notifyAllSubscribers(event);

    logger.debug('Presence updated', { userId, presence, status });
  }

  /**
   * Record user activity (automatically updates to online/away)
   */
  recordActivity(userId: string): void {
    const current = this.presence.get(userId);

    // If currently offline or away, update to online
    if (!current || current.presence === 'offline' || current.presence === 'away') {
      this.updatePresence(userId, 'online');
    } else if (current.presence === 'online') {
      // Update last activity
      current.lastActivity = Date.now();
      this.lastActivity.set(userId, Date.now());
    }

    // Reset activity timer
    this.resetActivityTimer(userId);
  }

  /**
   * Set user as away
   */
  async setAway(userId: string): Promise<void> {
    await this.updatePresence(userId, 'away');
  }

  /**
   * Set user as busy
   */
  async setBusy(userId: string, status?: string): Promise<void> {
    await this.updatePresence(userId, 'busy', status);
  }

  /**
   * Set user as offline
   */
  async setOffline(userId: string): Promise<void> {
    await this.updatePresence(userId, 'offline');
  }

  /**
   * Get presence for a user
   */
  getPresence(userId: string): PresenceUpdateEvent | undefined {
    return this.presence.get(userId);
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): string[] {
    return this.getUsersByPresence('online');
  }

  /**
   * Get all away users
   */
  getAwayUsers(): string[] {
    return this.getUsersByPresence('away');
  }

  /**
   * Get all busy users
   */
  getBusyUsers(): string[] {
    return this.getUsersByPresence('busy');
  }

  /**
   * Get users by presence state
   */
  private getUsersByPresence(presence: PresenceUpdateEvent['presence']): string[] {
    const now = Date.now();
    return Array.from(this.presence.entries())
      .filter(([_, event]) => {
        // Check if user is actually still considered in this state based on time thresholds
        if (presence === 'online') {
          return event.presence === 'online' && now - event.lastActivity < this.config.awayThreshold;
        }
        return event.presence === presence;
      })
      .map(([userId]) => userId);
  }

  /**
   * Get all active users (online, away, busy)
   */
  getActiveUsers(): string[] {
    const now = Date.now();
    return Array.from(this.presence.entries())
      .filter(([_, event]) => {
        return event.presence !== 'offline' && now - event.lastActivity < this.config.offlineThreshold;
      })
      .map(([userId]) => userId);
  }

  /**
   * Get presence status for multiple users
   */
  getBulkPresence(userIds: string[]): Map<string, PresenceUpdateEvent> {
    const result = new Map<string, PresenceUpdateEvent>();

    userIds.forEach(userId => {
      const presence = this.presence.get(userId);
      if (presence) {
        result.set(userId, presence);
      }
    });

    return result;
  }

  /**
   * Subscribe to presence updates for all users
   */
  subscribe(callback: (event: PresenceUpdateEvent) => void): () => void {
    const subscriberId = `subscriber-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (!this.subscribers.has(subscriberId)) {
      this.subscribers.set(subscriberId, new Set());
    }

    this.subscribers.get(subscriberId)!.add(callback);

    return () => {
      this.subscribers.get(subscriberId)?.delete(callback);
    };
  }

  /**
   * Subscribe to presence updates for a specific user
   */
  subscribeUser(userId: string, callback: (event: PresenceUpdateEvent) => void): () => void {
    const subscriberId = `user-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (!this.subscribers.has(subscriberId)) {
      this.subscribers.set(subscriberId, new Set());
    }

    this.subscribers.get(subscriberId)!.add(callback);

    return () => {
      this.subscribers.get(subscriberId)?.delete(callback);
    };
  }

  /**
   * Notify all subscribers of a presence update
   */
  private notifyAllSubscribers(event: PresenceUpdateEvent): void {
    for (const subscribers of this.subscribers.values()) {
      subscribers.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          logger.error('Error notifying presence subscriber', { userId: event.userId, error });
        }
      });
    }
  }

  /**
   * Start periodic presence updates
   */
  private startPeriodicUpdates(): void {
    this.presenceUpdateTimer = setInterval(() => {
      this.updatePresenceStates();
    }, this.config.presenceUpdateInterval);
  }

  /**
   * Update presence states based on inactivity
   */
  private updatePresenceStates(): void {
    const now = Date.now();

    for (const [userId, event] of this.presence.entries()) {
      const inactiveTime = now - event.lastActivity;

      // Check if user should be marked as away
      if (event.presence === 'online' && inactiveTime >= this.config.awayThreshold) {
        this.updatePresence(userId, 'away');
      }

      // Check if user should be marked as offline
      if (inactiveTime >= this.config.offlineThreshold) {
        this.updatePresence(userId, 'offline');
      }
    }
  }

  /**
   * Reset activity timer for a user
   */
  private resetActivityTimer(userId: string): void {
    // Clear existing timer
    const existingTimer = this.activityTimers.get(userId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer to mark as away if inactive
    const timer = setTimeout(() => {
      const current = this.presence.get(userId);
      if (current && current.presence === 'online') {
        this.setAway(userId);
      }
    }, this.config.awayThreshold);

    this.activityTimers.set(userId, timer);
  }

  /**
   * Persist presence to localStorage
   */
  private async persistPresence(userId: string): Promise<void> {
    const presence = this.presence.get(userId);
    if (!presence) {
      return;
    }

    const key = `${STORAGE_KEYS.PRESENCE}_${userId}`;
    localStorage.setItem(key, JSON.stringify(presence));
  }

  /**
   * Load presence from localStorage
   */
  private loadPresenceFromStorage(): void {
    const keys = Object.keys(localStorage);

    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.PRESENCE)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const presence = JSON.parse(stored) as PresenceUpdateEvent;
            this.presence.set(presence.userId, presence);
            this.lastActivity.set(presence.userId, presence.lastActivity);
          }
        } catch (error) {
          logger.error('Error loading presence from storage', { key, error });
        }
      }
    });
  }

  /**
   * Remove presence for a user
   */
  async removePresence(userId: string): Promise<void> {
    this.presence.delete(userId);
    this.lastActivity.delete(userId);

    // Clear activity timer
    const timer = this.activityTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.activityTimers.delete(userId);
    }

    // Clear from localStorage
    const key = `${STORAGE_KEYS.PRESENCE}_${userId}`;
    localStorage.removeItem(key);

    logger.info('Presence removed', { userId });
  }

  /**
   * Get presence statistics
   */
  getPresenceStats(): {
    totalUsers: number;
    onlineUsers: number;
    awayUsers: number;
    busyUsers: number;
    offlineUsers: number;
  } {
    const now = Date.now();
    let online = 0;
    let away = 0;
    let busy = 0;
    let offline = 0;

    for (const [_userId, event] of this.presence.entries()) {
      const inactiveTime = now - event.lastActivity;

      if (inactiveTime >= this.config.offlineThreshold) {
        offline++;
      } else if (event.presence === 'busy') {
        busy++;
      } else if (event.presence === 'away' || inactiveTime >= this.config.awayThreshold) {
        away++;
      } else {
        online++;
      }
    }

    return {
      totalUsers: this.presence.size,
      onlineUsers: online,
      awayUsers: away,
      busyUsers: busy,
      offlineUsers: offline,
    };
  }

  /**
   * Clear all presence data (for testing)
   */
  async clearAll(): Promise<void> {
    this.presence.clear();
    this.subscribers.clear();
    this.lastActivity.clear();

    // Clear activity timers
    this.activityTimers.forEach(timer => clearTimeout(timer));
    this.activityTimers.clear();

    // Clear presence update timer
    if (this.presenceUpdateTimer) {
      clearInterval(this.presenceUpdateTimer);
    }

    // Clear localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.PRESENCE)) {
        localStorage.removeItem(key);
      }
    });

    logger.info('All presence data cleared');
  }

  /**
   * Stop presence management (cleanup)
   */
  stop(): void {
    if (this.presenceUpdateTimer) {
      clearInterval(this.presenceUpdateTimer);
    }

    this.activityTimers.forEach(timer => clearTimeout(timer));
  }
}

// Export singleton instance
export const presenceManagementService = new PresenceManagementService();

// Export class for testing
export { PresenceManagementService };
