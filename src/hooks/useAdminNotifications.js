import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setNotifications,
  markAsRead as markAsReadAction,
  addSentNotification,
  selectNotifications,
  selectUnreadCount,
  selectSentNotifications
} from '../store/notificationsSlice';
import { selectAdminOrders } from '../store/admin/ordersSlice';
import * as Notifications from 'expo-notifications';

export const useAdminNotifications = () => {
  const dispatch = useDispatch();
  const adminOrders = useSelector(selectAdminOrders);
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const sentNotifications = useSelector(selectSentNotifications);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [previousOrders, setPreviousOrders] = useState([]);
  const previousOrderIdsRef = useRef(new Set());

  // Initialiser le hook
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Détecter les nouvelles commandes et générer les notifications
  useEffect(() => {
    if (isInitialized && adminOrders.length > 0) {
      generateAdminNotifications();
    }
  }, [isInitialized, adminOrders]);

  const generateAdminNotifications = () => {
    // Récupérer les IDs des commandes précédentes
    const currentOrderIds = new Set(adminOrders.map(order => order.id));
    const previousOrderIds = previousOrderIdsRef.current;
    
    // Trouver les nouvelles commandes (celles qui n'étaient pas dans la liste précédente)
    const newOrders = adminOrders.filter(order => !previousOrderIds.has(order.id));
    
    // Créer des notifications pour les nouvelles commandes
    const newOrderNotifications = newOrders.map(order => ({
      id: `admin_new_order_${order.id}`,
      type: 'admin_order',
      title: '🆕 Nouvelle commande reçue',
      message: `Commande #${order.orderNumber || order.order_number} de ${order.customerName}`,
      time: getTimeAgo(order.createdAt || order.date),
      isRead: false,
      action: 'Voir la commande',
      image: null,
      data: { 
        orderId: order.id, 
        order,
        adminAction: true // Marque comme action admin
      }
    }));

    // Créer des notifications pour les commandes en attente (si plus de 10 minutes)
    const pendingOrders = adminOrders.filter(order => 
      order.status === 'pending' && 
      isOrderPendingTooLong(order.createdAt || order.date)
    );

    const pendingNotifications = pendingOrders.map(order => ({
      id: `admin_pending_order_${order.id}`,
      type: 'admin_pending',
      title: '⏰ Commande en attente',
      message: `Commande #${order.orderNumber || order.order_number} attend confirmation depuis ${getTimeAgo(order.createdAt || order.date)}`,
      time: getTimeAgo(order.createdAt || order.date),
      isRead: false,
      action: 'Traiter la commande',
      image: null,
      data: { 
        orderId: order.id, 
        order,
        adminAction: true,
        urgent: true
      }
    }));

    // Combiner toutes les notifications admin
    const adminNotifications = [...newOrderNotifications, ...pendingNotifications];

    // Ajouter les notifications admin aux notifications existantes
    const existingNotifications = notifications.filter(n => n.type !== 'admin_order' && n.type !== 'admin_pending');
    const allNotifications = [...existingNotifications, ...adminNotifications];

    // Trier par date (plus récentes en premier)
    allNotifications.sort((a, b) => {
      const dateA = new Date(a.data?.order?.createdAt || a.data?.order?.date || new Date());
      const dateB = new Date(b.data?.order?.createdAt || b.data?.order?.date || new Date());
      return dateB - dateA;
    });

    // Mettre à jour les notifications
    dispatch(setNotifications(allNotifications));

    // Détecter et envoyer les nouvelles notifications
    detectAndNotifyNewAdminNotifications(adminNotifications);

    // Mettre à jour les références
    setPreviousOrders(adminOrders);
    previousOrderIdsRef.current = currentOrderIds;
  };

  const detectAndNotifyNewAdminNotifications = async (adminNotifications) => {
    // Filtrer les notifications qui n'ont pas encore été envoyées
    const newNotifications = adminNotifications.filter(notification => 
      !sentNotifications.includes(notification.id)
    );

    // Envoyer une notification push pour chaque nouvelle notification
    for (const notification of newNotifications) {
      try {
        await sendAdminNotification(
          notification.title,
          notification.message,
          {
            type: notification.type,
            notificationId: notification.id,
            urgent: notification.data?.urgent || false,
            ...notification.data
          }
        );
        
        // Marquer comme envoyée
        dispatch(addSentNotification(notification.id));
      } catch (error) {
        console.error('❌ [AdminNotifications] Erreur lors de l\'envoi:', error);
      }
    }
  };

  const isOrderPendingTooLong = (orderDate) => {
    if (!orderDate) return false;
    
    const orderTime = new Date(orderDate);
    const now = new Date();
    const diffInMinutes = (now - orderTime) / (1000 * 60);
    
    // Considérer comme "trop long" si plus de 10 minutes
    return diffInMinutes > 10;
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

  const sendAdminNotification = async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data,
          sound: data.urgent ? 'default' : 'default',
        },
        trigger: null, // Notification immédiate
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification admin:', error);
    }
  };

  const markAsRead = (notificationId) => {
    dispatch(markAsReadAction(notificationId));
  };

  const getAdminNotifications = () => {
    return notifications.filter(n => 
      n.type === 'admin_order' || n.type === 'admin_pending'
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
    isInitialized
  };
};
