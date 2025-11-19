import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleCartItem, selectIsInCart } from '../../store/cartSlice';
import { useFavorites } from '../../hooks/useFavorites';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { formatPrice } from '../../utils/currency';
import { farmService } from '../../backend';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2; // 2 cards par ligne

export default function ProductCard({
  product,
  variant = 'default',
  size = 'medium',
  fullWidth = false,
  onPress,
  navigation,
  style
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
      // Vérifier le stock disponible
      const stock = typeof product.stock === 'number' ? product.stock : null;
      const isOutOfStock = stock !== null && stock === 0;

      if (isOutOfStock) {
        Alert.alert(
          'Produit indisponible',
          'Ce produit est actuellement en rupture de stock.',
          [{ text: 'OK' }]
        );
        return;
      }

      const wasInCart = isInCart;
      dispatch(toggleCartItem({ product, quantity: 1 }));

      if (wasInCart) {
        // Pas d'alerte pour le retrait, juste un feedback visuel
      } else {
        // Feedback visuel seulement, pas d'alerte
      }
    });
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    requireAuth(() => {
      toggleProductFavorite(product);
    });
  };

  const imageSource = product.images?.[0] || product.image;
  const imageHeight = fullWidth ? 140 : 120;
  const rawFarmName = product.farms?.name;
  const farmName = rawFarmName || 'Dream Market';
  const isDreamMarket =
    (rawFarmName || '').trim().toLowerCase() === 'dream market' ||
    (!product.farms && !product.farm_id);

  const openFarmDetail = async (e) => {
    e?.stopPropagation();
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

  // Description courte (max 60 caractères)
  const shortDescription = product.short_description || product.description || '';
  const displayDescription = shortDescription.length > 60 
    ? shortDescription.substring(0, 60) + '...' 
    : shortDescription;

  // Stock info
  const stock = typeof product.stock === 'number' ? product.stock : null;
  const isOutOfStock = stock !== null && stock === 0;

  return (
    <TouchableOpacity
      style={[
        styles.cardShell,
        fullWidth && styles.cardShellFullWidth,
        style
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={[styles.card, isOutOfStock && styles.cardOutOfStock]}>
        {/* Image */}
        <View style={styles.media}>
          <Image
            source={{ uri: imageSource }}
            style={[styles.image, { height: imageHeight }]}
            resizeMode="cover"
          />

          {/* Overlay pour rupture de stock */}
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>Rupture</Text>
              </View>
            </View>
          )}

          {/* Bouton favori */}
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={handleToggleFavorite}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={16}
              color={isFavorite ? '#DC2626' : '#FFFFFF'}
            />
          </TouchableOpacity>

          {/* Chips badges */}
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

        {/* Contenu */}
        <View style={styles.body}>
          {/* Nom */}
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>

          {/* Description */}
          {displayDescription && (
            <Text style={styles.description} numberOfLines={2}>
              {displayDescription}
            </Text>
          )}

          {/* Prix et ferme */}
          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatPrice(product.price, product.currency)}</Text>
              {product.old_price && (
                <Text style={styles.oldPrice}>{formatPrice(product.old_price, product.currency)}</Text>
              )}
            </View>
            {!isDreamMarket && (
              <TouchableOpacity
                onPress={openFarmDetail}
                style={styles.farmBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="leaf-outline" size={12} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Footer : Stock et bouton ajouter */}
          <View style={styles.footer}>
            {stock !== null && (
              <View style={styles.stockInfo}>
                <Ionicons 
                  name={isOutOfStock ? 'close-circle' : 'cube-outline'} 
                  size={12} 
                  color={isOutOfStock ? '#DC2626' : '#6B7280'} 
                />
                <Text style={[styles.stockText, isOutOfStock && styles.stockTextOut]}>
                  {isOutOfStock ? 'Rupture' : `${stock} en stock`}
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.addBtn, isInCart && styles.addBtnActive]}
              onPress={handleAddToCart}
              activeOpacity={0.8}
              disabled={isOutOfStock}
            >
              <Ionicons
                name={isInCart ? 'checkmark' : 'add'}
                size={18}
                color={isInCart ? '#FFFFFF' : (isOutOfStock ? '#9CA3AF' : '#111827')}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Container
  cardShell: {
    width: CARD_WIDTH,
    marginBottom: CARD_GAP,
  },
  cardShellFullWidth: {
    width: CARD_WIDTH,
  },

  // Card
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardOutOfStock: {
    opacity: 0.7,
  },

  // Image
  media: {
    position: 'relative',
    backgroundColor: '#F9FAFB',
    width: '100%',
  },
  image: {
    width: '100%',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  chipsRow: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  chipText: {
    fontSize: 9,
    color: '#374151',
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Body
  body: {
    padding: 12,
    gap: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginTop: -4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.3,
  },
  oldPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  farmBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  stockTextOut: {
    color: '#DC2626',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addBtnActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
});
