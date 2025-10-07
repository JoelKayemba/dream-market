import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button } from '../ui';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';

export default function AdminNotificationCenter({ navigation }) {
  const { 
    adminNotifications, 
    unreadAdminNotifications, 
    unreadAdminCount, 
    markAsRead 
  } = useAdminNotifications();
  
  const [isVisible, setIsVisible] = useState(false);

  const handleNotificationPress = (notification) => {
    // Marquer comme lue
    markAsRead(notification.id);
    
    // Naviguer vers la commande
    if (notification.data?.orderId) {
      navigation.navigate('OrderDetail', { 
        orderId: notification.data.orderId,
        order: notification.data.order 
      });
    }
    
    setIsVisible(false);
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
            unreadAdminNotifications.forEach(notification => {
              markAsRead(notification.id);
            });
          }
        }
      ]
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'admin_order':
        return 'add-circle';
      case 'admin_pending':
        return 'time';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type, urgent = false) => {
    if (urgent) return '#FF5722'; // Rouge pour urgent
    switch (type) {
      case 'admin_order':
        return '#4CAF50'; // Vert pour nouvelles commandes
      case 'admin_pending':
        return '#FF9800'; // Orange pour en attente
      default:
        return '#2196F3'; // Bleu par défaut
    }
  };

  const NotificationItem = ({ notification }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIconContainer}>
          <Ionicons 
            name={getNotificationIcon(notification.type)} 
            size={20} 
            color={getNotificationColor(notification.type, notification.data?.urgent)} 
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={[
            styles.notificationTitle,
            !notification.isRead && styles.unreadText
          ]}>
            {notification.title}
          </Text>
          <Text style={styles.notificationMessage}>
            {notification.message}
          </Text>
          <Text style={styles.notificationTime}>
            {notification.time}
          </Text>
        </View>
        {!notification.isRead && (
          <View style={styles.unreadDot} />
        )}
      </View>
      
      {notification.data?.urgent && (
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentText}>URGENT</Text>
        </View>
      )}
    </TouchableOpacity>
  );

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
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalTitle}>Notifications Admin</Text>
              <Text style={styles.modalSubtitle}>
                {unreadAdminCount} non lue(s) • {adminNotifications.length} total
              </Text>
            </View>
            <View style={styles.headerRight}>
              {unreadAdminCount > 0 && (
                <TouchableOpacity 
                  style={styles.markAllButton}
                  onPress={handleMarkAllAsRead}
                >
                  <Text style={styles.markAllText}>Tout marquer</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
              >
                <Ionicons name="close" size={24} color="#777E5C" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Liste des notifications */}
          <ScrollView style={styles.notificationsList}>
            {adminNotifications.length > 0 ? (
              adminNotifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={80} color="#777E5C" />
                <Text style={styles.emptyTitle}>Aucune notification</Text>
                <Text style={styles.emptySubtitle}>
                  Vous serez notifié des nouvelles commandes et actions importantes
                </Text>
              </View>
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  markAllText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#777E5C',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginTop: 6,
  },
  urgentBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 22,
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
