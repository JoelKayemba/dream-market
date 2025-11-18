/**
 * Service de notifications en arrière-plan pour les admins
 * Utilise Expo Notifications et TaskManager pour les notifications push
 * 
 * ⚠️ IMPORTANT : Pour que les notifications en arrière-plan fonctionnent,
 * vous devez :
 * 1. Avoir configuré le plugin expo-notifications dans app.json
 * 2. Avoir ajouté UIBackgroundModes dans app.json pour iOS
 * 3. Reconstruire l'application avec `npx expo prebuild` ou `eas build`
 * 
 * Si les notifications en arrière-plan ne sont pas configurées, le service
 * fonctionnera quand même en mode foreground (quand l'app est ouverte).
 */

import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../backend/services/notificationService';

// Nom de la tâche de notification en arrière-plan
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

// Variable pour vérifier si la tâche est déjà définie
let isTaskDefined = false;

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Fonction pour définir la tâche en arrière-plan (appelée seulement une fois)
function defineBackgroundTask() {
  // Vérifier si la tâche est déjà définie pour éviter les erreurs
  if (isTaskDefined) {
    console.warn('⚠️ [BackgroundNotificationService] Tâche déjà définie');
    return;
  }

  try {
    // Définir la tâche en arrière-plan
    TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
      if (error) {
        console.error('❌ [BackgroundNotificationService] Erreur de tâche:', error);
        return;
      }

      try {
        console.log('🔔 [BackgroundNotificationService] Tâche en arrière-plan exécutée');
        
        // Récupérer l'ID de l'utilisateur depuis AsyncStorage
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
    
    isTaskDefined = true;
    console.log('✅ [BackgroundNotificationService] Tâche définie avec succès');
  } catch (taskError) {
    console.error('❌ [BackgroundNotificationService] Erreur lors de la définition de la tâche:', taskError);
    // Ne pas bloquer si la définition échoue
  }
}

class BackgroundNotificationService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('🔔 [BackgroundNotificationService] Initialisation...');
      
      // Vérifier si TaskManager est disponible
      if (!TaskManager || typeof TaskManager.defineTask !== 'function') {
        console.warn('⚠️ [BackgroundNotificationService] TaskManager non disponible');
        this.isInitialized = false;
        return false;
      }
      
      // Vérifier si on est dans Expo Go (SDK 53+ ne supporte pas les push Android)
      const isExpoGo = Constants?.executionEnvironment === 'storeClient' || 
                       (typeof __DEV__ !== 'undefined' && __DEV__ && !Constants?.isDevice);
      
      if (isExpoGo) {
        console.warn('⚠️ [BackgroundNotificationService] Expo Go détecté');
        console.warn('📱 Les notifications push Android ne sont pas disponibles dans Expo Go (SDK 53+)');
        console.warn('💡 Pour tester les notifications push, utilisez un development build:');
        console.warn('   - `npx expo run:android` pour un build local');
        console.warn('   - `eas build --profile development --platform android` pour un build EAS');
        console.warn('   - Documentation: https://docs.expo.dev/develop/development-builds/introduction/');
        // Ne pas initialiser dans Expo Go pour éviter les erreurs
        this.isInitialized = false;
        return false;
      }
      
      // Définir la tâche en arrière-plan (seulement une fois)
      defineBackgroundTask();
      
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
        console.log('✅ [BackgroundNotificationService] Canal Android configuré');
      } catch (channelError) {
        // Ignorer l'erreur si on n'est pas sur Android
        const errorMsg = channelError?.message || String(channelError);
        if (!errorMsg.includes('Android') && !errorMsg.includes('Expo Go')) {
          console.warn('⚠️ [BackgroundNotificationService] Erreur configuration canal Android:', errorMsg);
        }
      }
      
      // Demander les permissions
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: false,
          },
        });
        if (newStatus !== 'granted') {
          console.warn('⚠️ [BackgroundNotificationService] Permissions refusées');
          return false;
        }
      }

      // Enregistrer la tâche en arrière-plan (optionnel, peut échouer si non configuré)
      try {
        await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
        console.log('✅ [BackgroundNotificationService] Tâche en arrière-plan enregistrée');
      } catch (taskError) {
        // Si les notifications en arrière-plan ne sont pas configurées, continuer quand même
        // Les notifications fonctionneront en mode foreground
        const errorMessage = taskError?.message || String(taskError);
        if (errorMessage.includes('Background remote notifications') || 
            errorMessage.includes('not been configured') ||
            errorMessage.includes('UIBackgroundModes') ||
            errorMessage.includes('Expo Go') ||
            errorMessage.includes('SDK 53')) {
          console.warn('⚠️ [BackgroundNotificationService] Notifications en arrière-plan non disponibles.');
          console.warn('💡 Raisons possibles:');
          console.warn('   - Utilisation d\'Expo Go (utilisez un development build)');
          console.warn('   - UIBackgroundModes non configuré dans app.json pour iOS');
          console.warn('   - App non reconstruite après configuration');
          console.warn('   Solutions: `npx expo prebuild` ou `eas build`');
        } else {
          console.warn('⚠️ [BackgroundNotificationService] Erreur lors de l\'enregistrement de la tâche:', errorMessage);
        }
      }
      
      this.isInitialized = true;
      console.log('✅ [BackgroundNotificationService] Initialisé avec succès');
      return true;
      
    } catch (error) {
      const errorMsg = error?.message || String(error);
      // Masquer les erreurs spécifiques à Expo Go
      if (errorMsg.includes('Expo Go') || errorMsg.includes('SDK 53') || errorMsg.includes('removed from Expo Go')) {
        console.warn('⚠️ [BackgroundNotificationService] Notifications push non disponibles dans Expo Go');
        console.warn('💡 Utilisez un development build pour tester les notifications push');
        this.isInitialized = false;
        return false;
      }
      console.error('❌ [BackgroundNotificationService] Erreur lors de l\'initialisation:', error);
      // Ne pas bloquer l'application si les notifications échouent
      this.isInitialized = false;
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


