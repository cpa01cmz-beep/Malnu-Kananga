// offlineActionQueueService.ts - Offline Action Queue and Sync System
// Handles queuing actions when offline and syncing when online
//
// NOTE: This service uses dynamic imports for geminiService, aiCacheService, and
// webSocketService to avoid circular dependencies during module initialization.
// These modules are also statically imported elsewhere in the codebase, so Vite will show
// warnings about dynamic imports not actually lazy-loading. These warnings are expected and
// intentional - the dynamic imports serve to break circular dependency chains during
// initialization, not to enable lazy loading.

import { logger } from '../utils/logger';
import { STORAGE_KEYS, TIME_MS, UI_DELAYS, HTTP } from '../constants';
import { useNetworkStatus } from '../utils/networkStatus';
import { isNetworkError } from '../utils/retry';
import { generateId, ID_CONFIG } from '../utils/idGenerator';

// Define ApiResponse locally to avoid circular dependency
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Type for RealTimeEvent (imported from webSocketService via dynamic import)
export interface RealTimeEvent {
  type: string;
  entity: string;
  entityId: string;
  data: unknown;
  timestamp: string;
  userRole: string;
  userId: string;
}

// ============================================
// TYPES
// ============================================

export type ActionType = 
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'submit'
  | 'approve'
  | 'reject'
  | 'analyze';

export type EntityType = 
  | 'grade'
  | 'attendance'
  | 'assignment'
  | 'material'
  | 'announcement'
  | 'event'
  | 'ppdb'
  | 'inventory'
  | 'schedule'
  | 'meeting'
  | 'user'
  | 'ai_analysis';

export type ActionStatus = 
  | 'pending'
  | 'syncing'
  | 'completed'
  | 'failed'
  | 'conflict';

export interface OfflineAction {
  id: string;
  type: ActionType;
  entity: EntityType;
  entityId: string;
  data: unknown;
  timestamp: number;
  status: ActionStatus;
  retryCount: number;
  lastError?: string;
  serverVersion?: number; // For conflict detection
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

export interface SyncResult {
  success: boolean;
  actionsProcessed: number;
  actionsFailed: number;
  conflicts: OfflineAction[];
  errors: string[];
}

export interface ConflictResolution {
  actionId: string;
  resolution: 'keep_local' | 'use_server' | 'merge';
  mergedData?: Record<string, unknown>;
}

// ============================================
// CONFIGURATION
// ============================================

const SYNC_BATCH_SIZE = 5;
const CONFLICT_THRESHOLD = 3; // Max attempts before marking as conflict

// ============================================
// OFFLINE ACTION QUEUE SERVICE
// ============================================

class OfflineActionQueueService {
  private queue: OfflineAction[] = [];
  private isSyncing = false;
  private syncCallbacks: Set<(result: SyncResult) => void> = new Set();
  private websocketUnsubscribers: (() => void)[] = [];

  constructor() {
    this.loadQueue();
    this.setupNetworkListener();
  }

  // ============================================
  // QUEUE MANAGEMENT
  // ============================================

