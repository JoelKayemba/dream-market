import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { farmService } from '../../backend';

const initialState = {
  farms: [],
  categories: [],
  popularFarms: [],
  newFarms: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchFarms = createAsyncThunk(
  'clientFarms/fetchFarms',
  async (_, { rejectWithValue }) => {
    try {
      const farms = await farmService.getFarms();
      return farms;
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
      .addCase(fetchFarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarms.fulfilled, (state, action) => {
        state.loading = false;
        state.farms = action.payload;
      })
      .addCase(fetchFarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Categories
      .addCase(fetchFarmCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarmCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchFarmCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Popular Farms
      .addCase(fetchPopularFarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularFarms.fulfilled, (state, action) => {
        state.loading = false;
        state.popularFarms = action.payload;
      })
      .addCase(fetchPopularFarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch New Farms
      .addCase(fetchNewFarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewFarms.fulfilled, (state, action) => {
        state.loading = false;
        state.newFarms = action.payload;
      })
      .addCase(fetchNewFarms.rejected, (state, action) => {
        state.loading = false;
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
export const selectClientFarmsLoading = (state) => state.client?.farms?.loading || false;
export const selectClientFarmsError = (state) => state.client?.farms?.error || null;

export default clientFarmsSlice.reducer;
