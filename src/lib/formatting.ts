import i18n from 'i18next';

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  const locale = i18n.language;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date: Date | string) => {
  const locale = i18n.language;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatNumber = (number: number) => {
  const locale = i18n.language;
  return new Intl.NumberFormat(locale).format(number);
};

export const getCurrencySymbol = (currency: string = 'USD') => {
  const locale = i18n.language;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(0).replace(/[\d,]/g, '').trim();
};

export const getCountryFromLocale = (locale: string): string => {
  const countryMap: { [key: string]: string } = {
    'en-US': 'US',
    'es-ES': 'ES',
    'es-MX': 'MX',
    'es-AR': 'AR',
    'pt-BR': 'BR',
    'fr-FR': 'FR',
    'de-DE': 'DE',
    'it-IT': 'IT',
    'ja-JP': 'JP',
    'zh-CN': 'CN',
    'ko-KR': 'KR',
    'ru-RU': 'RU',
  };
  return countryMap[locale] || 'US';
};

export const getCurrencyFromCountry = (country: string): string => {
  const currencyMap: { [key: string]: string } = {
    'US': 'USD',
    'ES': 'EUR',
    'MX': 'MXN',
    'AR': 'ARS',
    'BR': 'BRL',
    'FR': 'EUR',
    'DE': 'EUR',
    'IT': 'EUR',
    'JP': 'JPY',
    'CN': 'CNY',
    'KR': 'KRW',
    'RU': 'RUB',
  };
  return currencyMap[country] || 'USD';
}; 