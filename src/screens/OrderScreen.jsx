import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  FlatList
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Container, Badge , ScreenWrapper } from '../components/ui';
import { 
  fetchUserOrders,
  selectOrders,
  selectOrdersLoading,
  selectOrdersError,
  selectOrdersByStatus,
  selectOrdersStats,
  clearError
} from '../store/ordersSlice';
import { useAuth } from '../hooks/useAuth';
import { formatPrice, getCurrencySymbol } from '../utils/currency';

export default function OrderScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const ordersRaw = useSelector(selectOrders);
  // Garantir que orders est toujours un tableau
  const orders = Array.isArray(ordersRaw) ? ordersRaw : [];
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const ordersStats = useSelector(selectOrdersStats) || {
    total: 0,
    pending: 0,
    confirmed: 0,
    preparing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  };
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Charger les commandes au montage
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserOrders(user.id));
    } else {
      // Essayer de récupérer l'ID depuis AsyncStorage
      const checkStoredUser = async () => {
        try {
          const storedUserId = await AsyncStorage.getItem('user_id');
          if (storedUserId) {
            
            dispatch(fetchUserOrders(storedUserId));
          } 
        } catch (error) {
          console.error('❌ [OrderScreen] Error checking stored user:', error);
        }
      };
      checkStoredUser();
    }
  }, [dispatch, user?.id]);

  // Gérer le pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await dispatch(fetchUserOrders(user.id));
    }
    setRefreshing(false);
  };

  // Gérer les erreurs
  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Obtenir les commandes filtrées
  const getFilteredOrders = () => {
    if (!orders || !Array.isArray(orders)) {
      return [];
    }
    if (selectedStatus === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === selectedStatus);
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'preparing': return '#9C27B0';
      case 'shipped': return '#3F51B5';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#777E5C';
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'preparing': return 'En préparation';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Date inconnue';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return 'Date invalide';
    }
  };

  // Rendu d'une commande
  const renderOrderItem = ({ item: order }) => {
    // Vérification de sécurité pour l'objet order
    if (!order || typeof order !== 'object') {
      return false;
    }
    
    return (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{order.order_number || 'N/A'}</Text>
          <Text style={styles.orderDate}>{formatDate(order.created_at || new Date())}</Text>
        </View>
        <Badge
          text={getStatusText(order.status || 'pending')}
          variant="secondary"
          style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status || 'pending') }]}
        />
      </View>

      <View style={styles.orderContent}>
        <View style={styles.orderItems}>
          <Text style={styles.itemsCount}>
            {Array.isArray(order.items) ? order.items.length : 0} article{Array.isArray(order.items) && order.items.length > 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.orderTotals}>
          {order.totals && Object.entries(order.totals).map(([currency, total]) => (
            <Text key={currency} style={styles.totalText}>
              {formatPrice(total, currency)}
            </Text>
          ))}
          {(!order.totals || Object.keys(order.totals).length === 0) && (
            <Text style={styles.totalText}>0 FC</Text>
          )}
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.deliveryInfo}>
          <Ionicons name="location-outline" size={16} color="#777E5C" />
          <Text style={styles.deliveryText} numberOfLines={1}>
            {order.delivery_address || 'Adresse non spécifiée'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#777E5C" />
      </View>
    </TouchableOpacity>
    );
  };

  // Rendu des onglets de filtre
  const renderFilterTabs = () => {
    const ordersArray = Array.isArray(orders) ? orders : [];
    const filters = [
      { key: 'all', label: 'Toutes', count: ordersArray.length },
      { key: 'pending', label: 'En attente', count: ordersStats?.pending || 0 },
      { key: 'confirmed', label: 'Confirmées', count: ordersStats?.confirmed || 0 },
      { key: 'preparing', label: 'En préparation', count: ordersStats?.preparing || 0 },
      { key: 'shipped', label: 'Expédiées', count: ordersStats?.shipped || 0 },
      { key: 'delivered', label: 'Livrées', count: ordersStats?.delivered || 0 },
      { key: 'cancelled', label: 'Annulées', count: ordersStats?.cancelled || 0 }
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabs}
        contentContainerStyle={styles.filterTabsContent}
      >
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedStatus === filter.key && styles.activeFilterTab
            ]}
            onPress={() => setSelectedStatus(filter.key)}
          >
            <Text style={[
              styles.filterTabText,
              selectedStatus === filter.key && styles.activeFilterTabText
            ]}>
              {filter.label} ({filter.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Rendu vide
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color="#777E5C" />
      <Text style={styles.emptyTitle}>Aucune commande</Text>
      <Text style={styles.emptySubtitle}>
        {selectedStatus === 'all' 
          ? 'Vous n\'avez pas encore passé de commande'
          : `Aucune commande ${getStatusText(selectedStatus).toLowerCase()}`
        }
      </Text>
    </View>
  );

  const filteredOrders = getFilteredOrders();

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mes Commandes</Text>
          <Text style={styles.headerSubtitle}>
            {Array.isArray(orders) ? orders.length : 0} commande{Array.isArray(orders) && orders.length > 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Filtres */}
      {Array.isArray(orders) && orders.length > 0 && renderFilterTabs()}

      {/* Liste des commandes */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredOrders.length === 0 && styles.emptyListContainer
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  filterTabs: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    maxHeight: 72,
  },
  filterTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#4CAF50',
  },
  filterTabText: {
    fontSize: 14,
    color: '#777E5C',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  orderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283106',
  },
  orderDate: {
    fontSize: 12,
    color: '#777E5C',
    marginTop: 2,
  },
  statusBadge: {
    marginLeft: 12,
  },
  orderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItems: {
    flex: 1,
  },
  itemsCount: {
    fontSize: 14,
    color: '#777E5C',
  },
  orderTotals: {
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  deliveryText: {
    fontSize: 12,
    color: '#777E5C',
    marginLeft: 4,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 20,
  },
});
