import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setNotifications,
  markAsRead as markAsReadAction,
  markAllAsRead as markAllAsReadAction,
  markAsUnread as markAsUnreadAction,
  deleteNotification as deleteNotificationAction,
  selectNotifications,
  selectUnreadCount,
  selectClientNotifications
} from '../store/notificationsSlice';
import { notificationService } from '../backend/services/notificationService';
import { useAuth } from './useAuth';
import * as Notifications from 'expo-notifications';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Utiliser le store Redux pour les notifications
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const clientNotifications = useSelector(selectClientNotifications);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const subscriptionRef = useRef(null);

  // Initialiser le hook et charger les notifications depuis Supabase
  useEffect(() => {
    if (user?.id && user?.role !== 'admin') {
      initializeClientNotifications();
    } else {
      setIsInitialized(false);
      if (subscriptionRef.current) {
        notificationService.unsubscribeFromNotifications(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    }

    return () => {
      if (subscriptionRef.current) {
        notificationService.unsubscribeFromNotifications(subscriptionRef.current);
      }
    };
  }, [user?.id, user?.role]);

  const initializeClientNotifications = async () => {
    try {
      setIsLoading(true);

      // Charger les notifications existantes depuis Supabase
      await loadClientNotifications();

      // S'abonner aux nouvelles notifications en temps réel
      setupRealtimeSubscription();

      setIsInitialized(true);
      } catch (error) {
      console.error('❌ [useNotifications] Erreur lors de l\'initialisation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClientNotifications = async () => {
    try {
      if (!user?.id) return;

      // Charger les notifications depuis Supabase (clients seulement)
      const dbNotifications = await notificationService.getClientNotifications(user.id);
      
      // Convertir au format attendu par l'UI
      const formattedNotifications = dbNotifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        time: getTimeAgo(notification.created_at),
        isRead: notification.is_read,
        action: getActionForType(notification.type),
        image: null,
        data: {
          ...notification.data,
          notificationId: notification.id,
          orderId: notification.order_id
        }
      }));

      // Mettre à jour le store Redux (push système : Edge Function + Expo)
      dispatch(setNotifications(formattedNotifications));
    } catch (error) {
      console.error('❌ [useNotifications] Erreur lors du chargement:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user?.id || subscriptionRef.current) return;

    subscriptionRef.current = notificationService.subscribeToNotifications(
      user.id,
      (payload) => {
        
        // Recharger les notifications quand une nouvelle arrive
        loadClientNotifications();
      },
      'client' // Spécifier le rôle pour filtrer les notifications
    );
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Récemment';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return `Il y a ${Math.floor(diffInHours / 24)} jour(s)`;
  };

  const getActionForType = (type) => {
    switch (type) {
      case 'order_confirmed':
        return 'Voir ma commande';
      case 'order_preparing':
        return 'Suivre ma commande';
      case 'order_shipped':
        return 'Suivre ma commande';
      case 'order_delivered':
        return 'Voir ma commande';
      case 'order_cancelled':
        return 'Voir ma commande';
      case 'promo':
        return 'Voir l\'offre';
      default:
        return 'Voir les détails';
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Mettre à jour dans Supabase
      await notificationService.markNotificationAsRead(notificationId);
      
      // Mettre à jour localement
    dispatch(markAsReadAction(notificationId));
    } catch (error) {
      console.error('❌ [useNotifications] Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!user?.id) return;
      
      // Mettre à jour dans Supabase
      await notificationService.markAllNotificationsAsRead(user.id);
      
      // Mettre à jour localement - on recharge les notifications
      await loadClientNotifications();
    } catch (error) {
      console.error('❌ [useNotifications] Erreur lors du marquage de tout comme lu:', error);
    }
  };

  const markAsUnread = (notificationId) => {
    dispatch(markAsUnreadAction(notificationId));
  };

  const deleteNotification = (notificationId) => {
    dispatch(deleteNotificationAction(notificationId));
  };

  // Configuration des notifications push
  const configurePushNotifications = async () => {
    try {
      // Vérifier si on est dans Expo Go (SDK 53+ ne supporte pas les push Android)
      const Constants = require('expo-constants').default;
      const isExpoGo = Constants?.executionEnvironment === 'storeClient' || 
                       (typeof __DEV__ !== 'undefined' && __DEV__ && !Constants?.isDevice);
      
      if (isExpoGo) {
        console.warn('⚠️ [useNotifications] Expo Go détecté - Les notifications push Android ne sont pas disponibles');
        console.warn('💡 Utilisez un development build pour tester les notifications push');
        return false;
      }

      // Configurer le canal de notification Android
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Notifications Dream Market',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2F8F46',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      } catch (channelError) {
        // Ignorer l'erreur si on n'est pas sur Android ou dans Expo Go
        const errorMsg = channelError?.message || String(channelError);
        if (!errorMsg.includes('Android') && !errorMsg.includes('Expo Go')) {
          console.warn('⚠️ [useNotifications] Erreur configuration canal Android:', errorMsg);
        }
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: false,
          },
        });
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('⚠️ [useNotifications] Permissions de notification refusées');
        return false;
      }

      // Configuration du comportement des notifications
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      console.log('✅ [useNotifications] Notifications push configurées avec succès');
      return true;
    } catch (error) {
      console.error('❌ [useNotifications] Erreur lors de la configuration des notifications:', error);
      return false;
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    deleteNotification,
    configurePushNotifications,
    isInitialized,
    isLoading,
    loadClientNotifications, // Fonction pour recharger manuellement
  };
};
