/**
 * ⚠️ SERVICE DÉSACTIVÉ ⚠️
 * 
 * Ce service a été désactivé car il interfère avec la nouvelle architecture
 * de notifications basée sur Supabase. Les notifications sont maintenant
 * gérées par :
 * - notificationService.js (source unique de vérité)
 * - useNotifications.js (pour les clients)
 * - useAdminNotifications.js (pour les admins)
 * - Triggers SQL automatiques dans Supabase
 * 
 * Si vous avez besoin de notifications en arrière-plan, utilisez plutôt
 * le système de triggers SQL de Supabase qui est plus fiable et cohérent.
 */

import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

class BackgroundNotificationService {
  constructor() {
    this.isInitialized = false;
    this.adminUsers = new Set();
    this.lastCheckTime = null;
  }

  // Initialiser le service de notifications en arrière-plan
  async initialize() {
    console.warn('⚠️ [BackgroundNotificationService] Service désactivé - utilisez notificationService.js à la place');
    return false; // Service désactivé
  }

  // Demander les permissions de notification
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('❌ [BackgroundNotificationService] Permissions de notification refusées');
        return false;
      }

      console.log('✅ [BackgroundNotificationService] Permissions accordées');
      return true;
    } catch (error) {
      console.error('❌ [BackgroundNotificationService] Erreur lors de la demande de permissions:', error);
      return false;
    }
  }

  // Configurer la tâche de notification en arrière-plan
  configureBackgroundTask() {
    TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
      try {
        console.log('🔄 [BackgroundNotificationService] Exécution de la tâche en arrière-plan');
        
        // Vérifier si l'utilisateur est admin
        const isAdmin = await this.checkIfUserIsAdmin();
        if (!isAdmin) {
          console.log('ℹ️ [BackgroundNotificationService] Utilisateur non admin, arrêt de la tâche');
          return;
        }

        // Vérifier les nouvelles commandes
        await this.checkForNewOrders();
        
        console.log('✅ [BackgroundNotificationService] Tâche en arrière-plan terminée');
      } catch (error) {
        console.error('❌ [BackgroundNotificationService] Erreur dans la tâche en arrière-plan:', error);
      }
    });
  }

  // Enregistrer la tâche de notification en arrière-plan
  async registerBackgroundTask() {
    try {
      await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      console.log('✅ [BackgroundNotificationService] Tâche en arrière-plan enregistrée');
    } catch (error) {
      console.error('❌ [BackgroundNotificationService] Erreur lors de l\'enregistrement de la tâche:', error);
    }
  }

  // Démarrer le polling en arrière-plan
  startBackgroundPolling() {
    // Vérifier toutes les 5 minutes
    setInterval(async () => {
      try {
        const isAdmin = await this.checkIfUserIsAdmin();
        if (isAdmin) {
          await this.checkForNewOrders();
        }
      } catch (error) {
        console.error('❌ [BackgroundNotificationService] Erreur lors du polling:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Vérifier si l'utilisateur est admin
  async checkIfUserIsAdmin() {
    try {
      const userRole = await AsyncStorage.getItem('user_role');
      return userRole === 'admin';
    } catch (error) {
      console.error('❌ [BackgroundNotificationService] Erreur lors de la vérification du rôle:', error);
      return false;
    }
  }

  // Vérifier les nouvelles commandes
  async checkForNewOrders() {
    try {
      // Récupérer la dernière vérification
      const lastCheckTime = await AsyncStorage.getItem('last_order_check_time');
      const currentTime = new Date().toISOString();

      // Simuler un appel API pour récupérer les nouvelles commandes
      // Dans un vrai projet, ceci serait un appel à votre API
      const newOrders = await this.fetchNewOrders(lastCheckTime);

      if (newOrders.length > 0) {
        console.log(`🆕 [BackgroundNotificationService] ${newOrders.length} nouvelle(s) commande(s) détectée(s)`);
        
        // Envoyer une notification pour chaque nouvelle commande
        for (const order of newOrders) {
          await this.sendOrderNotification(order);
        }
      }

      // Mettre à jour le temps de dernière vérification
      await AsyncStorage.setItem('last_order_check_time', currentTime);
    } catch (error) {
      console.error('❌ [BackgroundNotificationService] Erreur lors de la vérification des commandes:', error);
    }
  }

  // Simuler la récupération des nouvelles commandes
  async fetchNewOrders(lastCheckTime) {
    try {
      // Dans un vrai projet, ceci serait un appel à votre API Supabase
      // const { data, error } = await supabase
      //   .from('orders')
      //   .select('*')
      //   .gte('created_at', lastCheckTime)
      //   .order('created_at', { ascending: false });

      // Pour la démonstration, simuler quelques nouvelles commandes
      const mockOrders = [
        {
          id: `order_${Date.now()}`,
          orderNumber: `CMD${Math.floor(Math.random() * 1000)}`,
          customerName: 'Client Test',
          total: 45.50,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];

      return mockOrders;
    } catch (error) {
      console.error('❌ [BackgroundNotificationService] Erreur lors de la récupération des commandes:', error);
      return [];
    }
  }

  // Envoyer une notification pour une commande
  async sendOrderNotification(order) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🆕 Nouvelle commande reçue',
          body: `Commande #${order.orderNumber} de ${order.customerName} - ${order.total}€`,
          data: {
            type: 'admin_order',
            orderId: order.id,
            orderNumber: order.orderNumber,
            urgent: true
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Notification immédiate
      });

      console.log(`✅ [BackgroundNotificationService] Notification envoyée pour la commande ${order.orderNumber}`);
    } catch (error) {
      console.error('❌ [BackgroundNotificationService] Erreur lors de l\'envoi de la notification:', error);
    }
  }

  // Envoyer une notification de test
  async sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test de notification',
          body: 'Ceci est une notification de test depuis l\'arrière-plan',
          data: {
            type: 'test',
            timestamp: new Date().toISOString()
          },
        },
        trigger: null,
      });

      console.log('✅ [BackgroundNotificationService] Notification de test envoyée');
    } catch (error) {
      console.error('❌ [BackgroundNotificationService] Erreur lors de l\'envoi de la notification de test:', error);
    }
  }

  // Arrêter le service
  async stop() {
    try {
      await Notifications.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      this.isInitialized = false;
      console.log('✅ [BackgroundNotificationService] Service arrêté');
    } catch (error) {
      console.error('❌ [BackgroundNotificationService] Erreur lors de l\'arrêt du service:', error);
    }
  }
}

// Instance singleton
const backgroundNotificationService = new BackgroundNotificationService();

export default backgroundNotificationService;
