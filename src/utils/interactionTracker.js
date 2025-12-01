import { useSelector } from 'react-redux';
import { personalizationService } from '../backend/services/personalizationService';

/**
 * Utilitaire pour tracker les interactions utilisateur de manière non-bloquante
 * Les erreurs sont silencieuses pour ne pas impacter l'expérience utilisateur
 */

// Cache local pour éviter les appels répétés
const interactionCache = new Map();
const CACHE_DURATION = 5000; // 5 secondes

const getCacheKey = (userId, type, productId) => {
  return `${userId}_${type}_${productId || 'none'}`;
};

const isCached = (key) => {
  const cached = interactionCache.get(key);
  if (!cached) return false;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    interactionCache.delete(key);
    return false;
  }
  return true;
};

const setCache = (key) => {
  interactionCache.set(key, { timestamp: Date.now() });
};

/**
 * Tracker une interaction utilisateur
 * @param {Object} interactionData - Données de l'interaction
 * @param {string} interactionData.type - Type d'interaction ('view', 'search', 'cart_add', 'favorite', 'purchase')
 * @param {string} interactionData.productId - ID du produit (optionnel)
 * @param {string} interactionData.categoryId - ID de la catégorie (optionnel)
 * @param {string} interactionData.searchQuery - Requête de recherche (optionnel)
 */
export const trackInteraction = async (interactionData) => {
  try {
    const { type, productId, categoryId, searchQuery } = interactionData;

    if (!type) {
      console.warn('⚠️ [InteractionTracker] Type d\'interaction requis');
      return;
    }

    // Récupérer l'utilisateur depuis Redux
    // Note: Cette fonction doit être appelée depuis un composant React ou avec getState()
    // Pour l'instant, on va utiliser une approche différente
    
    // Vérifier le cache pour éviter les appels répétés
    const cacheKey = getCacheKey('user', type, productId);
    if (isCached(cacheKey)) {
      return; // Déjà tracké récemment
    }

    // Cette fonction sera appelée avec le userId depuis les composants
    // On retourne une fonction qui prend le userId
    return async (userId) => {
      if (!userId) {
        // Utilisateur non connecté, ne pas tracker
        return;
      }

      try {
        await personalizationService.trackInteraction(userId, {
          productId,
          categoryId,
          interactionType: type,
          searchQuery,
        });
        setCache(cacheKey);
      } catch (error) {
        // Erreur silencieuse pour ne pas bloquer l'application
        console.warn('⚠️ [InteractionTracker] Erreur lors du tracking:', error);
      }
    };
  } catch (error) {
    console.warn('⚠️ [InteractionTracker] Erreur:', error);
  }
};

/**
 * Hook pour tracker les interactions (à utiliser dans les composants)
 */
export const useInteractionTracker = () => {
  const userId = useSelector((state) => state.auth?.user?.id);

  const track = async (interactionData) => {
    if (!userId) return; // Pas de tracking pour les utilisateurs non connectés

    const { type, productId, categoryId, searchQuery } = interactionData;
    const cacheKey = getCacheKey(userId, type, productId);
    
    if (isCached(cacheKey)) {
      return; // Déjà tracké récemment
    }

    try {
      await personalizationService.trackInteraction(userId, {
        productId,
        categoryId,
        interactionType: type,
        searchQuery,
      });
      setCache(cacheKey);
    } catch (error) {
      console.warn('⚠️ [InteractionTracker] Erreur:', error);
    }
  };

  return { track, userId };
};

/**
 * Fonction utilitaire pour tracker depuis n'importe où (avec userId explicite)
 */
export const trackInteractionWithUserId = async (userId, interactionData) => {
  if (!userId) return;

  const { type, productId, categoryId, searchQuery } = interactionData;
  const cacheKey = getCacheKey(userId, type, productId);
  
  if (isCached(cacheKey)) {
    return; // Déjà tracké récemment
  }

  try {
    await personalizationService.trackInteraction(userId, {
      productId,
      categoryId,
      interactionType: type,
      searchQuery,
    });
    setCache(cacheKey);
  } catch (error) {
    console.warn('⚠️ [InteractionTracker] Erreur:', error);
  }
};

