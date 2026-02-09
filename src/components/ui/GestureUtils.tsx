import React, { useRef, useState, useCallback, ReactNode } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefault?: boolean;
}

interface PinchHandlers {
  onPinchStart?: (scale: number) => void;
  onPinchMove?: (scale: number) => void;
  onPinchEnd?: (scale: number) => void;
  threshold?: number;
}

interface PullToRefreshHandlers {
  onPull?: (distance: number) => void;
  onRefresh?: () => void;
  threshold?: number;
  disabled?: boolean;
}

export const useSwipeGesture = (handlers: SwipeHandlers) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefault = true
  } = handlers;

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [preventDefault]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }
    const touch = e.touches[0];
    touchEndRef.current = { x: touch.clientX, y: touch.clientY };
  }, [preventDefault]);

  const handleTouchEnd = useCallback((_e: TouchEvent) => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (Math.max(absDeltaX, absDeltaY) > threshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

export const usePinchGesture = (handlers: PinchHandlers) => {
  const {
    onPinchStart,
    onPinchMove,
    onPinchEnd,
    threshold = 10
  } = handlers;

  const initialDistanceRef = useRef<number | null>(null);
  const currentScaleRef = useRef(1);

  const getDistance = (touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistanceRef.current = getDistance(e.touches);
      onPinchStart?.(1);
    }
  }, [onPinchStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && initialDistanceRef.current) {
      const currentDistance = getDistance(e.touches);
      const scale = currentDistance / initialDistanceRef.current;
      currentScaleRef.current = scale;
      
      if (Math.abs(1 - scale) > threshold / 100) {
        onPinchMove?.(scale);
      }
    }
  }, [onPinchMove, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (initialDistanceRef.current) {
      onPinchEnd?.(currentScaleRef.current);
      initialDistanceRef.current = null;
      currentScaleRef.current = 1;
    }
  }, [onPinchEnd]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

export const usePullToRefresh = (handlers: PullToRefreshHandlers) => {
  const {
    onPull,
    onRefresh,
    threshold = 80,
    disabled = false
  } = handlers;

  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const startYRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const touch = e.touches[0];
    startYRef.current = touch.clientY;
    
    // Only enable pull-to-refresh when at the top
    if (window.scrollY === 0) {
      setIsPulling(true);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!startYRef.current || !isPulling || disabled || isRefreshing) return;
    
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const distance = Math.max(0, currentY - startYRef.current);
    
    setPullDistance(distance);
    onPull?.(distance);
  }, [isPulling, disabled, isRefreshing, onPull]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling || disabled) return;
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      onRefresh?.();
      
      // Reset after refresh completes (this should be called by the refresh function)
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        setIsPulling(false);
      }, 2000);
    } else {
      // Reset without refreshing
      setPullDistance(0);
      setIsPulling(false);
    }
    
    startYRef.current = null;
  }, [isPulling, pullDistance, threshold, disabled, isRefreshing, onRefresh]);

  const resetRefresh = useCallback(() => {
    setIsRefreshing(false);
    setPullDistance(0);
    setIsPulling(false);
    startYRef.current = null;
  }, []);

  return {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    resetRefresh,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

// Haptic feedback simulation (visual)
export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    // Visual feedback as substitute for haptic feedback
    const body = document.body;
    
    // Create a temporary element for visual feedback
    const feedbackElement = document.createElement('div');
    feedbackElement.className = `haptic-${type} fixed inset-0 pointer-events-none z-50 bg-current opacity-5`;
    feedbackElement.style.animation = 'touch-feedback 0.1s ease-out';
    
    body.appendChild(feedbackElement);
    
    // Remove after animation
    setTimeout(() => {
      body.removeChild(feedbackElement);
    }, 100);

    // Try to use actual haptic feedback if available
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(30);
          break;
        case 'success':
          navigator.vibrate([10, 50, 10]);
          break;
        case 'warning':
          navigator.vibrate([20, 30, 20]);
          break;
        case 'error':
          navigator.vibrate([30, 20, 30, 20]);
          break;
      }
    }
  }, []);

  return { triggerHaptic };
};

// Touch-friendly swipeable component
interface SwipeableProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  threshold?: number;
  className?: string;
}

export const Swipeable: React.FC<SwipeableProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
  className = ''
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!startXRef.current || !isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const offset = currentX - startXRef.current;
    
    // Limit the swipe distance
    const maxOffset = rightAction ? -threshold : threshold;
    const limitedOffset = Math.max(maxOffset * -1, Math.min(maxOffset, offset));
    
    setSwipeOffset(limitedOffset);
  }, [isDragging, threshold, rightAction]);

  const handleTouchEnd = useCallback(() => {
    if (!startXRef.current) return;
    
    const absOffset = Math.abs(swipeOffset);
    
    if (absOffset > threshold * 0.5) {
      if (swipeOffset < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (swipeOffset > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
    
    // Reset position
    setSwipeOffset(0);
    setIsDragging(false);
    startXRef.current = null;
  }, [swipeOffset, threshold, onSwipeLeft, onSwipeRight]);

  return (
    <div className={`touch-swipeable relative overflow-hidden ${className}`}>
      {/* Left action (revealed when swiping right) */}
      {leftAction && (
        <div 
          className="absolute left-0 top-0 bottom-0 flex items-center px-4 bg-blue-500 text-white"
          style={{ 
            width: `${Math.min(Math.abs(swipeOffset), threshold)}px`,
            opacity: swipeOffset > 0 ? 1 : 0
          }}
        >
          {leftAction}
        </div>
      )}
      
      {/* Right action (revealed when swiping left) */}
      {rightAction && (
        <div 
          className="absolute right-0 top-0 bottom-0 flex items-center px-4 bg-red-500 text-white"
          style={{ 
            width: `${Math.min(Math.abs(swipeOffset), threshold)}px`,
            opacity: swipeOffset < 0 ? 1 : 0,
            right: swipeOffset < 0 ? 0 : 'auto',
            left: swipeOffset < 0 ? 'auto' : 0
          }}
        >
          {rightAction}
        </div>
      )}
      
      {/* Main content */}
      <div
        className="touch-swipeable-content touch-feedback"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default useSwipeGesture;