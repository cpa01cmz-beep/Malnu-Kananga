import React, { useState } from 'react';
import { useReducedMotion } from '../../hooks/useAccessibility';

interface DisabledLinkButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Reason why the button is disabled (shown in tooltip) */
  disabledReason: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DisabledLinkButton - A reusable disabled button with accessible tooltip
 * 
 * Micro-UX Features:
 * - Shows tooltip on hover AND focus (keyboard accessible)
 * - Respects reduced motion preferences
 * - Proper ARIA labeling
 * - Smooth fade animations
 * - Consistent styling with design system
 */
const DisabledLinkButton: React.FC<DisabledLinkButtonProps> = ({
  children,
  disabledReason,
  ariaLabel,
  className = '',
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleMouseEnter = () => setIsTooltipVisible(true);
  const handleMouseLeave = () => setIsTooltipVisible(false);
  const handleFocus = () => setIsTooltipVisible(true);
  const handleBlur = () => setIsTooltipVisible(false);

  const baseClasses = `
    text-left
    font-medium
    cursor-not-allowed
    opacity-60
    relative
    group
    rounded
    px-1
    py-0.5
    transition-colors
    duration-200
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-primary-500/50
    focus-visible:ring-offset-1
    dark:focus-visible:ring-offset-neutral-800
  `;

  const tooltipClasses = `
    absolute
    bottom-full
    left-1/2
    -translate-x-1/2
    mb-2
    px-3
    py-1.5
    text-xs
    font-medium
    bg-neutral-800
    dark:bg-neutral-700
    text-white
    rounded-lg
    shadow-lg
    whitespace-nowrap
    z-50
    pointer-events-none
    ${prefersReducedMotion ? 'opacity-100' : 'transition-all duration-200'}
    ${isTooltipVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}
  `;

  const tooltipArrowClasses = `
    absolute
    top-full
    left-1/2
    -translate-x-1/2
    border-4
    border-transparent
    border-t-neutral-800
    dark:border-t-neutral-700
  `;

  return (
    <button
      type="button"
      disabled
      className={`${baseClasses} ${className}`.trim()}
      title={disabledReason}
      aria-label={ariaLabel || `${children}`}
      aria-disabled="true"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      <span className={tooltipClasses} role="tooltip">
        {disabledReason}
        <span className={tooltipArrowClasses} aria-hidden="true" />
      </span>
    </button>
  );
};

export default DisabledLinkButton;
