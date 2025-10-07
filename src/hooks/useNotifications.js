import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setNotifications,
  markAsRead as markAsReadAction,
  markAllAsRead as markAllAsReadAction,
  markAsUnread as markAsUnreadAction,
  deleteNotification as deleteNotificationAction,
  addSentNotification,
  selectNotifications,
  selectUnreadCount,
  selectReadNotifications,
  selectDeletedNotifications,
  selectSentNotifications
} from '../store/notificationsSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { 
  selectClientProducts as selectProducts
} from '../store/client/productsSlice';
import { 
  selectClientFarms as selectFarms
} from '../store/client/farmsSlice';
import { 
  selectClientServices as selectServices
} from '../store/client/servicesSlice';
import { 
  selectOrders,
  fetchUserOrders
} from '../store/ordersSlice';

// Clés de stockage
const NOTIFICATIONS_STORAGE_KEY = '@dream_market_notifications';
const READ_NOTIFICATIONS_KEY = '@dream_market_read_notifications';
const DELETED_NOTIFICATIONS_KEY = '@dream_market_deleted_notifications';
const SENT_NOTIFICATIONS_KEY = '@dream_market_sent_notifications';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const farms = useSelector(selectFarms);
  const services = useSelector(selectServices);
  const orders = useSelector(selectOrders);
  
  // Utiliser le store Redux pour les notifications
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const readNotificationsArray = useSelector(selectReadNotifications);
  const deletedNotificationsArray = useSelector(selectDeletedNotifications);
  const sentNotificationsArray = useSelector(selectSentNotifications);
  
  // Créer des Sets seulement quand nécessaire, avec useMemo pour éviter les re-renders
  const readNotifications = useMemo(() => new Set(readNotificationsArray), [readNotificationsArray]);
  const deletedNotifications = useMemo(() => new Set(deletedNotificationsArray), [deletedNotificationsArray]);
  const sentNotifications = useMemo(() => new Set(sentNotificationsArray), [sentNotificationsArray]);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [previousNotifications, setPreviousNotifications] = useState([]);
  const previousOrderStatusesRef = useRef(new Map());

  // Les fonctions de persistance sont maintenant gérées par le slice Redux

  // Charger les données persistées au montage
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        // Les données persistées sont maintenant gérées par le slice Redux
        // Pas besoin de les charger ici car elles sont chargées par NotificationManager
        setIsInitialized(true);
      } catch (error) {
        console.error('Erreur lors du chargement des données persistées:', error);
        setIsInitialized(true);
      }
    };

    loadPersistedData();
  }, []);

  // Récupérer les commandes automatiquement pour détecter les changements de statut
  useEffect(() => {
    const fetchOrdersForNotifications = async () => {
      try {
        // Récupérer l'ID utilisateur depuis AsyncStorage
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          await dispatch(fetchUserOrders(storedUserId));
        }
      } catch (error) {
        console.error('❌ [Notifications] Erreur lors de la récupération des commandes:', error);
      }
    };

    if (isInitialized) {
      fetchOrdersForNotifications();
      
      // Récupérer les commandes toutes les 5 minutes pour détecter les changements (réduit de 30s à 5min)
      const interval = setInterval(fetchOrdersForNotifications, 300000);
      
      return () => clearInterval(interval);
    }
  }, [isInitialized, dispatch]);

  // Gérer les notifications reçues (clics sur les notifications push)
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      // Notification reçue - pas besoin de log
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      // Marquer la notification comme lue si elle a un ID
      if (data.notificationId) {
        dispatch(markAsReadAction(data.notificationId));
      }
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [readNotifications]);

  useEffect(() => {
    if (isInitialized) {
      generateNotifications();
    }
  }, [isInitialized, readNotifications, deletedNotifications]); // ✅ Suppression des données qui causaient des re-générations constantes

  const generateNotifications = () => {
    
    const generatedNotifications = [];

    // Notifications pour les promotions (produits avec old_price)
    const promotionalProducts = products.filter(product => 
      product.old_price && product.old_price > product.price && product.is_active
    );
    
    promotionalProducts.slice(0, 3).forEach(product => {
      const discount = Math.round(((product.old_price - product.price) / product.old_price) * 100);
      generatedNotifications.push({
        id: `promo_${product.id}`,
        type: 'promo',
        title: '🎉 Promotion spéciale !',
        message: `${discount}% de réduction sur ${product.name}`,
        time: getTimeAgo(product.created_at),
        isRead: false,
        action: 'Voir l\'offre',
        image: product.images?.[0] || null,
        data: { productId: product.id, product }
      });
    });

    // Notifications pour les nouveaux produits (is_new = true)
    const newProducts = products.filter(product => 
      product.is_new && product.is_active
    );
    
    newProducts.slice(0, 2).forEach(product => {
      generatedNotifications.push({
        id: `new_product_${product.id}`,
        type: 'product',
        title: '🥕 Nouveau produit disponible',
        message: `${product.name} est maintenant disponible`,
        time: getTimeAgo(product.created_at),
        isRead: false,
        action: 'Voir le produit',
        image: product.images?.[0] || null,
        data: { productId: product.id, product }
      });
    });

    // Notifications pour les nouvelles fermes
    const newFarms = farms.slice(0, 2);
    newFarms.forEach(farm => {
      generatedNotifications.push({
        id: `new_farm_${farm.id}`,
        type: 'farm',
        title: '🏡 Nouvelle ferme partenaire',
        message: `${farm.name} rejoint Dream Market`,
        time: getTimeAgo(farm.created_at),
        isRead: false,
        action: 'Découvrir la ferme',
        image: farm.main_image || null,
        data: { farmId: farm.id, farm }
      });
    });

    // Notifications pour les nouveaux services
    const newServices = services.filter(service => service.is_active).slice(0, 2);
    newServices.forEach(service => {
      generatedNotifications.push({
        id: `new_service_${service.id}`,
        type: 'service',
        title: '🚚 Nouveau service disponible',
        message: `${service.name} est maintenant disponible`,
        time: getTimeAgo(service.created_at),
        isRead: false,
        action: 'En savoir plus',
        image: service.image || null,
        data: { serviceId: service.id, service }
      });
    });

    // Notifications pour les commandes (changements de statut)
    const recentOrders = orders.filter(order => 
      ['confirmed', 'preparing', 'shipped', 'delivered'].includes(order.status)
    ).slice(0, 3);
    
    recentOrders.forEach(order => {
      // Vérifier si le statut a changé
      const previousStatus = previousOrderStatusesRef.current.get(order.id);
      const currentStatus = order.status;
      
      // Si c'est un changement de statut (pas la première fois)
      if (previousStatus && previousStatus !== currentStatus) {
        
        const statusMessages = {
          confirmed: 'Votre commande a été confirmée',
          preparing: 'Votre commande est en préparation',
          shipped: 'Votre commande a été expédiée',
          delivered: 'Votre commande a été livrée'
        };
        
        // Créer un ID unique basé sur l'ordre et le statut pour éviter les doublons
        const uniqueId = `order_status_${order.id}_${currentStatus}`;
        
        // Vérifier si cette notification de changement de statut a déjà été créée
        const alreadyExists = generatedNotifications.some(n => n.id === uniqueId);
        
        if (!alreadyExists) {
          generatedNotifications.push({
            id: uniqueId,
            type: 'order',
            title: '📦 Mise à jour de commande',
            message: `${statusMessages[currentStatus]} #${order.order_number}`,
            time: getTimeAgo(order.last_updated || order.created_at),
            isRead: false,
            action: 'Suivre ma commande',
            image: null,
            data: { orderId: order.id, order }
          });
        }
      }
    });

    // Trier par date de création (plus récentes en premier)
    generatedNotifications.sort((a, b) => {
      const dateA = new Date(a.data?.product?.created_at || a.data?.farm?.created_at || a.data?.service?.created_at || a.data?.order?.created_at || new Date());
      const dateB = new Date(b.data?.product?.created_at || b.data?.farm?.created_at || b.data?.service?.created_at || b.data?.order?.created_at || new Date());
      return dateB - dateA; // Plus récent en premier
    });

    // Filtrer les notifications supprimées
    const filteredNotifications = generatedNotifications.filter(
      notification => !deletedNotifications.has(notification.id)
    );

    // Marquer comme lues celles qui sont dans le set des notifications lues
    const notificationsWithReadStatus = filteredNotifications.map(notification => ({
      ...notification,
      isRead: readNotifications.has(notification.id)
    }));

    dispatch(setNotifications(notificationsWithReadStatus));

    // Détecter et notifier les nouvelles notifications
    detectAndNotifyNewNotifications(notificationsWithReadStatus);
    
    // Sauvegarder les notifications actuelles pour la prochaine comparaison
    setPreviousNotifications(notificationsWithReadStatus);
    
    // Sauvegarder les statuts des commandes actuels pour détecter les changements
    const currentOrderStatuses = new Map();
    orders.forEach(order => {
      currentOrderStatuses.set(order.id, order.status);
    });
    previousOrderStatusesRef.current = currentOrderStatuses;
  };

  // Fonction pour détecter les nouvelles notifications et envoyer des notifications push
  const detectAndNotifyNewNotifications = async (currentNotifications) => {
    // Si c'est la première génération, on sauvegarde juste les IDs pour éviter les doublons
    if (previousNotifications.length === 0) {
      // Les IDs sont maintenant gérés par le slice Redux
      return;
    }

    // Créer un Set des IDs des notifications précédentes
    const previousIds = new Set(previousNotifications.map(n => n.id));
    
    // Filtrer les nouvelles notifications (pas dans les précédentes ET pas déjà envoyées)
    const newNotifications = currentNotifications.filter(notification => {
      const isNew = !previousIds.has(notification.id);
      const notAlreadySent = !sentNotifications.has(notification.id);
      return isNew && notAlreadySent;
    });

    // Envoyer une notification push pour chaque nouvelle notification
    const newSentIds = new Set(sentNotifications);
    for (const notification of newNotifications) {
      try {
        await sendTestNotification(
          notification.title,
          notification.message,
          {
            type: notification.type,
            notificationId: notification.id,
            ...notification.data
          }
        );
        
        // Marquer comme envoyée
        newSentIds.add(notification.id);
        dispatch(addSentNotification(notification.id));
      } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de la notification push:', error);
      }
    }

    // Nettoyer les anciennes notifications envoyées (garder seulement les 100 plus récentes)
    if (newSentIds.size > 100) {
      const currentIds = new Set(currentNotifications.map(n => n.id));
      const cleanedSentIds = new Set([...newSentIds].filter(id => currentIds.has(id)));
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Récemment';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Il y a 1 jour';
    return `Il y a ${Math.floor(diffInHours / 24)} jours`;
  };

  const markAsRead = (notificationId) => {
    dispatch(markAsReadAction(notificationId));
  };

  const markAllAsRead = () => {
    dispatch(markAllAsReadAction());
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
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return false;
      }

      // Configuration du comportement des notifications
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la configuration des notifications:', error);
      return false;
    }
  };

  // Fonction pour envoyer une notification de test
  const sendTestNotification = async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data,
        },
        trigger: null, // Notification immédiate
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
    }
  };

  // Fonction pour planifier une notification
  const scheduleNotification = async (title, body, triggerDate, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data,
        },
        trigger: triggerDate,
      });
    } catch (error) {
      console.error('Erreur lors de la planification de la notification:', error);
    }
  };

  const resetSentNotifications = () => {
    // La réinitialisation est maintenant gérée par le slice Redux
  };

  const forceGenerateNotifications = () => {
    generateNotifications();
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    deleteNotification,
    generateNotifications,
    configurePushNotifications,
    sendTestNotification,
    scheduleNotification,
    resetSentNotifications,
    forceGenerateNotifications,
    // Fonctions pour les autres composants
    getNotifications: () => notifications,
    getUnreadCount: () => unreadCount
  };
};
