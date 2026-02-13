import { useEffect, useCallback, useRef } from 'react';
import { UI_DELAYS, UI_ACCESSIBILITY } from '../constants';

export interface AccessibilityOptions {
  announceChanges?: boolean;
  reducedMotion?: boolean;
  highContrast?: boolean;
  screenReader?: boolean;
}

export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const announcementRef = useRef<HTMLDivElement | null>(null);

  // Detect user preferences
  const detectPreferences = useCallback((): AccessibilityOptions => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    // Basic screen reader detection
    const screenReaderDetected = window.navigator.userAgent.includes('JAWS') || 
                                 window.navigator.userAgent.includes('NVDA') ||
                                 window.navigator.userAgent.includes('VOICEOVER') ||
                                 window.speechSynthesis !== undefined;

    return {
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
      screenReader: screenReaderDetected,
      announceChanges: options.announceChanges ?? true,
    };
  }, [options.announceChanges]);

  // Create announcement region if it doesn't exist
  useEffect(() => {
    if (!announcementRef.current && options.announceChanges) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.setAttribute('class', 'sr-only');
      announcement.style.position = 'absolute';
      announcement.style.left = UI_ACCESSIBILITY.OFFSCREEN_POSITION;
      announcement.style.width = UI_ACCESSIBILITY.OFFSCREEN_WIDTH;
      announcement.style.height = UI_ACCESSIBILITY.OFFSCREEN_HEIGHT;
      announcement.style.overflow = 'hidden';
      document.body.appendChild(announcement);
      announcementRef.current = announcement;
    }

    return () => {
      if (announcementRef.current && announcementRef.current.parentNode) {
        announcementRef.current.parentNode.removeChild(announcementRef.current);
      }
    };
  }, [options.announceChanges]);

  // Announce message to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!options.announceChanges || !announcementRef.current) return;

    const announcement = announcementRef.current;
    announcement.setAttribute('aria-live', priority);
    
    // Clear previous content and add new message
    announcement.textContent = '';
    setTimeout(() => {
      announcement.textContent = message;
    }, UI_DELAYS.ACCESSIBILITY_ANNOUNCE);
  }, [options.announceChanges]);

  // Trap focus within a container
  const trapFocus = useCallback((container: HTMLElement) => {
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  // Save and restore focus
  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
      previousFocusRef.current.focus();
    }
  }, []);

  // Enhanced keyboard navigation
  const handleKeyboardNavigation = useCallback(
    (e: KeyboardEvent, handlers: Record<string, () => void>) => {
      const handler = handlers[e.key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    },
    []
  );

  // Check if element is visible
  const isElementVisible = useCallback((element: HTMLElement) => {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  }, []);

  // Find next focusable element
  const findNextFocusable = useCallback((current: HTMLElement, direction: 'next' | 'previous' = 'next') => {
    const focusableElements = Array.from(
      document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];
    
    const currentIndex = focusableElements.indexOf(current);
    if (currentIndex === -1) return null;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    return focusableElements[nextIndex] || null;
  }, []);

  // Get accessibility preferences
  const preferences = detectPreferences();

  return {
    announce,
    trapFocus,
    saveFocus,
    restoreFocus,
    handleKeyboardNavigation,
    isElementVisible,
    findNextFocusable,
    preferences,
  };
};

export default useAccessibility;