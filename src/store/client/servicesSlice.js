import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serviceService } from '../../backend';

const initialState = {
  services: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchServices = createAsyncThunk(
  'clientServices/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      const services = await serviceService.getServices();
      return services;
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
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { } = clientServicesSlice.actions;

// Selectors avec valeurs par défaut
export const selectClientServices = (state) => state.client?.services?.services || [];
export const selectClientServicesLoading = (state) => state.client?.services?.loading || false;
export const selectClientServicesError = (state) => state.client?.services?.error || null;

export default clientServicesSlice.reducer;
