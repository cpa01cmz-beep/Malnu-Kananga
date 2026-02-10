/**
 * Mobile-First Responsive Container
 * Optimized spacing, breakpoints, and touch interactions
 */

import React, { forwardRef, ReactNode, CSSProperties } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type ContainerGutter = 'none' | 'sm' | 'md' | 'lg';

export interface ResponsiveContainerProps {
  children: ReactNode;
  size?: ContainerSize;
  padding?: ContainerPadding;
  gutter?: ContainerGutter;
  centered?: boolean;
  className?: string;
  style?: CSSProperties;
}

const ResponsiveContainer = forwardRef<HTMLDivElement, ResponsiveContainerProps>(({
  children,
  size = 'lg',
  padding = 'md',
  gutter = 'md',
  centered = true,
  className = '',
  style,
  ...props
}, ref) => {
  const prefersReducedMotion = useReducedMotion();

  const getSizeClasses = () => {
    const sizes = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      full: 'max-w-full',
    };
    return sizes[size];
  };

  const getPaddingClasses = () => {
    const paddings = {
      none: '',
      sm: 'px-4 py-3 sm:px-6 sm:py-4',
      md: 'px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8',
      lg: 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-12 xl:py-12',
      xl: 'px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 xl:px-16 xl:py-16',
    };
    return paddings[padding];
  };

  const getGutterClasses = () => {
    const gutters = {
      none: '',
      sm: 'gap-2 sm:gap-3',
      md: 'gap-3 sm:gap-4 lg:gap-6',
      lg: 'gap-4 sm:gap-6 lg:gap-8',
    };
    return gutters[gutter];
  };

  const finalClasses = [
    'w-full',
    getSizeClasses(),
    getPaddingClasses(),
    getGutterClasses(),
    centered ? 'mx-auto' : '',
    className
  ].filter(Boolean).join(' ');

  const containerStyle: CSSProperties = {
    ...style,
    transition: prefersReducedMotion ? 'none' : 'all 0.3s ease-out',
  };

  return (
    <div
      ref={ref}
      className={finalClasses}
      style={containerStyle}
      {...props}
    >
      {children}
    </div>
  );
});

ResponsiveContainer.displayName = 'ResponsiveContainer';

export default ResponsiveContainer;