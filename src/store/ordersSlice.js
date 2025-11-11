import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { orderService } from '../backend';

// Actions asynchrones pour les commandes
export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (userId, { rejectWithValue }) => {
    try {
      const orders = await orderService.getUserOrders(userId);
      return orders;
    } catch (error) {
      console.error('❌ [OrdersSlice] Error fetching orders:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const order = await orderService.createOrder(orderData);
      return order;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const order = await orderService.updateOrderStatus(orderId, status);
      return order;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      console.log('🔔 [ordersSlice] fetchOrderById appelé avec orderId:', orderId);
      const order = await orderService.getOrderById(orderId);
      console.log('🔔 [ordersSlice] Commande récupérée:', order);
      return order;
    } catch (error) {
      console.error('🔔 [ordersSlice] Erreur fetchOrderById:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  initialLoading: false, // Nouveau: loading pour le premier chargement
  error: null,
  lastOrder: null,
  hasInitialized: false, // Nouveau: flag pour savoir si les données ont été chargées
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearLastOrder: (state) => {
      state.lastOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchUserOrders
      .addCase(fetchUserOrders.pending, (state) => {
        // Loading seulement si pas encore initialisé
        if (!state.hasInitialized) {
          state.initialLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.initialLoading = false;
        state.orders = action.payload;
        state.hasInitialized = true;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.initialLoading = false;
        state.error = action.payload;
      })
      
      // createOrder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastOrder = action.payload;
        // Ajouter la nouvelle commande au début de la liste
        state.orders = [action.payload, ...state.orders];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // updateOrderStatus
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
        if (state.currentOrder && state.currentOrder.id === updatedOrder.id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // fetchOrderById
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
  }
});

export const { 
  setCurrentOrder, 
  clearCurrentOrder,
  clearError,
  clearLastOrder
} = ordersSlice.actions;

// Sélecteurs
export const selectOrders = (state) => state.orders?.orders || [];
export const selectCurrentOrder = (state) => state.orders?.currentOrder || null;
export const selectOrdersLoading = (state) => state.orders?.initialLoading || false;
export const selectOrdersError = (state) => state.orders?.error || null;
export const selectLastOrder = (state) => state.orders?.lastOrder || null;

// Sélecteur pour les commandes par statut
export const selectOrdersByStatus = (status) => (state) => 
  (state.orders?.orders || []).filter(order => order.status === status);

// Sélecteur pour les commandes récentes (dernières 10)
export const selectRecentOrders = (state) => 
  (state.orders?.orders || []).slice(0, 10);

// Sélecteur pour une commande par ID
export const selectOrderById = (orderId) => (state) => 
  (state.orders?.orders || []).find(order => order.id === orderId);

// Sélecteur pour les statistiques des commandes - Mémorisé
export const selectOrdersStats = createSelector(
  [(state) => state.orders.orders || []],
  (orders) => ({
    total: orders.length,
    pending: orders.filter(order => order.status === 'pending').length,
    confirmed: orders.filter(order => order.status === 'confirmed').length,
    preparing: orders.filter(order => order.status === 'preparing').length,
    shipped: orders.filter(order => order.status === 'shipped').length,
    delivered: orders.filter(order => order.status === 'delivered').length,
    cancelled: orders.filter(order => order.status === 'cancelled').length,
  })
);

export default ordersSlice.reducer;





