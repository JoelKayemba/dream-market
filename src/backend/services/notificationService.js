import { supabase, TABLES } from '../config/supabase';

/**
 * Service unifié de gestion des notifications
 * Source unique de vérité pour toutes les notifications (admin et client)
 */
class NotificationService {
  /**
   * Récupérer toutes les notifications pour un utilisateur (admin et client)
   */
  async getUserNotifications(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .select(`
          *,
          orders (
            id,
            order_number,
            totals,
            status,
            user_id
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  }

  /**
   * Récupérer les notifications pour les clients uniquement
   */
  async getClientNotifications(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .select(`
          *,
          orders (
            id,
            order_number,
            totals,
            status,
            user_id
          )
        `)
        .eq('user_id', userId)
        .not('type', 'like', 'admin_%')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('🔔 [notificationService] Erreur Supabase pour notifications client:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications client:', error);
      throw error;
    }
  }

  /**
   * Récupérer les notifications pour les admins uniquement
   */
  async getAdminNotifications(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .select(`
          *,
          orders (
            id,
            order_number,
            totals,
            status,
            user_id
          )
        `)
        .eq('user_id', userId)
        .like('type', 'admin_%')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('🔔 [notificationService] Erreur Supabase:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications admin:', error);
      throw error;
    }
  }

  /**
   * Récupérer les nouvelles notifications non envoyées pour un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {string} type - Type spécifique de notification (optionnel)
   * @param {string} userRole - Rôle de l'utilisateur ('admin' ou 'client')
   * @param {number} limit - Nombre maximum de notifications à récupérer
   */
  async getUnsentNotifications(userId, type = null, userRole = null, limit = 20) {
    try {
      let query = supabase
        .from(TABLES.NOTIFICATIONS)
        .select('*')
        .eq('user_id', userId)
        .eq('is_sent', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Filtrer par type si fourni
      if (type) {
        query = query.eq('type', type);
      } else if (userRole === 'admin') {
        // Pour les admins, récupérer seulement les notifications admin
        query = query.like('type', 'admin_%');
      } else if (userRole === 'client') {
        // Pour les clients, exclure les notifications admin
        query = query.not('type', 'like', 'admin_%');
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications non envoyées:', error);
      throw error;
    }
  }

  /**
   * Marquer une notification comme envoyée
   */
  async markNotificationAsSent(notificationId) {
    try {
      const { error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .update({
          is_sent: true,
          sent_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme envoyée:', error);
      throw error;
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async markNotificationAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      throw error;
    }
  }

  /**
   * Marquer toutes les notifications d'un utilisateur comme lues
   */
  async markAllNotificationsAsRead(userId) {
    try {
      const { error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      throw error;
    }
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId) {
    try {
      const { error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  }

  /**
   * Compter les notifications non lues pour un utilisateur
   */
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erreur lors du comptage des notifications non lues:', error);
      throw error;
    }
  }

  /**
   * Compter les notifications non lues pour les clients uniquement
   */
  async getClientUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .not('type', 'like', 'admin_%');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erreur lors du comptage des notifications client non lues:', error);
      throw error;
    }
  }

  /**
   * Compter les notifications non lues pour les admins uniquement
   */
  async getAdminUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .like('type', 'admin_%');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erreur lors du comptage des notifications admin non lues:', error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques des notifications pour un utilisateur
   */
  async getNotificationStats(userId) {
    try {
      const [totalCount, unreadCount, clientUnreadCount, adminUnreadCount] = await Promise.all([
        this.getUnreadCount(userId),
        this.getUnreadCount(userId),
        this.getClientUnreadCount(userId),
        this.getAdminUnreadCount(userId)
      ]);

      return {
        total: totalCount,
        unread: unreadCount,
        clientUnread: clientUnreadCount,
        adminUnread: adminUnreadCount
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Créer une notification manuellement (pour les cas spéciaux)
   * @param {Object} params - Paramètres de la notification
   * @param {string} params.userId - ID de l'utilisateur
   * @param {string} params.orderId - ID de la commande (optionnel)
   * @param {string} params.type - Type de notification
   * @param {string} params.title - Titre de la notification
   * @param {string} params.message - Message de la notification
   * @param {Object} params.data - Données supplémentaires (optionnel)
   * @param {number} params.priority - Priorité (1=normal, 2=haute, 3=urgente)
   */
  async createNotification({
    userId,
    orderId = null,
    type,
    title,
    message,
    data = {},
    priority = 1
  }) {
    try {
      // Validation des paramètres requis
      if (!userId || !type || !title || !message) {
        throw new Error('Paramètres requis manquants pour créer une notification');
      }

      const { data: notification, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .insert({
          user_id: userId,
          order_id: orderId,
          type,
          title,
          message,
          data,
          priority,
          is_read: false,
          is_sent: false
        })
        .select()
        .single();

      if (error) throw error;
      
      return notification;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  }

  async notifyAdminsOfNewOrder(order) {
    try {
      if (!order?.id) return;

      const { data: admins, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'admin');

      if (error) throw error;
      if (!admins || admins.length === 0) return;

      const customerName = [order.customer_first_name, order.customer_last_name]
        .filter(Boolean)
        .join(' ') || order.customer_email || 'Client';

      const totalsText = order?.totals
        ? Object.entries(order.totals)
            .map(([currency, amount]) => `${amount} ${currency}`)
            .join(' + ')
        : '';

      await Promise.all(admins.map(async (admin) => {
        // Éviter les doublons
        const { data: existing } = await supabase
          .from(TABLES.NOTIFICATIONS)
          .select('id')
          .eq('user_id', admin.id)
          .eq('order_id', order.id)
          .eq('type', 'admin_new_order')
          .limit(1);

        if (existing && existing.length > 0) return;

        await this.createNotification({
          userId: admin.id,
          orderId: order.id,
          type: 'admin_new_order',
          title: 'Nouvelle commande reçue',
          message: `Commande #${order.order_number || order.id.slice(0, 8)} de ${customerName}${totalsText ? ` • ${totalsText}` : ''}`,
          data: {
            order_id: order.id,
            order_number: order.order_number,
            customer_name: customerName,
            totals: order.totals,
            priority: 2,
            adminAction: true,
          },
          priority: 2
        });
      }));
    } catch (error) {
      console.error('[notificationService] Erreur notifyAdminsOfNewOrder:', error);
    }
  }

  async notifyClientOfOrderStatus(order, status) {
    try {
      if (!order?.id || !order?.user_id) return;

      const typeMap = {
        pending: 'order_pending',
        confirmed: 'order_confirmed',
        preparing: 'order_preparing',
        shipped: 'order_shipped',
        delivered: 'order_delivered',
        cancelled: 'order_cancelled',
      };

      const labels = {
        pending: 'en attente',
        confirmed: 'confirmée',
        preparing: 'en préparation',
        shipped: 'expédiée',
        delivered: 'livrée',
        cancelled: 'annulée',
      };

      const type = typeMap[status] || 'order_status_update';

      // Éviter doublons (même statut déjà notifié)
      const { data: existing } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .select('id')
        .eq('user_id', order.user_id)
        .eq('order_id', order.id)
        .eq('type', type)
        .limit(1);

      if (existing && existing.length > 0) return;

      const readableStatus = labels[status] || status;

      await this.createNotification({
        userId: order.user_id,
        orderId: order.id,
        type,
        title: `Commande ${readableStatus}`,
        message: `Votre commande #${order.order_number || order.id.slice(0, 8)} est ${readableStatus}.`,
        data: {
          order_id: order.id,
          order_number: order.order_number,
          new_status: status,
        },
        priority: 1
      });
    } catch (error) {
      console.error('❌ [notificationService] Erreur notifyClientOfOrderStatus:', error);
    }
  }

  /**
   * Vérifier s'il y a de nouvelles notifications depuis la dernière vérification
   */
  async checkForNewNotifications(userId, lastCheckTime) {
    try {
      const { data, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .select('*')
        .eq('user_id', userId)
        .eq('is_sent', false)
        .gt('created_at', lastCheckTime)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la vérification des nouvelles notifications:', error);
      throw error;
    }
  }

  /**
   * S'abonner aux nouvelles notifications en temps réel
   * @param {string} userId - ID de l'utilisateur
   * @param {Function} callback - Fonction de callback pour les nouvelles notifications
   * @param {string} userRole - Rôle de l'utilisateur pour filtrer les notifications
   */
  subscribeToNotifications(userId, callback, userRole = null) {
    const channelName = `notifications:${userId}`;
    
    let subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.NOTIFICATIONS,
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Filtrer selon le rôle si spécifié
          if (userRole === 'admin' && !payload.new.type.startsWith('admin_')) {
            return; // Ignorer les notifications non-admin pour les admins
          }
          if (userRole === 'client' && payload.new.type.startsWith('admin_')) {
            return; // Ignorer les notifications admin pour les clients
          }
          
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  }

  /**
   * Se désabonner des notifications
   * @param {Object} subscription - Subscription à supprimer
   */
  unsubscribeFromNotifications(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }

  /**
   * Nettoyer les anciennes notifications (maintenance)
   * @param {number} daysOld - Nombre de jours pour considérer une notification comme ancienne
   */
  async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .eq('is_read', true);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Erreur lors du nettoyage des notifications:', error);
      throw error;
    }
  }

  /**
   * Marquer plusieurs notifications comme envoyées en une fois
   * @param {Array} notificationIds - Array des IDs de notifications
   */
  async markMultipleNotificationsAsSent(notificationIds) {
    try {
      if (!notificationIds || notificationIds.length === 0) {
        return true;
      }

      const { error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .update({
          is_sent: true,
          sent_at: new Date().toISOString()
        })
        .in('id', notificationIds);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage multiple des notifications:', error);
      throw error;
    }
  }

  /**
   * Obtenir les types de notifications disponibles
   */
  getNotificationTypes() {
    return {
      // Types admin
      ADMIN_NEW_ORDER: 'admin_new_order',
      ADMIN_PENDING_ORDER: 'admin_pending_order',
      ADMIN_ORDER: 'admin_order',
      ADMIN_PENDING: 'admin_pending',
      
      // Types client
      ORDER_CONFIRMED: 'order_confirmed',
      ORDER_PREPARING: 'order_preparing',
      ORDER_SHIPPED: 'order_shipped',
      ORDER_DELIVERED: 'order_delivered',
      ORDER_CANCELLED: 'order_cancelled',
      ORDER_STATUS_UPDATE: 'order_status_update',
      
      // Types généraux
      PROMO: 'promo',
      PRODUCT: 'product',
      FARM: 'farm',
      SERVICE: 'service',
      SYSTEM: 'system',
      TEST: 'test'
    };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
