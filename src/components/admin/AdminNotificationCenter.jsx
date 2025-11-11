import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, NotificationItem, NotificationHeader, EmptyNotifications } from '../ui';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';

export default function AdminNotificationCenter({ navigation }) {
  const { 
    adminNotifications, 
    unreadAdminCount, 
    markAsRead,
    markAllAsRead
  } = useAdminNotifications();
  
  const [isVisible, setIsVisible] = useState(false);


 
  const handleNotificationPress = async (notification) => {
    try {
      
      
      // Marquer comme lue
      markAsRead(notification.id);
      
      // Récupérer l'objet order complet depuis Supabase
      if (notification.data?.order_id || notification.data?.orderId) {
        const orderId = notification.data?.order_id || notification.data?.orderId;
       
        
        // Importer orderService pour récupérer la commande complète
        const { orderService } = await import('../../backend/services/orderService');
        const order = await orderService.getOrderById(orderId);
        
        
        
        // Naviguer vers OrderDetailAdmin avec l'objet order complet (comme OrdersManagement)
        navigation.navigate('OrderDetailAdmin', { order });
      } else {
        
        Alert.alert('Erreur', 'Impossible de trouver l\'ID de la commande');
      }
      
      setIsVisible(false);
    } catch (error) {
      console.error('[AdminNotificationCenter] Erreur lors de la navigation:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir cette notification');
    }
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Marquer tout comme lu',
      'Voulez-vous marquer toutes les notifications comme lues ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: () => {
            markAllAsRead();
          }
        }
      ]
    );
  };

  return (
    <>
      {/* Bouton de notification avec badge */}
      <TouchableOpacity 
        style={styles.notificationButton}
        onPress={() => setIsVisible(true)}
      >
        <Ionicons name="notifications-outline" size={24} color="#283106" />
        {unreadAdminCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>
              {unreadAdminCount > 99 ? '99+' : unreadAdminCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal des notifications */}
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header du modal */}
          <NotificationHeader
            title="Notifications Admin"
            subtitle={`${adminNotifications.length} total`}
            unreadCount={unreadAdminCount}
            onBack={() => setIsVisible(false)}
            onMarkAllAsRead={handleMarkAllAsRead}
            showMarkAllButton={unreadAdminCount > 0}
            variant="modal"
          />

          {/* Liste des notifications */}
          <ScrollView style={styles.notificationsList}>
            {adminNotifications.length > 0 ? (
              adminNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onPress={handleNotificationPress}
                  variant="admin"
                />
              ))
            ) : (
              <EmptyNotifications variant="admin" />
            )}
          </ScrollView>

          {/* Actions rapides */}
          <Container style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => {
                setIsVisible(false);
                navigation.navigate('OrdersManagement');
              }}
            >
              <Ionicons name="list-outline" size={20} color="#4CAF50" />
              <Text style={styles.quickActionText}>Voir toutes les commandes</Text>
            </TouchableOpacity>
          </Container>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  notificationButton: {
    position: 'relative',
    padding: 8,
    marginRight: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  notificationsList: {
    flex: 1,
  },
  quickActions: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 8,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
});