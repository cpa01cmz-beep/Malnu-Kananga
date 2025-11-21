import { getAIResponseStream, getConversationHistory, clearConversationHistory, getMemoryStats } from './geminiService';
import { GoogleGenAI } from '@google/genai';

jest.mock('@google/genai');
jest.mock('../memory');
jest.mock('../utils/envValidation', () => ({
  API_KEY: 'test-api-key',
  WORKER_URL: 'https://test-worker.com'
}));

// Mock fetch
global.fetch = jest.fn();

describe('Gemini Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConversationHistory', () => {
    let mockMemoryBank: any;

    beforeEach(() => {
      const { MemoryBank } = require('../memory');
      mockMemoryBank = new MemoryBank();
      mockMemoryBank.searchMemories.mockResolvedValue([]);
    });

    test('should return conversation history', async () => {
      const result = await getConversationHistory(5);

      expect(mockMemoryBank.searchMemories).toHaveBeenCalledWith({
        type: 'conversation',
        limit: 5,
      });
    });

    test('should use default limit', async () => {
      await getConversationHistory();

      expect(mockMemoryBank.searchMemories).toHaveBeenCalledWith({
        type: 'conversation',
        limit: 10,
      });
    });

    test('should handle error and return empty array', async () => {
      mockMemoryBank.searchMemories.mockRejectedValue(new Error('Memory error'));

      const result = await getConversationHistory();

      expect(result).toEqual([]);
    });
  });

  describe('clearConversationHistory', () => {
    let mockMemoryBank: any;

    beforeEach(() => {
      const { MemoryBank } = require('../memory');
      mockMemoryBank = new MemoryBank();
      mockMemoryBank.searchMemories.mockResolvedValue([]);
      mockMemoryBank.deleteMemory.mockResolvedValue(undefined);
    });

    test('should delete all conversations and return count', async () => {
      const mockConversations = [
        { id: '1', content: 'Conversation 1', type: 'conversation' },
        { id: '2', content: 'Conversation 2', type: 'conversation' },
      ];
      
      mockMemoryBank.searchMemories.mockResolvedValue(mockConversations);

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
      mockMemoryBank.searchMemories.mockRejectedValue(new Error('Memory error'));

      await expect(clearConversationHistory()).rejects.toThrow('Memory error');
    });
  });

  describe('getMemoryStats', () => {
    let mockMemoryBank: any;

    beforeEach(() => {
      const { MemoryBank } = require('../memory');
      mockMemoryBank = new MemoryBank();
    });

    test('should return memory stats', async () => {
      const mockStats = { totalMemories: 10, totalSize: 1024 };
      mockMemoryBank.getStats.mockResolvedValue(mockStats);

      const result = await getMemoryStats();

      expect(mockMemoryBank.getStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });

    test('should handle error and return null', async () => {
      mockMemoryBank.getStats.mockRejectedValue(new Error('Stats error'));

      const result = await getMemoryStats();

      expect(result).toBeNull();
    });
  });
});