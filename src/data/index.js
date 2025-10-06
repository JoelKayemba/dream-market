// Export des données principales
export { categories, getCategoryById, getCategoryByName } from './categories';
export { farms, getFarmById, getFarmsByCategory, searchFarms } from './farms';
export { 
  products, 
  getProductById, 
  getProductsByCategory, 
  getProductsByFarm, 
  getSponsoredProducts, 
  getAvailableProducts, 
  searchProducts, 
  getProductsWithFarmInfo 
} from './products';
export { 
  services, 
  getServiceById, 
  getServicesByCategory, 
  getActiveServices, 
  searchServices, 
  getServiceCategories 
} from './services';
export { 
  sponsoredProducts, 
  getSponsoredById, 
  getActiveSponsored, 
  getSponsoredByPriority, 
  getSponsoredWithProductInfo, 
  updateClickCount, 
  getSponsoredStats, 
  searchSponsored 
} from './sponsored';

// Données combinées pour l'écran d'accueil
export const getHomeScreenData = () => {
  const { getSponsoredProducts, getActiveServices, categories } = require('./index');
  
  return {
    sponsoredProducts: getSponsoredProducts(),
    services: getActiveServices(),
    categories: categories
  };
};

// Données pour la recherche globale
export const globalSearch = (query) => {
  const { searchProducts, searchFarms, searchServices } = require('./index');
  
  const results = {
    products: searchProducts(query),
    farms: searchFarms(query),
    services: searchServices(query)
  };
  
  return {
    ...results,
    totalResults: results.products.length + results.farms.length + results.services.length
  };
};

// Statistiques globales de l'application
export const getAppStats = () => {
  const { products, farms, services, sponsoredProducts } = require('./index');
  
  const activeSponsored = sponsoredProducts.filter(s => s.isActive);
  const availableProducts = products.filter(p => p.status === 'active');
  
  return {
    totalProducts: products.length,
    availableProducts: availableProducts.length,
    totalFarms: farms.length,
    totalServices: services.length,
    activeSponsored: activeSponsored.length,
    totalCategories: 8, // Nombre fixe de catégories
    averageProductRating: products.reduce((sum, p) => sum + p.rating, 0) / products.length,
    averageFarmRating: farms.reduce((sum, f) => sum + f.rating, 0) / farms.length
  };
};

// Données pour les tests et le développement
export const getMockData = () => {
  return {
    categories: require('./categories').categories,
    farms: require('./farms').farms,
    products: require('./products').products,
    services: require('./services').services,
    sponsoredProducts: require('./sponsored').sponsoredProducts
  };
};


