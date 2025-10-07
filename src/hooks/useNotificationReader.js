import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

// Clés de stockage
const READ_NOTIFICATIONS_KEY = '@dream_market_read_notifications';
const DELETED_NOTIFICATIONS_KEY = '@dream_market_deleted_notifications';

// Hook pour seulement lire les notifications sans les générer
export const useNotificationReader = () => {
  const [readNotifications, setReadNotifications] = useState(new Set());
  const [deletedNotifications, setDeletedNotifications] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // Fonctions de persistance
  const loadFromStorage = async (key) => {
    try {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        return new Set(JSON.parse(data));
      }
      return new Set();
    } catch (error) {
      console.error(`Erreur lors du chargement de ${key}:`, error);
      return new Set();
    }
  };

  const saveToStorage = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(Array.from(data)));
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de ${key}:`, error);
    }
  };

  // Charger les données persistées au montage
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const [readData, deletedData] = await Promise.all([
          loadFromStorage(READ_NOTIFICATIONS_KEY),
          loadFromStorage(DELETED_NOTIFICATIONS_KEY)
        ]);

        setReadNotifications(readData);
        setDeletedNotifications(deletedData);
        setIsInitialized(true);
      } catch (error) {
        console.error('Erreur lors du chargement des données persistées:', error);
        setIsInitialized(true);
      }
    };

    loadPersistedData();
  }, []);

  const markAsRead = (notificationId) => {
    const newReadNotifications = new Set([...readNotifications, notificationId]);
    setReadNotifications(newReadNotifications);
    saveToStorage(READ_NOTIFICATIONS_KEY, newReadNotifications);
  };

  const markAllAsRead = () => {
    // Cette fonction sera implémentée différemment selon le contexte
    console.log('markAllAsRead appelé depuis useNotificationReader');
  };

  const markAsUnread = (notificationId) => {
    const newReadNotifications = new Set([...readNotifications]);
    newReadNotifications.delete(notificationId);
    setReadNotifications(newReadNotifications);
    saveToStorage(READ_NOTIFICATIONS_KEY, newReadNotifications);
  };

  const deleteNotification = (notificationId) => {
    const newDeletedNotifications = new Set([...deletedNotifications, notificationId]);
    setDeletedNotifications(newDeletedNotifications);
    saveToStorage(DELETED_NOTIFICATIONS_KEY, newDeletedNotifications);
  };

  return {
    readNotifications,
    deletedNotifications,
    isInitialized,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    deleteNotification
  };
};
