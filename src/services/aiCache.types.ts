/**
 * AI Cache Service Types
 */

export interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hitCount: number;
  lastAccessed: number;
}

export interface CacheKeyParams {
  operation: string;
  input: string;
  context?: string;
  model?: string;
  thinkingMode?: boolean;
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  memoryUsage: number;
  oldestEntry?: Date;
  newestEntry?: Date;
}

export interface SerializedCacheData {
  cache: Record<string, unknown>;
  stats: {
    hits: number;
    misses: number;
    totalRequests: number;
  };
  config: CacheConfig;
  timestamp: number;
}