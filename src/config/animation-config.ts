/**
 * Animation Configuration - Flexy: Never hardcode animation values!
 * Centralized animation timing, delays, and easing functions
 */

export const ANIMATION_DELAYS = {
    /** No delay - immediate */
    NONE: 0,
    /** Fast transition - 75ms */
    FAST: 75,
    /** Quick transition - 100ms */
    QUICK: 100,
    /** Normal transition - 150ms */
    NORMAL: 150,
    /** Medium transition - 200ms */
    MEDIUM: 200,
    /** Standard transition - 300ms */
    STANDARD: 300,
    /** Slow transition - 500ms */
    SLOW: 500,
    /** Deliberate transition - 700ms */
    DELIBERATE: 700,
    /** Long transition - 1000ms */
    LONG: 1000,
} as const;

export const ANIMATION_DURATION = {
    /** Instant - 0ms */
    INSTANT: 0,
    /** Fast duration - 150ms */
    FAST: 150,
    /** Quick duration - 200ms */
    QUICK: 200,
    /** Normal duration - 300ms */
    NORMAL: 300,
    /** Standard duration - 500ms */
    STANDARD: 500,
    /** Slow duration - 1000ms */
    SLOW: 1000,
} as const;

export const ANIMATION_EASING = {
    /** Default easing - ease-in-out */
    DEFAULT: 'ease-in-out',
    /** Linear - constant speed */
    LINEAR: 'linear',
    /** Ease in - accelerate */
    EASE_IN: 'ease-in',
    /** Ease out - decelerate */
    EASE_OUT: 'ease-out',
    /** Cubic bezier for smooth transitions */
    SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
    /** Bounce effect */
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    /** Spring effect */
    SPRING: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

export const STAGGER_DELAYS = {
    /** Fast stagger - 25ms between items */
    FAST: 25,
    /** Normal stagger - 50ms between items */
    NORMAL: 50,
    /** Slow stagger - 100ms between items */
    SLOW: 100,
    /** Very slow stagger - 150ms between items */
    VERY_SLOW: 150,
} as const;

export const LOADING_ANIMATION = {
    /** Loading dots animation delays */
    DOTS: {
        FIRST: '0s',
        SECOND: '0.2s',
        THIRD: '0.4s',
    },
    /** Skeleton shimmer duration */
    SHIMMER_DURATION: '1.5s',
    /** Pulse animation duration */
    PULSE_DURATION: '2s',
} as const;

export const PAGE_TRANSITION = {
    /** Page enter duration */
    ENTER_DURATION: 300,
    /** Page exit duration */
    EXIT_DURATION: 200,
    /** Default delay for page transitions */
    DEFAULT_DELAY: 0,
} as const;
