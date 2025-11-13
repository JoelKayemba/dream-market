import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Container, Badge, Button, SearchBar, FarmCard , ScreenWrapper } from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectClientFarms,
  selectClientFarmsLoading,
  selectClientFarmsLoadingMore,
  selectClientFarmsPagination,
  fetchFarms
} from '../store/client';

export default function AllFarmsScreen({ navigation, route }) {
  const { filter } = route.params || {};
  const dispatch = useDispatch();
  const farms = useSelector(selectClientFarms);
  const loading = useSelector(selectClientFarmsLoading);
  const loadingMore = useSelector(selectClientFarmsLoadingMore);
  const pagination = useSelector(selectClientFarmsPagination);
  
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData(0, true);
  }, [dispatch]);

  const loadData = async (page = 0, refresh = false) => {
    try {
      await dispatch(fetchFarms({
        page,
        refresh,
        search: searchQuery || null,
        verified: filter === 'verified' ? true : null
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(0, true);
    setRefreshing(false);
  };

  const loadMore = useCallback(() => {
    if (!loadingMore && pagination.hasMore && !refreshing) {
      loadData(pagination.page + 1, false);
    }
  }, [loadingMore, pagination.hasMore, pagination.page, refreshing, searchQuery]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text style={styles.footerLoaderText}>Chargement...</Text>
      </View>
    );
  };

  // Appliquer les filtres locaux (tri, spécialité) sur les fermes chargées
  useEffect(() => {
    if (farms && farms.length > 0) {
      applyFilters();
    }
  }, [farms, sortBy, selectedSpecialty, filter]);

  const applyFilters = () => {
    if (!farms || !Array.isArray(farms)) {
      setFilteredFarms([]);
      return;
    }

    let filtered = [...farms];

    // Appliquer le filtre initial reçu
    switch (filter) {
      case 'popular':
        filtered = filtered.filter(farm => farm.rating >= 4.5);
        break;
      case 'new':
        filtered = filtered.filter(farm => farm.established >= 2020);
        break;
      case 'organic':
        filtered = filtered.filter(farm => farm.specialty === 'organic');
        break;
      case 'all':
      default:
        // Pas de filtre, toutes les fermes
        break;
    }

    // La recherche est maintenant gérée côté serveur via loadData

    // Filtre par spécialité
    if (selectedSpecialty) {
      filtered = filtered.filter(farm => farm.specialty === selectedSpecialty.name);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return (b.established || 0) - (a.established || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredFarms(filtered);
  };

  const getHeaderTitle = () => {
    if (filter) {
      switch (filter) {
        case 'popular':
          return 'Fermes Populaires';
        case 'new':
          return 'Nouvelles Fermes';
        case 'organic':
          return 'Fermes Bio';
        default:
          return 'Toutes nos Fermes';
      }
    }
    return 'Toutes nos Fermes';
  };

  const renderFarmItem = ({ item }) => (
    <FarmCard
      farm={item}
      navigation={navigation}
      variant="default"
      style={styles.farmCard}
    />
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
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          <Text style={styles.farmCount}>
            {filteredFarms.length} ferme{filteredFarms.length > 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={24} color="#283106" />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Rechercher des fermes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onPress={(query) => navigation.navigate('Search', { initialQuery: query })}
        />
      </View>

      {/* Filtres */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Filtres par spécialité - À implémenter avec les catégories Redux */}

          {/* Tri */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Trier par</Text>
            <View style={styles.sortButtons}>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === 'name' && styles.activeSortButton]}
                onPress={() => setSortBy('name')}
              >
                <Text style={[styles.sortButtonText, sortBy === 'name' && styles.activeSortButtonText]}>
                  Nom
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === 'rating' && styles.activeSortButton]}
                onPress={() => setSortBy('rating')}
              >
                <Text style={[styles.sortButtonText, sortBy === 'rating' && styles.activeSortButtonText]}>
                  Note
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === 'newest' && styles.activeSortButton]}
                onPress={() => setSortBy('newest')}
              >
                <Text style={[styles.sortButtonText, sortBy === 'newest' && styles.activeSortButtonText]}>
                  Plus récentes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Liste des fermes */}
      <FlatList
        data={filteredFarms}
        renderItem={renderFarmItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={1}
        contentContainerStyle={styles.listContainer}
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
            <Ionicons name="leaf-outline" size={64} color="#777E5C" />
            <Text style={styles.emptyTitle}>Aucune ferme trouvée</Text>
            <Text style={styles.emptySubtitle}>
              Essayez de modifier vos critères de recherche
            </Text>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
  },
  farmCount: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 2,
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 12,
  },
  specialtiesContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  specialtyButton: {
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 2,
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    minWidth: 80,
   
    justifyContent: 'center',
  },
  selectedSpecialtyButton: {
    backgroundColor: '#F0F8F0',
  },
  specialtyEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  specialtyName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  activeSortButton: {
    backgroundColor: '#4CAF50',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#777E5C',
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  farmCard: {
    marginBottom: 16,
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
