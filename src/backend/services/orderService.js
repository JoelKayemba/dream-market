import { supabase, ORDER_STATUS } from '../config/supabase';
import {
  validateAndSanitizeText,
  validateAndSanitizeName,
  validateAndSanitizePhone,
  validateAndSanitizeEmail,
  sanitizeString,
} from '../../utils/inputSanitizer';

export const orderService = {
  // Récupérer toutes les commandes (admin seulement) avec pagination
  getAllOrders: async (options = {}) => {
    try {
      const {
        limit = 20,
        offset = 0,
        status = null,
        search = null,
        userId = null
      } = options;

      // Validation des paramètres
      const validLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
      const validOffset = Math.max(0, parseInt(offset, 10) || 0);
      const validStatus = status && typeof status === 'string' && status.trim().length > 0 ? status.trim() : null;
      const validSearch = search && typeof search === 'string' && search.trim().length > 0 ? search.trim() : null;
      const validUserId = userId && typeof userId === 'string' && userId.trim().length > 0 ? userId.trim() : null;

      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(validOffset, validOffset + validLimit - 1);

      // Filtres optionnels
      // NOTE: Tous les filtres (status, search) sont désactivés côté serveur
      // et gérés côté client dans le slice Redux pour éviter les erreurs Supabase
      // avec or() et ilike. Pour de meilleures performances à long terme,
      // on pourrait implémenter une fonction RPC Supabase.
      
      // Filtrer uniquement par userId si nécessaire (pour les commandes d'un utilisateur spécifique)
      if (validUserId) {
        query = query.eq('user_id', validUserId);
      }
      
      // Les filtres status et search sont gérés côté client dans selectFilteredOrders

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ [OrderService] getAllOrders Supabase error:', error);
        console.error('❌ [OrderService] Query params:', { validLimit, validOffset, validStatus, validSearch, validUserId });
        throw error;
      }

      return {
        data: data || [],
        total: count || 0,
        hasMore: (validOffset + validLimit) < (count || 0),
        limit: validLimit,
        offset: validOffset
      };
    } catch (error) {
      console.error('❌ [OrderService] getAllOrders error:', error);
      throw error;
    }
  },

  // Récupérer les commandes d'un utilisateur avec pagination
  getUserOrders: async (userId, options = {}) => {
    try {
      const {
        limit = 20,
        offset = 0,
        status = null
      } = options;

      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Filtres optionnels
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ [OrderService] getUserOrders Supabase error:', error);
        throw error;
      }

      return {
        data: data || [],
        total: count || 0,
        hasMore: (offset + limit) < (count || 0),
        limit,
        offset
      };
    } catch (error) {
      console.error('❌ [OrderService] Error fetching orders:', error);
      throw error;
    }
  },

  // Récupérer une commande par ID
  getOrderById: async (orderId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Créer une nouvelle commande
  createOrder: async (orderData) => {
    try {
      
      // Vérifier que user_id est présent
      if (!orderData.user_id) {
        console.error('❌ [orderService] user_id manquant dans orderData');
        throw new Error('user_id est requis pour créer une commande');
      }
      
      // Générer un numéro de commande unique
      const orderNumber = `DM-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      // Nettoyer les données de la commande
      const cleanedOrderData = {
        ...orderData,
        order_number: orderNumber,
      };

      // Nettoyer l'adresse de livraison
      if (orderData.delivery_address) {
        const addressResult = validateAndSanitizeText(orderData.delivery_address, {
          maxLength: 500,
          required: false,
        });
        if (addressResult.valid) {
          cleanedOrderData.delivery_address = addressResult.cleaned;
        } else {
          throw new Error(`Adresse de livraison: ${addressResult.error}`);
        }
      }

      // Nettoyer le numéro de téléphone
      if (orderData.phone_number) {
        const phoneResult = validateAndSanitizePhone(orderData.phone_number);
        if (phoneResult.valid) {
          cleanedOrderData.phone_number = phoneResult.cleaned;
        } else {
          throw new Error(`Numéro de téléphone: ${phoneResult.error}`);
        }
      }

      // Nettoyer les notes
      if (orderData.notes) {
        const notesResult = validateAndSanitizeText(orderData.notes, {
          maxLength: 1000,
          required: false,
        });
        if (notesResult.valid) {
          cleanedOrderData.notes = notesResult.cleaned;
        } else {
          throw new Error(`Notes: ${notesResult.error}`);
        }
      }

      // Nettoyer les noms du client
      if (orderData.customer_first_name) {
        const firstNameResult = validateAndSanitizeName(orderData.customer_first_name, {
          maxLength: 100,
          required: false,
        });
        if (firstNameResult.valid) {
          cleanedOrderData.customer_first_name = firstNameResult.cleaned;
        } else {
          throw new Error(`Prénom: ${firstNameResult.error}`);
        }
      }

      if (orderData.customer_last_name) {
        const lastNameResult = validateAndSanitizeName(orderData.customer_last_name, {
          maxLength: 100,
          required: false,
        });
        if (lastNameResult.valid) {
          cleanedOrderData.customer_last_name = lastNameResult.cleaned;
        } else {
          throw new Error(`Nom: ${lastNameResult.error}`);
        }
      }

      // Nettoyer l'email du client
      if (orderData.customer_email) {
        const emailResult = validateAndSanitizeEmail(orderData.customer_email);
        if (emailResult.valid) {
          cleanedOrderData.customer_email = emailResult.cleaned;
        } else {
          throw new Error(`Email: ${emailResult.error}`);
        }
      }

      // Nettoyer les noms de produits dans les items
      if (orderData.items && Array.isArray(orderData.items)) {
        cleanedOrderData.items = orderData.items.map(item => ({
          ...item,
          product_name: item.product_name
            ? sanitizeString(item.product_name, { maxLength: 255 })
            : item.product_name,
        }));
      }

      const { data, error } = await supabase
        .from('orders')
        .insert([cleanedOrderData])
        .select()
        .single();

      if (error) {
        console.error('❌ [orderService] Erreur Supabase:', error);
        throw error;
      }
      
      try {
        await supabase.rpc('notify_admin_new_order', { order_id: data.id });
      } catch (rpcError) {
        console.error('[orderService] RPC notify_admin_new_order failed:', rpcError);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour une commande
  updateOrder: async (orderId, updates) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          ...updates,
          last_updated: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour le statut d'une commande
  updateOrderStatus: async (orderId, status) => {
    try {
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          last_updated: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('🔔 [orderService] Erreur Supabase:', error);
        throw error;
      }
      
      try {
        await supabase.rpc('notify_client_order_status', {
          order_id: data.id,
          new_status: status
        });
      } catch (rpcError) {
        console.error('[orderService] RPC notify_client_order_status failed:', rpcError);
      }

      return data;
    } catch (error) {
      console.error('🔔 [orderService] Erreur lors de la mise à jour:', error);
      throw error;
    }
  },

  // Supprimer une commande
  deleteOrder: async (orderId) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Annuler une commande
  cancelOrder: async (orderId, reason = null) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: ORDER_STATUS.CANCELLED,
          notes: reason ? `${data?.notes || ''}\nAnnulé: ${reason}` : data?.notes || '',
          last_updated: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les commandes par statut
  getOrdersByStatus: async (status) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Rechercher des commandes
  searchOrders: async (query) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .or(`order_number.ilike.%${query}%, delivery_address.ilike.%${query}%, phone_number.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les commandes récentes
  getRecentOrders: async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les statistiques des commandes
  getOrderStats: async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, totals, created_at');

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter(order => order.status === ORDER_STATUS.PENDING).length,
        confirmed: data.filter(order => order.status === ORDER_STATUS.CONFIRMED).length,
        preparing: data.filter(order => order.status === ORDER_STATUS.PREPARING).length,
        shipped: data.filter(order => order.status === ORDER_STATUS.SHIPPED).length,
        delivered: data.filter(order => order.status === ORDER_STATUS.DELIVERED).length,
        cancelled: data.filter(order => order.status === ORDER_STATUS.CANCELLED).length,
        totalRevenue: data
          .filter(order => order.status === ORDER_STATUS.DELIVERED)
          .reduce((acc, order) => {
            const totals = order.totals || {};
            const cdfTotal = totals.CDF || 0;
            const usdTotal = totals.USD || 0;
            return acc + cdfTotal + (usdTotal * 2500); // Conversion USD en CDF
          }, 0),
      };

      return stats;
    } catch (error) {
      throw error;
    }
  },

  // Contacter le client (log d'activité)
  contactCustomer: async (orderId, method, message) => {
    try {
      // Pour l'instant, on peut juste logger l'action
      // Plus tard, on pourra ajouter une table d'activités
      
      // Mettre à jour les notes de la commande
      const { data: order } = await supabase
        .from('orders')
        .select('notes')
        .eq('id', orderId)
        .single();

      const updatedNotes = `${order?.notes || ''}\n[${new Date().toLocaleString()}] Contact ${method}: ${message}`;

      const { data, error } = await supabase
        .from('orders')
        .update({ 
          notes: updatedNotes,
          last_updated: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return { orderId, method, message, timestamp: new Date().toISOString() };
    } catch (error) {
      throw error;
    }
  },
};
