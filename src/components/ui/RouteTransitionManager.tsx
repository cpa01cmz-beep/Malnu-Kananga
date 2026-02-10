/**
 * Route Transition Manager
 * Manages page transitions between routes with sophisticated animations
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import PageTransition, { TransitionType, TransitionEasing } from './PageTransition';
import { useHapticFeedback } from '../../utils/hapticFeedback';

interface RouteTransition {
  from: string;
  to: string;
  type: TransitionType;
  easing: TransitionEasing;
  duration: number;
}

interface RouteTransitionContextType {
  isTransitioning: boolean;
  currentPath: string;
  previousPath: string | null;
  transitionConfig: Partial<RouteTransition>;
  setTransition: (config: Partial<RouteTransition>) => void;
  navigateWithTransition: (path: string, config?: Partial<RouteTransition>) => void;
}

const RouteTransitionContext = createContext<RouteTransitionContextType | undefined>(undefined);

interface RouteTransitionProviderProps {
  children: ReactNode;
  defaultTransition?: Partial<RouteTransition>;
}

export const RouteTransitionProvider: React.FC<RouteTransitionProviderProps> = ({
  children,
  defaultTransition = {
    type: 'slide-fade',
    easing: 'ease-out',
    duration: 300,
  },
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const [transitionConfig, setTransitionConfig] = useState<Partial<RouteTransition>>(defaultTransition);
  const { onTap } = useHapticFeedback();

  // Smart transition type based on route hierarchy
  const getSmartTransition = (from: string, to: string): TransitionType => {
    const fromDepth = from.split('/').length;
    const toDepth = to.split('/').length;
    
    if (toDepth > fromDepth) {
      return 'slide-left'; // Going deeper
    } else if (toDepth < fromDepth) {
      return 'slide-right'; // Going up
    } else if (to.includes('/edit') || to.includes('/create')) {
      return 'slide-up-fade'; // Modal-like transitions
    } else if (from.includes('/edit') || from.includes('/create')) {
      return 'slide-down-fade'; // Closing modal
    } else {
      return 'fade'; // Same level navigation
    }
  };

  const navigateWithTransition = (path: string, config?: Partial<RouteTransition>) => {
    if (path === currentPath) return;

    setIsTransitioning(true);
    setPreviousPath(currentPath);
    
    const smartType = getSmartTransition(currentPath, path);
    const finalConfig = {
      type: smartType,
      easing: 'ease-out' as TransitionEasing,
      duration: 300,
      ...defaultTransition,
      ...config,
      from: currentPath,
      to: path,
    };

    setTransitionConfig(finalConfig);
    
    // Haptic feedback for mobile navigation
    if (window.innerWidth <= 768) {
      onTap();
    }

    // Update path after a brief delay for smooth transition
    setTimeout(() => {
      setCurrentPath(path);
      setIsTransitioning(false);
    }, 100);
  };

  const setTransition = (config: Partial<RouteTransition>) => {
    setTransitionConfig(prev => ({ ...prev, ...config }));
  };

  const value: RouteTransitionContextType = {
    isTransitioning,
    currentPath,
    previousPath,
    transitionConfig,
    setTransition,
    navigateWithTransition,
  };

  return (
    <RouteTransitionContext.Provider value={value}>
      {children}
    </RouteTransitionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRouteTransition = () => {
  const context = useContext(RouteTransitionContext);
  if (context === undefined) {
    throw new Error('useRouteTransition must be used within a RouteTransitionProvider');
  }
  return context;
};

  // Preset transitions for common navigation patterns
  // eslint-disable-next-line react-refresh/only-export-components
  export const RouteTransitions = {
    // Page-level transitions
    forward: { type: 'slide-left' as TransitionType, easing: 'ease-out' as TransitionEasing, duration: 300 },
    backward: { type: 'slide-right' as TransitionType, easing: 'ease-out' as TransitionEasing, duration: 300 },
    modal: { type: 'slide-up-fade' as TransitionType, easing: 'ease-out' as TransitionEasing, duration: 350 },
    closeModal: { type: 'slide-down-fade' as TransitionType, easing: 'ease-out' as TransitionEasing, duration: 300 },
  
  // Content transitions
  refresh: { type: 'fade' as TransitionType, easing: 'ease-out' as TransitionEasing, duration: 200 },
  focus: { type: 'scale-fade' as TransitionType, easing: 'elastic' as TransitionEasing, duration: 400 },
  success: { type: 'bounce' as TransitionType, easing: 'bounce' as TransitionEasing, duration: 500 },
  error: { type: 'scale' as TransitionType, easing: 'ease-out' as TransitionEasing, duration: 300 },
  
  // Special transitions
  elegant: { type: 'slide-fade' as TransitionType, easing: 'ease-in-out' as TransitionEasing, duration: 400 },
  quick: { type: 'fade' as TransitionType, easing: 'ease-out' as TransitionEasing, duration: 150 },
  playful: { type: 'elastic' as TransitionType, easing: 'elastic' as TransitionEasing, duration: 500 },
};

// Component for wrapping route content
interface RouteTransitionWrapperProps {
  children: ReactNode;
  path: string;
  customTransition?: Partial<RouteTransition>;
}

export const RouteTransitionWrapper: React.FC<RouteTransitionWrapperProps> = ({
  children,
  path,
  customTransition,
}) => {
  const { transitionConfig } = useRouteTransition();

  const isCurrentRoute = transitionConfig.to === path;
  const isPreviousRoute = transitionConfig.from === path;

  // Don't render if not involved in current transition
  if (!isCurrentRoute && !isPreviousRoute) {
    return null;
  }

  return (
    <PageTransition
      isLoaded={isCurrentRoute}
      animationType={customTransition?.type || transitionConfig.type || 'fade'}
      duration={customTransition?.duration || transitionConfig.duration || 300}
      easing={customTransition?.easing || transitionConfig.easing || 'ease-out'}
      mobileOptimized={true}
      hapticFeedback={false} // Handled at route level
    >
      {children}
    </PageTransition>
  );
};

// Hook for creating navigation functions with automatic transitions
// eslint-disable-next-line react-refresh/only-export-components
export const useNavigationWithTransitions = () => {
  const { navigateWithTransition } = useRouteTransition();

  const navigate = (path: string, transition?: keyof typeof RouteTransitions) => {
    const config = transition ? RouteTransitions[transition] : undefined;
    navigateWithTransition(path, config);
  };

  const goBack = () => {
    window.history.back();
    // The transition will be handled by the route change listener
  };

  const goForward = () => {
    window.history.forward();
  };

  return {
    navigate,
    goBack,
    goForward,
    // Convenience methods
    navigateToDashboard: () => navigate('/dashboard', 'refresh'),
    navigateToSettings: () => navigate('/settings', 'forward'),
    openModal: (path: string) => navigate(path, 'modal'),
    closeModal: () => {
      window.history.back();
      // The transition will be handled by the route change listener
    },
  };
};

export default RouteTransitionProvider;