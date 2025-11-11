import React, { useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, Dimensions, Alert, Platform } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenWrapper, ImagePreviewModal } from '../components/ui';
import { toggleCartItem, selectIsInCart, selectCartItemQuantity } from '../store/cartSlice';
import { useFavorites } from '../hooks/useFavorites';
import { formatPrice } from '../utils/currency';
import { farmService } from '../backend';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const insets = useSafeAreaInsets();

  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState(0);
  const scrollViewRef = useRef(null);
  const { toggleProductFavorite, isProductFavorite } = useFavorites();
  const isFavorite = isProductFavorite(product.id);
  const isInCart = useSelector(state => selectIsInCart(state, product.id));
  const cartQuantity = useSelector(state => selectCartItemQuantity(state, product.id));
  const [quantity, setQuantity] = useState(cartQuantity || 1);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const images = product.images || [product.image];
  const rawFarmName = product.farms?.name;
  const farmName = rawFarmName || 'Dream Market';
  const isDreamMarket =
    (rawFarmName || '').trim().toLowerCase() === 'dream market' ||
    (!product.farms && !product.farm_id);

  const unitPrice = Number(product.price) || 0;
  const totalPrice = useMemo(() => unitPrice * (quantity || 1), [unitPrice, quantity]);

  const handleFavoriteToggle = () => {
    const wasFavorite = isFavorite;
    toggleProductFavorite(product);
    if (wasFavorite) {
      Alert.alert('Retiré des favoris', `${product.name} a été retiré de vos favoris.`, [{ text: 'OK', style: 'default' }]);
    } else {
      Alert.alert('Ajouté aux favoris !', `${product.name} a été ajouté à vos favoris.`, [{ text: 'OK', style: 'default' }]);
    }
  };

  const handleAddToCart = () => {
    const wasInCart = isInCart;
    dispatch(toggleCartItem({ product, quantity }));
    if (wasInCart) {
      Alert.alert('Produit retiré du panier', `${product.name} a été retiré de votre panier.`, [{ text: 'OK', style: 'default' }]);
    } else {
      Alert.alert('Produit ajouté au panier !', `${product.name} a été ajouté à votre panier.`, [
        { text: 'Continuer', style: 'cancel' },
        { text: 'Voir le panier', onPress: () => navigation.navigate('Cart'), style: 'default' }
      ]);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) setQuantity(newQuantity);
  };

  const scrollToImage = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * width, animated: true });
    }
    setSelectedImage(index);
  };

  const scrollToPreviousImage = () => {
    if (selectedImage > 0) scrollToImage(selectedImage - 1);
  };

  const scrollToNextImage = () => {
    if (selectedImage < images.length - 1) scrollToImage(selectedImage + 1);
  };

  const highlightChips = [
    product.is_new ? { label: 'Nouveau', color: '#1E88E5', icon: 'sparkles-outline' } : null,
    product.is_organic ? { label: 'Bio', color: '#2F8F46', icon: 'leaf-outline' } : null,
    product.discount ? { label: `-${product.discount}%`, color: '#C62828', icon: 'pricetag-outline' } : null,
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
  ].filter((item) => item.value);

  const metricsData = [
    { icon: 'leaf-outline', label: 'Origine', value: product.origin || product.farms?.location || 'Locale' },
  ];

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
      console.error('[ProductDetail] Impossible de charger les détails de la ferme:', error);
      if (product.farms || product.farm_id) {
        navigation.navigate('FarmDetail', {
          farm: product.farms || { id: product.farm_id },
        });
      }
    }
  };

  // Hauteur de la barre sticky et padding de contenu pour ne rien masquer
  const STICKY_BAR_HEIGHT = 64;
  const stickyBottomPad = Math.max(insets.bottom, 10);
  const contentBottomPadding = STICKY_BAR_HEIGHT + stickyBottomPad + 16;

  return (
    <ScreenWrapper style={styles.container}>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: contentBottomPadding }]}
      >
        
        <View style={styles.imageSection}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setSelectedImage(index);
            }}
          >
            {images.map((image, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={() => {
                  setPreviewIndex(index);
                  setImagePreviewVisible(true);
                }}
              >
                <Image
                  source={{ uri: image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

      
          {images.length > 1 && (
            <>
              {selectedImage > 0 && (
                <TouchableOpacity style={[styles.navButton, styles.prevButton]} onPress={scrollToPreviousImage}>
                  <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              {selectedImage < images.length - 1 && (
                <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={scrollToNextImage}>
                  <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </>
          )}

        
          <View style={styles.imageOverlayTop}>
            <TouchableOpacity style={styles.backButtonOverlay} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.topRightButtons}>
              {images.length > 1 && (
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>{selectedImage + 1} / {images.length}</Text>
                </View>
              )}
              <TouchableOpacity
                style={[styles.favoriteButtonOverlay, isFavorite && styles.favoriteButtonActive]}
                onPress={handleFavoriteToggle}
              >
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

        
          {images.length > 1 && (
            <View style={styles.imageIndicators}>
              {images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.imageIndicator, selectedImage === index && styles.activeImageIndicator]}
                  onPress={() => scrollToImage(index)}
                />
              ))}
            </View>
          )}

         
        </View>

       
        <View style={styles.heroWrapper}>
          <ExpoLinearGradient
            colors={['#2F8F46', '#3FB15A', '#59C06C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroHeaderRow}>
              <Text style={styles.heroProductName}>{product.name}</Text>
              <View style={styles.heroChipsRow}>
                {highlightChips.map((chip, index) => (
                  <View key={index} style={[styles.heroChip, { backgroundColor: `${chip.color}1A`, borderColor: chip.color }]}>
                    <Ionicons name={chip.icon} size={14} color={chip.color} />
                    <Text style={[styles.heroChipText, { color: chip.color }]}>{chip.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.heroPriceRow}>
              {product.old_price && (
                <Text style={styles.heroOldPrice}>{formatPrice(product.old_price, product.currency)}</Text>
              )}
              <Text style={styles.heroPrice}>{formatPrice(product.price, product.currency)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.heroFarmButton, isDreamMarket && styles.heroFarmButtonDisabled]}
              onPress={openFarmDetail}
              activeOpacity={isDreamMarket ? 1 : 0.85}
              disabled={isDreamMarket}
            >
              <View style={styles.heroFarmLeft}>
                <Ionicons
                  name="leaf-outline"
                  size={16}
                  color={isDreamMarket ? 'rgba(232, 249, 236, 0.55)' : '#FFFFFF'}
                />
                <Text
                  style={[styles.heroFarmText, isDreamMarket && styles.heroFarmTextDisabled]}
                >
                  {farmName}
                </Text>
              </View>
              {!isDreamMarket && (
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </ExpoLinearGradient>
        </View>

       
        <View style={styles.metricsRow}>
          {metricsData.map((metric, index) => (
            <View key={`${metric.label}-${index}`} style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Ionicons name={metric.icon} size={18} color="#2F8F46" />
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>

        
        {infoRows.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Détails clés</Text>
            {infoRows.map((item, index) => (
              <View
                key={`${item.label}-${index}`}
                style={[styles.sectionRow, index === infoRows.length - 1 && styles.sectionRowLast]}
              >
                <View style={styles.sectionRowLeft}>
                  <Ionicons name={item.icon} size={16} color="#6B8E6F" />
                  <Text style={styles.sectionRowLabel}>{item.label}</Text>
                </View>
                <Text style={styles.sectionRowValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        )}

        
        {(product.rating || product.review_count) && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Avis clients</Text>
            <View style={styles.ratingRow}>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={18}
                    color={star <= (product.rating || 0) ? '#FFD700' : '#E0E6DD'}
                    style={styles.ratingStar}
                  />
                ))}
              </View>
              <Text style={styles.ratingScore}>{product.rating ? Number(product.rating).toFixed(1) : '—'}</Text>
              {product.review_count ? <Text style={styles.ratingCount}>{product.review_count} avis</Text> : null}
            </View>
          </View>
        )}

     
        {product.description ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Description</Text>
            <Text style={styles.sectionBodyText}>{product.description}</Text>
          </View>
        ) : null}

        
        {product.tags && product.tags.length > 0 ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Tags</Text>
            <View style={styles.tagsGrid}>
              {product.tags.map((tag, index) => (
                <View key={`${tag}-${index}`} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Quantité</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(quantity - 1)}>
              <Ionicons name="remove" size={18} color="#2F8F46" />
            </TouchableOpacity>

            <View style={styles.quantityValue}>
              <Text style={styles.quantityValueText}>{quantity}</Text>
            </View>

            <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(quantity + 1)}>
              <Ionicons name="add" size={18} color="#2F8F46" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      
      <View style={[styles.stickyBar, { paddingBottom: stickyBottomPad, height: STICKY_BAR_HEIGHT + stickyBottomPad }]}>
        <View style={styles.stickyLeft}>
          <Text style={styles.stickyLabel}>Total</Text>
          <Text style={styles.stickyValue}>{formatPrice(totalPrice, product.currency)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.stickyButton, isInCart && styles.stickyButtonActive]}
          onPress={handleAddToCart}
          activeOpacity={0.9}
        >
          <Ionicons name={isInCart ? 'cart-outline' : 'cart'} size={18} color="#FFFFFF" />
          <Text style={styles.stickyButtonText}>
            {isInCart ? 'Retirer du panier' : 'Ajouter au panier'}
          </Text>
        </TouchableOpacity>
      </View>
      <ImagePreviewModal
        visible={imagePreviewVisible}
        images={images}
        initialIndex={previewIndex}
        onClose={() => setImagePreviewVisible(false)}
        title={product.name}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7F4',
  },

  scrollContent: {
    paddingTop: 0,
  },

 
  imageSection: {
    position: 'relative',
    backgroundColor: '#0B1A10',
  },
  productImage: {
    width,
    height: width * 0.82,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  prevButton: { left: 16 },
  nextButton: { right: 16 },

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
  backButtonOverlay: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 24,
  },
  favoriteButtonOverlay: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 24,
  },
  favoriteButtonActive: { backgroundColor: 'rgba(255, 107, 107, 0.65)' },
  topRightButtons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  imageCounter: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  imageCounterText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  imageIndicators: {
    position: 'absolute',
    bottom: 18,
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 2,
  },
  imageIndicator: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  activeImageIndicator: { backgroundColor: '#9BE7AC', width: 22 },

  badgesContainer: {
    position: 'absolute',
    bottom: 18,
    right: 16,
    zIndex: 3,
    flexDirection: 'column',
    gap: 8,
    
    
  },
  discountBadge: { backgroundColor: '#C62828', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 14 },
  discountText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  newBadge: { backgroundColor: '#1E88E5', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 14 },
  newText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  organicBadge: { backgroundColor: '#2F8F46', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 14 },
  organicText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  
  content: { flex: 1 },
  heroWrapper: { paddingHorizontal: 16, marginTop: -40, zIndex: 1 },
  heroCard: { borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.22)' },
  heroHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  heroProductName: { flex: 1, fontSize: 24, lineHeight: 30, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.4 },
  heroChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end',width: '50%' },
  heroChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 32, borderWidth: 1 },
  heroChipText: { fontSize: 12, fontWeight: '600' },
  heroPriceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 20 },
  heroOldPrice: { color: 'rgba(255, 255, 255, 0.65)', textDecorationLine: 'line-through', fontSize: 16, fontWeight: '600' },
  heroPrice: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', letterSpacing: 0.6 },
  heroFarmButton: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(18, 55, 31, 0.35)',
  },
  heroFarmButtonDisabled: {
    backgroundColor: 'rgba(18, 55, 31, 0.15)',
  },
  heroFarmLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroFarmText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  heroFarmTextDisabled: { color: 'rgba(232, 249, 236, 0.55)' },

  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, marginTop: 20 },
  metricCard: {
    flex: 1,
    minWidth: (width - 16 * 2 - 12 * 2) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(47, 143, 70, 0.1)',
    shadowColor: '#214D31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  metricIcon: {
    width: 34, height: 34, borderRadius: 12,
    backgroundColor: 'rgba(47, 143, 70, 0.12)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  metricValue: { fontSize: 18, fontWeight: '700', color: '#1A3B1F' },
  metricLabel: { fontSize: 12, color: '#6B8E6F', marginTop: 4, fontWeight: '500' },

  sectionCard: {
    marginTop: 18,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(47, 143, 70, 0.08)',
    shadowColor: '#214D31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeading: { fontSize: 18, fontWeight: '700', color: '#1A3B1F', marginBottom: 12, letterSpacing: 0.3 },
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(209, 213, 219, 0.45)', gap: 16,
  },
  sectionRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  sectionRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  sectionRowLabel: { fontSize: 13, fontWeight: '600', color: '#3B4F40' },
  sectionRowValue: { fontSize: 13, fontWeight: '600', color: '#1F2937', textAlign: 'right', flexShrink: 1 },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 },
  ratingStars: { flexDirection: 'row', gap: 4, backgroundColor: 'rgba(47, 143, 70, 0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  ratingStar: { marginHorizontal: 1 },
  ratingScore: { fontSize: 22, fontWeight: '700', color: '#1A3B1F' },
  ratingCount: { fontSize: 12, color: '#6B8E6F', fontWeight: '600' },

  sectionBodyText: { fontSize: 14, color: '#405243', lineHeight: 22, letterSpacing: 0.2 },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagPill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: 'rgba(47, 143, 70, 0.08)', borderWidth: 1, borderColor: 'rgba(47, 143, 70, 0.18)',
  },
  tagPillText: { fontSize: 12, fontWeight: '600', color: '#2F8F46' },

  quantityControls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(47, 143, 70, 0.06)',
    borderRadius: 18, paddingHorizontal: 12, paddingVertical: 12, gap: 12,
  },
  quantityButton: {
    width: 44, height: 44, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47, 143, 70, 0.2)',
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
  },
  quantityValue: {
    minWidth: 70, borderRadius: 14, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: 'rgba(47, 143, 70, 0.14)',
    alignItems: 'center', justifyContent: 'center', paddingVertical: 10,
  },
  quantityValueText: { fontSize: 18, fontWeight: '700', color: '#1A3B1F' },

  
  stickyBar: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 12,
  },
  stickyLeft: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  stickyLabel: { color: 'rgba(0, 0, 0, 0.9)', fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  stickyValue: { color: '#000000', fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },

  stickyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#2F8F46',
  },
  stickyButtonActive: { backgroundColor: '#C62828' },
  stickyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
});
