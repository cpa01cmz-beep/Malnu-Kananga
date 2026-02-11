/**
 * Enhanced Mobile Responsiveness and Touch Interactions
 * Advanced mobile-first design patterns and touch optimizations
 */

export const MOBILE_ENHANCEMENTS = `
/* Enhanced Mobile Container System */
.container-mobile {
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
  margin-left: auto;
  margin-right: auto;
}

/* Responsive Container Breakpoints */
@media (min-width: 640px) {
  .container-mobile {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .container-mobile {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container-mobile {
    max-width: 1280px;
  }
}

/* Enhanced Touch-Optimized Button System */
.btn-touch {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  will-change: transform, box-shadow;
}

/* Enhanced Touch Feedback States */
.btn-touch:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-touch:active {
  transform: scale(0.96) translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.08s ease;
}

/* Ripple Effect Enhancement */
.btn-touch::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s, opacity 0.6s;
  pointer-events: none;
}

.btn-touch.ripple::before {
  width: 300px;
  height: 300px;
  opacity: 0;
}

.btn-touch:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Haptic Feedback Simulation */
.btn-touch.haptic-feedback:active {
  animation: hapticPulse 0.15s ease-out;
}

@keyframes hapticPulse {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(0.96); }
}

/* Touch-Optimized Input System */
.input-touch {
  min-height: 48px;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 16px; /* Prevents zoom on iOS */
  border: 2px solid #e5e7eb;
  transition: all 0.2s ease;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
}

.input-touch:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Mobile-First Grid System */
.grid-mobile {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .grid-mobile-sm {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .grid-mobile-md {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-mobile-lg {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Enhanced Mobile Navigation Patterns */
.nav-mobile {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.nav-mobile-item {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  min-height: 52px;
  display: flex;
  align-items: center;
  will-change: transform, background-color;
}

.nav-mobile-item:hover {
  background-color: #f9fafb;
  transform: translateX(4px);
}

.nav-mobile-item:active {
  background-color: #f3f4f6;
  transform: translateX(2px);
  transition: all 0.1s ease;
}

/* Navigation Active State */
.nav-mobile-item.active {
  background-color: #eff6ff;
  color: #3b82f6;
  border-left: 3px solid #3b82f6;
}

.nav-mobile-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
}

/* Enhanced Mobile Card System */
.card-mobile {
  background: white;
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  will-change: transform, box-shadow;
}

.card-mobile:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.15);
}

.card-mobile:active {
  transform: scale(0.98) translateY(0);
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
  transition: all 0.1s ease;
}

/* Card Touch Ripple */
.card-mobile::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.card-mobile:active::after {
  opacity: 1;
}

/* Swipeable Containers */
.swipeable-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.swipeable-container::-webkit-scrollbar {
  display: none;
}

.swipeable-item {
  scroll-snap-align: start;
  flex-shrink: 0;
  min-width: 280px;
}

/* Pull-to-Refresh Indicator */
.pull-to-refresh {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: transform 0.3s ease;
}

.pull-to-refresh.pulling {
  transform: translateY(0);
}

.pull-to-refresh.loading {
  transform: translateY(60px);
}

/* Mobile Modal System */
.modal-mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 1rem 1rem 0 0;
  padding: 1.5rem;
  box-shadow: 0 -10px 25px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-mobile.open {
  transform: translateY(0);
}

.modal-mobile-handle {
  width: 40px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
  margin: 0 auto 1rem;
  cursor: grab;
}

.modal-mobile-handle:active {
  cursor: grabbing;
}

/* Mobile Tabs */
.tabs-mobile {
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  border-bottom: 1px solid #e5e7eb;
}

.tabs-mobile::-webkit-scrollbar {
  display: none;
}

.tab-mobile {
  padding: 1rem 1.5rem;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
}

.tab-mobile:hover {
  color: #374151;
  background-color: #f9fafb;
}

.tab-mobile.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

/* Mobile Loading States */
.loading-mobile {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner-mobile {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile Form System */
.form-mobile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group-mobile {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label-mobile {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-error-mobile {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Mobile Typography System */
.text-mobile-xs { font-size: 0.75rem; line-height: 1rem; }
.text-mobile-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-mobile-base { font-size: 1rem; line-height: 1.5rem; }
.text-mobile-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-mobile-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-mobile-2xl { font-size: 1.5rem; line-height: 2rem; }

/* Responsive Typography */
@media (min-width: 768px) {
  .text-responsive-xs { font-size: 0.875rem; line-height: 1.25rem; }
  .text-responsive-sm { font-size: 1rem; line-height: 1.5rem; }
  .text-responsive-base { font-size: 1.125rem; line-height: 1.75rem; }
  .text-responsive-lg { font-size: 1.25rem; line-height: 1.75rem; }
  .text-responsive-xl { font-size: 1.5rem; line-height: 2rem; }
  .text-responsive-2xl { font-size: 2rem; line-height: 2.5rem; }
}

/* Mobile Safe Areas */
.safe-area-inset-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-inset-left {
  padding-left: env(safe-area-inset-left);
}

.safe-area-inset-right {
  padding-right: env(safe-area-inset-right);
}

/* Touch Feedback Utilities */
.no-tap-highlight {
  -webkit-tap-highlight-color: transparent;
}

.touch-manipulation {
  touch-action: manipulation;
}

/* Mobile-Only Classes */
.mobile-only {
  display: block;
}

@media (min-width: 768px) {
  .mobile-only {
    display: none;
  }
}

.desktop-only {
  display: none;
}

@media (min-width: 768px) {
  .desktop-only {
    display: block;
  }
}

/* Enhanced Touch States */
@media (hover: none) and (pointer: coarse) {
  .btn-touch:hover {
    background-color: inherit;
  }
  
  .btn-touch:active {
    background-color: #f3f4f6;
  }
}

/* Mobile Gestures */
.swipeable {
  touch-action: pan-y;
  user-select: none;
}

/* Pull to Refresh */
.pull-to-refresh-container {
  position: relative;
  overflow: hidden;
}

.pull-indicator {
  position: absolute;
  top: -60px;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  transition: transform 0.3s ease;
}

.pull-indicator.pulled {
  transform: translateY(60px);
}

/* Mobile Scroll Behavior */
.smooth-scroll {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Enhanced Mobile Optimizations */
@media (max-width: 767px) {
  .mobile-padding {
    padding: 1rem;
  }
  
  .mobile-margin {
    margin: 1rem;
  }
  
  .mobile-gap {
    gap: 1rem;
  }
  
  .mobile-text-center {
    text-align: center;
  }
  
  .mobile-flex-col {
    flex-direction: column;
  }
}

/* Enhanced Touch Feedback System */
.touch-feedback {
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.touch-feedback::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.4s, height 0.4s;
  pointer-events: none;
}

.touch-feedback:active::before {
  width: 200px;
  height: 200px;
}

.touch-feedback:active {
  transform: scale(0.95);
}

/* Touch-Optimized List Items */
.touch-list-item {
  min-height: 48px;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s ease;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.touch-list-item:hover {
  background-color: #f9fafb;
}

.touch-list-item:active {
  background-color: #f3f4f6;
  transform: scale(0.98);
}

/* Enhanced Touch Targets */
.touch-target-large {
  min-height: 52px;
  min-width: 52px;
}

.touch-target-comfortable {
  min-height: 48px;
  min-width: 48px;
}

.touch-target-minimum {
  min-height: 44px;
  min-width: 44px;
}

/* Touch Gesture Indicators */
.swipe-indicator {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
  opacity: 0.6;
}

.swipe-indicator-right {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 40px;
  background: #d1d5db;
  border-radius: 2px;
  opacity: 0.6;
}

/* Touch-Optimized Switches */
.touch-switch {
  position: relative;
  width: 52px;
  height: 28px;
  background: #d1d5db;
  border-radius: 14px;
  transition: all 0.3s ease;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.touch-switch.active {
  background: #3b82f6;
}

.touch-switch-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.touch-switch.active .touch-switch-handle {
  transform: translateX(24px);
}

/* Touch-Optimized Sliders */
.touch-slider {
  width: 100%;
  height: 40px;
  position: relative;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.touch-slider-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  transform: translateY(-50%);
}

.touch-slider-fill {
  position: absolute;
  top: 50%;
  left: 0;
  height: 4px;
  background: #3b82f6;
  border-radius: 2px;
  transform: translateY(-50%);
  transition: width 0.2s ease;
}

.touch-slider-thumb {
  position: absolute;
  top: 50%;
  width: 24px;
  height: 24px;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.touch-slider-thumb:active {
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Touch-Optimized Dropdowns */
.touch-dropdown {
  position: relative;
  min-height: 48px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s ease;
}

.touch-dropdown:active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.touch-dropdown-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  transition: transform 0.2s ease;
}

.touch-dropdown.open .touch-dropdown-arrow {
  transform: translateY(-50%) rotate(180deg);
}
`;

