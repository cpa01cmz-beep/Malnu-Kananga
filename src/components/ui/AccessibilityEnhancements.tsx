/**
 * Accessibility Enhancement Utilities
 * Improved keyboard navigation, screen reader support, and focus management
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
  onEscape?: () => void;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ 
  children, 
  isActive, 
  onEscape 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.();
      }
    };

    container.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscape);

    // Focus first element when trap activates
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isActive, onEscape]);

  return <div ref={containerRef}>{children}</div>;
};

export interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ 
  href, 
  children, 
  className = '' 
}) => {
  return (
    <a
      href={href}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
        bg-blue-600 text-white px-4 py-2 rounded-md font-medium
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        z-50 transition-all duration-200
        ${className}
      `}
    >
      {children}
    </a>
  );
};

export interface AnnouncerProps {
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
}

export const Announcer: React.FC<AnnouncerProps> = ({ 
  message, 
  politeness = 'polite' 
}) => {
  return createPortal(
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>,
    document.body
  );
};

export const useFocusManagement = () => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
      previousFocusRef.current.focus();
    }
  }, []);

  const focusElement = useCallback((selector: string | HTMLElement) => {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
      
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }, []);

  return {
    saveFocus,
    restoreFocus,
    focusElement,
  };
};

export const useKeyboardNavigation = (
  items: Array<{ id: string; element?: HTMLElement }>,
  options: {
    orientation?: 'horizontal' | 'vertical';
    loop?: boolean;
    onSelect?: (id: string) => void;
  } = {}
) => {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const currentIndexRef = useRef(-1);

  const navigate = useCallback((direction: 'next' | 'previous') => {
    const itemsWithElements = items.filter(item => item.element);
    
    if (itemsWithElements.length === 0) return;

    let newIndex = currentIndexRef.current;
    
    if (direction === 'next') {
      newIndex = currentIndexRef.current + 1;
      if (newIndex >= itemsWithElements.length) {
        newIndex = loop ? 0 : itemsWithElements.length - 1;
      }
    } else {
      newIndex = currentIndexRef.current - 1;
      if (newIndex < 0) {
        newIndex = loop ? itemsWithElements.length - 1 : 0;
      }
    }

    const newItem = itemsWithElements[newIndex];
    if (newItem?.element) {
      newItem.element.focus();
      currentIndexRef.current = newIndex;
      onSelect?.(newItem.id);
    }
  }, [items, loop, onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        if (orientation === 'vertical' && e.key === 'ArrowRight') return;
        if (orientation === 'horizontal' && e.key === 'ArrowDown') return;
        e.preventDefault();
        navigate('next');
        break;
      
      case 'ArrowUp':
      case 'ArrowLeft':
        if (orientation === 'vertical' && e.key === 'ArrowLeft') return;
        if (orientation === 'horizontal' && e.key === 'ArrowUp') return;
        e.preventDefault();
        navigate('previous');
        break;
      
      case 'Home':
        e.preventDefault();
        {
          const firstItem = items.find(item => item.element);
          if (firstItem?.element) {
            firstItem.element.focus();
            currentIndexRef.current = 0;
            onSelect?.(firstItem.id);
          }
        }
        break;
      
      case 'End':
        e.preventDefault();
        {
          const lastItem = [...items].reverse().find(item => item.element);
          if (lastItem?.element) {
            lastItem.element.focus();
            currentIndexRef.current = items.length - 1;
            onSelect?.(lastItem.id);
          }
        }
        break;
      
      case 'Enter':
      case ' ':
        e.preventDefault();
        {
          const currentItem = items[currentIndexRef.current];
          if (currentItem) {
            onSelect?.(currentItem.id);
          }
        }
        break;
    }
  }, [orientation, navigate, items, onSelect]);

  return {
    handleKeyDown,
    currentIndex: currentIndexRef.current,
  };
};

export interface KeyboardMenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  action?: () => void;
}

export const useMenuKeyboardNavigation = (
  items: KeyboardMenuItem[],
  onClose?: () => void
) => {
  const { handleKeyDown, currentIndex } = useKeyboardNavigation(
    items.map(item => ({ id: item.id })),
    { onSelect: (id) => items.find(item => item.id === id)?.action?.() }
  );

  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
      return;
    }

    handleKeyDown(e);
  }, [handleKeyDown, onClose]);

  return {
    handleMenuKeyDown,
    currentIndex,
  };
};

export const getAriaDescribedBy = (
  errorId?: string,
  helperId?: string,
  descriptionId?: string
): string | undefined => {
  const ids = [errorId, helperId, descriptionId].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
};

export const getAriaErrorMessage = (
  hasError: boolean,
  errorId?: string
): { 'aria-invalid': boolean; 'aria-describedby'?: string } => {
  return {
    'aria-invalid': hasError,
    'aria-describedby': hasError && errorId ? errorId : undefined,
  };
};