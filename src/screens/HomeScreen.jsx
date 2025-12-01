import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  FlatList,
  Animated, 
  Dimensions,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Text
} from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Button,
  Badge,
  Divider,
  SearchBar,
  ProductCard,
  SectionHeader,
  ScreenWrapper 
} from '../components/ui';
import { selectCartItemsCount } from '../store/cartSlice';
import {
  selectClientCategories,
  selectPopularProducts,
  selectNewProducts,
  selectPromotionProducts,
  selectClientProducts,
  selectPersonalizedProducts,
  selectClientProductsLoading,
  selectClientProductsLoadingMore,
  selectClientProductsPagination,
  fetchCategories,
  fetchPopularProducts,
  fetchNewProducts,
  fetchPromotionProducts,
  fetchProducts,
  fetchUserInteractions
} from '../store/client';
import { useNotifications } from '../hooks/useNotifications';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { CategorySkeleton, ProductCardSkeleton } from '../components/Skeleton';

const { width, height } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (width - CARD_PADDING * 2 - CARD_GAP) / 2; // 2 cards par ligne

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const [scrollY] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);
  const cartItemsCount = useSelector(selectCartItemsCount);
  const scrollViewRef = useRef(null);

  // Notifications - seulement pour afficher le badge
  const { unreadCount } = useNotifications();
  const { requireAuth } = useRequireAuth();

  // Données du backend via Redux
  const categories = useSelector(selectClientCategories);
  const popularProducts = useSelector(selectPopularProducts);
  const newProducts = useSelector(selectNewProducts);
  const promotionProducts = useSelector(selectPromotionProducts);
  const allProducts = useSelector(selectClientProducts);
  const personalizedProducts = useSelector(selectPersonalizedProducts);
  const loading = useSelector(selectClientProductsLoading);
  const loadingMore = useSelector(selectClientProductsLoadingMore);
  const pagination = useSelector(selectClientProductsPagination);
  const userId = useSelector((state) => state.auth?.user?.id);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Charger les données au montage
  useEffect(() => {
    loadData();
    startAnimations();
  }, []);

  // Recharger les interactions quand l'utilisateur change
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserInteractions(userId));
    }
  }, [userId, dispatch]);

  // Charger plus de produits pour la section "Tous les produits"
  const loadMoreProducts = useCallback(() => {
    if (!loadingMore && pagination.hasMore) {
      dispatch(fetchProducts({ page: pagination.page + 1, refresh: false }));
    }
  }, [loadingMore, pagination.hasMore, pagination.page]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text style={styles.footerLoaderText}>Chargement...</Text>
      </View>
    );
  };

  const startAnimations = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchCategories()),
        dispatch(fetchPopularProducts()),
        dispatch(fetchNewProducts()),
        dispatch(fetchPromotionProducts()),
        dispatch(fetchProducts())
      ]);
      
      // Charger les interactions utilisateur pour la personnalisation
      if (userId) {
        dispatch(fetchUserInteractions(userId));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Recharger toutes les données avec refresh
      await Promise.all([
        dispatch(fetchCategories()),
        dispatch(fetchPopularProducts()),
        dispatch(fetchNewProducts()),
        dispatch(fetchPromotionProducts()),
        dispatch(fetchProducts({ page: 0, refresh: true }))
      ]);
      
      // Recharger les interactions utilisateur
      if (userId) {
        await dispatch(fetchUserInteractions(userId));
      }
    } catch (error) {
      console.error('Erreur lors du refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Gestionnaires d'événements
  const handleSearch = (query) => {
    navigation.navigate('Produits', { searchQuery: query });
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('Produits', { categoryName: category.name });
  };

  const handleViewAllCategories = () => {
    navigation.navigate('Produits');
  };

  // Animation du header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
 
      <ScreenWrapper style={styles.container} edges={['top', 'left', 'right']}>
        <Animated.ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* Header animé (désormais dans le ScrollView, donc il scrolle aussi) */}
          <Animated.View 
            style={[
              styles.header,
              { opacity: headerOpacity }
            ]}
          >
            <Container style={styles.headerContent} padding="none">
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/Dream_logo.png')}
                  style={styles.logo}
                />
                <View style={styles.logoText}>
                  <Text style={styles.appTitle}>Dream Market</Text>
                  <Text style={styles.appSubtitle}>Marché agricole</Text>
                </View>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  style={styles.notificationButton}
                  onPress={() => requireAuth(() => navigation.navigate('Notifications'))}
                >
                  <Ionicons name="notifications-outline" size={20} color="#283106" />
                  {unreadCount > 0 && (
                    <Badge text={unreadCount.toString()} style={styles.notificationBadge} />
                  )}
                </TouchableOpacity>
    
                <TouchableOpacity 
                  style={styles.cartButton}
                  onPress={() => requireAuth(() => navigation.navigate('Cart'))}
                >
                  <Ionicons name="cart-outline" size={20} color="#283106" />
                  {cartItemsCount > 0 && (
                    <Badge text={cartItemsCount.toString()} style={styles.cartBadge} />
                  )}
                </TouchableOpacity>
              </View>
            </Container>
          </Animated.View>
    
          {/* Barre de recherche (elle scrolle aussi) */}
          <Container style={styles.searchSection} >
            <SearchBar
              onPress={(query) => navigation.navigate('Search', { initialQuery: query })}
              placeholder="Rechercher produits, fermes..."
              style={styles.searchBar}
            />
          </Container>
    
          
    
          {/* Catégories */}
          <Container style={styles.section}>
            <View style={styles.sectionHeaderCustom}>
              <View style={styles.sectionTitleGroup}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="grid-outline" size={16} color="#2F8F46" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Catégories</Text>
                  <Text style={styles.sectionSubtitle}>Explorez par type de produit</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.sectionActionButton} onPress={handleViewAllCategories}>
                <Text style={styles.sectionActionText}>Tout</Text>
                <Ionicons name="chevron-forward" size={14} color="#2F8F46" />
              </TouchableOpacity>
            </View>
    
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {((categories && categories.length > 0) && !refreshing) ? categories.slice(0, 8).map((category) => (
                <Animated.View
                  key={category.id}
                  style={[
                    { opacity: fadeAnim },
                    { transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.categoryCard}
                    onPress={() => handleCategoryPress(category)}
                    activeOpacity={0.7}
                  >
                    {(() => {
                      const accentColor = category.color || '#4CAF50';
                      const iconColor = category.iconColor || accentColor;
                      const gradientColors = [`${accentColor}33`, `${accentColor}14`];
                      return (
                        <ExpoLinearGradient
                          colors={gradientColors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.categoryGradient}
                        >
                          <View style={styles.categoryIconContainer}>
                            <Ionicons name={getCategoryIcon(category.name)} size={18} color={iconColor} />
                          </View>
                          <Text style={styles.categoryLabel} numberOfLines={1}>
                            {category.name}
                          </Text>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>•</Text>
                          </View>
                        </ExpoLinearGradient>
                      );
                    })()}
                  </TouchableOpacity>
                </Animated.View>
              )) : (
                // Skeleton pour les catégories
                Array.from({ length: 8 }).map((_, index) => (
                  <CategorySkeleton key={`category-skeleton-${index}`} />
                ))
              )}
            </ScrollView>
          </Container>
    
          <Divider style={styles.divider} />
    
          {/* Nouveautés */}
          <Container style={styles.section}>
            <View style={styles.sectionHeaderCustom}>
              <View style={styles.sectionTitleGroup}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="flash-outline" size={16} color="#1E88E5" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Nouveautés</Text>
                  <Text style={styles.sectionSubtitle}>Derniers arrivages frais</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.sectionActionButton}
                onPress={() => navigation.navigate('AllProducts', { filter: 'new' })}
              >
                <Text style={styles.sectionActionText}>Tout voir</Text>
                <Ionicons name="chevron-forward" size={14} color="#2F8F46" />
              </TouchableOpacity>
            </View>
    
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsContainer}
            >
              {((newProducts && newProducts.length > 0) && !refreshing) ? newProducts.slice(0, 4).map((product) => (
                <View key={product.id} style={styles.productCardWrapper}>
                  <ProductCard
                    product={product}
                    navigation={navigation}
                    variant="primary"
                    size="medium"
                    style={styles.productCard}
                  />
                </View>
              )) : (
                // Skeleton pour les nouveaux produits
                Array.from({ length: 4 }).map((_, index) => (
                  <ProductCardSkeleton key={`new-product-skeleton-${index}`} width={160} />
                ))
              )}
            </ScrollView>
          </Container>
    
          <Divider style={styles.divider} />
    
          {/* Populaires */}
          <Container style={styles.section} >
            <View style={styles.sectionHeaderCustom}>
              <View style={styles.sectionTitleGroup}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#FFF5E6' }]}>
                  <Ionicons name="flame-outline" size={16} color="#EF6C00" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Produits populaires</Text>
                  <Text style={styles.sectionSubtitle}>Les préférés de nos clients</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.sectionActionButton}
                onPress={() => navigation.navigate('AllProducts', { filter: 'featured' })}
              >
                <Text style={styles.sectionActionText}>Tout voir</Text>
                <Ionicons name="chevron-forward" size={14} color="#2F8F46" />
              </TouchableOpacity>
            </View>
    
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsContainer}
            >
              {((popularProducts && popularProducts.length > 0) && !refreshing) ? popularProducts.slice(0, 4).map((product) => (
                <View key={product.id} style={styles.productCardWrapper}>
                  <ProductCard
                    product={product}
                    navigation={navigation}
                    variant="featured"
                    size="medium"
                    style={styles.productCard}
                  />
                </View>
              )) : (
                // Skeleton pour les produits populaires
                Array.from({ length: 4 }).map((_, index) => (
                  <ProductCardSkeleton key={`popular-product-skeleton-${index}`} width={160} />
                ))
              )}
            </ScrollView>
          </Container>
    
          <Divider style={styles.divider} />
    
          {/* Promotions */}
          <Container style={styles.section} >
            <View style={styles.sectionHeaderCustom}>
              <View style={styles.sectionTitleGroup}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#FFE8E8' }]}>
                  <Ionicons name="pricetags-outline" size={16} color="#C62828" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Promotions</Text>
                  <Text style={styles.sectionSubtitle}>Profitez des meilleures offres</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.sectionActionButton}
                onPress={() => navigation.navigate('AllProducts', { filter: 'promotions' })}
              >
                <Text style={styles.sectionActionText}>Tout voir</Text>
                <Ionicons name="chevron-forward" size={14} color="#2F8F46" />
              </TouchableOpacity>
            </View>
    
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsContainer}
            >
              {((promotionProducts && promotionProducts.length > 0) && !refreshing) ? promotionProducts.slice(0, 4).map((product) => (
                <View key={product.id} style={styles.productCardWrapper}>
                  <ProductCard
                    product={product}
                    navigation={navigation}
                    variant="promo"
                    size="medium"
                    style={styles.productCard}
                  />
                </View>
              )) : (
                // Skeleton pour les produits en promotion
                Array.from({ length: 4 }).map((_, index) => (
                  <ProductCardSkeleton key={`promo-product-skeleton-${index}`} width={160} />
                ))
              )}
            </ScrollView>
          </Container>
    
          <Divider style={styles.divider} />
    
          {/* Tous les produits */}
          <Container style={styles.section} >
            <View style={styles.sectionHeaderCustom}>
              <View style={styles.sectionTitleGroup}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="basket-outline" size={16} color="#2F8F46" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Tous les produits</Text>
                  <Text style={styles.sectionSubtitle}>Tout ce qui est disponible</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.sectionActionButton}
                onPress={() => navigation.navigate('AllProducts', { filter: 'all' })}
              >
                <Text style={styles.sectionActionText}>Voir tout</Text>
                <Ionicons name="chevron-forward" size={14} color="#2F8F46" />
              </TouchableOpacity>
            </View>
    
            {(loading || refreshing) && personalizedProducts.length === 0 && allProducts.length === 0 ? (
              // Skeleton pour tous les produits lors du chargement initial ou refresh (2 par ligne)
              <View style={styles.productsRow}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <ProductCardSkeleton key={`all-product-skeleton-${index}`} width={CARD_WIDTH} />
                ))}
              </View>
            ) : (
              <FlatList
                data={personalizedProducts.length > 0 ? personalizedProducts : allProducts}
                renderItem={({ item }) => (
                  <ProductCard
                    product={item}
                    navigation={navigation}
                    variant="default"
                    size="medium"
                    fullWidth={false}
                    style={styles.allProductCard}
                  />
                )}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.productsRow}
                scrollEnabled={false}
                onEndReached={loadMoreProducts}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={
                  <View style={styles.allProductsEmpty}>
                    <Ionicons name="leaf-outline" size={24} color="#2F8F46" />
                    <Text style={styles.allProductsEmptyText}>
                      Aucun produit disponible pour le moment.
                    </Text>
                  </View>
                }
              />
            )}
          </Container>
    
          <View style={styles.spacer} />
        </Animated.ScrollView>
      </ScreenWrapper>
    );
    
  
}

