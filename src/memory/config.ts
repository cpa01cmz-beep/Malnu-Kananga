import { MemoryBankConfig } from './types';

/**
 * Default Memory Bank Configuration
 */
export const defaultMemoryBankConfig = async (): Promise<MemoryBankConfig> => {
  const { LocalStorageAdapter } = await import('./storage/LocalStorageAdapter');
  
  return {
    maxMemories: 1000,
    defaultImportance: 0.5,
    storageAdapter: new LocalStorageAdapter('memory_bank_memories'),
    enableAutoCleanup: true,
    cleanupThreshold: 0.8
  };
};

/**
 * Cloud Memory Bank Configuration
 */
export const cloudMemoryBankConfig = async (baseUrl: string, apiKey?: string): Promise<MemoryBankConfig> => {
  const { CloudStorageAdapter } = await import('./storage/CloudStorageAdapter');

  return {
    maxMemories: 5000,
    defaultImportance: 0.5,
    storageAdapter: new CloudStorageAdapter({
      baseUrl,
      apiKey,
      timeout: 15000
    }),
    enableAutoCleanup: true,
    cleanupThreshold: 0.9
  };
};

/**
 * Memory Bank Configuration for School Context
 * Optimized for educational content and student interactions
 */
export const schoolMemoryBankConfig = async (): Promise<MemoryBankConfig> => {
  const { LocalStorageAdapter } = await import('./storage/LocalStorageAdapter');
  
  return {
    maxMemories: 2000,
    defaultImportance: 0.6,
    storageAdapter: new LocalStorageAdapter('school_memory_bank'),
    enableAutoCleanup: true,
    cleanupThreshold: 0.85
  };
};