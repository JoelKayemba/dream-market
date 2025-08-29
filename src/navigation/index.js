// Navigation principale
export { default as StackNavigator } from './StackNavigator';
export { default as AppNavigator } from './AppNavigator';
export { default as ProfileStackNavigator } from './ProfileStackNavigator';

// Écrans
export { default as SearchScreen } from '../screens/SearchScreen';
export { default as ProfileScreen } from '../screens/ProfileScreen';
export { default as OrdersScreen } from '../screens/OrdersScreen';
export { default as PersonalInfoScreen } from '../screens/PersonalInfoScreen';

// Constantes de navigation
export const screens = {
  HOME: 'Accueil',
  PRODUCTS: 'Produits',
  FARMS: 'Fermes',
  SERVICES: 'Services',
  PROFILE: 'Profil',
  SEARCH: 'Search',
  ORDERS: 'Orders',
  PERSONAL_INFO: 'PersonalInfo'
};
