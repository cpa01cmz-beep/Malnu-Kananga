import React, { forwardRef, ButtonHTMLAttributes } from 'react';

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

const baseCardClasses = "bg-white dark:bg-neutral-800 transition-all duration-300";

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
  ...rest
}, ref) => {
  const paddingClass = paddingClasses[padding];
  const roundedClass = roundedClasses[rounded];
  const shadowClass = shadowClasses[shadow];
  const borderClass = borderClasses[border];

  const getCardClasses = (): string => {
    let classes = baseCardClasses;
    classes += ` ${roundedClass} ${shadowClass} ${borderClass}`;

    switch (variant) {
      case 'hover':
        classes += ' hover:shadow-card-hover hover:-translate-y-1 hover:scale-[1.02]';
        break;
      case 'interactive':
        classes += ' hover:shadow-card-hover hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 active:scale-95 text-left group';
        break;
      case 'gradient':
        if (gradient) {
          classes = classes.replace('bg-white dark:bg-neutral-800', '');
          classes += ` bg-gradient-to-br ${gradient.from} ${gradient.to}`;
          if (gradient.text === 'light') {
            classes += ' text-white';
          }
            classes += ' hover:shadow-card-hover hover:-translate-y-0.5 hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900';
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
        role={role}
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
      role={role}
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
