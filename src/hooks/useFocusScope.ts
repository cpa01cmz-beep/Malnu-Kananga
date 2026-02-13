import React, { useEffect, useRef, useCallback } from 'react';

import { TIME_MS, UI_ACCESSIBILITY } from '../constants';

export interface FocusScopeOptions {
  restoreFocus?: boolean;
  autoFocus?: boolean;
  trapFocus?: boolean;
  onEscape?: () => void;
  onEnter?: () => void;
}

export const useFocusScope = (options: FocusScopeOptions = {}) => {
  const {
    restoreFocus = true,
    autoFocus = true,
    trapFocus = true,
    onEscape,
    onEnter,
  } = options;

  const scopeRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the scope
  const getFocusableElements = useCallback(() => {
    if (!scopeRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      'area[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'summary',
      'iframe',
      'object',
      'embed',
      'audio[controls]',
      'video[controls]',
    ].join(', ');

    return Array.from(scopeRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  // Get first and last focusable elements
  const getEdgeElements = useCallback(() => {
    const elements = getFocusableElements();
    return {
      first: elements[0],
      last: elements[elements.length - 1],
    };
  }, [getFocusableElements]);

  // Focus first element in scope
  const focusFirst = useCallback(() => {
    const { first } = getEdgeElements();
    if (first) {
      first.focus();
      return true;
    }
    return false;
  }, [getEdgeElements]);

  // Focus last element in scope
  const focusLast = useCallback(() => {
    const { last } = getEdgeElements();
    if (last) {
      last.focus();
      return true;
    }
    return false;
  }, [getEdgeElements]);

  // Handle keyboard navigation within scope
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!trapFocus) return;

    const { first, last } = getEdgeElements();
    if (!first || !last) return;

    switch (event.key) {
      case 'Tab':
        if (event.shiftKey) {
          // Shift + Tab: focus previous element
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          // Tab: focus next element
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
        break;
      case 'Escape':
        onEscape?.();
        break;
      case 'Enter':
        onEnter?.();
        break;
    }
  }, [trapFocus, getEdgeElements, onEscape, onEnter]);

  // Initialize focus scope
  useEffect(() => {
    if (!scopeRef.current) return;

    // Store current active element for restoration
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    // Auto focus first element if enabled
    if (autoFocus) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        focusFirst();
      }, 50);
      return () => clearTimeout(timer);
    }

    // Add keyboard event listener if focus trapping is enabled
    if (trapFocus) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [autoFocus, trapFocus, restoreFocus, focusFirst, handleKeyDown]);

  // Restore focus when scope is unmounted
  useEffect(() => {
    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [restoreFocus]);

  return {
    scopeRef,
    focusFirst,
    focusLast,
    getFocusableElements,
    getEdgeElements,
  };
};

// Focus management utilities
export const focusManager = {
  // Get all focusable elements in a container
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      'area[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'summary',
      'iframe',
      'object',
      'embed',
      'audio[controls]',
      'video[controls]',
    ].join(', ');

    return Array.from(container.querySelectorAll(selectors)) as HTMLElement[];
  },

  // Check if element is focusable
  isFocusable: (element: HTMLElement): boolean => {
    const tagName = element.tagName.toLowerCase();
    const hasTabIndex = element.hasAttribute('tabindex');
    const isDisabled = element.hasAttribute('disabled');
    const isHidden = element.hidden || element.offsetParent === null;

    if (isDisabled || isHidden) return false;

    switch (tagName) {
      case 'a':
      case 'area':
        return element.hasAttribute('href');
      case 'input':
      case 'select':
      case 'textarea':
      case 'button':
        return true;
      case 'iframe':
      case 'object':
      case 'embed':
        return true;
      case 'audio':
      case 'video':
        return element.hasAttribute('controls');
      case 'summary':
        return true;
      default:
        return hasTabIndex || element.contentEditable === 'true';
    }
  },

  // Focus next element
  focusNext: (container: HTMLElement, current?: HTMLElement): boolean => {
    const focusable = focusManager.getFocusableElements(container);
    if (focusable.length === 0) return false;

    const currentIndex = current ? focusable.indexOf(current) : -1;
    const nextIndex = (currentIndex + 1) % focusable.length;
    
    focusable[nextIndex].focus();
    return true;
  },

  // Focus previous element
  focusPrevious: (container: HTMLElement, current?: HTMLElement): boolean => {
    const focusable = focusManager.getFocusableElements(container);
    if (focusable.length === 0) return false;

    const currentIndex = current ? focusable.indexOf(current) : -1;
    const prevIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
    
    focusable[prevIndex].focus();
    return true;
  },

  // Announce to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = UI_ACCESSIBILITY.OFFSCREEN_POSITION;
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement is made
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, TIME_MS.ONE_SECOND);
  },
};

// Hook for managing focus within modal dialogs
export const useModalFocus = (isOpen: boolean, onClose: () => void) => {
  const focusScope = useFocusScope({
    restoreFocus: true,
    autoFocus: true,
    trapFocus: true,
    onEscape: onClose,
  });

  useEffect(() => {
    if (isOpen && focusScope.scopeRef.current) {
      focusScope.focusFirst();
    }
  }, [isOpen, focusScope]);

  return focusScope;
};

// Hook for skip link functionality
export const useSkipLinks = () => {
  const skipLinksRef = useRef<HTMLElement>(null);

  const skipToTarget = useCallback((targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      focusManager.announce(`Skipped to ${targetId}`);
    }
  }, []);

  return {
    skipLinksRef,
    skipToTarget,
  };
};

// Hook for managing focus in forms
export const useFormFocus = (formRef: React.RefObject<HTMLFormElement>) => {
  const focusFirstInvalid = useCallback(() => {
    if (!formRef.current) return false;

    const invalidElements = Array.from(
      formRef.current.querySelectorAll(':invalid')
    ) as HTMLElement[];

    if (invalidElements.length > 0) {
      const firstInvalid = invalidElements[0];
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      focusManager.announce(`Error in ${firstInvalid.getAttribute('aria-label') || 'form field'}`, 'assertive');
      return true;
    }

    return false;
  }, [formRef]);

  const focusNextField = useCallback((currentField: HTMLElement) => {
    if (!formRef.current) return false;
    return focusManager.focusNext(formRef.current, currentField);
  }, [formRef]);

  const focusPreviousField = useCallback((currentField: HTMLElement) => {
    if (!formRef.current) return false;
    return focusManager.focusPrevious(formRef.current, currentField);
  }, [formRef]);

  return {
    focusFirstInvalid,
    focusNextField,
    focusPreviousField,
  };
};

export default useFocusScope;