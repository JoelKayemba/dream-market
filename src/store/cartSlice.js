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

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId) => {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 100));
    return productId;
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ productId, quantity }) => {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 100));
    return { productId, quantity };
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async () => {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
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
      
      // removeFromCart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        const productId = action.payload;
        state.items = state.items.filter(item => item.product.id !== productId);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // updateCartItemQuantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
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
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // clearCart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
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
  toggleCartItem 
} = cartSlice.actions;

export default cartSlice.reducer;
