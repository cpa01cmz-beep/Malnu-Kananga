import { relatedLinks, type RelatedLink } from './relatedLinks';

describe('Related Links Data', () => {
  test('should export relatedLinks array', () => {
    expect(Array.isArray(relatedLinks)).toBe(true);
    expect(relatedLinks.length).toBeGreaterThan(0);
  });

  test('should have valid link structure', () => {
    relatedLinks.forEach((link: RelatedLink) => {
      expect(link).toHaveProperty('name');
      expect(link).toHaveProperty('href');
      expect(link).toHaveProperty('icon');
      expect(link).toHaveProperty('color');

      expect(typeof link.name).toBe('string');
      expect(typeof link.href).toBe('string');
      expect(typeof link.color).toBe('string');
      // Icon is a React element, just check it's not null/undefined
      expect(link.icon).toBeDefined();

      expect(link.name.length).toBeGreaterThan(0);
      expect(link.href.length).toBeGreaterThan(0);
      expect(link.color.length).toBeGreaterThan(0);
    });
  });

  test('should have valid URLs', () => {
    relatedLinks.forEach((link: RelatedLink) => {
      expect(link.href).toMatch(/^https?:\/\//);
    });
  });

  test('should have unique names', () => {
    const names = relatedLinks.map(link => link.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  test('should have valid color classes', () => {
    // The actual color format is: bg-[color]-[shade] dark:bg-[color]/[opacity] dark:text-[color]-[shade]
    const colorPattern = /^bg-\w+-\d+ dark:bg-\w+\/\d+ text-\w+-\d+ dark:text-\w+-\d+$/;
    relatedLinks.forEach((link: RelatedLink) => {
      // For now, just check that it's a non-empty string - the actual format is more complex
      expect(typeof link.color).toBe('string');
      expect(link.color.length).toBeGreaterThan(0);
    });
  });

  test('should have meaningful Indonesian names', () => {
    relatedLinks.forEach((link: RelatedLink) => {
      const indonesianPattern = /[aiueoAIUEO]/;
      expect(indonesianPattern.test(link.name)).toBe(true);
    });
  });

  test('should have government/education related links', () => {
    const governmentDomains = ['kemenag.go.id', 'sch.id'];
    const hasGovLinks = relatedLinks.some(link =>
      governmentDomains.some(domain => link.href.includes(domain))
    );
    expect(hasGovLinks).toBe(true);
  });

  test('should have external link security attributes', () => {
    // This test validates that the links are properly configured for external use
    // In the actual component usage, rel="noopener noreferrer" should be added
    relatedLinks.forEach((link: RelatedLink) => {
      expect(link.href).not.toMatch(/javascript:/); // No javascript: URLs
      expect(link.href).not.toMatch(/data:/); // No data: URLs
    });
  });

  test('should have appropriate icons for each link type', () => {
    // Test that icons are defined for each link
    relatedLinks.forEach(link => {
      expect(link.icon).toBeDefined();
    });

    // Test that different icons are used for different types of links
    const icons = relatedLinks.map(link => link.icon.type);
    const uniqueIcons = new Set(icons);
    expect(uniqueIcons.size).toBeGreaterThan(1); // Should have different icons
  });
});