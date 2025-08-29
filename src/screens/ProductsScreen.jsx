import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { 
  Container, 
  Text, 
  CategoryCard,
  ProductCard,
  SearchBar,
  SectionHeader,
  Divider
} from '../components/ui';
import { categories } from '../data/categories';
import { 
  getProductsByCategory, 
  getPopularProducts, 
  getNewProducts, 
  getDiscountedProducts 
} from '../data/products';

const { width } = Dimensions.get('window');

export default function ProductsScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Gestionnaire de recherche
  const handleSearch = (query) => {
    console.log('Recherche depuis Produits:', query);
    navigation.navigate('Search', { searchQuery: query });
  };

  // Gestionnaire de sélection de catégorie
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Gestionnaire de produit
  const handleProductPress = (product) => {
    console.log('Produit sélectionné:', product.name);
    // Navigation vers la page de détail du produit
  };

  const handleAddToCart = (product) => {
    console.log('Ajout au panier:', product.name);
  };

  const handleAddToFavorites = (product, isFavorite) => {
    console.log(`${isFavorite ? 'Ajouté aux' : 'Retiré des'} favoris:`, product.name);
  };

  // Obtenir les produits de la catégorie sélectionnée
  const getCategoryProducts = () => {
    if (!selectedCategory) return [];
    return getProductsByCategory(selectedCategory.id);
  };

  return (
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
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onPress={() => handleCategorySelect(category)}
              style={[
                styles.categoryCard,
                selectedCategory?.id === category.id && styles.selectedCategory
              ]}
            />
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
              {getNewProducts().map((product) => (
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
              {getDiscountedProducts().map((product) => (
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
              {getPopularProducts().map((product) => (
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
              {getPopularProducts().slice(0, 6).map((product) => (
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
  categoriesContainer: {
    paddingHorizontal: 4,
  },
  categoryCard: {
    marginRight: 16,
  },
  selectedCategory: {
    borderColor: '#283106',
    borderWidth: 2,
  },
  productsContainer: {
    paddingHorizontal: 4,
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
