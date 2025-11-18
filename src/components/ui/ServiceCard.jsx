import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  Text,
  Alert,
} from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../hooks/useFavorites';
import { useRequireAuth } from '../../hooks/useRequireAuth';

export default function ServiceCard({ 
  service, 
  onPress, 
  onContact, 
  variant = 'default',
  fullWidth = false,
  style 
}) {
  const { toggleServiceFavorite, isServiceFavorite } = useFavorites();
  const { requireAuth } = useRequireAuth();
  const isFavorite = isServiceFavorite(service.id);

  const highlightChips = [
    service.isActive ? { label: 'Disponible', icon: 'flash-outline', color: '#9BE7AC' } : { label: 'Indisponible', icon: 'time-outline', color: '#FF6B6B' },
    service.category ? { label: service.category, icon: 'layers-outline', color: '#82D7FF' } : null,
    service.price ? { label: service.price, icon: 'cash-outline', color: '#E8F9EC' } : null,
  ].filter(Boolean);

  const metrics = [
    { icon: 'stats-chart-outline', label: `${service.reviewCount || 0} avis` },
    service.deliveryTime ? { icon: 'time-outline', label: service.deliveryTime } : null,
    service.coverage ? { icon: 'navigate-outline', label: service.coverage } : null,
  ].filter(Boolean);

  const gradientByVariant = {
    default: ['#12291B', '#1F4730'],
    featured: ['#20314A', '#2F8F46'],
    compact: ['#1B1F2E', '#324463'],
  }[variant] || ['#12291B', '#1F4730'];

  const description = service.description || service.shortDescription;
  const limitedFeatures = Array.isArray(service.features) ? service.features.slice(0, 3) : [];

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    requireAuth(() => {
      const wasFavorite = isFavorite;
      toggleServiceFavorite(service);

      Alert.alert(
        wasFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris !',
        wasFavorite
          ? `${service.name} a été retiré de vos favoris.`
          : `${service.name} a été ajouté à vos favoris.`
      );
    });
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(service)}
      activeOpacity={0.9}
      style={[
        styles.cardShell,
        fullWidth && styles.cardShellFullWidth,
        style,
      ]}
    >
      <ExpoLinearGradient
        colors={gradientByVariant}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.mediaRow}>
          <Image
            source={{ uri: service.image }}
            style={styles.mediaImage}
            resizeMode="cover"
          />

          <View style={styles.headerOverlay}>
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
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {service.name}
            </Text>
            {service.priceDetails ? (
              <Text style={styles.priceDetails} numberOfLines={1}>
                {service.priceDetails}
              </Text>
            ) : null}
          </View>

          {description ? (
            <Text style={styles.description} numberOfLines={3}>
              {description}
            </Text>
          ) : null}

          {limitedFeatures.length > 0 ? (
            <View style={styles.featuresRow}>
              {limitedFeatures.map((feature, index) => (
                <View key={`${feature}-${index}`} style={styles.featurePill}>
                  <Ionicons name="checkmark-circle-outline" size={12} color="#9BE7AC" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
              {service.features && service.features.length > limitedFeatures.length ? (
                <Text style={styles.moreIndicator}>
                  +{service.features.length - limitedFeatures.length} autres
                </Text>
              ) : null}
            </View>
          ) : null}

          {metrics.length > 0 ? (
            <View style={styles.metricsRow}>
              {metrics.map((metric, index) => (
                <View key={`${metric.label}-${index}`} style={styles.metricItem}>
                  <Ionicons name={metric.icon} size={12} color="#E8F9EC" />
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => onPress(service)}
              activeOpacity={0.85}
            >
              <Ionicons name="eye-outline" size={16} color="#E8F9EC" />
              <Text style={styles.secondaryButtonText}>Voir détails</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={(e) => {
                e.stopPropagation();
                const { showContactMenu } = require('../../utils/contactInfo');
                showContactMenu(service.name);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="chatbubbles-outline" size={16} color="#0F2A17" />
              <Text style={styles.primaryButtonText}>Nous contacter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ExpoLinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    width: 300,
    marginRight: 16,
    marginBottom: 18,
  },
  cardShellFullWidth: {
    width: '100%',
    marginRight: 0,
  },
  card: {
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#102618',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
  mediaRow: {
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: 160,
  },
  headerOverlay: {
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  favoriteButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    padding: 8,
    borderRadius: 16,
  },
  body: {
    padding: 20,
    gap: 14,
  },
  titleRow: {
    gap: 6,
  },
  serviceName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  priceDetails: {
    color: 'rgba(232, 249, 236, 0.75)',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    color: 'rgba(232, 249, 236, 0.8)',
    fontSize: 13,
    lineHeight: 19,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(155, 231, 172, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(155, 231, 172, 0.28)',
  },
  featureText: {
    color: '#9BE7AC',
    fontSize: 11.5,
    fontWeight: '600',
  },
  moreIndicator: {
    color: 'rgba(232, 249, 236, 0.65)',
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(232, 249, 236, 0.12)',
  },
  metricLabel: {
    color: '#E8F9EC',
    fontSize: 11.5,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(232, 249, 236, 0.28)',
    borderRadius: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(232, 249, 236, 0.1)',
  },
  secondaryButtonText: {
    color: '#E8F9EC',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
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
