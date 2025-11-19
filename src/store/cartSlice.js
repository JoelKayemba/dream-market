import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { orderService, cartService } from '../backend';
import { supabase } from '../backend/config/supabase';

// Clé de base pour AsyncStorage (sera complétée avec l'ID utilisateur)
const CART_STORAGE_KEY_BASE = '@dream_market_cart';

// Fonction pour obtenir la clé de stockage pour un utilisateur
const getCartStorageKey = (userId) => {
  if (userId) {
    return `${CART_STORAGE_KEY_BASE}_${userId}`;
  }
  // Si pas d'utilisateur, utiliser une clé temporaire (pour utilisateurs non connectés)
  return `${CART_STORAGE_KEY_BASE}_guest`;
};

// Fonctions de persistance locale (liées à l'utilisateur)
const saveCartToStorage = async (cartItems, userId) => {
  try {
    const storageKey = getCartStorageKey(userId);
    await AsyncStorage.setItem(storageKey, JSON.stringify(cartItems));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du panier:', error);
  }
};

const loadCartFromStorage = async (userId) => {
  try {
    const storageKey = getCartStorageKey(userId);
    const cartData = await AsyncStorage.getItem(storageKey);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Erreur lors du chargement du panier:', error);
    return [];
  }
};

// Nettoyer le panier d'un utilisateur spécifique
const clearCartFromStorage = async (userId) => {
  try {
    const storageKey = getCartStorageKey(userId);
    await AsyncStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Erreur lors du nettoyage du panier:', error);
  }
};

// Action pour charger le panier (local + base de données si connecté)
export const loadCart = createAsyncThunk(
  'cart/loadCart',
  async (_, { getState }) => {
    try {
      // Récupérer l'utilisateur connecté
      const state = getState();
      const userId = state.auth?.user?.id;

      if (!userId) {
        // Utilisateur non connecté : charger uniquement le panier local (guest)
        const localCart = await loadCartFromStorage(null);
        return { items: localCart, userId: null };
      }

      // Utilisateur connecté : charger depuis la base de données
      try {
        const dbCart = await cartService.getUserCart(userId);
        
        // Charger aussi le panier local pour fusionner si nécessaire
        const localCart = await loadCartFromStorage(userId);
        
        // Si le panier local existe et est différent, fusionner
        if (localCart.length > 0) {
          const mergedCart = await cartService.syncCart(userId, localCart);
          // Sauvegarder le panier fusionné localement
          await saveCartToStorage(mergedCart, userId);
          return { items: mergedCart, userId };
        }
        
        // Sauvegarder le panier de la DB localement
        await saveCartToStorage(dbCart, userId);
        return { items: dbCart, userId };
      } catch (dbError) {
        console.warn('⚠️ Erreur lors du chargement depuis la DB, utilisation du panier local:', dbError);
        // En cas d'erreur DB, utiliser le panier local
        const localCart = await loadCartFromStorage(userId);
        return { items: localCart, userId };
      }
    } catch (error) {
      console.error('❌ [Cart] Error loading cart:', error);
      return { items: [], userId: null };
    }
  }
);

