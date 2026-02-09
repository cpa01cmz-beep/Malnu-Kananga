import React from 'react';
import { IconProps, iconSizeClasses, iconColorClasses, iconVariantClasses } from './iconUtils';

export const createIcon = (
  paths: React.ReactNode | React.ReactNode[]
) => {
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
        xmlns="http://www.w3.org/2000/svg"
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
