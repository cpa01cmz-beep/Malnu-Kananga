import React from 'react';

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'primary' | 'purple' | 'indigo' | 'orange' | 'red';
export type BadgeSize = 'sm' | 'md' | 'lg' | 'xl';
export type BadgeStyle = 'solid' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  styleType?: BadgeStyle;
  rounded?: boolean;
}

const baseClasses = "inline-flex items-center justify-center font-semibold transition-colors duration-200";

const redVariantStyles: Record<BadgeStyle, string> = {
  solid: "bg-red-700 text-white dark:bg-red-600 dark:text-white",
  outline: "border-2 border-red-600 text-red-700 dark:border-red-400 dark:text-red-300",
};

const variantClasses: Record<BadgeVariant, Record<BadgeStyle, string>> = {
  success: {
    solid: "bg-green-700 text-white dark:bg-green-600 dark:text-white",
    outline: "border-2 border-green-600 text-green-700 dark:border-green-400 dark:text-green-300",
  },
  error: redVariantStyles,
  warning: {
    solid: "bg-yellow-600 text-white dark:bg-yellow-500 dark:text-white",
    outline: "border-2 border-yellow-600 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300",
  },
  info: {
    solid: "bg-blue-700 text-white dark:bg-blue-600 dark:text-white",
    outline: "border-2 border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300",
  },
  neutral: {
    solid: "bg-neutral-700 text-white dark:bg-neutral-600 dark:text-white",
    outline: "border-2 border-neutral-500 text-neutral-700 dark:border-neutral-400 dark:text-neutral-300",
  },
  primary: {
    solid: "bg-primary-600 text-white dark:bg-primary-500 dark:text-white",
    outline: "border-2 border-primary-500 text-primary-700 dark:border-primary-400 dark:text-primary-300",
  },
  purple: {
    solid: "bg-purple-700 text-white dark:bg-purple-600 dark:text-white",
    outline: "border-2 border-purple-600 text-purple-700 dark:border-purple-400 dark:text-purple-300",
  },
  indigo: {
    solid: "bg-indigo-700 text-white dark:bg-indigo-600 dark:text-white",
    outline: "border-2 border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300",
  },
  orange: {
    solid: "bg-orange-700 text-white dark:bg-orange-600 dark:text-white",
    outline: "border-2 border-orange-600 text-orange-700 dark:border-orange-400 dark:text-orange-300",
  },
  red: redVariantStyles,
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
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;
