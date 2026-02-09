import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

// Global type declarations
declare global {
  interface Window {
    NodeListOf: any;
  }
  
  interface Document {
    querySelector(selector: string): HTMLElement | null;
  }
}

interface FocusContextType {
  trapFocus: (container: HTMLElement) => void;
  releaseFocus: () => void;
  setFocus: (element: HTMLElement | null) => void;
  restoreFocus: () => void;
  isKeyboardUser: boolean;
}

const FocusContext = createContext<FocusContextType | null>(null);

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};

interface FocusProviderProps {
  children: ReactNode;
}

export const FocusProvider: React.FC<FocusProviderProps> = ({ children }) => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const trappedContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const trapFocus = (container: HTMLElement) => {
    trappedContainerRef.current = container;
    previousFocusRef.current = document.activeElement as HTMLElement;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
  };

  const releaseFocus = () => {
    if (trappedContainerRef.current) {
      trappedContainerRef.current.removeEventListener('keydown', () => {});
      trappedContainerRef.current = null;
    }
  };

  const setFocus = (element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  };

  const restoreFocus = () => {
    if (previousFocusRef.current && previousFocusRef.current.focus) {
      previousFocusRef.current.focus();
    }
    releaseFocus();
  };

  return (
    <FocusContext.Provider
      value={{
        trapFocus,
        releaseFocus,
        setFocus,
        restoreFocus,
        isKeyboardUser
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

// Focus trap component for modals and dialogs
interface FocusTrapProps {
  children: ReactNode;
  isActive?: boolean;
  className?: string;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  isActive = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { trapFocus, releaseFocus } = useFocus();

  useEffect(() => {
    if (isActive && containerRef.current) {
      trapFocus(containerRef.current);
    }

    return () => {
      if (isActive) {
        releaseFocus();
      }
    };
  }, [isActive, trapFocus, releaseFocus]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Focus scope for managing focus within a section
interface FocusScopeProps {
  children: ReactNode;
  onEnter?: () => void;
  onExit?: () => void;
  className?: string;
}

export const FocusScope: React.FC<FocusScopeProps> = ({
  children,
  onEnter,
  onExit,
  className = ''
}) => {
  const scopeRef = useRef<HTMLDivElement>(null);
  const [isInScope, setIsInScope] = useState(false);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const handleFocusIn = (e: FocusEvent) => {
      if (!scope.contains(e.target as Node)) {
        setIsInScope(false);
        onExit?.();
      } else if (!isInScope) {
        setIsInScope(true);
        onEnter?.();
      }
    };

    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [isInScope, onEnter, onExit]);

  return (
    <div ref={scopeRef} className={className}>
      {children}
    </div>
  );
};

// Focus management for form validation
export const useFormFieldFocus = (fieldName: string, error?: string) => {
  const { setFocus } = useFocus();
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  const focusField = () => {
    const field = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
    if (field) {
      setFocus(field);
    }
  };

  return {
    errorRef,
    focusField
  };
};

// Focus indicator for keyboard navigation
interface FocusIndicatorProps {
  children: ReactNode;
  className?: string;
  showOnlyOnKeyboard?: boolean;
}

export const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  children,
  className = '',
  showOnlyOnKeyboard = true
}) => {
  const { isKeyboardUser } = useFocus();
  const [isFocused, setIsFocused] = useState(false);

  const shouldShow = !showOnlyOnKeyboard || isKeyboardUser;

  if (!shouldShow) {
    return <>{children}</>;
  }

  return (
    <div 
      className={`relative ${className}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {children}
      {isFocused && (
        <div 
          className="absolute inset-0 pointer-events-none border-2 border-primary-500 rounded-lg animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

// Live region management for screen readers
interface LiveRegionProps {
  children: ReactNode;
  politeness?: 'off' | 'polite' | 'assertive';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all' | 'additions text' | 'additions removals' | 'removals additions' | 'removals text' | 'text additions' | 'text removals';
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  politeness = 'polite',
  atomic = true,
  relevant = 'additions text'
}) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className="sr-only"
    >
      {children}
    </div>
  );
};

export default FocusProvider;