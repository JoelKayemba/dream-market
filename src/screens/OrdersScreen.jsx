import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { 
  Container, 
  Button, 
  Divider,
  SectionHeader
} from '../components/ui';
import { selectOrders, selectRecentOrders } from '../store/ordersSlice';
import { formatPrice } from '../utils/currency';

export default function OrdersScreen({ navigation }) {
  const orders = useSelector(selectOrders);
  const recentOrders = useSelector(selectRecentOrders);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = [
    { id: 'all', label: 'Toutes', icon: 'list-outline' },
    { id: 'pending', label: 'En attente', icon: 'time-outline' },
    { id: 'confirmed', label: 'Confirmée', icon: 'checkmark-circle-outline' },
    { id: 'preparing', label: 'En préparation', icon: 'restaurant-outline' },
    { id: 'shipped', label: 'Expédiée', icon: 'car-outline' },
    { id: 'delivered', label: 'Livrée', icon: 'checkmark-done-outline' },
    { id: 'cancelled', label: 'Annulée', icon: 'close-circle-outline' }
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
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulation du refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderOrderItem = (order) => (
    <TouchableOpacity 
      key={order.id} 
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Commande #{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusLabel(order.status)}
          </Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        <Text style={styles.itemsCount}>
          {order.items.length} article(s)
        </Text>
        <View style={styles.itemsList}>
          {order.items.slice(0, 2).map((item, index) => (
            <Text key={index} style={styles.itemName}>
              • {item.product.name} (x{item.quantity})
            </Text>
          ))}
          {order.items.length > 2 && (
            <Text style={styles.moreItems}>
              +{order.items.length - 2} autre(s) article(s)
            </Text>
          )}
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>
            {Object.entries(order.totals).map(([currency, amount]) => 
              `${formatPrice(amount, currency)}`
            ).join(' + ')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#777E5C" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color="#777E5C" />
      <Text style={styles.emptyTitle}>Aucune commande</Text>
      <Text style={styles.emptySubtitle}>
        {selectedStatus === 'all' 
          ? "Vous n'avez pas encore passé de commande"
          : `Aucune commande avec le statut "${getStatusLabel(selectedStatus)}"`
        } 
        
      </Text>
      {selectedStatus === 'all' && (
        <Button
          title="Découvrir nos produits"
          onPress={() => navigation.navigate('MainApp')}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

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
          <Text style={styles.headerTitle}>Mes Commandes</Text>
          <Text style={styles.headerSubtitle}>{orders.length} commande(s)</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filtres de statut */}
        <Container style={styles.section}>
          <SectionHeader
            title="Filtrer par statut"
            subtitle="Sélectionnez le statut des commandes"
          />
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
                  selectedStatus === option.id && styles.selectedStatusFilter
              ]}
                onPress={() => setSelectedStatus(option.id)}
            >
                <Ionicons 
                  name={option.icon} 
                  size={16} 
                  color={selectedStatus === option.id ? '#FFFFFF' : '#777E5C'} 
                />
              <Text style={[
                  styles.statusFilterText,
                  selectedStatus === option.id && styles.selectedStatusFilterText
                ]}>
                  {option.label}
                </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Container>

      {/* Liste des commandes */}
        <Container style={styles.section}>
        <SectionHeader
            title="Commandes"
            subtitle={`${filteredOrders.length} commande(s) trouvée(s)`}
        />
        
          {filteredOrders.length > 0 ? (
        <View style={styles.ordersList}>
              {filteredOrders.map(renderOrderItem)}
                </View>
          ) : (
            renderEmptyState()
          )}
        </Container>

        {/* Espacement pour le bouton fixe */}
        <View style={{ height: 100 }} />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  statusFilters: {
    marginTop: 8,
  },
  statusFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  },
  selectedStatusFilterText: {
    color: '#FFFFFF',
  },
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
  orderDate: {
    fontSize: 14,
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
  orderItems: {
    marginBottom: 12,
  },
  itemsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 8,
  },
  itemsList: {
    marginLeft: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#777E5C',
    marginBottom: 4,
  },
  moreItems: {
    fontSize: 14,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginRight: 8,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
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
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyButton: {
    minWidth: 200,
  },
});
