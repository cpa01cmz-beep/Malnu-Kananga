/**
 * Enhanced Badge Component with Advanced Animations
 * Sophisticated visual feedback, pulse effects, and status indicators
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useHapticFeedback } from '../../utils/hapticFeedback';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';
export type BadgeShape = 'rounded' | 'pill' | 'square';

export interface EnhancedBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  pulse?: boolean;
  glow?: boolean;
  animated?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  removable?: boolean;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

const EnhancedBadge: React.FC<EnhancedBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  pulse = false,
  glow = false,
  animated = true,
  clickable = false,
  onClick,
  onRemove,
  removable = false,
  count,
  maxCount = 99,
  showZero = false,
  className = '',
  disabled = false,
  ariaLabel,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showRemoveAnimation, setShowRemoveAnimation] = useState(false);
  
  const badgeRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { onTap, onSuccess, onError } = useHapticFeedback();

  // Entrance animation
  useEffect(() => {
    if (animated && !prefersReducedMotion) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [animated, prefersReducedMotion]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    if (clickable && onClick) {
      e.stopPropagation();
      setIsPressed(true);
      onTap();
      onClick();
      setTimeout(() => setIsPressed(false), 150);
    }
  }, [disabled, clickable, onClick, onTap]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.stopPropagation();
    setShowRemoveAnimation(true);
    onError();
    
    setTimeout(() => {
      onRemove?.();
    }, 300);
  }, [disabled, onRemove, onError]);

  const displayCount = count !== undefined ? count : undefined;
  const shouldShowCount = displayCount !== undefined && (showZero || displayCount > 0);
  const formattedCount = shouldShowCount && displayCount > maxCount ? `${maxCount}+` : displayCount?.toString();

  const getSizeClasses = useCallback(() => {
    const sizes = {
      xs: 'text-xs px-1.5 py-0.5 min-w-[1.25rem] min-h-[1.25rem]',
      sm: 'text-xs px-2 py-1 min-w-[1.5rem] min-h-[1.5rem]',
      md: 'text-sm px-2.5 py-1 min-w-[2rem] min-h-[2rem]',
      lg: 'text-base px-3 py-1.5 min-w-[2.5rem] min-h-[2.5rem]',
    };
    return sizes[size] || sizes.md;
  }, [size]);

  const getShapeClasses = useCallback(() => {
    const shapes = {
      rounded: 'rounded-md',
      pill: 'rounded-full',
      square: 'rounded-none',
    };
    return shapes[shape] || shapes.rounded;
  }, [shape]);

  const getVariantClasses = useCallback(() => {
    const variants = {
      default: 'bg-gray-100 text-gray-800 border border-gray-200',
      primary: 'bg-blue-100 text-blue-800 border border-blue-200',
      secondary: 'bg-purple-100 text-purple-800 border border-purple-200',
      success: 'bg-green-100 text-green-800 border border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      error: 'bg-red-100 text-red-800 border border-red-200',
      info: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    };
    return variants[variant] || variants.default;
  }, [variant]);

  const getInteractiveClasses = useCallback(() => {
    const classes = [];
    
    if (clickable && !disabled) {
      classes.push(
        'cursor-pointer',
        'transition-all',
        'duration-200',
        'ease-out',
        prefersReducedMotion ? '' : 'hover:scale-105 active:scale-95'
      );
    }

    if (isPressed && clickable) {
      classes.push('scale-95');
    }

    if (isHovered && clickable && !disabled) {
      classes.push('shadow-md');
    }

    return classes.join(' ');
  }, [clickable, disabled, isPressed, isHovered, prefersReducedMotion]);

  const getAnimationClasses = useCallback(() => {
    const classes: string[] = [];
    
    if (!isVisible && animated && !prefersReducedMotion) {
      classes.push('opacity-0', 'transform', 'scale-0');
    } else if (isVisible) {
      classes.push('opacity-100', 'transform', 'scale-100');
    }

    if (showRemoveAnimation) {
      classes.push('opacity-0', 'transform', 'scale-0', 'rotate-180');
    }

    if (pulse && !prefersReducedMotion) {
      classes.push('animate-pulse');
    }

    if (glow && !prefersReducedMotion) {
      classes.push('shadow-lg');
      
      const glowVariants = {
        default: 'shadow-gray-500/25',
        primary: 'shadow-blue-500/25',
        secondary: 'shadow-purple-500/25',
        success: 'shadow-green-500/25',
        warning: 'shadow-yellow-500/25',
        error: 'shadow-red-500/25',
        info: 'shadow-cyan-500/25',
      };
      
      classes.push(glowVariants[variant] || glowVariants.default);
    }

    return classes.join(' ');
  }, [isVisible, animated, prefersReducedMotion, showRemoveAnimation, pulse, glow, variant]);

  const finalClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'font-semibold',
    'relative',
    'transition-all',
    'duration-200',
    'ease-out',
    getSizeClasses(),
    getShapeClasses(),
    getVariantClasses(),
    getInteractiveClasses(),
    getAnimationClasses(),
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');

  const renderContent = () => {
    if (shouldShowCount && formattedCount) {
      return (
        <span className="font-bold">
          {formattedCount}
        </span>
      );
    }

    if (typeof children === 'string' || typeof children === 'number') {
      return <span>{children}</span>;
    }

    return children;
  };

  return (
    <span
      ref={badgeRef}
      className={finalClasses}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={clickable ? 'button' : 'status'}
      aria-label={ariaLabel}
      tabIndex={clickable && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (clickable && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
    >
      {/* Dot indicator for status badges */}
      {pulse && !children && !shouldShowCount && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span 
            className={`w-2 h-2 rounded-full bg-current ${
              !prefersReducedMotion ? 'animate-ping' : ''
            }`}
          />
        </span>
      )}

      {/* Main content */}
      <span className="relative z-10 flex items-center gap-1">
        {renderContent()}
        
        {/* Remove button */}
        {removable && onRemove && (
          <button
            type="button"
            onClick={handleRemove}
            className={`
              ml-1 p-0.5 rounded-full hover:bg-black/10 
              transition-colors duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label="Remove badge"
            disabled={disabled}
          >
            <svg 
              className="w-3 h-3" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </span>

      {/* Animated border glow */}
      {glow && !disabled && !prefersReducedMotion && (
        <span 
          className={`
            absolute inset-0 rounded-inherit
            border-2 border-current opacity-30 animate-pulse
          `}
        />
      )}

      <style>{`
        @keyframes badge-entrance {
          from {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes badge-exit {
          from {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          to {
            opacity: 0;
            transform: scale(0) rotate(180deg);
          }
        }
      `}</style>
    </span>
  );
};

export default EnhancedBadge;