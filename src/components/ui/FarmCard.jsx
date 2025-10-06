import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  Animated, 
  Dimensions,
  Image,
  Text,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from './Badge';
import Rating from './Rating';
import Button from './Button';
import { useFavorites } from '../../hooks/useFavorites';

const { width } = Dimensions.get('window');

export default function FarmCard({ 
  farm, 
  onPress, 
  onViewProducts,
  onContact,
  navigation,
  style,
  variant = 'default' // 'default', 'featured', 'compact'
}) {
  const [scaleValue] = useState(new Animated.Value(1));
  const [isPressed, setIsPressed] = useState(false);
  const { toggleFarmFavorite, isFarmFavorite } = useFavorites();
  const isFavorite = isFarmFavorite(farm.id);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (navigation) {
      navigation.navigate('FarmDetail', { farm });
    } else {
      onPress && onPress(farm);
    }
  };

  const handleViewProducts = () => {
    if (navigation) {
      navigation.navigate('AllProducts', { farmId: farm.id });
    } else {
      onViewProducts && onViewProducts(farm);
    }
  };

  const handleContact = () => {
    if (navigation) {
      // Pour l'instant, on navigue vers les détails de la ferme
      navigation.navigate('FarmDetail', { farm });
    } else {
      onContact && onContact(farm);
    }
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation(); // Empêcher la navigation vers FarmDetail
    const wasFavorite = isFavorite;
    toggleFarmFavorite(farm);
    
    // Afficher une notification différente selon l'action
    if (wasFavorite) {
      Alert.alert(
        'Retiré des favoris',
        `${farm.name} a été retiré de vos favoris.`,
        [{ text: 'OK', style: 'default' }]
      );
    } else {
      Alert.alert(
        'Ajouté aux favoris !',
        `${farm.name} a été ajouté à vos favoris.`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const getCardStyle = () => {
    switch (variant) {
      case 'featured':
        return styles.featuredCard;
      case 'compact':
        return styles.compactCard;
      default:
        return styles.defaultCard;
    }
  };

  const getImageStyle = () => {
    switch (variant) {
      case 'featured':
        return styles.featuredImage;
      case 'compact':
        return styles.compactImage;
      default:
        return styles.defaultImage;
    }
  };

  const getSpecialtyIcon = (specialty) => {
    const icons = {
      organic: '🌱',
      fruits: '🍎',
      cereals: '🌾',
      dairy: '🥛',
      wine: '🍷',
      herbs: '🌿'
    };
    return icons[specialty] || '🏡';
  };

  const getSpecialtyColor = (specialty) => {
    const colors = {
      organic: '#4CAF50',
      fruits: '#FF9800',
      cereals: '#8BC34A',
      dairy: '#2196F3',
      wine: '#9C27B0',
      herbs: '#795548'
    };
    return colors[specialty] || '#777E5C';
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={0.9}
      style={[styles.container, style]}
    >
      <Animated.View 
        style={[
          styles.card,
          getCardStyle(),
          { transform: [{ scale: scaleValue }] }
        ]}
      >
        {/* Image de la ferme */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: farm.image }}
            style={[styles.image, getImageStyle()]}
            resizeMode="cover"
          />
          
          {/* Badge de spécialité */}
          <View style={[styles.specialtyBadge, { backgroundColor: getSpecialtyColor(farm.specialty) }]}>
            <Text style={styles.specialtyText}>
              {getSpecialtyIcon(farm.specialty)} {farm.specialty === 'organic' ? 'Bio' : 
                farm.specialty === 'fruits' ? 'Fruits' :
                farm.specialty === 'cereals' ? 'Céréales' :
                farm.specialty === 'dairy' ? 'Laitiers' :
                farm.specialty === 'wine' ? 'Vins' :
                farm.specialty === 'herbs' ? 'Herbes' : 'Ferme'}
            </Text>
          </View>

          {/* Note et avis */}
          <View style={styles.ratingContainer}>
            <Rating value={farm.rating} size="small" />
            <Text style={styles.reviewCount}>({farm.reviewCount})</Text>
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

        {/* Informations de la ferme */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.farmName} numberOfLines={1}>
              {farm.name}
            </Text>
            <Text style={styles.farmLocation} numberOfLines={1}>
              📍 {farm.location}
            </Text>
          </View>

          {/* Description */}
          {variant !== 'compact' && (
            <Text style={styles.description} numberOfLines={2}>
              {farm.description}
            </Text>
          )}

          {/* Certifications */}
          {variant !== 'compact' && farm.certifications && (
            <View style={styles.certificationsContainer}>
              {farm.certifications.slice(0, 3).map((cert, index) => (
                <Badge 
                  key={index} 
                  text={cert} 
                  variant="success" 
                  size="small"
                  style={styles.certificationBadge}
                />
              ))}
              {farm.certifications.length > 3 && (
                <Text style={styles.moreCerts}>
                  +{farm.certifications.length - 3}
                </Text>
              )}
            </View>
          )}

          {/* Services disponibles */}
          {variant !== 'compact' && (
            <View style={styles.servicesContainer}>
              {farm.delivery && (
                <View style={styles.serviceItem}>
                  <Ionicons name="car" size={16} color="#4CAF50" />
                  <Text style={styles.serviceText}>Livraison</Text>
                </View>
              )}
              {farm.pickup && (
                <View style={styles.serviceItem}>
                  <Ionicons name="storefront" size={16} color="#2196F3" />
                  <Text style={styles.serviceText}>Retrait</Text>
                </View>
              )}
              {farm.farmShop && (
                <View style={styles.serviceItem}>
                  <Ionicons name="home" size={16} color="#FF9800" />
                  <Text style={styles.serviceText}>Boutique</Text>
                </View>
              )}
            </View>
          )}

          {/* Produits principaux */}
          {variant !== 'compact' && farm.products && (
            <View style={styles.productsContainer}>
              <Text style={styles.productsTitle}>
                Produits principaux :
              </Text>
              <View style={styles.productsList}>
                {farm.products.slice(0, 3).map((product, index) => (
                  <Text key={index} style={styles.productItem}>
                    • {product}
                  </Text>
                ))}
                {farm.products.length > 3 && (
                  <Text style={styles.productItem}>
                    +{farm.products.length - 3} autres
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Actions */}
          {variant !== 'compact' && (
            <View style={styles.actions}>
              <Button
                title="Voir détails"
                onPress={handlePress}
                variant="outline"
                size="small"
                style={styles.detailsButton}
              />
              <Button
                title="Voir produits"
                onPress={handleViewProducts}
                variant="primary"
                size="small"
                style={styles.productsButton}
              />
            </View>
          )}
        </View>

        {/* Indicateur de sélection */}
        {isPressed && (
          <Animated.View style={styles.selectionIndicator} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  defaultCard: {
    width: width * 0.85,
    minHeight: 280,
  },
  featuredCard: {
    width: width * 0.9,
    minHeight: 320,
  },
  compactCard: {
    width: width * 0.75,
    minHeight: 200,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
  },
  featuredImage: {
    height: 160,
  },
  compactImage: {
    height: 100,
  },
  specialtyBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  specialtyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 8,
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
  reviewCount: {
    color: '#777E5C',
    fontSize: 11,
    fontWeight: '500',
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 8,
  },
  farmName: {
    color: '#283106',
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 18,
    lineHeight: 22,
  },
  farmLocation: {
    color: '#777E5C',
    fontSize: 14,
    lineHeight: 18,
  },
  description: {
    color: '#555',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  certificationsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  certificationBadge: {
    marginRight: 4,
  },
  moreCerts: {
    color: '#777E5C',
    fontSize: 12,
    fontWeight: '500',
  },
  servicesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceText: {
    color: '#777E5C',
    fontSize: 12,
  },
  productsContainer: {
    marginBottom: 16,
  },
  productsTitle: {
    color: '#777E5C',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  productsList: {
    gap: 2,
  },
  productItem: {
    color: '#555',
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    flex: 1,
  },
  productsButton: {
    flex: 1,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(40, 49, 6, 0.1)',
    borderRadius: 16,
  },
});
