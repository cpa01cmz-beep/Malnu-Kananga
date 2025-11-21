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

const mockMemoryBankInstance = {
  searchMemories: jest.fn(),
  deleteMemory: jest.fn(),
  getStats: jest.fn(),
  getRelevantMemories: jest.fn().mockResolvedValue([]),
  addMemory: jest.fn(),
};

jest.mock('../memory', () => ({
  MemoryBank: jest.fn(() => mockMemoryBankInstance),
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
    // Reset mock implementations
    mockMemoryBankInstance.searchMemories.mockResolvedValue([]);
    mockMemoryBankInstance.deleteMemory.mockResolvedValue(undefined);
    mockMemoryBankInstance.getStats.mockResolvedValue({ totalMemories: 0, totalSize: 0 });
    mockMemoryBankInstance.getRelevantMemories.mockResolvedValue([]);
    mockMemoryBankInstance.addMemory.mockResolvedValue('mock-id');
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

      mockMemoryBankInstance.getRelevantMemories.mockResolvedValue([]);

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

      mockMemoryBankInstance.getRelevantMemories.mockResolvedValue([]);

      const generator = getAIResponseStream('Hello', []);
      await expect(generator.next()).rejects.toThrow('API error');
    });
  });

  describe('getConversationHistory', () => {
    test('should return conversation history', async () => {
      const mockHistory = [
        { id: '1', content: 'Hello', type: 'conversation' },
        { id: '2', content: 'Hi there', type: 'conversation' }
      ];
      mockMemoryBankInstance.searchMemories.mockResolvedValue(mockHistory);

      const result = await getConversationHistory(5);

      expect(mockMemoryBankInstance.searchMemories).toHaveBeenCalledWith({
        type: 'conversation',
        limit: 5,
      });
      expect(result).toEqual(mockHistory);
    });

    test('should use default limit', async () => {
      const mockHistory = [
        { id: '1', content: 'Hello', type: 'conversation' }
      ];
      mockMemoryBankInstance.searchMemories.mockResolvedValue(mockHistory);

      await getConversationHistory();

      expect(mockMemoryBankInstance.searchMemories).toHaveBeenCalledWith({
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
      
      mockMemoryBankInstance.searchMemories.mockResolvedValue(mockConversations);
      mockMemoryBankInstance.deleteMemory.mockResolvedValue(undefined);

      const result = await clearConversationHistory();

      expect(mockMemoryBankInstance.searchMemories).toHaveBeenCalledWith({
        type: 'conversation',
      });
      expect(mockMemoryBankInstance.deleteMemory).toHaveBeenCalledTimes(2);
      expect(mockMemoryBankInstance.deleteMemory).toHaveBeenCalledWith('1');
      expect(mockMemoryBankInstance.deleteMemory).toHaveBeenCalledWith('2');
      expect(result).toBe(2);
    });

    test('should handle error', async () => {
      mockMemoryBankInstance.searchMemories.mockRejectedValue(new Error('Memory error'));

      await expect(clearConversationHistory()).rejects.toThrow('Memory error');
    });
  });

  describe('getMemoryStats', () => {
    test('should return memory stats', async () => {
      const mockStats = { totalMemories: 10, totalSize: 1024 };
      mockMemoryBankInstance.getStats.mockResolvedValue(mockStats);

      const result = await getMemoryStats();

      expect(mockMemoryBankInstance.getStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });

    test('should handle error and return null', async () => {
      mockMemoryBankInstance.getStats.mockRejectedValue(new Error('Stats error'));

      const result = await getMemoryStats();

      expect(result).toBeNull();
    });
  });
});