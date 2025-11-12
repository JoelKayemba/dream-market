import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { orderService } from '../backend';

// Clé pour AsyncStorage
const CART_STORAGE_KEY = '@dream_market_cart';

// Fonctions de persistance
const saveCartToStorage = async (cartItems) => {
  try {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du panier:', error);
  }
};

const loadCartFromStorage = async () => {
  try {
    const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Erreur lors du chargement du panier:', error);
    return [];
  }
};

// Action pour charger le panier depuis le stockage
export const loadCart = createAsyncThunk(
  'cart/loadCart',
  async () => {
    const cartItems = await loadCartFromStorage();
    return cartItems;
  }
);

// Actions asynchrones
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product, quantity = 1 }) => {
    // Pas de simulation d'appel API - action synchrone pour le panier local
    return { product, quantity };
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
  },
  reducers: {
    // Actions synchrones
    incrementQuantity: (state, action) => {
      const productId = action.payload;
      const item = state.items.find(item => item.product.id === productId);
      if (item) {
        item.quantity += 1;
        // Sauvegarder dans AsyncStorage
        saveCartToStorage(state.items);
      }
    },
    
    decrementQuantity: (state, action) => {
      const productId = action.payload;
      const item = state.items.find(item => item.product.id === productId);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        // Sauvegarder dans AsyncStorage
        saveCartToStorage(state.items);
      } else if (item && item.quantity === 1) {
        // Retirer l'article si la quantité devient 0
        state.items = state.items.filter(item => item.product.id !== productId);
        // Sauvegarder dans AsyncStorage
        saveCartToStorage(state.items);
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
      // Sauvegarder dans AsyncStorage
      saveCartToStorage(state.items);
    },
    
    // Actions synchrones pour le panier
    removeFromCartSync: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.product.id !== productId);
      // Sauvegarder dans AsyncStorage
      saveCartToStorage(state.items);
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
      // Sauvegarder dans AsyncStorage
      saveCartToStorage(state.items);
    },
    
    clearCartSync: (state) => {
      state.items = [];
      // Sauvegarder dans AsyncStorage
      saveCartToStorage(state.items);
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
        state.items = action.payload;
      })
      .addCase(loadCart.rejected, (state, action) => {
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
        // Sauvegarder dans AsyncStorage
        saveCartToStorage(state.items);
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
  clearCartSync
} = cartSlice.actions;

// Actions synchrones pour le panier (exportées directement)
export { removeFromCartSync as removeFromCart };
export { updateCartItemQuantitySync as updateCartItemQuantity };
export { clearCartSync as clearCart };

export default cartSlice.reducer;
