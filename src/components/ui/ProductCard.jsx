import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Badge from './Badge';
import { toggleCartItem, selectIsInCart } from '../../store/cartSlice';
import { useFavorites } from '../../hooks/useFavorites';
import { formatPrice } from '../../utils/currency';

export default function ProductCard({ 
  product, 
  variant = 'default', 
  size = 'medium',
  fullWidth = false,
  onPress,
  navigation
}) {
  const dispatch = useDispatch();
  const isInCart = useSelector(state => selectIsInCart(state, product.id));
  const { toggleProductFavorite, isProductFavorite } = useFavorites();
  const isFavorite = isProductFavorite(product.id);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation && product) {
      navigation.navigate('ProductDetail', { product });
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Empêcher la navigation vers ProductDetail
    const wasInCart = isInCart;
    dispatch(toggleCartItem({ product, quantity: 1 }));
    
    // Afficher une notification différente selon l'action
    if (wasInCart) {
      Alert.alert(
        'Produit retiré du panier',
        `${product.name} a été retiré de votre panier.`,
        [{ text: 'OK', style: 'default' }]
      );
    } else {
      Alert.alert(
        'Produit ajouté au panier !',
        `${product.name} a été ajouté à votre panier.`,
        [
          { text: 'Continuer', style: 'cancel' },
          { 
            text: 'Voir le panier', 
            onPress: () => navigation.navigate('Cart'),
            style: 'default'
          }
        ]
      );
    }
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation(); // Empêcher la navigation vers ProductDetail
    const wasFavorite = isFavorite;
    toggleProductFavorite(product);
    
    // Afficher une notification différente selon l'action
    if (wasFavorite) {
      Alert.alert(
        'Retiré des favoris',
        `${product.name} a été retiré de vos favoris.`,
        [{ text: 'OK', style: 'default' }]
      );
    } else {
      Alert.alert(
        'Ajouté aux favoris !',
        `${product.name} a été ajouté à vos favoris.`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const getCardStyles = () => {
    const baseStyles = [styles.card, styles[variant], styles[size]];
    
    if (fullWidth) {
      baseStyles.push(styles.fullWidth);
    }
    
    return baseStyles;
  };

  const getImageStyles = () => {
    const baseStyles = [styles.image, styles[`${size}Image`]];
    
    if (fullWidth) {
      baseStyles.push(styles.fullWidthImage);
    }
    
    return baseStyles;
  };

  return (
    <TouchableOpacity
      style={getCardStyles()}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.images?.[0] || product.image }} style={getImageStyles()} />
        
        {/* Badges */}
        <View style={styles.badges}>
          {product.discount && (
            <Badge text={`-${product.discount}%`} variant="discount" size="small" />
          )}
          {product.isNew && (
            <Badge text="Nouveau" variant="new" size="small" />
          )}
          {product.isOrganic && (
            <Badge text="Bio" variant="organic" size="small" />
          )}
        </View>

        {/* Bouton Favori */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={20} 
            color={isFavorite ? "#FF6B6B" : "#FFFFFF"} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.priceContainer}>
            {product.oldPrice && (
              <Text style={styles.oldPrice}>{formatPrice(product.oldPrice, product.currency)}</Text>
            )}
            <Text style={styles.price}>{formatPrice(product.price, product.currency)}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={() => {
            if (product.farmId && navigation) {
              // Trouver la ferme correspondante
              const farm = require('../../data/farms').farms.find(f => f.id === product.farmId);
              if (farm) {
                navigation.navigate('FarmDetail', { farm });
              }
            }
          }}
          style={styles.farmContainer}
        >
          <Text style={styles.farm} numberOfLines={1}>
            🏡 {product.farmId ? 
              (() => {
                const farm = require('../../data/farms').farms.find(f => f.id === product.farmId);
                return farm ? farm.name : product.farm;
              })() : 
              'Dream Market'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{product.rating || 'N/A'}</Text>
            </View>
            {product.reviewCount && (
              <Text style={styles.reviewCount}>({product.reviewCount})</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.addToCartButton, isInCart && styles.addToCartButtonActive]}
            onPress={handleAddToCart}
          >
            <Ionicons 
              name={isInCart ? "checkmark" : "add"} 
              size={16} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    marginRight: 8,
  },
  default: {
    width: '100%',
  },
  featured: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  compact: {
    width: '100%',
  },
  small: {
    minWidth: 140,
    maxWidth: 180,
  },
  medium: {
    minWidth: 180,
    maxWidth: 220,
  },
  large: {
    minWidth: 220,
    maxWidth: 300,
  },
  fullWidth: {
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    resizeMode: 'cover',
  },
  smallImage: {
    height: 100,
  },
  mediumImage: {
    height: 140,
  },
  largeImage: {
    height: 180,
  },
  fullWidthImage: {
    height: 160,
  },
  badges: {
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  oldPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  farmContainer: {
    marginBottom: 8,
  },
  farm: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
  },
  addToCartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  ratingText: {
    fontSize: 14,
    color: '#777E5C',
    fontWeight: '500',
  },
});
