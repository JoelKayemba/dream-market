import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { 
  Container, 
  ScreenWrapper,
  NotificationItem,
  NotificationFilters,
  NotificationHeader,
  EmptyNotifications
} from '../components/ui';
import { 
  selectNotifications,
  selectUnreadCount
} from '../store/notificationsSlice';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationsScreen({ navigation }) {
  
  // Utiliser le hook useNotifications pour charger les notifications client
  const { 
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  
  // Utiliser le store Redux pour les notifications
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  
  const [activeFilter, setActiveFilter] = useState('all');

  // Les données sont maintenant chargées par le hook useNotifications

  const getFilteredNotifications = () => {
    let filtered;
    if (activeFilter === 'all') filtered = notifications;
    else if (activeFilter === 'unread') filtered = notifications.filter(n => !n.isRead);
    else if (activeFilter === 'order') filtered = notifications.filter(n => n.type.startsWith('order_'));
    else filtered = notifications.filter(n => n.type === activeFilter);
    
    return filtered;
  };

  const handleNotificationAction = async (notification) => {
    try {
      await markAsRead(notification.id);
    } catch (err) {
      console.error(' Impossible de marquer la notification comme lue:', err);
    }
 
    try {
      switch (notification.type) {
        case 'promo':
          if (notification.data?.productId) {
            navigation.navigate('ProductDetail', { 
              productId: notification.data.productId,
              product: notification.data.product 
            });
          } else {
            navigation.navigate('Products', { filter: 'promotions' });
          }
          break;
          
        case 'order_confirmed':
        case 'order_preparing':
        case 'order_shipped':
        case 'order_delivered':
        case 'order_cancelled':
        case 'order_status_update':
          if (notification.data?.orderId) {
            navigation.navigate('OrderDetail', { 
              orderId: notification.data.orderId,
              order: notification.data.order 
            });
          } else {
            navigation.navigate('Orders');
          }
          break;
          
        case 'product':
          if (notification.data?.productId) {
            navigation.navigate('ProductDetail', { 
              productId: notification.data.productId,
              product: notification.data.product 
            });
          } else {
            navigation.navigate('Products');
          }
          break;
          
        case 'farm':
          if (notification.data?.farmId) {
            navigation.navigate('FarmDetail', { 
              farmId: notification.data.farmId,
              farm: notification.data.farm 
            });
          } else {
            navigation.navigate('Farms');
          }
          break;
          
        case 'service':
          if (notification.data?.serviceId) {
            navigation.navigate('ServiceDetail', { 
              serviceId: notification.data.serviceId,
              service: notification.data.service 
            });
          } else {
            navigation.navigate('Services');
          }
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Erreur lors de la navigation:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir cette notification');
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteNotification = (notificationId) => {
    deleteNotification(notificationId);
  };

  if (isLoading) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={64} color="#4CAF50" />
          <Text style={styles.loadingTitle}>Chargement...</Text>
          <Text style={styles.loadingSubtitle}>
            Récupération de vos notifications
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const filteredNotifications = getFilteredNotifications();

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <NotificationHeader
        title="Notifications"
        subtitle={`${notifications.length} total`}
        unreadCount={unreadCount}
        onBack={() => navigation.goBack()}
        onMarkAllAsRead={handleMarkAllAsRead}
        showMarkAllButton={notifications.length > 0}
      />

      {/* Filtres */}
      <NotificationFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        notifications={notifications}
        unreadCount={unreadCount}
        variant="client"
      />

      {/* Liste des notifications */}
      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        <Container style={styles.notificationsContainer}>
          {filteredNotifications.length === 0 ? (
            <EmptyNotifications 
              activeFilter={activeFilter}
              variant="client"
            />
          ) : (
            filteredNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={handleNotificationAction}
                onDelete={handleDeleteNotification}
                showDeleteButton={true}
                variant="client"
              />
            ))
          )}
        </Container>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 20,
  },
  notificationsList: {
    flex: 1,
    marginHorizontal: -20,
  },
  notificationsContainer: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 20,
  },
});