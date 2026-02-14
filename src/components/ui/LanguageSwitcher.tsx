import { useLanguage } from '../../hooks/useLanguage';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n';
import type { ChangeEvent } from 'react';

interface LanguageSwitcherProps {
  onLanguageChange?: (language: SupportedLanguage) => void;
  className?: string;
  showLabel?: boolean;
}

export const LanguageSwitcher = ({ 
  onLanguageChange,
  className = '',
  showLabel = true 
}: LanguageSwitcherProps) => {
  const { currentLanguage, switchLanguage, languageNames } = useLanguage();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as SupportedLanguage;
    switchLanguage(newLang);
    onLanguageChange?.(newLang);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {languageNames[currentLanguage]}
        </span>
      )}
      <select
        value={currentLanguage}
        onChange={handleChange}
        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        aria-label="Select language"
      >
        {(Object.values(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map((lang) => (
          <option key={lang} value={lang}>
            {languageNames[lang]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
