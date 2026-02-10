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
  onClick?: (() => void) | undefined;
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

const baseCardClasses = "bg-white dark:bg-neutral-800 transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275) touch-manipulation relative overflow-hidden group focus-visible-enhanced card-polished depth-1 backdrop-blur-sm hover:backdrop-blur-md before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:rounded-[inherit]";

const Card = forwardRef<HTMLDivElement | HTMLButtonElement, CardProps | InteractiveCardProps>((props, ref) => {
  const {
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
  } = props;
  const paddingClass = paddingClasses[padding];
  const roundedClass = roundedClasses[rounded];
  const shadowClass = shadowClasses[shadow];
  const borderClass = borderClasses[border];

  const getCardClasses = (): string => {
    let classes = baseCardClasses;
    classes += ` ${roundedClass} ${shadowClass} ${borderClass}`;

    switch (variant) {
      case 'hover':
        classes += ' hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 hover-depth elevate-on-hover depth-2 hover:shadow-primary-500/20 hover:rotate-[0.5deg] transition-all duration-300';
        break;
      case 'interactive':
        classes += ' hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 active:scale-[0.98] active:translate-y-0 text-left group hover-depth elevate-on-hover depth-2 cursor-pointer btn-press hover:shadow-primary-500/20 hover:rotate-[0.5deg] transition-all duration-300';
        break;
      case 'gradient':
        if (gradient) {
          classes = classes.replace('bg-white dark:bg-neutral-800', '');
          classes += ` bg-gradient-to-br ${gradient.from} ${gradient.to} gradient-overlay`;
          if (gradient.text === 'light') {
            classes += ' text-white';
          }
          classes += ' hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 hover-depth hover:rotate-[0.25deg] transition-all duration-300';
        }
        break;
      default:
        classes += ' hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.005] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 transition-all duration-300';
        break;
    }

    return `${classes} ${paddingClass} ${className}`;
  };

  const isInteractive = variant === 'interactive' || typeof onClick === 'function';

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
      aria-live={ariaLive}
      tabIndex={onClick ? 0 : undefined}
      className={getCardClasses()}
      onClick={onClick}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
