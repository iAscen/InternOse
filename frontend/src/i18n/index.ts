import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    lng: 'fr', // Set default language explicitly
    fallbackLng: 'fr', // Default to French since it's a Quebec project
    debug: import.meta.env.DEV, // Enable debug messages in development
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      // Only detect language on client side
      checkWhitelist: true,
    },
    // Ensure consistent rendering between server and client
    react: {
      useSuspense: false,
    },
  });

export default i18n;
