/**
 * Advanced Gesture Support System
 * Comprehensive touch gesture utilities for enhanced mobile interactions
 */

export const GESTURE_SYSTEM = `
/* Advanced Gesture Support */

/* Touch Action Classes */
.touch-pan-x { touch-action: pan-x; }
.touch-pan-y { touch-action: pan-y; }
.touch-pan { touch-action: pan; }
.touch-pinch-zoom { touch-action: pinch-zoom; }
.touch-manipulation { touch-action: manipulation; }
.touch-none { touch-action: none; }
.touch-auto { touch-action: auto; }

/* Swipeable Container */
.swipeable {
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
  overflow: hidden;
  position: relative;
}

.swipeable-horizontal {
  touch-action: pan-x;
}

.swipeable-vertical {
  touch-action: pan-y;
}

.swipeable-both {
  touch-action: none;
}

/* Swipe Indicators */
.swipe-indicator {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.swipe-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #d1d5db;
  transition: all 0.3s ease;
  cursor: pointer;
}

.swipe-dot.active {
  background-color: #3b82f6;
  width: 1.5rem;
  border-radius: 0.25rem;
}

.swipe-dot:hover {
  background-color: #9ca3af;
}

.swipe-dot.active:hover {
  background-color: #2563eb;
}

/* Pull to Refresh */
.pull-to-refresh {
  position: relative;
  overflow: hidden;
  touch-action: pan-y;
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
  background-color: #f9fafb;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 5;
}

.pull-indicator.pulling {
  transform: translateY(60px);
}

.pull-indicator.refreshing {
  transform: translateY(60px);
}

.pull-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.pull-arrow {
  width: 1.5rem;
  height: 1.5rem;
  color: #6b7280;
  transition: transform 0.3s ease;
}

.pull-arrow.rotated {
  transform: rotate(180deg);
}

/* Long Press */
.long-press {
  position: relative;
  touch-action: manipulation;
  user-select: none;
}

.long-press:active {
  transform: scale(0.95);
}

.long-press-feedback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: rgba(59, 130, 246, 0.1);
  border: 2px solid #3b82f6;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.long-press.active .long-press-feedback {
  opacity: 1;
  animation: long-press-pulse 1s ease-in-out infinite;
}

@keyframes long-press-pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* Pinch to Zoom */
.pinch-zoom {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  transform-origin: center center;
  transition: transform 0.3s ease;
}

.pinch-zoom.zooming {
  transition: none;
}

/* Double Tap */
.double-tap {
  touch-action: manipulation;
  user-select: none;
  position: relative;
}

.double-tap-feedback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: rgba(59, 130, 246, 0.2);
  border: 2px solid #3b82f6;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.double-tap.tapped .double-tap-feedback {
  opacity: 1;
  animation: double-tap-ripple 0.6s ease-out;
}

@keyframes double-tap-ripple {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

/* Swipe Gestures */
.swipe-gesture {
  touch-action: pan-x;
  user-select: none;
  -webkit-user-select: none;
  position: relative;
  overflow: hidden;
}

.swipe-gesture-vertical {
  touch-action: pan-y;
}

.swipe-gesture-container {
  display: flex;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  will-change: transform;
}

.swipe-gesture-item {
  flex-shrink: 0;
  width: 100%;
}

.swipe-gesture-item-horizontal {
  width: 100%;
}

.swipe-gesture-item-vertical {
  height: 100%;
}

/* Swipe Actions */
.swipe-actions {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.swipe-actions-left {
  left: 0;
  transform: translateX(-100%);
}

.swipe-actions-right {
  right: 0;
  transform: translateX(100%);
}

.swipe-actions.reveal-left .swipe-actions-left {
  transform: translateX(0);
}

.swipe-actions.reveal-right .swipe-actions-right {
  transform: translateX(0);
}

.swipe-action-button {
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.swipe-action-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.swipe-action-button:active {
  background-color: rgba(0, 0, 0, 0.1);
}

.swipe-action-button-primary {
  background-color: #3b82f6;
  color: white;
}

.swipe-action-button-danger {
  background-color: #ef4444;
  color: white;
}

.swipe-action-button-success {
  background-color: #22c55e;
  color: white;
}

/* Drag and Drop */
.draggable {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  cursor: grab;
  position: relative;
}

.draggable:active {
  cursor: grabbing;
}

.draggable.dragging {
  opacity: 0.8;
  transform: scale(1.05);
  z-index: 1000;
}

.drag-handle {
  touch-action: none;
  cursor: grab;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-handle:active {
  cursor: grabbing;
}

.drop-zone {
  border: 2px dashed transparent;
  transition: all 0.3s ease;
  position: relative;
}

.drop-zone.drag-over {
  border-color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.05);
}

.drop-zone.drag-over::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(59, 130, 246, 0.1);
  pointer-events: none;
}

/* Gesture Hints */
.gesture-hint {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transform: translateY(0.5rem);
  transition: all 0.3s ease;
}

.gesture-hint.show {
  opacity: 1;
  transform: translateY(0);
}

.gesture-hint::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
}

/* Touch Feedback */
.touch-feedback {
  position: relative;
  overflow: hidden;
}

.touch-feedback::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
  pointer-events: none;
}

.touch-feedback.touching::before {
  width: 200px;
  height: 200px;
}

/* Swipe Thresholds */
.swipe-threshold-sm { min-touch-distance: 50px; }
.swipe-threshold-md { min-touch-distance: 100px; }
.swipe-threshold-lg { min-touch-distance: 150px; }

/* Gesture Animations */
.gesture-slide-up {
  animation: gesture-slide-up 0.3s ease-out;
}

.gesture-slide-down {
  animation: gesture-slide-down 0.3s ease-out;
}

.gesture-slide-left {
  animation: gesture-slide-left 0.3s ease-out;
}

.gesture-slide-right {
  animation: gesture-slide-right 0.3s ease-out;
}

@keyframes gesture-slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes gesture-slide-down {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}

@keyframes gesture-slide-left {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes gesture-slide-right {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* Accessibility */
.gesture-accessible {
  position: relative;
}

.gesture-accessible:focus-within .gesture-hint {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive Gestures */
@media (pointer: coarse) {
  .touch-optimized {
    min-height: 44px;
    min-width: 44px;
  }
  
  .touch-spacing {
    margin: 0.5rem;
    padding: 0.5rem;
  }
}

@media (pointer: fine) {
  .mouse-optimized {
    cursor: pointer;
  }
  
  .mouse-spacing {
    margin: 0.25rem;
    padding: 0.25rem;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .pull-indicator {
    background-color: #374151;
  }
  
  .pull-arrow {
    color: #9ca3af;
  }
  
  .swipe-dot {
    background-color: #4b5563;
  }
  
  .swipe-dot:hover {
    background-color: #6b7280;
  }
  
  .swipe-action-button:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .swipe-action-button:active {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .drop-zone.drag-over {
    border-color: #60a5fa;
    background-color: rgba(96, 165, 250, 0.05);
  }
  
  .drop-zone.drag-over::before {
    background-color: rgba(96, 165, 250, 0.1);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .swipeable,
  .swipe-gesture-container,
  .swipe-actions,
  .pinch-zoom,
  .drop-zone,
  .gesture-hint,
  .touch-feedback::before,
  .pull-indicator,
  .swipe-dot {
    transition: none;
    animation: none;
  }
  
  .draggable.dragging {
    transform: none;
  }
  
  .long-press-feedback,
  .double-tap-feedback {
    animation: none;
  }
}
`;