export const MOBILE_BREAKPOINTS = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const MOBILE_UTILS = {
  // Touch utilities
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  // Viewport utilities
  isMobile: () => {
    return window.innerWidth < 768;
  },
  
  isTablet: () => {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  },
  
  isDesktop: () => {
    return window.innerWidth >= 1024;
  },
  
  // Safe area utilities
  getSafeAreaInsets: () => {
    if (typeof document === 'undefined') return { top: '0px', bottom: '0px', left: '0px', right: '0px' };
    
    return {
      top: window.getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0px',
      bottom: window.getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0px',
      left: window.getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-left)') || '0px',
      right: window.getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-right)') || '0px',
    };
  },
  
  // Touch size utilities
  getOptimalTouchSize: () => {
    return {
      min: '44px',
      comfortable: '48px',
      large: '52px',
    };
  },
};

export const getMobileClasses = (type: string) => {
  const classes = {
    container: 'container-mobile',
    button: 'btn-touch',
    input: 'input-touch',
    card: 'card-mobile',
    nav: 'nav-mobile',
    modal: 'modal-mobile',
    form: 'form-mobile',
    tabs: 'tabs-mobile',
    tab: 'tab-mobile',
    feedback: 'touch-feedback',
    listItem: 'touch-list-item',
    targetLarge: 'touch-target-large',
    targetComfortable: 'touch-target-comfortable',
    targetMinimum: 'touch-target-minimum',
    switch: 'touch-switch',
    slider: 'touch-slider',
    dropdown: 'touch-dropdown',
  };
  
  return classes[type as keyof typeof classes] || '';
};

export default MOBILE_ENHANCEMENTS;