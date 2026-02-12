import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock external dependencies
const mockEditorCache = {
  get: vi.fn(),
  set: vi.fn()
};

const mockWithCircuitBreaker = vi.fn();
const mockValidateAIResponse = vi.fn();

vi.mock('../aiCacheService', () => ({
  editorCache: mockEditorCache
}));

vi.mock('../../../utils/errorHandler', () => ({
  withCircuitBreaker: mockWithCircuitBreaker
}));

vi.mock('../../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../../../utils/aiEditorValidator', () => ({
  validateAIResponse: mockValidateAIResponse
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock window
Object.defineProperty(global, 'window', {
  value: {
    localStorage: mockLocalStorage
  },
  writable: true
});

describe('Gemini Editor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAIEditorResponse', () => {
    const mockCurrentContent = {
      featuredPrograms: [
        { title: 'Science Program', description: 'Advanced science', imageUrl: 'science.jpg' },
        { title: 'Math Program', description: 'Mathematics', imageUrl: 'math.jpg' }
      ],
      latestNews: [
        { title: 'School Event', date: '2024-01-01', category: 'Events', imageUrl: 'event.jpg' },
        { title: 'Achievement', date: '2024-01-02', category: 'News', imageUrl: 'news.jpg' }
      ]
    };

    it('should return cached editor response when available', async () => {
      const cachedResult = {
        featuredPrograms: [{ title: 'Cached Program', description: 'Cached', imageUrl: 'cached.jpg' }],
        latestNews: [{ title: 'Cached News', date: '2024-01-01', category: 'Cached', imageUrl: 'cached.jpg' }]
      };
      mockEditorCache.get.mockReturnValue(cachedResult);

      const { getAIEditorResponse } = await import('../geminiEditor');
      const result = await getAIEditorResponse('test prompt', mockCurrentContent);

      expect(result).toEqual(cachedResult);
      expect(mockEditorCache.get).toHaveBeenCalledWith({
        operation: 'editor',
        input: 'test prompt',
        context: JSON.stringify(mockCurrentContent),
        model: expect.any(String)
      });
    });

    it('should generate new editor response when not cached', async () => {
      mockEditorCache.get.mockReturnValue(undefined);

      const mockResult = {
        featuredPrograms: [
          { title: 'New Program', description: 'New Description', imageUrl: 'new.jpg' }
        ],
        latestNews: [
          { title: 'New News', date: '2024-01-01', category: 'News', imageUrl: 'new.jpg' }
        ]
      };

      const mockResponse = { text: JSON.stringify(mockResult) };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);
      mockValidateAIResponse.mockReturnValue({
        isValid: true,
        sanitizedContent: mockResult
      });

      const { getAIEditorResponse } = await import('../geminiEditor');
      const result = await getAIEditorResponse('Add new program', mockCurrentContent);

      expect(result).toEqual(mockResult);
      expect(mockEditorCache.set).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'editor',
          input: 'Add new program'
        }),
        mockResult
      );
    });

    it('should include user ID in validation context', async () => {
      mockEditorCache.get.mockReturnValue(undefined);
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        user: { id: 'user123' }
      }));

      const mockResponse = { text: '{"featuredPrograms":[],"latestNews":[]}' };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);
      mockValidateAIResponse.mockReturnValue({
        isValid: true,
        sanitizedContent: { featuredPrograms: [], latestNews: [] }
      });

      const { getAIEditorResponse } = await import('../geminiEditor');
      await getAIEditorResponse('test', mockCurrentContent);

      expect(mockValidateAIResponse).toHaveBeenCalledWith(
        '{"featuredPrograms":[],"latestNews":[]}',
        mockCurrentContent,
        'user123'
      );
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('malnu_auth_session');
    });

    it('should handle missing auth session in localStorage', async () => {
      mockEditorCache.get.mockReturnValue(undefined);
      mockLocalStorage.getItem.mockReturnValue(null);

      const mockResponse = { text: '{"featuredPrograms":[],"latestNews":[]}' };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);
      mockValidateAIResponse.mockReturnValue({
        isValid: true,
        sanitizedContent: { featuredPrograms: [], latestNews: [] }
      });

      const { getAIEditorResponse } = await import('../geminiEditor');
      await getAIEditorResponse('test', mockCurrentContent);

      expect(mockValidateAIResponse).toHaveBeenCalledWith(
        '{"featuredPrograms":[],"latestNews":[]}',
        mockCurrentContent,
        'anonymous'
      );
    });

    it('should handle localStorage parsing errors gracefully', async () => {
      mockEditorCache.get.mockReturnValue(undefined);
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const mockResponse = { text: '{"featuredPrograms":[],"latestNews":[]}' };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);
      mockValidateAIResponse.mockReturnValue({
        isValid: true,
        sanitizedContent: { featuredPrograms: [], latestNews: [] }
      });

      const { getAIEditorResponse } = await import('../geminiEditor');
      await getAIEditorResponse('test', mockCurrentContent);

      expect(mockValidateAIResponse).toHaveBeenCalledWith(
        '{"featuredPrograms":[],"latestNews":[]}',
        mockCurrentContent,
        'anonymous'
      );
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('malnu_auth_session');
    });

    it('should reject response that fails validation', async () => {
      mockEditorCache.get.mockReturnValue(undefined);
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        user: { id: 'user123' }
      }));

      const invalidResponse = '{"malicious": "content"}';
      const mockResponse = { text: invalidResponse };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);
      mockValidateAIResponse.mockReturnValue({
        isValid: false,
        error: 'Invalid response content'
      });

      const { getAIEditorResponse } = await import('../geminiEditor');

      await expect(getAIEditorResponse('malicious prompt', mockCurrentContent))
        .rejects.toThrow('Invalid response content');
    });

    it('should handle AI service errors gracefully', async () => {
      mockEditorCache.get.mockReturnValue(undefined);
      mockWithCircuitBreaker.mockRejectedValue(new Error('AI service error'));

      const { getAIEditorResponse } = await import('../geminiEditor');

      await expect(getAIEditorResponse('test prompt', mockCurrentContent))
        .rejects.toThrow('Gagal memproses respon dari AI');
    });

    it('should construct proper editor prompt with safety constraints', async () => {
      mockEditorCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"featuredPrograms":[],"latestNews":[]}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { getAIEditorResponse } = await import('../geminiEditor');
      await getAIEditorResponse('Add new item', mockCurrentContent);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('You are an intelligent website content editor');
      expect(promptCall.contents).toContain('SAFETY CONSTRAINTS');
      expect(promptCall.contents).toContain('Only work with website content');
      expect(promptCall.contents).toContain(JSON.stringify(mockCurrentContent, null, 2));
    });

    it('should include placeholder image URLs when no image provided', async () => {
      mockEditorCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"featuredPrograms":[],"latestNews":[]}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      // Mock EXTERNAL_URLS
      vi.doMock('../../../constants', () => ({
        EXTERNAL_URLS: {
          PLACEHOLDER_IMAGE_BASE: 'https://example.com/placeholder/'
        }
      }));

      const { getAIEditorResponse } = await import('../geminiEditor');
      await getAIEditorResponse('Add new program without image', mockCurrentContent);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('PLACEHOLDER_IMAGE_BASE');
      expect(promptCall.contents).toContain('do NOT invent or hallucinate');
    });

    it('should use JSON schema validation', async () => {
      mockEditorCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"featuredPrograms":[],"latestNews":[]}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { getAIEditorResponse } = await import('../geminiEditor');
      await getAIEditorResponse('test prompt', mockCurrentContent);

      const configCall = mockGenerateContent.mock.calls[0][0];
      expect(configCall.config.responseMimeType).toBe('application/json');
      expect(configCall.config.responseSchema).toBeDefined();
      expect(configCall.config.responseSchema.type).toBeDefined();
    });

    it('should handle empty current content', async () => {
      mockEditorCache.get.mockReturnValue(undefined);
      const emptyContent = { featuredPrograms: [], latestNews: [] };

      const mockResult = {
        featuredPrograms: [{ title: 'New Program', description: 'Test', imageUrl: 'test.jpg' }],
        latestNews: [{ title: 'New News', date: '2024-01-01', category: 'Test', imageUrl: 'test.jpg' }]
      };

      const mockResponse = { text: JSON.stringify(mockResult) };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);
      mockValidateAIResponse.mockReturnValue({
        isValid: true,
        sanitizedContent: mockResult
      });

      const { getAIEditorResponse } = await import('../geminiEditor');
      const result = await getAIEditorResponse('Add content', emptyContent);

      expect(result).toEqual(mockResult);
      expect(mockValidateAIResponse).toHaveBeenCalledWith(
        JSON.stringify(mockResult),
        emptyContent,
        'anonymous'
      );
    });

    it('should cache successful editor results', async () => {
      mockEditorCache.get.mockReturnValue(undefined);

      const mockResult = {
        featuredPrograms: [{ title: 'Cached Program', description: 'Test', imageUrl: 'test.jpg' }],
        latestNews: []
      };

      const mockResponse = { text: JSON.stringify(mockResult) };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);
      mockValidateAIResponse.mockReturnValue({
        isValid: true,
        sanitizedContent: mockResult
      });

      const { getAIEditorResponse } = await import('../geminiEditor');
      await getAIEditorResponse('cache test', mockCurrentContent);

      expect(mockEditorCache.set).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'editor',
          input: 'cache test'
        }),
        mockResult
      );
    });

    it('should handle malformed AI response', async () => {
      mockEditorCache.get.mockReturnValue(undefined);

      const malformedResponse = '{ invalid json }';
      const mockResponse = { text: malformedResponse };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);

      const { getAIEditorResponse } = await import('../geminiEditor');

      await expect(getAIEditorResponse('test prompt', mockCurrentContent))
        .rejects.toThrow();
    });

    it('should handle validation with user context properly', async () => {
      mockEditorCache.get.mockReturnValue(undefined);
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        userId: 'custom-user-id'
      }));

      const mockResponse = { text: '{"featuredPrograms":[],"latestNews":[]}' };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);
      mockValidateAIResponse.mockReturnValue({
        isValid: true,
        sanitizedContent: { featuredPrograms: [], latestNews: [] }
      });

      const { getAIEditorResponse } = await import('../geminiEditor');
      await getAIEditorResponse('test', mockCurrentContent);

      expect(mockValidateAIResponse).toHaveBeenCalledWith(
        '{"featuredPrograms":[],"latestNews":[]}',
        mockCurrentContent,
        'custom-user-id'
      );
    });
  });

  describe('security and validation', () => {
    it('should include system instruction with safety rules', async () => {
      mockEditorCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"featuredPrograms":[],"latestNews":[]}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { getAIEditorResponse } = await import('../geminiEditor');
      await getAIEditorResponse('test', { featuredPrograms: [], latestNews: [] });

      const configCall = mockGenerateContent.mock.calls[0][0];
      expect(configCall.config.systemInstruction).toContain('You are an intelligent website content editor');
      expect(configCall.config.systemInstruction).toContain('SAFETY CONSTRAINTS');
      expect(configCall.config.systemInstruction).toContain('NEVER include external URLs');
    });

    it('should reject malicious content attempts', async () => {
      mockEditorCache.get.mockReturnValue(undefined);

      const maliciousResponse = '{"externalUrls":["http://evil.com"],"systemCommands":["rm -rf /"]}';
      const mockResponse = { text: maliciousResponse };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);
      mockValidateAIResponse.mockReturnValue({
        isValid: false,
        error: 'Malicious content detected'
      });

      const { getAIEditorResponse } = await import('../geminiEditor');

      await expect(getAIEditorResponse('malicious prompt', { featuredPrograms: [], latestNews: [] }))
        .rejects.toThrow('Malicious content detected');
    });
  });
});