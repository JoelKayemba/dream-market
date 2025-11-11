import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { 
  setIsInitialized
} from '../store/notificationsSlice';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useAdminNotifications } from '../hooks/useAdminNotifications';

const NotificationManager = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Initialiser les hooks de notifications selon le rôle de l'utilisateur
  const { configurePushNotifications } = useNotifications();
  const { isInitialized: adminNotifInitialized } = useAdminNotifications();
  
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

  // Ce composant ne rend rien, il gère juste les notifications en arrière-plan
  // Les hooks useNotifications et useAdminNotifications se chargent de tout :
  // - Chargement depuis Supabase
  // - Abonnement temps réel
  // - Envoi des notifications push
  // - Gestion des notifications déjà envoyées
  return null;
};

export default NotificationManager;