import React, { useCallback, useRef, useEffect } from 'react';

/**
 * Enhanced Micro-interactions Hook
 * Provides easy-to-use animations and interactions for React components
 */

interface UseMicroInteractionsOptions {
  // Hover effects
  hoverLift?: boolean;
  hoverScale?: boolean;
  hoverGlow?: boolean;
  hoverTilt?: boolean;
  
  // Click effects
  clickRipple?: boolean;
  clickScale?: boolean;
  
  // Loading states
  loading?: boolean;
  loadingType?: 'spinner' | 'dots' | 'skeleton';
  
  // Success/error states
  success?: boolean;
  error?: boolean;
  
  // Animation preferences
  respectReducedMotion?: boolean;
  animationDuration?: number;
  
  // Callbacks
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onClick?: () => void;
}

interface UseMicroInteractionsReturn {
  // CSS classes
  className: string;
  
  // State
  isHovered: boolean;
  isClicked: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  
  // Animation controls
  triggerSuccess: () => void;
  triggerError: () => void;
  reset: () => void;
  
  // Ref for DOM manipulation
  ref: React.RefObject<HTMLElement | null>;
}

export const useMicroInteractions = (
  options: UseMicroInteractionsOptions = {}
): UseMicroInteractionsReturn => {
  const {
    hoverLift = false,
    hoverScale = false,
    hoverGlow = false,
    hoverTilt = false,
    clickRipple = false,
    clickScale = false,
    loading = false,
    loadingType = 'spinner',
    success = false,
    error = false,
    respectReducedMotion = true,
    animationDuration = 300,
    onHoverStart,
    onHoverEnd,
    onClick,
  } = options;

  const [isHovered, setIsHovered] = React.useState(false);
  const [isClicked, setIsClicked] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(loading);
  const [isSuccess, setIsSuccess] = React.useState(success);
  const [isError, setIsError] = React.useState(error);
  const [shouldAnimate, setShouldAnimate] = React.useState(true);

  const ref = useRef<HTMLElement>(null);

  // Check for reduced motion preference
  useEffect(() => {
    if (respectReducedMotion) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setShouldAnimate(!mediaQuery.matches);

      const handleChange = (event: MediaQueryListEvent) => {
        setShouldAnimate(!event.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [respectReducedMotion]);

  // Build CSS classes
  const buildClassName = useCallback(() => {
    const classes = [];

    // Hover effects
    if (hoverLift && shouldAnimate) classes.push('hover-lift');
    if (hoverScale && shouldAnimate) classes.push('hover-scale-sm');
    if (hoverGlow && shouldAnimate) classes.push('hover-glow');
    if (hoverTilt && shouldAnimate) classes.push('hover-tilt');

    // Click effects
    if (clickRipple && shouldAnimate) classes.push('ripple-click');
    if (clickScale && shouldAnimate) classes.push('active-scale');

    // Loading states
    if (isLoading) {
      classes.push('opacity-75', 'pointer-events-none');
      if (loadingType === 'spinner') classes.push('button-loading');
    }

    // Success/error states
    if (isSuccess && shouldAnimate) classes.push('success-checkmark');
    if (isError && shouldAnimate) classes.push('error-shake-enhanced');

    // State-based classes
    if (isHovered) classes.push('hovered');
    if (isClicked) classes.push('clicked');

    return classes.join(' ');
  }, [
    hoverLift,
    hoverScale,
    hoverGlow,
    hoverTilt,
    clickRipple,
    clickScale,
    isLoading,
    loadingType,
    isSuccess,
    isError,
    isHovered,
    isClicked,
    shouldAnimate,
  ]);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onHoverStart?.();
  }, [onHoverStart]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    onHoverEnd?.();
  }, [onHoverEnd]);

  const handleClick = useCallback(() => {
    setIsClicked(true);
    onClick?.();

    // Reset clicked state after animation
    setTimeout(() => {
      setIsClicked(false);
    }, animationDuration);
  }, [onClick, animationDuration]);

  // Animation controls
  const triggerSuccess = useCallback(() => {
    setIsSuccess(true);
    setIsError(false);
    
    // Reset success state after animation
    setTimeout(() => {
      setIsSuccess(false);
    }, 2000);
  }, []);

  const triggerError = useCallback(() => {
    setIsError(true);
    setIsSuccess(false);
    
    // Reset error state after animation
    setTimeout(() => {
      setIsError(false);
    }, 2000);
  }, []);

  const reset = useCallback(() => {
    setIsSuccess(false);
    setIsError(false);
    setIsClicked(false);
    setIsLoading(false);
  }, []);

  // Update loading state when prop changes
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // Update success/error states when props change
  useEffect(() => {
    setIsSuccess(success);
  }, [success]);

  useEffect(() => {
    setIsError(error);
  }, [error]);

  // Apply event listeners to ref
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('click', handleClick);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('click', handleClick);
    };
  }, [handleMouseEnter, handleMouseLeave, handleClick]);

  return {
    className: buildClassName(),
    isHovered,
    isClicked,
    isLoading,
    isSuccess,
    isError,
    triggerSuccess,
    triggerError,
    reset,
    ref,
  };
};

// Specialized hooks for common patterns
export const useButtonAnimation = (loading = false, onClick?: () => void) => {
  return useMicroInteractions({
    hoverLift: true,
    hoverScale: true,
    clickScale: true,
    loading,
    onClick,
  });
};

export const useCardAnimation = () => {
  return useMicroInteractions({
    hoverLift: true,
    hoverGlow: true,
    hoverTilt: true,
  });
};

export const useInputAnimation = (onFocus?: () => void, onBlur?: () => void) => {
  const ref = useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleFocus = () => {
      setIsFocused(true);
      onFocus?.();
    };

    const handleBlur = () => {
      setIsFocused(false);
      onBlur?.();
    };

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [onFocus, onBlur]);

  const className = React.useMemo(() => {
    const classes = ['search-input-animate'];
    if (isFocused) classes.push('focused');
    return classes.join(' ');
  }, [isFocused]);

  return { className, isFocused, ref };
};

export const useModalAnimation = (isOpen: boolean) => {
  const [isVisible, setIsVisible] = React.useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // Delay hiding for animation
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
  }, [isOpen]);

  const backdropClassName = isVisible ? 'modal-backdrop-animate visible' : 'modal-backdrop-animate';
  const contentClassName = isVisible ? 'modal-content-animate visible' : 'modal-content-animate';

  return {
    backdropClassName,
    contentClassName,
    isVisible,
  };
};

export const useNotificationAnimation = (isVisible: boolean) => {
  const className = isVisible ? 'notification-slide visible' : 'notification-slide';
  return { className };
};

export const useTabIndicator = (activeIndex: number, tabs: string[]) => {
  const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties>({});

  useEffect(() => {
    // Update indicator position based on active tab
    const tabWidth = 100 / tabs.length; // Assuming equal width tabs
    setIndicatorStyle({
      left: `${activeIndex * tabWidth}%`,
      width: `${tabWidth}%`,
    });
  }, [activeIndex, tabs]);

  return {
    className: 'tab-indicator',
    style: indicatorStyle,
  };
};

export default useMicroInteractions;