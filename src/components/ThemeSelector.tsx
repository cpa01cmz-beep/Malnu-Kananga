import React, { useState, useEffect } from 'react';
import { Theme, getLightThemes, getDarkThemes } from '../config/themes';
import { ThemeManager } from '../services/themeManager';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import IconButton from './ui/IconButton';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  customTrigger?: React.ReactNode;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isOpen, onClose }) => {
  const [themeManager, setThemeManager] = useState<ThemeManager | null>(null);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [lightThemes, setLightThemes] = useState<Theme[]>([]);
  const [darkThemes, setDarkThemes] = useState<Theme[]>([]);
  const [activeTab, setActiveTab] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const manager = ThemeManager.getInstance();
    setThemeManager(manager);
    setCurrentTheme(manager.getCurrentTheme());
    setLightThemes(getLightThemes());
    setDarkThemes(getDarkThemes());

    const handleThemeChange = (theme: Theme) => {
      setCurrentTheme(theme);
    };

    manager.addListener(handleThemeChange);
    return () => {
      manager.removeListener(handleThemeChange);
    };
  }, []);

  const applyTheme = (theme: Theme) => {
    if (themeManager) {
      themeManager.setTheme(theme);
      onClose();
    }
  };

  if (!isOpen || !themeManager || !currentTheme) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50% backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-20 right-4 w-96 max-w-[90vw] bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 z-50 animate-fade-in-up">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Pilih Tema
              </h3>
            </div>
            <IconButton
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
              ariaLabel="Tutup"
              onClick={onClose}
            />
          </div>
          
          {/* Current Theme Display */}
          <div className="mt-3 flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <span className="text-2xl">{currentTheme.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {currentTheme.displayName}
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {currentTheme.description}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => setActiveTab('light')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'light'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <SunIcon className="w-4 h-4" />
            Terang
          </button>
          <button
            onClick={() => setActiveTab('dark')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'dark'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <MoonIcon className="w-4 h-4" />
            Gelap
          </button>
        </div>

        {/* Theme Grid */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 gap-3">
            {(activeTab === 'light' ? lightThemes : darkThemes).map((theme) => (
              <button
                key={theme.id}
                onClick={() => applyTheme(theme)}
                className={`group flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                  currentTheme.id === theme.id
                    ? 'border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {theme.icon}
                  </span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {theme.displayName}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {theme.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Color Preview */}
                  <div className="flex gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white dark:border-neutral-800 shadow-sm"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white dark:border-neutral-800 shadow-sm"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  </div>
                  {/* Active Indicator */}
                  {currentTheme.id === theme.id && (
                    <div className="w-5 h-5 rounded-full bg-primary-600 dark:bg-primary-400 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex gap-2">
          <button
            onClick={() => themeManager.resetToDefault()}
            className="flex-1 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Reset ke Default
          </button>
          <button
            onClick={() => {
              themeManager.toggleDarkMode();
              onClose();
            }}
            className="flex-1 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
          >
            Ganti Tema
          </button>
        </div>
      </div>
    </>
  );
};

export const ThemeSelectorTrigger: React.FC<{ onClick: () => void; currentTheme: Theme | null }> = ({ 
  onClick, 
  currentTheme 
}) => {
  return (
    <IconButton
      icon={currentTheme ? (
        <span className="text-xl">{currentTheme.icon}</span>
      ) : (
        <SparklesIcon />
      )}
      ariaLabel="Pilih Tema"
      tooltip={currentTheme ? `${currentTheme.displayName} - ${currentTheme.description}` : undefined}
      size="lg"
      onClick={onClick}
    />
  );
};

export default ThemeSelector;