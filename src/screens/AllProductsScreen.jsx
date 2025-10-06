import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Container, Badge, Button, SearchBar, ProductCard } from '../components/ui';
import { products } from '../data/products';
import { productCategories } from '../data/categories';

export default function AllProductsScreen({ navigation, route }) {
  const { filter, farmId } = route.params || {};
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'rating', 'newest'
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFarms, setSelectedFarms] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Initialiser les produits au chargement avec le filtre reçu
  useEffect(() => {
    if (products && products.length > 0) {
      applyInitialFilter();
    }
  }, [filter, farmId]);

  useEffect(() => {
    if (products && products.length > 0) {
      applyFilters();
    }
  }, [searchQuery, sortBy, priceRange, selectedCategories, selectedFarms]);

  const applyInitialFilter = () => {
    if (!products || !Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // Appliquer le filtre initial reçu
    switch (filter) {
      case 'featured':
        filtered = filtered.filter(product => product.rating >= 4);
        break;
      case 'new':
        filtered = filtered.filter(product => product.isNew);
        break;
      case 'promotions':
        filtered = filtered.filter(product => product.discount);
        break;
      case 'all':
      default:
        // Pas de filtre, tous les produits
        break;
    }

    // Appliquer le filtre par ferme si spécifié
    if (farmId) {
      filtered = filtered.filter(product => product.farmId === farmId);
    }

    setFilteredProducts(filtered);
  };

  const applyFilters = () => {
    if (!products || !Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }
    
    let filtered = [...products];

    // Appliquer le filtre initial reçu
    switch (filter) {
      case 'featured':
        filtered = filtered.filter(product => product.rating >= 4);
        break;
      case 'new':
        filtered = filtered.filter(product => product.isNew);
        break;
      case 'promotions':
        filtered = filtered.filter(product => product.discount);
        break;
      case 'all':
      default:
        // Pas de filtre, tous les produits
        break;
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.farm.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par catégories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    // Filtre par prix
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Filtre par fermes sélectionnées
    if (selectedFarms.length > 0) {
      filtered = filtered.filter(product =>
        selectedFarms.includes(product.farm)
      );
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
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  // Utiliser les catégories centralisées
  const getCategoriesList = () => {
    return productCategories;
  };

  const getFarmsList = () => {
    if (!products || !Array.isArray(products)) return [];
    const farms = [...new Set(products.map(p => p.farm))];
    return farms;
  };

  const toggleCategoryFilter = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
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
    setPriceRange({ min: 0, max: 1000 });
    setSelectedCategories([]);
    setSelectedFarms([]);
  };

  const renderProduct = ({ item }) => (
    <ProductCard 
      product={item} 
      navigation={navigation} 
      variant="default"
      size="fullWidth"
      fullWidth={true}
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

      {/* Prix */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Fourchette de prix</Text>
        <View style={styles.priceRangeContainer}>
          <Text style={styles.priceRangeText}>
            {priceRange.min}$ - {priceRange.max}$
          </Text>
          <TouchableOpacity
            style={styles.resetPriceButton}
            onPress={() => setPriceRange({ min: 0, max: 1000 })}
          >
            <Text style={styles.resetPriceText}>Réinitialiser</Text>
          </TouchableOpacity>
        </View>
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
    <SafeAreaView style={styles.container}>
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
                const farm = require('../data/farms').farms.find(f => f.id === farmId);
                return farm ? `Produits de ${farm.name}` : 'Produits de la ferme';
              })() :
             filter === 'featured' ? 'Produits Vedettes' :
             filter === 'new' ? 'Nouveautés' :
             filter === 'promotions' ? 'Promotions' :
             'Tous nos produits'}
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
        numColumns={1}
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
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
    </SafeAreaView>
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
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRangeText: {
    fontSize: 14,
    color: '#777E5C',
  },
  resetPriceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetPriceText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '500',
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
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCardGrid: {
    width: '48%',
  },
  productCardList: {
    width: '100%',
    marginBottom: 16,
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
});
