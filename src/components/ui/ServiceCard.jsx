import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
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

export default function ServiceCard({ 
  service, 
  onPress, 
  onContact, 
  variant = 'default', // 'default', 'featured', 'compact'
  fullWidth = false, // Nouvelle prop pour permettre l'élargissement
  style 
}) {
  const { toggleServiceFavorite, isServiceFavorite } = useFavorites();
  const isFavorite = isServiceFavorite(service.id);
  const getCardStyle = () => {
    let baseStyle;
    switch (variant) {
      case 'featured':
        baseStyle = styles.featuredCard;
        break;
      case 'compact':
        baseStyle = styles.compactCard;
        break;
      default:
        baseStyle = styles.defaultCard;
    }

    // Si fullWidth est true, on force la largeur à 100%
    if (fullWidth) {
      return [baseStyle, styles.fullWidthCard];
    }

    return baseStyle;
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

  const handleToggleFavorite = (e) => {
    e.stopPropagation(); // Empêcher la navigation vers ServiceDetail
    const wasFavorite = isFavorite;
    toggleServiceFavorite(service);
    
    // Afficher une notification différente selon l'action
    if (wasFavorite) {
      Alert.alert(
        'Retiré des favoris',
        `${service.name} a été retiré de vos favoris.`,
        [{ text: 'OK', style: 'default' }]
      );
    } else {
      Alert.alert(
        'Ajouté aux favoris !',
        `${service.name} a été ajouté à vos favoris.`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(service)}
      activeOpacity={0.9}
      style={[styles.serviceCardContainer, style]}
    >
      <View style={[styles.serviceCard, getCardStyle()]}>
        {/* Image du service */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: service.image }}
            style={[styles.image, getImageStyle()]}
            resizeMode="cover"
          />
          
          {/* Badges */}
          <View style={styles.badgesContainer}>
            {service.isPopular && (
              <Badge text="Populaire" variant="success" size="small" style={styles.badge} />
            )}
            {service.isNew && (
              <Badge text="Nouveau" variant="primary" size="small" style={styles.badge} />
            )}
            <Badge 
              text={service.isActive ? 'Disponible' : 'Indisponible'} 
              variant={service.isActive ? 'success' : 'error'}
              size="small" 
              style={styles.badge} 
            />
          </View>

          {/* Note et avis */}
          <View style={styles.ratingContainer}>
            <Rating value={service.rating} size="small" />
            <Text style={styles.reviewCount}>({service.reviewCount})</Text>
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

        {/* Informations du service */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {service.name}
            </Text>
            <Text style={styles.serviceShortDesc} numberOfLines={1}>
              {service.shortDescription}
            </Text>
          </View>

          {/* Description */}
          {variant !== 'compact' && (
            <Text style={styles.description} numberOfLines={2}>
              {service.description}
            </Text>
          )}

          {/* Prix */}
          {variant !== 'compact' && (
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{service.price}</Text>
              <Text style={styles.priceDetails}>{service.priceDetails}</Text>
            </View>
          )}

          {/* Fonctionnalités */}
          {variant !== 'compact' && (
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Fonctionnalités :</Text>
              <View style={styles.featuresList}>
                {service.features.slice(0, 2).map((feature, index) => (
                  <Text key={index} style={styles.feature}>
                    ✓ {feature}
                  </Text>
                ))}
                {service.features.length > 2 && (
                  <Text style={styles.feature}>
                    +{service.features.length - 2} autres
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
                onPress={() => onPress(service)}
                variant="outline"
                size="small"
                style={styles.detailsButton}
              />
              <Button
                title="Nous contacter"
                onPress={() => onContact(service)}
                variant="primary"
                size="small"
                style={styles.contactButton}
              />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  serviceCardContainer: {
    margin: 2,
  },
  serviceCard: {
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
    width: 320,
    minHeight: 280,
  },
  featuredCard: {
    width: 350,
    minHeight: 320,
  },
  compactCard: {
    width: 280,
    minHeight: 200,
  },
  fullWidthCard: {
    width: '100%',
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
  badgesContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    gap: 4,
  },
  badge: {
    marginBottom: 4,
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
  serviceName: {
    color: '#283106',
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 18,
    lineHeight: 22,
  },
  serviceShortDesc: {
    color: '#777E5C',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  description: {
    color: '#555',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  priceContainer: {
    marginBottom: 12,
  },
  price: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  priceDetails: {
    color: '#777E5C',
    fontSize: 12,
    fontStyle: 'italic',
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresTitle: {
    color: '#777E5C',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  featuresList: {
    gap: 2,
  },
  feature: {
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
  contactButton: {
    flex: 1,
  },
});
