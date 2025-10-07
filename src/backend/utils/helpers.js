/**
 * Utilitaires pour les services backend
 */

/**
 * Formate une date pour l'affichage
 * @param {string|Date} dateString - Date à formater
 * @param {string} locale - Locale (défaut: 'fr-FR')
 * @returns {string} Date formatée
 */
export const formatDate = (dateString, locale = 'fr-FR') => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formate une date courte (sans heure)
 * @param {string|Date} dateString - Date à formater
 * @param {string} locale - Locale (défaut: 'fr-FR')
 * @returns {string} Date formatée
 */
export const formatDateShort = (dateString, locale = 'fr-FR') => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Calcule le temps écoulé depuis une date
 * @param {string|Date} dateString - Date de référence
 * @returns {string} Temps écoulé
 */
export const getTimeAgo = (dateString) => {
  if (!dateString) return '';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'À l\'instant';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Il y a ${minutes} min`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Il y a ${hours}h`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  } else {
    return formatDateShort(dateString);
  }
};

/**
 * Génère un numéro de commande unique
 * @param {string} prefix - Préfixe (défaut: 'DM')
 * @returns {string} Numéro de commande
 */
export const generateOrderNumber = (prefix = 'DM') => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}${random}`;
};

/**
 * Valide une adresse email
 * @param {string} email - Email à valider
 * @returns {boolean} True si valide
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone
 * @param {string} phone - Numéro à valider
 * @returns {boolean} True si valide
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Formate un numéro de téléphone
 * @param {string} phone - Numéro à formater
 * @returns {string} Numéro formaté
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Supprimer tous les caractères non numériques sauf +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Format français
  if (cleaned.startsWith('+33')) {
    return cleaned.replace(/^\+33(\d{9})$/, '+33 $1');
  } else if (cleaned.startsWith('0')) {
    return cleaned.replace(/^0(\d{9})$/, '0$1');
  }
  
  return cleaned;
};

/**
 * Formate un prix selon la devise
 * @param {number} amount - Montant
 * @param {string} currency - Devise (CDF, USD, $, Fc)
 * @returns {string} Prix formaté
 */
export const formatPrice = (amount, currency = 'CDF') => {
  if (amount === null || amount === undefined) return '0';
  
  const numericAmount = parseFloat(amount);
  
  if (isNaN(numericAmount)) return '0';
  
  switch (currency.toUpperCase()) {
    case 'USD':
    case '$':
      return `$${numericAmount.toFixed(2)}`;
    case 'CDF':
    case 'FC':
      return `${numericAmount.toLocaleString('fr-FR')} Fc`;
    default:
      return `${numericAmount.toFixed(2)} ${currency}`;
  }
};

/**
 * Calcule la moyenne des notes
 * @param {Array} ratings - Tableau de notes
 * @returns {number} Moyenne arrondie à 1 décimale
 */
export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};

/**
 * Génère un slug à partir d'un texte
 * @param {string} text - Texte à convertir
 * @returns {string} Slug
 */
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/[\s_-]+/g, '-') // Remplacer espaces et underscores par des tirets
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début/fin
};

/**
 * Tronque un texte à une longueur donnée
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @param {string} suffix - Suffixe à ajouter (défaut: '...')
 * @returns {string} Texte tronqué
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Débounce une fonction
 * @param {Function} func - Fonction à débouncer
 * @param {number} wait - Délai d'attente en ms
 * @returns {Function} Fonction débouncée
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Retry une fonction avec backoff exponentiel
 * @param {Function} fn - Fonction à exécuter
 * @param {number} maxRetries - Nombre maximum de tentatives
 * @param {number} delay - Délai initial en ms
 * @returns {Promise} Résultat de la fonction
 */
export const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const backoffDelay = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
};

/**
 * Nettoie les données avant insertion en base
 * @param {object} data - Données à nettoyer
 * @returns {object} Données nettoyées
 */
export const sanitizeData = (data) => {
  const cleaned = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (typeof value === 'string') {
        cleaned[key] = value.trim();
      } else {
        cleaned[key] = value;
      }
    }
  });
  
  return cleaned;
};

/**
 * Valide les données d'un objet selon un schéma
 * @param {object} data - Données à valider
 * @param {object} schema - Schéma de validation
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateData = (data, schema) => {
  const errors = {};
  
  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field];
    
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = `${field} est requis`;
      return;
    }
    
    if (value && rules.type) {
      if (typeof value !== rules.type) {
        errors[field] = `${field} doit être de type ${rules.type}`;
      }
    }
    
    if (value && rules.minLength && value.length < rules.minLength) {
      errors[field] = `${field} doit contenir au moins ${rules.minLength} caractères`;
    }
    
    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${field} ne peut pas dépasser ${rules.maxLength} caractères`;
    }
    
    if (value && rules.pattern && !rules.pattern.test(value)) {
      errors[field] = `${field} n'est pas dans le bon format`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
