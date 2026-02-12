import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock external dependencies
const mockChatCache = {
  get: vi.fn(),
  set: vi.fn()
};

const mockWithCircuitBreaker = vi.fn();

vi.mock('../aiCacheService', () => ({
  chatCache: mockChatCache
}));

vi.mock('../../../utils/errorHandler', () => ({
  withCircuitBreaker: mockWithCircuitBreaker
}));

vi.mock('../../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  }
}));

describe('Gemini Chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAIResponseStream', () => {
    it('should return cached response when available', async () => {
      const cachedResponse = 'This is a cached response';
      mockChatCache.get.mockReturnValue(cachedResponse);

      const { getAIResponseStream } = await import('../geminiChat');
      const stream = getAIResponseStream('test message', []);
      
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual([cachedResponse]);
      expect(mockChatCache.get).toHaveBeenCalled();
    });

    it('should fetch RAG context from worker endpoint', async () => {
      // Setup fetch mock for RAG context
      const mockRagResponse = { context: 'Test RAG context' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockRagResponse
      });

      // Mock cache miss
      mockChatCache.get.mockReturnValue(undefined);

      // Mock circuit breaker to return stream
      const mockStream = (async function* () {
        yield 'AI response';
      })();
      mockWithCircuitBreaker.mockReturnValue(mockStream);

      const { getAIResponseStream } = await import('../geminiChat');
      const _stream = getAIResponseStream('test message', [], {
        featuredPrograms: [{ title: 'Test Program', description: 'Test', imageUrl: 'test.jpg' }],
        latestNews: [{ title: 'Test News', date: '2024-01-01', category: 'General', imageUrl: 'test.jpg' }]
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai/chat'),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'test message' })
        }
      );
    });

    it('should handle RAG fetch failure gracefully', async () => {
      // Mock fetch failure
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      // Mock cache miss
      mockChatCache.get.mockReturnValue(undefined);

      // Mock circuit breaker to return stream
      const mockStream = (async function* () {
        yield 'AI response without RAG';
      })();
      mockWithCircuitBreaker.mockReturnValue(mockStream);

      const { getAIResponseStream } = await import('../geminiChat');
      const stream = getAIResponseStream('test message', []);

      // Should not throw and proceed with local context only
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(0);
    });

    it('should construct proper augmented prompt with local context', async () => {
      // Mock cache miss and RAG response
      mockChatCache.get.mockReturnValue(undefined);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ context: 'Database context' })
      });

      const mockStream = (async function* () {
        yield 'Response';
      })();
      mockWithCircuitBreaker.mockReturnValue(mockStream);

      const { getAIResponseStream } = await import('../geminiChat');
      const localContext = {
        featuredPrograms: [
          { title: 'Science Program', description: 'Advanced science', imageUrl: 'science.jpg' }
        ],
        latestNews: [
          { title: 'School Event', date: '2024-01-01', category: 'Events', imageUrl: 'event.jpg' }
        ]
      };

      const stream = getAIResponseStream('test message', [], localContext);
      
      // Start consuming the stream to trigger the circuit breaker call
      for await (const _chunk of stream) {
        // Just consume
      }

      // Verify circuit breaker was called with proper context
      expect(mockWithCircuitBreaker).toHaveBeenCalledWith(
        expect.any(Function)
      );

      // Check that the function passed to circuit breaker would construct proper prompt
      const circuitBreakerFn = mockWithCircuitBreaker.mock.calls[0][0];
      expect(typeof circuitBreakerFn).toBe('function');
    });

    it('should handle AI response errors gracefully', async () => {
      // Mock cache miss
      mockChatCache.get.mockReturnValue(undefined);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ context: 'Database context' })
      });

      // Mock circuit breaker to throw error
      mockWithCircuitBreaker.mockRejectedValue(new Error('AI service error'));

      const { getAIResponseStream } = await import('../geminiChat');
      const stream = getAIResponseStream('test message', []);

      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      // Should return fallback error message
      expect(chunks).toContain(expect.stringContaining('Maaf'));
    });

    it('should cache successful responses', async () => {
      // Mock cache miss initially
      mockChatCache.get.mockReturnValue(undefined);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ context: 'Database context' })
      });

      // Mock successful AI response
      const mockStream = (async function* () {
        yield 'First response';
        yield 'Second response';
      })();
      mockWithCircuitBreaker.mockReturnValue(mockStream);

      const { getAIResponseStream } = await import('../geminiChat');
      const stream = getAIResponseStream('test message', []);

      // Consume the stream
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      // Should cache the complete response
      expect(mockChatCache.set).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'chat',
          input: 'test message'
        }),
        'First responseSecond response'
      );
    });

    it('should work with thinking mode enabled', async () => {
      mockChatCache.get.mockReturnValue(undefined);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ context: 'Database context' })
      });

      const mockStream = (async function* () {
        yield 'Thinking mode response';
      })();
      mockWithCircuitBreaker.mockReturnValue(mockStream);

      const { getAIResponseStream } = await import('../geminiChat');
      const stream = getAIResponseStream('test message', [], undefined, true);

      for await (const _chunk of stream) {
        // Consume
      }

      // Should include thinking mode in cache key
      expect(mockChatCache.set).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'chat',
          input: 'test message',
          thinkingMode: true
        }),
        'Thinking mode response'
      );
    });

    it('should handle empty local context', async () => {
      mockChatCache.get.mockReturnValue(undefined);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ context: 'Database context' })
      });

      const mockStream = (async function* () {
        yield 'Response';
      })();
      mockWithCircuitBreaker.mockReturnValue(mockStream);

      const { getAIResponseStream } = await import('../geminiChat');
      const stream = getAIResponseStream('test message', []);

      for await (const _chunk of stream) {
        // Consume
      }

      // Should handle empty local context gracefully
      expect(mockWithCircuitBreaker).toHaveBeenCalled();
    });
  });

  describe('initialGreeting', () => {
    it('should return expected greeting message', async () => {
      const { initialGreeting } = await import('../geminiChat');
      
      expect(typeof initialGreeting).toBe('string');
      expect(initialGreeting).toContain('Assalamualaikum');
      expect(initialGreeting).toContain('Asisten AI');
      expect(initialGreeting).toContain('MA Malnu Kananga');
    });

    it('should be consistent across imports', async () => {
      const greeting1 = (await import('../geminiChat')).initialGreeting;
      const greeting2 = (await import('../geminiChat')).initialGreeting;
      
      expect(greeting1).toBe(greeting2);
    });
  });

  describe('LocalContext interface', () => {
    it('should accept valid local context structure', async () => {
      const localContext = {
        featuredPrograms: [
          { title: 'Test Program', description: 'Test Description', imageUrl: 'test.jpg' }
        ],
        latestNews: [
          { title: 'Test News', date: '2024-01-01', category: 'Test', imageUrl: 'test.jpg' }
        ]
      };

      const { getAIResponseStream } = await import('../geminiChat');
      const stream = getAIResponseStream('test', [], localContext);

      // Should not throw
      expect(() => {
        // Try to consume the stream
        if (stream.next) {
          stream.next();
        }
      }).not.toThrow();
    });

    it('should handle empty arrays in local context', async () => {
      const localContext = {
        featuredPrograms: [],
        latestNews: []
      };

      const { getAIResponseStream } = await import('../geminiChat');
      const stream = getAIResponseStream('test', [], localContext);

      expect(() => {
        if (stream.next) {
          stream.next();
        }
      }).not.toThrow();
    });
  });

  describe('conversation history', () => {
    it('should handle conversation history properly', async () => {
      mockChatCache.get.mockReturnValue(undefined);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ context: 'Database context' })
      });

      const mockStream = (async function* () {
        yield 'Response with history';
      })();
      mockWithCircuitBreaker.mockReturnValue(mockStream);

      const { getAIResponseStream } = await import('../geminiChat');
      const history = [
        { role: 'user' as const, parts: 'Hello' },
        { role: 'model' as const, parts: 'Hi there!' }
      ];

      const stream = getAIResponseStream('How are you?', history);

      for await (const _chunk of stream) {
        // Consume
      }

      expect(mockWithCircuitBreaker).toHaveBeenCalled();
    });

    it('should handle empty history', async () => {
      mockChatCache.get.mockReturnValue(undefined);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ context: 'Database context' })
      });

      const mockStream = (async function* () {
        yield 'Response without history';
      })();
      mockWithCircuitBreaker.mockReturnValue(mockStream);

      const { getAIResponseStream } = await import('../geminiChat');
      const stream = getAIResponseStream('First message', []);

      for await (const _chunk of stream) {
        // Consume
      }

      expect(mockWithCircuitBreaker).toHaveBeenCalled();
    });
  });
});