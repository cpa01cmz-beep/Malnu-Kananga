/**
 * Enhanced Iconography and Visual Elements System
 * Comprehensive icon library and visual enhancement utilities
 */

export const ICONOGRAPHY_SYSTEM = `
/* Enhanced Icon System */

/* Base Icon Styles */
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  vertical-align: middle;
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 0;
}

.icon-stroke {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Icon Sizes */
.icon-xs { width: 0.75rem; height: 0.75rem; }
.icon-sm { width: 1rem; height: 1rem; }
.icon-base { width: 1.25rem; height: 1.25rem; }
.icon-lg { width: 1.5rem; height: 1.5rem; }
.icon-xl { width: 2rem; height: 2rem; }
.icon-2xl { width: 2.5rem; height: 2.5rem; }
.icon-3xl { width: 3rem; height: 3rem; }
.icon-4xl { width: 4rem; height: 4rem; }

/* Icon Button Styles */
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.icon-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.icon-button:active {
  background-color: #e5e7eb;
  transform: scale(0.95);
}

.icon-button-sm {
  width: 2rem;
  height: 2rem;
}

.icon-button-lg {
  width: 3rem;
  height: 3rem;
}

/* Icon Container */
.icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.icon-container-primary {
  background-color: #dbeafe;
  color: #1e40af;
}

.icon-container-success {
  background-color: #dcfce7;
  color: #166534;
}

.icon-container-warning {
  background-color: #fef3c7;
  color: #92400e;
}

.icon-container-error {
  background-color: #fee2e2;
  color: #991b1b;
}

.icon-container-info {
  background-color: #e0f2fe;
  color: #075985;
}

.icon-container-neutral {
  background-color: #f3f4f6;
  color: #374151;
}

/* Icon Variants */
.icon-ghost {
  background: transparent;
  border: none;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}

.icon-ghost:hover {
  background-color: #f9fafb;
}

.icon-outline {
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.icon-outline:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.icon-solid {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.2s ease;
}

.icon-solid:hover {
  background-color: #2563eb;
}

/* Icon Animations */
.icon-spin {
  animation: spin 1s linear infinite;
}

.icon-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.icon-bounce {
  animation: bounce 1s infinite;
}

.icon-shake {
  animation: shake 0.5s ease-in-out;
}

.icon-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.icon-fade-out {
  animation: fadeOut 0.3s ease-in-out;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
  40%, 43% { transform: translateY(-8px); }
  70% { transform: translateY(-4px); }
  90% { transform: translateY(-2px); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Icon States */
.icon-hover:hover {
  transform: scale(1.1);
  color: #3b82f6;
}

.icon-active {
  color: #3b82f6;
  transform: scale(1.1);
}

.icon-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.icon-loading {
  animation: spin 1s linear infinite;
  opacity: 0.7;
}

/* Icon Groups */
.icon-group {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.icon-group-sm { gap: 0.125rem; }
.icon-group-md { gap: 0.25rem; }
.icon-group-lg { gap: 0.5rem; }
.icon-group-xl { gap: 0.75rem; }

/* Icon Lists */
.icon-list {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-list-vertical {
  flex-direction: column;
  gap: 0.5rem;
}

/* Icon with Text */
.icon-with-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-with-text-sm { gap: 0.25rem; }
.icon-with-text-md { gap: 0.5rem; }
.icon-with-text-lg { gap: 0.75rem; }

.icon-with-text-left {
  flex-direction: row;
}

.icon-with-text-right {
  flex-direction: row-reverse;
}

.icon-with-text-top {
  flex-direction: column;
}

.icon-with-text-bottom {
  flex-direction: column-reverse;
}

/* Icon Badges */
.icon-badge {
  position: relative;
  display: inline-flex;
}

.icon-badge::after {
  content: attr(data-badge);
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background-color: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 1rem;
  text-align: center;
  line-height: 1;
}

.icon-badge-success::after {
  background-color: #22c55e;
}

.icon-badge-warning::after {
  background-color: #f59e0b;
}

.icon-badge-info::after {
  background-color: #3b82f6;
}

/* Icon Tooltips */
.icon-tooltip {
  position: relative;
}

.icon-tooltip::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1f2937;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 1000;
}

.icon-tooltip::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1f2937;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 1000;
}

.icon-tooltip:hover::before,
.icon-tooltip:hover::after {
  opacity: 1;
}

/* Visual Elements */

/* Dividers */
.divider {
  width: 100%;
  height: 1px;
  background-color: #e5e7eb;
  margin: 1rem 0;
}

.divider-vertical {
  width: 1px;
  height: 100%;
  background-color: #e5e7eb;
  margin: 0 1rem;
}

.divider-dashed {
  background-image: linear-gradient(to right, #e5e7eb 50%, transparent 50%);
  background-size: 8px 1px;
  background-repeat: repeat-x;
}

.divider-dotted {
  background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
  background-size: 4px 4px;
  background-repeat: repeat-x;
}

/* Decorative Elements */
.decoration-dots {
  background-image: radial-gradient(circle, #d1d5db 1px, transparent 1px);
  background-size: 8px 8px;
}

.decoration-grid {
  background-image: 
    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
}

.decoration-diagonal {
  background-image: linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
                    linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
                    linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
}

/* Patterns */
.pattern-circles {
  background-image: radial-gradient(circle, #d1d5db 2px, transparent 2px);
  background-size: 20px 20px;
}

.pattern-hexagons {
  background-image: 
    linear-gradient(30deg, #e5e7eb 12%, transparent 12.5%, transparent 87%, #e5e7eb 87.5%, #e5e7eb),
    linear-gradient(150deg, #e5e7eb 12%, transparent 12.5%, transparent 87%, #e5e7eb 87.5%, #e5e7eb),
    linear-gradient(30deg, #e5e7eb 12%, transparent 12.5%, transparent 87%, #e5e7eb 87.5%, #e5e7eb),
    linear-gradient(150deg, #e5e7eb 12%, transparent 12.5%, transparent 87%, #e5e7eb 87.5%, #e5e7eb);
  background-size: 20px 35px;
}

.pattern-stripes {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    #e5e7eb 10px,
    #e5e7eb 20px
  );
}

/* Visual Indicators */
.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.indicator-dot-sm { width: 6px; height: 6px; }
.indicator-dot-lg { width: 10px; height: 10px; }
.indicator-dot-xl { width: 12px; height: 12px; }

.indicator-dot-online { background-color: #22c55e; }
.indicator-dot-offline { background-color: #6b7280; }
.indicator-dot-busy { background-color: #f59e0b; }
.indicator-dot-away { background-color: #ef4444; }

.indicator-dot-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Progress Indicators */
.progress-ring {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-radius: 50%;
  position: relative;
}

.progress-ring::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border: 3px solid #3b82f6;
  border-radius: 50%;
  border-top-color: transparent;
  border-right-color: transparent;
  transform: rotate(-45deg);
  animation: progress-ring-spin 1s linear infinite;
}

@keyframes progress-ring-spin {
  from { transform: rotate(-45deg); }
  to { transform: rotate(315deg); }
}

/* Visual Feedback */
.feedback-shimmer {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Accessibility */
.icon-aria-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.icon-focusable:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 0.25rem;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .icon-button:hover {
    background-color: #374151;
    color: #d1d5db;
  }
  
  .icon-button:active {
    background-color: #4b5563;
  }
  
  .icon-ghost:hover {
    background-color: #374151;
  }
  
  .icon-outline {
    border-color: #4b5563;
  }
  
  .icon-outline:hover {
    background-color: #374151;
    border-color: #6b7280;
  }
  
  .divider {
    background-color: #4b5563;
  }
  
  .divider-vertical {
    background-color: #4b5563;
  }
  
  .decoration-dots {
    background-image: radial-gradient(circle, #6b7280 1px, transparent 1px);
  }
  
  .decoration-grid {
    background-image: 
      linear-gradient(to right, #4b5563 1px, transparent 1px),
      linear-gradient(to bottom, #4b5563 1px, transparent 1px);
  }
  
  .decoration-diagonal {
    background-image: 
      linear-gradient(45deg, #4b5563 25%, transparent 25%, transparent 75%, #4b5563 75%),
      linear-gradient(-45deg, #4b5563 25%, transparent 25%, transparent 75%, #4b5563 75%);
  }
}

/* Responsive Icon Sizes */
@media (max-width: 640px) {
  .icon-responsive-sm { width: 1rem; height: 1rem; }
  .icon-responsive-md { width: 1.25rem; height: 1.25rem; }
  .icon-responsive-lg { width: 1.5rem; height: 1.5rem; }
}

@media (min-width: 641px) {
  .icon-responsive-sm { width: 1.25rem; height: 1.25rem; }
  .icon-responsive-md { width: 1.5rem; height: 1.5rem; }
  .icon-responsive-lg { width: 1.75rem; height: 1.75rem; }
}

@media (min-width: 1024px) {
  .icon-responsive-sm { width: 1.5rem; height: 1.5rem; }
  .icon-responsive-md { width: 1.75rem; height: 1.75rem; }
  .icon-responsive-lg { width: 2rem; height: 2rem; }
}
`;

