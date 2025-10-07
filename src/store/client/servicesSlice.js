import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serviceService } from '../../backend';

const initialState = {
  services: [],
  loading: false,
  initialLoading: false, // Nouveau: loading pour le premier chargement
  error: null,
  hasInitialized: false, // Nouveau: flag pour savoir si les données ont été chargées
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
        // Loading seulement si pas encore initialisé
        if (!state.hasInitialized) {
          state.initialLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.initialLoading = false;
        state.services = action.payload;
        state.hasInitialized = true;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.initialLoading = false;
        state.error = action.payload;
      });
  },
});

export const { } = clientServicesSlice.actions;

// Selectors avec valeurs par défaut
export const selectClientServices = (state) => state.client?.services?.services || [];
export const selectClientServicesLoading = (state) => state.client?.services?.initialLoading || false;
export const selectClientServicesError = (state) => state.client?.services?.error || null;

export default clientServicesSlice.reducer;

