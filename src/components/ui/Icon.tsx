import React from 'react';
import { IconProps, iconSizeClasses, iconColorClasses, iconVariantClasses } from './iconUtils';
import { createIcon } from './iconCreator';

// Enhanced Status Icons
export const SuccessIcon = createIcon([
  <path
    key="success"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
  />
]);

export const WarningIcon = createIcon([
  <path
    key="warning"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
  />
]);

export const ErrorIcon = createIcon([
  <path
    key="error"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
  />
]);

export const InfoIcon = createIcon([
  <path
    key="info"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  />
]);

// Enhanced Loading Icon
export const LoadingIcon: React.FC<IconProps> = ({
  className = '',
  size = 'md',
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    className={`${iconSizeClasses[size]} ${className} animate-spin`}
    {...props}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth={4}
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Enhanced Interactive Icons
export const ChevronDownIcon = createIcon([
  <path
    key="chevron"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M19 9l-7 7-7-7"
  />
]);

export const ChevronUpIcon = createIcon([
  <path
    key="chevron"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M5 15l7-7 7 7"
  />
]);

export const ChevronLeftIcon = createIcon([
  <path
    key="chevron"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M15 19l-7-7 7-7"
  />
]);

export const ChevronRightIcon = createIcon([
  <path
    key="chevron"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M9 5l7 7-7 7"
  />
]);

// Icon wrapper for consistent usage
export const Icon: React.FC<IconProps & { children: React.ReactNode }> = ({
  children,
  className = '',
  size = 'md',
  variant = 'outline',
  color = 'neutral',
  ariaHidden = true,
  ariaLabel,
  animated = false,
  clickable = false,
  ...props
}) => {
  const classes = [
    iconSizeClasses[size],
    iconColorClasses[color],
    iconVariantClasses[variant],
    className
  ];

  if (animated) {
    classes.push('transition-transform duration-200 ease-in-out');
  }

  if (clickable) {
    classes.push(
      'cursor-pointer hover:scale-110 active:scale-95',
      'transition-transform duration-150 ease-in-out',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50'
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={classes.join(' ')}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </svg>
  );
};

Icon.displayName = 'Icon';