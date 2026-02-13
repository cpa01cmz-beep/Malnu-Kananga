import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useAccessibility';
import { useHapticFeedback } from '../../utils/hapticFeedback';
import { ANIMATION_DURATIONS } from '../../constants';

export interface ScrollToTopProps {
  /** Minimum scroll position (in pixels) before button appears */
  showThreshold?: number;
  /** Position on the screen */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Variant style */
  variant?: 'default' | 'minimal' | 'elevated';
  /** Smooth scroll duration in milliseconds */
  scrollDuration?: number;
  /** Show circular progress indicator */
  showProgress?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when scroll to top completes */
  onScrollComplete?: () => void;
}

/**
 * ScrollToTop - A micro-UX component that provides scroll progress indication
 * and one-click navigation to the top of the page.
 * 
 * Features:
 * - Circular progress indicator showing scroll position
 * - Smooth animated scroll to top
 * - Contextual visibility (appears after scrolling threshold)
 * - Keyboard accessible (Enter/Space to activate)
 * - Haptic feedback on mobile
 * - Reduced motion support
 * - Tooltip with keyboard shortcut
 */
const ScrollToTop: React.FC<ScrollToTopProps> = ({
  showThreshold = 300,
  position = 'bottom-right',
  size = 'md',
  variant = 'default',
  scrollDuration = 500,
  showProgress = true,
  className = '',
  onScrollComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { onSuccess } = useHapticFeedback();

  // Calculate scroll progress (0-100)
  const calculateScrollProgress = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if (scrollHeight <= 0) return 0;
    
    const progress = (scrollTop / scrollHeight) * 100;
    return Math.min(100, Math.max(0, progress));
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const progress = calculateScrollProgress();
    
    setScrollProgress(progress);
    setIsVisible(scrollTop > showThreshold);
  }, [showThreshold, calculateScrollProgress]);

  // Smooth scroll to top
  const scrollToTop = useCallback(() => {
    onSuccess();
    
    if (prefersReducedMotion) {
      window.scrollTo(0, 0);
      onScrollComplete?.();
    } else {
      const startPosition = window.scrollY;
      const startTime = window.performance.now();

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / scrollDuration, 1);
        
        // Ease out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentPosition = startPosition * (1 - easeOut);
        
        window.scrollTo(0, currentPosition);
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          onScrollComplete?.();
        }
      };

      requestAnimationFrame(animateScroll);
    }
  }, [prefersReducedMotion, scrollDuration, onScrollComplete, onSuccess]);

  // Handle keyboard interactions
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  }, [scrollToTop]);

  // Show/hide tooltip with delay
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 500);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowTooltip(false);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
  }, []);

  // Setup scroll listener
  useEffect(() => {
    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  };

  // Size classes
  const sizeClasses = {
    sm: {
      button: 'w-10 h-10',
      icon: 'w-4 h-4',
      stroke: 2,
      radius: 16,
    },
    md: {
      button: 'w-12 h-12',
      icon: 'w-5 h-5',
      stroke: 2.5,
      radius: 20,
    },
    lg: {
      button: 'w-14 h-14',
      icon: 'w-6 h-6',
      stroke: 3,
      radius: 24,
    },
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-white dark:bg-neutral-800 text-primary-600 dark:text-primary-400 shadow-lg hover:shadow-xl border border-neutral-200 dark:border-neutral-700',
    minimal: 'bg-neutral-900/80 dark:bg-white/80 text-white dark:text-neutral-900 backdrop-blur-sm hover:bg-neutral-900 dark:hover:bg-white',
    elevated: 'bg-primary-600 text-white shadow-lg hover:shadow-primary-500/30 hover:bg-primary-700',
  };

  const { button: buttonSize, icon: iconSize, stroke, radius } = sizeClasses[size];
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  // Don't render if not visible and not in development
  if (!isVisible && process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div
      className={`
        fixed ${positionClasses[position]} z-50
        ${isVisible ? 'pointer-events-auto' : 'pointer-events-none'}
        ${className}
      `}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? 'translateY(0) scale(1)' 
          : `translateY(20px) scale(0.8)`,
        transition: prefersReducedMotion 
          ? 'none' 
          : `all ${ANIMATION_DURATIONS.NORMAL}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
      }}
    >
      <button
        ref={buttonRef}
        onClick={scrollToTop}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        className={`
          ${buttonSize}
          rounded-full
          ${variantClasses[variant]}
          flex items-center justify-center
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900
          transition-all duration-200
          ${isHovered ? 'scale-110' : ''}
          ${isPressed ? 'scale-95' : ''}
          cursor-pointer
          relative
          overflow-hidden
        `}
        aria-label={`Scroll to top (${Math.round(scrollProgress)}% scrolled)`}
        aria-live="polite"
        title="Scroll to top"
      >
        {/* Progress Ring */}
        {showProgress && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox={`0 0 ${radius * 2 + stroke * 2} ${radius * 2 + stroke * 2}`}
            aria-hidden="true"
          >
            {/* Background circle */}
            <circle
              cx={radius + stroke}
              cy={radius + stroke}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              className="opacity-10"
            />
            {/* Progress circle */}
            <circle
              cx={radius + stroke}
              cy={radius + stroke}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: prefersReducedMotion 
                  ? 'none' 
                  : 'stroke-dashoffset 100ms ease-out',
              }}
            />
          </svg>
        )}

        {/* Icon */}
        <svg
          className={`
            ${iconSize}
            relative z-10
            transition-transform duration-200
            ${isHovered ? '-translate-y-0.5' : ''}
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>

        {/* Hover ripple effect */}
        {!prefersReducedMotion && (
          <span
            className={`
              absolute inset-0 rounded-full
              bg-current opacity-0
              transition-opacity duration-200
              ${isHovered ? 'opacity-10' : ''}
            `}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className={`
            absolute bottom-full mb-2
            ${position === 'bottom-center' ? 'left-1/2 -translate-x-1/2' : position === 'bottom-left' ? 'left-0' : 'right-0'}
            px-3 py-1.5
            bg-neutral-800 dark:bg-neutral-700
            text-white text-xs font-medium
            rounded-lg shadow-lg
            whitespace-nowrap
            pointer-events-none
            z-50
            ${prefersReducedMotion ? '' : 'animate-in fade-in slide-in-from-bottom-1 duration-200'}
          `}
          role="tooltip"
        >
          <span className="flex items-center gap-1.5">
            <span>Scroll to top</span>
            <kbd className="px-1 py-0 bg-neutral-600 dark:bg-neutral-600 rounded text-[10px] font-mono border border-neutral-500">
              Home
            </kbd>
          </span>
          <span 
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

export default ScrollToTop;
