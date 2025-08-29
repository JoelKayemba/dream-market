// 🖼️ Écrans - Dream Market App
// Export centralisé de tous les écrans de l'application

// 🏠 Écrans de l'accueil
export * from './Home';

// 🛍️ Écrans des produits
export * from './Products';

// 🏡 Écrans des fermes
export * from './Farms';

// 🔧 Écrans des services
export * from './Services';

// 📊 Écrans d'administration
export * from './Admin';

// 🔐 Écrans d'authentification
export * from './Auth';

// 📱 Écrans de navigation
export { default as SplashScreen } from './SplashScreen';
export { default as OnboardingScreen } from './OnboardingScreen';
export { default as WelcomeScreen } from './WelcomeScreen';

// 🛒 Écrans du panier et commandes
export { default as CartScreen } from './CartScreen';
export { default as CheckoutScreen } from './CheckoutScreen';
export { default as OrderConfirmationScreen } from './OrderConfirmationScreen';
export { default as OrderHistoryScreen } from './OrderHistoryScreen';
export { default as OrderDetailsScreen } from './OrderDetailsScreen';

// 🔍 Écrans de recherche globale
export { default as GlobalSearchScreen } from './GlobalSearchScreen';
export { default as SearchResultsScreen } from './SearchResultsScreen';
export { default as SearchFiltersScreen } from './SearchFiltersScreen';

// 📱 Écrans de profil et paramètres
export { default as ProfileScreen } from './ProfileScreen';
export { default as SettingsScreen } from './SettingsScreen';
export { default as NotificationsScreen } from './NotificationsScreen';
export { default as HelpScreen } from './HelpScreen';
export { default as AboutScreen } from './AboutScreen';

// 🚨 Écrans d'erreur et de fallback
export { default as ErrorScreen } from './ErrorScreen';
export { default as NotFoundScreen } from './NotFoundScreen';
export { default as MaintenanceScreen } from './MaintenanceScreen';
export { default as OfflineScreen } from './OfflineScreen';

// 📋 Export par défaut
export default {
  // Écrans de l'accueil
  ...require('./Home'),
  
  // Écrans des produits
  ...require('./Products'),
  
  // Écrans des fermes
  ...require('./Farms'),
  
  // Écrans des services
  ...require('./Services'),
  
  // Écrans d'administration
  ...require('./Admin'),
  
  // Écrans d'authentification
  ...require('./Auth'),
  
  // Écrans de navigation
  SplashScreen: require('./SplashScreen').default,
  OnboardingScreen: require('./OnboardingScreen').default,
  WelcomeScreen: require('./WelcomeScreen').default,
  
  // Écrans du panier et commandes
  CartScreen: require('./CartScreen').default,
  CheckoutScreen: require('./CheckoutScreen').default,
  OrderConfirmationScreen: require('./OrderConfirmationScreen').default,
  OrderHistoryScreen: require('./OrderHistoryScreen').default,
  OrderDetailsScreen: require('./OrderDetailsScreen').default,
  
  // Écrans de recherche globale
  GlobalSearchScreen: require('./GlobalSearchScreen').default,
  SearchResultsScreen: require('./SearchResultsScreen').default,
  SearchFiltersScreen: require('./SearchFiltersScreen').default,
  
  // Écrans de profil et paramètres
  ProfileScreen: require('./ProfileScreen').default,
  SettingsScreen: require('./SettingsScreen').default,
  NotificationsScreen: require('./NotificationsScreen').default,
  HelpScreen: require('./HelpScreen').default,
  AboutScreen: require('./AboutScreen').default,
  
  // Écrans d'erreur et de fallback
  ErrorScreen: require('./ErrorScreen').default,
  NotFoundScreen: require('./NotFoundScreen').default,
  MaintenanceScreen: require('./MaintenanceScreen').default,
  OfflineScreen: require('./OfflineScreen').default,
};


