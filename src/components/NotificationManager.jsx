import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  fetchProducts,
  fetchFarms,
  fetchServices
} from '../store/client';
import { 
  fetchUserOrders
} from '../store/ordersSlice';
import { 
  loadPersistedNotificationsData
} from '../store/notificationsSlice';
import { 
  fetchOrders
} from '../store/admin/ordersSlice';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useAdminNotifications } from '../hooks/useAdminNotifications';

const NotificationManager = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Initialiser le hook de notifications (pour générer les notifications automatiquement)
  const { unreadCount, configurePushNotifications } = useNotifications();
  
  // Initialiser les notifications admin si l'utilisateur est admin
  const { isInitialized: adminNotifInitialized } = useAdminNotifications();

  // Charger toutes les données nécessaires pour les notifications au démarrage de l'app
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Charger les données persistées des notifications
        await dispatch(loadPersistedNotificationsData());
        
        // Configurer les notifications push
        await configurePushNotifications();
        
        // Charger les données nécessaires pour les notifications
        const promises = [
          dispatch(fetchProducts()),
          dispatch(fetchFarms()),
          dispatch(fetchServices())
        ];
        
        // Charger les commandes si l'utilisateur est connecté
        if (user?.id) {
          promises.push(dispatch(fetchUserOrders(user.id)));
        }
        
        await Promise.all(promises);
        
      } catch (error) {
        console.error(' [NotificationManager] Erreur lors de l\'initialisation des notifications:', error);
      }
    };

    // Attendre un petit délai pour que l'app soit complètement initialisée
    const timer = setTimeout(initializeNotifications, 1000);
    
    return () => clearTimeout(timer);
  }, [dispatch, user?.id, configurePushNotifications]); // ✅ Suppression de unreadCount qui causait des re-renders constants

  // Recharger les données quand l'utilisateur change
  useEffect(() => {
    if (user?.id) {
      const reloadDataForNewUser = async () => {
        try {
          await dispatch(fetchUserOrders(user.id));
        } catch (error) {
          console.error(' [NotificationManager] Erreur lors du rechargement des données:', error);
        }
      };

      reloadDataForNewUser();
    }
  }, [user?.id, dispatch]);

  // 🔔 GESTION DES NOTIFICATIONS ADMIN - Actif partout dans l'app
  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    const isAdmin = user?.role === 'admin';
    
    if (!isAdmin || !adminNotifInitialized) return;

    const loadOrdersForAdminNotifications = async () => {
      try {
        await dispatch(fetchOrders());
      } catch (error) {
        console.error('[NotificationManager] Erreur lors du chargement des commandes admin:', error);
      }
    };

    // Charger immédiatement
    loadOrdersForAdminNotifications();
    
    // Recharger toutes les 5 minutes pour détecter les nouvelles commandes
    const interval = setInterval(loadOrdersForAdminNotifications, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [adminNotifInitialized, user?.role, dispatch]);

  // Ce composant ne rend rien, il gère juste les notifications en arrière-plan
  return null;
};

export default NotificationManager;
