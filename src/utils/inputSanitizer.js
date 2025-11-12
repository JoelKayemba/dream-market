/**
 * Utilitaire de sécurité pour valider et nettoyer les entrées utilisateur
 * Protège contre les attaques XSS, injection SQL, et autres vulnérabilités
 */

/**
 * Nettoie une chaîne de caractères en supprimant UNIQUEMENT les caractères vraiment dangereux
 * Ne modifie PAS les caractères normaux (apostrophes, accents, etc.)
 * @param {string} input - La chaîne à nettoyer
 * @param {object} options - Options de nettoyage
 * @returns {string} - La chaîne nettoyée
 */
export const sanitizeString = (input, options = {}) => {
  if (input === null || input === undefined) {
    return '';
  }

  // Convertir en string si ce n'est pas déjà le cas
  let cleaned = String(input);

  // Supprimer UNIQUEMENT les caractères de contrôle vraiment dangereux (sauf retours à la ligne si autorisés)
  if (!options.allowNewlines) {
    // Supprimer les caractères de contrôle dangereux mais garder les espaces normaux
    cleaned = cleaned.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  } else {
    // Garder les retours à la ligne et tabulations
    cleaned = cleaned.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
    cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  // Supprimer UNIQUEMENT les balises HTML/XML vraiment dangereuses (pas d'échappement des caractères normaux)
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  cleaned = cleaned.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  cleaned = cleaned.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  cleaned = cleaned.replace(/javascript:/gi, '');
  cleaned = cleaned.replace(/data:text\/html/gi, '');
  cleaned = cleaned.replace(/on\w+\s*=/gi, ''); // Supprimer les event handlers (onclick, onload, etc.)

  // NE JAMAIS échapper les caractères HTML par défaut - cela casse l'écriture normale
  // L'échappement HTML ne doit être utilisé QUE si explicitement demandé et nécessaire
  // (par exemple pour l'affichage dans du HTML, mais pas pour le stockage en base de données)
  if (options.escapeHtml === true) {
    // Échapper uniquement les balises HTML restantes, pas les apostrophes ni autres caractères normaux
    cleaned = cleaned
      .replace(/&(?![a-zA-Z0-9#]{1,7};)/g, '&amp;') // Échapper & seulement s'il n'est pas déjà une entité
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // NE PAS échapper les apostrophes, guillemets, slashes - ce sont des caractères normaux
  }

  // Supprimer les espaces en début et fin
  if (!options.preserveWhitespace) {
    cleaned = cleaned.trim();
  }

  // Limiter la longueur si spécifié
  if (options.maxLength && cleaned.length > options.maxLength) {
    cleaned = cleaned.substring(0, options.maxLength);
  }

  return cleaned;
};

/**
 * Valide et nettoie un email
 * @param {string} email - L'email à valider
 * @returns {object} - { valid: boolean, cleaned: string, error?: string }
 */
export const validateAndSanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, cleaned: '', error: 'Email invalide' };
  }

  const cleaned = sanitizeString(email.trim().toLowerCase(), {
    maxLength: 255,
    escapeHtml: false,
  });

  // Expression régulière pour valider l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleaned)) {
    return { valid: false, cleaned: '', error: 'Format d\'email invalide' };
  }

  // Vérifier la longueur
  if (cleaned.length > 255) {
    return { valid: false, cleaned: '', error: 'Email trop long' };
  }

  return { valid: true, cleaned, error: null };
};

/**
 * Valide et nettoie un numéro de téléphone
 * @param {string} phone - Le numéro de téléphone à valider
 * @returns {object} - { valid: boolean, cleaned: string, error?: string }
 */
export const validateAndSanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, cleaned: '', error: 'Numéro de téléphone invalide' };
  }

  // Supprimer tous les caractères non numériques sauf +, espaces, tirets, parenthèses
  let cleaned = phone.replace(/[^\d+\s\-()]/g, '');

  // Supprimer les espaces en début et fin
  cleaned = cleaned.trim();

  // Vérifier la longueur minimale et maximale
  const digitsOnly = cleaned.replace(/\D/g, '');
  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    return { valid: false, cleaned: '', error: 'Numéro de téléphone invalide (8-15 chiffres requis)' };
  }

  return { valid: true, cleaned, error: null };
};

/**
 * Valide et nettoie une URL
 * @param {string} url - L'URL à valider
 * @returns {object} - { valid: boolean, cleaned: string, error?: string }
 */