export const GESTURE_CONFIG = {
  // Touch actions
  touchActions: {
    panX: 'touch-pan-x',
    panY: 'touch-pan-y',
    pan: 'touch-pan',
    pinchZoom: 'touch-pinch-zoom',
    manipulation: 'touch-manipulation',
    none: 'touch-none',
    auto: 'touch-auto',
  },
  
  // Gesture types
  gestures: {
    swipe: 'swipeable',
    swipeHorizontal: 'swipeable-horizontal',
    swipeVertical: 'swipeable-vertical',
    pullToRefresh: 'pull-to-refresh',
    longPress: 'long-press',
    pinchZoom: 'pinch-zoom',
    doubleTap: 'double-tap',
    dragAndDrop: 'draggable',
  },
  
  // Swipe thresholds
  thresholds: {
    small: 50,
    medium: 100,
    large: 150,
  },
  
  // Animation durations
  animations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  // Touch feedback
  feedback: {
    ripple: 'touch-feedback',
    scale: 'touch-scale',
    glow: 'touch-glow',
  },
  
  // Accessibility options
  accessibility: {
    keyboardSupport: true,
    screenReaderSupport: true,
    reducedMotionSupport: true,
  },
};

export const getGestureClasses = (gesture: keyof typeof GESTURE_CONFIG.gestures, direction?: 'horizontal' | 'vertical') => {
  const baseClass = GESTURE_CONFIG.gestures[gesture];
  
  if (gesture === 'swipe' && direction) {
    return `${baseClass}-${direction}`;
  }
  
  return baseClass;
};

export const getTouchActionClass = (action: keyof typeof GESTURE_CONFIG.touchActions) => {
  return GESTURE_CONFIG.touchActions[action];
};

export const getSwipeThreshold = (size: keyof typeof GESTURE_CONFIG.thresholds) => {
  return GESTURE_CONFIG.thresholds[size];
};

// Helper function to check if device supports touch
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Helper function to get touch action based on gesture type
export const getTouchActionForGesture = (gesture: string) => {
  const touchActions = {
    swipe: 'pan-y',
    swipeHorizontal: 'pan-x',
    swipeVertical: 'pan-y',
    pullToRefresh: 'pan-y',
    longPress: 'manipulation',
    pinchZoom: 'none',
    doubleTap: 'manipulation',
    dragAndDrop: 'none',
  };
  
  return touchActions[gesture as keyof typeof touchActions] || 'auto';
};

// Helper function to get optimal touch target size
export const getOptimalTouchTargetSize = () => {
  return {
    minSize: 44,
    comfortableSize: 48,
    largeSize: 52,
  };
};

// Helper function to detect gesture direction
export const detectGestureDirection = (startX: number, startY: number, endX: number, endY: number) => {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);
  
  if (absDeltaX > absDeltaY) {
    return deltaX > 0 ? 'right' : 'left';
  } else {
    return deltaY > 0 ? 'down' : 'up';
  }
};

// Touch interface for better type safety
interface TouchLike {
  clientX: number;
  clientY: number;
}

// Helper function to detect pinch gesture
export const detectPinchGesture = (touches: TouchLike[]) => {
  if (touches.length !== 2) return null;
  
  const touch1 = touches[0];
  const touch2 = touches[1];
  
  const distance = Math.sqrt(
    Math.pow(touch2.clientX - touch1.clientX, 2) +
    Math.pow(touch2.clientY - touch1.clientY, 2)
  );
  
  return distance;
};

export default GESTURE_SYSTEM;