import { supabase, TABLES } from '../config/supabase';

export const cartService = {
  // Récupérer le panier d'un utilisateur avec les détails des produits
  getUserCart: async (userId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.CARTS)
        .select(`
          *,
          products (
            *,
            farms (
              id,
              name,
              location,
              verified
            ),
            categories (
              id,
              name,
              emoji
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transformer les données pour correspondre au format du panier local
      const cartItems = (data || []).map(item => ({
        product: item.products,
        quantity: item.quantity,
        addedAt: item.created_at,
      })).filter(item => item.product !== null); // Filtrer les produits supprimés

      return cartItems;
    } catch (error) {
      console.error('❌ [CartService] Error fetching user cart:', error);
      throw error;
    }
  },

  // Ajouter ou mettre à jour un produit dans le panier
  addOrUpdateCartItem: async (userId, productId, quantity) => {
    try {
      // Vérifier si l'article existe déjà
      const { data: existingItem, error: checkError } = await supabase
        .from(TABLES.CARTS)
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = aucun résultat trouvé (c'est normal si l'article n'existe pas)
        throw checkError;
      }

      if (existingItem) {
        // Mettre à jour la quantité
        const { data, error } = await supabase
          .from(TABLES.CARTS)
          .update({ 
            quantity: quantity,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('product_id', productId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Créer un nouvel article
        const { data, error } = await supabase
          .from(TABLES.CARTS)
          .insert({
            user_id: userId,
            product_id: productId,
            quantity: quantity,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('❌ [CartService] Error adding/updating cart item:', error);
      throw error;
    }
  },

  // Supprimer un produit du panier
  removeCartItem: async (userId, productId) => {
    try {
      const { error } = await supabase
        .from(TABLES.CARTS)
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ [CartService] Error removing cart item:', error);
      throw error;
    }
  },

  // Vider le panier d'un utilisateur
  clearUserCart: async (userId) => {
    try {
      const { error } = await supabase
        .from(TABLES.CARTS)
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ [CartService] Error clearing cart:', error);
      throw error;
    }
  },

  // Synchroniser le panier local avec la base de données
  syncCart: async (userId, localCartItems) => {
    try {
      // Récupérer le panier de la base de données
      const dbCart = await cartService.getUserCart(userId);
      
      // Créer des maps pour faciliter la comparaison
      const localMap = new Map();
      localCartItems.forEach(item => {
        localMap.set(item.product.id, item.quantity);
      });

      const dbMap = new Map();
      dbCart.forEach(item => {
        dbMap.set(item.product.id, item.quantity);
      });

      // Fusionner les paniers (priorité au panier local)
      const mergedItems = [];
      const allProductIds = new Set([...localMap.keys(), ...dbMap.keys()]);

      for (const productId of allProductIds) {
        const localQty = localMap.get(productId);
        const dbQty = dbMap.get(productId);

        // Si présent dans les deux, prendre la quantité la plus récente (local)
        // Si présent seulement en local, l'ajouter
        // Si présent seulement en DB, le garder
        const finalQty = localQty || dbQty;
        
        if (finalQty) {
          // Synchroniser avec la base de données
          await cartService.addOrUpdateCartItem(userId, productId, finalQty);
          
          // Trouver le produit complet (depuis local ou DB)
          const localItem = localCartItems.find(item => item.product.id === productId);
          const dbItem = dbCart.find(item => item.product.id === productId);
          const product = localItem?.product || dbItem?.product;
          
          if (product) {
            mergedItems.push({
              product,
              quantity: finalQty,
              addedAt: localItem?.addedAt || dbItem?.addedAt || new Date().toISOString(),
            });
          }
        }
      }

      return mergedItems;
    } catch (error) {
      console.error('❌ [CartService] Error syncing cart:', error);
      throw error;
    }
  },
};

