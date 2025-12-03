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
        className="flex items-center space-x-2 sm:space-x-3 px-4 py-2.5 h-11 text-base font-semibold text-slate-800 bg-white border-2 border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200"
      >
        <span className="text-xl">{currentLanguage.flag}</span>
        <span className="hidden md:block text-base">{currentLanguage.name}</span>
        <svg
          className={`size-5 text-slate-500 transition-transform duration-200 ${
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
        <div className="absolute right-0 mt-2 w-44 sm:w-56 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center space-x-3 sm:space-x-4 px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base hover:bg-slate-50 transition-colors duration-200 ${
                i18n.language === lang.code 
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500 font-semibold' 
                  : 'text-slate-700 font-medium'
              }`}
            >
              <span className="text-xl sm:text-2xl">{lang.flag}</span>
              <span className="font-semibold text-sm sm:text-base">{lang.name}</span>
              {i18n.language === lang.code && (
                <svg
                  className="w-5 h-5 text-indigo-600 ml-auto"
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
