import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { favoriteService } from '../backend/services/favoriteService';
import { FAVORITE_TYPES } from '../backend/config/supabase';

const initialState = {
  items: [], // Array d'objets { id, type, data }
  loading: false,
  error: null
};

// Async Thunks pour intégrer le service backend
export const fetchUserFavorites = createAsyncThunk(
  'favorites/fetchUserFavorites',
  async (userId, { rejectWithValue }) => {
    try {
      const favorites = await favoriteService.getUserFavoritesWithDetails(userId);
      return favorites;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleFavoriteBackend = createAsyncThunk(
  'favorites/toggleFavoriteBackend',
  async ({ userId, itemType, itemId }, { rejectWithValue }) => {
    try {
      console.log('🔄 [Redux] toggleFavoriteBackend called:', { userId, itemType, itemId });
      const isFavorite = await favoriteService.toggleFavorite(userId, itemType, itemId);
      console.log('✅ [Redux] toggleFavoriteBackend success:', { itemType, itemId, isFavorite });
      return { itemType, itemId, isFavorite };
    } catch (error) {
      console.error('❌ [Redux] toggleFavoriteBackend error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const addToFavoritesBackend = createAsyncThunk(
  'favorites/addToFavoritesBackend',
  async ({ userId, itemType, itemId }, { rejectWithValue }) => {
    try {
      console.log('🔄 [Redux] addToFavoritesBackend called:', { userId, itemType, itemId });
      await favoriteService.addToFavorites(userId, itemType, itemId);
      console.log('✅ [Redux] addToFavoritesBackend success:', { itemType, itemId });
      return { itemType, itemId };
    } catch (error) {
      console.error('❌ [Redux] addToFavoritesBackend error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromFavoritesBackend = createAsyncThunk(
  'favorites/removeFromFavoritesBackend',
  async ({ userId, itemType, itemId }, { rejectWithValue }) => {
    try {
      console.log('🔄 [Redux] removeFromFavoritesBackend called:', { userId, itemType, itemId });
      await favoriteService.removeFromFavorites(userId, itemType, itemId);
      console.log('✅ [Redux] removeFromFavoritesBackend success:', { itemType, itemId });
      return { itemType, itemId };
    } catch (error) {
      console.error('❌ [Redux] removeFromFavoritesBackend error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addToFavorites: (state, action) => {
      const { id, type, data } = action.payload;
      const existingItem = state.items.find(item => item.id === id && item.type === type);
      
      if (!existingItem) {
        state.items.push({ id, type, data });
      }
    },
    
    removeFromFavorites: (state, action) => {
      const { id, type } = action.payload;
      state.items = state.items.filter(item => !(item.id === id && item.type === type));
    },
    
    toggleFavorite: (state, action) => {
      const { id, type, data } = action.payload;
      const existingItem = state.items.find(item => item.id === id && item.type === type);
      
      if (existingItem) {
        state.items = state.items.filter(item => !(item.id === id && item.type === type));
      } else {
        state.items.push({ id, type, data });
      }
    },
    
    clearFavorites: (state) => {
      state.items = [];
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Favorites
      .addCase(fetchUserFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFavorites.fulfilled, (state, action) => {
        state.loading = false;
        // Transformer les données du backend vers le format local
        state.items = action.payload.map(fav => ({
          id: fav.item_id,
          type: fav.item_type,
          data: fav.details
        }));
      })
      .addCase(fetchUserFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Toggle Favorite Backend
      .addCase(toggleFavoriteBackend.fulfilled, (state, action) => {
        const { itemType, itemId, isFavorite } = action.payload;
        console.log('✅ [Redux] toggleFavoriteBackend.fulfilled:', { itemType, itemId, isFavorite });
        
        // Avec l'optimistic update, on ne modifie plus l'état ici
        // L'état a déjà été mis à jour par les actions locales
        // On garde juste le log pour le debugging
      })
      .addCase(toggleFavoriteBackend.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Add to Favorites Backend
      .addCase(addToFavoritesBackend.fulfilled, (state, action) => {
        console.log('✅ [Redux] addToFavoritesBackend.fulfilled:', action.payload);
        // Avec l'optimistic update, on ne modifie plus l'état ici
      })
      .addCase(addToFavoritesBackend.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Remove from Favorites Backend
      .addCase(removeFromFavoritesBackend.fulfilled, (state, action) => {
        console.log('✅ [Redux] removeFromFavoritesBackend.fulfilled:', action.payload);
        // Avec l'optimistic update, on ne modifie plus l'état ici
      })
      .addCase(removeFromFavoritesBackend.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const {
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  clearFavorites,
  setLoading,
  setError,
  clearError
} = favoritesSlice.actions;

// Selectors
export const selectFavorites = (state) => state.favorites.items;
export const selectFavoritesLoading = (state) => state.favorites.loading;
export const selectFavoritesError = (state) => state.favorites.error;

// Selector pour vérifier si un item est en favori
export const selectIsFavorite = (id, type) => (state) => {
  return state.favorites.items.some(item => item.id === id && item.type === type);
};

// Selectors par type
export const selectFavoriteProducts = (state) => {
  return state.favorites.items
    .filter(item => item.type === 'product')
    .map(item => item.data);
};

export const selectFavoriteFarms = (state) => {
  return state.favorites.items
    .filter(item => item.type === 'farm')
    .map(item => item.data);
};

export const selectFavoriteServices = (state) => {
  return state.favorites.items
    .filter(item => item.type === 'service')
    .map(item => item.data);
};

export default favoritesSlice.reducer;




