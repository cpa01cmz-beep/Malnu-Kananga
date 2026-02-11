/**
 * UI Configuration - Flexy: Never hardcode UI dimensions!
 * Centralized UI dimensions, spacing defaults, and layout constants
 */

export const UI_DIMENSIONS = {
    /** Default component width */
    DEFAULT_WIDTH: 400,
    /** Default component height */
    DEFAULT_HEIGHT: 200,
    /** Small component size */
    SMALL_SIZE: 120,
    /** Chart bar width */
    CHART_BAR_WIDTH: 60,
    /** Chart bar height */
    CHART_BAR_HEIGHT: 30,
    /** Icon default size */
    ICON_DEFAULT: 24,
} as const;

export const EMAIL_TEMPLATE_DIMENSIONS = {
    /** Max width for email containers */
    MAX_WIDTH: '600px',
    /** Container margin */
    MARGIN: '0 auto',
    /** Standard padding */
    PADDING: '20px',
    /** Reduced padding */
    PADDING_REDUCED: '15px',
    /** Small padding */
    PADDING_SMALL: '12px',
    /** Standard border radius */
    BORDER_RADIUS: '5px',
    /** Large border radius */
    BORDER_RADIUS_LARGE: '8px',
    /** Small font size */
    FONT_SIZE_SMALL: '12px',
} as const;

export const SKELETON_CONFIG = {
    /** Default number of skeleton items */
    DEFAULT_ITEMS: 6,
    /** Alternative skeleton items count */
    ALT_ITEMS: 4,
    /** Background size for shimmer */
    SHIMMER_SIZE: '200px',
    /** Min height for skeleton cards */
    CARD_MIN_HEIGHT: '300px',
    /** Alternative card min height */
    CARD_MIN_HEIGHT_ALT: '400px',
} as const;

export const MODAL_DIMENSIONS = {
    /** Default modal min width */
    MIN_WIDTH: '280px',
    /** Default modal min height */
    MIN_HEIGHT: '300px',
    /** Modal max height (viewport-based) */
    MAX_HEIGHT: '90vh',
    /** Modal border radius */
    BORDER_RADIUS: '1rem',
} as const;

export const TOUCH_TARGET = {
    /** Minimum touch target size (accessibility) */
    MIN_SIZE: 44,
    /** Normal touch target size */
    NORMAL_SIZE: 48,
    /** Large touch target size */
    LARGE_SIZE: 52,
    /** Extra large touch target size */
    XL_SIZE: 60,
} as const;

export const TOAST_DIMENSIONS = {
    /** Default toast duration in ms */
    DEFAULT_DURATION: 3000,
    /** Short toast duration */
    SHORT_DURATION: 2000,
    /** Long toast duration */
    LONG_DURATION: 5000,
} as const;
