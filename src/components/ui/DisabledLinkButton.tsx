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
  /** Show "Coming Soon" badge - makes it clear feature is planned, not broken */
  showComingSoonBadge?: boolean;
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
  showComingSoonBadge = true,
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
    transition-all
    duration-200
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-primary-500/50
    focus-visible:ring-offset-1
    dark:focus-visible:ring-offset-neutral-800
    hover:opacity-80
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
      aria-label={ariaLabel || `${children} (Segera hadir)`}
      aria-disabled="true"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <span className="flex items-center gap-2">
        {children}
        {showComingSoonBadge && (
          <span
            className={`
              inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold
              bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400
              rounded-full border border-neutral-300 dark:border-neutral-600
              ${prefersReducedMotion ? '' : 'transition-all duration-200 group-hover:bg-primary-100 group-hover:text-primary-600 dark:group-hover:bg-primary-900/30 dark:group-hover:text-primary-400'}
            `.trim()}
            aria-hidden="true"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Segera
          </span>
        )}
      </span>
      <span className={tooltipClasses} role="tooltip">
        {disabledReason}
        <span className={tooltipArrowClasses} aria-hidden="true" />
      </span>
    </button>
  );
};

export default DisabledLinkButton;
