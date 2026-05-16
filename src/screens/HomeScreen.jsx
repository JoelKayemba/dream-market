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
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Badge,
  Divider,
  SearchBar,
  ProductCard,
  FarmCard,
  ServiceCard,
  ScreenWrapper,
} from '../components/ui';
import { CONTACT_INFO, openWhatsApp } from '../utils/contactInfo';
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
  fetchUserInteractions,
  fetchFarms,
  fetchPopularFarms,
  selectClientFarms,
  selectPopularFarms,
  selectClientFarmsLoading,
  fetchServices,
  selectClientServices,
} from '../store/client';
import { useNotifications } from '../hooks/useNotifications';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { CategorySkeleton, ProductCardSkeleton } from '../components/Skeleton';

const { width } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (width - CARD_PADDING * 2 - CARD_GAP) / 2; // 2 cards par ligne

const HOME_FARM_CARD_WIDTH = 268;

function normalizeServiceForCard(s) {
  if (!s) return s;
  const cat = s.category;
  const categoryLabel = typeof cat === 'string' ? cat : cat?.name ?? s.category_name ?? '';
  return {
    ...s,
    shortDescription: s.shortDescription ?? s.short_description,
    description: s.description ?? s.short_description,
    isActive: s.isActive !== undefined ? s.isActive : s.is_active !== false,
    image: s.image ?? s.main_image,
    category: categoryLabel || undefined,
    currency: s.currency ?? s.currency_code,
  };
}

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
  const clientFarms = useSelector(selectClientFarms);
  const popularFarmsHome = useSelector(selectPopularFarms);
  const farmsLoading = useSelector(selectClientFarmsLoading);
  const clientServices = useSelector(selectClientServices);
  const loading = useSelector(selectClientProductsLoading);
  const loadingMore = useSelector(selectClientProductsLoadingMore);
  const pagination = useSelector(selectClientProductsPagination);
  const userId = useSelector((state) => state.auth?.user?.id);

  const homeFarmsRow =
    popularFarmsHome?.length > 0 ? popularFarmsHome.slice(0, 8) : clientFarms.slice(0, 8);
  const homeServicesPreview = clientServices.slice(0, 2).map(normalizeServiceForCard);

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
        <ActivityIndicator size="small" color="#6B735A" />
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
        dispatch(fetchProducts()),
        dispatch(fetchFarms({ page: 0, refresh: true })),
        dispatch(fetchPopularFarms()),
        dispatch(fetchServices({ page: 0, refresh: true })),
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
        dispatch(fetchProducts({ page: 0, refresh: true })),
        dispatch(fetchFarms({ page: 0, refresh: true })),
        dispatch(fetchPopularFarms()),
        dispatch(fetchServices({ page: 0, refresh: true })),
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
    navigation.navigate('AllProducts', { filter: 'all', searchQuery: query });
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('CategoriesBrowse', { categoryName: category.name });
  };

  const handleViewAllCategories = () => {
    navigation.navigate('CategoriesBrowse');
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
              colors={['#6B735A']}
              tintColor="#6B735A"
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
                  <Ionicons name="notifications-outline" size={20} color="#3D3D38" />
                  {unreadCount > 0 && (
                    <Badge text={unreadCount.toString()} style={styles.notificationBadge} />
                  )}
                </TouchableOpacity>
    
                <TouchableOpacity 
                  style={styles.cartButton}
                  onPress={() => requireAuth(() => navigation.navigate('Cart'))}
                >
                  <Ionicons name="cart-outline" size={20} color="#3D3D38" />
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
                <View style={styles.sectionAccentLine} />
                <View style={styles.sectionTitleBlock}>
                  <Text style={styles.sectionTitle}>Catégories</Text>
                  <Text style={styles.sectionSubtitle}>Par famille de produits</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.sectionActionButton} onPress={handleViewAllCategories}>
                <Text style={styles.sectionActionText}>Tout</Text>
                <Ionicons name="chevron-forward" size={15} color="#6B735A" />
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
                    <View style={styles.categoryRow}>
                      <View style={styles.categoryIconContainer}>
                        <Ionicons name={getCategoryIcon(category.name)} size={18} color="#5C6B52" />
                      </View>
                      <Text style={styles.categoryLabel} numberOfLines={1}>
                        {category.name}
                      </Text>
                    </View>
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

          {/* Sélection personnalisée */}
          {personalizedProducts.length > 0 ? (
            <>
              <Container style={styles.section}>
                <View style={styles.sectionHeaderCustom}>
                  <View style={styles.sectionTitleGroup}>
                    <View style={styles.sectionAccentLine} />
                    <View style={styles.sectionTitleBlock}>
                      <Text style={styles.sectionTitle}>Sélection pour vous</Text>
                      <Text style={styles.sectionSubtitle}>Inspirée de vos consultations</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.sectionActionButton}
                    onPress={() => navigation.navigate('AllProducts', { filter: 'all' })}
                  >
                    <Text style={styles.sectionActionText}>Voir tout</Text>
                    <Ionicons name="chevron-forward" size={15} color="#6B735A" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.productsContainer}
                >
                  {!refreshing
                    ? personalizedProducts.slice(0, 10).map((product) => (
                        <View key={product.id} style={styles.productCardWrapper}>
                          <ProductCard
                            product={product}
                            navigation={navigation}
                            variant="primary"
                            size="medium"
                            style={styles.productCard}
                          />
                        </View>
                      ))
                    : Array.from({ length: 4 }).map((_, index) => (
                        <ProductCardSkeleton key={`perso-skel-${index}`} width={160} />
                      ))}
                </ScrollView>
              </Container>

              <Divider style={styles.divider} />
            </>
          ) : null}
    
          {/* Nouveautés */}
          <Container style={styles.section}>
            <View style={styles.sectionHeaderCustom}>
              <View style={styles.sectionTitleGroup}>
                <View style={styles.sectionAccentLine} />
                <View style={styles.sectionTitleBlock}>
                  <Text style={styles.sectionTitle}>Nouveautés</Text>
                  <Text style={styles.sectionSubtitle}>Derniers arrivages</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.sectionActionButton}
                onPress={() => navigation.navigate('AllProducts', { filter: 'new' })}
              >
                <Text style={styles.sectionActionText}>Tout voir</Text>
                <Ionicons name="chevron-forward" size={15} color="#6B735A" />
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
                <View style={styles.sectionAccentLine} />
                <View style={styles.sectionTitleBlock}>
                  <Text style={styles.sectionTitle}>Produits populaires</Text>
                  <Text style={styles.sectionSubtitle}>Souvent commandés</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.sectionActionButton}
                onPress={() => navigation.navigate('AllProducts', { filter: 'featured' })}
              >
                <Text style={styles.sectionActionText}>Tout voir</Text>
                <Ionicons name="chevron-forward" size={15} color="#6B735A" />
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

          {/* Nos producteurs */}
          <Container style={styles.section}>
            <View style={styles.sectionHeaderCustom}>
              <View style={styles.sectionTitleGroup}>
                <View style={styles.sectionAccentLine} />
                <View style={styles.sectionTitleBlock}>
                  <Text style={styles.sectionTitle}>Nos producteurs</Text>
                  <Text style={styles.sectionSubtitle}>Fermes et exploitations partenaires</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.sectionActionButton}
                onPress={() => navigation.navigate('Fermes')}
              >
                <Text style={styles.sectionActionText}>Tout voir</Text>
                <Ionicons name="chevron-forward" size={15} color="#6B735A" />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.farmsCarousel}
            >
              {farmsLoading && homeFarmsRow.length === 0
                ? Array.from({ length: 3 }).map((_, index) => (
                    <View key={`farm-skel-${index}`} style={[styles.farmCardShell, { width: HOME_FARM_CARD_WIDTH }]}>
                      <View style={styles.farmSkeletonImg} />
                      <View style={styles.farmSkeletonLine} />
                      <View style={[styles.farmSkeletonLine, { width: '55%' }]} />
                    </View>
                  ))
                : homeFarmsRow.length > 0
                  ? homeFarmsRow.map((farm) => (
                      <FarmCard
                        key={farm.id}
                        farm={farm}
                        navigation={navigation}
                        variant="minimal"
                        style={{ width: HOME_FARM_CARD_WIDTH, marginRight: 12 }}
                      />
                    ))
                  : (
                      <Text style={styles.farmsEmptyHint}>
                        Aucune ferme à afficher pour le moment.
                      </Text>
                    )}
            </ScrollView>
          </Container>

          {/* Services utiles */}
          <Container style={styles.section}>
            <View style={styles.sectionHeaderCustom}>
              <View style={styles.sectionTitleGroup}>
                <View style={styles.sectionAccentLine} />
                <View style={styles.sectionTitleBlock}>
                  <Text style={styles.sectionTitle}>Services utiles</Text>
                  <Text style={styles.sectionSubtitle}>Accompagnement pro</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.sectionActionButton}
                onPress={() => navigation.navigate('Services')}
              >
                <Text style={styles.sectionActionText}>Tout voir</Text>
                <Ionicons name="chevron-forward" size={15} color="#6B735A" />
              </TouchableOpacity>
            </View>

            <View style={styles.servicesStack}>
              {homeServicesPreview.length > 0 ? (
                homeServicesPreview.map((svc) => (
                  <ServiceCard
                    key={svc.id}
                    service={svc}
                    navigation={navigation}
                    variant="minimal"
                    fullWidth
                    style={styles.serviceHomeCard}
                  />
                ))
              ) : (
                <Text style={styles.servicesEmptyHint}>
                  Les services disponibles apparaîtront ici après chargement.
                </Text>
              )}
            </View>
          </Container>
    
          <Divider style={styles.divider} />
    
          {/* Promotions */}
          <Container style={styles.section} >
            <View style={styles.sectionHeaderCustom}>
              <View style={styles.sectionTitleGroup}>
                <View style={styles.sectionAccentLine} />
                <View style={styles.sectionTitleBlock}>
                  <Text style={styles.sectionTitle}>Promotions</Text>
                  <Text style={styles.sectionSubtitle}>Offres en cours</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.sectionActionButton}
                onPress={() => navigation.navigate('AllProducts', { filter: 'promotions' })}
              >
                <Text style={styles.sectionActionText}>Tout voir</Text>
                <Ionicons name="chevron-forward" size={15} color="#6B735A" />
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
                <View style={styles.sectionAccentLine} />
                <View style={styles.sectionTitleBlock}>
                  <Text style={styles.sectionTitle}>Tous les produits</Text>
                  <Text style={styles.sectionSubtitle}>Stock disponible</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.sectionActionButton}
                onPress={() => navigation.navigate('AllProducts', { filter: 'all' })}
              >
                <Text style={styles.sectionActionText}>Voir tout</Text>
                <Ionicons name="chevron-forward" size={15} color="#6B735A" />
              </TouchableOpacity>
            </View>
    
            {(loading || refreshing) && allProducts.length === 0 ? (
              // Skeleton pour tous les produits lors du chargement initial ou refresh (2 par ligne)
              <View style={styles.productsRow}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <ProductCardSkeleton key={`all-product-skeleton-${index}`} width={CARD_WIDTH} />
                ))}
              </View>
            ) : (
              <FlatList
                data={allProducts}
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
                    <Ionicons name="leaf-outline" size={24} color="#8A917E" />
                    <Text style={styles.allProductsEmptyText}>
                      Aucun produit disponible pour le moment.
                    </Text>
                  </View>
                }
              />
            )}
          </Container>

          <Container style={styles.homeFooter} padding="none">
            <Text style={styles.homeFooterBrand}>Dream Market</Text>
            <Text style={styles.homeFooterHours}>{CONTACT_INFO.hours}</Text>
            <View style={styles.homeFooterRow}>
              <TouchableOpacity
                style={styles.homeFooterChip}
                onPress={() =>
                  openWhatsApp(CONTACT_INFO.phone1, 'Bonjour Dream Market, ')
                }
                activeOpacity={0.85}
              >
                <Ionicons name="logo-whatsapp" size={17} color="#5C6B52" />
                <Text style={styles.homeFooterChipText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.homeFooterChip}
                onPress={() => navigation.navigate('Profil', { screen: 'FAQ' })}
                activeOpacity={0.85}
              >
                <Ionicons name="help-circle-outline" size={17} color="#5C6B52" />
                <Text style={styles.homeFooterChipText}>FAQ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.homeFooterChip}
                onPress={() => navigation.navigate('Profil', { screen: 'Support' })}
                activeOpacity={0.85}
              >
                <Ionicons name="chatbubbles-outline" size={17} color="#5C6B52" />
                <Text style={styles.homeFooterChipText}>Aide</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#F7F6F3',
  },
  // Header élégant
  header: {
    paddingTop: 8,
    paddingBottom: 8,
    // zIndex supprimé inutile maintenant que ça scrolle
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
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
    color: '#2C2C28',
    fontWeight: '600',
    fontSize: 17,
    letterSpacing: -0.2,
    marginBottom: 1,
  },
  appSubtitle: {
    color: '#7A786F',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#EDECE8',
    borderRadius: 10,
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
    backgroundColor: '#EDECE8',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#5C6B52',
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
  farmsCarousel: {
    paddingHorizontal: 0,
    paddingVertical: 6,
    paddingRight: 16,
    gap: 0,
  },
  farmCardShell: {
    marginRight: 12,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E6E1',
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
  },
  farmSkeletonImg: {
    height: 120,
    backgroundColor: '#EDECE8',
    marginBottom: 12,
  },
  farmSkeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EDECE8',
    marginHorizontal: 14,
    marginBottom: 8,
    width: '72%',
  },
  farmsEmptyHint: {
    fontSize: 13,
    color: '#86857D',
    paddingVertical: 12,
    paddingHorizontal: 4,
    fontStyle: 'italic',
  },
  servicesStack: {
    gap: 12,
    paddingHorizontal: 0,
  },
  serviceHomeCard: {
    marginBottom: 0,
    marginRight: 0,
  },
  servicesEmptyHint: {
    fontSize: 13,
    color: '#86857D',
    paddingVertical: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  homeFooter: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 8,
    alignItems: 'center',
  },
  homeFooterBrand: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5C6B52',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  homeFooterHours: {
    fontSize: 12,
    color: '#86857D',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  homeFooterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  homeFooterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E0DA',
    backgroundColor: '#FFFFFF',
  },
  homeFooterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3D3D38',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  section: {
    paddingVertical: 2,
  },
  divider: {
    marginVertical: 8,
    opacity: 0.35,
    backgroundColor: '#DCDAD4',
  },
  // En-têtes de sections — sobres
  sectionHeaderCustom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 0,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  sectionAccentLine: {
    width: 3,
    alignSelf: 'stretch',
    minHeight: 40,
    borderRadius: 2,
    backgroundColor: '#B8C4A8',
  },
  sectionTitleBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2C2C28',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#86857D',
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  sectionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
    gap: 2,
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5C6B52',
  },
  // Catégories — neutre
  categoriesContainer: {
    paddingHorizontal: 0,
    paddingVertical: 4,
    paddingLeft: 0,
    gap: 3,
  },
  categoryCard: {
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E0DA',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 118,
    gap: 10,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EFEC',
    flexShrink: 0,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3D3D38',
    textAlign: 'left',
    letterSpacing: 0,
    flex: 1,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
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
    borderColor: '#E2E0DA',
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  allProductsEmptyText: {
    color: '#6B6B66',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoaderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#86857D',
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
    color: '#86857D',
    fontWeight: '500',
  },
});