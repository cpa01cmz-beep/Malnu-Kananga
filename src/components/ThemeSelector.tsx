import React, { useState } from 'react';
import { Theme, getLightThemes, getDarkThemes } from '../config/themes';
import { useTheme } from '../hooks/useTheme';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import IconButton from './ui/IconButton';
import Modal from './ui/Modal';
import Button from './ui/Button';
import LanguageSwitcher from './ui/LanguageSwitcher';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  customTrigger?: React.ReactNode;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'light' | 'dark' | 'language'>('light');
  const { currentTheme, setTheme, toggleDarkMode, resetToDefault, isReady } = useTheme();

  const lightThemes = getLightThemes();
  const darkThemes = getDarkThemes();

  const applyTheme = (theme: Theme) => {
    setTheme(theme);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const tabs: ('light' | 'dark' | 'language')[] = ['light', 'dark', 'language'];
      const currentIndex = tabs.indexOf(activeTab);
      const newIndex = e.key === 'ArrowRight' 
        ? (currentIndex + 1) % tabs.length 
        : (currentIndex - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[newIndex]);
    }
  };

  if (!isOpen || !isReady || !currentTheme) {
    return null;
  }

  // Dynamic title based on active tab
  const getModalTitle = () => {
    switch (activeTab) {
      case 'language':
        return 'Pengaturan Bahasa';
      default:
        return 'Pilih Tema';
    }
  };

  const getModalDescription = () => {
    switch (activeTab) {
      case 'language':
        return 'Pilih bahasa untuk antarmuka aplikasi';
      default:
        return 'Pilih tema untuk antarmuka aplikasi';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      description={getModalDescription()}
      size="lg"
      animation="fade-in-up"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      showCloseButton={true}
      className="fixed top-20 right-4 m-0 p-0"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-xl">
        {/* Current Theme Display */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <SparklesIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
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
        <div
          className="flex border-b border-neutral-200 dark:border-neutral-700"
          role="tablist"
          aria-label="Pilih kategori tema"
          onKeyDown={handleKeyDown}
        >
          <button
            role="tab"
            aria-selected={activeTab === 'light'}
            aria-controls="theme-light-panel"
            id="tab-light"
            onClick={() => setActiveTab('light')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'light'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <SunIcon className="w-4 h-4" aria-hidden="true" />
            Terang
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'dark'}
            aria-controls="theme-dark-panel"
            id="tab-dark"
            onClick={() => setActiveTab('dark')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'dark'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <MoonIcon className="w-4 h-4" aria-hidden="true" />
            Gelap
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'language'}
            aria-controls="language-panel"
            id="tab-language"
            onClick={() => setActiveTab('language')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'language'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Bahasa
          </button>
        </div>

        {/* Conditional Content */}
        {activeTab === 'language' ? (
          /* Language Panel */
          <div
            id="language-panel"
            role="tabpanel"
            aria-labelledby="tab-language"
            className="p-6"
          >
            <LanguageSwitcher 
              showLabel={true} 
              className="justify-center"
            />
            <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 text-center">
              Perubahan bahasa akan diterapkan secara langsung ke seluruh antarmuka aplikasi.
            </p>
          </div>
        ) : (
          /* Theme Grid */
          <div
            id={activeTab === 'light' ? 'theme-light-panel' : 'theme-dark-panel'}
            role="tabpanel"
            aria-labelledby={activeTab === 'light' ? 'tab-light' : 'tab-dark'}
            className="p-4 max-h-96 overflow-y-auto"
          >
            <div className="grid grid-cols-1 gap-3">
              {(activeTab === 'light' ? lightThemes : darkThemes).map((theme) => (
              <button
                key={theme.id}
                onClick={() => applyTheme(theme)}
                aria-label={`Pilih tema ${theme.displayName}`}
                aria-pressed={currentTheme.id === theme.id}
                className={`group flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800 ${
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
                  <div className="flex gap-1" aria-hidden="true">
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
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex gap-2">
          <Button
            onClick={resetToDefault}
            ariaLabel="Reset tema ke pengaturan default"
            variant="ghost"
            size="sm"
            className="flex-1"
          >
            Reset ke Default
          </Button>
          <Button
            onClick={() => {
              toggleDarkMode();
              onClose();
            }}
            ariaLabel="Ganti antara mode terang dan gelap"
            variant="ghost"
            size="sm"
            className="flex-1"
          >
            Ganti Tema
          </Button>
        </div>
      </div>
    </Modal>
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
        <SparklesIcon aria-hidden="true" />
      )}
      ariaLabel="Pilih Tema"
      tooltip={currentTheme ? `${currentTheme.displayName} - ${currentTheme.description}` : undefined}
      size="lg"
      onClick={onClick}
    />
  );
};

export default ThemeSelector;