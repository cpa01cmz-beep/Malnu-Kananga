/**
 * AI Response Caching Service
 * Provides intelligent caching for AI responses to improve performance and reduce API costs
 */

import { logger } from '../utils/logger';
import { STORAGE_KEYS, TIME_MS, AI_CACHE_CONFIG, OCR_CONFIG, AI_CONFIG } from '../constants';
import type { CacheConfig, CacheEntry, CacheKeyParams, CacheStats, SerializedCacheData } from './aiCache.types';

class AIResponseCache {
  private cache: Map<string, CacheEntry<unknown>>;
  private config: CacheConfig;
  private stats: {
    hits: number;
    misses: number;
    totalRequests: number;
  };
  private cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: AI_CACHE_CONFIG.DEFAULT.MAX_SIZE,
      ttl: AI_CACHE_CONFIG.DEFAULT.TTL_MS,
      ...config
    };
    
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0
    };

    this.loadCacheFromStorage();
    this.startCleanupInterval();
  }

  /**
   * Generate a cache key based on input parameters
   */
  private generateKey(params: CacheKeyParams): string {
    const keyData = {
      op: params.operation,
      input: params.input.substring(0, OCR_CONFIG.CACHE_KEY_MAX_LENGTH), // Limit input length
      ctx: params.context || '',
      model: params.model || 'default',
      thinking: params.thinkingMode || false
    };
    
    // Use a simple hash function instead of btoa for better compatibility
    const keyStr = JSON.stringify(keyData);
    let hash = 0;
    for (let i = 0; i < keyStr.length; i++) {
      const char = keyStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Create a cache entry
   */
  private createEntry<T>(data: T): CacheEntry<T> {
    const now = Date.now();
    return {
      data,
      timestamp: now,
      expiresAt: now + this.config.ttl,
      hitCount: 0,
      lastAccessed: now
    };
  }

  /**
   * Get cached response
   */
  get<T>(params: CacheKeyParams): T | null {
    this.stats.totalRequests++;
    
    const key = this.generateKey(params);
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.saveCacheToStorage();
      return null;
    }

    // Update access statistics
    entry.hitCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    
    logger.debug('AI cache hit for key:', key);
    return entry.data as T;
  }

  /**
   * Store response in cache
   */
  set<T>(params: CacheKeyParams, data: T): void {
    const key = this.generateKey(params);
    
    // Check if cache is full, remove least recently used entries
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const entry = this.createEntry(data);
    this.cache.set(key, entry);
    
    logger.debug('AI cache set for key:', key);
    this.saveCacheToStorage();
  }

  /**
   * Remove least recently used entry
   */
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug('AI cache evicted LRU entry:', oldestKey);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const beforeSize = this.cache.size;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
    
    const cleaned = beforeSize - this.cache.size;
    if (cleaned > 0) {
      logger.debug(`AI cache cleanup: removed ${cleaned} expired entries`);
      this.saveCacheToStorage();
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupIntervalId = setInterval(() => this.cleanup(), AI_CONFIG.CACHE_CLEANUP_INTERVAL_MS);
  }

  /**
   * Save cache to localStorage
   */
  private saveCacheToStorage(): void {
    try {
      const serializableCache: Record<string, unknown> = {};
      
      for (const [key, entry] of this.cache.entries()) {
        serializableCache[key] = {
          ...entry,
          data: JSON.stringify(entry.data)
        };
      }
      
      const cacheData: SerializedCacheData = {
        cache: serializableCache,
        stats: this.stats,
        config: this.config,
        timestamp: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEYS.AI_CACHE, JSON.stringify(cacheData));
    } catch (error) {
      logger.warn('Failed to save AI cache to localStorage:', error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AI_CACHE);
      if (!stored) return;
      
      const cacheData = JSON.parse(stored);
      
      // Don't load if cache is too old (older than 1 hour)
      if (Date.now() - cacheData.timestamp > TIME_MS.ONE_HOUR) {
        localStorage.removeItem(STORAGE_KEYS.AI_CACHE);
        return;
      }
      
      // Restore cache entries
      for (const [key, entry] of Object.entries(cacheData.cache as Record<string, unknown>)) {
        try {
          const typedEntry = entry as { data: string; [key: string]: unknown };
          const parsedEntry: CacheEntry<unknown> = {
            data: JSON.parse(typedEntry.data),
            timestamp: typedEntry.timestamp as number,
            expiresAt: typedEntry.expiresAt as number,
            hitCount: typedEntry.hitCount as number,
            lastAccessed: typedEntry.lastAccessed as number
          };
          
          // Skip expired entries
          if (Date.now() <= parsedEntry.expiresAt) {
            this.cache.set(key, parsedEntry);
          }
        } catch {
          logger.warn('Failed to parse cache entry for key:', key);
        }
      }
      
      // Restore stats
      this.stats = cacheData.stats || this.stats;
      
      logger.info(`AI cache loaded: ${this.cache.size} entries`);
    } catch (error) {
      logger.warn('Failed to load AI cache from localStorage:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const now = Date.now();
    let oldestTimestamp = now;
    let newestTimestamp = 0;
    let memoryUsage = 0;
    
    for (const entry of this.cache.values()) {
      oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp);
      newestTimestamp = Math.max(newestTimestamp, entry.timestamp);
      
      // Estimate memory usage
      memoryUsage += JSON.stringify(entry.data).length * 2; // Rough estimate
    }
    
    return {
      totalEntries: this.cache.size,
      hitRate: this.stats.totalRequests > 0 ? this.stats.hits / this.stats.totalRequests : 0,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      memoryUsage,
      oldestEntry: this.cache.size > 0 ? new Date(oldestTimestamp) : undefined,
      newestEntry: this.cache.size > 0 ? new Date(newestTimestamp) : undefined
    };
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, totalRequests: 0 };
    localStorage.removeItem(STORAGE_KEYS.AI_CACHE);
    logger.info('AI cache cleared');
  }

  /**
   * Clear expired entries manually
   */
  clearExpired(): void {
    this.cleanup();
  }

  /**
   * Clear entries for specific operation
   */
  clearOperation(operation: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key] of this.cache.entries()) {
      if (key.includes(operation)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    this.saveCacheToStorage();
    
    logger.info(`AI cache cleared ${keysToDelete.length} entries for operation: ${operation}`);
  }

  /**
   * Destroy the cache instance and clean up resources
   */
  public destroy(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, totalRequests: 0 };
    logger.info('AIResponseCache destroyed and cleaned up');
  }

  /**
   * Check if key exists in cache
   */
  has(params: CacheKeyParams): boolean {
    const key = this.generateKey(params);
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

// Cache instances for different purposes
export { AIResponseCache };

export const chatCache = new AIResponseCache({
  maxSize: AI_CACHE_CONFIG.CHAT.MAX_SIZE,
  ttl: AI_CACHE_CONFIG.CHAT.TTL_MS
});

export const analysisCache = new AIResponseCache({
  maxSize: AI_CACHE_CONFIG.QUIZ.MAX_SIZE,
  ttl: AI_CACHE_CONFIG.QUIZ.TTL_MS
});

export const editorCache = new AIResponseCache({
  maxSize: AI_CACHE_CONFIG.EDITOR.MAX_SIZE,
  ttl: AI_CACHE_CONFIG.EDITOR.TTL_MS
});

export const ocrCache = new AIResponseCache({
  maxSize: AI_CACHE_CONFIG.OCR.MAX_SIZE,
  ttl: AI_CACHE_CONFIG.OCR.TTL_MS
});

