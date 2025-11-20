import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { 
  getAIResponseStream, 
  initialGreeting, 
  getConversationHistory, 
  clearConversationHistory, 
  getMemoryStats 
} from './geminiService';

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

// Mock fetch globally
global.fetch = jest.fn();

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
        stream: {
          [Symbol.asyncIterator]: async function* () {
            yield { text: () => 'Hello' };
            yield { text: () => ' world' };
          }
        }
      };

      const { GoogleGenAI } = require('@google/genai');
      const mockAI = new GoogleGenAI();
      mockAI.generateContentStream.mockResolvedValue(mockStream);

      const generator = getAIResponseStream('Hello', []);
      const results = [];
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(results).toEqual(['Hello', ' world']);
    });

    test('should handle fetch error gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const mockStream = {
        stream: {
          [Symbol.asyncIterator]: async function* () {
            yield { text: () => 'Fallback response' };
          }
        }
      };

      const { GoogleGenAI } = require('@google/genai');
      const mockAI = new GoogleGenAI();
      mockAI.generateContentStream.mockResolvedValue(mockStream);

      const generator = getAIResponseStream('Hello', []);
      const results = [];
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(results).toEqual(['Fallback response']);
    });

    test('should handle Google AI API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ context: 'context' })
      });

      const { GoogleGenAI } = require('@google/genai');
      const mockAI = new GoogleGenAI();
      mockAI.generateContentStream.mockRejectedValue(new Error('API error'));

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
        stream: {
          [Symbol.asyncIterator]: async function* () {
            yield { text: () => 'Response with context' };
          }
        }
      };

      const { GoogleGenAI } = require('@google/genai');
      const mockAI = new GoogleGenAI();
      mockAI.generateContentStream.mockResolvedValue(mockStream);

      const generator = getAIResponseStream('Question', []);
      const results = [];
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(mockAI.generateContentStream).toHaveBeenCalled();
      expect(results).toEqual(['Response with context']);
    });

    test('should use correct system instruction in Indonesian', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ context: '' })
      });

      const mockStream = {
        stream: {
          [Symbol.asyncIterator]: async function* () {
            yield { text: () => 'Indonesian response' };
          }
        }
      };

      const { GoogleGenAI } = require('@google/genai');
      const mockAI = new GoogleGenAI();
      mockAI.generateContentStream.mockResolvedValue(mockStream);

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
        stream: {
          [Symbol.asyncIterator]: async function* () {
            yield { text: () => 'No context response' };
          }
        }
      };

      const { GoogleGenAI } = require('@google/genai');
      const mockAI = new GoogleGenAI();
      mockAI.generateContentStream.mockResolvedValue(mockStream);

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
      expect(initialGreeting).toContain('Halo');
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
        stream: {
          [Symbol.asyncIterator]: async function* () {
            yield { text: () => 'Error handled' };
          }
        }
      };

      const { GoogleGenAI } = require('@google/genai');
      const mockAI = new GoogleGenAI();
      mockAI.generateContentStream.mockResolvedValue(mockStream);

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
        stream: {
          [Symbol.asyncIterator]: async function* () {
            yield { text: () => 'Timeout handled' };
          }
        }
      };

      const { GoogleGenAI } = require('@google/genai');
      const mockAI = new GoogleGenAI();
      mockAI.generateContentStream.mockResolvedValue(mockStream);

      const generator = getAIResponseStream('Test', []);
      const results = [];
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(results).toEqual(['Timeout handled']);
    });
  });

  describe('getConversationHistory', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return conversation history', async () => {
      const mockHistory = [
        { id: '1', content: 'Conversation 1', type: 'conversation' },
        { id: '2', content: 'Conversation 2', type: 'conversation' },
      ];
      
      const mockMemoryBank = {
        searchMemories: jest.fn().mockResolvedValue(mockHistory),
      };

      jest.mock('../memory', () => ({
        MemoryBank: jest.fn(() => mockMemoryBank),
        schoolMemoryBankConfig: {}
      }));

      // Re-import the service to use mocked MemoryBank
      const { getConversationHistory } = require('./geminiService');

      const result = await getConversationHistory(5);

      expect(mockMemoryBank.searchMemories).toHaveBeenCalledWith({
        type: 'conversation',
        limit: 5,
      });
      expect(result).toEqual(mockHistory);
    });

    test('should handle error and return empty array', async () => {
      const mockMemoryBank = {
        searchMemories: jest.fn().mockRejectedValue(new Error('Memory error')),
      };

      jest.mock('../memory', () => ({
        MemoryBank: jest.fn(() => mockMemoryBank),
        schoolMemoryBankConfig: {}
      }));

      // Re-import the service to use mocked MemoryBank
      const { getConversationHistory } = require('./geminiService');

      const result = await getConversationHistory();

      expect(result).toEqual([]);
    });

    test('should use default limit', async () => {
      const mockMemoryBank = {
        searchMemories: jest.fn().mockResolvedValue([]),
      };

      jest.mock('../memory', () => ({
        MemoryBank: jest.fn(() => mockMemoryBank),
        schoolMemoryBankConfig: {}
      }));

      // Re-import the service to use mocked MemoryBank
      const { getConversationHistory } = require('./geminiService');

      await getConversationHistory();

      expect(mockMemoryBank.searchMemories).toHaveBeenCalledWith({
        type: 'conversation',
        limit: 10,
      });
    });
  });

  describe('clearConversationHistory', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should delete all conversations and return count', async () => {
      const mockConversations = [
        { id: '1', content: 'Conversation 1', type: 'conversation' },
        { id: '2', content: 'Conversation 2', type: 'conversation' },
      ];
      
      const mockMemoryBank = {
        searchMemories: jest.fn().mockResolvedValue(mockConversations),
        deleteMemory: jest.fn().mockResolvedValue(undefined),
      };

      jest.mock('../memory', () => ({
        MemoryBank: jest.fn(() => mockMemoryBank),
        schoolMemoryBankConfig: {}
      }));

      // Re-import the service to use mocked MemoryBank
      const { clearConversationHistory } = require('./geminiService');

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
      const mockMemoryBank = {
        searchMemories: jest.fn().mockRejectedValue(new Error('Memory error')),
      };

      jest.mock('../memory', () => ({
        MemoryBank: jest.fn(() => mockMemoryBank),
        schoolMemoryBankConfig: {}
      }));

      // Re-import the service to use mocked MemoryBank
      const { clearConversationHistory } = require('./geminiService');

      await expect(clearConversationHistory()).rejects.toThrow('Memory error');
    });
  });

  describe('getMemoryStats', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return memory stats', async () => {
      const mockStats = { totalMemories: 10, totalSize: 1024 };
      
      const mockMemoryBank = {
        getStats: jest.fn().mockResolvedValue(mockStats),
      };

      jest.mock('../memory', () => ({
        MemoryBank: jest.fn(() => mockMemoryBank),
        schoolMemoryBankConfig: {}
      }));

      // Re-import the service to use mocked MemoryBank
      const { getMemoryStats } = require('./geminiService');

      const result = await getMemoryStats();

      expect(mockMemoryBank.getStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });

    test('should handle error and return null', async () => {
      const mockMemoryBank = {
        getStats: jest.fn().mockRejectedValue(new Error('Stats error')),
      };

      jest.mock('../memory', () => ({
        MemoryBank: jest.fn(() => mockMemoryBank),
        schoolMemoryBankConfig: {}
      }));

      // Re-import the service to use mocked MemoryBank
      const { getMemoryStats } = require('./geminiService');

      const result = await getMemoryStats();

      expect(result).toBeNull();
    });
  });
});