import { useEffect, useCallback } from 'react';

// Custom hook untuk keyboard navigation
export const useKeyboardNavigation = () => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Handle common keyboard shortcuts
    switch (event.key) {
      case 'Escape':
        // Close modals and dropdowns
        const openModals = document.querySelectorAll('[role="dialog"][aria-hidden="false"]');
        openModals.forEach(modal => {
          const closeButton = modal.querySelector('[data-modal-close]') as HTMLElement;
          closeButton?.click();
        });

        // Close dropdowns
        const openDropdowns = document.querySelectorAll('[data-dropdown][aria-expanded="true"]');
        openDropdowns.forEach(dropdown => {
          const trigger = dropdown.querySelector('[data-dropdown-trigger]') as HTMLElement;
          trigger?.click();
        });
        break;

      case 'Tab':
        // Ensure proper tab order and focus management
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"]'
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        // Handle tab trapping in modals
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
        break;

      case 'Enter':
      case ' ':
        // Handle Enter and Space for button-like elements
        const activeElement = document.activeElement;
        if (activeElement?.getAttribute('role') === 'button' && !activeElement?.closest('button,input,textarea,select')) {
          event.preventDefault();
          (activeElement as HTMLElement)?.click();
        }
        break;

      case 'ArrowDown':
        // Handle arrow key navigation in menus
        if (document.activeElement?.closest('[role="menu"]')) {
          event.preventDefault();
          const menu = document.activeElement.closest('[role="menu"]') as HTMLElement;
          const menuItems = menu.querySelectorAll('[role="menuitem"]');
          const currentIndex = Array.from(menuItems).indexOf(document.activeElement);
          const nextIndex = (currentIndex + 1) % menuItems.length;
          (menuItems[nextIndex] as HTMLElement)?.focus();
        }
        break;

      case 'ArrowUp':
        // Handle arrow key navigation in menus (reverse)
        if (document.activeElement?.closest('[role="menu"]')) {
          event.preventDefault();
          const menu = document.activeElement.closest('[role="menu"]') as HTMLElement;
          const menuItems = menu.querySelectorAll('[role="menuitem"]');
          const currentIndex = Array.from(menuItems).indexOf(document.activeElement);
          const prevIndex = currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1;
          (menuItems[prevIndex] as HTMLElement)?.focus();
        }
        break;

      case 'Home':
        // Go to first menu item
        if (document.activeElement?.closest('[role="menu"]')) {
          event.preventDefault();
          const menu = document.activeElement.closest('[role="menu"]') as HTMLElement;
          const firstItem = menu.querySelector('[role="menuitem"]') as HTMLElement;
          firstItem?.focus();
        }
        break;

      case 'End':
        // Go to last menu item
        if (document.activeElement?.closest('[role="menu"]')) {
          event.preventDefault();
          const menu = document.activeElement.closest('[role="menu"]') as HTMLElement;
          const menuItems = menu.querySelectorAll('[role="menuitem"]');
          const lastItem = menuItems[menuItems.length - 1] as HTMLElement;
          lastItem?.focus();
        }
        break;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    handleKeyDown
  };
};

// Hook untuk focus management
export const useFocusManagement = () => {
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    // Focus first element
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  const restoreFocus = useCallback((previouslyFocusedElement: HTMLElement | null) => {
    previouslyFocusedElement?.focus();
  }, []);

  return {
    trapFocus,
    restoreFocus
  };
};

// Hook untuk screen reader announcements
export const useScreenReader = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const announceNavigation = useCallback((sectionName: string) => {
    announce(`Navigated to ${sectionName} section`);
  }, [announce]);

  const announceError = useCallback((errorMessage: string) => {
    announce(errorMessage, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((successMessage: string) => {
    announce(successMessage, 'polite');
  }, [announce]);

  return {
    announce,
    announceNavigation,
    announceError,
    announceSuccess
  };
};

// Hook untuk reduced motion preferences
export const useReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getAnimationDuration = useCallback((duration: number) => {
    return prefersReducedMotion ? duration * 0.1 : duration;
  }, [prefersReducedMotion]);

  const shouldAnimate = useCallback((componentAnimations: boolean = true) => {
    return !prefersReducedMotion && componentAnimations;
  }, [prefersReducedMotion]);

  return {
    prefersReducedMotion,
    getAnimationDuration,
    shouldAnimate
  };
};