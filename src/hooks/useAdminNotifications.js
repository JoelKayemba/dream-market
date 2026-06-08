import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setNotifications,
  markAsRead as markAsReadAction,
  markAllAsRead as markAllAsReadAction,
  selectNotifications,
  selectUnreadCount,
  selectAdminNotifications
} from '../store/notificationsSlice';
import { notificationService } from '../backend/services/notificationService';
import { useAuth } from './useAuth';

export const useAdminNotifications = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const adminNotifications = useSelector(selectAdminNotifications);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const subscriptionRef = useRef(null);
  const lastCheckTimeRef = useRef(new Date().toISOString());

  // Initialiser le hook et charger les notifications
  useEffect(() => {
    if (user?.id && user?.role === 'admin') {
      initializeAdminNotifications();
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
        subscriptionRef.current = null;
      }
    };
  }, [user?.id, user?.role]);

  const initializeAdminNotifications = async () => {
    try {
      setIsLoading(true);

      // Charger les notifications existantes
      await loadAdminNotifications();

      // S'abonner aux nouvelles notifications en temps réel
      setupRealtimeSubscription();

      setIsInitialized(true);
    } catch (error) {
      console.error('❌ [useAdminNotifications] Erreur lors de l\'initialisation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminNotifications = async () => {
    try {
      if (!user?.id) {
        return;
      }

      // Charger les notifications depuis Supabase (admins seulement)
      const dbNotifications = await notificationService.getAdminNotifications(user.id);
      
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
          orderId: notification.order_id,
          adminAction: notification.type.startsWith('admin_')
        }
      }));

      // Mettre à jour le store Redux
      dispatch(setNotifications(formattedNotifications));
    } catch (error) {
      console.error('❌ [useAdminNotifications] Erreur lors du chargement:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user?.id) {
      return;
    }
    
    if (subscriptionRef.current) {
      return;
    }

    subscriptionRef.current = notificationService.subscribeToNotifications(
      user.id,
      (payload) => {
        
        // Recharger les notifications quand une nouvelle arrive
        if (user?.id) {
          loadAdminNotifications();
        }
      },
      'admin' // Spécifier le rôle pour filtrer les notifications
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
      case 'admin_new_order':
        return 'Voir la commande';
      case 'admin_pending_order':
        return 'Traiter la commande';
      case 'admin_order':
        return 'Voir la commande';
      case 'admin_pending':
        return 'Traiter la commande';
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
      console.error('❌ [useAdminNotifications] Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!user?.id) return;
      
      // Mettre à jour dans Supabase
      await notificationService.markAllNotificationsAsRead(user.id);
      
      // Mettre à jour localement - on recharge les notifications
      await loadAdminNotifications();
    } catch (error) {
      console.error('❌ [useAdminNotifications] Erreur lors du marquage de tout comme lu:', error);
    }
  };

  const getAdminNotifications = () => {
    return notifications.filter(n => 
      n.type?.startsWith('admin_') || n.data?.adminAction === true
    );
  };

  const getUnreadAdminNotifications = () => {
    return getAdminNotifications().filter(n => !n.isRead);
  };

  const getUnreadAdminCount = () => {
    return getUnreadAdminNotifications().length;
  };

  return {
    adminNotifications: getAdminNotifications(),
    unreadAdminNotifications: getUnreadAdminNotifications(),
    unreadAdminCount: getUnreadAdminCount(),
    markAsRead,
    markAllAsRead,
    isInitialized,
    isLoading,
    loadAdminNotifications, // Fonction pour recharger manuellement
  };
};