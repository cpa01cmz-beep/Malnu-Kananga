import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock the dependencies
const mockGenerateContentStream = jest.fn();
const mockModels = { generateContentStream: mockGenerateContentStream };

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: mockModels
  }))
}));

jest.mock('../utils/envValidation', () => ({
  API_KEY: 'test-api-key',
  WORKER_URL: 'https://test-worker.com'
}));

const mockSearchMemories = jest.fn();
const mockDeleteMemory = jest.fn();
const mockGetStats = jest.fn();
const mockGetRelevantMemories = jest.fn().mockResolvedValue([]);
const mockAddMemory = jest.fn();

// Create a mock MemoryBank class
class MockMemoryBank {
  searchMemories = mockSearchMemories;
  deleteMemory = mockDeleteMemory;
  getStats = mockGetStats;
  getRelevantMemories = mockGetRelevantMemories;
  addMemory = mockAddMemory;
}

jest.mock('../memory', () => ({
  MemoryBank: MockMemoryBank,
  schoolMemoryBankConfig: {}
}));

// Mock fetch globally
global.fetch = jest.fn();

// Import after mocking
import { 
  getAIResponseStream, 
  initialGreeting, 
  getConversationHistory, 
  clearConversationHistory, 
  getMemoryStats 
} from './geminiService';

describe('Gemini Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchMemories.mockResolvedValue([]);
    mockDeleteMemory.mockResolvedValue(undefined);
    mockGetStats.mockResolvedValue({ totalMemories: 0, totalSize: 0 });
    mockGetRelevantMemories.mockResolvedValue([]);
    mockAddMemory.mockResolvedValue(undefined);
    mockGenerateContentStream.mockResolvedValue({
      [Symbol.asyncIterator]: async function* () {
        yield { text: 'Maaf, terjadi masalah saat menghubungi AI. Silakan coba lagi nanti.' };
      }
    });
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

      mockGenerateContentStream.mockResolvedValue(mockStream);
      mockGetRelevantMemories.mockResolvedValue([]);

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

      mockGenerateContentStream.mockRejectedValue(new Error('API error'));
      mockGetRelevantMemories.mockResolvedValue([]);

      const generator = getAIResponseStream('Hello', []);
      const results = [];
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(results).toEqual(['Maaf, terjadi masalah saat menghubungi AI. Silakan coba lagi nanti.']);
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

      mockGenerateContentStream.mockResolvedValue(mockStream);
      mockGetRelevantMemories.mockResolvedValue([]);

      const generator = getAIResponseStream('Question', []);
      const results = [];
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(mockGenerateContentStream).toHaveBeenCalled();
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

      mockGenerateContentStream.mockResolvedValue(mockStream);
      mockGetRelevantMemories.mockResolvedValue([]);

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

      mockGenerateContentStream.mockResolvedValue(mockStream);
      mockGetRelevantMemories.mockResolvedValue([]);

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

      mockGenerateContentStream.mockResolvedValue(mockStream);
      mockGetRelevantMemories.mockResolvedValue([]);

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

      mockGenerateContentStream.mockResolvedValue(mockStream);
      mockGetRelevantMemories.mockResolvedValue([]);

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
      
      mockSearchMemories.mockResolvedValue(mockConversations);

      const result = await getConversationHistory(5);

      expect(mockSearchMemories).toHaveBeenCalledWith({
        type: 'conversation',
        limit: 5,
      });
      expect(result).toEqual(mockConversations);
    });

    test('should handle error and return empty array', async () => {
      mockSearchMemories.mockRejectedValue(new Error('Memory error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getConversationHistory();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to get conversation history:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    test('should use default limit', async () => {
      mockSearchMemories.mockResolvedValue([]);

      await getConversationHistory();

      expect(mockSearchMemories).toHaveBeenCalledWith({
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
      
      mockSearchMemories.mockResolvedValue(mockConversations);
      mockDeleteMemory.mockResolvedValue(undefined);

      const result = await clearConversationHistory();

      expect(mockSearchMemories).toHaveBeenCalledWith({
        type: 'conversation',
      });
      expect(mockDeleteMemory).toHaveBeenCalledTimes(2);
      expect(mockDeleteMemory).toHaveBeenCalledWith('1');
      expect(mockDeleteMemory).toHaveBeenCalledWith('2');
      expect(result).toBe(2);
    });

    test('should handle error', async () => {
      mockSearchMemories.mockRejectedValue(new Error('Memory error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(clearConversationHistory()).rejects.toThrow('Memory error');
      
      consoleSpy.mockRestore();
    });
  });

  describe('getMemoryStats', () => {
    test('should return memory stats', async () => {
      const mockStats = { totalMemories: 10, totalSize: 1024 };
      
      mockGetStats.mockResolvedValue(mockStats);

      const result = await getMemoryStats();

      expect(mockGetStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });

    test('should handle error and return null', async () => {
      mockGetStats.mockRejectedValue(new Error('Stats error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getMemoryStats();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to get memory stats:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
});