import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Statistiques générales
  stats: {
    totalUsers: 0,
    totalProducts: 0,
    totalFarms: 0,
    totalServices: 0,
    totalOrders: 0,
    totalRevenue: 0,
    loading: false,
    error: null
  },

  // Gestion des produits
  products: {
    list: [],
    loading: false,
    error: null,
    filters: {
      category: '',
      farm: '',
      search: ''
    }
  },

  // Gestion des fermes
  farms: {
    list: [],
    loading: false,
    error: null,
    pendingVerification: [],
    filters: {
      status: '',
      location: '',
      search: ''
    }
  },

  // Gestion des services
  services: {
    list: [],
    loading: false,
    error: null,
    filters: {
      category: '',
      search: ''
    }
  },

  // Gestion des utilisateurs
  users: {
    list: [],
    loading: false,
    error: null,
    filters: {
      role: '',
      status: '',
      search: ''
    }
  },

  // Gestion des commandes
  orders: {
    list: [],
    loading: false,
    error: null,
    filters: {
      status: '',
      dateRange: '',
      search: ''
    }
  },

  // Analytics
  analytics: {
    sales: {
      daily: [],
      weekly: [],
      monthly: [],
      loading: false
    },
    users: {
      registrations: [],
      activity: [],
      loading: false
    },
    products: {
      topSelling: [],
      categories: [],
      loading: false
    }
  },

  // Paramètres admin
  settings: {
    app: {
      maintenanceMode: false,
      registrationEnabled: true,
      farmVerificationRequired: true
    },
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  }
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Actions pour les statistiques
    setStatsLoading: (state, action) => {
      state.stats.loading = action.payload;
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload, loading: false };
    },
    setStatsError: (state, action) => {
      state.stats.error = action.payload;
      state.stats.loading = false;
    },

    // Actions pour les produits
    setProductsLoading: (state, action) => {
      state.products.loading = action.payload;
    },
    setProducts: (state, action) => {
      state.products.list = action.payload;
      state.products.loading = false;
    },
    addProduct: (state, action) => {
      state.products.list.push(action.payload);
    },
    updateProduct: (state, action) => {
      const index = state.products.list.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products.list[index] = action.payload;
      }
    },
    deleteProduct: (state, action) => {
      state.products.list = state.products.list.filter(p => p.id !== action.payload);
    },
    setProductFilters: (state, action) => {
      state.products.filters = { ...state.products.filters, ...action.payload };
    },

    // Actions pour les fermes
    setFarmsLoading: (state, action) => {
      state.farms.loading = action.payload;
    },
    setFarms: (state, action) => {
      state.farms.list = action.payload;
      state.farms.loading = false;
    },
    addFarm: (state, action) => {
      state.farms.list.push(action.payload);
    },
    updateFarm: (state, action) => {
      const index = state.farms.list.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.farms.list[index] = action.payload;
      }
    },
    deleteFarm: (state, action) => {
      state.farms.list = state.farms.list.filter(f => f.id !== action.payload);
    },
    setFarmFilters: (state, action) => {
      state.farms.filters = { ...state.farms.filters, ...action.payload };
    },
    setPendingVerification: (state, action) => {
      state.farms.pendingVerification = action.payload;
    },
    verifyFarm: (state, action) => {
      const farmId = action.payload;
      state.farms.pendingVerification = state.farms.pendingVerification.filter(f => f.id !== farmId);
      const farm = state.farms.list.find(f => f.id === farmId);
      if (farm) {
        farm.verified = true;
      }
    },

    // Actions pour les services
    setServicesLoading: (state, action) => {
      state.services.loading = action.payload;
    },
    setServices: (state, action) => {
      state.services.list = action.payload;
      state.services.loading = false;
    },
    addService: (state, action) => {
      state.services.list.push(action.payload);
    },
    updateService: (state, action) => {
      const index = state.services.list.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.services.list[index] = action.payload;
      }
    },
    deleteService: (state, action) => {
      state.services.list = state.services.list.filter(s => s.id !== action.payload);
    },
    setServiceFilters: (state, action) => {
      state.services.filters = { ...state.services.filters, ...action.payload };
    },

    // Actions pour les utilisateurs
    setUsersLoading: (state, action) => {
      state.users.loading = action.payload;
    },
    setUsers: (state, action) => {
      state.users.list = action.payload;
      state.users.loading = false;
    },
    updateUser: (state, action) => {
      const index = state.users.list.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users.list[index] = action.payload;
      }
    },
    deleteUser: (state, action) => {
      state.users.list = state.users.list.filter(u => u.id !== action.payload);
    },
    setUserFilters: (state, action) => {
      state.users.filters = { ...state.users.filters, ...action.payload };
    },

    // Actions pour les commandes
    setOrdersLoading: (state, action) => {
      state.orders.loading = action.payload;
    },
    setOrders: (state, action) => {
      state.orders.list = action.payload;
      state.orders.loading = false;
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.list.find(o => o.id === orderId);
      if (order) {
        order.status = status;
      }
    },
    setOrderFilters: (state, action) => {
      state.orders.filters = { ...state.orders.filters, ...action.payload };
    },

    // Actions pour les analytics
    setSalesAnalytics: (state, action) => {
      state.analytics.sales = { ...state.analytics.sales, ...action.payload };
    },
    setUserAnalytics: (state, action) => {
      state.analytics.users = { ...state.analytics.users, ...action.payload };
    },
    setProductAnalytics: (state, action) => {
      state.analytics.products = { ...state.analytics.products, ...action.payload };
    },

    // Actions pour les paramètres
    updateAppSettings: (state, action) => {
      state.settings.app = { ...state.settings.app, ...action.payload };
    },
    updateNotificationSettings: (state, action) => {
      state.settings.notifications = { ...state.settings.notifications, ...action.payload };
    },

    // Action pour réinitialiser l'état
    resetAdminState: () => initialState
  }
});

export const {
  // Stats
  setStatsLoading,
  setStats,
  setStatsError,

  // Products
  setProductsLoading,
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setProductFilters,

  // Farms
  setFarmsLoading,
  setFarms,
  addFarm,
  updateFarm,
  deleteFarm,
  setFarmFilters,
  setPendingVerification,
  verifyFarm,

  // Services
  setServicesLoading,
  setServices,
  addService,
  updateService,
  deleteService,
  setServiceFilters,

  // Users
  setUsersLoading,
  setUsers,
  updateUser,
  deleteUser,
  setUserFilters,

  // Orders
  setOrdersLoading,
  setOrders,
  updateOrderStatus,
  setOrderFilters,

  // Analytics
  setSalesAnalytics,
  setUserAnalytics,
  setProductAnalytics,

  // Settings
  updateAppSettings,
  updateNotificationSettings,

  // Reset
  resetAdminState
} = adminSlice.actions;

export default adminSlice.reducer;
