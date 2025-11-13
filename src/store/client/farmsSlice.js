import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { farmService } from '../../backend';

const initialState = {
  farms: [],
  categories: [],
  popularFarms: [],
  newFarms: [],
  loading: false,
  loadingMore: false,
  initialLoading: false,
  error: null,
  hasInitialized: false,
  pagination: {
    page: 0,
    limit: 20,
    total: 0,
    hasMore: true
  }
};

// Async Thunks
export const fetchFarms = createAsyncThunk(
  'clientFarms/fetchFarms',
  async (options = {}, { rejectWithValue }) => {
    try {
      const { page = 0, limit = 20, refresh = false, search = null, verified = null, region = null } = options;
      const offset = page * limit;

      const result = await farmService.getFarms({
        limit,
        offset,
        search,
        verified,
        region
      });

      return {
        items: result.data,
        total: result.total,
        hasMore: result.hasMore,
        page,
        refresh
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFarmCategories = createAsyncThunk(
  'clientFarms/fetchFarmCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await farmService.getFarmCategories();
      return categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPopularFarms = createAsyncThunk(
  'clientFarms/fetchPopularFarms',
  async (_, { rejectWithValue }) => {
    try {
      const farms = await farmService.getPopularFarms();
      return farms;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNewFarms = createAsyncThunk(
  'clientFarms/fetchNewFarms',
  async (_, { rejectWithValue }) => {
    try {
      const farms = await farmService.getNewFarms();
      return farms;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const clientFarmsSlice = createSlice({
  name: 'clientFarms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Farms
      .addCase(fetchFarms.pending, (state, action) => {
        const { refresh = false } = action.meta.arg || {};
        if (refresh || !state.hasInitialized) {
          state.initialLoading = true;
          state.loadingMore = false;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchFarms.fulfilled, (state, action) => {
        const { items, total, hasMore, page, refresh } = action.payload;
        state.initialLoading = false;
        state.loadingMore = false;
        
        if (refresh || page === 0) {
          // Dédupliquer par ID pour éviter les doublons
          const uniqueFarms = items.filter((farm, index, self) => 
            index === self.findIndex(f => f.id === farm.id)
          );
          state.farms = uniqueFarms;
          console.log(`✅ [farmsSlice] Loaded ${uniqueFarms.length} unique farms (from ${items.length} items)`);
        } else {
          // Ajouter seulement les nouvelles fermes (pas de doublons)
          const existingIds = new Set(state.farms.map(f => f.id));
          const newFarms = items.filter(farm => !existingIds.has(farm.id));
          state.farms = [...state.farms, ...newFarms];
          console.log(`✅ [farmsSlice] Added ${newFarms.length} new farms (from ${items.length} items)`);
        }
        
        state.pagination = {
          page,
          limit: 20,
          total,
          hasMore
        };
        state.hasInitialized = true;
      })
      .addCase(fetchFarms.rejected, (state, action) => {
        state.initialLoading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })
      // Fetch Categories
      .addCase(fetchFarmCategories.pending, (state) => {
        // Pas de loading pour les catégories (chargement silencieux)
        state.error = null;
      })
      .addCase(fetchFarmCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchFarmCategories.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch Popular Farms
      .addCase(fetchPopularFarms.pending, (state) => {
        // Pas de loading pour les fermes populaires (chargement silencieux)
        state.error = null;
      })
      .addCase(fetchPopularFarms.fulfilled, (state, action) => {
        state.popularFarms = action.payload;
      })
      .addCase(fetchPopularFarms.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch New Farms
      .addCase(fetchNewFarms.pending, (state) => {
        // Pas de loading pour les nouvelles fermes (chargement silencieux)
        state.error = null;
      })
      .addCase(fetchNewFarms.fulfilled, (state, action) => {
        state.newFarms = action.payload;
      })
      .addCase(fetchNewFarms.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { } = clientFarmsSlice.actions;

// Selectors avec valeurs par défaut
export const selectClientFarms = (state) => state.client?.farms?.farms || [];
export const selectClientFarmCategories = (state) => state.client?.farms?.categories || [];
export const selectPopularFarms = (state) => state.client?.farms?.popularFarms || [];
export const selectNewFarms = (state) => state.client?.farms?.newFarms || [];
export const selectClientFarmsLoading = (state) => state.client?.farms?.initialLoading || false;
export const selectClientFarmsLoadingMore = (state) => state.client?.farms?.loadingMore || false;
export const selectClientFarmsError = (state) => state.client?.farms?.error || null;
export const selectClientFarmsPagination = (state) => state.client?.farms?.pagination || { page: 0, limit: 20, total: 0, hasMore: true };

export default clientFarmsSlice.reducer;

