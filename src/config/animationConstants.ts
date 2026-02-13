/**
 * Flexy: Animation and Micro-interaction Constants
 * 
 * Centralized configuration for all animation values, timing, easing,
 * and visual effects to eliminate hardcoded values.
 */

import { DESIGN_TOKENS } from './design-tokens';

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

export const EASING = {
  // Standard easing - for general animations
  STANDARD: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  // Ease out - for deceleration
  EASE_OUT: 'ease-out',
  // Ease in out - for balanced motion
  EASE_IN_OUT: 'ease-in-out',
  // Linear - for continuous animations
  LINEAR: 'linear',
  // Elastic - for bouncy effects
  ELASTIC: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  // Smooth - for subtle transitions
  SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============================================================================
// DURATION VALUES (in seconds)
// ============================================================================

export const DURATION = {
  INSTANT: 0.1,
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.6,
  VERY_SLOW: 1.0,
  CONTINUOUS: 1.4,
  LOADING: 1.5,
} as const;

// ============================================================================
// DELAY VALUES (in seconds)
// ============================================================================

export const DELAY = {
  NONE: 0,
  TINY: 0.1,
  SMALL: 0.16,
  MEDIUM: 0.2,
  LARGE: 0.32,
  STAGGER_1: 0.1,
  STAGGER_2: 0.2,
  STAGGER_3: 0.3,
  STAGGER_4: 0.4,
  STAGGER_5: 0.5,
} as const;

// ============================================================================
// TRANSFORM VALUES
// ============================================================================

export const TRANSFORM = {
  // Translation values (in pixels)
  TRANSLATE: {
    NONE: 0,
    TINY: 2,
    SMALL: 4,
    MEDIUM: 5,
    LARGE: 8,
    XLARGE: 20,
  },
  // Scale values (multiplier)
  SCALE: {
    NONE: 1,
    TINY: 0.95,
    SMALL: 1.02,
    MEDIUM: 1.05,
    LARGE: 1.1,
    XLARGE: 1.2,
  },
  // Rotation values (in degrees)
  ROTATE: {
    NONE: 0,
    SMALL: 2,
    MEDIUM: 5,
    LARGE: 360,
  },
  // Perspective values (in pixels)
  PERSPECTIVE: {
    DEFAULT: 1000,
  },
} as const;

// ============================================================================
// SHADOW VALUES
// ============================================================================

export const SHADOW = {
  // Shadow offsets (in pixels)
  OFFSET: {
    SMALL: '0 10px 25px -5px',
    LARGE: '0 20px 40px -10px',
    GLOW_SMALL: '0 0 20px',
    GLOW_MEDIUM: '0 0 25px',
    GLOW_LARGE: '0 0 30px',
  },
  // Shadow colors (with opacity)
  COLOR: {
    BLACK_LIGHT: 'rgba(0, 0, 0, 0.15)',
    BLACK_MEDIUM: 'rgba(0, 0, 0, 0.2)',
    BLUE_LIGHT: 'rgba(59, 130, 246, 0.3)',
    BLUE_MEDIUM: 'rgba(59, 130, 246, 0.5)',
    BLUE_STRONG: 'rgba(59, 130, 246, 0.6)',
    GREEN_LIGHT: 'rgba(34, 197, 94, 0.3)',
    AMBER_LIGHT: 'rgba(245, 158, 11, 0.3)',
    RED_LIGHT: 'rgba(239, 68, 68, 0.3)',
    WHITE_LIGHT: 'rgba(255, 255, 255, 0.5)',
  },
} as const;

// ============================================================================
// SIZE VALUES (in pixels)
// ============================================================================

export const SIZE = {
  // Touch target sizes
  TOUCH: {
    MIN: 44, // WCAG 2.1 minimum touch target
  },
  // Loading dots
  LOADING_DOT: {
    WIDTH: 8,
    HEIGHT: 8,
    GAP: 4,
  },
  // Ripple effect
  RIPPLE: {
    SIZE: 300,
  },
  // Skeleton loading
  SKELETON: {
    GRADIENT_SIZE: '200%',
  },
} as const;

// ============================================================================
// COLOR VALUES
// ============================================================================

export const COLOR = {
  PRIMARY: {
    BLUE: '#3b82f6',
    WHITE: DESIGN_TOKENS.colors.neutral[0],
  },
  // Gradient definitions
  GRADIENT: {
    HOVER: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    SKELETON: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  },
  // Opacity values
  OPACITY: {
    NONE: 0,
    LOW: 0.5,
    MEDIUM: 0.8,
    HIGH: 1,
  },
} as const;

// ============================================================================
// FOCUS RING CONFIGURATION
// ============================================================================

export const FOCUS_RING = {
  WIDTH: 3,
  WIDTH_OFFSET: 2,
  COLOR: 'rgba(59, 130, 246, 0.3)',
  COLOR_WHITE: DESIGN_TOKENS.colors.neutral[0],
} as const;

// ============================================================================
// ANIMATION CONFIGURATION OBJECTS
// ============================================================================

export const ANIMATION_CONFIG = {
  // Hover lift effect
  HOVER_LIFT: {
    duration: DURATION.FAST,
    easing: EASING.STANDARD,
    translateY: -TRANSFORM.TRANSLATE.TINY,
    scale: TRANSFORM.SCALE.SMALL,
    shadow: `${SHADOW.OFFSET.SMALL} ${SHADOW.COLOR.BLACK_LIGHT}`,
  },
  // Hover lift large effect
  HOVER_LIFT_LARGE: {
    duration: DURATION.FAST,
    easing: EASING.STANDARD,
    translateY: -TRANSFORM.TRANSLATE.SMALL,
    scale: TRANSFORM.SCALE.MEDIUM,
    shadow: `${SHADOW.OFFSET.LARGE} ${SHADOW.COLOR.BLACK_MEDIUM}`,
  },
  // Glow effects
  GLOW: {
    duration: DURATION.NORMAL,
    easing: EASING.STANDARD,
    blue: `${SHADOW.OFFSET.GLOW_SMALL} ${SHADOW.COLOR.BLUE_LIGHT}`,
    blueEnhanced: `${SHADOW.OFFSET.GLOW_LARGE} ${SHADOW.COLOR.BLUE_MEDIUM}`,
    blueActive: `${SHADOW.OFFSET.GLOW_MEDIUM} ${SHADOW.COLOR.BLUE_STRONG}`,
  },
  // Scale effects
  SCALE: {
    duration: DURATION.FAST,
    easing: EASING.STANDARD,
    small: TRANSFORM.SCALE.SMALL,
    medium: TRANSFORM.SCALE.MEDIUM,
    large: TRANSFORM.SCALE.LARGE,
  },
  // Ripple effect
  RIPPLE: {
    duration: DURATION.SLOW,
    size: SIZE.RIPPLE.SIZE,
    color: SHADOW.COLOR.WHITE_LIGHT,
  },
  // Loading dots
  LOADING_DOTS: {
    duration: DURATION.CONTINUOUS,
    delay1: -DELAY.LARGE,
    delay2: -DELAY.MEDIUM,
    width: SIZE.LOADING_DOT.WIDTH,
    height: SIZE.LOADING_DOT.HEIGHT,
    gap: SIZE.LOADING_DOT.GAP,
  },
  // Skeleton loading
  SKELETON: {
    duration: DURATION.LOADING,
    gradient: COLOR.GRADIENT.SKELETON,
    gradientSize: SIZE.SKELETON.GRADIENT_SIZE,
  },
  // Stagger fade-in
  STAGGER: {
    baseDuration: DURATION.NORMAL,
    delays: [DELAY.STAGGER_1, DELAY.STAGGER_2, DELAY.STAGGER_3, DELAY.STAGGER_4, DELAY.STAGGER_5],
    translateY: TRANSFORM.TRANSLATE.XLARGE,
  },
} as const;

// ============================================================================
// KEYFRAME ANIMATION CONFIGURATIONS
// ============================================================================

export const KEYFRAMES = {
  // Pulse animation
  PULSE: {
    duration: DURATION.VERY_SLOW,
    scaleMin: TRANSFORM.SCALE.NONE,
    scaleMax: TRANSFORM.SCALE.MEDIUM,
  },
  // Shake animation
  SHAKE: {
    duration: DURATION.NORMAL,
    offset: TRANSFORM.TRANSLATE.TINY,
  },
  // Error shake animation
  ERROR_SHAKE: {
    duration: DURATION.NORMAL,
    offset: TRANSFORM.TRANSLATE.MEDIUM,
  },
  // Bounce animation
  BOUNCE: {
    duration: DURATION.SLOW,
    heights: [0, -TRANSFORM.TRANSLATE.LARGE, -TRANSFORM.TRANSLATE.SMALL, -TRANSFORM.TRANSLATE.TINY],
  },
  // Float animation
  FLOAT: {
    duration: 2, // 2 seconds
    translateY: -TRANSFORM.TRANSLATE.MEDIUM,
  },
  // Success checkmark
  SUCCESS: {
    duration: DURATION.SLOW,
    scaleMin: 0,
    scaleMid: TRANSFORM.SCALE.XLARGE,
    scaleMax: TRANSFORM.SCALE.NONE,
  },
} as const;
