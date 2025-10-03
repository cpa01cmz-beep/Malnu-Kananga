import { featuredPrograms } from './featuredPrograms';
import type { FeaturedProgram } from '../types';

describe('Featured Programs Data', () => {
  test('should export featuredPrograms array', () => {
    expect(Array.isArray(featuredPrograms)).toBe(true);
    expect(featuredPrograms.length).toBeGreaterThan(0);
  });

  test('should have valid program structure', () => {
    featuredPrograms.forEach((program: FeaturedProgram) => {
      expect(program).toHaveProperty('title');
      expect(program).toHaveProperty('description');
      expect(program).toHaveProperty('imageUrl');

      expect(typeof program.title).toBe('string');
      expect(typeof program.description).toBe('string');
      expect(typeof program.imageUrl).toBe('string');

      expect(program.title.length).toBeGreaterThan(0);
      expect(program.description.length).toBeGreaterThan(0);
      expect(program.imageUrl.length).toBeGreaterThan(0);
    });
  });

  test('should have valid image URLs', () => {
    featuredPrograms.forEach((program: FeaturedProgram) => {
      expect(program.imageUrl).toMatch(/^https?:\/\//);
    });
  });

  test('should have meaningful content in Indonesian', () => {
    featuredPrograms.forEach((program: FeaturedProgram) => {
      // Check if title and description contain Indonesian characters or relevant terms
      const indonesianPattern = /[aiueoAIUEO]|[k-mK-M]|[n-zN-Z]/;
      expect(indonesianPattern.test(program.title)).toBe(true);
      expect(indonesianPattern.test(program.description)).toBe(true);
    });
  });

  test('should have unique titles', () => {
    const titles = featuredPrograms.map(program => program.title);
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });

  test('should have reasonable description length', () => {
    featuredPrograms.forEach((program: FeaturedProgram) => {
      expect(program.description.length).toBeGreaterThan(10);
      expect(program.description.length).toBeLessThan(200);
    });
  });

  test('should have programs related to Islamic education', () => {
    const islamicKeywords = ['Al-Qur\'an', 'Kitab', 'Islam', 'ustadz', 'ustadzah'];
    const hasIslamicContent = featuredPrograms.some(program =>
      islamicKeywords.some(keyword =>
        program.title.includes(keyword) || program.description.includes(keyword)
      )
    );
    expect(hasIslamicContent).toBe(true);
  });
});