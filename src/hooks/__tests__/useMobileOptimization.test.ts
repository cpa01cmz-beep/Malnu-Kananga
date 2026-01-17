import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useMobileOptimization,
  useHapticFeedback,
  useTouchTarget,
  usePreventDoubleTap,
  useDebounce,
  useThrottle,
  useMobileMetrics,
  useOrientation,
} from '../useMobileOptimization';
import { getMobileOptimization } from '../../utils/mobileOptimization';

describe('useMobileOptimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.innerWidth = 1024;
    window.innerHeight = 768;
    Object.defineProperty(window, 'ontouchstart', { value: true });
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.skip('should return mobile state', () => {
    const { result } = renderHook(() => useMobileOptimization());
    
    expect(result.current.isTouchDevice).toBe(true);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isSmallScreen).toBe(false);
    expect(result.current.isMediumScreen).toBe(true);
    expect(result.current.isLargeScreen).toBe(false);
    expect(result.current.screenWidth).toBe(1024);
    expect(result.current.screenHeight).toBe(768);
  });

  it('should update state on resize', () => {
    const { result } = renderHook(() => useMobileOptimization());
    
    act(() => {
      window.innerWidth = 375;
      window.innerHeight = 667;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.screenWidth).toBe(375);
    expect(result.current.screenHeight).toBe(667);
    expect(result.current.isSmallScreen).toBe(true);
    expect(result.current.isMediumScreen).toBe(false);
  });

  it('should update orientation on orientation change', () => {
    const { result } = renderHook(() => useMobileOptimization());
    
    act(() => {
      window.innerWidth = 667;
      window.innerHeight = 375;
      window.dispatchEvent(new Event('orientationchange'));
    });

    expect(result.current.isPortrait).toBe(false);
  });

  it.skip('should update viewport height on keyboard change', () => {
    const { result } = renderHook(() => useMobileOptimization());
    
    act(() => {
      window.innerHeight = 300;
      window.screen = { height: 768 } as Screen;
      if ('visualViewport' in window) {
        (window as Window & { visualViewport: { dispatchEvent: (event: Event) => void } }).visualViewport.dispatchEvent(new Event('resize'));
      }
    });

    expect(result.current.isKeyboardVisible).toBe(true);
  });

  it('should apply custom optimization options', () => {
    renderHook(() => useMobileOptimization({
      enableHapticFeedback: false,
      touchTargetSize: 50,
      debounceDelay: 200,
      throttleDelay: 150,
    }));

    const options = getMobileOptimization();

    expect(options.enableHapticFeedback).toBe(false);
    expect(options.touchTargetSize).toBe(50);
    
    expect(options.enableHapticFeedback).toBe(false);
    expect(options.touchTargetSize).toBe(50);
    expect(options.debounceDelay).toBe(200);
    expect(options.throttleDelay).toBe(150);
  });
});

describe('useHapticFeedback', () => {
  it.skip('should trigger haptic feedback', () => {
    const mockVibrate = vi.fn().mockReturnValue(true);
    Object.defineProperty(window.navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useHapticFeedback());
    
    act(() => {
      result.current('tap');
    });

    expect(mockVibrate).toHaveBeenCalledWith(5);
  });

  it.skip('should trigger success feedback', () => {
    const mockVibrate = vi.fn().mockReturnValue(true);
    Object.defineProperty(window.navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useHapticFeedback());
    
    act(() => {
      result.current('success');
    });

    expect(mockVibrate).toHaveBeenCalledWith([10, 30, 10]);
  });

  it.skip('should trigger error feedback', () => {
    const mockVibrate = vi.fn().mockReturnValue(true);
    Object.defineProperty(window.navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useHapticFeedback());
    
    act(() => {
      result.current('error');
    });

    expect(mockVibrate).toHaveBeenCalledWith([50, 50, 50]);
  });

  it.skip('should trigger warning feedback', () => {
    const mockVibrate = vi.fn().mockReturnValue(true);
    Object.defineProperty(window.navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useHapticFeedback());
    
    act(() => {
      result.current('warning');
    });

    expect(mockVibrate).toHaveBeenCalledWith([20, 30]);
  });
});

