import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface GestureNavigationProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  swipeThreshold?: number;
  enableSwipeToClose?: boolean;
  enableHapticFeedback?: boolean;
}

/**
 * Enhanced Mobile Navigation with Gesture Support
 * Features swipe-to-close, haptic feedback, and smooth animations
 */
export const GestureNavigation: React.FC<GestureNavigationProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  swipeThreshold = 50,
  enableSwipeToClose = true,
  enableHapticFeedback = true,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  useFocusTrap({ isOpen, onClose });

  // Swipe gesture handling
  const handleSwipeStart = useCallback((_clientY: number) => {
    if (!enableSwipeToClose || !isOpen) return;
    setIsAnimating(true);
  }, [enableSwipeToClose, isOpen]);

  const handleSwipeMove = useCallback((clientY: number, startY: number) => {
    if (!enableSwipeToClose || !isOpen) return;
    
    const deltaY = clientY - startY;
    if (deltaY > 0) { // Only allow swipe down
      setSwipeOffset(Math.min(deltaY, 200)); // Cap the offset
    }
  }, [enableSwipeToClose, isOpen]);

  const handleSwipeEnd = useCallback((endY: number, startY: number) => {
    if (!enableSwipeToClose || !isOpen) return;
    
    const deltaY = endY - startY;
    setIsAnimating(false);
    
    if (deltaY > swipeThreshold) {
      // Trigger haptic feedback if enabled
      if (enableHapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
      onClose();
    }
    
    setSwipeOffset(0);
  }, [enableSwipeToClose, isOpen, swipeThreshold, enableHapticFeedback, onClose]);

  // Use the swipe gesture hook
  useSwipeGestureInternal({
    elementRef: navRef,
    onSwipeStart: handleSwipeStart,
    onSwipeMove: handleSwipeMove,
    onSwipeEnd: handleSwipeEnd,
    direction: 'vertical',
  });

  // Focus trap management
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Animation styles
  const navStyle = React.useMemo(() => {
    const baseStyle: React.CSSProperties = {
      transform: `translateY(${isOpen ? 0 : 100}%)`,
      transition: isAnimating ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    };

    if (isAnimating && swipeOffset > 0) {
      baseStyle.transform = `translateY(${swipeOffset}px)`;
    }

    return baseStyle;
  }, [isOpen, isAnimating, swipeOffset]);

  const overlayStyle = React.useMemo(() => ({
    opacity: isOpen ? 1 : 0,
    pointerEvents: (isOpen ? 'auto' : 'none') as 'auto' | 'none',
    transition: 'opacity 0.3s ease',
  }), [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        style={overlayStyle}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      
      {/* Navigation Panel */}
      <nav
        ref={navRef}
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 rounded-t-2xl shadow-2xl z-50 md:hidden max-h-[80vh] overflow-hidden ${className}`}
        style={navStyle}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Swipe Handle */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
        </div>
        
        {/* Navigation Content */}
        <div className="overflow-y-auto overscroll-contain">
          {children}
        </div>
        
        {/* Swipe Indicator */}
        {enableSwipeToClose && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-neutral-400 text-xs">
            Swipe down to close
          </div>
        )}
      </nav>
    </>
  );
};

// Internal swipe gesture handler
const useSwipeGestureInternal = ({
  elementRef,
  onSwipeStart,
  onSwipeMove,
  onSwipeEnd,
  direction = 'horizontal',
}: {
  elementRef: React.RefObject<HTMLElement | null>;
  onSwipeStart?: (clientPos: number) => void;
  onSwipeMove?: (clientPos: number, startPos: number) => void;
  onSwipeEnd?: (endPos: number, startPos: number) => void;
  direction?: 'horizontal' | 'vertical';
}) => {
  const startPos = useRef<number>(0);
  const isDragging = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const handleStart = (e: any) => {
      const clientPos = direction === 'horizontal'
        ? 'touches' in e ? (e as any).touches[0].clientX : (e as MouseEvent).clientX
        : 'touches' in e ? (e as any).touches[0].clientY : (e as MouseEvent).clientY;

      startPos.current = clientPos;
      isDragging.current = true;
      onSwipeStart?.(clientPos);
    };

    const handleMove = (e: any) => {
      if (!isDragging.current) return;

      if ('preventDefault' in e) {
        (e as Event).preventDefault();
      }

      const clientPos = direction === 'horizontal'
        ? 'touches' in e ? (e as any).touches[0].clientX : (e as MouseEvent).clientX
        : 'touches' in e ? (e as any).touches[0].clientY : (e as MouseEvent).clientY;

      onSwipeMove?.(clientPos, startPos.current);
    };

    const handleEnd = (e: any) => {
      if (!isDragging.current) return;

      isDragging.current = false;

      const clientPos = direction === 'horizontal'
        ? 'changedTouches' in e ? (e as any).changedTouches[0].clientX : (e as MouseEvent).clientX
        : 'changedTouches' in e ? (e as any).changedTouches[0].clientY : (e as MouseEvent).clientY;

      onSwipeEnd?.(clientPos, startPos.current);
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Touch events
    element.addEventListener('touchstart', handleStart, { passive: true });
    element.addEventListener('touchmove', handleMove, { passive: false });
    element.addEventListener('touchend', handleEnd, { passive: true });
    
    // Mouse events for desktop testing
    element.addEventListener('mousedown', handleStart);
    element.addEventListener('mousemove', handleMove);
    element.addEventListener('mouseup', handleEnd);
    element.addEventListener('mouseleave', handleEnd);

    return () => {
      element.removeEventListener('touchstart', handleStart);
      element.removeEventListener('touchmove', handleMove);
      element.removeEventListener('touchend', handleEnd);
      element.removeEventListener('mousedown', handleStart);
      element.removeEventListener('mousemove', handleMove);
      element.removeEventListener('mouseup', handleEnd);
      element.removeEventListener('mouseleave', handleEnd);
    };
  }, [elementRef, onSwipeStart, onSwipeMove, onSwipeEnd, direction]);
};

// Enhanced mobile navigation item with gesture support
interface GestureNavItemProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  isActive?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
  className?: string;
}

export const GestureNavItem: React.FC<GestureNavItemProps> = ({
  href,
  onClick,
  children,
  isActive = false,
  icon,
  badge,
  className = '',
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressStart = useCallback(() => {
    setIsPressed(true);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }, []);

  const handlePressEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleClick = useCallback(() => {
    onClick?.();
    // Haptic feedback for click
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [onClick]);

  const baseClasses = `
    relative flex items-center gap-3 w-full px-4 py-3 text-left
    transition-all duration-200 ease-out
    border-b border-neutral-100 dark:border-neutral-800
    ${isActive 
      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-l-4 border-primary-500' 
      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
    }
    ${isPressed ? 'scale-[0.98]' : 'scale-100'}
    touch-manipulation
    min-h-[52px]
    ${className}
  `.trim();

  const content = (
    <>
      {icon && (
        <span className="flex-shrink-0 w-5 h-5">
          {icon}
        </span>
      )}
      <span className="flex-1 font-medium">
        {children}
      </span>
      {badge && (
        <span className="flex-shrink-0 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
      {isActive && (
        <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/10 opacity-30 pointer-events-none" />
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onClick={handleClick}
        aria-current={isActive ? 'page' : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={baseClasses}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onClick={handleClick}
    >
      {content}
    </button>
  );
};

export default GestureNavigation;