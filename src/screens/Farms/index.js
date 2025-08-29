// 🏡 Écrans des fermes - Dream Market App
// Export centralisé de tous les écrans liés aux fermes

// 🎯 Écrans principaux des fermes
export { default as FarmsScreen } from './FarmsScreen';
export { default as FarmDetailsScreen } from './FarmDetailsScreen';
export { default as FarmSearchScreen } from './FarmSearchScreen';

// 📱 Écrans de navigation ferme
export { default as FarmCategoryScreen } from './FarmCategoryScreen';
export { default as FarmMapScreen } from './FarmMapScreen';
export { default as FarmFavoritesScreen } from './FarmFavoritesScreen';

// 🔍 Écrans de recherche et filtrage
export { default as FarmFilterScreen } from './FarmFilterScreen';
export { default as FarmSortScreen } from './FarmSortScreen';
export { default as FarmSearchResultsScreen } from './FarmSearchResultsScreen';

// 📊 Écrans d'information ferme
export { default as FarmProductsScreen } from './FarmProductsScreen';
export { default as FarmServicesScreen } from './FarmServicesScreen';
export { default as FarmReviewsScreen } from './FarmReviewsScreen';
export { default as FarmContactScreen } from './FarmContactScreen';

// 🗺️ Écrans de localisation
export { default as FarmLocationScreen } from './FarmLocationScreen';
export { default as FarmDirectionsScreen } from './FarmDirectionsScreen';
export { default as FarmAreaScreen } from './FarmAreaScreen';

// 📋 Export par défaut
export default {
  // Écrans principaux
  FarmsScreen,
  FarmDetailsScreen,
  FarmSearchScreen,
  
  // Navigation ferme
  FarmCategoryScreen,
  FarmMapScreen,
  FarmFavoritesScreen,
  
  // Recherche et filtrage
  FarmFilterScreen,
  FarmSortScreen,
  FarmSearchResultsScreen,
  
  // Information ferme
  FarmProductsScreen,
  FarmServicesScreen,
  FarmReviewsScreen,
  FarmContactScreen,
  
  // Localisation
  FarmLocationScreen,
  FarmDirectionsScreen,
  FarmAreaScreen,
};


