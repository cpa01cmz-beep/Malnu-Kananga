import { useState, useEffect, useRef, useCallback } from 'react';
import { BREAKPOINTS, UI_GESTURES } from '../constants';

export interface SwipeGestureOptions {
  threshold?: number;
  restraint?: number;
  allowedTime?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  longPressDelay?: number;
}

export interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export const useGestures = (options: SwipeGestureOptions = {}) => {
  const {
    threshold = UI_GESTURES.MIN_SWIPE_DISTANCE,
    restraint = UI_GESTURES.RESTRAINT,
    allowedTime = UI_GESTURES.ALLOWED_TIME,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    longPressDelay = UI_GESTURES.LONG_PRESS_DELAY,
  } = options;

  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null);
  const [touchEnd, setTouchEnd] = useState<TouchPoint | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const longPressTimerRef = useRef<number | null>(null);

  // Handle touch start
  const handleTouchStart = useCallback((e: globalThis.TouchEvent) => {
    const touch = e.touches[0];
    const point: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    
    setTouchStart(point);
    setTouchEnd(point);
    setIsSwiping(false);

    // Start long press timer
    if (onLongPress) {
      const timer = window.setTimeout(() => {
        onLongPress();
        longPressTimerRef.current = null;
      }, longPressDelay);
      longPressTimerRef.current = timer as unknown as number;
    }
  }, [onLongPress, longPressDelay]);

  // Handle touch move
  const handleTouchMove = useCallback((e: globalThis.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.touches[0];
    const point: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    
    setTouchEnd(point);

    // Cancel long press if moved
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current as unknown as number);
      longPressTimerRef.current = null;
    }

    // Check if movement is significant enough to be considered a swipe
    const deltaX = Math.abs(point.x - touchStart.x);
    const deltaY = Math.abs(point.y - touchStart.y);
    
    if (deltaX > 10 || deltaY > 10) {
      setIsSwiping(true);
    }
  }, [touchStart]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    // Clear long press timer
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current as unknown as number);
      longPressTimerRef.current = null;
    }

    const elapsedTime = Date.now() - touchStart.time;
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;

    // Check if it's a swipe
    if (elapsedTime <= allowedTime) {
      if (Math.abs(deltaX) >= threshold && Math.abs(deltaY) <= restraint) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else if (Math.abs(deltaY) >= threshold && Math.abs(deltaX) <= restraint) {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      } else if (!isSwiping && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        // Tap (if not swiping and minimal movement)
        onTap?.();
      }
    }

    // Reset state
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
  }, [touchStart, touchEnd, allowedTime, threshold, restraint, isSwiping, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    isSwiping,
  };
};

// Hook for mobile navigation with gestures
export const useMobileNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // Swipe left to close menu, swipe right to open
  const gestureOptions: SwipeGestureOptions = {
    threshold: 100,
    onSwipeRight: () => {
      if (!isMenuOpen) {
        setIsMenuOpen(true);
      }
    },
    onSwipeLeft: () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    },
  };

  const gestures = useGestures(gestureOptions);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const selectItem = useCallback((itemId: string) => {
    setActiveItem(itemId);
    closeMenu();
  }, [closeMenu]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen, closeMenu]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return {
    isMenuOpen,
    activeItem,
    toggleMenu,
    closeMenu,
    openMenu,
    selectItem,
    gestures,
  };
};

// Hook for pull-to-refresh functionality
export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef<number>(0);
  const isPullingRef = useRef(false);

  const handleTouchStart = useCallback((e: globalThis.TouchEvent) => {
    // Only allow pull-to-refresh at the top of the page
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: globalThis.TouchEvent) => {
    if (!isPullingRef.current) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0 && window.scrollY === 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, 120)); // Max pull distance of 120px
      
      if (distance > 80 && !isPulling) {
        setIsPulling(true);
      } else if (distance <= 80 && isPulling) {
        setIsPulling(false);
      }
    } else {
      isPullingRef.current = false;
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [isPulling]);

  const _handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current) return;

    isPullingRef.current = false;

    if (isPulling && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setIsPulling(false);
  }, [isPulling, isRefreshing, onRefresh]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', _handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', _handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, _handleTouchEnd]);

  return {
    isPulling,
    isRefreshing,
    pullDistance,
  };
};

// Hook for haptic feedback
export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [25],
        heavy: [50],
        success: [10, 50, 10],
        warning: [25, 25],
        error: [50, 25, 50],
      };
      
      navigator.vibrate(patterns[type]);
    }
  }, []);

  return { triggerHaptic };
};

// Hook for mobile scroll animations
export const useMobileScroll = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }
      
      setScrollY(currentScrollY);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    scrollDirection,
    scrollY,
    isScrollingDown: scrollDirection === 'down',
    isScrollingUp: scrollDirection === 'up',
  };
};

// Hook for responsive breakpoints
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.SM) setBreakpoint('sm');
      else if (width < BREAKPOINTS.MD) setBreakpoint('md');
      else if (width < BREAKPOINTS.LG) setBreakpoint('lg');
      else if (width < BREAKPOINTS.XL) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isSmallDesktop: breakpoint === 'lg',
    isLargeDesktop: breakpoint === 'xl' || breakpoint === '2xl',
  };
};

// Hook for safe area insets
export const useSafeArea = () => {
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateInsets = () => {
      setSafeAreaInsets({
        top: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-left)') || '0'),
      });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);
    return () => window.removeEventListener('resize', updateInsets);
  }, []);

  return safeAreaInsets;
};

export default useGestures;