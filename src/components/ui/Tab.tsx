import React, { useEffect, useRef, useState } from 'react';

export type TabColor = 'green' | 'blue' | 'purple' | 'red' | 'yellow' | 'neutral';

export type TabVariant = 'pill' | 'border' | 'icon';

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
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  
  const containerClasses = orientation === 'horizontal'
    ? `flex gap-2 overflow-x-auto pb-2 ${enableSwipeGestures ? 'snap-x snap-mandatory scroll-smooth' : ''}`
    : 'flex flex-col gap-1';

  useEffect(() => {
    const activeTabButton = tabRefs.current.get(activeTab);
    if (activeTabButton && document.activeElement !== activeTabButton) {
      activeTabButton.focus();
    }
  }, [activeTab]);

  const getColorClasses = (tabId: string) => {
    const isActive = activeTab === tabId;
    const colorMap = {
      green: {
        pill: isActive ? 'bg-green-600 text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600',
        border: isActive ? 'border-green-500 text-green-600' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:border-neutral-300',
        icon: isActive ? 'bg-white dark:bg-neutral-700 text-green-600 dark:text-green-400 shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
      },
      blue: {
        pill: isActive ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600',
        border: isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:border-neutral-300',
        icon: isActive ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
      },
      purple: {
        pill: isActive ? 'bg-purple-600 text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600',
        border: isActive ? 'border-purple-500 text-purple-600' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:border-neutral-300',
        icon: isActive ? 'bg-white dark:bg-neutral-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
      },
      red: {
        pill: isActive ? 'bg-red-600 text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600',
        border: isActive ? 'border-red-500 text-red-600' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:border-neutral-300',
        icon: isActive ? 'bg-white dark:bg-neutral-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
      },
      yellow: {
        pill: isActive ? 'bg-yellow-500 text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600',
        border: isActive ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:border-neutral-300',
        icon: isActive ? 'bg-white dark:bg-neutral-700 text-yellow-600 dark:text-yellow-400 shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
      },
      neutral: {
        pill: isActive ? 'bg-neutral-800 text-white dark:bg-neutral-600 dark:text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600',
        border: isActive ? 'border-neutral-500 text-neutral-900 dark:text-neutral-100' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:border-neutral-300',
        icon: isActive ? 'bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
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
        // Swipe left - go to next tab
        onTabChange(enabledOptions[currentIndex + 1].id);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - go to previous tab
        onTabChange(enabledOptions[currentIndex - 1].id);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    const enabledOptions = options.filter((opt) => !opt.disabled);
    const currentEnabledIndex = enabledOptions.findIndex((opt) => opt.id === tabId);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentEnabledIndex + 1) % enabledOptions.length;
      onTabChange(enabledOptions[nextIndex].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentEnabledIndex === 0 ? enabledOptions.length - 1 : currentEnabledIndex - 1;
      onTabChange(enabledOptions[prevIndex].id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onTabChange(enabledOptions[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      onTabChange(enabledOptions[enabledOptions.length - 1].id);
    }
  };

  return (
    <nav
      ref={containerRef}
      className={containerClasses}
      role="tablist"
      aria-label={ariaLabel}
      style={orientation === 'horizontal' ? { scrollBehavior: 'smooth' } : undefined}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, tab.id)}
          tabIndex={tab.disabled ? -1 : 0}
        >
          {tab.icon && <tab.icon className="w-4 h-4" />}
          <span className="truncate">{tab.label}</span>
          {tab.badge && (
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
