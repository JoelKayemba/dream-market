import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { ScreenWrapper } from '../components/ui';
import { 
  removeFromCart, 
  updateCartItemQuantity, 
  clearCart, 
  loadCart,
  selectCartItems, 
  selectCartTotals,
  selectCartItemsCount,
  selectCartLoading,
  selectCartError
} from '../store/cartSlice';
import { formatPrice, getCurrencySymbol } from '../utils/currency';
import { useDeliveryFee } from '../hooks/useDeliveryFee';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACCENT = '#2F8F46';
const TEXT = '#111827';
const SUBTLE = '#6B7280';
const BORDER = '#E5E7EB';
const BG = '#F7F7F8';
const CARD_BG = '#FFFFFF';
const DANGER = '#DC2626';

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartTotals = useSelector(selectCartTotals);
  const cartItemsCount = useSelector(selectCartItemsCount);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const [isProcessing, setIsProcessing] = useState(false);
  const { fee: deliveryFee, loading: deliveryFeeLoading } = useDeliveryFee();

  const totalsWithDelivery = useMemo(() => {
    const baseTotals = { ...(cartTotals || {}) };
    if (deliveryFee?.amount && deliveryFee.amount > 0) {
      const currency = deliveryFee.currency || 'CDF';
      baseTotals[currency] = (baseTotals[currency] || 0) + deliveryFee.amount;
    }
    return baseTotals;
  }, [cartTotals, deliveryFee]);

  const deliveryFeeLabel = useMemo(() => {
    if (deliveryFeeLoading) return 'Calcul...';
    if (deliveryFee?.amount && deliveryFee.amount > 0) {
      return formatPrice(deliveryFee.amount, deliveryFee.currency);
    }
    return 'Gratuite';
  }, [deliveryFee, deliveryFeeLoading]);

  useEffect(() => {
    dispatch(loadCart());
  }, [dispatch]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateCartItemQuantity({ productId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (productId) => {
    Alert.alert(
      'Supprimer l\'article',
      'Êtes-vous sûr de vouloir supprimer cet article du panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => dispatch(removeFromCart(productId)) }
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Vider le panier',
      'Êtes-vous sûr de vouloir vider tout le panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Vider', style: 'destructive', onPress: () => dispatch(clearCart()) }
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Panier vide', 'Votre panier est vide. Ajoutez des produits pour continuer.');
      return;
    }
    setIsProcessing(true);
    navigation.navigate('Checkout');
    setIsProcessing(false);
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="cart-outline" size={72} color={SUBTLE} />
      </View>
      <Text style={styles.emptyTitle}>Votre panier est vide</Text>
      <Text style={styles.emptySubtitle}>
        Parcourez nos produits frais et ajoutez-les à votre panier.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('MainApp')}
        activeOpacity={0.9}
      >
        <Ionicons name="storefront-outline" size={18} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>Découvrir les produits</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}> 
      {/* Header simple */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={TEXT} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mon Panier</Text>
          <Text style={styles.itemCount}>
            {cartItemsCount} article{cartItemsCount > 1 ? 's' : ''}
          </Text>
        </View>

        {cartItems.length > 0 ? (
          <TouchableOpacity style={styles.iconBtn} onPress={handleClearCart} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={20} color={TEXT} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtnPlaceholder} />
        )}
      </View>
      <View style={styles.headerDivider} />

      {/* Contenu */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cartItems.length === 0 ? (
          renderEmptyCart()
        ) : (
          <View style={styles.cartContainer}>
            {cartItems.map((item) => (
              <TouchableOpacity
                key={item.product.id}
                style={styles.cartItem}
                onPress={() => navigation.navigate('ProductDetail', { product: item.product })}
                activeOpacity={0.85}
              >
                <Image 
                  source={{ uri: item.product.images?.[0] || item.product.image }} 
                  style={styles.itemImage}
                  resizeMode="cover"
                />

                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product.name}
                  </Text>

                  <View style={styles.metaRow}>
                    <Ionicons name="leaf-outline" size={12} color={ACCENT} />
                    <Text style={styles.itemFarm} numberOfLines={1}>
                      {item.product.farms?.name || 'Dream Market'}
                    </Text>
                  </View>

                  <View style={styles.itemPriceRow}>
                    {item.product.old_price && (
                      <Text style={styles.itemOldPrice}>
                        {formatPrice(item.product.old_price, item.product.currency)}
                      </Text>
                    )}
                    <Text style={styles.itemPrice}>
                      {formatPrice(item.product.price, item.product.currency)}
                    </Text>
                  </View>

                  <View style={styles.actionsRow}>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(item.product.id, item.quantity - 1);
                        }}
                        activeOpacity={0.9}
                      >
                        <Ionicons name="remove" size={16} color={TEXT} />
                      </TouchableOpacity>

                      <Text style={styles.quantityText}>{item.quantity}</Text>

                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(item.product.id, item.quantity + 1);
                        }}
                        activeOpacity={0.9}
                      >
                        <Ionicons name="add" size={16} color={TEXT} />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item.product.id);
                      }}
                      activeOpacity={0.9}
                    >
                      <Ionicons name="trash-outline" size={18} color={DANGER} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer total + CTA */}
      {cartItems.length > 0 && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.totalSection}>
            {Object.entries(cartTotals).map(([currency, total]) => (
              <View key={currency} style={styles.totalRow}>
                <Text style={styles.totalLabel}>Sous-total ({getCurrencySymbol(currency)})</Text>
                <Text style={styles.totalValue}>{formatPrice(total, currency)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <View style={styles.deliveryRow}>
                <Ionicons name="car-outline" size={16} color={SUBTLE} />
                <Text style={styles.totalLabel}>Livraison</Text>
              </View>
              <Text style={[styles.totalValue, deliveryFeeLabel === 'Gratuite' && styles.totalValueFree]}>
                {deliveryFeeLabel}
              </Text>
            </View>

            <View style={styles.line} />

            {Object.entries(totalsWithDelivery).map(([currency, total]) => (
              <View key={`total-${currency}`} style={styles.finalTotalRow}>
                <Text style={styles.finalTotalLabel}>Total ({getCurrencySymbol(currency)})</Text>
                <Text style={styles.finalTotalValue}>{formatPrice(total, currency)}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
            disabled={isProcessing || loading}
            activeOpacity={0.92}
          >
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            <Text style={styles.checkoutButtonText}>
              {isProcessing || loading ? 'Traitement...' : 'Passer la commande'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: CARD_BG,
    
  },
  headerDivider: {
    height: 1,
    backgroundColor: BORDER,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  iconBtnPlaceholder: {
    width: 36,
    height: 36,
  },
  headerContent: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT,
  },
  itemCount: {
    fontSize: 12,
    color: SUBTLE,
    marginTop: 2,
    fontWeight: '500',
  },

  /* Scroll */
  content: { flex: 1 },
  scrollContent: { paddingBottom: 12 },

  /* Cart list */
  cartContainer: {
    padding: 12,
    gap: 8,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  itemImage: {
    width: 88,
    height: 88,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 6,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  itemFarm: {
    fontSize: 12,
    color: ACCENT,
    fontWeight: '600',
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  itemOldPrice: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: 0.2,
  },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 6,
    height: 36,
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  quantityText: {
    minWidth: 26,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: TEXT,
  },
  removeButton: {
    padding: 6,
  },

  /* Empty */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: SUBTLE,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '500',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Footer */
  footer: {
    backgroundColor: CARD_BG,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  totalSection: {
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalLabel: {
    fontSize: 13,
    color: SUBTLE,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 14,
    color: TEXT,
    fontWeight: '700',
  },
  totalValueFree: {
    color: ACCENT,
    fontWeight: '700',
  },
  line: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 8,
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: 0.2,
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: 0.2,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
