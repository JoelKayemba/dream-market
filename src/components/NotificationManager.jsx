import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as Notifications from 'expo-notifications';
import {
  setIsInitialized
} from '../store/notificationsSlice';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useAdminNotifications } from '../hooks/useAdminNotifications';
import { registerExpoPushTokenForUser } from '../backend/services/pushTokenService';

const NotificationManager = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Initialiser les hooks de notifications selon le rôle de l'utilisateur
  const { configurePushNotifications } = useNotifications();
  useAdminNotifications();
  
  // Références pour éviter les re-renders infinis
  const hasInitializedRef = useRef(false);

  // Initialiser les notifications au démarrage de l'app
  useEffect(() => {
    if (hasInitializedRef.current) return; // Éviter les initialisations multiples
    
    const initializeNotifications = async () => {
      try {
        console.log('🔔 [NotificationManager] Initialisation des notifications...');
        
        // Configurer les notifications push
        await configurePushNotifications();
        
        // Marquer comme initialisé
        dispatch(setIsInitialized(true));
        hasInitializedRef.current = true;
        
      } catch (error) {
        console.error('🔔 [NotificationManager] Erreur lors de l\'initialisation des notifications:', error);
      }
    };

    // Attendre un petit délai pour que l'app soit complètement initialisée
    const timer = setTimeout(initializeNotifications, 1000);
    
    return () => clearTimeout(timer);
  }, []); // ✅ Pas de dépendances pour éviter les re-renders infinis

  // Enregistrer le jeton Expo Push côté Supabase (clients et admins) après connexion
  useEffect(() => {
    if (!user?.id) return undefined;

    const run = async () => {
      await registerExpoPushTokenForUser(user.id);
    };

    const timer = setTimeout(run, 1800);
    return () => clearTimeout(timer);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return undefined;

    const subscription = Notifications.addPushTokenListener(() => {
      registerExpoPushTokenForUser(user.id);
    });

    return () => subscription.remove();
  }, [user?.id]);

  // Ce composant ne rend rien : config locale + enregistrement du token pour push distant (Edge Function).
  return null;
};

export default NotificationManager;