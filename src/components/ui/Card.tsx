import React, { forwardRef, ButtonHTMLAttributes, useState } from 'react';
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

export interface CardProps {
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
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-live'?: 'off' | 'polite' | 'assertive';
}

interface InteractiveCardProps extends Omit<CardProps, 'onClick' | 'role'>, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'variant' | 'children'> {
  variant: 'interactive';
  role?: string;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-6 sm:p-8'
};

const roundedClasses: Record<CardRounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full'
};

const shadowClasses: Record<CardShadow, string> = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  card: 'shadow-card',
  float: 'shadow-float'
};

const borderClasses: Record<CardBorder, string> = {
  none: '',
  'neutral-200': 'border border-neutral-200 dark:border-neutral-700',
  'neutral-100': 'border border-neutral-100 dark:border-neutral-700'
};

const baseCardClasses = "bg-white/95 dark:bg-neutral-800/95 transition-all duration-300 ease-out touch-manipulation relative overflow-hidden group focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 backdrop-blur-sm border border-neutral-200/60 dark:border-neutral-700/60 hover:border-neutral-300/80 dark:hover:border-neutral-600/80 hover:backdrop-blur-md";

const Card = forwardRef<HTMLDivElement | HTMLButtonElement, CardProps | InteractiveCardProps>(({
  children,
  variant = 'default',
  gradient,
  padding = 'md',
  rounded = 'xl',
  shadow = 'card',
  border = 'neutral-200',
  className = '',
  onClick,
  disabled,
  role,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-live': ariaLive,
  ...rest
}, ref) => {
  const [isPressed, setIsPressed] = useState(false);
  const { onTap, onPress } = useHapticFeedback();

  const paddingClass = paddingClasses[padding];
  const roundedClass = roundedClasses[rounded];
  const shadowClass = shadowClasses[shadow];
  const borderClass = borderClasses[border];

  const handleInteractionStart = () => {
    if (variant === 'interactive' && !disabled) {
      setIsPressed(true);
      onTap();
    }
  };

  const handleInteractionEnd = () => {
    if (variant === 'interactive' && !disabled) {
      setIsPressed(false);
      onPress();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (variant === 'interactive' && !disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onTap();
      setIsPressed(true);
      // Trigger the button's native click event
      (e.target as HTMLButtonElement).click();
      setTimeout(() => setIsPressed(false), 150);
    }
  };

  const getCardClasses = (): string => {
    let classes = baseCardClasses;
    classes += ` ${roundedClass} ${shadowClass} ${borderClass}`;

    switch (variant) {
      case 'hover':
        classes += ' hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01] cursor-pointer';
        break;
      case 'interactive':
        classes += ` hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01] cursor-pointer ${
          isPressed ? 'scale-[0.98] shadow-sm translate-y-0' : ''
        }`;
        break;
      case 'gradient':
        if (gradient) {
          classes = classes.replace('bg-white/95 dark:bg-neutral-800/95', '');
          classes += ` bg-gradient-to-br ${gradient.from} ${gradient.to}`;
          if (gradient.text === 'light') {
            classes += ' text-white';
          }
          classes += ' hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01] cursor-pointer';
        }
        break;
      default:
        classes += ' hover:shadow-md';
        break;
    }

    return `${classes} ${paddingClass} ${className}`;
  };

  const isInteractive = variant === 'interactive' || !!onClick;

  if (isInteractive) {
    return (
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        disabled={disabled}
        role={role}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        className={getCardClasses()}
        onTouchStart={handleInteractionStart}
        onMouseDown={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={() => setIsPressed(false)}
        onKeyDown={handleKeyDown}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
      {children}
       {/* Enhanced press state overlay */}
       {isPressed && (
         <span className="absolute inset-0 rounded-xl bg-black/6 dark:bg-white/6 pointer-events-none transition-opacity duration-150">
           <span className="absolute inset-0 bg-gradient-to-br from-transparent via-black/2 to-black/4"></span>
           <span className="absolute inset-0 rounded-xl border border-black/10 dark:border-white/10"></span>
         </span>
       )}
        {/* Enhanced shimmer effect for interactive cards */}
        {(variant === 'interactive' || variant === 'hover') && (
          <>
            <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
            </span>
            {/* Additional subtle glow on hover */}
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"></span>
            </span>
          </>
        )}
      </button>
    );
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-live={ariaLive}
      className={getCardClasses()}
    >
      {children}
      {/* Enhanced hover effect for non-interactive cards */}
      {variant === 'hover' && (
        <>
          <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
          </span>
          {/* Subtle inner glow on hover */}
          <span className="absolute inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_0_15px_rgba(255,255,255,0.03)]"></span>
          </span>
        </>
      )}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
