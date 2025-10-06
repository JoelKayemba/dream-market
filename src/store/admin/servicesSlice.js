import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// État initial pour les services admin
const initialState = {
  services: [],
  loading: false,
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
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 0
  },
  // État de l'édition
  editingService: null,
  isEditing: false
};

// Actions asynchrones pour les services
export const fetchServices = createAsyncThunk(
  'adminServices/fetchServices',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      const { page = 1, limit = 20, category, status, search, sortBy, sortOrder } = params;
      
      // Simuler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données simulées basées sur les données existantes
      const mockServices = [
        {
          id: 1,
          name: 'Livraison à domicile',
          description: 'Service de livraison à domicile pour tous vos produits agricoles. Livraison gratuite pour les commandes supérieures à 50€.',
          shortDescription: 'Livraison gratuite pour commandes > 50€',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
          icon: '🚚',
          price: 'Gratuit > 50€',
          priceDetails: '5€ pour commandes < 50€',
          isActive: true,
          category: 'Logistique',
          categoryId: 1,
          features: [
            'Livraison sous 24-48h',
            'Suivi en temps réel',
            'Livraison en point relais possible',
            'Emballages écologiques',
            'Horaires de livraison flexibles'
          ],
          coverage: 'Pays de la Loire et Bretagne',
          minOrder: 20,
          deliveryTime: '24-48h',
          contact: {
            phone: '02 40 12 34 56',
            email: 'livraison@dreammarket.fr'
          },
          rating: 4.7,
          reviewCount: 89,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          name: 'Conseils agricoles',
          description: 'Équipe d\'experts agronomes à votre service pour optimiser vos cultures, améliorer vos rendements et adopter des pratiques durables.',
          shortDescription: 'Experts à votre service',
          image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500',
          icon: '👨‍🌾',
          price: 'À partir de 80€',
          priceDetails: '80€/heure de consultation',
          isActive: true,
          category: 'Conseil',
          categoryId: 2,
          features: [
            'Audit de vos parcelles',
            'Plan de fertilisation personnalisé',
            'Conseils en irrigation',
            'Gestion des maladies et ravageurs',
            'Formation de vos équipes',
            'Suivi régulier'
          ],
          coverage: 'Toute la France',
          minOrder: 1,
          deliveryTime: 'Sous 7 jours',
          contact: {
            phone: '02 40 12 34 57',
            email: 'conseils@dreammarket.fr'
          },
          rating: 4.9,
          reviewCount: 156,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-14T15:30:00Z'
        },
        {
          id: 3,
          name: 'Formation en agriculture',
          description: 'Formations pratiques pour améliorer vos techniques agricoles, de la plantation à la récolte.',
          shortDescription: 'Formations pratiques',
          image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500',
          icon: '📚',
          price: 'À partir de 120€',
          priceDetails: '120€/jour de formation',
          isActive: true,
          category: 'Formation',
          categoryId: 3,
          features: [
            'Formations sur site',
            'Techniques modernes',
            'Certification incluse',
            'Matériel fourni',
            'Suivi post-formation'
          ],
          coverage: 'Région Ouest',
          minOrder: 5,
          deliveryTime: 'Sous 15 jours',
          contact: {
            phone: '02 40 12 34 58',
            email: 'formation@dreammarket.fr'
          },
          rating: 4.8,
          reviewCount: 67,
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-13T09:15:00Z'
        },
        {
          id: 4,
          name: 'Maintenance d\'équipements',
          description: 'Service de maintenance et réparation pour tous vos équipements agricoles.',
          shortDescription: 'Maintenance équipements',
          image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500',
          icon: '🔧',
          price: 'À partir de 60€',
          priceDetails: '60€/heure + pièces',
          isActive: false,
          category: 'Maintenance',
          categoryId: 4,
          features: [
            'Réparation sur site',
            'Pièces détachées',
            'Maintenance préventive',
            'Garantie travaux',
            'Urgences 24h/24'
          ],
          coverage: 'Département 44',
          minOrder: 1,
          deliveryTime: 'Sous 48h',
          contact: {
            phone: '02 40 12 34 59',
            email: 'maintenance@dreammarket.fr'
          },
          rating: 4.6,
          reviewCount: 34,
          createdAt: '2024-01-04T00:00:00Z',
          updatedAt: '2024-01-12T14:20:00Z'
        }
      ];
      
      return {
        services: mockServices,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: mockServices.length,
          totalPages: Math.ceil(mockServices.length / limit)
        }
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addService = createAsyncThunk(
  'adminServices/addService',
  async (serviceData, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newService = {
        id: Date.now(),
        ...serviceData,
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return newService;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateService = createAsyncThunk(
  'adminServices/updateService',
  async ({ id, serviceData }, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedService = {
        id,
        ...serviceData,
        updatedAt: new Date().toISOString()
      };
      
      return updatedService;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteService = createAsyncThunk(
  'adminServices/deleteService',
  async (serviceId, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return serviceId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleServiceStatus = createAsyncThunk(
  'adminServices/toggleServiceStatus',
  async (serviceId, { rejectWithValue, getState }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const state = getState();
      const service = state.admin.services.services.find(s => s.id === serviceId);
      
      return {
        id: serviceId,
        isActive: !service.isActive,
        updatedAt: new Date().toISOString()
      };
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
    // Filtres et recherche
    setCategoryFilter: (state, action) => {
      state.filters.category = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.filters.search = action.payload;
    },
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.filters.sortOrder = action.payload;
    },
    
    // Pagination
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    
    // État d'édition
    setEditingService: (state, action) => {
      state.editingService = action.payload;
      state.isEditing = !!action.payload;
    },
    clearEditingService: (state) => {
      state.editingService = null;
      state.isEditing = false;
    },
    
    // Gestion d'erreurs
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Services
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload.services;
        state.pagination = action.payload.pagination;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchServices.rejected, (state, action) => {
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
        state.services.unshift(action.payload);
        state.pagination.totalItems += 1;
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
          state.services[index] = action.payload;
        }
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
        state.pagination.totalItems -= 1;
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
          state.services[index].isActive = action.payload.isActive;
          state.services[index].updatedAt = action.payload.updatedAt;
        }
      })
      .addCase(toggleServiceStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export des actions
export const {
  setCategoryFilter,
  setStatusFilter,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  setCurrentPage,
  setEditingService,
  clearEditingService,
  clearError
} = servicesSlice.actions;

// Sélecteurs
export const selectAdminServices = (state) => state.admin.services.services;
export const selectAdminServicesLoading = (state) => state.admin.services.loading;
export const selectAdminServicesError = (state) => state.admin.services.error;
export const selectAdminServicesFilters = (state) => state.admin.services.filters;
export const selectAdminServicesPagination = (state) => state.admin.services.pagination;

// Sélecteurs dérivés
export const selectFilteredServices = (state) => {
  const { services, filters } = state.admin.services;
  let filtered = [...services];
  
  // Filtre par catégorie
  if (filters.category !== 'all') {
    filtered = filtered.filter(service => service.category === filters.category);
  }
  
  // Filtre par statut
  if (filters.status !== 'all') {
    filtered = filtered.filter(service => 
      filters.status === 'active' ? service.isActive : !service.isActive
    );
  }
  
  // Filtre par recherche
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(service => 
      service.name.toLowerCase().includes(searchLower) ||
      service.description.toLowerCase().includes(searchLower) ||
      service.category.toLowerCase().includes(searchLower)
    );
  }
  
  // Tri
  filtered.sort((a, b) => {
    let aValue, bValue;
    
    switch (filters.sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'date':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'rating':
        aValue = a.rating || 0;
        bValue = b.rating || 0;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }
    
    if (filters.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  return filtered;
};

export const selectServiceById = (serviceId) => (state) => 
  state.admin.services.services.find(service => service.id === serviceId);

export const selectServiceStats = (state) => {
  const services = state.admin.services.services;
  const stats = {
    total: services.length,
    active: services.filter(s => s.isActive).length,
    inactive: services.filter(s => !s.isActive).length,
    categories: [...new Set(services.map(s => s.category))].length,
    avgRating: services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length || 0
  };
  
  return stats;
};

export default servicesSlice.reducer;