// Action pour synchroniser le panier avec la base de données
export const syncCartWithDB = createAsyncThunk(
  'cart/syncCartWithDB',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId = state.auth?.user?.id;
      const cartItems = state.cart.items;

      if (!userId) {
        // Pas de synchronisation si l'utilisateur n'est pas connecté
        return { items: cartItems, userId: null };
      }

      // Synchroniser avec la base de données
      const syncedCart = await cartService.syncCart(userId, cartItems);
      await saveCartToStorage(syncedCart, userId);
      
      return { items: syncedCart, userId };
    } catch (error) {
      console.error('❌ [Cart] Error syncing cart:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Thunk pour incrémenter la quantité avec synchronisation DB
export const incrementQuantityWithSync = createAsyncThunk(
  'cart/incrementQuantityWithSync',
  async (productId, { getState, dispatch }) => {
    const state = getState();
    const userId = state.auth?.user?.id;
    
    // Mettre à jour localement
    dispatch(incrementQuantity(productId));
    
    // Synchroniser avec la DB si connecté
    if (userId) {
      try {
        const item = state.cart.items.find(item => item.product.id === productId);
        if (item) {
          await cartService.addOrUpdateCartItem(userId, productId, item.quantity + 1);
        }
      } catch (error) {
        console.warn('⚠️ Erreur lors de la synchronisation DB:', error);
      }
    }
  }
);

// Thunk pour décrémenter la quantité avec synchronisation DB
export const decrementQuantityWithSync = createAsyncThunk(
  'cart/decrementQuantityWithSync',
  async (productId, { getState, dispatch }) => {
    const state = getState();
    const userId = state.auth?.user?.id;
    const item = state.cart.items.find(item => item.product.id === productId);
    
    if (item && item.quantity > 1) {
      // Mettre à jour localement
      dispatch(decrementQuantity(productId));
      
      // Synchroniser avec la DB si connecté
      if (userId) {
        try {
          await cartService.addOrUpdateCartItem(userId, productId, item.quantity - 1);
        } catch (error) {
          console.warn('⚠️ Erreur lors de la synchronisation DB:', error);
        }
      }
    } else if (item && item.quantity === 1) {
      // Retirer du panier
      dispatch(removeFromCart(productId));
      
      // Synchroniser avec la DB si connecté
      if (userId) {
        try {
          await cartService.removeCartItem(userId, productId);
        } catch (error) {
          console.warn('⚠️ Erreur lors de la synchronisation DB:', error);
        }
      }
    }
  }
);

// Thunk pour toggle cart item avec synchronisation DB
export const toggleCartItemWithSync = createAsyncThunk(
  'cart/toggleCartItemWithSync',
  async ({ product, quantity = 1 }, { getState, dispatch }) => {
    const state = getState();
    const userId = state.auth?.user?.id;
    const isInCart = state.cart.items.some(item => item.product.id === product.id);
    
    // Mettre à jour localement
    dispatch(toggleCartItem({ product, quantity }));
    
    // Synchroniser avec la DB si connecté
    if (userId) {
      try {
        if (isInCart) {
          // Retirer de la DB
          await cartService.removeCartItem(userId, product.id);
        } else {
          // Ajouter à la DB
          await cartService.addOrUpdateCartItem(userId, product.id, quantity);
        }
      } catch (error) {
        console.warn('⚠️ Erreur lors de la synchronisation DB:', error);
      }
    }
  }
);

// Thunk pour mettre à jour la quantité avec synchronisation DB
export const updateCartItemQuantityWithSync = createAsyncThunk(
  'cart/updateCartItemQuantityWithSync',
  async ({ productId, quantity }, { getState, dispatch }) => {
    const state = getState();
    const userId = state.auth?.user?.id;
    
    // Mettre à jour localement immédiatement (optimistic update)
    // Utiliser le type d'action directement
    dispatch({ type: 'cart/updateCartItemQuantitySync', payload: { productId, quantity } });
    
    // Synchroniser avec la DB si connecté
    if (userId) {
      try {
        if (quantity <= 0) {
          await cartService.removeCartItem(userId, productId);
          console.log('✅ [Cart] Item supprimé de la DB (quantité 0):', productId);
        } else {
          await cartService.addOrUpdateCartItem(userId, productId, quantity);
          console.log('✅ [Cart] Quantité mise à jour dans la DB:', productId, quantity);
        }
      } catch (error) {
        console.warn('⚠️ Erreur lors de la synchronisation DB:', error);
        // En cas d'erreur, recharger le panier depuis la DB pour restaurer l'état
        try {
          await dispatch(loadCart());
        } catch (reloadError) {
          console.error('❌ [Cart] Erreur lors du rechargement du panier:', reloadError);
        }
      }
    }
    
    return { productId, quantity };
  }
);

// Thunk pour retirer du panier avec synchronisation DB
export const removeFromCartWithSync = createAsyncThunk(
  'cart/removeFromCartWithSync',
  async (productId, { getState, dispatch }) => {
    const state = getState();
    const userId = state.auth?.user?.id;
    
    // Mettre à jour localement immédiatement (optimistic update)
    // Utiliser le type d'action directement
    dispatch({ type: 'cart/removeFromCartSync', payload: productId });
    
    // Synchroniser avec la DB si connecté
    if (userId) {
      try {
        await cartService.removeCartItem(userId, productId);
        console.log('✅ [Cart] Item supprimé de la DB:', productId);
      } catch (error) {
        console.warn('⚠️ Erreur lors de la synchronisation DB:', error);
        // En cas d'erreur, recharger le panier depuis la DB pour restaurer l'état
        try {
          await dispatch(loadCart());
        } catch (reloadError) {
          console.error('❌ [Cart] Erreur lors du rechargement du panier:', reloadError);
        }
      }
    }
    
    return productId;
  }
);

// Thunk pour vider le panier avec synchronisation DB
export const clearCartWithSync = createAsyncThunk(
  'cart/clearCartWithSync',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const userId = state.auth?.user?.id;
    
    // Mettre à jour localement immédiatement (optimistic update)
    // Utiliser le type d'action directement
    dispatch({ type: 'cart/clearCartSync' });
    
    // Synchroniser avec la DB si connecté
    if (userId) {
      try {
        await cartService.clearUserCart(userId);
        console.log('✅ [Cart] Panier vidé dans la DB');
      } catch (error) {
        console.warn('⚠️ Erreur lors de la synchronisation DB:', error);
        // En cas d'erreur, recharger le panier depuis la DB pour restaurer l'état
        try {
          await dispatch(loadCart());
        } catch (reloadError) {
          console.error('❌ [Cart] Erreur lors du rechargement du panier:', reloadError);
        }
      }
    }
    
    return true;
  }
);

// Actions asynchrones
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product, quantity = 1 }, { getState }) => {
    const state = getState();
    const userId = state.auth?.user?.id;

    // Ajouter localement
    const result = { product, quantity };

    // Si connecté, synchroniser avec la DB
    if (userId) {
      try {
        await cartService.addOrUpdateCartItem(userId, product.id, quantity);
      } catch (error) {
        console.warn('⚠️ Erreur lors de la synchronisation avec la DB:', error);
        // Continuer même en cas d'erreur DB
      }
    }

    return result;
  }
);

