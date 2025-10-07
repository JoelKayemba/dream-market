import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Image, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button , ScreenWrapper } from '../../../components/ui';
import { 
  updateOrderStatus,
  selectOrderById
} from '../../../store/admin/ordersSlice';

export default function OrderDetail({ route, navigation }) {
  const { order: initialOrder } = route.params;
  const dispatch = useDispatch();
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // Récupérer la commande mise à jour depuis le store
  const order = useSelector(selectOrderById(initialOrder.id)) || initialOrder;

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

  const handleUpdateStatus = (newStatus) => {
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
            setShowStatusModal(false);
            Alert.alert('Succès', 'Statut mis à jour avec succès');
          }
        }
      ]
    );
  };

  const handleContactCustomer = (method) => {
    const phone = order.customerPhone || order.phone_number;
    const email = order.customerEmail || order.profiles?.email;
    const orderNumber = order.orderNumber || order.order_number;
    
    const actions = {
      call: () => Alert.alert('Appel', `Appel vers ${phone}`),
      whatsapp: () => Alert.alert('WhatsApp', `Ouverture WhatsApp vers ${phone}`),
      email: () => Alert.alert('Email', `Envoi d'email à ${email}`)
    };
    
    if (actions[method]) {
      actions[method]();
      Alert.alert(
        'Contact Client',
        `Contact ${method} initié pour la commande ${orderNumber}`,
        [{ text: 'OK' }]
      );
    }
  };

  const getNextStatus = () => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'shipped',
      shipped: 'delivered'
    };
    return statusFlow[order.status];
  };

  const getAvailableStatuses = () => {
    const allStatuses = [
      { id: 'pending', label: 'En attente', icon: 'time-outline' },
      { id: 'confirmed', label: 'Confirmée', icon: 'checkmark-circle-outline' },
      { id: 'preparing', label: 'En préparation', icon: 'restaurant-outline' },
      { id: 'shipped', label: 'Expédiée', icon: 'car-outline' },
      { id: 'delivered', label: 'Livrée', icon: 'checkmark-done-outline' },
      { id: 'cancelled', label: 'Annulée', icon: 'close-circle-outline' }
    ];
    
    // Retourner tous les statuts sauf le statut actuel
    return allStatuses.filter(status => status.id !== order.status);
  };

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
          <Text style={styles.headerTitle}>Détails de la commande</Text>
                <Text style={styles.headerSubtitle}>#{order.orderNumber || order.order_number}</Text>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setShowStatusModal(true)}
        >
          <Ionicons name="pencil" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Statut de la commande */}
        <Container style={styles.section}>
          <Text style={styles.sectionTitle}>Statut de la commande</Text>
          
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIcon, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                <Ionicons name="checkmark-circle" size={24} color={getStatusColor(order.status)} />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>{getStatusLabel(order.status)}</Text>
                <Text style={styles.statusDate}>
                  Commande passée le {formatDate(order.date || order.created_at)}
                </Text>
              </View>
            </View>
            
            {(order.estimatedDelivery || order.estimated_delivery) && (
              <View style={styles.deliveryInfo}>
                <Ionicons name="time-outline" size={16} color="#777E5C" />
                <Text style={styles.deliveryText}>
                  Livraison estimée : {formatDate(order.estimatedDelivery || order.estimated_delivery)}
                </Text>
              </View>
            )}
          </View>
        </Container>

        {/* Informations client */}
        <Container style={styles.section}>
          <Text style={styles.sectionTitle}>Informations client</Text>
          
          <View style={styles.customerCard}>
            <View style={styles.customerItem}>
              <Ionicons name="person-outline" size={20} color="#4CAF50" />
              <View style={styles.customerDetails}>
                <Text style={styles.customerLabel}>Nom</Text>
                <Text style={styles.customerValue}>{order.customerName || 'Client inconnu'}</Text>
              </View>
            </View>
            
            <View style={styles.customerItem}>
              <Ionicons name="call-outline" size={20} color="#4CAF50" />
              <View style={styles.customerDetails}>
                <Text style={styles.customerLabel}>Téléphone</Text>
                <TouchableOpacity onPress={() => handleContactCustomer('call')}>
                  <Text style={[styles.customerValue, styles.contactValue]}>{order.customerPhone || order.phone_number}</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {(order.customerEmail || order.profiles?.email) && (
              <View style={styles.customerItem}>
                <Ionicons name="mail-outline" size={20} color="#4CAF50" />
                <View style={styles.customerDetails}>
                  <Text style={styles.customerLabel}>Email</Text>
                  <TouchableOpacity onPress={() => handleContactCustomer('email')}>
                    <Text style={[styles.customerValue, styles.contactValue]}>{order.customerEmail || order.profiles?.email}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </Container>

        {/* Articles de la commande */}
        <Container style={styles.section}>
          <Text style={styles.sectionTitle}>Articles commandés</Text>
          
          <View style={styles.itemsContainer}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemImagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#777E5C" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product_name || 'Produit'}</Text>
                  <Text style={styles.itemFarm}>Dream Market</Text>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.product_price || 0, item.product_currency || 'CDF')} × {item.quantity}
                  </Text>
                </View>
                <View style={styles.itemTotal}>
                  <Text style={styles.itemTotalText}>
                    {formatPrice(item.subtotal || 0, item.product_currency || 'CDF')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Container>

        {/* Informations de livraison */}
        <Container style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de livraison</Text>
          
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryItem}>
              <Ionicons name="location-outline" size={20} color="#4CAF50" />
              <View style={styles.deliveryDetails}>
                <Text style={styles.deliveryLabel}>Adresse de livraison</Text>
                <Text style={styles.deliveryValue}>{order.deliveryAddress || order.delivery_address}</Text>
              </View>
            </View>
            
            <View style={styles.deliveryItem}>
              <Ionicons name="call-outline" size={20} color="#4CAF50" />
              <View style={styles.deliveryDetails}>
                <Text style={styles.deliveryLabel}>Téléphone de contact</Text>
                <Text style={styles.deliveryValue}>{order.phoneNumber || order.phone_number}</Text>
              </View>
            </View>
            
            {order.notes && (
              <View style={styles.deliveryItem}>
                <Ionicons name="document-text-outline" size={20} color="#4CAF50" />
                <View style={styles.deliveryDetails}>
                  <Text style={styles.deliveryLabel}>Instructions spéciales</Text>
                  <Text style={styles.deliveryValue}>{order.notes}</Text>
                </View>
              </View>
            )}
          </View>
        </Container>

        {/* Résumé de la commande */}
        <Container style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé de la commande</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>
                {Object.entries(order.totals).map(([currency, amount]) => 
                  formatPrice(amount, currency)
                ).join(' + ')}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de livraison</Text>
              <Text style={styles.summaryValue}>Gratuit</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>
                {Object.entries(order.totals).map(([currency, amount]) => 
                  formatPrice(amount, currency)
                ).join(' + ')}
              </Text>
            </View>
            
            <View style={styles.paymentInfo}>
              <Ionicons name="cash-outline" size={16} color="#4CAF50" />
              <Text style={styles.paymentText}>
                Paiement à la livraison ({order.paymentMethod || order.payment_method || 'cash'})
              </Text>
            </View>
          </View>
        </Container>

        {/* Actions rapides */}
        <Container style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleContactCustomer('call')}
            >
              <Ionicons name="call" size={20} color="#4CAF50" />
              <Text style={styles.actionButtonText}>Appeler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleContactCustomer('whatsapp')}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text style={styles.actionButtonText}>WhatsApp</Text>
            </TouchableOpacity>
            
            {getNextStatus() && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.nextStatusButton]}
                onPress={() => handleUpdateStatus(getNextStatus())}
              >
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                  {getStatusLabel(getNextStatus())}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Container>

        {/* Espacement */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal de changement de statut */}
      {showStatusModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Changer le statut</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={24} color="#283106" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.statusList}>
              {getAvailableStatuses().map((status) => (
                <TouchableOpacity
                  key={status.id}
                  style={styles.statusOption}
                  onPress={() => handleUpdateStatus(status.id)}
                >
                  <Ionicons name={status.icon} size={20} color="#4CAF50" />
                  <Text style={styles.statusOptionText}>{status.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 2,
  },
  editButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
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
  // Statut
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283106',
    marginBottom: 4,
  },
  statusDate: {
    fontSize: 14,
    color: '#777E5C',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  deliveryText: {
    fontSize: 14,
    color: '#777E5C',
    marginLeft: 8,
  },
  // Client
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  customerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  customerValue: {
    fontSize: 14,
    color: '#777E5C',
    lineHeight: 20,
  },
  contactValue: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  // Articles
  itemsContainer: {
    marginTop: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  itemFarm: {
    fontSize: 12,
    color: '#777E5C',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: 14,
    color: '#777E5C',
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  // Livraison
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  deliveryDetails: {
    marginLeft: 12,
    flex: 1,
  },
  deliveryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  deliveryValue: {
    fontSize: 14,
    color: '#777E5C',
    lineHeight: 20,
  },
  // Résumé
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#777E5C',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283106',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  paymentText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '600',
  },
  // Actions
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  nextStatusButton: {
    backgroundColor: '#4CAF50',
  },
  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    minWidth: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283106',
  },
  statusList: {
    maxHeight: 300,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
    gap: 12,
  },
  statusOptionText: {
    fontSize: 16,
    color: '#283106',
    fontWeight: '500',
  },
});