import { describe, it, expect } from 'vitest';
import {
  SHADOWS,
  RADIUS,
  SURFACES,
  BORDERS,
  CONTAINERS,
  getShadow,
  getRadius,
  getSurface,
  getBorder,
  getContainer,
  type ShadowKey,
  type RadiusKey,
  type SurfaceKey,
  type BorderKey,
  type ContainerKey,
} from '../config/styling';

describe('Styling Configuration', () => {
  describe('SHADOWS', () => {
    it('should have all shadow tokens defined', () => {
      expect(SHADOWS.NONE).toBe('shadow-none');
      expect(SHADOWS.SM).toBe('shadow-sm');
      expect(SHADOWS.MD).toBe('shadow-md');
      expect(SHADOWS.LG).toBe('shadow-lg');
      expect(SHADOWS.XL).toBe('shadow-xl');
      expect(SHADOWS.INNER).toBe('shadow-inner');
      expect(SHADOWS.CARD).toBe('shadow-sm');
      expect(SHADOWS.CARD_HOVER).toBe('shadow-md');
      expect(SHADOWS.FLOAT).toBe('shadow-lg');
    });

    it('should have correct number of shadow tokens', () => {
      expect(Object.keys(SHADOWS).length).toBe(9);
    });
  });

  describe('RADIUS', () => {
    it('should have all radius tokens defined', () => {
      expect(RADIUS.NONE).toBe('rounded-none');
      expect(RADIUS.SM).toBe('rounded-sm');
      expect(RADIUS.MD).toBe('rounded-md');
      expect(RADIUS.LG).toBe('rounded-lg');
      expect(RADIUS.XL).toBe('rounded-xl');
      expect(RADIUS['2XL']).toBe('rounded-2xl');
      expect(RADIUS['3XL']).toBe('rounded-3xl');
      expect(RADIUS.FULL).toBe('rounded-full');
      expect(RADIUS.TL).toBe('rounded-tl');
      expect(RADIUS.TR).toBe('rounded-tr');
      expect(RADIUS.BL).toBe('rounded-bl');
      expect(RADIUS.BR).toBe('rounded-br');
      expect(RADIUS.T).toBe('rounded-t');
      expect(RADIUS.B).toBe('rounded-b');
      expect(RADIUS.L).toBe('rounded-l');
      expect(RADIUS.R).toBe('rounded-r');
    });

    it('should have correct number of radius tokens', () => {
      expect(Object.keys(RADIUS).length).toBe(15);
    });
  });

  describe('SURFACES', () => {
    it('should have all surface tokens defined', () => {
      expect(SURFACES.DEFAULT).toBe('bg-white dark:bg-neutral-800');
      expect(SURFACES.CARD).toBe('bg-white dark:bg-neutral-800');
      expect(SURFACES.MODAL).toBe('bg-white dark:bg-neutral-800');
      expect(SURFACES.DROPDOWN).toBe('bg-white dark:bg-neutral-800');
      expect(SURFACES.INPUT).toBe('bg-white dark:bg-neutral-800');
    });

    it('should include dark mode support', () => {
      Object.values(SURFACES).forEach((surface) => {
        expect(surface).toContain('dark:');
      });
    });

    it('should have correct number of surface tokens', () => {
      expect(Object.keys(SURFACES).length).toBe(5);
    });
  });

  describe('BORDERS', () => {
    it('should have all border tokens defined', () => {
      expect(BORDERS.DEFAULT).toBe('border border-neutral-200 dark:border-neutral-700');
      expect(BORDERS.CARD).toBe('border border-neutral-200 dark:border-neutral-700');
      expect(BORDERS.MODAL).toBe('border border-neutral-200 dark:border-neutral-700');
      expect(BORDERS.INPUT).toBe('border border-neutral-200 dark:border-neutral-700');
      expect(BORDERS.LIGHT).toBe('border-neutral-200 dark:border-neutral-700');
      expect(BORDERS.HEAVY).toBe('border-2 border-neutral-300 dark:border-neutral-600');
    });

    it('should include dark mode support', () => {
      Object.values(BORDERS).forEach((border) => {
        expect(border).toContain('dark:');
      });
    });

    it('should have correct number of border tokens', () => {
      expect(Object.keys(BORDERS).length).toBe(6);
    });
  });

  describe('CONTAINERS', () => {
    it('should have all container tokens defined', () => {
      expect(CONTAINERS.CARD).toBe('bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700');
      expect(CONTAINERS.CARD_XL).toBe('bg-white dark:bg-neutral-800 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700');
      expect(CONTAINERS.CARD_LG).toBe('bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700');
      expect(CONTAINERS.CARD_MD).toBe('bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-700');
      expect(CONTAINERS.CARD_SM).toBe('bg-white dark:bg-neutral-800 rounded-md shadow-sm border border-neutral-100 dark:border-neutral-700');
      expect(CONTAINERS.CARD_GRADIENT).toBe('rounded-2xl p-6 text-white shadow-lg');
      expect(CONTAINERS.CARD_GRADIENT_LG).toBe('rounded-xl p-6 text-white shadow-card transition-all duration-200 ease-out');
    });

    it('should include dark mode support for containers with backgrounds', () => {
      expect(CONTAINERS.CARD).toContain('dark:');
      expect(CONTAINERS.CARD_XL).toContain('dark:');
      expect(CONTAINERS.CARD_LG).toContain('dark:');
      expect(CONTAINERS.CARD_MD).toContain('dark:');
      expect(CONTAINERS.CARD_SM).toContain('dark:');
    });

    it('should have correct number of container tokens', () => {
      expect(Object.keys(CONTAINERS).length).toBe(6);
    });
  });

  describe('getShadow', () => {
    it('should return correct shadow class', () => {
      expect(getShadow('CARD')).toBe(SHADOWS.CARD);
      expect(getShadow('CARD_HOVER')).toBe(SHADOWS.CARD_HOVER);
      expect(getShadow('FLOAT')).toBe(SHADOWS.FLOAT);
    });

    it('should be type-safe with ShadowKey type', () => {
      const key: ShadowKey = 'CARD';
      const result = getShadow(key);
      expect(typeof result).toBe('string');
    });
  });

  describe('getRadius', () => {
    it('should return correct radius class', () => {
      expect(getRadius('XL')).toBe(RADIUS.XL);
      expect(getRadius('2XL')).toBe(RADIUS['2XL']);
      expect(getRadius('FULL')).toBe(RADIUS.FULL);
    });

    it('should be type-safe with RadiusKey type', () => {
      const key: RadiusKey = 'XL';
      const result = getRadius(key);
      expect(typeof result).toBe('string');
    });
  });

  describe('getSurface', () => {
    it('should return correct surface class', () => {
      expect(getSurface('CARD')).toBe(SURFACES.CARD);
      expect(getSurface('MODAL')).toBe(SURFACES.MODAL);
    });

    it('should include dark mode support', () => {
      const surface = getSurface('CARD');
      expect(surface).toContain('dark:');
    });

    it('should be type-safe with SurfaceKey type', () => {
      const key: SurfaceKey = 'CARD';
      const result = getSurface(key);
      expect(typeof result).toBe('string');
    });
  });

  describe('getBorder', () => {
    it('should return correct border class', () => {
      expect(getBorder('DEFAULT')).toBe(BORDERS.DEFAULT);
      expect(getBorder('HEAVY')).toBe(BORDERS.HEAVY);
    });

    it('should include dark mode support', () => {
      const border = getBorder('CARD');
      expect(border).toContain('dark:');
    });

    it('should be type-safe with BorderKey type', () => {
      const key: BorderKey = 'CARD';
      const result = getBorder(key);
      expect(typeof result).toBe('string');
    });
  });

  describe('getContainer', () => {
    it('should return correct container class', () => {
      expect(getContainer('CARD')).toBe(CONTAINERS.CARD);
      expect(getContainer('CARD_XL')).toBe(CONTAINERS.CARD_XL);
    });

    it('should include all required classes for card container', () => {
      const container = getContainer('CARD');
      expect(container).toContain('bg-white');
      expect(container).toContain('dark:bg-neutral-800');
      expect(container).toContain('rounded-2xl');
      expect(container).toContain('shadow-sm');
      expect(container).toContain('border');
      expect(container).toContain('border-neutral-200');
      expect(container).toContain('dark:border-neutral-700');
    });

    it('should be type-safe with ContainerKey type', () => {
      const key: ContainerKey = 'CARD';
      const result = getContainer(key);
      expect(typeof result).toBe('string');
    });
  });

  describe('Type Safety', () => {
    it('should prevent invalid shadow keys', () => {
      expect(() => {
        const key: ShadowKey = 'INVALID';
      }).toThrow();
    });

    it('should prevent invalid radius keys', () => {
      expect(() => {
        const key: RadiusKey = 'INVALID';
      }).toThrow();
    });
  });

  describe('Design System Consistency', () => {
    it('should have consistent shadow mapping for cards', () => {
      expect(SHADOWS.CARD).toBe(SHADOWS.SM);
      expect(SHADOWS.CARD_HOVER).toBe(SHADOWS.MD);
      expect(SHADOWS.FLOAT).toBe(SHADOWS.LG);
    });

    it('should have consistent surface colors', () => {
      const surfaces = [SURFACES.CARD, SURFACES.MODAL, SURFACES.DROPDOWN, SURFACES.INPUT];
      surfaces.forEach((surface) => {
        expect(surface).toBe(SURFACES.DEFAULT);
      });
    });

    it('should have consistent border styles for containers', () => {
      const borders = [BORDERS.CARD, BORDERS.MODAL, BORDERS.INPUT];
      borders.forEach((border) => {
        expect(border).toBe(BORDERS.DEFAULT);
      });
    });
  });
});
