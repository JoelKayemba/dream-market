import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../backend/services/orderService';

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

const normalizeString = (value) => {
  if (typeof value === 'string') {
    return value.trim();
  }
  return value ?? '';
};

const buildCustomerSnapshot = (order = {}) => {
  const firstName = normalizeString(order.customer_first_name) || normalizeString(order.profiles?.first_name);
  const lastName = normalizeString(order.customer_last_name) || normalizeString(order.profiles?.last_name);
  const email = normalizeString(order.customer_email) || normalizeString(order.profiles?.email);
  const phone = normalizeString(order.customer_phone) || normalizeString(order.phone_number);

  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return {
    firstName,
    lastName,
    email,
    phone,
    fullName: fullName || email || phone || 'Client inconnu',
  };
};

const transformOrder = (order) => {
  if (!order) return null;

  const snapshot = buildCustomerSnapshot(order);
  const deliveryFeeAmount = Number(order.delivery_fee_amount) || 0;
  const deliveryFeeCurrency = (order.delivery_fee_currency || 'CDF').trim();

  const totalsWithDelivery = { ...(order.totals || {}) };
  if (deliveryFeeAmount > 0) {
    totalsWithDelivery[deliveryFeeCurrency] = (totalsWithDelivery[deliveryFeeCurrency] || 0) + deliveryFeeAmount;
  }

  return {
    ...order,
    orderNumber: order.order_number,
    customerFirstName: snapshot.firstName,
    customerLastName: snapshot.lastName,
    customerEmail: snapshot.email,
    customerPhone: snapshot.phone,
    customerName: snapshot.fullName,
    date: order.created_at,
    deliveryAddress: order.delivery_address,
    phoneNumber: order.phone_number,
    paymentMethod: order.payment_method,
    estimatedDelivery: order.estimated_delivery,
    lastUpdated: order.last_updated,
    createdAt: order.created_at,
    items: Array.isArray(order.items) ? order.items : [],
    deliveryFeeAmount,
    deliveryFeeCurrency,
    totalsWithDelivery,
  };
};

const transformOrders = (orders = []) => orders
  .map(transformOrder)
  .filter(Boolean);

// Actions asynchrones pour les commandes
export const fetchOrders = createAsyncThunk(
  'adminOrders/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const orders = await orderService.getAllOrders();
      return transformOrders(orders);
    } catch (error) {
      console.error('❌ [AdminOrdersSlice] Error fetching orders:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Action pour mettre à jour le statut d'une commande
export const updateOrderStatus = createAsyncThunk(
  'adminOrders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      return transformOrder(updatedOrder);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour supprimer une commande
export const deleteOrder = createAsyncThunk(
  'adminOrders/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      await orderService.deleteOrder(orderId);
      return orderId;
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
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearch: (state, action) => {
      state.filters.search = action.payload;
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
    setEditingOrder: (state, action) => {
      state.editingOrder = action.payload;
      state.isEditing = !!action.payload;
    },
    clearEditingOrder: (state) => {
      state.editingOrder = null;
      state.isEditing = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.filters = {
        status: 'all',
        search: '',
        dateRange: null,
        sortBy: 'date',
        sortOrder: 'desc'
      };
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
        state.orders = action.payload;
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
          state.orders = [
            ...state.orders.slice(0, index),
            action.payload,
            ...state.orders.slice(index + 1)
          ];
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(order => order.id !== action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export des actions
export const {
  setFilters,
  setSearch,
  setStatusFilter,
  setSortBy,
  setSortOrder,
  setEditingOrder,
  clearEditingOrder,
  clearError,
  resetFilters
} = ordersSlice.actions;

// Selectors
export const selectAdminOrders = (state) => state.admin.orders.orders;
export const selectAdminOrdersLoading = (state) => state.admin.orders.loading;
export const selectAdminOrdersError = (state) => state.admin.orders.error;
export const selectAdminOrdersFilters = (state) => state.admin.orders.filters;
export const selectIsEditingOrder = (state) => state.admin.orders.isEditing;

// Selector pour les commandes filtrées
export const selectFilteredOrders = (state) => {
  const { orders } = state.admin.orders;
  const { filters } = state.admin.orders;
  
  let filtered = [...orders];
  
  // Filtre par recherche
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(order => 
      (order.orderNumber || '').toLowerCase().includes(searchLower) ||
      (order.customerName || '').toLowerCase().includes(searchLower) ||
      (order.customerPhone || '').toLowerCase().includes(searchLower) ||
      (order.customerEmail || '').toLowerCase().includes(searchLower)
    );
  }
  
  // Filtre par statut
  if (filters.status !== 'all') {
    filtered = filtered.filter(order => order.status === filters.status);
  }
  
  // Tri
  filtered.sort((a, b) => {
    let aValue, bValue;
    
    switch (filters.sortBy) {
      case 'date':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
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
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
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