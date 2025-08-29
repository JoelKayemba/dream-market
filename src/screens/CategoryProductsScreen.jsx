import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Container, Badge, Button, SearchBar } from '../components/ui';
import { products } from '../data/products';

export default function CategoryProductsScreen({ navigation, route }) {
  const { category } = route.params;
  const [productsList, setProductsList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'rating', 'newest'
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedFarms, setSelectedFarms] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (category && products) {
      const categoryProducts = products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
      setProductsList(categoryProducts);
      setFilteredProducts(categoryProducts);
    }
  }, [category]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, sortBy, priceRange, selectedFarms]);

  const applyFilters = () => {
    let filtered = [...productsList];

    // Filtre par recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.farm.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getCategoryInfo = () => {
    const categoryMap = {
      'légumes': { emoji: '🥕', name: 'Légumes', color: '#8BC34A' },
      'fruits': { emoji: '🍎', name: 'Fruits', color: '#FF9800' },
      'céréales': { emoji: '🌾', name: 'Céréales', color: '#FFC107' },
      'viandes': { emoji: '🥩', name: 'Viandes', color: '#E91E63' },
      'poissons': { emoji: '🐟', name: 'Poissons', color: '#2196F3' },
      'produits laitiers': { emoji: '🥛', name: 'Produits laitiers', color: '#9C27B0' },
      'épices': { emoji: '🌶️', name: 'Épices', color: '#F44336' },
      'bio': { emoji: '🌱', name: 'Produits bio', color: '#4CAF50' }
    };
    
    return categoryMap[category.toLowerCase()] || { 
      emoji: '🛒', 
      name: category, 
      color: '#777E5C' 
    };
  };

  const getFarmsList = () => {
    const farms = [...new Set(productsList.map(p => p.farm))];
    return farms;
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
    setSelectedFarms([]);
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      
      <View style={styles.productContent}>
        <View style={styles.productHeader}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>{item.price}€</Text>
        </View>
        
        <Text style={styles.productFarm} numberOfLines={1}>
          🏡 {item.farm}
        </Text>
        
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.productFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating || 'N/A'}</Text>
          </View>
          
          {item.tags && item.tags.length > 0 && (
            <Badge 
              text={item.tags[0]} 
              variant="primary" 
              size="small"
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
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

      {/* Prix */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Fourchette de prix</Text>
        <View style={styles.priceRangeContainer}>
          <Text style={styles.priceRangeText}>
            {priceRange.min}€ - {priceRange.max}€
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

  const categoryInfo = getCategoryInfo();

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
          <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
          <Text style={styles.categoryTitle}>{categoryInfo.name}</Text>
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
          placeholder={`Rechercher dans ${categoryInfo.name.toLowerCase()}...`}
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
        columnWrapperStyle={styles.productRow}
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
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
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
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  categoryTitle: {
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
    backgroundColor: '#FFFFFF',
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
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productContent: {
    padding: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
    flex: 1,
    marginRight: 8,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  productFarm: {
    fontSize: 12,
    color: '#777E5C',
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 12,
    color: '#555',
    lineHeight: 16,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#777E5C',
    fontWeight: '500',
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
