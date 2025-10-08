import { Alert } from 'react-native';

/**
 * Gestionnaire d'erreurs global
 * Affiche un message d'erreur uniforme à l'utilisateur
 */

class ErrorHandler {
  constructor() {
    this.errorCallbacks = [];
  }

  /**
   * Gérer une erreur et afficher un message à l'utilisateur
   * @param {Error} error - L'erreur à gérer
   * @param {string} context - Le contexte de l'erreur (optionnel)
   * @param {boolean} showAlert - Afficher une alerte (par défaut: true)
   */
  handleError(error, context = '', showAlert = true) {
    // Logger l'erreur pour le debug (console.error reste pour les développeurs)
    if (__DEV__) {
      console.error(`[ErrorHandler] ${context}:`, error);
    }

    // Appeler les callbacks enregistrés
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error, context);
      } catch (err) {
        console.error('Erreur dans le callback:', err);
      }
    });

    // Afficher l'alerte à l'utilisateur
    if (showAlert) {
      this.showErrorAlert();
    }
  }

  /**
   * Afficher une alerte d'erreur standard
   */
  showErrorAlert(customMessage = null) {
    Alert.alert(
      'Erreur',
      customMessage || 'Une erreur est survenue. Veuillez réessayer.',
      [
        {
          text: 'OK',
          style: 'cancel'
        }
      ]
    );
  }

  /**
   * Enregistrer un callback pour être notifié des erreurs
   * @param {Function} callback - Fonction appelée lors d'une erreur
   */
  onError(callback) {
    this.errorCallbacks.push(callback);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Wrapper pour les appels API
   * @param {Function} apiCall - Fonction async à exécuter
   * @param {string} context - Contexte de l'appel
   * @returns {Promise} - Résultat de l'appel ou null en cas d'erreur
   */
  async wrapApiCall(apiCall, context = 'API Call') {
    try {
      return await apiCall();
    } catch (error) {
      this.handleError(error, context);
      return null;
    }
  }

  /**
   * Wrapper pour les fonctions avec gestion d'erreur
   * @param {Function} fn - Fonction à exécuter
   * @param {string} context - Contexte
   */
  async safeExecute(fn, context = 'Operation') {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error, context);
      return null;
    }
  }
}

// Instance singleton
export const errorHandler = new ErrorHandler();

/**
 * Hook pour wrapper les appels avec gestion d'erreur
 */
export const withErrorHandling = (fn, context) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.handleError(error, context);
      throw error; // Re-throw pour permettre une gestion supplémentaire si nécessaire
    }
  };
};

export default errorHandler;

