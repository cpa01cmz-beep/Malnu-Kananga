/**
 * Enhanced Micro-interactions and Hover States
 * Advanced CSS classes for sophisticated user interactions
 */

export const MICRO_INTERACTIONS = `
/* Enhanced Hover States */
.hover-lift {
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              box-shadow 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.hover-lift:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
}

.hover-lift-lg:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2);
}

/* Enhanced Glow Effects */
.hover-glow {
  transition: box-shadow 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.hover-glow-enhanced:hover {
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
}

/* Color-specific glow effects */
.hover-glow-success:hover {
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.hover-glow-warning:hover {
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}

.hover-glow-error:hover {
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

/* Interactive Scale Effects */
.hover-scale {
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.hover-scale:hover {
  transform: scale(1.05);
}

.hover-scale-sm:hover {
  transform: scale(1.02);
}

.hover-scale-lg:hover {
  transform: scale(1.1);
}

/* Rotation Effects */
.hover-rotate {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.hover-rotate:hover {
  transform: rotate(5deg);
}

.hover-rotate-360:hover {
  transform: rotate(360deg);
}

/* Background Gradient Transitions */
.hover-gradient {
  transition: background 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.hover-gradient:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Border Color Transitions */
.hover-border {
  transition: border-color 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.hover-border:hover {
  border-color: #3b82f6;
}

/* Text Shadow Effects */
.hover-text-glow {
  transition: text-shadow 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.ripple:active::before {
  width: 300px;
  height: 300px;
}

/* Pulse Animation */
.pulse-on-hover {
  transition: transform 0.2s;
}

.pulse-on-hover:hover {
  animation: pulse-hover 1s infinite;
}

@keyframes pulse-hover {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Shake Animation */
.shake-on-hover:hover {
  animation: shake-hover 0.5s;
}

@keyframes shake-hover {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-2px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(2px);
  }
}

/* Bounce Animation */
.bounce-on-hover:hover {
  animation: bounce-hover 0.6s;
}

@keyframes bounce-hover {
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-8px);
  }
  70% {
    transform: translateY(-4px);
  }
  90% {
    transform: translateY(-2px);
  }
}

/* Float Animation */
.float-on-hover {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.float-on-hover:hover {
  animation: float-hover 2s ease-in-out infinite;
}

@keyframes float-hover {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Tilt Effect */
.hover-tilt {
  transition: transform 0.2s;
  transform-style: preserve-3d;
}

.hover-tilt:hover {
  transform: perspective(1000px) rotateX(5deg) rotateY(5deg);
}

/* Staggered Animation for Lists */
.stagger-fade-in {
  animation: stagger-fade-in 0.5s ease-out forwards;
}

.stagger-fade-in:nth-child(1) { animation-delay: 0.1s; }
.stagger-fade-in:nth-child(2) { animation-delay: 0.2s; }
.stagger-fade-in:nth-child(3) { animation-delay: 0.3s; }
.stagger-fade-in:nth-child(4) { animation-delay: 0.4s; }
.stagger-fade-in:nth-child(5) { animation-delay: 0.5s; }

@keyframes stagger-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Magnetic Effect */
.magnetic {
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Active States */
.active-scale:active {
  transform: scale(0.95);
}

.active-rotate:active {
  transform: rotate(2deg);
}

.active-glow:active {
  box-shadow: 0 0 25px rgba(59, 130, 246, 0.6);
}

/* Focus States */
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.focus-ring-offset:focus {
  outline: none;
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(59, 130, 246, 0.3);
}

/* Loading States */
.loading-dots {
  display: inline-flex;
  gap: 4px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  animation: loading-dots 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

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
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
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
  animation: success-checkmark 0.6s ease-in-out;
}

@keyframes success-checkmark {
  0% {
    transform: scale(0) rotate(-45deg);
  }
  50% {
    transform: scale(1.2) rotate(-45deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* Error Shake */
.error-shake {
  animation: error-shake 0.5s ease-in-out;
}

@keyframes error-shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
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
    min-height: 44px;
    min-width: 44px;
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