import React from 'react';
import { GRADIENT_CLASSES } from '../../config/gradients';
import { OPACITY_TOKENS } from '../../constants';

export type GradientButtonVariant = 'primary' | 'secondary';
export type GradientButtonSize = 'sm' | 'md' | 'lg';

type CommonProps = {
  variant?: GradientButtonVariant;
  size?: GradientButtonSize;
  fullWidth?: boolean;
  className?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  disabled?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
}

interface GradientButtonProps extends CommonProps {
  href?: string;
  children: React.ReactNode;
}

const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95";

const variantClasses: Record<GradientButtonVariant, string> = {
  primary: `${GRADIENT_CLASSES.CHAT_HEADER} text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500/50% hover:scale-[1.01]`,
  secondary: `${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} ${OPACITY_TOKENS.BACKDROP_BLUR_SM} text-neutral-700 dark:text-neutral-200 border-2 border-neutral-200 dark:border-neutral-600 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/40% ${OPACITY_TOKENS.RING_PRIMARY_50} hover:scale-[1.01]`,
};

const sizeClasses: Record<GradientButtonSize, string> = {
  sm: "px-6 py-2.5 text-sm",
  md: "px-8 sm:px-10 lg:px-12 py-4 text-sm sm:text-base",
  lg: "px-10 sm:px-12 lg:px-14 py-5 text-base sm:text-lg",
};

const GradientButton: React.FC<GradientButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  href,
  ariaLabel,
  ariaDescribedBy,
  disabled = false,
  isLoading = false,
  icon,
  iconPosition = 'left',
  iconOnly = false,
  children,
  className = '',
  ...props
}) => {
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${isLoading ? 'cursor-wait' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const ariaProps: Record<string, string | boolean | undefined> = {
    'aria-label': iconOnly ? (ariaLabel || (typeof children === 'string' ? children : 'Button')) : ariaLabel,
    'aria-describedby': ariaDescribedBy,
  };

  if (isLoading) {
    ariaProps['aria-busy'] = 'true';
  }

  if (href) {
    const { id, target, rel, onClick } = props as GradientButtonProps & { id?: string; target?: string; rel?: string; onClick?: React.MouseEventHandler };
    return (
      <a
        href={href}
        id={id}
        target={target}
        rel={rel}
        onClick={onClick}
        className={classes}
        {...ariaProps}
        {...(props as Record<string, unknown>)}
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="status" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
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
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || isLoading}
      {...ariaProps}
      {...(props as React.HTMLAttributes<HTMLButtonElement>)}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="status" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
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
    </button>
  );
};

export default GradientButton;
