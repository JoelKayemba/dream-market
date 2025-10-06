import { useSelector, useDispatch } from 'react-redux';
import { 
  addToFavorites, 
  removeFromFavorites, 
  toggleFavorite,
  clearFavorites,
  selectFavorites,
  selectIsFavorite,
  selectFavoriteProducts,
  selectFavoriteFarms,
  selectFavoriteServices
} from '../store/favoritesSlice';

export const useFavorites = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const favorites = useSelector(selectFavorites);
  const favoriteProducts = useSelector(selectFavoriteProducts);
  const favoriteFarms = useSelector(selectFavoriteFarms);
  const favoriteServices = useSelector(selectFavoriteServices);

  // Actions
  const addFavorite = (id, type, data) => {
    dispatch(addToFavorites({ id, type, data }));
  };

  const removeFavorite = (id, type) => {
    dispatch(removeFromFavorites({ id, type }));
  };

  const toggleFavoriteItem = (id, type, data) => {
    dispatch(toggleFavorite({ id, type, data }));
  };

  const clearAllFavorites = () => {
    dispatch(clearFavorites());
  };

  // Helper functions
  const isFavorite = (id, type) => {
    return favorites.some(item => item.id === id && item.type === type);
  };

  const getFavoriteCount = () => {
    return favorites.length;
  };

  const getFavoriteCountByType = (type) => {
    return favorites.filter(item => item.type === type).length;
  };

  const getFavoritesByType = (type) => {
    return favorites
      .filter(item => item.type === type)
      .map(item => item.data);
  };

  // Fonctions spécifiques par type
  const addProductToFavorites = (product) => {
    addFavorite(product.id, 'product', product);
  };

  const addFarmToFavorites = (farm) => {
    addFavorite(farm.id, 'farm', farm);
  };

  const addServiceToFavorites = (service) => {
    addFavorite(service.id, 'service', service);
  };

  const removeProductFromFavorites = (productId) => {
    removeFavorite(productId, 'product');
  };

  const removeFarmFromFavorites = (farmId) => {
    removeFavorite(farmId, 'farm');
  };

  const removeServiceFromFavorites = (serviceId) => {
    removeFavorite(serviceId, 'service');
  };

  const toggleProductFavorite = (product) => {
    toggleFavoriteItem(product.id, 'product', product);
  };

  const toggleFarmFavorite = (farm) => {
    toggleFavoriteItem(farm.id, 'farm', farm);
  };

  const toggleServiceFavorite = (service) => {
    toggleFavoriteItem(service.id, 'service', service);
  };

  const isProductFavorite = (productId) => {
    return isFavorite(productId, 'product');
  };

  const isFarmFavorite = (farmId) => {
    return isFavorite(farmId, 'farm');
  };

  const isServiceFavorite = (serviceId) => {
    return isFavorite(serviceId, 'service');
  };

  return {
    // State
    favorites,
    favoriteProducts,
    favoriteFarms,
    favoriteServices,
    
    // Actions générales
    addFavorite,
    removeFavorite,
    toggleFavoriteItem,
    clearAllFavorites,
    
    // Helpers
    isFavorite,
    getFavoriteCount,
    getFavoriteCountByType,
    getFavoritesByType,
    
    // Actions spécifiques aux produits
    addProductToFavorites,
    removeProductFromFavorites,
    toggleProductFavorite,
    isProductFavorite,
    
    // Actions spécifiques aux fermes
    addFarmToFavorites,
    removeFarmFromFavorites,
    toggleFarmFavorite,
    isFarmFavorite,
    
    // Actions spécifiques aux services
    addServiceToFavorites,
    removeServiceFromFavorites,
    toggleServiceFavorite,
    isServiceFavorite,
  };
};
