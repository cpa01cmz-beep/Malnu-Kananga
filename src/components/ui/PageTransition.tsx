import React, { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useAccessibility';
import { useHapticFeedback } from '../../utils/hapticFeedback';

export type TransitionType = 
  | 'fade' 
  | 'slide-up' 
  | 'slide-down' 
  | 'slide-left' 
  | 'slide-right' 
  | 'scale' 
  | 'flip' 
  | 'rotate' 
  | 'bounce' 
  | 'elastic' 
  | 'slide-fade' 
  | 'scale-fade'
  | 'slide-up-fade'
  | 'slide-down-fade'
  | 'slide-left-fade'
  | 'slide-right-fade'
  | 'shake';

export type TransitionEasing = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';

interface PageTransitionProps {
  children: React.ReactNode;
  isLoaded?: boolean;
  animationType?: TransitionType;
  duration?: number;
  delay?: number;
  easing?: TransitionEasing;
  className?: string;
  staggerChildren?: boolean;
  staggerDelay?: number;
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
  mobileOptimized?: boolean;
  hapticFeedback?: boolean;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isLoaded = true,
  animationType = 'fade',
  duration = 300,
  delay = 0,
  easing = 'ease-out',
  className = '',
  staggerChildren = false,
  staggerDelay = 100,
  onTransitionStart,
  onTransitionEnd,
  mobileOptimized = true,
  hapticFeedback = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { onTap } = useHapticFeedback();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && !shouldRender) {
      setShouldRender(true);
      onTransitionStart?.();
      
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsVisible(true);
        if (hapticFeedback && window.innerWidth <= 768) {
          onTap();
        }
      }, delay + 50);
      
      return () => clearTimeout(timer);
    } else if (!isLoaded && shouldRender) {
      setIsVisible(false);
      // Wait for exit animation before removing from DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
        onTransitionEnd?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, shouldRender, delay, duration, onTransitionStart, onTransitionEnd, hapticFeedback, onTap]);

  const getEasingFunction = () => {
    switch (easing) {
      case 'ease': return 'ease';
      case 'ease-in': return 'ease-in';
      case 'ease-out': return 'ease-out';
      case 'ease-in-out': return 'ease-in-out';
      case 'bounce': return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      case 'elastic': return 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      default: return 'ease-out';
    }
  };

  const getAnimationClasses = () => {
    if (prefersReducedMotion) {
      return isVisible ? 'opacity-100' : 'opacity-0';
    }

    const baseClasses = `transition-all ${getEasingFunction()}`;
    
    // Mobile optimization - reduce animation complexity on mobile
    const isMobile = mobileOptimized && window.innerWidth <= 768;
    const translateDistance = isMobile ? '4' : '8';
    
    switch (animationType) {
      case 'fade':
        return `${baseClasses} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
      case 'slide-up':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : `opacity-0 translate-y-${translateDistance}`}`;
      case 'slide-down':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : `opacity-0 -translate-y-${translateDistance}`}`;
      case 'slide-left':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-x-0' : `opacity-0 translate-x-${translateDistance}`}`;
      case 'slide-right':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-x-0' : `opacity-0 -translate-x-${translateDistance}`}`;
      case 'scale':
        return `${baseClasses} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`;
      case 'flip':
        return `${baseClasses} ${isVisible ? 'opacity-100 rotateY-0' : 'opacity-0 rotateY-90'}`;
      case 'rotate':
        return `${baseClasses} ${isVisible ? 'opacity-100 rotate-0' : 'opacity-0 rotate-3 scale-95'}`;
      case 'bounce':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0 scale-100' : `opacity-0 -translate-y-${translateDistance} scale-90`}`;
      case 'elastic':
        return `${baseClasses} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`;
      case 'slide-fade':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : `opacity-0 translate-y-${translateDistance}`}`;
      case 'scale-fade':
        return `${baseClasses} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`;
      case 'slide-up-fade':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-' + translateDistance}`;
      case 'slide-down-fade':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-' + translateDistance}`;
      case 'slide-left-fade':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-' + translateDistance}`;
      case 'slide-right-fade':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-' + translateDistance}`;
      case 'shake':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-0'}`;
      default:
        return `${baseClasses} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
    }
  };

  const animationStyle = {
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
  };

  const getChildrenWithStagger = () => {
    if (!staggerChildren) return children;

    return React.Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        const childProps = child.props as { style?: React.CSSProperties };
        const newProps = {
          style: {
            ...childProps.style,
            transitionDelay: `${delay + (index * staggerDelay)}ms`,
          },
        };
        return React.cloneElement(child, newProps as React.Attributes & { style?: React.CSSProperties });
      }
      return child;
    });
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`${getAnimationClasses()} ${className}`}
      style={animationStyle}
      aria-hidden={!isVisible}
    >
      {getChildrenWithStagger()}
    </div>
  );
};

export default PageTransition;