import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Badge, ProductCard, FarmCard, ServiceCard , ScreenWrapper } from '../components/ui';
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
import { trackInteractionWithUserId } from '../utils/interactionTracker';
import {
  buildRichSuggestions,
  rankProductsForSearch,
  rankFarmsForSearch,
  rankServicesForSearch,
} from '../utils/smartSearch';
import { formatPrice } from '../utils/currency';

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
  const [debouncedQuery, setDebouncedQuery] = useState('');
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
  const userId = useSelector((state) => state.auth?.user?.id);

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

  useEffect(() => {
    const trimmed = searchQuery.trim();
    const t = setTimeout(() => setDebouncedQuery(trimmed), 260);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const suggestionEntries = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return buildRichSuggestions(debouncedQuery, products, farms, services, 16);
  }, [debouncedQuery, products, farms, services]);

  const suggestionsSynced = debouncedQuery === searchQuery.trim();

  const showSuggestionPanel = searchQuery.trim().length >= 1 && !hasSearched;

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
      return;
    }

    // Sauvegarder dans l'historique
    await saveToHistory(query);

    setIsSearching(true);
    setHasSearched(true);

    const filteredProducts = rankProductsForSearch(products || [], query);
    const filteredFarms = rankFarmsForSearch(farms || [], query);
    const filteredServices = rankServicesForSearch(services || [], query);

    // Tracker la recherche pour la personnalisation (après le filtrage)
    // On tracke seulement si on a trouvé au moins un produit correspondant
    if (userId && filteredProducts.length > 0) {
      // Utiliser le premier produit trouvé pour le tracking
      const firstMatch = filteredProducts[0];
      const productId = firstMatch?.id || null;
      const categoryId = firstMatch?.category_id || firstMatch?.categories?.id || null;
      
      // Tracker avec le productId du premier produit trouvé
      if (productId) {
        trackInteractionWithUserId(userId, {
          type: 'search',
          productId: productId,
          searchQuery: query,
          categoryId: categoryId,
        });
      }
    }

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

    // Si on efface le texte, masquer les suggestions et réinitialiser
    if (!text.trim()) {
      setHasSearched(false);
      setSearchResults({ products: [], farms: [], services: [] });
    }
  };

  const handleSuggestionPress = (suggestion) => {
    if (suggestion.type === 'product') {
      navigation.navigate('ProductDetail', { product: suggestion.data });
      return;
    }
    if (suggestion.type === 'farm') {
      navigation.navigate('FarmDetail', { farm: suggestion.data });
      return;
    }
    if (suggestion.type === 'service') {
      navigation.navigate('ServiceDetail', { service: suggestion.data });
      return;
    }
  };

  const renderRichSuggestion = (suggestion) => {
    const typeLabel =
      suggestion.type === 'product'
        ? 'Produit'
        : suggestion.type === 'farm'
          ? 'Ferme'
          : 'Service';

    const thumb =
      suggestion.imageUri && typeof suggestion.imageUri === 'string' ? (
        <Image source={{ uri: suggestion.imageUri }} style={styles.suggestionThumb} />
      ) : (
        <View style={styles.suggestionThumbPlaceholder}>
          <Ionicons
            name={
              suggestion.type === 'product'
                ? 'nutrition-outline'
                : suggestion.type === 'farm'
                  ? 'business-outline'
                  : 'construct-outline'
            }
            size={22}
            color="#8A917E"
          />
        </View>
      );

    const currency = String(suggestion.currency || 'CDF').toUpperCase();

    const priceBlock =
      suggestion.type === 'product' && suggestion.price != null ? (
        <View style={styles.suggestionPriceCol}>
          {suggestion.oldPrice != null &&
          !Number.isNaN(Number(suggestion.oldPrice)) &&
          Number(suggestion.oldPrice) > Number(suggestion.price) ? (
            <Text style={styles.suggestionOldPrice}>{formatPrice(suggestion.oldPrice, currency)}</Text>
          ) : null}
          <Text style={styles.suggestionPrice}>{formatPrice(suggestion.price, currency)}</Text>
        </View>
      ) : suggestion.type === 'service' && suggestion.price != null ? (
        <Text style={styles.suggestionPrice}>{formatPrice(suggestion.price, currency)}</Text>
      ) : null;

    return (
      <TouchableOpacity
        key={suggestion.id}
        style={styles.suggestionCard}
        onPress={() => handleSuggestionPress(suggestion)}
        activeOpacity={0.85}
      >
        {thumb}
        <View style={styles.suggestionCardBody}>
          <Text style={styles.suggestionCardTitle} numberOfLines={2}>
            {suggestion.text}
          </Text>
          {suggestion.subtitle ? (
            <Text style={styles.suggestionCardMeta} numberOfLines={1}>
              {suggestion.subtitle}
            </Text>
          ) : null}
          <View style={styles.suggestionCardFooter}>
            <Text style={styles.suggestionTypeBadge}>{typeLabel}</Text>
            {priceBlock}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#B8C4A8" />
      </TouchableOpacity>
    );
  };

  // Gérer le clic sur un élément de l'historique
  const handleHistoryItemPress = (historyItem) => {
    setSearchQuery(historyItem);
    handleSearch(historyItem);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchResults({ products: [], farms: [], services: [] });
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
    if (showSuggestionPanel && searchQuery.trim().length >= 1) {
      return (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsHeaderRow}>
            <Ionicons name="sparkles-outline" size={18} color="#5C6B52" />
            <Text style={styles.suggestionsTitle}>Résultats suggérés</Text>
          </View>
          <Text style={styles.suggestionsSubtitle}>
            Correspondance intelligente (tolère les fautes de frappe)
          </Text>
          {suggestionsSynced && suggestionEntries.length === 0 ? (
            <View style={styles.suggestionsEmpty}>
              <Text style={styles.suggestionsEmptyText}>
                Aucun résultat proche. Validez la recherche ou reformulez.
              </Text>
            </View>
          ) : (
            suggestionEntries.map(renderRichSuggestion)
          )}
          <TouchableOpacity style={styles.searchSubmitHint} onPress={handleSearchSubmit} activeOpacity={0.85}>
            <Ionicons name="search-circle-outline" size={22} color="#5C6B52" />
            <Text style={styles.searchSubmitHintText}>Voir tous les résultats pour « {searchQuery.trim()} »</Text>
          </TouchableOpacity>
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
            Reformulez ou vérifiez l’orthographe — la recherche tolère déjà les petites erreurs.
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
                <FlatList
                  data={searchResults.products.slice(0, 6)}
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
                />
                {searchResults.products.length > 6 && (
                  <TouchableOpacity 
                    style={styles.seeMoreButton}
                    onPress={() => navigation.navigate('AllProducts', { 
                      filter: 'all',
                      searchQuery: searchQuery 
                    })}
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
          <FlatList
            data={searchResults.products}
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
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color="#E0E0E0" />
                <Text style={styles.emptyStateTitle}>Aucun produit trouvé</Text>
                <Text style={styles.emptyStateText}>
                  Essayez avec d'autres mots-clés.
                </Text>
              </View>
            }
          />
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
    padding: 5,
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
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 16,
    letterSpacing: 0.3,
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
    padding: 0,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  productsRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  productCard: {
    marginBottom: 0,
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
    paddingBottom: 24,
    backgroundColor: '#F7F6F3',
  },
  suggestionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  suggestionsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2C2C28',
    letterSpacing: -0.2,
  },
  suggestionsSubtitle: {
    fontSize: 12,
    color: '#86857D',
    marginBottom: 14,
    lineHeight: 17,
  },
  suggestionsEmpty: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E0DA',
    marginBottom: 12,
  },
  suggestionsEmptyText: {
    fontSize: 14,
    color: '#6B6B66',
    textAlign: 'center',
    lineHeight: 20,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E0DA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  suggestionThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#EDECE8',
  },
  suggestionThumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#EDECE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionCardBody: {
    flex: 1,
    minWidth: 0,
  },
  suggestionCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C28',
    marginBottom: 4,
  },
  suggestionCardMeta: {
    fontSize: 12,
    color: '#86857D',
    marginBottom: 8,
  },
  suggestionCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionTypeBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5C6B52',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  suggestionPriceCol: {
    alignItems: 'flex-end',
  },
  suggestionPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3D5A3D',
  },
  suggestionOldPrice: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  searchSubmitHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#EEF2EA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5DDCF',
  },
  searchSubmitHintText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#3D4D38',
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
