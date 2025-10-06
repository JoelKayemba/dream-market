import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action) => {
      const newOrder = {
        id: `order-${Date.now()}`,
        orderNumber: `DM-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        status: 'pending', // pending, confirmed, preparing, shipped, delivered, cancelled
        items: action.payload.items,
        deliveryAddress: action.payload.deliveryAddress,
        phoneNumber: action.payload.phoneNumber,
        notes: action.payload.notes || '',
        paymentMethod: action.payload.paymentMethod || 'cash',
        totals: action.payload.totals,
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h après
        ...action.payload
      };
      state.orders.unshift(newOrder); // Ajouter au début
      state.currentOrder = newOrder;
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(order => order.id === orderId);
      if (order) {
        order.status = status;
        order.lastUpdated = new Date().toISOString();
      }
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { 
  addOrder, 
  updateOrderStatus, 
  setCurrentOrder, 
  clearCurrentOrder,
  setLoading,
  setError,
  clearError
} = ordersSlice.actions;

// Sélecteurs
export const selectOrders = (state) => state.orders.orders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrdersLoading = (state) => state.orders.isLoading;
export const selectOrdersError = (state) => state.orders.error;

// Sélecteur pour les commandes par statut
export const selectOrdersByStatus = (status) => (state) => 
  state.orders.orders.filter(order => order.status === status);

// Sélecteur pour les commandes récentes (dernières 10)
export const selectRecentOrders = (state) => 
  state.orders.orders.slice(0, 10);

export default ordersSlice.reducer;





