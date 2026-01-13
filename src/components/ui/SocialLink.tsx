import React from 'react';

export type SocialLinkVariant = 'default' | 'primary' | 'secondary';
export type SocialLinkSize = 'sm' | 'md' | 'lg' | 'xl';

interface BaseSocialLinkProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  size?: SocialLinkSize;
  variant?: SocialLinkVariant;
  className?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
}

const baseClasses = "inline-flex items-center justify-center transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 rounded-xl shadow-sm hover:shadow-md hover:scale-110 active:scale-95";

const sizeClasses: Record<SocialLinkSize, string> = {
  sm: 'p-2',
  md: 'p-2.5',
  lg: 'p-3',
  xl: 'p-4',
};

const iconSizeClasses: Record<SocialLinkSize, string> = {
  sm: 'w-5 h-5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
};

const variantClasses: Record<SocialLinkVariant, { base: string; hover: string; hoverBg: string; hoverBgDark: string }> = {
  default: {
    base: 'text-neutral-400',
    hover: 'hover:text-primary-600 dark:hover:text-primary-400',
    hoverBg: 'hover:bg-primary-50',
    hoverBgDark: 'dark:hover:bg-primary-900/40',
  },
  primary: {
    base: 'text-primary-600 dark:text-primary-400',
    hover: 'hover:text-primary-700 dark:hover:text-primary-300',
    hoverBg: 'hover:bg-primary-100',
    hoverBgDark: 'dark:hover:bg-primary-900/60',
  },
  secondary: {
    base: 'text-neutral-500 dark:text-neutral-500',
    hover: 'hover:text-neutral-700 dark:hover:text-neutral-300',
    hoverBg: 'hover:bg-neutral-100',
    hoverBgDark: 'dark:hover:bg-neutral-800/50',
  },
};

const SocialLink: React.FC<BaseSocialLinkProps> = ({
  icon,
  label,
  href,
  onClick,
  size = 'lg',
  variant = 'default',
  className = '',
  target,
  rel = 'noopener noreferrer',
  disabled = false,
}) => {
  const variantStyle = variantClasses[variant];
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const hoverFocusClasses = disabled ? '' : `${variantStyle.hover} ${variantStyle.hoverBg} ${variantStyle.hoverBgDark}`;
  const classes = `
    ${sizeClasses[size]}
    ${variantStyle.base}
    ${hoverFocusClasses}
    ${disabledClasses}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const content = (
    <span className={iconSizeClasses[size]} aria-hidden="true">
      {icon}
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        aria-label={label}
        target={target}
        rel={rel}
        role={disabled ? "link" : undefined}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        onClick={disabled ? (e) => e.preventDefault() : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      aria-label={label}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
};

export default SocialLink;
