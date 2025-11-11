import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

/**
 * Composant réutilisable pour les filtres de notifications
 * Utilisé par NotificationsScreen
 */
const NotificationFilters = ({ 
  activeFilter, 
  onFilterChange, 
  notifications, 
  unreadCount,
  variant = 'client' // 'client' ou 'admin'
}) => {
  const getFilters = () => {
    if (variant === 'admin') {
      return [
        { id: 'all', label: 'Toutes', count: notifications.length },
        { id: 'unread', label: 'Non lues', count: unreadCount },
        { id: 'admin_new_order', label: 'Nouvelles', count: notifications.filter(n => n.type === 'admin_new_order').length },
        { id: 'admin_pending_order', label: 'En attente', count: notifications.filter(n => n.type === 'admin_pending_order').length }
      ];
    } else {
      return [
        { id: 'all', label: 'Toutes', count: notifications.length },
        { id: 'unread', label: 'Non lues', count: unreadCount },
        { id: 'promo', label: 'Promos', count: notifications.filter(n => n.type === 'promo').length },
        { id: 'order', label: 'Commandes', count: notifications.filter(n => n.type.startsWith('order_')).length },
        { id: 'product', label: 'Produits', count: notifications.filter(n => n.type === 'product').length },
        { id: 'farm', label: 'Fermes', count: notifications.filter(n => n.type === 'farm').length }
      ];
    }
  };

  const filters = getFilters();

  return (
    <View style={styles.filtersContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              activeFilter === filter.id && styles.activeFilterButton
            ]}
            onPress={() => onFilterChange(filter.id)}
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
  );
};

const styles = StyleSheet.create({
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
});

export default NotificationFilters;

