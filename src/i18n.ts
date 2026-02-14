/**
 * i18n Configuration
 * Multi-language support using react-i18next
 * 
 * Supported languages:
 * - id: Indonesian (default)
 * - en: English
 * - ar: Arabic (future RTL support)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { STORAGE_KEYS } from './constants';

// Import translation resources
import idTranslations from './locales/id.json';
import enTranslations from './locales/en.json';

/**
 * Available languages
 */
export const SUPPORTED_LANGUAGES = {
  ID: 'id',
  EN: 'en',
} as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES];

/**
 * Language display names
 */
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  [SUPPORTED_LANGUAGES.ID]: 'Bahasa Indonesia',
  [SUPPORTED_LANGUAGES.EN]: 'English',
};

/**
 * Get stored language preference
 */
export const getStoredLanguage = (): SupportedLanguage => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
    if (stored && (stored === SUPPORTED_LANGUAGES.ID || stored === SUPPORTED_LANGUAGES.EN)) {
      return stored as SupportedLanguage;
    }
  } catch {
    // localStorage not available
  }
  return SUPPORTED_LANGUAGES.ID; // Default to Indonesian
};

/**
 * Store language preference
 */
export const setStoredLanguage = (language: SupportedLanguage): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE_PREFERENCE, language);
  } catch {
    // localStorage not available
  }
};

/**
 * Initialize i18next
 */
i18n
  .use(initReactI18next)
  .init({
    resources: {
      [SUPPORTED_LANGUAGES.ID]: {
        translation: idTranslations,
      },
      [SUPPORTED_LANGUAGES.EN]: {
        translation: enTranslations,
      },
    },
    lng: getStoredLanguage(),
    fallbackLng: SUPPORTED_LANGUAGES.ID,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

/**
 * Change language and persist preference
 */
export const changeLanguage = (language: SupportedLanguage): void => {
  setStoredLanguage(language);
  i18n.changeLanguage(language);
};

/**
 * Get current language
 */
export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language || getStoredLanguage()) as SupportedLanguage;
};

export default i18n;
