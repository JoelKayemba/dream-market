import { supabase, FAVORITE_TYPES } from '../config/supabase';

export const favoriteService = {
  // Récupérer les favoris d'un utilisateur
  getUserFavorites: async (userId, itemType = null) => {
    try {
      let query = supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (itemType) {
        query = query.eq('item_type', itemType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les favoris avec détails
  getUserFavoritesWithDetails: async (userId, itemType = null) => {
    try {
      let favorites = await favoriteService.getUserFavorites(userId, itemType);
      
      // Récupérer les détails pour chaque type d'élément
      const favoritesWithDetails = await Promise.all(
        favorites.map(async (favorite) => {
          let details = null;
          
          try {
            switch (favorite.item_type) {
              case FAVORITE_TYPES.PRODUCT:
                const { data: product } = await supabase
                  .from('products')
                  .select(`
                    *,
                    farms (
                      id,
                      name,
                      location
                    ),
                    categories (
                      id,
                      name,
                      emoji
                    )
                  `)
                  .eq('id', favorite.item_id)
                  .single();
                details = product;
                break;
                
              case FAVORITE_TYPES.FARM:
                const { data: farm } = await supabase
                  .from('farms')
                  .select('*')
                  .eq('id', favorite.item_id)
                  .single();
                details = farm;
                break;
                
              case FAVORITE_TYPES.SERVICE:
                const { data: service } = await supabase
                  .from('services')
                  .select(`
                    *,
                    categories (
                      id,
                      name,
                      emoji
                    )
                  `)
                  .eq('id', favorite.item_id)
                  .single();
                details = service;
                break;
            }
          } catch (detailError) {
            // Ignorer l'erreur silencieusement
          }
          
          return {
            ...favorite,
            details,
          };
        })
      );

      return favoritesWithDetails.filter(fav => fav.details); // Filtrer les éléments supprimés
    } catch (error) {
      throw error;
    }
  },

  // Ajouter un élément aux favoris
  addToFavorites: async (userId, itemType, itemId) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert([{
          user_id: userId,
          item_type: itemType,
          item_id: itemId,
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ [Service] addToFavorites Supabase error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('❌ [Service] addToFavorites error:', error);
      throw error;
    }
  },

  // Supprimer un élément des favoris
  removeFromFavorites: async (userId, itemType, itemId) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      if (error) {
        console.error('❌ [Service] removeFromFavorites Supabase error:', error);
        throw error;
      }
      return true;
    } catch (error) {
      console.error('❌ [Service] removeFromFavorites error:', error);
      throw error;
    }
  },

  // Vérifier si un élément est en favori
  isFavorite: async (userId, itemType, itemId) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      throw error;
    }
  },

  // Toggle favori (ajouter si absent, supprimer si présent)
  toggleFavorite: async (userId, itemType, itemId) => {
    try {
      const isCurrentlyFavorite = await favoriteService.isFavorite(userId, itemType, itemId);
      
      if (isCurrentlyFavorite) {
        await favoriteService.removeFromFavorites(userId, itemType, itemId);
        return false; // Retourne false si supprimé
      } else {
        await favoriteService.addToFavorites(userId, itemType, itemId);
        return true; // Retourne true si ajouté
      }
    } catch (error) {
      console.error('❌ [Service] toggleFavorite error:', error);
      throw error;
    }
  },

  // Récupérer les favoris par type
  getFavoriteProducts: async (userId) => {
    try {
      return await favoriteService.getUserFavoritesWithDetails(userId, FAVORITE_TYPES.PRODUCT);
    } catch (error) {
      throw error;
    }
  },

  getFavoriteFarms: async (userId) => {
    try {
      return await favoriteService.getUserFavoritesWithDetails(userId, FAVORITE_TYPES.FARM);
    } catch (error) {
      throw error;
    }
  },

  getFavoriteServices: async (userId) => {
    try {
      return await favoriteService.getUserFavoritesWithDetails(userId, FAVORITE_TYPES.SERVICE);
    } catch (error) {
      throw error;
    }
  },

  // Supprimer tous les favoris d'un utilisateur
  clearAllFavorites: async (userId) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les statistiques des favoris
  getFavoriteStats: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('item_type')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data.length,
        products: data.filter(fav => fav.item_type === FAVORITE_TYPES.PRODUCT).length,
        farms: data.filter(fav => fav.item_type === FAVORITE_TYPES.FARM).length,
        services: data.filter(fav => fav.item_type === FAVORITE_TYPES.SERVICE).length,
      };

      return stats;
    } catch (error) {
      throw error;
    }
  },
};
