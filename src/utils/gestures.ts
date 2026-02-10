/**
 * Enhanced Gesture Recognition System
 * Provides sophisticated gesture detection for mobile interactions
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useHapticFeedback } from './hapticFeedback';

export interface SwipeGestureOptions {
  threshold?: number;
  restraint?: number;
  allowedTime?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export interface LongPressOptions {
  delay?: number;
  onLongPress?: () => void;
  onLongPressEnd?: () => void;
}

export interface PullToRefreshOptions {
  threshold?: number;
  onRefresh?: () => void | Promise<void>;
}

export interface SwipeToDeleteOptions {
  threshold?: number;
  onDelete?: () => void;
  actionWidth?: number;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
}

// Hook for swipe gestures
export const useSwipeGestures = (options: SwipeGestureOptions = {}) => {
  const {
    threshold = 100,
    restraint = 100,
    allowedTime = 300,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  } = options;

  const { onSwipe } = useHapticFeedback();
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    setIsSwiping(false);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return;
    
    const touch = e.touches[0];
    const distX = touch.clientX - touchStart.current.x;
    const distY = touch.clientY - touchStart.current.y;
    
    // Only consider it a swipe if moving more horizontally than vertically
    if (Math.abs(distX) > Math.abs(distY)) {
      setIsSwiping(true);
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return;

    const touch = e.changedTouches[0];
    const distX = touch.clientX - touchStart.current.x;
    const distY = touch.clientY - touchStart.current.y;
    const elapsedTime = Date.now() - touchStart.current.time;

    // Check if it's a valid swipe
    if (elapsedTime <= allowedTime) {
      if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
        // Horizontal swipe
        if (distX > 0 && onSwipeRight) {
          onSwipeRight();
          onSwipe();
        } else if (distX < 0 && onSwipeLeft) {
          onSwipeLeft();
          onSwipe();
        }
      } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
        // Vertical swipe
        if (distY > 0 && onSwipeDown) {
          onSwipeDown();
          onSwipe();
        } else if (distY < 0 && onSwipeUp) {
          onSwipeUp();
          onSwipe();
        }
      }
    }

    touchStart.current = null;
    setIsSwiping(false);
  }, [threshold, restraint, allowedTime, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipe]);

  return {
    touchProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    isSwiping,
  };
};

// Hook for long press gestures
export const useLongPress = (options: LongPressOptions = {}) => {
  const {
    delay = 500,
    onLongPress,
    onLongPressEnd,
  } = options;

  const { onLongPress: hapticLongPress } = useHapticFeedback();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const start = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      hapticLongPress();
      if (onLongPress) {
        onLongPress();
      }
    }, delay);
  }, [delay, onLongPress, hapticLongPress]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (isLongPressing && onLongPressEnd) {
      onLongPressEnd();
    }
    setIsLongPressing(false);
  }, [isLongPressing, onLongPressEnd]);

  const handleMouseDown = useCallback(() => {
    start();
  }, [start]);

  const handleMouseUp = useCallback(() => {
    clear();
  }, [clear]);

  const handleTouchStart = useCallback(() => {
    start();
  }, [start]);

  const handleTouchEnd = useCallback(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    pressProps: {
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseLeave: clear,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    },
    isLongPressing,
  };
};

// Hook for pull-to-refresh
export const usePullToRefresh = (options: PullToRefreshOptions = {}) => {
  const {
    threshold = 80,
    onRefresh,
  } = options;

  const { onPullToRefresh } = useHapticFeedback();
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(false);
      setPullDistance(0);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY.current === null || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    if (distance > 10) {
      setIsPulling(true);
      setPullDistance(Math.min(distance * 0.5, threshold * 1.5)); // Dampen the effect
      
      if (distance >= threshold && !isRefreshing) {
        onPullToRefresh();
      }
    }
  }, [threshold, isRefreshing, onPullToRefresh]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || !onRefresh) {
      setIsPulling(false);
      setPullDistance(0);
      startY.current = null;
      return;
    }

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
    startY.current = null;
  }, [isPulling, pullDistance, threshold, onRefresh, isRefreshing]);

  return {
    pullProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    isPulling,
    pullDistance,
    isRefreshing,
    pullProgress: Math.min(pullDistance / threshold, 1),
  };
};

// Hook for swipe-to-delete
export const useSwipeToDelete = (options: SwipeToDeleteOptions = {}) => {
  const {
    threshold = 100,
    onDelete,
    actionWidth = 80,
    actionLabel = 'Delete',
    actionIcon,
  } = options;

  const { onDelete: hapticDelete } = useHapticFeedback();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const startX = useRef<number | null>(null);
  const currentX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    isDragging.current = false;
    setDeleteProgress(0);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startX.current === null) return;

    currentX.current = e.touches[0].clientX;
    const deltaX = startX.current - currentX.current;
    
    if (Math.abs(deltaX) > 10) {
      isDragging.current = true;
    }

    if (isDragging.current && deltaX > 0) {
      const progress = Math.min(deltaX / threshold, 1);
      setDeleteProgress(progress);
      
      if (progress >= 1 && !isDeleting) {
        setIsDeleting(true);
        hapticDelete();
      }
    }
  }, [threshold, isDeleting, hapticDelete]);

  const handleTouchEnd = useCallback(() => {
    if (deleteProgress >= 1 && onDelete && isDeleting) {
      onDelete();
    }

    // Reset state
    setTimeout(() => {
      setDeleteProgress(0);
      setIsDeleting(false);
    }, 200);
    
    startX.current = null;
    currentX.current = null;
    isDragging.current = false;
  }, [deleteProgress, onDelete, isDeleting]);

  return {
    deleteProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    isDeleting,
    deleteProgress,
    actionWidth,
    actionLabel,
    actionIcon,
  };
};

export default {
  useSwipeGestures,
  useLongPress,
  usePullToRefresh,
  useSwipeToDelete,
};