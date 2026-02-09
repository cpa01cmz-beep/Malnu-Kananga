import React, { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Type declarations for NodeJS.Timeout
type TimeoutType = ReturnType<typeof setTimeout>;

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
export type TooltipVariant = 'default' | 'dark' | 'light' | 'primary' | 'success' | 'warning' | 'error';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  delay?: number;
  hideDelay?: number;
  disabled?: boolean;
  arrow?: boolean;
  maxWidth?: number;
  className?: string;
  interactive?: boolean;
}

const positionClasses: Record<TooltipVariant, string> = {
  default: 'bg-neutral-900 text-white border-neutral-700',
  dark: 'bg-neutral-800 text-white border-neutral-600',
  light: 'bg-white text-neutral-900 border-neutral-200 shadow-lg',
  primary: 'bg-primary-600 text-white border-primary-700',
  success: 'bg-green-600 text-white border-green-700',
  warning: 'bg-orange-500 text-white border-orange-600',
  error: 'bg-red-600 text-white border-red-700'
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  variant = 'default',
  delay = 300,
  hideDelay = 100,
  disabled = false,
  arrow = true,
  maxWidth = 250,
  className = '',
  interactive = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<TimeoutType | null>(null);
  const hideTimeoutRef = useRef<TimeoutType | null>(null);

  const showTooltip = useCallback(() => {
    if (disabled) return;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [disabled, delay]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  }, [hideDelay]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let finalPosition = position;
    let left = 0;
    let top = 0;

    // Calculate position based on desired position
    switch (position) {
      case 'top':
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        top = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'top-start':
        left = triggerRect.left;
        top = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'top-end':
        left = triggerRect.right - tooltipRect.width;
        top = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        top = triggerRect.bottom + 8;
        break;
      case 'bottom-start':
        left = triggerRect.left;
        top = triggerRect.bottom + 8;
        break;
      case 'bottom-end':
        left = triggerRect.right - tooltipRect.width;
        top = triggerRect.bottom + 8;
        break;
      case 'left':
        left = triggerRect.left - tooltipRect.width - 8;
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'left-start':
        left = triggerRect.left - tooltipRect.width - 8;
        top = triggerRect.top;
        break;
      case 'left-end':
        left = triggerRect.left - tooltipRect.width - 8;
        top = triggerRect.bottom - tooltipRect.height;
        break;
      case 'right':
        left = triggerRect.right + 8;
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right-start':
        left = triggerRect.right + 8;
        top = triggerRect.top;
        break;
      case 'right-end':
        left = triggerRect.right + 8;
        top = triggerRect.bottom - tooltipRect.height;
        break;
    }

    // Adjust if tooltip goes out of viewport
    if (left < 10) {
      left = 10;
      finalPosition = position.includes('right') ? 'right-start' : 'left-start';
    }
    if (left + tooltipRect.width > viewport.width - 10) {
      left = viewport.width - tooltipRect.width - 10;
      finalPosition = position.includes('left') ? 'left-end' : 'right-end';
    }
    if (top < 10) {
      top = triggerRect.bottom + 8;
      finalPosition = 'bottom';
    }
    if (top + tooltipRect.height > viewport.height - 10) {
      top = triggerRect.top - tooltipRect.height - 8;
      finalPosition = 'top';
    }

    setCalculatedPosition(finalPosition);
    
    tooltipRef.current.style.left = `${left + window.scrollX}px`;
    tooltipRef.current.style.top = `${top + window.scrollY}px`;
  }, [position]);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }
    
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, updatePosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const getArrowClass = () => {
    const baseClass = 'absolute w-2 h-2 border-4 transform rotate-45';
    
    switch (calculatedPosition) {
      case 'top':
      case 'top-start':
      case 'top-end':
        return `${baseClass} border-b-neutral-900 border-l-transparent border-r-transparent border-t-transparent bottom-0 left-1/2 -translate-x-1/2 translate-y-1`;
      case 'bottom':
      case 'bottom-start':
      case 'bottom-end':
        return `${baseClass} border-t-neutral-900 border-l-transparent border-r-transparent border-b-transparent top-0 left-1/2 -translate-x-1/2 -translate-y-1`;
      case 'left':
      case 'left-start':
      case 'left-end':
        return `${baseClass} border-r-neutral-900 border-t-transparent border-b-transparent border-l-transparent right-0 top-1/2 -translate-y-1/2 translate-x-1`;
      case 'right':
      case 'right-start':
      case 'right-end':
        return `${baseClass} border-l-neutral-900 border-t-transparent border-b-transparent border-r-transparent left-0 top-1/2 -translate-y-1/2 -translate-x-1`;
      default:
        return baseClass;
    }
  };

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className={`
        absolute z-50 px-3 py-2 text-sm rounded-lg border
        ${positionClasses[variant]}
        ${arrow ? '' : 'shadow-lg'}
        transition-all duration-200 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
        ${className}
      `}
      style={{
        maxWidth: `${maxWidth}px`,
        wordWrap: 'break-word'
      }}
      onMouseEnter={interactive ? showTooltip : undefined}
      onMouseLeave={interactive ? hideTooltip : undefined}
    >
      {content}
      {arrow && <div className={getArrowClass()} />}
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && createPortal(tooltipContent, document.body)}
    </>
  );
};

