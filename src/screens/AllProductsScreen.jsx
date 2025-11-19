import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, FlatList, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Badge, Button, SearchBar, ProductCard , ScreenWrapper } from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectClientProducts, 
  selectClientCategories,
  selectNewProducts,
  selectPopularProducts,
  selectPromotionProducts,
  selectClientProductsLoading,
  selectClientProductsLoadingMore,
  selectClientProductsPagination,
  fetchProducts,
  fetchCategories,
  fetchNewProducts,
  fetchPopularProducts,
  fetchPromotionProducts
} from '../store/client';

export default function AllProductsScreen({ navigation, route }) {
  const { filter: routeFilter, farmId, searchQuery: initialSearchQuery } = route.params || {};
  const filter = routeFilter || 'all'; // Par défaut 'all' si non défini
  const dispatch = useDispatch();
  
  console.log('[AllProductsScreen] Route params:', { routeFilter, filter, farmId, initialSearchQuery });
  
  // Utiliser les sélecteurs selon le filtre
  const allProducts = useSelector(selectClientProducts);
  const newProducts = useSelector(selectNewProducts);
  const popularProducts = useSelector(selectPopularProducts);
  const promotionProducts = useSelector(selectPromotionProducts);
  
  // Obtenir les produits selon le filtre avec useMemo pour recalculer quand les données changent
  const sourceProducts = useMemo(() => {
    let products = [];
    switch (filter) {
      case 'new':
        products = newProducts || [];
        break;
      case 'featured':
        products = popularProducts || [];
        break;
      case 'promotions':
        products = promotionProducts || [];
        break;
      case 'all':
      default:
        products = allProducts || [];
        break;
    }
    
    console.log(`[AllProductsScreen] sourceProducts pour filter="${filter}":`, {
      filter,
      count: products.length,
      newProductsCount: newProducts?.length || 0,
      popularProductsCount: popularProducts?.length || 0,
      promotionProductsCount: promotionProducts?.length || 0,
      allProductsCount: allProducts?.length || 0
    });
    
    return products;
  }, [filter, newProducts, popularProducts, promotionProducts, allProducts]);
  
  const categories = useSelector(selectClientCategories);
  const loading = useSelector(selectClientProductsLoading);
  const loadingMore = useSelector(selectClientProductsLoadingMore);
  const pagination = useSelector(selectClientProductsPagination);
  
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFarms, setSelectedFarms] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fonction pour obtenir le titre selon le filtre
  const getTitle = () => {
    switch (filter) {
      case 'featured':
        return 'Produits Vedettes';
      case 'new':
        return 'Nouveaux Produits';
      case 'promotions':
        return 'Produits en Promotion';
      default:
        return 'Tous les Produits';
    }
  };

  // Charger les données selon le filtre au montage
  useEffect(() => {
    const loadDataForFilter = async () => {
      try {
        console.log(`[AllProductsScreen] Chargement des données pour filter="${filter}"`);
        await dispatch(fetchCategories());
        
        // Charger les produits selon le filtre
        switch (filter) {
          case 'new':
            console.log('[AllProductsScreen] Appel fetchNewProducts');
            await dispatch(fetchNewProducts());
            break;
          case 'featured':
            console.log('[AllProductsScreen] Appel fetchPopularProducts');
            await dispatch(fetchPopularProducts());
            break;
          case 'promotions':
            console.log('[AllProductsScreen] Appel fetchPromotionProducts');
            await dispatch(fetchPromotionProducts());
            break;
          case 'all':
          default:
            console.log('[AllProductsScreen] Appel fetchProducts');
            await dispatch(fetchProducts({ page: 0, refresh: true }));
            break;
        }
        console.log(`[AllProductsScreen] Données chargées pour filter="${filter}"`);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    
    loadDataForFilter();
  }, [dispatch, filter]);

  // Réinitialiser les filtres locaux quand le filtre principal change
  useEffect(() => {
    setSelectedCategories([]);
    setSelectedFarms([]);
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery || '');
    }
  }, [filter, farmId, initialSearchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchCategories());
      
      switch (filter) {
        case 'new':
          await dispatch(fetchNewProducts());
          break;
        case 'featured':
          await dispatch(fetchPopularProducts());
          break;
        case 'promotions':
          await dispatch(fetchPromotionProducts());
          break;
        case 'all':
        default:
          await dispatch(fetchProducts({ page: 0, refresh: true }));
          break;
      }
    } catch (error) {
      console.error('Erreur lors du refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = useCallback(() => {
    // Pour les filtres spécifiques (new, featured, promotions), on ne charge pas plus
    // car ils sont déjà chargés en entier
    if (filter && filter !== 'all') {
      return;
    }
    
    if (!loadingMore && pagination.hasMore && !refreshing) {
      dispatch(fetchProducts({ page: pagination.page + 1, refresh: false }));
    }
  }, [loadingMore, pagination.hasMore, pagination.page, refreshing, filter, dispatch]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text style={styles.footerLoaderText}>Chargement...</Text>
      </View>
    );
  };

  // Appliquer les filtres locaux (tri, prix, catégories multiples) sur les produits chargés
  // Le filtre principal (new, featured, promotions) est déjà appliqué via les sélecteurs
  useEffect(() => {
    console.log(`[AllProductsScreen] useEffect applyFilters déclenché:`, {
      sourceProductsCount: sourceProducts?.length || 0,
      sortBy,
      selectedFarmsCount: selectedFarms.length,
      selectedCategoriesCount: selectedCategories.length,
      filter
    });
    
    if (sourceProducts && sourceProducts.length > 0) {
      applyFilters();
    } else {
      console.log('[AllProductsScreen] sourceProducts est vide, filteredProducts = []');
      setFilteredProducts([]);
    }
  }, [sourceProducts, sortBy, selectedFarms, selectedCategories, filter]);

  const applyFilters = () => {
    if (!sourceProducts || !Array.isArray(sourceProducts)) {
      setFilteredProducts([]);
      return;
    }
    
    let filtered = [...sourceProducts];
    const initialCount = filtered.length;
    
    // Filtrer par farmId si fourni
    if (farmId) {
      const beforeFarmFilter = filtered.length;
      filtered = filtered.filter(product => 
        product.farm_id === farmId || product.farms?.id === farmId
      );
      console.log(`[AllProductsScreen] Filtre farmId: ${beforeFarmFilter} -> ${filtered.length}`);
    }

    // Filtre par catégories (si plusieurs catégories sélectionnées, filtrer côté client)
    if (selectedCategories.length > 1) {
      const beforeCategoryFilter = filtered.length;
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.categories?.name)
      );
      console.log(`[AllProductsScreen] Filtre catégories multiples: ${beforeCategoryFilter} -> ${filtered.length}`);
    } else if (selectedCategories.length === 1) {
      // Si une seule catégorie, filtrer côté client
      const beforeCategoryFilter = filtered.length;
      filtered = filtered.filter(product =>
        product.categories?.name === selectedCategories[0]
      );
      console.log(`[AllProductsScreen] Filtre catégorie unique: ${beforeCategoryFilter} -> ${filtered.length}`);
    }


    // Filtre par fermes sélectionnées
    if (selectedFarms.length > 0) {
      const beforeFarmFilter = filtered.length;
      filtered = filtered.filter(product =>
        selectedFarms.includes(product.farms?.name)
      );
      console.log(`[AllProductsScreen] Filtre fermes: ${beforeFarmFilter} -> ${filtered.length}`);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-desc':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    console.log(`[AllProductsScreen] applyFilters: ${initialCount} produits initiaux -> ${filtered.length} produits filtrés`);
    setFilteredProducts(filtered);
  };

  // Utiliser les catégories centralisées
  const getCategoriesList = () => {
    return categories || [];
  };

  const getFarmsList = () => {
    if (!sourceProducts || !Array.isArray(sourceProducts)) return [];
    const farms = [...new Set(sourceProducts.map(p => p.farms?.name).filter(Boolean))];
    return farms;
  };

  const toggleCategoryFilter = (categoryName) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName];
      return newCategories;
    });
  };

  const toggleFarmFilter = (farm) => {
    setSelectedFarms(prev => 
      prev.includes(farm) 
        ? prev.filter(f => f !== farm)
        : [...prev, farm]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSortBy('name');
    setSelectedCategories([]);
    setSelectedFarms([]);
  };

  const renderProduct = ({ item }) => (
    <ProductCard 
      product={item} 
      navigation={navigation} 
      variant="default"
      size="medium"
      fullWidth={false}
      style={styles.productCardList}
    />
  );

  const renderFilters = () => (
    <View style={styles.filtersPanel}>
      {/* Tri */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Trier par</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortButtonsContainer}
        >
          {[
            { id: 'name', label: 'Nom A-Z', icon: 'text' },
            { id: 'price', label: 'Prix croissant', icon: 'trending-up' },
            { id: 'price-desc', label: 'Prix décroissant', icon: 'trending-down' },
            { id: 'rating', label: 'Meilleures notes', icon: 'star' },
            { id: 'newest', label: 'Plus récents', icon: 'time' }
          ].map(sort => (
            <TouchableOpacity
              key={sort.id}
              style={[
                styles.sortButton,
                sortBy === sort.id && styles.activeSortButton
              ]}
              onPress={() => setSortBy(sort.id)}
            >
              <Ionicons 
                name={sort.icon} 
                size={16} 
                color={sortBy === sort.id ? '#FFFFFF' : '#777E5C'} 
              />
              <Text style={[
                styles.sortButtonText,
                sortBy === sort.id && styles.activeSortButtonText
              ]}>
                {sort.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Catégories */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Filtrer par catégorie</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {getCategoriesList().map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategories.includes(category.name) && styles.selectedCategoryButton,
                { borderColor: category.color }
              ]}
              onPress={() => toggleCategoryFilter(category.name)}
            >
              <Text style={[styles.categoryEmoji, { color: category.color }]}>
                {category.emoji}
              </Text>
              <Text style={[styles.categoryName, { color: category.color }]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Fermes */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Filtrer par ferme</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.farmsContainer}
        >
          {getFarmsList().map(farm => (
            <TouchableOpacity
              key={farm}
              style={[
                styles.farmFilter,
                selectedFarms.includes(farm) && styles.selectedFarmFilter
              ]}
              onPress={() => toggleFarmFilter(farm)}
            >
              <Text style={[
                styles.farmFilterText,
                selectedFarms.includes(farm) && styles.selectedFarmFilterText
              ]}>
                {farm}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bouton réinitialiser */}
      <Button
        title="Réinitialiser tous les filtres"
        onPress={resetFilters}
        variant="outline"
        size="medium"
        style={styles.resetFiltersButton}
      />
    </View>
  );

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {farmId ? 
              (() => {
                // Trouver la ferme dans les produits
                const productWithFarm = sourceProducts.find(p => p.farm_id === farmId || p.farms?.id === farmId);
                return productWithFarm ? `Produits de ${productWithFarm.farms?.name}` : 'Produits de la ferme';
              })() :
             getTitle()}
          </Text>
          <Text style={styles.productCount}>
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.filterToggleButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons 
            name={showFilters ? 'close' : 'filter'} 
            size={24} 
            color="#283106" 
          />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Rechercher des produits..."
          onPress={(query) => navigation.navigate('Search', { initialQuery: query })}
        />
      </View>

      {/* Filtres */}
      {showFilters && renderFilters()}

      {/* Liste des produits */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#777E5C" />
            <Text style={styles.emptyTitle}>Aucun produit trouvé</Text>
            <Text style={styles.emptySubtitle}>
              Essayez de modifier vos filtres ou votre recherche
            </Text>
            <Button
              title="Réinitialiser les filtres"
              onPress={resetFilters}
              variant="primary"
              size="medium"
              style={styles.emptyResetButton}
            />
          </View>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
    marginBottom: 2,
  },
  productCount: {
    fontSize: 14,
    color: '#777E5C',
  },
  filterToggleButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersPanel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 12,
  },
  viewModeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  viewModeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeViewModeButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sortButtonsContainer: {
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  activeSortButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#777E5C',
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: '#FFFFFF',
  },
  categoriesContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    minWidth: 80,
    justifyContent: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: '#F0F8F0',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  farmsContainer: {
    gap: 8,
  },
  farmFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedFarmFilter: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  farmFilterText: {
    fontSize: 12,
    color: '#777E5C',
    fontWeight: '500',
  },
  selectedFarmFilterText: {
    color: '#FFFFFF',
  },
  resetFiltersButton: {
    marginTop: 8,
  },
  productsContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCardGrid: {
    width: '48%',
  },
  productCardList: {
    marginBottom: 0,
  },
  fullWidthCard: {
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyResetButton: {
    minWidth: 200,
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
});
