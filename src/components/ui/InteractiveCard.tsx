import React from 'react';

export interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'glow' | 'slide' | 'float' | 'enhanced';
  onClick?: () => void;
  disabled?: boolean;
  as?: 'div' | 'button' | 'a';
  href?: string;
  target?: string;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = '',
  hoverEffect = 'lift',
  onClick,
  disabled = false,
  as: Component = 'div',
  href,
  target,
}) => {
  const getHoverClasses = () => {
    switch (hoverEffect) {
      case 'lift':
        return 'hover-lift';
      case 'glow':
        return 'hover-glow';
      case 'slide':
        return 'hover-slide-right';
      case 'float':
        return 'hover-float';
      case 'enhanced':
        return 'card-hover-enhanced';
      default:
        return 'hover-lift';
    }
  };

  const baseClasses = `
    bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700
    p-6 cursor-pointer select-none
    ${getHoverClasses()}
    ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const sharedProps = {
    className: baseClasses,
    onClick: disabled ? undefined : onClick,
    'aria-disabled': disabled,
  };

  if (Component === 'a') {
    return (
      <a href={disabled ? undefined : href} target={target} {...sharedProps}>
        {children}
      </a>
    );
  }

  if (Component === 'button') {
    return (
      <button type="button" disabled={disabled} {...sharedProps}>
        {children}
      </button>
    );
  }

  return <Component {...sharedProps}>{children}</Component>;
};

export default InteractiveCard;