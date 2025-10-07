import { combineReducers } from '@reduxjs/toolkit';
import productsSlice from './productsSlice';
import farmsSlice from './farmsSlice';
import servicesSlice from './servicesSlice';

// Combiner tous les reducers côté client
const clientReducer = combineReducers({
  products: productsSlice,
  farms: farmsSlice,
  services: servicesSlice,
});

export default clientReducer;

// Export des actions et sélecteurs
export * from './productsSlice';
export * from './farmsSlice';
export * from './servicesSlice';
