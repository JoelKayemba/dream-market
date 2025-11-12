import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, RefreshControl, Text } from 'react-native';
import { 
  Container, 
  CategoryCard,
  ProductCard,
  SearchBar,
  SectionHeader,
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
  fetchProducts,
  fetchCategories,
  fetchPopularProducts,
  fetchNewProducts,
  fetchPromotionProducts
} from '../store/client';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ProductsScreen({ navigation, route }) {
  const { categoryName } = route.params || {};
  const dispatch = useDispatch();
  const products = useSelector(selectClientProducts);
  const categories = useSelector(selectClientCategories);
  const popularProducts = useSelector(selectPopularProducts);
  const newProducts = useSelector(selectNewProducts);
  const promotionProducts = useSelector(selectPromotionProducts);
  const loading = useSelector(selectClientProductsLoading);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchProducts()),
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
      await loadData();
    } catch (error) {
      console.error('Erreur lors du refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Gestionnaire de recherche
  const handleSearch = (query) => {
    navigation.navigate('Search', { searchQuery: query });
  };

  // Gestionnaire de sélection de catégorie
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Obtenir les produits de la catégorie sélectionnée
  const getCategoryProducts = () => {
    if (!selectedCategory || !products) return [];
    return products.filter(product => product.categories?.name === selectedCategory.name);
  };

  // Obtenir l'icône pour une catégorie
  const getCategoryIcon = (categoryName) => {
    const icons = {
      'légumes': 'carrot',
      'fruits': 'apple-alt',
      'produits laitiers': 'cheese',
      'viandes': 'drumstick-bite',
      'céréales': 'leaf',
      'boissons': 'wine-bottle',
      'épices': 'mortar-pestle',
      'bio': 'leaf',
      'default': 'shopping-basket'
    };
    return icons[categoryName?.toLowerCase()] || icons.default;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="shopping-basket" size={64} color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement des produits...</Text>
      </View>
    );
  }

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
        {/* Header avec titre et barre de recherche */}
        <Container style={styles.header}>
          <Text style={styles.title}>
             Nos Produits
          </Text>
          <Text style={styles.subtitle}>
            Découvrez nos produits agricoles frais et de saison
          </Text>
          
          <SearchBar
            onPress={() => handleSearch('')}
            placeholder="Rechercher des produits, fermes..."
            style={styles.searchBar}
          />
        </Container>

       

        <Divider />

        {/* Section Catégories */}
        <Container style={styles.section}>
          <SectionHeader
            title="Catégories"
            subtitle="Parcourez nos différentes catégories de produits"
          />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {(categories || []).map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory?.id === category.id && styles.selectedCategoryCard
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <View style={[
                  styles.categoryIconContainer, 
                  { backgroundColor: selectedCategory?.id === category.id ? '#4CAF50' : '#F0F8F0' }
                ]}>
                  <FontAwesome5 
                    name={getCategoryIcon(category.name)} 
                    size={16} 
                    color={selectedCategory?.id === category.id ? '#FFFFFF' : '#4CAF50'} 
                  />
                </View>
                <Text style={[
                  styles.categoryLabel,
                  selectedCategory?.id === category.id && styles.selectedCategoryLabel
                ]} numberOfLines={2}>
                  {category.name}
                </Text>
                {category.productCount && (
                  <Badge 
                    text={category.productCount.toString()} 
                    variant="outline" 
                    size="small" 
                    style={styles.categoryBadge}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Container>

        <Divider />

        {/* Affichage conditionnel : soit les sections normales, soit les produits de la catégorie */}
        {!selectedCategory ? (
          // Affichage normal avec toutes les sections
          <>
            {/* Section Nouveautés */}
            <Container style={styles.section}>
              <SectionHeader
                title="Nouveautés"
                subtitle="Découvrez nos nouveaux produits"
                onViewAll={() => navigation.navigate('AllProducts', { filter: 'new' })}
              />
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsContainer}
              >
                {(newProducts || []).map((product, index) => (
                  <View key={product.id} style={styles.productCardWrapper}>
                    {index === 0 && (
                      <View style={styles.newBadge}>
                        <MaterialIcons name="new-releases" size={12} color="#FFFFFF" />
                        <Text style={styles.newBadgeText}>Nouveau</Text>
                      </View>
                    )}
                    <ProductCard
                      product={product}
                      navigation={navigation}
                      variant="primary"
                      size="large"
                      style={styles.productCard}
                    />
                  </View>
                ))}
              </ScrollView>
            </Container>

            <Divider />

            {/* Section Promotions */}
            <Container style={styles.section}>
              <SectionHeader
                title="Promotions"
                subtitle="Profitez de nos offres spéciales"
                onViewAll={() => navigation.navigate('AllProducts', { filter: 'promotions' })}
              />
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsContainer}
              >
                {(promotionProducts || []).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    navigation={navigation}
                    variant="primary"
                    size="large"
                    style={styles.productCard}
                  />
                ))}
              </ScrollView>
            </Container>

            <Divider />

            {/* Section Produits Populaires */}
            <Container style={styles.section}>
              <SectionHeader
                title="Produits Populaires"
                subtitle="Les produits les plus appréciés par nos clients"
                onViewAll={() => navigation.navigate('AllProducts', { filter: 'featured' })}
              />
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsContainer}
              >
                {(popularProducts || []).map((product, index) => (
                  <View key={product.id} style={styles.productCardWrapper}>
                    {index < 3 && (
                      <View style={styles.popularBadge}>
                        <Ionicons name="trophy" size={12} color="#FFFFFF" />
                        <Text style={styles.popularBadgeText}>Top {index + 1}</Text>
                      </View>
                    )}
                    <ProductCard
                      product={product}
                      navigation={navigation}
                      variant="featured"
                      size="large"
                      style={styles.productCard}
                    />
                  </View>
                ))}
              </ScrollView>
            </Container>

            <Divider />

            {/* Section Tous les produits (grille) */}
            <Container style={styles.section}>
              <SectionHeader
                title="Tous nos produits"
                subtitle="Explorez notre catalogue complet"
                onViewAll={() => navigation.navigate('AllProducts', { filter: 'all' })}
              />
              
              <View style={styles.productsGrid}>
                {(popularProducts || []).slice(0, 6).map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    navigation={navigation}
                    variant="default"
                    size="fullWidth"
                    fullWidth={true}
                    style={styles.gridProductCard}
                  />
                ))}
              </View>
            </Container>
          </>
        ) : (
          // Affichage des produits de la catégorie sélectionnée
          <Container style={styles.section}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryTitleContainer}>
                <View style={[styles.categoryIconContainer, { backgroundColor: '#4CAF50' }]}>
                  <FontAwesome5 
                    name={getCategoryIcon(selectedCategory.name)} 
                    size={16} 
                    color="#FFFFFF" 
                  />
                </View>
                <View>
                  <Text style={styles.categoryTitle}>{selectedCategory.name}</Text>
                  <Text style={styles.categorySubtitle}>
                    {getCategoryProducts().length} produit{getCategoryProducts().length > 1 ? 's' : ''} disponible{getCategoryProducts().length > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.clearCategoryButton}
                onPress={() => setSelectedCategory(null)}
              >
                <MaterialIcons name="clear" size={20} color="#777E5C" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.categoryProductsGrid}>
              {getCategoryProducts().map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  navigation={navigation}
                  variant="default"
                  size="fullWidth"
                  fullWidth={true}
                  style={styles.categoryProductCard}
                />
              ))}
            </View>

            {getCategoryProducts().length === 0 && (
              <View style={styles.emptyState}>
                <MaterialIcons name="inventory" size={64} color="#CCCCCC" />
                <Text style={styles.emptyStateTitle}>Aucun produit dans cette catégorie</Text>
                <Text style={styles.emptyStateText}>
                  Aucun produit n'est disponible dans la catégorie {selectedCategory.name} pour le moment.
                </Text>
              </View>
            )}
          </Container>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#283106',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#777E5C',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: '400',
  },
  searchBar: {
    width: '100%',
    maxWidth: 400,
  },
  statsSection: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#283106',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#283106',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 12,
    color: '#777E5C',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  section: {
    paddingVertical: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    
  },
  categoryCard: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedCategoryCard: {
    backgroundColor: '#F0F8F0',
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#283106',
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  selectedCategoryLabel: {
    color: '#4CAF50',
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  productsContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 6,
  },
  productCardWrapper: {
    marginRight: 16,
    position: 'relative',
  },
  productCard: {
    width: 160,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFA500',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  productsGrid: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 4,
  },
  gridProductCard: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#283106',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#777E5C',
    fontWeight: '400',
  },
  clearCategoryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  categoryProductsGrid: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 4,
  },
  categoryProductCard: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#777E5C',
    fontStyle: 'italic',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },
});