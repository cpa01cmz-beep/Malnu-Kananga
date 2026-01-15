import { useCallback, useRef, useEffect } from 'react';

export interface SwipeDirection {
  direction: 'up' | 'down' | 'left' | 'right';
  distance: number;
  duration: number;
}

export interface PinchState {
  scale: number;
  distance: number;
  centerX: number;
  centerY: number;
}

export interface TouchGesturesOptions {
  element: HTMLElement | null;
  onSwipe?: (direction: SwipeDirection) => void;
  onPinch?: (state: PinchState) => void;
  onTap?: (event: TouchEvent) => void;
  onLongPress?: (event: TouchEvent) => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  enableSwipe?: boolean;
  enablePinch?: boolean;
  enableTap?: boolean;
  enableLongPress?: boolean;
}

export interface TouchGesturesResult {
  isActive: boolean;
  reset: () => void;
}

const SWIPE_THRESHOLD_DEFAULT = 50;
const LONG_PRESS_DELAY_DEFAULT = 500;

export function useTouchGestures(options: TouchGesturesOptions): TouchGesturesResult {
  const {
    element,
    onSwipe,
    onPinch,
    onTap,
    onLongPress,
    swipeThreshold = SWIPE_THRESHOLD_DEFAULT,
    longPressDelay = LONG_PRESS_DELAY_DEFAULT,
    enableSwipe = true,
    enablePinch = true,
    enableTap = true,
    enableLongPress = true,
  } = options;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const isActiveRef = useRef(false);

  const reset = useCallback(() => {
    touchStartRef.current = null;
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    initialPinchDistanceRef.current = null;
    isActiveRef.current = false;
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!element) return;
    
    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    isActiveRef.current = true;

    if (enableLongPress && onLongPress) {
      longPressTimerRef.current = window.setTimeout(() => {
        onLongPress(event);
        reset();
      }, longPressDelay);
    }

    if (enablePinch && event.touches.length === 2 && onPinch) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      initialPinchDistanceRef.current = distance;
    }
  }, [element, enableLongPress, onLongPress, enablePinch, onPinch, longPressDelay, reset]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!touchStartRef.current) return;

    if (enableLongPress && longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (enablePinch && event.touches.length === 2 && onPinch && initialPinchDistanceRef.current !== null) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const scale = currentDistance / initialPinchDistanceRef.current;
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      onPinch({
        scale,
        distance: currentDistance,
        centerX,
        centerY,
      });
    }
  }, [enableLongPress, enablePinch, onPinch]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!touchStartRef.current || !element) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (enableSwipe && onSwipe && (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold)) {
      const direction: SwipeDirection['direction'] = 
        absDeltaX > absDeltaY
          ? deltaX > 0
            ? 'right'
            : 'left'
          : deltaY > 0
            ? 'down'
            : 'up';

      const distance = Math.hypot(deltaX, deltaY);

      onSwipe({
        direction,
        distance,
        duration: deltaTime,
      });
    } else if (enableTap && onTap && deltaTime < 300 && absDeltaX < 10 && absDeltaY < 10) {
      onTap(event);
    }

    reset();
  }, [element, enableSwipe, onSwipe, enableTap, onTap, swipeThreshold, reset]);

  useEffect(() => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', reset, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', reset);
      reset();
    };
  }, [element, handleTouchStart, handleTouchMove, handleTouchEnd, reset]);

  return {
    isActive: isActiveRef.current,
    reset,
  };
}
