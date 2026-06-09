import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import ordersReducer from './ordersSlice';
import favoritesReducer from './favoritesSlice';
import adminReducer from './admin';
import clientReducer from './client';
import notificationsReducer from './notificationsSlice';
import farmerReducer from './farmer/farmerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    orders: ordersReducer,
    favorites: favoritesReducer,
    admin: adminReducer,
    client: clientReducer,
    notifications: notificationsReducer,
    farmer: farmerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});
