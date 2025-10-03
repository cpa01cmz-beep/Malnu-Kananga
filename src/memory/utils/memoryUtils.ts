import { Memory, MemoryType, MemoryQuery } from '../types';

/**
 * Memory Utility Functions
 * Helper functions for memory operations and analysis
 */

/**
 * Generate a unique ID for a memory
 */
export function generateMemoryId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate memory importance based on content and context
 */
export function calculateImportance(
  content: string,
  type: MemoryType,
  metadata?: Record<string, any>
): number {
  let importance = 0.5; // Default importance

  // Base importance by type
  const typeImportance: Record<MemoryType, number> = {
    system: 0.9,
    context: 0.7,
    fact: 0.6,
    preference: 0.5,
    conversation: 0.3
  };

  importance = typeImportance[type] || 0.5;

  // Adjust based on content length (longer content might be more important)
  if (content.length > 500) {
    importance = Math.min(importance + 0.1, 1.0);
  } else if (content.length < 50) {
    importance = Math.max(importance - 0.1, 0.1);
  }

  // Boost importance for content with specific keywords
  const importantKeywords = ['important', 'critical', 'urgent', 'remember', 'key'];
  const contentLower = content.toLowerCase();
  const keywordMatches = importantKeywords.filter(keyword =>
    contentLower.includes(keyword)
  ).length;

  importance = Math.min(importance + (keywordMatches * 0.1), 1.0);

  // Adjust based on metadata
  if (metadata) {
    if (metadata.priority === 'high') {
      importance = Math.min(importance + 0.2, 1.0);
    } else if (metadata.priority === 'low') {
      importance = Math.max(importance - 0.2, 0.1);
    }

    if (metadata.category === 'security' || metadata.category === 'authentication') {
      importance = Math.min(importance + 0.3, 1.0);
    }
  }

  return Math.round(importance * 100) / 100; // Round to 2 decimal places
}

/**
 * Extract keywords from memory content
 */
export function extractKeywords(content: string, maxKeywords = 10): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ]);

  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  // Sort by frequency and return top keywords
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Calculate similarity between two memory contents
 */
export function calculateSimilarity(content1: string, content2: string): number {
  const keywords1 = new Set(extractKeywords(content1, 20));
  const keywords2 = new Set(extractKeywords(content2, 20));

  const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
  const union = new Set([...keywords1, ...keywords2]);

  return intersection.size / union.size;
}

/**
 * Filter memories based on relevance to a query
 */
export function filterRelevantMemories(
  memories: Memory[],
  query: string,
  threshold = 0.1
): Memory[] {
  return memories
    .map(memory => ({
      memory,
      relevance: calculateSimilarity(memory.content, query)
    }))
    .filter(({ relevance }) => relevance >= threshold)
    .sort((a, b) => b.relevance - a.relevance)
    .map(({ memory }) => memory);
}

/**
 * Group memories by type
 */
export function groupMemoriesByType(memories: Memory[]): Record<MemoryType, Memory[]> {
  return memories.reduce((groups, memory) => {
    const type = memory.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(memory);
    return groups;
  }, {} as Record<MemoryType, Memory[]>);
}

/**
 * Get memory statistics
 */
export function getMemoryStatistics(memories: Memory[]): {
  total: number;
  byType: Record<MemoryType, number>;
  averageImportance: number;
  oldest: Date | null;
  newest: Date | null;
} {
  if (memories.length === 0) {
    return {
      total: 0,
      byType: {} as Record<MemoryType, number>,
      averageImportance: 0,
      oldest: null,
      newest: null
    };
  }

  const byType = memories.reduce((acc, memory) => {
    acc[memory.type] = (acc[memory.type] || 0) + 1;
    return acc;
  }, {} as Record<MemoryType, number>);

  const averageImportance = memories.reduce((sum, memory) => sum + memory.importance, 0) / memories.length;

  const timestamps = memories.map(m => m.timestamp.getTime());
  const oldest = new Date(Math.min(...timestamps));
  const newest = new Date(Math.max(...timestamps));

  return {
    total: memories.length,
    byType,
    averageImportance: Math.round(averageImportance * 100) / 100,
    oldest,
    newest
  };
}

