import {
  Memory,
  MemoryQuery,
  MemoryStorageAdapter,
  MemoryBankConfig,
  MemoryServiceInterface,
  MemoryStats,
  MemoryType
} from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Memory Service
 * Handles business logic for memory operations
 */
export class MemoryService implements MemoryServiceInterface {
  private config: MemoryBankConfig;
  private storageAdapter: MemoryStorageAdapter;

  constructor(config: MemoryBankConfig) {
    this.config = config;
    this.storageAdapter = config.storageAdapter;
  }

  /**
   * Add a new memory
   */
  async addMemory(
    content: string,
    type: MemoryType,
    metadata?: Record<string, any>
  ): Promise<Memory> {
    const now = new Date();

    const memory: Memory = {
      id: uuidv4(),
      content,
      type,
      timestamp: now,
      metadata,
      importance: this.config.defaultImportance || 0.5,
      accessCount: 0
    };

    await this.storageAdapter.store(memory);
    return memory;
  }

  /**
   * Get a memory by ID
   */
  async getMemory(id: string): Promise<Memory | null> {
    const memory = await this.storageAdapter.retrieve(id);

    if (memory) {
      // Update access tracking
      await this.updateMemory(id, {
        accessCount: memory.accessCount + 1,
        lastAccessed: new Date()
      });
      return await this.storageAdapter.retrieve(id); // Return updated memory
    }

    return null;
  }

  /**
   * Search memories based on query
   */
  async searchMemories(query: MemoryQuery): Promise<Memory[]> {
    return this.storageAdapter.search(query);
  }

  /**
   * Update an existing memory
   */
  async updateMemory(id: string, updates: Partial<Memory>): Promise<void> {
    // Preserve access count if not explicitly updated
    if (updates.accessCount === undefined) {
      const existing = await this.storageAdapter.retrieve(id);
      if (existing) {
        updates.accessCount = existing.accessCount;
      }
    }

    await this.storageAdapter.update(id, updates);
  }

  /**
   * Delete a memory
   */
  async deleteMemory(id: string): Promise<void> {
    await this.storageAdapter.delete(id);
  }

  /**
   * Get relevant memories based on context similarity
   */
  async getRelevantMemories(context: string, limit = 10): Promise<Memory[]> {
    // Simple keyword-based relevance scoring
    const allMemories = await this.storageAdapter.getAll();

    const relevantMemories = allMemories
      .map(memory => {
        const content = memory.content.toLowerCase();
        const contextWords = context.toLowerCase().split(/\s+/);
        const metadata = memory.metadata || {};

        let score = 0;

        // Content relevance
        contextWords.forEach(word => {
          if (word.length > 2) { // Ignore short words
            const occurrences = (content.match(new RegExp(word, 'g')) || []).length;
            score += occurrences * memory.importance;
          }
        });

        // Type relevance
        if (memory.type === 'context' || memory.type === 'fact') {
          score *= 1.5;
        }

        // Recency bonus (newer memories are more relevant)
        const daysSinceCreation = (Date.now() - memory.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        const recencyBonus = Math.max(0, 1 - daysSinceCreation / 30); // 30-day window
        score *= (1 + recencyBonus);

        // Access count bonus (frequently accessed memories are more relevant)
        const accessBonus = Math.min(memory.accessCount * 0.1, 0.5);
        score *= (1 + accessBonus);

        return { memory, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ memory }) => memory);

    return relevantMemories;
  }

  /**
   * Perform cleanup operations
   */
  async cleanup(): Promise<void> {
    const allMemories = await this.storageAdapter.getAll();
    const maxMemories = this.config.maxMemories || 1000;

    if (allMemories.length <= maxMemories) {
      return 0; // No cleanup needed
    }

    // Sort memories by importance and recency for cleanup
    const sortedMemories = allMemories.sort((a, b) => {
      const aScore = a.importance + (a.accessCount * 0.1) +
        (1 / (1 + (Date.now() - a.timestamp.getTime()) / (1000 * 60 * 60 * 24))); // Recency bonus
      const bScore = b.importance + (b.accessCount * 0.1) +
        (1 / (1 + (Date.now() - b.timestamp.getTime()) / (1000 * 60 * 60 * 24)));

      return aScore - bScore; // Lower scores first (to be deleted)
    });

    // Keep the top memories, delete the rest
    const memoriesToKeep = sortedMemories.slice(0, maxMemories);
    const memoriesToDelete = sortedMemories.slice(maxMemories);

    // Delete memories that are no longer needed
    for (const memory of memoriesToDelete) {
      await this.storageAdapter.delete(memory.id);
    }

    // Return void to match interface
    return;
  }

  /**
   * Get memory statistics
   */
  async getStats(): Promise<MemoryStats> {
    const allMemories = await this.storageAdapter.getAll();

    const memoriesByType = allMemories.reduce((acc, memory) => {
      acc[memory.type] = (acc[memory.type] || 0) + 1;
      return acc;
    }, {} as Record<MemoryType, number>);

    const averageImportance = allMemories.length > 0
      ? allMemories.reduce((sum, memory) => sum + memory.importance, 0) / allMemories.length
      : 0;

    // Get storage size if adapter supports it
    let storageSize = 0;
    if ('getStats' in this.storageAdapter) {
      try {
        const stats = await (this.storageAdapter as any).getStats();
        storageSize = stats.size || 0;
      } catch (error) {
        console.warn('Failed to get storage stats:', error);
      }
    }

    return {
      totalMemories: allMemories.length,
      memoriesByType,
      averageImportance,
      storageSize
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: MemoryBankConfig): void {
    this.config = config;
  }

  /**
   * Export all memories as JSON
   */
  async exportMemories(): Promise<string> {
    const allMemories = await this.storageAdapter.getAll();
    return JSON.stringify(allMemories, null, 2);
  }

  /**
   * Import memories from JSON
   */
  async importMemories(jsonData: string): Promise<number> {
    try {
      const memories: Memory[] = JSON.parse(jsonData);

      // Validate and store each memory
      let importedCount = 0;
      for (const memory of memories) {
        try {
          // Ensure memory has required fields
          if (!memory.id || !memory.content || !memory.type) {
            console.warn('Skipping invalid memory:', memory);
            continue;
          }

          // Convert date strings to Date objects
          if (typeof memory.timestamp === 'string') {
            memory.timestamp = new Date(memory.timestamp);
          }
          if (memory.lastAccessed && typeof memory.lastAccessed === 'string') {
            memory.lastAccessed = new Date(memory.lastAccessed);
          }

          await this.storageAdapter.store(memory);
          importedCount++;
        } catch (error) {
          console.error('Failed to import memory:', memory, error);
        }
      }

      return importedCount;
    } catch (error) {
      console.error('Failed to parse import data:', error);
      throw new Error('Invalid JSON data for import');
    }
  }

  /**
   * Get memories by type
   */
  async getMemoriesByType(type: MemoryType): Promise<Memory[]> {
    return this.storageAdapter.search({ type, limit: 100 });
  }

  /**
   * Get recent memories
   */
  async getRecentMemories(limit = 20): Promise<Memory[]> {
    const query: MemoryQuery = {
      limit,
      // Sort by timestamp (most recent first) - this would need to be implemented in the adapter
    };

    return this.storageAdapter.search(query);
  }
}