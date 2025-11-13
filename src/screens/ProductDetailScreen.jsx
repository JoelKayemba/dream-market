import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
  
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleCartItem, selectIsInCart, selectCartItemQuantity } from '../store/cartSlice';
import { useFavorites } from '../hooks/useFavorites';
import { formatPrice } from '../utils/currency';
import { farmService } from '../backend';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SafeAreaWrapper from '../components/SafeAreaWrapper';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#F7F8F7',
  card: '#FFFFFF',
  text: '#111827',
  subtext: '#6B7280',
  border: 'rgba(17,24,39,0.08)',
  primary: '#2F8F46',           // vert
  primarySoft: 'rgba(47,143,70,0.10)',
  overlay: 'rgba(0,0,0,0.55)',
  star: '#E2B714',
};

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const insets = useSafeAreaInsets();

  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [loadingFarm, setLoadingFarm] = useState(false);
  const scrollViewRef = useRef(null);

  const { toggleProductFavorite, isProductFavorite } = useFavorites();
  const isFavorite = isProductFavorite(product.id);

  const isInCart = useSelector((s) => selectIsInCart(s, product.id));
  const cartQuantity = useSelector((s) => selectCartItemQuantity(s, product.id));
  const [quantity, setQuantity] = useState(cartQuantity || 1);

  const images = (product.images && product.images.length ? product.images : [product.image]).filter(Boolean);
  const farmName = product.farms?.name || 'Dream Market';
  const isDreamMarket =
    (product.farms?.name || '').trim().toLowerCase() === 'dream market' ||
    (!product.farms && !product.farm_id);

  const unitPrice = Number(product.price) || 0;
  const totalPrice = useMemo(() => unitPrice * (quantity || 1), [unitPrice, quantity]);

  const highlightChips = [
    product.is_new ? 'Nouveau' : null,
    product.is_organic ? 'Bio' : null,
    product.discount ? `-${product.discount}%` : null,
  ].filter(Boolean);

  const stockStatus =
    typeof product.stock === 'number'
      ? product.stock > 0
        ? `${product.stock} en stock`
        : 'Rupture de stock'
      : product.availability || 'Disponible';

  const quantityLabel = product.quantity_per_unit || product.weight || product.unit || null;

  const infoRows = [
    { icon: 'grid-outline', label: 'Catégorie', value: product.categories?.name },
    { icon: 'cube-outline', label: 'Conditionnement', value: quantityLabel },
    { icon: 'leaf-outline', label: 'Origine', value: product.origin || product.farms?.location },
    { icon: 'time-outline', label: 'Disponibilité', value: stockStatus },
  ].filter((r) => r.value);

  const metricsData = [
    { icon: 'leaf-outline', label: 'Origine', value: product.origin || product.farms?.location || 'Locale' },
  ];

  const handleFavoriteToggle = () => {
    const wasFavorite = isFavorite;
    toggleProductFavorite(product);
    Alert.alert(
      wasFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris',
      `${product.name} ${wasFavorite ? 'a été retiré de' : 'a été ajouté à'} vos favoris.`
    );
  };

  const handleAddToCart = () => {
    const wasInCart = isInCart;
    dispatch(toggleCartItem({ product, quantity }));
    if (wasInCart) {
      Alert.alert('Produit retiré du panier', `${product.name} a été retiré de votre panier.`);
    } else {
      Alert.alert('Produit ajouté', `${product.name} a été ajouté à votre panier.`, [
        { text: 'Continuer', style: 'cancel' },
        { text: 'Voir le panier', onPress: () => navigation.navigate('Cart') },
      ]);
    }
  };

  const handleQuantityChange = (q) => {
    if (q >= 1) setQuantity(q);
  };

  const scrollToImage = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * width, animated: true });
    }
    setSelectedImage(index);
  };
  const prevImage = () => selectedImage > 0 && scrollToImage(selectedImage - 1);
  const nextImage = () => selectedImage < images.length - 1 && scrollToImage(selectedImage + 1);

  const openFarmDetail = async () => {
    if (!navigation || isDreamMarket) return;
    setLoadingFarm(true);
    try {
      let farm = product.farms;
      const farmId = farm?.id || product.farm_id;

      if (farmId) {
        const hasExtended =
          farm &&
          (farm.description ||
            (Array.isArray(farm.certifications) && farm.certifications.length > 0) ||
            typeof farm.rating === 'number' ||
            typeof farm.review_count === 'number');

        if (!hasExtended) {
          const fetched = await farmService.getFarmById(farmId);
          if (fetched) farm = fetched;
        }
      }

      navigation.navigate('FarmDetail', { farm: farm || (farmId ? { id: farmId } : null) });
    } catch (e) {
      navigation.navigate('FarmDetail', { farm: product.farms || { id: product.farm_id } });
    } finally {
      setLoadingFarm(false);
    }
  };

  const STICKY_BAR_HEIGHT = 64;
  const stickyBottomPad = Math.max(insets.bottom, 10);
  const contentBottomPadding = STICKY_BAR_HEIGHT + stickyBottomPad + 16;

  return (
    <SafeAreaWrapper style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Loader ferme */}
      <Modal visible={loadingFarm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.modalText}>Chargement…</Text>
          </View>
        </View>
      </Modal>

      {/* Aperçu d’image (pas de composant externe) */}
      <Modal visible={previewVisible} transparent animationType="fade" onRequestClose={() => setPreviewVisible(false)}>
        <View style={styles.previewOverlay}>
          <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewVisible(false)}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: previewIndex * width, y: 0 }}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setPreviewIndex(idx);
            }}
          >
            {images.map((uri, idx) => (
              <View key={String(idx)} style={{ width, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={{ uri }} style={styles.previewImage} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: contentBottomPadding }]}
      >
        {/* Galerie */}
        <View style={styles.imageSection}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImage(index);
            }}
          >
            {images.map((uri, idx) => (
              <TouchableOpacity
                key={String(idx)}
                activeOpacity={0.9}
                onPress={() => {
                  setPreviewIndex(idx);
                  setPreviewVisible(true);
                }}
              >
                <Image source={{ uri }} style={styles.productImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {images.length > 1 && (
            <>
              {selectedImage > 0 && (
                <TouchableOpacity style={[styles.navButton, { left: 16 }]} onPress={prevImage}>
                  <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              {selectedImage < images.length - 1 && (
                <TouchableOpacity style={[styles.navButton, { right: 16 }]} onPress={nextImage}>
                  <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </>
          )}

          <View style={styles.imageOverlayTop}>
            <TouchableOpacity style={styles.roundBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {images.length > 1 ? (
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {selectedImage + 1} / {images.length}
                  </Text>
                </View>
              ) : (
                <View />
              )}
              <TouchableOpacity
                style={[styles.roundBtn, isFavorite && { backgroundColor: 'rgba(255, 107, 107, 0.65)', marginLeft: 10 }]}
                onPress={handleFavoriteToggle}
              >
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {images.length > 1 && (
            <View style={styles.imageIndicators}>
              {images.map((_, idx) => (
                <TouchableOpacity
                  key={String(idx)}
                  style={[styles.dot, selectedImage === idx && styles.dotActive]}
                  onPress={() => scrollToImage(idx)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Bandeau simple (sans gradient) */}
        <View style={{ paddingHorizontal: 16, marginTop: -28, zIndex: 1 }}>
          <View style={styles.heroCard}>
            <View style={styles.heroHeaderRow}>
              <Text style={styles.heroProductName}>{product.name}</Text>
              {highlightChips.length ? (
                <View style={styles.heroChipsRow}>
                  {highlightChips.map((label, i) => (
                    <View key={String(i)} style={styles.heroChip}>
                      <Text style={styles.heroChipText}>{label}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View />
              )}
            </View>

            <View style={styles.heroPriceRow}>
              {product.old_price ? (
                <Text style={styles.heroOldPrice}>{formatPrice(product.old_price, product.currency)}</Text>
              ) : null}
              <Text style={styles.heroPrice}>{formatPrice(product.price, product.currency)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.heroFarmButton, isDreamMarket && styles.heroFarmButtonDisabled]}
              onPress={openFarmDetail}
              activeOpacity={isDreamMarket ? 1 : 0.85}
              disabled={isDreamMarket}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="leaf-outline" size={16} color={isDreamMarket ? COLORS.subtext : COLORS.primary} />
                <Text style={[styles.heroFarmText, isDreamMarket && { color: COLORS.subtext }]}>
                  {farmName}
                </Text>
              </View>
              {isDreamMarket ? (
                <View />
              ) : (
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsRow}>
          {metricsData.map((m, i) => (
            <View key={String(i)} style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Ionicons name={m.icon} size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.metricValue}>{m.value}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Détails clés */}
        {infoRows.length ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Détails clés</Text>
            {infoRows.map((row, i) => (
              <View key={`${row.label}-${i}`} style={[styles.sectionRow, i === infoRows.length - 1 && styles.sectionRowLast]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Ionicons name={row.icon} size={16} color={COLORS.subtext} />
                  <Text style={styles.sectionRowLabel}>{row.label}</Text>
                </View>
                <Text style={styles.sectionRowValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View />
        )}

        {/* Avis */}
        {(product.rating || product.review_count) ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Avis clients</Text>
            <View style={styles.ratingRow}>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={String(s)}
                    name="star"
                    size={18}
                    color={s <= (product.rating || 0) ? COLORS.star : '#E5E7EB'}
                    style={{ marginHorizontal: 1 }}
                  />
                ))}
              </View>
              <Text style={styles.ratingScore}>{product.rating ? Number(product.rating).toFixed(1) : '—'}</Text>
              {product.review_count ? <Text style={styles.ratingCount}>{product.review_count} avis</Text> : <View />}
            </View>
          </View>
        ) : (
          <View />
        )}

        {/* Description */}
        {product.description ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Description</Text>
            <Text style={styles.sectionBodyText}>{product.description}</Text>
          </View>
        ) : (
          <View />
        )}

        {/* Tags */}
        {Array.isArray(product.tags) && product.tags.length > 0 ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Tags</Text>
            <View style={styles.tagsGrid}>
              {product.tags.map((t, i) => (
                <View key={`${String(t)}-${i}`} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>{String(t)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View />
        )}

        {/* Quantité */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Quantité</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(quantity - 1)}>
              <Ionicons name="remove" size={18} color={COLORS.primary} />
            </TouchableOpacity>

            <View style={styles.quantityValue}>
              <Text style={styles.quantityValueText}>{quantity}</Text>
            </View>

            <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(quantity + 1)}>
              <Ionicons name="add" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sticky checkout bar */}
      <View
        style={[
          styles.stickyBar,
          { paddingBottom: stickyBottomPad, height: 64 + stickyBottomPad, borderTopColor: COLORS.border },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={styles.stickyLabel}>Total</Text>
          <Text style={styles.stickyValue}>{formatPrice(totalPrice, product.currency)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: isInCart ? '#C62828' : COLORS.primary }]}
          onPress={handleAddToCart}
          activeOpacity={0.9}
        >
          <Ionicons name={isInCart ? 'cart-outline' : 'cart'} size={18} color="#FFFFFF" />
          <Text style={styles.ctaText}>{isInCart ? 'Retirer du panier' : 'Ajouter au panier'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingTop: 0 },

  imageSection: { position: 'relative', backgroundColor: '#0B1A10' },
  productImage: { width, height: width * 0.82 },

  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -24 }],
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  imageOverlayTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 16, android: 16 }),
    zIndex: 3,
  },
  roundBtn: { padding: 10, backgroundColor: COLORS.overlay, borderRadius: 24 },
  imageCounter: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, marginRight: 10 },
  imageCounterText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  imageIndicators: {
    position: 'absolute',
    bottom: 18, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 2,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#9BE7AC', width: 22 },

  // Hero (sans gradient)
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroProductName: { flex: 1, fontSize: 20, lineHeight: 26, fontWeight: '800', color: COLORS.text },
  heroChipsRow: { flexDirection: 'row', flexWrap: 'wrap', maxWidth: '50%', marginLeft: 12 },
  heroChip: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(47,143,70,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 6,
    marginBottom: 6,
  },
  heroChipText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  heroPriceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 12 },
  heroOldPrice: { color: COLORS.subtext, textDecorationLine: 'line-through', fontSize: 14, fontWeight: '600', marginRight: 10 },
  heroPrice: { color: COLORS.text, fontSize: 28, fontWeight: '800' },
  heroFarmButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FAFAFA',
  },
  heroFarmButtonDisabled: { opacity: 0.6 },
  heroFarmText: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginLeft: 8 },

  // Metrics
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginTop: 16 },
  metricCard: {
    flex: 1,
    minWidth: (width - 16 * 2 - 12 * 2) / 3,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
    marginBottom: 12,
  },
  metricIcon: {
    width: 28, height: 28, borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  metricValue: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  metricLabel: { fontSize: 12, color: COLORS.subtext, marginTop: 2, fontWeight: '500' },

  // Sections
  sectionCard: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeading: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17,24,39,0.06)',
  },
  sectionRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  sectionRowLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginLeft: 8, flex: 1 },
  sectionRowValue: { fontSize: 13, fontWeight: '600', color: COLORS.text, textAlign: 'right' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ratingStars: { flexDirection: 'row', backgroundColor: COLORS.primarySoft, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999 },
  ratingScore: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginLeft: 12 },
  ratingCount: { fontSize: 12, color: COLORS.subtext, fontWeight: '600', marginLeft: 8 },

  sectionBodyText: { fontSize: 14, color: COLORS.text, opacity: 0.9, lineHeight: 22 },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(47,143,70,0.18)',
    marginRight: 8,
    marginBottom: 8,
  },
  tagPillText: { fontSize: 12, fontWeight: '700', color: COLORS.text },

  // Quantité
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primarySoft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  quantityButton: {
    width: 42, height: 42, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(47,143,70,0.2)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  quantityValue: {
    minWidth: 66, borderRadius: 10, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: 'rgba(47,143,70,0.14)',
    alignItems: 'center', justifyContent: 'center', paddingVertical: 8,
  },
  quantityValueText: { fontSize: 18, fontWeight: '800', color: COLORS.text },

  // Sticky bar
  stickyBar: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 10,
  },
  stickyLabel: { color: COLORS.text, fontSize: 12, fontWeight: '700', marginRight: 8 },
  stickyValue: { color: COLORS.text, fontSize: 20, fontWeight: '800' },

  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginLeft: 8 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { backgroundColor: COLORS.card, padding: 18, borderRadius: 12, alignItems: 'center', minWidth: 200 },
  modalText: { marginTop: 10, color: COLORS.text, fontWeight: '600' },

  previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  previewImage: { width: width * 0.94, height: width * 1.2 },
  previewClose: { position: 'absolute', top: 18, right: 18, zIndex: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 24 },
});