/**
 * Validate memory object
 */
export function validateMemory(memory: any): memory is Memory {
  return (
    memory &&
    typeof memory.id === 'string' &&
    typeof memory.content === 'string' &&
    typeof memory.type === 'string' &&
    memory.timestamp instanceof Date &&
    typeof memory.importance === 'number' &&
    memory.importance >= 0 &&
    memory.importance <= 1 &&
    typeof memory.accessCount === 'number' &&
    memory.accessCount >= 0
  );
}

/**
 * Create a memory query from natural language
 */
export function createQueryFromText(text: string): MemoryQuery {
  const query: MemoryQuery = {};
  const textLower = text.toLowerCase();

  // Detect memory types
  if (textLower.includes('conversation') || textLower.includes('chat')) {
    query.type = 'conversation';
  } else if (textLower.includes('fact') || textLower.includes('information')) {
    query.type = 'fact';
  } else if (textLower.includes('preference') || textLower.includes('like') || textLower.includes('want')) {
    query.type = 'preference';
  } else if (textLower.includes('context') || textLower.includes('background')) {
    query.type = 'context';
  } else if (textLower.includes('system') || textLower.includes('setting')) {
    query.type = 'system';
  }

  // Extract keywords
  if (textLower.length > 0) {
    query.keywords = extractKeywords(text, 5);
  }

  // Set default limit
  query.limit = 20;

  return query;
}

/**
 * Format memory for display
 */
export function formatMemoryForDisplay(memory: Memory): string {
  const date = memory.timestamp.toLocaleDateString();
  const time = memory.timestamp.toLocaleTimeString();
  const type = memory.type.charAt(0).toUpperCase() + memory.type.slice(1);

  return `[${type}] ${date} ${time} - ${memory.content.substring(0, 100)}${memory.content.length > 100 ? '...' : ''}`;
}

/**
 * Merge overlapping memories
 */
export function mergeMemories(memories: Memory[]): Memory[] {
  const merged: Memory[] = [];
  const used = new Set<string>();

  for (let i = 0; i < memories.length; i++) {
    if (used.has(memories[i].id)) continue;

    let mergedContent = memories[i].content;
    let mergedMetadata = { ...memories[i].metadata };
    const similarMemories = [memories[i]];

    // Find similar memories
    for (let j = i + 1; j < memories.length; j++) {
      if (used.has(memories[j].id)) continue;

      const similarity = calculateSimilarity(memories[i].content, memories[j].content);
      if (similarity > 0.7) { // High similarity threshold
        mergedContent += ' ' + memories[j].content;
        mergedMetadata = { ...mergedMetadata, ...memories[j].metadata };
        similarMemories.push(memories[j]);
        used.add(memories[j].id);
      }
    }

    // Create merged memory
    if (similarMemories.length > 1) {
      const avgImportance = similarMemories.reduce((sum, m) => sum + m.importance, 0) / similarMemories.length;
      const maxAccessCount = Math.max(...similarMemories.map(m => m.accessCount));

      merged.push({
        ...memories[i],
        content: mergedContent,
        importance: avgImportance,
        accessCount: maxAccessCount,
        metadata: mergedMetadata
      });
    } else {
      merged.push(memories[i]);
    }

    used.add(memories[i].id);
  }

  return merged;
}

/**
 * Clean memory content (remove extra whitespace, normalize)
 */
export function cleanMemoryContent(content: string): string {
  return content
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/[\r\n]+/g, ' ') // Replace line breaks with space
    .trim();
}

/**
 * Estimate memory storage size in bytes
 */
export function estimateMemorySize(memory: Memory): number {
  const contentSize = new Blob([memory.content]).size;
  const metadataSize = memory.metadata ? new Blob([JSON.stringify(memory.metadata)]).size : 0;
  const overhead = 100; // Estimate for id, timestamp, etc.

  return contentSize + metadataSize + overhead;
}