  /**
   * Add an action to the offline queue
   */
  public addAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'status' | 'retryCount'>): string {
    const queueAction: OfflineAction = {
      ...action,
      id: generateId({ prefix: ID_CONFIG.PREFIXES.OFFLINE }),
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    this.queue.push(queueAction);
    this.saveQueue();
    
    logger.info('Offline action added to queue', {
      actionId: queueAction.id,
      type: queueAction.type,
      entity: queueAction.entity,
      endpoint: queueAction.endpoint,
    });

    // Note: Sync will be triggered by network listener when comes online
    // This avoids hook usage in class constructor

    return queueAction.id;
  }

  /**
   * Remove an action from the queue
   */
  public removeAction(actionId: string): boolean {
    const index = this.queue.findIndex(action => action.id === actionId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.saveQueue();
      logger.info('Offline action removed from queue', { actionId });
      return true;
    }
    return false;
  }

  /**
   * Get all actions in the queue
   */
  public getQueue(): OfflineAction[] {
    return [...this.queue];
  }

  /**
   * Get actions by status
   */
  public getActionsByStatus(status: ActionStatus): OfflineAction[] {
    return this.queue.filter(action => action.status === status);
  }

  /**
   * Get pending actions count
   */
  public getPendingCount(): number {
    return this.queue.filter(action => action.status === 'pending').length;
  }

  /**
   * Get failed actions count
   */
  public getFailedCount(): number {
    return this.queue.filter(action => action.status === 'failed').length;
  }

  /**
   * Clear completed actions (older than 1 hour)
   */
  public clearCompletedActions(): void {
    const oneHourAgo = Date.now() - TIME_MS.ONE_HOUR;
    const initialLength = this.queue.length;
    
    this.queue = this.queue.filter(action => {
      return !(action.status === 'completed' && action.timestamp < oneHourAgo);
    });

    if (this.queue.length !== initialLength) {
      this.saveQueue();
      logger.info('Cleared completed offline actions', {
        cleared: initialLength - this.queue.length,
        remaining: this.queue.length,
      });
    }
  }

  // ============================================
  // SYNC OPERATIONS
  // ============================================

  /**
   * Sync all pending actions
   */
  public async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        actionsProcessed: 0,
        actionsFailed: 0,
        conflicts: [],
        errors: ['Sync already in progress'],
      };
    }

    this.isSyncing = true;
    logger.info('Starting offline action sync');

    const result: SyncResult = {
      success: true,
      actionsProcessed: 0,
      actionsFailed: 0,
      conflicts: [],
      errors: [],
    };

    try {
      const pendingActions = this.queue.filter(action => action.status === 'pending');
      const batches = this.createBatches(pendingActions, SYNC_BATCH_SIZE);

      for (const batch of batches) {
        const batchResult = await this.processBatch(batch);
        result.actionsProcessed += batchResult.processed;
        result.actionsFailed += batchResult.failed;
        result.conflicts.push(...batchResult.conflicts);
        result.errors.push(...batchResult.errors);

        // Small delay between batches
        if (batches.indexOf(batch) !== batches.length - 1) {
          await this.delay(UI_DELAYS.SYNC_BATCH_DELAY);
        }
      }

      // Remove completed actions
      this.queue = this.queue.filter(action => action.status !== 'completed');
      this.saveQueue();

      logger.info('Offline action sync completed', {
        processed: result.actionsProcessed,
        failed: result.actionsFailed,
        conflicts: result.conflicts.length,
        errors: result.errors.length,
      });

    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      logger.error('Offline action sync failed', { error });
    } finally {
      this.isSyncing = false;
      this.notifySyncComplete(result);
    }

    return result;
  }

  /**
   * Retry failed actions
   */
  public async retryFailedActions(): Promise<SyncResult> {
    const failedActions = this.getActionsByStatus('failed');
    
    // Reset failed actions to pending
    failedActions.forEach(action => {
      action.status = 'pending';
      action.retryCount = 0;
      action.lastError = undefined;
    });

    this.saveQueue();
    logger.info('Retrying failed offline actions', { count: failedActions.length });

    return this.sync();
  }

  /**
   * Resolve conflicts
   */
  public resolveConflict(resolution: ConflictResolution): void {
    const action = this.queue.find(a => a.id === resolution.actionId);
    if (!action) {
      logger.error('Action not found for conflict resolution', { actionId: resolution.actionId });
      return;
    }

    if (resolution.resolution === 'use_server') {
      // Remove local action, keep server version
      this.removeAction(action.id);
    } else if (resolution.resolution === 'keep_local') {
      // Force update server with local data
      action.status = 'pending';
      action.retryCount = 0;
      action.lastError = undefined;
    } else if (resolution.resolution === 'merge' && resolution.mergedData) {
      // Update with merged data and retry
      action.data = resolution.mergedData;
      action.status = 'pending';
      action.retryCount = 0;
      action.lastError = undefined;
    }

    this.saveQueue();
    logger.info('Conflict resolved', { 
      actionId: resolution.actionId, 
      resolution: resolution.resolution 
    });
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private async processBatch(batch: OfflineAction[]): Promise<{
    processed: number;
    failed: number;
    conflicts: OfflineAction[];
    errors: string[];
  }> {
    const result = {
      processed: 0,
      failed: 0,
      conflicts: [] as OfflineAction[],
      errors: [] as string[],
    };

    for (const action of batch) {
      try {
        action.status = 'syncing';
        this.saveQueue();

        const success = await this.executeAction(action);
        
        if (success) {
          action.status = 'completed';
          result.processed++;
        } else {
          result.failed++;
        }
      } catch (error) {
        action.lastError = error instanceof Error ? error.message : 'Unknown error';
        action.retryCount++;

        // Check if action was already marked as conflict in executeAction
        if (action.status === 'conflict') {
          result.conflicts.push(action);
        } else {
          action.status = 'failed';
          if (action.retryCount >= CONFLICT_THRESHOLD) {
            action.status = 'conflict';
            result.conflicts.push(action);
          }
        }

        result.failed++;
        result.errors.push(`${action.entity} ${action.type} failed: ${action.lastError}`);
      }
    }

    this.saveQueue();
    return result;
  }

  private async executeAction(action: OfflineAction): Promise<boolean> {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const headers: Record<string, string> = {
      'Content-Type': HTTP.HEADERS.CONTENT_TYPE_JSON,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Special handling for AI analysis
    if (action.entity === 'ai_analysis') {
      return await this.executeAIAnalysis(action, headers);
    }

    const response = await fetch(action.endpoint, {
      method: action.method,
      headers,
      body: action.method !== HTTP.METHODS.DELETE ? JSON.stringify(action.data) : undefined,
    });

    if (response.ok) {
      return true;
    }

    // Handle different error types
    if (response.status === 409) {
      // Conflict - server version changed
      const serverData = await response.json().catch(() => ({}));
      action.serverVersion = serverData.version;
      action.status = 'conflict';
      throw new Error('Conflict detected - server data changed');
    }

    if (response.status >= 400 && response.status < 500) {
      // Client error - don't retry
      throw new Error(`Client error: ${response.status} ${response.statusText}`);
    }

    // Server error or network error - retryable
    throw new Error(`Server error: ${response.status} ${response.statusText}`);
  }

  private async executeAIAnalysis(action: OfflineAction, _headers: Record<string, string>): Promise<boolean> {
    try {
      // Import geminiService dynamically to avoid circular dependencies
      const { analyzeStudentPerformance } = await import('./geminiService');

      const data = action.data as {
        operation: string;
        studentData: {
          grades: Array<{ subject: string; score: number; grade: string; trend: string }>;
          attendance: { percentage: number; totalDays: number; present: number; absent: number };
          trends: Array<{ month: string; averageScore: number; attendanceRate: number }>;
        };
        model: string;
        timestamp: number;
      };

      let result: string;
      
      if (data.operation === 'studentAnalysis') {
        result = await analyzeStudentPerformance(data.studentData, false);
      } else {
        throw new Error(`Unknown AI operation: ${data.operation}`);
      }

      // Store the analysis result in cache
      const cacheKey = {
        operation: data.operation,
        input: JSON.stringify(data.studentData),
        model: data.model
      };

      // Import analysisCache dynamically
      const { analysisCache } = await import('./aiCacheService');
      analysisCache.set(cacheKey, result);

      // Store result in localStorage for immediate access
      const analysisResult = {
        result,
        timestamp: Date.now(),
        entityId: action.entityId,
        operation: data.operation,
        inputData: data.studentData
      };

      try {
        const existingResults = JSON.parse(localStorage.getItem(STORAGE_KEYS.CACHED_AI_ANALYSES) || '[]');
        existingResults.push(analysisResult);
        
        // Keep only last 50 analyses
        if (existingResults.length > 50) {
          existingResults.splice(0, existingResults.length - 50);
        }
        
        localStorage.setItem(STORAGE_KEYS.CACHED_AI_ANALYSES, JSON.stringify(existingResults));
      } catch (e) {
        logger.warn('Failed to cache AI analysis result:', e);
      }

      logger.info('AI analysis completed and cached', { 
        operation: data.operation,
        entityId: action.entityId 
      });

      return true;
    } catch (error) {
      logger.error('AI analysis execution failed:', error);
      throw error;
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private onlineListener: (() => void) | null = null;

  private setupNetworkListener(): void {
    // Listen for online events to trigger sync
    this.onlineListener = () => {
      if (this.getPendingCount() > 0 && !this.isSyncing) {
        setTimeout(() => this.sync(), TIME_MS.ONE_SECOND);
      }
    };
    window.addEventListener('online', this.onlineListener);
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUEUED_ACTIONS);
      if (stored) {
        this.queue = JSON.parse(stored);
        logger.info('Offline action queue loaded', { count: this.queue.length });
      }
    } catch (error) {
      logger.error('Failed to load offline action queue', { error });
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.QUEUED_ACTIONS, JSON.stringify(this.queue));
    } catch (error) {
      logger.error('Failed to save offline action queue', { error });
    }
  }

  private notifySyncComplete(result: SyncResult): void {
    this.syncCallbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        logger.error('Sync callback error', { error });
      }
    });
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  // ============================================
  // WEBSOCKET INTEGRATION
  // ============================================

  /**
   * Setup WebSocket event listeners for real-time conflict resolution
   */
  public async setupWebSocketIntegration(): Promise<void> {
    // Dynamic import to avoid circular dependency with webSocketService
    const { webSocketService } = await import('./webSocketService');

    // Listen for real-time updates that might affect queued actions
    const unsubscribeGrades = webSocketService.subscribe({
      eventType: 'grade_updated',
      callback: (event: RealTimeEvent) => {
        this.handleWebSocketUpdate(event);
      },
      filter: (event: RealTimeEvent) => {
        // Filter updates for entities we have in queue
        return this.queue.some(action =>
          action.entity === 'grade' && action.entityId === event.entityId
        );
      },
    });

    const unsubscribeAttendance = webSocketService.subscribe({
      eventType: 'attendance_updated',
      callback: (event: RealTimeEvent) => {
        this.handleWebSocketUpdate(event);
      },
      filter: (event: RealTimeEvent) => {
        return this.queue.some(action =>
          action.entity === 'attendance' && action.entityId === event.entityId
        );
      },
    });

    const unsubscribeAnnouncements = webSocketService.subscribe({
      eventType: 'announcement_updated', // We'll handle both types in the callback
      callback: (event: RealTimeEvent) => {
        this.handleWebSocketUpdate(event);
      },
      filter: (event: RealTimeEvent) => {
        return (event.type === 'announcement_updated' || event.type === 'announcement_deleted') &&
          this.queue.some(action =>
            action.entity === 'announcement' && action.entityId === event.entityId
          );
      },
    });

    // Store unsubscribe functions for cleanup
    this.websocketUnsubscribers = [
      unsubscribeGrades,
      unsubscribeAttendance,
      unsubscribeAnnouncements,
    ];

    logger.info('WebSocket integration setup complete');
  }

  /**
   * Handle real-time WebSocket updates
   */
  private handleWebSocketUpdate(event: RealTimeEvent): void {
    logger.debug('Processing WebSocket update', event);

    // Find matching actions in queue
    const matchingActions = this.queue.filter(action => 
      action.entity === event.entity && action.entityId === event.entityId
    );

    matchingActions.forEach(action => {
      switch (event.type) {
        case 'grade_updated':
        case 'attendance_updated':
        case 'announcement_updated':
          // If server has newer version, mark as conflict
          if (this.isServerVersionNewer(action, event)) {
            action.status = 'conflict';
            action.serverVersion = this.extractServerVersion(event);
            logger.warn('Conflict detected via WebSocket', { 
              actionId: action.id, 
              eventType: event.type 
            });
          }
          break;

        case 'announcement_deleted':
          // If entity was deleted, cancel queued updates
          if (action.type === 'update' || action.type === 'delete') {
            action.status = 'completed';
            logger.info('Action auto-completed - entity deleted', { 
              actionId: action.id 
            });
          }
          break;
      }
    });

    this.saveQueue();

    // Notify listeners about potential conflicts
    if (matchingActions.some(action => action.status === 'conflict')) {
      this.notifySyncComplete({
        success: false,
        actionsProcessed: 0,
        actionsFailed: 0,
        conflicts: matchingActions.filter(action => action.status === 'conflict'),
        errors: ['Real-time conflicts detected'],
      });
    }
  }

  /**
   * Check if server version is newer than queued action
   */
  private isServerVersionNewer(action: OfflineAction, event: RealTimeEvent): boolean {
    const actionTime = action.timestamp;
    const eventTime = new Date(event.timestamp).getTime();

    // If server event is newer than our action, there might be a conflict
    return eventTime > actionTime;
  }

  /**
   * Extract server version from WebSocket event data
   */
  private extractServerVersion(event: RealTimeEvent): number {
    const data = event.data as Record<string, unknown>;
    return (data.version as number) || (data.updatedAt as number) || Date.now();
  }

  /**
   * Cleanup WebSocket listeners
   */
  public cleanupWebSocketIntegration(): void {
    const unsubscribers = this.websocketUnsubscribers || [];
    unsubscribers.forEach((unsubscribe: () => void) => {
      try {
        unsubscribe();
      } catch (error) {
        logger.error('Error unsubscribing from WebSocket events', error);
      }
    });
    this.websocketUnsubscribers = [];
    logger.debug('WebSocket integration cleaned up');
  }

  /**
   * General cleanup method - clear queue state and all listeners
   * Call this on logout or when service needs to be reset
   */
  public cleanup(): void {
    // Remove 'online' event listener
    if (this.onlineListener) {
      window.removeEventListener('online', this.onlineListener);
      this.onlineListener = null;
      logger.debug('Online event listener removed');
    }

    this.cleanupWebSocketIntegration();
    this.queue = [];
    this.isSyncing = false;
    this.syncCallbacks.clear();
    this.saveQueue();
    logger.info('OfflineActionQueue service cleaned up');
  }

  /**
   * Register callback for sync completion
   */
  public onSyncComplete(callback: (result: SyncResult) => void): () => void {
    this.syncCallbacks.add(callback);
    return () => this.syncCallbacks.delete(callback);
  }
}

