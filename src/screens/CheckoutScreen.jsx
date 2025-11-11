import React, { useMemo, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Text,
  Modal
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Container, 
  Button, 
  Divider,
  SectionHeader
, ScreenWrapper } from '../components/ui';
import { 
  selectCartItems, 
  selectCartTotals, 
  selectCartItemsCount,
  selectCartLoading,
  selectCartError,
  clearCart 
} from '../store/cartSlice';
import { 
  createOrder,
  fetchUserOrders,
  selectOrdersLoading,
  selectOrdersError,
  clearError
} from '../store/ordersSlice';
import { useAuth } from '../hooks/useAuth';
import { formatPrice, getCurrencySymbol } from '../utils/currency';
import { useDeliveryFee } from '../hooks/useDeliveryFee';

export default function CheckoutScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const cartItems = useSelector(selectCartItems);
  const cartTotals = useSelector(selectCartTotals);
  const cartItemsCount = useSelector(selectCartItemsCount);
  const cartLoading = useSelector(selectCartLoading);
  const cartError = useSelector(selectCartError);
  const ordersLoading = useSelector(selectOrdersLoading);
  const ordersError = useSelector(selectOrdersError);
  const [isProcessing, setIsProcessing] = useState(false);
  const { fee: deliveryFee, loading: deliveryFeeLoading } = useDeliveryFee();
  
  // États pour les formulaires - pré-remplis avec les données utilisateur
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return null;
  };

  const customerFirstName = sanitizeValue(user?.firstName) ?? sanitizeValue(user?.profile?.first_name);
  const customerLastName = sanitizeValue(user?.lastName) ?? sanitizeValue(user?.profile?.last_name);
  const customerEmail = sanitizeValue(user?.email) ?? sanitizeValue(user?.profile?.email);

  // Calculer les totaux par devise
  const subtotalByCurrency = useMemo(() => {
    return cartTotals || {};
  }, [cartTotals]);

  const totalsWithDelivery = useMemo(() => {
    const baseTotals = { ...(cartTotals || {}) };
    if (deliveryFee && deliveryFee.amount > 0) {
      const currency = deliveryFee.currency || 'CDF';
      baseTotals[currency] = (baseTotals[currency] || 0) + deliveryFee.amount;
    }
    return baseTotals;
  }, [cartTotals, deliveryFee]);

  const deliveryFeeText = useMemo(() => {
    if (deliveryFeeLoading) {
      return 'Calcul...';
    }
    if (deliveryFee && deliveryFee.amount > 0) {
      return formatPrice(deliveryFee.amount, deliveryFee.currency);
    }
    return 'Gratuite';
  }, [deliveryFee, deliveryFeeLoading]);

  const handlePlaceOrder = async () => {
    // Validation des données avant d'afficher la confirmation
    if (!user?.id) {
      Alert.alert('Erreur', 'Vous devez être connecté pour passer une commande.');
      return;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert('Adresse requise', 'Veuillez saisir votre adresse de livraison.');
      return;
    }
    
    if (!phoneNumber.trim()) {
      Alert.alert('Téléphone requis', 'Veuillez saisir votre numéro de téléphone.');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Panier vide', 'Votre panier est vide.');
      return;
    }

    // Calculer le total pour l'afficher dans la confirmation
    const totalsText = Object.entries(totalsWithDelivery)
      .map(([currency, amount]) => formatPrice(amount, currency))
      .join(' + ');

    // Afficher l'alerte de confirmation
    Alert.alert(
      'Confirmer la commande',
      `Êtes-vous sûr de vouloir passer cette commande ?\n\nTotal : ${totalsText}\nArticles : ${cartItemsCount}\nLivraison : ${deliveryAddress}`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => {}
        },
        {
          text: 'Confirmer',
          style: 'default',
          onPress: () => confirmOrder()
        }
      ],
      { cancelable: true }
    );
  };

  const confirmOrder = async () => {
    setIsProcessing(true);

    
    
    try {
      // Calculer la date de livraison estimée (24h après)
      const estimatedDelivery = new Date();
      estimatedDelivery.setHours(estimatedDelivery.getHours() + 24);

      // Créer la commande avec le backend (tous les champs existent dans la table orders)
      const orderData = {
        user_id: user.id,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_price: item.product.price,
          product_currency: item.product.currency || 'CDF',
          product_image: item.product.images?.[0] || item.product.image || null,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity
        })),
        delivery_address: deliveryAddress,
        phone_number: phoneNumber,
        notes,
        payment_method: selectedPaymentMethod,
        totals: cartTotals,
        estimated_delivery: estimatedDelivery.toISOString(),
        status: 'pending',
        delivery_fee_amount: deliveryFee?.amount || 0,
        delivery_fee_currency: deliveryFee?.currency || 'CDF',
        customer_first_name: customerFirstName,
        customer_last_name: customerLastName,
        customer_email: customerEmail
      };
      
      
      
      const result = await dispatch(createOrder(orderData)).unwrap();
   
      
      // Vider le panier après commande réussie
      dispatch(clearCart());
      
      // Afficher le modal de succès
      setShowSuccessModal(true);
      
    } catch (error) {
      
      Alert.alert(
        'Erreur de commande', 
        error || 'Une erreur est survenue lors de la création de votre commande.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToOrders = () => {
    setShowSuccessModal(false);
    // Forcer le rechargement des commandes avant la navigation
    if (user?.id) {
      dispatch(fetchUserOrders(user.id));
    }
    navigation.navigate('Orders');
  };

  // Calculer les totaux pour l'affichage
  const totalsByCurrency = subtotalByCurrency;

  return (
    <ScreenWrapper style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#283106" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Finaliser la commande</Text>
            <Text style={styles.headerSubtitle}>{cartItems.length} article(s)</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Section Récapitulatif */}
          <Container style={styles.section}>
            <SectionHeader
              title="Récapitulatif"
              subtitle="Vérifiez votre commande"
            />
            
            <View style={styles.itemsContainer}>
              {cartItems.map((item) => (
                <View key={item.product.id} style={styles.orderItem}>
                  <Image 
                    source={{ uri: item.product.images?.[0] }} 
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.product.name}</Text>
                    <Text style={styles.itemFarm}>{item.product.farm}</Text>
                    <Text style={styles.itemDetails}>
                      Quantité: {item.quantity} × {formatPrice(item.product.price, item.product.currency)}
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>
                    {formatPrice(item.product.price * item.quantity, item.product.currency)}
                  </Text>
                </View>
              ))}
            </View>

            <Divider style={styles.divider} />

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Sous-total</Text>
              <View style={styles.totalAmounts}>
                {Object.entries(totalsByCurrency).map(([currency, amount]) => (
                  <Text key={`subtotal-${currency}`} style={styles.totalAmount}>
                    {formatPrice(amount, currency)}
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Frais de livraison</Text>
              <View style={styles.totalAmounts}>
                <Text style={[styles.totalAmount, deliveryFeeText === 'Gratuite' && styles.totalAmountFree]}>
                  {deliveryFeeText}
                </Text>
              </View>
            </View>

            <Divider style={styles.totalDivider} />

            <View style={[styles.totalContainer, styles.totalContainerFinal]}>
              <Text style={styles.totalLabel}>Total à payer</Text>
              <View style={styles.totalAmounts}>
                {Object.entries(totalsWithDelivery).map(([currency, amount]) => (
                  <Text key={`total-${currency}`} style={styles.totalAmountFinal}>
                    {formatPrice(amount, currency)}
                  </Text>
                ))}
              </View>
            </View>
          </Container>

          {/* Section Informations de livraison */}
          <Container style={styles.section}>
            <SectionHeader
              title="Informations de livraison"
              subtitle="Où livrer votre commande"
            />

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Adresse de livraison *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Entrez votre adresse complète"
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                multiline
                numberOfLines={3}
                placeholderTextColor="#777E5C"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Numéro de téléphone *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Votre numéro de téléphone"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholderTextColor="#777E5C"
              />
            </View>
          </Container>

          {/* Section Notes */}
          <Container style={styles.section}>
            <SectionHeader
              title="Notes et instructions"
              subtitle="Instructions spéciales (optionnel)"
            />

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Ajoutez des instructions pour la livraison, préférences, etc."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                placeholderTextColor="#777E5C"
              />
            </View>
          </Container>

          {/* Section Paiement */}
          <Container style={styles.section}>
            <SectionHeader
              title="Mode de paiement"
              subtitle="Comment souhaitez-vous payer"
            />

            <TouchableOpacity 
              style={[styles.paymentOption, selectedPaymentMethod === 'cash' && styles.selectedPaymentOption]}
              onPress={() => setSelectedPaymentMethod('cash')}
            >
              <View style={styles.paymentInfo}>
                <Ionicons name="cash-outline" size={24} color="#4CAF50" />
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentTitle}>Paiement à la livraison</Text>
                  <Text style={styles.paymentDescription}>
                    Payez en espèces ou par carte lors de la réception de votre commande
                  </Text>
                </View>
              </View>
              <View style={[styles.radioButton, selectedPaymentMethod === 'cash' && styles.radioButtonSelected]} />
            </TouchableOpacity>
          </Container>

          {/* Section Information importante */}
          <Container style={styles.section}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color="#FF9800" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Information importante</Text>
                <Text style={styles.infoText}>
                  Notre équipe vous contactera sur WhatsApp dans les plus brefs délais pour confirmer votre commande et organiser la livraison. Le paiement se fera uniquement après réception de vos produits.
                </Text>
              </View>
            </View>
          </Container>

          {/* Section Détails de livraison */}
          <Container style={styles.section}>
            <SectionHeader
              title="Détails de livraison"
              subtitle="Informations sur la livraison"
            />
            
            <View style={styles.deliveryInfo}>
              <View style={styles.deliveryItem}>
                <Ionicons name="time-outline" size={20} color="#4CAF50" />
                <Text style={styles.deliveryText}>Délai de livraison: 24-48h</Text>
              </View>
              <View style={styles.deliveryItem}>
                <Ionicons name="location-outline" size={20} color="#4CAF50" />
                <Text style={styles.deliveryText}>Zone de livraison: Kinshasa et environs</Text>
              </View>
             
            </View>
          </Container>

          {/* Espacement pour le bouton fixe */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bouton Commander fixe */}
        <View style={styles.fixedButtonContainer}>
          <Button
            title="Confirmer la commande"
            onPress={handlePlaceOrder}
            loading={isProcessing || ordersLoading}
            style={styles.confirmButton}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Modal de succès */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            
            <Text style={styles.modalTitle}>Commande enregistrée ! 📝</Text>
            
            <Text style={styles.modalMessage}>
              Votre commande a été enregistrée avec succès. Notre équipe vous contactera sur WhatsApp dans les plus brefs délais pour confirmer votre commande et organiser la livraison. Le paiement se fera uniquement après réception de vos produits.
            </Text>
            
            <View style={styles.modalButtons}>
              <Button
                title="Voir mes commandes"
                onPress={handleGoToOrders}
                style={styles.modalButton}
              />
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate('MainApp');
                }}
              >
                <Text style={styles.modalSecondaryButtonText}>Continuer mes achats</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
   
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  itemsContainer: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  itemDetails: {
    fontSize: 14,
    color: '#777E5C',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'right',
  },
  divider: {
    marginVertical: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283106',
  },
  totalAmounts: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  totalAmountFree: {
    color: '#4CAF50',
  },
  totalDivider: {
    marginVertical: 16,
  },
  totalContainerFinal: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 16,
  },
  totalAmountFinal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#283106',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedPaymentOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0F8F0',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#777E5C',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  radioButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  fixedButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButton: {
    borderRadius: 12,
    paddingVertical: 16,
  },
  deliveryInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryText: {
    fontSize: 14,
    color: '#283106',
    marginLeft: 12,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: 350,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButtons: {
    width: '100%',
    alignItems: 'center',
  },
  modalButton: {
    width: '100%',
    marginBottom: 12,
  },
  modalSecondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  modalSecondaryButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
});