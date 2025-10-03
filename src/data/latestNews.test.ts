import { latestNews } from './latestNews';
import type { LatestNews } from '../types';

describe('Latest News Data', () => {
  test('should export latestNews array', () => {
    expect(Array.isArray(latestNews)).toBe(true);
    expect(latestNews.length).toBeGreaterThan(0);
  });

  test('should have valid news structure', () => {
    latestNews.forEach((news: LatestNews) => {
      expect(news).toHaveProperty('title');
      expect(news).toHaveProperty('date');
      expect(news).toHaveProperty('category');
      expect(news).toHaveProperty('imageUrl');

      expect(typeof news.title).toBe('string');
      expect(typeof news.date).toBe('string');
      expect(typeof news.category).toBe('string');
      expect(typeof news.imageUrl).toBe('string');

      expect(news.title.length).toBeGreaterThan(0);
      expect(news.date.length).toBeGreaterThan(0);
      expect(news.category.length).toBeGreaterThan(0);
      expect(news.imageUrl.length).toBeGreaterThan(0);
    });
  });

  test('should have valid image URLs', () => {
    latestNews.forEach((news: LatestNews) => {
      expect(news.imageUrl).toMatch(/^https?:\/\//);
    });
  });

  test('should have valid date format', () => {
    latestNews.forEach((news: LatestNews) => {
      // Indonesian date format: DD Month YYYY
      const datePattern = /^\d{1,2} \w+ \d{4}$/;
      expect(datePattern.test(news.date)).toBe(true);
    });
  });

  test('should have meaningful Indonesian titles', () => {
    latestNews.forEach((news: LatestNews) => {
      const indonesianPattern = /[aiueoAIUEO]/;
      expect(indonesianPattern.test(news.title)).toBe(true);
    });
  });

  test('should have unique titles', () => {
    const titles = latestNews.map(news => news.title);
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });

  test('should have reasonable title length', () => {
    latestNews.forEach((news: LatestNews) => {
      expect(news.title.length).toBeGreaterThan(10);
      expect(news.title.length).toBeLessThan(100);
    });
  });

  test('should have valid categories', () => {
    const validCategories = ['Prestasi', 'Sekolah', 'Kegiatan', 'Pengumuman', 'Berita'];
    latestNews.forEach((news: LatestNews) => {
      expect(validCategories).toContain(news.category);
    });
  });

  test('should have recent dates (2024)', () => {
    latestNews.forEach((news: LatestNews) => {
      expect(news.date).toContain('2024');
    });
  });
});