import { useEffect, useRef } from 'react';

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
}

const Tab: React.FC<TabProps> = ({
  options,
  activeTab,
  onTabChange,
  variant = 'pill',
  color = 'green',
  className = '',
  orientation = 'horizontal',
  'aria-label': ariaLabel = 'Tabs',
}) => {
  const containerClasses = orientation === 'horizontal'
    ? 'flex gap-2 overflow-x-auto pb-2'
    : 'flex flex-col gap-1';
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

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
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 relative';
    const activeColorClasses = getColorClasses(tabId);

    if (variant === 'border') {
      return `${activeColorClasses} py-4 px-1 border-b-2 text-sm font-medium`;
    }

    return `${baseClasses} ${activeColorClasses}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    const enabledOptions = options.filter((opt) => !opt.disabled);
    const currentEnabledIndex = enabledOptions.findIndex((opt) => opt.id === tabId);

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabChange(tabId);
    } else if (orientation === 'horizontal' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault();
      const direction = e.key === 'ArrowRight' ? 1 : -1;
      const nextEnabledIndex = (currentEnabledIndex + direction + enabledOptions.length) % enabledOptions.length;
      const nextTab = enabledOptions[nextEnabledIndex];
      onTabChange(nextTab.id);
    } else if (orientation === 'vertical' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      const direction = e.key === 'ArrowDown' ? 1 : -1;
      const nextEnabledIndex = (currentEnabledIndex + direction + enabledOptions.length) % enabledOptions.length;
      const nextTab = enabledOptions[nextEnabledIndex];
      onTabChange(nextTab.id);
    }
  };

  return (
    <div className={className}>
      {variant === 'border' && (
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <nav
            className="flex space-x-8 px-6"
            role="tablist"
            aria-label={ariaLabel}
            aria-orientation={orientation}
          >
            {options.map((option) => (
              <button
                key={option.id}
                ref={(el) => { if (el) tabRefs.current.set(option.id, el); }}
                onClick={() => !option.disabled && onTabChange(option.id)}
                onKeyDown={(e) => !option.disabled && handleKeyDown(e, option.id)}
                disabled={option.disabled}
                role="tab"
                aria-selected={activeTab === option.id}
                aria-controls={`panel-${option.id}`}
                tabIndex={activeTab === option.id ? 0 : -1}
                className={`relative ${getButtonClasses(option.id)}`}
              >
                {option.icon && <option.icon className="w-4 h-4" />}
                {option.label}
                {option.badge !== undefined && option.badge > 0 && (
                  <span
                    className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                    aria-label={`${option.badge} items`}
                  >
                    {option.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      )}

      {variant !== 'border' && (
        <div className={containerClasses} role="tablist" aria-label={ariaLabel} aria-orientation={orientation}>
          {options.map((option) => (
            <button
              key={option.id}
              ref={(el) => { if (el) tabRefs.current.set(option.id, el); }}
              onClick={() => !option.disabled && onTabChange(option.id)}
              onKeyDown={(e) => !option.disabled && handleKeyDown(e, option.id)}
              disabled={option.disabled}
              role="tab"
              aria-selected={activeTab === option.id}
              aria-controls={`panel-${option.id}`}
              tabIndex={activeTab === option.id ? 0 : -1}
              className={`relative ${getButtonClasses(option.id)}`}
            >
              {option.icon && <option.icon className="w-4 h-4" />}
              {option.label}
              {option.badge !== undefined && option.badge > 0 && (
                <span
                  className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                  aria-label={`${option.badge} items`}
                >
                  {option.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tab;
