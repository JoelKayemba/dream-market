import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { farmerStatsService } from '../../backend/services/farmerStatsService';
import { farmerProductService } from '../../backend/services/farmerProductService';
import { farmerProposalService } from '../../backend/services/farmerProposalService';

export const fetchFarmerDashboard = createAsyncThunk(
  'farmer/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await farmerStatsService.getDashboardStats();
      const profile = await farmerStatsService.getMyFarmProfile();
      return { stats, profile };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState }) => !getState().farmer?.dashboardFetching,
  }
);

export const fetchFarmerProducts = createAsyncThunk(
  'farmer/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      return await farmerStatsService.getProducts();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState }) => !getState().farmer?.productsFetching,
  }
);

export const fetchFarmerSales = createAsyncThunk(
  'farmer/fetchSales',
  async (_, { rejectWithValue }) => {
    try {
      return await farmerStatsService.getSales();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState }) => !getState().farmer?.salesFetching,
  }
);

export const updateFarmerProductStock = createAsyncThunk(
  'farmer/updateProductStock',
  async ({ productId, stock, isActive }, { rejectWithValue }) => {
    try {
      const product = await farmerProductService.updateStock(productId, stock, isActive);
      return product;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveFarmerProposal = createAsyncThunk(
  'farmer/saveProposal',
  async (payload, { rejectWithValue }) => {
    try {
      const result = await farmerProposalService.upsertProposal(payload);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitFarmerProposal = createAsyncThunk(
  'farmer/submitProposal',
  async (productId, { rejectWithValue }) => {
    try {
      return await farmerProposalService.submitProposal(productId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  stats: null,
  farmProfile: null,
  products: [],
  sales: [],
  loading: false,
  productsLoading: false,
  salesLoading: false,
  dashboardFetching: false,
  productsFetching: false,
  salesFetching: false,
  updatingProductId: null,
  savingProposal: false,
  submittingProposalId: null,
  error: null,
};

const farmerSlice = createSlice({
  name: 'farmer',
  initialState,
  reducers: {
    clearFarmerState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFarmerDashboard.pending, (state) => {
        state.dashboardFetching = true;
        if (!state.stats) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchFarmerDashboard.fulfilled, (state, action) => {
        state.dashboardFetching = false;
        state.loading = false;
        state.stats = action.payload.stats;
        state.farmProfile = action.payload.profile;
      })
      .addCase(fetchFarmerDashboard.rejected, (state, action) => {
        state.dashboardFetching = false;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFarmerProducts.pending, (state) => {
        state.productsFetching = true;
        if (state.products.length === 0) {
          state.productsLoading = true;
        }
      })
      .addCase(fetchFarmerProducts.fulfilled, (state, action) => {
        state.productsFetching = false;
        state.productsLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchFarmerProducts.rejected, (state, action) => {
        state.productsFetching = false;
        state.productsLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchFarmerSales.pending, (state) => {
        state.salesFetching = true;
        if (state.sales.length === 0) {
          state.salesLoading = true;
        }
      })
      .addCase(fetchFarmerSales.fulfilled, (state, action) => {
        state.salesFetching = false;
        state.salesLoading = false;
        state.sales = action.payload;
      })
      .addCase(fetchFarmerSales.rejected, (state, action) => {
        state.salesFetching = false;
        state.salesLoading = false;
        state.error = action.payload;
      })
      .addCase(updateFarmerProductStock.pending, (state, action) => {
        state.updatingProductId = action.meta.arg.productId;
        state.error = null;
      })
      .addCase(updateFarmerProductStock.fulfilled, (state, action) => {
        state.updatingProductId = null;
        const updated = action.payload;
        if (updated?.id) {
          state.products = state.products.map((p) =>
            p.id === updated.id ? { ...p, ...updated } : p
          );
        }
      })
      .addCase(updateFarmerProductStock.rejected, (state, action) => {
        state.updatingProductId = null;
        state.error = action.payload;
      })
      .addCase(saveFarmerProposal.pending, (state) => {
        state.savingProposal = true;
        state.error = null;
      })
      .addCase(saveFarmerProposal.fulfilled, (state, action) => {
        state.savingProposal = false;
        const saved = action.payload?.product || action.payload;
        if (saved?.id) {
          const idx = state.products.findIndex((p) => p.id === saved.id);
          if (idx >= 0) state.products[idx] = { ...state.products[idx], ...saved };
          else state.products.push(saved);
        }
      })
      .addCase(saveFarmerProposal.rejected, (state, action) => {
        state.savingProposal = false;
        state.error = action.payload;
      })
      .addCase(submitFarmerProposal.pending, (state, action) => {
        state.submittingProposalId = action.meta.arg;
        state.error = null;
      })
      .addCase(submitFarmerProposal.fulfilled, (state, action) => {
        state.submittingProposalId = null;
        const updated = action.payload;
        if (updated?.id) {
          state.products = state.products.map((p) =>
            p.id === updated.id ? { ...p, ...updated } : p
          );
        }
      })
      .addCase(submitFarmerProposal.rejected, (state, action) => {
        state.submittingProposalId = null;
        state.error = action.payload;
      });
  },
});

export const { clearFarmerState } = farmerSlice.actions;

export const selectFarmerStats = (state) => state.farmer?.stats;
export const selectFarmerFarmProfile = (state) => state.farmer?.farmProfile;
export const selectFarmerProducts = (state) => state.farmer?.products || [];
export const selectFarmerSales = (state) => state.farmer?.sales || [];
export const selectFarmerLoading = (state) => state.farmer?.loading;
export const selectFarmerProductsLoading = (state) => state.farmer?.productsLoading;
export const selectFarmerUpdatingProductId = (state) => state.farmer?.updatingProductId;
export const selectFarmerSavingProposal = (state) => state.farmer?.savingProposal;
export const selectFarmerSubmittingProposalId = (state) => state.farmer?.submittingProposalId;
export const selectFarmerSalesLoading = (state) => state.farmer?.salesLoading;
export const selectFarmerError = (state) => state.farmer?.error;

export default farmerSlice.reducer;
