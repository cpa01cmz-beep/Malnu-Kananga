import React from 'react';
import { XML_NAMESPACES } from '../../constants';
import { IconProps } from './types';

export type { IconProps };

export const iconSizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10'
};

export const iconColorClasses = {
  primary: 'text-primary-600 dark:text-primary-400',
  secondary: 'text-neutral-600 dark:text-neutral-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-orange-600 dark:text-orange-400',
  danger: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  neutral: 'text-neutral-500 dark:text-neutral-400'
};

export const iconVariantClasses = {
  solid: 'fill-current',
  outline: 'stroke-current',
  duotone: 'fill-current opacity-80'
};

export const createIcon = (paths: React.ReactNode | React.ReactNode[]) => {
  const IconComponent: React.FC<IconProps> = ({
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
        xmlns={XML_NAMESPACES.SVG}
        viewBox="0 0 24 24"
        className={classes.join(' ')}
        aria-hidden={ariaHidden}
        aria-label={ariaLabel}
        {...props}
      >
        {Array.isArray(paths) ? paths : <path d={paths as string} />}
      </svg>
    );
  };

  IconComponent.displayName = 'Icon';
  return IconComponent;
};