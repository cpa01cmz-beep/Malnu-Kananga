import { useCallback, useRef } from 'react';

interface TouchFeedbackOptions {
  hapticFeedback?: boolean;
  visualFeedback?: boolean;
  feedbackClass?: string;
  feedbackDuration?: number;
}

export const useTouchFeedback = (options: TouchFeedbackOptions = {}) => {
  const elementRef = useRef<HTMLElement>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    hapticFeedback = true,
    visualFeedback = true,
    feedbackClass = 'touch-feedback',
    feedbackDuration = 150,
  } = options;

  const triggerHapticFeedback = useCallback(() => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50); // Light vibration for 50ms
    }
  }, [hapticFeedback]);

  const triggerVisualFeedback = useCallback((element: HTMLElement) => {
    if (!visualFeedback) return;

    element.classList.add(feedbackClass);

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      element.classList.remove(feedbackClass);
      feedbackTimeoutRef.current = null;
    }, feedbackDuration);
  }, [visualFeedback, feedbackClass, feedbackDuration]);

  const handleTouchFeedback = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const element = e.currentTarget;

    triggerHapticFeedback();
    triggerVisualFeedback(element);
  }, [triggerHapticFeedback, triggerVisualFeedback]);

  const cleanup = useCallback(() => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    // Also remove the class immediately if cleanup is called
    if (elementRef.current) {
      elementRef.current.classList.remove(feedbackClass);
    }
  }, [feedbackClass]);

  return {
    elementRef,
    handleTouchFeedback,
    cleanup,
  };
};