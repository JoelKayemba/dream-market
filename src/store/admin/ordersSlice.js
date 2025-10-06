import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// État initial pour les commandes admin
const initialState = {
  orders: [],
  loading: false,
  error: null,
  lastUpdated: null,
  // Filtres et recherche
  filters: {
    status: 'all', // all, pending, confirmed, preparing, shipped, delivered, cancelled
    search: '',
    dateRange: null,
    sortBy: 'date', // date, total, status, customer
    sortOrder: 'desc' // asc, desc
  },
  // Pagination
  pagination: {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 0
  },
  // État de l'édition
  editingOrder: null,
  isEditing: false
};

// Actions asynchrones pour les commandes
export const fetchOrders = createAsyncThunk(
  'adminOrders/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      const { page = 1, limit = 20, status, search, sortBy, sortOrder } = params;
      
      // Simuler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données simulées (à remplacer par un vrai appel API)
      const mockOrders = [
        {
          id: 1,
          orderNumber: 'DM-240115001',
          customerName: 'Jean Mukendi',
          customerPhone: '+243 81 234 5678',
          customerEmail: 'jean.mukendi@email.com',
          date: '2024-01-15T08:30:00Z',
          status: 'pending',
          items: [
            {
              id: 1,
              product: {
                id: 1,
                name: 'Tomates Bio Premium',
                price: 2.50,
                currency: 'CDF',
                images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4'],
                farm: 'Ferme Bio du Val'
              },
              quantity: 3,
              unit: 'kg'
            },
            {
              id: 2,
              product: {
                id: 2,
                name: 'Carottes Fraîches',
                price: 1.80,
                currency: 'CDF',
                images: ['https://images.unsplash.com/photo-1445282768818-728615cc910a'],
                farm: 'Ferme Bio du Val'
              },
              quantity: 2,
              unit: 'kg'
            }
          ],
          deliveryAddress: 'Avenue des Cliniques, Kinshasa, RDC',
          phoneNumber: '+243 81 234 5678',
          notes: 'Livraison préférée en matinée',
          paymentMethod: 'cash',
          totals: {
            CDF: 11.10
          },
          estimatedDelivery: '2024-01-16T10:00:00Z',
          lastUpdated: '2024-01-15T08:30:00Z',
          createdAt: '2024-01-15T08:30:00Z'
        },
        {
          id: 2,
          orderNumber: 'DM-240114002',
          customerName: 'Marie Kabila',
          customerPhone: '+243 99 876 5432',
          customerEmail: 'marie.kabila@email.com',
          date: '2024-01-14T14:20:00Z',
          status: 'confirmed',
          items: [
            {
              id: 3,
              product: {
                id: 3,
                name: 'Salade Verte',
                price: 1.50,
                currency: 'CDF',
                images: ['https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1'],
                farm: 'Ferme du Soleil'
              },
              quantity: 1,
              unit: 'pièce'
            }
          ],
          deliveryAddress: 'Commune de Limete, Kinshasa, RDC',
          phoneNumber: '+243 99 876 5432',
          notes: '',
          paymentMethod: 'mobile_money',
          totals: {
            CDF: 1.50
          },
          estimatedDelivery: '2024-01-15T16:00:00Z',
          lastUpdated: '2024-01-14T16:30:00Z',
          createdAt: '2024-01-14T14:20:00Z'
        },
        {
          id: 3,
          orderNumber: 'DM-240113003',
          customerName: 'Pierre Mbuyi',
          customerPhone: '+243 85 123 4567',
          customerEmail: 'pierre.mbuyi@email.com',
          date: '2024-01-13T10:15:00Z',
          status: 'delivered',
          items: [
            {
              id: 4,
              product: {
                id: 4,
                name: 'Pommes de Terre',
                price: 2.00,
                currency: 'CDF',
                images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655'],
                farm: 'Ferme Bio du Val'
              },
              quantity: 5,
              unit: 'kg'
            }
          ],
          deliveryAddress: 'Quartier Matonge, Kinshasa, RDC',
          phoneNumber: '+243 85 123 4567',
          notes: 'Livraison confirmée par le client',
          paymentMethod: 'cash',
          totals: {
            CDF: 10.00
          },
          estimatedDelivery: '2024-01-14T12:00:00Z',
          deliveredAt: '2024-01-14T11:45:00Z',
          lastUpdated: '2024-01-14T11:45:00Z',
          createdAt: '2024-01-13T10:15:00Z'
        }
      ];
      
      return {
        orders: mockOrders,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: mockOrders.length,
          totalPages: Math.ceil(mockOrders.length / limit)
        }
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'adminOrders/updateOrderStatus',
  async ({ orderId, status, notes }, { rejectWithValue, getState }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Dans une vraie app, ceci ferait un appel à l'API
      const updatedOrder = {
        id: orderId,
        status,
        notes,
        lastUpdated: new Date().toISOString()
      };
      
      return updatedOrder;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const contactCustomer = createAsyncThunk(
  'adminOrders/contactCustomer',
  async ({ orderId, method, message }, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API pour enregistrer le contact
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        orderId,
        method,
        message,
        contactedAt: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice Redux
const ordersSlice = createSlice({
  name: 'adminOrders',
  initialState,
  reducers: {
    // Filtres et recherche
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.filters.search = action.payload;
    },
    setDateRange: (state, action) => {
      state.filters.dateRange = action.payload;
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
    setEditingOrder: (state, action) => {
      state.editingOrder = action.payload;
      state.isEditing = !!action.payload;
    },
    clearEditingOrder: (state) => {
      state.editingOrder = null;
      state.isEditing = false;
    },
    
    // Gestion d'erreurs
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = {
            ...state.orders[index],
            ...action.payload
          };
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Contact Customer
      .addCase(contactCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(contactCustomer.fulfilled, (state, action) => {
        state.loading = false;
        // Enregistrer l'historique de contact (optionnel)
      })
      .addCase(contactCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export des actions
export const {
  setStatusFilter,
  setSearchQuery,
  setDateRange,
  setSortBy,
  setSortOrder,
  setCurrentPage,
  setEditingOrder,
  clearEditingOrder,
  clearError
} = ordersSlice.actions;

// Sélecteurs
export const selectAdminOrders = (state) => state.admin.orders.orders;
export const selectAdminOrdersLoading = (state) => state.admin.orders.loading;
export const selectAdminOrdersError = (state) => state.admin.orders.error;
export const selectAdminOrdersFilters = (state) => state.admin.orders.filters;
export const selectAdminOrdersPagination = (state) => state.admin.orders.pagination;

// Sélecteurs dérivés
export const selectFilteredOrders = (state) => {
  const { orders, filters } = state.admin.orders;
  let filtered = [...orders];
  
  // Filtre par statut
  if (filters.status !== 'all') {
    filtered = filtered.filter(order => order.status === filters.status);
  }
  
  // Filtre par recherche
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(order => 
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      order.customerPhone.includes(searchLower)
    );
  }
  
  // Tri
  filtered.sort((a, b) => {
    let aValue, bValue;
    
    switch (filters.sortBy) {
      case 'date':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'total':
        aValue = Object.values(a.totals)[0] || 0;
        bValue = Object.values(b.totals)[0] || 0;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'customer':
        aValue = a.customerName;
        bValue = b.customerName;
        break;
      default:
        aValue = new Date(a.date);
        bValue = new Date(b.date);
    }
    
    if (filters.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  return filtered;
};

export const selectOrderById = (orderId) => (state) => 
  state.admin.orders.orders.find(order => order.id === orderId);

export const selectOrderStats = (state) => {
  const orders = state.admin.orders.orders;
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + (Object.values(order.totals)[0] || 0), 0)
  };
  
  return stats;
};

export default ordersSlice.reducer;
