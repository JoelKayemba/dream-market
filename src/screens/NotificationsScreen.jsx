import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Container, Badge, Button } from '../components/ui';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'promo',
      title: '🎉 Promotion spéciale !',
      message: 'Réduction de 20% sur tous les produits bio cette semaine',
      time: 'Il y a 2h',
      isRead: false,
      action: 'Voir les offres',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      type: 'order',
      title: '📦 Commande expédiée',
      message: 'Votre commande #DM-2024-001 a été expédiée et sera livrée demain',
      time: 'Il y a 4h',
      isRead: false,
      action: 'Suivre ma commande',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop'
    },
    {
      id: 3,
      type: 'product',
      title: '🥕 Nouveau produit disponible',
      message: 'Les carottes bio de la ferme Dupont sont maintenant disponibles',
      time: 'Il y a 6h',
      isRead: true,
      action: 'Voir le produit',
      image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=100&h=100&fit=crop'
    },
    {
      id: 4,
      type: 'farm',
      title: '🏡 Nouvelle ferme partenaire',
      message: 'La ferme Martin rejoint Dream Market avec ses produits laitiers',
      time: 'Il y a 1 jour',
      isRead: true,
      action: 'Découvrir la ferme',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=100&h=100&fit=crop'
    },
    {
      id: 5,
      type: 'service',
      title: '🚚 Service de livraison amélioré',
      message: 'Livraison gratuite maintenant disponible pour toutes les commandes > 30€',
      time: 'Il y a 2 jours',
      isRead: true,
      action: 'En savoir plus',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop'
    },
    {
      id: 6,
      type: 'system',
      title: '🔔 Maintenance prévue',
      message: 'Le site sera en maintenance le 15 décembre de 2h à 4h du matin',
      time: 'Il y a 3 jours',
      isRead: true,
      action: 'Voir les détails',
      image: null
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('all');

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'promo':
        return { name: 'pricetag', color: '#FF6B6B', bgColor: '#FFE8E8' };
      case 'order':
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
  };

  const getFilteredNotifications = () => {
    if (activeFilter === 'all') return notifications;
    if (activeFilter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === activeFilter);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };

  const handleNotificationAction = (notification) => {
    markAsRead(notification.id);
    
    switch (notification.type) {
      case 'promo':
        navigation.navigate('Products');
        break;
      case 'order':
        navigation.navigate('Orders');
        break;
      case 'product':
        navigation.navigate('ProductDetail', { product: { id: 1, name: 'Carottes bio' } });
        break;
      case 'farm':
        navigation.navigate('Farms');
        break;
      case 'service':
        navigation.navigate('Services');
        break;
      default:
        console.log('Action non définie pour:', notification.type);
    }
  };

  const renderNotification = (notification) => {
    const icon = getNotificationIcon(notification.type);
    
    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          !notification.isRead && styles.unreadNotification
        ]}
        onPress={() => handleNotificationAction(notification)}
        activeOpacity={0.7}
      >
        {/* Icône du type de notification */}
        <View style={[styles.iconContainer, { backgroundColor: icon.bgColor }]}>
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>

        {/* Contenu de la notification */}
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
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

        {/* Image optionnelle */}
        {notification.image && (
          <Image 
            source={{ uri: notification.image }} 
            style={styles.notificationImage}
          />
        )}

        {/* Indicateur de lecture */}
        {!notification.isRead && (
          <View style={styles.unreadIndicator} />
        )}

        {/* Bouton de suppression */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(notification.id)}
        >
          <Ionicons name="close" size={16} color="#777E5C" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Badge 
              text={unreadCount.toString()} 
              variant="primary" 
              size="small"
              style={styles.unreadBadge}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.markAllReadButton}
          onPress={markAllAsRead}
        >
          <Text style={styles.markAllReadText}>Tout marquer</Text>
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {[
            { id: 'all', label: 'Toutes', count: notifications.length },
            { id: 'unread', label: 'Non lues', count: unreadCount },
            { id: 'promo', label: 'Promos', count: notifications.filter(n => n.type === 'promo').length },
            { id: 'order', label: 'Commandes', count: notifications.filter(n => n.type === 'order').length },
            { id: 'product', label: 'Produits', count: notifications.filter(n => n.type === 'product').length },
            { id: 'farm', label: 'Fermes', count: notifications.filter(n => n.type === 'farm').length }
          ].map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                activeFilter === filter.id && styles.activeFilterButton
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter.id && styles.activeFilterText
              ]}>
                {filter.label}
              </Text>
              <View style={[
                styles.filterCount,
                activeFilter === filter.id && styles.activeFilterCount
              ]}>
                <Text style={[
                  styles.filterCountText,
                  activeFilter === filter.id && styles.activeFilterCountText
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Liste des notifications */}
      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        <Container style={styles.notificationsContainer}>
          {getFilteredNotifications().length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={64} color="#777E5C" />
              <Text style={styles.emptyTitle}>Aucune notification</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'unread' 
                  ? 'Toutes vos notifications ont été lues !' 
                  : 'Aucune notification dans cette catégorie'
                }
              </Text>
            </View>
          ) : (
            getFilteredNotifications().map(renderNotification)
          )}
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
    marginRight: 8,
  },
  unreadBadge: {
    marginLeft: 8,
  },
  markAllReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllReadText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeFilterButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterText: {
    fontSize: 14,
    color: '#777E5C',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  filterCount: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  activeFilterCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterCountText: {
    fontSize: 12,
    color: '#777E5C',
    fontWeight: '600',
  },
  activeFilterCountText: {
    color: '#FFFFFF',
  },
  notificationsList: {
    flex: 1,
    marginHorizontal: -20,
  },
  notificationsContainer: {
    paddingVertical: 16,
  },
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
  notificationImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 12,
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
    top: 8,
    right: 8,
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 20,
  },
});
