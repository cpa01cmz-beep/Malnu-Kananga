/**
 * Enhanced Interactive Card with Advanced Micro-interactions
 * Sophisticated hover effects, depth transitions, and accessibility
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useHapticFeedback } from '../../utils/hapticFeedback';

export type CardVariant = 'default' | 'hover' | 'interactive' | 'gradient';
export type CardRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
export type CardShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'card' | 'float';
export type CardBorder = 'none' | 'neutral-200' | 'neutral-100';

export type CardGradient = {
  from: string;
  to: string;
  text?: 'light' | 'dark';
};

export interface EnhancedCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  gradient?: CardGradient;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: CardRounded;
  shadow?: CardShadow;
  border?: CardBorder;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaLive?: 'off' | 'polite' | 'assertive';
  liftOnHover?: boolean;
  glowOnHover?: boolean;
  pressScale?: boolean;
  ripple?: boolean;
  tilt?: boolean;
}

interface MousePosition {
  x: number;
  y: number;
}

const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  variant = 'default',
  gradient,
  padding = 'md',
  rounded = 'lg',
  shadow = 'md',
  border = 'neutral-200',
  className = '',
  onClick,
  disabled = false,
  role = 'article',
  ariaLabel,
  ariaDescribedBy,
  ariaLive = 'off',
  liftOnHover = true,
  glowOnHover = false,
  pressScale = true,
  ripple = true,
  tilt = false,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  
  const prefersReducedMotion = useReducedMotion();
  const { onTap, onPress } = useHapticFeedback();

  const isInteractive = variant === 'interactive' || !!onClick;

  const createRipple = useCallback((event: React.MouseEvent) => {
    if (!ripple || prefersReducedMotion || disabled) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = { x, y, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  }, [ripple, prefersReducedMotion, disabled]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!tilt || !isHovered || prefersReducedMotion) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      ${isPressed && pressScale ? 'scale(0.98)' : ''}
      ${isHovered && liftOnHover && !isPressed ? 'translateY(-4px)' : ''}
    `;

    setMousePosition({ x, y });
  }, [tilt, isHovered, isPressed, prefersReducedMotion, pressScale, liftOnHover]);

  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    setIsHovered(true);
    if (isInteractive) {
      onTap();
    }
  }, [isInteractive, onTap]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
    
    const card = cardRef.current;
    if (card) {
      card.style.transform = '';
    }
  }, []);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled || !isInteractive) return;
    setIsPressed(true);
    createRipple(event);
    onPress();
  }, [disabled, isInteractive, createRipple, onPress]);

  const handleMouseUp = useCallback(() => {
    if (disabled || !isInteractive) return;
    setIsPressed(false);
  }, [disabled, isInteractive]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (disabled || !isInteractive) return;
    onClick?.();
  }, [disabled, isInteractive, onClick]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const cleanup = () => {
      card.style.transform = '';
    };

    return cleanup;
  }, []);

  const getBaseClasses = useCallback(() => {
    const classes = [
      'relative',
      'transition-all',
      'duration-300',
      'ease-out',
      'backdrop-blur-sm',
    ];

    if (prefersReducedMotion) {
      classes.push('transition-none');
    }

    return classes.join(' ');
  }, [prefersReducedMotion]);

  const getVariantClasses = useCallback(() => {
    const variants = {
      default: 'bg-white border border-neutral-200',
      hover: 'bg-white border border-neutral-200 hover:border-neutral-300',
      interactive: 'bg-white border border-neutral-200 cursor-pointer',
      gradient: 'bg-gradient-to-br text-white cursor-pointer',
    };

    const variantClasses = variants[variant] || variants.default;

    if (gradient && variant === 'gradient') {
      return `bg-gradient-to-br from-${gradient.from} to-${gradient.to} ${gradient.text === 'light' ? 'text-white' : 'text-gray-900'}`;
    }

    return variantClasses;
  }, [variant, gradient]);

  const getInteractiveClasses = useCallback(() => {
    if (!isInteractive || disabled) return '';

    const classes = [];

    if (liftOnHover && !prefersReducedMotion) {
      classes.push('hover:shadow-lg');
    }

    if (glowOnHover && !prefersReducedMotion) {
      classes.push('hover:shadow-blue-500/20');
    }

    if (pressScale && !prefersReducedMotion) {
      classes.push('active:scale-[0.98]');
    }

    if (isPressed) {
      classes.push('scale-[0.98]');
    }

    return classes.join(' ');
  }, [isInteractive, disabled, liftOnHover, glowOnHover, pressScale, isPressed, prefersReducedMotion]);

  const getPaddingClasses = useCallback(() => {
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-6 sm:p-8',
    };
    return paddings[padding] || paddings.md;
  }, [padding]);

  const getRoundedClasses = useCallback(() => {
    const roundeds = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
      full: 'rounded-full',
    };
    return roundeds[rounded] || roundeds.lg;
  }, [rounded]);

  const getShadowClasses = useCallback(() => {
    const shadows = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      card: 'shadow-card',
      float: 'shadow-float',
    };
    return shadows[shadow] || shadows.md;
  }, [shadow]);

  const getBorderClasses = useCallback(() => {
    const borders = {
      none: '',
      'neutral-200': 'border-neutral-200',
      'neutral-100': 'border-neutral-100',
    };
    return borders[border] || borders['neutral-200'];
  }, [border]);

  const getFocusClasses = useCallback(() => {
    if (!isInteractive || disabled) return '';
    
    if (isFocused) {
      return 'ring-2 ring-blue-500 ring-offset-2';
    }
    
    return 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  }, [isInteractive, disabled, isFocused]);

  const finalClasses = [
    getBaseClasses(),
    getVariantClasses(),
    getInteractiveClasses(),
    getPaddingClasses(),
    getRoundedClasses(),
    getShadowClasses(),
    getBorderClasses(),
    getFocusClasses(),
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');

  const cardStyle: React.CSSProperties = {};

  if (isHovered && !prefersReducedMotion) {
    cardStyle.transform = 'translateY(-2px)';
  }

  return (
    <div
      ref={cardRef}
      className={finalClasses}
      style={cardStyle}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-live={ariaLive}
      aria-disabled={disabled}
      tabIndex={isInteractive && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (isInteractive && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      {...props}
    >
      {/* Ripple Effects */}
      {!prefersReducedMotion && ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none bg-white opacity-20 rounded-full animate-ping"
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
      <div className="relative z-10">
        {children}
      </div>

      {/* Animated Border (for interactive cards) */}
      {isInteractive && isFocused && !disabled && !prefersReducedMotion && (
        <div className="absolute inset-0 rounded-lg pointer-events-none">
          <div className="absolute inset-0 rounded-lg border-2 border-blue-500 animate-pulse" />
        </div>
      )}

      <style>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        .shadow-card {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .shadow-float {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
};

export default EnhancedCard;