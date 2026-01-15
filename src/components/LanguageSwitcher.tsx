import { useLanguage, LanguageCode } from '../hooks/useLanguage';

interface LanguageSwitcherProps {
  className?: string;
  showLabel?: boolean;
  showFlag?: boolean;
}

export function LanguageSwitcher({
  className = '',
  showLabel = true,
  showFlag = true,
}: LanguageSwitcherProps) {
  const { currentLanguage, languages, changeLanguage, getLanguageInfo } =
    useLanguage();

  const handleLanguageChange = async (languageCode: LanguageCode) => {
    await changeLanguage(languageCode);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`} role="group" aria-label="Language switcher">
      {showLabel && (
        <label
          htmlFor="language-select"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          language.selectLanguage
        </label>
      )}
      <select
        id="language-select"
        value={currentLanguage}
        onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        aria-label="Select language"
      >
        {languages.map((lang) => {
          const info = getLanguageInfo(lang.code);
          return (
            <option key={lang.code} value={lang.code}>
              {showFlag && info?.flag} {info?.name}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default LanguageSwitcher;
