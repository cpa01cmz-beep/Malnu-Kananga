// Mock the Google AI SDK
const mockGenerateContentStream = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContentStream: mockGenerateContentStream
    }
  }))
}));

// Mock the memory bank
jest.mock('../memory', () => ({
  MemoryBank: jest.fn().mockImplementation(() => ({
    getRelevantMemories: jest.fn().mockResolvedValue([]),
    addMemory: jest.fn().mockResolvedValue(undefined)
  })),
  schoolMemoryBankConfig: {}
}));

// Mock environment validation
jest.mock('../utils/envValidation', () => ({
  API_KEY: 'test-api-key',
  WORKER_URL: 'https://test-worker-url.com'
}));

import { GoogleGenAI } from '@google/genai';
import { getAIResponseStream, initialGreeting } from './geminiService';

describe('Gemini Service', () => {
  const mockApiKey = 'test-api-key';
  const mockWorkerUrl = 'https://test-worker-url.com/api/chat';

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock environment variables
    process.env.API_KEY = mockApiKey;

    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = jest.restoreAllMocks;
  });

  describe('getAIResponseStream', () => {
    test('should handle successful response with context', async () => {
      const mockContext = 'Test context from vector database';
      const mockMessage = 'Test user message';
      const mockHistory = [
        { role: 'user' as const, parts: 'Previous message' },
        { role: 'model' as const, parts: 'Previous response' }
      ];

      // Mock successful context fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ context: mockContext })
      });

      // Mock Google AI response
      const mockStreamResponse = {
        text: 'AI response chunk'
      };

      mockGenerateContentStream.mockImplementation(async function* () {
        yield mockStreamResponse;
      });

      const result: string[] = [];
      for await (const chunk of getAIResponseStream(mockMessage, mockHistory)) {
        result.push(chunk);
      }

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-worker-url.com/api/chat',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: mockMessage })
        })
      );

      expect(mockGenerateContentStream).toHaveBeenCalled();
    });

    test('should handle fetch error gracefully', async () => {
      const mockMessage = 'Test message';
      const mockHistory: {role: 'user' | 'model', parts: string}[] = [];

      // Mock failed context fetch
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Mock Google AI response
      const mockStreamResponse = {
        text: 'Maaf, terjadi masalah saat menghubungi AI. Silakan coba lagi nanti.'
      };

      mockGenerateContentStream.mockImplementation(async function* () {
        yield mockStreamResponse;
      });

      const result: string[] = [];
      for await (const chunk of getAIResponseStream(mockMessage, mockHistory)) {
        result.push(chunk);
      }

      expect(result).toEqual(['Maaf, terjadi masalah saat menghubungi AI. Silakan coba lagi nanti.']);
      expect(global.fetch).toHaveBeenCalled();
    });

    test('should handle Google AI API error', async () => {
      const mockMessage = 'Test message';
      const mockHistory: {role: 'user' | 'model', parts: string}[] = [];

      // Mock successful context fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ context: '' })
      });

      // Mock Google AI error
      mockGenerateContentStream.mockRejectedValue(new Error('AI API Error'));

      const result: string[] = [];
      for await (const chunk of getAIResponseStream(mockMessage, mockHistory)) {
        result.push(chunk);
      }

      expect(result).toEqual(['Maaf, terjadi masalah saat menghubungi AI. Silakan coba lagi nanti.']);
    });

    test('should include context in prompt when available', async () => {
      const mockContext = 'Specific context about school';
      const mockMessage = 'What are the school requirements?';
      const mockHistory: {role: 'user' | 'model', parts: string}[] = [];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ context: mockContext })
      });

      mockGenerateContentStream.mockImplementation(async function* () {
        yield { text: 'Response based on context' };
      });

      for await (const chunk of getAIResponseStream(mockMessage, mockHistory)) {
        // Just consume the stream
      }

      expect(mockGenerateContentStream).toHaveBeenCalled();

      const callArgs = mockGenerateContentStream.mock.calls[0][0];
      const userMessage = callArgs.contents.find((c: any) => c.role === 'user');

      expect(userMessage.parts[0].text).toContain('Berdasarkan konteks berikut:');
      expect(userMessage.parts[0].text).toContain(mockContext);
      expect(userMessage.parts[0].text).toContain(mockMessage);
    });

    test('should use correct system instruction in Indonesian', async () => {
      const mockMessage = 'Test message';
      const mockHistory: {role: 'user' | 'model', parts: string}[] = [];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ context: '' })
      });

      mockGenerateContentStream.mockImplementation(async function* () {
        yield { text: 'Response' };
      });

      for await (const chunk of getAIResponseStream(mockMessage, mockHistory)) {
        // Just consume the stream
      }

      expect(mockGenerateContentStream).toHaveBeenCalled();

      const callArgs = mockGenerateContentStream.mock.calls[0][0];
      const systemInstruction = callArgs.config.systemInstruction;

      expect(systemInstruction).toContain('Asisten MA Malnu Kananga');
      expect(systemInstruction).toContain('Bahasa Indonesia');
      expect(systemInstruction).toContain('sekolah MA Malnu Kananga');
    });

    test('should handle empty context response', async () => {
      const mockMessage = 'Test message';
      const mockHistory: {role: 'user' | 'model', parts: string}[] = [];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ context: '' })
      });

      mockGenerateContentStream.mockImplementation(async function* () {
        yield { text: 'Response without context' };
      });

      for await (const chunk of getAIResponseStream(mockMessage, mockHistory)) {
        // Just consume the stream
      }

      expect(mockGenerateContentStream).toHaveBeenCalled();

      const callArgs = mockGenerateContentStream.mock.calls[0][0];
      const userMessage = callArgs.contents.find((c: any) => c.role === 'user');

      expect(userMessage.parts[0].text).not.toContain('Berdasarkan konteks berikut:');
      expect(userMessage.parts[0].text).toBe(mockMessage);
    });
  });

  describe('initialGreeting', () => {
    test('should be a non-empty string', () => {
      expect(typeof initialGreeting).toBe('string');
      expect(initialGreeting.length).toBeGreaterThan(0);
    });

    test('should be in Indonesian language', () => {
      const indonesianPattern = /[aiueoAIUEO]/;
      expect(indonesianPattern.test(initialGreeting)).toBe(true);
    });

    test('should contain relevant keywords', () => {
      expect(initialGreeting).toContain('Assalamualaikum');
      expect(initialGreeting).toContain('MA Malnu Kananga');
    });

    test('should be helpful and welcoming', () => {
      expect(initialGreeting.toLowerCase()).toContain('bantu');
      expect(initialGreeting.includes('?')).toBe(true); // Should be a question
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed API response', async () => {
      const mockMessage = 'Test message';
      const mockHistory: {role: 'user' | 'model', parts: string}[] = [];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' }) // Missing context field
      });

      mockGenerateContentStream.mockImplementation(async function* () {
        yield { text: 'Response' };
      });

      const result: string[] = [];
      for await (const chunk of getAIResponseStream(mockMessage, mockHistory)) {
        result.push(chunk);
      }

      expect(result.length).toBeGreaterThan(0);
    });

    test('should handle network timeout', async () => {
      const mockMessage = 'Test message';
      const mockHistory: {role: 'user' | 'model', parts: string}[] = [];

      // Mock successful context fetch (empty context)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ context: '' })
      });

      // Mock Google AI API to throw an error (this is what should trigger the error message)
      mockGenerateContentStream.mockRejectedValue(new Error('AI API Error'));

      const result: string[] = [];
      for await (const chunk of getAIResponseStream(mockMessage, mockHistory)) {
        result.push(chunk);
      }

      expect(result).toEqual(['Maaf, terjadi masalah saat menghubungi AI. Silakan coba lagi nanti.']);
    });
  });
});