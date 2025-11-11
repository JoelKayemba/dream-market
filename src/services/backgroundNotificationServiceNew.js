/**
 * Service de notifications en arrière-plan pour les admins
 * Utilise Expo Notifications et TaskManager pour les notifications push
 */

import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { notificationService } from '../backend/services/notificationService';

// Nom de la tâche de notification en arrière-plan
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Définir la tâche en arrière-plan
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('❌ [BackgroundNotificationService] Erreur de tâche:', error);
    return;
  }

  try {
    console.log('🔔 [BackgroundNotificationService] Tâche en arrière-plan exécutée');
    
    // Récupérer l'ID de l'utilisateur depuis AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userId = await AsyncStorage.getItem('user_id');
    
    if (!userId) {
      console.log('🔔 [BackgroundNotificationService] Pas d\'utilisateur connecté');
      return;
    }

    // Vérifier si l'utilisateur est admin
    const userRole = await AsyncStorage.getItem('user_role');
    if (userRole !== 'admin') {
      console.log('🔔 [BackgroundNotificationService] Utilisateur non admin');
      return;
    }

    // Récupérer les notifications non envoyées pour les admins
    const unsentNotifications = await notificationService.getUnsentNotifications(userId, null, 'admin');
    
    console.log(`🔔 [BackgroundNotificationService] ${unsentNotifications.length} notifications non envoyées trouvées`);
    
    // Envoyer les notifications push
    for (const notification of unsentNotifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          data: {
            notificationId: notification.id,
            orderId: notification.order_id,
            adminAction: true,
            urgent: notification.type === 'admin_pending_order',
            ...notification.data
          }
        },
        trigger: null // Envoyer immédiatement
      });
      
      // Marquer comme envoyée
      await notificationService.markNotificationAsSent(notification.id);
      
      console.log(`✅ [BackgroundNotificationService] Notification envoyée: ${notification.id}`);
    }
    
  } catch (error) {
    console.error('❌ [BackgroundNotificationService] Erreur lors de l\'exécution:', error);
  }
});

class BackgroundNotificationService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('🔔 [BackgroundNotificationService] Initialisation...');
      
      // Demander les permissions
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          console.warn('⚠️ [BackgroundNotificationService] Permissions refusées');
          return false;
        }
      }

      // Enregistrer la tâche en arrière-plan
      await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      
      this.isInitialized = true;
      console.log('✅ [BackgroundNotificationService] Initialisé avec succès');
      return true;
      
    } catch (error) {
      console.error('❌ [BackgroundNotificationService] Erreur lors de l\'initialisation:', error);
      return false;
    }
  }

  async startBackgroundTask() {
    if (!this.isInitialized) {
      console.warn('⚠️ [BackgroundNotificationService] Service non initialisé');
      return false;
    }

    try {
      console.log('🔔 [BackgroundNotificationService] Démarrage de la tâche en arrière-plan...');
      
      // Programmer une tâche périodique (toutes les 15 minutes)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Vérification des notifications',
          body: 'Vérification des nouvelles commandes...',
          data: { task: BACKGROUND_NOTIFICATION_TASK }
        },
        trigger: {
          seconds: 15 * 60, // 15 minutes
          repeats: true
        }
      });
      
      console.log('✅ [BackgroundNotificationService] Tâche en arrière-plan démarrée');
      return true;
      
    } catch (error) {
      console.error('❌ [BackgroundNotificationService] Erreur lors du démarrage:', error);
      return false;
    }
  }

  async stopBackgroundTask() {
    try {
      console.log('🔔 [BackgroundNotificationService] Arrêt de la tâche en arrière-plan...');
      
      // Annuler toutes les notifications programmées
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      console.log('✅ [BackgroundNotificationService] Tâche en arrière-plan arrêtée');
      return true;
      
    } catch (error) {
      console.error('❌ [BackgroundNotificationService] Erreur lors de l\'arrêt:', error);
      return false;
    }
  }
}

// Instance singleton
const backgroundNotificationService = new BackgroundNotificationService();

export default backgroundNotificationService;


