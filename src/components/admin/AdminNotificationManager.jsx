import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  fetchOrders
} from '../../store/admin/ordersSlice';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';

const AdminNotificationManager = () => {
  const dispatch = useDispatch();
  const { isInitialized } = useAdminNotifications();

  // Charger les commandes automatiquement pour détecter les nouvelles
  useEffect(() => {
    const loadOrdersForNotifications = async () => {
      try {
        await dispatch(fetchOrders());
      } catch (error) {
        console.error('❌ [AdminNotificationManager] Erreur lors du chargement des commandes:', error);
      }
    };

    if (isInitialized) {
      loadOrdersForNotifications();
      
      // Recharger les commandes toutes les 5 minutes pour détecter les nouvelles (réduit de 30s à 5min)
      const interval = setInterval(loadOrdersForNotifications, 300000);
      
      return () => clearInterval(interval);
    }
  }, [isInitialized, dispatch]);

  // Ce composant ne rend rien, il gère juste les notifications en arrière-plan
  return null;
};

export default AdminNotificationManager;
