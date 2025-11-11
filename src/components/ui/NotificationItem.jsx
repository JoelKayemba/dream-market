import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Composant réutilisable pour afficher une notification
 * Utilisé par NotificationsScreen et AdminNotificationCenter
 */
const NotificationItem = ({ 
  notification, 
  onPress, 
  onDelete,
  showDeleteButton = false,
  variant = 'default' // 'default' ou 'admin'
}) => {
  const getNotificationIcon = (type, variant) => {
    if (variant === 'admin') {
      switch (type) {
        case 'admin_new_order':
        case 'admin_order':
          return { name: 'add-circle', color: '#4CAF50', bgColor: '#E8F5E8' };
        case 'admin_pending_order':
        case 'admin_pending':
          return { name: 'time', color: '#FF9800', bgColor: '#FFF3E0' };
        default:
          return { name: 'notifications', color: '#2196F3', bgColor: '#E3F2FD' };
      }
    } else {
      // Variant client
      switch (type) {
        case 'promo':
          return { name: 'pricetag', color: '#FF6B6B', bgColor: '#FFE8E8' };
        case 'order_confirmed':
        case 'order_preparing':
        case 'order_shipped':
        case 'order_delivered':
        case 'order_cancelled':
        case 'order_status_update':
          return { name: 'cube', color: '#4CAF50', bgColor: '#E8F5E8' };
        case 'product':
          return { name: 'leaf', color: '#8BC34A', bgColor: '#F1F8E9' };
        case 'farm':
          return { name: 'business', color: '#FF9800', bgColor: '#FFF3E0' };
        case 'service':
          return { name: 'construct', color: '#2196F3', bgColor: '#E3F2FD' };
        case 'system':
          return { name: 'settings', color: '#9C27B0', bgColor: '#F3E5F5' };
        default:
          return { name: 'notifications', color: '#777E5C', bgColor: '#F5F5F5' };
      }
    }
  };

  const icon = getNotificationIcon(notification.type, variant);
  const isUrgent = notification.data?.urgent || notification.priority >= 3;

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification,
        isUrgent && styles.urgentNotification
      ]}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      {/* Icône du type de notification */}
      <View style={[styles.iconContainer, { backgroundColor: icon.bgColor }]}>
        <Ionicons name={icon.name} size={20} color={icon.color} />
      </View>

      {/* Contenu de la notification */}
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[
            styles.notificationTitle,
            !notification.isRead && styles.unreadText
          ]} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.notificationTime}>
            {notification.time}
          </Text>
        </View>
        
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {notification.message}
        </Text>
        
        <View style={styles.notificationFooter}>
          <Text style={styles.actionText}>
            {notification.action}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
        </View>
      </View>

      {/* Badge urgent */}
      {isUrgent && (
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentText}>URGENT</Text>
        </View>
      )}

      {/* Indicateur de lecture */}
      {!notification.isRead && (
        <View style={styles.unreadIndicator} />
      )}

      {/* Bouton de suppression */}
      {showDeleteButton && onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(notification.id)}
        >
          <Ionicons name="close" size={16} color="#777E5C" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  urgentNotification: {
    borderLeftColor: '#FF5722',
    backgroundColor: '#FFF8F8',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
    color: '#777E5C',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  urgentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF5722',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 2,
    padding: 4,
  },
});

export default NotificationItem;

