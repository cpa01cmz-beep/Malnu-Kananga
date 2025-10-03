import { Memory, MemoryQuery, MemoryStorageAdapter } from '../types';

/**
 * Cloud Storage Configuration
 */
export interface CloudStorageConfig {
  baseUrl: string;
  apiKey?: string;
  bucket?: string;
  region?: string;
  timeout?: number;
}

/**
 * Cloud Storage Adapter for Memory Bank
 * Implements memory storage using cloud storage services via REST API
 */
export class CloudStorageAdapter implements MemoryStorageAdapter {
  private config: CloudStorageConfig;
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(config: CloudStorageConfig) {
    this.config = {
      timeout: 10000,
      ...config
    };

    this.baseUrl = config.baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
    };
  }

  /**
   * Store a memory in cloud storage
   */
  async store(memory: Memory): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/memories`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(memory),
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Update memory ID if server generated one
      if (result.id && result.id !== memory.id) {
        memory.id = result.id;
      }
    } catch (error) {
      console.error('Failed to store memory in cloud:', error);
      throw new Error('Failed to store memory in cloud storage');
    }
  }

  /**
   * Retrieve a memory by ID from cloud storage
   */
  async retrieve(id: string): Promise<Memory | null> {
    try {
      const response = await fetch(`${this.baseUrl}/memories/${id}`, {
        method: 'GET',
        headers: this.defaultHeaders,
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const memory = await response.json();
      return this.deserializeMemory(memory);
    } catch (error) {
      console.error('Failed to retrieve memory from cloud:', error);
      return null;
    }
  }

  /**
   * Search memories in cloud storage
   */
  async search(query: MemoryQuery): Promise<Memory[]> {
    try {
      const searchParams = new URLSearchParams();

      if (query.type) searchParams.append('type', query.type);
      if (query.limit) searchParams.append('limit', query.limit.toString());
      if (query.minImportance !== undefined) {
        searchParams.append('minImportance', query.minImportance.toString());
      }
      if (query.keywords) {
        query.keywords.forEach(keyword => {
          searchParams.append('keywords', keyword);
        });
      }
      if (query.dateRange) {
        searchParams.append('startDate', query.dateRange.start.toISOString());
        searchParams.append('endDate', query.dateRange.end.toISOString());
      }
      if (query.metadata) {
        searchParams.append('metadata', JSON.stringify(query.metadata));
      }

      const response = await fetch(`${this.baseUrl}/memories/search?${searchParams}`, {
        method: 'GET',
        headers: this.defaultHeaders,
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const memories = await response.json();
      return memories.map((m: any) => this.deserializeMemory(m));
    } catch (error) {
      console.error('Failed to search memories in cloud:', error);
      return [];
    }
  }

  /**
   * Update an existing memory in cloud storage
   */
  async update(id: string, updates: Partial<Memory>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/memories/${id}`, {
        method: 'PATCH',
        headers: this.defaultHeaders,
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Memory with id ${id} not found`);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to update memory in cloud:', error);
      throw error;
    }
  }

  /**
   * Delete a memory from cloud storage
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/memories/${id}`, {
        method: 'DELETE',
        headers: this.defaultHeaders,
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Memory with id ${id} not found`);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to delete memory from cloud:', error);
      throw error;
    }
  }

  /**
   * Get all memories from cloud storage
   */
  async getAll(): Promise<Memory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/memories`, {
        method: 'GET',
        headers: this.defaultHeaders,
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const memories = await response.json();
      return memories.map((m: any) => this.deserializeMemory(m));
    } catch (error) {
      console.error('Failed to get all memories from cloud:', error);
      return [];
    }
  }

  /**
   * Clear all memories from cloud storage
   */
  async clear(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/memories`, {
        method: 'DELETE',
        headers: this.defaultHeaders,
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to clear memories from cloud:', error);
      throw error;
    }
  }

  /**
   * Deserialize memory data from cloud format
   */
  private deserializeMemory(data: any): Memory {
    return {
      ...data,
      timestamp: new Date(data.timestamp),
      lastAccessed: data.lastAccessed ? new Date(data.lastAccessed) : undefined
    };
  }

  /**
   * Get cloud storage statistics
   */
  async getStats(): Promise<{ count: number; size: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/memories/stats`, {
        method: 'GET',
        headers: this.defaultHeaders,
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get stats from cloud:', error);
      return { count: 0, size: 0 };
    }
  }

  /**
   * Health check for cloud storage connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.defaultHeaders,
        signal: AbortSignal.timeout(5000)
      });

      return response.ok;
    } catch (error) {
      console.error('Cloud storage health check failed:', error);
      return false;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CloudStorageConfig>): void {
    this.config = { ...this.config, ...config };
    this.baseUrl = config.baseUrl || this.baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
    };
  }
}