import React from 'react';

export interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  showOnFocus?: boolean;
}

export interface FocusIndicatorProps {
  children: React.ReactNode;
  className?: string;
  color?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}

const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  className = '',
  showOnFocus = true,
}) => {
  return (
    <a
      href={href}
      className={`
        absolute top-0 left-0 z-50 bg-primary-600 text-white px-4 py-2 text-sm font-medium
        -translate-y-full transition-transform duration-200 ease-out rounded-br-lg
        focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${showOnFocus ? 'sr-only focus:not-sr-only' : ''}
        ${className}
      `}
    >
      {children}
    </a>
  );
};

const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  children,
  className = '',
  color = 'primary',
  size = 'md',
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'secondary':
        return 'focus-within:ring-secondary-500/50';
      case 'accent':
        return 'focus-within:ring-indigo-500/50';
      default:
        return 'focus-within:ring-primary-500/50';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'focus-within:ring-1';
      case 'lg':
        return 'focus-within:ring-4';
      default:
        return 'focus-within:ring-2';
    }
  };

  return (
    <div className={`relative ${getColorClasses()} ${getSizeClasses()} ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            className: `
              focus:outline-none focus-within:outline-none
              ${(child.props as Record<string, unknown>)?.className || ''}
            `,
          });
        }
        return child;
      })}
    </div>
  );
};

export { SkipLink, FocusIndicator };
export default { SkipLink, FocusIndicator };