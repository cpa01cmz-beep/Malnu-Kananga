/**
 * Enhanced Transitions and Loading States System
 * Comprehensive animation and loading utilities for smooth user experience
 */

export const TRANSITIONS_SYSTEM = `
/* Enhanced Transition System */

/* Transition Durations */
.transition-duration-75 { transition-duration: 75ms; }
.transition-duration-100 { transition-duration: 100ms; }
.transition-duration-150 { transition-duration: 150ms; }
.transition-duration-200 { transition-duration: 200ms; }
.transition-duration-300 { transition-duration: 300ms; }
.transition-duration-500 { transition-duration: 500ms; }
.transition-duration-700 { transition-duration: 700ms; }
.transition-duration-1000 { transition-duration: 1000ms; }

/* Transition Delays */
.transition-delay-75 { transition-delay: 75ms; }
.transition-delay-100 { transition-delay: 100ms; }
.transition-delay-150 { transition-delay: 150ms; }
.transition-delay-200 { transition-delay: 200ms; }
.transition-delay-300 { transition-delay: 300ms; }
.transition-delay-500 { transition-delay: 500ms; }
.transition-delay-700 { transition-delay: 700ms; }
.transition-delay-1000 { transition-delay: 1000ms; }

/* Transition Timing Functions */
.transition-ease-linear { transition-timing-function: linear; }
.transition-ease-in { transition-timing-function: cubic-bezier(0.4, 0, 1, 1); }
.transition-ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
.transition-ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
.transition-ease-bounce { transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55); }
.transition-ease-elastic { transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.transition-ease-smooth { transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275); }

/* Transition Properties */
.transition-none { transition: none; }
.transition-all { transition: all 0.3s ease; }
.transition-all-fast { transition: all 0.15s ease; }
.transition-all-slow { transition: all 0.5s ease; }
.transition-colors { transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease; }
.transition-opacity { transition: opacity 0.3s ease; }
.transition-transform { transition: transform 0.3s ease; }
.transition-shadow { transition: box-shadow 0.3s ease; }
.transition-spacing { transition: margin 0.3s ease, padding 0.3s ease; }

/* Custom Transition Classes */
.transition-slide-up {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              opacity 0.3s ease;
}

.transition-slide-down {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              opacity 0.3s ease;
}

.transition-slide-left {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              opacity 0.3s ease;
}

.transition-slide-right {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              opacity 0.3s ease;
}

.transition-scale {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              opacity 0.3s ease;
}

.transition-rotate {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.transition-glow {
  transition: box-shadow 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Loading States */

/* Spinner Loading */
.loading-spinner {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner-sm {
  width: 1rem;
  height: 1rem;
  border-width: 1.5px;
}

.loading-spinner-lg {
  width: 1.5rem;
  height: 1.5rem;
  border-width: 2.5px;
}

.loading-spinner-xl {
  width: 2rem;
  height: 2rem;
  border-width: 3px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Dots Loading */
.loading-dots {
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
}

.loading-dots > div {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #3b82f6;
  animation: dots-loading 1.4s ease-in-out infinite both;
}

.loading-dots > div:nth-child(1) { animation-delay: -0.32s; }
.loading-dots > div:nth-child(2) { animation-delay: -0.16s; }

.loading-dots-sm > div {
  width: 0.375rem;
  height: 0.375rem;
}

.loading-dots-lg > div {
  width: 0.625rem;
  height: 0.625rem;
}

@keyframes dots-loading {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Pulse Loading */
.loading-pulse {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  background-color: #3b82f6;
  border-radius: 50%;
  animation: pulse-loading 1.5s ease-in-out infinite;
}

.loading-pulse-sm {
  width: 1.5rem;
  height: 1.5rem;
}

.loading-pulse-lg {
  width: 2.5rem;
  height: 2.5rem;
}

@keyframes pulse-loading {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

/* Skeleton Loading */
.skeleton {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 0.375rem;
}

.skeleton-text {
  height: 1rem;
  margin-bottom: 0.5rem;
}

.skeleton-text-sm {
  height: 0.75rem;
  width: 60%;
}

.skeleton-text-lg {
  height: 1.25rem;
  width: 80%;
}

.skeleton-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
}

.skeleton-button {
  height: 2.5rem;
  width: 6rem;
  border-radius: 0.5rem;
}

.skeleton-card {
  height: 8rem;
  border-radius: 0.75rem;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Progress Bar Loading */
.loading-progress {
  width: 100%;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
}

.loading-progress-sm {
  height: 0.375rem;
}

.loading-progress-lg {
  height: 0.75rem;
}

.loading-progress-bar {
  height: 100%;
  background-color: #3b82f6;
  border-radius: 0.25rem;
  animation: progress-loading 2s ease-in-out infinite;
}

.loading-progress-bar-success {
  background-color: #22c55e;
}

.loading-progress-bar-warning {
  background-color: #f59e0b;
}

.loading-progress-bar-error {
  background-color: #ef4444;
}

@keyframes progress-loading {
  0% {
    width: 0%;
    margin-left: 0;
  }
  50% {
    width: 70%;
    margin-left: 0;
  }
  100% {
    width: 30%;
    margin-left: 70%;
  }
}

/* Stagger Loading */
.loading-stagger {
  display: inline-flex;
  gap: 0.25rem;
}

.loading-stagger > div {
  width: 0.375rem;
  height: 1.5rem;
  background-color: #3b82f6;
  border-radius: 0.125rem;
  animation: stagger-loading 1.2s ease-in-out infinite;
}

.loading-stagger > div:nth-child(1) { animation-delay: 0s; }
.loading-stagger > div:nth-child(2) { animation-delay: 0.1s; }
.loading-stagger > div:nth-child(3) { animation-delay: 0.2s; }
.loading-stagger > div:nth-child(4) { animation-delay: 0.3s; }
.loading-stagger > div:nth-child(5) { animation-delay: 0.4s; }

@keyframes stagger-loading {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

/* Wave Loading */
.loading-wave {
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
}

.loading-wave > div {
  width: 0.25rem;
  height: 1rem;
  background-color: #3b82f6;
  border-radius: 0.125rem;
  animation: wave-loading 1.2s ease-in-out infinite;
}

.loading-wave > div:nth-child(1) { animation-delay: 0s; }
.loading-wave > div:nth-child(2) { animation-delay: 0.1s; }
.loading-wave > div:nth-child(3) { animation-delay: 0.2s; }
.loading-wave > div:nth-child(4) { animation-delay: 0.3s; }
.loading-wave > div:nth-child(5) { animation-delay: 0.4s; }

@keyframes wave-loading {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-0.5rem);
  }
}

/* Morph Loading */
.loading-morph {
  width: 2rem;
  height: 2rem;
  background-color: #3b82f6;
  border-radius: 50%;
  animation: morph-loading 2s ease-in-out infinite;
}

.loading-morph-sm {
  width: 1.5rem;
  height: 1.5rem;
}

.loading-morph-lg {
  width: 2.5rem;
  height: 2.5rem;
}

@keyframes morph-loading {
  0%, 100% {
    border-radius: 50%;
    transform: rotate(0deg) scale(1);
  }
  25% {
    border-radius: 25%;
    transform: rotate(90deg) scale(1.1);
  }
  50% {
    border-radius: 50%;
    transform: rotate(180deg) scale(1);
  }
  75% {
    border-radius: 25%;
    transform: rotate(270deg) scale(0.9);
  }
}

/* State Transitions */

/* Fade In/Out */
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.fade-out {
  animation: fadeOut 0.3s ease-in-out;
}

.fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}

.fade-in-down {
  animation: fadeInDown 0.3s ease-out;
}

.fade-in-left {
  animation: fadeInLeft 0.3s ease-out;
}

.fade-in-right {
  animation: fadeInRight 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(1rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(-1rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Scale Transitions */
.scale-in {
  animation: scaleIn 0.3s ease-out;
}

.scale-out {
  animation: scaleOut 0.3s ease-in;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scaleOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

/* Slide Transitions */
.slide-in-up {
  animation: slideInUp 0.3s ease-out;
}

.slide-in-down {
  animation: slideInDown 0.3s ease-out;
}

.slide-in-left {
  animation: slideInLeft 0.3s ease-out;
}

.slide-in-right {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Page Transitions */
.page-transition-enter {
  opacity: 0;
  transform: translateX(1rem);
}

.page-transition-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-transition-exit {
  opacity: 1;
  transform: translateX(0);
}

.page-transition-exit-active {
  opacity: 0;
  transform: translateX(-1rem);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* Modal Transitions */
.modal-backdrop-enter {
  opacity: 0;
}

.modal-backdrop-enter-active {
  opacity: 1;
  transition: opacity 0.3s ease;
}

.modal-backdrop-exit {
  opacity: 1;
}

.modal-backdrop-exit-active {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modal-content-enter {
  opacity: 0;
  transform: scale(0.9) translateY(1rem);
}

.modal-content-enter-active {
  opacity: 1;
  transform: scale(1) translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-content-exit {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.modal-content-exit-active {
  opacity: 0;
  transform: scale(0.9) translateY(1rem);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-colors,
  .transition-opacity,
  .transition-transform,
  .transition-shadow,
  .transition-spacing,
  .transition-slide-up,
  .transition-slide-down,
  .transition-slide-left,
  .transition-slide-right,
  .transition-scale,
  .transition-rotate,
  .transition-glow,
  .loading-spinner,
  .loading-dots > div,
  .loading-pulse,
  .skeleton,
  .loading-stagger > div,
  .loading-wave > div,
  .loading-morph {
    animation: none;
    transition: none;
  }
}

/* Accessibility */
.transition-focusable:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  transition: outline 0.2s ease;
}

.transition-focusable:focus:not(:focus-visible) {
  outline: none;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .skeleton {
    background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  }
  
  .loading-progress {
    background-color: #4b5563;
  }
  
  .loading-progress-bar {
    background-color: #60a5fa;
  }
  
  .loading-progress-bar-success {
    background-color: #4ade80;
  }
  
  .loading-progress-bar-warning {
    background-color: #fbbf24;
  }
  
  .loading-progress-bar-error {
    background-color: #f87171;
  }
}
`;

