import React from 'react';

interface Tab {
  id: string;
  name: string;
  icon: string;
  badge?: number;
}

interface NavigationTabsProps {
  activeTab: string;
  tabs: Tab[];
  onTabChange: (tabId: string) => void;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, tabs, onTabChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default NavigationTabs;