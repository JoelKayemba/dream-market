import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Array d'objets { id, type, data }
  loading: false,
  error: null
};

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
    }
  }
});

export const {
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  clearFavorites,
  setLoading,
  setError
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




