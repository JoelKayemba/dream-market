import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Badge, Button } from '../components/ui';
import { toggleCartItem, selectIsInCart, selectCartItemQuantity, selectCartItemsCount } from '../store/cartSlice';
import { useFavorites } from '../hooks/useFavorites';
import { formatPrice } from '../utils/currency';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState(0);
  const scrollViewRef = useRef(null);
  const { toggleProductFavorite, isProductFavorite } = useFavorites();
  const isFavorite = isProductFavorite(product.id);
  const isInCart = useSelector(state => selectIsInCart(state, product.id));
  const cartQuantity = useSelector(state => selectCartItemQuantity(state, product.id));
  const cartItemsCount = useSelector(selectCartItemsCount);
  const [quantity, setQuantity] = useState(cartQuantity || 1);

  const handleFavoriteToggle = () => {
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

  const handleAddToCart = () => {
    const wasInCart = isInCart;
    dispatch(toggleCartItem({ product, quantity }));
    
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

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleBuyNow = () => {
    console.log('Acheter maintenant:', product.name, 'Quantité:', quantity);
  };

  const scrollToImage = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * width,
        animated: true
      });
    }
    setSelectedImage(index);
  };

  const scrollToPreviousImage = () => {
    if (selectedImage > 0) {
      scrollToImage(selectedImage - 1);
    }
  };

  const scrollToNextImage = () => {
    if (selectedImage < images.length - 1) {
      scrollToImage(selectedImage + 1);
    }
  };

  const images = product.images || [product.image];

  return (
    <SafeAreaView style={styles.container}>
      {/* Images du produit avec boutons superposés */}
      <View style={styles.imageSection}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setSelectedImage(index);
          }}
        >
          {images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        
        {/* Boutons de navigation pour les images */}
        {images.length > 1 && (
          <>
            {selectedImage > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton]}
                onPress={scrollToPreviousImage}
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            
            {selectedImage < images.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={scrollToNextImage}
              >
                <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </>
        )}
        
        {/* Boutons superposés sur l'image */}
        <View style={styles.imageOverlay}>
          <TouchableOpacity
            style={styles.backButtonOverlay}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.topRightButtons}>
            {images.length > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {selectedImage + 1} / {images.length}
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.favoriteButtonOverlay, isFavorite && styles.favoriteButtonActive]}
              onPress={handleFavoriteToggle}
            >
              <Ionicons 
                name={isFavorite ? 'heart' : 'heart-outline'} 
                size={24} 
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Indicateurs d'images cliquables */}
        {images.length > 1 && (
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.imageIndicator,
                  selectedImage === index && styles.activeImageIndicator
                ]}
                onPress={() => scrollToImage(index)}
              />
            ))}
          </View>
        )}

        {/* Badges avec styles améliorés */}
        <View style={styles.badgesContainer}>
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
          {product.is_new && (
            <View style={styles.newBadge}>
              <Text style={styles.newText}>Nouveau</Text>
            </View>
          )}
          {product.is_organic && (
            <View style={styles.organicBadge}>
              <Text style={styles.organicText}>Bio</Text>
            </View>
          )}
        </View>
      </View>

      {/* Contenu du produit */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceContainer}>
            {product.old_price && (
              <Text style={styles.oldPrice}>{formatPrice(product.old_price, product.currency)}</Text>
            )}
            <Text style={styles.productPrice}>{formatPrice(product.price, product.currency)}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.productFarm}
            onPress={() => {
              if (product.farms && navigation) {
                navigation.navigate('FarmDetail', { farm: product.farms });
              }
            }}
          >
            <Text style={styles.farmIcon}>🏡</Text>
            <Text style={styles.farmText}>
              {product.farms?.name || 'Dream Market'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.infoTitle}>Informations</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Catégorie</Text>
            <Text style={styles.infoValue}>{product.categories?.name || 'Non spécifiée'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Note</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons 
                    key={star} 
                    name="star" 
                    size={16} 
                    color={star <= (product.rating || 0) ? "#FFD700" : "#E0E0E0"} 
                  />
                ))}
              </View>
              <Text style={styles.infoValue}>{product.rating || 'N/A'}</Text>
              {product.review_count > 0 && (
                <Text style={styles.reviewCount}>({product.review_count} avis)</Text>
              )}
            </View>
          </View>
          
          {product.tags && product.tags.length > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tags</Text>
              <View style={styles.tagsContainer}>
                {product.tags.map((tag, index) => (
                  <View key={index} style={styles.tagItem}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.infoTitle}>Description</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
        </View>

        {/* Section quantité */}
        <View style={styles.quantitySection}>
          <Text style={styles.quantityTitle}>Quantité</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(quantity - 1)}
            >
              <Ionicons name="remove" size={20} color="#777E5C" />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{quantity}</Text>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(quantity + 1)}
            >
              <Ionicons name="add" size={20} color="#777E5C" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.addToCartButton, isInCart && styles.addToCartButtonActive]}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartButtonText}>
              {isInCart ? 'Retirer du panier' : 'Ajouter au panier'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.buyNowButton}
            onPress={handleBuyNow}
          >
            <Text style={styles.buyNowButtonText}>Acheter maintenant</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  imageSection: {
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 1,
  },
  backButtonOverlay: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 50,
  },
  favoriteButtonOverlay: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 50,
  },
  favoriteButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageCounter: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  productImage: {
    width: width,
    height: width * 0.8,
    resizeMode: 'cover',
  },

  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  activeImageIndicator: {
    backgroundColor: '#4CAF50',
    width: 24,
  },
  
  // Boutons de navigation pour les images
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  prevButton: {
    left: 16,
  },
  nextButton: {
    right: 16,
  },
  badgesContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 1,
    flexDirection: 'column',
    gap: 8,
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  newText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  organicBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  organicText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {

    marginTop: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    flex: 1,
  },
  productHeader: {
    marginBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283106',
    marginBottom: 8,
    lineHeight: 30,
  },
  priceContainer: {
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  oldPrice: {
    fontSize: 20,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  productFarm: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  farmIcon: {
    fontSize: 18,
  },
  farmText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  productInfo: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#777E5C',
  },
  infoValue: {
    fontSize: 14,
    color: '#283106',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    maxWidth: '60%',
  },
  tagItem: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagText: {
    fontSize: 12,
    color: '#777E5C',
    fontWeight: '500',
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  productDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
  },
  actionButtons: {
    gap: 16,
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addToCartButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButton: {
    backgroundColor: '#283106',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyNowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
