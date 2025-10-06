import { combineReducers } from '@reduxjs/toolkit';
import adminSlice from './adminSlice';
import productSlice from './productSlice';
import farmSlice from './farmSlice';
import ordersSlice from './ordersSlice';
import servicesSlice from './servicesSlice';

// Combiner tous les reducers admin
const adminReducer = combineReducers({
  // Slice principal admin (stats, settings, etc.)
  main: adminSlice,
  
  // Slices spécialisés
  products: productSlice,
  farms: farmSlice,
  orders: ordersSlice,
  services: servicesSlice,
});

export default adminReducer;

// Export des actions et sélecteurs
export * from './adminSlice';
export * from './productSlice';
export * from './farmSlice';
export * from './ordersSlice';
export * from './servicesSlice';