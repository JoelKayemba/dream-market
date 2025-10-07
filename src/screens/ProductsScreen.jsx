import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { 
  Container, 
  Text, 
  CategoryCard,
  ProductCard,
  SearchBar,
  SectionHeader,
  Divider
 , ScreenWrapper } from '../components/ui';
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

  // Charger les données au montage du composant
  useEffect(() => {
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
    
    loadData();
  }, [dispatch]);

  // Initialiser la catégorie sélectionnée si reçue via navigation
  useEffect(() => {
    if (categoryName && categories && categories.length > 0) {
      const category = categories.find(cat => cat.name === categoryName);
      if (category) {
        setSelectedCategory(category);
      }
    }
  }, [categoryName]); // ✅ Suppression de 'categories' des dépendances pour éviter les re-renders

  // Gestionnaire de recherche
  const handleSearch = (query) => {
    navigation.navigate('Search', { searchQuery: query });
  };

  // Gestionnaire de sélection de catégorie
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Gestionnaire de produit
  const handleProductPress = (product) => {
    // Navigation vers la page de détail du produit
  };

  const handleAddToCart = (product) => {
    // Ajout au panier
  };

  const handleAddToFavorites = (product, isFavorite) => {
    // Gestion des favoris
  };

  // Obtenir les produits de la catégorie sélectionnée
  const getCategoryProducts = () => {
    if (!selectedCategory || !products) return [];
    return products.filter(product => product.categories?.name === selectedCategory.name);
  };

  return (
    <ScreenWrapper >
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header avec titre et barre de recherche */}
      <Container style={styles.header}>
        
        <Text variant="h2" style={styles.subtitle}>
          Découvrez nos produits agricoles de qualité
        </Text>
        
        <SearchBar
          onPress={() => handleSearch('')}
          placeholder="Rechercher des produits, fermes..."
          style={styles.searchBar}
        />
      </Container>

      <Divider />

      {/* Section Catégories populaires */}
      <Container style={styles.section}>
        <SectionHeader
          title="Catégories"
          subtitle="Parcourez nos différentes catégories de produits"
         
        />
        
        <View style={styles.categoriesGrid}>
          {(categories || []).map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory?.id === category.id && styles.selectedCategoryCard
              ]}
              onPress={() => handleCategorySelect(category)}
            >
              <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '20' }]}>
                <Text style={[styles.categoryIcon, { fontSize: 28, color: category.color }]}>
                  {category.emoji || '❓'}
                </Text>
              </View>
              <Text style={styles.categoryLabel}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
              {(newProducts || []).map((product) => (
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

          {/* Section Produits Vedettes */}
          <Container style={styles.section}>
            <SectionHeader
              title="Produits Vedettes"
              subtitle="Les produits les plus appréciés par nos clients"
              onViewAll={() => navigation.navigate('AllProducts', { filter: 'featured' })}
            />
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsContainer}
            >
              {(popularProducts || []).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  navigation={navigation}
                  variant="featured"
                  size="large"
                  style={styles.productCard}
                />
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
              {(popularProducts || []).slice(0, 6).map((product) => (
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
        // Affichage des produits de la catégorie sélectionnée en pleine largeur
        <Container style={styles.section}>
          <SectionHeader
            title={`${selectedCategory.name}`}
            subtitle={`Produits de la catégorie ${selectedCategory.name}`}
            
          />
          
          
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
    marginHorizontal: -20,
  },
  header: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  subtitle: {
    color: '#777E5C',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  searchBar: {
    width: '100%',
    maxWidth: 400,
  },
  section: {
    paddingVertical: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 8,
  },
  categoryCard: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 100,
    justifyContent: 'center',
  },
  selectedCategoryCard: {
    backgroundColor: '#F0F8F0',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 28,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#283106',
    lineHeight: 14,
  },
  productsContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 8,
  },
  productCard: {
    marginRight: 12,
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
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  categoryInfo: {
    fontSize: 14,
    color: '#555',
  },
  clearCategoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#283106',
    borderRadius: 8,
  },
  clearCategoryText: {
    color: '#fff',
    fontSize: 12,
  },
  categoryProductsGrid: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 4,
  },
  categoryProductCard: {
    marginBottom: 16,
  },
});
