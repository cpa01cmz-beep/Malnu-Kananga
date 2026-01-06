/**
 * React hook for AI cache management
 */

import { useState, useEffect, useCallback } from 'react';
import { chatCache, analysisCache, editorCache } from '../services/aiCacheService';
import type { CacheStats } from '../services/aiCache.types';
import { logger } from '../utils/logger';

interface UseAICacheReturn {
  stats: {
    chat: CacheStats;
    analysis: CacheStats;
    editor: CacheStats;
    total: {
      entries: number;
      hitRate: number;
      memoryUsage: number;
    };
  };
  isLoading: boolean;
  clearAll: () => void;
  clearChat: () => void;
  clearAnalysis: () => void;
  clearEditor: () => void;
  refresh: () => void;
}

export function useAICache(refreshInterval: number = 5000): UseAICacheReturn {
  const [stats, setStats] = useState<UseAICacheReturn['stats']>({
    chat: { totalEntries: 0, hitRate: 0, totalHits: 0, totalMisses: 0, memoryUsage: 0 },
    analysis: { totalEntries: 0, hitRate: 0, totalHits: 0, totalMisses: 0, memoryUsage: 0 },
    editor: { totalEntries: 0, hitRate: 0, totalHits: 0, totalMisses: 0, memoryUsage: 0 },
    total: { entries: 0, hitRate: 0, memoryUsage: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  const getStats = useCallback(() => {
    try {
      const chatStats = chatCache.getStats();
      const analysisStats = analysisCache.getStats();
      const editorStats = editorCache.getStats();

      const totalEntries = chatStats.totalEntries + analysisStats.totalEntries + editorStats.totalEntries;
      const totalHits = chatStats.totalHits + analysisStats.totalHits + editorStats.totalHits;
      const totalMisses = chatStats.totalMisses + analysisStats.totalMisses + editorStats.totalMisses;
      const totalMemory = chatStats.memoryUsage + analysisStats.memoryUsage + editorStats.memoryUsage;

      setStats({
        chat: chatStats,
        analysis: analysisStats,
        editor: editorStats,
        total: {
          entries: totalEntries,
          hitRate: totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0,
          memoryUsage: totalMemory
        }
      });
    } catch (error) {
      logger.error('Failed to get AI cache stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAll = useCallback(() => {
    try {
      chatCache.clear();
      analysisCache.clear();
      editorCache.clear();
      getStats();
      logger.info('All AI caches cleared');
    } catch (error) {
      logger.error('Failed to clear AI caches:', error);
    }
  }, [getStats]);

  const clearChat = useCallback(() => {
    try {
      chatCache.clear();
      getStats();
      logger.info('Chat cache cleared');
    } catch (error) {
      logger.error('Failed to clear chat cache:', error);
    }
  }, [getStats]);

  const clearAnalysis = useCallback(() => {
    try {
      analysisCache.clear();
      getStats();
      logger.info('Analysis cache cleared');
    } catch (error) {
      logger.error('Failed to clear analysis cache:', error);
    }
  }, [getStats]);

  const clearEditor = useCallback(() => {
    try {
      editorCache.clear();
      getStats();
      logger.info('Editor cache cleared');
    } catch (error) {
      logger.error('Failed to clear editor cache:', error);
    }
  }, [getStats]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    getStats();
  }, [getStats]);

  // Initial load
  useEffect(() => {
    getStats();
  }, [getStats]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(getStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [getStats, refreshInterval]);

  return {
    stats,
    isLoading,
    clearAll,
    clearChat,
    clearAnalysis,
    clearEditor,
    refresh
  };
}