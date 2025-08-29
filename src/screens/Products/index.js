// 🛍️ Écrans des produits - Dream Market App
// Export centralisé de tous les écrans liés aux produits

// 🎯 Écrans principaux des produits
export { default as ProductsScreen } from './ProductsScreen';
export { default as ProductDetailsScreen } from './ProductDetailsScreen';
export { default as ProductSearchScreen } from './ProductSearchScreen';

// 📱 Écrans de navigation produit
export { default as ProductCategoryScreen } from './ProductCategoryScreen';
export { default as ProductComparisonScreen } from './ProductComparisonScreen';
export { default as ProductWishlistScreen } from './ProductWishlistScreen';

// 🔍 Écrans de recherche et filtrage
export { default as ProductFilterScreen } from './ProductFilterScreen';
export { default as ProductSortScreen } from './ProductSortScreen';
export { default as ProductSearchResultsScreen } from './ProductSearchResultsScreen';

// 📊 Écrans d'information produit
export { default as ProductReviewsScreen } from './ProductReviewsScreen';
export { default as ProductSpecificationsScreen } from './ProductSpecificationsScreen';
export { default as ProductAvailabilityScreen } from './ProductAvailabilityScreen';

// 📋 Export par défaut
export default {
  // Écrans principaux
  ProductsScreen,
  ProductDetailsScreen,
  ProductSearchScreen,
  
  // Navigation produit
  ProductCategoryScreen,
  ProductComparisonScreen,
  ProductWishlistScreen,
  
  // Recherche et filtrage
  ProductFilterScreen,
  ProductSortScreen,
  ProductSearchResultsScreen,
  
  // Information produit
  ProductReviewsScreen,
  ProductSpecificationsScreen,
  ProductAvailabilityScreen,
};


