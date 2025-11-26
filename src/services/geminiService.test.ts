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
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

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
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ context: 'test context' })
    });
  });

  describe('getAIResponseStream', () => {
    test('should handle successful response with context', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ context: 'School context info' })
      });

      const mockStream = async function* () {
        yield { text: 'Hello' };
        yield { text: ' world' };
      };
      
      mockGenerateContentStream.mockReturnValue(mockStream);

      const stream = getAIResponseStream('Hello', []);
      const chunks = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hello', ' world']);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-worker.com/api/chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Hello' }),
        }
      );
    });

    test('should handle Google AI API error', async () => {
      mockGenerateContentStream.mockRejectedValue(new Error('API Error'));

      const stream = getAIResponseStream('Hello', []);
      
      await expect(async () => {
        for await (const chunk of stream) {
          // Should not reach here
        }
      }).rejects.toThrow('API Error');
    });

    test('should include context in prompt when available', async () => {
      const mockStream = async function* () {
        yield { text: 'Response with context' };
      };
      
      mockGenerateContentStream.mockReturnValue(mockStream);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ context: 'Relevant context' })
      });

      const stream = getAIResponseStream('Question', []);
      const chunks = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Response with context']);
      expect(mockFetch).toHaveBeenCalled();
    });

    test('should use correct system instruction in Indonesian', async () => {
      const mockStream = async function* () {
        yield { text: 'Indonesian response' };
      };
      
      mockGenerateContentStream.mockReturnValue(mockStream);

      const stream = getAIResponseStream('Halo', []);
      const chunks = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Indonesian response']);
    });

    test('should handle empty context response', async () => {
      const mockStream = async function* () {
        yield { text: 'No context response' };
      };
      
      mockGenerateContentStream.mockReturnValue(mockStream);
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'No context found' })
      });

      const stream = getAIResponseStream('Question', []);
      const chunks = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['No context response']);
    });
  });

  describe('initialGreeting', () => {
    test('should be a non-empty string', () => {
      expect(typeof initialGreeting).toBe('string');
      expect(initialGreeting.length).toBeGreaterThan(0);
    });

    test('should be in Indonesian language', () => {
      expect(initialGreeting).toContain('Assalamualaikum');
      expect(initialGreeting).toContain('Saya');
    });

    test('should contain relevant keywords', () => {
      expect(initialGreeting).toContain('Asisten AI');
      expect(initialGreeting).toContain('MA Malnu Kananga');
    });

    test('should be helpful and welcoming', () => {
      expect(initialGreeting).toContain('Ada yang bisa saya bantu');
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed API response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const mockStream = async function* () {
        yield { text: 'Response despite fetch error' };
      };
      
      mockGenerateContentStream.mockReturnValue(mockStream);

      const stream = getAIResponseStream('Test', []);
      const chunks = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Response despite fetch error']);
    });

    test('should handle network timeout', async () => {
      mockFetch.mockRejectedValue(new Error('Network timeout'));

      const mockStream = async function* () {
        yield { text: 'Response despite network error' };
      };
      
      mockGenerateContentStream.mockReturnValue(mockStream);

      const stream = getAIResponseStream('Test', []);
      const chunks = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Response despite network error']);
    });
  });

  describe('getConversationHistory', () => {
    test('should return conversation history', async () => {
      const mockConversations = [
        { id: '1', content: 'Conversation 1', type: 'conversation' },
        { id: '2', content: 'Conversation 2', type: 'conversation' },
      ];
      
      mockSearchMemories.mockResolvedValue(mockConversations);

      const result = await getConversationHistory(5);

      expect(mockSearchMemories).toHaveBeenCalledWith({
        type: 'conversation',
        limit: 5,
      });
      expect(result).toEqual(mockConversations);
    });

    test('should use default limit', async () => {
      const mockConversations = [
        { id: '1', content: 'Conversation 1', type: 'conversation' },
      ];
      
      mockSearchMemories.mockResolvedValue(mockConversations);

      await getConversationHistory();

      expect(mockSearchMemories).toHaveBeenCalledWith({
        type: 'conversation',
        limit: 10,
      });
    });

    test('should handle error and return empty array', async () => {
      mockSearchMemories.mockRejectedValue(new Error('Memory error'));
      
      const result = await getConversationHistory();

      expect(result).toEqual([]);
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

    test('should handle empty conversations array', async () => {
      mockSearchMemories.mockResolvedValue([]);

      const result = await clearConversationHistory();

      expect(result).toBe(0);
      expect(mockDeleteMemory).not.toHaveBeenCalled();
    });

    test('should handle null/undefined response from searchMemories', async () => {
      mockSearchMemories.mockResolvedValue(null);

      const result = await clearConversationHistory();

      expect(result).toBe(0);
      expect(mockDeleteMemory).not.toHaveBeenCalled();
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
      
      const result = await getMemoryStats();

      expect(result).toBeNull();
    });
  });
});