import { useEffect, useRef, useCallback } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  longPressDelay?: number;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export const useTouchGestures = (options: TouchGestureOptions) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<TouchPoint | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    minSwipeDistance = 50,
    maxSwipeTime = 300,
    longPressDelay = 500,
  } = options;

  const calculateDistance = useCallback((point1: TouchPoint, point2: TouchPoint) => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const calculateAngle = useCallback((point1: TouchPoint, point2: TouchPoint) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now,
    };

    // Set up long press detection
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        onLongPress();
        longPressTimerRef.current = null;
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const now = Date.now();
    const touchEnd: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: now,
    };

    const timeDiff = touchEnd.time - touchStartRef.current.time;
    const distance = calculateDistance(touchStartRef.current, touchEnd);

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Check for tap (quick touch with minimal movement)
    if (timeDiff < 200 && distance < 10 && onTap) {
      onTap();
      touchStartRef.current = null;
      return;
    }

    // Check for swipe gestures
    if (distance >= minSwipeDistance && timeDiff <= maxSwipeTime) {
      const angle = calculateAngle(touchStartRef.current, touchEnd);

      if (angle >= -45 && angle <= 45) {
        // Right swipe
        onSwipeRight?.();
      } else if (angle >= 135 || angle <= -135) {
        // Left swipe
        onSwipeLeft?.();
      } else if (angle > 45 && angle < 135) {
        // Down swipe
        onSwipeDown?.();
      } else if (angle < -45 && angle > -135) {
        // Up swipe
        onSwipeUp?.();
      }
    }

    touchStartRef.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, minSwipeDistance, maxSwipeTime, calculateDistance, calculateAngle]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Cancel long press if finger moves too much
    if (longPressTimerRef.current && touchStartRef.current) {
      const touch = e.touches[0];
      const distance = calculateDistance(touchStartRef.current, {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      });

      if (distance > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  }, [calculateDistance]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add passive event listeners for better performance
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', handleTouchMove);

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [handleTouchStart, handleTouchEnd, handleTouchMove]);

  return { ref: elementRef };
};