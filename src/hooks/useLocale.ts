import { useTranslation } from 'react-i18next';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  getCurrencySymbol,
  getCurrencyFromCountry,
} from '@/lib/formatting';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

const LANGUAGE_MAPPINGS = {
  'en-US': 'en-US',
  'en': 'en-US',
  'es': 'es'
} as const;

// Country to language mapping
const COUNTRY_LANGUAGE_MAPPING = {
  'USA': 'en-US',
  'CANADA': 'en-US',
  'MEXICO': 'es',
  'GUATEMALA': 'es'
};

export const useLocale = () => {
  const { i18n } = useTranslation();
  const { country, isLoading } = useAuthStore();
  const [currentLocale, setCurrentLocale] = useState(i18n.language);
  
  useEffect(() => {
    // First, check if there's a saved locale preference
    const savedLocale = localStorage.getItem('i18nextLng');
    
    if (!savedLocale) {
      // If no saved preference, try to determine from user's country
      if (country && COUNTRY_LANGUAGE_MAPPING[country as keyof typeof COUNTRY_LANGUAGE_MAPPING]) {
        const countryBasedLocale = COUNTRY_LANGUAGE_MAPPING[country as keyof typeof COUNTRY_LANGUAGE_MAPPING];
        i18n.changeLanguage(countryBasedLocale);
        setCurrentLocale(countryBasedLocale);
      } else {
        // Fall back to browser language
        const browserLang = navigator.language;
        const defaultLocale = browserLang.startsWith('es') ? 'es' : 'en-US';
        i18n.changeLanguage(defaultLocale);
        setCurrentLocale(defaultLocale);
      }
    } else {
      // Ensure saved locale is mapped correctly
      const mappedLocale = LANGUAGE_MAPPINGS[savedLocale as keyof typeof LANGUAGE_MAPPINGS] || 'en-US';
      if (mappedLocale !== savedLocale) {
        i18n.changeLanguage(mappedLocale);
        setCurrentLocale(mappedLocale);
      } else {
        setCurrentLocale(savedLocale);
      }
    }
  }, [i18n, country, isLoading]);

  // Make sure we always return a valid mapped locale
  const mappedLocale = LANGUAGE_MAPPINGS[currentLocale as keyof typeof LANGUAGE_MAPPINGS] || 'en-US';
  const currency = getCurrencyFromCountry(country);

  const changeLocale = (newLocale: string) => {
    console.log("useLocale changeLocale called with:", newLocale);
    
    // Make sure we map the locale correctly
    const mappedNewLocale = LANGUAGE_MAPPINGS[newLocale as keyof typeof LANGUAGE_MAPPINGS] || 'en-US';
    
    // Update i18n language
    i18n.changeLanguage(mappedNewLocale);
    
    // Save to localStorage
    localStorage.setItem('i18nextLng', mappedNewLocale);
    
    // Update our state
    setCurrentLocale(mappedNewLocale);
    
    console.log("Changed to mapped locale:", mappedNewLocale);
  };

  return {
    locale: mappedLocale,
    country,
    currency,
    isLoading,
    changeLocale,
    formatCurrency: (amount: number) => formatCurrency(amount, currency),
    formatDate,
    formatNumber,
    getCurrencySymbol: () => getCurrencySymbol(currency),
  };
}; 