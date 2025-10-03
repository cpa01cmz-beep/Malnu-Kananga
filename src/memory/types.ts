/**
 * Memory Bank Types and Interfaces
 * TypeScript definitions for the memory bank system
 */

export interface Memory {
  id: string;
  content: string;
  timestamp: Date;
  type: MemoryType;
  metadata?: Record<string, any>;
  importance: number; // 0-1 scale
  accessCount: number;
  lastAccessed?: Date;
}

export type MemoryType = 'conversation' | 'fact' | 'preference' | 'context' | 'system';

export interface MemoryQuery {
  type?: MemoryType;
  limit?: number;
  minImportance?: number;
  keywords?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  metadata?: Record<string, any>;
}

export interface MemoryStorageAdapter {
  store(memory: Memory): Promise<void>;
  retrieve(id: string): Promise<Memory | null>;
  search(query: MemoryQuery): Promise<Memory[]>;
  update(id: string, updates: Partial<Memory>): Promise<void>;
  delete(id: string): Promise<void>;
  getAll(): Promise<Memory[]>;
  clear(): Promise<void>;
}

export interface MemoryBankConfig {
  maxMemories?: number;
  defaultImportance?: number;
  storageAdapter: MemoryStorageAdapter;
  enableAutoCleanup?: boolean;
  cleanupThreshold?: number;
}

export interface MemoryServiceInterface {
  addMemory(content: string, type: MemoryType, metadata?: Record<string, any>): Promise<Memory>;
  getMemory(id: string): Promise<Memory | null>;
  searchMemories(query: MemoryQuery): Promise<Memory[]>;
  updateMemory(id: string, updates: Partial<Memory>): Promise<void>;
  deleteMemory(id: string): Promise<void>;
  getRelevantMemories(context: string, limit?: number): Promise<Memory[]>;
  cleanup(): Promise<void>;
  getStats(): Promise<MemoryStats>;
}

export interface MemoryStats {
  totalMemories: number;
  memoriesByType: Record<MemoryType, number>;
  averageImportance: number;
  lastCleanup?: Date;
  storageSize: number;
}

export interface MemoryBankEvents {
  memoryAdded: (memory: Memory) => void;
  memoryUpdated: (memory: Memory) => void;
  memoryDeleted: (id: string) => void;
  memorySearched: (query: MemoryQuery, results: Memory[]) => void;
  cleanupPerformed: (deletedCount: number) => void;
}