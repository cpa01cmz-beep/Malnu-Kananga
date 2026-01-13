import React from 'react';
import { GRADIENT_CLASSES } from '../../config/gradients';
import { OPACITY_TOKENS } from '../../constants';

export type GradientButtonVariant = 'primary' | 'secondary';
export type GradientButtonSize = 'sm' | 'md' | 'lg';

type CommonProps = {
  variant?: GradientButtonVariant;
  size?: GradientButtonSize;
  fullWidth?: boolean;
  className?: string;
};

interface GradientButtonProps extends CommonProps {
  href?: string;
  children: React.ReactNode;
}

const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95";

const variantClasses: Record<GradientButtonVariant, string> = {
  primary: `${GRADIENT_CLASSES.CHAT_HEADER} text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500/50% hover:scale-[1.01]`,
  secondary: `${OPACITY_TOKENS.WHITE_95} ${OPACITY_TOKENS.NEUTRAL_800_95} ${OPACITY_TOKENS.BACKDROP_BLUR_SM} text-neutral-700 dark:text-neutral-200 border-2 border-neutral-200 dark:border-neutral-600 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/40% ${OPACITY_TOKENS.RING_PRIMARY_50} hover:scale-[1.01]`,
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
    const { id, target, rel, onClick } = props as GradientButtonProps & { id?: string; target?: string; rel?: string; onClick?: React.MouseEventHandler };
    return (
      <a
        href={href}
        id={id}
        target={target}
        rel={rel}
        onClick={onClick}
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
      {...(props as React.HTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
};

export default GradientButton;
