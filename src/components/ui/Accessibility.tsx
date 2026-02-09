import React from 'react';

export interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  showOnFocus?: boolean;
}

export interface FocusIndicatorProps {
  children: React.ReactNode;
  className?: string;
  color?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}

const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  className = '',
  showOnFocus = true,
}) => {
  return (
    <a
      href={href}
      className={`
        absolute top-0 left-0 z-50 bg-primary-600 text-white px-4 py-2 text-sm font-medium
        -translate-y-full transition-transform duration-200 ease-out rounded-br-lg
        focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${showOnFocus ? 'sr-only focus:not-sr-only' : ''}
        ${className}
      `}
    >
      {children}
    </a>
  );
};

const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  children,
  className = '',
  color = 'primary',
  size = 'md',
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'secondary':
        return 'focus-within:ring-secondary-500/50';
      case 'accent':
        return 'focus-within:ring-indigo-500/50';
      default:
        return 'focus-within:ring-primary-500/50';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'focus-within:ring-1';
      case 'lg':
        return 'focus-within:ring-4';
      default:
        return 'focus-within:ring-2';
    }
  };

  return (
    <div className={`relative ${getColorClasses()} ${getSizeClasses()} ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            className: `
              focus:outline-none focus-within:outline-none
              ${(child.props as Record<string, unknown>)?.className || ''}
            `,
          });
        }
        return child;
      })}
    </div>
  );
};

// Hook for managing focus trap
export function useFocusTrap(isActive: boolean) {
  const containerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

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
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

// Announcer for screen readers
export function useAnnouncer() {
  const announcerRef = React.useRef<HTMLDivElement>(null);

  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.textContent = message;
      
      // Clear the message after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  const AnnouncerComponent = React.useCallback(() => (
    <div
      ref={announcerRef}
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
    />
  ), []);

  return { announce, Announcer: AnnouncerComponent };
}

export { SkipLink, FocusIndicator };
export default { SkipLink, FocusIndicator, useFocusTrap, useAnnouncer };