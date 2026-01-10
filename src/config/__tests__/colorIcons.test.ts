import { describe, it, expect } from 'vitest';
import { COLOR_ICONS, getColorIconClass, getColorIconLabel, type ColorIconKey } from '../colorIcons';

describe('colorIcons', () => {
  describe('COLOR_ICONS', () => {
    it('should export all expected color icons', () => {
      const expectedColors: ColorIconKey[] = [
        'sky', 'emerald', 'amber', 'indigo', 'blue', 'red',
        'green', 'purple', 'orange', 'pink', 'teal', 'cyan'
      ];

      expectedColors.forEach(color => {
        expect(COLOR_ICONS[color]).toBeDefined();
        expect(COLOR_ICONS[color].className).toMatch(/^bg-[a-z]+-\d+.*dark:bg-[a-z]+-\d+\/\d+.*text-[a-z]+-\d+.*dark:text-[a-z]+-\d+$/);
        expect(COLOR_ICONS[color].label).toBeDefined();
        expect(typeof COLOR_ICONS[color].label).toBe('string');
        expect(COLOR_ICONS[color].label).toBeTruthy();
      });
    });

    it('should have correct Tailwind classes for sky color', () => {
      expect(COLOR_ICONS.sky.className).toBe('bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400');
    });

    it('should have correct Tailwind classes for emerald color', () => {
      expect(COLOR_ICONS.emerald.className).toBe('bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400');
    });

    it('should have correct Tailwind classes for amber color', () => {
      expect(COLOR_ICONS.amber.className).toBe('bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400');
    });

    it('should have correct Tailwind classes for indigo color', () => {
      expect(COLOR_ICONS.indigo.className).toBe('bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400');
    });

    it('should have Indonesian labels', () => {
      expect(COLOR_ICONS.sky.label).toBe('Ikon Biru Langit');
      expect(COLOR_ICONS.emerald.label).toBe('Ikon Hijau Zamrud');
      expect(COLOR_ICONS.amber.label).toBe('Ikon Kuning Kehijauan');
      expect(COLOR_ICONS.indigo.label).toBe('Ikon Biru Nilam');
    });
  });

  describe('getColorIconClass', () => {
    it('should return correct class for valid color key', () => {
      expect(getColorIconClass('sky')).toBe(COLOR_ICONS.sky.className);
      expect(getColorIconClass('emerald')).toBe(COLOR_ICONS.emerald.className);
      expect(getColorIconClass('amber')).toBe(COLOR_ICONS.amber.className);
      expect(getColorIconClass('indigo')).toBe(COLOR_ICONS.indigo.className);
    });

    it('should return blue class as fallback for invalid color key', () => {
      expect(getColorIconClass('invalid' as any)).toBe(COLOR_ICONS.blue.className);
      expect(getColorIconClass('')).toBe(COLOR_ICONS.blue.className);
      expect(getColorIconClass('random' as any)).toBe(COLOR_ICONS.blue.className);
    });
  });

  describe('getColorIconLabel', () => {
    it('should return correct label for valid color key', () => {
      expect(getColorIconLabel('sky')).toBe(COLOR_ICONS.sky.label);
      expect(getColorIconLabel('emerald')).toBe(COLOR_ICONS.emerald.label);
      expect(getColorIconLabel('amber')).toBe(COLOR_ICONS.amber.label);
      expect(getColorIconLabel('indigo')).toBe(COLOR_ICONS.indigo.label);
    });

    it('should return blue label as fallback for invalid color key', () => {
      expect(getColorIconLabel('invalid' as any)).toBe(COLOR_ICONS.blue.label);
      expect(getColorIconLabel('')).toBe(COLOR_ICONS.blue.label);
      expect(getColorIconLabel('random' as any)).toBe(COLOR_ICONS.blue.label);
    });
  });

  describe('accessibility', () => {
    it('should have text contrast compliant classes (light bg, dark text for light mode)', () => {
      Object.values(COLOR_ICONS).forEach(config => {
        const classes = config.className.split(' ');
        
        const lightBgClass = classes.find(c => c.startsWith('bg-') && c.includes('-100') && !c.includes('dark:'));
        const lightTextClass = classes.find(c => c.startsWith('text-') && c.includes('-600') && !c.includes('dark:'));
        
        expect(lightBgClass).toBeDefined();
        expect(lightTextClass).toBeDefined();
      });
    });

    it('should have text contrast compliant classes (dark bg, light text for dark mode)', () => {
      Object.values(COLOR_ICONS).forEach(config => {
        const classes = config.className.split(' ');
        
        const darkBgClass = classes.find(c => c.startsWith('dark:bg-') && c.includes('-900'));
        const darkTextClass = classes.find(c => c.startsWith('dark:text-') && c.includes('-400'));
        
        expect(darkBgClass).toBeDefined();
        expect(darkTextClass).toBeDefined();
      });
    });
  });

  describe('TypeScript types', () => {
    it('should have correct type for ColorIconKey', () => {
      const validKeys: ColorIconKey[] = ['sky', 'emerald', 'amber', 'indigo', 'blue', 'red', 'green', 'purple', 'orange', 'pink', 'teal', 'cyan'];
      
      validKeys.forEach(key => {
        expect(COLOR_ICONS[key]).toBeDefined();
      });
    });
  });
});
