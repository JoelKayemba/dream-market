import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  Animated, 
  Image,
  Text,
  Alert
} from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../hooks/useFavorites';

export default function FarmCard({ 
  farm, 
  onPress, 
  onViewProducts,
  onContact,
  navigation,
  style,
  variant = 'default'
}) {
  const [scaleValue] = useState(new Animated.Value(1));
  const { toggleFarmFavorite, isFarmFavorite } = useFavorites();
  const isFavorite = isFarmFavorite(farm.id);

  const highlightChips = [
    farm.specialty ? { label: formatSpecialtyLabel(farm.specialty), icon: 'leaf-outline', color: '#9BE7AC' } : null,
    farm.location ? { label: farm.location, icon: 'navigate-outline', color: '#82D7FF' } : null,
    farmProductsCount(farm) ? { label: `${farmProductsCount(farm)} produits`, icon: 'basket-outline', color: '#E8F9EC' } : null,
  ].filter(Boolean);

  const metrics = [
    { icon: 'star-outline', label: farm.rating ? `${Number(farm.rating).toFixed(1)} / 5` : '—' },
    farm.established ? { icon: 'time-outline', label: `${new Date().getFullYear() - farm.established} ans d’activité` } : null,
    farm.contact?.phone ? { icon: 'call-outline', label: 'Contact rapide' } : null,
  ].filter(Boolean);

  const gradientByVariant = {
    default: ['#102818', '#1F3B28'],
    featured: ['#18293A', '#215F3A'],
    compact: ['#171B2B', '#2E3F5C'],
  }[variant] || ['#102818', '#1F3B28'];

  const description = farm.description;
  const certifications = Array.isArray(farm.certifications) ? farm.certifications.slice(0, 3) : [];

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    const wasFavorite = isFavorite;
    toggleFarmFavorite(farm);

    Alert.alert(
      wasFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris !',
      wasFavorite
        ? `${farm.name} a été retiré de vos favoris.`
        : `${farm.name} a été ajouté à vos favoris.`
    );
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

  const handleContact = (e) => {
    e?.stopPropagation();
    const { showContactMenu } = require('../../utils/contactInfo');
    showContactMenu(farm.name);
  };

  return (
    <TouchableOpacity
      onPressIn={() => animateScale(scaleValue, 0.97)}
      onPressOut={() => animateScale(scaleValue, 1)}
      onPress={handlePress}
      activeOpacity={0.92}
      style={[styles.cardShell, style]}
    >
      <Animated.View style={[styles.animatedContainer, { transform: [{ scale: scaleValue }] }]}>
        <ExpoLinearGradient
          colors={gradientByVariant}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.mediaRow}>
            <Image
              source={{ uri: farm.main_image }}
              style={styles.mediaImage}
            />
            <ExpoLinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.mediaOverlay}
            >
              <View style={styles.chipRow}>
                {highlightChips.map((chip, index) => (
                  <View key={`${chip.label}-${index}`} style={[styles.chip, { borderColor: chip.color }]}>
                    <Ionicons name={chip.icon} size={13} color={chip.color} />
                    <Text style={[styles.chipText, { color: chip.color }]}>{chip.label}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={handleToggleFavorite}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </ExpoLinearGradient>
          </View>

          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Text style={styles.farmName} numberOfLines={1}>{farm.name}</Text>
              {farm.location ? (
                <View style={styles.locationBadge}>
                  <Ionicons name="navigate-outline" size={12} color="#E8F9EC" />
                  <Text style={styles.locationText} numberOfLines={1}>{farm.location}</Text>
                </View>
              ) : null}
            </View>

            {description ? (
              <Text style={styles.description} numberOfLines={3}>
                {description}
              </Text>
            ) : null}

            

          

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleViewProducts();
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="basket-outline" size={15} color="#E8F9EC" />
                <Text style={styles.secondaryButtonText}>Produits</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleContact}
                activeOpacity={0.85}
              >
                <Ionicons name="chatbubbles-outline" size={16} color="#0F2A17" />
                <Text style={styles.primaryButtonText}>Contacter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ExpoLinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const animateScale = (animatedValue, toValue) => {
  Animated.spring(animatedValue, {
    toValue,
    useNativeDriver: true,
    friction: 6,
  }).start();
};

const farmProductsCount = (farm) => {
  if (Array.isArray(farm.products)) return farm.products.length;
  if (typeof farm.productCount === 'number') return farm.productCount;
  return null;
};

const formatSpecialtyLabel = (specialty) => {
  if (!specialty) return 'Spécialité';
  const map = {
    organic: 'Bio',
    fruits: 'Fruits',
    cereals: 'Céréales',
    dairy: 'Laitiers',
    wine: 'Vins',
    herbs: 'Herbes',
  };
  return map[specialty.toLowerCase()] || specialty;
};

const styles = StyleSheet.create({
  cardShell: {
    width: 320,
    marginRight: 16,
    marginBottom: 20,
  },
  animatedContainer: {
    borderRadius: 28,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#0F1E13',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 7,
  },
  mediaRow: {
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: 180,
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  favoriteButton: {
    alignSelf: 'flex-end',
    padding: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  body: {
    padding: 20,
    gap: 14,
  },
  titleRow: {
    gap: 8,
  },
  farmName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(232, 249, 236, 0.25)',
    backgroundColor: 'rgba(232, 249, 236, 0.1)',
    alignSelf: 'flex-start',
  },
  locationText: {
    color: '#E8F9EC',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    color: 'rgba(232, 249, 236, 0.82)',
    fontSize: 13.5,
    lineHeight: 20,
  },
  certificationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(155, 231, 172, 0.35)',
    backgroundColor: 'rgba(155, 231, 172, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  certText: {
    color: '#9BE7AC',
    fontSize: 11.5,
    fontWeight: '600',
  },
  moreCertText: {
    color: 'rgba(232, 249, 236, 0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(232, 249, 236, 0.12)',
  },
  metricLabel: {
    color: '#E8F9EC',
    fontSize: 11.5,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(232, 249, 236, 0.25)',
    borderRadius: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(232, 249, 236, 0.12)',
  },
  secondaryButtonText: {
    color: '#E8F9EC',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    paddingVertical: 12,
    backgroundColor: '#9BE7AC',
  },
  primaryButtonText: {
    color: '#0F2A17',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
