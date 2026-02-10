import React from 'react';
import { XML_NAMESPACES } from '../../constants';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { 
  buildButtonClasses, 
  BUTTON_SIZE_CLASSES, 
  BUTTON_ICON_ONLY_SIZES, 
  BUTTON_BASE_CLASSES, 
  BUTTON_VARIANT_CLASSES, 
  BUTTON_INTENT_CLASSES 
} from '../../utils/buttonUtils';

// Haptic feedback utility
const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator && window.innerWidth <= 768) {
    const pattern = {
      light: [10],
      medium: [25],
      heavy: [50]
    };
    navigator.vibrate(pattern[type]);
  }
};

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

const getBaseClasses = (prefersReducedMotion: boolean) => {
  const motionClasses = prefersReducedMotion 
    ? "transition-none"
    : "active:scale-[0.97] hover:scale-[1.02] hover:-translate-y-0.5 disabled:hover:scale-100 disabled:hover:translate-y-0";
     
  return `${BUTTON_BASE_CLASSES} ${motionClasses}`;
};

const variantClasses = BUTTON_VARIANT_CLASSES;
const intentClasses = BUTTON_INTENT_CLASSES;
const sizeClasses = BUTTON_SIZE_CLASSES;
const iconOnlySizes = BUTTON_ICON_ONLY_SIZES;

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
  const prefersReducedMotion = useReducedMotion();
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
      const motionClasses = prefersReducedMotion ? '' : 'hover:scale-[1.02]';
      return `${intentClasses[determinedIntent]} shadow-md hover:shadow-lg ${motionClasses} gradient-hover focus-visible-enhanced hover-glow-enhanced`;
    }
    
    return variantClasses[normalizedVariant];
  };

  const classes = buildButtonClasses({
    baseClasses: getBaseClasses(prefersReducedMotion),
    variantClasses: getVariantClasses(),
    sizeClasses: iconOnly ? iconOnlySizes[size] : sizeClasses[size],
    fullWidth,
    isLoading,
    hasDisabledReason: !!(disabled && disabledReason),
    className
  });

  const computedAriaLabel = iconOnly ? (ariaLabel || (typeof children === 'string' ? children : 'Button')) : ariaLabel;

  const ariaProps: Record<string, string | boolean | undefined> = {};

  if (computedAriaLabel) {
    ariaProps['aria-label'] = computedAriaLabel;
  }

  if (isLoading) {
    ariaProps['aria-busy'] = 'true';
  }

  const isDisabled = disabled || isLoading;

  const handlePressStart = () => {
    if (!isDisabled) {
      triggerHapticFeedback(normalizedVariant === 'primary' ? 'medium' : 'light');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Enhanced keyboard navigation
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerHapticFeedback('light');
    }
  };

  return (
    <button
      ref={ref}
      className={classes}
      disabled={isDisabled}
      aria-live={isLoading ? 'polite' : undefined}
      aria-disabled={isDisabled}
      onTouchStart={handlePressStart}
      onMouseDown={handlePressStart}
      onKeyDown={handleKeyDown}
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
      {/* Ripple effect overlay */}
      <span className="absolute inset-0 rounded-xl overflow-hidden">
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
      </span>
      
      {/* Focus ring enhancement */}
      <span className="absolute inset-0 rounded-xl ring-2 ring-transparent group-focus-within:ring-primary-500/50 group-focus-within:ring-offset-2 group-focus-within:ring-offset-white dark:group-focus-within:ring-offset-neutral-900 transition-all duration-200 pointer-events-none"></span>
      
      {/* Loading shimmer for loading state */}
      {isLoading && (
        <span className="absolute inset-0 rounded-xl overflow-hidden">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></span>
        </span>
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
