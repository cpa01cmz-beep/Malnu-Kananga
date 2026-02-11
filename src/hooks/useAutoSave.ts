/**
 * Standardized auto-save hook with debouncing and offline support
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useOfflineActionQueue } from '../services/offlineActionQueueService';
import { useNetworkStatus } from '../utils/networkStatus';
import { logger } from '../utils/logger';
import type { ActionType } from '../services/offlineActionQueueService';
import { DEBOUNCE_DELAYS, SCHEDULER_INTERVALS } from '../constants';

export interface AutoSaveConfig<T> {
  /** Debounce delay in milliseconds (default: 2000) */
  delay?: number;
  /** Enable offline queuing (default: true) */
  enableOffline?: boolean;
  /** Storage key for local caching (required) */
  storageKey: string;
  /** Save function implementation */
  onSave: (data: T) => Promise<void>;
  /** Validation function (optional) */
  validate?: (data: T) => string | null;
  /** Success callback */
  onSaved?: (data: T) => void;
  /** Error callback */
  onError?: (error: string) => void;
  /** Transform data before save (optional) */
  transform?: (data: T) => T;
  /** API endpoint for offline queuing (optional) */
  endpoint?: string;
  /** Action type for offline queuing (default: 'update') */
  actionType?: ActionType;
  /** HTTP method for offline queuing (default: 'PUT') */
  method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Entity type for offline queuing (optional) */
  entityType?: string;
}

export interface AutoSaveState<T> {
  data: T;
  isAutoSaving: boolean;
  lastSaved: Date | null;
  isDirty: boolean;
  error: string | null;
  queuedCount: number;
}

export interface AutoSaveActions<T> {
  updateData: (data: T | ((prev: T) => T)) => void;
  saveNow: () => Promise<void>;
  clearError: () => void;
  forceSync: () => Promise<void>;
  reset: (initialData: T) => void;
}

/**
 * Standardized auto-save hook with consistent behavior across all forms
 */
export function useAutoSave<T extends object>(
  initialData: T,
  config: AutoSaveConfig<T>
): [AutoSaveState<T>, AutoSaveActions<T>] {
  const {
    enableOffline = true,
    storageKey,
    onSave,
    validate,
    onSaved,
    onError,
    transform,
    endpoint,
    actionType = 'update',
    method = 'PUT',
    entityType
  } = config;

  // State management
  const [data, setData] = useState<T>(initialData);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);

  // Refs for cleanup and tracking
  const originalDataRef = useRef<T>(initialData);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hooks
  const { isOnline, isSlow } = useNetworkStatus();
  const { 
    addAction, 
    getQueue, 
    sync
  } = useOfflineActionQueue();

  // Load cached data on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsedData = JSON.parse(cached) as T;
        setData(parsedData);
        originalDataRef.current = parsedData;
      }
    } catch (err) {
      logger.warn(`Failed to load cached data for ${storageKey}:`, err);
    }
  }, [storageKey]);

  // Update queued count
  const updateQueuedCount = useCallback(() => {
    const queue = getQueue();
    setQueuedCount(queue.filter(action => action.status === 'pending').length);
  }, [getQueue]);

  // Sync offline queue
  const syncOfflineQueue = useCallback(async () => {
    try {
      await sync();
      updateQueuedCount();
    } catch (err) {
      logger.error('Failed to sync offline queue:', err);
    }
  }, [sync, updateQueuedCount]);

  // Queue data for offline save
  const queueForOfflineSave = useCallback(async (dataToSave: unknown, originalData: T) => {
    if (!endpoint) {
      throw new Error('Endpoint required for offline queuing');
    }

    const safeData = dataToSave as Record<string, unknown>;
    const entityId = (safeData.id as string) || 'unknown';
    
    addAction({
      type: actionType,
      entity: (entityType || storageKey.replace('malnu_', '').replace('_data', '')) as never,
      entityId,
      data: safeData,
      endpoint,
      method
    });

    setQueuedCount(prev => prev + 1);
    
    // Cache locally for UI consistency
    localStorage.setItem(storageKey, JSON.stringify(originalData));
    
    setLastSaved(new Date());
    originalDataRef.current = { ...originalData } as T;
    setIsDirty(false);
    
    onSaved?.(originalData);
  }, [endpoint, actionType, entityType, storageKey, method, addAction, onSaved]);

  // Perform the actual save operation
  const performSave = useCallback(async (currentData: T) => {
    // Skip save if no changes
    if (JSON.stringify(currentData) === JSON.stringify(originalDataRef.current)) {
      setIsDirty(false);
      return;
    }

    // Validation
    if (validate) {
      const validationError = validate(currentData);
      if (validationError) {
        setError(validationError);
        onError?.(validationError);
        return;
      }
    }

    setIsAutoSaving(true);
    setError(null);
    
    try {
      // Transform data if needed
      const dataToSave = transform ? transform(currentData) : currentData;
      
      // Use offline queue if offline/slow connection and enabled
      if (enableOffline && (!isOnline || isSlow)) {
        await queueForOfflineSave(dataToSave, currentData);
      } else {
        // Direct save when online
        await onSave(dataToSave);
        setLastSaved(new Date());
        originalDataRef.current = { ...currentData } as T;
        setIsDirty(false);
        
        // Sync any queued actions
        if (enableOffline && isOnline) {
          await syncOfflineQueue();
        }
        
        onSaved?.(currentData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Save failed';
      setError(errorMessage);
      onError?.(errorMessage);
      
      // Fallback to offline queue if save fails
      if (enableOffline) {
        try {
          await queueForOfflineSave(transform?.(currentData) || currentData, currentData);
        } catch (queueError) {
          logger.error('Failed to queue for offline save:', queueError);
        }
      }
    } finally {
      setIsAutoSaving(false);
    }
  }, [onSave, enableOffline, isOnline, isSlow, transform, onSaved, onError, validate, queueForOfflineSave, syncOfflineQueue]);

  

  // Update queued count periodically
  useEffect(() => {
    if (enableOffline) {
      const interval = setInterval(updateQueuedCount, SCHEDULER_INTERVALS.QUEUED_COUNT_UPDATE);
      return () => clearInterval(interval);
    }
  }, [enableOffline, updateQueuedCount]);

  // Update data function
  const updateData = useCallback((newData: T | ((prev: T) => T)) => {
    const updatedData = typeof newData === 'function' 
      ? (newData as (prev: T) => T)(data)
      : newData;
    
    setData(updatedData);
    setIsDirty(true);
    
    // Cache immediately for UI consistency
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    
    // Clear existing timeout and set new one
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      performSave(updatedData);
    }, DEBOUNCE_DELAYS.RAPID_CHANGE_BATCH); // Small delay to batch rapid changes
  }, [data, storageKey, performSave]);

  // Force save now
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await performSave(data);
  }, [data, performSave]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Force sync
  const forceSync = useCallback(async () => {
    if (enableOffline && isOnline) {
      await syncOfflineQueue();
    }
  }, [enableOffline, isOnline, syncOfflineQueue]);

  // Reset to initial data
  const reset = useCallback((newInitialData: T) => {
    setData(newInitialData);
    originalDataRef.current = newInitialData;
    setIsDirty(false);
    setError(null);
    localStorage.setItem(storageKey, JSON.stringify(newInitialData));
  }, [storageKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return [
    {
      data,
      isAutoSaving,
      lastSaved,
      isDirty,
      error,
      queuedCount
    },
    {
      updateData,
      saveNow,
      clearError,
      forceSync,
      reset
    }
  ];
}