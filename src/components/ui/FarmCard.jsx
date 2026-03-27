import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  Text,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../hooks/useFavorites';

const PRIMARY = '#2F8F46';
const PRIMARY_SOFT = '#E8F5E9';

export default function FarmCard({
  farm,
  onPress,
  onViewProducts,
  navigation,
  style,
  variant = 'default', // conservé pour compatibilité
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const { toggleFarmFavorite, isFarmFavorite } = useFavorites();
  const isFavorite = isFarmFavorite(farm?.id);

  const imageUri = farm?.main_image || farm?.image;
  const location = farm?.location || farm?.city;
  const productCount = farmProductsCount(farm);
  const specialtyLabel = farm?.specialty ? formatSpecialtyLabel(farm.specialty) : null;

  const handlePress = () => {
    if (onPress) {
      onPress(farm);
    } else if (navigation) {
      navigation.navigate('FarmDetail', { farm });
    }
  };

  const handleFavorite = useCallback(
    (e) => {
      e?.stopPropagation?.();
      const was = isFavorite;
      toggleFarmFavorite(farm);
      if (!was) {
        Alert.alert('Favori', `${farm.name} a été ajouté à vos favoris.`);
      }
    },
    [farm, isFavorite, toggleFarmFavorite]
  );

  const handleContact = (e) => {
    e?.stopPropagation();
    const { openWhatsApp, openPhoneCall, openEmail } = require('../../utils/contactInfo');
    const { Linking } = require('react-native');
    const options = [];
    if (farm.contact?.phone) {
      options.push(
        { text: 'Appeler', onPress: () => openPhoneCall(farm.contact.phone) },
        {
          text: 'WhatsApp',
          onPress: () =>
            openWhatsApp(
              farm.contact.phone,
              `Bonjour, je souhaite des informations concernant ${farm.name}`
            ),
        }
      );
    }
    if (farm.contact?.email) {
      options.push({
        text: 'Email',
        onPress: () =>
          openEmail(farm.contact.email, `Demande d'informations - ${farm.name}`),
      });
    }
    if (farm.contact?.website) {
      options.push({
        text: 'Site web',
        onPress: () => {
          const url = farm.contact.website.startsWith('http')
            ? farm.contact.website
            : `https://${farm.contact.website}`;
          Linking.openURL(url).catch(() => {});
        },
      });
    }
    if (options.length === 0) {
      Alert.alert('Contact', 'Les coordonnées de cette ferme ne sont pas disponibles.');
      return;
    }
    options.push({ text: 'Annuler', style: 'cancel' });
    Alert.alert(`Contacter ${farm.name}`, 'Choisissez un moyen de contact.', options);
  };

  return (
    <TouchableOpacity
      style={[styles.wrap, style]}
      onPress={handlePress}
      activeOpacity={0.92}
      accessibilityRole="button"
    >
      <View style={styles.card}>
        <View style={styles.imageBlock}>
          {imageUri && !imgFailed ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={40} color={PRIMARY} style={{ opacity: 0.35 }} />
            </View>
          )}

          <TouchableOpacity
            style={styles.fabHeart}
            onPress={handleFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#E53935' : '#374151'}
            />
          </TouchableOpacity>

          {farm?.verified ? (
            <View style={styles.verifiedPill}>
              <Ionicons name="checkmark-circle" size={14} color={PRIMARY} />
              <Text style={styles.verifiedText}>Vérifiée</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {farm?.name || 'Ferme'}
          </Text>

          <View style={styles.metaRow}>
            {location ? (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={15} color="#6B7280" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {location}
                </Text>
              </View>
            ) : null}
            {productCount != null && productCount > 0 ? (
              <View style={styles.metaItem}>
                <Ionicons name="basket-outline" size={15} color="#6B7280" />
                <Text style={styles.metaText}>{productCount} produit{productCount > 1 ? 's' : ''}</Text>
              </View>
            ) : null}
          </View>

          {specialtyLabel ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{specialtyLabel}</Text>
            </View>
          ) : null}

          {farm?.description ? (
            <Text style={styles.desc} numberOfLines={2}>
              {farm.description}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnGhost} onPress={handleContact} activeOpacity={0.85}>
              <Ionicons name="chatbubble-outline" size={17} color={PRIMARY} />
              <Text style={styles.btnGhostText}>Contacter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSolid} onPress={handlePress} activeOpacity={0.9}>
              <Text style={styles.btnSolidText}>Découvrir</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const farmProductsCount = (farm) => {
  if (Array.isArray(farm?.products)) return farm.products.length;
  if (typeof farm?.productCount === 'number') return farm.productCount;
  return null;
};

const formatSpecialtyLabel = (specialty) => {
  if (!specialty) return '';
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
  wrap: {
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8EDE9',
    shadowColor: '#0F1E13',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageBlock: {
    height: 152,
    backgroundColor: PRIMARY_SOFT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_SOFT,
  },
  fabHeart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  verifiedPill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
  },
  body: {
    padding: 16,
    paddingTop: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    flexShrink: 1,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: PRIMARY_SOFT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
  },
  desc: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnGhost: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    backgroundColor: '#FFFFFF',
  },
  btnGhostText: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },
  btnSolid: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: PRIMARY,
  },
  btnSolidText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
