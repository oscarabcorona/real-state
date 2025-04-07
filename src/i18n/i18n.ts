import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';

// Debugging function
const debugLanguageChanges = (lng: string) => {
  console.log(`Language changed to: ${lng}`);
};

const resources = {
  'en-US': { translation: enTranslations },
  'en': { translation: enTranslations },
  'es': { translation: esTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    supportedLngs: Object.keys(resources),
    nonExplicitSupportedLngs: false, // Set to false to be strict about supported languages
    load: 'languageOnly',
    debug: process.env.NODE_ENV === 'development',
  });

// Add language change listener for debugging
i18n.on('languageChanged', debugLanguageChanges);

// Ensure the initial language is set
const savedLocale = localStorage.getItem('i18nextLng');
if (savedLocale && (savedLocale === 'en-US' || savedLocale === 'en' || savedLocale === 'es')) {
  i18n.changeLanguage(savedLocale);
} else {
  const browserLang = navigator.language;
  const defaultLocale = browserLang.startsWith('es') ? 'es' : 'en';
  i18n.changeLanguage(defaultLocale);
  localStorage.setItem('i18nextLng', defaultLocale);
}

// Force English mode for testing
i18n.changeLanguage('en');
localStorage.setItem('i18nextLng', 'en');

export default i18n; 