import { useTranslation } from 'react-i18next';
import { useState, useRef } from 'react';
import { useClickOutside } from '../hooks';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  // Since we're wrapped in ClientOnly, we can safely access i18n.language
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 sm:space-x-2 px-2.5 py-2 h-9 text-sm font-medium text-slate-700 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-md shadow-sm hover:bg-white/90 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all duration-200"
      >
        <span className="text-base">{currentLanguage.flag}</span>
        <span className="hidden md:block text-sm">{currentLanguage.name}</span>
        <svg
          className={`size-5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } hidden sm:block`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm hover:bg-gray-50 transition-colors duration-200 ${
                i18n.language === lang.code 
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700'
              }`}
            >
              <span className="text-base sm:text-lg">{lang.flag}</span>
              <span className="font-medium text-xs sm:text-sm">{lang.name}</span>
              {i18n.language === lang.code && (
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 ml-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
