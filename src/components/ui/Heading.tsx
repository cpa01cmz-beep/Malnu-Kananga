
import React from 'react';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl';
export type HeadingWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type HeadingTracking = 'tight' | 'normal' | 'wide';

interface HeadingProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'level'> {
  level?: HeadingLevel;
  size?: HeadingSize;
  weight?: HeadingWeight;
  tracking?: HeadingTracking;
  leading?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

const baseClasses = 'text-neutral-900 dark:text-white';

const sizeClasses: Record<HeadingSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl sm:text-xl',
  '3xl': 'text-3xl sm:text-2xl',
  '4xl': 'text-4xl sm:text-3xl md:text-2xl',
  '5xl': 'text-5xl sm:text-4xl md:text-3xl lg:text-2xl',
  '6xl': 'text-6xl sm:text-5xl md:text-4xl lg:text-3xl',
  '7xl': 'text-7xl sm:text-6xl md:text-5xl lg:text-4xl xl:text-3xl',
  '8xl': 'text-8xl sm:text-7xl md:text-6xl lg:text-5xl xl:text-4xl',
};

const weightClasses: Record<HeadingWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const trackingClasses: Record<HeadingTracking, string> = {
  tight: 'tracking-tight',
  normal: 'tracking-normal',
  wide: 'tracking-wide',
};

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(({
  level = 2,
  size = '2xl',
  weight = 'bold',
  tracking = 'normal',
  leading,
  id,
  className = '',
  children,
  ...props
}, ref) => {
  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${weightClasses[weight]}
    ${trackingClasses[tracking]}
    ${leading ? leading : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const levelToTag = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
    5: 'h5',
    6: 'h6',
  };

  const Tag = levelToTag[level] as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return React.createElement(
    Tag,
    {
      ref,
      id,
      className: classes,
      ...props
    },
    children
  );
});

Heading.displayName = 'Heading';

export default Heading;
