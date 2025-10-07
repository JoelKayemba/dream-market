import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, TextInput, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button , ScreenWrapper } from '../../../components/ui';
import AdminNotificationCenter from '../../../components/admin/AdminNotificationCenter';
import { useAdminNotifications } from '../../../hooks/useAdminNotifications';
import { 
  fetchOrders, 
  updateOrderStatus,
  selectAdminOrders,
  selectAdminOrdersLoading,
  selectAdminOrdersError,
  selectAdminOrdersFilters,
  selectFilteredOrders,
  selectOrderStats,
  setStatusFilter,
  setSearch,
  setSortBy,
  setSortOrder
} from '../../../store/admin/ordersSlice';

export default function OrdersManagement({ navigation }) {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQueryLocal] = useState('');
  
  // Sélecteurs Redux
  const orders = useSelector(selectAdminOrders);
  const loading = useSelector(selectAdminOrdersLoading);
  const error = useSelector(selectAdminOrdersError);
  const filters = useSelector(selectAdminOrdersFilters);
  const filteredOrders = useSelector(selectFilteredOrders);
  const stats = useSelector(selectOrderStats);

  // Hook pour les notifications admin
  const { unreadAdminCount } = useAdminNotifications();

  // Charger les commandes au montage du composant
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Gestion de la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setSearch(searchQuery));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, dispatch]);

  const statusOptions = [
    { id: 'all', label: 'Toutes', icon: 'list-outline', count: stats.total },
    { id: 'pending', label: 'En attente', icon: 'time-outline', count: stats.pending },
    { id: 'confirmed', label: 'Confirmées', icon: 'checkmark-circle-outline', count: stats.confirmed },
    { id: 'preparing', label: 'Préparation', icon: 'restaurant-outline', count: stats.preparing },
    { id: 'shipped', label: 'Expédiées', icon: 'car-outline', count: stats.shipped },
    { id: 'delivered', label: 'Livrées', icon: 'checkmark-done-outline', count: stats.delivered },
    { id: 'cancelled', label: 'Annulées', icon: 'close-circle-outline', count: stats.cancelled }
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      confirmed: '#2196F3',
      preparing: '#9C27B0',
      shipped: '#FF5722',
      delivered: '#4CAF50',
      cancelled: '#F44336'
    };
    return colors[status] || '#777E5C';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      preparing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const formatPrice = (amount, currency = 'CDF') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return currency === 'USD' ? '$0.00' : '0 FC';
    }
    if (currency === 'USD') {
      return `$${parseFloat(amount).toFixed(2)}`;
    }
    return `${parseFloat(amount).toFixed(0)} FC`;
  };

  const handleViewOrder = (order) => {
    navigation.navigate('OrderDetail', { order });
  };

  const handleUpdateStatus = (order, newStatus) => {
    Alert.alert(
      'Changer le statut',
      `Voulez-vous passer la commande ${order.orderNumber || order.order_number} au statut "${getStatusLabel(newStatus)}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: () => {
            dispatch(updateOrderStatus({ 
              orderId: order.id, 
              status: newStatus,
              notes: `Statut changé vers "${getStatusLabel(newStatus)}" par l'admin`
            }));
          }
        }
      ]
    );
  };

  const handleContactCustomer = (order) => {
    Alert.alert(
      'Contacter le client',
      `Comment souhaitez-vous contacter ${order.customerName || 'le client'} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Appeler', 
          onPress: () => {
            // Ici on pourrait ouvrir l'appel téléphonique
            Alert.alert('Appel', `Appel vers ${order.customerPhone || order.phone_number}`);
          }
        },
        { 
          text: 'WhatsApp', 
          onPress: () => {
            // Ici on pourrait ouvrir WhatsApp
            Alert.alert('WhatsApp', `Ouverture WhatsApp vers ${order.customerPhone || order.phone_number}`);
          }
        },
        { 
          text: 'Email', 
          onPress: () => {
            // Ici on pourrait ouvrir l'email
            Alert.alert('Email', `Envoi d'email à ${order.customerEmail || order.profiles?.email}`);
          }
        }
      ]
    );
  };

  const OrderCard = ({ order }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => handleViewOrder(order)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{order.orderNumber || order.order_number}</Text>
          <Text style={styles.customerName}>{order.customerName || 'Client inconnu'}</Text>
          <Text style={styles.orderDate}>{formatDate(order.date || order.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusLabel(order.status)}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.orderItem}>
          <Ionicons name="call-outline" size={16} color="#777E5C" />
          <Text style={styles.orderItemText}>{order.customerPhone || order.phone_number}</Text>
        </View>
        <View style={styles.orderItem}>
          <Ionicons name="cube-outline" size={16} color="#777E5C" />
          <Text style={styles.orderItemText}>{order.items.length} article(s)</Text>
        </View>
        <View style={styles.orderItem}>
          <Ionicons name="cash-outline" size={16} color="#777E5C" />
          <Text style={styles.orderItemText}>
            {order.totals && Object.keys(order.totals).length > 0 
              ? Object.entries(order.totals).map(([currency, amount]) => 
                  formatPrice(amount, currency)
                ).join(' + ')
              : '0 FC'
            }
          </Text>
        </View>
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleContactCustomer(order)}
        >
          <Ionicons name="call" size={16} color="#4CAF50" />
          <Text style={styles.actionButtonText}>Contacter</Text>
        </TouchableOpacity>
        
        {order.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleUpdateStatus(order, 'confirmed')}
          >
            <Ionicons name="checkmark" size={16} color="#2196F3" />
            <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>Confirmer</Text>
          </TouchableOpacity>
        )}
        
        {order.status === 'confirmed' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.prepareButton]}
            onPress={() => handleUpdateStatus(order, 'preparing')}
          >
            <Ionicons name="restaurant" size={16} color="#9C27B0" />
            <Text style={[styles.actionButtonText, { color: '#9C27B0' }]}>Préparer</Text>
          </TouchableOpacity>
        )}
        
        {order.status === 'preparing' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.shipButton]}
            onPress={() => handleUpdateStatus(order, 'shipped')}
          >
            <Ionicons name="car" size={16} color="#FF5722" />
            <Text style={[styles.actionButtonText, { color: '#FF5722' }]}>Expédier</Text>
          </TouchableOpacity>
        )}
        
        {order.status === 'shipped' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.deliverButton]}
            onPress={() => handleUpdateStatus(order, 'delivered')}
          >
            <Ionicons name="checkmark-done" size={16} color="#4CAF50" />
            <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>Livrer</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color="#777E5C" />
      <Text style={styles.emptyTitle}>Aucune commande</Text>
      <Text style={styles.emptySubtitle}>
        {filters.status === 'all' 
          ? "Aucune commande n'a été passée"
          : `Aucune commande avec le statut "${getStatusLabel(filters.status)}"`
        }
      </Text>
    </View>
  );

  if (loading && orders.length === 0) {
    return (
    <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des commandes...</Text>
        </View>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Gestion des Commandes</Text>
          <Text style={styles.headerSubtitle}>
            {stats.total} commande(s) • {formatPrice(stats.totalRevenue)} CA
            {unreadAdminCount > 0 && ` • ${unreadAdminCount} nouvelle(s)`}
          </Text>
        </View>
        <AdminNotificationCenter navigation={navigation} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Statistiques */}
        <Container style={styles.section}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>En attente</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.confirmed}</Text>
              <Text style={styles.statLabel}>Confirmées</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.delivered}</Text>
              <Text style={styles.statLabel}>Livrées</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{formatPrice(stats.totalRevenue)}</Text>
              <Text style={styles.statLabel}>Chiffre d'affaires</Text>
            </View>
          </View>
        </Container>

        {/* Barre de recherche */}
        <Container style={styles.section}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#777E5C" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par numéro, client, téléphone..."
              value={searchQuery}
              onChangeText={setSearchQueryLocal}
              placeholderTextColor="#999"
            />
          </View>
        </Container>

        {/* Filtres de statut */}
        <Container style={styles.section}>
          <Text style={styles.sectionTitle}>Filtrer par statut</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.statusFilters}
          >
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.statusFilter,
                  filters.status === option.id && styles.selectedStatusFilter
                ]}
                onPress={() => dispatch(setStatusFilter(option.id))}
              >
                <Ionicons 
                  name={option.icon} 
                  size={16} 
                  color={filters.status === option.id ? '#FFFFFF' : '#777E5C'} 
                />
                <Text style={[
                  styles.statusFilterText,
                  filters.status === option.id && styles.selectedStatusFilterText
                ]}>
                  {option.label}
                </Text>
                <View style={[
                  styles.statusCount,
                  filters.status === option.id && styles.selectedStatusCount
                ]}>
                  <Text style={[
                    styles.statusCountText,
                    filters.status === option.id && styles.selectedStatusCountText
                  ]}>
                    {option.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Container>

        {/* Liste des commandes */}
        <Container style={styles.section}>
          <Text style={styles.sectionTitle}>
            Commandes ({filteredOrders.length})
          </Text>
          
          {filteredOrders.length > 0 ? (
            <View style={styles.ordersList}>
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </View>
          ) : (
            renderEmptyState()
          )}
        </Container>

        {/* Espacement */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#777E5C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 12,
  },
  // Statistiques
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 4,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#777E5C',
    textAlign: 'center',
    marginTop: 4,
  },
  // Recherche
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#283106',
    marginLeft: 12,
  },
  // Filtres de statut
  statusFilters: {
    marginTop: 8,
  },
  statusFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedStatusFilter: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  statusFilterText: {
    fontSize: 14,
    color: '#777E5C',
    marginLeft: 6,
    marginRight: 8,
  },
  selectedStatusFilterText: {
    color: '#FFFFFF',
  },
  statusCount: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  selectedStatusCount: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statusCountText: {
    fontSize: 12,
    color: '#777E5C',
    fontWeight: '600',
  },
  selectedStatusCountText: {
    color: '#FFFFFF',
  },
  // Liste des commandes
  ordersList: {
    marginTop: 8,
  },
  orderCard: {
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
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#777E5C',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderItemText: {
    fontSize: 14,
    color: '#777E5C',
    marginLeft: 8,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  confirmButton: {
    backgroundColor: '#E3F2FD',
  },
  prepareButton: {
    backgroundColor: '#F3E5F5',
  },
  shipButton: {
    backgroundColor: '#FFEBEE',
  },
  deliverButton: {
    backgroundColor: '#E8F5E8',
  },
  // État vide
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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
    paddingHorizontal: 20,
  },
});