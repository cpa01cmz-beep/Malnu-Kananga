import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'info' | 'warning' | 'indigo' | 'green-solid' | 'blue-solid' | 'purple-solid' | 'red-solid' | 'orange-solid' | 'teal-solid' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  ariaLabel?: string;
  children?: React.ReactNode;
}

const baseClasses = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/50 shadow-sm hover:shadow-md hover:scale-[1.02]",
  secondary: "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-2 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 focus:ring-primary-500/50 hover:scale-[1.02]",
  ghost: "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200 focus:ring-neutral-500/50 hover:scale-[1.05]",
  danger: "bg-red-700 text-white dark:bg-red-600 dark:text-white hover:bg-red-800 dark:hover:bg-red-700 focus:ring-red-500/50 shadow-sm hover:shadow-md hover:scale-[1.02]",
  success: "bg-green-700 text-white dark:bg-green-600 dark:text-white hover:bg-green-800 dark:hover:bg-green-700 focus:ring-green-500/50 shadow-sm hover:shadow-md hover:scale-[1.02]",
  info: "bg-blue-700 text-white dark:bg-blue-600 dark:text-white hover:bg-blue-800 dark:hover:bg-blue-700 focus:ring-blue-500/50 shadow-sm hover:shadow-md hover:scale-[1.02]",
  warning: "bg-orange-600 text-white dark:bg-orange-500 dark:text-white hover:bg-orange-700 dark:hover:bg-orange-600 focus:ring-orange-500/50 shadow-sm hover:shadow-md hover:scale-[1.02]",
  indigo: "bg-indigo-700 text-white dark:bg-indigo-600 dark:text-white hover:bg-indigo-800 dark:hover:bg-indigo-700 focus:ring-indigo-500/50 shadow-sm hover:shadow-md hover:scale-[1.02]",
  'green-solid': "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/50 transition-all duration-200 ease-out shadow-sm hover:shadow-md hover:scale-[1.02]",
  'blue-solid': "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/50 transition-all duration-200 ease-out shadow-sm hover:shadow-md hover:scale-[1.02]",
  'purple-solid': "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500/50 transition-all duration-200 ease-out shadow-sm hover:shadow-md hover:scale-[1.02]",
  'red-solid': "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50 transition-all duration-200 ease-out shadow-sm hover:shadow-md hover:scale-[1.02]",
  'orange-solid': "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500/50 transition-all duration-200 ease-out shadow-sm hover:shadow-md hover:scale-[1.02]",
  'teal-solid': "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500/50 transition-all duration-200 ease-out shadow-sm hover:shadow-md hover:scale-[1.02]",
  outline: "bg-transparent text-neutral-600 dark:text-neutral-400 border-2 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 focus:ring-primary-500/50 hover:scale-[1.02]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm sm:text-base",
  lg: "px-6 py-3 text-base sm:text-lg",
};

const iconOnlySizes: Record<ButtonSize, string> = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-2.5",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
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
  ...props
}, ref) => {
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${iconOnly ? iconOnlySizes[size] : sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${isLoading ? 'cursor-wait' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const ariaProps: Record<string, string | boolean> = {};
  
  if (iconOnly) {
    ariaProps['aria-label'] = ariaLabel || '';
  } else if (ariaLabel) {
    ariaProps['aria-label'] = ariaLabel;
  }
  
  if (isLoading) {
    ariaProps['aria-busy'] = true;
  }

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || isLoading}
      {...ariaProps}
      {...props}
    >
      {isLoading && iconOnly ? (
        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="status" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="status" aria-hidden="true">
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
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