export const validateAndSanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, cleaned: '', error: 'URL invalide' };
  }

  const cleaned = sanitizeString(url.trim(), {
    maxLength: 2048,
    escapeHtml: false,
  });

  try {
    // Essayer de créer un objet URL pour valider
    const urlObj = new URL(cleaned);
    
    // Vérifier que le protocole est autorisé
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return { valid: false, cleaned: '', error: 'Protocole non autorisé' };
    }

    return { valid: true, cleaned, error: null };
  } catch (error) {
    return { valid: false, cleaned: '', error: 'Format d\'URL invalide' };
  }
};

/**
 * Valide et nettoie un nombre
 * @param {any} value - La valeur à valider
 * @param {object} options - Options de validation
 * @returns {object} - { valid: boolean, cleaned: number | null, error?: string }
 */
export const validateAndSanitizeNumber = (value, options = {}) => {
  const { min, max, allowDecimals = true, allowNegative = false } = options;

  if (value === null || value === undefined || value === '') {
    return { valid: false, cleaned: null, error: 'Valeur numérique requise' };
  }

  // Convertir en nombre
  const num = allowDecimals ? parseFloat(value) : parseInt(value, 10);

  if (isNaN(num)) {
    return { valid: false, cleaned: null, error: 'Valeur numérique invalide' };
  }

  // Vérifier si les nombres négatifs sont autorisés
  if (!allowNegative && num < 0) {
    return { valid: false, cleaned: null, error: 'Les nombres négatifs ne sont pas autorisés' };
  }

  // Vérifier les limites min/max
  if (min !== undefined && num < min) {
    return { valid: false, cleaned: null, error: `La valeur doit être supérieure ou égale à ${min}` };
  }

  if (max !== undefined && num > max) {
    return { valid: false, cleaned: null, error: `La valeur doit être inférieure ou égale à ${max}` };
  }

  return { valid: true, cleaned: num, error: null };
};

/**
 * Valide et nettoie un texte long (textarea)
 * @param {string} text - Le texte à valider
 * @param {object} options - Options de validation
 * @returns {object} - { valid: boolean, cleaned: string, error?: string }
 */
export const validateAndSanitizeText = (text, options = {}) => {
  const { maxLength = 10000, required = false, allowHtml = false } = options;

  if (text === null || text === undefined) {
    text = '';
  }

  if (required && (!text || text.trim().length === 0)) {
    return { valid: false, cleaned: '', error: 'Ce champ est requis' };
  }

  // Ne JAMAIS échapper HTML par défaut - cela casse l'écriture normale
  // escapeHtml doit être false par défaut pour préserver les caractères normaux
  const cleaned = sanitizeString(text, {
    allowNewlines: true,
    preserveWhitespace: !options.trim,
    maxLength,
    escapeHtml: false, // Toujours false pour préserver les apostrophes et autres caractères normaux
  });

  if (cleaned.length > maxLength) {
    return { valid: false, cleaned: '', error: `Le texte ne doit pas dépasser ${maxLength} caractères` };
  }

  return { valid: true, cleaned, error: null };
};

/**
 * Valide et nettoie un nom (prénom, nom, etc.)
 * @param {string} name - Le nom à valider
 * @param {object} options - Options de validation
 * @returns {object} - { valid: boolean, cleaned: string, error?: string }
 */
export const validateAndSanitizeName = (name, options = {}) => {
  const { maxLength = 100, required = false, minLength = 1 } = options;

  if (!name || typeof name !== 'string') {
    if (required) {
      return { valid: false, cleaned: '', error: 'Ce champ est requis' };
    }
    return { valid: true, cleaned: '', error: null };
  }

  // Ne jamais échapper HTML pour les noms - préserver tous les caractères normaux
  const cleaned = sanitizeString(name.trim(), {
    maxLength,
    escapeHtml: false, // Toujours false pour préserver les apostrophes (ex: O'Brien, d'Artagnan)
  });

  if (required && cleaned.length < minLength) {
    return { valid: false, cleaned: '', error: `Ce champ doit contenir au moins ${minLength} caractère(s)` };
  }

  if (cleaned.length > maxLength) {
    return { valid: false, cleaned: '', error: `Ce champ ne doit pas dépasser ${maxLength} caractères` };
  }

  return { valid: true, cleaned, error: null };
};

/**
 * Valide et nettoie un titre ou sujet
 * @param {string} title - Le titre à valider
 * @param {object} options - Options de validation
 * @returns {object} - { valid: boolean, cleaned: string, error?: string }
 */
