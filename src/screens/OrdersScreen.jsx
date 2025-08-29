import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  Container, 
  SectionHeader,
  Divider,
  Badge,
  Button
} from '../components/ui';

export default function OrdersScreen({ navigation }) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', name: 'Toutes', count: 47 },
    { id: 'processing', name: 'En cours', count: 3 },
    { id: 'shipped', name: 'Expédiées', count: 2 },
    { id: 'delivered', name: 'Livrées', count: 42 },
    { id: 'cancelled', name: 'Annulées', count: 0 }
  ];

  const orders = [
    {
      id: 1,
      orderNumber: 'CMD-2024-001',
      date: '15 Jan 2024',
      status: 'delivered',
      total: 89.50,
      items: [
        { id: 1, name: 'Tomates Bio', quantity: 2, price: 12.50, image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=100&h=100&fit=crop' },
        { id: 2, name: 'Salade Verte', quantity: 1, price: 8.90, image: 'https://images.unsplash.com/photo-1622205313162-be1d571c1cba?w=100&h=100&fit=crop' },
        { id: 3, name: 'Carottes', quantity: 3, price: 15.60, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=100&h=100&fit=crop' }
      ],
      farm: 'Ferme du Soleil Levant',
      deliveryAddress: '123 Rue de la Paix, 75001 Paris',
      estimatedDelivery: '17 Jan 2024',
      actualDelivery: '16 Jan 2024',
      trackingNumber: 'TRK-2024-001',
      paymentMethod: 'Carte bancaire',
      paymentStatus: 'paid'
    },
    {
      id: 2,
      orderNumber: 'CMD-2024-002',
      date: '12 Jan 2024',
      status: 'processing',
      total: 156.80,
      items: [
        { id: 4, name: 'Pommes Golden', quantity: 5, price: 18.90, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100&h=100&fit=crop' },
        { id: 5, name: 'Poires', quantity: 3, price: 22.50, image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=100&h=100&fit=crop' },
        { id: 6, name: 'Framboises', quantity: 2, price: 28.40, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' }
      ],
      farm: 'Verger des Trois Chênes',
      deliveryAddress: '123 Rue de la Paix, 75001 Paris',
      estimatedDelivery: '18 Jan 2024',
      actualDelivery: null,
      trackingNumber: 'TRK-2024-002',
      paymentMethod: 'PayPal',
      paymentStatus: 'paid'
    },
    {
      id: 3,
      orderNumber: 'CMD-2024-003',
      date: '8 Jan 2024',
      status: 'delivered',
      total: 67.30,
      items: [
        { id: 7, name: 'Lait Bio', quantity: 2, price: 12.80, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop' },
        { id: 8, name: 'Fromage de Chèvre', quantity: 1, price: 18.90, image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=100&h=100&fit=crop' },
        { id: 9, name: 'Yaourt', quantity: 4, price: 8.90, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100&h=100&fit=crop' }
      ],
      farm: 'Ferme de la Vallée',
      deliveryAddress: '123 Rue de la Paix, 75001 Paris',
      estimatedDelivery: '11 Jan 2024',
      actualDelivery: '10 Jan 2024',
      trackingNumber: 'TRK-2024-003',
      paymentMethod: 'Carte bancaire',
      paymentStatus: 'paid'
    }
  ];

  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId);
  };

  const getFilteredOrders = () => {
    if (selectedFilter === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === selectedFilter);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return '#4CAF50';
      case 'processing':
        return '#FF9800';
      case 'shipped':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#777E5C';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Livré';
      case 'processing':
        return 'En cours';
      case 'shipped':
        return 'Expédié';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return 'checkmark-circle';
      case 'processing':
        return 'time';
      case 'shipped':
        return 'car';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const filteredOrders = getFilteredOrders();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Container style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.title}>Mes Commandes</Text>
        <View style={styles.placeholder} />
      </Container>

      <Divider />

      {/* Filtres */}
      <Container style={styles.filtersSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.selectedFilter
              ]}
              onPress={() => handleFilterChange(filter.id)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.selectedFilterText
              ]}>
                {filter.name}
              </Text>
              <View style={[
                styles.filterCount,
                selectedFilter === filter.id && styles.selectedFilterCount
              ]}>
                <Text style={[
                  styles.filterCountText,
                  selectedFilter === filter.id && styles.selectedFilterCountText
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Container>

      <Divider />

      {/* Liste des commandes */}
      <Container style={styles.ordersSection}>
        <SectionHeader
          title={`Commandes (${filteredOrders.length})`}
          subtitle="Suivez l'état de vos commandes"
          style={styles.fullWidthHeader}
        />
        
        <View style={styles.ordersList}>
          {filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              {/* En-tête de la commande */}
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  <Text style={styles.orderDate}>{order.date}</Text>
                  <Text style={styles.orderFarm}>🏡 {order.farm}</Text>
                </View>
                <View style={styles.orderStatusContainer}>
                  <Badge 
                    text={getStatusText(order.status)} 
                    variant="success"
                    size="small"
                    style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) }]}
                  />
                  <Ionicons 
                    name={getStatusIcon(order.status)} 
                    size={20} 
                    color={getStatusColor(order.status)} 
                    style={styles.statusIcon}
                  />
                </View>
              </View>

              <Divider />

              {/* Articles de la commande */}
              <View style={styles.orderItems}>
                {order.items.map((item) => (
                  <View key={item.id} style={styles.orderItem}>
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>Quantité: {item.quantity}</Text>
                      <Text style={styles.itemPrice}>{item.price.toFixed(2)} €</Text>
                    </View>
                    <View style={styles.itemTotal}>
                      <Text style={styles.itemTotalText}>
                        {(item.price * item.quantity).toFixed(2)} €
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <Divider />

              {/* Informations de livraison */}
              <View style={styles.deliveryInfo}>
                <View style={styles.deliveryRow}>
                  <Ionicons name="location" size={16} color="#777E5C" />
                  <Text style={styles.deliveryText}>{order.deliveryAddress}</Text>
                </View>
                <View style={styles.deliveryRow}>
                  <Ionicons name="calendar" size={16} color="#777E5C" />
                  <Text style={styles.deliveryText}>
                    Livraison estimée: {order.estimatedDelivery}
                  </Text>
                </View>
                {order.actualDelivery && (
                  <View style={styles.deliveryRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={[styles.deliveryText, { color: '#4CAF50' }]}>
                      Livrée le: {order.actualDelivery}
                    </Text>
                  </View>
                )}
              </View>

              <Divider />

              {/* Actions et total */}
              <View style={styles.orderFooter}>
                <View style={styles.orderTotalContainer}>
                  <Text style={styles.orderTotalLabel}>Total:</Text>
                  <Text style={styles.orderTotalAmount}>{order.total.toFixed(2)} €</Text>
                </View>
                <View style={styles.orderActions}>
                  {order.status === 'processing' && (
                    <Button
                      title="Suivre"
                      onPress={() => console.log('Suivre commande:', order.orderNumber)}
                      variant="primary"
                      size="small"
                      style={styles.actionButton}
                    />
                  )}
                  {order.status === 'delivered' && (
                    <Button
                      title="Évaluer"
                      onPress={() => console.log('Évaluer commande:', order.orderNumber)}
                      variant="outline"
                      size="small"
                      style={styles.actionButton}
                    />
                  )}
                  <Button
                    title="Détails"
                    onPress={() => console.log('Voir détails:', order.orderNumber)}
                    variant="outline"
                    size="small"
                    style={styles.actionButton}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginHorizontal: -20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#283106',
    fontWeight: 'bold',
    fontSize: 20,
  },
  placeholder: {
    width: 40,
  },
  filtersSection: {
    paddingVertical: 16,
  },
  filtersContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    gap: 8,
  },
  selectedFilter: {
    backgroundColor: '#283106',
    borderColor: '#283106',
  },
  filterText: {
    color: '#777E5C',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  filterCount: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  selectedFilterCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterCountText: {
    color: '#777E5C',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedFilterCountText: {
    color: '#FFFFFF',
  },
  ordersSection: {
    paddingVertical: 20,
  },
  fullWidthHeader: {
    width: '100%',
  },
  ordersList: {
    gap: 16,
    paddingHorizontal: 4,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
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
    padding: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    color: '#283106',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  orderDate: {
    color: '#777E5C',
    fontSize: 14,
    marginBottom: 4,
  },
  orderFarm: {
    color: '#777E5C',
    fontSize: 13,
  },
  orderStatusContainer: {
    alignItems: 'center',
    gap: 4,
  },
  orderStatus: {
    alignSelf: 'flex-start',
  },
  statusIcon: {
    marginTop: 4,
  },
  orderItems: {
    padding: 16,
    gap: 12,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#283106',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  itemQuantity: {
    color: '#777E5C',
    fontSize: 12,
    marginBottom: 2,
  },
  itemPrice: {
    color: '#777E5C',
    fontSize: 12,
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  deliveryInfo: {
    padding: 16,
    gap: 8,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryText: {
    color: '#777E5C',
    fontSize: 13,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  orderTotalContainer: {
    alignItems: 'flex-start',
  },
  orderTotalLabel: {
    color: '#777E5C',
    fontSize: 14,
    marginBottom: 2,
  },
  orderTotalAmount: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 18,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
  },
});
