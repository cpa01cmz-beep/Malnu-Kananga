import { hapticTap, hapticSuccess, hapticError, hapticWarning } from './hapticFeedback';

export interface TouchTargetConfig {
  minSize: number;
  padding: number;
}

export interface MobileOptimizationOptions {
  enableHapticFeedback?: boolean;
  touchTargetSize?: number;
  debounceDelay?: number;
  throttleDelay?: number;
}

const DEFAULT_TOUCH_TARGET_SIZE = 44;
const DEFAULT_DEBOUNCE_DELAY = 150;
const DEFAULT_THROTTLE_DELAY = 100;

const optimizationState = {
  enableHapticFeedback: true,
  touchTargetSize: DEFAULT_TOUCH_TARGET_SIZE,
  debounceDelay: DEFAULT_DEBOUNCE_DELAY,
  throttleDelay: DEFAULT_THROTTLE_DELAY,
};

export function setMobileOptimization(options: MobileOptimizationOptions): void {
  if (options.enableHapticFeedback !== undefined) {
    optimizationState.enableHapticFeedback = options.enableHapticFeedback;
  }
  if (options.touchTargetSize !== undefined) {
    optimizationState.touchTargetSize = options.touchTargetSize;
  }
  if (options.debounceDelay !== undefined) {
    optimizationState.debounceDelay = options.debounceDelay;
  }
  if (options.throttleDelay !== undefined) {
    optimizationState.throttleDelay = options.throttleDelay;
  }
}

export function getMobileOptimization(): Readonly<MobileOptimizationOptions> {
  return { ...optimizationState };
}

export function triggerHapticFeedback(type: 'tap' | 'success' | 'error' | 'warning'): void {
  if (!optimizationState.enableHapticFeedback) {
    return;
  }

  switch (type) {
    case 'tap':
      hapticTap();
      break;
    case 'success':
      hapticSuccess();
      break;
    case 'error':
      hapticError();
      break;
    case 'warning':
      hapticWarning();
      break;
  }
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
     
    // @ts-expect-error - msMaxTouchPoints is IE specific
    (navigator as Navigator & { msMaxTouchPoints?: number }).msMaxTouchPoints > 0
  );
}

export function isMobile(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent);
}

export function isPortrait(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.innerHeight > window.innerWidth;
}

export function isSmallScreen(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.innerWidth < 640;
}

export function isMediumScreen(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.innerWidth >= 640 && window.innerWidth < 1024;
}

export function isLargeScreen(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.innerWidth >= 1024;
}

export function getTouchTargetSize(): number {
  return optimizationState.touchTargetSize;
}

export function validateTouchTargetSize(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const minSize = optimizationState.touchTargetSize;

  return rect.width >= minSize && rect.height >= minSize;
}

export function optimizeTouchTarget(element: HTMLElement, minSize?: number): void {
  const targetSize = minSize ?? optimizationState.touchTargetSize;
  const rect = element.getBoundingClientRect();
  const currentPadding = parseFloat(getComputedStyle(element).padding) || 0;

  if (rect.width < targetSize || rect.height < targetSize) {
    const neededPadding = Math.ceil((targetSize - Math.min(rect.width, rect.height)) / 2);
    element.style.padding = `${Math.max(currentPadding, neededPadding)}px`;
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number = optimizationState.debounceDelay
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number = optimizationState.throttleDelay
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      window.setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function preventDoubleTap(element: HTMLElement, callback: () => void): void {
  let lastTapTime = 0;
  const DOUBLE_TAP_DELAY = 300;

  element.addEventListener('touchend', () => {
    const currentTime = Date.now();
    const timeSinceLastTap = currentTime - lastTapTime;

    if (timeSinceLastTap > DOUBLE_TAP_DELAY) {
      callback();
      lastTapTime = currentTime;
    }
  }, { passive: true });
}

export function getViewportHeight(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  const visualViewport = (window as Window & { visualViewport?: { height: number } }).visualViewport;
  return visualViewport ? visualViewport.height : window.innerHeight;
}

export function isKeyboardVisible(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const visualViewport = (window as Window & { visualViewport?: { height: number } }).visualViewport;
  const screenHeight = window.screen?.height ?? window.innerHeight;
  
  if (visualViewport) {
    return visualViewport.height < screenHeight * 0.75;
  }

  return false;
}

export function scrollToElement(element: HTMLElement, offset: number = 80): void {
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
}

export function getMobilePerformanceMetrics(): {
  isTouchDevice: boolean;
  isMobile: boolean;
  isPortrait: boolean;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
} {
  if (typeof window === 'undefined') {
    return {
      isTouchDevice: false,
      isMobile: false,
      isPortrait: true,
      isSmallScreen: false,
      isMediumScreen: false,
      isLargeScreen: false,
      screenWidth: 0,
      screenHeight: 0,
      pixelRatio: 1,
    };
  }

  return {
    isTouchDevice: isTouchDevice(),
    isMobile: isMobile(),
    isPortrait: isPortrait(),
    isSmallScreen: isSmallScreen(),
    isMediumScreen: isMediumScreen(),
    isLargeScreen: isLargeScreen(),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
  };
}

export const MOBILE_CONSTANTS = {
  DEFAULT_TOUCH_TARGET_SIZE,
  DEFAULT_DEBOUNCE_DELAY,
  DEFAULT_THROTTLE_DELAY,
  MIN_TOUCH_TARGET_SIZE: 44,
  DOUBLE_TAP_DELAY: 300,
  SWIPE_THRESHOLD: 50,
  LONG_PRESS_DELAY: 500,
  MOBILE_BREAKPOINT: 640,
  TABLET_BREAKPOINT: 1024,
} as const;
