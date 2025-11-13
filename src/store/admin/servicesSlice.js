import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serviceService, categoryService } from '../../backend';

// État initial pour les services admin
const initialState = {
  services: [],
  loading: false,
  loadingMore: false,
  error: null,
  lastUpdated: null,
  // Filtres et recherche
  filters: {
    category: 'all',
    status: 'all', // all, active, inactive
    search: '',
    sortBy: 'name', // name, price, date, rating
    sortOrder: 'asc' // asc, desc
  },
  // Pagination
  pagination: {
    page: 0,
    limit: 20,
    total: 0,
    hasMore: true
  },
  // État de l'édition
  editingService: null,
  isEditing: false,
  // Catégories disponibles
  categories: []
};

// Actions asynchrones pour les services
export const fetchServices = createAsyncThunk(
  'adminServices/fetchServices',
  async (options = {}, { rejectWithValue, getState }) => {
    try {
      const { page = 0, limit = 20, refresh = false } = options;
      const state = getState();
      const filters = state.admin?.services?.filters || {};
      
      const result = await serviceService.getServices({
        limit,
        offset: page * limit,
        categoryId: filters.category !== 'all' ? filters.category : null,
        search: filters.search || null,
        isActive: filters.status === 'all' ? null : filters.status === 'active'
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

// Action pour récupérer les catégories de services
export const fetchCategories = createAsyncThunk(
  'adminServices/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categoryService.getCategoriesByType('service');
      return categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour ajouter un service
export const addService = createAsyncThunk(
  'adminServices/addService',
  async (serviceData, { rejectWithValue }) => {
    try {
      const newService = await serviceService.addService(serviceData);
      return newService;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour mettre à jour un service
export const updateService = createAsyncThunk(
  'adminServices/updateService',
  async ({ id, serviceData }, { rejectWithValue }) => {
    try {
      const updatedService = await serviceService.updateService(id, serviceData);
      return updatedService;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour supprimer un service
export const deleteService = createAsyncThunk(
  'adminServices/deleteService',
  async (serviceId, { rejectWithValue }) => {
    try {
      await serviceService.deleteService(serviceId);
      return serviceId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour basculer le statut d'un service
export const toggleServiceStatus = createAsyncThunk(
  'adminServices/toggleServiceStatus',
  async ({ serviceId, isActive }, { rejectWithValue, getState }) => {
    try {
      // Si isActive n'est pas fourni, on le récupère depuis le state
      if (isActive === undefined) {
        const state = getState();
        const service = state.admin.services.services.find(s => s.id === serviceId);
        isActive = !service?.is_active;
      }
      
      const updatedService = await serviceService.toggleServiceStatus(serviceId, isActive);
      return updatedService;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice Redux
const servicesSlice = createSlice({
  name: 'adminServices',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.filters.search = action.payload;
    },
    setCategoryFilter: (state, action) => {
      state.filters.category = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.filters.sortOrder = action.payload;
    },
    setEditingService: (state, action) => {
      state.editingService = action.payload;
      state.isEditing = !!action.payload;
    },
    clearEditingService: (state) => {
      state.editingService = null;
      state.isEditing = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.filters = {
        category: 'all',
        status: 'all',
        search: '',
        sortBy: 'name',
        sortOrder: 'asc'
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Services
      .addCase(fetchServices.pending, (state, action) => {
        const { refresh = false } = action.meta.arg || {};
        if (refresh || state.services.length === 0) {
          state.loading = true;
          state.loadingMore = false;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        const { items, total, hasMore, page, refresh } = action.payload;
        state.loading = false;
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
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Service
      .addCase(addService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addService.fulfilled, (state, action) => {
        state.loading = false;
        state.services = [action.payload, ...state.services];
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(addService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Service
      .addCase(updateService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.services.findIndex(service => service.id === action.payload.id);
        if (index !== -1) {
          state.services = [
            ...state.services.slice(0, index),
            action.payload,
            ...state.services.slice(index + 1)
          ];
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Service
      .addCase(deleteService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.loading = false;
        state.services = state.services.filter(service => service.id !== action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Service Status
      .addCase(toggleServiceStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleServiceStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.services.findIndex(service => service.id === action.payload.id);
        if (index !== -1) {
          state.services = [
            ...state.services.slice(0, index),
            action.payload,
            ...state.services.slice(index + 1)
          ];
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(toggleServiceStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export des actions
export const {
  setFilters,
  setSearch,
  setSearchQuery,
  setCategoryFilter,
  setStatusFilter,
  setSortBy,
  setSortOrder,
  setEditingService,
  clearEditingService,
  clearError,
  resetFilters
} = servicesSlice.actions;

// Selectors
export const selectAdminServices = (state) => state.admin.services.services;
export const selectAdminServicesLoading = (state) => state.admin.services.loading;
export const selectAdminServicesLoadingMore = (state) => state.admin.services.loadingMore || false;
export const selectAdminServicesError = (state) => state.admin.services.error;
export const selectAdminServicesFilters = (state) => state.admin.services.filters;
export const selectAdminServicesPagination = (state) => state.admin.services.pagination || { page: 0, limit: 20, total: 0, hasMore: true };
export const selectEditingService = (state) => state.admin.services.editingService;
export const selectIsEditingService = (state) => state.admin.services.isEditing;
export const selectAdminCategories = (state) => state.admin.services.categories;

// Selectors dérivés
export const selectFilteredServices = (state) => {
  const { services } = state.admin.services;
  const { filters } = state.admin.services;
  
  let filtered = [...services];
  
  // Filtre par recherche
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(service => 
      (service.name || '').toLowerCase().includes(searchLower) ||
      (service.description || '').toLowerCase().includes(searchLower) ||
      (service.short_description || '').toLowerCase().includes(searchLower) ||
      (service.price || '').toLowerCase().includes(searchLower)
    );
  }
  
  // Filtre par catégorie
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(service => service.category_id === filters.category);
  }
  
  // Filtre par statut
  if (filters.status === 'active') {
    filtered = filtered.filter(service => service.is_active);
  } else if (filters.status === 'inactive') {
    filtered = filtered.filter(service => !service.is_active);
  }
  
  // Tri
  filtered.sort((a, b) => {
    let aValue, bValue;
    
    switch (filters.sortBy) {
      case 'name':
        aValue = (a.name || '').toLowerCase();
        bValue = (b.name || '').toLowerCase();
        break;
      case 'price':
        // Pour les services, on peut trier par prix si c'est numérique
        aValue = parseFloat(a.price) || 0;
        bValue = parseFloat(b.price) || 0;
        break;
      case 'date':
        aValue = new Date(a.created_at || 0);
        bValue = new Date(b.created_at || 0);
        break;
      case 'rating':
        aValue = a.rating || 0;
        bValue = b.rating || 0;
        break;
      default:
        aValue = (a.name || '').toLowerCase();
        bValue = (b.name || '').toLowerCase();
    }
    
    if (filters.sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    } else {
      return aValue > bValue ? 1 : -1;
    }
  });
  
  return filtered;
};

export const selectServiceStats = (state) => {
  const services = state.admin.services.services;
  
  const avgRating = services.length > 0 
    ? services.reduce((acc, service) => acc + (service.rating || 0), 0) / services.length
    : 0;
  
  return {
    total: services.length,
    active: services.filter(s => s.is_active).length,
    inactive: services.filter(s => !s.is_active).length,
    categories: state.admin.services.categories.length,
    avgRating: avgRating
  };
};

export const selectServiceById = (state, serviceId) => {
  return state.admin.services.services.find(service => service.id === serviceId);
};

export default servicesSlice.reducer;