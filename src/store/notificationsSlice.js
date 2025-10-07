import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clés de stockage
const READ_NOTIFICATIONS_KEY = '@dream_market_read_notifications';
const DELETED_NOTIFICATIONS_KEY = '@dream_market_deleted_notifications';
const SENT_NOTIFICATIONS_KEY = '@dream_market_sent_notifications';

const initialState = {
  notifications: [],
  unreadCount: 0,
  readNotifications: [],
  deletedNotifications: [],
  sentNotifications: [],
  isInitialized: false,
};

// Fonctions de persistance
const loadFromStorage = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error(`Erreur lors du chargement de ${key}:`, error);
    return [];
  }
};

const saveToStorage = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde de ${key}:`, error);
  }
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    setReadNotifications: (state, action) => {
      state.readNotifications = action.payload;
    },
    setDeletedNotifications: (state, action) => {
      state.deletedNotifications = action.payload;
    },
    setSentNotifications: (state, action) => {
      state.sentNotifications = action.payload;
    },
    setIsInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    markAsRead: (state, action) => {
      const notificationId = action.payload;
      if (!state.readNotifications.includes(notificationId)) {
        state.readNotifications.push(notificationId);
      }
      
      // Mettre à jour le statut dans les notifications
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }
      
      // Recalculer le nombre de notifications non lues
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
      
      // Sauvegarder
      saveToStorage(READ_NOTIFICATIONS_KEY, state.readNotifications);
    },
    markAllAsRead: (state) => {
      state.readNotifications = state.notifications.map(n => n.id);
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
      
      // Sauvegarder
      saveToStorage(READ_NOTIFICATIONS_KEY, state.readNotifications);
    },
    markAsUnread: (state, action) => {
      const notificationId = action.payload;
      state.readNotifications = state.readNotifications.filter(id => id !== notificationId);
      
      // Mettre à jour le statut dans les notifications
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = false;
      }
      
      // Recalculer le nombre de notifications non lues
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
      
      // Sauvegarder
      saveToStorage(READ_NOTIFICATIONS_KEY, state.readNotifications);
    },
    deleteNotification: (state, action) => {
      const notificationId = action.payload;
      if (!state.deletedNotifications.includes(notificationId)) {
        state.deletedNotifications.push(notificationId);
      }
      
      // Supprimer de la liste des notifications
      state.notifications = state.notifications.filter(n => n.id !== notificationId);
      state.readNotifications = state.readNotifications.filter(id => id !== notificationId);
      
      // Recalculer le nombre de notifications non lues
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
      
      // Sauvegarder
      saveToStorage(DELETED_NOTIFICATIONS_KEY, state.deletedNotifications);
      saveToStorage(READ_NOTIFICATIONS_KEY, state.readNotifications);
    },
    addSentNotification: (state, action) => {
      const notificationId = action.payload;
      if (!state.sentNotifications.includes(notificationId)) {
        state.sentNotifications.push(notificationId);
      }
      saveToStorage(SENT_NOTIFICATIONS_KEY, state.sentNotifications);
    },
    loadPersistedData: (state, action) => {
      const { readData, deletedData, sentData } = action.payload;
      state.readNotifications = readData;
      state.deletedNotifications = deletedData;
      state.sentNotifications = sentData;
      state.isInitialized = true;
    }
  },
});

export const {
  setNotifications,
  setReadNotifications,
  setDeletedNotifications,
  setSentNotifications,
  setIsInitialized,
  markAsRead,
  markAllAsRead,
  markAsUnread,
  deleteNotification,
  addSentNotification,
  loadPersistedData
} = notificationsSlice.actions;

// Sélecteurs - retourner directement les arrays pour éviter les re-renders
export const selectNotifications = (state) => state.notifications?.notifications || [];
export const selectUnreadCount = (state) => state.notifications?.unreadCount || 0;
export const selectReadNotifications = (state) => state.notifications?.readNotifications || [];
export const selectDeletedNotifications = (state) => state.notifications?.deletedNotifications || [];
export const selectSentNotifications = (state) => state.notifications?.sentNotifications || [];
export const selectNotificationsInitialized = (state) => state.notifications?.isInitialized || false;

// Action async pour charger les données persistées
export const loadPersistedNotificationsData = () => async (dispatch) => {
  try {
    const [readData, deletedData, sentData] = await Promise.all([
      loadFromStorage(READ_NOTIFICATIONS_KEY),
      loadFromStorage(DELETED_NOTIFICATIONS_KEY),
      loadFromStorage(SENT_NOTIFICATIONS_KEY)
    ]);

    dispatch(loadPersistedData({ readData, deletedData, sentData }));
  } catch (error) {
    console.error('Erreur lors du chargement des données persistées:', error);
  }
};

export default notificationsSlice.reducer;
