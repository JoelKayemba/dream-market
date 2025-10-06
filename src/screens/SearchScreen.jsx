import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button, Badge, ProductCard, FarmCard } from '../components/ui';
import { products } from '../data/products';
import { farms } from '../data/farms';
import { services } from '../data/services';

export default function SearchScreen({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'products', 'farms', 'services'
  const [searchResults, setSearchResults] = useState({
    products: [],
    farms: [],
    services: []
  });
  const [isSearching, setIsSearching] = useState(false);

  // Récupérer la requête initiale depuis la route si elle existe
  useEffect(() => {
    if (route.params?.initialQuery) {
      setSearchQuery(route.params.initialQuery);
      handleSearch(route.params.initialQuery);
    }
  }, [route.params?.initialQuery]);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults({ products: [], farms: [], services: [] });
      return;
    }

    setIsSearching(true);
    const lowerQuery = query.toLowerCase();

    // Recherche dans les produits
    const filteredProducts = products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.farm.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
    );

    // Recherche dans les fermes
    const filteredFarms = farms.filter(farm =>
      farm.name.toLowerCase().includes(lowerQuery) ||
      farm.description.toLowerCase().includes(lowerQuery) ||
      farm.specialty.toLowerCase().includes(lowerQuery) ||
      farm.location.toLowerCase().includes(lowerQuery) ||
      farm.region.toLowerCase().includes(lowerQuery) ||
      (farm.products && farm.products.some(product => product.toLowerCase().includes(lowerQuery))) ||
      (farm.certifications && farm.certifications.some(cert => cert.toLowerCase().includes(lowerQuery)))
    );

    // Recherche dans les services
    const filteredServices = services.filter(service =>
      service.name.toLowerCase().includes(lowerQuery) ||
      service.description.toLowerCase().includes(lowerQuery) ||
      service.shortDescription.toLowerCase().includes(lowerQuery) ||
      service.category.toLowerCase().includes(lowerQuery) ||
      service.coverage.toLowerCase().includes(lowerQuery) ||
      (service.features && service.features.some(feature => feature.toLowerCase().includes(lowerQuery)))
    );

    setSearchResults({
      products: filteredProducts,
      farms: filteredFarms,
      services: filteredServices
    });
    setIsSearching(false);
  };

  const handleSearchSubmit = () => {
    handleSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ products: [], farms: [], services: [] });
  };

  const getTotalResults = () => {
    return searchResults.products.length + searchResults.farms.length + searchResults.services.length;
  };

  const renderProductItem = ({ item }) => (
    <ProductCard
      product={item}
      navigation={navigation}
      variant="default"
      size="large"
      fullWidth={true}
      style={styles.productCard}
    />
  );

  const renderFarmItem = ({ item }) => (
    <FarmCard
      farm={item}
      navigation={navigation}
      variant="default"
      style={styles.farmCard}
    />
  );

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => navigation.navigate('ServiceDetail', { service: item })}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemSubtitle}>{item.description}</Text>
        <View style={styles.itemFooter}>
          <Badge text={item.category} variant="secondary" size="small" />
          <Text style={styles.itemPrice}>{item.price}€</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderResults = () => {
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <Ionicons name="search" size={48} color="#777E5C" />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>
      );
    }

    if (!searchQuery.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#777E5C" />
          <Text style={styles.emptyTitle}>Recherchez quelque chose</Text>
          <Text style={styles.emptySubtitle}>
            Trouvez des produits, fermes et services en tapant votre recherche
          </Text>
        </View>
      );
    }

    if (getTotalResults() === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#777E5C" />
          <Text style={styles.emptyTitle}>Aucun résultat trouvé</Text>
          <Text style={styles.emptySubtitle}>
            Essayez avec d'autres mots-clés ou vérifiez l'orthographe
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.resultsContainer}>
        {/* Résumé des résultats */}
        <View style={styles.resultsSummary}>
          <Text style={styles.resultsCount}>
            {getTotalResults()} résultat{getTotalResults() > 1 ? 's' : ''} trouvé{getTotalResults() > 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Effacer</Text>
          </TouchableOpacity>
        </View>

        {/* Onglets de filtrage */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              Tout ({getTotalResults()})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'products' && styles.activeTab]}
            onPress={() => setActiveTab('products')}
          >
            <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
              Produits ({searchResults.products.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'farms' && styles.activeTab]}
            onPress={() => setActiveTab('farms')}
          >
            <Text style={[styles.tabText, activeTab === 'farms' && styles.activeTabText]}>
              Fermes ({searchResults.farms.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'services' && styles.activeTab]}
            onPress={() => setActiveTab('services')}
          >
            <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
              Services ({searchResults.services.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Grille des résultats */}
        {activeTab === 'all' && (
          <View style={styles.resultsGrid}>
            {searchResults.products.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Produits ({searchResults.products.length})</Text>
                <View style={styles.cardsGrid}>
                  {searchResults.products.slice(0, 6).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      navigation={navigation}
                      variant="default"
                      size="large"
                      fullWidth={true}
                      style={styles.productCard}
                    />
                  ))}
                </View>
                {searchResults.products.length > 6 && (
                  <TouchableOpacity 
                    style={styles.seeMoreButton}
                    onPress={() => navigation.navigate('AllProducts', { filter: 'all' })}
                  >
                    <Text style={styles.seeMoreText}>Voir tous les produits</Text>
                    <Ionicons name="arrow-forward" size={16} color="#4CAF50" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {searchResults.farms.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Fermes ({searchResults.farms.length})</Text>
                <View style={styles.cardsGrid}>
                  {searchResults.farms.slice(0, 4).map((farm) => (
                    <FarmCard
                      key={farm.id}
                      farm={farm}
                      navigation={navigation}
                      variant="default"
                      style={styles.farmCard}
                    />
                  ))}
                </View>
                {searchResults.farms.length > 4 && (
                  <TouchableOpacity 
                    style={styles.seeMoreButton}
                    onPress={() => navigation.navigate('AllFarms', { filter: 'all' })}
                  >
                    <Text style={styles.seeMoreText}>Voir toutes les fermes</Text>
                    <Ionicons name="arrow-forward" size={16} color="#4CAF50" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {searchResults.services.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Services ({searchResults.services.length})</Text>
                <View style={styles.cardsGrid}>
                  {searchResults.services.slice(0, 6).map((service) => (
                    <TouchableOpacity 
                      key={service.id}
                      style={styles.resultItem} 
                      onPress={() => navigation.navigate('ServiceDetail', { service })}
                    >
                      <Image source={{ uri: service.image }} style={styles.itemImage} />
                      <View style={styles.itemContent}>
                        <Text style={styles.itemTitle} numberOfLines={2}>{service.name}</Text>
                        <Text style={styles.itemSubtitle}>{service.description}</Text>
                        <View style={styles.itemFooter}>
                          <Badge text={service.category} variant="secondary" size="small" />
                          <Text style={styles.itemPrice}>{service.price}€</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                {searchResults.services.length > 6 && (
                  <TouchableOpacity 
                    style={styles.seeMoreButton}
                    onPress={() => navigation.navigate('AllServices', { filter: 'all' })}
                  >
                    <Text style={styles.seeMoreText}>Voir tous les services</Text>
                    <Ionicons name="arrow-forward" size={16} color="#4CAF50" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === 'products' && (
          <View style={styles.cardsGrid}>
            {searchResults.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                navigation={navigation}
                variant="default"
                size="large"
                fullWidth={true}
                style={styles.productCard}
              />
            ))}
          </View>
        )}

        {activeTab === 'farms' && (
          <View style={styles.cardsGrid}>
            {searchResults.farms.map((farm) => (
              <FarmCard
                key={farm.id}
                farm={farm}
                navigation={navigation}
                variant="default"
                style={styles.farmCard}
              />
            ))}
          </View>
        )}

        {activeTab === 'services' && (
          <View style={styles.cardsGrid}>
            {searchResults.services.map((service) => (
              <TouchableOpacity 
                key={service.id}
                style={styles.resultItem} 
                onPress={() => navigation.navigate('ServiceDetail', { service })}
              >
                <Image source={{ uri: service.image }} style={styles.itemImage} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{service.name}</Text>
                  <Text style={styles.itemSubtitle}>{service.description}</Text>
                  <View style={styles.itemFooter}>
                    <Badge text={service.category} variant="secondary" size="small" />
                    <Text style={styles.itemPrice}>{service.price}€</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec barre de recherche */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#777E5C" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher produits, fermes, services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
              <Ionicons name="close-circle" size={20} color="#777E5C" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Contenu des résultats */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderResults()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#283106',
    paddingVertical: 8,
  },
  clearIcon: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#777E5C',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 24,
  },
  resultsContainer: {
    padding: 16,
  },
  resultsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 12,
    color: '#777E5C',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#777E5C',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  itemRating: {
    fontSize: 14,
    color: '#777E5C',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  seeMoreText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsGrid: {
    padding: 16,
  },
  cardsGrid: {
    gap: 16,
  },
  productCard: {
    width: '100%',
    marginBottom: 16,
  },
  farmCard: {
    width: '100%',
    marginBottom: 16,
  },
});
