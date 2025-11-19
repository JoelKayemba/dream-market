import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Dimensions, TouchableOpacity, RefreshControl, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Container, 
  ProductCard,
  SearchBar,
  Divider,
  ScreenWrapper,
  Badge
} from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectClientProducts, 
  selectClientCategories, 
  selectPopularProducts,
  selectNewProducts,
  selectPromotionProducts,
  selectClientProductsLoading,
  selectClientProductsLoadingMore,
  selectClientProductsPagination,
  fetchProducts,
  fetchCategories,
  fetchPopularProducts,
  fetchNewProducts,
  fetchPromotionProducts
} from '../store/client';
import { Ionicons } from '@expo/vector-icons';
import { CategorySkeleton, ProductCardSkeleton } from '../components/Skeleton';

const { width } = Dimensions.get('window');
const CARD_PADDING = 0;
const CARD_GAP = 12;
const CARD_WIDTH = (width - CARD_PADDING * 2 - CARD_GAP) / 2;

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

export default function ProductsScreen({ navigation, route }) {
  const { categoryName } = route.params || {};
  const dispatch = useDispatch();
  const products = useSelector(selectClientProducts);
  const categories = useSelector(selectClientCategories);
  const popularProducts = useSelector(selectPopularProducts);
  const newProducts = useSelector(selectNewProducts);
  const promotionProducts = useSelector(selectPromotionProducts);
  const loading = useSelector(selectClientProductsLoading);
  const loadingMore = useSelector(selectClientProductsLoadingMore);
  const pagination = useSelector(selectClientProductsPagination);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async (page = 0, refresh = false) => {
    try {
      await Promise.all([
        dispatch(fetchProducts({ 
          page, 
          refresh,
          categoryId: selectedCategory?.id || null
        })),
        dispatch(fetchCategories()),
        dispatch(fetchPopularProducts()),
        dispatch(fetchNewProducts()),
        dispatch(fetchPromotionProducts())
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  // Initialiser la catégorie sélectionnée si reçue via navigation
  useEffect(() => {
    if (categoryName && categories && categories.length > 0) {
      const category = categories.find(cat => cat.name === categoryName);
      if (category) {
        setSelectedCategory(category);
      }
    }
  }, [categoryName, categories]);

  // Pull to refresh
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData(0, true);
    } catch (error) {
      console.error('Erreur lors du refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Charger plus d'éléments
  const loadMore = useCallback(() => {
    if (!loadingMore && pagination.hasMore && !refreshing) {
      loadData(pagination.page + 1, false);
    }
  }, [loadingMore, pagination.hasMore, pagination.page, refreshing]);

  // Footer pour le chargement
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text style={styles.footerLoaderText}>Chargement...</Text>
      </View>
    );
  };

  // Gestionnaire de sélection de catégorie
  const handleCategorySelect = (category) => {
    const newCategory = selectedCategory?.id === category.id ? null : category;
    setSelectedCategory(newCategory);
    dispatch(fetchProducts({ page: 0, refresh: true, categoryId: newCategory?.id || null }));
  };

  // Obtenir les produits filtrés
  const getFilteredProducts = () => {
    if (selectedCategory) {
      return products.filter(product => product.categories?.name === selectedCategory.name);
    }
    return products;
  };

  const filteredProducts = getFilteredProducts();

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {/* Header simple et élégant */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Produits</Text>
              <Text style={styles.subtitle}>Découvrez notre sélection</Text>
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Ionicons name="search-outline" size={22} color="#283106" />
            </TouchableOpacity>
          </View>
        </View>

        <Divider />

        {/* Catégories compactes horizontales */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Catégories</Text>
            {selectedCategory && (
              <TouchableOpacity
                onPress={() => handleCategorySelect(selectedCategory)}
                style={styles.clearFilterButton}
              >
                <Ionicons name="close-circle" size={18} color="#6B7280" />
                <Text style={styles.clearFilterText}>Effacer</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {(categories && categories.length > 0) ? categories.map((category) => {
              const isSelected = selectedCategory?.id === category.id;
              const accentColor = category.color || '#4CAF50';
              const iconColor = isSelected ? '#FFFFFF' : accentColor;
              const gradientColors = isSelected 
                ? [accentColor, accentColor] 
                : [`${accentColor}33`, `${accentColor}14`];
              
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    isSelected && styles.categoryCardSelected
                  ]}
                  onPress={() => handleCategorySelect(category)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.categoryGradient}
                  >
                    <View style={[
                      styles.categoryIconContainer,
                      isSelected && styles.categoryIconContainerSelected
                    ]}>
                      <Ionicons 
                        name={getCategoryIcon(category.name)} 
                        size={18} 
                        color={iconColor} 
                      />
                    </View>
                    <Text style={[
                      styles.categoryLabel,
                      isSelected && styles.categoryLabelSelected
                    ]} numberOfLines={1}>
                      {category.name}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            }) : (
              Array.from({ length: 8 }).map((_, index) => (
                <CategorySkeleton key={`category-skeleton-${index}`} />
              ))
            )}
          </ScrollView>
        </View>

        <Divider />

        {/* Produits filtrés ou toutes les sections */}
        {selectedCategory ? (
          // Affichage des produits de la catégorie sélectionnée
          <View style={styles.section}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryTitleContainer}>
                <View style={styles.categoryIconBadge}>
                  <Ionicons 
                    name={getCategoryIcon(selectedCategory.name)} 
                    size={18} 
                    color="#FFFFFF" 
                  />
                </View>
                <View>
                  <Text style={styles.categoryTitle}>{selectedCategory.name}</Text>
                  <Text style={styles.categorySubtitle}>
                    {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </View>
            
            {loading && filteredProducts.length === 0 ? (
              <View style={styles.productsRow}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <ProductCardSkeleton key={`product-skeleton-${index}`} width={CARD_WIDTH} />
                ))}
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                renderItem={({ item }) => (
                  <ProductCard
                    product={item}
                    navigation={navigation}
                    variant="default"
                    size="medium"
                    fullWidth={false}
                    style={styles.productCard}
                  />
                )}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.productsRow}
                scrollEnabled={false}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="leaf-outline" size={48} color="#E0E0E0" />
                    <Text style={styles.emptyStateTitle}>Aucun produit</Text>
                    <Text style={styles.emptyStateText}>
                      Aucun produit disponible dans cette catégorie.
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        ) : (
          // Affichage normal avec toutes les sections
          <>
            {/* Nouveautés */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Nouveautés</Text>
                  <Text style={styles.sectionSubtitle}>Derniers arrivages</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AllProducts', { filter: 'new' })}
                  style={styles.viewAllButton}
                >
                  <Text style={styles.viewAllText}>Tout voir</Text>
                  <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsContainer}
              >
                {(newProducts && newProducts.length > 0) ? newProducts.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    navigation={navigation}
                    variant="default"
                    size="medium"
                    fullWidth={false}
                    style={styles.horizontalProductCard}
                  />
                )) : (
                  Array.from({ length: 4 }).map((_, index) => (
                    <ProductCardSkeleton key={`new-skeleton-${index}`} width={160} />
                  ))
                )}
              </ScrollView>
            </View>

            <Divider />

            {/* Populaires */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Populaires</Text>
                  <Text style={styles.sectionSubtitle}>Les plus appréciés</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AllProducts', { filter: 'featured' })}
                  style={styles.viewAllButton}
                >
                  <Text style={styles.viewAllText}>Tout voir</Text>
                  <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsContainer}
              >
                {(popularProducts && popularProducts.length > 0) ? popularProducts.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    navigation={navigation}
                    variant="default"
                    size="medium"
                    fullWidth={false}
                    style={styles.horizontalProductCard}
                  />
                )) : (
                  Array.from({ length: 4 }).map((_, index) => (
                    <ProductCardSkeleton key={`popular-skeleton-${index}`} width={160} />
                  ))
                )}
              </ScrollView>
            </View>

            <Divider />

            {/* Promotions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Promotions</Text>
                  <Text style={styles.sectionSubtitle}>Offres spéciales</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AllProducts', { filter: 'promotions' })}
                  style={styles.viewAllButton}
                >
                  <Text style={styles.viewAllText}>Tout voir</Text>
                  <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsContainer}
              >
                {(promotionProducts && promotionProducts.length > 0) ? promotionProducts.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    navigation={navigation}
                    variant="default"
                    size="medium"
                    fullWidth={false}
                    style={styles.horizontalProductCard}
                  />
                )) : (
                  Array.from({ length: 4 }).map((_, index) => (
                    <ProductCardSkeleton key={`promo-skeleton-${index}`} width={160} />
                  ))
                )}
              </ScrollView>
            </View>

            <Divider />

            {/* Tous les produits */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Tous les produits</Text>
                  <Text style={styles.sectionSubtitle}>Catalogue complet</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AllProducts', { filter: 'all' })}
                  style={styles.viewAllButton}
                >
                  <Text style={styles.viewAllText}>Tout voir</Text>
                  <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
                </TouchableOpacity>
              </View>
              
              {loading && products.length === 0 ? (
                <View style={styles.productsRow}>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <ProductCardSkeleton key={`all-skeleton-${index}`} width={CARD_WIDTH} />
                  ))}
                </View>
              ) : (
                <FlatList
                  data={products || []}
                  renderItem={({ item }) => (
                    <ProductCard
                      product={item}
                      navigation={navigation}
                      variant="default"
                      size="medium"
                      fullWidth={false}
                      style={styles.productCard}
                    />
                  )}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.productsRow}
                  scrollEnabled={false}
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={renderFooter}
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <Ionicons name="basket-outline" size={48} color="#E0E0E0" />
                      <Text style={styles.emptyStateTitle}>Aucun produit</Text>
                      <Text style={styles.emptyStateText}>
                        Aucun produit disponible pour le moment.
                      </Text>
                    </View>
                  }
                />
              )}
            </View>
          </>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F8F0',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4CAF50',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
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
  categoryCardSelected: {
    borderColor: '#4CAF50',
    borderWidth: 2,
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
  categoryIconContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'left',
    letterSpacing: 0.1,
    flex: 1,
  },
  categoryLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  productsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 2,
  },
  productsRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  productCard: {
    marginBottom: 0,
  },
  horizontalProductCard: {
    marginRight: 12,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoaderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  spacer: {
    height: 24,
  },
});