describe('useTouchTarget', () => {
  it.skip('should optimize touch target size', () => {
    const element = document.createElement('button');
    element.style.width = '30px';
    element.style.height = '30px';
    document.body.appendChild(element);

    const ref = { current: element };
    renderHook(() => useTouchTarget(ref));

    const rect = element.getBoundingClientRect();
    expect(rect.width).toBeGreaterThanOrEqual(44);
    expect(rect.height).toBeGreaterThanOrEqual(44);

    document.body.removeChild(element);
  });

  it.skip('should use custom min size', () => {
    const element = document.createElement('button');
    element.style.width = '30px';
    element.style.height = '30px';
    document.body.appendChild(element);

    const ref = { current: element };
    renderHook(() => useTouchTarget(ref, 50));

    const rect = element.getBoundingClientRect();
    expect(rect.width).toBeGreaterThanOrEqual(50);
    expect(rect.height).toBeGreaterThanOrEqual(50);

    document.body.removeChild(element);
  });
});

describe('usePreventDoubleTap', () => {
  it('should prevent double tap execution', () => {
    const element = document.createElement('button');
    const callbackMock = vi.fn();
    document.body.appendChild(element);

    const ref = { current: element };
    renderHook(() => usePreventDoubleTap(ref, callbackMock));

    const touchEvent = new TouchEvent('touchend', {
      touches: [],
      changedTouches: [new Touch({ identifier: 1, target: element })],
    });

    element.dispatchEvent(touchEvent);
    element.dispatchEvent(touchEvent);

    expect(callbackMock).toHaveBeenCalledTimes(1);

    document.body.removeChild(element);
  });
});

describe('useDebounce', () => {
  vi.useFakeTimers();

  it.skip('should debounce function', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useDebounce(mockFn, 100));

    result.current();
    result.current();
    result.current();

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  vi.useRealTimers();
});

describe('useThrottle', () => {
  vi.useFakeTimers();

  it.skip('should throttle function', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottle(mockFn, 100));

    result.current();
    expect(mockFn).toHaveBeenCalledTimes(1);

    result.current();
    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    result.current();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  vi.useRealTimers();
});

describe('useMobileMetrics', () => {
  beforeEach(() => {
    window.innerWidth = 375;
    window.innerHeight = 667;
    window.devicePixelRatio = 2;
    Object.defineProperty(window, 'ontouchstart', { value: true });
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    });
  });

  it('should return mobile metrics', () => {
    const { result } = renderHook(() => useMobileMetrics());

    expect(result.current.isTouchDevice).toBe(true);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isSmallScreen).toBe(true);
    expect(result.current.screenWidth).toBe(375);
    expect(result.current.screenHeight).toBe(667);
    expect(result.current.pixelRatio).toBe(2);
  });

  it('should update metrics on resize', () => {
    const { result } = renderHook(() => useMobileMetrics());

    act(() => {
      window.innerWidth = 1024;
      window.innerHeight = 768;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.screenWidth).toBe(1024);
    expect(result.current.screenHeight).toBe(768);
    expect(result.current.isSmallScreen).toBe(false);
    expect(result.current.isLargeScreen).toBe(true);
  });

  it('should update metrics on orientation change', () => {
    const { result } = renderHook(() => useMobileMetrics());

    act(() => {
      window.innerWidth = 667;
      window.innerHeight = 375;
      window.dispatchEvent(new Event('orientationchange'));
    });

    expect(result.current.isPortrait).toBe(false);
  });
});

describe('useOrientation', () => {
  beforeEach(() => {
    window.innerWidth = 375;
    window.innerHeight = 667;
  });

  it('should return portrait orientation', () => {
    const { result } = renderHook(() => useOrientation());

    expect(result.current).toBe('portrait');
  });

  it('should return landscape orientation', () => {
    window.innerWidth = 667;
    window.innerHeight = 375;

    const { result } = renderHook(() => useOrientation());

    act(() => {
      window.dispatchEvent(new Event('orientationchange'));
    });

    expect(result.current).toBe('landscape');
  });

  it.skip('should update orientation on orientation change', () => {
    const { result } = renderHook(() => useOrientation());

    expect(result.current).toBe('portrait');

    act(() => {
      window.innerWidth = 667;
      window.innerHeight = 375;
      window.dispatchEvent(new Event('orientationchange'));
    });

    expect(result.current).toBe('landscape');
  });
});
