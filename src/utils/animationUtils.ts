

import { STAGGER_DELAYS, HAPTIC_PATTERNS } from '../constants';

/**
 * Animation utilities for consistent, performant, and accessible micro-interactions
 */

export const ANIMATION_DURATIONS = {
  instant: 'duration-75',       // 75ms
  fast: 'duration-150',        // 150ms
  normal: 'duration-300',      // 300ms
  slow: 'duration-500',        // 500ms
  slower: 'duration-700',       // 700ms
  slowest: 'duration-1000',    // 1000ms
} as const;

export const ANIMATION_EASINGS = {
  linear: 'ease-linear',
  in: 'ease-in',
  out: 'ease-out',
  inOut: 'ease-in-out',
  bounce: 'ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]',
  smooth: 'ease-[cubic-bezier(0.175,0.885,0.32,1.275)]',
  gentle: 'ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
  elastic: 'ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]',
} as const;

/**
 * Animation presets for common interactions
 */
export const ANIMATION_PRESETS = {
  // Enter animations
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideInUp: 'animate-slide-in-up',
  slideInDown: 'animate-slide-in-down',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  scaleIn: 'animate-scale-in',
  bounceIn: 'animate-bounce-in',
  
  // Exit animations
  slideOutUp: 'animate-slide-out-up',
  slideOutDown: 'animate-slide-out-down',
  slideOutLeft: 'animate-slide-out-left',
  slideOutRight: 'animate-slide-out-right',
  scaleOut: 'animate-scale-out',
  bounceOut: 'animate-bounce-out',
  
  // Loop animations
  pulse: 'animate-pulse',
  ping: 'animate-ping',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  pulseSlow: 'animate-pulse-slow',
  
  // Hover animations
  hoverScale: 'hover:scale-[1.02]',
  hoverScaleBig: 'hover:scale-[1.05]',
  activeScale: 'active:scale-[0.98]',
  hoverLift: 'hover:-translate-y-0.5',
  activeLift: 'active:translate-y-0',
  hoverGlow: 'hover:shadow-lg',
  activeShrink: 'active:scale-[0.95]',
} as const;

/**
 * Micro-interaction animations
 */
export const MICRO_INTERACTIONS = {
  button: `${ANIMATION_PRESETS.hoverScale} ${ANIMATION_PRESETS.activeScale} ${ANIMATION_EASINGS.smooth}`,
  buttonLarge: `${ANIMATION_PRESETS.hoverScaleBig} ${ANIMATION_PRESETS.activeScale} ${ANIMATION_EASINGS.smooth}`,
  card: `${ANIMATION_PRESETS.hoverLift} ${ANIMATION_DURATIONS.normal} ${ANIMATION_EASINGS.gentle}`,
  interactive: `${ANIMATION_PRESETS.hoverScale} ${ANIMATION_PRESETS.activeScale} ${ANIMATION_DURATIONS.fast}`,
  navigation: `${ANIMATION_PRESETS.hoverScale} ${ANIMATION_DURATIONS.fast} ${ANIMATION_EASINGS.smooth}`,
  tab: `${ANIMATION_PRESETS.hoverLift} ${ANIMATION_DURATIONS.normal} ${ANIMATION_EASINGS.smooth}`,
  dropdown: `${ANIMATION_DURATIONS.fast} ${ANIMATION_EASINGS.gentle}`,
  modal: `${ANIMATION_PRESETS.scaleIn} ${ANIMATION_DURATIONS.normal} ${ANIMATION_EASINGS.gentle}`,
  tooltip: `${ANIMATION_PRESETS.fadeIn} ${ANIMATION_DURATIONS.fast} ${ANIMATION_EASINGS.gentle}`,
  toast: `${ANIMATION_PRESETS.slideInDown} ${ANIMATION_DURATIONS.normal} ${ANIMATION_EASINGS.elastic}`,
  loader: `${ANIMATION_PRESETS.spin} ${ANIMATION_DURATIONS.slower}`,
} as const;

/**
 * Build animation classes with accessibility support
 */