// ============================================
// EXPORTS
// ============================================

export const offlineActionQueueService = new OfflineActionQueueService();

/**
 * Hook for using offline action queue
 */
export function useOfflineActionQueue() {
  const networkStatus = useNetworkStatus();

  return {
    // Queue operations
    addAction: offlineActionQueueService.addAction.bind(offlineActionQueueService),
    removeAction: offlineActionQueueService.removeAction.bind(offlineActionQueueService),
    getQueue: offlineActionQueueService.getQueue.bind(offlineActionQueueService),
    getPendingCount: offlineActionQueueService.getPendingCount.bind(offlineActionQueueService),
    getFailedCount: offlineActionQueueService.getFailedCount.bind(offlineActionQueueService),
    clearCompletedActions: offlineActionQueueService.clearCompletedActions.bind(offlineActionQueueService),

    // Sync operations
    sync: offlineActionQueueService.sync.bind(offlineActionQueueService),
    retryFailedActions: offlineActionQueueService.retryFailedActions.bind(offlineActionQueueService),
    resolveConflict: offlineActionQueueService.resolveConflict.bind(offlineActionQueueService),
    onSyncComplete: offlineActionQueueService.onSyncComplete.bind(offlineActionQueueService),

    // Status
    isOnline: networkStatus.isOnline,
    isSlow: networkStatus.isSlow,
    isSyncing: offlineActionQueueService['isSyncing'],
  };
}

