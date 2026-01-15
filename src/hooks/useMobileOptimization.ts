import { useEffect, useState, useCallback } from 'react';
import {
  isTouchDevice,
  isMobile,
  isPortrait,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  getTouchTargetSize,
  setMobileOptimization,
  debounce,
  throttle,
  triggerHapticFeedback,
  getMobilePerformanceMetrics,
  getViewportHeight,
  isKeyboardVisible,
  scrollToElement,
  preventDoubleTap,
} from '../utils/mobileOptimization';
import type { MobileOptimizationOptions } from '../utils/mobileOptimization';

export interface MobileState {
  isTouchDevice: boolean;
  isMobile: boolean;
  isPortrait: boolean;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  viewportHeight: number;
  isKeyboardVisible: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
}

export function useMobileOptimization(options?: MobileOptimizationOptions): MobileState {
  const [state, setState] = useState<MobileState>(() => ({
    isTouchDevice: isTouchDevice(),
    isMobile: isMobile(),
    isPortrait: isPortrait(),
    isSmallScreen: isSmallScreen(),
    isMediumScreen: isMediumScreen(),
    isLargeScreen: isLargeScreen(),
    viewportHeight: getViewportHeight(),
    isKeyboardVisible: isKeyboardVisible(),
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
  }));

  useEffect(() => {
    if (options) {
      setMobileOptimization(options);
    }
  }, [options]);

  useEffect(() => {
    const handleResize = throttle(() => {
      setState({
        isTouchDevice: isTouchDevice(),
        isMobile: isMobile(),
        isPortrait: isPortrait(),
        isSmallScreen: isSmallScreen(),
        isMediumScreen: isMediumScreen(),
        isLargeScreen: isLargeScreen(),
        viewportHeight: getViewportHeight(),
        isKeyboardVisible: isKeyboardVisible(),
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        pixelRatio: window.devicePixelRatio || 1,
      });
    }, 100);

    const handleOrientationChange = debounce(() => {
      setState((prev) => ({
        ...prev,
        isPortrait: isPortrait(),
        isSmallScreen: isSmallScreen(),
        isMediumScreen: isMediumScreen(),
        isLargeScreen: isLargeScreen(),
        viewportHeight: getViewportHeight(),
        isKeyboardVisible: isKeyboardVisible(),
      }));
    }, 150);

    const handleKeyboardChange = debounce(() => {
      setState((prev) => ({
        ...prev,
        viewportHeight: getViewportHeight(),
        isKeyboardVisible: isKeyboardVisible(),
      }));
    }, 100);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    if ('visualViewport' in window) {
      (window as Window & { visualViewport: { addEventListener: (event: string, handler: () => void) => void } }).visualViewport.addEventListener('resize', handleKeyboardChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if ('visualViewport' in window) {
        (window as Window & { visualViewport: { removeEventListener: (event: string, handler: () => void) => void } }).visualViewport.removeEventListener('resize', handleKeyboardChange);
      }
    };
  }, []);

  return state;
}

export function useHapticFeedback() {
  const feedback = useCallback((type: 'tap' | 'success' | 'error' | 'warning') => {
    triggerHapticFeedback(type);
  }, []);

  return feedback;
}

export function useTouchTarget(elementRef: React.RefObject<HTMLElement>, minSize?: number) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const checkTouchTarget = () => {
      const currentMinSize = minSize ?? getTouchTargetSize();
      const rect = element.getBoundingClientRect();
      
      if (rect.width < currentMinSize || rect.height < currentMinSize) {
        const neededPadding = Math.ceil((currentMinSize - Math.min(rect.width, rect.height)) / 2);
        const currentPadding = parseFloat(getComputedStyle(element).padding) || 0;
        element.style.padding = `${Math.max(currentPadding, neededPadding)}px`;
      }
    };

    checkTouchTarget();
    window.addEventListener('resize', checkTouchTarget);
    
    return () => {
      window.removeEventListener('resize', checkTouchTarget);
    };
  }, [elementRef, minSize]);
}

export function usePreventDoubleTap(elementRef: React.RefObject<HTMLElement>, callback: () => void) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !callback) return;

    preventDoubleTap(element, callback);
  }, [elementRef, callback]);
}

export function useScrollToElement(elementRef: React.RefObject<HTMLElement>, offset?: number, trigger?: boolean | unknown[]) {
  useEffect(() => {
    if (trigger && elementRef.current) {
      scrollToElement(elementRef.current, offset);
    }
  }, [elementRef, offset, trigger]);
}

export function useDebounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay?: number
): T {
  return useCallback(debounce(func, delay), [func, delay]) as T;
}

export function useThrottle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit?: number
): T {
  return useCallback(throttle(func, limit), [func, limit]) as T;
}

export function useMobileMetrics() {
  const [metrics, setMetrics] = useState(() => getMobilePerformanceMetrics());

  useEffect(() => {
    const handleUpdate = throttle(() => {
      setMetrics(getMobilePerformanceMetrics());
    }, 100);

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('orientationchange', handleUpdate);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('orientationchange', handleUpdate);
    };
  }, []);

  return metrics;
}

export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() =>
    isPortrait() ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleChange = debounce(() => {
      setOrientation(isPortrait() ? 'portrait' : 'landscape');
    }, 150);

    window.addEventListener('orientationchange', handleChange);

    return () => {
      window.removeEventListener('orientationchange', handleChange);
    };
  }, []);

  return orientation;
}
