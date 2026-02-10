import React, { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { UI_STRINGS } from '../../constants';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useHapticFeedback } from '../../utils/hapticFeedback';

export type LoadingOverlaySize = 'sm' | 'md' | 'lg' | 'full';
export type LoadingOverlayVariant = 'default' | 'minimal' | 'centered';
export type LoadingOverlayAnimation = 'spinner' | 'dots' | 'pulse' | 'bars' | 'skeleton';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  size?: LoadingOverlaySize;
  variant?: LoadingOverlayVariant;
  animation?: LoadingOverlayAnimation;
  showBackdrop?: boolean;
  backdropBlur?: boolean;
  progress?: number;
  showProgress?: boolean;
  className?: string;
  children?: React.ReactNode;
  delay?: number; // Delay before showing overlay (ms)
  minDisplay?: number; // Minimum display time (ms)
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = UI_STRINGS.LOADING,
  size = 'md',
  variant = 'default',
  animation = 'spinner',
  showBackdrop = true,
  backdropBlur = true,
  progress,
  showProgress = false,
  className = '',
  children,
  delay = 0,
  minDisplay = 500,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { onNotification } = useHapticFeedback();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let minDisplayTimeoutId: ReturnType<typeof setTimeout> | undefined;

    if (isLoading) {
      // Delay showing the overlay
      if (delay > 0) {
        timeoutId = setTimeout(() => {
          setIsVisible(true);
          setStartTime(Date.now());
          onNotification();
        }, delay);
      } else {
        setIsVisible(true);
        setStartTime(Date.now());
        onNotification();
      }
    } else {
      // Ensure minimum display time
      if (startTime && isVisible) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplay - elapsed);
        
        if (remaining > 0) {
          minDisplayTimeoutId = setTimeout(() => {
            setIsVisible(false);
            setStartTime(null);
          }, remaining);
        } else {
          setIsVisible(false);
          setStartTime(null);
        }
      } else {
        setIsVisible(false);
        setStartTime(null);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (minDisplayTimeoutId) clearTimeout(minDisplayTimeoutId);
    };
  }, [isLoading, delay, minDisplay, startTime, isVisible, onNotification]);

  if (!isVisible) return <>{children}</>;

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12',
    full: 'p-16',
  };

  const _spinnerSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    full: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    full: 'text-xl',
  };

  const renderLoadingAnimation = () => {
    switch (animation) {
      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'} bg-primary-500 rounded-full ${!prefersReducedMotion ? 'animate-bounce' : ''}`}
                style={{
                  animationDelay: prefersReducedMotion ? '0ms' : `${i * 150}ms`,
                }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return (
          <div className={`${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-16 h-16'} bg-primary-500 rounded-lg ${!prefersReducedMotion ? 'animate-pulse' : ''}`} />
        );
      case 'bars':
        return (
          <div className="flex space-x-1 items-end">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-primary-500 rounded-sm"
                style={{
                  width: '4px',
                  height: `${size === 'sm' ? 16 : size === 'md' ? 24 : size === 'lg' ? 32 : 40}px`,
                  ...(prefersReducedMotion ? {} : {
                    animation: `pulse 1.4s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }),
                }}
              />
            ))}
          </div>
        );
      case 'skeleton':
        return (
          <div className="space-y-2">
            <div className={`h-2 bg-neutral-200 dark:bg-neutral-600 rounded ${size === 'sm' ? 'w-16' : size === 'md' ? 'w-20' : size === 'lg' ? 'w-24' : 'w-32'} animate-pulse`} />
            <div className={`h-2 bg-neutral-200 dark:bg-neutral-600 rounded ${size === 'sm' ? 'w-12' : size === 'md' ? 'w-16' : size === 'lg' ? 'w-20' : 'w-24'} animate-pulse`} />
          </div>
        );
      case 'spinner':
      default:
        return <LoadingSpinner size={size as 'sm' | 'md' | 'lg'} className="text-primary-600" />;
    }
  };

  const variantClasses = {
    default: 'flex items-center justify-center min-h-[200px]',
    minimal: 'flex items-center justify-center',
    centered: 'flex items-center justify-center fixed inset-0',
  };

  const backdropClasses = showBackdrop
    ? backdropBlur
      ? 'bg-black/50 backdrop-blur-sm'
      : 'bg-black/30'
    : '';

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-4 ${sizeClasses[size]}`}>
      {renderLoadingAnimation()}
      
      {message && (
        <p className={`${textSizes[size]} text-neutral-600 dark:text-neutral-400 font-medium ${!prefersReducedMotion ? 'animate-pulse' : ''}`}>
          {message}
        </p>
      )}
      
      {showProgress && progress !== undefined && (
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Progress</span>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}
    </div>
  );

  if (variant === 'centered') {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${backdropClasses}`}
        role="status"
        aria-live="polite"
        aria-busy={isLoading}
      >
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-float border border-neutral-200 dark:border-neutral-700">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${variantClasses[variant]} ${backdropClasses} ${className}`}
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
    >
      {content}
    </div>
  );
};

export default LoadingOverlay;