import React from 'react';

export type IconButtonVariant = 'default' | 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'warning' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon: React.ReactNode;
  ariaLabel: string;
  tooltip?: string;
}

const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed";

const variantClasses: Record<IconButtonVariant, string> = {
  default: "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200 focus:ring-primary-500/50 hover:scale-110 active:scale-95",
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/50 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95",
  secondary: "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-2 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 focus:ring-primary-500/50 hover:scale-[1.02] active:scale-95",
  danger: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50 focus:ring-red-500/50 hover:scale-[1.02] active:scale-95",
  success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50 focus:ring-green-500/50 hover:scale-[1.02] active:scale-95",
  info: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50 focus:ring-blue-500/50 hover:scale-[1.02] active:scale-95",
  warning: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/50 focus:ring-orange-500/50 hover:scale-[1.02] active:scale-95",
  ghost: "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200 focus:ring-neutral-500/50 hover:scale-[1.05] active:scale-95",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "p-1",
  md: "p-2",
  lg: "p-2.5",
};

const iconSizeClasses: Record<IconButtonSize, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const IconButton: React.FC<IconButtonProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  ariaLabel,
  tooltip,
  className = '',
  ...props
}) => {
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={classes}
      aria-label={ariaLabel}
      title={tooltip || ariaLabel}
      {...props}
    >
      <span className={iconSizeClasses[size]} aria-hidden="true">
        {icon}
      </span>
    </button>
  );
};

export default IconButton;
