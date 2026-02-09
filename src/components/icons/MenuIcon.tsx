import React from 'react';

interface MenuIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ariaHidden?: boolean;
  ariaLabel?: string;
}

export const MenuIcon: React.FC<MenuIconProps> = ({
  className = '',
  size = 'md',
  ariaHidden = true,
  ariaLabel
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`${sizeClasses[size]} ${className} transition-transform duration-200 ease-in-out group-hover:scale-110`}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
        aria-hidden={ariaHidden}
        aria-label={ariaLabel}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M4 6h16M4 12h16m-7 6h7" 
        />
    </svg>
  );
};