export const ICON_CONFIG = {
  // Icon sizes
  sizes: {
    xs: '0.75rem',
    sm: '1rem',
    base: '1.25rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem',
  },
  
  // Icon variants
  variants: {
    solid: 'icon-solid',
    outline: 'icon-outline',
    ghost: 'icon-ghost',
  },
  
  // Icon states
  states: {
    default: 'icon-default',
    hover: 'icon-hover',
    active: 'icon-active',
    disabled: 'icon-disabled',
    loading: 'icon-loading',
  },
  
  // Icon animations
  animations: {
    spin: 'icon-spin',
    pulse: 'icon-pulse',
    bounce: 'icon-bounce',
    shake: 'icon-shake',
    'fade-in': 'icon-fade-in',
    'fade-out': 'icon-fade-out',
  },
  
  // Icon containers
  containers: {
    primary: 'icon-container-primary',
    success: 'icon-container-success',
    warning: 'icon-container-warning',
    error: 'icon-container-error',
    info: 'icon-container-info',
    neutral: 'icon-container-neutral',
  },
  
  // Button configurations
  button: {
    base: 'icon-button',
    sm: 'icon-button-sm',
    lg: 'icon-button-lg',
  },
  
  // Common icon categories
  categories: {
    navigation: ['home', 'menu', 'back', 'forward', 'up', 'down', 'left', 'right'],
    actions: ['add', 'edit', 'delete', 'save', 'cancel', 'confirm', 'search', 'filter'],
    status: ['success', 'warning', 'error', 'info', 'loading', 'offline', 'online'],
    media: ['play', 'pause', 'stop', 'volume-up', 'volume-down', 'volume-mute'],
    social: ['share', 'like', 'comment', 'bookmark', 'follow', 'message'],
  },
};

export const getIconClasses = (variant: keyof typeof ICON_CONFIG.variants, size: keyof typeof ICON_CONFIG.sizes, state?: keyof typeof ICON_CONFIG.states) => {
  const sizeClass = `icon-${size}`;
  const variantClass = ICON_CONFIG.variants[variant];
  const stateClass = state ? ICON_CONFIG.states[state] : '';
  
  return `${sizeClass} ${variantClass} ${stateClass}`.trim();
};

export const getIconButtonClasses = (size: 'sm' | 'base' | 'lg' = 'base') => {
  const baseClass = ICON_CONFIG.button.base;
  const sizeClass = size === 'sm' ? ICON_CONFIG.button.sm : size === 'lg' ? ICON_CONFIG.button.lg : '';
  
  return `${baseClass} ${sizeClass}`.trim();
};

export const getIconContainerClasses = (type: keyof typeof ICON_CONFIG.containers) => {
  return `icon-container ${ICON_CONFIG.containers[type]}`;
};

export default ICONOGRAPHY_SYSTEM;