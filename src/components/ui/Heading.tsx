import React from 'react';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl';
export type HeadingWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type HeadingTracking = 'tight' | 'normal' | 'wide';
export type HeadingVariant = 'default' | 'display' | 'section' | 'card' | 'modal';

interface HeadingProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'level'> {
  level?: HeadingLevel;
  size?: HeadingSize;
  weight?: HeadingWeight;
  tracking?: HeadingTracking;
  leading?: string;
  variant?: HeadingVariant;
  gradient?: boolean;
  maxWidth?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

const baseClasses = 'text-neutral-900 dark:text-white';

// Enhanced fluid typography with clamp() for better responsive behavior
const sizeClasses: Record<HeadingSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'clamp(1.5rem, 4vw, 1.875rem)', // 24px - 30px
  '3xl': 'clamp(1.875rem, 5vw, 2.25rem)', // 30px - 36px
  '4xl': 'clamp(2.25rem, 6vw, 3rem)', // 36px - 48px
  '5xl': 'clamp(2.5rem, 7vw, 3.75rem)', // 40px - 60px
  '6xl': 'clamp(3rem, 8vw, 4.5rem)', // 48px - 72px
  '7xl': 'clamp(3.5rem, 9vw, 5.25rem)', // 56px - 84px
  '8xl': 'clamp(4rem, 10vw, 6rem)', // 64px - 96px
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
  variant = 'default',
  gradient = false,
  maxWidth,
  id,
  className = '',
  children,
  ...props
}, ref) => {
  // Enhanced variant-specific classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'display':
        return 'font-bold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600';
      case 'section':
        return 'font-semibold leading-snug scroll-mt-20 focus:scroll-mt-24';
      case 'card':
        return 'font-medium leading-relaxed';
      case 'modal':
        return 'font-semibold leading-tight';
      default:
        return '';
    }
  };

  // Enhanced line height based on size
  const getOptimalLeading = () => {
    if (leading) return leading;
    
    const leadingMap: Record<HeadingSize, string> = {
      xs: 'leading-none',
      sm: 'leading-none',
      base: 'leading-none',
      lg: 'leading-none',
      xl: 'leading-none',
      '2xl': 'leading-tight',
      '3xl': 'leading-tight',
      '4xl': 'leading-tight',
      '5xl': 'leading-tight',
      '6xl': 'leading-tight',
      '7xl': 'leading-none',
      '8xl': 'leading-none',
    };
    
    return leadingMap[size] || 'leading-tight';
  };

  // Enhanced gradient classes
  const getGradientClasses = () => {
    if (!gradient) return '';
    
    return 'text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 dark:from-primary-400 dark:via-primary-500 dark:to-primary-400 animate-gradient bg-[length:200%_auto]';
  };

  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${weightClasses[weight]}
    ${trackingClasses[tracking]}
    ${getOptimalLeading()}
    ${getVariantClasses()}
    ${getGradientClasses()}
    ${maxWidth ? `max-w-[${maxWidth}]` : ''}
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
      style: maxWidth ? { maxWidth } : undefined,
      ...props
    },
    children
  );
});

Heading.displayName = 'Heading';

export default Heading;