/**
 * Enhanced API service wrapper for offline support
 */
export function createOfflineApiCall<T>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  actionType: ActionType,
  entityType: EntityType,
  data?: Record<string, unknown>
) {
  return async (): Promise<ApiResponse<T>> => {
    // We can't use hooks here, so we'll check the navigator directly
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const isSlow = false; // We can't detect slow connections without hooks

    if (!isOnline || isSlow) {
      // Queue for offline
      const actionId = offlineActionQueueService.addAction({
        type: actionType,
        entity: entityType,
        entityId: data ? String((data as Record<string, unknown>).id || 'unknown') : 'unknown',
        data,
        endpoint,
        method,
      });

      return {
        success: true,
        message: 'Action queued for offline sync',
        data: { actionId, queued: true } as T,
      };
    }

    // Try online execution
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': HTTP.HEADERS.CONTENT_TYPE_JSON,
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: method !== HTTP.METHODS.DELETE ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: 'Success',
        data: result,
      };
    } catch (error) {
      // Auto-queue on network failure
      const errorObj = error instanceof Error ? error : new Error(String(error));
      if (isNetworkError(errorObj) || !isOnline) {
        const actionId = offlineActionQueueService.addAction({
          type: actionType,
          entity: entityType,
          entityId: String(data?.id || 'unknown'),
          data,
          endpoint,
          method,
        });

        return {
          success: false,
          message: `Network error. Action queued: ${errorObj.message}`,
          data: { actionId, queued: true } as T,
        };
      }

      throw error;
    }
  };
}