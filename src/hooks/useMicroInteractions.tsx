import { useCallback, useState, useRef } from 'react';

export interface MicroInteractionOptions {
  hapticFeedback?: boolean;
  visualFeedback?: boolean;
  reducedMotion?: boolean;
}

export const useMicroInteractions = (options: MicroInteractionOptions = {}) => {
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeoutRef = useRef<number | undefined>(undefined);

  // Haptic feedback
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!options.hapticFeedback) return;

    // Check if device supports haptic feedback
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      };
      navigator.vibrate(patterns[type]);
    }
  }, [options.hapticFeedback]);

  // Sound feedback (placeholder)
  const playSound = useCallback(() => {
    // Sound feedback can be implemented later
  }, []);

  // Visual feedback
  const triggerVisualFeedback = useCallback((element: HTMLElement, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    if (!options.visualFeedback || !element) return;

    const animations = {
      success: 'feedback-success-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      error: 'feedback-error-shake 0.5s ease-in-out',
      warning: 'pulse 0.5s ease-in-out',
      info: 'pulse 0.3s ease-in-out',
    };

    // Add animation class
    element.style.animation = animations[type];
    
    // Remove animation after completion
    const timeout = parseFloat(animations[type].split(' ')[1]) * 1000;
    setTimeout(() => {
      element.style.animation = '';
    }, timeout);
  }, [options.visualFeedback]);

  // Combined interaction feedback
  const triggerInteraction = useCallback((
    element: HTMLElement,
    type: 'success' | 'error' | 'warning' | 'info' = 'success',
    hapticType: 'light' | 'medium' | 'heavy' = 'light'
  ) => {
    setIsInteracting(true);
    
    // Clear existing timeout
    if (interactionTimeoutRef.current !== undefined) {
      window.clearTimeout(interactionTimeoutRef.current);
    }

    // Trigger all feedback types
    triggerHaptic(hapticType);
    playSound();
    triggerVisualFeedback(element, type);

    // Reset interaction state
    interactionTimeoutRef.current = window.setTimeout(() => {
      setIsInteracting(false);
    }, 300);
  }, [triggerHaptic, playSound, triggerVisualFeedback]);

  // Hover effect with delayed feedback
  const handleHoverStart = useCallback((element: HTMLElement, delay: number = 100) => {
    if (options.reducedMotion) return;

    const timeoutId = window.setTimeout(() => {
      if (element.matches(':hover')) {
        element.style.transform = 'translateY(-2px) scale(1.02)';
      }
    }, delay);

    return timeoutId;
  }, [options.reducedMotion]);

  const handleHoverEnd = useCallback((element: HTMLElement, timeoutId?: number) => {
    if (options.reducedMotion) return;
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
    element.style.transform = '';
  }, [options.reducedMotion]);

  // Focus effects
  const handleFocus = useCallback((element: HTMLElement) => {
    if (!element) return;
    element.style.outline = '2px solid hsl(var(--color-primary-500))';
    element.style.outlineOffset = '2px';
    triggerHaptic('light');
  }, [triggerHaptic]);

  const handleBlur = useCallback((element: HTMLElement) => {
    if (!element) return;
    element.style.outline = '';
    element.style.outlineOffset = '';
  }, []);

  return {
    isInteracting,
    triggerHaptic,
    playSound,
    triggerVisualFeedback,
    triggerInteraction,
    handleHoverStart,
    handleHoverEnd,
    handleFocus,
    handleBlur,
  };
};

export default useMicroInteractions;