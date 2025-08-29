import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Badge, Button } from '../components/ui';
import { toggleCartItem, selectIsInCart, selectCartItemQuantity } from '../store/cartSlice';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const isInCart = useSelector(state => selectIsInCart(state, product.id));
  const cartQuantity = useSelector(state => selectCartItemQuantity(state, product.id));
  const [quantity, setQuantity] = useState(cartQuantity || 1);

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };

  const handleAddToCart = () => {
    dispatch(toggleCartItem({ product, quantity }));
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleBuyNow = () => {
    console.log('Acheter maintenant:', product.name, 'Quantité:', quantity);
  };

  const images = [product.image, product.image, product.image];

  return (
    <SafeAreaView style={styles.container}>
      {/* Images du produit avec boutons superposés */}
      <View style={styles.imageSection}>
        <ScrollView
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
        
        {/* Boutons superposés sur l'image */}
        <View style={styles.imageOverlay}>
          <TouchableOpacity
            style={styles.backButtonOverlay}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
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
        
        {/* Indicateurs d'images */}
        <View style={styles.imageIndicators}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.imageIndicator,
                selectedImage === index && styles.activeImageIndicator
              ]}
            />
          ))}
        </View>

        {/* Badges avec styles améliorés */}
        <View style={styles.badgesContainer}>
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
          {product.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newText}>Nouveau</Text>
            </View>
          )}
        </View>
      </View>

      {/* Contenu du produit */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price}€</Text>
          
          <View style={styles.productFarm}>
            <Text style={styles.farmIcon}>🏡</Text>
            <Text style={styles.farmText}>{product.farm}</Text>
          </View>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.infoTitle}>Informations</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Catégorie</Text>
            <Text style={styles.infoValue}>{product.category}</Text>
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
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartButtonText}>Ajouter au panier</Text>
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
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  productFarm: {
    fontSize: 16,
    color: '#777E5C',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  farmIcon: {
    fontSize: 18,
  },
  farmText: {
    fontSize: 16,
    color: '#777E5C',
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