export const TRANSITION_CONFIG = {
  // Duration presets
  durations: {
    fast: '75ms',
    normal: '150ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '700ms',
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    smooth: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  
  // Loading types
  loading: {
    spinner: 'loading-spinner',
    dots: 'loading-dots',
    pulse: 'loading-pulse',
    skeleton: 'skeleton',
    progress: 'loading-progress',
    stagger: 'loading-stagger',
    wave: 'loading-wave',
    morph: 'loading-morph',
  },
  
  // Animation types
  animations: {
    fadeIn: 'fade-in',
    fadeOut: 'fade-out',
    fadeInUp: 'fade-in-up',
    fadeInDown: 'fade-in-down',
    fadeInLeft: 'fade-in-left',
    fadeInRight: 'fade-in-right',
    scaleIn: 'scale-in',
    scaleOut: 'scale-out',
    slideInUp: 'slide-in-up',
    slideInDown: 'slide-in-down',
    slideInLeft: 'slide-in-left',
    slideInRight: 'slide-in-right',
  },
  
  // Transition properties
  properties: {
    all: 'all',
    colors: 'color, background-color, border-color',
    opacity: 'opacity',
    transform: 'transform',
    shadow: 'box-shadow',
    spacing: 'margin, padding',
  },
};

export const getTransitionClasses = (properties: string, duration: keyof typeof TRANSITION_CONFIG.durations, easing: keyof typeof TRANSITION_CONFIG.easing) => {
  const durationValue = TRANSITION_CONFIG.durations[duration];
  
  return `transition-${properties} transition-duration-${parseInt(durationValue)} transition-ease-${easing}`;
};

export const getLoadingClasses = (type: keyof typeof TRANSITION_CONFIG.loading, size: 'sm' | 'base' | 'lg' = 'base') => {
  const baseClass = TRANSITION_CONFIG.loading[type];
  const sizeClass = size !== 'base' ? `-${size}` : '';
  
  return `${baseClass}${sizeClass}`;
};

export const getAnimationClasses = (animation: keyof typeof TRANSITION_CONFIG.animations) => {
  return TRANSITION_CONFIG.animations[animation];
};

export default TRANSITIONS_SYSTEM;