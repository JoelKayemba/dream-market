import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleCartItem, selectIsInCart } from '../../store/cartSlice';
import { useFavorites } from '../../hooks/useFavorites';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { formatPrice } from '../../utils/currency';
import { farmService } from '../../backend';

export default function ProductCard({
  product,
  variant = 'default',
  size = 'medium',
  fullWidth = false,
  onPress,
  navigation
}) {
  const dispatch = useDispatch();
  const isInCart = useSelector(state => selectIsInCart(state, product.id));
  const { toggleProductFavorite, isProductFavorite } = useFavorites();
  const { requireAuth } = useRequireAuth();
  const isFavorite = isProductFavorite(product.id);

  const handlePress = () => {
    if (onPress) onPress();
    else if (navigation && product) navigation.navigate('ProductDetail', { product });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    requireAuth(() => {
      const wasInCart = isInCart;
      dispatch(toggleCartItem({ product, quantity: 1 }));

      if (wasInCart) {
        Alert.alert('Produit retiré du panier', `${product.name} a été retiré de votre panier.`);
      } else {
        Alert.alert(
          'Produit ajouté au panier !',
          `${product.name} a été ajouté à votre panier.`,
          [
            { text: 'Continuer', style: 'cancel' },
            navigation
              ? { text: 'Voir le panier', onPress: () => navigation.navigate('Cart') }
              : { text: 'Fermer', style: 'default' },
          ]
        );
      }
    });
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    requireAuth(() => {
      const wasFavorite = isFavorite;
      toggleProductFavorite(product);
      Alert.alert(
        wasFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris !',
        wasFavorite
          ? `${product.name} a été retiré de vos favoris.`
          : `${product.name} a été ajouté à vos favoris.`
      );
    });
  };

  const imageSource = product.images?.[0] || product.image;
  const imageHeight = size === 'small' ? 120 : size === 'large' ? 200 : 150;
  const ratingValue = product.rating ? Number(product.rating).toFixed(1) : '—';
  const reviewCount = product.review_count || 0;
  const rawFarmName = product.farms?.name;
  const farmName = rawFarmName || 'Dream Market';
  const isDreamMarket =
    (rawFarmName || '').trim().toLowerCase() === 'dream market' ||
    (!product.farms && !product.farm_id);

  const openFarmDetail = async () => {
    if (!navigation || isDreamMarket) return;
    try {
      let farm = product.farms;
      const farmId = farm?.id || product.farm_id;

      if (farmId) {
        const hasExtendedData =
          farm &&
          (farm.description ||
            (Array.isArray(farm.certifications) && farm.certifications.length > 0) ||
            typeof farm.rating === 'number' ||
            typeof farm.review_count === 'number');

        if (!hasExtendedData) {
          const fetched = await farmService.getFarmById(farmId);
          if (fetched) {
            farm = fetched;
          }
        }
      }

      navigation.navigate('FarmDetail', {
        farm: farm || product.farms || (farmId ? { id: farmId } : null),
      });
    } catch (error) {
      console.error('[ProductCard] Impossible de charger les détails de la ferme:', error);
      if (product.farms || product.farm_id) {
        navigation.navigate('FarmDetail', {
          farm: product.farms || { id: product.farm_id },
        });
      }
    }
  };

  const highlightChips = [
    product.is_new && 'Nouveau',
    product.is_organic && 'Bio',
    product.discount && `-${product.discount}%`,
  ].filter(Boolean);

  return (
    <TouchableOpacity
      style={[
        styles.cardShell,
        fullWidth && styles.cardShellFullWidth,
      ]}
      onPress={handlePress}
      activeOpacity={0.92}
    >
      <View style={styles.card}>
        {/* Media */}
        <View style={styles.media}>
          <Image
            source={{ uri: imageSource }}
            style={[styles.image, { height: imageHeight }]}
            resizeMode="cover"
          />

          {/* Bouton favori discret */}
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={handleToggleFavorite}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? '#DC2626' : '#111827'}
            />
          </TouchableOpacity>

          {/* Chips neutres */}
          {highlightChips.length > 0 && (
            <View style={styles.chipsRow}>
              {highlightChips.map((label, idx) => (
                <View key={`${label}-${idx}`} style={styles.chip}>
                  <Text style={styles.chipText}>{label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Corps */}
        <View style={styles.body}>
          {/* Titre + Prix */}
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={2}>
              {product.name}
            </Text>
            <View style={styles.priceBox}>
              <Text style={styles.priceText}>{formatPrice(product.price, product.currency)}</Text>
            </View>
          </View>

          {product.old_price ? (
            <Text style={styles.oldPrice}>{formatPrice(product.old_price, product.currency)}</Text>
          ) : null}

          {/* Ferme */}
          <TouchableOpacity
            onPress={openFarmDetail}
            activeOpacity={isDreamMarket ? 1 : 0.85}
            style={[styles.farmRow, isDreamMarket && styles.farmRowDisabled]}
            disabled={isDreamMarket}
          >
            <Ionicons name="leaf-outline" size={14} color={isDreamMarket ? '#9CA3AF' : '#374151'} />
            <Text style={[styles.farmText, isDreamMarket && styles.farmTextDisabled]} numberOfLines={1}>
              {farmName}
            </Text>
            {!isDreamMarket && <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />}
          </TouchableOpacity>

          {/* Meta : note + qty */}
          <View style={styles.metaRow}>
            

            {product.stock ? (
              <View style={styles.qtyPill}>
                <Ionicons name="cube-outline" size={12} color="#374151" />
                <Text style={styles.qtyText}>{product.stock}</Text>
              </View>
            ) : null}
             {/* Action */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.cartBtn, isInCart ? styles.cartBtnFilled : styles.cartBtnOutline]}
                  onPress={handleAddToCart}
                  activeOpacity={0.9}
                >
                  <Ionicons
                    name={isInCart ? 'checkmark-circle-outline' : 'cart-outline'}
                    size={16}
                    color={isInCart ? '#FFFFFF' : '#111827'}
                  />
                  <Text style={[styles.cartBtnText, isInCart && styles.cartBtnTextFilled]}>
                    {isInCart ? 'Dans le panier' : 'Ajouter'}
                  </Text>
                </TouchableOpacity>
              </View>
          </View>

         
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // shell
  cardShell: {
    width: 220,
    marginRight: 12,
    marginBottom: 16,
  },
  cardShellFullWidth: {
    width: '100%',
    marginRight: 0,
  },

  // card container
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)', // gris très léger
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  // media
  media: {
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.08)',
  },
  chipsRow: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.1)',
  },
  chipText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },

  // body
  body: {
    padding: 12,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  name: {
    flex: 1,
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: '700',
    color: '#111827',
  },
  priceBox: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
  },
  priceText: {
    color: '#111827',
    fontSize: 13.5,
    fontWeight: '700',
  },
  oldPrice: {
    fontSize: 12,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },

  farmRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
  },
  farmText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  farmRowDisabled: {
    opacity: 0.6,
  },
  farmTextDisabled: {
    color: '#9CA3AF',
  },

  metaRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingValue: {
    color: '#111827',
    fontSize: 12.5,
    fontWeight: '700',
  },
  ratingCount: {
    color: '#6B7280',
    fontSize: 12,
  },
  qtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
  },
  qtyText: {
    fontSize: 11.5,
    color: '#374151',
    fontWeight: '600',
  },

  // actions
  actionRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  cartBtnOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.12)',
  },
  cartBtnFilled: {
    backgroundColor: '#111827',
  },
  cartBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111827',
  },
  cartBtnTextFilled: {
    color: '#FFFFFF',
  },
});
