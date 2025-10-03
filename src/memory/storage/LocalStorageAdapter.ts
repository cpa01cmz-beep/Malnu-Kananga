import { Memory, MemoryQuery, MemoryStorageAdapter } from '../types';

/**
 * Local Storage Adapter for Memory Bank
 * Implements memory storage using browser's localStorage API
 */
export class LocalStorageAdapter implements MemoryStorageAdapter {
  private storageKey = 'memory_bank_memories';
  private metadataKey = 'memory_bank_metadata';

  constructor(storageKey?: string) {
    if (storageKey) {
      this.storageKey = storageKey;
    }
  }

  /**
   * Store a memory in localStorage
   */
  async store(memory: Memory): Promise<void> {
    try {
      const memories = await this.getAllMemories();
      const existingIndex = memories.findIndex(m => m.id === memory.id);

      if (existingIndex >= 0) {
        memories[existingIndex] = memory;
      } else {
        memories.push(memory);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(memories));
      this.updateMetadata();
    } catch (error) {
      console.error('Failed to store memory:', error);
      throw new Error('Failed to store memory in localStorage');
    }
  }

  /**
   * Retrieve a memory by ID
   */
  async retrieve(id: string): Promise<Memory | null> {
    try {
      const memories = await this.getAllMemories();
      return memories.find(m => m.id === id) || null;
    } catch (error) {
      console.error('Failed to retrieve memory:', error);
      return null;
    }
  }

  /**
   * Search memories based on query parameters
   */
  async search(query: MemoryQuery): Promise<Memory[]> {
    try {
      let memories = await this.getAllMemories();

      // Filter by type
      if (query.type) {
        memories = memories.filter(m => m.type === query.type);
      }

      // Filter by minimum importance
      if (query.minImportance !== undefined) {
        memories = memories.filter(m => m.importance >= query.minImportance!);
      }

      // Filter by keywords
      if (query.keywords && query.keywords.length > 0) {
        memories = memories.filter(m =>
          query.keywords!.some(keyword =>
            m.content.toLowerCase().includes(keyword.toLowerCase())
          )
        );
      }

      // Filter by date range
      if (query.dateRange) {
        const start = query.dateRange.start.getTime();
        const end = query.dateRange.end.getTime();
        memories = memories.filter(m => {
          const memoryTime = m.timestamp.getTime();
          return memoryTime >= start && memoryTime <= end;
        });
      }

      // Filter by metadata
      if (query.metadata) {
        memories = memories.filter(m =>
          m.metadata && this.matchesMetadata(m.metadata, query.metadata!)
        );
      }

      // Sort by importance and access count (most important and recently accessed first)
      memories.sort((a, b) => {
        const aScore = a.importance + (a.accessCount * 0.1);
        const bScore = b.importance + (b.accessCount * 0.1);
        return bScore - aScore;
      });

      // Apply limit
      if (query.limit) {
        memories = memories.slice(0, query.limit);
      }

      return memories;
    } catch (error) {
      console.error('Failed to search memories:', error);
      return [];
    }
  }

  /**
   * Update an existing memory
   */
  async update(id: string, updates: Partial<Memory>): Promise<void> {
    try {
      const memory = await this.retrieve(id);
      if (!memory) {
        throw new Error(`Memory with id ${id} not found`);
      }

      const updatedMemory: Memory = {
        ...memory,
        ...updates,
        id, // Ensure ID doesn't change
        timestamp: memory.timestamp // Preserve original timestamp
      };

      await this.store(updatedMemory);
    } catch (error) {
      console.error('Failed to update memory:', error);
      throw error;
    }
  }

  /**
   * Delete a memory from localStorage
   */
  async delete(id: string): Promise<void> {
    try {
      const memories = await this.getAllMemories();
      const filteredMemories = memories.filter(m => m.id !== id);

      if (filteredMemories.length === memories.length) {
        throw new Error(`Memory with id ${id} not found`);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(filteredMemories));
      this.updateMetadata();
    } catch (error) {
      console.error('Failed to delete memory:', error);
      throw error;
    }
  }

  /**
   * Get all memories from localStorage
   */
  async getAll(): Promise<Memory[]> {
    return this.getAllMemories();
  }

  /**
   * Clear all memories from localStorage
   */
  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.metadataKey);
    } catch (error) {
      console.error('Failed to clear memories:', error);
      throw error;
    }
  }

  /**
   * Get all memories from localStorage with error handling
   */
  private async getAllMemories(): Promise<Memory[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return [];
      }

      const memories = JSON.parse(stored);

      // Convert date strings back to Date objects
      return memories.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
        lastAccessed: m.lastAccessed ? new Date(m.lastAccessed) : undefined
      }));
    } catch (error) {
      console.error('Failed to parse memories from localStorage:', error);
      return [];
    }
  }

  /**
   * Update metadata about the memory storage
   */
  private updateMetadata(): void {
    try {
      const metadata = {
        lastUpdated: new Date(),
        storageSize: this.getStorageSize()
      };
      localStorage.setItem(this.metadataKey, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to update metadata:', error);
    }
  }

  /**
   * Get current storage size in bytes
   */
  private getStorageSize(): number {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? new Blob([stored]).size : 0;
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return 0;
    }
  }

  /**
   * Check if metadata matches the query
   */
  private matchesMetadata(memoryMetadata: Record<string, any>, queryMetadata: Record<string, any>): boolean {
    return Object.entries(queryMetadata).every(([key, value]) => {
      return memoryMetadata[key] === value;
    });
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{ count: number; size: number }> {
    const memories = await this.getAllMemories();
    return {
      count: memories.length,
      size: this.getStorageSize()
    };
  }
}