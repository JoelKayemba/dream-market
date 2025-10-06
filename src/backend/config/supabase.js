import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-storage';

// Configuration Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Custom storage adapter pour expo-secure-storage
const ExpoSecureStoreAdapter = {
  getItem: (key) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key, value) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Configuration des buckets de storage
export const STORAGE_BUCKETS = {
  FARMS: process.env.EXPO_PUBLIC_STORAGE_BUCKET_FARMS || 'farm-images',
  PRODUCTS: process.env.EXPO_PUBLIC_STORAGE_BUCKET_PRODUCTS || 'product-images',
  SERVICES: process.env.EXPO_PUBLIC_STORAGE_BUCKET_SERVICES || 'service-images',
  AVATARS: process.env.EXPO_PUBLIC_STORAGE_BUCKET_AVATARS || 'user-avatars',
};

// Tables
export const TABLES = {
  PROFILES: 'profiles',
  FARMS: 'farms',
  PRODUCTS: 'products',
  SERVICES: 'services',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  FAVORITES: 'favorites',
};

// Rôles utilisateurs
export const USER_ROLES = {
  CUSTOMER: 'customer',
  FARMER: 'farmer',
  ADMIN: 'admin',
};

// Statuts des commandes
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Types d'éléments favoris
export const FAVORITE_TYPES = {
  PRODUCT: 'product',
  FARM: 'farm',
  SERVICE: 'service',
};
