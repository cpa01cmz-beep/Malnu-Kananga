import React from 'react';
import { getColorClasses } from '../../config/colors';

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'primary' | 'secondary' | 'outline' | 'default' | 'gray' | 'blue' | 'purple' | 'orange' | 'green' | 'red' | 'yellow';
export type BadgeSize = 'sm' | 'md' | 'lg' | 'xl';
export type BadgeStyle = 'solid' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  styleType?: BadgeStyle;
  rounded?: boolean;
  /** Accessible label for screen readers. If not provided, will use children as label. */
  ariaLabel?: string;
  /** Role for the badge. Defaults to 'status' for status indicators. Use 'generic' for non-status badges. */
  role?: 'status' | 'generic' | 'img';
  /** Whether the badge is purely decorative and should be hidden from screen readers */
  decorative?: boolean;
}

const baseClasses = "inline-flex items-center justify-center font-semibold transition-colors duration-200";

const variantClasses: Record<BadgeVariant, Record<BadgeStyle, string>> = {
  success: {
    solid: getColorClasses('success', 'badge'),
    outline: "border-2 border-green-600 text-green-700 dark:border-green-400 dark:text-green-300",
  },
  error: {
    solid: getColorClasses('error', 'badge'),
    outline: "border-2 border-red-600 text-red-700 dark:border-red-400 dark:text-red-300",
  },
  warning: {
    solid: getColorClasses('warning', 'badge'),
    outline: "border-2 border-yellow-600 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300",
  },
  info: {
    solid: getColorClasses('info', 'badge'),
    outline: "border-2 border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300",
  },
  neutral: {
    solid: getColorClasses('neutral', 'badge'),
    outline: "border-2 border-neutral-500 text-neutral-700 dark:border-neutral-400 dark:text-neutral-300",
  },
  primary: {
    solid: getColorClasses('primary', 'badge'),
    outline: "border-2 border-primary-500 text-primary-700 dark:border-primary-400 dark:text-primary-300",
  },
  secondary: {
    solid: getColorClasses('secondary', 'badge'),
    outline: "border-2 border-purple-600 text-purple-700 dark:border-purple-400 dark:text-purple-300",
  },
  outline: {
    solid: getColorClasses('neutral', 'badge'),
    outline: "border-2 border-neutral-500 text-neutral-700 dark:border-neutral-400 dark:text-neutral-300",
  },
  default: {
    solid: getColorClasses('neutral', 'badge'),
    outline: "border-2 border-neutral-500 text-neutral-700 dark:border-neutral-400 dark:text-neutral-300",
  },
  gray: {
    solid: "bg-gray-600 text-white dark:bg-gray-500 dark:text-white",
    outline: "border-2 border-gray-500 text-gray-700 dark:border-gray-400 dark:text-gray-300",
  },
  blue: {
    solid: "bg-blue-600 text-white dark:bg-blue-500 dark:text-white",
    outline: "border-2 border-blue-500 text-blue-700 dark:border-blue-400 dark:text-blue-300",
  },
  purple: {
    solid: "bg-purple-600 text-white dark:bg-purple-500 dark:text-white",
    outline: "border-2 border-purple-500 text-purple-700 dark:border-purple-400 dark:text-purple-300",
  },
  orange: {
    solid: "bg-orange-600 text-white dark:bg-orange-500 dark:text-white",
    outline: "border-2 border-orange-500 text-orange-700 dark:border-orange-400 dark:text-orange-300",
  },
  green: {
    solid: "bg-green-600 text-white dark:bg-green-500 dark:text-white",
    outline: "border-2 border-green-500 text-green-700 dark:border-green-400 dark:text-green-300",
  },
  red: {
    solid: "bg-red-600 text-white dark:bg-red-500 dark:text-white",
    outline: "border-2 border-red-500 text-red-700 dark:border-red-400 dark:text-red-300",
  },
  yellow: {
    solid: "bg-yellow-600 text-white dark:bg-yellow-500 dark:text-white",
    outline: "border-2 border-yellow-500 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300",
  },
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2 py-1 text-xs",
  lg: "px-2.5 py-1.5 text-sm",
  xl: "px-5 py-2.5 text-sm",
};

const roundedClasses: Record<BadgeSize, string> = {
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
};

const fullRoundedClasses: Record<BadgeSize, string> = {
  sm: "rounded-full",
  md: "rounded-full",
  lg: "rounded-full",
  xl: "rounded-full",
};

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  styleType = 'solid',
  rounded = true,
  className = '',
  ariaLabel,
  role = 'status',
  decorative = false,
  ...props
}) => {
  const classes = `
    ${baseClasses}
    ${variantClasses[variant][styleType]}
    ${sizeClasses[size]}
    ${rounded ? fullRoundedClasses[size] : roundedClasses[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <span
      className={classes}
      role={role}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
