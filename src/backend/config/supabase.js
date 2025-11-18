import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = '❌ Variables d\'environnement Supabase manquantes!\n' +
    'Veuillez définir EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY dans votre fichier .env';
  console.error(errorMessage);
  // En production, on peut continuer mais l'app ne fonctionnera pas correctement
  // En développement, on peut throw pour forcer la correction
  if (__DEV__) {
    throw new Error(errorMessage);
  }
}

// Créer le client Supabase
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: false,
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
  NOTIFICATIONS: 'notifications',
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
