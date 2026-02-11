import React, { useState, useRef, useEffect } from 'react';
import { useReducedMotion } from '../../hooks/useAccessibility';
import { useHapticFeedback } from '../../utils/hapticFeedback';

interface HTMLElementExtended extends HTMLElement {
  focus(): void;
}

export interface FloatingActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  tooltip?: string;
  badge?: number | string;
  pulse?: boolean;
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  onClick,
  position = 'bottom-right',
  size = 'md',
  variant = 'primary',
  disabled = false,
  tooltip,
  badge,
  pulse = false,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { onPress, onTap } = useHapticFeedback();

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-14 h-14 text-base',
    lg: 'w-16 h-16 text-lg',
  };

  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white shadow-lg hover:shadow-xl border border-neutral-200 dark:border-neutral-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl',
  };

  const handleClick = () => {
    if (disabled) return;
    onPress();
    onClick();
  };

  const handleMouseDown = () => {
    if (disabled) return;
    setIsPressed(true);
    onTap();
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Accessibility: enhanced focus management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && buttonRef.current) {
        const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const focusableArray = Array.from(focusableElements) as HTMLElementExtended[];
        const currentIndex = focusableArray.indexOf(buttonRef.current);
        
        if (e.shiftKey && currentIndex === 0) {
          e.preventDefault();
          focusableArray[focusableArray.length - 1]?.focus();
        } else if (!e.shiftKey && currentIndex === focusableArray.length - 1) {
          e.preventDefault();
          focusableArray[0]?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          rounded-full flex items-center justify-center
          transition-all duration-300 ease-out
          ${isPressed ? 'scale-95' : 'hover:scale-110'}
          ${pulse && !disabled && !prefersReducedMotion ? 'animate-pulse' : ''}
          ${!disabled ? 'group' : ''}
          focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/50
          relative overflow-hidden
          backdrop-blur-sm
          ${prefersReducedMotion ? 'transition-none' : ''}
        `}
        aria-label={label}
        title={tooltip || label}
        aria-describedby={showTooltip ? 'fab-tooltip' : undefined}
      >
        {/* Ripple effect */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
        
        {/* Icon */}
        <span className={`relative z-10 ${isPressed ? 'scale-90' : 'scale-100'} transition-transform duration-150`}>
          {icon}
        </span>

        {/* Badge */}
        {badge !== undefined && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1 animate-bounce shadow-md">
            {badge}
          </span>
        )}

        {/* Pulse ring for attention */}
        {pulse && !disabled && !prefersReducedMotion && (
          <span className="absolute inset-0 rounded-full bg-primary-400 opacity-30 animate-ping" />
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && tooltip && (
        <div
          id="fab-tooltip"
          className={`absolute ${position.includes('bottom') ? 'bottom-full mb-2' : 'top-full mt-2'} ${position.includes('right') ? 'right-0' : 'left-0'} px-3 py-2 bg-neutral-900 dark:bg-neutral-700 text-white text-sm rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-50 ${prefersReducedMotion ? 'opacity-100' : 'animate-in fade-in slide-in-from-bottom-1 duration-200'}`}
          role="tooltip"
        >
          {tooltip}
          <span className={`absolute ${position.includes('bottom') ? 'top-full left-1/2 -translate-x-1/2 border-t-4 border-t-neutral-900 dark:border-t-neutral-700' : 'bottom-full left-1/2 -translate-x-1/2 border-b-4 border-b-neutral-900 dark:border-b-neutral-700'} border-l-4 border-r-4 border-l-transparent border-r-transparent w-0 h-0`} />
        </div>
      )}

      {/* Screen reader announcements */}
      <span className="sr-only" role="status" aria-live="polite">
        {badge !== undefined && `${badge} notifications`}
      </span>
    </div>
  );
};

FloatingActionButton.displayName = 'FloatingActionButton';

export default FloatingActionButton;