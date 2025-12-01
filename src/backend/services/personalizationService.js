import { supabase } from '../config/supabase';

export const personalizationService = {
  // Enregistrer une interaction utilisateur
  trackInteraction: async (userId, interactionData) => {
    try {
      const {
        productId = null,
        categoryId = null,
        interactionType, // 'view', 'search', 'cart_add', 'favorite', 'purchase'
        searchQuery = null,
      } = interactionData;

      if (!userId || !interactionType) {
        console.warn('⚠️ [Personalization] userId et interactionType requis');
        return null;
      }

      // Pour les recherches sans productId, on ne peut pas tracker dans cette table
      // car product_id est NOT NULL. On trackera seulement si on a un productId.
      // Pour les autres types d'interactions, productId est requis.
      if (!productId && interactionType !== 'search') {
        console.warn('⚠️ [Personalization] productId requis pour ce type d\'interaction:', interactionType);
        return null;
      }

      // Pour les recherches sans productId, on ne tracke pas (ou on pourrait créer une table séparée)
      if (interactionType === 'search' && !productId) {
        // On pourrait tracker dans une table séparée pour les recherches, mais pour l'instant on ignore
        console.log('ℹ️ [Personalization] Recherche sans productId, tracking ignoré');
        return null;
      }

      // Vérifier si l'interaction existe déjà
      let query = supabase
        .from('user_product_interactions')
        .select('id, interaction_count')
        .eq('user_id', userId)
        .eq('interaction_type', interactionType)
        .eq('product_id', productId);
      
      const { data: existing } = await query.maybeSingle();

      if (existing) {
        // Mettre à jour le compteur et la date
        const { data, error } = await supabase
          .from('user_product_interactions')
          .update({
            interaction_count: existing.interaction_count + 1,
            last_interaction_at: new Date().toISOString(),
            category_id: categoryId,
            search_query: searchQuery,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Créer une nouvelle interaction
        const { data, error } = await supabase
          .from('user_product_interactions')
          .insert({
            user_id: userId,
            product_id: productId,
            category_id: categoryId,
            interaction_type: interactionType,
            search_query: searchQuery,
            interaction_count: 1,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('❌ [Personalization] Erreur lors du tracking:', error);
      // Ne pas bloquer l'application en cas d'erreur
      return null;
    }
  },

  // Récupérer les interactions d'un utilisateur
  getUserInteractions: async (userId, options = {}) => {
    try {
      const {
        limit = 100,
        interactionType = null,
        days = 30, // Interactions des 30 derniers jours par défaut
      } = options;

      let query = supabase
        .from('user_product_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('last_interaction_at', { ascending: false })
        .limit(limit);

      // Filtrer par type d'interaction si spécifié
      if (interactionType) {
        query = query.eq('interaction_type', interactionType);
      }

      // Filtrer par date (derniers X jours)
      if (days) {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        query = query.gte('last_interaction_at', dateLimit.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ [Personalization] Erreur lors de la récupération des interactions:', error);
      return [];
    }
  },

  // Calculer le score de personnalisation pour un produit
  calculateProductScore: (product, userInteractions) => {
    if (!userInteractions || userInteractions.length === 0) {
      // Score par défaut basé sur les facteurs globaux
      let score = 0;
      if (product.is_popular) score += 5;
      if (product.is_new) score += 3;
      if (product.old_price && product.old_price > 0) score += 2;
      if (product.stock > 0) score += 1;
      return score;
    }

    let score = 0;

    // Historique de recherche (30%)
    const searchMatches = userInteractions.filter(i => {
      if (i.interaction_type !== 'search') return false;
      const matchesCategory = i.category_id === product.category_id;
      const matchesSearch = i.search_query && 
        product.name.toLowerCase().includes(i.search_query.toLowerCase());
      return matchesCategory || matchesSearch;
    });
    score += searchMatches.length * 30;

    // Historique d'achat (25%)
    const purchaseMatches = userInteractions.filter(i => 
      i.interaction_type === 'purchase' && 
      (i.product_id === product.id || i.category_id === product.category_id)
    );
    score += purchaseMatches.length * 25;

    // Favoris (20%)
    const favoriteMatches = userInteractions.filter(i => 
      i.interaction_type === 'favorite' && 
      (i.product_id === product.id || i.category_id === product.category_id)
    );
    score += favoriteMatches.length * 20;

    // Interactions (15%)
    const viewMatches = userInteractions.filter(i => 
      i.interaction_type === 'view' && i.product_id === product.id
    );
    score += viewMatches.length * 15;

    const cartMatches = userInteractions.filter(i => 
      i.interaction_type === 'cart_add' && i.product_id === product.id
    );
    score += cartMatches.length * 10; // Moins important que les vues

    // Facteurs globaux (10%)
    if (product.is_popular) score += 5;
    if (product.is_new) score += 3;
    if (product.old_price && product.old_price > 0) score += 2;
    if (product.stock > 0) score += 1;

    return score;
  },

  // Trier les produits par score de personnalisation
  sortProductsByPersonalization: (products, userInteractions) => {
    return products
      .map(product => ({
        ...product,
        personalizationScore: personalizationService.calculateProductScore(product, userInteractions)
      }))
      .sort((a, b) => {
        // Trier par score décroissant
        if (b.personalizationScore !== a.personalizationScore) {
          return b.personalizationScore - a.personalizationScore;
        }
        // En cas d'égalité, trier par date de création
        return new Date(b.created_at) - new Date(a.created_at);
      });
  },

  // Obtenir les catégories préférées d'un utilisateur
  getPreferredCategories: async (userId, limit = 5) => {
    try {
      const interactions = await personalizationService.getUserInteractions(userId, {
        days: 90, // 3 derniers mois
      });

      // Compter les interactions par catégorie
      const categoryCounts = {};
      interactions.forEach(interaction => {
        if (interaction.category_id) {
          categoryCounts[interaction.category_id] = 
            (categoryCounts[interaction.category_id] || 0) + interaction.interaction_count;
        }
      });

      // Trier et retourner les top catégories
      return Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([categoryId]) => categoryId);
    } catch (error) {
      console.error('❌ [Personalization] Erreur lors de la récupération des catégories préférées:', error);
      return [];
    }
  },

  // Supprimer toutes les interactions d'un utilisateur (RGPD)
  clearUserInteractions: async (userId) => {
    try {
      const { error } = await supabase
        .from('user_product_interactions')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ [Personalization] Erreur lors de la suppression des interactions:', error);
      return false;
    }
  },
};

