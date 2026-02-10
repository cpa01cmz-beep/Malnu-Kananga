/**
 * Accessibility Settings Component
 * Enhanced accessibility features and dyslexia-friendly options
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type FontFamily = 'default' | 'dyslexia' | 'atkinson' | 'open-dyslexic' | 'helvetica';
export type LineSpacing = 'normal' | 'relaxed' | 'loose';
export type LetterSpacing = 'normal' | 'wide' | 'wider';
export type TextSize = 'small' | 'medium' | 'large' | 'extra-large';
export type ContrastMode = 'normal' | 'high' | 'extra-high';

interface AccessibilitySettings {
  fontFamily: FontFamily;
  fontSize: TextSize;
  lineSpacing: LineSpacing;
  letterSpacing: LetterSpacing;
  contrastMode: ContrastMode;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  highContrastColors: boolean;
  readableWidth: boolean;
  dyslexiaMode: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
  applyDyslexiaFont: () => void;
  applyHighContrast: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontFamily: 'default',
  fontSize: 'medium',
  lineSpacing: 'normal',
  letterSpacing: 'normal',
  contrastMode: 'normal',
  reducedMotion: false,
  screenReaderOptimized: false,
  keyboardNavigation: true,
  focusIndicators: true,
  colorBlindMode: 'none',
  highContrastColors: false,
  readableWidth: false,
  dyslexiaMode: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load settings from localStorage
    try {
      const saved = localStorage.getItem('malnu_accessibility_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const systemPrefersReducedMotion = useReducedMotion();

  // Auto-detect system preferences
  useEffect(() => {
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
    ];

    // Update settings based on system preferences
    const updateFromSystemPreferences = () => {
      setSettings(prev => ({
        ...prev,
        reducedMotion: mediaQueries[0].matches || prev.reducedMotion,
        contrastMode: mediaQueries[1].matches ? 'high' : prev.contrastMode,
      }));
    };

    updateFromSystemPreferences();
    mediaQueries.forEach(mq => mq.addEventListener('change', updateFromSystemPreferences));

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', updateFromSystemPreferences));
    };
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('malnu_accessibility_settings', JSON.stringify(settings));
  }, [settings]);

  // Apply CSS custom properties based on settings
  useEffect(() => {
    const root = document.documentElement;
    
    // Font family classes
    const fontClasses = {
      default: '',
      dyslexia: 'font-dyslexia',
      atkinson: 'font-atkinson',
      'open-dyslexic': 'font-open-dyslexic',
      helvetica: 'font-helvetica',
    };
    
    // Text size classes
    const textSizeClasses = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      'extra-large': 'text-xl',
    };
    
    // Line spacing classes
    const lineSpacingClasses = {
      normal: 'leading-normal',
      relaxed: 'leading-relaxed',
      loose: 'leading-loose',
    };
    
    // Letter spacing classes
    const letterSpacingClasses = {
      normal: 'tracking-normal',
      wide: 'tracking-wide',
      wider: 'tracking-wider',
    };
    
    // Apply classes
    root.className = root.className
      .replace(/font-\w+/g, '')
      .replace(/text-(sm|base|lg|xl)/g, '')
      .replace(/leading-\w+/g, '')
      .replace(/tracking-\w+/g, '')
      .trim();

    root.classList.add(
      fontClasses[settings.fontFamily],
      textSizeClasses[settings.fontSize],
      lineSpacingClasses[settings.lineSpacing],
      letterSpacingClasses[settings.letterSpacing]
    );

    // Apply contrast mode
    if (settings.contrastMode !== 'normal') {
      root.classList.add(`contrast-${settings.contrastMode}`);
    }

    // Apply reduced motion
    if (settings.reducedMotion || systemPrefersReducedMotion) {
      root.classList.add('reduced-motion');
    }

    // Apply readable width
    if (settings.readableWidth) {
      root.classList.add('readable-width');
    }

    // Apply color blind mode
    if (settings.colorBlindMode !== 'none') {
      root.classList.add(`color-blind-${settings.colorBlindMode}`);
    }

    // Apply high contrast colors
    if (settings.highContrastColors) {
      root.classList.add('high-contrast-colors');
    }

    // Apply dyslexia mode
    if (settings.dyslexiaMode) {
      root.classList.add('dyslexia-mode');
    }

    // Set CSS custom properties for fine-tuned control
    root.style.setProperty('--accessibility-font-size', settings.fontSize);
    root.style.setProperty('--accessibility-line-spacing', settings.lineSpacing);
    root.style.setProperty('--accessibility-letter-spacing', settings.letterSpacing);
    root.style.setProperty('--accessibility-contrast-mode', settings.contrastMode);

  }, [settings, systemPrefersReducedMotion]);

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('malnu_accessibility_settings');
  };

  const applyDyslexiaFont = () => {
    updateSetting('fontFamily', 'dyslexia');
    updateSetting('lineSpacing', 'relaxed');
    updateSetting('letterSpacing', 'wide');
    updateSetting('dyslexiaMode', true);
  };

  const applyHighContrast = () => {
    updateSetting('contrastMode', 'high');
    updateSetting('highContrastColors', true);
    updateSetting('fontSize', 'large');
  };

  const value: AccessibilityContextType = {
    settings,
    updateSetting,
    resetSettings,
    applyDyslexiaFont,
    applyHighContrast,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Accessibility Control Panel Component
interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  isOpen,
  onClose,
  className = '',
}) => {
  const { settings, updateSetting, resetSettings, applyDyslexiaFont, applyHighContrast } = useAccessibility();

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${className}`}>
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Accessibility Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
              aria-label="Close accessibility settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Quick Presets */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Quick Presets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={applyDyslexiaFont}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 text-left"
              >
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Dyslexia-Friendly</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Optimized fonts and spacing for dyslexic users
                </p>
              </button>
              
              <button
                onClick={applyHighContrast}
                className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200 text-left"
              >
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">High Contrast</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Enhanced contrast and larger text
                </p>
              </button>
            </div>
          </div>

          {/* Typography Settings */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Typography</h3>
            <div className="space-y-4">
              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Font Family
                </label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => updateSetting('fontFamily', e.target.value as FontFamily)}
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="default">Default</option>
                  <option value="dyslexia">Dyslexia Font</option>
                  <option value="atkinson">Atkinson Hyperlegible</option>
                  <option value="open-dyslexic">OpenDyslexic</option>
                  <option value="helvetica">Helvetica</option>
                </select>
              </div>

              {/* Text Size */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Text Size
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['small', 'medium', 'large', 'extra-large'] as TextSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSetting('fontSize', size)}
                      className={`p-3 rounded-lg border transition-colors duration-200 ${
                        settings.fontSize === size
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Spacing */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Line Spacing
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'relaxed', 'loose'] as LineSpacing[]).map((spacing) => (
                    <button
                      key={spacing}
                      onClick={() => updateSetting('lineSpacing', spacing)}
                      className={`p-3 rounded-lg border transition-colors duration-200 ${
                        settings.lineSpacing === spacing
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Letter Spacing */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Letter Spacing
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'wide', 'wider'] as LetterSpacing[]).map((spacing) => (
                    <button
                      key={spacing}
                      onClick={() => updateSetting('letterSpacing', spacing)}
                      className={`p-3 rounded-lg border transition-colors duration-200 ${
                        settings.letterSpacing === spacing
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Settings */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Visual</h3>
            <div className="space-y-4">
              {/* Contrast Mode */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Contrast Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'high', 'extra-high'] as ContrastMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateSetting('contrastMode', mode)}
                      className={`p-3 rounded-lg border transition-colors duration-200 ${
                        settings.contrastMode === mode
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Blind Support */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Color Blind Support
                </label>
                <select
                  value={settings.colorBlindMode}
                  onChange={(e) => updateSetting('colorBlindMode', e.target.value as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia')}
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="none">None</option>
                  <option value="protanopia">Protanopia (Red-Blind)</option>
                  <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                  <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                </select>
              </div>

              {/* Readable Width */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Readable Width
                  </label>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Limit text width for better readability
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('readableWidth', !settings.readableWidth)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    settings.readableWidth ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      settings.readableWidth ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Motion Settings */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Motion</h3>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Reduced Motion
                </label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Minimize animations and transitions
                </p>
              </div>
              <button
                onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  settings.reducedMotion ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={resetSettings}
              className="w-full p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200 font-medium"
            >
              Reset All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityProvider;