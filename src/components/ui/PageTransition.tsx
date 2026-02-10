import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useAccessibility';

interface PageTransitionProps {
  children: React.ReactNode;
  isLoaded?: boolean;
  animationType?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale';
  duration?: number;
  delay?: number;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isLoaded = true,
  animationType = 'fade',
  duration = 300,
  delay = 0,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isLoaded && !shouldRender) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay + 50);
      
      return () => clearTimeout(timer);
    } else if (!isLoaded && shouldRender) {
      setIsVisible(false);
      // Wait for exit animation before removing from DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, shouldRender, delay, duration]);

  const getAnimationClasses = () => {
    if (prefersReducedMotion) {
      return isVisible ? 'opacity-100' : 'opacity-0';
    }

    const baseClasses = 'transition-all ease-out';
    
    switch (animationType) {
      case 'fade':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`;
      case 'slide-up':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;
      case 'slide-down':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`;
      case 'slide-left':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`;
      case 'slide-right':
        return `${baseClasses} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`;
      case 'scale':
        return `${baseClasses} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`;
      default:
        return `${baseClasses} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
    }
  };

  const animationStyle = {
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`${getAnimationClasses()} ${className}`}
      style={animationStyle}
      aria-hidden={!isVisible}
    >
      {children}
    </div>
  );
};

export default PageTransition;