import { combineReducers } from '@reduxjs/toolkit';
import productSlice from './productSlice';
import farmSlice from './farmSlice';
import ordersSlice from './ordersSlice';
import servicesSlice from './servicesSlice';
import usersSlice from './usersSlice';
import analyticsSlice from './analyticsSlice';

// Combiner tous les reducers admin
const adminReducer = combineReducers({
  // Slices spécialisés
  products: productSlice,
  farms: farmSlice,
  orders: ordersSlice,
  services: servicesSlice,
  users: usersSlice,
  analytics: analyticsSlice,
});

export default adminReducer;

// Export des actions et sélecteurs
export * from './productSlice';
export * from './farmSlice';
export * from './ordersSlice';
export * from './servicesSlice';
export * from './usersSlice';
export * from './analyticsSlice';