// Help tooltip with more content and actions
interface HelpTooltipProps {
  title?: string;
  content: ReactNode;
  actions?: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'secondary' }>;
  children: ReactNode;
  position?: TooltipPosition;
  maxWidth?: number;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  content,
  actions,
  children,
  position = 'top',
  maxWidth = 300
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const tooltipContent = (
    <div className="p-4 space-y-3">
      {title && (
        <h4 className="font-semibold text-sm">{title}</h4>
      )}
      <div className="text-sm leading-relaxed">
        {content}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className={`
                px-3 py-1 text-xs rounded-md font-medium transition-colors
                ${action.variant === 'primary' 
                  ? 'bg-primary-600 text-white hover:bg-primary-700' 
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                }
              `}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip
      content={tooltipContent}
      position={position}
      variant="light"
      maxWidth={maxWidth}
      interactive={true}
    >
      <div className="inline-flex items-center">
        {children}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ml-1 p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Help"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </Tooltip>
  );
};

// Contextual help for forms
interface FieldHelpProps {
  fieldId: string;
  title?: string;
  content: ReactNode;
  placement?: 'right' | 'below';
}

export const FieldHelp: React.FC<FieldHelpProps> = ({
  fieldId,
  title,
  content,
  placement = 'right'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="field-help-container">
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        aria-label={`Help for ${title || fieldId}`}
        aria-expanded={isVisible}
        aria-controls={`help-${fieldId}`}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isVisible && (
        <div
          id={`help-${fieldId}`}
          className={`
            absolute z-40 p-3 text-sm rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg
            ${placement === 'right' ? 'left-full ml-2 top-0' : 'top-full mt-2 left-0'}
          `}
          role="tooltip"
          aria-live="polite"
        >
          {title && (
            <h5 className="font-semibold mb-2">{title}</h5>
          )}
          <div className="text-neutral-600 dark:text-neutral-400">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

// Tour/Onboarding tooltip
interface TourStep {
  target: string;
  title: string;
  content: ReactNode;
  position?: TooltipPosition;
  action?: { label: string; onClick: () => void };
}

interface TourTooltipProps {
  step: TourStep;
  currentIndex: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  onClose?: () => void;
}

export const TourTooltip: React.FC<TourTooltipProps> = ({
  step,
  currentIndex,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timeout = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  const actions = [
    ...(currentIndex > 0 ? [{ label: 'Previous', onClick: onPrevious }] : []),
    { 
      label: currentIndex === totalSteps - 1 ? 'Finish' : 'Next', 
      onClick: currentIndex === totalSteps - 1 ? onClose : onNext 
    },
    { label: 'Skip', onClick: onSkip }
  ];

  return (
    <Tooltip
      content={
        <div className="p-4 space-y-4 min-w-72">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{step.title}</h3>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {currentIndex + 1}/{totalSteps}
            </span>
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {step.content}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`
                    px-3 py-1.5 text-xs rounded-md font-medium transition-colors
                    ${action.label === 'Finish' || action.label === 'Next'
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Close tour"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      }
      position={step.position}
      variant="light"
      arrow={true}
      interactive={true}
      maxWidth={320}
    >
      <div />
    </Tooltip>
  );
};

export default Tooltip;