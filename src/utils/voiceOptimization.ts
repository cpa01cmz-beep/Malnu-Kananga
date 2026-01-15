import { useCallback, useEffect, useRef } from 'react';
import { logger } from './logger';

/**
 * Performance optimization utilities for voice features
 * Implements debouncing, throttling and caching strategies
 */

/**
 * Chrome-specific PerformanceMemory API
 * Not standard but available in Chrome/Chromium browsers
 */
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

declare global {
  interface Performance {
    memory?: PerformanceMemory;
  }
}

/**
 * Debounce hook - Delays function execution until after delay
 * Useful for preventing excessive voice recognition triggers
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Throttle hook - Limits function execution to once per delay
 * Useful for UI updates during continuous voice input
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;
      
      if (timeSinceLastRun >= delay) {
        lastRunRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastRun);
      }
    },
    [callback, delay]
  );
}

/**
 * Simple LRU cache for voice-related data
 */
class VoiceCache<T> {
  private cache: Map<string, { value: T; timestamp: number }>;
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds
  
  constructor(maxSize: number = 50, ttl: number = 300000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if item has expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.value;
  }
  
  set(key: string, value: T): void {
    // Remove oldest item if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }
  
  has(key: string): boolean {
    return this.cache.has(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

/**
 * Hook for managing voice cache
 */
export function useVoiceCache<T>(maxSize: number = 50, ttl: number = 300000) {
  const cacheRef = useRef(new VoiceCache<T>(maxSize, ttl));
  
  const get = useCallback((key: string) => {
    return cacheRef.current.get(key);
  }, []);
  
  const set = useCallback((key: string, value: T) => {
    cacheRef.current.set(key, value);
  }, []);
  
  const has = useCallback((key: string) => {
    return cacheRef.current.has(key);
  }, []);
  
  const clear = useCallback(() => {
    cacheRef.current.clear();
  }, []);
  
  const size = useCallback(() => {
    return cacheRef.current.size();
  }, []);
  
  return { get, set, has, clear, size };
}

/**
 * Performance monitoring utilities
 */
export const performanceMetrics = {
  mark: (name: string) => {
    if (typeof window.performance !== 'undefined' && window.performance.mark) {
      window.performance.mark(name);
    }
  },
  
  measure: (name: string, _startMark: string, _endMark: string) => {
    if (typeof window.performance !== 'undefined' && typeof window.performance.measure === 'function') {
      try {
        const entries = window.performance.getEntriesByName(name);
        const lastEntry = entries[entries.length - 1];
        return lastEntry?.duration ?? 0;
      } catch (error) {
        logger.error('Performance measurement error:', error);
        return 0;
      }
    }
    return 0;
  },

  checkMemoryUsage: () => {
    if (typeof window.performance !== 'undefined' && window.performance.memory) {
      const memory = window.performance.memory;
      const usedMB = memory.usedJSHeapSize / (1024 * 1024);
      const totalMB = memory.totalJSHeapSize / (1024 * 1024);
      const limitMB = memory.jsHeapSizeLimit / (1024 * 1024);

      logger.debug(`Memory: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB (Limit: ${limitMB.toFixed(2)}MB)`);

      if (usedMB / totalMB > 0.9) {
        logger.warn('Memory usage is approaching limit, clearing voice cache');
        return 'high';
      }
    }
    return 'normal';
  },
};

/**
 * Memory usage monitoring
 */
export const memoryMonitor = {
  getCurrentUsage: () => {
    if (typeof window.performance !== 'undefined' && window.performance.memory) {
      const memory = window.performance.memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
    return null;
  },
  
  checkMemoryPressure: () => {
    const usage = memoryMonitor.getCurrentUsage();
    if (usage) {
      return usage.usagePercentage > 80; // High memory pressure threshold
    }
    return false;
  },
};

/**
 * Lazy loader for voice components
 * Prevents unnecessary component mounting
 */
import type { ComponentType } from 'react';
import React from 'react';
export function createLazyLoader<T extends ComponentType<Record<string, unknown>>>(
  componentPromise: Promise<{ default: T }>
) {
  return React.lazy(() => componentPromise);
}

/**
 * Utility to cleanup event listeners properly
 */
export function useCleanupEffect(effect: () => () => void) {
  useEffect(effect, [effect]);
}