// Action pour passer une commande
export const submitOrder = createAsyncThunk(
  'cart/submitOrder',
  async ({ 
    userId, 
    deliveryAddress, 
    phoneNumber, 
    notes = '', 
    paymentMethod = 'cash',
    estimatedDelivery 
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const cartItems = state.cart.items;
      
      if (cartItems.length === 0) {
        throw new Error('Le panier est vide');
      }

      // Préparer les items pour la commande
      const orderItems = cartItems.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        product_currency: item.product.currency || 'CDF',
        product_image: item.product.images?.[0] || item.product.image || null,
        farm_id: item.product.farm_id || item.product.farms?.id || null,
        farm_name: item.product.farms?.name || null,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity
      }));

      // Calculer les totaux pour chaque devise
      const totals = cartItems.reduce((acc, item) => {
        const currency = item.product.currency || 'CDF';
        const subtotal = item.product.price * item.quantity;
        
        if (!acc[currency]) {
          acc[currency] = 0;
        }
        acc[currency] += subtotal;
        
        return acc;
      }, {});

      // Générer un numéro de commande unique
      const orderNumber = `DM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const orderData = {
        user_id: userId,
        order_number: orderNumber,
        items: orderItems,
        delivery_address: deliveryAddress,
        phone_number: phoneNumber,
        notes,
        payment_method: paymentMethod,
        totals,
        estimated_delivery: estimatedDelivery
      };

      const result = await orderService.createOrder(orderData);
      
      // Vider le panier après commande réussie (local + DB)
      if (userId) {
        try {
          await cartService.clearUserCart(userId);
        } catch (error) {
          console.warn('⚠️ Erreur lors du vidage du panier DB:', error);
        }
      }
      await clearCartFromStorage(userId);
      
      return result;
    } catch (error) {
      console.error('❌ [Cart] Error creating order:', error);
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
    orderLoading: false,
    orderError: null,
    lastOrder: null,
    currentUserId: null, // ID de l'utilisateur actuel
  },
  reducers: {
    // Actions synchrones (la synchronisation DB se fait via les thunks)
    incrementQuantity: (state, action) => {
      const productId = action.payload;
      const item = state.items.find(item => item.product.id === productId);
      if (item) {
        item.quantity += 1;
        // Sauvegarder dans AsyncStorage (avec l'ID utilisateur)
        saveCartToStorage(state.items, state.currentUserId);
      }
    },
    
    decrementQuantity: (state, action) => {
      const productId = action.payload;
      const item = state.items.find(item => item.product.id === productId);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        saveCartToStorage(state.items, state.currentUserId);
      } else if (item && item.quantity === 1) {
        // Retirer l'article si la quantité devient 0
        state.items = state.items.filter(item => item.product.id !== productId);
        saveCartToStorage(state.items, state.currentUserId);
      }
    },
    
    toggleCartItem: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingIndex = state.items.findIndex(item => item.product.id === product.id);
      
      if (existingIndex >= 0) {
        // Retirer du panier
        state.items.splice(existingIndex, 1);
      } else {
        // Ajouter au panier
        state.items.push({
          product,
          quantity,
          addedAt: new Date().toISOString(),
        });
      }
      saveCartToStorage(state.items, state.currentUserId);
    },
    
    // Actions synchrones pour le panier
    removeFromCartSync: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.product.id !== productId);
      saveCartToStorage(state.items, state.currentUserId);
    },
    
    updateCartItemQuantitySync: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product.id === productId);
      
      if (item) {
        if (quantity <= 0) {
          // Retirer l'article si la quantité est 0 ou négative
          state.items = state.items.filter(item => item.product.id !== productId);
        } else {
          item.quantity = quantity;
        }
      }
      saveCartToStorage(state.items, state.currentUserId);
    },
    
    clearCartSync: (state) => {
      state.items = [];
      saveCartToStorage(state.items, state.currentUserId);
    },

    // Action pour changer d'utilisateur (vider le panier et charger le nouveau)
    switchUser: (state, action) => {
      const newUserId = action.payload;
      
      // Si changement d'utilisateur, vider le panier actuel
      if (state.currentUserId !== newUserId) {
        state.items = [];
        state.currentUserId = newUserId;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // loadCart
      .addCase(loadCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.currentUserId = action.payload.userId;
      })
      .addCase(loadCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // syncCartWithDB
      .addCase(syncCartWithDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncCartWithDB.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.currentUserId = action.payload.userId;
      })
      .addCase(syncCartWithDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // addToCart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        const { product, quantity } = action.payload;
        const existingIndex = state.items.findIndex(item => item.product.id === product.id);
        
        if (existingIndex >= 0) {
          // Augmenter la quantité si l'article existe déjà
          state.items[existingIndex].quantity += quantity;
        } else {
          // Ajouter un nouvel article
          state.items.push({
            product,
            quantity,
            addedAt: new Date().toISOString(),
          });
        }
        saveCartToStorage(state.items, state.currentUserId);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // submitOrder
      .addCase(submitOrder.pending, (state) => {
        state.orderLoading = true;
        state.orderError = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.lastOrder = action.payload;
        // Vider le panier après commande réussie
        state.items = [];
        saveCartToStorage(state.items, state.currentUserId);
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.orderLoading = false;
        state.orderError = action.payload;
      })
  },
});

// Sélecteurs
export const selectCartItems = (state) => state.cart.items;
export const selectCartItemsCount = (state) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

// Sélecteur pour les totaux par devise
export const selectCartTotals = (state) => {
  return state.cart.items.reduce((totals, item) => {
    const currency = item.product.currency || 'CDF';
    const subtotal = item.product.price * item.quantity;
    
    if (!totals[currency]) {
      totals[currency] = 0;
    }
    totals[currency] += subtotal;
    
    return totals;
  }, {});
};

// Sélecteur pour le total principal (CDF par défaut)
export const selectCartTotal = (state) => {
  const totals = selectCartTotals(state);
  return totals.CDF || totals.USD || 0;
};

// Sélecteur pour vérifier si un produit est dans le panier
export const selectIsInCart = (state, productId) => 
  state.cart.items.some(item => item.product.id === productId);

// Sélecteur pour la quantité d'un produit dans le panier
export const selectCartItemQuantity = (state, productId) => {
  const item = state.cart.items.find(item => item.product.id === productId);
  return item ? item.quantity : 0;
};

// Sélecteurs pour l'état de chargement et les erreurs
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

// Sélecteurs pour la commande
export const selectOrderLoading = (state) => state.cart.orderLoading;
export const selectOrderError = (state) => state.cart.orderError;
export const selectLastOrder = (state) => state.cart.lastOrder;

// Actions
export const { 
  incrementQuantity, 
  decrementQuantity, 
  toggleCartItem,
  removeFromCartSync,
  updateCartItemQuantitySync,
  clearCartSync,
  switchUser
} = cartSlice.actions;

// Actions synchrones pour le panier (exportées directement)
export { removeFromCartSync as removeFromCart };
export { updateCartItemQuantitySync as updateCartItemQuantity };
export { clearCartSync as clearCart };

export default cartSlice.reducer;
