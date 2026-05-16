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
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { formatPrice } from '../../utils/currency';

const PRIMARY = '#2F8F46';
const ACCENT = '#2563EB';
const PRIMARY_SOFT = '#E8F5E9';

const styles = StyleSheet.create({
  wrap: {
    width: 300,
    marginRight: 16,
    marginBottom: 16,
  },
  wrapFull: {
    width: '100%',
    marginRight: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8EDE9',
    shadowColor: '#102618',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageBlock: {
    height: 148,
    backgroundColor: '#EFF6FF',
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
    backgroundColor: '#EFF6FF',
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
  statusPill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusPillOff: {
    opacity: 0.95,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
  },
  statusTextOff: {
    color: '#6B7280',
  },
  body: {
    padding: 16,
    paddingTop: 14,
  },
  titleRow: {
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.2,
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

const minimalStyles = StyleSheet.create({
  wrap: {
    width: 300,
    marginRight: 16,
    marginBottom: 16,
  },
  wrapFull: {
    width: '100%',
    marginRight: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
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
    height: 128,
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
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E0DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  statusPillOff: {
    opacity: 0.92,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7D8F72',
  },
  statusDotOff: {
    backgroundColor: '#C5C2BA',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5C6B52',
    letterSpacing: 0.1,
  },
  statusTextOff: {
    color: '#86857D',
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

export default function ServiceCard({
  service,
  onPress,
  navigation,
  variant = 'default',
  fullWidth = false,
  style,
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const { toggleServiceFavorite, isServiceFavorite } = useFavorites();
  const { requireAuth } = useRequireAuth();
  const isFavorite = isServiceFavorite(service?.id);
  const isMinimal = variant === 'minimal';

  const imageUri = service?.image || service?.main_image;
  const description = service?.description || service?.shortDescription;
  const category = service?.category;
  const isActive = service?.isActive !== false;

  const handleOpen = () => {
    if (onPress) {
      onPress(service);
    } else if (navigation) {
      navigation.navigate('ServiceDetail', { service });
    }
  };

  const handleFavorite = useCallback(
    (e) => {
      e?.stopPropagation?.();
      requireAuth(() => {
        const was = isFavorite;
        toggleServiceFavorite(service);
        if (!was) {
          Alert.alert('Favori', `${service.name} a été ajouté à vos favoris.`);
        }
      });
    },
    [service, isFavorite, requireAuth, toggleServiceFavorite]
  );

  const formatServicePrice = () => {
    const p = service?.price;
    const cur = String(service?.currency || 'CDF').toUpperCase();
    if (p != null && p !== '' && !Number.isNaN(Number(p))) {
      return formatPrice(Number(p), cur);
    }
    return service?.priceDetails || null;
  };

  if (isMinimal) {
    const priceLabel = formatServicePrice();

    return (
      <TouchableOpacity
        style={[minimalStyles.wrap, fullWidth && minimalStyles.wrapFull, style]}
        onPress={handleOpen}
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
                <Ionicons name="construct-outline" size={32} color="#B8C4A8" />
              </View>
            )}
            <TouchableOpacity style={minimalStyles.fabHeart} onPress={handleFavorite} hitSlop={8}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? '#8B5A5A' : '#86857D'}
              />
            </TouchableOpacity>
            <View style={[minimalStyles.statusPill, !isActive && minimalStyles.statusPillOff]}>
              <View style={[minimalStyles.statusDot, !isActive && minimalStyles.statusDotOff]} />
              <Text style={[minimalStyles.statusText, !isActive && minimalStyles.statusTextOff]}>
                {isActive ? 'Disponible' : 'Indisponible'}
              </Text>
            </View>
          </View>

          <View style={minimalStyles.body}>
            <View style={minimalStyles.titleRow}>
              <Text style={minimalStyles.title} numberOfLines={2}>
                {service?.name || 'Service'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#C5C9B8" />
            </View>

            <View style={minimalStyles.metaRow}>
              {category ? (
                <View style={minimalStyles.metaItem}>
                  <Ionicons name="layers-outline" size={14} color="#86857D" />
                  <Text style={minimalStyles.metaText} numberOfLines={1}>
                    {category}
                  </Text>
                </View>
              ) : null}
              {priceLabel ? (
                <View style={minimalStyles.metaItem}>
                  <Ionicons name="pricetag-outline" size={14} color="#86857D" />
                  <Text style={minimalStyles.metaText} numberOfLines={1}>
                    {priceLabel}
                  </Text>
                </View>
              ) : null}
            </View>

            {description ? (
              <Text style={minimalStyles.desc} numberOfLines={2}>
                {description}
              </Text>
            ) : (
              <Text style={minimalStyles.descMuted} numberOfLines={1}>
                Appuyez pour la fiche détaillée
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const handleContact = (e) => {
    e?.stopPropagation();
    const { showContactMenu } = require('../../utils/contactInfo');
    showContactMenu(service.name);
  };

  return (
    <TouchableOpacity
      style={[styles.wrap, fullWidth && styles.wrapFull, style]}
      onPress={handleOpen}
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
              <Ionicons name="construct-outline" size={40} color={PRIMARY} style={{ opacity: 0.35 }} />
            </View>
          )}

          <TouchableOpacity style={styles.fabHeart} onPress={handleFavorite} hitSlop={8}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#E53935' : '#374151'}
            />
          </TouchableOpacity>

          <View style={[styles.statusPill, !isActive && styles.statusPillOff]}>
            <Ionicons
              name={isActive ? 'flash-outline' : 'time-outline'}
              size={13}
              color={isActive ? PRIMARY : '#9CA3AF'}
            />
            <Text style={[styles.statusText, !isActive && styles.statusTextOff]}>
              {isActive ? 'Disponible' : 'Indisponible'}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {service?.name || 'Service'}
            </Text>
          </View>

          <View style={styles.metaRow}>
            {category ? (
              <View style={styles.metaItem}>
                <Ionicons name="layers-outline" size={15} color={ACCENT} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {category}
                </Text>
              </View>
            ) : null}
            {service?.price || service?.priceDetails ? (
              <View style={styles.metaItem}>
                <Ionicons name="pricetag-outline" size={15} color="#6B7280" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {service?.price || service?.priceDetails}
                </Text>
              </View>
            ) : null}
          </View>

          {description ? (
            <Text style={styles.desc} numberOfLines={2}>
              {description}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnGhost} onPress={handleContact} activeOpacity={0.85}>
              <Ionicons name="chatbubble-outline" size={17} color={PRIMARY} />
              <Text style={styles.btnGhostText}>Contacter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSolid} onPress={handleOpen} activeOpacity={0.9}>
              <Text style={styles.btnSolidText}>Voir le service</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
