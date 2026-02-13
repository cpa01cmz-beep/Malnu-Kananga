import React, { useState, useCallback, useRef, useId } from 'react';
import { useReducedMotion } from '../../hooks/useAccessibility';
import { UI_DELAYS } from '../../constants';

export type FilterPillVariant = 'blue' | 'green' | 'purple' | 'orange';

interface FilterPillProps {
  /** The label to display in the pill */
  label: string;
  /** The current filter value being displayed */
  value: string;
  /** Callback when the filter is cleared */
  onClear: () => void;
  /** Keyboard shortcut hint to display (default: "Delete") */
  shortcut?: string;
  /** Color variant for the pill */
  variant?: FilterPillVariant;
  /** Accessible label for the clear button */
  'aria-label'?: string;
  /** Optional unique ID for aria-describedby */
  id?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FilterPill - A micro-UX component for displaying active filters
 * 
 * Features:
 * - Delete key support to clear the filter
 * - Tooltip hint showing the keyboard shortcut
 * - Smooth animations with reduced motion support
 * - Full accessibility with aria-describedby and role="tooltip"
 * - Visual feedback on hover/focus
 */
const FilterPill: React.FC<FilterPillProps> = ({
  label,
  value,
  onClear,
  shortcut = 'Delete',
  variant = 'blue',
  'aria-label': ariaLabel,
  id: providedId,
  className = '',
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [showShortcutHint, setShowShortcutHint] = useState(false);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const uniqueId = useId();
  const pillId = providedId || `filter-pill-${uniqueId}`;
  const tooltipId = `${pillId}-tooltip`;

  const variantClasses: Record<FilterPillVariant, string> = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/40',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/40',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/40',
  };

  const clearButtonClasses: Record<FilterPillVariant, string> = {
    blue: 'hover:text-blue-900 dark:hover:text-blue-100 focus:ring-blue-500/50',
    green: 'hover:text-green-900 dark:hover:text-green-100 focus:ring-green-500/50',
    purple: 'hover:text-purple-900 dark:hover:text-purple-100 focus:ring-purple-500/50',
    orange: 'hover:text-orange-900 dark:hover:text-orange-100 focus:ring-orange-500/50',
  };

  const showTooltip = useCallback(() => {
    setIsTooltipVisible(true);
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowShortcutHint(true);
    }, UI_DELAYS.SHORTCUT_HINT_DELAY);
  }, []);

  const hideTooltip = useCallback(() => {
    setIsTooltipVisible(false);
    setShowShortcutHint(false);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onClear();
    }
  }, [onClear]);

  const handleClearClick = useCallback(() => {
    onClear();
  }, [onClear]);

  const computedAriaLabel = ariaLabel || `Hapus filter ${label} (Tekan ${shortcut})`;

  return (
    <span
      id={pillId}
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 
        rounded-full text-xs font-medium
        transition-colors duration-200
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <span className="truncate max-w-[120px]">
        {value}
      </span>
      <button
        type="button"
        onClick={handleClearClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={`
          ml-1 p-0.5 rounded-full
          transition-all duration-150
          hover:scale-110 active:scale-95
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
          ${clearButtonClasses[variant]}
          ${prefersReducedMotion ? '' : 'hover:rotate-90'}
        `}
        aria-label={computedAriaLabel}
        aria-describedby={tooltipId}
        tabIndex={0}
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Tooltip */}
      {isTooltipVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`
            absolute -top-10 left-1/2 -translate-x-1/2
            px-2.5 py-1.5
            bg-neutral-800 dark:bg-neutral-700
            text-white text-[10px] font-medium
            rounded-lg shadow-lg
            whitespace-nowrap
            pointer-events-none
            z-50
            ${prefersReducedMotion ? '' : 'transition-all duration-200 ease-out'}
            ${showShortcutHint ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
          `}
        >
          <span className="flex items-center gap-1.5">
            <span>Hapus</span>
            <kbd className="px-1 py-0 bg-neutral-600 dark:bg-neutral-600 rounded text-[9px] font-bold border border-neutral-500">
              {shortcut}
            </kbd>
          </span>
          {/* Tooltip arrow */}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700"
            aria-hidden="true"
          />
        </div>
      )}
    </span>
  );
};

export default FilterPill;
