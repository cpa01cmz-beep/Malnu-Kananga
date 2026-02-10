import { useCallback, useState, useRef } from 'react';
import { MICRO_INTERACTIONS_CONFIG } from '../constants';

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
      navigator.vibrate(MICRO_INTERACTIONS_CONFIG.VIBRATION_PATTERNS[type]);
    }
  }, [options.hapticFeedback]);

  // Sound feedback (placeholder)
  const playSound = useCallback(() => {
    // Sound feedback can be implemented later
  }, []);

  // Visual feedback
  const triggerVisualFeedback = useCallback((element: HTMLElement, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    if (!options.visualFeedback || !element) return;

    const animationType = type;
    const duration = MICRO_INTERACTIONS_CONFIG.ANIMATION_DURATIONS[animationType];
    const easing = MICRO_INTERACTIONS_CONFIG.ANIMATION_EASING[animationType];
    const animationName = animationType === 'success' ? 'feedback-success-bounce' :
                         animationType === 'error' ? 'feedback-error-shake' : 'pulse';
    
    // Add animation class
    element.style.animation = `${animationName} ${duration}s ${easing}`;
    
    // Remove animation after completion
    setTimeout(() => {
      element.style.animation = '';
    }, duration * 1000);
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
    }, MICRO_INTERACTIONS_CONFIG.INTERACTION_RESET_DELAY_MS);
  }, [triggerHaptic, playSound, triggerVisualFeedback]);

  // Hover effect with delayed feedback
  const handleHoverStart = useCallback((element: HTMLElement, delay: number = MICRO_INTERACTIONS_CONFIG.HOVER_DELAY_MS) => {
    if (options.reducedMotion) return;

    const timeoutId = window.setTimeout(() => {
      if (element.matches(':hover')) {
        element.style.transform = MICRO_INTERACTIONS_CONFIG.HOVER_TRANSFORM;
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
    element.style.outline = `${MICRO_INTERACTIONS_CONFIG.FOCUS_OUTLINE_WIDTH} solid ${MICRO_INTERACTIONS_CONFIG.FOCUS_OUTLINE_COLOR}`;
    element.style.outlineOffset = MICRO_INTERACTIONS_CONFIG.FOCUS_OUTLINE_OFFSET;
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