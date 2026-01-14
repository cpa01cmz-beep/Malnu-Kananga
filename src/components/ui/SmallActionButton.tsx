import React from 'react';

export type SmallActionButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'warning' | 'neutral';

interface SmallActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SmallActionButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-3 py-1.5";

const variantClasses: Record<SmallActionButtonVariant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/50",
  secondary: "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:ring-primary-500/50",
  danger: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50 focus:ring-red-500/50",
  success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50 focus:ring-green-500/50",
  info: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:ring-blue-500/50",
  warning: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/50 focus:ring-orange-500/50",
  neutral: "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 focus:ring-neutral-500/50",
};

const SmallActionButton: React.FC<SmallActionButtonProps> = ({
  variant = 'info',
  isLoading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${fullWidth ? 'flex-1' : ''}
    ${isLoading ? 'cursor-wait' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const ariaProps: Record<string, string | boolean | undefined> = {};
  
  if (isLoading) {
    ariaProps['aria-busy'] = 'true';
  }

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...ariaProps}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="status" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-1.5 flex items-center">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-1.5 flex items-center">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default SmallActionButton;
