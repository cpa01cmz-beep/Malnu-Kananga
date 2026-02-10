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

/* Enhanced Micro-animations for Delightful Interactions */

/* Magnetic Button Effect */
.magnetic-button {
  transition: transform ${DURATION.FAST}s ${EASING.EASE_OUT};
  will-change: transform;
}

.magnetic-button:hover {
  transform: scale(1.05) translateY(-2px);
}

/* Ripple Click Effect */
.ripple-click {
  position: relative;
  overflow: hidden;
}

.ripple-click::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
  pointer-events: none;
}

.ripple-click:active::before {
  width: 300px;
  height: 300px;
}

/* Smooth Number Counter */
.counter-animate {
  transition: all ${DURATION.NORMAL}s ${EASING.EASE_OUT};
}

/* Progress Ring Animation */
.progress-ring {
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}

.progress-ring-circle {
  transition: stroke-dashoffset ${DURATION.SLOW}s ${EASING.EASE_OUT};
  stroke-dasharray: 251.2;
  stroke-dashoffset: 251.2;
}

.progress-ring-circle.animated {
  stroke-dashoffset: 0;
}

/* Skeleton Pulse Enhancement */
.skeleton-pulse-enhanced {
  background: linear-gradient(
    90deg,
    #f3f4f6 0%,
    #e5e7eb 50%,
    #f3f4f6 100%
  );
  background-size: 200% 100%;
  animation: skeleton-pulse-enhanced 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse-enhanced {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Loading Dots Animation */
.loading-dots-enhanced {
  display: inline-flex;
  gap: 0.25rem;
}

.loading-dots-enhanced span {
  width: 0.5rem;
  height: 0.5rem;
  background: currentColor;
  border-radius: 50%;
  animation: loading-dots-enhanced 1.4s ease-in-out infinite both;
}

.loading-dots-enhanced span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots-enhanced span:nth-child(2) { animation-delay: -0.16s; }
.loading-dots-enhanced span:nth-child(3) { animation-delay: 0s; }

@keyframes loading-dots-enhanced {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Success Checkmark Animation */
.success-checkmark {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #10b981;
  position: relative;
  animation: success-checkmark-pop 0.3s ease-out;
}

.success-checkmark::after {
  content: '';
  position: absolute;
  top: 0.25rem;
  left: 0.5rem;
  width: 0.5rem;
  height: 0.75rem;
  border: solid white;
  border-width: 0 0.125rem 0.125rem 0;
  transform: rotate(45deg);
  animation: success-checkmark-draw 0.3s ease-out 0.2s both;
}

@keyframes success-checkmark-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes success-checkmark-draw {
  0% {
    height: 0;
    opacity: 0;
  }
  100% {
    height: 0.75rem;
    opacity: 1;
  }
}

/* Error Shake Animation */
.error-shake-enhanced {
  animation: error-shake-enhanced 0.3s ease-out;
}

@keyframes error-shake-enhanced {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-4px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(4px);
  }
}

/* Hover Card Tilt Effect */
.hover-tilt {
  transition: transform ${DURATION.FAST}s ${EASING.EASE_OUT};
  transform-style: preserve-3d;
  will-change: transform;
}

.hover-tilt:hover {
  transform: perspective(1000px) rotateX(5deg) rotateY(-5deg) scale(1.02);
}

/* Floating Label Animation */
.floating-label {
  transition: all ${DURATION.FAST}s ${EASING.EASE_OUT};
}

.floating-label.active {
  transform: translateY(-1.5rem) scale(0.85);
  color: #3b82f6;
}

/* Button Loading State */
.button-loading {
  position: relative;
  color: transparent !important;
  pointer-events: none;
}

.button-loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1rem;
  height: 1rem;
  margin: -0.5rem 0 0 -0.5rem;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-top-color: transparent;
  animation: button-loading-spin 0.8s linear infinite;
}

@keyframes button-loading-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Tooltip Animation */
.tooltip-animate {
  opacity: 0;
  transform: translateY(0.5rem);
  transition: all 0.2s ease-out;
  pointer-events: none;
}

.tooltip-animate.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* Modal Backdrop Animation */
.modal-backdrop-animate {
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.modal-backdrop-animate.visible {
  opacity: 1;
}

/* Modal Content Animation */
.modal-content-animate {
  transform: scale(0.9) translateY(2rem);
  opacity: 0;
  transition: all 0.3s ease-out;
}

.modal-content-animate.visible {
  transform: scale(1) translateY(0);
  opacity: 1;
}

/* Notification Slide Animation */
.notification-slide {
  transform: translateX(100%);
  transition: transform 0.3s ease-out;
}

.notification-slide.visible {
  transform: translateX(0);
}

/* Tab Indicator Animation */
.tab-indicator {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: #3b82f6;
  transition: all 0.2s ease-out;
}

/* Accordion Animation */
.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.accordion-content.open {
  max-height: 50rem; /* Adjust based on content */
}

/* Search Input Animation */
.search-input-animate {
  transition: all 0.2s ease-out;
}

.search-input-animate:focus {
  transform: scale(1.02);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Dropdown Animation */
.dropdown-animate {
  opacity: 0;
  transform: translateY(-0.5rem) scale(0.95);
  transition: all ${DURATION.FAST}s ${EASING.EASE_OUT};
  pointer-events: none;
}

.dropdown-animate.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

/* Pagination Animation */
.pagination-item-animate {
  transition: all 0.2s ease-out;
}

.pagination-item-animate:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Badge Pop Animation */
.badge-pop-animate {
  animation: badge-pop ${DURATION.FAST}s ${EASING.EASE_OUT};
}

@keyframes badge-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .hover-lift,
  .hover-scale,
  .hover-glow,
  .pulse-on-hover,
  .float-on-hover,
  .bounce-on-hover,
  .magnetic-button,
  .ripple-click,
  .skeleton-pulse-enhanced,
  .loading-dots-enhanced,
  .success-checkmark,
  .error-shake-enhanced,
  .hover-tilt,
  .floating-label,
  .button-loading,
  .tooltip-animate,
  .modal-backdrop-animate,
  .modal-content-animate,
  .notification-slide,
  .tab-indicator,
  .accordion-content,
  .search-input-animate,
  .dropdown-animate,
  .pagination-item-animate,
  .badge-pop-animate {
    transition: none;
    animation: none;
    transform: none;
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
