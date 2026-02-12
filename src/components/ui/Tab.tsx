import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type TabColor = 'green' | 'blue' | 'purple' | 'red' | 'yellow' | 'neutral';

export type TabVariant = 'pill' | 'border' | 'icon';

const triggerHapticFeedback = (type: 'light' | 'medium' = 'light') => {
  if ('vibrate' in navigator && window.innerWidth <= 768) {
    const pattern = {
      light: [10],
      medium: [25]
    };
    navigator.vibrate(pattern[type]);
  }
};

export interface TabOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
  disabled?: boolean;
}

export interface TabProps {
  options: TabOption[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: TabVariant;
  color?: TabColor;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  'aria-label'?: string;
  enableSwipeGestures?: boolean;
}

const Tab: React.FC<TabProps> = ({
  options,
  activeTab,
  onTabChange,
  variant = 'pill',
  color = 'green',
  orientation = 'horizontal',
  'aria-label': ariaLabel = 'Tabs',
  enableSwipeGestures = true,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    top: 0,
    height: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const prefersReducedMotion = useReducedMotion();
  
  const containerClasses = orientation === 'horizontal'
    ? `flex gap-2 overflow-x-auto pb-2 ${enableSwipeGestures ? 'snap-x snap-mandatory scroll-smooth' : ''} relative ${className}`
    : `flex flex-col gap-1 relative ${className}`;

  const updateIndicator = useCallback(() => {
    const activeTabButton = tabRefs.current.get(activeTab);
    const container = containerRef.current;

    if (activeTabButton && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabButton.getBoundingClientRect();

      setIndicatorStyle({
        left: tabRect.left - containerRect.left + container.scrollLeft,
        width: tabRect.width,
        top: tabRect.top - containerRect.top + container.scrollTop,
        height: tabRect.height,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    const activeTabButton = tabRefs.current.get(activeTab);
    if (activeTabButton && document.activeElement !== activeTabButton) {
      activeTabButton.focus();
    }
    updateIndicator();
  }, [activeTab, updateIndicator]);

  useEffect(() => {
    const handleResize = () => {
      updateIndicator();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateIndicator]);

  const getColorClasses = (tabId: string) => {
    const isActive = activeTab === tabId;
    const colorMap = {
      green: {
        pill: isActive ? 'text-white z-10' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 z-10',
        border: isActive ? 'text-green-600 z-10' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:border-neutral-300 z-10',
        icon: isActive ? 'bg-white dark:bg-neutral-700 text-green-600 dark:text-green-400 shadow-sm z-10' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white z-10',
      },
      blue: {
        pill: isActive ? 'text-white z-10' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 z-10',
        border: isActive ? 'text-blue-600 z-10' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:border-neutral-300 z-10',
        icon: isActive ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm z-10' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white z-10',
      },
      purple: {
        pill: isActive ? 'text-white z-10' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 z-10',
        border: isActive ? 'text-purple-600 z-10' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:border-neutral-300 z-10',
        icon: isActive ? 'bg-white dark:bg-neutral-700 text-purple-600 dark:text-purple-400 shadow-sm z-10' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white z-10',
      },
      red: {
        pill: isActive ? 'text-white z-10' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 z-10',
        border: isActive ? 'text-red-600 z-10' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:border-neutral-300 z-10',
        icon: isActive ? 'bg-white dark:bg-neutral-700 text-red-600 dark:text-red-400 shadow-sm z-10' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white z-10',
      },
      yellow: {
        pill: isActive ? 'text-white z-10' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 z-10',
        border: isActive ? 'text-yellow-600 z-10' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:border-neutral-300 z-10',
        icon: isActive ? 'bg-white dark:bg-neutral-700 text-yellow-600 dark:text-yellow-400 shadow-sm z-10' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white z-10',
      },
      neutral: {
        pill: isActive ? 'text-white dark:text-white z-10' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 z-10',
        border: isActive ? 'text-neutral-900 dark:text-neutral-100 z-10' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:border-neutral-300 z-10',
        icon: isActive ? 'bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-sm z-10' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white z-10',
      },
    };

    return colorMap[color][variant];
  };

  const getButtonClasses = (tabId: string) => {
    const baseClasses = `px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 relative min-h-[44px] mobile-touch-target touch-manipulation ${
      enableSwipeGestures ? 'snap-start' : ''
    }`;
    const activeColorClasses = getColorClasses(tabId);

    if (variant === 'border') {
      return `${activeColorClasses} py-4 px-1 border-b-2 text-sm font-medium min-h-[44px] mobile-touch-target touch-manipulation focus-visible-enhanced`;
    }

    return `${baseClasses} ${activeColorClasses} focus-visible-enhanced hover:scale-105 active:scale-95`;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipeGestures) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableSwipeGestures || !isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!enableSwipeGestures || !isDragging) return;
    setIsDragging(false);
    
    const diff = startX - currentX;
    const threshold = 50; // Minimum swipe distance
    
    if (Math.abs(diff) > threshold) {
      const enabledOptions = options.filter((opt) => !opt.disabled);
      const currentIndex = enabledOptions.findIndex((opt) => opt.id === activeTab);

      if (diff > 0 && currentIndex < enabledOptions.length - 1) {
        handleTabChange(enabledOptions[currentIndex + 1].id);
      } else if (diff < 0 && currentIndex > 0) {
        handleTabChange(enabledOptions[currentIndex - 1].id);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    const enabledOptions = options.filter((opt) => !opt.disabled);
    const currentEnabledIndex = enabledOptions.findIndex((opt) => opt.id === tabId);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentEnabledIndex + 1) % enabledOptions.length;
      handleTabChange(enabledOptions[nextIndex].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentEnabledIndex === 0 ? enabledOptions.length - 1 : currentEnabledIndex - 1;
      handleTabChange(enabledOptions[prevIndex].id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      handleTabChange(enabledOptions[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      handleTabChange(enabledOptions[enabledOptions.length - 1].id);
    }
  };

  const handleTabChange = (tabId: string) => {
    triggerHapticFeedback('light');
    onTabChange(tabId);
  };

  const getIndicatorClasses = () => {
    const baseClasses = 'absolute pointer-events-none z-0 transition-all';
    const motionClasses = prefersReducedMotion ? '' : 'duration-300 ease-out';

    if (variant === 'pill') {
      return `${baseClasses} ${motionClasses} rounded-lg`;
    }

    if (variant === 'border') {
      return `${baseClasses} ${motionClasses} border-b-2`;
    }

    return `${baseClasses} ${motionClasses}`;
  };

  const getIndicatorColorClasses = () => {
    const colorMap = {
      green: variant === 'pill' ? 'bg-green-600' : 'border-green-500',
      blue: variant === 'pill' ? 'bg-blue-600' : 'border-blue-500',
      purple: variant === 'pill' ? 'bg-purple-600' : 'border-purple-500',
      red: variant === 'pill' ? 'bg-red-600' : 'border-red-500',
      yellow: variant === 'pill' ? 'bg-yellow-500' : 'border-yellow-500',
      neutral: variant === 'pill' ? 'bg-neutral-800 dark:bg-neutral-600' : 'border-neutral-500',
    };
    return colorMap[color];
  };

  return (
    <nav
      ref={containerRef}
      className={containerClasses}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      style={orientation === 'horizontal' ? { scrollBehavior: 'smooth' } : undefined}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {variant !== 'icon' && (
        <div
          className={`${getIndicatorClasses()} ${getIndicatorColorClasses()}`}
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            top: variant === 'border' ? 'auto' : `${indicatorStyle.top}px`,
            height: variant === 'border' ? '2px' : `${indicatorStyle.height}px`,
            bottom: variant === 'border' ? '8px' : 'auto',
            opacity: indicatorStyle.width > 0 ? 1 : 0,
          }}
          aria-hidden="true"
        />
      )}
      {options.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => {
            if (el) tabRefs.current.set(tab.id, el);
          }}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          disabled={tab.disabled}
          className={getButtonClasses(tab.id)}
          onClick={() => !tab.disabled && handleTabChange(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, tab.id)}
          tabIndex={tab.disabled || activeTab !== tab.id ? -1 : 0}
        >
          {tab.icon && <tab.icon className="w-4 h-4" />}
          <span className="truncate">{tab.label}</span>
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
              {tab.badge > 99 ? '99+' : tab.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default Tab;
