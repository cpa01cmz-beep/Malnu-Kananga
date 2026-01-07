import React from 'react';

export type GradientButtonVariant = 'primary' | 'secondary';
export type GradientButtonSize = 'sm' | 'md' | 'lg';

interface GradientButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'href'> {
  variant?: GradientButtonVariant;
  size?: GradientButtonSize;
  fullWidth?: boolean;
  href?: string;
  children: React.ReactNode;
}

const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95";

const variantClasses: Record<GradientButtonVariant, string> = {
  primary: "bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500/50 hover:scale-[1.01]",
  secondary: "bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm text-neutral-700 dark:text-neutral-200 border-2 border-neutral-200 dark:border-neutral-600 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/40 focus:ring-primary-500/50 hover:scale-[1.01]",
};

const sizeClasses: Record<GradientButtonSize, string> = {
  sm: "px-6 py-2.5 text-sm",
  md: "px-8 sm:px-10 lg:px-12 py-4 text-sm sm:text-base",
  lg: "px-10 sm:px-12 lg:px-14 py-5 text-base sm:text-lg",
};

const GradientButton: React.FC<GradientButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  href,
  children,
  className = '',
  ...props
}) => {
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        {...(props as Record<string, unknown>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
};

export default GradientButton;
