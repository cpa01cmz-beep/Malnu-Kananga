import { useState, useEffect, useCallback } from 'react';
import { MemoryBank, schoolMemoryBankConfig, Memory, MemoryQuery } from '../memory';

/**
 * React hook for using Memory Bank functionality
 */
export function useMemoryBank() {
  const [memoryBank] = useState(() => new MemoryBank(schoolMemoryBankConfig));
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load recent memories on mount
  useEffect(() => {
    loadRecentMemories();
  }, []);

  const loadRecentMemories = useCallback(async (limit = 20) => {
    setIsLoading(true);
    try {
      const recentMemories = await memoryBank.searchMemories({
        limit,
      });
      setMemories(recentMemories);
    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [memoryBank]);

  const addMemory = useCallback(async (
    content: string,
    type: Memory['type'],
    metadata?: Record<string, any>
  ) => {
    try {
      const newMemory = await memoryBank.addMemory(content, type, metadata);
      setMemories(prev => [newMemory, ...prev]);
      return newMemory;
    } catch (error) {
      console.error('Failed to add memory:', error);
      throw error;
    }
  }, [memoryBank]);

  const searchMemories = useCallback(async (query: MemoryQuery) => {
    setIsLoading(true);
    try {
      return await memoryBank.searchMemories(query);
    } catch (error) {
      console.error('Failed to search memories:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [memoryBank]);

  const getRelevantMemories = useCallback(async (context: string, limit = 5) => {
    try {
      return await memoryBank.getRelevantMemories(context, limit);
    } catch (error) {
      console.error('Failed to get relevant memories:', error);
      return [];
    }
  }, [memoryBank]);

  const deleteMemory = useCallback(async (id: string) => {
    try {
      await memoryBank.deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete memory:', error);
      throw error;
    }
  }, [memoryBank]);

  const clearAllMemories = useCallback(async () => {
    setIsLoading(true);
    try {
      await memoryBank.cleanup();
      setMemories([]);
    } catch (error) {
      console.error('Failed to clear memories:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [memoryBank]);

  const getStats = useCallback(async () => {
    try {
      return await memoryBank.getStats();
    } catch (error) {
      console.error('Failed to get memory stats:', error);
      return null;
    }
  }, [memoryBank]);

  return {
    memories,
    isLoading,
    addMemory,
    searchMemories,
    getRelevantMemories,
    deleteMemory,
    clearAllMemories,
    getStats,
    loadRecentMemories,
    memoryBank
  };
}