// 💰 Utilitaires pour la gestion des devises

// Devise par défaut
export const DEFAULT_CURRENCY = 'EUR';

// Symboles des devises
export const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  XAF: 'FCFA',
  CAD: 'C$',
  CHF: 'CHF',
  CDF: 'FC'
};

// Formater un prix avec devise
export const formatPrice = (price, currency = DEFAULT_CURRENCY) => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${price.toFixed(2)}${symbol}`;
};

// Formater un prix avec devise et unité
export const formatPriceWithUnit = (price, unit, currency = DEFAULT_CURRENCY) => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${price.toFixed(2)}${symbol}/${unit}`;
};

// Obtenir le symbole de devise
export const getCurrencySymbol = (currency = DEFAULT_CURRENCY) => {
  return CURRENCY_SYMBOLS[currency] || currency;
};
