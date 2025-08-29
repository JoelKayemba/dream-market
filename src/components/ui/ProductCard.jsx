import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from './Badge';

export default function ProductCard({ 
  product, 
  variant = 'default', 
  size = 'medium',
  fullWidth = false,
  onPress,
  navigation
}) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation && product) {
      navigation.navigate('ProductDetail', { product });
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
        <Image source={{ uri: product.image }} style={getImageStyles()} />
        
        {/* Badges */}
        <View style={styles.badges}>
          {product.discount && (
            <Badge text={`-${product.discount}%`} variant="discount" size="small" />
          )}
          {product.isNew && (
            <Badge text="Nouveau" variant="new" size="small" />
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.price}>{product.price}€</Text>
        </View>
        
        <Text style={styles.farm} numberOfLines={1}>
          🏡 {product.farm}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{product.rating || 'N/A'}</Text>
          </View>
          
          {product.tags && product.tags.length > 0 && (
            <Badge text={product.tags[0]} variant="default" size="small" />
          )}
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
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  farm: {
    fontSize: 14,
    color: '#777E5C',
    marginBottom: 8,
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
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#777E5C',
    fontWeight: '500',
  },
});
