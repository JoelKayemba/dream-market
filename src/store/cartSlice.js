import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Actions asynchrones
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product, quantity = 1 }) => {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 100));
    return { product, quantity };
  }
);


const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Actions synchrones
    incrementQuantity: (state, action) => {
      const productId = action.payload;
      const item = state.items.find(item => item.product.id === productId);
      if (item) {
        item.quantity += 1;
      }
    },
    
    decrementQuantity: (state, action) => {
      const productId = action.payload;
      const item = state.items.find(item => item.product.id === productId);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      } else if (item && item.quantity === 1) {
        // Retirer l'article si la quantité devient 0
        state.items = state.items.filter(item => item.product.id !== productId);
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
    },
    
    // Actions synchrones pour le panier
    removeFromCartSync: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.product.id !== productId);
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
    },
    
    clearCartSync: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
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
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
  },
});

// Sélecteurs
export const selectCartItems = (state) => state.cart.items;
export const selectCartItemsCount = (state) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotal = (state) => 
  state.cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
export const selectIsInCart = (state, productId) => 
  state.cart.items.some(item => item.product.id === productId);
export const selectCartItemQuantity = (state, productId) => {
  const item = state.cart.items.find(item => item.product.id === productId);
  return item ? item.quantity : 0;
};
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

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
