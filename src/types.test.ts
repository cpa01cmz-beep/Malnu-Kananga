import { Sender } from './types';
import type { ChatMessage, FeaturedProgram, LatestNews } from './types';

describe('Type Definitions', () => {
  describe('Sender Enum', () => {
    test('should have correct enum values', () => {
      expect(Sender.User).toBe('user');
      expect(Sender.AI).toBe('ai');
    });
  });

  describe('ChatMessage Interface', () => {
    test('should create valid ChatMessage object', () => {
      const message: ChatMessage = {
        id: '1',
        text: 'Test message',
        sender: Sender.User
      };

      expect(message.id).toBe('1');
      expect(message.text).toBe('Test message');
      expect(message.sender).toBe(Sender.User);
    });

    test('should handle AI messages', () => {
      const aiMessage: ChatMessage = {
        id: '2',
        text: 'AI response',
        sender: Sender.AI
      };

      expect(aiMessage.sender).toBe(Sender.AI);
    });
  });

  describe('FeaturedProgram Interface', () => {
    test('should create valid FeaturedProgram object', () => {
      const program: FeaturedProgram = {
        title: 'Test Program',
        description: 'Test description',
        imageUrl: 'https://example.com/image.jpg'
      };

      expect(program.title).toBe('Test Program');
      expect(program.description).toBe('Test description');
      expect(program.imageUrl).toBe('https://example.com/image.jpg');
    });

    test('should handle empty strings', () => {
      const program: FeaturedProgram = {
        title: '',
        description: '',
        imageUrl: ''
      };

      expect(program.title).toBe('');
      expect(program.description).toBe('');
      expect(program.imageUrl).toBe('');
    });
  });

  describe('LatestNews Interface', () => {
    test('should create valid LatestNews object', () => {
      const news: LatestNews = {
        title: 'Test News',
        date: '2024-01-01',
        category: 'Pengumuman',
        imageUrl: 'https://example.com/news.jpg'
      };

      expect(news.title).toBe('Test News');
      expect(news.date).toBe('2024-01-01');
      expect(news.category).toBe('Pengumuman');
      expect(news.imageUrl).toBe('https://example.com/news.jpg');
    });
  });
});