export function buildAnimationClasses(options: {
  preset?: keyof typeof ANIMATION_PRESETS | string;
  duration?: keyof typeof ANIMATION_DURATIONS;
  easing?: keyof typeof ANIMATION_EASINGS;
  respectMotion?: boolean;
  custom?: string;
}) {
  const {
    preset,
    duration = 'normal',
    easing = 'inOut',
    respectMotion = true,
    custom = ''
  } = options;

  let classes = [];

  if (preset && preset in ANIMATION_PRESETS) {
    classes.push(ANIMATION_PRESETS[preset as keyof typeof ANIMATION_PRESETS]);
  } else if (preset) {
    classes.push(preset);
  }

  if (duration) {
    classes.push(ANIMATION_DURATIONS[duration]);
  }

  if (easing) {
    classes.push(ANIMATION_EASINGS[easing]);
  }

  if (respectMotion) {
    classes.push('motion-reduce:transition-none motion-reduce:transform-none');
  }

  if (custom) {
    classes.push(custom);
  }

  return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Performance-optimized animations
 */
export const PERFORMANCE_ANIMATIONS = {
  // Use transform instead of position changes for better performance
  transformOnly: 'transform transition-transform',
  opacityOnly: 'transition-opacity',
  optimized: 'transform transition-transform transition-opacity',
  
  // GPU-accelerated animations
  gpuAccelerated: 'transform-gpu transition-transform transition-opacity',
  
  // Reduced-motion friendly
  accessible: 'transform transition-transform transition-opacity motion-reduce:transition-none',
} as const;

/**
 * Stagger animations for lists
 */
export const STAGGER_ANIMATIONS = {
  // CSS custom properties for staggering - Flexy: Using STAGGER_DELAYS constant
  staggerVar: `--stagger-delay: calc(var(--stagger-index) * ${STAGGER_DELAYS.NORMAL}ms)`,
  staggerFast: `--stagger-delay: calc(var(--stagger-index) * ${STAGGER_DELAYS.FAST}ms)`,
  staggerSlow: `--stagger-delay: calc(var(--stagger-index) * ${STAGGER_DELAYS.SLOW}ms)`,
  
  // Animation classes with staggering
  staggeredFadeIn: 'animate-fade-in [animation-delay:var(--stagger-delay)]',
  staggeredSlideIn: 'animate-slide-in-up [animation-delay:var(--stagger-delay)]',
  staggeredScale: 'animate-scale-in [animation-delay:var(--stagger-delay)]',
} as const;

/**
 * Build staggered animation for list items
 */
export function buildStaggeredClasses(
  baseClass: string, 
  index: number, 
  delay: 'fast' | 'normal' | 'slow' = 'normal'
) {
  // Flexy: Using STAGGER_DELAYS constant instead of hardcoded values
  const delayMs = STAGGER_DELAYS[delay.toUpperCase() as keyof typeof STAGGER_DELAYS];
  const actualDelay = index * delayMs;
  
  return `${baseClass} motion-reduce:animate-none` + 
         (actualDelay > 0 ? ` [animation-delay:${actualDelay}ms]` : '');
}

/**
 * Re-export HAPTIC_PATTERNS from constants for backwards compatibility
 * Flexy: Haptic patterns are now centralized in constants.ts
 */
export { HAPTIC_PATTERNS };

/**
 * Trigger haptic feedback with accessibility support
 */
export function triggerHapticFeedback(
  pattern: keyof typeof HAPTIC_PATTERNS | number[], 
  respectMotion = true
) {
  if (respectMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false; // Don't trigger haptic feedback if user prefers reduced motion
  }
  
  if ('vibrate' in navigator && window.innerWidth <= 768) {
    const vibrationPattern = Array.isArray(pattern) ? pattern : HAPTIC_PATTERNS[pattern];
    navigator.vibrate(vibrationPattern);
    return true;
  }
  
  return false;
}

/**
 * Spring animations (for CSS custom properties)
 */
export const SPRING_CONFIGS = {
  gentle: 'spring(1 100 10 0)', // mass, stiffness, damping, velocity
  bouncy: 'spring(1 200 10 0)',
  snappy: 'spring(1 300 15 0)',
  slow: 'spring(1 80 20 0)',
} as const;