import React, { useState, useCallback } from 'react';
import { useHapticFeedback } from '../../utils/hapticFeedback';
import { useReducedMotion } from '../../hooks/useAccessibility';
import { generateComponentId } from '../../utils/idGenerator';

export interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'glow' | 'slide' | 'float' | 'enhanced';
  onClick?: () => void;
  disabled?: boolean;
  as?: 'div' | 'button' | 'a';
  href?: string;
  target?: string;
  ariaLabel?: string;
  ariaDescription?: string;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = '',
  hoverEffect = 'lift',
  onClick,
  disabled = false,
  as: Component = 'div',
  href,
  target,
  ariaLabel,
  ariaDescription,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const descriptionId = ariaDescription ? generateComponentId('card-desc') : undefined;
  const { onTap, onPress } = useHapticFeedback();
  const prefersReducedMotion = useReducedMotion();

  const isClickable = !!onClick && !disabled;

  const getHoverClasses = () => {
    switch (hoverEffect) {
      case 'lift':
        return 'hover-lift';
      case 'glow':
        return 'hover-glow';
      case 'slide':
        return 'hover-slide-right';
      case 'float':
        return 'hover-float';
      case 'enhanced':
        return 'card-hover-enhanced';
      default:
        return 'hover-lift';
    }
  };

  const baseClasses = `
    bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700
    p-6 select-none
    ${isClickable ? 'cursor-pointer' : ''}
    ${getHoverClasses()}
    ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
    ${isFocused ? 'ring-2 ring-primary-500/50 ring-offset-2 dark:ring-offset-neutral-900' : ''}
    ${isPressed && !prefersReducedMotion ? 'scale-[0.98]' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isClickable || disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsPressed(true);
      onPress();

      setTimeout(() => {
        setIsPressed(false);
        onClick?.();
      }, 150);
    }
  }, [isClickable, disabled, onClick, onPress]);

  const handleKeyUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setIsPressed(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    if (isClickable && !disabled) {
      setIsPressed(true);
      onTap();
    }
  }, [isClickable, disabled, onTap]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  if (Component === 'a') {
    return (
      <a 
        href={disabled ? undefined : href} 
        target={target}
        className={baseClasses}
        onClick={disabled ? undefined : onClick}
        aria-label={ariaLabel}
        aria-disabled={disabled}
      >
        {children}
      </a>
    );
  }

  if (Component === 'button') {
    return (
      <button 
        type="button" 
        disabled={disabled}
        className={baseClasses}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    );
  }

  const hasInteraction = !!onClick;
  const divProps = hasInteraction ? {
    role: 'button' as const,
    tabIndex: disabled ? -1 : 0,
    'aria-disabled': disabled,
    'aria-label': ariaLabel,
    'aria-describedby': descriptionId,
    onKeyDown: disabled ? undefined : handleKeyDown,
    onKeyUp: disabled ? undefined : handleKeyUp,
    onFocus: disabled ? undefined : handleFocus,
    onBlur: disabled ? undefined : handleBlur,
    onMouseDown: disabled ? undefined : handleMouseDown,
    onMouseUp: disabled ? undefined : handleMouseUp,
    onMouseLeave: disabled ? undefined : handleMouseUp,
  } : {
    'aria-disabled': disabled,
    'aria-label': ariaLabel,
  };

  return (
    <>
      <div 
        className={baseClasses}
        onClick={disabled ? undefined : onClick}
        {...divProps}
      >
        {children}
      </div>
      {ariaDescription && descriptionId && (
        <span id={descriptionId} className="sr-only">
          {ariaDescription}
        </span>
      )}
    </>
  );
};

export default InteractiveCard;