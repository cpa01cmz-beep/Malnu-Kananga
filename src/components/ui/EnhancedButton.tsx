/**
 * Enhanced Button Component with Advanced Micro-interactions
 * Improved UX with sophisticated animations, haptic feedback, and accessibility
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { XML_NAMESPACES } from '../../constants';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useHapticFeedback } from '../../utils/hapticFeedback';
import { 
  buildButtonClasses, 
  BUTTON_SIZE_CLASSES, 
  BUTTON_ICON_ONLY_SIZES, 
  BUTTON_BASE_CLASSES, 
  BUTTON_VARIANT_CLASSES, 
  BUTTON_INTENT_CLASSES 
} from '../../utils/buttonUtils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
export type ButtonIntent = 'default' | 'success' | 'warning' | 'info';
export type ButtonSize = 'icon' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  intent?: ButtonIntent;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  ariaLabel?: string;
  children?: React.ReactNode;
  disabledReason?: string;
  ripple?: boolean;
  pulse?: boolean;
  glow?: boolean;
}

interface RippleEffect {
  x: number;
  y: number;
  id: number;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  intent = 'default',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  iconOnly = false,
  ariaLabel,
  children,
  disabledReason,
  ripple = true,
  pulse = false,
  glow = false,
  className = '',
  onClick,
  onMouseDown,
  onMouseUp,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  disabled,
  ...props
}, ref) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { onPress, onError } = useHapticFeedback();

  const combinedRef = useCallback((node: HTMLButtonElement) => {
    buttonRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  const createRipple = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!ripple || prefersReducedMotion || disabled || isLoading) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple: RippleEffect = {
      x,
      y,
      id: Date.now(),
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  }, [ripple, prefersReducedMotion, disabled, isLoading]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) {
      if (disabled) {
        onError();
      }
      return;
    }

    createRipple(event);
    onPress();
    onClick?.(event);
  }, [disabled, isLoading, createRipple, onPress, onClick, onError]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    setIsPressed(true);
    onMouseDown?.(event);
  }, [disabled, isLoading, onMouseDown]);

  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    setIsPressed(false);
    onMouseUp?.(event);
  }, [disabled, isLoading, onMouseUp]);

  const handleMouseEnter = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    onMouseEnter?.(event);
  }, [disabled, isLoading, onMouseEnter]);

  const handleMouseLeave = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(false);
    onMouseLeave?.(event);
  }, [onMouseLeave]);

  const handleFocus = useCallback((event: React.FocusEvent<HTMLButtonElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  }, [onFocus]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLButtonElement>) => {
    setIsFocused(false);
    setIsPressed(false);
    onBlur?.(event);
  }, [onBlur]);

  const getBaseClasses = useCallback(() => {
    const motionClasses = prefersReducedMotion 
      ? "transition-none"
      : `
        transition-all duration-200 ease-out
        active:scale-[0.96] 
        hover:scale-[1.02] 
        disabled:hover:scale-100
        disabled:active:scale-100
        ${isPressed ? 'scale-[0.96]' : ''}
        ${isFocused && !disabled ? 'ring-2 ring-offset-2 ring-blue-500 ring-opacity-50' : ''}
      `;
     
    return `${BUTTON_BASE_CLASSES} ${motionClasses}`;
  }, [prefersReducedMotion, isPressed, isFocused, disabled]);

  const getEnhancedClasses = useCallback(() => {
    const enhancedClasses = [];
    
    if (glow && !disabled && !isLoading) {
      enhancedClasses.push(`
        shadow-lg
        hover:shadow-xl
        focus:shadow-2xl
        ${variant === 'primary' ? 'shadow-blue-500/25' : ''}
        ${variant === 'secondary' ? 'shadow-gray-500/25' : ''}
        ${intent === 'success' ? 'shadow-green-500/25' : ''}
        ${intent === 'warning' ? 'shadow-yellow-500/25' : ''}
        ${variant === 'destructive' ? 'shadow-red-500/25' : ''}
      `);
    }

    if (pulse && !disabled && !isLoading && !prefersReducedMotion) {
      enhancedClasses.push('animate-pulse');
    }

    return enhancedClasses.join(' ');
  }, [glow, pulse, variant, disabled, isLoading, prefersReducedMotion]);

  const variantClasses = BUTTON_VARIANT_CLASSES;
  const intentClasses = BUTTON_INTENT_CLASSES;
  const sizeClasses = BUTTON_SIZE_CLASSES;
  const iconOnlySizes = BUTTON_ICON_ONLY_SIZES;

  const finalClasses = [
    getBaseClasses(),
    variantClasses[variant as keyof typeof variantClasses] || variantClasses.primary,
    intentClasses[intent as keyof typeof intentClasses] || intentClasses.default,
    iconOnly ? iconOnlySizes[size] : sizeClasses[size],
    fullWidth ? 'w-full' : '',
    getEnhancedClasses(),
    className
  ].filter(Boolean).join(' ');

  const renderIcon = useCallback((position: 'left' | 'right') => {
    if (!icon || iconPosition !== position) return null;
    
    const iconSizeClass = iconOnly ? iconOnlySizes[size] : {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      icon: 'w-5 h-5'
    }[size];

    return (
      <span 
        className={`${iconSizeClass} ${position === 'left' ? 'mr-2' : 'ml-2'} ${isLoading ? 'animate-spin' : ''}`}
        aria-hidden="true"
      >
        {icon}
      </span>
    );
  }, [icon, iconPosition, iconOnly, isLoading, size, iconOnlySizes]);

  const renderLoadingSpinner = useCallback(() => {
    if (!isLoading) return null;
    
    return (
      <svg 
        className={`animate-spin ${iconOnly ? iconOnlySizes[size] : 'w-5 h-5'} ${iconPosition === 'right' && children ? 'ml-2' : iconPosition === 'left' && children ? 'mr-2' : ''}`}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  }, [isLoading, iconOnly, size, iconOnlySizes, iconPosition, children]);

  return (
    <button
      ref={combinedRef}
      className={finalClasses}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
      title={disabled && disabledReason ? disabledReason : undefined}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {/* Ripple effects */}
      {!prefersReducedMotion && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none bg-white opacity-30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animation: 'ripple 0.6s ease-out',
          }}
        />
      ))}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center">
        {renderLoadingSpinner()}
        {renderIcon('left')}
        {!iconOnly && (
          <span className={`${isLoading ? 'opacity-70' : ''}`}>
            {children}
          </span>
        )}
        {renderIcon('right')}
      </span>

      <style>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
});

EnhancedButton.displayName = 'EnhancedButton';

export default EnhancedButton;