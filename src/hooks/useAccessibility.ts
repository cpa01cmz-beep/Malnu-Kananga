import { useCallback, useEffect, useRef, useState } from 'react';

interface AnnouncerOptions {
  assertive?: boolean;
  politeness?: 'assertive' | 'polite' | 'off';
}

export function useAnnouncer(options: AnnouncerOptions = {}) {
  const { politeness = 'polite' } = options;
  const announcementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!announcementRef.current) {
      announcementRef.current = document.createElement('div');
      announcementRef.current.setAttribute('role', 'status');
      announcementRef.current.setAttribute('aria-live', politeness);
      announcementRef.current.setAttribute('aria-atomic', 'true');
      announcementRef.current.className = 'sr-only';
      document.body.appendChild(announcementRef.current);
    }

    return () => {
      if (announcementRef.current && document.body.contains(announcementRef.current)) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, [politeness]);

  const announce = useCallback((message: string, overridePoliteness?: 'assertive' | 'polite') => {
    if (announcementRef.current) {
      if (overridePoliteness) {
        announcementRef.current.setAttribute('aria-live', overridePoliteness);
      }
      announcementRef.current.textContent = message;
      
      setTimeout(() => {
        if (announcementRef.current && overridePoliteness) {
          announcementRef.current.setAttribute('aria-live', politeness);
        }
      }, 100);
    }
  }, [politeness]);

  return { announce };
}

export function useFocusContainment(isActive: boolean, onEscape?: () => void) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        onEscape();
        event.preventDefault();
      }

      if (event.key === 'Tab') {
        const container = containerRef.current;
        if (!container) return;

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as unknown as HTMLElement[];

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, onEscape]);

  return containerRef;
}

export function useKeyboardNavigation<T extends HTMLElement>(
  items: T[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
    onEnter?: (item: T) => void;
    onSpace?: (item: T) => void;
  } = {}
) {
  const { orientation = 'vertical', loop = true, onEnter, onSpace } = options;
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < items.length) {
      items[focusedIndex]?.focus();
    }
  }, [focusedIndex, items]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const currentIndex = items.indexOf(document.activeElement as T);

    if (currentIndex === -1) return;

    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = currentIndex + 1;
        }
        break;

      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = currentIndex - 1;
        }
        break;

      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = currentIndex + 1;
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = currentIndex - 1;
        }
        break;

      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;

      case 'Enter':
      case 'NumpadEnter':
        if (onEnter) {
          event.preventDefault();
          onEnter(items[currentIndex]);
        }
        break;

      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace(items[currentIndex]);
        }
        break;
    }

    if (loop) {
      if (newIndex < 0) {
        newIndex = items.length - 1;
      } else if (newIndex >= items.length) {
        newIndex = 0;
      }
    } else {
      newIndex = Math.max(0, Math.min(newIndex, items.length - 1));
    }

    if (newIndex !== currentIndex) {
      setFocusedIndex(newIndex);
    }
  }, [items, orientation, loop, onEnter, onSpace]);

  return { handleKeyDown };
}

export function useId(prefix: string = 'id') {
  const id = useRef<string>(`${prefix}-${Math.random().toString(36).substr(2, 9)}`);

  return id.current;
}

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

export function usePrefersColorScheme(): 'light' | 'dark' | null {
  const [prefersColorScheme, setPrefersColorScheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const lightMediaQuery = window.matchMedia('(prefers-color-scheme: light)');

    const setScheme = () => {
      if (darkMediaQuery.matches) {
        setPrefersColorScheme('dark');
      } else if (lightMediaQuery.matches) {
        setPrefersColorScheme('light');
      } else {
        setPrefersColorScheme(null);
      }
    };

    setScheme();

    const handleChange = () => {
      setScheme();
    };

    darkMediaQuery.addEventListener('change', handleChange);
    lightMediaQuery.addEventListener('change', handleChange);

    return () => {
      darkMediaQuery.removeEventListener('change', handleChange);
      lightMediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersColorScheme;
}
