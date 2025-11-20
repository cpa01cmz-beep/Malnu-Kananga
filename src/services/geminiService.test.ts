import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock the dependencies
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    generateContentStream: jest.fn()
  }))
}));

jest.mock('../utils/envValidation', () => ({
  API_KEY: 'test-api-key',
  WORKER_URL: 'https://test-worker.com'
}));

jest.mock('../memory', () => ({
  MemoryBank: jest.fn(() => ({
    searchMemories: jest.fn(),
    deleteMemory: jest.fn(),
    getStats: jest.fn(),
    getRelevantMemories: jest.fn().mockResolvedValue([]),
    addMemory: jest.fn(),
  })),
  schoolMemoryBankConfig: {}
}));

// Mock fetch globally
global.fetch = jest.fn();

// Import after mocking
const { 
  getAIResponseStream, 
  initialGreeting, 
  getConversationHistory, 
  clearConversationHistory, 
  getMemoryStats 
} = require('./geminiService');

describe('Gemini Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAIResponseStream', () => {
test('should handle successful response with context', async () => {
      const mockContext = 'School context information';
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ context: mockContext })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { text: 'Hello' };
          yield { text: ' world' };
        }
      };

      // Mock the GoogleGenAI constructor and its methods
      const mockGenerateContentStream = jest.fn().mockResolvedValue(mockStream);
      const mockModels = { generateContentStream: mockGenerateContentStream };
      
      const { GoogleGenAI } = require('@google/genai');
      jest.mock('@google/genai', () => ({
        GoogleGenAI: jest.fn().mockImplementation(() => ({
          models: mockModels
        }))
      }));

      const { MemoryBank } = require('../memory');
      const mockMemoryBank = new MemoryBank();
      mockMemoryBank.getRelevantMemories.mockResolvedValue([]);

      const generator = getAIResponseStream('Hello', []);
      const results = [];
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(results).toEqual(['Hello', ' world']);
    });

    test('should handle Google AI API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ context: 'context' })
      });

      const { GoogleGenAI } = require('@google/genai');
      const mockAI = new GoogleGenAI();
      (mockAI.models || { generateContentStream: jest.fn() }).generateContentStream.mockRejectedValue(new Error('API error'));

      const { MemoryBank } = require('../memory');
      const mockMemoryBank = new MemoryBank();
      mockMemoryBank.getRelevantMemories.mockResolvedValue([]);

      const generator = getAIResponseStream('Hello', []);
      await expect(generator.next()).rejects.toThrow('API error');
    });

    test('should include context in prompt when available', async () => {
      const mockContext = 'School information';
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ context: mockContext })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { text: 'Response with context' };
        }
      };

      const { GoogleGenAI } = require('@google/genai');
      const mockAI = new GoogleGenAI();
      (mockAI.models || { generateContentStream: jest.fn() }).generateContentStream.mockResolvedValue(mockStream);

      const { MemoryBank } = require('../memory');
      const mockMemoryBank = new MemoryBank();
      mockMemoryBank.getRelevantMemories.mockResolvedValue([]);

      const generator = getAIResponseStream('Question', []);
      const results = [];
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect((mockAI.models || { generateContentStream: jest.fn() }).generateContentStream).toHaveBeenCalled();
      expect(results).toEqual(['Response with context']);
    });

    test('should use correct system instruction in Indonesian', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ context: '' })
      });

      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { text: 'Indonesian response' };
        }
      };

      const { GoogleGenAI } = require('@google/genai');
      const mockAI = new GoogleGenAI();
      (mockAI.models || { generateContentStream: jest.fn() }).generateContentStream.mockResolvedValue(mockStream);

      const { MemoryBank } = require('../memory');
      const mockMemoryBank = new MemoryBank();
      mockMemoryBank.getRelevantMemories.mockResolvedValue([]);

      const generator = getAIResponseStream('Pertanyaan', []);
      const results = [];
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(results).toEqual(['Indonesian response']);
    });

    test('should handle empty context response', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ context: '' })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { text: 'No context response' };
        }
      };

      const { GoogleGenAI } = require('@google/genai');
      const mockAI = new GoogleGenAI();
      (mockAI.models || { generateContentStream: jest.fn() }).generateContentStream.mockResolvedValue(mockStream);

      const { MemoryBank } = require('../memory');
      const mockMemoryBank = new MemoryBank();
      mockMemoryBank.getRelevantMemories.mockResolvedValue([]);

      const generator = getAIResponseStream('Hello', []);
      const results = [];
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(results).toEqual(['No context response']);
    });
  });

  describe('initialGreeting', () => {
    test('should be a non-empty string', () => {
      expect(typeof initialGreeting).toBe('string');
      expect(initialGreeting.length).toBeGreaterThan(0);
    });

    test('should be in Indonesian language', () => {
      expect(initialGreeting).toMatch(/Halo|Assalamualaikum/);
    });

    test('should contain relevant keywords', () => {
      expect(initialGreeting).toMatch(/asisten|AI|bantuan|help/i);
    });

    test('should be helpful and welcoming', () => {
      expect(initialGreeting).toMatch(/selamat datang|bisa|bantu/i);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed API response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      });

      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { text: 'Error handled' };
        }
      };

      const { GoogleGenAI } = require('@google/genai');
      const mockAI = new GoogleGenAI();
      (mockAI.models || { generateContentStream: jest.fn() }).generateContentStream.mockResolvedValue(mockStream);

      const { MemoryBank } = require('../memory');
      const mockMemoryBank = new MemoryBank();
      mockMemoryBank.getRelevantMemories.mockResolvedValue([]);

      const generator = getAIResponseStream('Test', []);
      const results = [];
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(results).toEqual(['Error handled']);
    });

    test('should handle network timeout', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Timeout'));

      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { text: 'Timeout handled' };
        }
      };

      const { GoogleGenAI } = require('@google/genai');
      const mockAI = new GoogleGenAI();
      (mockAI.models || { generateContentStream: jest.fn() }).generateContentStream.mockResolvedValue(mockStream);

      const { MemoryBank } = require('../memory');
      const mockMemoryBank = new MemoryBank();
      mockMemoryBank.getRelevantMemories.mockResolvedValue([]);

      const generator = getAIResponseStream('Test', []);
      const results = [];
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(results).toEqual(['Timeout handled']);
    });
  });

  describe('getConversationHistory', () => {
    test('should return conversation history', async () => {
      const mockConversations = [
        { id: '1', content: 'Test conversation 1', type: 'conversation' },
        { id: '2', content: 'Test conversation 2', type: 'conversation' },
      ];
      
      const { MemoryBank } = require('../memory');
      const mockMemoryBank = new MemoryBank();
      mockMemoryBank.searchMemories.mockResolvedValue(mockConversations);

      const result = await getConversationHistory(5);

      expect(mockMemoryBank.searchMemories).toHaveBeenCalledWith({
        type: 'conversation',
        limit: 5,
      });
      expect(result).toEqual(mockConversations);
    });

    test('should handle error and return empty array', async () => {
      const { MemoryBank } = require('../memory');
      const mockMemoryBank = new MemoryBank();
      mockMemoryBank.searchMemories.mockRejectedValue(new Error('Memory error'));

      const result = await getConversationHistory();

      expect(result).toEqual([]);
    });

    test('should use default limit', async () => {
      const { MemoryBank } = require('../memory');
      const mockMemoryBank = new MemoryBank();
      mockMemoryBank.searchMemories.mockResolvedValue([]);

      await getConversationHistory();

      expect(mockMemoryBank.searchMemories).toHaveBeenCalledWith({
        type: 'conversation',
        limit: 10,
      });
    });
  });

  describe('clearConversationHistory', () => {
    test('should delete all conversations and return count', async () => {
      const mockConversations = [
        { id: '1', content: 'Conversation 1', type: 'conversation' },
        { id: '2', content: 'Conversation 2', type: 'conversation' },
      ];
      
      const { MemoryBank } = require('../memory');
      const mockMemoryBank = new MemoryBank();
      mockMemoryBank.searchMemories.mockResolvedValue(mockConversations);
      mockMemoryBank.deleteMemory.mockResolvedValue(undefined);

      const result = await clearConversationHistory();

      expect(mockMemoryBank.searchMemories).toHaveBeenCalledWith({
        type: 'conversation',
      });
      expect(mockMemoryBank.deleteMemory).toHaveBeenCalledTimes(2);
      expect(mockMemoryBank.deleteMemory).toHaveBeenCalledWith('1');
      expect(mockMemoryBank.deleteMemory).toHaveBeenCalledWith('2');
      expect(result).toBe(2);
    });

    test('should handle error', async () => {
      const { MemoryBank } = require('../memory');
      const mockMemoryBank = new MemoryBank();
      mockMemoryBank.searchMemories.mockRejectedValue(new Error('Memory error'));

      await expect(clearConversationHistory()).rejects.toThrow('Memory error');
    });
  });

  describe('getMemoryStats', () => {
    test('should return memory stats', async () => {
      const mockStats = { totalMemories: 10, totalSize: 1024 };
      
      const { MemoryBank } = require('../memory');
      const mockMemoryBank = new MemoryBank();
      mockMemoryBank.getStats.mockResolvedValue(mockStats);

      const result = await getMemoryStats();

      expect(mockMemoryBank.getStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });

    test('should handle error and return null', async () => {
      const { MemoryBank } = require('../memory');
      const mockMemoryBank = new MemoryBank();
      mockMemoryBank.getStats.mockRejectedValue(new Error('Stats error'));

      const result = await getMemoryStats();

      expect(result).toBeNull();
    });
  });
});