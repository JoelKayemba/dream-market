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
  selectCartItems,
  selectCartTotals,
  selectCartItemsCount,
  selectCartLoading,
  selectCartError,
  clearCart
} from '../store/cartSlice';
import { selectClientProducts } from '../store/client/productsSlice';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  subtle: '#6B7280',
  border: '#E5E7EB',
  accent: '#111827', // bouton principal noir/gris foncé
};

export default function CheckoutScreen({ navigation }) {
  const insets = useSafeAreaInsets();
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

  // États formulaire
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return null;
  };

  const customerFirstName =
    sanitizeValue(user?.firstName) ?? sanitizeValue(user?.profile?.first_name);
  const customerLastName =
    sanitizeValue(user?.lastName) ?? sanitizeValue(user?.profile?.last_name);
  const customerEmail =
    sanitizeValue(user?.email) ?? sanitizeValue(user?.profile?.email);

  const subtotalByCurrency = useMemo(() => cartTotals || {}, [cartTotals]);

  const totalsWithDelivery = useMemo(() => {
    const baseTotals = { ...(cartTotals || {}) };
    if (deliveryFee && deliveryFee.amount > 0) {
      const currency = deliveryFee.currency || 'CDF';
      baseTotals[currency] = (baseTotals[currency] || 0) + deliveryFee.amount;
    }
    return baseTotals;
  }, [cartTotals, deliveryFee]);

  const deliveryFeeText = useMemo(() => {
    if (deliveryFeeLoading) return 'Calcul...';
    if (deliveryFee && deliveryFee.amount > 0) {
      return formatPrice(deliveryFee.amount, deliveryFee.currency);
    }
    return 'Gratuite';
  }, [deliveryFee, deliveryFeeLoading]);

  // Vérifier les problèmes de stock
  // Utilise le stock actuel du produit depuis Redux, pas celui stocké dans le panier
  const checkStockIssues = useMemo(() => {
    const issues = [];
    cartItems.forEach(item => {
      // Récupérer le produit actuel depuis Redux pour avoir le stock à jour
      const currentProduct = currentProducts.find(p => p.id === item.product.id);
      // Utiliser le stock actuel si disponible, sinon celui du panier (fallback)
      const currentStock = currentProduct 
        ? (typeof currentProduct.stock === 'number' ? currentProduct.stock : null)
        : (typeof item.product.stock === 'number' ? item.product.stock : null);
      
      if (currentStock !== null && item.quantity > currentStock) {
        issues.push({
          product: currentProduct || item.product, // Utiliser le produit actuel si disponible
          quantity: item.quantity,
          stock: currentStock
        });
      }
    });
    return issues;
  }, [cartItems, currentProducts]);

  const hasStockIssues = checkStockIssues.length > 0;

  const handlePlaceOrder = async () => {
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

    // Vérifier les problèmes de stock avant de passer la commande
    if (hasStockIssues) {
      const productNames = checkStockIssues.map(issue => 
        `• ${issue.product.name} (${issue.quantity} demandé${issue.quantity > 1 ? 's' : ''}, ${issue.stock} disponible${issue.stock > 1 ? 's' : ''})`
      ).join('\n');
      
      Alert.alert(
        'Stock insuffisant',
        `Certains produits dans votre panier ne sont plus disponibles en quantité suffisante :\n\n${productNames}\n\nVeuillez retourner au panier et ajuster les quantités.`,
        [
          { text: 'Retour au panier', onPress: () => navigation.goBack() }
        ]
      );
      return;
    }

    const totalsText = Object.entries(totalsWithDelivery)
      .map(([currency, amount]) => formatPrice(amount, currency))
      .join(' + ');

    Alert.alert(
      'Confirmer la commande',
      `Êtes-vous sûr de vouloir passer cette commande ?\n\nTotal : ${totalsText}\nArticles : ${cartItemsCount}\nLivraison : ${deliveryAddress}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', style: 'default', onPress: () => confirmOrder() }
      ],
      { cancelable: true }
    );
  };

  const confirmOrder = async () => {
    setIsProcessing(true);
    try {
      const estimatedDelivery = new Date();
      estimatedDelivery.setHours(estimatedDelivery.getHours() + 24);

      const orderData = {
        user_id: user.id,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_price: item.product.price,
          product_currency: item.product.currency || 'CDF',
          product_image: item.product.images?.[0] || item.product.image || null,
          farm_id: item.product.farm_id || item.product.farms?.id || null,
          farm_name: item.product.farms?.name || null,
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

      await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
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
    if (user?.id) dispatch(fetchUserOrders(user.id));
    navigation.navigate('Orders');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Header simple */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.9}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Finaliser la commande</Text>
            <Text style={styles.headerSubtitle}>
              {cartItemsCount} article{cartItemsCount > 1 ? 's' : ''}
            </Text>
          </View>

          <View style={{ width: 36, height: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Récapitulatif */}
          <View style={styles.card}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIcon}>
                <Ionicons name="receipt-outline" size={18} color={COLORS.text} />
              </View>
              <View>
                <Text style={styles.summaryTitle}>Récapitulatif</Text>
                <Text style={styles.summarySubtitle}>Vérifiez votre commande</Text>
              </View>
            </View>

            {cartItems.map((item) => (
              <TouchableOpacity
                key={item.product.id}
                style={styles.orderItem}
                onPress={() => navigation.navigate('ProductDetail', { product: item.product })}
                activeOpacity={0.85}
              >
                <View style={styles.itemLeft}>
                  <Image
                    source={{ uri: item.product.images?.[0] || item.product.image }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.itemDetails}>
                      {item.quantity} × {formatPrice(item.product.price, item.product.currency)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemTotal}>
                  {formatPrice(item.product.price * item.quantity, item.product.currency)}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Totaux */}
            <View style={{ marginTop: 6 }}>
              {Object.entries(subtotalByCurrency).map(([currency, amount]) => (
                <View key={`subtotal-${currency}`} style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    Sous-total ({getCurrencySymbol(currency)})
                  </Text>
                  <Text style={styles.totalValue}>{formatPrice(amount, currency)}</Text>
                </View>
              ))}

              <View style={styles.totalRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="car-outline" size={14} color={COLORS.subtle} />
                  <Text style={styles.totalLabel}>Livraison</Text>
                </View>
                <Text style={styles.totalValue}>{deliveryFeeText}</Text>
              </View>

              <View style={styles.finalTotalRow}>
                <Text style={styles.finalTotalLabel}>Total à payer</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  {Object.entries(totalsWithDelivery).map(([currency, amount]) => (
                    <Text key={`total-${currency}`} style={styles.finalTotalValue}>
                      {formatPrice(amount, currency)} ({getCurrencySymbol(currency)})
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Livraison */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Informations de livraison</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Adresse de livraison *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'address' && styles.inputWrapperFocused
                ]}
              >
                <Ionicons
                  name="home-outline"
                  size={18}
                  color={COLORS.subtle}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Entrez votre adresse complète"
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#9CA3AF"
                  onFocus={() => setFocusedInput('address')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Numéro de téléphone *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'phone' && styles.inputWrapperFocused
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={18}
                  color={COLORS.subtle}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Votre numéro de téléphone"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9CA3AF"
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Notes et instructions (optionnel)</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedInput === 'notes' && styles.inputWrapperFocused
              ]}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={COLORS.subtle}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Ajoutez des instructions pour la livraison, préférences, etc."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                placeholderTextColor="#9CA3AF"
                onFocus={() => setFocusedInput('notes')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          {/* Paiement */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mode de paiement</Text>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'cash' && styles.selectedPaymentOption
              ]}
              onPress={() => setSelectedPaymentMethod('cash')}
              activeOpacity={0.9}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentText}>Paiement à la livraison</Text>
                <Text style={styles.paymentSubtext}>
                  Payez en espèces ou par carte lors de la réception.
                </Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedPaymentMethod === 'cash' && styles.radioButtonSelected
                ]}
              >
                {selectedPaymentMethod === 'cash' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.card}>
            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={COLORS.subtle}
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <Text style={styles.infoText}>
                Notre équipe vous contactera sur WhatsApp pour confirmer votre commande et organiser
                la livraison. Le paiement se fait après réception des produits.
              </Text>
            </View>
          </View>

          {/* espace pour bouton fixe */}
          <View style={{ height: 90 }} />
        </ScrollView>

        {/* CTA fixe */}
        <View style={[styles.fixedButtonContainer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <TouchableOpacity
            style={[styles.confirmButton, (isProcessing || ordersLoading || hasStockIssues) && { opacity: 0.7 }]}
            onPress={handlePlaceOrder}
            disabled={isProcessing || ordersLoading || hasStockIssues}
            activeOpacity={hasStockIssues ? 1 : 0.92}
          >
            <Ionicons 
              name={hasStockIssues ? "warning" : "checkmark-circle"} 
              size={18} 
              color="#FFFFFF" 
            />
            <Text style={styles.confirmButtonText}>
              {hasStockIssues 
                ? 'Stock insuffisant' 
                : (isProcessing || ordersLoading ? 'Traitement...' : 'Confirmer la commande')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modal succès */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Commande enregistrée ! 🎉</Text>
            <Text style={styles.modalMessage}>
              Votre commande a été enregistrée avec succès. Nous vous contacterons rapidement sur
              WhatsApp pour la confirmation et la livraison.
            </Text>

            <View style={{ gap: 10 }}>
              <TouchableOpacity style={styles.modalButton} onPress={handleGoToOrders} activeOpacity={0.9}>
                <Ionicons name="receipt-outline" size={18} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>Voir mes commandes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }]}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate('MainApp');
                }}
                activeOpacity={0.9}
              >
                <Text style={[styles.modalButtonText, { color: COLORS.text }]}>Continuer mes achats</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  keyboardAvoidingView: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  backButton: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center'
  },
  headerContent: { flex: 1, marginLeft: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  headerSubtitle: { fontSize: 12.5, color: COLORS.subtle, marginTop: 2, fontWeight: '500' },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 12 },

  // Cards
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    padding: 14
  },

  // Summary
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  summaryIcon: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  summarySubtitle: { fontSize: 12, color: COLORS.subtle, marginTop: 2 },

  orderItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  itemImage: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#F3F4F6' },
  itemName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  itemDetails: { fontSize: 12.5, color: COLORS.subtle, marginTop: 2 },
  itemTotal: { fontSize: 14.5, fontWeight: '700', color: COLORS.text },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  totalLabel: { fontSize: 13, color: COLORS.subtle },
  totalValue: { fontSize: 13.5, color: COLORS.text, fontWeight: '600' },

  finalTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10
  },
  finalTotalLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  finalTotalValue: { fontSize: 15.5, fontWeight: '800', color: COLORS.text },

  // Section titles
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },

  // Inputs
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 13.5, color: COLORS.text, fontWeight: '600', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12, paddingVertical: 10
  },
  inputWrapperFocused: { borderColor: '#9CA3AF' },
  inputIcon: { marginRight: 10, marginTop: 2 },
  textInput: { flex: 1, fontSize: 14.5, color: COLORS.text, fontWeight: '500', padding: 0 },
  textArea: { minHeight: 88, textAlignVertical: 'top' },

  // Paiement
  paymentOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, backgroundColor: COLORS.card
  },
  selectedPaymentOption: { borderColor: COLORS.text, backgroundColor: COLORS.bg },
  paymentText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  paymentSubtext: { fontSize: 12.5, color: COLORS.subtle, marginTop: 2 },

  radioButton: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center'
  },
  radioButtonSelected: { borderColor: COLORS.text },
  radioButtonInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.text },

  // Info
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, padding: 12
  },
  infoText: { fontSize: 12.5, color: COLORS.subtle, flex: 1 },

  // CTA fixe
  fixedButtonContainer: {
    paddingHorizontal: 16, paddingTop: 10,
    backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border
  },
  confirmButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 14
  },
  confirmButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', padding: 20
  },
  modalContent: {
    backgroundColor: COLORS.card, borderRadius: 12,
    width: '100%', maxWidth: 380, padding: 20,
    borderWidth: 1, borderColor: COLORS.border
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 10 },
  modalMessage: { fontSize: 13, color: COLORS.subtle, textAlign: 'center', marginBottom: 16 },
  modalButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.accent, paddingVertical: 12, borderRadius: 8
  },
  modalButtonText: { color: '#FFFFFF', fontSize: 14.5, fontWeight: '600' }
});
