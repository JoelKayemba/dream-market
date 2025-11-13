import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serviceService } from '../../backend';

const initialState = {
  services: [],
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
export const fetchServices = createAsyncThunk(
  'clientServices/fetchServices',
  async (options = {}, { rejectWithValue }) => {
    try {
      const { page = 0, limit = 20, refresh = false, categoryId = null, search = null } = options;
      const offset = page * limit;

      const result = await serviceService.getServices({
        limit,
        offset,
        categoryId,
        search,
        isActive: true
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

const clientServicesSlice = createSlice({
  name: 'clientServices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Services
      .addCase(fetchServices.pending, (state, action) => {
        const { refresh = false } = action.meta.arg || {};
        if (refresh || !state.hasInitialized) {
          state.initialLoading = true;
          state.loadingMore = false;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        const { items, total, hasMore, page, refresh } = action.payload;
        state.initialLoading = false;
        state.loadingMore = false;
        
        if (refresh || page === 0) {
          state.services = items;
        } else {
          state.services = [...state.services, ...items];
        }
        
        state.pagination = {
          page,
          limit: 20,
          total,
          hasMore
        };
        state.hasInitialized = true;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.initialLoading = false;
        state.loadingMore = false;
        state.error = action.payload;
      });
  },
});

export const { } = clientServicesSlice.actions;

// Selectors avec valeurs par défaut
export const selectClientServices = (state) => state.client?.services?.services || [];
export const selectClientServicesLoading = (state) => state.client?.services?.initialLoading || false;
export const selectClientServicesLoadingMore = (state) => state.client?.services?.loadingMore || false;
export const selectClientServicesError = (state) => state.client?.services?.error || null;
export const selectClientServicesPagination = (state) => state.client?.services?.pagination || { page: 0, limit: 20, total: 0, hasMore: true };

export default clientServicesSlice.reducer;

