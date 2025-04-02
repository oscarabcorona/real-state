import { useTranslation } from 'react-i18next';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  getCurrencySymbol,
  getCountryFromLocale,
  getCurrencyFromCountry,
} from '@/lib/formatting';
import { useEffect } from 'react';

const LANGUAGE_MAPPINGS = {
  'en-US': 'en-US',
  'en': 'en-US',
  'es': 'es'
} as const;

export const useLocale = () => {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    const savedLocale = localStorage.getItem('i18nextLng');
    if (!savedLocale) {
      const browserLang = navigator.language;
      // Map any Spanish variant to 'es', otherwise use 'en-US'
      const defaultLocale = browserLang.startsWith('es') ? 'es' : 'en-US';
      i18n.changeLanguage(defaultLocale);
    } else {
      // Ensure saved locale is mapped correctly
      const mappedLocale = LANGUAGE_MAPPINGS[savedLocale as keyof typeof LANGUAGE_MAPPINGS] || 'en-US';
      if (mappedLocale !== savedLocale) {
        i18n.changeLanguage(mappedLocale);
      }
    }
  }, [i18n]);

  const currentLocale = i18n.language;
  const mappedLocale = LANGUAGE_MAPPINGS[currentLocale as keyof typeof LANGUAGE_MAPPINGS] || 'en-US';
  const country = getCountryFromLocale(mappedLocale);
  const currency = getCurrencyFromCountry(country);

  const changeLocale = (newLocale: string) => {
    const mappedNewLocale = LANGUAGE_MAPPINGS[newLocale as keyof typeof LANGUAGE_MAPPINGS] || 'en-US';
    i18n.changeLanguage(mappedNewLocale);
    localStorage.setItem('i18nextLng', mappedNewLocale);
  };

  return {
    locale: mappedLocale,
    country,
    currency,
    changeLocale,
    formatCurrency: (amount: number) => formatCurrency(amount, currency),
    formatDate,
    formatNumber,
    getCurrencySymbol: () => getCurrencySymbol(currency),
  };
}; 