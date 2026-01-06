/**
 * AI Cache Manager Component
 * Provides UI for monitoring and managing AI response caches
 */

import React, { useState } from 'react';
import { useAICache } from '../hooks/useAICache';
import { TrashIcon } from './icons/TrashIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface AICacheManagerProps {
  className?: string;
}

const AICacheManager: React.FC<AICacheManagerProps> = ({ className = '' }) => {
  const { stats, isLoading, clearAll, clearChat, clearAnalysis, clearEditor, refresh } = useAICache();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const formatMemory = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatHitRate = (rate: number): string => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  const formatDate = (date?: Date): string => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    });
  };

  const cacheSections = [
    {
      id: 'chat',
      title: 'Chat Cache',
      stats: stats.chat,
      icon: ChartBarIcon,
      color: 'blue',
      clear: clearChat,
      description: 'Sembunyikan percakapan AI selama 20 menit'
    },
    {
      id: 'analysis',
      title: 'Analysis Cache', 
      stats: stats.analysis,
      icon: ChartBarIcon,
      color: 'green',
      clear: clearAnalysis,
      description: 'Sembunyikan hasil analisis selama 1 jam'
    },
    {
      id: 'editor',
      title: 'Editor Cache',
      stats: stats.editor,
      icon: ChartBarIcon,
      color: 'purple',
      clear: clearEditor,
      description: 'Sembunyikan respons editor selama 15 menit'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-500'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20', 
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-500'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-700 dark:text-purple-400', 
        border: 'border-purple-200 dark:border-purple-800',
        icon: 'text-purple-500'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                AI Cache Management
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Monitor and manage AI response caches
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              title="Refresh statistics"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-700">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stats.total.entries}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Entries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatHitRate(stats.total.hitRate)}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Overall Hit Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatMemory(stats.total.memoryUsage)}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Memory Usage</div>
          </div>
        </div>
      </div>

      {/* Cache Sections */}
      <div className="p-6 space-y-4">
        {cacheSections.map((section) => {
          const colors = getColorClasses(section.color);
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;

          return (
            <div
              key={section.id}
              className={`border rounded-lg ${colors.bg} ${colors.border} transition-all`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                    <div>
                      <h4 className={`font-medium ${colors.text}`}>
                        {section.title}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className={`text-sm font-medium ${colors.text}`}>
                        {section.stats.totalEntries} entries
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        Hit rate: {formatHitRate(section.stats.hitRate)}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                      className={`p-1.5 rounded-lg ${colors.bg} ${colors.text} hover:opacity-80 transition-opacity`}
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                          Hits
                        </div>
                        <div className={`text-lg font-medium ${colors.text}`}>
                          {section.stats.totalHits}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                          Misses
                        </div>
                        <div className={`text-lg font-medium ${colors.text}`}>
                          {section.stats.totalMisses}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                          Memory
                        </div>
                        <div className={`text-lg font-medium ${colors.text}`}>
                          {formatMemory(section.stats.memoryUsage)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                          Oldest Entry
                        </div>
                        <div className={`text-sm font-medium ${colors.text}`}>
                          {formatDate(section.stats.oldestEntry)}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={section.clear}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-3 h-3" />
                        Clear {section.title}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AICacheManager;