export const validateAndSanitizeTitle = (title, options = {}) => {
  const { maxLength = 255, required = false, minLength = 1 } = options;

  if (!title || typeof title !== 'string') {
    if (required) {
      return { valid: false, cleaned: '', error: 'Ce champ est requis' };
    }
    return { valid: true, cleaned: '', error: null };
  }

  // Ne jamais échapper HTML pour les titres - préserver tous les caractères normaux
  const cleaned = sanitizeString(title.trim(), {
    maxLength,
    escapeHtml: false, // Toujours false pour préserver les apostrophes et autres caractères normaux
  });

  if (required && cleaned.length < minLength) {
    return { valid: false, cleaned: '', error: `Ce champ doit contenir au moins ${minLength} caractère(s)` };
  }

  if (cleaned.length > maxLength) {
    return { valid: false, cleaned: '', error: `Ce champ ne doit pas dépasser ${maxLength} caractères` };
  }

  return { valid: true, cleaned, error: null };
};

/**
 * Valide et nettoie un UUID
 * @param {string} uuid - L'UUID à valider
 * @returns {object} - { valid: boolean, cleaned: string, error?: string }
 */
export const validateAndSanitizeUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') {
    return { valid: false, cleaned: '', error: 'UUID invalide' };
  }

  const cleaned = sanitizeString(uuid.trim(), {
    maxLength: 36,
    escapeHtml: false,
  });

  // Format UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(cleaned)) {
    return { valid: false, cleaned: '', error: 'Format UUID invalide' };
  }

  return { valid: true, cleaned: cleaned.toLowerCase(), error: null };
};

/**
 * Valide et nettoie un objet de données (pour les formulaires)
 * @param {object} data - Les données à valider
 * @param {object} schema - Le schéma de validation
 * @returns {object} - { valid: boolean, cleaned: object, errors: object }
 */
export const validateAndSanitizeObject = (data, schema) => {
  const cleaned = {};
  const errors = {};
  let isValid = true;

  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];

    let result;
    switch (rules.type) {
      case 'string':
        result = sanitizeString(value || '', rules.options || {});
        cleaned[key] = result;
        if (rules.required && (!result || result.length === 0)) {
          errors[key] = rules.errorMessage || `${key} est requis`;
          isValid = false;
        }
        break;

      case 'email':
        result = validateAndSanitizeEmail(value);
        if (result.valid) {
          cleaned[key] = result.cleaned;
        } else {
          errors[key] = result.error;
          isValid = false;
        }
        break;

      case 'phone':
        result = validateAndSanitizePhone(value);
        if (result.valid) {
          cleaned[key] = result.cleaned;
        } else {
          errors[key] = result.error;
          isValid = false;
        }
        break;

      case 'number':
        result = validateAndSanitizeNumber(value, rules.options || {});
        if (result.valid) {
          cleaned[key] = result.cleaned;
        } else {
          errors[key] = result.error;
          isValid = false;
        }
        break;

      case 'text':
        result = validateAndSanitizeText(value, { ...rules.options, required: rules.required });
        if (result.valid) {
          cleaned[key] = result.cleaned;
        } else {
          errors[key] = result.error;
          isValid = false;
        }
        break;

      case 'name':
        result = validateAndSanitizeName(value, { ...rules.options, required: rules.required });
        if (result.valid) {
          cleaned[key] = result.cleaned;
        } else {
          errors[key] = result.error;
          isValid = false;
        }
        break;

      case 'title':
        result = validateAndSanitizeTitle(value, { ...rules.options, required: rules.required });
        if (result.valid) {
          cleaned[key] = result.cleaned;
        } else {
          errors[key] = result.error;
          isValid = false;
        }
        break;

      case 'uuid':
        result = validateAndSanitizeUUID(value);
        if (result.valid) {
          cleaned[key] = result.cleaned;
        } else {
          errors[key] = result.error;
          isValid = false;
        }
        break;

      default:
        cleaned[key] = value;
    }
  }

  return { valid: isValid, cleaned, errors };
};

/**
 * Nettoie un tableau de chaînes
 * @param {array} array - Le tableau à nettoyer
 * @param {object} options - Options de nettoyage
 * @returns {array} - Le tableau nettoyé
 */
export const sanitizeArray = (array, options = {}) => {
  if (!Array.isArray(array)) {
    return [];
  }

  return array
    .map(item => sanitizeString(item, options))
    .filter(item => item.length > 0);
};

/**
 * Valide qu'une valeur n'est pas vide
 * @param {any} value - La valeur à valider
 * @param {string} fieldName - Le nom du champ (pour le message d'erreur)
 * @returns {object} - { valid: boolean, error?: string }
 */
export const validateRequired = (value, fieldName = 'Ce champ') => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} est requis` };
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return { valid: false, error: `${fieldName} est requis` };
  }

  return { valid: true, error: null };
};

