import React from 'react';
import { XML_NAMESPACES } from '../../constants';

// New simplified variants
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
export type ButtonIntent = 'default' | 'success' | 'warning' | 'info';

// Legacy variants for backward compatibility
type LegacyButtonVariant = 'danger' | 'success' | 'info' | 'warning' | 'indigo' | 'green-solid' | 'blue-solid' | 'purple-solid' | 'red-solid' | 'orange-solid' | 'teal-solid';

export type AllButtonVariant = ButtonVariant | LegacyButtonVariant;
export type ButtonSize = 'icon' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AllButtonVariant;
  intent?: ButtonIntent;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  ariaLabel?: string;
  children?: React.ReactNode;
  /** Reason shown in tooltip when button is disabled */
  disabledReason?: string;
}

const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275) focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:-translate-y-0.5 disabled:hover:translate-y-0 touch-manipulation relative overflow-hidden group ripple-effect focus-ring-enhanced btn-polished micro-hover btn-micro a11y-button shadow-sm hover:shadow-md active:shadow-sm border border-transparent";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/50 shadow-md hover:shadow-lg hover:scale-[1.02] btn-hover-primary focus-visible-enhanced hover-glow-enhanced gradient-hover border-primary-600 hover:border-primary-700",
  secondary: "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-2 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 focus:ring-primary-500/50 hover:scale-[1.02] transition-smooth hover:shadow-sm",
  ghost: "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200 focus:ring-neutral-500/50 hover:scale-[1.05] transition-bounce hover:bg-neutral-100/80 dark:hover:bg-neutral-700/80",
  destructive: "bg-red-600 text-white dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 focus:ring-red-500/50 shadow-md hover:shadow-lg hover:scale-[1.02] gradient-hover border-red-600 hover:border-red-700 dark:border-red-500 dark:hover:border-red-600",
  outline: "bg-transparent text-neutral-600 dark:text-neutral-400 border-2 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 focus:ring-primary-500/50 hover:scale-[1.02] transition-smooth hover:bg-neutral-50/80 dark:hover:bg-neutral-700/80 hover:shadow-sm",
};

const intentClasses: Record<ButtonIntent, string> = {
  default: "",
  success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/50",
  warning: "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500/50",
  info: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/50",
};

const sizeClasses: Record<ButtonSize, string> = {
  icon: "px-3 py-3 text-sm min-w-[44px] min-h-[44px]",
  sm: "px-4 py-2.5 text-sm min-h-[44px]",
  md: "px-5 py-3 text-sm sm:text-base min-h-[48px]",
  lg: "px-6 py-4 text-base sm:text-lg min-h-[52px]",
};

