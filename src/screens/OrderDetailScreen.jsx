import React, { useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
  Text
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Container, 
  Button, 
  Divider,
  SectionHeader,
  ScreenWrapper,
  InvoiceModal
} from '../components/ui';
import { 
  fetchOrderById,
  selectCurrentOrder,
  selectOrdersLoading,
  selectOrdersError,
  clearError
} from '../store/ordersSlice';
import { formatPrice, getCurrencySymbol } from '../utils/currency';
import { openWhatsApp, openPhoneCall, openEmail, CONTACT_INFO } from '../utils/contactInfo';

export default function OrderDetailScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { orderId } = route.params;
  const order = useSelector(selectCurrentOrder);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const [showInvoiceModal, setShowInvoiceModal] = React.useState(false);

  // Vérifier que orderId est valide
  if (!orderId) {
    console.error('🔔 [OrderDetailScreen] Pas d\'orderId fourni dans les paramètres');
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#F44336" />
          <Text style={styles.errorTitle}>Erreur de navigation</Text>
          <Text style={styles.errorSubtitle}>
            Aucun ID de commande fourni
          </Text>
        </View>
      </View>
    );
  }

  // Charger la commande au montage
  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId]);

  

  // Gérer les erreurs
  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // État de chargement - Version simplifiée pour debug
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>Chargement...</Text>
          <Text style={styles.loadingSubtitle}>
            Récupération des détails de la commande
          </Text>
        </View>
      </View>
    );
  }

  // Commande introuvable - Version simplifiée pour debug
  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Commande introuvable</Text>
          <Text style={styles.errorSubtitle}>
            Cette commande n'existe pas ou a été supprimée
          </Text>
        </View>
      </View>
    );
  }

  const normalizeCustomerField = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    return String(value);
  };

  const pickCustomerValue = (...values) => {
    for (const value of values) {
      const normalized = normalizeCustomerField(value);
      if (normalized) return normalized;
    }
    return '';
  };

  const customerFirstName = pickCustomerValue(order.profiles?.first_name, order.customer_first_name, order.customerFirstName);
  const customerLastName = pickCustomerValue(order.profiles?.last_name, order.customer_last_name, order.customerLastName);
  const customerEmail = pickCustomerValue(order.profiles?.email, order.customer_email, order.customerEmail);
  const customerDisplayName = (customerFirstName || customerLastName)
    ? [customerFirstName, customerLastName].filter(Boolean).join(' ')
    : customerEmail || 'Non renseigné';

  const deliveryFeeAmount = Number(order.delivery_fee_amount ?? order.deliveryFeeAmount ?? 0) || 0;
  const deliveryFeeCurrency = pickCustomerValue(order.delivery_fee_currency, order.deliveryFeeCurrency) || 'CDF';
  const deliveryFeeDisplay = deliveryFeeAmount > 0
    ? formatPrice(deliveryFeeAmount, deliveryFeeCurrency)
    : 'Gratuit';

  const totalsWithDelivery = order?.totalsWithDelivery
    ? order.totalsWithDelivery
    : (() => {
        const baseTotals = { ...(order.totals || {}) };
        if (deliveryFeeAmount > 0) {
          baseTotals[deliveryFeeCurrency] = (baseTotals[deliveryFeeCurrency] || 0) + deliveryFeeAmount;
        }
        return baseTotals;
      })();

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

  // Gérer le contact avec le support
  const handleContactSupport = () => {
    const orderNumber = order.order_number || order.orderNumber || 'N/A';
    const orderStatus = getStatusLabel(order.status);
    
    // Message pré-rempli pour WhatsApp et Email
    const message = `Bonjour,\n\nJe souhaite contacter le support concernant ma commande #${orderNumber}.\n\nStatut actuel : ${orderStatus}\n\nMerci de votre assistance.`;
    const emailSubject = `Demande de support - Commande #${orderNumber}`;
    const emailBody = `Bonjour,\n\nJe souhaite contacter le support concernant ma commande #${orderNumber}.\n\nStatut actuel : ${orderStatus}\n\nMerci de votre assistance.\n\nCordialement`;

    Alert.alert(
      'Contacter le support',
      'Comment souhaitez-vous contacter notre équipe ?',
      [
        { 
          text: 'WhatsApp', 
          onPress: () => openWhatsApp(CONTACT_INFO.phone1, message)
        },
        { 
          text: 'Téléphone', 
          onPress: () => openPhoneCall(CONTACT_INFO.phone1)
        },
        { 
          text: 'Email', 
          onPress: () => openEmail(CONTACT_INFO.email, emailSubject, emailBody)
        },
        { 
          text: 'Annuler', 
          style: 'cancel' 
        }
      ],
      { cancelable: true }
    );
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
          <Text style={styles.headerSubtitle}>#{order.order_number}</Text>
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
                  Commande passée le {formatDate(order.created_at || order.date)}
                </Text>
              </View>
            </View>
            
            {(order.estimated_delivery || order.estimatedDelivery) && (
              <View style={styles.deliveryInfo}>
                <Ionicons name="time-outline" size={16} color="#777E5C" />
                <Text style={styles.deliveryText}>
                  Livraison estimée : {formatDate(order.estimated_delivery || order.estimatedDelivery)}
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
            {Array.isArray(order.items) && order.items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                {item.product_image ? (
                  <Image
                    source={{ uri: item.product_image }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <Ionicons name="image-outline" size={32} color="#9E9E9E" />
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product_name || 'Produit'}</Text>
                  {item.farm_name && (
                    <View style={styles.farmRow}>
                      <Ionicons name="leaf-outline" size={12} color="#4CAF50" />
                      <Text style={styles.itemFarm}>{item.farm_name}</Text>
                    </View>
                  )}
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.product_price, item.product_currency)} × {item.quantity}
                  </Text>
                </View>
                <View style={styles.itemTotal}>
                  <Text style={styles.itemTotalText}>
                    {formatPrice(item.subtotal, item.product_currency)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Container>

        {/* Informations du client */}
        <Container style={styles.section}>
          <SectionHeader
            title="Informations du client"
            subtitle="Détails du commanditaire"
          />
          
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryItem}>
              <Ionicons name="person-outline" size={20} color="#4CAF50" />
              <View style={styles.deliveryDetails}>
                <Text style={styles.deliveryLabel}>Nom du client</Text>
                <Text style={styles.deliveryValue}>
                  {customerDisplayName}
                </Text>
              </View>
            </View>
            
            <View style={styles.deliveryItem}>
              <Ionicons name="mail-outline" size={20} color="#4CAF50" />
              <View style={styles.deliveryDetails}>
                <Text style={styles.deliveryLabel}>Email</Text>
                <Text style={styles.deliveryValue}>{customerEmail || 'Non renseigné'}</Text>
              </View>
            </View>
            
            <View style={styles.deliveryItem}>
              <Ionicons name="call-outline" size={20} color="#4CAF50" />
              <View style={styles.deliveryDetails}>
                <Text style={styles.deliveryLabel}>Téléphone de contact</Text>
                <Text style={styles.deliveryValue}>{order.phone_number}</Text>
              </View>
            </View>
          </View>
        </Container>

        {/* Informations de livraison */}
        <Container style={styles.section}>
          <SectionHeader
            title="Informations de livraison"
            subtitle="Adresse et instructions"
          />
          
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryItem}>
              <Ionicons name="location-outline" size={20} color="#4CAF50" />
              <View style={styles.deliveryDetails}>
                <Text style={styles.deliveryLabel}>Adresse de livraison</Text>
                <Text style={styles.deliveryValue}>{order.delivery_address}</Text>
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
                {Object.entries(order.totals || {}).map(([currency, amount]) => 
                  `${formatPrice(amount, currency)}`
                ).join(' + ')}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de livraison</Text>
              <Text style={[styles.summaryValue, deliveryFeeAmount === 0 && styles.summaryValueFree]}>{deliveryFeeDisplay}</Text>
            </View>
            
            <Divider style={styles.summaryDivider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <View style={styles.summaryTotalValue}>
                {totalsWithDelivery && Object.entries(totalsWithDelivery).map(([currency, amount]) => (
                  <Text key={currency} style={styles.totalText}>
                    {formatPrice(amount, currency)}
                  </Text>
                ))}
              </View>
            </View>
            
            <View style={styles.paymentInfo}>
              <Ionicons name="cash-outline" size={16} color="#4CAF50" />
              <Text style={styles.paymentText}>
                Paiement à la livraison ({order.payment_method || 'cash'})
              </Text>
            </View>
          </View>
        </Container>

        {/* Facture */}
        <Container style={styles.section}>
          <SectionHeader
            title="Facture"
            subtitle="Téléchargez ou consultez votre facture"
          />
          
          <View style={styles.invoiceCard}>
            <View style={styles.invoiceInfo}>
              <Ionicons name="receipt-outline" size={24} color="#4CAF50" />
              <View style={styles.invoiceDetails}>
                <Text style={styles.invoiceTitle}>Facture #{order.order_number || order.orderNumber}</Text>
                <Text style={styles.invoiceSubtitle}>
                  Générée le {formatDate(order.created_at || order.date)}
                </Text>
              </View>
            </View>
            
            <Button
              title="Voir la facture"
              onPress={() => setShowInvoiceModal(true)}
              variant="primary"
              style={styles.invoiceButton}
            />
          </View>
        </Container>

        {/* Actions */}
        <Container style={styles.section}>
          <View style={styles.noticeContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#FF9800" />
            <Text style={styles.noticeText}>
              Pour annuler une commande, veuillez contacter notre équipe
            </Text>
          </View>
          
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

      {/* Modal Facture */}
      <InvoiceModal
        visible={showInvoiceModal}
        order={order}
        onClose={() => setShowInvoiceModal(false)}
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
  farmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  itemFarm: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
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
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
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
  summaryValueFree: {
    color: '#4CAF50',
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
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    marginLeft: 8,
    lineHeight: 20,
  },
  supportButton: {
    marginTop: 8,
  },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  invoiceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  invoiceDetails: {
    flex: 1,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#283106',
    marginBottom: 4,
  },
  invoiceSubtitle: {
    fontSize: 12,
    color: '#777E5C',
  },
  invoiceButton: {
    marginTop: 0,
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
