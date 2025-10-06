import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
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
import { selectOrders } from '../store/ordersSlice';
import { formatPrice } from '../utils/currency';

export default function OrderDetailScreen({ navigation, route }) {
  const orders = useSelector(selectOrders);
  const { orderId } = route.params;
  
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#F44336" />
          <Text style={styles.errorTitle}>Commande introuvable</Text>
          <Text style={styles.errorSubtitle}>
            Cette commande n'existe pas ou a été supprimée
          </Text>
          <Button
            title="Retour aux commandes"
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

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

  const handleContactSupport = () => {
    Alert.alert(
      'Contacter le support',
      'Voulez-vous contacter notre équipe pour cette commande ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'WhatsApp', 
          onPress: () => {
            // Ici on pourrait ouvrir WhatsApp avec un message pré-rempli
            Alert.alert('WhatsApp', 'Redirection vers WhatsApp...');
          }
        },
        { 
          text: 'Téléphone', 
          onPress: () => {
            // Ici on pourrait composer le numéro de support
            Alert.alert('Téléphone', 'Composition du numéro de support...');
          }
        }
      ]
    );
  };

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
          <Text style={styles.headerTitle}>Détails de la commande</Text>
          <Text style={styles.headerSubtitle}>#{order.orderNumber}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Statut de la commande */}
        <Container style={styles.section}>
          <SectionHeader
            title="Statut de la commande"
            subtitle="Suivi en temps réel"
          />
          
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIcon, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                <Ionicons name="checkmark-circle" size={24} color={getStatusColor(order.status)} />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>{getStatusLabel(order.status)}</Text>
                <Text style={styles.statusDate}>
                  Commande passée le {formatDate(order.date)}
                </Text>
              </View>
            </View>
            
            {order.estimatedDelivery && (
              <View style={styles.deliveryInfo}>
                <Ionicons name="time-outline" size={16} color="#777E5C" />
                <Text style={styles.deliveryText}>
                  Livraison estimée : {formatDate(order.estimatedDelivery)}
                </Text>
              </View>
            )}
          </View>
        </Container>

        {/* Articles de la commande */}
        <Container style={styles.section}>
          <SectionHeader
            title="Articles commandés"
            subtitle={`${order.items.length} article(s)`}
          />
          
          <View style={styles.itemsContainer}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <Image 
                  source={{ uri: item.product.images?.[0] || item.product.image }} 
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <Text style={styles.itemFarm}>{item.product.farm}</Text>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.product.price, item.product.currency)} × {item.quantity}
                  </Text>
                </View>
                <View style={styles.itemTotal}>
                  <Text style={styles.itemTotalText}>
                    {formatPrice(item.product.price * item.quantity, item.product.currency)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Container>

        {/* Informations de livraison */}
        <Container style={styles.section}>
          <SectionHeader
            title="Informations de livraison"
            subtitle="Adresse et contact"
          />
          
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryItem}>
              <Ionicons name="location-outline" size={20} color="#4CAF50" />
              <View style={styles.deliveryDetails}>
                <Text style={styles.deliveryLabel}>Adresse de livraison</Text>
                <Text style={styles.deliveryValue}>{order.deliveryAddress}</Text>
              </View>
            </View>
            
            <View style={styles.deliveryItem}>
              <Ionicons name="call-outline" size={20} color="#4CAF50" />
              <View style={styles.deliveryDetails}>
                <Text style={styles.deliveryLabel}>Téléphone de contact</Text>
                <Text style={styles.deliveryValue}>{order.phoneNumber}</Text>
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
          <SectionHeader
            title="Résumé de la commande"
            subtitle="Détails financiers"
          />
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>
                {Object.entries(order.totals).map(([currency, amount]) => 
                  `${formatPrice(amount, currency)}`
                ).join(' + ')}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de livraison</Text>
              <Text style={styles.summaryValue}>Gratuit</Text>
            </View>
            
            <Divider style={styles.summaryDivider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>
                {Object.entries(order.totals).map(([currency, amount]) => 
                  `${formatPrice(amount, currency)}`
                ).join(' + ')}
              </Text>
            </View>
            
            <View style={styles.paymentInfo}>
              <Ionicons name="cash-outline" size={16} color="#4CAF50" />
              <Text style={styles.paymentText}>
                Paiement à la livraison ({order.paymentMethod})
              </Text>
            </View>
          </View>
        </Container>

        {/* Actions */}
        <Container style={styles.section}>
          <Button
            title="Contacter le support"
            onPress={handleContactSupport}
            variant="outline"
            style={styles.supportButton}
          />
        </Container>

        {/* Espacement */}
        <View style={{ height: 20 }} />
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
  supportButton: {
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#777E5C',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    minWidth: 200,
  },
});
