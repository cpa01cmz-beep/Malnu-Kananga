import React, { ReactNode, useEffect, useState } from 'react';

export type TransitionType = 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale';

interface PageTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  duration?: number;
  className?: string;
  isVisible?: boolean;
  onTransitionComplete?: () => void;
}

const transitionClasses: Record<TransitionType, { enter: string; exit: string }> = {
  fade: {
    enter: 'animate-fade-in',
    exit: 'animate-fade-out'
  },
  'slide-up': {
    enter: 'animate-slide-in-up',
    exit: 'animate-slide-out-down'
  },
  'slide-down': {
    enter: 'animate-slide-in-down',
    exit: 'animate-slide-out-up'
  },
  'slide-left': {
    enter: 'animate-slide-in-left',
    exit: 'animate-slide-out-right'
  },
  'slide-right': {
    enter: 'animate-slide-in-right',
    exit: 'animate-slide-out-left'
  },
  scale: {
    enter: 'animate-scale-in',
    exit: 'animate-scale-out'
  }
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 300,
  className = '',
  isVisible = true,
  onTransitionComplete
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Small delay to ensure DOM update before animation
      setTimeout(() => {
        setAnimationClass(transitionClasses[type].enter);
      }, 10);
      
      if (onTransitionComplete) {
        setTimeout(onTransitionComplete, duration);
      }
    } else {
      setAnimationClass(transitionClasses[type].exit);
      setTimeout(() => {
        setShouldRender(false);
      }, duration);
    }
  }, [isVisible, type, duration, onTransitionComplete]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`${animationClass} ${className}`}
      style={{ 
        animationDuration: `${duration}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  );
};

// Staggered animation for lists and grids
interface StaggeredTransitionProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  isVisible?: boolean;
  itemDelay?: number;
}

export const StaggeredTransition: React.FC<StaggeredTransitionProps> = ({ 
  children, 
  staggerDelay = 100, 
  className = '', 
  isVisible = true,
  itemDelay = 100
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      setTimeout(() => {
        setShouldRender(false);
      }, staggerDelay);
    }
  }, [isVisible, staggerDelay]);

  if (!shouldRender) return null;

  const childArray = React.Children.toArray(children);

  return (
    <div className={`stagger-animation ${className}`}>
      {childArray.map((child, index) => (
        <div
          key={index}
          className="animate-fade-in-up"
          style={{ 
            animationDelay: `${index * itemDelay}ms`,
            animationFillMode: 'both'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// Route change animation component
interface RouteTransitionProps {
  children: ReactNode;
  routeKey: string;
  type?: TransitionType;
  duration?: number;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({ 
  children, 
  routeKey, 
  type = 'slide-up',
  duration = 300
}) => {
  const [currentRoute, setCurrentRoute] = useState(routeKey);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayContent, setDisplayContent] = useState(children);

  useEffect(() => {
    if (routeKey !== currentRoute) {
      setIsTransitioning(true);
      
      // Exit animation
      setTimeout(() => {
        setDisplayContent(children);
        setIsTransitioning(false);
        setCurrentRoute(routeKey);
      }, duration / 2);
    }
  }, [routeKey, currentRoute, duration, children]);

  return (
    <div
      className={`
        ${transitionClasses[type].enter} 
        ${isTransitioning ? transitionClasses[type].exit : ''}
      `}
      style={{ 
        animationDuration: `${duration}ms`,
        animationFillMode: 'both'
      }}
    >
      {displayContent}
    </div>
  );
};

// Loading state with skeleton and transition
interface LoadingTransitionProps {
  isLoading: boolean;
  children: ReactNode;
  skeleton?: ReactNode;
  className?: string;
}

export const LoadingTransition: React.FC<LoadingTransitionProps> = ({
  isLoading,
  children,
  skeleton,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <PageTransition 
        isVisible={!isLoading}
        type="fade"
        duration={200}
      >
        {children}
      </PageTransition>
      
      {isLoading && skeleton && (
        <PageTransition 
          isVisible={isLoading}
          type="fade"
          duration={200}
        >
          {skeleton}
        </PageTransition>
      )}
    </div>
  );
};

// Smooth scroll utility
export const smoothScrollTo = (elementId: string, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// Smooth scroll to top
export const scrollToTop = (behavior: 'smooth' | 'auto' = 'smooth') => {
  window.scrollTo({
    top: 0,
    behavior
  });
};

export default PageTransition;