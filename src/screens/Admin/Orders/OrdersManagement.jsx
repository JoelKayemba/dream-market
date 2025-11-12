import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, TextInput, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
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
  const [showFilters, setShowFilters] = useState(false);
  
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
    navigation.navigate('OrderDetailAdmin', { order });
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

  const OrderCard = ({ order }) => {
    const statusColor = getStatusColor(order.status);
    
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => handleViewOrder(order)}
        activeOpacity={0.7}
      >
        {/* Header avec numéro et statut */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>#{order.orderNumber || order.order_number}</Text>
            <Text style={styles.customerName}>{order.customerName || 'Client inconnu'}</Text>
            <Text style={styles.orderDate}>{formatDate(order.date || order.created_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Ionicons 
              name={getStatusIcon(order.status)} 
              size={14} 
              color={statusColor} 
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(order.status)}
            </Text>
          </View>
        </View>

        {/* Détails de la commande */}
        <View style={styles.orderDetails}>
          <View style={styles.orderDetailItem}>
            <Ionicons name="call-outline" size={16} color="#777E5C" />
            <Text style={styles.orderDetailText} numberOfLines={1}>
              {order.customerPhone || order.phone_number || 'Non renseigné'}
            </Text>
          </View>
          <View style={styles.orderDetailItem}>
            <Ionicons name="cube-outline" size={16} color="#777E5C" />
            <Text style={styles.orderDetailText}>
              {order.items?.length || 0} article(s)
            </Text>
          </View>
          <View style={styles.orderDetailItem}>
            <Ionicons name="cash-outline" size={16} color="#4CAF50" />
            <Text style={styles.orderDetailTextPrice}>
              {order.totals && Object.keys(order.totals).length > 0 
                ? Object.entries(order.totals).map(([currency, amount]) => 
                    formatPrice(amount, currency)
                  ).join(' + ')
                : '0 FC'
              }
            </Text>
          </View>
        </View>

        {/* Aperçu des produits */}
        {order.items && order.items.length > 0 && (
          <View style={styles.productsPreview}>
            {order.items.slice(0, 4).map((item, index) => (
              <View key={`${order.id}-preview-${index}`} style={styles.previewItem}>
                {item.product_image ? (
                  <Image
                    source={{ uri: item.product_image }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.previewPlaceholder}>
                    <Ionicons name="image-outline" size={18} color="#CBD5E0" />
                  </View>
                )}
              </View>
            ))}
            {order.items.length > 4 && (
              <View style={styles.previewMore}>
                <Text style={styles.previewMoreText}>+{order.items.length - 4}</Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.orderActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonContact]}
            onPress={(e) => {
              e.stopPropagation();
              handleContactCustomer(order);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="call-outline" size={18} color="#4CAF50" />
            <Text style={styles.actionButtonTextContact}>Contacter</Text>
          </TouchableOpacity>
          
          {order.status === 'pending' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonConfirm]}
              onPress={(e) => {
                e.stopPropagation();
                handleUpdateStatus(order, 'confirmed');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#2196F3" />
              <Text style={styles.actionButtonTextConfirm}>Confirmer</Text>
            </TouchableOpacity>
          )}
          
          {order.status === 'confirmed' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonPrepare]}
              onPress={(e) => {
                e.stopPropagation();
                handleUpdateStatus(order, 'preparing');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="restaurant-outline" size={18} color="#9C27B0" />
              <Text style={styles.actionButtonTextPrepare}>Préparer</Text>
            </TouchableOpacity>
          )}
          
          {order.status === 'preparing' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonShip]}
              onPress={(e) => {
                e.stopPropagation();
                handleUpdateStatus(order, 'shipped');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="car-outline" size={18} color="#FF5722" />
              <Text style={styles.actionButtonTextShip}>Expédier</Text>
            </TouchableOpacity>
          )}
          
          {order.status === 'shipped' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonDeliver]}
              onPress={(e) => {
                e.stopPropagation();
                handleUpdateStatus(order, 'delivered');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-done-outline" size={18} color="#4CAF50" />
              <Text style={styles.actionButtonTextDeliver}>Livrer</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'time-outline',
      confirmed: 'checkmark-circle-outline',
      preparing: 'restaurant-outline',
      shipped: 'car-outline',
      delivered: 'checkmark-done-outline',
      cancelled: 'close-circle-outline'
    };
    return icons[status] || 'help-outline';
  };

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

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gestion des Commandes</Text>
          <Text style={styles.headerSubtitle}>
            {stats.total} commande(s) • {formatPrice(stats.totalRevenue || 0)} CA
          </Text>
        </View>
        <AdminNotificationCenter navigation={navigation} />
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#777E5C" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une commande..."
            value={searchQuery}
            onChangeText={setSearchQueryLocal}
            placeholderTextColor="#999999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQueryLocal('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#777E5C" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => setShowFilters(!showFilters)} 
            style={styles.filterToggleButton}
          >
            <Ionicons 
              name={showFilters ? "filter" : "filter-outline"} 
              size={20} 
              color={showFilters ? "#4CAF50" : "#777E5C"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtres de statut */}
      {showFilters && (
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Filtrer par statut</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.filterChip,
                  filters.status === option.id && styles.filterChipActive
                ]}
                onPress={() => dispatch(setStatusFilter(option.id))}
              >
                <Ionicons 
                  name={option.icon} 
                  size={16} 
                  color={filters.status === option.id ? '#4CAF50' : '#777E5C'} 
                />
                <Text style={[
                  styles.filterChipText,
                  filters.status === option.id && styles.filterChipTextActive
                ]}>
                  {option.label}
                </Text>
                <View style={[
                  styles.filterChipCount,
                  filters.status === option.id && styles.filterChipCountActive
                ]}>
                  <Text style={[
                    styles.filterChipCountText,
                    filters.status === option.id && styles.filterChipCountTextActive
                  ]}>
                    {option.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{stats.pending || 0}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{stats.confirmed || 0}</Text>
            <Text style={styles.statLabel}>Confirmées</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-done-outline" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.delivered || 0}</Text>
            <Text style={styles.statLabel}>Livrées</Text>
          </View>
        </View>

        {/* Liste des commandes */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="hourglass-outline" size={48} color="#4CAF50" />
            <Text style={styles.loadingText}>Chargement des commandes...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.ordersList}>
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#283106',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#777E5C',
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#283106',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  filterToggleButton: {
    padding: 4,
    marginLeft: 8,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777E5C',
    marginBottom: 8,
  },
  filterScroll: {
    paddingLeft: 0,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    gap: 6,
  },
  filterChipActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0FDF4',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777E5C',
  },
  filterChipTextActive: {
    color: '#4CAF50',
  },
  filterChipCount: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterChipCountActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  filterChipCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#777E5C',
  },
  filterChipCountTextActive: {
    color: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#283106',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#777E5C',
    marginTop: 4,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#777E5C',
    marginTop: 16,
  },
  ordersList: {
    padding: 20,
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#283106',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 13,
    color: '#777E5C',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  orderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  orderDetailText: {
    fontSize: 14,
    color: '#777E5C',
    fontWeight: '500',
    flex: 1,
  },
  orderDetailTextPrice: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '700',
  },
  productsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  previewItem: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  previewMore: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4CAF50',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonContact: {
    backgroundColor: '#E8F5E9',
  },
  actionButtonConfirm: {
    backgroundColor: '#E3F2FD',
  },
  actionButtonPrepare: {
    backgroundColor: '#F3E5F5',
  },
  actionButtonShip: {
    backgroundColor: '#FFEBEE',
  },
  actionButtonDeliver: {
    backgroundColor: '#E8F5E9',
  },
  actionButtonTextContact: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  actionButtonTextConfirm: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2196F3',
  },
  actionButtonTextPrepare: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9C27B0',
  },
  actionButtonTextShip: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF5722',
  },
  actionButtonTextDeliver: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
});