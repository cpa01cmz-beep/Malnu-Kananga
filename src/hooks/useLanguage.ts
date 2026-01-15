import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants';

const LANGUAGES = [
  { code: 'id', name: 'id', flag: '🇮🇩' },
  { code: 'en', name: 'en', flag: '🇺🇸' },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];

export function useLanguage() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(
    () => {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return (saved as LanguageCode) || 'id';
    }
  );

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng as LanguageCode);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = async (languageCode: LanguageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const getLanguageInfo = (code: LanguageCode) => {
    return LANGUAGES.find((lang) => lang.code === code);
  };

  return {
    currentLanguage,
    languages: LANGUAGES,
    changeLanguage,
    getLanguageInfo,
    isLanguageSupported: (code: string): code is LanguageCode => {
      return LANGUAGES.some((lang) => lang.code === code);
    },
  };
}
