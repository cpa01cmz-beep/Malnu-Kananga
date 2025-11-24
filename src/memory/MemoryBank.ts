import {
  Memory,
  MemoryQuery,
  MemoryStorageAdapter,
  MemoryBankConfig,
  MemoryServiceInterface,
  MemoryStats,
  MemoryBankEvents
} from './types';
import { MemoryService } from './services/MemoryService';

/**
 * Core Memory Bank Class
 * Manages memory storage, retrieval, and operations using configurable storage adapters
 */
export class MemoryBank implements MemoryServiceInterface {
  private config: MemoryBankConfig;
  private memoryService: MemoryService;
  private eventListeners: Map<keyof MemoryBankEvents, Function[]> = new Map();

  constructor(config: MemoryBankConfig) {
    this.config = {
      maxMemories: 1000,
      defaultImportance: 0.5,
      enableAutoCleanup: true,
      cleanupThreshold: 0.8,
      ...config
    };

    this.memoryService = new MemoryService(config);
    this.setupAutoCleanup();
  }

  /**
   * Add a new memory to the bank
   */
  async addMemory(
    content: string,
    type: Memory['type'],
    metadata?: Record<string, any>
  ): Promise<Memory> {
    const memory = await this.memoryService.addMemory(content, type, metadata);

    // Emit event
    this.emit('memoryAdded', memory);

    return memory;
  }

  /**
   * Retrieve a specific memory by ID
   */
  async getMemory(id: string): Promise<Memory | null> {
    return this.memoryService.getMemory(id);
  }

  /**
   * Search memories based on query parameters
   */
  async searchMemories(query: MemoryQuery): Promise<Memory[]> {
    const results = await this.memoryService.searchMemories(query);

    // Emit event
    this.emit('memorySearched', query, results);

    return results;
  }

  /**
   * Update an existing memory
   */
  async updateMemory(id: string, updates: Partial<Memory>): Promise<void> {
    await this.memoryService.updateMemory(id, updates);

    // Get updated memory for event
    const updatedMemory = await this.getMemory(id);
    if (updatedMemory) {
      this.emit('memoryUpdated', updatedMemory);
    }
  }

  /**
   * Delete a memory from the bank
   */
  async deleteMemory(id: string): Promise<void> {
    await this.memoryService.deleteMemory(id);

    // Emit event
    this.emit('memoryDeleted', id);
  }

  /**
   * Get relevant memories based on context similarity
   */
  async getRelevantMemories(context: string, limit = 10): Promise<Memory[]> {
    return this.memoryService.getRelevantMemories(context, limit);
  }

  /**
   * Perform cleanup operations (remove old/low-importance memories)
   */
  async cleanup(): Promise<void> {
    const deletedCount = await this.memoryService.cleanup();

    // Emit event
    this.emit('cleanupPerformed', deletedCount);
  }

  /**
   * Get memory bank statistics
   */
  async getStats(): Promise<MemoryStats> {
    return this.memoryService.getStats();
  }

  /**
   * Add event listener for memory bank events
   */
  on<K extends keyof MemoryBankEvents>(
    event: K,
    listener: MemoryBankEvents[K]
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof MemoryBankEvents>(
    event: K,
    listener: MemoryBankEvents[K]
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener as Function);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  private emit<K extends keyof MemoryBankEvents>(
    event: K,
    ...args: Parameters<MemoryBankEvents[K]>
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          (listener as any)(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Setup automatic cleanup if enabled
   */
  private cleanupInterval: NodeJS.Timeout | null = null;

  private setupAutoCleanup(): void {
    // Clear existing interval if any
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.config.enableAutoCleanup) {
      // Cleanup every hour if storage is near capacity
      this.cleanupInterval = setInterval(async () => {
        try {
          const stats = await this.getStats();
          if (stats.totalMemories > (this.config.maxMemories || 1000) * (this.config.cleanupThreshold || 0.8)) {
            await this.cleanup();
          }
        } catch (error) {
          console.error('Auto-cleanup failed:', error);
        }
      }, 60 * 60 * 1000); // 1 hour
    }
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Clear all event listeners
    this.eventListeners.clear();
  }

  /**
   * Get the underlying storage adapter
   */
  getStorageAdapter(): MemoryStorageAdapter {
    return this.config.storageAdapter;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MemoryBankConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.memoryService.updateConfig(this.config);
  }
}