import React, { forwardRef, ButtonHTMLAttributes } from 'react';

export type CardVariant = 'default' | 'hover' | 'interactive' | 'gradient';

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
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

interface InteractiveCardProps extends Omit<CardProps, 'onClick'>, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'variant' | 'children'> {
  variant: 'interactive';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-6 sm:p-8'
};

const baseCardClasses = "rounded-xl shadow-card border border-neutral-200 dark:border-neutral-700 transition-all duration-300";

const Card = forwardRef<HTMLDivElement | HTMLButtonElement, CardProps | InteractiveCardProps>(({
  children,
  variant = 'default',
  gradient,
  padding = 'md',
  className = '',
  onClick,
  disabled,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  ...rest
}, ref) => {
  const paddingClass = paddingClasses[padding];

  const getCardClasses = (): string => {
    let classes = baseCardClasses;

    switch (variant) {
      case 'hover':
        classes += ' hover:shadow-card-hover hover:-translate-y-1 hover:scale-[1.02]';
        break;
      case 'interactive':
        classes += ' hover:shadow-card-hover hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 active:scale-95 text-left group';
        break;
      case 'gradient':
        if (gradient) {
          classes = `${classes.replace('shadow-card', 'shadow-card')} bg-gradient-to-br ${gradient.from} ${gradient.to}`;
          if (gradient.text === 'light') {
            classes += ' text-white';
          }
          classes += ' hover:shadow-card-hover hover:-translate-y-0.5 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900';
        }
        break;
      default:
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
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        className={getCardClasses()}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      className={getCardClasses()}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