const iconOnlySizes: Record<ButtonSize, string> = {
  icon: "p-3",
  sm: "p-3",
  md: "p-3",
  lg: "p-4",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  intent = 'default',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  iconOnly = false,
  ariaLabel,
  children = null,
  className = '',
  disabled,
  disabledReason,
  ...props
}, ref) => {
  // Map legacy variants to new ones
  const normalizeVariant = (variant: AllButtonVariant): ButtonVariant => {
    // Map legacy solid colors to new intent system
    if (variant === 'green-solid') return 'primary';
    if (variant === 'blue-solid') return 'primary';
    if (variant === 'purple-solid') return 'primary';
    if (variant === 'red-solid' || variant === 'danger') return 'destructive';
    if (variant === 'orange-solid' || variant === 'warning') return 'primary';
    if (variant === 'teal-solid' || variant === 'success') return 'primary';
    if (variant === 'info' || variant === 'indigo') return 'primary';
    
    // Return if already a valid new variant
    return variant as ButtonVariant;
  };

  // Determine intent from legacy variant if not explicitly provided
  const getIntent = (): ButtonIntent => {
    if (intent !== 'default') return intent;
    
    // Extract intent from legacy solid variants
    if (variant === 'green-solid' || variant === 'success') return 'success';
    if (variant === 'blue-solid' || variant === 'info' || variant === 'indigo') return 'info';
    if (variant === 'red-solid' || variant === 'danger') return 'default';
    if (variant === 'orange-solid' || variant === 'warning') return 'warning';
    if (variant === 'purple-solid') return 'info';
    if (variant === 'teal-solid') return 'success';
    
    return 'default';
  };

  const normalizedVariant = normalizeVariant(variant);
  const determinedIntent = getIntent();

  const getVariantClasses = () => {
    // For variants with intents, combine them appropriately
    if (normalizedVariant === 'secondary' && determinedIntent !== 'default') {
      return `bg-white dark:bg-neutral-800 text-${determinedIntent}-600 dark:text-${determinedIntent}-400 border-2 border-${determinedIntent}-200 dark:border-${determinedIntent}-700 hover:bg-${determinedIntent}-50 dark:hover:bg-${determinedIntent}-900/20 hover:border-${determinedIntent}-500 focus:ring-${determinedIntent}-500/50 hover:scale-[1.02] transition-smooth`;
    }
    
    if (normalizedVariant === 'outline' && determinedIntent !== 'default') {
      return `bg-transparent text-${determinedIntent}-600 dark:text-${determinedIntent}-400 border-2 border-${determinedIntent}-300 dark:border-${determinedIntent}-600 hover:bg-${determinedIntent}-50 dark:hover:bg-${determinedIntent}-900/20 hover:border-${determinedIntent}-500 focus:ring-${determinedIntent}-500/50 hover:scale-[1.02] transition-smooth`;
    }
    
    if (normalizedVariant === 'ghost' && determinedIntent !== 'default') {
      return `bg-transparent text-${determinedIntent}-600 dark:text-${determinedIntent}-400 hover:bg-${determinedIntent}-50 dark:hover:bg-${determinedIntent}-900/20 focus:ring-${determinedIntent}-500/50 hover:scale-[1.05] transition-bounce`;
    }
    
    // Use intent classes for primary variant when intent is specified
    if (normalizedVariant === 'primary' && determinedIntent !== 'default') {
      return `${baseClasses} ${intentClasses[determinedIntent]} shadow-md hover:shadow-lg hover:scale-[1.02] gradient-hover focus-visible-enhanced hover-glow-enhanced`;
    }
    
    return variantClasses[normalizedVariant];
  };

  const classes = `
    ${baseClasses}
    ${getVariantClasses()}
    ${iconOnly ? iconOnlySizes[size] : sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${isLoading ? 'cursor-wait' : ''}
    ${disabled && disabledReason ? 'group relative' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const computedAriaLabel = iconOnly ? (ariaLabel || (typeof children === 'string' ? children : 'Button')) : ariaLabel;

  const ariaProps: Record<string, string | boolean | undefined> = {};

  if (computedAriaLabel) {
    ariaProps['aria-label'] = computedAriaLabel;
  }

  if (isLoading) {
    ariaProps['aria-busy'] = 'true';
  }

  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      className={classes}
      disabled={isDisabled}
      aria-live={isLoading ? 'polite' : undefined}
      aria-disabled={isDisabled}
      {...ariaProps}
      {...props}
    >
      {isLoading && iconOnly ? (
        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns={XML_NAMESPACES.SVG} fill="none" viewBox="0 0 24 24" role="status" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns={XML_NAMESPACES.SVG} fill="none" viewBox="0 0 24 24" role="status" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children && <span className="ml-2">{children}</span>}
        </>
      ) : iconOnly ? (
        <span className="flex items-center">{icon}</span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2 flex items-center">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2 flex items-center">{icon}</span>
          )}
        </>
      )}
      {/* Tooltip for disabled state */}
      {isDisabled && disabledReason && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium bg-neutral-800 dark:bg-neutral-700 text-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
          {disabledReason}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700"></span>
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
