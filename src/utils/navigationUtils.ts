

/**
 * Navigation styling utilities with consistent mobile patterns
 */

export const NAV_LINK_BASE_CLASSES = "font-semibold rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 touch-manipulation transition-all duration-300";

export const NAV_LINK_DESKTOP_CLASSES = `${NAV_LINK_BASE_CLASSES} text-sm sm:text-base text-accessible-primary px-4 py-3 min-h-[48px] hover:bg-neutral-100/80 dark:hover:bg-neutral-700/60 active:bg-neutral-100/80 dark:active:bg-neutral-700/60`;

export const NAV_LINK_MOBILE_CLASSES = `${NAV_LINK_BASE_CLASSES} block w-full text-left text-lg text-accessible-primary px-4 py-4 min-h-[52px] border-b border-neutral-100/60 dark:border-neutral-800/60 active:bg-neutral-100/80 dark:active:bg-neutral-700/60`;

export const NAV_LINK_ACTIVE_CLASSES = "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-l-4 border-primary-500";

export const NAV_BREAKPOINTS = {
  MOBILE_MAX: '768px',
  DESKTOP_MIN: '768px',
} as const;

/**
 * Build consistent navigation link classes
 */
export function buildNavLinkClasses(options: {
  isMobile?: boolean;
  isActive?: boolean;
  prefersReducedMotion?: boolean;
}) {
  const {
    isMobile = false,
    isActive = false,
    prefersReducedMotion = false
  } = options;

  const motionClasses = prefersReducedMotion 
    ? ''
    : isMobile ? 'active:scale-[0.98]' : 'hover:scale-[1.02] active:scale-[0.98]';

  const baseClasses = isMobile ? NAV_LINK_MOBILE_CLASSES : NAV_LINK_DESKTOP_CLASSES;
  const activeClasses = isActive ? NAV_LINK_ACTIVE_CLASSES : '';

  return [
    baseClasses,
    activeClasses,
    motionClasses
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Header styling utilities
 */
export const HEADER_CONTAINER_CLASSES = "fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out";

export const HEADER_NAV_WRAPPER_CLASSES = "w-full max-w-7xl mx-auto px-4 sm:px-6";

export const HEADER_INNER_CLASSES = "flex items-center justify-between h-16";

export const HEADER_SCROLLED_CLASSES = "mt-0 rounded-none shadow-card";

export const HEADER_UNSCROLLED_CLASSES = "mt-4 mx-2 sm:mx-4 rounded-full";

/**
 * Mobile menu utilities
 */
export const MOBILE_MENU_CLASSES = "fixed inset-0 top-16 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl z-30 overflow-y-auto";

export const MOBILE_MENU_INNER_CLASSES = "flex flex-col p-4 space-y-2";