import { createSlice, createSelector } from '@reduxjs/toolkit';

/**
 * Slice Redux simplifié pour les notifications
 * Maintenant que nous utilisons Supabase comme source unique de vérité,
 * ce slice ne gère que l'état local temporaire pour l'UI
 */
const initialState = {
  notifications: [],
  unreadCount: 0,
  isInitialized: false,
  isLoading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Actions pour la gestion des notifications depuis Supabase
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
      state.error = null;
    },
    
    setIsInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Actions pour les mises à jour locales (optimistic updates)
    markAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },
    
    markAsUnread: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && notification.isRead) {
        notification.isRead = false;
        state.unreadCount += 1;
      }
    },
    
    deleteNotification: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        state.notifications = state.notifications.filter(n => n.id !== notificationId);
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    
    addNotification: (state, action) => {
      const newNotification = action.payload;
      state.notifications.unshift(newNotification);
      if (!newNotification.isRead) {
        state.unreadCount += 1;
      }
    },
    
    updateNotification: (state, action) => {
      const { id, updates } = action.payload;
      const notification = state.notifications.find(n => n.id === id);
      if (notification) {
        const wasUnread = !notification.isRead;
        Object.assign(notification, updates);
        const isNowUnread = !notification.isRead;
        
        // Ajuster le compteur si le statut de lecture a changé
        if (wasUnread && isNowUnread) {
          // Rien à faire
        } else if (wasUnread && !isNowUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && isNowUnread) {
          state.unreadCount += 1;
        }
      }
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
    },
    
    resetNotificationsState: () => initialState,
  },
});

export const {
  setNotifications,
  setIsInitialized,
  setIsLoading,
  setError,
  markAsRead,
  markAllAsRead,
  markAsUnread,
  deleteNotification,
  addNotification,
  updateNotification,
  clearNotifications,
  resetNotificationsState,
} = notificationsSlice.actions;

// Sélecteurs optimisés
export const selectNotifications = (state) => state.notifications?.notifications || [];
export const selectUnreadCount = (state) => state.notifications?.unreadCount || 0;
export const selectNotificationsInitialized = (state) => state.notifications?.isInitialized || false;
export const selectNotificationsLoading = (state) => state.notifications?.isLoading || false;
export const selectNotificationsError = (state) => state.notifications?.error || null;

// Sélecteurs mémorisés pour éviter les re-renders inutiles
export const selectAdminNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter(n => n.type?.startsWith('admin_'))
);

export const selectClientNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter(n => !n.type?.startsWith('admin_'))
);

export const selectUnreadNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter(n => !n.isRead)
);

export const selectReadNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter(n => n.isRead)
);

export const selectNotificationsByType = (type) => createSelector(
  [selectNotifications],
  (notifications) => notifications.filter(n => n.type === type)
);

export default notificationsSlice.reducer;
