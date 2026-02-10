/**
 * Enhanced Micro-interactions and Hover States
 * Advanced CSS classes for sophisticated user interactions
 * 
 * Flexy: Refactored to use centralized animation constants
 */

import {
  EASING,
  DURATION,
  TRANSFORM,
  SHADOW,
  SIZE,
  COLOR,
  FOCUS_RING,
  ANIMATION_CONFIG,
  KEYFRAMES,
} from './animationConstants';

export const MICRO_INTERACTIONS = `
/* Enhanced Hover States */
.hover-lift {
  transition: transform ${ANIMATION_CONFIG.HOVER_LIFT.duration}s ${ANIMATION_CONFIG.HOVER_LIFT.easing},
              box-shadow ${ANIMATION_CONFIG.HOVER_LIFT.duration}s ${ANIMATION_CONFIG.HOVER_LIFT.easing};
}

.hover-lift:hover {
  transform: translateY(${ANIMATION_CONFIG.HOVER_LIFT.translateY}px) scale(${ANIMATION_CONFIG.HOVER_LIFT.scale});
  box-shadow: ${ANIMATION_CONFIG.HOVER_LIFT.shadow};
}

.hover-lift-lg:hover {
  transform: translateY(${ANIMATION_CONFIG.HOVER_LIFT_LARGE.translateY}px) scale(${ANIMATION_CONFIG.HOVER_LIFT_LARGE.scale});
  box-shadow: ${ANIMATION_CONFIG.HOVER_LIFT_LARGE.shadow};
}

/* Enhanced Glow Effects */
.hover-glow {
  transition: box-shadow ${ANIMATION_CONFIG.GLOW.duration}s ${ANIMATION_CONFIG.GLOW.easing};
}

.hover-glow:hover {
  box-shadow: ${ANIMATION_CONFIG.GLOW.blue};
}

.hover-glow-enhanced:hover {
  box-shadow: ${ANIMATION_CONFIG.GLOW.blueEnhanced};
}

/* Color-specific glow effects */
.hover-glow-success:hover {
  box-shadow: ${SHADOW.OFFSET.GLOW_SMALL} ${SHADOW.COLOR.GREEN_LIGHT};
}

.hover-glow-warning:hover {
  box-shadow: ${SHADOW.OFFSET.GLOW_SMALL} ${SHADOW.COLOR.AMBER_LIGHT};
}

.hover-glow-error:hover {
  box-shadow: ${SHADOW.OFFSET.GLOW_SMALL} ${SHADOW.COLOR.RED_LIGHT};
}

/* Interactive Scale Effects */
.hover-scale {
  transition: transform ${ANIMATION_CONFIG.SCALE.duration}s ${ANIMATION_CONFIG.SCALE.easing};
}

.hover-scale:hover {
  transform: scale(${ANIMATION_CONFIG.SCALE.medium});
}

.hover-scale-sm:hover {
  transform: scale(${ANIMATION_CONFIG.SCALE.small});
}

.hover-scale-lg:hover {
  transform: scale(${ANIMATION_CONFIG.SCALE.large});
}

/* Rotation Effects */
.hover-rotate {
  transition: transform ${DURATION.NORMAL}s ${EASING.STANDARD};
}

.hover-rotate:hover {
  transform: rotate(${TRANSFORM.ROTATE.MEDIUM}deg);
}

.hover-rotate-360:hover {
  transform: rotate(${TRANSFORM.ROTATE.LARGE}deg);
}

/* Background Gradient Transitions */
.hover-gradient {
  transition: background ${DURATION.NORMAL}s ${EASING.STANDARD};
}

.hover-gradient:hover {
  background: ${COLOR.GRADIENT.HOVER};
}

/* Border Color Transitions */
.hover-border {
  transition: border-color ${DURATION.NORMAL}s ${EASING.STANDARD};
}

.hover-border:hover {
  border-color: ${COLOR.PRIMARY.BLUE};
}

/* Text Shadow Effects */
.hover-text-glow {
  transition: text-shadow ${DURATION.NORMAL}s ${EASING.STANDARD};
}

.hover-text-glow:hover {
  text-shadow: 0 0 10px currentColor;
}

/* Ripple Effect */
.ripple {
  position: relative;
  overflow: hidden;
}

.ripple::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: ${ANIMATION_CONFIG.RIPPLE.color};
  transform: translate(-50%, -50%);
  transition: width ${ANIMATION_CONFIG.RIPPLE.duration}s, height ${ANIMATION_CONFIG.RIPPLE.duration}s;
}

.ripple:active::before {
  width: ${ANIMATION_CONFIG.RIPPLE.size}px;
  height: ${ANIMATION_CONFIG.RIPPLE.size}px;
}

/* Pulse Animation */
.pulse-on-hover {
  transition: transform ${DURATION.FAST}s;
}

.pulse-on-hover:hover {
  animation: pulse-hover ${KEYFRAMES.PULSE.duration}s infinite;
}

@keyframes pulse-hover {
  0%, 100% {
    transform: scale(${KEYFRAMES.PULSE.scaleMin});
  }
  50% {
    transform: scale(${KEYFRAMES.PULSE.scaleMax});
  }
}

/* Shake Animation */
.shake-on-hover:hover {
  animation: shake-hover ${KEYFRAMES.SHAKE.duration}s;
}

@keyframes shake-hover {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-${KEYFRAMES.SHAKE.offset}px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(${KEYFRAMES.SHAKE.offset}px);
  }
}

/* Bounce Animation */
.bounce-on-hover:hover {
  animation: bounce-hover ${KEYFRAMES.BOUNCE.duration}s;
}

@keyframes bounce-hover {
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(${KEYFRAMES.BOUNCE.heights[1]}px);
  }
  70% {
    transform: translateY(${KEYFRAMES.BOUNCE.heights[2]}px);
  }
  90% {
    transform: translateY(${KEYFRAMES.BOUNCE.heights[3]}px);
  }
}

/* Float Animation */
.float-on-hover {
  transition: transform ${DURATION.NORMAL}s ${EASING.STANDARD};
}

.float-on-hover:hover {
  animation: float-hover ${KEYFRAMES.FLOAT.duration}s ${EASING.EASE_IN_OUT} infinite;
}

@keyframes float-hover {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(${KEYFRAMES.FLOAT.translateY}px);
  }
}

/* Tilt Effect */
.hover-tilt {
  transition: transform ${DURATION.FAST}s;
  transform-style: preserve-3d;
}

.hover-tilt:hover {
  transform: perspective(${TRANSFORM.PERSPECTIVE.DEFAULT}px) rotateX(${TRANSFORM.ROTATE.MEDIUM}deg) rotateY(${TRANSFORM.ROTATE.MEDIUM}deg);
}

/* Staggered Animation for Lists */
.stagger-fade-in {
  animation: stagger-fade-in ${ANIMATION_CONFIG.STAGGER.baseDuration}s ${EASING.EASE_OUT} forwards;
}

.stagger-fade-in:nth-child(1) { animation-delay: ${ANIMATION_CONFIG.STAGGER.delays[0]}s; }
.stagger-fade-in:nth-child(2) { animation-delay: ${ANIMATION_CONFIG.STAGGER.delays[1]}s; }
.stagger-fade-in:nth-child(3) { animation-delay: ${ANIMATION_CONFIG.STAGGER.delays[2]}s; }
.stagger-fade-in:nth-child(4) { animation-delay: ${ANIMATION_CONFIG.STAGGER.delays[3]}s; }
.stagger-fade-in:nth-child(5) { animation-delay: ${ANIMATION_CONFIG.STAGGER.delays[4]}s; }

@keyframes stagger-fade-in {
  from {
    opacity: 0;
    transform: translateY(${ANIMATION_CONFIG.STAGGER.translateY}px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Magnetic Effect */
.magnetic {
  transition: transform ${DURATION.FAST}s ${EASING.STANDARD};
}

/* Active States */
.active-scale:active {
  transform: scale(${TRANSFORM.SCALE.TINY});
}

.active-rotate:active {
  transform: rotate(${TRANSFORM.ROTATE.SMALL}deg);
}

.active-glow:active {
  box-shadow: ${ANIMATION_CONFIG.GLOW.blueActive};
}

/* Focus States */
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 ${FOCUS_RING.WIDTH}px ${FOCUS_RING.COLOR};
}

.focus-ring-offset:focus {
  outline: none;
  box-shadow: 0 0 0 ${FOCUS_RING.WIDTH_OFFSET}px ${FOCUS_RING.COLOR_WHITE}, 0 0 0 ${FOCUS_RING.WIDTH_OFFSET + 2}px ${FOCUS_RING.COLOR};
}

/* Loading States */
.loading-dots {
  display: inline-flex;
  gap: ${ANIMATION_CONFIG.LOADING_DOTS.gap}px;
}

.loading-dots span {
  width: ${ANIMATION_CONFIG.LOADING_DOTS.width}px;
  height: ${ANIMATION_CONFIG.LOADING_DOTS.height}px;
  border-radius: 50%;
  background-color: currentColor;
  animation: loading-dots ${ANIMATION_CONFIG.LOADING_DOTS.duration}s ${EASING.EASE_IN_OUT} infinite both;
}

.loading-dots span:nth-child(1) { animation-delay: ${ANIMATION_CONFIG.LOADING_DOTS.delay1}s; }
.loading-dots span:nth-child(2) { animation-delay: ${ANIMATION_CONFIG.LOADING_DOTS.delay2}s; }

@keyframes loading-dots {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Skeleton Loading */
.skeleton {
  background: ${ANIMATION_CONFIG.SKELETON.gradient};
  background-size: ${ANIMATION_CONFIG.SKELETON.gradientSize} 100%;
  animation: skeleton-loading ${ANIMATION_CONFIG.SKELETON.duration}s ${EASING.EASE_IN_OUT} infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Success Animation */
.success-checkmark {
  animation: success-checkmark ${KEYFRAMES.SUCCESS.duration}s ${EASING.EASE_IN_OUT};
}

@keyframes success-checkmark {
  0% {
    transform: scale(${KEYFRAMES.SUCCESS.scaleMin}) rotate(-45deg);
  }
  50% {
    transform: scale(${KEYFRAMES.SUCCESS.scaleMid}) rotate(-45deg);
  }
  100% {
    transform: scale(${KEYFRAMES.SUCCESS.scaleMax}) rotate(0deg);
  }
}

/* Error Shake */
.error-shake {
  animation: error-shake ${KEYFRAMES.ERROR_SHAKE.duration}s ${EASING.EASE_IN_OUT};
}

@keyframes error-shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-${KEYFRAMES.ERROR_SHAKE.offset}px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(${KEYFRAMES.ERROR_SHAKE.offset}px);
  }
}

/* Responsive Hover States */
@media (hover: hover) {
  .hover-lift:hover { /* hover styles */ }
  .hover-scale:hover { /* hover styles */ }
  .hover-glow:hover { /* hover styles */ }
}

/* Touch Optimizations */
@media (pointer: coarse) {
  .hover-lift {
    min-height: ${SIZE.TOUCH.MIN}px;
    min-width: ${SIZE.TOUCH.MIN}px;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .hover-lift,
  .hover-scale,
  .hover-glow,
  .pulse-on-hover,
  .float-on-hover,
  .bounce-on-hover {
    transition: none;
    animation: none;
  }
}
`;

export const getMicroInteractionClasses = () => {
  return {
    // Button interactions
    button: [
      'hover-lift',
      'hover-scale-sm',
      'active-scale',
      'focus-ring-offset',
    ],
    
    // Card interactions
    card: [
      'hover-lift',
      'hover-glow',
      'hover-scale-sm',
    ],
    
    // Link interactions
    link: [
      'hover-glow',
      'hover-text-glow',
      'focus-ring',
    ],
    
    // Input interactions
    input: [
      'hover-border',
      'focus-ring-offset',
    ],
    
    // Interactive elements
    interactive: [
      'hover-scale',
      'active-scale',
      'focus-ring',
    ],
  };
};

export default MICRO_INTERACTIONS;
