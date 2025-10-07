import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Button, Badge } from '../components/ui';
import { 
  removeFromCart, 
  updateCartItemQuantity, 
  clearCart, 
  loadCart,
  selectCartItems, 
  selectCartTotal,
  selectCartTotals,
  selectCartItemsCount,
  selectCartLoading,
  selectCartError
} from '../store/cartSlice';
import { formatPrice, getCurrencySymbol } from '../utils/currency';

export default function CartScreen({ navigation }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartTotals = useSelector(selectCartTotals);
  const cartItemsCount = useSelector(selectCartItemsCount);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const [isProcessing, setIsProcessing] = useState(false);

  // Charger le panier depuis AsyncStorage au montage
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
    // Navigation directe vers le checkout
    navigation.navigate('Checkout');
    setIsProcessing(false);
  };


  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color="#777E5C" />
      <Text style={styles.emptyTitle}>Votre panier est vide</Text>
      <Text style={styles.emptySubtitle}>
        Découvrez nos produits frais et ajoutez-les à votre panier
      </Text>
      
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
          <Text style={styles.headerTitle}>Panier</Text>
          <Text style={styles.itemCount}>
            {cartItemsCount} article{cartItemsCount > 1 ? 's' : ''}
          </Text>
        </View>
        
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCart}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Contenu du panier */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {cartItems.length === 0 ? (
          renderEmptyCart()
        ) : (
          <Container style={styles.cartContainer}>
            {cartItems.map((item) => (
              <View key={item.product.id} style={styles.cartItem}>
                <Image source={{ uri: item.product.images?.[0] || item.product.image }} style={styles.itemImage} />
                
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => {
                      if (item.product.farmId && navigation) {
                        // Trouver la ferme correspondante
                        const farm = require('../data/farms').farms.find(f => f.id === item.product.farmId);
                        if (farm) {
                          navigation.navigate('FarmDetail', { farm });
                        }
                      }
                    }}
                  >
                    <Text style={styles.itemFarm}>
                      🏡 {item.product.farmId ? 
                        (() => {
                          const farm = require('../data/farms').farms.find(f => f.id === item.product.farmId);
                          return farm ? farm.name : item.product.farm;
                        })() : 
                        'Dream Market'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.itemPrice}>{formatPrice(item.product.price, item.product.currency)}</Text>
                  
                  <View style={styles.itemActions}>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={16} color="#777E5C" />
                      </TouchableOpacity>
                      
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={16} color="#777E5C" />
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(item.product.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </Container>
        )}
      </ScrollView>

      {/* Footer avec total et bouton de commande */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalSection}>
            {Object.entries(cartTotals).map(([currency, total]) => (
              <View key={currency} style={styles.totalRow}>
                <Text style={styles.totalLabel}>Sous-total ({getCurrencySymbol(currency)})</Text>
                <Text style={styles.totalValue}>{formatPrice(total, currency)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Livraison</Text>
              <Text style={styles.totalValue}>Gratuite</Text>
            </View>
            {Object.entries(cartTotals).map(([currency, total]) => (
              <View key={`total-${currency}`} style={[styles.totalRow, styles.finalTotal]}>
                <Text style={styles.finalTotalLabel}>Total ({getCurrencySymbol(currency)})</Text>
                <Text style={styles.finalTotalValue}>{formatPrice(total, currency)}</Text>
              </View>
            ))}
          </View>
          
          <Button
            title="Passer la commande"
            onPress={handleCheckout}
            loading={isProcessing || loading}
            style={styles.checkoutButton}
          />
        </View>
      )}
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
  itemCount: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  cartContainer: {
    paddingVertical: 16,
  },
  cartItem: {
    flexDirection: 'row',
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
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  itemFarm: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalSection: {
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#777E5C',
  },
  totalValue: {
    fontSize: 16,
    color: '#283106',
    fontWeight: '500',
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 16,
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283106',
  },
  finalTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
  },
});