// Fonction utilitaire pour les icônes de catégories
const getCategoryIcon = (categoryName) => {
  const icons = {
    'légumes': 'leaf-outline',
    'fruits': 'nutrition-outline',
    'produits laitiers': 'ice-cream-outline',
    'viandes': 'restaurant-outline',
    'céréales': 'layers-outline',
    'boissons': 'wine-outline',
    'épices': 'flame-outline',
    'bio': 'earth-outline',
    'poissons': 'fish-outline',
    'graines': 'podium-outline',
    default: 'grid-outline'
  };
  return icons[categoryName?.toLowerCase()] || icons.default;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  // Header élégant
  header: {
    paddingTop: 8,
    paddingBottom: 8,
    // zIndex supprimé inutile maintenant que ça scrolle
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  logoText: {
    flex: 1,
  },
  appTitle: {
    color: '#1A3B1F',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  appSubtitle: {
    color: '#6B8E6F',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#F0F8F0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    minWidth: 18,
    height: 20,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#F0F8F0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#4CAF50',
    minWidth: 18,
    height: 20,
  },
  searchSection: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  searchBar: {
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  // Hero Section Simple
  heroSectionSimple: {
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  heroContentSimple: {
    paddingVertical: 8,
  },
  heroTitleSimple: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: -0.3,
  },
  section: {
    paddingVertical: 2,
  },
  divider: {
    marginVertical: 4,
    opacity: 0.5,
  },
  // Section Headers personnalisés
  sectionHeaderCustom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A3B1F',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B8E6F',
    fontWeight: '500',
  },
  sectionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(47, 143, 70, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2F8F46',
  },
  // Catégories modernes avec gradient
  categoriesContainer: {
    paddingHorizontal: 0,
    paddingVertical: 6,
    paddingLeft: 0,
    gap: 3,
  },
  categoryCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(47, 143, 70, 0.12)',
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(33, 112, 55, 0.18)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 120,
    gap: 8,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    flexShrink: 0,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'left',
    letterSpacing: 0.1,
    flex: 1,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  categoryBadgeText: {
    color: '#2F8F46',
    fontSize: 13,
    fontWeight: '800',
  },
  // Produits
  productsContainer: {
    paddingHorizontal: 0,
    paddingVertical: 6,
    paddingLeft: 0,
    gap: 14,
  },
  productCardWrapper: {
    marginRight: 4,
    position: 'relative',
  },
  productCard: {
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  // Badges produits améliorés
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 3,
  },
  promoBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  allProductsGrid: {
    gap: 12,
    paddingHorizontal: 16,
  },
  productsRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginBottom: 12,
  },
  allProductCard: {
    marginBottom: 0,
  },
  allProductsEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: 'rgba(47, 143, 70, 0.12)',
    borderRadius: 16,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  allProductsEmptyText: {
    color: '#2F8F46',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoaderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#777E5C',
  },
  spacer: {
    height: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B8E6F',
    fontWeight: '500',
  },
});