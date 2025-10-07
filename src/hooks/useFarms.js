import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { 
  fetchFarms, 
  selectAllFarms,
  selectFarmsLoading,
  selectFarmsError,
  selectFilteredFarms,
  selectFarmStats
} from '../store/admin/farmSlice';

export const useFarms = () => {
  const dispatch = useDispatch();
  
  // État
  const farms = useSelector(selectAllFarms);
  const filteredFarms = useSelector(selectFilteredFarms);
  const loading = useSelector(selectFarmsLoading);
  const error = useSelector(selectFarmsError);
  const stats = useSelector(selectFarmStats);

  // Charger les fermes au montage
  useEffect(() => {
    if (farms.length === 0) {
      dispatch(fetchFarms());
    }
  }, [dispatch]); // ✅ CORRECTION : Suppression de 'farms.length' des dépendances

  // Actions
  const reloadFarms = () => {
    dispatch(fetchFarms());
  };

  return {
    // État
    farms,
    filteredFarms,
    loading,
    error,
    stats,
    
    // Actions
    reloadFarms,
  };
};

