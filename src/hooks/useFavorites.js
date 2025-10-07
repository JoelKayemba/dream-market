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
  selectFavoriteServices,
  // Actions backend
  addToFavoritesBackend,
  removeFromFavoritesBackend,
  toggleFavoriteBackend
} from '../store/favoritesSlice';
import { useAuth } from './useAuth';

export const useFavorites = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
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

  // Fonctions spécifiques par type avec backend
  const addProductToFavorites = (product) => {
    console.log('🔄 Adding product to favorites:', { productId: product.id, userId: user?.id });
    if (user?.id) {
      dispatch(addToFavoritesBackend({ userId: user.id, itemType: 'product', itemId: product.id }));
    } else {
      console.error('❌ No user ID available for adding product to favorites');
    }
  };

  const addFarmToFavorites = (farm) => {
    console.log('🔄 Adding farm to favorites:', { farmId: farm.id, userId: user?.id });
    if (user?.id) {
      dispatch(addToFavoritesBackend({ userId: user.id, itemType: 'farm', itemId: farm.id }));
    } else {
      console.error('❌ No user ID available for adding farm to favorites');
    }
  };

  const addServiceToFavorites = (service) => {
    console.log('🔄 Adding service to favorites:', { serviceId: service.id, userId: user?.id });
    if (user?.id) {
      dispatch(addToFavoritesBackend({ userId: user.id, itemType: 'service', itemId: service.id }));
    } else {
      console.error('❌ No user ID available for adding service to favorites');
    }
  };

  const removeProductFromFavorites = (productId) => {
    console.log('🔄 Removing product from favorites:', { productId, userId: user?.id });
    if (user?.id) {
      dispatch(removeFromFavoritesBackend({ userId: user.id, itemType: 'product', itemId: productId }));
    } else {
      console.error('❌ No user ID available for removing product from favorites');
    }
  };

  const removeFarmFromFavorites = (farmId) => {
    console.log('🔄 Removing farm from favorites:', { farmId, userId: user?.id });
    if (user?.id) {
      dispatch(removeFromFavoritesBackend({ userId: user.id, itemType: 'farm', itemId: farmId }));
    } else {
      console.error('❌ No user ID available for removing farm from favorites');
    }
  };

  const removeServiceFromFavorites = (serviceId) => {
    console.log('🔄 Removing service from favorites:', { serviceId, userId: user?.id });
    if (user?.id) {
      dispatch(removeFromFavoritesBackend({ userId: user.id, itemType: 'service', itemId: serviceId }));
    } else {
      console.error('❌ No user ID available for removing service from favorites');
    }
  };

  const toggleProductFavorite = (product) => {
    console.log('🔄 Toggling product favorite:', { productId: product.id, userId: user?.id });
    if (user?.id) {
      // 1. Mise à jour optimiste de l'UI (immédiate)
      const isCurrentlyFavorite = isFavorite(product.id, 'product');
      if (isCurrentlyFavorite) {
        dispatch(removeFromFavorites({ id: product.id, type: 'product' }));
      } else {
        dispatch(addToFavorites({ id: product.id, type: 'product', data: product }));
      }
      
      // 2. Synchronisation avec le backend (en arrière-plan)
      dispatch(toggleFavoriteBackend({ userId: user.id, itemType: 'product', itemId: product.id }))
        .unwrap()
        .then((result) => {
          console.log('✅ Backend sync success:', result);
          // Si le backend confirme, on garde l'état local
        })
        .catch((error) => {
          console.error('❌ Backend sync failed, rolling back:', error);
          // En cas d'erreur, on annule le changement local
          const wasFavorite = isFavorite(product.id, 'product');
          if (wasFavorite) {
            dispatch(addToFavorites({ id: product.id, type: 'product', data: product }));
          } else {
            dispatch(removeFromFavorites({ id: product.id, type: 'product' }));
          }
        });
    } else {
      console.error('❌ No user ID available for toggling product favorite');
    }
  };

  const toggleFarmFavorite = (farm) => {
    console.log('🔄 Toggling farm favorite:', { farmId: farm.id, userId: user?.id });
    if (user?.id) {
      // 1. Mise à jour optimiste de l'UI (immédiate)
      const isCurrentlyFavorite = isFavorite(farm.id, 'farm');
      if (isCurrentlyFavorite) {
        dispatch(removeFromFavorites({ id: farm.id, type: 'farm' }));
      } else {
        dispatch(addToFavorites({ id: farm.id, type: 'farm', data: farm }));
      }
      
      // 2. Synchronisation avec le backend (en arrière-plan)
      dispatch(toggleFavoriteBackend({ userId: user.id, itemType: 'farm', itemId: farm.id }))
        .unwrap()
        .then((result) => {
          console.log('✅ Backend sync success:', result);
        })
        .catch((error) => {
          console.error('❌ Backend sync failed, rolling back:', error);
          // Rollback en cas d'erreur
          const wasFavorite = isFavorite(farm.id, 'farm');
          if (wasFavorite) {
            dispatch(addToFavorites({ id: farm.id, type: 'farm', data: farm }));
          } else {
            dispatch(removeFromFavorites({ id: farm.id, type: 'farm' }));
          }
        });
    } else {
      console.error('❌ No user ID available for toggling farm favorite');
    }
  };

  const toggleServiceFavorite = (service) => {
    console.log('🔄 Toggling service favorite:', { serviceId: service.id, userId: user?.id });
    if (user?.id) {
      // 1. Mise à jour optimiste de l'UI (immédiate)
      const isCurrentlyFavorite = isFavorite(service.id, 'service');
      if (isCurrentlyFavorite) {
        dispatch(removeFromFavorites({ id: service.id, type: 'service' }));
      } else {
        dispatch(addToFavorites({ id: service.id, type: 'service', data: service }));
      }
      
      // 2. Synchronisation avec le backend (en arrière-plan)
      dispatch(toggleFavoriteBackend({ userId: user.id, itemType: 'service', itemId: service.id }))
        .unwrap()
        .then((result) => {
          console.log('✅ Backend sync success:', result);
        })
        .catch((error) => {
          console.error('❌ Backend sync failed, rolling back:', error);
          // Rollback en cas d'erreur
          const wasFavorite = isFavorite(service.id, 'service');
          if (wasFavorite) {
            dispatch(addToFavorites({ id: service.id, type: 'service', data: service }));
          } else {
            dispatch(removeFromFavorites({ id: service.id, type: 'service' }));
          }
        });
    } else {
      console.error('❌ No user ID available for toggling service favorite');
    }
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
