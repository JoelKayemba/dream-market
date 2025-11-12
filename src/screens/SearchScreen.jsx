import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button, Badge, ProductCard, FarmCard, ServiceCard , ScreenWrapper } from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectClientProducts,
  selectClientFarms,
  selectClientServices,
  selectClientProductsLoading,
  selectClientFarmsLoading,
  selectClientServicesLoading,
  fetchProducts,
  fetchFarms,
  fetchServices
} from '../store/client';

export default function SearchScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'products', 'farms', 'services'
  const [searchResults, setSearchResults] = useState({
    products: [],
    farms: [],
    services: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const SEARCH_HISTORY_KEY = '@dream_market_search_history';
  const MAX_HISTORY_ITEMS = 10;

  // Redux selectors
  const products = useSelector(selectClientProducts);
  const farms = useSelector(selectClientFarms);
  const services = useSelector(selectClientServices);
  const productsLoading = useSelector(selectClientProductsLoading);
  const farmsLoading = useSelector(selectClientFarmsLoading);
  const servicesLoading = useSelector(selectClientServicesLoading);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchProducts()),
          dispatch(fetchFarms()),
          dispatch(fetchServices())
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des données de recherche:', error);
      }
    };
    
    loadData();
    loadSearchHistory();
  }, [dispatch]);

  // Charger l'historique de recherche
  const loadSearchHistory = async () => {
    try {
      const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (historyJson) {
        const history = JSON.parse(historyJson);
        setSearchHistory(Array.isArray(history) ? history : []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  // Sauvegarder une recherche dans l'historique
  const saveToHistory = async (query) => {
    if (!query.trim()) return;

    try {
      const trimmedQuery = query.trim();
      // Récupérer l'historique actuel
      const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      let history = historyJson ? JSON.parse(historyJson) : [];

      // Supprimer les doublons (même query)
      history = history.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase());

      // Ajouter la nouvelle recherche en premier
      history.unshift(trimmedQuery);

      // Limiter à MAX_HISTORY_ITEMS
      history = history.slice(0, MAX_HISTORY_ITEMS);

      // Sauvegarder
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
      setSearchHistory(history);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'historique:', error);
    }
  };

  // Supprimer un élément de l'historique
  const removeFromHistory = async (queryToRemove) => {
    try {
      const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      let history = historyJson ? JSON.parse(historyJson) : [];

      // Supprimer l'élément
      history = history.filter(item => item.toLowerCase() !== queryToRemove.toLowerCase());

      // Sauvegarder
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
      setSearchHistory(history);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'historique:', error);
    }
  };

  // Effacer tout l'historique
  const clearAllHistory = async () => {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
      setSearchHistory([]);
    } catch (error) {
      console.error('Erreur lors de l\'effacement de l\'historique:', error);
    }
  };

  // État de chargement global
  const isLoading = productsLoading || farmsLoading || servicesLoading;

  // Générer les suggestions basées sur la requête
  const generateSuggestions = (query) => {
    if (!query.trim() || query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const suggestionsList = [];

    // Suggestions de produits
    (products || []).forEach(product => {
      if (product.name.toLowerCase().includes(lowerQuery)) {
        suggestionsList.push({
          id: `product-${product.id}`,
          text: product.name,
          type: 'product',
          data: product,
          icon: '🥕'
        });
      }
      if (product.categories?.name && product.categories.name.toLowerCase().includes(lowerQuery)) {
        suggestionsList.push({
          id: `category-${product.categories.id}`,
          text: product.categories.name,
          type: 'category',
          data: product.categories,
          icon: '🏷️'
        });
      }
    });

    // Suggestions de fermes
    (farms || []).forEach(farm => {
      if (farm.name.toLowerCase().includes(lowerQuery)) {
        suggestionsList.push({
          id: `farm-${farm.id}`,
          text: farm.name,
          type: 'farm',
          data: farm,
          icon: '🚜'
        });
      }
      if (farm.specialty && farm.specialty.toLowerCase().includes(lowerQuery)) {
        suggestionsList.push({
          id: `specialty-${farm.id}`,
          text: farm.specialty,
          type: 'specialty',
          data: farm,
          icon: '🌱'
        });
      }
    });

    // Suggestions de services
    (services || []).forEach(service => {
      if (service.name.toLowerCase().includes(lowerQuery)) {
        suggestionsList.push({
          id: `service-${service.id}`,
          text: service.name,
          type: 'service',
          data: service,
          icon: '🔧'
        });
      }
      if (service.category && service.category.toLowerCase().includes(lowerQuery)) {
        suggestionsList.push({
          id: `service-category-${service.id}`,
          text: service.category,
          type: 'service-category',
          data: service,
          icon: '📋'
        });
      }
    });

    // Supprimer les doublons et limiter à 8 suggestions
    const uniqueSuggestions = suggestionsList
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text === suggestion.text)
      )
      .slice(0, 8);

    setSuggestions(uniqueSuggestions);
    setShowSuggestions(uniqueSuggestions.length > 0);
  };

  // Récupérer la requête initiale depuis la route si elle existe
  useEffect(() => {
    if (route.params?.initialQuery) {
      setSearchQuery(route.params.initialQuery);
      handleSearch(route.params.initialQuery);
    }
  }, [route.params?.initialQuery]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ products: [], farms: [], services: [] });
      setHasSearched(false);
      setShowSuggestions(false);
      return;
    }

    // Sauvegarder dans l'historique
    await saveToHistory(query);

    setIsSearching(true);
    setHasSearched(true);
    setShowSuggestions(false); // Masquer les suggestions lors de la recherche

    const lowerQuery = query.toLowerCase();

    // Recherche dans les produits avec données backend
    const filteredProducts = (products || []).filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      (product.description && product.description.toLowerCase().includes(lowerQuery)) ||
      (product.short_description && product.short_description.toLowerCase().includes(lowerQuery)) ||
      (product.farms?.name && product.farms.name.toLowerCase().includes(lowerQuery)) ||
      (product.categories?.name && product.categories.name.toLowerCase().includes(lowerQuery)) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );

    // Recherche dans les fermes avec données backend
    const filteredFarms = (farms || []).filter(farm =>
      farm.name.toLowerCase().includes(lowerQuery) ||
      (farm.description && farm.description.toLowerCase().includes(lowerQuery)) ||
      (farm.specialty && farm.specialty.toLowerCase().includes(lowerQuery)) ||
      (farm.location && farm.location.toLowerCase().includes(lowerQuery)) ||
      (farm.region && farm.region.toLowerCase().includes(lowerQuery)) ||
      (farm.story && farm.story.toLowerCase().includes(lowerQuery)) ||
      (farm.certifications && farm.certifications.some(cert => cert.toLowerCase().includes(lowerQuery))) ||
      (farm.sustainable_practices && farm.sustainable_practices.some(practice => practice.toLowerCase().includes(lowerQuery)))
    );

    // Recherche dans les services avec données backend
    const filteredServices = (services || []).filter(service =>
      service.name.toLowerCase().includes(lowerQuery) ||
      (service.description && service.description.toLowerCase().includes(lowerQuery)) ||
      (service.short_description && service.short_description.toLowerCase().includes(lowerQuery)) ||
      (service.category && service.category.toLowerCase().includes(lowerQuery)) ||
      (service.coverage && service.coverage.toLowerCase().includes(lowerQuery)) ||
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

  const handleTextChange = (text) => {
    setSearchQuery(text);
    generateSuggestions(text);
    
    // Si on efface le texte, masquer les suggestions et réinitialiser
    if (!text.trim()) {
      setShowSuggestions(false);
      setHasSearched(false);
      setSearchResults({ products: [], farms: [], services: [] });
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    handleSearch(suggestion.text);
    
    // Navigation directe vers l'élément si c'est un élément spécifique
    if (suggestion.type === 'product') {
      navigation.navigate('ProductDetail', { product: suggestion.data });
    } else if (suggestion.type === 'farm') {
      navigation.navigate('FarmDetail', { farm: suggestion.data });
    } else if (suggestion.type === 'service') {
      navigation.navigate('ServiceDetail', { service: suggestion.data });
    }
  };

  // Gérer le clic sur un élément de l'historique
  const handleHistoryItemPress = (historyItem) => {
    setSearchQuery(historyItem);
    handleSearch(historyItem);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ products: [], farms: [], services: [] });
    setSuggestions([]);
    setShowSuggestions(false);
    setHasSearched(false);
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
    <ServiceCard
      service={item}
      navigation={navigation}
      variant="default"
      style={styles.serviceCard}
    />
  );

  const renderResults = () => {
    // État de chargement initial des données
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Ionicons name="search" size={48} color="#777E5C" />
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
  );
    }

    // Affichage des suggestions si on tape mais qu'on n'a pas encore recherché
    if (showSuggestions && !hasSearched && searchQuery.trim().length >= 1) {
      return (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggestions</Text>
          {suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.id}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionText}>{suggestion.text}</Text>
                <Text style={styles.suggestionType}>
                  {suggestion.type === 'product' && 'Produit'}
                  {suggestion.type === 'farm' && 'Ferme'}
                  {suggestion.type === 'service' && 'Service'}
                  {suggestion.type === 'category' && 'Catégorie'}
                  {suggestion.type === 'specialty' && 'Spécialité'}
                  {suggestion.type === 'service-category' && 'Catégorie de service'}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#777E5C" />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // État de recherche en cours
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <Ionicons name="search" size={48} color="#777E5C" />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>
      );
    }

    // État initial sans recherche - Afficher l'historique
    if (!searchQuery.trim()) {
      return (
        <View style={styles.historyContainer}>
          {searchHistory.length > 0 ? (
            <>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Recherches récentes</Text>
                <TouchableOpacity onPress={clearAllHistory} style={styles.clearHistoryButton}>
                  <Text style={styles.clearHistoryText}>Tout effacer</Text>
                </TouchableOpacity>
              </View>
              {searchHistory.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.historyItem}
                  onPress={() => handleHistoryItemPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.historyItemLeft}>
                    <Ionicons name="time-outline" size={20} color="#777E5C" />
                    <Text style={styles.historyItemText}>{item}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      removeFromHistory(item);
                    }}
                    style={styles.deleteHistoryButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#777E5C" />
              <Text style={styles.emptyTitle}>Recherchez quelque chose</Text>
              <Text style={styles.emptySubtitle}>
                Trouvez des produits, fermes et services en tapant votre recherche
              </Text>
            </View>
          )}
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
                    <ServiceCard
                      key={service.id}
                      service={service}
                      navigation={navigation}
                      variant="default"
                      style={styles.serviceCard}
                    />
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
    <ScreenWrapper style={styles.container}>
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
            onChangeText={handleTextChange}
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
    </ScreenWrapper>
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
  serviceCard: {
    width: '100%',
    marginBottom: 16,
  },
  singleCategoryContainer: {
    padding: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
  },
  suggestionsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 2,
  },
  suggestionType: {
    fontSize: 12,
    color: '#777E5C',
    textTransform: 'capitalize',
  },
  historyContainer: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#283106',
  },
  clearHistoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  historyItemText: {
    fontSize: 16,
    color: '#283106',
    fontWeight: '500',
    flex: 1,
  },
  deleteHistoryButton: {
    padding: 4,
  },
});
