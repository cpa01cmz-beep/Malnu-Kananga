import { describe, it, expect, vi } from 'vitest';
import {
  hapticFeedback,
  hapticPattern,
  hapticSuccess,
  hapticError,
  hapticWarning,
  hapticTap,
  hapticLongPress,
  isHapticSupported,
  hapticSwipe,
  hapticScaleUp,
  hapticScaleDown,
  hapticConstants,
} from '../hapticFeedback';

describe('hapticFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('hapticFeedback', () => {
    it('should return false when haptic is not supported', () => {
      const mockVibrate = undefined;
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticFeedback({ style: 'medium' });
      expect(result).toBe(false);
    });

    it('should trigger light haptic feedback', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticFeedback({ style: 'light' });
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(10);
    });

    it('should trigger medium haptic feedback', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticFeedback({ style: 'medium' });
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(20);
    });

    it('should trigger heavy haptic feedback', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticFeedback({ style: 'heavy' });
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(30);
    });

    it('should trigger custom duration', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticFeedback({ duration: 100 });
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(100);
    });
  });

  describe('hapticPattern', () => {
    it('should return false when haptic is not supported', () => {
      const mockVibrate = undefined;
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticPattern([10, 20, 30]);
      expect(result).toBe(false);
    });

    it('should trigger custom pattern', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticPattern([10, 20, 30]);
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith([10, 20, 30]);
    });
  });

  describe('hapticSuccess', () => {
    it('should trigger success pattern', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticSuccess();
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(hapticConstants.SUCCESS);
    });
  });

  describe('hapticError', () => {
    it('should trigger error pattern', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticError();
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(hapticConstants.ERROR);
    });
  });

  describe('hapticWarning', () => {
    it('should trigger warning pattern', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticWarning();
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(hapticConstants.WARNING);
    });
  });

  describe('hapticTap', () => {
    it('should trigger tap haptic', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticTap();
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(hapticConstants.LIGHT);
    });
  });

  describe('hapticLongPress', () => {
    it('should trigger long press haptic', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticLongPress();
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(hapticConstants.HEAVY);
    });
  });

  describe('isHapticSupported', () => {
    it('should return true when haptic is supported', () => {
      const mockVibrate = vi.fn();
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      expect(isHapticSupported()).toBe(true);
    });

    it('should return false when haptic is not supported', () => {
      const mockVibrate = undefined;
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      expect(isHapticSupported()).toBe(false);
    });
  });

  describe('hapticSwipe', () => {
    it('should trigger left swipe haptic', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticSwipe('left');
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(hapticConstants.SWIPE);
    });

    it('should trigger right swipe haptic', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticSwipe('right');
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(hapticConstants.SWIPE);
    });

    it('should trigger up swipe haptic', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticSwipe('up');
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith([10, 10, 10]);
    });

    it('should trigger down swipe haptic', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticSwipe('down');
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith([10, 10, 10]);
    });
  });

  describe('hapticScaleUp', () => {
    it('should trigger scale up haptic', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticScaleUp();
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(hapticConstants.SCALE_UP);
    });
  });

  describe('hapticScaleDown', () => {
    it('should trigger scale down haptic', () => {
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(window.navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      const result = hapticScaleDown();
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(hapticConstants.SCALE_DOWN);
    });
  });

  describe('hapticConstants', () => {
    it('should have all required constants', () => {
      expect(hapticConstants.LIGHT).toBe(10);
      expect(hapticConstants.MEDIUM).toBe(20);
      expect(hapticConstants.HEAVY).toBe(30);
      expect(hapticConstants.TAP).toBe(5);
      expect(hapticConstants.SUCCESS).toEqual([10, 30, 10]);
      expect(hapticConstants.ERROR).toEqual([50, 50, 50]);
      expect(hapticConstants.WARNING).toEqual([20, 30]);
      expect(hapticConstants.SWIPE).toEqual([5, 5, 5, 5, 5]);
      expect(hapticConstants.SCALE_UP).toEqual([5, 10, 15]);
      expect(hapticConstants.SCALE_DOWN).toEqual([15, 10, 5]);
    });
  });
});
