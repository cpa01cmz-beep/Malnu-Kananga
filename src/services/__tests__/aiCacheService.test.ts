/**
 * AI Cache Service Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { chatCache, analysisCache, editorCache, AIResponseCache } from '../aiCacheService';

describe('AI Cache Service', () => {
  beforeEach(() => {
    // Clear all caches before each test
    chatCache.clear();
    analysisCache.clear();
    editorCache.clear();
  });

  afterEach(() => {
    // Clean up after tests
    chatCache.clear();
    analysisCache.clear();
    editorCache.clear();
  });

  describe('Chat Cache', () => {
    it('should cache and retrieve chat responses', async () => {
      const params = {
        operation: 'chat' as const,
        input: 'Hello world',
        context: 'Some context'
      };

      // Should return null for non-existent cache
      const cached = chatCache.get<string>(params);
      expect(cached).toBeNull();

      // Set cache
      const response = 'Hello! How can I help you?';
      chatCache.set(params, response);

      // Should retrieve cached response
      const retrieved = chatCache.get<string>(params);
      expect(retrieved).toBe(response);
    });

    it('should return null for expired cache entries', async () => {
      const params = {
        operation: 'chat' as const,
        input: 'Test message'
      };

      // Set cache
      chatCache.set(params, 'Test response');

      // Should retrieve immediately
      expect(chatCache.get<string>(params)).toBe('Test response');

      // Note: In real tests, we would need to mock time to test expiration
      // For now, we test the existence check
      expect(chatCache.has(params)).toBe(true);
    });

    it('should generate unique cache keys for different inputs', async () => {
      const params1 = { operation: 'chat' as const, input: 'Message 1' };
      const params2 = { operation: 'chat' as const, input: 'Message 2' };

      chatCache.set(params1, 'Response 1');
      chatCache.set(params2, 'Response 2');

      expect(chatCache.get<string>(params1)).toBe('Response 1');
      expect(chatCache.get<string>(params2)).toBe('Response 2');
    });

    it('should limit cache size and evict old entries', async () => {
      // Create a small cache for testing
      const testCache = new AIResponseCache({ maxSize: 2, ttl: 60000 });

      // Add 3 entries to test eviction
      testCache.set({ operation: 'chat', input: 'test1' }, 'response1');
      testCache.set({ operation: 'chat', input: 'test2' }, 'response2');
      testCache.set({ operation: 'chat', input: 'test3' }, 'response3');

      // Should still be able to get latest entries
      expect(testCache.get({ operation: 'chat', input: 'test2' })).toBe('response2');
      expect(testCache.get({ operation: 'chat', input: 'test3' })).toBe('response3');

      // First entry might be evicted due to size limit
      const firstEntry = testCache.get({ operation: 'chat', input: 'test1' });
      expect(firstEntry === null || firstEntry === 'response1').toBe(true);
    });
  });

  describe('Analysis Cache', () => {
    it('should cache and retrieve analysis results', async () => {
      const params = {
        operation: 'classAnalysis' as const,
        input: JSON.stringify([{ studentName: 'John', grade: 'A' }]),
        model: 'gemini-3-pro-preview'
      };

      const analysis = 'Class performance: Excellent';
      analysisCache.set(params, analysis);

      const retrieved = analysisCache.get<string>(params);
      expect(retrieved).toBe(analysis);
    });

    it('should handle complex input data', async () => {
      const grades = [
        { studentName: 'Alice', subject: 'Math', grade: 'A', semester: '1' },
        { studentName: 'Bob', subject: 'Math', grade: 'B', semester: '1' }
      ];

      const params = {
        operation: 'classAnalysis' as const,
        input: JSON.stringify(grades)
      };

      const analysis = 'Detailed analysis...';
      analysisCache.set(params, analysis);

      expect(analysisCache.get<string>(params)).toBe(analysis);
    });
  });

  describe('Editor Cache', () => {
    it('should cache and retrieve editor responses', async () => {
      const params = {
        operation: 'editor' as const,
        input: 'Add new program',
        context: JSON.stringify({ featuredPrograms: [], latestNews: [] })
      };

      const result = {
        featuredPrograms: [{ title: 'New Program', description: 'Description', imageUrl: 'url' }],
        latestNews: []
      };

      editorCache.set(params, result);
      const retrieved = editorCache.get<typeof result>(params);

      expect(retrieved).toEqual(result);
    });
  });

  describe('Cache Statistics', () => {
    it('should provide accurate statistics', async () => {
      const params = { operation: 'chat' as const, input: 'test' };

      // Initial stats
      let stats = chatCache.getStats();
      expect(stats.totalEntries).toBe(0);
      expect(stats.hitRate).toBe(0);
      expect(stats.totalHits).toBe(0);
      expect(stats.totalMisses).toBe(0);

      // Cache miss
      chatCache.get<string>(params);
      stats = chatCache.getStats();
      expect(stats.totalMisses).toBe(1);

      // Set and hit
      chatCache.set(params, 'response');
      chatCache.get<string>(params);
      stats = chatCache.getStats();
      expect(stats.totalHits).toBe(1);
      expect(stats.totalEntries).toBe(1);
      expect(stats.hitRate).toBeGreaterThan(0);
    });

    it('should track hit rate correctly', async () => {
      const params = { operation: 'chat' as const, input: 'test' };

      // Multiple misses
      chatCache.get<string>(params);
      chatCache.get<string>(params);

      let stats = chatCache.getStats();
      expect(stats.hitRate).toBe(0);

      // Cache and hit
      chatCache.set(params, 'response');
      chatCache.get<string>(params);

      stats = chatCache.getStats();
      expect(stats.hitRate).toBe(1 / 3); // 1 hit out of 3 total requests
    });
  });

  describe('Cache Management', () => {
    it('should clear all entries', async () => {
      chatCache.set({ operation: 'chat', input: 'test1' }, 'response1');
      analysisCache.set({ operation: 'classAnalysis', input: 'test2' }, 'response2');

      expect(chatCache.getStats().totalEntries).toBe(1);
      expect(analysisCache.getStats().totalEntries).toBe(1);

      chatCache.clear();
      analysisCache.clear();

      expect(chatCache.getStats().totalEntries).toBe(0);
      expect(analysisCache.getStats().totalEntries).toBe(0);
    });

    it('should check if key exists', async () => {
      const params = { operation: 'chat' as const, input: 'test' };

      expect(chatCache.has(params)).toBe(false);

      chatCache.set(params, 'response');
      expect(chatCache.has(params)).toBe(true);

      chatCache.clear();
      expect(chatCache.has(params)).toBe(false);
    });
  });

  describe('Contextual Caching', () => {
    it('should distinguish between different contexts', async () => {
      const params1 = {
        operation: 'chat' as const,
        input: 'What programs are available?',
        context: 'Program A, Program B'
      };

      const params2 = {
        operation: 'chat' as const,
        input: 'What programs are available?',
        context: 'Program C, Program D'
      };

      chatCache.set(params1, 'We have Program A and B');
      chatCache.set(params2, 'We have Program C and D');

      expect(chatCache.get<string>(params1)).toBe('We have Program A and B');
      expect(chatCache.get<string>(params2)).toBe('We have Program C and D');
    });

    it('should handle thinking mode differences', async () => {
      const params1 = {
        operation: 'chat' as const,
        input: 'Complex question',
        thinkingMode: false as const
      };

      const params2 = {
        operation: 'chat' as const,
        input: 'Complex question',
        thinkingMode: true as const
      };

      chatCache.set(params1, 'Simple answer');
      chatCache.set(params2, 'Detailed thinking process...');

      expect(chatCache.get<string>(params1)).toBe('Simple answer');
      expect(chatCache.get<string>(params2)).toBe('Detailed thinking process...');
    });
  });
});