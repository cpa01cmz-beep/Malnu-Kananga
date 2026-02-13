import React, { useState, useCallback, useRef, useEffect, useId } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipSize = 'sm' | 'md' | 'lg';
export type TooltipVariant = 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: TooltipPosition;
  size?: TooltipSize;
  variant?: TooltipVariant;
  delay?: number;
  hideDelay?: number;
  disabled?: boolean;
  visible?: boolean;
  className?: string;
  ariaLabel?: string;
  showArrow?: boolean;
  maxWidth?: number;
  onVisibilityChange?: (visible: boolean) => void;
}

const sizeClasses: Record<TooltipSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1.5 text-xs',
  lg: 'px-3 py-2 text-sm',
};

const variantClasses: Record<TooltipVariant, string> = {
  default: 'bg-neutral-800 dark:bg-neutral-700 text-white',
  primary: 'bg-primary-600 dark:bg-primary-500 text-white',
  success: 'bg-green-600 dark:bg-green-500 text-white',
  error: 'bg-red-600 dark:bg-red-500 text-white',
  warning: 'bg-yellow-600 dark:bg-yellow-500 text-white',
  info: 'bg-blue-600 dark:bg-blue-500 text-white',
};

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowPositionClasses: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-l-transparent border-r-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l-transparent border-r-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t-transparent border-b-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-t-transparent border-b-transparent border-l-transparent',
};


const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'bottom',
  size = 'md',
  variant = 'default',
  delay = 400,
  hideDelay = 100,
  disabled = false,
  visible: controlledVisible,
  className = '',
  ariaLabel,
  showArrow = true,
  maxWidth = 250,
  onVisibilityChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();
  const prefersReducedMotion = useReducedMotion();

  const isControlled = controlledVisible !== undefined;
  const shouldShow = isControlled ? controlledVisible : isVisible;

  useEffect(() => {
    if (isControlled) {
      if (controlledVisible) {
        setIsMounted(true);
        requestAnimationFrame(() => setIsVisible(true));
      } else {
        setIsVisible(false);
        if (!prefersReducedMotion) {
          setTimeout(() => setIsMounted(false), 200);
        } else {
          setIsMounted(false);
        }
      }
    }
  }, [isControlled, controlledVisible, prefersReducedMotion]);

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator && window.innerWidth <= 768) {
      navigator.vibrate(10);
    }
  }, []);

  const showTooltip = useCallback(() => {
    if (disabled) return;

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    showTimeoutRef.current = setTimeout(() => {
      setIsMounted(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
        triggerHaptic();
        onVisibilityChange?.(true);
      });
    }, delay);
  }, [disabled, delay, triggerHaptic, onVisibilityChange]);

  const hideTooltip = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      onVisibilityChange?.(false);
      if (!prefersReducedMotion) {
        setTimeout(() => setIsMounted(false), 200);
      } else {
        setIsMounted(false);
      }
    }, hideDelay);
  }, [hideDelay, prefersReducedMotion, onVisibilityChange]);

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      hideTooltip();
    }
  }, [hideTooltip]);

  const childProps = children.props as Record<string, unknown>;

  const triggerElement = React.cloneElement(children, {
    'aria-describedby': shouldShow ? tooltipId : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      (childProps.onMouseEnter as React.MouseEventHandler)?.(e);
      showTooltip();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      (childProps.onMouseLeave as React.MouseEventHandler)?.(e);
      hideTooltip();
    },
    onFocus: (e: React.FocusEvent) => {
      (childProps.onFocus as React.FocusEventHandler)?.(e);
      showTooltip();
    },
    onBlur: (e: React.FocusEvent) => {
      (childProps.onBlur as React.FocusEventHandler)?.(e);
      hideTooltip();
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      (childProps.onKeyDown as React.KeyboardEventHandler)?.(e);
      handleKeyDown(e);
    },
  } as React.HTMLAttributes<HTMLElement>);

  const getTooltipContent = () => {
    if (typeof content === 'string') {
      return content;
    }
    return content;
  };

  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    if (typeof content === 'string') return content;
    return undefined;
  };

  return (
    <span className="relative inline-flex">
      {triggerElement}
      
      {isMounted && (
        <span
          id={tooltipId}
          role="tooltip"
          aria-label={getAriaLabel()}
          className={`
            absolute z-50 pointer-events-none
            ${positionClasses[position]}
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            rounded-md shadow-lg
            whitespace-nowrap
            ${prefersReducedMotion ? '' : 'transition-all duration-200 ease-out'}
            ${shouldShow 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 ' + (position === 'top' ? 'translate-y-1' : position === 'bottom' ? '-translate-y-1' : position === 'left' ? 'translate-x-1' : '-translate-x-1')
            }
            ${className}
          `.replace(/\s+/g, ' ').trim()}
          style={{ maxWidth: `${maxWidth}px`, whiteSpace: 'normal' }}
        >
          <span className="relative z-10">{getTooltipContent()}</span>
          
          {/* Arrow */}
          {showArrow && (
            <span
              className={`
                absolute w-2 h-2 rotate-45
                ${variantClasses[variant]}
                ${arrowPositionClasses[position]}
              `.replace(/\s+/g, ' ').trim()}
              aria-hidden="true"
            />
          )}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
