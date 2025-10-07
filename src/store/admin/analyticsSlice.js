import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../backend/services/analyticsService';

// État initial pour les analytiques admin
const initialState = {
  // Données principales
  dashboard: null,
  revenue: null,
  orders: null,
  growth: null,
  
  // État de chargement
  loading: false,
  error: null,
  lastUpdated: null,
  
  // Filtres et paramètres
  filters: {
    period: 30, // jours
    topLimit: 10,
    refreshInterval: 300000 // 5 minutes
  }
};

// Actions asynchrones pour les analytiques
export const fetchDashboardAnalytics = createAsyncThunk(
  'adminAnalytics/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const data = await analyticsService.getDashboardStats();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRevenueAnalytics = createAsyncThunk(
  'adminAnalytics/fetchRevenue',
  async (periodDays, { rejectWithValue }) => {
    try {
      const data = await analyticsService.getRevenueAnalytics(periodDays);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrdersAnalytics = createAsyncThunk(
  'adminAnalytics/fetchOrders',
  async (periodDays, { rejectWithValue }) => {
    try {
      const data = await analyticsService.getOrdersAnalytics(periodDays);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const fetchGrowthMetrics = createAsyncThunk(
  'adminAnalytics/fetchGrowth',
  async (_, { rejectWithValue }) => {
    try {
      const data = await analyticsService.getGrowthMetrics();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllAnalytics = createAsyncThunk(
  'adminAnalytics/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await analyticsService.getAllAnalytics();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice Redux
const analyticsSlice = createSlice({
  name: 'adminAnalytics',
  initialState,
  reducers: {
    setPeriod: (state, action) => {
      state.filters.period = action.payload;
    },
    setTopLimit: (state, action) => {
      state.filters.topLimit = action.payload;
    },
    setRefreshInterval: (state, action) => {
      state.filters.refreshInterval = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearAllData: (state) => {
      state.dashboard = null;
      state.revenue = null;
      state.orders = null;
      state.topProducts = null;
      state.topFarms = null;
      state.activeUsers = null;
      state.growth = null;
      state.lastUpdated = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Analytics
      .addCase(fetchAllAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload.dashboard;
        state.revenue = action.payload.revenue;
        state.orders = action.payload.orders;
        state.growth = action.payload.growth;
        state.lastUpdated = action.payload.lastUpdated;
      })
      .addCase(fetchAllAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Dashboard
      .addCase(fetchDashboardAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Revenue
      .addCase(fetchRevenueAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.revenue = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchRevenueAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Orders
      .addCase(fetchOrdersAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchOrdersAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Growth Metrics
      .addCase(fetchGrowthMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGrowthMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.growth = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchGrowthMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export des actions
export const {
  setPeriod,
  setTopLimit,
  setRefreshInterval,
  clearError,
  clearAllData
} = analyticsSlice.actions;

// Selectors
export const selectAnalyticsLoading = (state) => state.admin.analytics.loading;
export const selectAnalyticsError = (state) => state.admin.analytics.error;
export const selectAnalyticsLastUpdated = (state) => state.admin.analytics.lastUpdated;
export const selectAnalyticsFilters = (state) => state.admin.analytics.filters;

export const selectDashboardStats = (state) => state.admin.analytics.dashboard;
export const selectRevenueAnalytics = (state) => state.admin.analytics.revenue;
export const selectOrdersAnalytics = (state) => state.admin.analytics.orders;
export const selectGrowthMetrics = (state) => state.admin.analytics.growth;

// Selectors composés
export const selectAllAnalytics = (state) => ({
  dashboard: state.admin.analytics.dashboard,
  revenue: state.admin.analytics.revenue,
  orders: state.admin.analytics.orders,
  growth: state.admin.analytics.growth,
  loading: state.admin.analytics.loading,
  error: state.admin.analytics.error,
  lastUpdated: state.admin.analytics.lastUpdated
});

export default analyticsSlice.reducer;
