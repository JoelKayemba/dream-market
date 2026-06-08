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

const farmProductsCount = (farm) => {
  if (typeof farm?.productCount === 'number') return farm.productCount;
  if (Array.isArray(farm?.products)) {
    if (farm.products.length === 1 && typeof farm.products[0]?.count === 'number') {
      return farm.products[0].count;
    }
    if (farm.products.some((item) => item?.id != null)) return farm.products.length;
  }
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
    borderRadius: 24,
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
    borderRadius: 20,
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
    borderRadius: 20,
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
    borderRadius: 20,
    backgroundColor: PRIMARY,
  },
  btnSolidText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

const compactStyles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E0DA',
    shadowColor: '#0F1E13',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageBlock: {
    height: 94,
    backgroundColor: '#EDECE8',
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
    backgroundColor: '#EDECE8',
  },
  fabHeart: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 28,
    height: 28,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(226,224,218,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedPill: {
    position: 'absolute',
    left: 7,
    bottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2F8F46',
  },
  body: {
    padding: 10,
    gap: 7,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C2C28',
    lineHeight: 17,
    letterSpacing: -0.15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    flex: 1,
    fontSize: 11,
    color: '#777E5C',
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  tag: {
    flexShrink: 1,
    backgroundColor: '#F0F4EA',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4A5548',
  },
  tagMuted: {
    backgroundColor: '#F7F6F3',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagMutedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#86857D',
  },
  countText: {
    fontSize: 10,
    color: '#86857D',
    fontWeight: '700',
  },
});

const minimalStyles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E0DA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageBlock: {
    height: 132,
    backgroundColor: '#EDECE8',
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
    backgroundColor: '#EDECE8',
  },
  fabHeart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E0DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedPill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5C6B52',
    letterSpacing: 0.15,
  },
  body: {
    paddingHorizontal: 15,
    paddingTop: 13,
    paddingBottom: 15,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#2C2C28',
    letterSpacing: -0.25,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '100%',
  },
  metaText: {
    fontSize: 12,
    color: '#86857D',
    fontWeight: '500',
    flexShrink: 1,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F7F6F3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E0DA',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5548',
    letterSpacing: 0.05,
  },
  desc: {
    fontSize: 13,
    color: '#6B6B66',
    lineHeight: 19,
    fontWeight: '400',
  },
  descMuted: {
    fontSize: 12,
    color: '#A8A59E',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default function FarmCard({
  farm,
  onPress,
  onViewProducts,
  navigation,
  style,
  variant = 'default', // 'default' | 'minimal' | 'compact'
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const { toggleFarmFavorite, isFarmFavorite } = useFavorites();
  const isFavorite = isFarmFavorite(farm?.id);
  const isCompact = variant === 'compact';
  const isMinimal = variant === 'minimal';

  const imageUri = farm?.main_image || farm?.cover_image || farm?.image;
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

  if (isCompact) {
    return (
      <TouchableOpacity
        style={[compactStyles.wrap, style]}
        onPress={handlePress}
        activeOpacity={0.92}
        accessibilityRole="button"
      >
        <View style={compactStyles.card}>
          <View style={compactStyles.imageBlock}>
            {imageUri && !imgFailed ? (
              <Image
                source={{ uri: imageUri }}
                style={compactStyles.image}
                resizeMode="cover"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <View style={compactStyles.imagePlaceholder}>
                <Ionicons name="business-outline" size={28} color="#B8C4A8" />
              </View>
            )}

            <TouchableOpacity
              style={compactStyles.fabHeart}
              onPress={handleFavorite}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={15}
                color={isFavorite ? '#8B5A5A' : '#5F6F52'}
              />
            </TouchableOpacity>

            {farm?.verified ? (
              <View style={compactStyles.verifiedPill}>
                <Ionicons name="shield-checkmark-outline" size={11} color="#2F8F46" />
                <Text style={compactStyles.verifiedText}>Référencée</Text>
              </View>
            ) : null}
          </View>

          <View style={compactStyles.body}>
            <Text style={compactStyles.title} numberOfLines={2}>
              {farm?.name || 'Ferme'}
            </Text>

            {location ? (
              <View style={compactStyles.metaItem}>
                <Ionicons name="location-outline" size={12} color="#777E5C" />
                <Text style={compactStyles.metaText} numberOfLines={1}>
                  {location}
                </Text>
              </View>
            ) : null}

            <View style={compactStyles.footerRow}>
              {specialtyLabel ? (
                <View style={compactStyles.tag}>
                  <Text style={compactStyles.tagText} numberOfLines={1}>
                    {specialtyLabel}
                  </Text>
                </View>
              ) : (
                <View style={compactStyles.tagMuted}>
                  <Text style={compactStyles.tagMutedText}>Ferme</Text>
                </View>
              )}

              {productCount != null && productCount > 0 ? (
                <Text style={compactStyles.countText}>
                  {productCount} réf.
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (isMinimal) {
    return (
      <TouchableOpacity
        style={[minimalStyles.wrap, style]}
        onPress={handlePress}
        activeOpacity={0.92}
        accessibilityRole="button"
      >
        <View style={minimalStyles.card}>
          <View style={minimalStyles.imageBlock}>
            {imageUri && !imgFailed ? (
              <Image
                source={{ uri: imageUri }}
                style={minimalStyles.image}
                resizeMode="cover"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <View style={minimalStyles.imagePlaceholder}>
                <Ionicons name="image-outline" size={32} color="#B8C4A8" />
              </View>
            )}
            <TouchableOpacity
              style={minimalStyles.fabHeart}
              onPress={handleFavorite}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? '#8B5A5A' : '#86857D'}
              />
            </TouchableOpacity>
            {farm?.verified ? (
              <View style={minimalStyles.verifiedPill}>
                <Ionicons name="shield-checkmark-outline" size={13} color="#5C6B52" />
                <Text style={minimalStyles.verifiedText}>Référencée</Text>
              </View>
            ) : null}
          </View>

          <View style={minimalStyles.body}>
            <View style={minimalStyles.titleRow}>
              <Text style={minimalStyles.title} numberOfLines={2}>
                {farm?.name || 'Ferme'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#C5C9B8" />
            </View>

            <View style={minimalStyles.metaRow}>
              {location ? (
                <View style={minimalStyles.metaItem}>
                  <Ionicons name="location-outline" size={14} color="#86857D" />
                  <Text style={minimalStyles.metaText} numberOfLines={1}>
                    {location}
                  </Text>
                </View>
              ) : null}
              {productCount != null && productCount > 0 ? (
                <View style={minimalStyles.metaItem}>
                  <Ionicons name="layers-outline" size={14} color="#86857D" />
                  <Text style={minimalStyles.metaText}>
                    {productCount} référence{productCount > 1 ? 's' : ''}
                  </Text>
                </View>
              ) : null}
            </View>

            {specialtyLabel ? (
              <View style={minimalStyles.tag}>
                <Text style={minimalStyles.tagText}>{specialtyLabel}</Text>
              </View>
            ) : null}

            {farm?.description ? (
              <Text style={minimalStyles.desc} numberOfLines={2}>
                {farm.description}
              </Text>
            ) : (
              <Text style={minimalStyles.descMuted} numberOfLines={1}>
                Appuyez pour voir la fiche complète
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

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
