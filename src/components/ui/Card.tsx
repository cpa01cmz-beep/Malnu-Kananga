import React, { forwardRef, ButtonHTMLAttributes, useState } from 'react';

export type CardVariant = 'default' | 'hover' | 'interactive' | 'gradient';

// Haptic feedback utility
const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator && window.innerWidth <= 768) {
    const pattern = {
      light: [5],
      medium: [15],
      heavy: [30]
    };
    navigator.vibrate(pattern[type]);
  }
};
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

const baseCardClasses = "bg-white/95 dark:bg-neutral-800/95 transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275) touch-manipulation relative overflow-hidden group focus-visible-enhanced card-polished depth-1 backdrop-blur-sm glass-effect-elevated hover-lift-enhanced border border-neutral-200/60 dark:border-neutral-700/60 card-accessible";

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
  const [rippleKey, setRippleKey] = useState(0);

  const paddingClass = paddingClasses[padding];
  const roundedClass = roundedClasses[rounded];
  const shadowClass = shadowClasses[shadow];
  const borderClass = borderClasses[border];

  const handleInteractionStart = () => {
    if (variant === 'interactive' && !disabled) {
      setIsPressed(true);
      triggerHapticFeedback('light');
    }
  };

  const handleInteractionEnd = () => {
    if (variant === 'interactive' && !disabled) {
      setIsPressed(false);
      triggerHapticFeedback('medium');
      // Trigger ripple animation
      setRippleKey(prev => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (variant === 'interactive' && !disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      triggerHapticFeedback('light');
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
    }
  };

  const getCardClasses = (): string => {
    let classes = baseCardClasses;
    classes += ` ${roundedClass} ${shadowClass} ${borderClass}`;

    switch (variant) {
      case 'hover':
        classes += ' hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 hover-depth elevate-on-hover depth-3 hover:shadow-primary-500/15 card-glow';
        break;
      case 'interactive':
        classes += ` hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.02] focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 ${isPressed ? 'active:scale-[0.96] active:shadow-sm active:translate-y-0' : 'active:scale-[0.96] active:translate-y-0'} text-left group hover-depth elevate-on-hover depth-3 cursor-pointer btn-press hover:shadow-primary-500/20 card-glow mobile-gesture-feedback haptic-feedback`;
        break;
      case 'gradient':
        if (gradient) {
          classes = classes.replace('bg-white/95 dark:bg-neutral-800/95', '');
          classes += ` bg-gradient-to-br ${gradient.from} ${gradient.to} gradient-overlay glass-effect-elevated`;
          if (gradient.text === 'light') {
            classes += ' text-white text-contrast-enhanced';
          }
          classes += ' hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 hover-depth card-glow';
        }
        break;
      default:
        classes += ' hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 transition-smooth hover-lift-enhanced';
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
         {/* Enhanced ripple effect overlay */}
         <span key={rippleKey} className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
           <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
           <span className="absolute inset-0 bg-gradient-to-br from-transparent via-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
         </span>
         
         {/* Enhanced focus ring */}
         <span className="absolute inset-0 rounded-xl ring-2 ring-transparent group-focus-within:ring-primary-500/60 group-focus-within:ring-offset-2 group-focus-within:ring-offset-white dark:group-focus-within:ring-offset-neutral-900 transition-all duration-300 pointer-events-none group-focus-within:shadow-lg group-focus-within:shadow-primary-500/20"></span>
         
         {/* Press state overlay */}
         {isPressed && (
           <span className="absolute inset-0 rounded-xl bg-black/8 dark:bg-white/8 pointer-events-none transition-opacity duration-150"></span>
         )}
         
         {/* Glow effect for interactive cards */}
         <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></span>
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
      {/* Subtle hover effect for non-interactive cards */}
      {variant === 'hover' && (
        <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
        </span>
      )}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
