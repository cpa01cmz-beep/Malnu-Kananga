/**
 * useLanguage Hook
 * Provides language switching functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, changeLanguage, getStoredLanguage, SupportedLanguage } from '../i18n';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(getStoredLanguage());

  useEffect(() => {
    const storedLang = getStoredLanguage();
    if (i18n.language !== storedLang) {
      i18n.changeLanguage(storedLang);
    }
    setCurrentLanguage(storedLang);
  }, [i18n]);

  const switchLanguage = useCallback((language: SupportedLanguage) => {
    changeLanguage(language);
    setCurrentLanguage(language);
  }, []);

  return {
    currentLanguage,
    switchLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    languageNames: LANGUAGE_NAMES,
  };
};

export default useLanguage;
